import {db} from './supabase.js';
import {state,isAdmin,isViewer} from './state.js';
const n=v=>{const x=String(v??'').replace(/[^0-9.-]/g,'');return x===''?null:Number(x)};
const blank=v=>String(v??'').trim()||null;
export async function loadFacilities(){
  let q=db().from('facilities').select('id,name,department:departments(id,name)').eq('is_active',true).order('sort_order');
  const {data,error}=await q;if(error)throw error;
  const dept=state.profile?.department?.name;
  state.facilities=(isAdmin()||isViewer()||!dept)?data:data.filter(f=>f.department?.name===dept);
  return state.facilities;
}
export async function loadAssets(preferredId=null){
  const ids=state.facilities.map(f=>f.id);
  if(!ids.length){state.assets=[];state.selectedId=null;return []}
  const {data,error}=await db().from('assets').select('*, facility:facilities(id,name)').eq('is_active',true).in('facility_id',ids).order('created_at',{ascending:true});
  if(error)throw error;
  state.assets=data||[];
  if(preferredId&&state.assets.some(a=>a.id===preferredId))state.selectedId=preferredId;
  else if(!state.assets.some(a=>a.id===state.selectedId))state.selectedId=state.assets[0]?.id||null;
  return state.assets;
}
export function selectedAsset(){return state.assets.find(a=>a.id===state.selectedId)||null}
export async function saveAsset(form){
  const id=form.assetId.value||null;
  const payload={
    facility_id:form.facilityId.value,name:form.name.value.trim(),category:blank(form.category.value),manufacturer:blank(form.manufacturer.value),model_name:blank(form.modelName.value),serial_number:blank(form.serialNumber.value),capacity:blank(form.capacity.value),manufacture_year:n(form.manufactureYear.value),installed_on:blank(form.installedOn.value),useful_life_years:n(form.usefulLifeYears.value),location_detail:blank(form.locationDetail.value),operation_type:blank(form.operationType.value),inspection_cycle:blank(form.inspectionCycle.value),condition_status:form.conditionStatus.value||'정상',importance:form.importance.value||'중',risk_level:form.riskLevel.value||'양호',last_inspected_on:blank(form.lastInspectedOn.value),replacement_cost:n(form.replacementCost.value),qr_code:blank(form.qrCode.value),remarks:blank(form.remarks.value),is_active:true,updated_at:new Date().toISOString()
  };
  if(!payload.name)throw new Error('설비명을 입력하세요.');
  let res;
  if(id)res=await db().from('assets').update(payload).eq('id',id).select('id').single();
  else{payload.asset_code='AST-'+new Date().toISOString().replace(/\D/g,'').slice(0,14);payload.created_by=state.user.id;res=await db().from('assets').insert(payload).select('id').single()}
  if(res.error)throw res.error;await loadAssets(res.data.id);return res.data.id;
}
export async function deleteOrRequest(reason){
  const a=selectedAsset();if(!a)throw new Error('삭제할 설비를 선택하세요.');
  if(isAdmin()){
    const res=await db().from('assets').delete().eq('id',a.id);if(res.error)throw res.error;
    await loadAssets();return {mode:'deleted'};
  }
  const res=await db().from('asset_delete_requests').insert({asset_id:a.id,requested_by:state.user.id,reason,status:'pending'}).select('id').single();
  if(res.error)throw new Error('삭제요청 테이블 설정이 필요합니다: '+res.error.message);
  return {mode:'requested'};
}
export async function loadDeleteRequests(){
  if(!isAdmin()){state.deleteRequests=[];return []}
  const {data,error}=await db().from('asset_delete_requests').select('*, asset:assets(id,name,facility:facilities(name)), requester:profiles!asset_delete_requests_requested_by_fkey(full_name,username)').eq('status','pending').order('created_at',{ascending:false});
  if(error){state.deleteRequests=[];return []}
  state.deleteRequests=data||[];return state.deleteRequests;
}
export async function decideDeleteRequest(id,approve){
  const req=state.deleteRequests.find(x=>x.id===id);if(!req)throw new Error('삭제요청을 찾지 못했습니다.');
  if(approve){const d=await db().from('assets').delete().eq('id',req.asset_id);if(d.error)throw d.error}
  const u=await db().from('asset_delete_requests').update({status:approve?'approved':'rejected',decided_by:state.user.id,decided_at:new Date().toISOString()}).eq('id',id);if(u.error)throw u.error;
  await Promise.all([loadAssets(),loadDeleteRequests()]);
}
