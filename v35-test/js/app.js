import {signIn,signOut,restoreSession} from './auth.js';
import {state,isAdmin} from './state.js';
import {loadFacilities,loadAssets,selectedAsset,saveAsset,deleteOrRequest,loadDeleteRequests,decideDeleteRequest} from './assets.js';
import {$,toast,showApp,showLogin,renderFacilities,renderAssets,renderDetail,fillForm,renderRequests} from './ui.js';
async function refresh(preferred=null){await loadFacilities();renderFacilities();await loadAssets(preferred);if(isAdmin())await loadDeleteRequests();renderAll()}
function renderAll(){renderAssets($('searchInput').value);renderDetail();fillForm(selectedAsset());renderRequests()}
async function boot(){try{const p=await restoreSession();if(p){showApp(p);await refresh()}else showLogin()}catch(e){console.error(e);showLogin();toast(e.message)}}
$('loginBtn').addEventListener('click',async()=>{const err=$('loginError');err.classList.add('hidden');try{const p=await signIn($('loginId').value,$('loginPassword').value);showApp(p);await refresh();toast('로그인되었습니다.')}catch(e){err.textContent=e.message;err.classList.remove('hidden')}});
$('loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginBtn').click()});
$('logoutBtn').addEventListener('click',async()=>{await signOut();showLogin()});
$('refreshBtn').addEventListener('click',async()=>{try{await refresh(state.selectedId);toast('DB에서 다시 불러왔습니다.')}catch(e){toast(e.message)}});
$('newBtn').addEventListener('click',()=>{state.selectedId=null;renderAssets($('searchInput').value);renderDetail();fillForm(null)});
$('cancelBtn').addEventListener('click',()=>fillForm(selectedAsset()));
$('searchInput').addEventListener('input',()=>renderAssets($('searchInput').value));
$('assetList').addEventListener('click',e=>{const item=e.target.closest('.asset-item');if(!item)return;state.selectedId=item.dataset.id;renderAll()});
$('assetForm').addEventListener('submit',async e=>{e.preventDefault();try{const id=await saveAsset(e.currentTarget);renderAll();toast('설비정보를 DB에 저장하고 재조회했습니다.')}catch(err){console.error(err);toast(err.message)}});
$('deleteBtn').addEventListener('click',async()=>{const a=selectedAsset();if(!a){toast('삭제할 설비를 선택하세요.');return}const reason=prompt(isAdmin()?'즉시삭제 사유를 입력하세요.':'삭제요청 사유를 입력하세요.');if(!reason)return;if(isAdmin()&&!confirm(`「${a.name}」 설비를 DB에서 즉시 삭제하시겠습니까?`))return;try{const r=await deleteOrRequest(reason);renderAll();toast(r.mode==='deleted'?'설비를 DB에서 삭제했습니다.':'삭제요청을 등록했습니다.')}catch(e){console.error(e);toast(e.message)}});
$('requestList').addEventListener('click',async e=>{const b=e.target.closest('button[data-action]');if(!b)return;const approve=b.dataset.action==='approve';if(approve&&!confirm('해당 설비를 실제 DB에서 삭제하시겠습니까?'))return;try{await decideDeleteRequest(b.dataset.id,approve);renderAll();toast(approve?'삭제요청을 승인했습니다.':'삭제요청을 반려했습니다.')}catch(err){toast(err.message)}});
boot();
