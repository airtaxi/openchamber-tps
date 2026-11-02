(()=>{var u="openchamber.sdk",E=1;var rt=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [data-oc-scrolling] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [data-oc-scrolling] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [data-oc-scrolling]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [data-oc-scrolling] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function no(e){let r=e.documentElement;if(r.hasAttribute("data-oc-scrollbar-activity"))return;r.setAttribute("data-oc-scrollbar-activity","");let n=new WeakMap;e.addEventListener("scroll",(p)=>{let _=p.target===e?r:p.target;if(!(_ instanceof Element))return;if(!_.hasAttribute("data-oc-scrolling"))_.setAttribute("data-oc-scrolling","");let b=n.get(_);if(b!==void 0)clearTimeout(b);n.set(_,setTimeout(()=>{n.delete(_),_.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var rr=`(${no.toString()})(document);`;var nt=128,st=65536;var ke=128;var Ie=65536;var co=/^[a-z][a-z0-9-]{0,39}$/;var so=(e)=>Object(e)===e&&!Array.isArray(e),it=(e,r)=>Object.keys(e).every((n)=>r.includes(n)),io=(e)=>String(e)===e&&e.length>=1&&e.length<=60,ao=(e)=>String(e)===e&&e.length>=1&&e.length<=80,lo=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let r=new Set;for(let n of e){if(!so(n)||!co.test(n.id)||!io(n.label))return!1;if(n.disabled!==void 0&&n.disabled!==!0&&n.disabled!==!1)return!1;if(r.has(n.id))return!1;if(r.add(n.id),n.kind==="button"){if(!it(n,["kind","id","label","disabled"]))return!1;continue}if(n.kind!=="select"||!it(n,["kind","id","label","value","options","disabled"]))return!1;if(!ao(n.value)||!Array.isArray(n.options)||n.options.length<1||n.options.length>16)return!1;let p=new Set;for(let _ of n.options){if(!so(_)||!it(_,["value","label"])||!ao(_.value)||!io(_.label)||p.has(_.value))return!1;p.add(_.value)}if(!p.has(n.value))return!1}return!0};var po=["{id}","{segment}","{segments+}"];var Hr=new Set(po);var uo=["turn-finished","turn-failed","permission-asked","question-asked"];var $r=new Set(uo);var Ue=20000000,ye=256;var at=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,Eo=(e,r)=>{if(e.path!==r.path||e.readOnly!==r.readOnly)return!1;if(e.encoding==="text"||r.encoding==="text")return e.encoding==="text"&&r.encoding==="text"&&e.content===r.content;if(e.bytes.byteLength!==r.bytes.byteLength)return!1;for(let n=0;n<e.bytes.byteLength;n+=1)if(e.bytes[n]!==r.bytes[n])return!1;return!0};var _o=/^[A-Za-z0-9_-]{1,80}$/;var To=["left","right","top","bottom"];var So=(e,r=0,n={remaining:16000})=>{if(--n.remaining<0||r>=32)return!1;if(e===null)return!0;let p=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let _ of p)if(!So(_,r+1,n))return!1;return!0},ct=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((r)=>/^(0|[1-9]\d*)$/.test(r)&&Number(r)<e.length)&&e.every(ct);if(Object(e)===e){let r=Object.getPrototypeOf(e);return(r===null||r===Object.prototype)&&Object.values(e).every(ct)}return String(e)===e||Number.isFinite(e)},dt=(e)=>{try{if(String(e.id)!==e.id||!_o.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!To.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!So(e.data)||!ct(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var Oo=["file","directory","other","missing"],pt=(e)=>Boolean(e&&"sessionId"in e),ut=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var mo=/^[0-9a-f]{7,64}$/i,Et=(e)=>mo.test(e),Ce=500,ve=32000,ho=16000,Ao=128,Ro=200,xo=2000,go=16000,bo=80,ko=200,Io=16000;var Uo=2000;var _t=20000,Ne=1024,Me=2000000;var Le=64000,we=8000,Tt=4000;var St=960000;var yo=999,Co=1e4,ue=500,vo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],No=["stopped","starting","ready","failed"],sr=new Set(vo),Mo=(e)=>sr.has(e),Lo=(e)=>e&&Mo(e)?e:"HOST_REJECTED",q=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(q);if(Object(e)===e)return Object.values(e).every(q);return!1},wo=(e)=>q(e)&&JSON.stringify(e).length<=Io,fo=(e)=>e?.trim().slice(0,ko)??"",ee=(e)=>{let r=e.id.trim().slice(0,Ao),n=e.title.trim().slice(0,Ro),p=e.url.trim().slice(0,xo),_=e.text?.trim().slice(0,go),b=e.author?.trim().slice(0,bo),F=e.kind==="pull"?"pull":"issue",M={providerId:e.providerId.trim(),id:r,title:n||r,url:p,kind:F};if(_)M.text=_;if(b)M.author=b;if(F==="pull"){let V=fo(e.branches?.head),B=fo(e.branches?.base);if(V&&B)M.branches={head:V,base:B}}if(wo(e.data))M.data=e.data;return M},ft=(e)=>{let r=ee(e);if(e.projectId)r.projectId=e.projectId;if(e.navigation)r.navigation=e.navigation;if(e.worktree)r.worktree=e.worktree;return r},Ot=(e)=>{let r={text:e.text.trim().slice(0,ho)};if(e.send)r.send=!0;return r},mt=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(yo,Math.max(0,Math.round(e)))},ht=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(Co,Math.max(0,Math.ceil(e)))};var te=(e)=>e.length>0&&e.length<=Ne&&!e.includes("\x00")&&!e.includes("\\");var Pe=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>Uo)return!1;return!e.split("/").some((n)=>n==="."||n==="..")},ir=new Set(No),At=(e)=>Boolean(e&&"status"in e&&ir.has(String(e.status))&&!("body"in e)),Ge=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Rt=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),xt=(e)=>Boolean(e&&"written"in e&&e.written===!0),gt=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),ar=new Set(Oo),bt=(e)=>Boolean(e&&"kind"in e&&"size"in e&&ar.has(String(e.kind))&&Number.isFinite(e.size)),kt=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),cr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),dr=(e)=>Object(e)===e?e:null,lt=(e)=>String(e)===e&&e.length>0,lr=(e)=>{if(!lt(e.id))return null;if(e.ok===!0){let r={channel:u,v:E,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)r.payload=e.payload;return r}if(e.ok===!1&&lt(e.error))return{channel:u,v:E,type:"result",id:e.id,ok:!1,error:e.error,code:Lo(lt(e.code)?e.code:void 0)};return null},It=(e)=>{let r=dr(e);if(!r||r.channel!==u||r.v!==E)return null;if(r.type==="result")return lr(r);if(!cr.has(String(r.type))||Object(r.payload)!==r.payload)return null;return r};var Po=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),pr=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class a extends Error{code;constructor(e,r){super(r);this.name="HostRequestError",this.code=e}}var Go=()=>Promise.reject(new a("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),De=()=>Promise.reject(new a("BAD_PATH",`File path must be 1 to ${Ne} characters without NUL or backslash.`)),He=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new a("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},l=(e)=>(e.value+=1,`oc-${e.value}`),Ut=(e={})=>{let r=e.target??("window"in globalThis?window:null);if(!r)throw new a("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let n=e.acceptSource??((t)=>t===r.parent),p=e.requestTimeoutMs??_t,_=new Set,b=new Set,F=new Set,M=new Set,V=new Set,B=new Set,se=new Set,me=new Set,he=new Set,J=new Set,Ze=[],ie=null,ae=null,Ae=new Set,Re=new Set,ce=null,de=null,qe=!1,Y=new Map,Q=new Map,Z=new Map,w=!1,d={value:0},c=null,G=null,le=!1,pe=!1,jt=null,Wt=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},v=(t)=>{r.parent.postMessage(t,"*")},zt=()=>{if(w||r.parent===r||J.size===0||c?.features?.lateGenerateResults!==!0)return;v({channel:u,v:E,type:"generate-late-listen"})},h=(t,o)=>{for(let s of t)try{s(o)}catch(i){console.error(i)}},Jt=(t)=>{if(!(t instanceof MessageEvent))return;if(!n(t.source))return;let o=It(t.data);if(!o)return;if(o.type==="workspace"){let i=Q.get(o.payload.subscriptionId);if(i)h([i],o.payload.snapshot);return}if(o.type==="shells"){let i=Z.get(o.payload.subscriptionId);if(i)h([i],o.payload.snapshot);return}if(o.type==="ready"){if(c=o.payload,G=Wt(o.payload.session),h(_,o.payload),h(b,o.payload.directory),h(F,o.payload.session),G)h(M,G);h(V,o.payload.connection),h(B,o.payload.settings),h(se,o.payload.item),zt();return}if(o.type==="generate-late"){if(J.size===0)Ze.push(o.payload);else h(J,o.payload);return}if(o.type==="directory"){if(c)c={...c,directory:o.payload.directory};h(b,o.payload.directory);return}if(o.type==="session"){if(c)c={...c,session:o.payload.session};if(!o.payload.session)G=null;else if(G?.sessionId!==o.payload.session.id)G=Wt(o.payload.session);h(F,o.payload.session);return}if(o.type==="session-lifecycle"){G=o.payload,h(M,o.payload);return}if(o.type==="connection"){if(c)c={...c,connection:o.payload.connection};h(V,o.payload.connection);return}if(o.type==="settings"){if(c)c={...c,settings:o.payload.settings};h(B,o.payload.settings);return}if(o.type==="item"){if(c)c={...c,item:o.payload.item};h(se,o.payload.item);return}if(o.type==="status-control-event"){h(me,o.payload);return}if(o.type==="popover-closed"){h(he,o.payload);return}if(o.type==="action"){let i=(T)=>{if(!w)v({channel:u,v:E,type:"action-result",id:o.id,payload:T})},S=ae;if(!S){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>S(o.payload)).then(()=>i({ok:!0}),(T)=>{let x=(T instanceof Error?T.message:String(T)).trim();i({ok:!1,error:(x||"Action failed.").slice(0,ue)})});return}if(o.type==="file-open"){let i=o.payload;if(de&&Eo(de,i))return;de=i,h(Ae,o.payload);return}if(o.type==="file-saved"){h(Re,o.payload.version);return}if(o.type==="file-snapshot"){let i=(x)=>{if(!w)v({channel:u,v:E,type:"file-snapshot-result",id:o.id,payload:x})},S=(x)=>i({error:(x.trim()||"Could not read the edited file.").slice(0,ue)}),T=ce;if(!T){S("This extension does not edit files.");return}Promise.resolve().then(()=>T(o.payload.purpose)).then((x)=>{if(at(x)>Ue){S(`The file is over ${Ue} ${"bytes"in x?"bytes":"characters"}.`);return}if(x.version.length>ye){S(`The snapshot version is over ${ye} characters.`);return}i({snapshot:"bytes"in x?{bytes:x.bytes,version:x.version}:{content:x.content,version:x.version}})},(x)=>S(x instanceof Error?x.message:String(x)));return}if(o.type==="resolve"){let i=(T)=>{v({channel:u,v:E,type:"resolve-result",id:o.id,payload:T})},S=ie;if(!S){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>S(o.payload)).then((T)=>i({item:T?ee(T):null}),(T)=>{let x=(T instanceof Error?T.message:String(T)).trim();i({error:(x||"Command failed.").slice(0,ue)})});return}let s=Y.get(o.id);if(!s)return;if(clearTimeout(s.timer),Y.delete(o.id),o.ok){s.resolve(o.payload);return}s.reject(new a(o.code,o.error))};r.addEventListener("message",Jt),v({channel:u,v:E,type:"hello"});let k=(t,o=p)=>{if(w||r.parent===r)return Promise.reject(new a("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((s,i)=>{let S=setTimeout(()=>{Y.delete(t.id),i(new a("HOST_TIMEOUT","Host did not answer in time."))},o);Y.set(t.id,{resolve:s,reject:i,timer:S}),v(t)})},A=(t)=>k(t).then(()=>{return}),R={channel:u,v:E},et=(t)=>{if(!w&&r.parent!==r)v(t)},Yt=()=>et({...R,type:"file-save"}),Qt=(t)=>{if(!Po(t)||!pr(t))return;t.preventDefault(),Yt()},Zt=(t)=>{if(!Po(t)||t.key!=="Escape"||c?.surface!=="popover"||!c.popover)return;t.preventDefault(),oo(c.popover.id,"escape").catch(()=>{return})},xe=()=>{let t=c?.surface==="popover"?c.popover:void 0;if(!t)return;let o=le||pe;if(jt===o)return;jt=o,ro(t.id,o).catch(()=>{return})},ge=()=>{if(c?.surface!=="popover"||le)return;le=!0,xe()},qt=(t)=>{if(c?.surface!=="popover"||t.relatedTarget!==null||!le)return;le=!1,xe()},eo=()=>{if(c?.surface!=="popover"||pe)return;pe=!0,xe()},to=()=>{if(c?.surface!=="popover"||!pe)return;pe=!1,xe()},L=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new a("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},tt=async(t)=>{if(t.kind!=="projects")L(t.projectId);let o=await k({...R,type:"workspace-read",id:l(d),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new a("HOST_REJECTED","Host did not return workspace data.");return o},ot=async(t,o)=>{if(t.kind!=="projects")L(t.projectId);let s=l(d);Q.set(s,o);try{await A({...R,type:"workspace-subscribe",id:l(d),payload:{subscriptionId:s,query:t}})}catch(i){if(Q.delete(s),!w)v({...R,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Q.delete(s)||w)return;v({...R,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},or=async(t,o)=>{if(t.kind==="session")L(t.sessionId);if(t.kind==="project")L(t.projectId);let s=l(d);Z.set(s,o);try{await A({...R,type:"shells-subscribe",id:l(d),payload:{subscriptionId:s,scope:t}})}catch(i){if(Z.delete(s),!w)v({...R,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Z.delete(s)||w)return;v({...R,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},be=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>nt))throw new a("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!q(t.value))throw new a("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>st)throw new a("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&c?.features?.deviceStorage!==!0)throw new a("UNSUPPORTED","This host does not support device storage.");let o=await k({...R,type:"storage",id:l(d),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new a("HOST_REJECTED","Host did not return storage data.");return o},oo=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):A({...R,type:"popover-close",id:l(d),payload:o?{id:t,reason:o}:{id:t}}),ro=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):A({...R,type:"popover-anchor",id:l(d),payload:{id:t,active:o}});return r.addEventListener("keydown",Zt,!0),r.addEventListener("pointerover",ge),r.addEventListener("pointermove",ge),r.addEventListener("pointerout",qt),r.addEventListener("focus",eo),r.addEventListener("blur",to),{onAction:(t)=>(ae=t,()=>{if(ae===t)ae=null}),listProjects:async()=>{let t=await tt({kind:"projects"});if(t.kind!=="projects")throw new a("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await tt({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new a("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await tt({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new a("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>ot({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>ot({kind:"worktrees",projectId:t},(s)=>{if(s.kind==="worktrees")o(s)}),onSessions:(t,o)=>ot({kind:"sessions",projectId:t},(s)=>{if(s.kind==="sessions")o(s)}),onRunningShells:(t,o)=>or(t,o),readShellOutput:async(t,o)=>{L(t,ke);let s=o?.cursor;if(s!==void 0&&(!Number.isInteger(s)||s<0))throw new a("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>Ie))throw new a("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${Ie}.`);let T=await k({...R,type:"shell-output",id:l(d),payload:{shellId:t,cursor:s,tailBytes:i}});if(!T||typeof T.output!=="string"||!Number.isFinite(T.cursor))throw new a("HOST_REJECTED","Host did not return shell output.");return T},stopShell:async(t)=>{if(L(t,ke),(await k({...R,type:"shell-stop",id:l(d),payload:{shellId:t}}))?.stopped!==!0)throw new a("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{L(t),await A({...R,type:"open-session",id:l(d),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let s=He(o),i={op:"get",key:t};if(s)i.scope=s;let S=await be(i);return S.op==="get"&&S.found?S.value:void 0},set:async(t,o,s)=>{let i=He(s),S={op:"set",key:t,value:o};if(i)S.scope=i;await be(S)},delete:async(t,o)=>{let s=He(o),i={op:"delete",key:t};if(s)i.scope=s;await be(i)},keys:async(t)=>{let o=He(t),s={op:"keys"};if(o)s.scope=o;let i=await be(s);if(i.op!=="keys")throw new a("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(_.add(t),c)t(c);return()=>{_.delete(t)}},onDirectory:(t)=>{if(b.add(t),c)t(c.directory);return()=>{b.delete(t)}},onSession:(t)=>{if(F.add(t),c)t(c.session);return()=>{F.delete(t)}},onSessionLifecycle:(t)=>{if(M.add(t),G)t(G);return()=>{M.delete(t)}},onConnection:(t)=>{if(V.add(t),c)t(c.connection);return()=>{V.delete(t)}},onSettings:(t)=>{if(B.add(t),c)t(c.settings);return()=>{B.delete(t)}},onItem:(t)=>{if(se.add(t),c)t(c.item);return()=>{se.delete(t)}},onStatusControl:(t)=>(me.add(t),()=>{me.delete(t)}),onPopoverClosed:(t)=>(he.add(t),()=>{he.delete(t)}),setStatusControls:(t)=>{if(c?.features?.statusControls!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support status controls."));if(!lo(t))return Promise.reject(new a("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return A({...R,type:"status-controls",id:l(d),payload:{controls:t}})},openPopover:(t)=>{if(c?.features?.popovers!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support popovers."));if(!dt(t))return Promise.reject(new a("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return A({...R,type:"popover-open",id:l(d),payload:t})},closePopover:oo,setPopoverAnchorActive:ro,onResolve:(t)=>(ie=t,()=>{if(ie===t)ie=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>Ce)return Promise.reject(new a("HOST_REJECTED",`Toast message must contain 1 to ${Ce} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>ve))return Promise.reject(new a("HOST_REJECTED",`Toast copy text must contain 1 to ${ve} characters.`));return A({channel:u,v:E,type:"toast",id:l(d),payload:{...t,message:o}})},openUrl:(t)=>A({channel:u,v:E,type:"open-url",id:l(d),payload:{url:t}}),openCommit:(t)=>Et(t)?A({channel:u,v:E,type:"open-commit",id:l(d),payload:{sha:t}}):Promise.reject(new a("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:(t)=>A({channel:u,v:E,type:"open-surface",id:l(d),payload:{surfaceId:t}}),writeClipboard:(t)=>A({channel:u,v:E,type:"clipboard-write",id:l(d),payload:{text:t}}),compose:(t)=>A({channel:u,v:E,type:"compose",id:l(d),payload:t}),attach:(t)=>A({channel:u,v:E,type:"attach",id:l(d),payload:ee(t)}),startSession:async(t)=>{if(t.projectId!==void 0)L(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")L(o.directory);else{if(o.name!==void 0)L(o.name,200);if(o.baseBranch!==void 0)L(o.baseBranch,200)}let s=await k({channel:u,v:E,type:"start-session",id:l(d),payload:ft(t)},e.requestTimeoutMs??180000);if(!pt(s))throw new a("HOST_REJECTED","Host did not return a session.");return s},prompt:(t)=>k({channel:u,v:E,type:"prompt",id:l(d),payload:Ot(t)}).then((o)=>{if(!ut(o))throw new a("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>A({channel:u,v:E,type:"session-link",id:l(d),payload:ee(t)}),close:()=>A({channel:u,v:E,type:"close",id:l(d)}),oauthStart:()=>A({channel:u,v:E,type:"oauth-start",id:l(d)}),oauthDisconnect:()=>A({channel:u,v:E,type:"oauth-disconnect",id:l(d)}),request:(t)=>(Pe(t.path)?k({channel:u,v:E,type:"request",id:l(d),payload:t}):Go()).then((o)=>{if(!Ge(o))throw new a("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(Pe(t.path)?k({channel:u,v:E,type:"service-request",id:l(d),payload:t}):Go()).then((o)=>{if(!Ge(o))throw new a("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>k({channel:u,v:E,type:"service-status",id:l(d)}).then((t)=>{if(!At(t))throw new a("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(te(t)?k({channel:u,v:E,type:"file-read",id:l(d),payload:{path:t}}):De()).then((o)=>{if(!Rt(o))throw new a("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!te(t))return De();if(o.length>Me)return Promise.reject(new a("FILE_TOO_LARGE",`Content is over ${Me} characters.`));return k({channel:u,v:E,type:"file-write",id:l(d),payload:{path:t,content:o}}).then((s)=>{if(!xt(s))throw new a("HOST_REJECTED","Host did not confirm the write.");return s})},listDir:(t)=>(te(t)?k({channel:u,v:E,type:"file-list",id:l(d),payload:{path:t}}):De()).then((o)=>{if(!gt(o))throw new a("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(te(t)?k({channel:u,v:E,type:"file-stat",id:l(d),payload:{path:t}}):De()).then((o)=>{if(!bt(o))throw new a("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),s=t.system?.trim();if(o.length===0||o.length>Le)return Promise.reject(new a("HOST_REJECTED",`Prompt must be 1 to ${Le} characters.`));if(s!==void 0&&(s.length===0||s.length>we))return Promise.reject(new a("HOST_REJECTED",`System prompt must be 1 to ${we} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(Tt,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new a("HOST_REJECTED","maxOutputTokens must be a number."));let S={prompt:o};if(s!==void 0)S.system=s;if(i!==void 0)S.maxOutputTokens=i;return k({channel:u,v:E,type:"generate",id:l(d),payload:S},e.requestTimeoutMs??St).then((T)=>{if(!kt(T))throw new a("HOST_REJECTED","Host did not return generated text.");return T})},onLateGenerateResult:(t)=>{J.add(t);for(let o of Ze.splice(0))h([t],o);return zt(),()=>{J.delete(t)}},setBadge:(t)=>A({channel:u,v:E,type:"badge",id:l(d),payload:{count:mt(t)}}),setHeight:(t)=>A({channel:u,v:E,type:"resize",id:l(d),payload:{height:ht(t)}}),onFileOpen:(t)=>{if(Ae.add(t),!qe)qe=!0,r.addEventListener("keydown",Qt,!0);if(de)t(de);return()=>{Ae.delete(t)}},onFileSnapshot:(t)=>(ce=t,()=>{if(ce===t)ce=null}),onFileSaved:(t)=>(Re.add(t),()=>{Re.delete(t)}),reportFileChange:(t)=>et({...R,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Yt,reportFileUnsupported:()=>et({...R,type:"file-unsupported"}),dispose:()=>{for(let t of Q.keys())v({...R,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:t}});Q.clear();for(let t of Z.keys())v({...R,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:t}});if(Z.clear(),w=!0,ie=null,ae=null,ce=null,Ae.clear(),Re.clear(),qe)r.removeEventListener("keydown",Qt,!0);r.removeEventListener("message",Jt),r.removeEventListener("keydown",Zt,!0),r.removeEventListener("pointerover",ge),r.removeEventListener("pointermove",ge),r.removeEventListener("pointerout",qt),r.removeEventListener("focus",eo),r.removeEventListener("blur",to);for(let t of Y.values())clearTimeout(t.timer),t.reject(new a("HOST_UNAVAILABLE","Host client was disposed."));Y.clear(),_.clear(),b.clear(),F.clear(),M.clear(),V.clear(),B.clear(),se.clear(),me.clear(),he.clear(),J.clear(),Ze.length=0}}};var Do=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var tn=new Set(Do);var Ho=["none","agent","user"];var rn=new Set(Ho);var ur=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Er=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Xo=(e,r)=>{r.style.colorScheme=e.mode;for(let[n,p]of ur)r.style.setProperty(n,e.tokens[p]);for(let[n,p,_]of Er){let b=e.tokens[_]??"";r.style.setProperty(n,b),r.style.setProperty(p,b)}r.style.setProperty("font-family",e.tokens.font),r.style.setProperty("font-size","0.875rem"),r.style.setProperty("line-height","1.45"),r.style.setProperty("color",e.tokens.foreground)},yt=(e,r)=>{if(Xo(e.theme,r),r.dataset)r.dataset.ocSurface=e.surface,r.dataset.ocTheme=e.theme.mode};var _r={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},f=(e,r)=>`var(--${e}, var(--oc-${_r[e]}, ${r}))`,H=f("surface-background","transparent"),$e=f("surface-elevated","transparent"),oe=f("surface-elevated-foreground","inherit"),N=f("surface-foreground","inherit"),O=f("surface-muted-foreground","gray"),Tr=f("surface-muted","transparent"),j=f("interactive-border","currentColor"),U=f("interactive-hover","transparent"),W=f("interactive-active","transparent"),Ct=f("interactive-selection","transparent"),vt=f("interactive-selection-foreground","inherit"),D=f("primary","currentColor"),Nt=f("primary-text","inherit"),Mt=f("error-text","inherit"),Sr=f("font-sans","inherit"),Lt=f("font-mono","monospace"),Bo=f("radius","9px"),wt=`calc(${Bo} - 2px)`,$o=`calc(${Bo} - 4px)`,m=(e,r,n="transparent")=>`color-mix(in srgb, ${e} ${r}%, ${n})`,Fo=`background-image: linear-gradient(${U}, ${U});`,Pt=(e,r="0.5px")=>`box-shadow: inset 0 0 0 ${r} ${e}, var(--oc-sdk-field-lift);`,Gt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Vo="box-shadow: var(--oc-sdk-lit);",Dt=`inset 0 0.5px 0 0 ${m(N,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,fr=`
:root {
  --oc-sdk-edge: ${m(N,16)};
  --oc-sdk-field-bg: ${$e};
  --oc-sdk-raised-bg: ${H};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${m(N,14)};
  --oc-sdk-field-bg: ${m(H,50,$e)};
  --oc-sdk-raised-bg: ${$e};
  --oc-sdk-field-lift: ${Dt};
  --oc-sdk-raised-lift: ${Dt};
  --oc-sdk-lit: ${Dt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Xe=(e)=>{let r=f(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${r}; --oc-sdk-tone-text: ${f(`${e}-text`,"inherit")}; }`},Or=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: 2px; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`,Ko=`${fr}
.oc-sdk { color: ${N}; font-family: ${Sr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Fo} }
.oc-sdk-mono { font-family: ${Lt}; }
.oc-sdk-muted { color: ${O}; }
${Xe("success")}${Xe("warning")}${Xe("error")}${Xe("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${D}; --oc-sdk-tone-text: ${Nt}; }

.oc-sdk-btn { border-radius: ${wt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${$o}; }
.oc-sdk-btn[data-variant="default"] { color: ${Nt}; background: ${m(D,10,H)}; border-color: ${m(D,12)}; ${Vo} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${m(D,16,H)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${m(D,22,H)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Tr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${oe}; ${Gt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${W}, ${W}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${U}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${W}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${f("status-error","red")}; color: ${Mt}; background: ${m("var(--oc-sdk-tone)",7,H)}; border-color: ${m("var(--oc-sdk-tone)",12)}; ${Vo} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${m("var(--oc-sdk-tone)",9,H)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${m("var(--oc-sdk-tone)",11,H)}; box-shadow: none; }

.oc-sdk-field-note { color: ${O}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Mt}; }
.oc-sdk-input { border-radius: ${wt}; background: var(--oc-sdk-field-bg); color: ${oe}; ${Pt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${O}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Pt(m(N,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Pt(f("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Lt}; }

.oc-sdk-search-icon { color: ${O}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search-clear { border-radius: ${$o}; color: ${O}; }
.oc-sdk-search-clear:hover { background: ${U}; color: ${N}; }

.oc-sdk-trigger { border-radius: ${wt}; background: var(--oc-sdk-raised-bg); color: ${oe}; ${Gt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${O}; }
.oc-sdk-trigger-chevron { color: ${O}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${oe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${$e}; background-clip: padding-box; color: ${oe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${U}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Ct}; color: ${vt}; }
.oc-sdk-option-check { color: ${N}; }
.oc-sdk-option[data-destructive="true"] { color: ${Mt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${m(f("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${O}; }
.oc-sdk-popup-empty { color: ${O}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${j}; border-radius: 4px; color: ${N}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${m(N,60,j)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${j}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${H}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${D}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Fo} }
.oc-sdk-check-desc { color: ${O}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${m(N,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${O}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${N}; }
.oc-sdk-tab[aria-selected="true"] { color: ${vt}; background: ${Ct}; border-color: ${j}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${oe}; background: var(--oc-sdk-raised-bg); ${Gt} }
.oc-sdk-tab-count { color: ${O}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${m(N,6)}; color: ${O}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${m("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${U}; }
.oc-sdk-row[aria-selected="true"] { background: ${Ct}; color: ${vt}; }
.oc-sdk-row-lead { font-family: ${Lt}; color: ${O}; }
.oc-sdk-row-sub { color: ${O}; }
.oc-sdk-row-meta { color: ${O}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${O}; }

.oc-sdk-empty-body { color: ${O}; }

.oc-sdk-spinner { color: ${O}; }
.oc-sdk-spinner-ring { border-color: ${j}; border-top-color: ${D}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${m("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${O}; }

.oc-sdk-separator { color: ${O}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${m(j,40)}; }

.oc-sdk-progress-label { color: ${O}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${m(N,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${D}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${f("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${f("success-text","inherit")}; }

.oc-sdk-text a { color: ${Nt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${m(j,60)}; }
`,I=`
${rt}
${Or}
${Ko}`;var jo=()=>{try{let e=new URL(window.location.href);if(e.protocol==="http:"||e.protocol==="https:")return e.origin}catch{}return null},P=(e,r,n)=>{let p=document.createElement(e);if(r)p.className=r;if(n!==void 0)p.textContent=n;return p},Wo=(e,r)=>{if(e instanceof a){if(e.code==="NO_SERVICE"||e.code==="NOT_GRANTED"||e.code==="SERVICE_FAILED")return r.serviceHint;if(e.code==="DISABLED")return r.disabled;if(e.code==="HOST_TIMEOUT")return r.reconnecting;return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)},Xt=(e)=>Math.round(e).toLocaleString(),je=(e)=>`${(e/1000).toFixed(1)} s`;var xr=500,gr=0.98,br=1000,Ft={en:{live:"Live",lastTurn:"Last turn",session:"Session",ratio:"Tokens/char",unit:"tok/s",tokens:"tok",measuring:"measuring",noSession:"No session yet. The rate shows once this chat has one.",serviceHint:"The extension needs its local service. Approve it in Settings → Extensions.",disabled:"The extension is paused in Settings → Extensions.",noOrigin:"This surface cannot reach the OpenChamber server (relay or embedded view).",reconnecting:"Reconnecting to the event stream.",liveTip:"Tokens per second over the last 5 seconds, estimated from streamed characters.",sessionTip:"Tokens the model generated in this session, output and reasoning together.",ratioTip:"Model tokens per streamed character, calibrated from finished model calls. The live rate is characters per second times this value.",generating:"Generating",paused:"paused",estimated:"Estimated from streamed characters."},ko:{live:"실시간",lastTurn:"지난 턴",session:"세션",ratio:"문자당 토큰",unit:"tok/s",tokens:"tok",measuring:"측정 중",noSession:"아직 세션이 없습니다. 챗에 세션이 생기면 속도를 표시합니다.",serviceHint:"이 확장은 로컬 서비스가 필요합니다. 설정 → Extensions에서 승인해 주세요.",disabled:"설정 → Extensions에서 확장이 일시중지되었습니다.",noOrigin:"이 화면에서는 OpenChamber 서버에 접근할 수 없습니다(릴레이 또는 임베드 뷰).",reconnecting:"이벤트 스트림에 다시 연결하는 중입니다.",liveTip:"최근 5초 동안의 초당 토큰 수입니다. 스트리밍된 문자 수로 추정합니다.",sessionTip:"이 세션에서 모델이 생성한 토큰 수입니다. 출력과 추론을 합산합니다.",ratioTip:"스트리밍된 문자 하나당 모델 토큰 수입니다. 끝난 모델 호출의 실제 토큰으로 보정하며, 실시간 값은 초당 문자 수에 이 값을 곱해 구합니다.",generating:"생성",paused:"대기",estimated:"스트리밍된 문자 수로 추정한 값입니다."}},Oe=Ut(),ze=document.querySelector("#root");if(!ze)throw Error("Missing #root");var Ye=(e)=>{let r=P("span","tps-what"),n=P("span","tps-value","—"),p=P("div","tps-line");return p.append(r,e,n),{row:p,label:r,value:n}},ne=P("div","tps-note");ne.hidden=!0;var Yo=P("div","tps-meter-fill"),Qo=P("div","tps-meter");Qo.append(Yo);var Te=Ye(Qo),Vt=P("span","tps-detail"),z=Ye(Vt),Se=Ye(P("span")),fe=Ye(P("span")),Zo=[Te.row,z.row,Se.row,fe.row];ze.append(ne,...Zo);var g=Ft.en,Qe=null,K=null,Bt="",Je=null,_e=0,$t=!1,zo=!1,kr=()=>{Te.label.textContent=g.live,z.label.textContent=g.lastTurn,Se.label.textContent=g.session,fe.label.textContent=g.ratio,Te.row.title=g.liveTip,Se.row.title=g.sessionTip,fe.row.title=g.ratioTip},We=(e,r,n=null,p="warning")=>{ne.hidden=e===null,ne.textContent=e??"",ne.title=n??"",ne.dataset.tone=p;for(let _ of Zo)_.hidden=!r},Ir=(e)=>{let r=e.lastTurn;if(!r)return"";let n=[`${g.generating} ${je(r.activeMs)}`];if(r.pausedMs>=br)n.push(`${g.paused} ${je(r.pausedMs)}`);let p=n.join(", ");return r.source==="estimate"?`${p}
${g.estimated}`:p},Kt=(e)=>{let r=e&&Number.isFinite(e.tokensPerSecond)?e.tokensPerSecond:0;_e=Math.max(r,_e*gr);let n=_e>0.05?Math.min(1,r/_e):0;Yo.style.transform=`scaleX(${n.toFixed(4)})`,Te.value.textContent=e?`${r.toFixed(1)} ${g.unit}`:"—",Te.value.dataset.quiet=String(!(e?.busy&&e.active));let p=e?.lastTurn??null;if(e&&p){let b=p.source==="estimate"?"~":"";Vt.textContent=`${b}${Xt(p.tokens)} ${g.tokens} / ${je(p.activeMs)}`,z.value.textContent=`${p.tokensPerSecond.toFixed(1)} ${g.unit}`,z.row.title=Ir(e)}else Vt.textContent=e?.busy?g.measuring:"",z.value.textContent="—",z.row.title="";z.value.dataset.quiet=String(!p);let _=e?.sessionUsage??null;Se.value.textContent=_?`${Xt(_.generated)} ${g.tokens}`:"—",Se.value.dataset.quiet=String(!_),fe.value.textContent=e?e.charsPerToken.toFixed(3):"—",fe.value.dataset.quiet=String(!e)},Ur=()=>`${Qe??""}|${K??""}`,yr=async()=>{let e=Ur();if(e===Bt)return;let r=await Oe.serviceRequest({method:"POST",path:"/watch",body:JSON.stringify({origin:Qe,sessionId:K})});if(r.status>=400)throw Error(`HTTP ${r.status}`);Bt=e},qo=async()=>{if($t)return;if(!Qe){We(g.noOrigin,!1);return}if(!K){We(g.noSession,!1,null,"muted");return}$t=!0;let e=K;try{await yr();let r=await Oe.serviceRequest({method:"GET",path:"/rate"});if(r.status>=400)throw Error(`HTTP ${r.status}`);let n=JSON.parse(r.body);if(e!==K)return;if(n.sessionId===null&&n.connection==="idle")Bt="";Je=n,Kt(n),We(n.connection==="error"?g.reconnecting:null,!0,n.error)}catch(r){We(Wo(r,g),Je!==null)}finally{$t=!1}},er=(e)=>{if(e===K)return;K=e,Je=null,_e=0,Kt(null),qo()},tr=async()=>{if(!document.hidden)await qo();window.setTimeout(()=>{tr()},xr)},Jo=-1;new ResizeObserver(()=>{let e=Math.ceil(ze.getBoundingClientRect().height);if(e===Jo)return;Jo=e,Oe.setHeight(e).catch(()=>{return})}).observe(ze);Oe.onReady((e)=>{if(g=e.locale.toLowerCase().startsWith("ko")?Ft.ko:Ft.en,yt(e,document.documentElement),Qe=jo(),kr(),Kt(Je),!zo){zo=!0,K=e.session?.id??null,tr();return}er(e.session?.id??null)});Oe.onSession((e)=>{er(e?.id??null)});})();
