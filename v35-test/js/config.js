export const CONFIG_KEY='tfms_supabase_config_v2';
export const DEFAULT_CONFIG={
  url:'https://yxurmfkwivzdchpkmlwv.supabase.co',
  key:'sb_publishable_r54Zo2VrkYzu-A14GZo3ZA_hLp3iUrY'
};
export function getConfig(){
  try{return {...DEFAULT_CONFIG,...JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')}}catch{return DEFAULT_CONFIG}
}
