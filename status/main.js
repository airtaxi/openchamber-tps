(()=>{var u="openchamber.sdk",E=1;var tt=`
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
`;function no(e){let n=e.documentElement;if(n.hasAttribute("data-oc-scrollbar-activity"))return;n.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",(p)=>{let _=p.target===e?n:p.target;if(!(_ instanceof Element))return;if(!_.hasAttribute("data-oc-scrolling"))_.setAttribute("data-oc-scrolling","");let b=r.get(_);if(b!==void 0)clearTimeout(b);r.set(_,setTimeout(()=>{r.delete(_),_.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var on=`(${no.toString()})(document);`;var ot=128,nt=65536;var be=128;var ke=65536;var ao=/^[a-z][a-z0-9-]{0,39}$/;var ro=(e)=>Object(e)===e&&!Array.isArray(e),rt=(e,n)=>Object.keys(e).every((r)=>n.includes(r)),so=(e)=>String(e)===e&&e.length>=1&&e.length<=60,io=(e)=>String(e)===e&&e.length>=1&&e.length<=80,co=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let n=new Set;for(let r of e){if(!ro(r)||!ao.test(r.id)||!so(r.label))return!1;if(r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1)return!1;if(n.has(r.id))return!1;if(n.add(r.id),r.kind==="button"){if(!rt(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!rt(r,["kind","id","label","value","options","disabled"]))return!1;if(!io(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let p=new Set;for(let _ of r.options){if(!ro(_)||!rt(_,["value","label"])||!io(_.value)||!so(_.label)||p.has(_.value))return!1;p.add(_.value)}if(!p.has(r.value))return!1}return!0};var lo=["{id}","{segment}","{segments+}"];var Hn=new Set(lo);var po=["turn-finished","turn-failed","permission-asked","question-asked"];var $n=new Set(po);var Ie=20000000,Ue=256;var st=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,uo=(e,n)=>{if(e.path!==n.path||e.readOnly!==n.readOnly)return!1;if(e.encoding==="text"||n.encoding==="text")return e.encoding==="text"&&n.encoding==="text"&&e.content===n.content;if(e.bytes.byteLength!==n.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==n.bytes[r])return!1;return!0};var Eo=/^[A-Za-z0-9_-]{1,80}$/;var _o=["left","right","top","bottom"];var To=(e,n=0,r={remaining:16000})=>{if(--r.remaining<0||n>=32)return!1;if(e===null)return!0;let p=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let _ of p)if(!To(_,n+1,r))return!1;return!0},it=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((n)=>/^(0|[1-9]\d*)$/.test(n)&&Number(n)<e.length)&&e.every(it);if(Object(e)===e){let n=Object.getPrototypeOf(e);return(n===null||n===Object.prototype)&&Object.values(e).every(it)}return String(e)===e||Number.isFinite(e)},at=(e)=>{try{if(String(e.id)!==e.id||!Eo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!_o.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!To(e.data)||!it(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var fo=["file","directory","other","missing"],dt=(e)=>Boolean(e&&"sessionId"in e),lt=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var Oo=/^[0-9a-f]{7,64}$/i,pt=(e)=>Oo.test(e),ye=500,Ce=32000,mo=16000,ho=128,Ao=200,Ro=2000,xo=16000,go=80,bo=200,ko=16000;var Io=2000;var ut=20000,ve=1024,Ne=2000000;var Me=64000,Le=8000,Et=4000;var _t=960000;var Uo=999,yo=1e4,ue=500,Co=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],vo=["stopped","starting","ready","failed"],rn=new Set(Co),No=(e)=>rn.has(e),Mo=(e)=>e&&No(e)?e:"HOST_REJECTED",q=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(q);if(Object(e)===e)return Object.values(e).every(q);return!1},Lo=(e)=>q(e)&&JSON.stringify(e).length<=ko,So=(e)=>e?.trim().slice(0,bo)??"",ee=(e)=>{let n=e.id.trim().slice(0,ho),r=e.title.trim().slice(0,Ao),p=e.url.trim().slice(0,Ro),_=e.text?.trim().slice(0,xo),b=e.author?.trim().slice(0,go),F=e.kind==="pull"?"pull":"issue",M={providerId:e.providerId.trim(),id:n,title:r||n,url:p,kind:F};if(_)M.text=_;if(b)M.author=b;if(F==="pull"){let V=So(e.branches?.head),B=So(e.branches?.base);if(V&&B)M.branches={head:V,base:B}}if(Lo(e.data))M.data=e.data;return M},Tt=(e)=>{let n=ee(e);if(e.projectId)n.projectId=e.projectId;if(e.navigation)n.navigation=e.navigation;if(e.worktree)n.worktree=e.worktree;return n},St=(e)=>{let n={text:e.text.trim().slice(0,mo)};if(e.send)n.send=!0;return n},ft=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(Uo,Math.max(0,Math.round(e)))},Ot=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(yo,Math.max(0,Math.ceil(e)))};var te=(e)=>e.length>0&&e.length<=ve&&!e.includes("\x00")&&!e.includes("\\");var we=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>Io)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},sn=new Set(vo),mt=(e)=>Boolean(e&&"status"in e&&sn.has(String(e.status))&&!("body"in e)),Pe=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),ht=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),At=(e)=>Boolean(e&&"written"in e&&e.written===!0),Rt=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),an=new Set(fo),xt=(e)=>Boolean(e&&"kind"in e&&"size"in e&&an.has(String(e.kind))&&Number.isFinite(e.size)),gt=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),cn=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),dn=(e)=>Object(e)===e?e:null,ct=(e)=>String(e)===e&&e.length>0,ln=(e)=>{if(!ct(e.id))return null;if(e.ok===!0){let n={channel:u,v:E,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)n.payload=e.payload;return n}if(e.ok===!1&&ct(e.error))return{channel:u,v:E,type:"result",id:e.id,ok:!1,error:e.error,code:Mo(ct(e.code)?e.code:void 0)};return null},bt=(e)=>{let n=dn(e);if(!n||n.channel!==u||n.v!==E)return null;if(n.type==="result")return ln(n);if(!cn.has(String(n.type))||Object(n.payload)!==n.payload)return null;return n};var wo=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),pn=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class a extends Error{code;constructor(e,n){super(n);this.name="HostRequestError",this.code=e}}var Po=()=>Promise.reject(new a("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Ge=()=>Promise.reject(new a("BAD_PATH",`File path must be 1 to ${ve} characters without NUL or backslash.`)),De=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new a("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},l=(e)=>(e.value+=1,`oc-${e.value}`),kt=(e={})=>{let n=e.target??("window"in globalThis?window:null);if(!n)throw new a("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((t)=>t===n.parent),p=e.requestTimeoutMs??ut,_=new Set,b=new Set,F=new Set,M=new Set,V=new Set,B=new Set,se=new Set,Oe=new Set,me=new Set,J=new Set,Ye=[],ie=null,ae=null,he=new Set,Ae=new Set,ce=null,de=null,Qe=!1,Y=new Map,Q=new Map,Z=new Map,w=!1,d={value:0},c=null,P=null,le=!1,pe=!1,Kt=null,jt=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},v=(t)=>{n.parent.postMessage(t,"*")},Wt=()=>{if(w||n.parent===n||J.size===0||c?.features?.lateGenerateResults!==!0)return;v({channel:u,v:E,type:"generate-late-listen"})},h=(t,o)=>{for(let s of t)try{s(o)}catch(i){console.error(i)}},zt=(t)=>{if(!(t instanceof MessageEvent))return;if(!r(t.source))return;let o=bt(t.data);if(!o)return;if(o.type==="workspace"){let i=Q.get(o.payload.subscriptionId);if(i)h([i],o.payload.snapshot);return}if(o.type==="shells"){let i=Z.get(o.payload.subscriptionId);if(i)h([i],o.payload.snapshot);return}if(o.type==="ready"){if(c=o.payload,P=jt(o.payload.session),h(_,o.payload),h(b,o.payload.directory),h(F,o.payload.session),P)h(M,P);h(V,o.payload.connection),h(B,o.payload.settings),h(se,o.payload.item),Wt();return}if(o.type==="generate-late"){if(J.size===0)Ye.push(o.payload);else h(J,o.payload);return}if(o.type==="directory"){if(c)c={...c,directory:o.payload.directory};h(b,o.payload.directory);return}if(o.type==="session"){if(c)c={...c,session:o.payload.session};if(!o.payload.session)P=null;else if(P?.sessionId!==o.payload.session.id)P=jt(o.payload.session);h(F,o.payload.session);return}if(o.type==="session-lifecycle"){P=o.payload,h(M,o.payload);return}if(o.type==="connection"){if(c)c={...c,connection:o.payload.connection};h(V,o.payload.connection);return}if(o.type==="settings"){if(c)c={...c,settings:o.payload.settings};h(B,o.payload.settings);return}if(o.type==="item"){if(c)c={...c,item:o.payload.item};h(se,o.payload.item);return}if(o.type==="status-control-event"){h(Oe,o.payload);return}if(o.type==="popover-closed"){h(me,o.payload);return}if(o.type==="action"){let i=(T)=>{if(!w)v({channel:u,v:E,type:"action-result",id:o.id,payload:T})},S=ae;if(!S){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>S(o.payload)).then(()=>i({ok:!0}),(T)=>{let x=(T instanceof Error?T.message:String(T)).trim();i({ok:!1,error:(x||"Action failed.").slice(0,ue)})});return}if(o.type==="file-open"){let i=o.payload;if(de&&uo(de,i))return;de=i,h(he,o.payload);return}if(o.type==="file-saved"){h(Ae,o.payload.version);return}if(o.type==="file-snapshot"){let i=(x)=>{if(!w)v({channel:u,v:E,type:"file-snapshot-result",id:o.id,payload:x})},S=(x)=>i({error:(x.trim()||"Could not read the edited file.").slice(0,ue)}),T=ce;if(!T){S("This extension does not edit files.");return}Promise.resolve().then(()=>T(o.payload.purpose)).then((x)=>{if(st(x)>Ie){S(`The file is over ${Ie} ${"bytes"in x?"bytes":"characters"}.`);return}if(x.version.length>Ue){S(`The snapshot version is over ${Ue} characters.`);return}i({snapshot:"bytes"in x?{bytes:x.bytes,version:x.version}:{content:x.content,version:x.version}})},(x)=>S(x instanceof Error?x.message:String(x)));return}if(o.type==="resolve"){let i=(T)=>{v({channel:u,v:E,type:"resolve-result",id:o.id,payload:T})},S=ie;if(!S){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>S(o.payload)).then((T)=>i({item:T?ee(T):null}),(T)=>{let x=(T instanceof Error?T.message:String(T)).trim();i({error:(x||"Command failed.").slice(0,ue)})});return}let s=Y.get(o.id);if(!s)return;if(clearTimeout(s.timer),Y.delete(o.id),o.ok){s.resolve(o.payload);return}s.reject(new a(o.code,o.error))};n.addEventListener("message",zt),v({channel:u,v:E,type:"hello"});let k=(t,o=p)=>{if(w||n.parent===n)return Promise.reject(new a("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((s,i)=>{let S=setTimeout(()=>{Y.delete(t.id),i(new a("HOST_TIMEOUT","Host did not answer in time."))},o);Y.set(t.id,{resolve:s,reject:i,timer:S}),v(t)})},A=(t)=>k(t).then(()=>{return}),R={channel:u,v:E},Ze=(t)=>{if(!w&&n.parent!==n)v(t)},Jt=()=>Ze({...R,type:"file-save"}),Yt=(t)=>{if(!wo(t)||!pn(t))return;t.preventDefault(),Jt()},Qt=(t)=>{if(!wo(t)||t.key!=="Escape"||c?.surface!=="popover"||!c.popover)return;t.preventDefault(),to(c.popover.id,"escape").catch(()=>{return})},Re=()=>{let t=c?.surface==="popover"?c.popover:void 0;if(!t)return;let o=le||pe;if(Kt===o)return;Kt=o,oo(t.id,o).catch(()=>{return})},xe=()=>{if(c?.surface!=="popover"||le)return;le=!0,Re()},Zt=(t)=>{if(c?.surface!=="popover"||t.relatedTarget!==null||!le)return;le=!1,Re()},qt=()=>{if(c?.surface!=="popover"||pe)return;pe=!0,Re()},eo=()=>{if(c?.surface!=="popover"||!pe)return;pe=!1,Re()},L=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new a("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},qe=async(t)=>{if(t.kind!=="projects")L(t.projectId);let o=await k({...R,type:"workspace-read",id:l(d),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new a("HOST_REJECTED","Host did not return workspace data.");return o},et=async(t,o)=>{if(t.kind!=="projects")L(t.projectId);let s=l(d);Q.set(s,o);try{await A({...R,type:"workspace-subscribe",id:l(d),payload:{subscriptionId:s,query:t}})}catch(i){if(Q.delete(s),!w)v({...R,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Q.delete(s)||w)return;v({...R,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},tn=async(t,o)=>{if(t.kind==="session")L(t.sessionId);if(t.kind==="project")L(t.projectId);let s=l(d);Z.set(s,o);try{await A({...R,type:"shells-subscribe",id:l(d),payload:{subscriptionId:s,scope:t}})}catch(i){if(Z.delete(s),!w)v({...R,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Z.delete(s)||w)return;v({...R,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},ge=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>ot))throw new a("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!q(t.value))throw new a("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>nt)throw new a("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&c?.features?.deviceStorage!==!0)throw new a("UNSUPPORTED","This host does not support device storage.");let o=await k({...R,type:"storage",id:l(d),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new a("HOST_REJECTED","Host did not return storage data.");return o},to=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):A({...R,type:"popover-close",id:l(d),payload:o?{id:t,reason:o}:{id:t}}),oo=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):A({...R,type:"popover-anchor",id:l(d),payload:{id:t,active:o}});return n.addEventListener("keydown",Qt,!0),n.addEventListener("pointerover",xe),n.addEventListener("pointermove",xe),n.addEventListener("pointerout",Zt),n.addEventListener("focus",qt),n.addEventListener("blur",eo),{onAction:(t)=>(ae=t,()=>{if(ae===t)ae=null}),listProjects:async()=>{let t=await qe({kind:"projects"});if(t.kind!=="projects")throw new a("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await qe({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new a("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await qe({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new a("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>et({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>et({kind:"worktrees",projectId:t},(s)=>{if(s.kind==="worktrees")o(s)}),onSessions:(t,o)=>et({kind:"sessions",projectId:t},(s)=>{if(s.kind==="sessions")o(s)}),onRunningShells:(t,o)=>tn(t,o),readShellOutput:async(t,o)=>{L(t,be);let s=o?.cursor;if(s!==void 0&&(!Number.isInteger(s)||s<0))throw new a("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>ke))throw new a("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${ke}.`);let T=await k({...R,type:"shell-output",id:l(d),payload:{shellId:t,cursor:s,tailBytes:i}});if(!T||typeof T.output!=="string"||!Number.isFinite(T.cursor))throw new a("HOST_REJECTED","Host did not return shell output.");return T},stopShell:async(t)=>{if(L(t,be),(await k({...R,type:"shell-stop",id:l(d),payload:{shellId:t}}))?.stopped!==!0)throw new a("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{L(t),await A({...R,type:"open-session",id:l(d),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let s=De(o),i={op:"get",key:t};if(s)i.scope=s;let S=await ge(i);return S.op==="get"&&S.found?S.value:void 0},set:async(t,o,s)=>{let i=De(s),S={op:"set",key:t,value:o};if(i)S.scope=i;await ge(S)},delete:async(t,o)=>{let s=De(o),i={op:"delete",key:t};if(s)i.scope=s;await ge(i)},keys:async(t)=>{let o=De(t),s={op:"keys"};if(o)s.scope=o;let i=await ge(s);if(i.op!=="keys")throw new a("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(_.add(t),c)t(c);return()=>{_.delete(t)}},onDirectory:(t)=>{if(b.add(t),c)t(c.directory);return()=>{b.delete(t)}},onSession:(t)=>{if(F.add(t),c)t(c.session);return()=>{F.delete(t)}},onSessionLifecycle:(t)=>{if(M.add(t),P)t(P);return()=>{M.delete(t)}},onConnection:(t)=>{if(V.add(t),c)t(c.connection);return()=>{V.delete(t)}},onSettings:(t)=>{if(B.add(t),c)t(c.settings);return()=>{B.delete(t)}},onItem:(t)=>{if(se.add(t),c)t(c.item);return()=>{se.delete(t)}},onStatusControl:(t)=>(Oe.add(t),()=>{Oe.delete(t)}),onPopoverClosed:(t)=>(me.add(t),()=>{me.delete(t)}),setStatusControls:(t)=>{if(c?.features?.statusControls!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support status controls."));if(!co(t))return Promise.reject(new a("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return A({...R,type:"status-controls",id:l(d),payload:{controls:t}})},openPopover:(t)=>{if(c?.features?.popovers!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support popovers."));if(!at(t))return Promise.reject(new a("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return A({...R,type:"popover-open",id:l(d),payload:t})},closePopover:to,setPopoverAnchorActive:oo,onResolve:(t)=>(ie=t,()=>{if(ie===t)ie=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>ye)return Promise.reject(new a("HOST_REJECTED",`Toast message must contain 1 to ${ye} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Ce))return Promise.reject(new a("HOST_REJECTED",`Toast copy text must contain 1 to ${Ce} characters.`));return A({channel:u,v:E,type:"toast",id:l(d),payload:{...t,message:o}})},openUrl:(t)=>A({channel:u,v:E,type:"open-url",id:l(d),payload:{url:t}}),openCommit:(t)=>pt(t)?A({channel:u,v:E,type:"open-commit",id:l(d),payload:{sha:t}}):Promise.reject(new a("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:(t)=>A({channel:u,v:E,type:"open-surface",id:l(d),payload:{surfaceId:t}}),writeClipboard:(t)=>A({channel:u,v:E,type:"clipboard-write",id:l(d),payload:{text:t}}),compose:(t)=>A({channel:u,v:E,type:"compose",id:l(d),payload:t}),attach:(t)=>A({channel:u,v:E,type:"attach",id:l(d),payload:ee(t)}),startSession:async(t)=>{if(t.projectId!==void 0)L(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")L(o.directory);else{if(o.name!==void 0)L(o.name,200);if(o.baseBranch!==void 0)L(o.baseBranch,200)}let s=await k({channel:u,v:E,type:"start-session",id:l(d),payload:Tt(t)},e.requestTimeoutMs??180000);if(!dt(s))throw new a("HOST_REJECTED","Host did not return a session.");return s},prompt:(t)=>k({channel:u,v:E,type:"prompt",id:l(d),payload:St(t)}).then((o)=>{if(!lt(o))throw new a("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>A({channel:u,v:E,type:"session-link",id:l(d),payload:ee(t)}),close:()=>A({channel:u,v:E,type:"close",id:l(d)}),oauthStart:()=>A({channel:u,v:E,type:"oauth-start",id:l(d)}),oauthDisconnect:()=>A({channel:u,v:E,type:"oauth-disconnect",id:l(d)}),request:(t)=>(we(t.path)?k({channel:u,v:E,type:"request",id:l(d),payload:t}):Po()).then((o)=>{if(!Pe(o))throw new a("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(we(t.path)?k({channel:u,v:E,type:"service-request",id:l(d),payload:t}):Po()).then((o)=>{if(!Pe(o))throw new a("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>k({channel:u,v:E,type:"service-status",id:l(d)}).then((t)=>{if(!mt(t))throw new a("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(te(t)?k({channel:u,v:E,type:"file-read",id:l(d),payload:{path:t}}):Ge()).then((o)=>{if(!ht(o))throw new a("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!te(t))return Ge();if(o.length>Ne)return Promise.reject(new a("FILE_TOO_LARGE",`Content is over ${Ne} characters.`));return k({channel:u,v:E,type:"file-write",id:l(d),payload:{path:t,content:o}}).then((s)=>{if(!At(s))throw new a("HOST_REJECTED","Host did not confirm the write.");return s})},listDir:(t)=>(te(t)?k({channel:u,v:E,type:"file-list",id:l(d),payload:{path:t}}):Ge()).then((o)=>{if(!Rt(o))throw new a("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(te(t)?k({channel:u,v:E,type:"file-stat",id:l(d),payload:{path:t}}):Ge()).then((o)=>{if(!xt(o))throw new a("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),s=t.system?.trim();if(o.length===0||o.length>Me)return Promise.reject(new a("HOST_REJECTED",`Prompt must be 1 to ${Me} characters.`));if(s!==void 0&&(s.length===0||s.length>Le))return Promise.reject(new a("HOST_REJECTED",`System prompt must be 1 to ${Le} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(Et,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new a("HOST_REJECTED","maxOutputTokens must be a number."));let S={prompt:o};if(s!==void 0)S.system=s;if(i!==void 0)S.maxOutputTokens=i;return k({channel:u,v:E,type:"generate",id:l(d),payload:S},e.requestTimeoutMs??_t).then((T)=>{if(!gt(T))throw new a("HOST_REJECTED","Host did not return generated text.");return T})},onLateGenerateResult:(t)=>{J.add(t);for(let o of Ye.splice(0))h([t],o);return Wt(),()=>{J.delete(t)}},setBadge:(t)=>A({channel:u,v:E,type:"badge",id:l(d),payload:{count:ft(t)}}),setHeight:(t)=>A({channel:u,v:E,type:"resize",id:l(d),payload:{height:Ot(t)}}),onFileOpen:(t)=>{if(he.add(t),!Qe)Qe=!0,n.addEventListener("keydown",Yt,!0);if(de)t(de);return()=>{he.delete(t)}},onFileSnapshot:(t)=>(ce=t,()=>{if(ce===t)ce=null}),onFileSaved:(t)=>(Ae.add(t),()=>{Ae.delete(t)}),reportFileChange:(t)=>Ze({...R,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Jt,reportFileUnsupported:()=>Ze({...R,type:"file-unsupported"}),dispose:()=>{for(let t of Q.keys())v({...R,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:t}});Q.clear();for(let t of Z.keys())v({...R,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:t}});if(Z.clear(),w=!0,ie=null,ae=null,ce=null,he.clear(),Ae.clear(),Qe)n.removeEventListener("keydown",Yt,!0);n.removeEventListener("message",zt),n.removeEventListener("keydown",Qt,!0),n.removeEventListener("pointerover",xe),n.removeEventListener("pointermove",xe),n.removeEventListener("pointerout",Zt),n.removeEventListener("focus",qt),n.removeEventListener("blur",eo);for(let t of Y.values())clearTimeout(t.timer),t.reject(new a("HOST_UNAVAILABLE","Host client was disposed."));Y.clear(),_.clear(),b.clear(),F.clear(),M.clear(),V.clear(),B.clear(),se.clear(),Oe.clear(),me.clear(),J.clear(),Ye.length=0}}};var Go=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var tr=new Set(Go);var Do=["none","agent","user"];var nr=new Set(Do);var un=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],En=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Ho=(e,n)=>{n.style.colorScheme=e.mode;for(let[r,p]of un)n.style.setProperty(r,e.tokens[p]);for(let[r,p,_]of En){let b=e.tokens[_]??"";n.style.setProperty(r,b),n.style.setProperty(p,b)}n.style.setProperty("font-family",e.tokens.font),n.style.setProperty("font-size","0.875rem"),n.style.setProperty("line-height","1.45"),n.style.setProperty("color",e.tokens.foreground)},It=(e,n)=>{if(Ho(e.theme,n),n.dataset)n.dataset.ocSurface=e.surface,n.dataset.ocTheme=e.theme.mode};var _n={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},f=(e,n)=>`var(--${e}, var(--oc-${_n[e]}, ${n}))`,D=f("surface-background","transparent"),Xe=f("surface-elevated","transparent"),oe=f("surface-elevated-foreground","inherit"),N=f("surface-foreground","inherit"),O=f("surface-muted-foreground","gray"),Tn=f("surface-muted","transparent"),j=f("interactive-border","currentColor"),U=f("interactive-hover","transparent"),W=f("interactive-active","transparent"),Ut=f("interactive-selection","transparent"),yt=f("interactive-selection-foreground","inherit"),G=f("primary","currentColor"),Ct=f("primary-text","inherit"),vt=f("error-text","inherit"),Sn=f("font-sans","inherit"),Nt=f("font-mono","monospace"),Vo=f("radius","9px"),Mt=`calc(${Vo} - 2px)`,Xo=`calc(${Vo} - 4px)`,m=(e,n,r="transparent")=>`color-mix(in srgb, ${e} ${n}%, ${r})`,$o=`background-image: linear-gradient(${U}, ${U});`,Lt=(e,n="0.5px")=>`box-shadow: inset 0 0 0 ${n} ${e}, var(--oc-sdk-field-lift);`,wt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Fo="box-shadow: var(--oc-sdk-lit);",Pt=`inset 0 0.5px 0 0 ${m(N,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,fn=`
:root {
  --oc-sdk-edge: ${m(N,16)};
  --oc-sdk-field-bg: ${Xe};
  --oc-sdk-raised-bg: ${D};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${m(N,14)};
  --oc-sdk-field-bg: ${m(D,50,Xe)};
  --oc-sdk-raised-bg: ${Xe};
  --oc-sdk-field-lift: ${Pt};
  --oc-sdk-raised-lift: ${Pt};
  --oc-sdk-lit: ${Pt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,He=(e)=>{let n=f(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${n}; --oc-sdk-tone-text: ${f(`${e}-text`,"inherit")}; }`},On=`
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
`,Bo=`${fn}
.oc-sdk { color: ${N}; font-family: ${Sn}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${$o} }
.oc-sdk-mono { font-family: ${Nt}; }
.oc-sdk-muted { color: ${O}; }
${He("success")}${He("warning")}${He("error")}${He("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${G}; --oc-sdk-tone-text: ${Ct}; }

.oc-sdk-btn { border-radius: ${Mt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Xo}; }
.oc-sdk-btn[data-variant="default"] { color: ${Ct}; background: ${m(G,10,D)}; border-color: ${m(G,12)}; ${Fo} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${m(G,16,D)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${m(G,22,D)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Tn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${oe}; ${wt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${W}, ${W}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${U}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${W}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${f("status-error","red")}; color: ${vt}; background: ${m("var(--oc-sdk-tone)",7,D)}; border-color: ${m("var(--oc-sdk-tone)",12)}; ${Fo} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${m("var(--oc-sdk-tone)",9,D)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${m("var(--oc-sdk-tone)",11,D)}; box-shadow: none; }

.oc-sdk-field-note { color: ${O}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${vt}; }
.oc-sdk-input { border-radius: ${Mt}; background: var(--oc-sdk-field-bg); color: ${oe}; ${Lt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${O}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Lt(m(N,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Lt(f("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Nt}; }

.oc-sdk-search-icon { color: ${O}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${G}; }
.oc-sdk-search-clear { border-radius: ${Xo}; color: ${O}; }
.oc-sdk-search-clear:hover { background: ${U}; color: ${N}; }

.oc-sdk-trigger { border-radius: ${Mt}; background: var(--oc-sdk-raised-bg); color: ${oe}; ${wt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${O}; }
.oc-sdk-trigger-chevron { color: ${O}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${oe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Xe}; background-clip: padding-box; color: ${oe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${U}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Ut}; color: ${yt}; }
.oc-sdk-option-check { color: ${N}; }
.oc-sdk-option[data-destructive="true"] { color: ${vt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${m(f("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${O}; }
.oc-sdk-popup-empty { color: ${O}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${j}; border-radius: 4px; color: ${N}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${m(N,60,j)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${j}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${D}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${G}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${$o} }
.oc-sdk-check-desc { color: ${O}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${m(N,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${O}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${N}; }
.oc-sdk-tab[aria-selected="true"] { color: ${yt}; background: ${Ut}; border-color: ${j}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${oe}; background: var(--oc-sdk-raised-bg); ${wt} }
.oc-sdk-tab-count { color: ${O}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${m(N,6)}; color: ${O}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${m("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${U}; }
.oc-sdk-row[aria-selected="true"] { background: ${Ut}; color: ${yt}; }
.oc-sdk-row-lead { font-family: ${Nt}; color: ${O}; }
.oc-sdk-row-sub { color: ${O}; }
.oc-sdk-row-meta { color: ${O}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${O}; }

.oc-sdk-empty-body { color: ${O}; }

.oc-sdk-spinner { color: ${O}; }
.oc-sdk-spinner-ring { border-color: ${j}; border-top-color: ${G}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${m("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${O}; }

.oc-sdk-separator { color: ${O}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${m(j,40)}; }

.oc-sdk-progress-label { color: ${O}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${m(N,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${G}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${f("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${f("success-text","inherit")}; }

.oc-sdk-text a { color: ${Ct}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${m(j,60)}; }
`,I=`
${tt}
${On}
${Bo}`;var Ko=()=>{try{let e=new URL(window.location.href);if(e.protocol==="http:"||e.protocol==="https:")return e.origin}catch{}return null},X=(e,n,r)=>{let p=document.createElement(e);if(n)p.className=n;if(r!==void 0)p.textContent=r;return p},jo=(e,n)=>{if(e instanceof a){if(e.code==="NO_SERVICE"||e.code==="NOT_GRANTED"||e.code==="SERVICE_FAILED")return n.serviceHint;if(e.code==="DISABLED")return n.disabled;if(e.code==="HOST_TIMEOUT")return n.reconnecting;return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)},Dt=(e)=>Math.round(e).toLocaleString(),Ke=(e)=>`${(e/1000).toFixed(1)} s`;var xn=500,gn=0.98,bn=1000,Xt={en:{live:"Live",lastTurn:"Last turn",session:"Session",unit:"tok/s",tokens:"tok",measuring:"measuring",noSession:"No session yet. The rate shows once this chat has one.",serviceHint:"The extension needs its local service. Approve it in Settings → Extensions.",disabled:"The extension is paused in Settings → Extensions.",noOrigin:"This surface cannot reach the OpenChamber server (relay or embedded view).",reconnecting:"Reconnecting to the event stream.",liveTip:"Tokens per second over the last 5 seconds, estimated from streamed characters.",sessionTip:"Tokens the model generated in this session, output and reasoning together.",generating:"Generating",paused:"paused",estimated:"Estimated from streamed characters."},ko:{live:"실시간",lastTurn:"지난 턴",session:"세션",unit:"tok/s",tokens:"tok",measuring:"측정 중",noSession:"아직 세션이 없습니다. 챗에 세션이 생기면 속도를 표시합니다.",serviceHint:"이 확장은 로컬 서비스가 필요합니다. 설정 → Extensions에서 승인해 주세요.",disabled:"설정 → Extensions에서 확장이 일시중지되었습니다.",noOrigin:"이 화면에서는 OpenChamber 서버에 접근할 수 없습니다(릴레이 또는 임베드 뷰).",reconnecting:"이벤트 스트림에 다시 연결하는 중입니다.",liveTip:"최근 5초 동안의 초당 토큰 수입니다. 스트리밍된 문자 수로 추정합니다.",sessionTip:"이 세션에서 모델이 생성한 토큰 수입니다. 출력과 추론을 합산합니다.",generating:"생성",paused:"대기",estimated:"스트리밍된 문자 수로 추정한 값입니다."}},fe=kt(),We=document.querySelector("#root");if(!We)throw Error("Missing #root");var Vt=(e)=>{let n=X("span","tps-what"),r=X("span","tps-value","—"),p=X("div","tps-line");return p.append(n,e,r),{row:p,label:n,value:r}},re=X("div","tps-note");re.hidden=!0;var Jo=X("div","tps-meter-fill"),Yo=X("div","tps-meter");Yo.append(Jo);var Te=Vt(Yo),$t=X("span","tps-detail"),z=Vt($t),Se=Vt(X("span")),Qo=[Te.row,z.row,Se.row];We.append(re,...Qo);var g=Xt.en,Je=null,K=null,Ft="",ze=null,_e=0,Ht=!1,Wo=!1,kn=()=>{Te.label.textContent=g.live,z.label.textContent=g.lastTurn,Se.label.textContent=g.session,Te.row.title=g.liveTip,Se.row.title=g.sessionTip},je=(e,n,r=null,p="warning")=>{re.hidden=e===null,re.textContent=e??"",re.title=r??"",re.dataset.tone=p;for(let _ of Qo)_.hidden=!n},In=(e)=>{let n=e.lastTurn;if(!n)return"";let r=[`${g.generating} ${Ke(n.activeMs)}`];if(n.pausedMs>=bn)r.push(`${g.paused} ${Ke(n.pausedMs)}`);let p=r.join(", ");return n.source==="estimate"?`${p}
${g.estimated}`:p},Bt=(e)=>{let n=e&&Number.isFinite(e.tokensPerSecond)?e.tokensPerSecond:0;_e=Math.max(n,_e*gn);let r=_e>0.05?Math.min(1,n/_e):0;Jo.style.transform=`scaleX(${r.toFixed(4)})`,Te.value.textContent=e?`${n.toFixed(1)} ${g.unit}`:"—",Te.value.dataset.quiet=String(!(e?.busy&&e.active));let p=e?.lastTurn??null;if(e&&p){let b=p.source==="estimate"?"~":"";$t.textContent=`${b}${Dt(p.tokens)} ${g.tokens} / ${Ke(p.activeMs)}`,z.value.textContent=`${p.tokensPerSecond.toFixed(1)} ${g.unit}`,z.row.title=In(e)}else $t.textContent=e?.busy?g.measuring:"",z.value.textContent="—",z.row.title="";z.value.dataset.quiet=String(!p);let _=e?.sessionUsage??null;Se.value.textContent=_?`${Dt(_.generated)} ${g.tokens}`:"—",Se.value.dataset.quiet=String(!_)},Un=()=>`${Je??""}|${K??""}`,yn=async()=>{let e=Un();if(e===Ft)return;let n=await fe.serviceRequest({method:"POST",path:"/watch",body:JSON.stringify({origin:Je,sessionId:K})});if(n.status>=400)throw Error(`HTTP ${n.status}`);Ft=e},Zo=async()=>{if(Ht)return;if(!Je){je(g.noOrigin,!1);return}if(!K){je(g.noSession,!1,null,"muted");return}Ht=!0;let e=K;try{await yn();let n=await fe.serviceRequest({method:"GET",path:"/rate"});if(n.status>=400)throw Error(`HTTP ${n.status}`);let r=JSON.parse(n.body);if(e!==K)return;if(r.sessionId===null&&r.connection==="idle")Ft="";ze=r,Bt(r),je(r.connection==="error"?g.reconnecting:null,!0,r.error)}catch(n){je(jo(n,g),ze!==null)}finally{Ht=!1}},qo=(e)=>{if(e===K)return;K=e,ze=null,_e=0,Bt(null),Zo()},en=async()=>{if(!document.hidden)await Zo();window.setTimeout(()=>{en()},xn)},zo=-1;new ResizeObserver(()=>{let e=Math.ceil(We.getBoundingClientRect().height);if(e===zo)return;zo=e,fe.setHeight(e).catch(()=>{return})}).observe(We);fe.onReady((e)=>{if(g=e.locale.toLowerCase().startsWith("ko")?Xt.ko:Xt.en,It(e,document.documentElement),Je=Ko(),kn(),Bt(ze),!Wo){Wo=!0,K=e.session?.id??null,en();return}qo(e.session?.id??null)});fe.onSession((e)=>{qo(e?.id??null)});})();
