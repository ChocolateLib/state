(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerpolicy&&(n.referrerPolicy=a.referrerpolicy),a.crossorigin==="use-credentials"?n.credentials="include":a.crossorigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();class O{constructor(){this._subscribers=[]}subscribe(e,t){if(this._subscribers.push(e),t)try{this.then(e)}catch{console.warn("Failed while calling update function",this,e)}return e}unsubscribe(e){const t=this._subscribers.indexOf(e);return t!=-1?this._subscribers.splice(t,1):console.warn("Subscriber not found with state",this,e),e}_updateSubscribers(e){for(let t=0,s=this._subscribers.length;t<s;t++)try{this._subscribers[t](e)}catch(a){console.warn("Failed while calling subscribers ",a,this,this._subscribers[t])}}}class J extends O{constructor(e){super(),this._value=e}setAndUpdate(e){this._value=e,this._updateSubscribers(e)}async then(e){return await e(this._value)}set(e){this._setter&&this._value!==e&&this._setter(e,this.setAndUpdate.bind(this))}check(e){return this._check?this._check(e):void 0}limit(e){return this._limit?this._limit(e):e}}const o=(r,e,t,s)=>{let a=new J(r);return e&&(a._setter=e===!0?a.setAndUpdate:e),t&&(a._check=t),s&&(a._limit=s),{state:a,set:a.setAndUpdate.bind(a)}};class j extends O{constructor(e,t){super(),this._valid=!1,this._states=[],this._stateBuffers=[],this._stateSubscribers=[],this._calculatingValue=!1,this._getter=e,t&&(this._states=[...t])}async _calculate(){await void 0,this._buffer=this._getter(this._stateBuffers),this._valid=!0,this._updateSubscribers(this._buffer),this._calculatingValue=!1}_connect(){for(let e=0;e<this._states.length;e++)this._stateSubscribers[e]=this._states[e].subscribe(t=>{this._stateBuffers[e]=t,this._calculatingValue||(this._calculatingValue=!0,this._calculate())},!0)}_disconnect(){for(let e=0;e<this._states.length;e++)this._states[e].unsubscribe(this._stateSubscribers[e]);this._stateSubscribers=[]}setStates(...e){this._subscribers.length?(this._disconnect(),this._states=[...e],this._connect()):this._states=[...e]}subscribe(e,t){return this._subscribers.length===0?(this._subscribers.push(e),this._connect(),e):super.subscribe(e,t)}unsubscribe(e){return this._subscribers.length===1&&this._disconnect(),super.unsubscribe(e)}async then(e){return this._valid?e(this._buffer):this._states?e(this._getter(await Promise.all(this._states))):e(void 0)}}const q=(r,...e)=>{let t=new j(r,e);return{derived:t,setStates:t.setStates.bind(t)}};class R{constructor(e,t,s){this.type=e,this.target=t,this.data=s}}class Y{constructor(){this.eventHandler_ListenerStorage={}}on(e,t){let s=this.eventHandler_ListenerStorage[e];return s?s.indexOf(t)==-1?s.push(t):console.warn("Listener already in handler"):this.eventHandler_ListenerStorage[e]=[t],t}once(e,t){return this.on(e,function(s){return t(s),!0}),t}off(e,t){let s=this.eventHandler_ListenerStorage[e];if(s){let a=s.indexOf(t);a!=-1?s.splice(a,1):console.warn("Listener not in handler")}return t}emit(e,t){let s=this.eventHandler_ListenerStorage[e];if(s&&s.length>0){let a=Object.freeze(new R(e,this.target||this,t));s.length>1&&(s=[...s]);for(let n=0,c=s.length;n<c;n++)try{s[n](a)&&(s.splice(n,1),c--,n--)}catch(d){console.warn("Failed while dispatching event",d)}}}clear(e){this.eventHandler_ListenerStorage[e]=[]}inUse(e){var t;return Boolean((t=this.eventHandler_ListenerStorage[e])==null?void 0:t.length)}has(e,t){var s;return Boolean(((s=this.eventHandler_ListenerStorage[e])==null?void 0:s.indexOf(t))!==-1)}amount(e){var t;return((t=this.eventHandler_ListenerStorage[e])==null?void 0:t.length)||0}get eventsUserOnly(){return this}}class ${constructor(e){this.main=e,this._documents=[e],this._events=new Y,this._events.target=this,this.events=this._events.eventsUserOnly}forDocuments(e){for(let t=0;t<this._documents.length;t++)e(this._documents[t])}get documents(){return[...this._documents]}registerDocument(e,t){if(this._documents.includes(e))return console.warn("Document registered twice");if(this._documents.push(e),t){let s=this.main.head.children;for(let a=0;a<s.length;a++)switch(s[a].nodeName){case"LINK":if(s[a].rel!=="stylesheet")break;case"STYLE":e.head.appendChild(s[a].cloneNode(!0));break}}this._events.emit("added",e)}deregisterDocument(e){let t=this._documents.indexOf(e);if(t==-1)return console.warn("Document not registered");if(this._documents[t]===this.main)return console.warn("Main document cannot be removed");this._documents.splice(t,1),this._events.emit("removed",e)}}const Q=r=>({handler:new $(r)});let P={},W=(r,e,t)=>(P[r]=new b(r,e,t),P[r]);class b{constructor(e,t,s){this.settings={},this.subGroups={},this.pathID=e,this.name=t,this.description=s}makeSubGroup(e,t,s){if(e in this.subGroups){console.warn("Sub group already registered "+e);return}else return this.subGroups[e]=new b(this.pathID+"/"+e,t,s)}addState(e,t,s){if(e in this.settings)throw new Error("Settings already registered "+e);let a=localStorage[this.pathID+"/"+e];a&&s(JSON.parse(a)),t.subscribe(n=>{localStorage[this.pathID+"/"+e]=JSON.stringify(n)},!a),this.settings[e]=t}}var h=(r=>(r.Light="light",r.Dark="dark",r))(h||{});let u=[],I={},z=(r,e)=>{let t;return function(){return t||(t=new DOMParser().parseFromString(e,"image/svg+xml").firstChild,t.setAttribute("icon",r)),t.cloneNode(!0)}},X=z("material_device_dark_mode_rounded",'<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><rect fill="none" height="24" width="24"/><path d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"/></svg>'),Z=z("material_device_light_mode_rounded",'<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><rect fill="none" height="24" width="24"/><path d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"/></svg>'),A=W("@chocolatelibui/theme","Theme/UI","Settings for UI elements and and color themes");h.Light+"",h.Dark+"";class ee{constructor(e,t="",s="",a=""){this._autoInputListenerEvery=i=>{switch(i.pointerType){case"mouse":this.inputMode.set("mouse");break;case"pen":this.inputMode.set("pen");break;default:case"touch":this.inputMode.set("touch");break}};let n=t?A.makeSubGroup(t,s,a):A;if(!n)throw new Error("Creating settings group for theme engine failed");let{state:c,set:d}=o("thin",(i,oe)=>{this.applyScrollbar(i),d(i)});this.scrollbar=c,n.addState("scrollbar",c,d);let{state:_,set:f}=o("all",i=>{this.applyAnimation(i),f(i)});this.animations=_,n.addState("animations",_,f);let{state:y,set:g}=o(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?h.Dark:h.Light,i=>{this.applyTheme(i),g(i)});this.theme=y,n.addState("theme",y,g);let{state:w,set:T}=o("os",i=>{this.applyTheme(i),T(i)});this.autoThemeMode=w,n.addState("autoTheme",w,T);let{state:M,set:D}=o("mouse",async i=>{switch(i){case"mouse":this.scale.set(await this.scaleMouse);break;case"pen":this.scale.set(await this.scalePen);break;case"touch":this.scale.set(await this.scaleTouch);break}this.applyInput(i),D(i)});this.inputMode=M,n.addState("inputMode",M,D);let{state:x,set:L}=o("every",i=>{this.applyAutoInput(i),L(i)});this.autoInputMode=x,n.addState("autoTouch",x,L);let{state:C,set:H}=o(1,async i=>{switch(this._scale=i*16,this.applyScale(i),await this.inputMode){case"mouse":this.scaleMouse.set(i);break;case"pen":this.scalePen.set(i);break;case"touch":this.scaleTouch.set(i);break}H(i)});this.scale=C;let{state:U,set:v}=o(1,async i=>{await this.inputMode==="mouse"&&l(i),v(i)});this.scaleMouse=U,n.addState("scaleMouse",this.scaleMouse,v);let{state:B,set:k}=o(1,async i=>{await this.inputMode==="pen"&&l(i),k(i)});this.scalePen=B,n.addState("scalePen",this.scalePen,k);let{state:G,set:E}=o(1,async i=>{await this.inputMode==="mouse"&&l(i),E(i)});this.scaleTouch=G,n.addState("scaleTouch",this.scaleTouch,E);let{state:F,set:l}=o(1,async i=>{switch(this.applyTextScale(i),await this.inputMode){case"mouse":p(i);break;case"pen":m(i);break;case"touch":S(i);break}l(i)});this.textScale=F;let{state:N,set:p}=o(1,async i=>{await this.inputMode==="mouse"&&l(i),p(i)});this.textScaleMouse=N,n.addState("textScaleMouse",this.textScaleMouse,p);let{state:V,set:m}=o(1,async i=>{await this.inputMode==="pen"&&l(i),m(i)});this.textScalePen=V,n.addState("textScalePen",this.textScalePen,m);let{state:K,set:S}=o(1,async i=>{await this.inputMode==="touch"&&l(i),S(i)});this.textScaleTouch=K,n.addState("textScaleTouch",this.textScaleTouch,S),u.push(this),this._handler=e,this._listener=this._handler.events.on("added",i=>{this.applyAllToDoc(i.data)}),e.forDocuments(i=>{this.applyAllToDoc(i)})}destructor(){this._handler.events.off("added",this._listener);let e=u.indexOf(this);if(e==-1)return console.warn("Theme engine already destructed");u.splice(e,1)}async applyAllToDoc(e){this.applyScrollbarToDoc(e,await this.scrollbar),this.applyAnimationToDoc(e,await this.animations),this.applyThemeToDoc(e,await this.theme),this.applyAutoInputToDoc(e,await this.autoInputMode),this.applyInputToDoc(e,await this.inputMode),this.applyScaleToDoc(e,await this.scale),this.applyTextScaleToDoc(e,await this.textScale)}applyScrollbar(e){this._handler.forDocuments(t=>{this.applyScrollbarToDoc(t,e)})}applyScrollbarToDoc(e,t){e.documentElement.style.setProperty("--scrollbar",{thin:"0.4rem",medium:"1rem",wide:"1.875rem"}[t])}applyAnimation(e){this._handler.forDocuments(t=>{this.applyAnimationToDoc(t,e)})}applyAnimationToDoc(e,t){switch(e.documentElement.classList.remove("anim-all","anim-most","anim-some"),t){case"all":e.documentElement.classList.add("anim-all");case"most":e.documentElement.classList.add("anim-most");case"some":e.documentElement.classList.add("anim-some");break}}applyTheme(e){this._handler.forDocuments(t=>{this.applyThemeToDoc(t,e)})}applyThemeToDoc(e,t){for(const s in I)I[s].applyThemes(e.documentElement.style,t)}applyScale(e){this._handler.forDocuments(t=>{this.applyScaleToDoc(t,e)})}applyScaleToDoc(e,t){e.documentElement.style.fontSize=t*16+"px"}applyTextScale(e){this._handler.forDocuments(t=>{this.applyTextScaleToDoc(t,e)})}applyTextScaleToDoc(e,t){e.documentElement.style.setProperty("--textScale",String(t))}applyInput(e){this._handler.forDocuments(t=>{this.applyInputToDoc(t,e)})}applyInputToDoc(e,t){let s=e.documentElement.style;switch(s.setProperty("--mouse","0"),s.setProperty("--pen","0"),s.setProperty("--touch","0"),e.documentElement.classList.remove("mouse","pen","touch"),t){case"mouse":s.setProperty("--mouse","1"),e.documentElement.classList.add("mouse");break;case"pen":s.setProperty("--pen","1"),e.documentElement.classList.add("pen");break;case"touch":s.setProperty("--touch","1"),e.documentElement.classList.add("touch");break}}applyAutoInput(e){this._handler.forDocuments(t=>{this.applyAutoInputToDoc(t,e)})}applyAutoInputToDoc(e,t){switch(e.documentElement.removeEventListener("pointerdown",this._autoInputListenerEvery,{capture:!0}),t){case"first":e.documentElement.addEventListener("pointerdown",this._autoInputListenerEvery,{capture:!0,once:!0});break;case"every":e.documentElement.addEventListener("pointerdown",this._autoInputListenerEvery,{capture:!0});break}}async applySingleProperty(e,t){let s=await this.theme;this._handler.forDocuments(a=>{a.documentElement.style.setProperty(e,t[s])})}remToPx(e){return e*this._scale}pxToRem(e){return e/this._scale}}window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",async r=>{for(let e=0;e<u.length;e++)await u[e].autoThemeMode==="os"&&u[e].theme.set(r.matches?h.Dark:h.Light)});const te=(r,e,t,s)=>({engine:new ee(r,e,t,s)});let{handler:se}=Q(document);te(se);let{state:ie}=o(1),{state:ae}=o(2),{state:ne}=o(3),{derived:re,setStates:ce}=q(r=>r[0],ie,ae,ne);re.subscribe(r=>{console.warn(r)});
