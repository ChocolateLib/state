var H=(r,e,t)=>{if(!e.has(r))throw TypeError("Cannot "+t)};var n=(r,e,t)=>(H(r,e,"read from private field"),t?t.call(r):e.get(r)),a=(r,e,t)=>{if(e.has(r))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(r):e.set(r,t)},u=(r,e,t,s)=>(H(r,e,"write to private field"),s?s.call(r,t):e.set(r,t),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const S of o.addedNodes)S.tagName==="LINK"&&S.rel==="modulepreload"&&s(S)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class C{constructor(e){this.value=e}get ok(){return!0}get err(){return!1}expect(){return this.value}expectErr(e){throw new Error(e)}get unwrap(){return this.value}unwrapOr(){return this.value}andThen(e){return e(this.value)}orElse(){return this}map(e){return new C(e(this.value))}mapErr(){return this}get toOptional(){return new L(this.value)}safeUnwrap(){return this.value}}var p;const M=class M{constructor(e){a(this,p,void 0);u(this,p,new Error().stack),this.error=e}get valid(){return!1}get ok(){return!1}get err(){return!0}expect(e){throw new Error(e+`
Original `+n(this,p)+`
Expect Error`)}expectErr(){return this.error}get unwrap(){throw new Error(`Tried to unwrap Error
Original `+n(this,p)+`
Unwrap Error`)}unwrapOr(e){return e}andThen(){return this}orElse(e){return e(this.error)}map(){return this}mapErr(e){return new M(e(this.error))}get toOptional(){return new R}get stack(){return n(this,p)}};p=new WeakMap;let E=M;class L{constructor(e){this.value=e}get valid(){return!0}get some(){return!0}get none(){return!1}expect(){return this.value}get unwrap(){return this.value}unwrapOr(){return this.value}andThen(e){return e(this.value)}orElse(){return this}map(e){return new L(e(this.value))}toResult(){return new C(this.value)}}class R{get valid(){return!1}get some(){return!1}get none(){return!0}expect(e){throw new Error(e)}get unwrap(){throw new Error("Tried to unwrap None")}unwrapOr(e){return e}andThen(){return this}orElse(e){return e()}map(){return this}toResult(e){return new E(e)}}function T(r){return new C(r)}function P(r){return new E(r)}class q{constructor(){this._subscribers=[]}subscribe(e,t){return this._subscribers.push(e),t&&this.then(s=>{e(s.value,s.error)}),e}unsubscribe(e){const t=this._subscribers.indexOf(e);return t!=-1?this._subscribers.splice(t,1):console.warn("Subscriber not found with state",this,e),e}inUse(){return!!this._subscribers.length}hasSubscriber(e){return this._subscribers.includes(e)}_updateSubscribers(e,t){for(let s=0,i=this._subscribers.length;s<i;s++)try{this._subscribers[s](e,t)}catch(o){console.warn("Failed while calling subscribers ",o,this,this._subscribers[s])}}}var m,l,h,c,d,b;class N extends q{constructor(){super(...arguments);a(this,m,0);a(this,l,!1);a(this,h,void 0);a(this,c,[]);a(this,d,0);a(this,b,0)}async then(t){if(n(this,m)>=Date.now())return t(n(this,h));if(n(this,l))return t(await new Promise(s=>{n(this,c).push(s)}));u(this,l,!0),this.debounce>0&&await new Promise(s=>{setTimeout(s,this.debounce)}),u(this,h,await this.singleGet()),u(this,m,Date.now()+this.timeout);for(let s=0;s<n(this,c).length;s++)n(this,c)[s](n(this,h));return u(this,c,[]),u(this,l,!1),t(n(this,h))}updateResource(t,s){u(this,h,s?P(s):T(t)),u(this,m,Date.now()+this.timeout);for(let i=0;i<n(this,c).length;i++)n(this,c)[i](n(this,h));u(this,c,[]),u(this,l,!1),this._updateSubscribers(t,s)}subscribe(t,s){return this._subscribers.length===0?(this._subscribers.push(t),n(this,d)?(clearTimeout(n(this,d)),u(this,d,0)):(u(this,l,!0),this.debounce>0?u(this,b,setTimeout(()=>{this.setupConnection(this),u(this,b,0)},this.debounce)):this.setupConnection(this)),t):super.subscribe(t,s)}unsubscribe(t){return this._subscribers.length===1&&(n(this,b)?(clearTimeout(n(this,b)),u(this,b,0)):this.retention>0?u(this,d,setTimeout(()=>{this.teardownConnection(),u(this,d,0)},this.retention)):this.teardownConnection()),super.unsubscribe(t)}check(t){}limit(t){return t}}m=new WeakMap,l=new WeakMap,h=new WeakMap,c=new WeakMap,d=new WeakMap,b=new WeakMap;class D{constructor(){this.value=0,this.quality=1,setInterval(()=>{this.value++},100)}async fetch(){if(await new Promise(e=>{setTimeout(e,90+Math.random()*20)}),Math.random()+this.quality>1)return this.value;throw"Connection lost"}set connectionQuality(e){this.quality=e}}var g,y;class I extends N{constructor(t){super();a(this,g,void 0);a(this,y,void 0);u(this,g,t)}get debounce(){return 10}get timeout(){return 200}get retention(){return 250}async singleGet(){try{return T(await n(this,g).fetch())}catch(t){return P({code:"CL",reason:t})}}setupConnection(t){u(this,y,setInterval(async()=>{try{t.updateResource(await n(this,g).fetch())}catch(s){t.updateResource(void 0,{code:"CL",reason:s})}},500))}teardownConnection(){clearInterval(n(this,y))}write(t){}}g=new WeakMap,y=new WeakMap;let x=new D;window.server=x;let O=new I(x);window.client=O;let w=document.createElement("input");w.type="range";w.min="0";w.max="1";w.step="0.05";w.oninput=()=>{x.quality=Number(w.value)};document.body.appendChild(w);let f=document.createElement("button");f.innerHTML="Single Get";f.onclick=async()=>{(await O).andThen(r=>(f.innerHTML="Single Get "+String(r),T(!1))).orElse(r=>(f.innerHTML="Single Get "+String(r.reason),T(!1)))};document.body.appendChild(f);let v=document.createElement("button");v.innerHTML="Connect";let G;v.onclick=()=>{G=O.subscribe((r,e)=>{e?v.innerHTML="Connect "+String(e.reason):v.innerHTML="Connect "+String(r)})};document.body.appendChild(v);let _=document.createElement("button");_.innerHTML="Disconnect";_.onclick=()=>{O.unsubscribe(G)};document.body.appendChild(_);