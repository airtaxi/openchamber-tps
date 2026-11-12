(()=>{var p="openchamber.sdk",u=1;var nt=`
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
`;function so(e){let r=e.documentElement;if(r.hasAttribute("data-oc-scrollbar-activity"))return;r.setAttribute("data-oc-scrollbar-activity","");let n=new WeakMap;e.addEventListener("scroll",(E)=>{let _=E.target===e?r:E.target;if(!(_ instanceof Element))return;if(!_.hasAttribute("data-oc-scrolling"))_.setAttribute("data-oc-scrolling","");let A=n.get(_);if(A!==void 0)clearTimeout(A);n.set(_,setTimeout(()=>{n.delete(_),_.removeAttribute("data-oc-scrolling")},1000))},{capture:!0,passive:!0})}var nr=`(${so.toString()})(document);`;var st=128,it=65536;var Ue=128;var ye=65536;var lo=/^[a-z][a-z0-9-]{0,39}$/;var io=(e)=>Object(e)===e&&!Array.isArray(e),at=(e,r)=>Object.keys(e).every((n)=>r.includes(n)),ao=(e)=>String(e)===e&&e.length>=1&&e.length<=60,co=(e)=>String(e)===e&&e.length>=1&&e.length<=80,po=(e)=>{if(!Array.isArray(e)||e.length>4)return!1;let r=new Set;for(let n of e){if(!io(n)||!lo.test(n.id)||!ao(n.label))return!1;if(n.disabled!==void 0&&n.disabled!==!0&&n.disabled!==!1)return!1;if(r.has(n.id))return!1;if(r.add(n.id),n.kind==="button"){if(!at(n,["kind","id","label","disabled"]))return!1;continue}if(n.kind!=="select"||!at(n,["kind","id","label","value","options","disabled"]))return!1;if(!co(n.value)||!Array.isArray(n.options)||n.options.length<1||n.options.length>16)return!1;let E=new Set;for(let _ of n.options){if(!io(_)||!at(_,["value","label"])||!co(_.value)||!ao(_.label)||E.has(_.value))return!1;E.add(_.value)}if(!E.has(n.value))return!1}return!0};var uo=["{id}","{segment}","{segments+}"];var Xr=new Set(uo);var Eo=["turn-finished","turn-failed","permission-asked","question-asked"];var Fr=new Set(Eo);var Ce=20000000,ve=256;var ct=(e)=>("bytes"in e)?e.bytes.byteLength:e.content.length,_o=(e,r)=>{if(e.path!==r.path||e.readOnly!==r.readOnly)return!1;if(e.encoding==="text"||r.encoding==="text")return e.encoding==="text"&&r.encoding==="text"&&e.content===r.content;if(e.bytes.byteLength!==r.bytes.byteLength)return!1;for(let n=0;n<e.bytes.byteLength;n+=1)if(e.bytes[n]!==r.bytes[n])return!1;return!0};var To=/^[A-Za-z0-9_-]{1,80}$/;var So=["left","right","top","bottom"];var fo=(e,r=0,n={remaining:16000})=>{if(--n.remaining<0||r>=32)return!1;if(e===null)return!0;let E=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let _ of E)if(!fo(_,r+1,n))return!1;return!0},dt=(e)=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every((r)=>/^(0|[1-9]\d*)$/.test(r)&&Number(r)<e.length)&&e.every(dt);if(Object(e)===e){let r=Object.getPrototypeOf(e);return(r===null||r===Object.prototype)&&Object.values(e).every(dt)}return String(e)===e||Number.isFinite(e)},lt=(e)=>{try{if(String(e.id)!==e.id||!To.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!So.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!fo(e.data)||!dt(e.data))return!1;return JSON.stringify(e.data).length<=16000}catch{return!1}};var ho=["file","directory","other","missing"],ut=(e)=>Boolean(e&&"sessionId"in e),Et=(e)=>Boolean(e&&"sent"in e&&!("sessionId"in e));var mo=/^[0-9a-f]{7,64}$/i,_t=(e)=>mo.test(e),Ne=500,Me=32000,Ao=16000,Ro=128,xo=200,go=2000,bo=16000,ko=80,Io=200,Uo=16000;var yo=2000;var Tt=20000,Le=1024,we=2000000;var Pe=64000,Ge=8000,St=4000;var ft=960000;var Co=999,vo=1e4,ue=500,No=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Mo=["stopped","starting","ready","failed"],ir=new Set(No),Lo=(e)=>ir.has(e),wo=(e)=>e&&Lo(e)?e:"HOST_REJECTED",q=(e)=>{if(e===void 0)return!1;if(e===null||e===!0||e===!1)return!0;if(String(e)===e)return!0;if(Number(e)===e)return Number.isFinite(e);if(Array.isArray(e))return e.every(q);if(Object(e)===e)return Object.values(e).every(q);return!1},Po=(e)=>q(e)&&JSON.stringify(e).length<=Uo,Oo=(e)=>e?.trim().slice(0,Io)??"",ee=(e)=>{let r=e.id.trim().slice(0,Ro),n=e.title.trim().slice(0,xo),E=e.url.trim().slice(0,go),_=e.text?.trim().slice(0,bo),A=e.author?.trim().slice(0,ko),L=e.kind==="pull"?"pull":"issue",v={providerId:e.providerId.trim(),id:r,title:n||r,url:E,kind:L};if(_)v.text=_;if(A)v.author=A;if(L==="pull"){let V=Oo(e.branches?.head),B=Oo(e.branches?.base);if(V&&B)v.branches={head:V,base:B}}if(Po(e.data))v.data=e.data;return v},Ot=(e)=>{let r=ee(e);if(e.projectId)r.projectId=e.projectId;if(e.navigation)r.navigation=e.navigation;if(e.worktree)r.worktree=e.worktree;return r},ht=(e)=>{let r={text:e.text.trim().slice(0,Ao)};if(e.send)r.send=!0;return r},mt=(e)=>{if(e===null||!Number.isFinite(e))return null;return Math.min(Co,Math.max(0,Math.round(e)))},At=(e)=>{if(!Number.isFinite(e))return 0;return Math.min(vo,Math.max(0,Math.ceil(e)))};var te=(e)=>e.length>0&&e.length<=Le&&!e.includes("\x00")&&!e.includes("\\");var De=(e)=>{if(!e.startsWith("/")||e.includes("\x00")||e.includes("\\")||e.includes("://"))return!1;if(e.length>yo)return!1;return!e.split("/").some((n)=>n==="."||n==="..")},ar=new Set(Mo),Rt=(e)=>Boolean(e&&"status"in e&&ar.has(String(e.status))&&!("body"in e)),He=(e)=>Boolean(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),xt=(e)=>Boolean(e&&"content"in e&&String(e.content)===e.content),gt=(e)=>Boolean(e&&"written"in e&&e.written===!0),bt=(e)=>Boolean(e&&"entries"in e&&Array.isArray(e.entries)),cr=new Set(ho),kt=(e)=>Boolean(e&&"kind"in e&&"size"in e&&cr.has(String(e.kind))&&Number.isFinite(e.size)),It=(e)=>Boolean(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),dr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),lr=(e)=>Object(e)===e?e:null,pt=(e)=>String(e)===e&&e.length>0,pr=(e)=>{if(!pt(e.id))return null;if(e.ok===!0){let r={channel:p,v:u,type:"result",id:e.id,ok:!0};if(Object(e.payload)===e.payload)r.payload=e.payload;return r}if(e.ok===!1&&pt(e.error))return{channel:p,v:u,type:"result",id:e.id,ok:!1,error:e.error,code:wo(pt(e.code)?e.code:void 0)};return null},Ut=(e)=>{let r=lr(e);if(!r||r.channel!==p||r.v!==u)return null;if(r.type==="result")return pr(r);if(!dr.has(String(r.type))||Object(r.payload)!==r.payload)return null;return r};var Go=(e)=>("key"in e)&&("metaKey"in e)&&("ctrlKey"in e),ur=(e)=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s";class a extends Error{code;constructor(e,r){super(r);this.name="HostRequestError",this.code=e}}var Do=()=>Promise.reject(new a("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Xe=()=>Promise.reject(new a("BAD_PATH",`File path must be 1 to ${Le} characters without NUL or backslash.`)),$e=(e)=>{if(e===void 0)return;if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new a("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0},l=(e)=>(e.value+=1,`oc-${e.value}`),yt=(e={})=>{let r=e.target??("window"in globalThis?window:null);if(!r)throw new a("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let n=e.acceptSource??((t)=>t===r.parent),E=e.requestTimeoutMs??Tt,_=new Set,A=new Set,L=new Set,v=new Set,V=new Set,B=new Set,se=new Set,Ae=new Set,Re=new Set,J=new Set,qe=[],ie=null,ae=null,xe=new Set,ge=new Set,ce=null,de=null,et=!1,Y=new Map,Q=new Map,Z=new Map,G=!1,d={value:0},c=null,D=null,le=!1,pe=!1,Wt=null,zt=(t)=>{if(!t)return null;return{sessionId:t.id,phase:t.busy?"started":"completed"}},N=(t)=>{r.parent.postMessage(t,"*")},Jt=()=>{if(G||r.parent===r||J.size===0||c?.features?.lateGenerateResults!==!0)return;N({channel:p,v:u,type:"generate-late-listen"})},R=(t,o)=>{for(let s of t)try{s(o)}catch(i){console.error(i)}},Yt=(t)=>{if(!(t instanceof MessageEvent))return;if(!n(t.source))return;let o=Ut(t.data);if(!o)return;if(o.type==="workspace"){let i=Q.get(o.payload.subscriptionId);if(i)R([i],o.payload.snapshot);return}if(o.type==="shells"){let i=Z.get(o.payload.subscriptionId);if(i)R([i],o.payload.snapshot);return}if(o.type==="ready"){if(c=o.payload,D=zt(o.payload.session),R(_,o.payload),R(A,o.payload.directory),R(L,o.payload.session),D)R(v,D);R(V,o.payload.connection),R(B,o.payload.settings),R(se,o.payload.item),Jt();return}if(o.type==="generate-late"){if(J.size===0)qe.push(o.payload);else R(J,o.payload);return}if(o.type==="directory"){if(c)c={...c,directory:o.payload.directory};R(A,o.payload.directory);return}if(o.type==="session"){if(c)c={...c,session:o.payload.session};if(!o.payload.session)D=null;else if(D?.sessionId!==o.payload.session.id)D=zt(o.payload.session);R(L,o.payload.session);return}if(o.type==="session-lifecycle"){D=o.payload,R(v,o.payload);return}if(o.type==="connection"){if(c)c={...c,connection:o.payload.connection};R(V,o.payload.connection);return}if(o.type==="settings"){if(c)c={...c,settings:o.payload.settings};R(B,o.payload.settings);return}if(o.type==="item"){if(c)c={...c,item:o.payload.item};R(se,o.payload.item);return}if(o.type==="status-control-event"){R(Ae,o.payload);return}if(o.type==="popover-closed"){R(Re,o.payload);return}if(o.type==="action"){let i=(T)=>{if(!G)N({channel:p,v:u,type:"action-result",id:o.id,payload:T})},S=ae;if(!S){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>S(o.payload)).then(()=>i({ok:!0}),(T)=>{let b=(T instanceof Error?T.message:String(T)).trim();i({ok:!1,error:(b||"Action failed.").slice(0,ue)})});return}if(o.type==="file-open"){let i=o.payload;if(de&&_o(de,i))return;de=i,R(xe,o.payload);return}if(o.type==="file-saved"){R(ge,o.payload.version);return}if(o.type==="file-snapshot"){let i=(b)=>{if(!G)N({channel:p,v:u,type:"file-snapshot-result",id:o.id,payload:b})},S=(b)=>i({error:(b.trim()||"Could not read the edited file.").slice(0,ue)}),T=ce;if(!T){S("This extension does not edit files.");return}Promise.resolve().then(()=>T(o.payload.purpose)).then((b)=>{if(ct(b)>Ce){S(`The file is over ${Ce} ${"bytes"in b?"bytes":"characters"}.`);return}if(b.version.length>ve){S(`The snapshot version is over ${ve} characters.`);return}i({snapshot:"bytes"in b?{bytes:b.bytes,version:b.version}:{content:b.content,version:b.version}})},(b)=>S(b instanceof Error?b.message:String(b)));return}if(o.type==="resolve"){let i=(T)=>{N({channel:p,v:u,type:"resolve-result",id:o.id,payload:T})},S=ie;if(!S){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>S(o.payload)).then((T)=>i({item:T?ee(T):null}),(T)=>{let b=(T instanceof Error?T.message:String(T)).trim();i({error:(b||"Command failed.").slice(0,ue)})});return}let s=Y.get(o.id);if(!s)return;if(clearTimeout(s.timer),Y.delete(o.id),o.ok){s.resolve(o.payload);return}s.reject(new a(o.code,o.error))};r.addEventListener("message",Yt),N({channel:p,v:u,type:"hello"});let k=(t,o=E)=>{if(G||r.parent===r)return Promise.reject(new a("HOST_UNAVAILABLE","No host frame. This page is not in an iframe."));return new Promise((s,i)=>{let S=setTimeout(()=>{Y.delete(t.id),i(new a("HOST_TIMEOUT","Host did not answer in time."))},o);Y.set(t.id,{resolve:s,reject:i,timer:S}),N(t)})},x=(t)=>k(t).then(()=>{return}),g={channel:p,v:u},tt=(t)=>{if(!G&&r.parent!==r)N(t)},Qt=()=>tt({...g,type:"file-save"}),Zt=(t)=>{if(!Go(t)||!ur(t))return;t.preventDefault(),Qt()},qt=(t)=>{if(!Go(t)||t.key!=="Escape"||c?.surface!=="popover"||!c.popover)return;t.preventDefault(),ro(c.popover.id,"escape").catch(()=>{return})},be=()=>{let t=c?.surface==="popover"?c.popover:void 0;if(!t)return;let o=le||pe;if(Wt===o)return;Wt=o,no(t.id,o).catch(()=>{return})},ke=()=>{if(c?.surface!=="popover"||le)return;le=!0,be()},eo=(t)=>{if(c?.surface!=="popover"||t.relatedTarget!==null||!le)return;le=!1,be()},to=()=>{if(c?.surface!=="popover"||pe)return;pe=!0,be()},oo=()=>{if(c?.surface!=="popover"||!pe)return;pe=!1,be()},w=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new a("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},ot=async(t)=>{if(t.kind!=="projects")w(t.projectId);let o=await k({...g,type:"workspace-read",id:l(d),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new a("HOST_REJECTED","Host did not return workspace data.");return o},rt=async(t,o)=>{if(t.kind!=="projects")w(t.projectId);let s=l(d);Q.set(s,o);try{await x({...g,type:"workspace-subscribe",id:l(d),payload:{subscriptionId:s,query:t}})}catch(i){if(Q.delete(s),!G)N({...g,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Q.delete(s)||G)return;N({...g,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},rr=async(t,o)=>{if(t.kind==="session")w(t.sessionId);if(t.kind==="project")w(t.projectId);let s=l(d);Z.set(s,o);try{await x({...g,type:"shells-subscribe",id:l(d),payload:{subscriptionId:s,scope:t}})}catch(i){if(Z.delete(s),!G)N({...g,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}});throw i}return()=>{if(!Z.delete(s)||G)return;N({...g,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:s}})}},Ie=async(t)=>{if("key"in t&&(t.key.length===0||t.key.length>st))throw new a("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!q(t.value))throw new a("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>it)throw new a("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&c?.features?.deviceStorage!==!0)throw new a("UNSUPPORTED","This host does not support device storage.");let o=await k({...g,type:"storage",id:l(d),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new a("HOST_REJECTED","Host did not return storage data.");return o},ro=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):x({...g,type:"popover-close",id:l(d),payload:o?{id:t,reason:o}:{id:t}}),no=(t,o)=>c?.features?.popovers!==!0&&!(c?.surface==="popover"&&c.popover?.id===t)?Promise.reject(new a("UNSUPPORTED","This host does not support popovers.")):x({...g,type:"popover-anchor",id:l(d),payload:{id:t,active:o}});return r.addEventListener("keydown",qt,!0),r.addEventListener("pointerover",ke),r.addEventListener("pointermove",ke),r.addEventListener("pointerout",eo),r.addEventListener("focus",to),r.addEventListener("blur",oo),{onAction:(t)=>(ae=t,()=>{if(ae===t)ae=null}),listProjects:async()=>{let t=await ot({kind:"projects"});if(t.kind!=="projects")throw new a("HOST_REJECTED","Expected projects.");return t},listWorktrees:async(t)=>{let o=await ot({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new a("HOST_REJECTED","Expected worktrees.");return o},listSessions:async(t)=>{let o=await ot({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new a("HOST_REJECTED","Expected sessions.");return o},onProjects:(t)=>rt({kind:"projects"},(o)=>{if(o.kind==="projects")t(o)}),onWorktrees:(t,o)=>rt({kind:"worktrees",projectId:t},(s)=>{if(s.kind==="worktrees")o(s)}),onSessions:(t,o)=>rt({kind:"sessions",projectId:t},(s)=>{if(s.kind==="sessions")o(s)}),onRunningShells:(t,o)=>rr(t,o),readShellOutput:async(t,o)=>{w(t,Ue);let s=o?.cursor;if(s!==void 0&&(!Number.isInteger(s)||s<0))throw new a("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>ye))throw new a("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${ye}.`);let T=await k({...g,type:"shell-output",id:l(d),payload:{shellId:t,cursor:s,tailBytes:i}});if(!T||typeof T.output!=="string"||!Number.isFinite(T.cursor))throw new a("HOST_REJECTED","Host did not return shell output.");return T},stopShell:async(t)=>{if(w(t,Ue),(await k({...g,type:"shell-stop",id:l(d),payload:{shellId:t}}))?.stopped!==!0)throw new a("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async(t)=>{w(t),await x({...g,type:"open-session",id:l(d),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let s=$e(o),i={op:"get",key:t};if(s)i.scope=s;let S=await Ie(i);return S.op==="get"&&S.found?S.value:void 0},set:async(t,o,s)=>{let i=$e(s),S={op:"set",key:t,value:o};if(i)S.scope=i;await Ie(S)},delete:async(t,o)=>{let s=$e(o),i={op:"delete",key:t};if(s)i.scope=s;await Ie(i)},keys:async(t)=>{let o=$e(t),s={op:"keys"};if(o)s.scope=o;let i=await Ie(s);if(i.op!=="keys")throw new a("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:(t)=>{if(_.add(t),c)t(c);return()=>{_.delete(t)}},onDirectory:(t)=>{if(A.add(t),c)t(c.directory);return()=>{A.delete(t)}},onSession:(t)=>{if(L.add(t),c)t(c.session);return()=>{L.delete(t)}},onSessionLifecycle:(t)=>{if(v.add(t),D)t(D);return()=>{v.delete(t)}},onConnection:(t)=>{if(V.add(t),c)t(c.connection);return()=>{V.delete(t)}},onSettings:(t)=>{if(B.add(t),c)t(c.settings);return()=>{B.delete(t)}},onItem:(t)=>{if(se.add(t),c)t(c.item);return()=>{se.delete(t)}},onStatusControl:(t)=>(Ae.add(t),()=>{Ae.delete(t)}),onPopoverClosed:(t)=>(Re.add(t),()=>{Re.delete(t)}),setStatusControls:(t)=>{if(c?.features?.statusControls!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support status controls."));if(!po(t))return Promise.reject(new a("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options."));return x({...g,type:"status-controls",id:l(d),payload:{controls:t}})},openPopover:(t)=>{if(c?.features?.popovers!==!0)return Promise.reject(new a("UNSUPPORTED","This host does not support popovers."));if(!lt(t))return Promise.reject(new a("HOST_REJECTED","Popover requests need bounded geometry and JSON data."));return x({...g,type:"popover-open",id:l(d),payload:t})},closePopover:ro,setPopoverAnchorActive:no,onResolve:(t)=>(ie=t,()=>{if(ie===t)ie=null}),toast:(t)=>{let o=t.message.trim();if(!o||o.length>Ne)return Promise.reject(new a("HOST_REJECTED",`Toast message must contain 1 to ${Ne} characters.`));if(t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Me))return Promise.reject(new a("HOST_REJECTED",`Toast copy text must contain 1 to ${Me} characters.`));return x({channel:p,v:u,type:"toast",id:l(d),payload:{...t,message:o}})},openUrl:(t)=>x({channel:p,v:u,type:"open-url",id:l(d),payload:{url:t}}),openCommit:(t)=>_t(t)?x({channel:p,v:u,type:"open-commit",id:l(d),payload:{sha:t}}):Promise.reject(new a("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:(t)=>x({channel:p,v:u,type:"open-surface",id:l(d),payload:{surfaceId:t}}),writeClipboard:(t)=>x({channel:p,v:u,type:"clipboard-write",id:l(d),payload:{text:t}}),compose:(t)=>x({channel:p,v:u,type:"compose",id:l(d),payload:t}),attach:(t)=>x({channel:p,v:u,type:"attach",id:l(d),payload:ee(t)}),startSession:async(t)=>{if(t.projectId!==void 0)w(t.projectId);let o=t.worktree;if(o&&o!==!0)if(o.kind==="existing")w(o.directory);else{if(o.name!==void 0)w(o.name,200);if(o.baseBranch!==void 0)w(o.baseBranch,200)}let s=await k({channel:p,v:u,type:"start-session",id:l(d),payload:Ot(t)},e.requestTimeoutMs??180000);if(!ut(s))throw new a("HOST_REJECTED","Host did not return a session.");return s},prompt:(t)=>k({channel:p,v:u,type:"prompt",id:l(d),payload:ht(t)}).then((o)=>{if(!Et(o))throw new a("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:(t)=>x({channel:p,v:u,type:"session-link",id:l(d),payload:ee(t)}),close:()=>x({channel:p,v:u,type:"close",id:l(d)}),oauthStart:()=>x({channel:p,v:u,type:"oauth-start",id:l(d)}),oauthDisconnect:()=>x({channel:p,v:u,type:"oauth-disconnect",id:l(d)}),request:(t)=>(De(t.path)?k({channel:p,v:u,type:"request",id:l(d),payload:t}):Do()).then((o)=>{if(!He(o))throw new a("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:(t)=>(De(t.path)?k({channel:p,v:u,type:"service-request",id:l(d),payload:t}):Do()).then((o)=>{if(!He(o))throw new a("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>k({channel:p,v:u,type:"service-status",id:l(d)}).then((t)=>{if(!Rt(t))throw new a("HOST_REJECTED","Host did not return service status.");return t}),readFile:(t)=>(te(t)?k({channel:p,v:u,type:"file-read",id:l(d),payload:{path:t}}):Xe()).then((o)=>{if(!xt(o))throw new a("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>{if(!te(t))return Xe();if(o.length>we)return Promise.reject(new a("FILE_TOO_LARGE",`Content is over ${we} characters.`));return k({channel:p,v:u,type:"file-write",id:l(d),payload:{path:t,content:o}}).then((s)=>{if(!gt(s))throw new a("HOST_REJECTED","Host did not confirm the write.");return s})},listDir:(t)=>(te(t)?k({channel:p,v:u,type:"file-list",id:l(d),payload:{path:t}}):Xe()).then((o)=>{if(!bt(o))throw new a("HOST_REJECTED","Host did not return directory entries.");return o}),stat:(t)=>(te(t)?k({channel:p,v:u,type:"file-stat",id:l(d),payload:{path:t}}):Xe()).then((o)=>{if(!kt(o))throw new a("HOST_REJECTED","Host did not return file status.");return o}),generate:(t)=>{let o=t.prompt.trim(),s=t.system?.trim();if(o.length===0||o.length>Pe)return Promise.reject(new a("HOST_REJECTED",`Prompt must be 1 to ${Pe} characters.`));if(s!==void 0&&(s.length===0||s.length>Ge))return Promise.reject(new a("HOST_REJECTED",`System prompt must be 1 to ${Ge} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(St,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new a("HOST_REJECTED","maxOutputTokens must be a number."));let S={prompt:o};if(s!==void 0)S.system=s;if(i!==void 0)S.maxOutputTokens=i;return k({channel:p,v:u,type:"generate",id:l(d),payload:S},e.requestTimeoutMs??ft).then((T)=>{if(!It(T))throw new a("HOST_REJECTED","Host did not return generated text.");return T})},onLateGenerateResult:(t)=>{J.add(t);for(let o of qe.splice(0))R([t],o);return Jt(),()=>{J.delete(t)}},setBadge:(t)=>x({channel:p,v:u,type:"badge",id:l(d),payload:{count:mt(t)}}),setHeight:(t)=>x({channel:p,v:u,type:"resize",id:l(d),payload:{height:At(t)}}),onFileOpen:(t)=>{if(xe.add(t),!et)et=!0,r.addEventListener("keydown",Zt,!0);if(de)t(de);return()=>{xe.delete(t)}},onFileSnapshot:(t)=>(ce=t,()=>{if(ce===t)ce=null}),onFileSaved:(t)=>(ge.add(t),()=>{ge.delete(t)}),reportFileChange:(t)=>tt({...g,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Qt,reportFileUnsupported:()=>tt({...g,type:"file-unsupported"}),dispose:()=>{for(let t of Q.keys())N({...g,type:"workspace-unsubscribe",id:l(d),payload:{subscriptionId:t}});Q.clear();for(let t of Z.keys())N({...g,type:"shells-unsubscribe",id:l(d),payload:{subscriptionId:t}});if(Z.clear(),G=!0,ie=null,ae=null,ce=null,xe.clear(),ge.clear(),et)r.removeEventListener("keydown",Zt,!0);r.removeEventListener("message",Yt),r.removeEventListener("keydown",qt,!0),r.removeEventListener("pointerover",ke),r.removeEventListener("pointermove",ke),r.removeEventListener("pointerout",eo),r.removeEventListener("focus",to),r.removeEventListener("blur",oo);for(let t of Y.values())clearTimeout(t.timer),t.reject(new a("HOST_UNAVAILABLE","Host client was disposed."));Y.clear(),_.clear(),A.clear(),L.clear(),v.clear(),V.clear(),B.clear(),se.clear(),Ae.clear(),Re.clear(),J.clear(),qe.length=0}}};var Ho=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var on=new Set(Ho);var Xo=["none","agent","user"];var nn=new Set(Xo);var Er=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],_r=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],$o=(e,r)=>{r.style.colorScheme=e.mode;for(let[n,E]of Er)r.style.setProperty(n,e.tokens[E]);for(let[n,E,_]of _r){let A=e.tokens[_]??"";r.style.setProperty(n,A),r.style.setProperty(E,A)}r.style.setProperty("font-family",e.tokens.font),r.style.setProperty("font-size","0.875rem"),r.style.setProperty("line-height","1.45"),r.style.setProperty("color",e.tokens.foreground)},Ct=(e,r)=>{if($o(e.theme,r),r.dataset)r.dataset.ocSurface=e.surface,r.dataset.ocTheme=e.theme.mode};var Tr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},f=(e,r)=>`var(--${e}, var(--oc-${Tr[e]}, ${r}))`,X=f("surface-background","transparent"),Ve=f("surface-elevated","transparent"),oe=f("surface-elevated-foreground","inherit"),M=f("surface-foreground","inherit"),O=f("surface-muted-foreground","gray"),Sr=f("surface-muted","transparent"),j=f("interactive-border","currentColor"),U=f("interactive-hover","transparent"),W=f("interactive-active","transparent"),vt=f("interactive-selection","transparent"),Nt=f("interactive-selection-foreground","inherit"),H=f("primary","currentColor"),Mt=f("primary-text","inherit"),Lt=f("error-text","inherit"),fr=f("font-sans","inherit"),wt=f("font-mono","monospace"),Ko=f("radius","9px"),Pt=`calc(${Ko} - 2px)`,Fo=`calc(${Ko} - 4px)`,h=(e,r,n="transparent")=>`color-mix(in srgb, ${e} ${r}%, ${n})`,Vo=`background-image: linear-gradient(${U}, ${U});`,Gt=(e,r="0.5px")=>`box-shadow: inset 0 0 0 ${r} ${e}, var(--oc-sdk-field-lift);`,Dt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Bo="box-shadow: var(--oc-sdk-lit);",Ht=`inset 0 0.5px 0 0 ${h(M,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Or=`
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
  --oc-sdk-field-lift: ${Ht};
  --oc-sdk-raised-lift: ${Ht};
  --oc-sdk-lit: ${Ht};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Fe=(e)=>{let r=f(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${r}; --oc-sdk-tone-text: ${f(`${e}-text`,"inherit")}; }`},hr=`
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
`,jo=`${Or}
.oc-sdk { color: ${M}; font-family: ${fr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Vo} }
.oc-sdk-mono { font-family: ${wt}; }
.oc-sdk-muted { color: ${O}; }
${Fe("success")}${Fe("warning")}${Fe("error")}${Fe("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${H}; --oc-sdk-tone-text: ${Mt}; }

.oc-sdk-btn { border-radius: ${Pt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Fo}; }
.oc-sdk-btn[data-variant="default"] { color: ${Mt}; background: ${h(H,10,X)}; border-color: ${h(H,12)}; ${Bo} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${h(H,16,X)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${h(H,22,X)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Sr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${oe}; ${Dt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${W}, ${W}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${U}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${W}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${f("status-error","red")}; color: ${Lt}; background: ${h("var(--oc-sdk-tone)",7,X)}; border-color: ${h("var(--oc-sdk-tone)",12)}; ${Bo} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${h("var(--oc-sdk-tone)",9,X)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${h("var(--oc-sdk-tone)",11,X)}; box-shadow: none; }

.oc-sdk-field-note { color: ${O}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Lt}; }
.oc-sdk-input { border-radius: ${Pt}; background: var(--oc-sdk-field-bg); color: ${oe}; ${Gt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${O}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Gt(h(M,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Gt(f("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${wt}; }

.oc-sdk-search-icon { color: ${O}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search-clear { border-radius: ${Fo}; color: ${O}; }
.oc-sdk-search-clear:hover { background: ${U}; color: ${M}; }

.oc-sdk-trigger { border-radius: ${Pt}; background: var(--oc-sdk-raised-bg); color: ${oe}; ${Dt} transition: background 150ms ease-out; }
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
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${vt}; color: ${Nt}; }
.oc-sdk-option-check { color: ${M}; }
.oc-sdk-option[data-destructive="true"] { color: ${Lt}; }
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
.oc-sdk-tab[aria-selected="true"] { color: ${Nt}; background: ${vt}; border-color: ${j}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${oe}; background: var(--oc-sdk-raised-bg); ${Dt} }
.oc-sdk-tab-count { color: ${O}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${h(M,6)}; color: ${O}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${h("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${U}; }
.oc-sdk-row[aria-selected="true"] { background: ${vt}; color: ${Nt}; }
.oc-sdk-row-lead { font-family: ${wt}; color: ${O}; }
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

.oc-sdk-text a { color: ${Mt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${h(j,60)}; }
`,I=`
${nt}
${hr}
${jo}`;var Wo=()=>{try{let e=new URL(window.location.href);if(e.protocol==="http:"||e.protocol==="https:")return e.origin}catch{}return null},P=(e,r,n)=>{let E=document.createElement(e);if(r)E.className=r;if(n!==void 0)E.textContent=n;return E},zo=(e,r)=>{if(e instanceof a){if(e.code==="NO_SERVICE"||e.code==="NOT_GRANTED"||e.code==="SERVICE_FAILED")return r.serviceHint;if(e.code==="DISABLED")return r.disabled;if(e.code==="HOST_TIMEOUT")return r.reconnecting;return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)},$t=(e)=>Math.round(e).toLocaleString(),ze=(e)=>`${(e/1000).toFixed(1)} s`;var gr=500,br=0.98,kr=1000,Vt={en:{live:"Live",lastTurn:"Last turn",session:"Session",chars:"Chars/s",ratio:"Tokens/char",unit:"tok/s",tokens:"tok",measuring:"measuring",noSession:"No session yet. The rate shows once this chat has one.",serviceHint:"The extension needs its local service. Approve it in Settings → Extensions.",disabled:"The extension is paused in Settings → Extensions.",noOrigin:"This surface cannot reach the OpenChamber server (relay or embedded view).",reconnecting:"Reconnecting to the event stream.",liveTip:"Tokens per second over the last 5 seconds, estimated from streamed characters.",sessionTip:"Tokens the model generated in this session, output and reasoning together.",charsTip:"Streamed characters per second over the last 5 seconds, counting text, reasoning, and tool input. The live rate is computed from this measured value.",ratioTip:"Model tokens per streamed character, calibrated from finished model calls. The live rate is characters per second times this value.",generating:"Generating",paused:"paused",estimated:"Estimated from streamed characters."},ko:{live:"실시간",lastTurn:"지난 턴",session:"세션",chars:"초당 문자 수",ratio:"문자당 토큰",unit:"tok/s",tokens:"tok",measuring:"측정 중",noSession:"아직 세션이 없습니다. 챗에 세션이 생기면 속도를 표시합니다.",serviceHint:"이 확장은 로컬 서비스가 필요합니다. 설정 → Extensions에서 승인해 주세요.",disabled:"설정 → Extensions에서 확장이 일시중지되었습니다.",noOrigin:"이 화면에서는 OpenChamber 서버에 접근할 수 없습니다(릴레이 또는 임베드 뷰).",reconnecting:"이벤트 스트림에 다시 연결하는 중입니다.",liveTip:"최근 5초 동안의 초당 토큰 수입니다. 스트리밍된 문자 수로 추정합니다.",sessionTip:"이 세션에서 모델이 생성한 토큰 수입니다. 출력과 추론을 합산합니다.",charsTip:"최근 5초 동안 스트리밍된 초당 문자 수입니다. 텍스트, 추론, 도구 입력을 모두 세며, 실시간 토큰 속도는 이 실측값으로 계산합니다.",ratioTip:"스트리밍된 문자 하나당 모델 토큰 수입니다. 끝난 모델 호출의 실제 토큰으로 보정하며, 실시간 값은 초당 문자 수에 이 값을 곱해 구합니다.",generating:"생성",paused:"대기",estimated:"스트리밍된 문자 수로 추정한 값입니다."}},he=yt(),Ye=document.querySelector("#root");if(!Ye)throw Error("Missing #root");var me=(e)=>{let r=P("span","tps-what"),n=P("span","tps-value","—"),E=P("div","tps-line");return E.append(r,e,n),{row:E,label:r,value:n}},ne=P("div","tps-note");ne.hidden=!0;var Qo=P("div","tps-meter-fill"),Zo=P("div","tps-meter");Zo.append(Qo);var Te=me(Zo),Bt=P("span","tps-detail"),z=me(Bt),Se=me(P("span")),fe=me(P("span")),Oe=me(P("span")),qo=[Te.row,z.row,Se.row,fe.row,Oe.row];Ye.append(ne,...qo);var m=Vt.en,Ze=null,K=null,Kt="",Qe=null,_e=0,Ft=!1,Jo=!1,Ir=()=>{Te.label.textContent=m.live,z.label.textContent=m.lastTurn,Se.label.textContent=m.session,fe.label.textContent=m.chars,Oe.label.textContent=m.ratio,Te.row.title=m.liveTip,Se.row.title=m.sessionTip,fe.row.title=m.charsTip,Oe.row.title=m.ratioTip},Je=(e,r,n=null,E="warning")=>{ne.hidden=e===null,ne.textContent=e??"",ne.title=n??"",ne.dataset.tone=E;for(let _ of qo)_.hidden=!r},Ur=(e)=>{let r=e.lastTurn;if(!r)return"";let n=[`${m.generating} ${ze(r.activeMs)}`];if(r.pausedMs>=kr)n.push(`${m.paused} ${ze(r.pausedMs)}`);let E=n.join(", ");return r.source==="estimate"?`${E}
${m.estimated}`:E},jt=(e)=>{let r=e&&Number.isFinite(e.tokensPerSecond)?e.tokensPerSecond:0;_e=Math.max(r,_e*br);let n=_e>0.05?Math.min(1,r/_e):0;Qo.style.transform=`scaleX(${n.toFixed(4)})`,Te.value.textContent=e?`${r.toFixed(1)} ${m.unit}`:"—";let E=String(!(e?.busy&&e.active));Te.value.dataset.quiet=E;let _=e&&Number.isFinite(e.charsPerSecond)?e.charsPerSecond:0;fe.value.textContent=e?_.toFixed(1):"—",fe.value.dataset.quiet=E;let A=e?.lastTurn??null;if(e&&A){let v=A.source==="estimate"?"~":"";Bt.textContent=`${v}${$t(A.tokens)} ${m.tokens} / ${ze(A.activeMs)}`,z.value.textContent=`${A.tokensPerSecond.toFixed(1)} ${m.unit}`,z.row.title=Ur(e)}else Bt.textContent=e?.busy?m.measuring:"",z.value.textContent="—",z.row.title="";z.value.dataset.quiet=String(!A);let L=e?.sessionUsage??null;Se.value.textContent=L?`${$t(L.generated)} ${m.tokens}`:"—",Se.value.dataset.quiet=String(!L),Oe.value.textContent=e?e.charsPerToken.toFixed(3):"—",Oe.value.dataset.quiet=String(!e)},yr=()=>`${Ze??""}|${K??""}`,Cr=async()=>{let e=yr();if(e===Kt)return;let r=await he.serviceRequest({method:"POST",path:"/watch",body:JSON.stringify({origin:Ze,sessionId:K})});if(r.status>=400)throw Error(`HTTP ${r.status}`);Kt=e},er=async()=>{if(Ft)return;if(!Ze){Je(m.noOrigin,!1);return}if(!K){Je(m.noSession,!1,null,"muted");return}Ft=!0;let e=K;try{await Cr();let r=await he.serviceRequest({method:"GET",path:"/rate"});if(r.status>=400)throw Error(`HTTP ${r.status}`);let n=JSON.parse(r.body);if(e!==K)return;if(n.sessionId===null&&n.connection==="idle")Kt="";Qe=n,jt(n),Je(n.connection==="error"?m.reconnecting:null,!0,n.error)}catch(r){Je(zo(r,m),Qe!==null)}finally{Ft=!1}},tr=(e)=>{if(e===K)return;K=e,Qe=null,_e=0,jt(null),er()},or=async()=>{if(!document.hidden)await er();window.setTimeout(()=>{or()},gr)},Yo=-1;new ResizeObserver(()=>{let e=Math.ceil(Ye.getBoundingClientRect().height);if(e===Yo)return;Yo=e,he.setHeight(e).catch(()=>{return})}).observe(Ye);he.onReady((e)=>{if(m=e.locale.toLowerCase().startsWith("ko")?Vt.ko:Vt.en,Ct(e,document.documentElement),Ze=Wo(),Ir(),jt(Qe),!Jo){Jo=!0,K=e.session?.id??null,or();return}tr(e.session?.id??null)});he.onSession((e)=>{tr(e?.id??null)});})();
