(()=>{var p="openchamber.sdk",u=1;var ot=`
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
`;function so(e){let n=e.documentElement;if(n.hasAttribute("data-oc-scrollbar-activity"))return;n.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",(E)=>{let _=E.target===e?n:E.target;if(!(_ instanceof Element))return;if(!_.hasAttribute("data-oc-scrolling"))_.setAttribute("data-oc-scrolling","");let A=r.get(_);if(A!==void 0)clearTimeout(A);r.set(_,setTimeout(()=>{r.delete(_),_.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var rn=`(${so.toString()})(document);`;var nt=128,rt=65536;var Ue=128;var ye=65536;var lo=/^[a-z][a-z0-9-]{0,39}$/;var io=(e)=>Object(e)===e&&!Array.isArray(e),st=(e,n)=>Object.keys(e).every((r)=>n.includes(r)),ao=(e)=>String(e)===e&&e.length>=1&&e.length<=60,co=(e)=>String(e)===e&&e.length>=1&&e.length<=80,po=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let n=new Set;for(let r of e){if(!io(r)||!lo.test(r.id)||!ao(r.label))return!1;if(r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1)return!1;if(n.has(r.id))return!1;if(n.add(r.id),r.kind==="button"){if(!st(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!st(r,["kind","id","label","value","options","disabled"]))return!1;if(!co(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let E=new Set;for(let _ of r.options){if(!io(_)||!st(_,["value","label"])||!co(_.value)||!ao(_.label)||E.has(_.value))return!1;E.add(_.value)}if(!E.has(r.value))return!1}return!0};var uo=["{id}","{segment}","{segments+}"];var $n=new Set(uo);var Eo=["turn-finished","turn-failed","permission-asked","question-asked"];var Vn=new Set(Eo);var Ce=20000000,ve=256;var it=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,_o=(e,n)=>{if(e.path!==n.path||e.readOnly!==n.readOnly)return!1;if(e.encoding==="text"||n.encoding==="text")return e.encoding==="text"&&n.encoding==="text"&&e.content===n.content;if(e.bytes.byteLength!==n.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==n.bytes[r])return!1;return!0};var To=/^[A-Za-z0-9_-]{1,80}$/;var So=["left","right","top","bottom"];var fo=(e,n=0,r={remaining:16000})=>{if(--r.remaining<0||n>=32)return!1;if(e===null)return!0;let E=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let _ of E)if(!fo(_,n+1,r))return!1;return!0},at=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((n)=>/^(0|[1-9]\d*)$/.test(n)&&Number(n)<e.length)&&e.every(at);if(Object(e)===e){let n=Object.getPrototypeOf(e);return(n===null||n===Object.prototype)&&Object.values(e).every(at)}return String(e)===e||Number.isFinite(e)},ct=(e)=>{try{if(String(e.id)!==e.id||!To.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!So.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!fo(e.data)||!at(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var ho=["file","directory","other","missing"],lt=(e)=>Boolean(e&&"sessionId"in e),pt=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var mo=/^[0-9a-f]{7,64}$/i,ut=(e)=>mo.test(e),Ne=500,Me=32000,Ao=16000,Ro=128,xo=200,go=2000,bo=16000,ko=80,Io=200,Uo=16000;var yo=2000;var Et=20000,Le=1024,we=2000000;var Pe=64000,Ge=8000,_t=4000;var Tt=960000;var Co=999,vo=1e4,ue=500,No=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Mo=["stopped","starting","ready","failed"],an=new Set(No),Lo=(e)=>an.has(e),wo=(e)=>e&&Lo(e)?e:"HOST_REJECTED",q=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(q);if(Object(e)===e)return Object.values(e).every(q);return!1},Po=(e)=>q(e)&&JSON.stringify(e).length<=Uo,Oo=(e)=>e?.trim().slice(0,Io)??"",ee=(e)=>{let n=e.id.trim().slice(0,Ro),r=e.title.trim().slice(0,xo),E=e.url.trim().slice(0,go),_=e.text?.trim().slice(0,bo),A=e.author?.trim().slice(0,ko),L=e.kind==="pull"?"pull":"issue",v={providerId:e.providerId.trim(),id:n,title:r||n,url:E,kind:L};if(_)v.text=_;if(A)v.author=A;if(L==="pull"){let V=Oo(e.branches?.head),B=Oo(e.branches?.base);if(V&&B)v.branches={head:V,base:B}}if(Po(e.data))v.data=e.data;return v},St=(e)=>{let n=ee(e);if(e.projectId)n.projectId=e.projectId;if(e.navigation)n.navigation=e.navigation;if(e.worktree)n.worktree=e.worktree;return n},ft=(e)=>{let n={text:e.text.trim().slice(0,Ao)};if(e.send)n.send=!0;return n},Ot=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(Co,Math.max(0,Math.round(e)))},ht=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(vo,Math.max(0,Math.ceil(e)))};var te=(e)=>e.length>0&&e.length<=Le&&!e.includes("\x00")&&!e.includes("\\");var De=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>yo)return!1;return!e.split("/").some((r)=>r==="."||r==="..")},cn=new Set(Mo),mt=(e)=>Boolean(e&&"status"in e&&cn.has(String(e.status))&&!("body"in e)),He=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),At=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),Rt=(e)=>Boolean(e&&"written"in e&&e.written===!0),xt=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),dn=new Set(ho),gt=(e)=>Boolean(e&&"kind"in e&&"size"in e&&dn.has(String(e.kind))&&Number.isFinite(e.size)),bt=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),ln=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),pn=(e)=>Object(e)===e?e:null,dt=(e)=>String(e)===e&&e.length>0,un=(e)=>{if(!dt(e.id))return null;if(e.ok===!0){let n={channel:p,v:u,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)n.payload=e.payload;return n}if(e.ok===!1&&dt(e.error))return{channel:p,v:u,type:"result",id:e.id,ok:!1,error:e.error,code:wo(dt(e.code)?e.code:void 0)};return null},kt=(e)=>{let n=pn(e);if(!n||n.channel!==p||n.v!==u)return null;if(n.type==="result")return un(n);if(!ln.has(String(n.type))||Object(n.payload)!==n.payload)return null;return n};var Go=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),En=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class a extends Error{code;constructor(e,n){super(n);this.name="HostRequestError",this.code=e}}var Do=()=>Promise.reject(new a("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Xe=()=>Promise.reject(new a("BAD_PATH",`File path must be 1 to ${Le} characters without NUL or backslash.`)),$e=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new a("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},l=(e)=>(e.value+=1,`oc-${e.value}`),It=(e={})=>{let n=e.target??("window"in globalThis?window:null);if(!n)throw new a("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??((t)=>t===n.parent),E=e.requestTimeoutMs??Et,_=new Set,A=new Set,L=new Set,v=new Set,V=new Set,B=new Set,se=new Set,Ae=new Set,Re=new Set,J=new Set,Qe=[],ie=null,ae=null,xe=new Set,ge=new Set,ce=null,de=null,Ze=!1,Y=new Map,Q=new Map,Z=new Map,G=!1,d={value:0},c=null,D=null,le=!1,pe=!1,Wt=null,zt=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},N=(t)=>{n.parent.postMessage(t,"*")},Jt=()=>{if(G||n.parent===n||J.size===0||c?.features?.lateGenerateResults!==!0)return;N({channel:p,v:u,type:"generate-late-listen"})},R=(t,o)=>{for(let s of t)try{s(o)}catch(i){console.error(i)}},Yt=(t)=>{if(!(t instanceof MessageEvent))return;if(!r(t.source))return;let o=kt(t.data);if(!o)return;if(o.type==="workspace"){let i=Q.get(o.payload.subscriptionId);if(i)R([i],o.payload.snapshot);return}if(o.type==="shells"){let i=Z.get(o.payload.subscriptionId);if(i)R([i],o.payload.snapshot);return}if(o.type==="ready"){if(c=o.payload,D=zt(o.payload.session),R(_,o.payload),R(A,o.payload.directory),R(L,o.payload.session),D)R(v,D);R(V,o.payload.connection),R(B,o.payload.settings),R(se,o.payload.item),Jt();return}if(o.type==="generate-late"){if(J.size===0)Qe.push(o.payload);else R(J,o.payload);return}if(o.type==="directory"){if(c)c={...c,directory:o.payload.directory};R(A,o.payload.directory);return}if(o.type==="session"){if(c)c={...c,session:o.payload.session};if(!o.payload.session)D=null;else if(D?.sessionId!==o.payload.session.id)D=zt(o.payload.session);R(L,o.payload.session);return}if(o.type==="session-lifecycle"){D=o.payload,R(v,o.payload);return}if(o.type==="connection"){if(c)c={...c,connection:o.payload.connection};R(V,o.payload.connection);return}if(o.type==="settings"){if(c)c={...c,settings:o.payload.settings};R(B,o.payload.settings);return}if(o.type==="item"){if(c)c={...c,item:o.payload.item};R(se,o.payload.item);return}if(o.type==="status-control-event"){R(Ae,o.payload);return}if(o.type==="popover-closed"){R(Re,o.payload);return}if(o.type==="action"){let i=(T)=>{if(!G)N({channel:p,v:u,type:"action-result",id:o.id,payload:T})},S=ae;if(!S){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>S(o.payload)).then(()=>i({ok:!0}),(T)=>{let b=(T instanceof Error?T.message:String(T)).trim();i({ok:!1,error:(b||"Action failed.").slice(0,ue)})});return}if(o.type==="file-open"){let i=o.payload;if(de&&_o(de,i))return;de=i,R(xe,o.payload);return}if(o.type==="file-saved"){R(ge,o.payload.version);return}if(o.type==="file-snapshot"){let i=(b)=>{if(!G)N({channel:p,v:u,type:"file-snapshot-result",id:o.id,payload:b})},S=(b)=>i({error:(b.trim()||"Could not read the edited file.").slice(0,ue)}),T=ce;if(!T){S("This extension does not edit files.");return}Promise.resolve().then(()=>T(o.payload.purpose)).then((b)=>{if(it(b)>Ce){S(`The file is over ${Ce} ${"bytes"in b?"bytes":"characters"}.`);return}if(b.version.length>ve){S(`The snapshot version is over ${ve} characters.`);return}i({snapshot:"bytes"in b?{bytes:b.bytes,version:b.version}:{content:b.content,version:b.version}})},(b)=>S(b instanceof Error?b.message:String(b)));return}if(o.type==="resolve"){let i=(T)=>{N({channel:p,v:u,type:"resolve-result",id:o.id,payload:T})},S=ie;if(!S){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>S(o.payload)).then((T)=>i({item:T?ee(T):null}),(T)=>{let b=(T instanceof Error?T.message:String(T)).trim();i({error:(b||"Command failed.").slice(0,ue)})});return}let s=Y.get(o.id);if(!s)return;if(clearTimeout(s.timer),Y.delete(o.id),o.ok){s.resolve(o.payload);return}s.reject(new a(o.code,o.error))};n.addEventListener("message",Yt),N({channel:p,v:u,type:"hello"});let k=(t,o=E)=>{if(G||n.parent===n)return Promise.reject(new a("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((s,i)=>{let S=setTimeout(()=>{Y.delete(t.id),i(new a("HOST_TIMEOUT","Host did not answer in time."))},o);Y.set(t.id,{resolve:s,reject:i,timer:S}),N(t)})},x=(t)=>k(t).then(()=>{return}),g={channel:p,v:u},qe=(t)=>{if(!G&&n.parent!==n)N(t)},Qt=()=>qe({...g,type:"file-save"}),Zt=(t)=>{if(!Go(t)||!En(t))return;t.preventDefault(),Qt()},qt=(t)=>{if(!Go(t)||t.key!=="Escape"||c?.surface!=="popover"||!c.popover)return;t.preventDefault(),no(c.popover.id,"escape").catch(()=>{return})},be=()=>{let t=c?.surface==="popover"?c.popover:void 0;if(!t)return;let o=le||pe;if(Wt===o)return;Wt=o,ro(t.id,o).catch(()=>{return})},ke=()=>{if(c?.surface!=="popover"||le)return;le=!0,be()},eo=(t)=>{if(c?.surface!=="popover"||t.relatedTarget!==null||!le)return;le=!1,be()},to=()=>{if(c?.surface!=="popover"||pe)return;pe=!0,be()},oo=()=>{if(c?.surface!=="popover"||!pe)return;pe=!1,be()},w=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new a("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},et=async(t)=>{if(t.kind!=="projects")w(t.projectId);let o=await k({...g,type:"workspace-read",id:l(d),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new a("HOST_REJECTED","Host did not return workspace data.");return o},tt=async(t,o)=>{if(t.kind!=="projects")w(t.projectId);let s=l(d);Q.set(s,o);try{await x({...g,type:"workspace-subscribe",id:l(d),payload:{subscriptionId:s,query:t}})}catch(i){if(Q.delete(s),!G)N({...g,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Q.delete(s)||G)return;N({...g,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},nn=async(t,o)=>{if(t.kind==="session")w(t.sessionId);if(t.kind==="project")w(t.projectId);let s=l(d);Z.set(s,o);try{await x({...g,type:"shells-subscribe",id:l(d),payload:{subscriptionId:s,scope:t}})}catch(i){if(Z.delete(s),!G)N({...g,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Z.delete(s)||G)return;N({...g,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},Ie=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>nt))throw new a("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!q(t.value))throw new a("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>rt)throw new a("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&c?.features?.deviceStorage!==!0)throw new a("UNSUPPORTED","This host does not support device storage.");let o=await k({...g,type:"storage",id:l(d),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new a("HOST_REJECTED","Host did not return storage data.");return o},no=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):x({...g,type:"popover-close",id:l(d),payload:o?{id:t,reason:o}:{id:t}}),ro=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):x({...g,type:"popover-anchor",id:l(d),payload:{id:t,active:o}});return n.addEventListener("keydown",qt,!0),n.addEventListener("pointerover",ke),n.addEventListener("pointermove",ke),n.addEventListener("pointerout",eo),n.addEventListener("focus",to),n.addEventListener("blur",oo),{onAction:(t)=>(ae=t,()=>{if(ae===t)ae=null}),listProjects:async()=>{let t=await et({kind:"projects"});if(t.kind!=="projects")throw new a("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await et({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new a("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await et({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new a("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>tt({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>tt({kind:"worktrees",projectId:t},(s)=>{if(s.kind==="worktrees")o(s)}),onSessions:(t,o)=>tt({kind:"sessions",projectId:t},(s)=>{if(s.kind==="sessions")o(s)}),onRunningShells:(t,o)=>nn(t,o),readShellOutput:async(t,o)=>{w(t,Ue);let s=o?.cursor;if(s!==void 0&&(!Number.isInteger(s)||s<0))throw new a("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>ye))throw new a("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${ye}.`);let T=await k({...g,type:"shell-output",id:l(d),payload:{shellId:t,cursor:s,tailBytes:i}});if(!T||typeof T.output!=="string"||!Number.isFinite(T.cursor))throw new a("HOST_REJECTED","Host did not return shell output.");return T},stopShell:async(t)=>{if(w(t,Ue),(await k({...g,type:"shell-stop",id:l(d),payload:{shellId:t}}))?.stopped!==!0)throw new a("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{w(t),await x({...g,type:"open-session",id:l(d),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let s=$e(o),i={op:"get",key:t};if(s)i.scope=s;let S=await Ie(i);return S.op==="get"&&S.found?S.value:void 0},set:async(t,o,s)=>{let i=$e(s),S={op:"set",key:t,value:o};if(i)S.scope=i;await Ie(S)},delete:async(t,o)=>{let s=$e(o),i={op:"delete",key:t};if(s)i.scope=s;await Ie(i)},keys:async(t)=>{let o=$e(t),s={op:"keys"};if(o)s.scope=o;let i=await Ie(s);if(i.op!=="keys")throw new a("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(_.add(t),c)t(c);return()=>{_.delete(t)}},onDirectory:(t)=>{if(A.add(t),c)t(c.directory);return()=>{A.delete(t)}},onSession:(t)=>{if(L.add(t),c)t(c.session);return()=>{L.delete(t)}},onSessionLifecycle:(t)=>{if(v.add(t),D)t(D);return()=>{v.delete(t)}},onConnection:(t)=>{if(V.add(t),c)t(c.connection);return()=>{V.delete(t)}},onSettings:(t)=>{if(B.add(t),c)t(c.settings);return()=>{B.delete(t)}},onItem:(t)=>{if(se.add(t),c)t(c.item);return()=>{se.delete(t)}},onStatusControl:(t)=>(Ae.add(t),()=>{Ae.delete(t)}),onPopoverClosed:(t)=>(Re.add(t),()=>{Re.delete(t)}),setStatusControls:(t)=>{if(c?.features?.statusControls!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support status controls."));if(!po(t))return Promise.reject(new a("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return x({...g,type:"status-controls",id:l(d),payload:{controls:t}})},openPopover:(t)=>{if(c?.features?.popovers!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support popovers."));if(!ct(t))return Promise.reject(new a("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return x({...g,type:"popover-open",id:l(d),payload:t})},closePopover:no,setPopoverAnchorActive:ro,onResolve:(t)=>(ie=t,()=>{if(ie===t)ie=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>Ne)return Promise.reject(new a("HOST_REJECTED",`Toast message must contain 1 to ${Ne} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Me))return Promise.reject(new a("HOST_REJECTED",`Toast copy text must contain 1 to ${Me} characters.`));return x({channel:p,v:u,type:"toast",id:l(d),payload:{...t,message:o}})},openUrl:(t)=>x({channel:p,v:u,type:"open-url",id:l(d),payload:{url:t}}),openCommit:(t)=>ut(t)?x({channel:p,v:u,type:"open-commit",id:l(d),payload:{sha:t}}):Promise.reject(new a("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:(t)=>x({channel:p,v:u,type:"open-surface",id:l(d),payload:{surfaceId:t}}),writeClipboard:(t)=>x({channel:p,v:u,type:"clipboard-write",id:l(d),payload:{text:t}}),compose:(t)=>x({channel:p,v:u,type:"compose",id:l(d),payload:t}),attach:(t)=>x({channel:p,v:u,type:"attach",id:l(d),payload:ee(t)}),startSession:async(t)=>{if(t.projectId!==void 0)w(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")w(o.directory);else{if(o.name!==void 0)w(o.name,200);if(o.baseBranch!==void 0)w(o.baseBranch,200)}let s=await k({channel:p,v:u,type:"start-session",id:l(d),payload:St(t)},e.requestTimeoutMs??180000);if(!lt(s))throw new a("HOST_REJECTED","Host did not return a session.");return s},prompt:(t)=>k({channel:p,v:u,type:"prompt",id:l(d),payload:ft(t)}).then((o)=>{if(!pt(o))throw new a("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>x({channel:p,v:u,type:"session-link",id:l(d),payload:ee(t)}),close:()=>x({channel:p,v:u,type:"close",id:l(d)}),oauthStart:()=>x({channel:p,v:u,type:"oauth-start",id:l(d)}),oauthDisconnect:()=>x({channel:p,v:u,type:"oauth-disconnect",id:l(d)}),request:(t)=>(De(t.path)?k({channel:p,v:u,type:"request",id:l(d),payload:t}):Do()).then((o)=>{if(!He(o))throw new a("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(De(t.path)?k({channel:p,v:u,type:"service-request",id:l(d),payload:t}):Do()).then((o)=>{if(!He(o))throw new a("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>k({channel:p,v:u,type:"service-status",id:l(d)}).then((t)=>{if(!mt(t))throw new a("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(te(t)?k({channel:p,v:u,type:"file-read",id:l(d),payload:{path:t}}):Xe()).then((o)=>{if(!At(o))throw new a("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!te(t))return Xe();if(o.length>we)return Promise.reject(new a("FILE_TOO_LARGE",`Content is over ${we} characters.`));return k({channel:p,v:u,type:"file-write",id:l(d),payload:{path:t,content:o}}).then((s)=>{if(!Rt(s))throw new a("HOST_REJECTED","Host did not confirm the write.");return s})},listDir:(t)=>(te(t)?k({channel:p,v:u,type:"file-list",id:l(d),payload:{path:t}}):Xe()).then((o)=>{if(!xt(o))throw new a("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(te(t)?k({channel:p,v:u,type:"file-stat",id:l(d),payload:{path:t}}):Xe()).then((o)=>{if(!gt(o))throw new a("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),s=t.system?.trim();if(o.length===0||o.length>Pe)return Promise.reject(new a("HOST_REJECTED",`Prompt must be 1 to ${Pe} characters.`));if(s!==void 0&&(s.length===0||s.length>Ge))return Promise.reject(new a("HOST_REJECTED",`System prompt must be 1 to ${Ge} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(_t,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new a("HOST_REJECTED","maxOutputTokens must be a number."));let S={prompt:o};if(s!==void 0)S.system=s;if(i!==void 0)S.maxOutputTokens=i;return k({channel:p,v:u,type:"generate",id:l(d),payload:S},e.requestTimeoutMs??Tt).then((T)=>{if(!bt(T))throw new a("HOST_REJECTED","Host did not return generated text.");return T})},onLateGenerateResult:(t)=>{J.add(t);for(let o of Qe.splice(0))R([t],o);return Jt(),()=>{J.delete(t)}},setBadge:(t)=>x({channel:p,v:u,type:"badge",id:l(d),payload:{count:Ot(t)}}),setHeight:(t)=>x({channel:p,v:u,type:"resize",id:l(d),payload:{height:ht(t)}}),onFileOpen:(t)=>{if(xe.add(t),!Ze)Ze=!0,n.addEventListener("keydown",Zt,!0);if(de)t(de);return()=>{xe.delete(t)}},onFileSnapshot:(t)=>(ce=t,()=>{if(ce===t)ce=null}),onFileSaved:(t)=>(ge.add(t),()=>{ge.delete(t)}),reportFileChange:(t)=>qe({...g,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Qt,reportFileUnsupported:()=>qe({...g,type:"file-unsupported"}),dispose:()=>{for(let t of Q.keys())N({...g,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:t}});Q.clear();for(let t of Z.keys())N({...g,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:t}});if(Z.clear(),G=!0,ie=null,ae=null,ce=null,xe.clear(),ge.clear(),Ze)n.removeEventListener("keydown",Zt,!0);n.removeEventListener("message",Yt),n.removeEventListener("keydown",qt,!0),n.removeEventListener("pointerover",ke),n.removeEventListener("pointermove",ke),n.removeEventListener("pointerout",eo),n.removeEventListener("focus",to),n.removeEventListener("blur",oo);for(let t of Y.values())clearTimeout(t.timer),t.reject(new a("HOST_UNAVAILABLE","Host client was disposed."));Y.clear(),_.clear(),A.clear(),L.clear(),v.clear(),V.clear(),B.clear(),se.clear(),Ae.clear(),Re.clear(),J.clear(),Qe.length=0}}};var Ho=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var nr=new Set(Ho);var Xo=["none","agent","user"];var sr=new Set(Xo);var _n=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Tn=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],$o=(e,n)=>{n.style.colorScheme=e.mode;for(let[r,E]of _n)n.style.setProperty(r,e.tokens[E]);for(let[r,E,_]of Tn){let A=e.tokens[_]??"";n.style.setProperty(r,A),n.style.setProperty(E,A)}n.style.setProperty("font-family",e.tokens.font),n.style.setProperty("font-size","0.875rem"),n.style.setProperty("line-height","1.45"),n.style.setProperty("color",e.tokens.foreground)},Ut=(e,n)=>{if($o(e.theme,n),n.dataset)n.dataset.ocSurface=e.surface,n.dataset.ocTheme=e.theme.mode};var Sn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},f=(e,n)=>`var(--${e}, var(--oc-${Sn[e]}, ${n}))`,X=f("surface-background","transparent"),Ve=f("surface-elevated","transparent"),oe=f("surface-elevated-foreground","inherit"),M=f("surface-foreground","inherit"),O=f("surface-muted-foreground","gray"),fn=f("surface-muted","transparent"),j=f("interactive-border","currentColor"),U=f("interactive-hover","transparent"),W=f("interactive-active","transparent"),yt=f("interactive-selection","transparent"),Ct=f("interactive-selection-foreground","inherit"),H=f("primary","currentColor"),vt=f("primary-text","inherit"),Nt=f("error-text","inherit"),On=f("font-sans","inherit"),Mt=f("font-mono","monospace"),Ko=f("radius","9px"),Lt=`calc(${Ko} - 2px)`,Fo=`calc(${Ko} - 4px)`,h=(e,n,r="transparent")=>`color-mix(in srgb, ${e} ${n}%, ${r})`,Vo=`background-image: linear-gradient(${U}, ${U});`,wt=(e,n="0.5px")=>`box-shadow: inset 0 0 0 ${n} ${e}, var(--oc-sdk-field-lift);`,Pt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Bo="box-shadow: var(--oc-sdk-lit);",Gt=`inset 0 0.5px 0 0 ${h(M,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,hn=`
:root {
  --oc-sdk-edge: ${h(M,16)};
  --oc-sdk-field-bg: ${Ve};
  --oc-sdk-raised-bg: ${X};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${h(M,14)};
  --oc-sdk-field-bg: ${h(X,50,Ve)};
  --oc-sdk-raised-bg: ${Ve};
  --oc-sdk-field-lift: ${Gt};
  --oc-sdk-raised-lift: ${Gt};
  --oc-sdk-lit: ${Gt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Fe=(e)=>{let n=f(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${n}; --oc-sdk-tone-text: ${f(`${e}-text`,"inherit")}; }`},mn=`
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
`,jo=`${hn}
.oc-sdk { color: ${M}; font-family: ${On}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Vo} }
.oc-sdk-mono { font-family: ${Mt}; }
.oc-sdk-muted { color: ${O}; }
${Fe("success")}${Fe("warning")}${Fe("error")}${Fe("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${H}; --oc-sdk-tone-text: ${vt}; }

.oc-sdk-btn { border-radius: ${Lt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Fo}; }
.oc-sdk-btn[data-variant="default"] { color: ${vt}; background: ${h(H,10,X)}; border-color: ${h(H,12)}; ${Bo} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${h(H,16,X)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${h(H,22,X)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${fn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${oe}; ${Pt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${W}, ${W}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${U}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${W}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${f("status-error","red")}; color: ${Nt}; background: ${h("var(--oc-sdk-tone)",7,X)}; border-color: ${h("var(--oc-sdk-tone)",12)}; ${Bo} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${h("var(--oc-sdk-tone)",9,X)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${h("var(--oc-sdk-tone)",11,X)}; box-shadow: none; }

.oc-sdk-field-note { color: ${O}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Nt}; }
.oc-sdk-input { border-radius: ${Lt}; background: var(--oc-sdk-field-bg); color: ${oe}; ${wt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${O}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${wt(h(M,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${wt(f("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Mt}; }

.oc-sdk-search-icon { color: ${O}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search-clear { border-radius: ${Fo}; color: ${O}; }
.oc-sdk-search-clear:hover { background: ${U}; color: ${M}; }

.oc-sdk-trigger { border-radius: ${Lt}; background: var(--oc-sdk-raised-bg); color: ${oe}; ${Pt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${O}; }
.oc-sdk-trigger-chevron { color: ${O}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${oe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Ve}; background-clip: padding-box; color: ${oe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${U}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${yt}; color: ${Ct}; }
.oc-sdk-option-check { color: ${M}; }
.oc-sdk-option[data-destructive="true"] { color: ${Nt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${h(f("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${O}; }
.oc-sdk-popup-empty { color: ${O}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${j}; border-radius: 4px; color: ${M}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${h(M,60,j)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${j}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${X}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${H}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Vo} }
.oc-sdk-check-desc { color: ${O}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${h(M,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${O}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${M}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Ct}; background: ${yt}; border-color: ${j}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${oe}; background: var(--oc-sdk-raised-bg); ${Pt} }
.oc-sdk-tab-count { color: ${O}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${h(M,6)}; color: ${O}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${h("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${U}; }
.oc-sdk-row[aria-selected="true"] { background: ${yt}; color: ${Ct}; }
.oc-sdk-row-lead { font-family: ${Mt}; color: ${O}; }
.oc-sdk-row-sub { color: ${O}; }
.oc-sdk-row-meta { color: ${O}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${O}; }

.oc-sdk-empty-body { color: ${O}; }

.oc-sdk-spinner { color: ${O}; }
.oc-sdk-spinner-ring { border-color: ${j}; border-top-color: ${H}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${h("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${O}; }

.oc-sdk-separator { color: ${O}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${h(j,40)}; }

.oc-sdk-progress-label { color: ${O}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${h(M,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${H}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${f("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${f("success-text","inherit")}; }

.oc-sdk-text a { color: ${vt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${h(j,60)}; }
`,I=`
${ot}
${mn}
${jo}`;var Wo=()=>{try{let e=new URL(window.location.href);if(e.protocol==="http:"||e.protocol==="https:")return e.origin}catch{}return null},P=(e,n,r)=>{let E=document.createElement(e);if(n)E.className=n;if(r!==void 0)E.textContent=r;return E},zo=(e,n)=>{if(e instanceof a){if(e.code==="NO_SERVICE"||e.code==="NOT_GRANTED"||e.code==="SERVICE_FAILED")return n.serviceHint;if(e.code==="DISABLED")return n.disabled;if(e.code==="HOST_TIMEOUT")return n.reconnecting;return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)},Ht=(e)=>Math.round(e).toLocaleString(),ze=(e)=>`${(e/1000).toFixed(1)} s`;var bn=500,kn=0.98,In=1000,Ft={en:{live:"Live",lastTurn:"Last turn",session:"Session",chars:"Chars/s",ratio:"Tokens/char",unit:"tok/s",tokens:"tok",measuring:"measuring",noSession:"No session yet. The rate shows once this chat has one.",serviceHint:"The extension needs its local service and OpenCode access. Approve both in Settings → Extensions.",disabled:"The extension is paused in Settings → Extensions.",reconnecting:"Reconnecting to the event stream.",approvalNeeded:"Approve OpenCode access in Settings → Extensions to measure the rate.",liveTip:"Tokens per second over the last 5 seconds, estimated from streamed characters.",sessionTip:"Tokens the model generated in this session, output and reasoning together.",charsTip:"Streamed characters per second over the last 5 seconds, counting text, reasoning, and tool input. The live rate is computed from this measured value.",ratioTip:"Model tokens per streamed character, calibrated from finished model calls. The live rate is characters per second times this value.",generating:"Generating",paused:"paused",estimated:"Estimated from streamed characters."},ko:{live:"실시간",lastTurn:"지난 턴",session:"세션",chars:"초당 문자 수",ratio:"문자당 토큰",unit:"tok/s",tokens:"tok",measuring:"측정 중",noSession:"아직 세션이 없습니다. 챗에 세션이 생기면 속도를 표시합니다.",serviceHint:"이 확장은 로컬 서비스와 OpenCode 접근이 필요합니다. 설정 → Extensions에서 둘 다 승인해 주세요.",disabled:"설정 → Extensions에서 확장이 일시중지되었습니다.",reconnecting:"이벤트 스트림에 다시 연결하는 중입니다.",approvalNeeded:"설정 → Extensions에서 OpenCode 접근을 승인하면 속도를 측정합니다.",liveTip:"최근 5초 동안의 초당 토큰 수입니다. 스트리밍된 문자 수로 추정합니다.",sessionTip:"이 세션에서 모델이 생성한 토큰 수입니다. 출력과 추론을 합산합니다.",charsTip:"최근 5초 동안 스트리밍된 초당 문자 수입니다. 텍스트, 추론, 도구 입력을 모두 세며, 실시간 토큰 속도는 이 실측값으로 계산합니다.",ratioTip:"스트리밍된 문자 하나당 모델 토큰 수입니다. 끝난 모델 호출의 실제 토큰으로 보정하며, 실시간 값은 초당 문자 수에 이 값을 곱해 구합니다.",generating:"생성",paused:"대기",estimated:"스트리밍된 문자 수로 추정한 값입니다."}},he=It(),Je=document.querySelector("#root");if(!Je)throw Error("Missing #root");var me=(e)=>{let n=P("span","tps-what"),r=P("span","tps-value","—"),E=P("div","tps-line");return E.append(n,e,r),{row:E,label:n,value:r}},re=P("div","tps-note");re.hidden=!0;var Qo=P("div","tps-meter-fill"),Zo=P("div","tps-meter");Zo.append(Qo);var Te=me(Zo),Vt=P("span","tps-detail"),z=me(Vt),Se=me(P("span")),fe=me(P("span")),Oe=me(P("span")),qo=[Te.row,z.row,Se.row,fe.row,Oe.row];Je.append(re,...qo);var m=Ft.en,Kt=null,K=null,Bt="",Ye=null,_e=0,Xt=!1,Jo=!1,Un=()=>{Te.label.textContent=m.live,z.label.textContent=m.lastTurn,Se.label.textContent=m.session,fe.label.textContent=m.chars,Oe.label.textContent=m.ratio,Te.row.title=m.liveTip,Se.row.title=m.sessionTip,fe.row.title=m.charsTip,Oe.row.title=m.ratioTip},$t=(e,n,r=null,E="warning")=>{re.hidden=e===null,re.textContent=e??"",re.title=r??"",re.dataset.tone=E;for(let _ of qo)_.hidden=!n},yn=(e)=>{let n=e.lastTurn;if(!n)return"";let r=[`${m.generating} ${ze(n.activeMs)}`];if(n.pausedMs>=In)r.push(`${m.paused} ${ze(n.pausedMs)}`);let E=r.join(", ");return n.source==="estimate"?`${E}
${m.estimated}`:E},jt=(e)=>{let n=e&&Number.isFinite(e.tokensPerSecond)?e.tokensPerSecond:0;_e=Math.max(n,_e*kn);let r=_e>0.05?Math.min(1,n/_e):0;Qo.style.transform=`scaleX(${r.toFixed(4)})`,Te.value.textContent=e?`${n.toFixed(1)} ${m.unit}`:"—";let E=String(!(e?.busy&&e.active));Te.value.dataset.quiet=E;let _=e&&Number.isFinite(e.charsPerSecond)?e.charsPerSecond:0;fe.value.textContent=e?_.toFixed(1):"—",fe.value.dataset.quiet=E;let A=e?.lastTurn??null;if(e&&A){let v=A.source==="estimate"?"~":"";Vt.textContent=`${v}${Ht(A.tokens)} ${m.tokens} / ${ze(A.activeMs)}`,z.value.textContent=`${A.tokensPerSecond.toFixed(1)} ${m.unit}`,z.row.title=yn(e)}else Vt.textContent=e?.busy?m.measuring:"",z.value.textContent="—",z.row.title="";z.value.dataset.quiet=String(!A);let L=e?.sessionUsage??null;Se.value.textContent=L?`${Ht(L.generated)} ${m.tokens}`:"—",Se.value.dataset.quiet=String(!L),Oe.value.textContent=e?e.charsPerToken.toFixed(3):"—",Oe.value.dataset.quiet=String(!e)},Cn=()=>`${Kt??""}|${K??""}`,vn=async()=>{let e=Cn();if(e===Bt)return;let n=await he.serviceRequest({method:"POST",path:"/watch",body:JSON.stringify({origin:Kt,sessionId:K})});if(n.status>=400)throw Error(`HTTP ${n.status}`);Bt=e},en=async()=>{if(Xt)return;if(!K){$t(m.noSession,!1,null,"muted");return}Xt=!0;let e=K;try{await vn();let n=await he.serviceRequest({method:"GET",path:"/rate"});if(n.status>=400)throw Error(`HTTP ${n.status}`);let r=JSON.parse(n.body);if(e!==K)return;if(r.sessionId===null&&r.connection==="idle")Bt="";Ye=r,jt(r),$t(r.connection==="blocked"?m.approvalNeeded:r.connection==="error"?m.reconnecting:null,!0,r.error)}catch(n){$t(zo(n,m),Ye!==null)}finally{Xt=!1}},tn=(e)=>{if(e===K)return;K=e,Ye=null,_e=0,jt(null),en()},on=async()=>{if(!document.hidden)await en();window.setTimeout(()=>{on()},bn)},Yo=-1;new ResizeObserver(()=>{let e=Math.ceil(Je.getBoundingClientRect().height);if(e===Yo)return;Yo=e,he.setHeight(e).catch(()=>{return})}).observe(Je);he.onReady((e)=>{if(m=e.locale.toLowerCase().startsWith("ko")?Ft.ko:Ft.en,Ut(e,document.documentElement),Kt=Wo(),Un(),jt(Ye),!Jo){Jo=!0,K=e.session?.id??null,on();return}tn(e.session?.id??null)});he.onSession((e)=>{tn(e?.id??null)});})();
