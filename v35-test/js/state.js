export const state={user:null,profile:null,facilities:[],assets:[],selectedId:null,deleteRequests:[]};
export function isAdmin(){return String(state.profile?.role||'').toLowerCase()==='admin'}
export function isViewer(){return String(state.profile?.role||'').toLowerCase()==='viewer'}
