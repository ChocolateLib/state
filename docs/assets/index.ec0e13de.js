(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerpolicy&&(i.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?i.credentials="include":s.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();class c{constructor(){this._subscribers=[]}subscribe(e,t){if(this._subscribers.push(e),t)try{this.then(e)}catch{console.warn("Failed while calling update function",this,e)}return e}unsubscribe(e){const t=this._subscribers.indexOf(e);return t!=-1?this._subscribers.splice(t,1):console.warn("Subscriber not found with state",this,e),e}inUse(){return Boolean(this._subscribers.length)}hasSubscriber(e){return this._subscribers.includes(e)}_updateSubscribers(e){for(let t=0,r=this._subscribers.length;t<r;t++)try{this._subscribers[t](e)}catch(s){console.warn("Failed while calling subscribers ",s,this,this._subscribers[t])}}}class u extends c{constructor(e,t,r,s){super(),t&&(this._setter=t===!0?this.set:t),r&&(this._check=r),s&&(this._limit=s),this._value=e}async then(e){return await e(this._value)}write(e){this._setter&&this._value!==e&&this._setter(e,this)}check(e){return this._check?this._check(e):void 0}limit(e){return this._limit?this._limit(e):e}set(e){this._value=e,this._updateSubscribers(e)}}let l=[];window.yo=l;new u(1);
