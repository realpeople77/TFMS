import {getConfig} from './config.js';
let clientInstance=null;
export function db(){
  if(clientInstance)return clientInstance;
  const c=getConfig();
  if(!window.supabase?.createClient)throw new Error('Supabase 라이브러리를 불러오지 못했습니다.');
  clientInstance=window.supabase.createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{headers:{'x-client-info':'tfms-v35-clean'}}});
  return clientInstance;
}
