var F=(i,t,e)=>{if(!t.has(i))throw TypeError("Cannot "+e)};var r=(i,t,e)=>(F(i,t,"read from private field"),e?e.call(i):t.get(i)),o=(i,t,e)=>{if(t.has(i))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(i):t.set(i,e)},h=(i,t,e,s)=>(F(i,t,"write to private field"),s?s.call(i,e):t.set(i,e),e);var b=(i,t,e)=>(F(i,t,"access private method"),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const c of n)if(c.type==="childList")for(const f of c.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&s(f)}).observe(document,{childList:!0,subtree:!0});function e(n){const c={};return n.integrity&&(c.integrity=n.integrity),n.referrerPolicy&&(c.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?c.credentials="include":n.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(n){if(n.ep)return;n.ep=!0;const c=e(n);fetch(n.href,c)}})();class U{constructor(t){this.value=t}get ok(){return!0}get err(){return!1}expect(){return this.value}expectErr(t){throw new Error(t)}get unwrap(){return this.value}unwrapOr(){return this.value}andThen(t){return t(this.value)}orElse(){return this}map(t){return new U(t(this.value))}mapErr(){return this}get toOptional(){return new B(this.value)}safeUnwrap(){return this.value}}var m;const k=class k{constructor(t){o(this,m,void 0);h(this,m,new Error().stack),this.error=t}get valid(){return!1}get ok(){return!1}get err(){return!0}expect(t){throw new Error(t+`
Original `+r(this,m)+`
Expect Error`)}expectErr(){return this.error}get unwrap(){throw new Error(`Tried to unwrap Error
Original `+r(this,m)+`
Unwrap Error`)}unwrapOr(t){return t}andThen(){return this}orElse(t){return t(this.error)}map(){return this}mapErr(t){return new k(t(this.error))}get toOptional(){return new A}get stack(){return r(this,m)}};m=new WeakMap;let L=k;class B{constructor(t){this.value=t}get valid(){return!0}get some(){return!0}get none(){return!1}expect(){return this.value}get unwrap(){return this.value}unwrapOr(){return this.value}andThen(t){return t(this.value)}orElse(){return this}map(t){return new B(t(this.value))}toResult(){return new U(this.value)}}class A{get valid(){return!1}get some(){return!1}get none(){return!0}expect(t){throw new Error(t)}get unwrap(){throw new Error("Tried to unwrap None")}unwrapOr(t){return t}andThen(){return this}orElse(t){return t()}map(){return this}toResult(t){return new L(t)}}function I(i){return new U(i)}function R(i){return new L(i)}function q(i){return new B(i)}function D(){return new A}class G{constructor(){this.subscribers=[]}subscribe(t,e){return this.subscribers.includes(t)?(console.warn("Function already registered as subscriber"),t):(this.onSubscribe(this.subscribers.length==0),this.subscribers.push(t),e&&this.then(s=>{t(s)}),t)}unsubscribe(t){const e=this.subscribers.indexOf(t);return e!=-1?(this.onUnsubscribe(this.subscribers.length==1),this.subscribers.splice(e,1)):console.warn("Subscriber not found with state",this,t),t}related(){return D()}onSubscribe(t){}onUnsubscribe(t){}inUse(){return!!this.subscribers.length}hasSubscriber(t){return this.subscribers.includes(t)}updateSubscribers(t){for(let e=0,s=this.subscribers.length;e<s;e++)try{this.subscribers[e](t)}catch(n){console.warn("Failed while calling subscribers ",n,this,this.subscribers[e])}}}var l,y,a,O;class M extends G{constructor(e,s,n,c){super();o(this,l,void 0);o(this,y,void 0);o(this,a,void 0);o(this,O,void 0);if(s&&h(this,y,s===!0?f=>r(this,a)?r(this,a).limit(f).map(E=>I(E)):q(I(f)):s),n&&h(this,a,n),c&&h(this,O,c),typeof e=="function"){let f=new Promise(E=>{this.then=async K=>(h(this,l,e()),delete this.then,delete this.write,delete this.get,E(),K(r(this,l))),this.get=()=>(h(this,l,e()),delete this.then,delete this.write,delete this.get,E(),r(this,l))});this.write=E=>{f.then(()=>{delete this.write,this.write(E)})}}else h(this,l,e)}async then(e){return e(r(this,l))}get(){return r(this,l)}related(){return r(this,O)?r(this,O).call(this):D()}write(e){r(this,y)&&r(this,l).ok&&r(this,l).value!==e&&r(this,y).call(this,e).map(this.set.bind(this))}check(e){return r(this,a)?r(this,a).check(e):void 0}limit(e){return r(this,a)?r(this,a).limit(e):q(e)}set(e){h(this,l,e),this.updateSubscribers(e)}}l=new WeakMap,y=new WeakMap,a=new WeakMap,O=new WeakMap;var w,d,u,g,v,p,N,V,S,P,x,T;class j extends G{constructor(e,...s){super();o(this,N);o(this,S);o(this,x);o(this,w,!1);o(this,d,void 0);o(this,u,void 0);o(this,g,[]);o(this,v,[]);o(this,p,0);typeof e=="function"?(this.getter=e,h(this,u,s)):h(this,u,[...arguments])}getter(e){return e[0]}subscribe(e,s){return this.subscribers.length===0?(this.subscribers.push(e),b(this,S,P).call(this),e):super.subscribe(e,s)}unsubscribe(e){return this.subscribers.length===1&&b(this,x,T).call(this),super.unsubscribe(e)}async then(e){return r(this,w)?e(r(this,d)):r(this,u).length?e(this.getter(r(this,u).map(s=>s.get()))):e(R({reason:"No states registered",code:"INV"}))}get(){return r(this,w)?r(this,d):r(this,u).length?this.getter(r(this,u).map(e=>e.get())):R({reason:"No states registered",code:"INV"})}setStates(...e){this.subscribers.length?(b(this,x,T).call(this),h(this,u,[...e]),b(this,S,P).call(this)):h(this,u,[...e])}setGetter(e){this.subscribers.length?(b(this,x,T).call(this),this.getter=e,b(this,S,P).call(this)):this.getter=e}}w=new WeakMap,d=new WeakMap,u=new WeakMap,g=new WeakMap,v=new WeakMap,p=new WeakMap,N=new WeakSet,V=async function(){await void 0,h(this,w,!0),h(this,d,this.getter(r(this,g))),this.updateSubscribers(r(this,d)),h(this,p,1)},S=new WeakSet,P=function(){if(h(this,p,0),r(this,u).length>1){let e=r(this,u).length;for(let s=0;s<r(this,u).length;s++)r(this,v)[s]=r(this,u)[s].subscribe(n=>{r(this,p)===1?(r(this,g)[s]=n,h(this,p,2),b(this,N,V).call(this)):r(this,p)===0&&!r(this,g)[s]?(r(this,g)[s]=n,e--,e===0&&(h(this,p,2),b(this,N,V).call(this))):r(this,g)[s]=n},!0)}else r(this,v)[0]=r(this,u)[0].subscribe(e=>{h(this,w,!0),h(this,d,this.getter([e])),this.updateSubscribers(r(this,d))},!0)},x=new WeakSet,T=function(){h(this,w,!1);for(let e=0;e<r(this,u).length;e++)r(this,u)[e].unsubscribe(r(this,v)[e]);h(this,v,[]),h(this,g,[])};let z=new M(I(5)),C=new j(z);console.log(C.get());
