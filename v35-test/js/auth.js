import {db} from './supabase.js';
import {state} from './state.js';
const emailOf=id=>String(id||'').trim().toLowerCase()+'@tfms.local';
export async function signIn(id,password){
  const sb=db();
  const {data,error}=await sb.auth.signInWithPassword({email:emailOf(id),password});
  if(error)throw error;
  const res=await sb.from('profiles').select('*, department:departments(id,name), primary_facility:facilities(id,name)').eq('id',data.user.id).single();
  if(res.error)throw res.error;
  if(res.data.account_status!=='active')throw new Error(res.data.account_status==='pending'?'관리자 승인 대기 중인 계정입니다.':'사용이 중지된 계정입니다.');
  state.user=data.user;state.profile=res.data;return res.data;
}
export async function restoreSession(){
  const sb=db();const {data}=await sb.auth.getSession();if(!data.session)return null;
  const res=await sb.from('profiles').select('*, department:departments(id,name), primary_facility:facilities(id,name)').eq('id',data.session.user.id).single();
  if(res.error||res.data.account_status!=='active'){await sb.auth.signOut();return null}
  state.user=data.session.user;state.profile=res.data;return res.data;
}
export async function signOut(){await db().auth.signOut();state.user=null;state.profile=null}
