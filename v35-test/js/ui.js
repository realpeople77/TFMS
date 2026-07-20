import {state,isAdmin,isViewer} from './state.js';
import {selectedAsset} from './assets.js';
export const $=id=>document.getElementById(id);
export function toast(msg){const e=$('toast');e.textContent=msg;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',3200)}
export function showApp(profile){$('loginView').classList.add('hidden');$('appView').classList.remove('hidden');$('userLabel').textContent=`${profile.full_name||profile.username} / ${profile.department?.name||'-'} / ${profile.role}`;$('requestPanel').classList.toggle('hidden',!isAdmin());$('deleteBtn').textContent=isAdmin()?'즉시삭제':'삭제요청';$('deleteBtn').classList.toggle('hidden',isViewer())}
export function showLogin(){ $('appView').classList.add('hidden');$('loginView').classList.remove('hidden') }
export function renderFacilities(){const s=$('facilityId');s.innerHTML=state.facilities.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join('')}
export function renderAssets(query=''){
  const q=query.trim().toLowerCase();const rows=state.assets.filter(a=>!q||[a.name,a.facility?.name,a.qr_code].join(' ').toLowerCase().includes(q));
  $('assetList').innerHTML=rows.length?rows.map(a=>`<div class="asset-item ${a.id===state.selectedId?'active':''}" data-id="${a.id}"><strong>${esc(a.name)}</strong><small>${esc(a.facility?.name||'-')} · ${esc(a.inspection_cycle||'미설정')}<br>${esc(a.qr_code||a.asset_code||'-')}</small></div>`).join(''):'<div class="muted">설비가 없습니다.</div>';
}
const fields=[['제조사','manufacturer'],['모델명','model_name'],['제조번호','serial_number'],['규모/용량','capacity'],['제조년도','manufacture_year'],['설치일','installed_on'],['내용연수','useful_life_years'],['설치위치','location_detail'],['작동형태','operation_type'],['점검주기','inspection_cycle'],['관리상태','condition_status'],['중요도','importance'],['최근점검','last_inspected_on'],['예상교체비','replacement_cost'],['QR관리번호','qr_code'],['비고','remarks']];
export function renderDetail(){const a=selectedAsset();if(!a){$('detailName').textContent='설비를 선택하세요';$('detailMeta').textContent='-';$('detailRisk').textContent='-';$('detailGrid').innerHTML='';return}
  $('detailName').textContent=a.name;$('detailMeta').textContent=`${a.facility?.name||'-'} · ${a.category||'-'}`;$('detailRisk').textContent=a.risk_level||'-';$('detailRisk').className='badge '+(a.risk_level==='위험'?'bad':a.risk_level==='주의'?'warn':'good');
  $('detailGrid').innerHTML=fields.map(([l,k])=>`<div class="detail-item"><span>${l}</span><strong>${format(k,a[k])}</strong></div>`).join('');
}
export function fillForm(a=null){const f=$('assetForm');f.reset();$('assetId').value=a?.id||'';$('editMode').textContent=a?'수정':'신규';if(!a)return;
  const map={facilityId:'facility_id',name:'name',category:'category',manufacturer:'manufacturer',modelName:'model_name',serialNumber:'serial_number',capacity:'capacity',manufactureYear:'manufacture_year',installedOn:'installed_on',usefulLifeYears:'useful_life_years',locationDetail:'location_detail',operationType:'operation_type',inspectionCycle:'inspection_cycle',conditionStatus:'condition_status',importance:'importance',riskLevel:'risk_level',lastInspectedOn:'last_inspected_on',replacementCost:'replacement_cost',qrCode:'qr_code',remarks:'remarks'};
  Object.entries(map).forEach(([id,k])=>{const e=$(id);if(e)e.value=a[k]??''});
}
export function renderRequests(){const box=$('requestList');if(!isAdmin())return;box.innerHTML=state.deleteRequests.length?state.deleteRequests.map(r=>`<div class="request-row"><div><strong>${esc(r.asset?.name||'삭제된 설비')}</strong><div class="muted">${esc(r.asset?.facility?.name||'-')} · ${esc(r.requester?.full_name||r.requester?.username||'-')}<br>사유: ${esc(r.reason||'-')}</div></div><div class="request-actions"><button data-action="reject" data-id="${r.id}">반려</button><button class="danger" data-action="approve" data-id="${r.id}">승인삭제</button></div></div>`).join(''):'<div class="muted">승인 대기 중인 삭제요청이 없습니다.</div>'}
function format(k,v){if(v===null||v===undefined||v==='')return '-';if(k==='replacement_cost')return Number(v).toLocaleString('ko-KR')+'원';if(k==='useful_life_years')return v+'년';return esc(String(v))}
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
