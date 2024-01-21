var y=(t,r,e)=>{if(!r.has(t))throw TypeError("Cannot "+e)};var n=(t,r,e)=>(y(t,r,"read from private field"),e?e.call(t):r.get(t)),d=(t,r,e)=>{if(r.has(t))throw TypeError("Cannot add the same private member more than once");r instanceof WeakSet?r.add(t):r.set(t,e)},a=(t,r,e,u)=>(y(t,r,"write to private field"),u?u.call(t,e):r.set(t,e),e);(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))u(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&u(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function u(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();class f{constructor(r){this.value=r}get ok(){return!0}get err(){return!1}expect(){return this.value}expectErr(r){throw new Error(r)}get unwrap(){return this.value}unwrapOr(){return this.value}andThen(r){return r(this.value)}orElse(){return this}map(r){return new f(r(this.value))}mapErr(){return this}get toOptional(){return new g(this.value)}safeUnwrap(){return this.value}}var l;const E=class E{constructor(r){d(this,l,void 0);a(this,l,new Error().stack),this.error=r}get valid(){return!1}get ok(){return!1}get err(){return!0}expect(r){throw new Error(r+`
Original `+n(this,l)+`
Expect Error`)}expectErr(){return this.error}get unwrap(){throw new Error(`Tried to unwrap Error
Original `+n(this,l)+`
Unwrap Error`)}unwrapOr(r){return r}andThen(){return this}orElse(r){return r(this.error)}map(){return this}mapErr(r){return new E(r(this.error))}get toOptional(){return new x}get stack(){return n(this,l)}};l=new WeakMap;let m=E;class g{constructor(r){this.value=r}get valid(){return!0}get some(){return!0}get none(){return!1}expect(){return this.value}get unwrap(){return this.value}unwrapOr(){return this.value}andThen(r){return r(this.value)}orElse(){return this}map(r){return new g(r(this.value))}toResult(){return new f(this.value)}}class x{get valid(){return!1}get some(){return!1}get none(){return!0}expect(r){throw new Error(r)}get unwrap(){throw new Error("Tried to unwrap None")}unwrapOr(r){return r}andThen(){return this}orElse(r){return r()}map(){return this}toResult(r){return new m(r)}}function v(t){return new f(t)}function O(t){return new g(t)}function S(){return new x}class L{constructor(){this.subscribers=[]}subscribe(r,e){return this.subscribers.includes(r)?(console.warn("Function already registered as subscriber"),r):(this.subscribers.push(r),e&&this.then(u=>{r(u)}),r)}unsubscribe(r){const e=this.subscribers.indexOf(r);return e!=-1?this.subscribers.splice(e,1):console.warn("Subscriber not found with state",this,r),r}related(){return S()}inUse(){return!!this.subscribers.length}hasSubscriber(r){return this.subscribers.includes(r)}updateSubscribers(r){for(let e=0,u=this.subscribers.length;e<u;e++)try{this.subscribers[e](r)}catch(s){console.warn("Failed while calling subscribers ",s,this,this.subscribers[e])}}}var c,b,h,w;class P extends L{constructor(e,u,s,i){super();d(this,c,void 0);d(this,b,void 0);d(this,h,void 0);d(this,w,void 0);u&&a(this,b,u===!0?o=>n(this,h)?n(this,h).limit(o).map(p=>v(p)):O(v(o)):u),s&&a(this,h,s),i&&a(this,w,i),e instanceof Promise?(this.then=e.then.bind(e),e.then(o=>{a(this,c,o),delete this.then})):typeof e=="function"?this.then=o=>{let p=e();return this.then=p.then.bind(p),p.then(T=>{a(this,c,T),delete this.then}),p.then(o)}:a(this,c,e)}async then(e){return e(n(this,c))}related(){return n(this,w)?n(this,w).call(this):S()}write(e){n(this,b)&&n(this,c).value!==e&&n(this,b).call(this,e).map(this.set.bind(this))}check(e){return n(this,h)?n(this,h).check(e):void 0}limit(e){return n(this,h)?n(this,h).limit(e):O(e)}set(e){a(this,c,e),this.updateSubscribers(e)}}c=new WeakMap,b=new WeakMap,h=new WeakMap,w=new WeakMap;let N=new P(async()=>v(2));N.subscribe(t=>{console.log(t)},!0);
