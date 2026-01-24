(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();const pp=72*60*60*1e3,mp=7*24*60*60*1e3,gp=.125,vn="100300",yp=7200;class _p{constructor(e,t={}){this.itemDatabase=e,this.inventory=new Map,this.priceCache=new Map;for(const[r,s]of Object.entries(t))this.priceCache.set(r,s)}buildInventory(e){const t=new Map;for(const r of e)t.set(r.fullId,r);this.inventory.clear();for(const r of t.values()){const s=this.itemDatabase[r.baseId];if(s&&s.tradable===!1)continue;const o=s?s.name:`Unknown Item (${r.baseId})`;if(this.inventory.has(r.baseId)){const a=this.inventory.get(r.baseId);a.totalQuantity+=r.bagNum,a.instances+=1,r.timestamp>a.lastUpdated&&(a.lastUpdated=r.timestamp)}else{const a=this.priceCache.get(r.baseId),c=a?a.price:null,u=a?a.timestamp:null;this.inventory.set(r.baseId,{itemName:o,totalQuantity:r.bagNum,baseId:r.baseId,price:c,priceTimestamp:u,instances:1,lastUpdated:r.timestamp,pageId:r.pageId,slotId:r.slotId})}}return this.inventory}hydrateInventory(e){this.inventory.clear();for(const t of e)this.inventory.set(t.baseId,{...t})}updatePrice(e,t,r,s=Date.now()){const o=Math.floor(s/216e5)*216e5,a=new Date(o).toISOString().slice(0,13)+":00:00";let c=[];const u=this.priceCache.get(e);u!=null&&u.history&&Array.isArray(u.history)&&(c=[...u.history]);const d=c.findIndex(_=>_.date===a);d>=0?c[d]={date:a,price:t}:c.push({date:a,price:t}),c.sort((_,w)=>_.date.localeCompare(w.date)),c.length>28&&(c=c.slice(c.length-28));const f={price:t,timestamp:s,...r!==void 0&&{listingCount:r},...c.length>0&&{history:c}};if(this.priceCache.set(e,f),this.inventory.has(e)){const _=this.inventory.get(e);_.price=t,_.priceTimestamp=s}}getInventory(){return Array.from(this.inventory.values()).filter(e=>{const t=this.itemDatabase[e.baseId];return!t||t.tradable!==!1}).sort((e,t)=>{const r=e.itemName.localeCompare(t.itemName);return r!==0?r:e.baseId.localeCompare(t.baseId)})}getInventoryMap(){return this.inventory}getPriceCacheAsObject(){const e={};return this.priceCache.forEach((t,r)=>{e[r]=t}),e}}function vp(n,e){const t={...n};for(const[r,s]of Object.entries(e)){const o=n[r],a=s.listingCount??0,c=(o==null?void 0:o.listingCount)??0;let u="use-cloud";o&&(s.timestamp>o.timestamp?u="use-cloud":s.timestamp<o.timestamp?u="keep-local":a>c?u="use-cloud":u="keep-local"),u==="use-cloud"&&(t[r]={...s,...(o==null?void 0:o.history)&&{history:o.history}})}return t}const Nu="fenix_price_cache";async function Lu(){try{let e=await fetch("./item_database.json");if(!e.ok)throw new Error(`Failed to load item database: ${e.statusText}`);return await e.json()}catch(n){return console.error("Failed to load item database:",n),{}}}async function Vu(n){try{const e=localStorage.getItem(Nu);let t={};if(e){const r=JSON.parse(e),s={};let o=!1;for(const[a,c]of Object.entries(r))typeof c=="number"?(s[a]={price:c,timestamp:Date.now()},o=!0):s[a]=c;o&&console.log("Migrated price cache to new format with timestamps"),t=s}if(!n)return t;try{const r=Object.keys(t).length===0,s=await n({forceFull:r}),o=vp(t,s);return Object.keys(s).length>0&&await bo(o),o}catch(r){return console.error("Failed to load cloud price cache:",r),t}}catch(e){return console.error("Failed to load price cache:",e),{}}}async function bo(n){try{localStorage.setItem(Nu,JSON.stringify(n))}catch(e){console.error("Failed to save price cache:",e)}}const Mu="fenix_config";function Ou(){try{const n=localStorage.getItem(Mu);if(n)return JSON.parse(n)}catch(n){console.warn("Failed to read config from localStorage:",n)}return{}}function Ip(n){try{localStorage.setItem(Mu,JSON.stringify(n))}catch(e){throw console.error("Failed to save config to localStorage:",e),e}}function Ep(){return Ou().settings||{}}function Tp(n){const e=Ou();e.settings={...e.settings,...n},Ip(e)}function wp(n){return n.split("_")[0]}function Pc(n){if(!n.includes("BagMgr@:InitBagData"))return null;const e=n.match(/PageId\s*=\s*(\d+)/),t=e?parseInt(e[1]):null;if(t!==102&&t!==103)return null;const r=n.match(/SlotId\s*=\s*(\d+)/),s=r?parseInt(r[1]):null,o=n.match(/ConfigBaseId\s*=\s*(\d+)/);if(!o)return null;const a=o[1],c=n.match(/Num\s*=\s*(\d+)/);if(!c)return null;const u=parseInt(c[1]),d=n.match(/\[([\d\.\-:]+)\]/),f=d?d[1]:"unknown",_=`${a}_init_${t}_${s}_${f}`;return{timestamp:f,action:"Add",fullId:_,baseId:a,bagNum:u,slotId:s,pageId:t}}function kc(n){const e=n.match(/Id=([^\s]+)/);if(!e)return null;const t=e[1],r=wp(t),s=n.match(/BagNum=(\d+)/);if(!s)return null;const o=parseInt(s[1]),a=n.match(/PageId=(\d+)/),c=a?parseInt(a[1]):null;if(c!==102&&c!==103)return null;const u=n.match(/\[([\d\.\-:]+)\]/),d=u?u[1]:"unknown";let f="Unknown";n.includes("ItemChange@ Add")?f="Add":n.includes("ItemChange@ Update")?f="Update":n.includes("ItemChange@ Remove")&&(f="Remove");const _=n.match(/SlotId=(\d+)/),w=_?parseInt(_[1]):null;return{timestamp:d,action:f,fullId:t,baseId:r,bagNum:o,slotId:w,pageId:c}}function Ap(n){const e=n.split(`
`);let t=-1,r=-1;for(let d=e.length-1;d>=0;d--){const f=e[d];if(f.includes("ItemChange@ ProtoName=ResetItemsLayout end")&&r===-1&&(r=d),f.includes("ItemChange@ ProtoName=ResetItemsLayout start")&&t===-1&&r!==-1){t=d;break}}if(t!==-1&&r!==-1){const d=[],f=Math.min(r+500,e.length);let _=!1,w=!1;for(let b=r;b<f;b++){const k=e[b];if(k.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const C=Pc(k);if(C){const P=d.findIndex(O=>O.pageId===C.pageId&&O.slotId===C.slotId&&O.slotId!==null&&C.slotId!==null);P>=0?d[P]=C:d.push(C),C.pageId===102&&(_=!0),C.pageId===103&&(w=!0)}}if(!_||!w)for(let b=f;b<e.length;b++){const k=e[b];if(k.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const C=Pc(k);if(C){const P=d.findIndex(O=>O.pageId===C.pageId&&O.slotId===C.slotId&&O.slotId!==null&&C.slotId!==null);P>=0?d[P]=C:d.push(C),C.pageId===102&&(_=!0),C.pageId===103&&(w=!0)}if(_&&w){let P=!1;for(let O=b+1;O<Math.min(b+50,e.length);O++){if(e[O].includes("BagMgr@:InitBagData")){P=!0;break}if(e[O].includes("ItemChange@ ProtoName=ResetItemsLayout start"))break}if(!P)break}}for(let b=r;b<e.length;b++){const k=e[b];if(k.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;if(k.includes("ItemChange@")&&k.includes("Id=")){const C=kc(k);if(C){const P=d.findIndex(O=>O.fullId===C.fullId);if(P>=0)d[P]=C;else if(C.slotId!==null){const O=d.findIndex(H=>H.baseId===C.baseId&&H.pageId===C.pageId&&H.slotId===C.slotId&&H.slotId!==null);O>=0?d[O]=C:d.push(C)}else d.push(C)}}}if(d.length>0)return d}let s=-1,o=-1;for(let d=e.length-1;d>=0;d--){const f=e[d];if(f.includes("ItemChange@ Reset PageId=102")&&s===-1&&(s=d),f.includes("ItemChange@ Reset PageId=103")&&o===-1&&(o=d),s!==-1&&o!==-1)break}const a=Math.min(s===-1?1/0:s,o===-1?1/0:o),c=a===1/0?e:e.slice(a),u=[];for(const d of c)if(d.includes("ItemChange@")&&d.includes("Id=")){const f=kc(d);f&&u.push(f)}return u}var Dc={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Sp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const o=n[t++];e[r++]=String.fromCharCode((s&31)<<6|o&63)}else if(s>239&&s<365){const o=n[t++],a=n[t++],c=n[t++],u=((s&7)<<18|(o&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const o=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(o&63)<<6|a&63)}}return e.join("")},Fu={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const o=n[s],a=s+1<n.length,c=a?n[s+1]:0,u=s+2<n.length,d=u?n[s+2]:0,f=o>>2,_=(o&3)<<4|c>>4;let w=(c&15)<<2|d>>6,b=d&63;u||(b=64,a||(w=64)),r.push(t[f],t[_],t[w],t[b])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(xu(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Sp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const o=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const _=s<n.length?t[n.charAt(s)]:64;if(++s,o==null||c==null||d==null||_==null)throw new bp;const w=o<<2|c>>4;if(r.push(w),d!==64){const b=c<<4&240|d>>2;if(r.push(b),_!==64){const k=d<<6&192|_;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class bp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Cp=function(n){const e=xu(n);return Fu.encodeByteArray(e,!0)},ms=function(n){return Cp(n).replace(/\./g,"")},Bu=function(n){try{return Fu.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pp=()=>Rp().__FIREBASE_DEFAULTS__,kp=()=>{if(typeof process>"u"||typeof Dc>"u")return;const n=Dc.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Dp=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Bu(n[1]);return e&&JSON.parse(e)},Ds=()=>{try{return Pp()||kp()||Dp()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Uu=n=>{var e,t;return(t=(e=Ds())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Np=n=>{const e=Uu(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},$u=()=>{var n;return(n=Ds())===null||n===void 0?void 0:n.config},Hu=n=>{var e;return(e=Ds())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vp(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},n);return[ms(JSON.stringify(t)),ms(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ee(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Mp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ee())}function Op(){var n;const e=(n=Ds())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function xp(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Fp(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Bp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Up(){const n=Ee();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function $p(){return!Op()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Hp(){try{return typeof indexedDB=="object"}catch{return!1}}function jp(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var o;e(((o=s.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qp="FirebaseError";class et extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=qp,Object.setPrototypeOf(this,et.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,pr.prototype.create)}}class pr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,o=this.errors[e],a=o?zp(o,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new et(s,c,r)}}function zp(n,e){return n.replace(Gp,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Gp=/\{\$([^}]+)}/g;function Wp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function gs(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const o=n[s],a=e[s];if(Nc(o)&&Nc(a)){if(!gs(o,a))return!1}else if(o!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Nc(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mr(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Kp(n,e){const t=new Qp(n,e);return t.subscribe.bind(t)}class Qp{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Jp(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=wi),s.error===void 0&&(s.error=wi),s.complete===void 0&&(s.complete=wi);const o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),o}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Jp(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function wi(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $t(n){return n&&n._delegate?n._delegate:n}class Mt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yp{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Lp;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(s)return null;throw o}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Zp(e))try{this.getOrInitializeService({instanceIdentifier:Pt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:s});r.resolve(o)}catch{}}}}clearInstance(e=Pt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Pt){return this.instances.has(e)}getOptions(e=Pt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[o,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(o);r===c&&a.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),o=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;o.add(e),this.onInitCallbacks.set(s,o);const a=this.instances.get(s);return a&&e(a,s),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Xp(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Pt){return this.component?this.component.multipleInstances?e:Pt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Xp(n){return n===Pt?void 0:n}function Zp(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class em{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Yp(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var z;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(z||(z={}));const tm={debug:z.DEBUG,verbose:z.VERBOSE,info:z.INFO,warn:z.WARN,error:z.ERROR,silent:z.SILENT},nm=z.INFO,rm={[z.DEBUG]:"log",[z.VERBOSE]:"log",[z.INFO]:"info",[z.WARN]:"warn",[z.ERROR]:"error"},sm=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=rm[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Co{constructor(e){this.name=e,this._logLevel=nm,this._logHandler=sm,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in z))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?tm[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,z.DEBUG,...e),this._logHandler(this,z.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,z.VERBOSE,...e),this._logHandler(this,z.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,z.INFO,...e),this._logHandler(this,z.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,z.WARN,...e),this._logHandler(this,z.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,z.ERROR,...e),this._logHandler(this,z.ERROR,...e)}}const im=(n,e)=>e.some(t=>n instanceof t);let Lc,Vc;function om(){return Lc||(Lc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function am(){return Vc||(Vc=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ju=new WeakMap,Wi=new WeakMap,qu=new WeakMap,Ai=new WeakMap,Ro=new WeakMap;function cm(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{t(ft(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",o),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&ju.set(t,n)}).catch(()=>{}),Ro.set(e,n),e}function lm(n){if(Wi.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});Wi.set(n,e)}let Ki={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Wi.get(n);if(e==="objectStoreNames")return n.objectStoreNames||qu.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return ft(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function um(n){Ki=n(Ki)}function hm(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Si(this),e,...t);return qu.set(r,e.sort?e.sort():[e]),ft(r)}:am().includes(n)?function(...e){return n.apply(Si(this),e),ft(ju.get(this))}:function(...e){return ft(n.apply(Si(this),e))}}function dm(n){return typeof n=="function"?hm(n):(n instanceof IDBTransaction&&lm(n),im(n,om())?new Proxy(n,Ki):n)}function ft(n){if(n instanceof IDBRequest)return cm(n);if(Ai.has(n))return Ai.get(n);const e=dm(n);return e!==n&&(Ai.set(n,e),Ro.set(e,n)),e}const Si=n=>Ro.get(n);function fm(n,e,{blocked:t,upgrade:r,blocking:s,terminated:o}={}){const a=indexedDB.open(n,e),c=ft(a);return r&&a.addEventListener("upgradeneeded",u=>{r(ft(a.result),u.oldVersion,u.newVersion,ft(a.transaction),u)}),t&&a.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{o&&u.addEventListener("close",()=>o()),s&&u.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const pm=["get","getKey","getAll","getAllKeys","count"],mm=["put","add","delete","clear"],bi=new Map;function Mc(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(bi.get(e))return bi.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=mm.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||pm.includes(t)))return;const o=async function(a,...c){const u=this.transaction(a,s?"readwrite":"readonly");let d=u.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[t](...c),s&&u.done]))[0]};return bi.set(e,o),o}um(n=>({...n,get:(e,t,r)=>Mc(e,t)||n.get(e,t,r),has:(e,t)=>!!Mc(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gm{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(ym(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function ym(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Qi="@firebase/app",Oc="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je=new Co("@firebase/app"),_m="@firebase/app-compat",vm="@firebase/analytics-compat",Im="@firebase/analytics",Em="@firebase/app-check-compat",Tm="@firebase/app-check",wm="@firebase/auth",Am="@firebase/auth-compat",Sm="@firebase/database",bm="@firebase/data-connect",Cm="@firebase/database-compat",Rm="@firebase/functions",Pm="@firebase/functions-compat",km="@firebase/installations",Dm="@firebase/installations-compat",Nm="@firebase/messaging",Lm="@firebase/messaging-compat",Vm="@firebase/performance",Mm="@firebase/performance-compat",Om="@firebase/remote-config",xm="@firebase/remote-config-compat",Fm="@firebase/storage",Bm="@firebase/storage-compat",Um="@firebase/firestore",$m="@firebase/vertexai-preview",Hm="@firebase/firestore-compat",jm="firebase",qm="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ji="[DEFAULT]",zm={[Qi]:"fire-core",[_m]:"fire-core-compat",[Im]:"fire-analytics",[vm]:"fire-analytics-compat",[Tm]:"fire-app-check",[Em]:"fire-app-check-compat",[wm]:"fire-auth",[Am]:"fire-auth-compat",[Sm]:"fire-rtdb",[bm]:"fire-data-connect",[Cm]:"fire-rtdb-compat",[Rm]:"fire-fn",[Pm]:"fire-fn-compat",[km]:"fire-iid",[Dm]:"fire-iid-compat",[Nm]:"fire-fcm",[Lm]:"fire-fcm-compat",[Vm]:"fire-perf",[Mm]:"fire-perf-compat",[Om]:"fire-rc",[xm]:"fire-rc-compat",[Fm]:"fire-gcs",[Bm]:"fire-gcs-compat",[Um]:"fire-fst",[Hm]:"fire-fst-compat",[$m]:"fire-vertex","fire-js":"fire-js",[jm]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ys=new Map,Gm=new Map,Yi=new Map;function xc(n,e){try{n.container.addComponent(e)}catch(t){Je.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function hn(n){const e=n.name;if(Yi.has(e))return Je.debug(`There were multiple attempts to register component ${e}.`),!1;Yi.set(e,n);for(const t of ys.values())xc(t,n);for(const t of Gm.values())xc(t,n);return!0}function Po(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Ge(n){return n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wm={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},pt=new pr("app","Firebase",Wm);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Km{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Mt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw pt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const In=qm;function zu(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Ji,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw pt.create("bad-app-name",{appName:String(s)});if(t||(t=$u()),!t)throw pt.create("no-options");const o=ys.get(s);if(o){if(gs(t,o.options)&&gs(r,o.config))return o;throw pt.create("duplicate-app",{appName:s})}const a=new em(s);for(const u of Yi.values())a.addComponent(u);const c=new Km(t,r,a);return ys.set(s,c),c}function Gu(n=Ji){const e=ys.get(n);if(!e&&n===Ji&&$u())return zu();if(!e)throw pt.create("no-app",{appName:n});return e}function mt(n,e,t){var r;let s=(r=zm[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const o=s.match(/\s|\//),a=e.match(/\s|\//);if(o||a){const c=[`Unable to register library "${s}" with version "${e}":`];o&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),o&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Je.warn(c.join(" "));return}hn(new Mt(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qm="firebase-heartbeat-database",Jm=1,ar="firebase-heartbeat-store";let Ci=null;function Wu(){return Ci||(Ci=fm(Qm,Jm,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(ar)}catch(t){console.warn(t)}}}}).catch(n=>{throw pt.create("idb-open",{originalErrorMessage:n.message})})),Ci}async function Ym(n){try{const t=(await Wu()).transaction(ar),r=await t.objectStore(ar).get(Ku(n));return await t.done,r}catch(e){if(e instanceof et)Je.warn(e.message);else{const t=pt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Je.warn(t.message)}}}async function Fc(n,e){try{const r=(await Wu()).transaction(ar,"readwrite");await r.objectStore(ar).put(e,Ku(n)),await r.done}catch(t){if(t instanceof et)Je.warn(t.message);else{const r=pt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Je.warn(r.message)}}}function Ku(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xm=1024,Zm=30*24*60*60*1e3;class eg{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new ng(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=Bc();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o)?void 0:(this._heartbeatsCache.heartbeats.push({date:o,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=Zm}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Je.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Bc(),{heartbeatsToSend:r,unsentEntries:s}=tg(this._heartbeatsCache.heartbeats),o=ms(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return Je.warn(t),""}}}function Bc(){return new Date().toISOString().substring(0,10)}function tg(n,e=Xm){const t=[];let r=n.slice();for(const s of n){const o=t.find(a=>a.agent===s.agent);if(o){if(o.dates.push(s.date),Uc(t)>e){o.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Uc(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class ng{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Hp()?jp().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Ym(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Fc(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Fc(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Uc(n){return ms(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rg(n){hn(new Mt("platform-logger",e=>new gm(e),"PRIVATE")),hn(new Mt("heartbeat",e=>new eg(e),"PRIVATE")),mt(Qi,Oc,n),mt(Qi,Oc,"esm2017"),mt("fire-js","")}rg("");var sg="firebase",ig="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */mt(sg,ig,"app");function ko(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function Qu(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const og=Qu,Ju=new pr("auth","Firebase",Qu());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _s=new Co("@firebase/auth");function ag(n,...e){_s.logLevel<=z.WARN&&_s.warn(`Auth (${In}): ${n}`,...e)}function rs(n,...e){_s.logLevel<=z.ERROR&&_s.error(`Auth (${In}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ye(n,...e){throw Do(n,...e)}function Me(n,...e){return Do(n,...e)}function Yu(n,e,t){const r=Object.assign(Object.assign({},og()),{[e]:t});return new pr("auth","Firebase",r).create(e,{appName:n.name})}function gt(n){return Yu(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Do(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Ju.create(n,...e)}function U(n,e,...t){if(!n)throw Do(e,...t)}function We(n){const e="INTERNAL ASSERTION FAILED: "+n;throw rs(e),new Error(e)}function Xe(n,e){n||We(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xi(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function cg(){return $c()==="http:"||$c()==="https:"}function $c(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lg(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(cg()||Fp()||"connection"in navigator)?navigator.onLine:!0}function ug(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gr{constructor(e,t){this.shortDelay=e,this.longDelay=t,Xe(t>e,"Short delay should be less than long delay!"),this.isMobile=Mp()||Bp()}get(){return lg()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function No(n,e){Xe(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xu{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;We("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;We("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;We("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hg={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dg=new gr(3e4,6e4);function Ns(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function En(n,e,t,r,s={}){return Zu(n,s,async()=>{let o={},a={};r&&(e==="GET"?a=r:o={body:JSON.stringify(r)});const c=mr(Object.assign({key:n.config.apiKey},a)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:u},o);return xp()||(d.referrerPolicy="no-referrer"),Xu.fetch()(th(n,n.config.apiHost,t,c),d)})}async function Zu(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},hg),e);try{const s=new fg(n),o=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await o.json();if("needConfirmation"in a)throw Wr(n,"account-exists-with-different-credential",a);if(o.ok&&!("errorMessage"in a))return a;{const c=o.ok?a.errorMessage:a.error.message,[u,d]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Wr(n,"credential-already-in-use",a);if(u==="EMAIL_EXISTS")throw Wr(n,"email-already-in-use",a);if(u==="USER_DISABLED")throw Wr(n,"user-disabled",a);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Yu(n,f,d);Ye(n,f)}}catch(s){if(s instanceof et)throw s;Ye(n,"network-request-failed",{message:String(s)})}}async function eh(n,e,t,r,s={}){const o=await En(n,e,t,r,s);return"mfaPendingCredential"in o&&Ye(n,"multi-factor-auth-required",{_serverResponse:o}),o}function th(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?No(n.config,s):`${n.config.apiScheme}://${s}`}class fg{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Me(this.auth,"network-request-failed")),dg.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Wr(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Me(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function pg(n,e){return En(n,"POST","/v1/accounts:delete",e)}async function nh(n,e){return En(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jn(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function mg(n,e=!1){const t=$t(n),r=await t.getIdToken(e),s=Lo(r);U(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const o=typeof s.firebase=="object"?s.firebase:void 0,a=o==null?void 0:o.sign_in_provider;return{claims:s,token:r,authTime:Jn(Ri(s.auth_time)),issuedAtTime:Jn(Ri(s.iat)),expirationTime:Jn(Ri(s.exp)),signInProvider:a||null,signInSecondFactor:(o==null?void 0:o.sign_in_second_factor)||null}}function Ri(n){return Number(n)*1e3}function Lo(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return rs("JWT malformed, contained fewer than 3 sections"),null;try{const s=Bu(t);return s?JSON.parse(s):(rs("Failed to decode base64 JWT payload"),null)}catch(s){return rs("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Hc(n){const e=Lo(n);return U(e,"internal-error"),U(typeof e.exp<"u","internal-error"),U(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof et&&gg(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function gg({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yg{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Jn(this.lastLoginAt),this.creationTime=Jn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vs(n){var e;const t=n.auth,r=await n.getIdToken(),s=await cr(n,nh(t,{idToken:r}));U(s==null?void 0:s.users.length,t,"internal-error");const o=s.users[0];n._notifyReloadListener(o);const a=!((e=o.providerUserInfo)===null||e===void 0)&&e.length?rh(o.providerUserInfo):[],c=vg(n.providerData,a),u=n.isAnonymous,d=!(n.email&&o.passwordHash)&&!(c!=null&&c.length),f=u?d:!1,_={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:c,metadata:new Zi(o.createdAt,o.lastLoginAt),isAnonymous:f};Object.assign(n,_)}async function _g(n){const e=$t(n);await vs(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function vg(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function rh(n){return n.map(e=>{var{providerId:t}=e,r=ko(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ig(n,e){const t=await Zu(n,{},async()=>{const r=mr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:o}=n.config,a=th(n,s,"/v1/token",`key=${o}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",Xu.fetch()(a,{method:"POST",headers:c,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Eg(n,e){return En(n,"POST","/v2/accounts:revokeToken",Ns(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){U(e.idToken,"internal-error"),U(typeof e.idToken<"u","internal-error"),U(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Hc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){U(e.length!==0,"internal-error");const t=Hc(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(U(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:o}=await Ig(e,t);this.updateTokensAndExpiration(r,s,Number(o))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:o}=t,a=new rn;return r&&(U(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(U(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),o&&(U(typeof o=="number","internal-error",{appName:e}),a.expirationTime=o),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new rn,this.toJSON())}_performRefresh(){return We("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function it(n,e){U(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ke{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,o=ko(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new yg(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=o.displayName||null,this.email=o.email||null,this.emailVerified=o.emailVerified||!1,this.phoneNumber=o.phoneNumber||null,this.photoURL=o.photoURL||null,this.isAnonymous=o.isAnonymous||!1,this.tenantId=o.tenantId||null,this.providerData=o.providerData?[...o.providerData]:[],this.metadata=new Zi(o.createdAt||void 0,o.lastLoginAt||void 0)}async getIdToken(e){const t=await cr(this,this.stsTokenManager.getToken(this.auth,e));return U(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return mg(this,e)}reload(){return _g(this)}_assign(e){this!==e&&(U(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ke(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){U(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await vs(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ge(this.auth.app))return Promise.reject(gt(this.auth));const e=await this.getIdToken();return await cr(this,pg(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,o,a,c,u,d,f;const _=(r=t.displayName)!==null&&r!==void 0?r:void 0,w=(s=t.email)!==null&&s!==void 0?s:void 0,b=(o=t.phoneNumber)!==null&&o!==void 0?o:void 0,k=(a=t.photoURL)!==null&&a!==void 0?a:void 0,C=(c=t.tenantId)!==null&&c!==void 0?c:void 0,P=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,O=(d=t.createdAt)!==null&&d!==void 0?d:void 0,H=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:q,emailVerified:N,isAnonymous:x,providerData:V,stsTokenManager:I}=t;U(q&&I,e,"internal-error");const g=rn.fromJSON(this.name,I);U(typeof q=="string",e,"internal-error"),it(_,e.name),it(w,e.name),U(typeof N=="boolean",e,"internal-error"),U(typeof x=="boolean",e,"internal-error"),it(b,e.name),it(k,e.name),it(C,e.name),it(P,e.name),it(O,e.name),it(H,e.name);const m=new Ke({uid:q,auth:e,email:w,emailVerified:N,displayName:_,isAnonymous:x,photoURL:k,phoneNumber:b,tenantId:C,stsTokenManager:g,createdAt:O,lastLoginAt:H});return V&&Array.isArray(V)&&(m.providerData=V.map(v=>Object.assign({},v))),P&&(m._redirectEventId=P),m}static async _fromIdTokenResponse(e,t,r=!1){const s=new rn;s.updateFromServerResponse(t);const o=new Ke({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await vs(o),o}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];U(s.localId!==void 0,"internal-error");const o=s.providerUserInfo!==void 0?rh(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(o!=null&&o.length),c=new rn;c.updateFromIdToken(r);const u=new Ke({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Zi(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(o!=null&&o.length)};return Object.assign(u,d),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jc=new Map;function Qe(n){Xe(n instanceof Function,"Expected a class definition");let e=jc.get(n);return e?(Xe(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,jc.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sh{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}sh.type="NONE";const qc=sh;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ss(n,e,t){return`firebase:${n}:${e}:${t}`}class sn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:o}=this.auth;this.fullUserKey=ss(this.userKey,s.apiKey,o),this.fullPersistenceKey=ss("persistence",s.apiKey,o),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Ke._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new sn(Qe(qc),e,r);const s=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let o=s[0]||Qe(qc);const a=ss(r,e.config.apiKey,e.name);let c=null;for(const d of t)try{const f=await d._get(a);if(f){const _=Ke._fromJSON(e,f);d!==o&&(c=_),o=d;break}}catch{}const u=s.filter(d=>d._shouldAllowMigration);return!o._shouldAllowMigration||!u.length?new sn(o,e,r):(o=u[0],c&&await o._set(a,c.toJSON()),await Promise.all(t.map(async d=>{if(d!==o)try{await d._remove(a)}catch{}})),new sn(o,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zc(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ch(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(ih(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(uh(e))return"Blackberry";if(hh(e))return"Webos";if(oh(e))return"Safari";if((e.includes("chrome/")||ah(e))&&!e.includes("edge/"))return"Chrome";if(lh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function ih(n=Ee()){return/firefox\//i.test(n)}function oh(n=Ee()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function ah(n=Ee()){return/crios\//i.test(n)}function ch(n=Ee()){return/iemobile/i.test(n)}function lh(n=Ee()){return/android/i.test(n)}function uh(n=Ee()){return/blackberry/i.test(n)}function hh(n=Ee()){return/webos/i.test(n)}function Vo(n=Ee()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Tg(n=Ee()){var e;return Vo(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function wg(){return Up()&&document.documentMode===10}function dh(n=Ee()){return Vo(n)||lh(n)||hh(n)||uh(n)||/windows phone/i.test(n)||ch(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fh(n,e=[]){let t;switch(n){case"Browser":t=zc(Ee());break;case"Worker":t=`${zc(Ee())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${In}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ag{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=o=>new Promise((a,c)=>{try{const u=e(o);a(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sg(n,e={}){return En(n,"GET","/v2/passwordPolicy",Ns(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bg=6;class Cg{constructor(e){var t,r,s,o;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:bg,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(o=e.forceUpgradeOnSignin)!==null&&o!==void 0?o:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,o,a,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsUppercaseLetter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(a=u.containsNumericCharacter)!==null&&a!==void 0?a:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,o){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rg{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Gc(this),this.idTokenSubscription=new Gc(this),this.beforeStateQueue=new Ag(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Ju,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Qe(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await sn.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await nh(this,{idToken:e}),r=await Ke._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Ge(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,o=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!a||a===c)&&(u!=null&&u.user)&&(s=u.user,o=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(o)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return U(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await vs(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ug()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ge(this.app))return Promise.reject(gt(this));const t=e?$t(e):null;return t&&U(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&U(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ge(this.app)?Promise.reject(gt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ge(this.app)?Promise.reject(gt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Qe(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Sg(this),t=new Cg(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new pr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Eg(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Qe(e)||this._popupRedirectResolver;U(t,this,"argument-error"),this.redirectPersistenceManager=await sn.create(this,[Qe(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const o=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(U(c,this,"internal-error"),c.then(()=>{a||o(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{a=!0,u()}}else{const u=e.addObserver(t);return()=>{a=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return U(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=fh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&ag(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Ls(n){return $t(n)}class Gc{constructor(e){this.auth=e,this.observer=null,this.addObserver=Kp(t=>this.observer=t)}get next(){return U(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Mo={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Pg(n){Mo=n}function kg(n){return Mo.loadJS(n)}function Dg(){return Mo.gapiScript}function Ng(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lg(n,e){const t=Po(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),o=t.getOptions();if(gs(o,e??{}))return s;Ye(s,"already-initialized")}return t.initialize({options:e})}function Vg(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Qe);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Mg(n,e,t){const r=Ls(n);U(r._canInitEmulator,r,"emulator-config-failed"),U(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,o=ph(e),{host:a,port:c}=Og(e),u=c===null?"":`:${c}`;r.config.emulator={url:`${o}//${a}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:c,protocol:o.replace(":",""),options:Object.freeze({disableWarnings:s})}),xg()}function ph(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Og(n){const e=ph(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const o=s[1];return{host:o,port:Wc(r.substr(o.length+1))}}else{const[o,a]=r.split(":");return{host:o,port:Wc(a)}}}function Wc(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function xg(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return We("not implemented")}_getIdTokenResponse(e){return We("not implemented")}_linkToIdToken(e,t){return We("not implemented")}_getReauthenticationResolver(e){return We("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function on(n,e){return eh(n,"POST","/v1/accounts:signInWithIdp",Ns(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fg="http://localhost";class Ot extends mh{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Ot(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Ye("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,o=ko(t,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Ot(r,s);return a.idToken=o.idToken||void 0,a.accessToken=o.accessToken||void 0,a.secret=o.secret,a.nonce=o.nonce,a.pendingToken=o.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return on(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,on(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,on(e,t)}buildRequest(){const e={requestUri:Fg,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=mr(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gh{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yr extends gh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at extends yr{constructor(){super("facebook.com")}static credential(e){return Ot._fromParams({providerId:at.PROVIDER_ID,signInMethod:at.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return at.credentialFromTaggedObject(e)}static credentialFromError(e){return at.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return at.credential(e.oauthAccessToken)}catch{return null}}}at.FACEBOOK_SIGN_IN_METHOD="facebook.com";at.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct extends yr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Ot._fromParams({providerId:ct.PROVIDER_ID,signInMethod:ct.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return ct.credentialFromTaggedObject(e)}static credentialFromError(e){return ct.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return ct.credential(t,r)}catch{return null}}}ct.GOOGLE_SIGN_IN_METHOD="google.com";ct.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt extends yr{constructor(){super("github.com")}static credential(e){return Ot._fromParams({providerId:lt.PROVIDER_ID,signInMethod:lt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return lt.credentialFromTaggedObject(e)}static credentialFromError(e){return lt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return lt.credential(e.oauthAccessToken)}catch{return null}}}lt.GITHUB_SIGN_IN_METHOD="github.com";lt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut extends yr{constructor(){super("twitter.com")}static credential(e,t){return Ot._fromParams({providerId:ut.PROVIDER_ID,signInMethod:ut.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ut.credentialFromTaggedObject(e)}static credentialFromError(e){return ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ut.credential(t,r)}catch{return null}}}ut.TWITTER_SIGN_IN_METHOD="twitter.com";ut.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bg(n,e){return eh(n,"POST","/v1/accounts:signUp",Ns(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const o=await Ke._fromIdTokenResponse(e,r,s),a=Kc(r);return new yt({user:o,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Kc(r);return new yt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Kc(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ug(n){var e;if(Ge(n.app))return Promise.reject(gt(n));const t=Ls(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new yt({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await Bg(t,{returnSecureToken:!0}),s=await yt._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Is extends et{constructor(e,t,r,s){var o;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Is.prototype),this.customData={appName:e.name,tenantId:(o=e.tenantId)!==null&&o!==void 0?o:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Is(e,t,r,s)}}function yh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(o=>{throw o.code==="auth/multi-factor-auth-required"?Is._fromErrorAndOperation(n,o,e,r):o})}async function $g(n,e,t=!1){const r=await cr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return yt._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hg(n,e,t=!1){const{auth:r}=n;if(Ge(r.app))return Promise.reject(gt(r));const s="reauthenticate";try{const o=await cr(n,yh(r,s,e,n),t);U(o.idToken,r,"internal-error");const a=Lo(o.idToken);U(a,r,"internal-error");const{sub:c}=a;return U(n.uid===c,r,"user-mismatch"),yt._forOperation(n,s,o)}catch(o){throw(o==null?void 0:o.code)==="auth/user-not-found"&&Ye(r,"user-mismatch"),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jg(n,e,t=!1){if(Ge(n.app))return Promise.reject(gt(n));const r="signIn",s=await yh(n,r,e),o=await yt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(o.user),o}function qg(n,e,t,r){return $t(n).onIdTokenChanged(e,t,r)}function zg(n,e,t){return $t(n).beforeAuthStateChanged(e,t)}const Es="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _h{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Es,"1"),this.storage.removeItem(Es),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gg=1e3,Wg=10;class vh extends _h{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=dh(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,u)=>{this.notifyListeners(a,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},o=this.storage.getItem(r);wg()&&o!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,Wg):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Gg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}vh.type="LOCAL";const Kg=vh;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ih extends _h{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Ih.type="SESSION";const Eh=Ih;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qg(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Vs(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:o}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async d=>d(t.origin,o)),u=await Qg(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Vs.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oo(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jg{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let o,a;return new Promise((c,u)=>{const d=Oo("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(_){const w=_;if(w.data.eventId===d)switch(w.data.status){case"ack":clearTimeout(f),o=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(o),c(w.data.response);break;default:clearTimeout(f),clearTimeout(o),u(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(){return window}function Yg(n){Oe().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Th(){return typeof Oe().WorkerGlobalScope<"u"&&typeof Oe().importScripts=="function"}async function Xg(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Zg(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function ey(){return Th()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wh="firebaseLocalStorageDb",ty=1,Ts="firebaseLocalStorage",Ah="fbase_key";class _r{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ms(n,e){return n.transaction([Ts],e?"readwrite":"readonly").objectStore(Ts)}function ny(){const n=indexedDB.deleteDatabase(wh);return new _r(n).toPromise()}function eo(){const n=indexedDB.open(wh,ty);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Ts,{keyPath:Ah})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Ts)?e(r):(r.close(),await ny(),e(await eo()))})})}async function Qc(n,e,t){const r=Ms(n,!0).put({[Ah]:e,value:t});return new _r(r).toPromise()}async function ry(n,e){const t=Ms(n,!1).get(e),r=await new _r(t).toPromise();return r===void 0?null:r.value}function Jc(n,e){const t=Ms(n,!0).delete(e);return new _r(t).toPromise()}const sy=800,iy=3;class Sh{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await eo(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>iy)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Th()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Vs._getInstance(ey()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Xg(),!this.activeServiceWorker)return;this.sender=new Jg(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Zg()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await eo();return await Qc(e,Es,"1"),await Jc(e,Es),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Qc(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>ry(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Jc(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const o=Ms(s,!1).getAll();return new _r(o).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:o}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(o)&&(this.notifyListeners(s,o),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),sy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Sh.type="LOCAL";const oy=Sh;new gr(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ay(n,e){return e?Qe(e):(U(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xo extends mh{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return on(e,this._buildIdpRequest())}_linkToIdToken(e,t){return on(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return on(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function cy(n){return jg(n.auth,new xo(n),n.bypassAuthState)}function ly(n){const{auth:e,user:t}=n;return U(t,e,"internal-error"),Hg(t,new xo(n),n.bypassAuthState)}async function uy(n){const{auth:e,user:t}=n;return U(t,e,"internal-error"),$g(t,new xo(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(e,t,r,s,o=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=o,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:o,error:a,type:c}=e;if(a){this.reject(a);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:o||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return cy;case"linkViaPopup":case"linkViaRedirect":return uy;case"reauthViaPopup":case"reauthViaRedirect":return ly;default:Ye(this.auth,"internal-error")}}resolve(e){Xe(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Xe(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hy=new gr(2e3,1e4);class nn extends bh{constructor(e,t,r,s,o){super(e,t,s,o),this.provider=r,this.authWindow=null,this.pollId=null,nn.currentPopupAction&&nn.currentPopupAction.cancel(),nn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return U(e,this.auth,"internal-error"),e}async onExecution(){Xe(this.filter.length===1,"Popup operations only handle one event");const e=Oo();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Me(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Me(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,nn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Me(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,hy.get())};e()}}nn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dy="pendingRedirect",is=new Map;class fy extends bh{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=is.get(this.auth._key());if(!e){try{const r=await py(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}is.set(this.auth._key(),e)}return this.bypassAuthState||is.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function py(n,e){const t=yy(e),r=gy(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function my(n,e){is.set(n._key(),e)}function gy(n){return Qe(n._redirectPersistence)}function yy(n){return ss(dy,n.config.apiKey,n.name)}async function _y(n,e,t=!1){if(Ge(n.app))return Promise.reject(gt(n));const r=Ls(n),s=ay(r,e),a=await new fy(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vy=10*60*1e3;class Iy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ey(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Ch(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Me(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=vy&&this.cachedEventUids.clear(),this.cachedEventUids.has(Yc(e))}saveEventToCache(e){this.cachedEventUids.add(Yc(e)),this.lastProcessedEventTime=Date.now()}}function Yc(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Ch({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Ey(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Ch(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ty(n,e={}){return En(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wy=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ay=/^https?/;async function Sy(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Ty(n);for(const t of e)try{if(by(t))return}catch{}Ye(n,"unauthorized-domain")}function by(n){const e=Xi(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Ay.test(t))return!1;if(wy.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cy=new gr(3e4,6e4);function Xc(){const n=Oe().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Ry(n){return new Promise((e,t)=>{var r,s,o;function a(){Xc(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Xc(),t(Me(n,"network-request-failed"))},timeout:Cy.get()})}if(!((s=(r=Oe().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((o=Oe().gapi)===null||o===void 0)&&o.load)a();else{const c=Ng("iframefcb");return Oe()[c]=()=>{gapi.load?a():t(Me(n,"network-request-failed"))},kg(`${Dg()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw os=null,e})}let os=null;function Py(n){return os=os||Ry(n),os}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ky=new gr(5e3,15e3),Dy="__/auth/iframe",Ny="emulator/auth/iframe",Ly={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Vy=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function My(n){const e=n.config;U(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?No(e,Ny):`https://${n.config.authDomain}/${Dy}`,r={apiKey:e.apiKey,appName:n.name,v:In},s=Vy.get(n.config.apiHost);s&&(r.eid=s);const o=n._getFrameworks();return o.length&&(r.fw=o.join(",")),`${t}?${mr(r).slice(1)}`}async function Oy(n){const e=await Py(n),t=Oe().gapi;return U(t,n,"internal-error"),e.open({where:document.body,url:My(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Ly,dontclear:!0},r=>new Promise(async(s,o)=>{await r.restyle({setHideOnLeave:!1});const a=Me(n,"network-request-failed"),c=Oe().setTimeout(()=>{o(a)},ky.get());function u(){Oe().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{o(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Fy=500,By=600,Uy="_blank",$y="http://localhost";class Zc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Hy(n,e,t,r=Fy,s=By){const o=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u=Object.assign(Object.assign({},xy),{width:r.toString(),height:s.toString(),top:o,left:a}),d=Ee().toLowerCase();t&&(c=ah(d)?Uy:t),ih(d)&&(e=e||$y,u.scrollbars="yes");const f=Object.entries(u).reduce((w,[b,k])=>`${w}${b}=${k},`,"");if(Tg(d)&&c!=="_self")return jy(e||"",c),new Zc(null);const _=window.open(e||"",c,f);U(_,n,"popup-blocked");try{_.focus()}catch{}return new Zc(_)}function jy(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qy="__/auth/handler",zy="emulator/auth/handler",Gy=encodeURIComponent("fac");async function el(n,e,t,r,s,o){U(n.config.authDomain,n,"auth-domain-config-required"),U(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:In,eventId:s};if(e instanceof gh){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Wp(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,_]of Object.entries({}))a[f]=_}if(e instanceof yr){const f=e.getScopes().filter(_=>_!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),d=u?`#${Gy}=${encodeURIComponent(u)}`:"";return`${Wy(n)}?${mr(c).slice(1)}${d}`}function Wy({config:n}){return n.emulator?No(n,zy):`https://${n.authDomain}/${qy}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pi="webStorageSupport";class Ky{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Eh,this._completeRedirectFn=_y,this._overrideRedirectResult=my}async _openPopup(e,t,r,s){var o;Xe((o=this.eventManagers[e._key()])===null||o===void 0?void 0:o.manager,"_initialize() not called before _openPopup()");const a=await el(e,t,r,Xi(),s);return Hy(e,a,Oo())}async _openRedirect(e,t,r,s){await this._originValidation(e);const o=await el(e,t,r,Xi(),s);return Yg(o),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:o}=this.eventManagers[t];return s?Promise.resolve(s):(Xe(o,"If manager is not set, promise should be"),o)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Oy(e),r=new Iy(e);return t.register("authEvent",s=>(U(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Pi,{type:Pi},s=>{var o;const a=(o=s==null?void 0:s[0])===null||o===void 0?void 0:o[Pi];a!==void 0&&t(!!a),Ye(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Sy(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return dh()||oh()||Vo()}}const Qy=Ky;var tl="@firebase/auth",nl="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jy{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){U(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yy(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Xy(n){hn(new Mt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),o=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;U(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:fh(n)},d=new Rg(r,s,o,u);return Vg(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),hn(new Mt("auth-internal",e=>{const t=Ls(e.getProvider("auth").getImmediate());return(r=>new Jy(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),mt(tl,nl,Yy(n)),mt(tl,nl,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zy=5*60,e_=Hu("authIdTokenMaxAge")||Zy;let rl=null;const t_=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>e_)return;const s=t==null?void 0:t.token;rl!==s&&(rl=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function n_(n=Gu()){const e=Po(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Lg(n,{popupRedirectResolver:Qy,persistence:[oy,Kg,Eh]}),r=Hu("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const o=new URL(r,location.origin);if(location.origin===o.origin){const a=t_(o.toString());zg(t,a,()=>a(t.currentUser)),qg(t,c=>a(c))}}const s=Uu("auth");return s&&Mg(t,`http://${s}`),t}function r_(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Pg({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const o=Me("internal-error");o.customData=s,t(o)},r.type="text/javascript",r.charset="UTF-8",r_().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Xy("Browser");var sl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Nt,Rh;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,g){function m(){}m.prototype=g.prototype,I.D=g.prototype,I.prototype=new m,I.prototype.constructor=I,I.C=function(v,E,T){for(var y=Array(arguments.length-2),X=2;X<arguments.length;X++)y[X-2]=arguments[X];return g.prototype[E].apply(v,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,g,m){m||(m=0);var v=Array(16);if(typeof g=="string")for(var E=0;16>E;++E)v[E]=g.charCodeAt(m++)|g.charCodeAt(m++)<<8|g.charCodeAt(m++)<<16|g.charCodeAt(m++)<<24;else for(E=0;16>E;++E)v[E]=g[m++]|g[m++]<<8|g[m++]<<16|g[m++]<<24;g=I.g[0],m=I.g[1],E=I.g[2];var T=I.g[3],y=g+(T^m&(E^T))+v[0]+3614090360&4294967295;g=m+(y<<7&4294967295|y>>>25),y=T+(E^g&(m^E))+v[1]+3905402710&4294967295,T=g+(y<<12&4294967295|y>>>20),y=E+(m^T&(g^m))+v[2]+606105819&4294967295,E=T+(y<<17&4294967295|y>>>15),y=m+(g^E&(T^g))+v[3]+3250441966&4294967295,m=E+(y<<22&4294967295|y>>>10),y=g+(T^m&(E^T))+v[4]+4118548399&4294967295,g=m+(y<<7&4294967295|y>>>25),y=T+(E^g&(m^E))+v[5]+1200080426&4294967295,T=g+(y<<12&4294967295|y>>>20),y=E+(m^T&(g^m))+v[6]+2821735955&4294967295,E=T+(y<<17&4294967295|y>>>15),y=m+(g^E&(T^g))+v[7]+4249261313&4294967295,m=E+(y<<22&4294967295|y>>>10),y=g+(T^m&(E^T))+v[8]+1770035416&4294967295,g=m+(y<<7&4294967295|y>>>25),y=T+(E^g&(m^E))+v[9]+2336552879&4294967295,T=g+(y<<12&4294967295|y>>>20),y=E+(m^T&(g^m))+v[10]+4294925233&4294967295,E=T+(y<<17&4294967295|y>>>15),y=m+(g^E&(T^g))+v[11]+2304563134&4294967295,m=E+(y<<22&4294967295|y>>>10),y=g+(T^m&(E^T))+v[12]+1804603682&4294967295,g=m+(y<<7&4294967295|y>>>25),y=T+(E^g&(m^E))+v[13]+4254626195&4294967295,T=g+(y<<12&4294967295|y>>>20),y=E+(m^T&(g^m))+v[14]+2792965006&4294967295,E=T+(y<<17&4294967295|y>>>15),y=m+(g^E&(T^g))+v[15]+1236535329&4294967295,m=E+(y<<22&4294967295|y>>>10),y=g+(E^T&(m^E))+v[1]+4129170786&4294967295,g=m+(y<<5&4294967295|y>>>27),y=T+(m^E&(g^m))+v[6]+3225465664&4294967295,T=g+(y<<9&4294967295|y>>>23),y=E+(g^m&(T^g))+v[11]+643717713&4294967295,E=T+(y<<14&4294967295|y>>>18),y=m+(T^g&(E^T))+v[0]+3921069994&4294967295,m=E+(y<<20&4294967295|y>>>12),y=g+(E^T&(m^E))+v[5]+3593408605&4294967295,g=m+(y<<5&4294967295|y>>>27),y=T+(m^E&(g^m))+v[10]+38016083&4294967295,T=g+(y<<9&4294967295|y>>>23),y=E+(g^m&(T^g))+v[15]+3634488961&4294967295,E=T+(y<<14&4294967295|y>>>18),y=m+(T^g&(E^T))+v[4]+3889429448&4294967295,m=E+(y<<20&4294967295|y>>>12),y=g+(E^T&(m^E))+v[9]+568446438&4294967295,g=m+(y<<5&4294967295|y>>>27),y=T+(m^E&(g^m))+v[14]+3275163606&4294967295,T=g+(y<<9&4294967295|y>>>23),y=E+(g^m&(T^g))+v[3]+4107603335&4294967295,E=T+(y<<14&4294967295|y>>>18),y=m+(T^g&(E^T))+v[8]+1163531501&4294967295,m=E+(y<<20&4294967295|y>>>12),y=g+(E^T&(m^E))+v[13]+2850285829&4294967295,g=m+(y<<5&4294967295|y>>>27),y=T+(m^E&(g^m))+v[2]+4243563512&4294967295,T=g+(y<<9&4294967295|y>>>23),y=E+(g^m&(T^g))+v[7]+1735328473&4294967295,E=T+(y<<14&4294967295|y>>>18),y=m+(T^g&(E^T))+v[12]+2368359562&4294967295,m=E+(y<<20&4294967295|y>>>12),y=g+(m^E^T)+v[5]+4294588738&4294967295,g=m+(y<<4&4294967295|y>>>28),y=T+(g^m^E)+v[8]+2272392833&4294967295,T=g+(y<<11&4294967295|y>>>21),y=E+(T^g^m)+v[11]+1839030562&4294967295,E=T+(y<<16&4294967295|y>>>16),y=m+(E^T^g)+v[14]+4259657740&4294967295,m=E+(y<<23&4294967295|y>>>9),y=g+(m^E^T)+v[1]+2763975236&4294967295,g=m+(y<<4&4294967295|y>>>28),y=T+(g^m^E)+v[4]+1272893353&4294967295,T=g+(y<<11&4294967295|y>>>21),y=E+(T^g^m)+v[7]+4139469664&4294967295,E=T+(y<<16&4294967295|y>>>16),y=m+(E^T^g)+v[10]+3200236656&4294967295,m=E+(y<<23&4294967295|y>>>9),y=g+(m^E^T)+v[13]+681279174&4294967295,g=m+(y<<4&4294967295|y>>>28),y=T+(g^m^E)+v[0]+3936430074&4294967295,T=g+(y<<11&4294967295|y>>>21),y=E+(T^g^m)+v[3]+3572445317&4294967295,E=T+(y<<16&4294967295|y>>>16),y=m+(E^T^g)+v[6]+76029189&4294967295,m=E+(y<<23&4294967295|y>>>9),y=g+(m^E^T)+v[9]+3654602809&4294967295,g=m+(y<<4&4294967295|y>>>28),y=T+(g^m^E)+v[12]+3873151461&4294967295,T=g+(y<<11&4294967295|y>>>21),y=E+(T^g^m)+v[15]+530742520&4294967295,E=T+(y<<16&4294967295|y>>>16),y=m+(E^T^g)+v[2]+3299628645&4294967295,m=E+(y<<23&4294967295|y>>>9),y=g+(E^(m|~T))+v[0]+4096336452&4294967295,g=m+(y<<6&4294967295|y>>>26),y=T+(m^(g|~E))+v[7]+1126891415&4294967295,T=g+(y<<10&4294967295|y>>>22),y=E+(g^(T|~m))+v[14]+2878612391&4294967295,E=T+(y<<15&4294967295|y>>>17),y=m+(T^(E|~g))+v[5]+4237533241&4294967295,m=E+(y<<21&4294967295|y>>>11),y=g+(E^(m|~T))+v[12]+1700485571&4294967295,g=m+(y<<6&4294967295|y>>>26),y=T+(m^(g|~E))+v[3]+2399980690&4294967295,T=g+(y<<10&4294967295|y>>>22),y=E+(g^(T|~m))+v[10]+4293915773&4294967295,E=T+(y<<15&4294967295|y>>>17),y=m+(T^(E|~g))+v[1]+2240044497&4294967295,m=E+(y<<21&4294967295|y>>>11),y=g+(E^(m|~T))+v[8]+1873313359&4294967295,g=m+(y<<6&4294967295|y>>>26),y=T+(m^(g|~E))+v[15]+4264355552&4294967295,T=g+(y<<10&4294967295|y>>>22),y=E+(g^(T|~m))+v[6]+2734768916&4294967295,E=T+(y<<15&4294967295|y>>>17),y=m+(T^(E|~g))+v[13]+1309151649&4294967295,m=E+(y<<21&4294967295|y>>>11),y=g+(E^(m|~T))+v[4]+4149444226&4294967295,g=m+(y<<6&4294967295|y>>>26),y=T+(m^(g|~E))+v[11]+3174756917&4294967295,T=g+(y<<10&4294967295|y>>>22),y=E+(g^(T|~m))+v[2]+718787259&4294967295,E=T+(y<<15&4294967295|y>>>17),y=m+(T^(E|~g))+v[9]+3951481745&4294967295,I.g[0]=I.g[0]+g&4294967295,I.g[1]=I.g[1]+(E+(y<<21&4294967295|y>>>11))&4294967295,I.g[2]=I.g[2]+E&4294967295,I.g[3]=I.g[3]+T&4294967295}r.prototype.u=function(I,g){g===void 0&&(g=I.length);for(var m=g-this.blockSize,v=this.B,E=this.h,T=0;T<g;){if(E==0)for(;T<=m;)s(this,I,T),T+=this.blockSize;if(typeof I=="string"){for(;T<g;)if(v[E++]=I.charCodeAt(T++),E==this.blockSize){s(this,v),E=0;break}}else for(;T<g;)if(v[E++]=I[T++],E==this.blockSize){s(this,v),E=0;break}}this.h=E,this.o+=g},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var g=1;g<I.length-8;++g)I[g]=0;var m=8*this.o;for(g=I.length-8;g<I.length;++g)I[g]=m&255,m/=256;for(this.u(I),I=Array(16),g=m=0;4>g;++g)for(var v=0;32>v;v+=8)I[m++]=this.g[g]>>>v&255;return I};function o(I,g){var m=c;return Object.prototype.hasOwnProperty.call(m,I)?m[I]:m[I]=g(I)}function a(I,g){this.h=g;for(var m=[],v=!0,E=I.length-1;0<=E;E--){var T=I[E]|0;v&&T==g||(m[E]=T,v=!1)}this.g=m}var c={};function u(I){return-128<=I&&128>I?o(I,function(g){return new a([g|0],0>g?-1:0)}):new a([I|0],0>I?-1:0)}function d(I){if(isNaN(I)||!isFinite(I))return _;if(0>I)return P(d(-I));for(var g=[],m=1,v=0;I>=m;v++)g[v]=I/m|0,m*=4294967296;return new a(g,0)}function f(I,g){if(I.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(I.charAt(0)=="-")return P(f(I.substring(1),g));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var m=d(Math.pow(g,8)),v=_,E=0;E<I.length;E+=8){var T=Math.min(8,I.length-E),y=parseInt(I.substring(E,E+T),g);8>T?(T=d(Math.pow(g,T)),v=v.j(T).add(d(y))):(v=v.j(m),v=v.add(d(y)))}return v}var _=u(0),w=u(1),b=u(16777216);n=a.prototype,n.m=function(){if(C(this))return-P(this).m();for(var I=0,g=1,m=0;m<this.g.length;m++){var v=this.i(m);I+=(0<=v?v:4294967296+v)*g,g*=4294967296}return I},n.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(k(this))return"0";if(C(this))return"-"+P(this).toString(I);for(var g=d(Math.pow(I,6)),m=this,v="";;){var E=N(m,g).g;m=O(m,E.j(g));var T=((0<m.g.length?m.g[0]:m.h)>>>0).toString(I);if(m=E,k(m))return T+v;for(;6>T.length;)T="0"+T;v=T+v}},n.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function k(I){if(I.h!=0)return!1;for(var g=0;g<I.g.length;g++)if(I.g[g]!=0)return!1;return!0}function C(I){return I.h==-1}n.l=function(I){return I=O(this,I),C(I)?-1:k(I)?0:1};function P(I){for(var g=I.g.length,m=[],v=0;v<g;v++)m[v]=~I.g[v];return new a(m,~I.h).add(w)}n.abs=function(){return C(this)?P(this):this},n.add=function(I){for(var g=Math.max(this.g.length,I.g.length),m=[],v=0,E=0;E<=g;E++){var T=v+(this.i(E)&65535)+(I.i(E)&65535),y=(T>>>16)+(this.i(E)>>>16)+(I.i(E)>>>16);v=y>>>16,T&=65535,y&=65535,m[E]=y<<16|T}return new a(m,m[m.length-1]&-2147483648?-1:0)};function O(I,g){return I.add(P(g))}n.j=function(I){if(k(this)||k(I))return _;if(C(this))return C(I)?P(this).j(P(I)):P(P(this).j(I));if(C(I))return P(this.j(P(I)));if(0>this.l(b)&&0>I.l(b))return d(this.m()*I.m());for(var g=this.g.length+I.g.length,m=[],v=0;v<2*g;v++)m[v]=0;for(v=0;v<this.g.length;v++)for(var E=0;E<I.g.length;E++){var T=this.i(v)>>>16,y=this.i(v)&65535,X=I.i(E)>>>16,$e=I.i(E)&65535;m[2*v+2*E]+=y*$e,H(m,2*v+2*E),m[2*v+2*E+1]+=T*$e,H(m,2*v+2*E+1),m[2*v+2*E+1]+=y*X,H(m,2*v+2*E+1),m[2*v+2*E+2]+=T*X,H(m,2*v+2*E+2)}for(v=0;v<g;v++)m[v]=m[2*v+1]<<16|m[2*v];for(v=g;v<2*g;v++)m[v]=0;return new a(m,0)};function H(I,g){for(;(I[g]&65535)!=I[g];)I[g+1]+=I[g]>>>16,I[g]&=65535,g++}function q(I,g){this.g=I,this.h=g}function N(I,g){if(k(g))throw Error("division by zero");if(k(I))return new q(_,_);if(C(I))return g=N(P(I),g),new q(P(g.g),P(g.h));if(C(g))return g=N(I,P(g)),new q(P(g.g),g.h);if(30<I.g.length){if(C(I)||C(g))throw Error("slowDivide_ only works with positive integers.");for(var m=w,v=g;0>=v.l(I);)m=x(m),v=x(v);var E=V(m,1),T=V(v,1);for(v=V(v,2),m=V(m,2);!k(v);){var y=T.add(v);0>=y.l(I)&&(E=E.add(m),T=y),v=V(v,1),m=V(m,1)}return g=O(I,E.j(g)),new q(E,g)}for(E=_;0<=I.l(g);){for(m=Math.max(1,Math.floor(I.m()/g.m())),v=Math.ceil(Math.log(m)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),T=d(m),y=T.j(g);C(y)||0<y.l(I);)m-=v,T=d(m),y=T.j(g);k(T)&&(T=w),E=E.add(T),I=O(I,y)}return new q(E,I)}n.A=function(I){return N(this,I).h},n.and=function(I){for(var g=Math.max(this.g.length,I.g.length),m=[],v=0;v<g;v++)m[v]=this.i(v)&I.i(v);return new a(m,this.h&I.h)},n.or=function(I){for(var g=Math.max(this.g.length,I.g.length),m=[],v=0;v<g;v++)m[v]=this.i(v)|I.i(v);return new a(m,this.h|I.h)},n.xor=function(I){for(var g=Math.max(this.g.length,I.g.length),m=[],v=0;v<g;v++)m[v]=this.i(v)^I.i(v);return new a(m,this.h^I.h)};function x(I){for(var g=I.g.length+1,m=[],v=0;v<g;v++)m[v]=I.i(v)<<1|I.i(v-1)>>>31;return new a(m,I.h)}function V(I,g){var m=g>>5;g%=32;for(var v=I.g.length-m,E=[],T=0;T<v;T++)E[T]=0<g?I.i(T+m)>>>g|I.i(T+m+1)<<32-g:I.i(T+m);return new a(E,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Rh=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,Nt=a}).apply(typeof sl<"u"?sl:typeof self<"u"?self:typeof window<"u"?window:{});var Kr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ph,zn,kh,as,to,Dh,Nh,Lh;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,l,h){return i==Array.prototype||i==Object.prototype||(i[l]=h.value),i};function t(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof Kr=="object"&&Kr];for(var l=0;l<i.length;++l){var h=i[l];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(i,l){if(l)e:{var h=r;i=i.split(".");for(var p=0;p<i.length-1;p++){var A=i[p];if(!(A in h))break e;h=h[A]}i=i[i.length-1],p=h[i],l=l(p),l!=p&&l!=null&&e(h,i,{configurable:!0,writable:!0,value:l})}}function o(i,l){i instanceof String&&(i+="");var h=0,p=!1,A={next:function(){if(!p&&h<i.length){var S=h++;return{value:l(S,i[S]),done:!1}}return p=!0,{done:!0,value:void 0}}};return A[Symbol.iterator]=function(){return A},A}s("Array.prototype.values",function(i){return i||function(){return o(this,function(l,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function u(i){var l=typeof i;return l=l!="object"?l:i?Array.isArray(i)?"array":l:"null",l=="array"||l=="object"&&typeof i.length=="number"}function d(i){var l=typeof i;return l=="object"&&i!=null||l=="function"}function f(i,l,h){return i.call.apply(i.bind,arguments)}function _(i,l,h){if(!i)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var A=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(A,p),i.apply(l,A)}}return function(){return i.apply(l,arguments)}}function w(i,l,h){return w=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:_,w.apply(null,arguments)}function b(i,l){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),i.apply(this,p)}}function k(i,l){function h(){}h.prototype=l.prototype,i.aa=l.prototype,i.prototype=new h,i.prototype.constructor=i,i.Qb=function(p,A,S){for(var D=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)D[Y-2]=arguments[Y];return l.prototype[A].apply(p,D)}}function C(i){const l=i.length;if(0<l){const h=Array(l);for(let p=0;p<l;p++)h[p]=i[p];return h}return[]}function P(i,l){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(u(p)){const A=i.length||0,S=p.length||0;i.length=A+S;for(let D=0;D<S;D++)i[A+D]=p[D]}else i.push(p)}}class O{constructor(l,h){this.i=l,this.j=h,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function H(i){return/^[\s\xa0]*$/.test(i)}function q(){var i=c.navigator;return i&&(i=i.userAgent)?i:""}function N(i){return N[" "](i),i}N[" "]=function(){};var x=q().indexOf("Gecko")!=-1&&!(q().toLowerCase().indexOf("webkit")!=-1&&q().indexOf("Edge")==-1)&&!(q().indexOf("Trident")!=-1||q().indexOf("MSIE")!=-1)&&q().indexOf("Edge")==-1;function V(i,l,h){for(const p in i)l.call(h,i[p],p,i)}function I(i,l){for(const h in i)l.call(void 0,i[h],h,i)}function g(i){const l={};for(const h in i)l[h]=i[h];return l}const m="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(i,l){let h,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(h in p)i[h]=p[h];for(let S=0;S<m.length;S++)h=m[S],Object.prototype.hasOwnProperty.call(p,h)&&(i[h]=p[h])}}function E(i){var l=1;i=i.split(":");const h=[];for(;0<l&&i.length;)h.push(i.shift()),l--;return i.length&&h.push(i.join(":")),h}function T(i){c.setTimeout(()=>{throw i},0)}function y(){var i=Zs;let l=null;return i.g&&(l=i.g,i.g=i.g.next,i.g||(i.h=null),l.next=null),l}class X{constructor(){this.h=this.g=null}add(l,h){const p=$e.get();p.set(l,h),this.h?this.h.next=p:this.g=p,this.h=p}}var $e=new O(()=>new Cn,i=>i.reset());class Cn{constructor(){this.next=this.g=this.h=null}set(l,h){this.h=l,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let Tt,wt=!1,Zs=new X,Pa=()=>{const i=c.Promise.resolve(void 0);Tt=()=>{i.then(Vf)}};var Vf=()=>{for(var i;i=y();){try{i.h.call(i.g)}catch(h){T(h)}var l=$e;l.j(i),100>l.h&&(l.h++,i.next=l.g,l.g=i)}wt=!1};function tt(){this.s=this.s,this.C=this.C}tt.prototype.s=!1,tt.prototype.ma=function(){this.s||(this.s=!0,this.N())},tt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function pe(i,l){this.type=i,this.g=this.target=l,this.defaultPrevented=!1}pe.prototype.h=function(){this.defaultPrevented=!0};var Mf=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var i=!1,l=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const h=()=>{};c.addEventListener("test",h,l),c.removeEventListener("test",h,l)}catch{}return i}();function Rn(i,l){if(pe.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var h=this.type=i.type,p=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=l,l=i.relatedTarget){if(x){e:{try{N(l.nodeName);var A=!0;break e}catch{}A=!1}A||(l=null)}}else h=="mouseover"?l=i.fromElement:h=="mouseout"&&(l=i.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:Of[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&Rn.aa.h.call(this)}}k(Rn,pe);var Of={2:"touch",3:"pen",4:"mouse"};Rn.prototype.h=function(){Rn.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var Rr="closure_listenable_"+(1e6*Math.random()|0),xf=0;function Ff(i,l,h,p,A){this.listener=i,this.proxy=null,this.src=l,this.type=h,this.capture=!!p,this.ha=A,this.key=++xf,this.da=this.fa=!1}function Pr(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function kr(i){this.src=i,this.g={},this.h=0}kr.prototype.add=function(i,l,h,p,A){var S=i.toString();i=this.g[S],i||(i=this.g[S]=[],this.h++);var D=ti(i,l,p,A);return-1<D?(l=i[D],h||(l.fa=!1)):(l=new Ff(l,this.src,S,!!p,A),l.fa=h,i.push(l)),l};function ei(i,l){var h=l.type;if(h in i.g){var p=i.g[h],A=Array.prototype.indexOf.call(p,l,void 0),S;(S=0<=A)&&Array.prototype.splice.call(p,A,1),S&&(Pr(l),i.g[h].length==0&&(delete i.g[h],i.h--))}}function ti(i,l,h,p){for(var A=0;A<i.length;++A){var S=i[A];if(!S.da&&S.listener==l&&S.capture==!!h&&S.ha==p)return A}return-1}var ni="closure_lm_"+(1e6*Math.random()|0),ri={};function ka(i,l,h,p,A){if(Array.isArray(l)){for(var S=0;S<l.length;S++)ka(i,l[S],h,p,A);return null}return h=La(h),i&&i[Rr]?i.K(l,h,d(p)?!!p.capture:!1,A):Bf(i,l,h,!1,p,A)}function Bf(i,l,h,p,A,S){if(!l)throw Error("Invalid event type");var D=d(A)?!!A.capture:!!A,Y=ii(i);if(Y||(i[ni]=Y=new kr(i)),h=Y.add(l,h,p,D,S),h.proxy)return h;if(p=Uf(),h.proxy=p,p.src=i,p.listener=h,i.addEventListener)Mf||(A=D),A===void 0&&(A=!1),i.addEventListener(l.toString(),p,A);else if(i.attachEvent)i.attachEvent(Na(l.toString()),p);else if(i.addListener&&i.removeListener)i.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function Uf(){function i(h){return l.call(i.src,i.listener,h)}const l=$f;return i}function Da(i,l,h,p,A){if(Array.isArray(l))for(var S=0;S<l.length;S++)Da(i,l[S],h,p,A);else p=d(p)?!!p.capture:!!p,h=La(h),i&&i[Rr]?(i=i.i,l=String(l).toString(),l in i.g&&(S=i.g[l],h=ti(S,h,p,A),-1<h&&(Pr(S[h]),Array.prototype.splice.call(S,h,1),S.length==0&&(delete i.g[l],i.h--)))):i&&(i=ii(i))&&(l=i.g[l.toString()],i=-1,l&&(i=ti(l,h,p,A)),(h=-1<i?l[i]:null)&&si(h))}function si(i){if(typeof i!="number"&&i&&!i.da){var l=i.src;if(l&&l[Rr])ei(l.i,i);else{var h=i.type,p=i.proxy;l.removeEventListener?l.removeEventListener(h,p,i.capture):l.detachEvent?l.detachEvent(Na(h),p):l.addListener&&l.removeListener&&l.removeListener(p),(h=ii(l))?(ei(h,i),h.h==0&&(h.src=null,l[ni]=null)):Pr(i)}}}function Na(i){return i in ri?ri[i]:ri[i]="on"+i}function $f(i,l){if(i.da)i=!0;else{l=new Rn(l,this);var h=i.listener,p=i.ha||i.src;i.fa&&si(i),i=h.call(p,l)}return i}function ii(i){return i=i[ni],i instanceof kr?i:null}var oi="__closure_events_fn_"+(1e9*Math.random()>>>0);function La(i){return typeof i=="function"?i:(i[oi]||(i[oi]=function(l){return i.handleEvent(l)}),i[oi])}function me(){tt.call(this),this.i=new kr(this),this.M=this,this.F=null}k(me,tt),me.prototype[Rr]=!0,me.prototype.removeEventListener=function(i,l,h,p){Da(this,i,l,h,p)};function Te(i,l){var h,p=i.F;if(p)for(h=[];p;p=p.F)h.push(p);if(i=i.M,p=l.type||l,typeof l=="string")l=new pe(l,i);else if(l instanceof pe)l.target=l.target||i;else{var A=l;l=new pe(p,i),v(l,A)}if(A=!0,h)for(var S=h.length-1;0<=S;S--){var D=l.g=h[S];A=Dr(D,p,!0,l)&&A}if(D=l.g=i,A=Dr(D,p,!0,l)&&A,A=Dr(D,p,!1,l)&&A,h)for(S=0;S<h.length;S++)D=l.g=h[S],A=Dr(D,p,!1,l)&&A}me.prototype.N=function(){if(me.aa.N.call(this),this.i){var i=this.i,l;for(l in i.g){for(var h=i.g[l],p=0;p<h.length;p++)Pr(h[p]);delete i.g[l],i.h--}}this.F=null},me.prototype.K=function(i,l,h,p){return this.i.add(String(i),l,!1,h,p)},me.prototype.L=function(i,l,h,p){return this.i.add(String(i),l,!0,h,p)};function Dr(i,l,h,p){if(l=i.i.g[String(l)],!l)return!0;l=l.concat();for(var A=!0,S=0;S<l.length;++S){var D=l[S];if(D&&!D.da&&D.capture==h){var Y=D.listener,le=D.ha||D.src;D.fa&&ei(i.i,D),A=Y.call(le,p)!==!1&&A}}return A&&!p.defaultPrevented}function Va(i,l,h){if(typeof i=="function")h&&(i=w(i,h));else if(i&&typeof i.handleEvent=="function")i=w(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(i,l||0)}function Ma(i){i.g=Va(()=>{i.g=null,i.i&&(i.i=!1,Ma(i))},i.l);const l=i.h;i.h=null,i.m.apply(null,l)}class Hf extends tt{constructor(l,h){super(),this.m=l,this.l=h,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Ma(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Pn(i){tt.call(this),this.h=i,this.g={}}k(Pn,tt);var Oa=[];function xa(i){V(i.g,function(l,h){this.g.hasOwnProperty(h)&&si(l)},i),i.g={}}Pn.prototype.N=function(){Pn.aa.N.call(this),xa(this)},Pn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ai=c.JSON.stringify,jf=c.JSON.parse,qf=class{stringify(i){return c.JSON.stringify(i,void 0)}parse(i){return c.JSON.parse(i,void 0)}};function ci(){}ci.prototype.h=null;function Fa(i){return i.h||(i.h=i.i())}function Ba(){}var kn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function li(){pe.call(this,"d")}k(li,pe);function ui(){pe.call(this,"c")}k(ui,pe);var At={},Ua=null;function Nr(){return Ua=Ua||new me}At.La="serverreachability";function $a(i){pe.call(this,At.La,i)}k($a,pe);function Dn(i){const l=Nr();Te(l,new $a(l))}At.STAT_EVENT="statevent";function Ha(i,l){pe.call(this,At.STAT_EVENT,i),this.stat=l}k(Ha,pe);function we(i){const l=Nr();Te(l,new Ha(l,i))}At.Ma="timingevent";function ja(i,l){pe.call(this,At.Ma,i),this.size=l}k(ja,pe);function Nn(i,l){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){i()},l)}function Ln(){this.g=!0}Ln.prototype.xa=function(){this.g=!1};function zf(i,l,h,p,A,S){i.info(function(){if(i.g)if(S)for(var D="",Y=S.split("&"),le=0;le<Y.length;le++){var Q=Y[le].split("=");if(1<Q.length){var ge=Q[0];Q=Q[1];var ye=ge.split("_");D=2<=ye.length&&ye[1]=="type"?D+(ge+"="+Q+"&"):D+(ge+"=redacted&")}}else D=null;else D=S;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+l+`
`+h+`
`+D})}function Gf(i,l,h,p,A,S,D){i.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+l+`
`+h+`
`+S+" "+D})}function Ht(i,l,h,p){i.info(function(){return"XMLHTTP TEXT ("+l+"): "+Kf(i,h)+(p?" "+p:"")})}function Wf(i,l){i.info(function(){return"TIMEOUT: "+l})}Ln.prototype.info=function(){};function Kf(i,l){if(!i.g)return l;if(!l)return null;try{var h=JSON.parse(l);if(h){for(i=0;i<h.length;i++)if(Array.isArray(h[i])){var p=h[i];if(!(2>p.length)){var A=p[1];if(Array.isArray(A)&&!(1>A.length)){var S=A[0];if(S!="noop"&&S!="stop"&&S!="close")for(var D=1;D<A.length;D++)A[D]=""}}}}return ai(h)}catch{return l}}var Lr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},qa={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},hi;function Vr(){}k(Vr,ci),Vr.prototype.g=function(){return new XMLHttpRequest},Vr.prototype.i=function(){return{}},hi=new Vr;function nt(i,l,h,p){this.j=i,this.i=l,this.l=h,this.R=p||1,this.U=new Pn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new za}function za(){this.i=null,this.g="",this.h=!1}var Ga={},di={};function fi(i,l,h){i.L=1,i.v=Fr(He(l)),i.m=h,i.P=!0,Wa(i,null)}function Wa(i,l){i.F=Date.now(),Mr(i),i.A=He(i.v);var h=i.A,p=i.R;Array.isArray(p)||(p=[String(p)]),ac(h.i,"t",p),i.C=0,h=i.j.J,i.h=new za,i.g=Sc(i.j,h?l:null,!i.m),0<i.O&&(i.M=new Hf(w(i.Y,i,i.g),i.O)),l=i.U,h=i.g,p=i.ca;var A="readystatechange";Array.isArray(A)||(A&&(Oa[0]=A.toString()),A=Oa);for(var S=0;S<A.length;S++){var D=ka(h,A[S],p||l.handleEvent,!1,l.h||l);if(!D)break;l.g[D.key]=D}l=i.H?g(i.H):{},i.m?(i.u||(i.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,l)):(i.u="GET",i.g.ea(i.A,i.u,null,l)),Dn(),zf(i.i,i.u,i.A,i.l,i.R,i.m)}nt.prototype.ca=function(i){i=i.target;const l=this.M;l&&je(i)==3?l.j():this.Y(i)},nt.prototype.Y=function(i){try{if(i==this.g)e:{const ye=je(this.g);var l=this.g.Ba();const zt=this.g.Z();if(!(3>ye)&&(ye!=3||this.g&&(this.h.h||this.g.oa()||pc(this.g)))){this.J||ye!=4||l==7||(l==8||0>=zt?Dn(3):Dn(2)),pi(this);var h=this.g.Z();this.X=h;t:if(Ka(this)){var p=pc(this.g);i="";var A=p.length,S=je(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){St(this),Vn(this);var D="";break t}this.h.i=new c.TextDecoder}for(l=0;l<A;l++)this.h.h=!0,i+=this.h.i.decode(p[l],{stream:!(S&&l==A-1)});p.length=0,this.h.g+=i,this.C=0,D=this.h.g}else D=this.g.oa();if(this.o=h==200,Gf(this.i,this.u,this.A,this.l,this.R,ye,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Y,le=this.g;if((Y=le.g?le.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!H(Y)){var Q=Y;break t}}Q=null}if(h=Q)Ht(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,mi(this,h);else{this.o=!1,this.s=3,we(12),St(this),Vn(this);break e}}if(this.P){h=!0;let Le;for(;!this.J&&this.C<D.length;)if(Le=Qf(this,D),Le==di){ye==4&&(this.s=4,we(14),h=!1),Ht(this.i,this.l,null,"[Incomplete Response]");break}else if(Le==Ga){this.s=4,we(15),Ht(this.i,this.l,D,"[Invalid Chunk]"),h=!1;break}else Ht(this.i,this.l,Le,null),mi(this,Le);if(Ka(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ye!=4||D.length!=0||this.h.h||(this.s=1,we(16),h=!1),this.o=this.o&&h,!h)Ht(this.i,this.l,D,"[Invalid Chunked Response]"),St(this),Vn(this);else if(0<D.length&&!this.W){this.W=!0;var ge=this.j;ge.g==this&&ge.ba&&!ge.M&&(ge.j.info("Great, no buffering proxy detected. Bytes received: "+D.length),Ei(ge),ge.M=!0,we(11))}}else Ht(this.i,this.l,D,null),mi(this,D);ye==4&&St(this),this.o&&!this.J&&(ye==4?Ec(this.j,this):(this.o=!1,Mr(this)))}else dp(this.g),h==400&&0<D.indexOf("Unknown SID")?(this.s=3,we(12)):(this.s=0,we(13)),St(this),Vn(this)}}}catch{}finally{}};function Ka(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function Qf(i,l){var h=i.C,p=l.indexOf(`
`,h);return p==-1?di:(h=Number(l.substring(h,p)),isNaN(h)?Ga:(p+=1,p+h>l.length?di:(l=l.slice(p,p+h),i.C=p+h,l)))}nt.prototype.cancel=function(){this.J=!0,St(this)};function Mr(i){i.S=Date.now()+i.I,Qa(i,i.I)}function Qa(i,l){if(i.B!=null)throw Error("WatchDog timer not null");i.B=Nn(w(i.ba,i),l)}function pi(i){i.B&&(c.clearTimeout(i.B),i.B=null)}nt.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(Wf(this.i,this.A),this.L!=2&&(Dn(),we(17)),St(this),this.s=2,Vn(this)):Qa(this,this.S-i)};function Vn(i){i.j.G==0||i.J||Ec(i.j,i)}function St(i){pi(i);var l=i.M;l&&typeof l.ma=="function"&&l.ma(),i.M=null,xa(i.U),i.g&&(l=i.g,i.g=null,l.abort(),l.ma())}function mi(i,l){try{var h=i.j;if(h.G!=0&&(h.g==i||gi(h.h,i))){if(!i.K&&gi(h.h,i)&&h.G==3){try{var p=h.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<i.F)qr(h),Hr(h);else break e;Ii(h),we(18)}}else h.za=A[1],0<h.za-h.T&&37500>A[2]&&h.F&&h.v==0&&!h.C&&(h.C=Nn(w(h.Za,h),6e3));if(1>=Xa(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Ct(h,11)}else if((i.K||h.g==i)&&qr(h),!H(l))for(A=h.Da.g.parse(l),l=0;l<A.length;l++){let Q=A[l];if(h.T=Q[0],Q=Q[1],h.G==2)if(Q[0]=="c"){h.K=Q[1],h.ia=Q[2];const ge=Q[3];ge!=null&&(h.la=ge,h.j.info("VER="+h.la));const ye=Q[4];ye!=null&&(h.Aa=ye,h.j.info("SVER="+h.Aa));const zt=Q[5];zt!=null&&typeof zt=="number"&&0<zt&&(p=1.5*zt,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const Le=i.g;if(Le){const Gr=Le.g?Le.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Gr){var S=p.h;S.g||Gr.indexOf("spdy")==-1&&Gr.indexOf("quic")==-1&&Gr.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(yi(S,S.h),S.h=null))}if(p.D){const Ti=Le.g?Le.g.getResponseHeader("X-HTTP-Session-Id"):null;Ti&&(p.ya=Ti,Z(p.I,p.D,Ti))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-i.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var D=i;if(p.qa=Ac(p,p.J?p.ia:null,p.W),D.K){Za(p.h,D);var Y=D,le=p.L;le&&(Y.I=le),Y.B&&(pi(Y),Mr(Y)),p.g=D}else vc(p);0<h.i.length&&jr(h)}else Q[0]!="stop"&&Q[0]!="close"||Ct(h,7);else h.G==3&&(Q[0]=="stop"||Q[0]=="close"?Q[0]=="stop"?Ct(h,7):vi(h):Q[0]!="noop"&&h.l&&h.l.ta(Q),h.v=0)}}Dn(4)}catch{}}var Jf=class{constructor(i,l){this.g=i,this.map=l}};function Ja(i){this.l=i||10,c.PerformanceNavigationTiming?(i=c.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Ya(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function Xa(i){return i.h?1:i.g?i.g.size:0}function gi(i,l){return i.h?i.h==l:i.g?i.g.has(l):!1}function yi(i,l){i.g?i.g.add(l):i.h=l}function Za(i,l){i.h&&i.h==l?i.h=null:i.g&&i.g.has(l)&&i.g.delete(l)}Ja.prototype.cancel=function(){if(this.i=ec(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function ec(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let l=i.i;for(const h of i.g.values())l=l.concat(h.D);return l}return C(i.i)}function Yf(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(u(i)){for(var l=[],h=i.length,p=0;p<h;p++)l.push(i[p]);return l}l=[],h=0;for(p in i)l[h++]=i[p];return l}function Xf(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(u(i)||typeof i=="string"){var l=[];i=i.length;for(var h=0;h<i;h++)l.push(h);return l}l=[],h=0;for(const p in i)l[h++]=p;return l}}}function tc(i,l){if(i.forEach&&typeof i.forEach=="function")i.forEach(l,void 0);else if(u(i)||typeof i=="string")Array.prototype.forEach.call(i,l,void 0);else for(var h=Xf(i),p=Yf(i),A=p.length,S=0;S<A;S++)l.call(void 0,p[S],h&&h[S],i)}var nc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Zf(i,l){if(i){i=i.split("&");for(var h=0;h<i.length;h++){var p=i[h].indexOf("="),A=null;if(0<=p){var S=i[h].substring(0,p);A=i[h].substring(p+1)}else S=i[h];l(S,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function bt(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof bt){this.h=i.h,Or(this,i.j),this.o=i.o,this.g=i.g,xr(this,i.s),this.l=i.l;var l=i.i,h=new xn;h.i=l.i,l.g&&(h.g=new Map(l.g),h.h=l.h),rc(this,h),this.m=i.m}else i&&(l=String(i).match(nc))?(this.h=!1,Or(this,l[1]||"",!0),this.o=Mn(l[2]||""),this.g=Mn(l[3]||"",!0),xr(this,l[4]),this.l=Mn(l[5]||"",!0),rc(this,l[6]||"",!0),this.m=Mn(l[7]||"")):(this.h=!1,this.i=new xn(null,this.h))}bt.prototype.toString=function(){var i=[],l=this.j;l&&i.push(On(l,sc,!0),":");var h=this.g;return(h||l=="file")&&(i.push("//"),(l=this.o)&&i.push(On(l,sc,!0),"@"),i.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&i.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&i.push("/"),i.push(On(h,h.charAt(0)=="/"?np:tp,!0))),(h=this.i.toString())&&i.push("?",h),(h=this.m)&&i.push("#",On(h,sp)),i.join("")};function He(i){return new bt(i)}function Or(i,l,h){i.j=h?Mn(l,!0):l,i.j&&(i.j=i.j.replace(/:$/,""))}function xr(i,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);i.s=l}else i.s=null}function rc(i,l,h){l instanceof xn?(i.i=l,ip(i.i,i.h)):(h||(l=On(l,rp)),i.i=new xn(l,i.h))}function Z(i,l,h){i.i.set(l,h)}function Fr(i){return Z(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function Mn(i,l){return i?l?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function On(i,l,h){return typeof i=="string"?(i=encodeURI(i).replace(l,ep),h&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function ep(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var sc=/[#\/\?@]/g,tp=/[#\?:]/g,np=/[#\?]/g,rp=/[#\?@]/g,sp=/#/g;function xn(i,l){this.h=this.g=null,this.i=i||null,this.j=!!l}function rt(i){i.g||(i.g=new Map,i.h=0,i.i&&Zf(i.i,function(l,h){i.add(decodeURIComponent(l.replace(/\+/g," ")),h)}))}n=xn.prototype,n.add=function(i,l){rt(this),this.i=null,i=jt(this,i);var h=this.g.get(i);return h||this.g.set(i,h=[]),h.push(l),this.h+=1,this};function ic(i,l){rt(i),l=jt(i,l),i.g.has(l)&&(i.i=null,i.h-=i.g.get(l).length,i.g.delete(l))}function oc(i,l){return rt(i),l=jt(i,l),i.g.has(l)}n.forEach=function(i,l){rt(this),this.g.forEach(function(h,p){h.forEach(function(A){i.call(l,A,p,this)},this)},this)},n.na=function(){rt(this);const i=Array.from(this.g.values()),l=Array.from(this.g.keys()),h=[];for(let p=0;p<l.length;p++){const A=i[p];for(let S=0;S<A.length;S++)h.push(l[p])}return h},n.V=function(i){rt(this);let l=[];if(typeof i=="string")oc(this,i)&&(l=l.concat(this.g.get(jt(this,i))));else{i=Array.from(this.g.values());for(let h=0;h<i.length;h++)l=l.concat(i[h])}return l},n.set=function(i,l){return rt(this),this.i=null,i=jt(this,i),oc(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[l]),this.h+=1,this},n.get=function(i,l){return i?(i=this.V(i),0<i.length?String(i[0]):l):l};function ac(i,l,h){ic(i,l),0<h.length&&(i.i=null,i.g.set(jt(i,l),C(h)),i.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],l=Array.from(this.g.keys());for(var h=0;h<l.length;h++){var p=l[h];const S=encodeURIComponent(String(p)),D=this.V(p);for(p=0;p<D.length;p++){var A=S;D[p]!==""&&(A+="="+encodeURIComponent(String(D[p]))),i.push(A)}}return this.i=i.join("&")};function jt(i,l){return l=String(l),i.j&&(l=l.toLowerCase()),l}function ip(i,l){l&&!i.j&&(rt(i),i.i=null,i.g.forEach(function(h,p){var A=p.toLowerCase();p!=A&&(ic(this,p),ac(this,A,h))},i)),i.j=l}function op(i,l){const h=new Ln;if(c.Image){const p=new Image;p.onload=b(st,h,"TestLoadImage: loaded",!0,l,p),p.onerror=b(st,h,"TestLoadImage: error",!1,l,p),p.onabort=b(st,h,"TestLoadImage: abort",!1,l,p),p.ontimeout=b(st,h,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=i}else l(!1)}function ap(i,l){const h=new Ln,p=new AbortController,A=setTimeout(()=>{p.abort(),st(h,"TestPingServer: timeout",!1,l)},1e4);fetch(i,{signal:p.signal}).then(S=>{clearTimeout(A),S.ok?st(h,"TestPingServer: ok",!0,l):st(h,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(A),st(h,"TestPingServer: error",!1,l)})}function st(i,l,h,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(h)}catch{}}function cp(){this.g=new qf}function lp(i,l,h){const p=h||"";try{tc(i,function(A,S){let D=A;d(A)&&(D=ai(A)),l.push(p+S+"="+encodeURIComponent(D))})}catch(A){throw l.push(p+"type="+encodeURIComponent("_badmap")),A}}function Br(i){this.l=i.Ub||null,this.j=i.eb||!1}k(Br,ci),Br.prototype.g=function(){return new Ur(this.l,this.j)},Br.prototype.i=function(i){return function(){return i}}({});function Ur(i,l){me.call(this),this.D=i,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(Ur,me),n=Ur.prototype,n.open=function(i,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=l,this.readyState=1,Bn(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(l.body=i),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Fn(this)),this.readyState=0},n.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,Bn(this)),this.g&&(this.readyState=3,Bn(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;cc(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function cc(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}n.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var l=i.value?i.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!i.done}))&&(this.response=this.responseText+=l)}i.done?Fn(this):Bn(this),this.readyState==3&&cc(this)}},n.Ra=function(i){this.g&&(this.response=this.responseText=i,Fn(this))},n.Qa=function(i){this.g&&(this.response=i,Fn(this))},n.ga=function(){this.g&&Fn(this)};function Fn(i){i.readyState=4,i.l=null,i.j=null,i.v=null,Bn(i)}n.setRequestHeader=function(i,l){this.u.append(i,l)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],l=this.h.entries();for(var h=l.next();!h.done;)h=h.value,i.push(h[0]+": "+h[1]),h=l.next();return i.join(`\r
`)};function Bn(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(Ur.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function lc(i){let l="";return V(i,function(h,p){l+=p,l+=":",l+=h,l+=`\r
`}),l}function _i(i,l,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=lc(h),typeof i=="string"?h!=null&&encodeURIComponent(String(h)):Z(i,l,h))}function te(i){me.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(te,me);var up=/^https?$/i,hp=["POST","PUT"];n=te.prototype,n.Ha=function(i){this.J=i},n.ea=function(i,l,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);l=l?l.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():hi.g(),this.v=this.o?Fa(this.o):Fa(hi),this.g.onreadystatechange=w(this.Ea,this);try{this.B=!0,this.g.open(l,String(i),!0),this.B=!1}catch(S){uc(this,S);return}if(i=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)h.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const S of p.keys())h.set(S,p.get(S));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(S=>S.toLowerCase()=="content-type"),A=c.FormData&&i instanceof c.FormData,!(0<=Array.prototype.indexOf.call(hp,l,void 0))||p||A||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,D]of h)this.g.setRequestHeader(S,D);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{fc(this),this.u=!0,this.g.send(i),this.u=!1}catch(S){uc(this,S)}};function uc(i,l){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=l,i.m=5,hc(i),$r(i)}function hc(i){i.A||(i.A=!0,Te(i,"complete"),Te(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,Te(this,"complete"),Te(this,"abort"),$r(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),$r(this,!0)),te.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?dc(this):this.bb())},n.bb=function(){dc(this)};function dc(i){if(i.h&&typeof a<"u"&&(!i.v[1]||je(i)!=4||i.Z()!=2)){if(i.u&&je(i)==4)Va(i.Ea,0,i);else if(Te(i,"readystatechange"),je(i)==4){i.h=!1;try{const D=i.Z();e:switch(D){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var h;if(!(h=l)){var p;if(p=D===0){var A=String(i.D).match(nc)[1]||null;!A&&c.self&&c.self.location&&(A=c.self.location.protocol.slice(0,-1)),p=!up.test(A?A.toLowerCase():"")}h=p}if(h)Te(i,"complete"),Te(i,"success");else{i.m=6;try{var S=2<je(i)?i.g.statusText:""}catch{S=""}i.l=S+" ["+i.Z()+"]",hc(i)}}finally{$r(i)}}}}function $r(i,l){if(i.g){fc(i);const h=i.g,p=i.v[0]?()=>{}:null;i.g=null,i.v=null,l||Te(i,"ready");try{h.onreadystatechange=p}catch{}}}function fc(i){i.I&&(c.clearTimeout(i.I),i.I=null)}n.isActive=function(){return!!this.g};function je(i){return i.g?i.g.readyState:0}n.Z=function(){try{return 2<je(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(i){if(this.g){var l=this.g.responseText;return i&&l.indexOf(i)==0&&(l=l.substring(i.length)),jf(l)}};function pc(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function dp(i){const l={};i=(i.g&&2<=je(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<i.length;p++){if(H(i[p]))continue;var h=E(i[p]);const A=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const S=l[A]||[];l[A]=S,S.push(h)}I(l,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Un(i,l,h){return h&&h.internalChannelParams&&h.internalChannelParams[i]||l}function mc(i){this.Aa=0,this.i=[],this.j=new Ln,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Un("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Un("baseRetryDelayMs",5e3,i),this.cb=Un("retryDelaySeedMs",1e4,i),this.Wa=Un("forwardChannelMaxRetries",2,i),this.wa=Un("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new Ja(i&&i.concurrentRequestLimit),this.Da=new cp,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=mc.prototype,n.la=8,n.G=1,n.connect=function(i,l,h,p){we(0),this.W=i,this.H=l||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=Ac(this,null,this.W),jr(this)};function vi(i){if(gc(i),i.G==3){var l=i.U++,h=He(i.I);if(Z(h,"SID",i.K),Z(h,"RID",l),Z(h,"TYPE","terminate"),$n(i,h),l=new nt(i,i.j,l),l.L=2,l.v=Fr(He(h)),h=!1,c.navigator&&c.navigator.sendBeacon)try{h=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!h&&c.Image&&(new Image().src=l.v,h=!0),h||(l.g=Sc(l.j,null),l.g.ea(l.v)),l.F=Date.now(),Mr(l)}wc(i)}function Hr(i){i.g&&(Ei(i),i.g.cancel(),i.g=null)}function gc(i){Hr(i),i.u&&(c.clearTimeout(i.u),i.u=null),qr(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&c.clearTimeout(i.s),i.s=null)}function jr(i){if(!Ya(i.h)&&!i.s){i.s=!0;var l=i.Ga;Tt||Pa(),wt||(Tt(),wt=!0),Zs.add(l,i),i.B=0}}function fp(i,l){return Xa(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=l.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=Nn(w(i.Ga,i,l),Tc(i,i.B)),i.B++,!0)}n.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const A=new nt(this,this.j,i);let S=this.o;if(this.S&&(S?(S=g(S),v(S,this.S)):S=this.S),this.m!==null||this.O||(A.H=S,S=null),this.P)e:{for(var l=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=h;break e}if(l===4096||h===this.i.length-1){l=h+1;break e}}l=1e3}else l=1e3;l=_c(this,A,l),h=He(this.I),Z(h,"RID",i),Z(h,"CVER",22),this.D&&Z(h,"X-HTTP-Session-Id",this.D),$n(this,h),S&&(this.O?l="headers="+encodeURIComponent(String(lc(S)))+"&"+l:this.m&&_i(h,this.m,S)),yi(this.h,A),this.Ua&&Z(h,"TYPE","init"),this.P?(Z(h,"$req",l),Z(h,"SID","null"),A.T=!0,fi(A,h,null)):fi(A,h,l),this.G=2}}else this.G==3&&(i?yc(this,i):this.i.length==0||Ya(this.h)||yc(this))};function yc(i,l){var h;l?h=l.l:h=i.U++;const p=He(i.I);Z(p,"SID",i.K),Z(p,"RID",h),Z(p,"AID",i.T),$n(i,p),i.m&&i.o&&_i(p,i.m,i.o),h=new nt(i,i.j,h,i.B+1),i.m===null&&(h.H=i.o),l&&(i.i=l.D.concat(i.i)),l=_c(i,h,1e3),h.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),yi(i.h,h),fi(h,p,l)}function $n(i,l){i.H&&V(i.H,function(h,p){Z(l,p,h)}),i.l&&tc({},function(h,p){Z(l,p,h)})}function _c(i,l,h){h=Math.min(i.i.length,h);var p=i.l?w(i.l.Na,i.l,i):null;e:{var A=i.i;let S=-1;for(;;){const D=["count="+h];S==-1?0<h?(S=A[0].g,D.push("ofs="+S)):S=0:D.push("ofs="+S);let Y=!0;for(let le=0;le<h;le++){let Q=A[le].g;const ge=A[le].map;if(Q-=S,0>Q)S=Math.max(0,A[le].g-100),Y=!1;else try{lp(ge,D,"req"+Q+"_")}catch{p&&p(ge)}}if(Y){p=D.join("&");break e}}}return i=i.i.splice(0,h),l.D=i,p}function vc(i){if(!i.g&&!i.u){i.Y=1;var l=i.Fa;Tt||Pa(),wt||(Tt(),wt=!0),Zs.add(l,i),i.v=0}}function Ii(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=Nn(w(i.Fa,i),Tc(i,i.v)),i.v++,!0)}n.Fa=function(){if(this.u=null,Ic(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=Nn(w(this.ab,this),i)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,we(10),Hr(this),Ic(this))};function Ei(i){i.A!=null&&(c.clearTimeout(i.A),i.A=null)}function Ic(i){i.g=new nt(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var l=He(i.qa);Z(l,"RID","rpc"),Z(l,"SID",i.K),Z(l,"AID",i.T),Z(l,"CI",i.F?"0":"1"),!i.F&&i.ja&&Z(l,"TO",i.ja),Z(l,"TYPE","xmlhttp"),$n(i,l),i.m&&i.o&&_i(l,i.m,i.o),i.L&&(i.g.I=i.L);var h=i.g;i=i.ia,h.L=1,h.v=Fr(He(l)),h.m=null,h.P=!0,Wa(h,i)}n.Za=function(){this.C!=null&&(this.C=null,Hr(this),Ii(this),we(19))};function qr(i){i.C!=null&&(c.clearTimeout(i.C),i.C=null)}function Ec(i,l){var h=null;if(i.g==l){qr(i),Ei(i),i.g=null;var p=2}else if(gi(i.h,l))h=l.D,Za(i.h,l),p=1;else return;if(i.G!=0){if(l.o)if(p==1){h=l.m?l.m.length:0,l=Date.now()-l.F;var A=i.B;p=Nr(),Te(p,new ja(p,h)),jr(i)}else vc(i);else if(A=l.s,A==3||A==0&&0<l.X||!(p==1&&fp(i,l)||p==2&&Ii(i)))switch(h&&0<h.length&&(l=i.h,l.i=l.i.concat(h)),A){case 1:Ct(i,5);break;case 4:Ct(i,10);break;case 3:Ct(i,6);break;default:Ct(i,2)}}}function Tc(i,l){let h=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(h*=2),h*l}function Ct(i,l){if(i.j.info("Error code "+l),l==2){var h=w(i.fb,i),p=i.Xa;const A=!p;p=new bt(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||Or(p,"https"),Fr(p),A?op(p.toString(),h):ap(p.toString(),h)}else we(2);i.G=0,i.l&&i.l.sa(l),wc(i),gc(i)}n.fb=function(i){i?(this.j.info("Successfully pinged google.com"),we(2)):(this.j.info("Failed to ping google.com"),we(1))};function wc(i){if(i.G=0,i.ka=[],i.l){const l=ec(i.h);(l.length!=0||i.i.length!=0)&&(P(i.ka,l),P(i.ka,i.i),i.h.i.length=0,C(i.i),i.i.length=0),i.l.ra()}}function Ac(i,l,h){var p=h instanceof bt?He(h):new bt(h);if(p.g!="")l&&(p.g=l+"."+p.g),xr(p,p.s);else{var A=c.location;p=A.protocol,l=l?l+"."+A.hostname:A.hostname,A=+A.port;var S=new bt(null);p&&Or(S,p),l&&(S.g=l),A&&xr(S,A),h&&(S.l=h),p=S}return h=i.D,l=i.ya,h&&l&&Z(p,h,l),Z(p,"VER",i.la),$n(i,p),p}function Sc(i,l,h){if(l&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=i.Ca&&!i.pa?new te(new Br({eb:h})):new te(i.pa),l.Ha(i.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function bc(){}n=bc.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function zr(){}zr.prototype.g=function(i,l){return new Re(i,l)};function Re(i,l){me.call(this),this.g=new mc(l),this.l=i,this.h=l&&l.messageUrlParams||null,i=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(i?i["X-WebChannel-Content-Type"]=l.messageContentType:i={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(i?i["X-WebChannel-Client-Profile"]=l.va:i={"X-WebChannel-Client-Profile":l.va}),this.g.S=i,(i=l&&l.Sb)&&!H(i)&&(this.g.m=i),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!H(l)&&(this.g.D=l,i=this.h,i!==null&&l in i&&(i=this.h,l in i&&delete i[l])),this.j=new qt(this)}k(Re,me),Re.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Re.prototype.close=function(){vi(this.g)},Re.prototype.o=function(i){var l=this.g;if(typeof i=="string"){var h={};h.__data__=i,i=h}else this.u&&(h={},h.__data__=ai(i),i=h);l.i.push(new Jf(l.Ya++,i)),l.G==3&&jr(l)},Re.prototype.N=function(){this.g.l=null,delete this.j,vi(this.g),delete this.g,Re.aa.N.call(this)};function Cc(i){li.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var l=i.__sm__;if(l){e:{for(const h in l){i=h;break e}i=void 0}(this.i=i)&&(i=this.i,l=l!==null&&i in l?l[i]:void 0),this.data=l}else this.data=i}k(Cc,li);function Rc(){ui.call(this),this.status=1}k(Rc,ui);function qt(i){this.g=i}k(qt,bc),qt.prototype.ua=function(){Te(this.g,"a")},qt.prototype.ta=function(i){Te(this.g,new Cc(i))},qt.prototype.sa=function(i){Te(this.g,new Rc)},qt.prototype.ra=function(){Te(this.g,"b")},zr.prototype.createWebChannel=zr.prototype.g,Re.prototype.send=Re.prototype.o,Re.prototype.open=Re.prototype.m,Re.prototype.close=Re.prototype.close,Lh=function(){return new zr},Nh=function(){return Nr()},Dh=At,to={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Lr.NO_ERROR=0,Lr.TIMEOUT=8,Lr.HTTP_ERROR=6,as=Lr,qa.COMPLETE="complete",kh=qa,Ba.EventType=kn,kn.OPEN="a",kn.CLOSE="b",kn.ERROR="c",kn.MESSAGE="d",me.prototype.listen=me.prototype.K,zn=Ba,te.prototype.listenOnce=te.prototype.L,te.prototype.getLastError=te.prototype.Ka,te.prototype.getLastErrorCode=te.prototype.Ba,te.prototype.getStatus=te.prototype.Z,te.prototype.getResponseJson=te.prototype.Oa,te.prototype.getResponseText=te.prototype.oa,te.prototype.send=te.prototype.ea,te.prototype.setWithCredentials=te.prototype.Ha,Ph=te}).apply(typeof Kr<"u"?Kr:typeof self<"u"?self:typeof window<"u"?window:{});const il="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ve.UNAUTHENTICATED=new ve(null),ve.GOOGLE_CREDENTIALS=new ve("google-credentials-uid"),ve.FIRST_PARTY=new ve("first-party-uid"),ve.MOCK_USER=new ve("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Tn="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xt=new Co("@firebase/firestore");function Hn(){return xt.logLevel}function M(n,...e){if(xt.logLevel<=z.DEBUG){const t=e.map(Fo);xt.debug(`Firestore (${Tn}): ${n}`,...t)}}function Ze(n,...e){if(xt.logLevel<=z.ERROR){const t=e.map(Fo);xt.error(`Firestore (${Tn}): ${n}`,...t)}}function dn(n,...e){if(xt.logLevel<=z.WARN){const t=e.map(Fo);xt.warn(`Firestore (${Tn}): ${n}`,...t)}}function Fo(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function j(n="Unexpected state"){const e=`FIRESTORE (${Tn}) INTERNAL ASSERTION FAILED: `+n;throw Ze(e),new Error(e)}function re(n,e){n||j()}function W(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class F extends et{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vh{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class s_{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(ve.UNAUTHENTICATED))}shutdown(){}}class i_{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class o_{constructor(e){this.t=e,this.currentUser=ve.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){re(this.o===void 0);let r=this.i;const s=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let o=new Lt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new Lt,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const u=o;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{M("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(M("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new Lt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(M("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(re(typeof r.accessToken=="string"),new Vh(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return re(e===null||typeof e=="string"),new ve(e)}}class a_{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=ve.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class c_{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new a_(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(ve.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class l_{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class u_{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){re(this.o===void 0);const r=o=>{o.error!=null&&M("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.R;return this.R=o.token,M("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>r(o))};const s=o=>{M("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>s(o)),setTimeout(()=>{if(!this.appCheck){const o=this.A.getImmediate({optional:!0});o?s(o):M("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(re(typeof t.token=="string"),this.R=t.token,new l_(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h_(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d_{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=h_(40);for(let o=0;o<s.length;++o)r.length<20&&s[o]<t&&(r+=e.charAt(s[o]%e.length))}return r}}function J(n,e){return n<e?-1:n>e?1:0}function fn(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new F(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new F(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new F(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new F(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return be.fromMillis(Date.now())}static fromDate(e){return be.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new be(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ${constructor(e){this.timestamp=e}static fromTimestamp(e){return new $(e)}static min(){return new $(new be(0,0))}static max(){return new $(new be(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lr{constructor(e,t,r){t===void 0?t=0:t>e.length&&j(),r===void 0?r=e.length-t:r>e.length-t&&j(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return lr.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof lr?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const o=e.get(s),a=t.get(s);if(o<a)return-1;if(o>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class ne extends lr{construct(e,t,r){return new ne(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new F(L.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new ne(t)}static emptyPath(){return new ne([])}}const f_=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Se extends lr{construct(e,t,r){return new Se(e,t,r)}static isValidIdentifier(e){return f_.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Se.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Se(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const o=()=>{if(r.length===0)throw new F(L.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new F(L.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new F(L.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(o(),s++)}if(o(),a)throw new F(L.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Se(t)}static emptyPath(){return new Se([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.path=e}static fromPath(e){return new B(ne.fromString(e))}static fromName(e){return new B(ne.fromString(e).popFirst(5))}static empty(){return new B(ne.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ne.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ne.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new B(new ne(e.slice()))}}function p_(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=$.fromTimestamp(r===1e9?new be(t+1,0):new be(t,r));return new _t(s,B.empty(),e)}function m_(n){return new _t(n.readTime,n.key,-1)}class _t{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new _t($.min(),B.empty(),-1)}static max(){return new _t($.max(),B.empty(),-1)}}function g_(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=B.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const y_="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class __{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bo(n){if(n.code!==L.FAILED_PRECONDITION||n.message!==y_)throw n;M("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&j(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new R((r,s)=>{this.nextCallback=o=>{this.wrapSuccess(e,o).next(r,s)},this.catchCallback=o=>{this.wrapFailure(t,o).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof R?t:R.resolve(t)}catch(t){return R.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):R.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):R.reject(t)}static resolve(e){return new R((t,r)=>{t(e)})}static reject(e){return new R((t,r)=>{r(e)})}static waitFor(e){return new R((t,r)=>{let s=0,o=0,a=!1;e.forEach(c=>{++s,c.next(()=>{++o,a&&o===s&&t()},u=>r(u))}),a=!0,o===s&&t()})}static or(e){let t=R.resolve(!1);for(const r of e)t=t.next(s=>s?R.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,o)=>{r.push(t.call(this,s,o))}),this.waitFor(r)}static mapArray(e,t){return new R((r,s)=>{const o=e.length,a=new Array(o);let c=0;for(let u=0;u<o;u++){const d=u;t(e[d]).next(f=>{a[d]=f,++c,c===o&&r(a)},f=>s(f))}})}static doWhile(e,t){return new R((r,s)=>{const o=()=>{e()===!0?t().next(()=>{o()},s):r()};o()})}}function v_(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function vr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Uo.oe=-1;function Os(n){return n==null}function no(n){return n===0&&1/n==-1/0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ol(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function xs(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function I_(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e,t){this.comparator=e,this.root=t||ue.EMPTY}insert(e,t){return new ie(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ue.BLACK,null,null))}remove(e){return new ie(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ue.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Qr(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Qr(this.root,e,this.comparator,!1)}getReverseIterator(){return new Qr(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Qr(this.root,e,this.comparator,!0)}}class Qr{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let o=1;for(;!e.isEmpty();)if(o=t?r(e.key,t):1,t&&s&&(o*=-1),o<0)e=this.isReverse?e.left:e.right;else{if(o===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ue{constructor(e,t,r,s,o){this.key=e,this.value=t,this.color=r??ue.RED,this.left=s??ue.EMPTY,this.right=o??ue.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,o){return new ue(e??this.key,t??this.value,r??this.color,s??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const o=r(e,s.key);return s=o<0?s.copy(null,null,null,s.left.insert(e,t,r),null):o===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return ue.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return ue.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ue.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ue.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw j();const e=this.left.check();if(e!==this.right.check())throw j();return e+(this.isRed()?0:1)}}ue.EMPTY=null,ue.RED=!0,ue.BLACK=!1;ue.EMPTY=new class{constructor(){this.size=0}get key(){throw j()}get value(){throw j()}get color(){throw j()}get left(){throw j()}get right(){throw j()}copy(e,t,r,s,o){return this}insert(e,t,r){return new ue(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.comparator=e,this.data=new ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new al(this.data.getIterator())}getIteratorFrom(e){return new al(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof de)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,o=r.getNext().key;if(this.comparator(s,o)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new de(this.comparator);return t.data=e,t}}class al{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(e){this.fields=e,e.sort(Se.comparator)}static empty(){return new ht([])}unionWith(e){let t=new de(Se.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new ht(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return fn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new Mh("Invalid base64 string: "+o):o}}(e);return new fe(t)}static fromUint8Array(e){const t=function(s){let o="";for(let a=0;a<s.length;++a)o+=String.fromCharCode(s[a]);return o}(e);return new fe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}fe.EMPTY_BYTE_STRING=new fe("");const E_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function vt(n){if(re(!!n),typeof n=="string"){let e=0;const t=E_.exec(n);if(re(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:se(n.seconds),nanos:se(n.nanos)}}function se(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Ft(n){return typeof n=="string"?fe.fromBase64String(n):fe.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $o(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Ho(n){const e=n.mapValue.fields.__previous_value__;return $o(e)?Ho(e):e}function ur(n){const e=vt(n.mapValue.fields.__local_write_time__.timestampValue);return new be(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T_{constructor(e,t,r,s,o,a,c,u,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=d}}class hr{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new hr("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof hr&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jr={mapValue:{}};function Bt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?$o(n)?4:A_(n)?9007199254740991:w_(n)?10:11:j()}function Fe(n,e){if(n===e)return!0;const t=Bt(n);if(t!==Bt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return ur(n).isEqual(ur(e));case 3:return function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const a=vt(s.timestampValue),c=vt(o.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,o){return Ft(s.bytesValue).isEqual(Ft(o.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,o){return se(s.geoPointValue.latitude)===se(o.geoPointValue.latitude)&&se(s.geoPointValue.longitude)===se(o.geoPointValue.longitude)}(n,e);case 2:return function(s,o){if("integerValue"in s&&"integerValue"in o)return se(s.integerValue)===se(o.integerValue);if("doubleValue"in s&&"doubleValue"in o){const a=se(s.doubleValue),c=se(o.doubleValue);return a===c?no(a)===no(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return fn(n.arrayValue.values||[],e.arrayValue.values||[],Fe);case 10:case 11:return function(s,o){const a=s.mapValue.fields||{},c=o.mapValue.fields||{};if(ol(a)!==ol(c))return!1;for(const u in a)if(a.hasOwnProperty(u)&&(c[u]===void 0||!Fe(a[u],c[u])))return!1;return!0}(n,e);default:return j()}}function dr(n,e){return(n.values||[]).find(t=>Fe(t,e))!==void 0}function pn(n,e){if(n===e)return 0;const t=Bt(n),r=Bt(e);if(t!==r)return J(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(o,a){const c=se(o.integerValue||o.doubleValue),u=se(a.integerValue||a.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return cl(n.timestampValue,e.timestampValue);case 4:return cl(ur(n),ur(e));case 5:return J(n.stringValue,e.stringValue);case 6:return function(o,a){const c=Ft(o),u=Ft(a);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(o,a){const c=o.split("/"),u=a.split("/");for(let d=0;d<c.length&&d<u.length;d++){const f=J(c[d],u[d]);if(f!==0)return f}return J(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(o,a){const c=J(se(o.latitude),se(a.latitude));return c!==0?c:J(se(o.longitude),se(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return ll(n.arrayValue,e.arrayValue);case 10:return function(o,a){var c,u,d,f;const _=o.fields||{},w=a.fields||{},b=(c=_.value)===null||c===void 0?void 0:c.arrayValue,k=(u=w.value)===null||u===void 0?void 0:u.arrayValue,C=J(((d=b==null?void 0:b.values)===null||d===void 0?void 0:d.length)||0,((f=k==null?void 0:k.values)===null||f===void 0?void 0:f.length)||0);return C!==0?C:ll(b,k)}(n.mapValue,e.mapValue);case 11:return function(o,a){if(o===Jr.mapValue&&a===Jr.mapValue)return 0;if(o===Jr.mapValue)return 1;if(a===Jr.mapValue)return-1;const c=o.fields||{},u=Object.keys(c),d=a.fields||{},f=Object.keys(d);u.sort(),f.sort();for(let _=0;_<u.length&&_<f.length;++_){const w=J(u[_],f[_]);if(w!==0)return w;const b=pn(c[u[_]],d[f[_]]);if(b!==0)return b}return J(u.length,f.length)}(n.mapValue,e.mapValue);default:throw j()}}function cl(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=vt(n),r=vt(e),s=J(t.seconds,r.seconds);return s!==0?s:J(t.nanos,r.nanos)}function ll(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const o=pn(t[s],r[s]);if(o)return o}return J(t.length,r.length)}function mn(n){return ro(n)}function ro(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=vt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Ft(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return B.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const o of t.values||[])s?s=!1:r+=",",r+=ro(o);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",o=!0;for(const a of r)o?o=!1:s+=",",s+=`${a}:${ro(t.fields[a])}`;return s+"}"}(n.mapValue):j()}function so(n){return!!n&&"integerValue"in n}function jo(n){return!!n&&"arrayValue"in n}function ul(n){return!!n&&"nullValue"in n}function hl(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function ki(n){return!!n&&"mapValue"in n}function w_(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Yn(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return xs(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Yn(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Yn(n.arrayValue.values[t]);return e}return Object.assign({},n)}function A_(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ve{constructor(e){this.value=e}static empty(){return new Ve({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!ki(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Yn(t)}setAll(e){let t=Se.emptyPath(),r={},s=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=Yn(a):s.push(c.lastSegment())});const o=this.getFieldsMap(t);this.applyChanges(o,r,s)}delete(e){const t=this.field(e.popLast());ki(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Fe(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];ki(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){xs(t,(s,o)=>e[s]=o);for(const s of r)delete e[s]}clone(){return new Ve(Yn(this.value))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(e,t,r,s,o,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=o,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ie(e,0,$.min(),$.min(),$.min(),Ve.empty(),0)}static newFoundDocument(e,t,r,s){return new Ie(e,1,t,$.min(),r,s,0)}static newNoDocument(e,t){return new Ie(e,2,t,$.min(),$.min(),Ve.empty(),0)}static newUnknownDocument(e,t){return new Ie(e,3,t,$.min(),$.min(),Ve.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual($.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ve.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ve.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=$.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ie&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ie(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(e,t){this.position=e,this.inclusive=t}}function dl(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const o=e[s],a=n.position[s];if(o.field.isKeyField()?r=B.comparator(B.fromName(a.referenceValue),t.key):r=pn(a,t.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function fl(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Fe(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class As{constructor(e,t="asc"){this.field=e,this.dir=t}}function S_(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oh{}class ae extends Oh{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new C_(e,t,r):t==="array-contains"?new k_(e,r):t==="in"?new D_(e,r):t==="not-in"?new N_(e,r):t==="array-contains-any"?new L_(e,r):new ae(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new R_(e,r):new P_(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(pn(t,this.value)):t!==null&&Bt(this.value)===Bt(t)&&this.matchesComparison(pn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return j()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Be extends Oh{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Be(e,t)}matches(e){return xh(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function xh(n){return n.op==="and"}function Fh(n){return b_(n)&&xh(n)}function b_(n){for(const e of n.filters)if(e instanceof Be)return!1;return!0}function io(n){if(n instanceof ae)return n.field.canonicalString()+n.op.toString()+mn(n.value);if(Fh(n))return n.filters.map(e=>io(e)).join(",");{const e=n.filters.map(t=>io(t)).join(",");return`${n.op}(${e})`}}function Bh(n,e){return n instanceof ae?function(r,s){return s instanceof ae&&r.op===s.op&&r.field.isEqual(s.field)&&Fe(r.value,s.value)}(n,e):n instanceof Be?function(r,s){return s instanceof Be&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((o,a,c)=>o&&Bh(a,s.filters[c]),!0):!1}(n,e):void j()}function Uh(n){return n instanceof ae?function(t){return`${t.field.canonicalString()} ${t.op} ${mn(t.value)}`}(n):n instanceof Be?function(t){return t.op.toString()+" {"+t.getFilters().map(Uh).join(" ,")+"}"}(n):"Filter"}class C_ extends ae{constructor(e,t,r){super(e,t,r),this.key=B.fromName(r.referenceValue)}matches(e){const t=B.comparator(e.key,this.key);return this.matchesComparison(t)}}class R_ extends ae{constructor(e,t){super(e,"in",t),this.keys=$h("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class P_ extends ae{constructor(e,t){super(e,"not-in",t),this.keys=$h("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function $h(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>B.fromName(r.referenceValue))}class k_ extends ae{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return jo(t)&&dr(t.arrayValue,this.value)}}class D_ extends ae{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&dr(this.value.arrayValue,t)}}class N_ extends ae{constructor(e,t){super(e,"not-in",t)}matches(e){if(dr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!dr(this.value.arrayValue,t)}}class L_ extends ae{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!jo(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>dr(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V_{constructor(e,t=null,r=[],s=[],o=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=o,this.startAt=a,this.endAt=c,this.ue=null}}function pl(n,e=null,t=[],r=[],s=null,o=null,a=null){return new V_(n,e,t,r,s,o,a)}function qo(n){const e=W(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>io(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(o){return o.field.canonicalString()+o.dir}(r)).join(","),Os(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>mn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>mn(r)).join(",")),e.ue=t}return e.ue}function zo(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!S_(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Bh(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!fl(n.startAt,e.startAt)&&fl(n.endAt,e.endAt)}function oo(n){return B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fs{constructor(e,t=null,r=[],s=[],o=null,a="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=o,this.limitType=a,this.startAt=c,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function M_(n,e,t,r,s,o,a,c){return new Fs(n,e,t,r,s,o,a,c)}function Hh(n){return new Fs(n)}function ml(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function O_(n){return n.collectionGroup!==null}function Xn(n){const e=W(n);if(e.ce===null){e.ce=[];const t=new Set;for(const o of e.explicitOrderBy)e.ce.push(o),t.add(o.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new de(Se.comparator);return a.filters.forEach(u=>{u.getFlattenedFilters().forEach(d=>{d.isInequality()&&(c=c.add(d.field))})}),c})(e).forEach(o=>{t.has(o.canonicalString())||o.isKeyField()||e.ce.push(new As(o,r))}),t.has(Se.keyField().canonicalString())||e.ce.push(new As(Se.keyField(),r))}return e.ce}function xe(n){const e=W(n);return e.le||(e.le=x_(e,Xn(n))),e.le}function x_(n,e){if(n.limitType==="F")return pl(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const o=s.dir==="desc"?"asc":"desc";return new As(s.field,o)});const t=n.endAt?new ws(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new ws(n.startAt.position,n.startAt.inclusive):null;return pl(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ao(n,e,t){return new Fs(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Bs(n,e){return zo(xe(n),xe(e))&&n.limitType===e.limitType}function jh(n){return`${qo(xe(n))}|lt:${n.limitType}`}function Zt(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Uh(s)).join(", ")}]`),Os(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>mn(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>mn(s)).join(",")),`Target(${r})`}(xe(n))}; limitType=${n.limitType})`}function Us(n,e){return e.isFoundDocument()&&function(r,s){const o=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):B.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)}(n,e)&&function(r,s){for(const o of Xn(r))if(!o.field.isKeyField()&&s.data.field(o.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const o of r.filters)if(!o.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(a,c,u){const d=dl(a,c,u);return a.inclusive?d<=0:d<0}(r.startAt,Xn(r),s)||r.endAt&&!function(a,c,u){const d=dl(a,c,u);return a.inclusive?d>=0:d>0}(r.endAt,Xn(r),s))}(n,e)}function F_(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function qh(n){return(e,t)=>{let r=!1;for(const s of Xn(n)){const o=B_(s,e,t);if(o!==0)return o;r=r||s.field.isKeyField()}return 0}}function B_(n,e,t){const r=n.field.isKeyField()?B.comparator(e.key,t.key):function(o,a,c){const u=a.data.field(o),d=c.data.field(o);return u!==null&&d!==null?pn(u,d):j()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return j()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,o]of r)if(this.equalsFn(s,e))return o}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],e))return void(s[o]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){xs(this.inner,(t,r)=>{for(const[s,o]of r)e(s,o)})}isEmpty(){return I_(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U_=new ie(B.comparator);function It(){return U_}const zh=new ie(B.comparator);function Gn(...n){let e=zh;for(const t of n)e=e.insert(t.key,t);return e}function $_(n){let e=zh;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Dt(){return Zn()}function Gh(){return Zn()}function Zn(){return new wn(n=>n.toString(),(n,e)=>n.isEqual(e))}const H_=new de(B.comparator);function K(...n){let e=H_;for(const t of n)e=e.add(t);return e}const j_=new de(J);function q_(){return j_}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z_(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:no(e)?"-0":e}}function G_(n){return{integerValue:""+n}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $s{constructor(){this._=void 0}}function W_(n,e,t){return n instanceof co?function(s,o){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return o&&$o(o)&&(o=Ho(o)),o&&(a.fields.__previous_value__=o),{mapValue:a}}(t,e):n instanceof Ss?Wh(n,e):n instanceof bs?Kh(n,e):function(s,o){const a=Q_(s,o),c=gl(a)+gl(s.Pe);return so(a)&&so(s.Pe)?G_(c):z_(s.serializer,c)}(n,e)}function K_(n,e,t){return n instanceof Ss?Wh(n,e):n instanceof bs?Kh(n,e):t}function Q_(n,e){return n instanceof lo?function(r){return so(r)||function(o){return!!o&&"doubleValue"in o}(r)}(e)?e:{integerValue:0}:null}class co extends $s{}class Ss extends $s{constructor(e){super(),this.elements=e}}function Wh(n,e){const t=Qh(e);for(const r of n.elements)t.some(s=>Fe(s,r))||t.push(r);return{arrayValue:{values:t}}}class bs extends $s{constructor(e){super(),this.elements=e}}function Kh(n,e){let t=Qh(e);for(const r of n.elements)t=t.filter(s=>!Fe(s,r));return{arrayValue:{values:t}}}class lo extends $s{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function gl(n){return se(n.integerValue||n.doubleValue)}function Qh(n){return jo(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function J_(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Ss&&s instanceof Ss||r instanceof bs&&s instanceof bs?fn(r.elements,s.elements,Fe):r instanceof lo&&s instanceof lo?Fe(r.Pe,s.Pe):r instanceof co&&s instanceof co}(n.transform,e.transform)}class Vt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Vt}static exists(e){return new Vt(void 0,e)}static updateTime(e){return new Vt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function cs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Go{}function Jh(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new X_(n.key,Vt.none()):new Wo(n.key,n.data,Vt.none());{const t=n.data,r=Ve.empty();let s=new de(Se.comparator);for(let o of e.fields)if(!s.has(o)){let a=t.field(o);a===null&&o.length>1&&(o=o.popLast(),a=t.field(o)),a===null?r.delete(o):r.set(o,a),s=s.add(o)}return new Hs(n.key,r,new ht(s.toArray()),Vt.none())}}function Y_(n,e,t){n instanceof Wo?function(s,o,a){const c=s.value.clone(),u=_l(s.fieldTransforms,o,a.transformResults);c.setAll(u),o.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof Hs?function(s,o,a){if(!cs(s.precondition,o))return void o.convertToUnknownDocument(a.version);const c=_l(s.fieldTransforms,o,a.transformResults),u=o.data;u.setAll(Yh(s)),u.setAll(c),o.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):function(s,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function er(n,e,t,r){return n instanceof Wo?function(o,a,c,u){if(!cs(o.precondition,a))return c;const d=o.value.clone(),f=vl(o.fieldTransforms,u,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof Hs?function(o,a,c,u){if(!cs(o.precondition,a))return c;const d=vl(o.fieldTransforms,u,a),f=a.data;return f.setAll(Yh(o)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(_=>_.field))}(n,e,t,r):function(o,a,c){return cs(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function yl(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&fn(r,s,(o,a)=>J_(o,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Wo extends Go{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Hs extends Go{constructor(e,t,r,s,o=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Yh(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function _l(n,e,t){const r=new Map;re(n.length===t.length);for(let s=0;s<t.length;s++){const o=n[s],a=o.transform,c=e.data.field(o.field);r.set(o.field,K_(a,c,t[s]))}return r}function vl(n,e,t){const r=new Map;for(const s of n){const o=s.transform,a=t.data.field(s.field);r.set(s.field,W_(o,a,e))}return r}class X_ extends Go{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z_{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const o=this.mutations[s];o.key.isEqual(e.key)&&Y_(o,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=er(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=er(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Gh();return this.mutations.forEach(s=>{const o=e.get(s.key),a=o.overlayedDocument;let c=this.applyToLocalView(a,o.mutatedFields);c=t.has(s.key)?null:c;const u=Jh(a,c);u!==null&&r.set(s.key,u),a.isValidDocument()||a.convertToNoDocument($.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),K())}isEqual(e){return this.batchId===e.batchId&&fn(this.mutations,e.mutations,(t,r)=>yl(t,r))&&fn(this.baseMutations,e.baseMutations,(t,r)=>yl(t,r))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ev{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tv{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var oe,G;function Xh(n){if(n===void 0)return Ze("GRPC error has no .code"),L.UNKNOWN;switch(n){case oe.OK:return L.OK;case oe.CANCELLED:return L.CANCELLED;case oe.UNKNOWN:return L.UNKNOWN;case oe.DEADLINE_EXCEEDED:return L.DEADLINE_EXCEEDED;case oe.RESOURCE_EXHAUSTED:return L.RESOURCE_EXHAUSTED;case oe.INTERNAL:return L.INTERNAL;case oe.UNAVAILABLE:return L.UNAVAILABLE;case oe.UNAUTHENTICATED:return L.UNAUTHENTICATED;case oe.INVALID_ARGUMENT:return L.INVALID_ARGUMENT;case oe.NOT_FOUND:return L.NOT_FOUND;case oe.ALREADY_EXISTS:return L.ALREADY_EXISTS;case oe.PERMISSION_DENIED:return L.PERMISSION_DENIED;case oe.FAILED_PRECONDITION:return L.FAILED_PRECONDITION;case oe.ABORTED:return L.ABORTED;case oe.OUT_OF_RANGE:return L.OUT_OF_RANGE;case oe.UNIMPLEMENTED:return L.UNIMPLEMENTED;case oe.DATA_LOSS:return L.DATA_LOSS;default:return j()}}(G=oe||(oe={}))[G.OK=0]="OK",G[G.CANCELLED=1]="CANCELLED",G[G.UNKNOWN=2]="UNKNOWN",G[G.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",G[G.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",G[G.NOT_FOUND=5]="NOT_FOUND",G[G.ALREADY_EXISTS=6]="ALREADY_EXISTS",G[G.PERMISSION_DENIED=7]="PERMISSION_DENIED",G[G.UNAUTHENTICATED=16]="UNAUTHENTICATED",G[G.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",G[G.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",G[G.ABORTED=10]="ABORTED",G[G.OUT_OF_RANGE=11]="OUT_OF_RANGE",G[G.UNIMPLEMENTED=12]="UNIMPLEMENTED",G[G.INTERNAL=13]="INTERNAL",G[G.UNAVAILABLE=14]="UNAVAILABLE",G[G.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nv(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rv=new Nt([4294967295,4294967295],0);function Il(n){const e=nv().encode(n),t=new Rh;return t.update(e),new Uint8Array(t.digest())}function El(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),o=e.getUint32(12,!0);return[new Nt([t,r],0),new Nt([s,o],0)]}class Ko{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Wn(`Invalid padding: ${t}`);if(r<0)throw new Wn(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Wn(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Wn(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Nt.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(Nt.fromNumber(r)));return s.compare(rv)===1&&(s=new Nt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=Il(e),[r,s]=El(t);for(let o=0;o<this.hashCount;o++){const a=this.Ee(r,s,o);if(!this.de(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,o=new Uint8Array(Math.ceil(e/8)),a=new Ko(o,s,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.Ie===0)return;const t=Il(e),[r,s]=El(t);for(let o=0;o<this.hashCount;o++){const a=this.Ee(r,s,o);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Wn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class js{constructor(e,t,r,s,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Ir.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new js($.min(),s,new ie(J),It(),K())}}class Ir{constructor(e,t,r,s,o){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Ir(r,t,K(),K(),K())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class Zh{constructor(e,t){this.targetId=e,this.me=t}}class ed{constructor(e,t,r=fe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Tl{constructor(){this.fe=0,this.ge=Al(),this.pe=fe.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=K(),t=K(),r=K();return this.ge.forEach((s,o)=>{switch(o){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:j()}}),new Ir(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Al()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,re(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class sv{constructor(e){this.Le=e,this.Be=new Map,this.ke=It(),this.qe=wl(),this.Qe=new ie(J)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:j()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const o=s.target;if(oo(o))if(r===0){const a=new B(o.path);this.Ue(t,a,Ie.newNoDocument(a,$.min()))}else re(r===1);else{const a=this.Ye(t);if(a!==r){const c=this.Ze(e),u=c?this.Xe(c,e,a):1;if(u!==0){this.je(t);const d=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:o=0}=t;let a,c;try{a=Ft(r).toUint8Array()}catch(u){if(u instanceof Mh)return dn("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new Ko(a,s,o)}catch(u){return dn(u instanceof Wn?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.Ie===0?null:c}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(o=>{const a=this.Le.tt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;e.mightContain(c)||(this.Ue(t,o,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((o,a)=>{const c=this.Je(a);if(c){if(o.current&&oo(c.target)){const u=new B(c.target.path);this.ke.get(u)!==null||this.it(a,u)||this.Ue(a,u,Ie.newNoDocument(u,e))}o.be&&(t.set(a,o.ve()),o.Ce())}});let r=K();this.qe.forEach((o,a)=>{let c=!0;a.forEachWhile(u=>{const d=this.Je(u);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(o))}),this.ke.forEach((o,a)=>a.setReadTime(e));const s=new js(e,t,this.Qe,this.ke,r);return this.ke=It(),this.qe=wl(),this.Qe=new ie(J),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new Tl,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new de(J),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||M("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Tl),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function wl(){return new ie(B.comparator)}function Al(){return new ie(B.comparator)}const iv={asc:"ASCENDING",desc:"DESCENDING"},ov={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},av={and:"AND",or:"OR"};class cv{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function uo(n,e){return n.useProto3Json||Os(e)?e:{value:e}}function lv(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function uv(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function an(n){return re(!!n),$.fromTimestamp(function(t){const r=vt(t);return new be(r.seconds,r.nanos)}(n))}function hv(n,e){return ho(n,e).canonicalString()}function ho(n,e){const t=function(s){return new ne(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function td(n){const e=ne.fromString(n);return re(od(e)),e}function Di(n,e){const t=td(e);if(t.get(1)!==n.databaseId.projectId)throw new F(L.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new F(L.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new B(rd(t))}function nd(n,e){return hv(n.databaseId,e)}function dv(n){const e=td(n);return e.length===4?ne.emptyPath():rd(e)}function Sl(n){return new ne(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function rd(n){return re(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function fv(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:j()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],o=function(d,f){return d.useProto3Json?(re(f===void 0||typeof f=="string"),fe.fromBase64String(f||"")):(re(f===void 0||f instanceof Buffer||f instanceof Uint8Array),fe.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(d){const f=d.code===void 0?L.UNKNOWN:Xh(d.code);return new F(f,d.message||"")}(a);t=new ed(r,s,o,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Di(n,r.document.name),o=an(r.document.updateTime),a=r.document.createTime?an(r.document.createTime):$.min(),c=new Ve({mapValue:{fields:r.document.fields}}),u=Ie.newFoundDocument(s,o,a,c),d=r.targetIds||[],f=r.removedTargetIds||[];t=new ls(d,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Di(n,r.document),o=r.readTime?an(r.readTime):$.min(),a=Ie.newNoDocument(s,o),c=r.removedTargetIds||[];t=new ls([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Di(n,r.document),o=r.removedTargetIds||[];t=new ls([],o,s,null)}else{if(!("filter"in e))return j();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:o}=r,a=new tv(s,o),c=r.targetId;t=new Zh(c,a)}}return t}function pv(n,e){return{documents:[nd(n,e.path)]}}function mv(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=nd(n,s);const o=function(d){if(d.length!==0)return id(Be.create(d,"and"))}(e.filters);o&&(t.structuredQuery.where=o);const a=function(d){if(d.length!==0)return d.map(f=>function(w){return{field:en(w.field),direction:_v(w.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=uo(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:s}}function gv(n){let e=dv(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){re(r===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let o=[];t.where&&(o=function(_){const w=sd(_);return w instanceof Be&&Fh(w)?w.getFilters():[w]}(t.where));let a=[];t.orderBy&&(a=function(_){return _.map(w=>function(k){return new As(tn(k.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(k.direction))}(w))}(t.orderBy));let c=null;t.limit&&(c=function(_){let w;return w=typeof _=="object"?_.value:_,Os(w)?null:w}(t.limit));let u=null;t.startAt&&(u=function(_){const w=!!_.before,b=_.values||[];return new ws(b,w)}(t.startAt));let d=null;return t.endAt&&(d=function(_){const w=!_.before,b=_.values||[];return new ws(b,w)}(t.endAt)),M_(e,s,a,o,c,"F",u,d)}function yv(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return j()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function sd(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=tn(t.unaryFilter.field);return ae.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=tn(t.unaryFilter.field);return ae.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=tn(t.unaryFilter.field);return ae.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=tn(t.unaryFilter.field);return ae.create(a,"!=",{nullValue:"NULL_VALUE"});default:return j()}}(n):n.fieldFilter!==void 0?function(t){return ae.create(tn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return j()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Be.create(t.compositeFilter.filters.map(r=>sd(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return j()}}(t.compositeFilter.op))}(n):j()}function _v(n){return iv[n]}function vv(n){return ov[n]}function Iv(n){return av[n]}function en(n){return{fieldPath:n.canonicalString()}}function tn(n){return Se.fromServerFormat(n.fieldPath)}function id(n){return n instanceof ae?function(t){if(t.op==="=="){if(hl(t.value))return{unaryFilter:{field:en(t.field),op:"IS_NAN"}};if(ul(t.value))return{unaryFilter:{field:en(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(hl(t.value))return{unaryFilter:{field:en(t.field),op:"IS_NOT_NAN"}};if(ul(t.value))return{unaryFilter:{field:en(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:en(t.field),op:vv(t.op),value:t.value}}}(n):n instanceof Be?function(t){const r=t.getFilters().map(s=>id(s));return r.length===1?r[0]:{compositeFilter:{op:Iv(t.op),filters:r}}}(n):j()}function od(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt{constructor(e,t,r,s,o=$.min(),a=$.min(),c=fe.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new dt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new dt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new dt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new dt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ev{constructor(e){this.ct=e}}function Tv(n){const e=gv({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ao(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wv{constructor(){this.un=new Av}addToCollectionParentIndex(e,t){return this.un.add(t),R.resolve()}getCollectionParents(e,t){return R.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return R.resolve()}deleteFieldIndex(e,t){return R.resolve()}deleteAllFieldIndexes(e){return R.resolve()}createTargetIndexes(e,t){return R.resolve()}getDocumentsMatchingTarget(e,t){return R.resolve(null)}getIndexType(e,t){return R.resolve(0)}getFieldIndexes(e,t){return R.resolve([])}getNextCollectionGroupToUpdate(e){return R.resolve(null)}getMinOffset(e,t){return R.resolve(_t.min())}getMinOffsetFromCollectionGroup(e,t){return R.resolve(_t.min())}updateCollectionGroup(e,t,r){return R.resolve()}updateIndexEntries(e,t){return R.resolve()}}class Av{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new de(ne.comparator),o=!s.has(r);return this.index[t]=s.add(r),o}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new de(ne.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gn{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new gn(0)}static kn(){return new gn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sv{constructor(){this.changes=new wn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ie.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?R.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bv{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cv{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&er(r.mutation,s,ht.empty(),be.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,K()).next(()=>r))}getLocalViewOfDocuments(e,t,r=K()){const s=Dt();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(o=>{let a=Gn();return o.forEach((c,u)=>{a=a.insert(c,u.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=Dt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,K()))}populateOverlays(e,t,r){const s=[];return r.forEach(o=>{t.has(o)||s.push(o)}),this.documentOverlayCache.getOverlays(e,s).next(o=>{o.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,s){let o=It();const a=Zn(),c=function(){return Zn()}();return t.forEach((u,d)=>{const f=r.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof Hs)?o=o.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),er(f.mutation,d,f.mutation.getFieldMask(),be.now())):a.set(d.key,ht.empty())}),this.recalculateAndSaveOverlays(e,o).next(u=>(u.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var _;return c.set(d,new bv(f,(_=a.get(d))!==null&&_!==void 0?_:null))}),c))}recalculateAndSaveOverlays(e,t){const r=Zn();let s=new ie((a,c)=>a-c),o=K();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(u=>{const d=t.get(u);if(d===null)return;let f=r.get(u)||ht.empty();f=c.applyToLocalView(d,f),r.set(u,f);const _=(s.get(c.batchId)||K()).add(u);s=s.insert(c.batchId,_)})}).next(()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),d=u.key,f=u.value,_=Gh();f.forEach(w=>{if(!o.has(w)){const b=Jh(t.get(w),r.get(w));b!==null&&_.set(w,b),o=o.add(w)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,_))}return R.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(a){return B.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):O_(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(o=>{const a=s-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-o.size):R.resolve(Dt());let c=-1,u=o;return a.next(d=>R.forEach(d,(f,_)=>(c<_.largestBatchId&&(c=_.largestBatchId),o.get(f)?R.resolve():this.remoteDocumentCache.getEntry(e,f).next(w=>{u=u.insert(f,w)}))).next(()=>this.populateOverlays(e,d,o)).next(()=>this.computeViews(e,u,d,K())).next(f=>({batchId:c,changes:$_(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new B(t)).next(r=>{let s=Gn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const o=t.collectionGroup;let a=Gn();return this.indexManager.getCollectionParents(e,o).next(c=>R.forEach(c,u=>{const d=function(_,w){return new Fs(w,null,_.explicitOrderBy.slice(),_.filters.slice(),_.limit,_.limitType,_.startAt,_.endAt)}(t,u.child(o));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next(f=>{f.forEach((_,w)=>{a=a.insert(_,w)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,s){let o;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,o,s))).next(a=>{o.forEach((u,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,Ie.newInvalidDocument(f)))});let c=Gn();return a.forEach((u,d)=>{const f=o.get(u);f!==void 0&&er(f.mutation,d,ht.empty(),be.now()),Us(t,d)&&(c=c.insert(u,d))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rv{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return R.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:an(s.createTime)}}(t)),R.resolve()}getNamedQuery(e,t){return R.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:Tv(s.bundledQuery),readTime:an(s.readTime)}}(t)),R.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pv{constructor(){this.overlays=new ie(B.comparator),this.Ir=new Map}getOverlay(e,t){return R.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Dt();return R.forEach(t,s=>this.getOverlay(e,s).next(o=>{o!==null&&r.set(s,o)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,o)=>{this.ht(e,t,o)}),R.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(o=>this.overlays=this.overlays.remove(o)),this.Ir.delete(r)),R.resolve()}getOverlaysForCollection(e,t,r){const s=Dt(),o=t.length+1,a=new B(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const u=c.getNext().value,d=u.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===o&&u.largestBatchId>r&&s.set(u.getKey(),u)}return R.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let o=new ie((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=o.get(d.largestBatchId);f===null&&(f=Dt(),o=o.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const c=Dt(),u=o.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((d,f)=>c.set(d,f)),!(c.size()>=s)););return R.resolve(c)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new ev(t,r));let o=this.Ir.get(t);o===void 0&&(o=K(),this.Ir.set(t,o)),this.Ir.set(t,o.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kv{constructor(){this.sessionToken=fe.EMPTY_BYTE_STRING}getSessionToken(e){return R.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,R.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qo{constructor(){this.Tr=new de(ce.Er),this.dr=new de(ce.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new ce(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new ce(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new B(new ne([])),r=new ce(t,e),s=new ce(t,e+1),o=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),o.push(a.key)}),o}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new B(new ne([])),r=new ce(t,e),s=new ce(t,e+1);let o=K();return this.dr.forEachInRange([r,s],a=>{o=o.add(a.key)}),o}containsKey(e){const t=new ce(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ce{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return B.comparator(e.key,t.key)||J(e.wr,t.wr)}static Ar(e,t){return J(e.wr,t.wr)||B.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dv{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new de(ce.Er)}checkEmpty(e){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const o=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Z_(o,t,r,s);this.mutationQueue.push(a);for(const c of s)this.br=this.br.add(new ce(c.key,o)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return R.resolve(a)}lookupMutationBatch(e,t){return R.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),o=s<0?0:s;return R.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ce(t,0),s=new ce(t,Number.POSITIVE_INFINITY),o=[];return this.br.forEachInRange([r,s],a=>{const c=this.Dr(a.wr);o.push(c)}),R.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(J);return t.forEach(s=>{const o=new ce(s,0),a=new ce(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([o,a],c=>{r=r.add(c.wr)})}),R.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let o=r;B.isDocumentKey(o)||(o=o.child(""));const a=new ce(new B(o),0);let c=new de(J);return this.br.forEachWhile(u=>{const d=u.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(c=c.add(u.wr)),!0)},a),R.resolve(this.Cr(c))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){re(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return R.forEach(t.mutations,s=>{const o=new ce(s.key,t.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new ce(t,0),s=this.br.firstAfterOrEqual(r);return R.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,R.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nv{constructor(e){this.Mr=e,this.docs=function(){return new ie(B.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),o=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return R.resolve(r?r.document.mutableCopy():Ie.newInvalidDocument(t))}getEntries(e,t){let r=It();return t.forEach(s=>{const o=this.docs.get(s);r=r.insert(s,o?o.document.mutableCopy():Ie.newInvalidDocument(s))}),R.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let o=It();const a=t.path,c=new B(a.child("")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:d,value:{document:f}}=u.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||g_(m_(f),r)<=0||(s.has(f.key)||Us(t,f))&&(o=o.insert(f.key,f.mutableCopy()))}return R.resolve(o)}getAllFromCollectionGroup(e,t,r,s){j()}Or(e,t){return R.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new Lv(this)}getSize(e){return R.resolve(this.size)}}class Lv extends Sv{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),R.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vv{constructor(e){this.persistence=e,this.Nr=new wn(t=>qo(t),zo),this.lastRemoteSnapshotVersion=$.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Qo,this.targetCount=0,this.kr=gn.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),R.resolve()}getLastRemoteSnapshotVersion(e){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return R.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),R.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new gn(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,R.resolve()}updateTargetData(e,t){return this.Kn(t),R.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,R.resolve()}removeTargets(e,t,r){let s=0;const o=[];return this.Nr.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.Nr.delete(a),o.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),R.waitFor(o).next(()=>s)}getTargetCount(e){return R.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return R.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),R.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,o=[];return s&&t.forEach(a=>{o.push(s.markPotentiallyOrphaned(e,a))}),R.waitFor(o)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),R.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return R.resolve(r)}containsKey(e,t){return R.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mv{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Uo(0),this.Kr=!1,this.Kr=!0,this.$r=new kv,this.referenceDelegate=e(this),this.Ur=new Vv(this),this.indexManager=new wv,this.remoteDocumentCache=function(s){return new Nv(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new Ev(t),this.Gr=new Rv(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Pv,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new Dv(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){M("MemoryPersistence","Starting transaction:",e);const s=new Ov(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(o=>this.referenceDelegate.jr(s).next(()=>o)).toPromise().then(o=>(s.raiseOnCommittedEvent(),o))}Hr(e,t){return R.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class Ov extends __{constructor(e){super(),this.currentSequenceNumber=e}}class Jo{constructor(e){this.persistence=e,this.Jr=new Qo,this.Yr=null}static Zr(e){return new Jo(e)}get Xr(){if(this.Yr)return this.Yr;throw j()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),R.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),R.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),R.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(o=>this.Xr.add(o.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.Xr,r=>{const s=B.fromPath(r);return this.ei(e,s).next(o=>{o||t.removeEntry(s,$.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return R.or([()=>R.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=K(),s=K();for(const o of t.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:s=s.add(o.doc.key)}return new Yo(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xv{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fv{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return $p()?8:v_(Ee())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const o={result:null};return this.Yi(e,t).next(a=>{o.result=a}).next(()=>{if(!o.result)return this.Zi(e,t,s,r).next(a=>{o.result=a})}).next(()=>{if(o.result)return;const a=new xv;return this.Xi(e,t,a).next(c=>{if(o.result=c,this.zi)return this.es(e,t,a,c.size)})}).next(()=>o.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(Hn()<=z.DEBUG&&M("QueryEngine","SDK will not create cache indexes for query:",Zt(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),R.resolve()):(Hn()<=z.DEBUG&&M("QueryEngine","Query:",Zt(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(Hn()<=z.DEBUG&&M("QueryEngine","The SDK decides to create cache indexes for query:",Zt(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xe(t))):R.resolve())}Yi(e,t){if(ml(t))return R.resolve(null);let r=xe(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=ao(t,null,"F"),r=xe(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(o=>{const a=K(...o);return this.Ji.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{const d=this.ts(t,c);return this.ns(t,d,a,u.readTime)?this.Yi(e,ao(t,null,"F")):this.rs(e,d,t,u)}))})))}Zi(e,t,r,s){return ml(t)||s.isEqual($.min())?R.resolve(null):this.Ji.getDocuments(e,r).next(o=>{const a=this.ts(t,o);return this.ns(t,a,r,s)?R.resolve(null):(Hn()<=z.DEBUG&&M("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Zt(t)),this.rs(e,a,t,p_(s,-1)).next(c=>c))})}ts(e,t){let r=new de(qh(e));return t.forEach((s,o)=>{Us(e,o)&&(r=r.add(o))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const o=e.limitType==="F"?t.last():t.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(s)>0)}Xi(e,t,r){return Hn()<=z.DEBUG&&M("QueryEngine","Using full collection scan to execute query:",Zt(t)),this.Ji.getDocumentsMatchingQuery(e,t,_t.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(o=>(t.forEach(a=>{o=o.insert(a.key,a)}),o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bv{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new ie(J),this._s=new wn(o=>qo(o),zo),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Cv(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function Uv(n,e,t,r){return new Bv(n,e,t,r)}async function ad(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(o=>(s=o,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(o=>{const a=[],c=[];let u=K();for(const d of s){a.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}for(const d of o){c.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:c}))})})}function cd(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function $v(n,e){const t=W(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",o=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const c=[];e.targetChanges.forEach((f,_)=>{const w=s.get(_);if(!w)return;c.push(t.Ur.removeMatchingKeys(o,f.removedDocuments,_).next(()=>t.Ur.addMatchingKeys(o,f.addedDocuments,_)));let b=w.withSequenceNumber(o.currentSequenceNumber);e.targetMismatches.get(_)!==null?b=b.withResumeToken(fe.EMPTY_BYTE_STRING,$.min()).withLastLimboFreeSnapshotVersion($.min()):f.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(f.resumeToken,r)),s=s.insert(_,b),function(C,P,O){return C.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-C.snapshotVersion.toMicroseconds()>=3e8?!0:O.addedDocuments.size+O.modifiedDocuments.size+O.removedDocuments.size>0}(w,b,f)&&c.push(t.Ur.updateTargetData(o,b))});let u=It(),d=K();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(o,f))}),c.push(Hv(o,a,e.documentUpdates).next(f=>{u=f.Ps,d=f.Is})),!r.isEqual($.min())){const f=t.Ur.getLastRemoteSnapshotVersion(o).next(_=>t.Ur.setTargetsMetadata(o,o.currentSequenceNumber,r));c.push(f)}return R.waitFor(c).next(()=>a.apply(o)).next(()=>t.localDocuments.getLocalViewOfDocuments(o,u,d)).next(()=>u)}).then(o=>(t.os=s,o))}function Hv(n,e,t){let r=K(),s=K();return t.forEach(o=>r=r.add(o)),e.getEntries(n,r).next(o=>{let a=It();return t.forEach((c,u)=>{const d=o.get(c);u.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual($.min())?(e.removeEntry(c,u.readTime),a=a.insert(c,u)):!d.isValidDocument()||u.version.compareTo(d.version)>0||u.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(u),a=a.insert(c,u)):M("LocalStore","Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",u.version)}),{Ps:a,Is:s}})}function jv(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(o=>o?(s=o,R.resolve(s)):t.Ur.allocateTargetId(r).next(a=>(s=new dt(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function fo(n,e,t){const r=W(n),s=r.os.get(e),o=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",o,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!vr(a))throw a;M("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function bl(n,e,t){const r=W(n);let s=$.min(),o=K();return r.persistence.runTransaction("Execute query","readwrite",a=>function(u,d,f){const _=W(u),w=_._s.get(f);return w!==void 0?R.resolve(_.os.get(w)):_.Ur.getTargetData(d,f)}(r,a,xe(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,c.targetId).next(u=>{o=u})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?s:$.min(),t?o:K())).next(c=>(qv(r,F_(e),c),{documents:c,Ts:o})))}function qv(n,e,t){let r=n.us.get(e)||$.min();t.forEach((s,o)=>{o.readTime.compareTo(r)>0&&(r=o.readTime)}),n.us.set(e,r)}class Cl{constructor(){this.activeTargetIds=q_()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class zv{constructor(){this.so=new Cl,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Cl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gv{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rl{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){M("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){M("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yr=null;function Ni(){return Yr===null?Yr=function(){return 268435456+Math.round(2147483648*Math.random())}():Yr++,"0x"+Yr.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wv={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kv{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _e="WebChannelConnection";class Qv extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${o}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${o}`}get Fo(){return!1}Mo(t,r,s,o,a){const c=Ni(),u=this.xo(t,r.toUriEncodedString());M("RestConnection",`Sending RPC '${t}' ${c}:`,u,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,o,a),this.No(t,u,d,s).then(f=>(M("RestConnection",`Received RPC '${t}' ${c}: `,f),f),f=>{throw dn("RestConnection",`RPC '${t}' ${c} failed with error: `,f,"url: ",u,"request:",s),f})}Lo(t,r,s,o,a,c){return this.Mo(t,r,s,o,a)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Tn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((o,a)=>t[a]=o),s&&s.headers.forEach((o,a)=>t[a]=o)}xo(t,r){const s=Wv[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const o=Ni();return new Promise((a,c)=>{const u=new Ph;u.setWithCredentials(!0),u.listenOnce(kh.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case as.NO_ERROR:const f=u.getResponseJson();M(_e,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(f)),a(f);break;case as.TIMEOUT:M(_e,`RPC '${e}' ${o} timed out`),c(new F(L.DEADLINE_EXCEEDED,"Request time out"));break;case as.HTTP_ERROR:const _=u.getStatus();if(M(_e,`RPC '${e}' ${o} failed with status:`,_,"response text:",u.getResponseText()),_>0){let w=u.getResponseJson();Array.isArray(w)&&(w=w[0]);const b=w==null?void 0:w.error;if(b&&b.status&&b.message){const k=function(P){const O=P.toLowerCase().replace(/_/g,"-");return Object.values(L).indexOf(O)>=0?O:L.UNKNOWN}(b.status);c(new F(k,b.message))}else c(new F(L.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new F(L.UNAVAILABLE,"Connection failed."));break;default:j()}}finally{M(_e,`RPC '${e}' ${o} completed.`)}});const d=JSON.stringify(s);M(_e,`RPC '${e}' ${o} sending request:`,s),u.send(t,"POST",d,r,15)})}Bo(e,t,r){const s=Ni(),o=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Lh(),c=Nh(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(u.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const f=o.join("");M(_e,`Creating RPC '${e}' stream ${s}: ${f}`,u);const _=a.createWebChannel(f,u);let w=!1,b=!1;const k=new Kv({Io:P=>{b?M(_e,`Not sending because RPC '${e}' stream ${s} is closed:`,P):(w||(M(_e,`Opening RPC '${e}' stream ${s} transport.`),_.open(),w=!0),M(_e,`RPC '${e}' stream ${s} sending:`,P),_.send(P))},To:()=>_.close()}),C=(P,O,H)=>{P.listen(O,q=>{try{H(q)}catch(N){setTimeout(()=>{throw N},0)}})};return C(_,zn.EventType.OPEN,()=>{b||(M(_e,`RPC '${e}' stream ${s} transport opened.`),k.yo())}),C(_,zn.EventType.CLOSE,()=>{b||(b=!0,M(_e,`RPC '${e}' stream ${s} transport closed`),k.So())}),C(_,zn.EventType.ERROR,P=>{b||(b=!0,dn(_e,`RPC '${e}' stream ${s} transport errored:`,P),k.So(new F(L.UNAVAILABLE,"The operation could not be completed")))}),C(_,zn.EventType.MESSAGE,P=>{var O;if(!b){const H=P.data[0];re(!!H);const q=H,N=q.error||((O=q[0])===null||O===void 0?void 0:O.error);if(N){M(_e,`RPC '${e}' stream ${s} received error:`,N);const x=N.status;let V=function(m){const v=oe[m];if(v!==void 0)return Xh(v)}(x),I=N.message;V===void 0&&(V=L.INTERNAL,I="Unknown error status: "+x+" with message "+N.message),b=!0,k.So(new F(V,I)),_.close()}else M(_e,`RPC '${e}' stream ${s} received:`,H),k.bo(H)}}),C(c,Dh.STAT_EVENT,P=>{P.stat===to.PROXY?M(_e,`RPC '${e}' stream ${s} detected buffering proxy`):P.stat===to.NOPROXY&&M(_e,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{k.wo()},0),k}}function Li(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ld(n){return new cv(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ud{constructor(e,t,r=1e3,s=1.5,o=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=o,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&M("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jv{constructor(e,t,r,s,o,a,c,u){this.ui=e,this.Ho=r,this.Jo=s,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new ud(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===L.RESOURCE_EXHAUSTED?(Ze(t.toString()),Ze("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===L.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new F(L.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return M("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(M("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Yv extends Jv{constructor(e,t,r,s,o,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=o}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=fv(this.serializer,e),r=function(o){if(!("targetChange"in o))return $.min();const a=o.targetChange;return a.targetIds&&a.targetIds.length?$.min():a.readTime?an(a.readTime):$.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=Sl(this.serializer),t.addTarget=function(o,a){let c;const u=a.target;if(c=oo(u)?{documents:pv(o,u)}:{query:mv(o,u)._t},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=uv(o,a.resumeToken);const d=uo(o,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo($.min())>0){c.readTime=lv(o,a.snapshotVersion.toTimestamp());const d=uo(o,a.expectedCount);d!==null&&(c.expectedCount=d)}return c}(this.serializer,e);const r=yv(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=Sl(this.serializer),t.removeTarget=e,this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xv extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new F(L.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Mo(e,ho(t,r),s,o,a)).catch(o=>{throw o.name==="FirebaseError"?(o.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new F(L.UNKNOWN,o.toString())})}Lo(e,t,r,s,o){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Lo(e,ho(t,r),s,a,c,o)).catch(a=>{throw a.name==="FirebaseError"?(a.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new F(L.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class Zv{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Ze(t),this.D_=!1):M("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eI{constructor(e,t,r,s,o){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=o,this.k_._o(a=>{r.enqueueAndForget(async()=>{Tr(this)&&(M("RemoteStore","Restarting streams for network reachability change."),await async function(u){const d=W(u);d.L_.add(4),await Er(d),d.q_.set("Unknown"),d.L_.delete(4),await qs(d)}(this))})}),this.q_=new Zv(r,s)}}async function qs(n){if(Tr(n))for(const e of n.B_)await e(!0)}async function Er(n){for(const e of n.B_)await e(!1)}function hd(n,e){const t=W(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),ta(t)?ea(t):An(t).r_()&&Zo(t,e))}function Xo(n,e){const t=W(n),r=An(t);t.N_.delete(e),r.r_()&&dd(t,e),t.N_.size===0&&(r.r_()?r.o_():Tr(t)&&t.q_.set("Unknown"))}function Zo(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo($.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}An(n).A_(e)}function dd(n,e){n.Q_.xe(e),An(n).R_(e)}function ea(n){n.Q_=new sv({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),An(n).start(),n.q_.v_()}function ta(n){return Tr(n)&&!An(n).n_()&&n.N_.size>0}function Tr(n){return W(n).L_.size===0}function fd(n){n.Q_=void 0}async function tI(n){n.q_.set("Online")}async function nI(n){n.N_.forEach((e,t)=>{Zo(n,e)})}async function rI(n,e){fd(n),ta(n)?(n.q_.M_(e),ea(n)):n.q_.set("Unknown")}async function sI(n,e,t){if(n.q_.set("Online"),e instanceof ed&&e.state===2&&e.cause)try{await async function(s,o){const a=o.cause;for(const c of o.targetIds)s.N_.has(c)&&(await s.remoteSyncer.rejectListen(c,a),s.N_.delete(c),s.Q_.removeTarget(c))}(n,e)}catch(r){M("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Pl(n,r)}else if(e instanceof ls?n.Q_.Ke(e):e instanceof Zh?n.Q_.He(e):n.Q_.We(e),!t.isEqual($.min()))try{const r=await cd(n.localStore);t.compareTo(r)>=0&&await function(o,a){const c=o.Q_.rt(a);return c.targetChanges.forEach((u,d)=>{if(u.resumeToken.approximateByteSize()>0){const f=o.N_.get(d);f&&o.N_.set(d,f.withResumeToken(u.resumeToken,a))}}),c.targetMismatches.forEach((u,d)=>{const f=o.N_.get(u);if(!f)return;o.N_.set(u,f.withResumeToken(fe.EMPTY_BYTE_STRING,f.snapshotVersion)),dd(o,u);const _=new dt(f.target,u,d,f.sequenceNumber);Zo(o,_)}),o.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){M("RemoteStore","Failed to raise snapshot:",r),await Pl(n,r)}}async function Pl(n,e,t){if(!vr(e))throw e;n.L_.add(1),await Er(n),n.q_.set("Offline"),t||(t=()=>cd(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{M("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await qs(n)})}async function kl(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),M("RemoteStore","RemoteStore received new credentials");const r=Tr(t);t.L_.add(3),await Er(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await qs(t)}async function iI(n,e){const t=W(n);e?(t.L_.delete(2),await qs(t)):e||(t.L_.add(2),await Er(t),t.q_.set("Unknown"))}function An(n){return n.K_||(n.K_=function(t,r,s){const o=W(t);return o.w_(),new Yv(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)}(n.datastore,n.asyncQueue,{Eo:tI.bind(null,n),Ro:nI.bind(null,n),mo:rI.bind(null,n),d_:sI.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),ta(n)?ea(n):n.q_.set("Unknown")):(await n.K_.stop(),fd(n))})),n.K_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class na{constructor(e,t,r,s,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=o,this.deferred=new Lt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,o){const a=Date.now()+r,c=new na(e,t,a,s,o);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new F(L.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function pd(n,e){if(Ze("AsyncQueue",`${e}: ${n}`),vr(n))return new F(L.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn{constructor(e){this.comparator=e?(t,r)=>e(t,r)||B.comparator(t.key,r.key):(t,r)=>B.comparator(t.key,r.key),this.keyedMap=Gn(),this.sortedSet=new ie(this.comparator)}static emptySet(e){return new cn(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof cn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,o=r.getNext().key;if(!s.isEqual(o))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new cn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dl{constructor(){this.W_=new ie(B.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):j():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class yn{constructor(e,t,r,s,o,a,c,u,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=o,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,o){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new yn(e,t,cn.emptySet(t),a,r,s,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Bs(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oI{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class aI{constructor(){this.queries=Nl(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=W(t),o=s.queries;s.queries=Nl(),o.forEach((a,c)=>{for(const u of c.j_)u.onError(r)})})(this,new F(L.ABORTED,"Firestore shutting down"))}}function Nl(){return new wn(n=>jh(n),Bs)}async function cI(n,e){const t=W(n);let r=3;const s=e.query;let o=t.queries.get(s);o?!o.H_()&&e.J_()&&(r=2):(o=new oI,r=e.J_()?0:1);try{switch(r){case 0:o.z_=await t.onListen(s,!0);break;case 1:o.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=pd(a,`Initialization of query '${Zt(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,o),o.j_.push(e),e.Z_(t.onlineState),o.z_&&e.X_(o.z_)&&ra(t)}async function lI(n,e){const t=W(n),r=e.query;let s=3;const o=t.queries.get(r);if(o){const a=o.j_.indexOf(e);a>=0&&(o.j_.splice(a,1),o.j_.length===0?s=e.J_()?0:1:!o.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function uI(n,e){const t=W(n);let r=!1;for(const s of e){const o=s.query,a=t.queries.get(o);if(a){for(const c of a.j_)c.X_(s)&&(r=!0);a.z_=s}}r&&ra(t)}function hI(n,e,t){const r=W(n),s=r.queries.get(e);if(s)for(const o of s.j_)o.onError(t);r.queries.delete(e)}function ra(n){n.Y_.forEach(e=>{e.next()})}var po,Ll;(Ll=po||(po={})).ea="default",Ll.Cache="cache";class dI{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new yn(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=yn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==po.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class md{constructor(e){this.key=e}}class gd{constructor(e){this.key=e}}class fI{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=K(),this.mutatedKeys=K(),this.Aa=qh(e),this.Ra=new cn(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Dl,s=t?t.Ra:this.Ra;let o=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,_)=>{const w=s.get(f),b=Us(this.query,_)?_:null,k=!!w&&this.mutatedKeys.has(w.key),C=!!b&&(b.hasLocalMutations||this.mutatedKeys.has(b.key)&&b.hasCommittedMutations);let P=!1;w&&b?w.data.isEqual(b.data)?k!==C&&(r.track({type:3,doc:b}),P=!0):this.ga(w,b)||(r.track({type:2,doc:b}),P=!0,(u&&this.Aa(b,u)>0||d&&this.Aa(b,d)<0)&&(c=!0)):!w&&b?(r.track({type:0,doc:b}),P=!0):w&&!b&&(r.track({type:1,doc:w}),P=!0,(u||d)&&(c=!0)),P&&(b?(a=a.add(b),o=C?o.add(f):o.delete(f)):(a=a.delete(f),o=o.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),o=o.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:c,mutatedKeys:o}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const o=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,_)=>function(b,k){const C=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return j()}};return C(b)-C(k)}(f.type,_.type)||this.Aa(f.doc,_.doc)),this.pa(r),s=s!=null&&s;const c=t&&!s?this.ya():[],u=this.da.size===0&&this.current&&!s?1:0,d=u!==this.Ea;return this.Ea=u,a.length!==0||d?{snapshot:new yn(this.query,e.Ra,o,a,e.mutatedKeys,u===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:c}:{wa:c}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Dl,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=K(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new gd(r))}),this.da.forEach(r=>{e.has(r)||t.push(new md(r))}),t}ba(e){this.Ta=e.Ts,this.da=K();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return yn.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class pI{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class mI{constructor(e){this.key=e,this.va=!1}}class gI{constructor(e,t,r,s,o,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new wn(c=>jh(c),Bs),this.Ma=new Map,this.xa=new Set,this.Oa=new ie(B.comparator),this.Na=new Map,this.La=new Qo,this.Ba={},this.ka=new Map,this.qa=gn.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function yI(n,e,t=!0){const r=Ed(n);let s;const o=r.Fa.get(e);return o?(r.sharedClientState.addLocalQueryTarget(o.targetId),s=o.view.Da()):s=await yd(r,e,t,!0),s}async function _I(n,e){const t=Ed(n);await yd(t,e,!0,!1)}async function yd(n,e,t,r){const s=await jv(n.localStore,xe(e)),o=s.targetId,a=n.sharedClientState.addLocalQueryTarget(o,t);let c;return r&&(c=await vI(n,e,o,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&hd(n.remoteStore,s),c}async function vI(n,e,t,r,s){n.Ka=(_,w,b)=>async function(C,P,O,H){let q=P.view.ma(O);q.ns&&(q=await bl(C.localStore,P.query,!1).then(({documents:I})=>P.view.ma(I,q)));const N=H&&H.targetChanges.get(P.targetId),x=H&&H.targetMismatches.get(P.targetId)!=null,V=P.view.applyChanges(q,C.isPrimaryClient,N,x);return Ml(C,P.targetId,V.wa),V.snapshot}(n,_,w,b);const o=await bl(n.localStore,e,!0),a=new fI(e,o.Ts),c=a.ma(o.documents),u=Ir.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(c,n.isPrimaryClient,u);Ml(n,t,d.wa);const f=new pI(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function II(n,e,t){const r=W(n),s=r.Fa.get(e),o=r.Ma.get(s.targetId);if(o.length>1)return r.Ma.set(s.targetId,o.filter(a=>!Bs(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await fo(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&Xo(r.remoteStore,s.targetId),mo(r,s.targetId)}).catch(Bo)):(mo(r,s.targetId),await fo(r.localStore,s.targetId,!0))}async function EI(n,e){const t=W(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Xo(t.remoteStore,r.targetId))}async function _d(n,e){const t=W(n);try{const r=await $v(t.localStore,e);e.targetChanges.forEach((s,o)=>{const a=t.Na.get(o);a&&(re(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?re(a.va):s.removedDocuments.size>0&&(re(a.va),a.va=!1))}),await Id(t,r,e)}catch(r){await Bo(r)}}function Vl(n,e,t){const r=W(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((o,a)=>{const c=a.view.Z_(e);c.snapshot&&s.push(c.snapshot)}),function(a,c){const u=W(a);u.onlineState=c;let d=!1;u.queries.forEach((f,_)=>{for(const w of _.j_)w.Z_(c)&&(d=!0)}),d&&ra(u)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function TI(n,e,t){const r=W(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),o=s&&s.key;if(o){let a=new ie(B.comparator);a=a.insert(o,Ie.newNoDocument(o,$.min()));const c=K().add(o),u=new js($.min(),new Map,new ie(J),a,c);await _d(r,u),r.Oa=r.Oa.remove(o),r.Na.delete(e),sa(r)}else await fo(r.localStore,e,!1).then(()=>mo(r,e,t)).catch(Bo)}function mo(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||vd(n,r)})}function vd(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(Xo(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),sa(n))}function Ml(n,e,t){for(const r of t)r instanceof md?(n.La.addReference(r.key,e),wI(n,r)):r instanceof gd?(M("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||vd(n,r.key)):j()}function wI(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(M("SyncEngine","New document in limbo: "+t),n.xa.add(r),sa(n))}function sa(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new B(ne.fromString(e)),r=n.qa.next();n.Na.set(r,new mI(t)),n.Oa=n.Oa.insert(t,r),hd(n.remoteStore,new dt(xe(Hh(t.path)),r,"TargetPurposeLimboResolution",Uo.oe))}}async function Id(n,e,t){const r=W(n),s=[],o=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((c,u)=>{a.push(r.Ka(u,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const _=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,_?"current":"not-current")}if(d){s.push(d);const _=Yo.Wi(u.targetId,d);o.push(_)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(u,d){const f=W(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",_=>R.forEach(d,w=>R.forEach(w.$i,b=>f.persistence.referenceDelegate.addReference(_,w.targetId,b)).next(()=>R.forEach(w.Ui,b=>f.persistence.referenceDelegate.removeReference(_,w.targetId,b)))))}catch(_){if(!vr(_))throw _;M("LocalStore","Failed to update sequence numbers: "+_)}for(const _ of d){const w=_.targetId;if(!_.fromCache){const b=f.os.get(w),k=b.snapshotVersion,C=b.withLastLimboFreeSnapshotVersion(k);f.os=f.os.insert(w,C)}}}(r.localStore,o))}async function AI(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){M("SyncEngine","User change. New user:",e.toKey());const r=await ad(t.localStore,e);t.currentUser=e,function(o,a){o.ka.forEach(c=>{c.forEach(u=>{u.reject(new F(L.CANCELLED,a))})}),o.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Id(t,r.hs)}}function SI(n,e){const t=W(n),r=t.Na.get(e);if(r&&r.va)return K().add(r.key);{let s=K();const o=t.Ma.get(e);if(!o)return s;for(const a of o){const c=t.Fa.get(a);s=s.unionWith(c.view.Va)}return s}}function Ed(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=_d.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=SI.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=TI.bind(null,e),e.Ca.d_=uI.bind(null,e.eventManager),e.Ca.$a=hI.bind(null,e.eventManager),e}class Cs{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ld(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return Uv(this.persistence,new Fv,e.initialUser,this.serializer)}Ga(e){return new Mv(Jo.Zr,this.serializer)}Wa(e){return new zv}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Cs.provider={build:()=>new Cs};class go{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Vl(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=AI.bind(null,this.syncEngine),await iI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new aI}()}createDatastore(e){const t=ld(e.databaseInfo.databaseId),r=function(o){return new Qv(o)}(e.databaseInfo);return function(o,a,c,u){return new Xv(o,a,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,o,a,c){return new eI(r,s,o,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Vl(this.syncEngine,t,0),function(){return Rl.D()?new Rl:new Gv}())}createSyncEngine(e,t){return function(s,o,a,c,u,d,f){const _=new gI(s,o,a,c,u,d);return f&&(_.Qa=!0),_}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const o=W(s);M("RemoteStore","RemoteStore shutting down."),o.L_.add(5),await Er(o),o.k_.shutdown(),o.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}go.provider={build:()=>new go};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bI{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Ze("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CI{constructor(e,t,r,s,o){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=ve.UNAUTHENTICATED,this.clientId=d_.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(r,async a=>{M("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(M("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Lt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=pd(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Vi(n,e){n.asyncQueue.verifyOperationInProgress(),M("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await ad(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Ol(n,e){n.asyncQueue.verifyOperationInProgress();const t=await RI(n);M("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>kl(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>kl(e.remoteStore,s)),n._onlineComponents=e}async function RI(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){M("FirestoreClient","Using user provided OfflineComponentProvider");try{await Vi(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===L.FAILED_PRECONDITION||s.code===L.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;dn("Error using user provided cache. Falling back to memory cache: "+t),await Vi(n,new Cs)}}else M("FirestoreClient","Using default OfflineComponentProvider"),await Vi(n,new Cs);return n._offlineComponents}async function PI(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(M("FirestoreClient","Using user provided OnlineComponentProvider"),await Ol(n,n._uninitializedComponentsProvider._online)):(M("FirestoreClient","Using default OnlineComponentProvider"),await Ol(n,new go))),n._onlineComponents}async function kI(n){const e=await PI(n),t=e.eventManager;return t.onListen=yI.bind(null,e.syncEngine),t.onUnlisten=II.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=_I.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=EI.bind(null,e.syncEngine),t}function DI(n,e,t={}){const r=new Lt;return n.asyncQueue.enqueueAndForget(async()=>function(o,a,c,u,d){const f=new bI({next:w=>{f.Za(),a.enqueueAndForget(()=>lI(o,_)),w.fromCache&&u.source==="server"?d.reject(new F(L.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(w)},error:w=>d.reject(w)}),_=new dI(c,f,{includeMetadataChanges:!0,_a:!0});return cI(o,_)}(await kI(n),n.asyncQueue,e,t,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Td(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xl=new Map;function NI(n,e,t,r){if(e===!0&&r===!0)throw new F(L.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Fl(n){if(B.isDocumentKey(n))throw new F(L.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function LI(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":j()}function yo(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new F(L.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=LI(n);throw new F(L.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new F(L.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new F(L.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}NI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Td((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new F(L.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new F(L.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new F(L.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ia{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Bl({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new F(L.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new F(L.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Bl(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new s_;switch(r.type){case"firstParty":return new c_(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new F(L.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=xl.get(t);r&&(M("ComponentProvider","Removing Datastore"),xl.delete(t),r.terminate())}(this),Promise.resolve()}}function VI(n,e,t,r={}){var s;const o=(n=yo(n,ia))._getSettings(),a=`${e}:${t}`;if(o.host!=="firestore.googleapis.com"&&o.host!==a&&dn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},o),{host:a,ssl:!1})),r.mockUserToken){let c,u;if(typeof r.mockUserToken=="string")c=r.mockUserToken,u=ve.MOCK_USER;else{c=Vp(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new F(L.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new ve(d)}n._authCredentials=new i_(new Vh(c,u))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zs{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new zs(this.firestore,e,this._query)}}class Sn{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ln(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Sn(this.firestore,e,this._key)}}class ln extends zs{constructor(e,t,r){super(e,t,Hh(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Sn(this.firestore,null,new B(e))}withConverter(e){return new ln(this.firestore,e,this._path)}}function MI(n,e,...t){if(n=$t(n),n instanceof ia){const r=ne.fromString(e,...t);return Fl(r),new ln(n,null,r)}{if(!(n instanceof Sn||n instanceof ln))throw new F(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ne.fromString(e,...t));return Fl(r),new ln(n.firestore,null,r)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ul{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new ud(this,"async_queue_retry"),this.Vu=()=>{const r=Li();r&&M("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Li();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Li();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Lt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!vr(e))throw e;M("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(r);throw Ze("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=na.createAndSchedule(this,e,t,r,o=>this.yu(o));return this.Tu.push(s),s}fu(){this.Eu&&j()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class wd extends ia{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Ul,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Ul(e),this._firestoreClient=void 0,await e}}}function OI(n,e){const t=typeof n=="object"?n:Gu(),r=typeof n=="string"?n:"(default)",s=Po(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const o=Np("firestore");o&&VI(s,...o)}return s}function xI(n){if(n._terminated)throw new F(L.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||FI(n),n._firestoreClient}function FI(n){var e,t,r;const s=n._freezeSettings(),o=function(c,u,d,f){return new T_(c,u,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Td(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new CI(n._authCredentials,n._appCheckCredentials,n._queue,o,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rs{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Rs(fe.fromBase64String(e))}catch(t){throw new F(L.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Rs(fe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ad{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new F(L.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Se(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BI{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new F(L.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new F(L.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UI{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let o=0;o<r.length;++o)if(r[o]!==s[o])return!1;return!0}(this._values,e._values)}}const $I=new RegExp("[~\\*/\\[\\]]");function HI(n,e,t){if(e.search($I)>=0)throw $l(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n);try{return new Ad(...e.split("."))._internalPath}catch{throw $l(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n)}}function $l(n,e,t,r,s){let o=`Function ${e}() called with invalid data`;o+=". ";let a="";return new F(L.INVALID_ARGUMENT,o+n+a)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sd{constructor(e,t,r,s,o){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new Sn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new jI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(bd("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class jI extends Sd{data(){return super.data()}}function bd(n,e){return typeof e=="string"?HI(n,e):e instanceof Ad?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new F(L.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class zI{convertValue(e,t="none"){switch(Bt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return se(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Ft(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw j()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return xs(e,(s,o)=>{r[s]=this.convertValue(o,t)}),r}convertVectorValue(e){var t,r,s;const o=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>se(a.doubleValue));return new UI(o)}convertGeoPoint(e){return new BI(se(e.latitude),se(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ho(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(ur(e));default:return null}}convertTimestamp(e){const t=vt(e);return new be(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ne.fromString(e);re(od(r));const s=new hr(r.get(1),r.get(3)),o=new B(r.popFirst(5));return s.isEqual(t)||Ze(`Document ${o} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class GI extends Sd{constructor(e,t,r,s,o,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=o}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new us(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(bd("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class us extends GI{data(e={}){return super.data(e)}}class WI{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Xr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new us(this._firestore,this._userDataWriter,r.key,r,new Xr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new F(L.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,o){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(c=>{const u=new us(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Xr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>o||c.type!==3).map(c=>{const u=new us(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Xr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:KI(c.type),doc:u,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function KI(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return j()}}class QI extends zI{constructor(e){super(),this.firestore=e}convertBytes(e){return new Rs(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Sn(this.firestore,null,t)}}function JI(n){n=yo(n,zs);const e=yo(n.firestore,wd),t=xI(e),r=new QI(e);return qI(n._query),DI(t,n._query).then(s=>new WI(e,r,n,s))}(function(e,t=!0){(function(s){Tn=s})(In),hn(new Mt("firestore",(r,{instanceIdentifier:s,options:o})=>{const a=r.getProvider("app").getImmediate(),c=new wd(new o_(r.getProvider("auth-internal")),new u_(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new F(L.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new hr(d.options.projectId,f)}(a,s),a);return o=Object.assign({useFetchStreams:t},o),c._setSettings(o),c},"PUBLIC").setMultipleInstances(!0)),mt(il,"4.7.3",e),mt(il,"4.7.3","esm2017")})();const Cd="fenix_cloud_sync_config",_o={apiKey:"AIzaSyAvz0DRZIJLNHQsHmPg7LaUq9s3N2eEQtg",authDomain:"fenix-2c341.firebaseapp.com",projectId:"fenix-2c341",appId:"1:387287127608:web:c4e5aa07b3b91389c5b8cd",messagingSenderId:"387287127608",storageBucket:"fenix-2c341.firebasestorage.app"},Mi={enabled:!0,syncConsent:"granted",firebase:{..._o}},YI=30*60*1e3,XI="prices",Rd="fenix_price_last_sync_at";function Hl(n){return typeof n=="number"&&Number.isFinite(n)?n:n instanceof be?n.toMillis():null}function ZI(){try{const n=localStorage.getItem(Rd),e=n?Number(n):0;return Number.isFinite(e)?e:0}catch{return 0}}function eE(n){try{localStorage.setItem(Rd,String(n))}catch(e){console.error("Failed to persist price sync timestamp:",e)}}function Oi(){try{const n=localStorage.getItem(Cd);if(n){const e=JSON.parse(n),t={...Mi,...e,firebase:{...Mi.firebase,...e.firebase||{}}};return Pd(tE(t))}}catch(n){console.error("Failed to read cloud sync config:",n)}return{...Mi}}function tE(n){const e={...n.firebase};let t=!1;return Object.keys(_o).forEach(r=>{const s=e[r];(!s||String(s).trim()==="")&&(e[r]=_o[r],t=!0)}),t?{...n,firebase:e}:n}function Pd(n){let e=n.syncConsent,t=n.enabled;return e||(e="pending"),e==="pending"?t=!1:e==="granted"?t=!0:e==="denied"&&(t=!1),n.syncConsent===e&&n.enabled===t?n:{...n,syncConsent:e,enabled:t}}function jl(n){try{localStorage.setItem(Cd,JSON.stringify(n))}catch(e){console.error("Failed to save cloud sync config:",e)}}function nE(n){const e=n.firebase;return!!e.apiKey&&!!e.authDomain&&!!e.projectId&&!!e.appId}class rE{constructor(){this.config=null,this.app=null,this.auth=null,this.db=null,this.lastSyncAt=0,this.lastSyncCache={},this.initializing=null,this.lastSyncCursorMs=null,this.lastCacheUpdatedAt=null,this.lastCacheError=null}getSyncStatus(){this.config||(this.config=Oi());const e=Pd(this.config);e!==this.config&&(this.config=e,jl(this.config));const t=this.config.enabled===!0,r=this.config.syncConsent??"pending";return{enabled:t,consent:r}}async setSyncEnabled(e){this.config||(this.config=Oi());const t=e?"granted":"denied";this.config.enabled=e,this.config.syncConsent=t,jl(this.config),e&&await this.initialize()}async initialize(){if(this.initializing)return this.initializing;this.initializing=this.initializeInternal();const e=await this.initializing;return this.initializing=null,e}async initializeInternal(){if(this.config=Oi(),typeof this.config.lastSyncCursorMs=="number"&&(this.lastSyncCursorMs=this.config.lastSyncCursorMs),!this.config.enabled)return!1;if(!nE(this.config))return console.warn("[sync] Firebase config missing. Sync disabled."),!1;if(this.app||(this.app=zu(this.config.firebase)),this.auth||(this.auth=n_(this.app)),this.db||(this.db=OI(this.app)),!this.auth.currentUser)try{await Ug(this.auth)}catch(e){return console.error("Failed to sign in anonymously:",e),!1}return!0}async syncPrices(e){if(!await this.initialize()||!this.db)return{};const r=Date.now();if(this.lastSyncAt||(this.lastSyncAt=ZI()),Object.keys(this.lastSyncCache).length===0&&(this.lastSyncCache=await Vu(),Object.keys(this.lastSyncCache).length>0)){const s=Object.values(this.lastSyncCache).map(o=>o.timestamp).filter(o=>typeof o=="number"&&Number.isFinite(o)).reduce((o,a)=>Math.max(o,a),0);this.lastCacheUpdatedAt=s||this.lastCacheUpdatedAt}if(!(e!=null&&e.forceFull)&&this.lastSyncAt&&r-this.lastSyncAt<YI)return this.lastSyncCache;try{const s=await JI(MI(this.db,XI)),o={};let a=null;return s.forEach(c=>{const u=c.data(),d=typeof u.price=="number"?u.price:null,f=Hl(u.timestamp);if(d===null||f===null)return;const _=typeof u.listingCount=="number"?u.listingCount:void 0;o[c.id]={price:d,timestamp:f,..._!==void 0?{listingCount:_}:{}};const w=Hl(u.updatedAt)??f;w&&(!a||w>a)&&(a=w)}),this.lastSyncAt=r,eE(r),this.lastSyncCache=o,this.lastCacheUpdatedAt=a,this.lastCacheError=null,o}catch(s){return console.error("Failed to sync prices from Firestore:",s),this.lastCacheError="Failed to read prices",this.lastSyncCache}}getCacheStatus(){return{lastUpdated:this.lastCacheUpdatedAt,lastError:this.lastCacheError}}}let he=null,un=null,Ce=null,ql=null,tr=null,Ps=0,nr=0,vo=!1,Kn=!1,oa=[],kd=[];const Dd="fenix_inventory_cache";async function Nd(){un=await Lu(),Ce=new rE,await Ce.setSyncEnabled(!0);const n=await Vu(t=>Ce?Ce.syncPrices(t):Promise.resolve({}));he=new _p(un,n);const e=localStorage.getItem(Dd);if(e&&he)try{const t=JSON.parse(e);Array.isArray(t)&&(he.hydrateInventory(t),Io())}catch(t){console.warn("Failed to restore cached inventory:",t)}setInterval(async()=>{if(Ce){const t=await Ce.syncPrices();if(he){const r=he.getPriceCacheAsObject();for(const[s,o]of Object.entries(t)){const a=r[s];(!a||o.timestamp>a.timestamp)&&he.updatePrice(s,o.price,o.listingCount,o.timestamp)}await bo(he.getPriceCacheAsObject()),Io()}}},30*60*1e3),sE()}function sE(){ql||(ql=window.setInterval(()=>{Ps++,oa.forEach(n=>n({type:"realtime",seconds:Ps}))},1e3))}function iE(){tr||(tr=window.setInterval(()=>{vo&&!Kn&&(nr++,oa.forEach(n=>n({type:"hourly",seconds:nr})))},1e3))}function oE(){tr&&(clearInterval(tr),tr=null)}function Io(){kd.forEach(n=>n())}const ee={async getInventory(){return he?he.getInventory().map(e=>e.baseId===vn?{...e,price:1}:e):[]},async getItemDatabase(){return un||(un=await Lu()),un},async getPriceCache(){return he?he.getPriceCacheAsObject():{}},getPriceCacheStatus(){return Ce?Ce.getCacheStatus():{lastUpdated:null,lastError:"Price sync not initialized"}},onInventoryUpdate(n){kd.push(n)},startHourlyTimer(){vo=!0,Kn=!1,nr=0,iE()},pauseHourlyTimer(){Kn=!0},resumeHourlyTimer(){Kn=!1},stopHourlyTimer(){vo=!1,Kn=!1,nr=0,oE()},resetRealtimeTimer(){Ps=0},async getTimerState(){return{realtimeSeconds:Ps,hourlySeconds:nr}},onTimerTick(n){oa.push(n)},async getAppVersion(){return"2.4.0"},async checkForUpdates(){return{success:!1,message:"Updates not available in web version"}},onUpdateStatus(n){},onUpdateProgress(n){},onShowUpdateDialog(n){},onUpdateDownloadedTransition(n){},sendUpdateDialogResponse(n){},async isLogPathConfigured(){return localStorage.getItem("fenix_log_uploaded")==="true"},async selectLogFile(){return null},onShowLogPathSetup(n){},async getSettings(){return Ep()},async saveSettings(n){try{return Tp(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to save settings"}}},async getUsernameInfo(){return{canChange:!1}},async setUsername(n){return{success:!1,error:"Username not supported in web version"}},async getCloudSyncStatus(){return Ce?Ce.getSyncStatus():{enabled:!1,consent:"pending"}},async setCloudSyncEnabled(n){if(!Ce)return{success:!1,error:"Price sync service not initialized"};try{return await Ce.setSyncEnabled(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to update cloud sync setting"}}},onShowSyncConsent(n){},async testKeybind(n){return{success:!1,error:"Keybinds not supported in web version"}},onCloseSettingsModal(n){},onWindowModeChanged(n){},minimizeWindow(){},maximizeWindow(){},closeWindow(){},onMaximizeStateChanged(n){},async getMaximizeState(){return!1},toggleOverlayWidget(){},updateOverlayWidget(n){},onWidgetPauseHourly(n){},onWidgetResumeHourly(n){}};async function zl(n){return new Promise((e,t)=>{const r=new FileReader;r.onload=async s=>{var o;try{const a=(o=s.target)==null?void 0:o.result,c=Ap(a);if((!he||!un)&&await Nd(),he){if(he.buildInventory(c),Ce){const u=await Ce.syncPrices({forceFull:!0});for(const[d,f]of Object.entries(u))he.updatePrice(d,f.price,f.listingCount,f.timestamp)}await bo(he.getPriceCacheAsObject()),localStorage.setItem(Dd,JSON.stringify(he.getInventory())),localStorage.setItem("fenix_log_uploaded","true"),Io(),e()}else t(new Error("Inventory manager not initialized"))}catch(a){t(a)}},r.onerror=()=>{t(new Error("Failed to read file"))},r.readAsText(n)})}let Ld=[],Vd={},Md="priceTotal",Od="desc",xd="",Fd=null,Bd=null,Ud=null;function Ue(){return Ld}function Gs(){return Vd}function aa(){return Md}function ca(){return Od}function aE(){return xd}function $d(){return Fd}function Hd(){return Bd}function jd(){return Ud}function cE(n){Ld=n}function lE(n){Vd=n}function uE(n){Md=n}function Gl(n){Od=n}function hE(n){xd=n}function Wl(n){Fd=n}function dE(n){Bd=n}function fE(n){Ud=n}let qd="realtime",zd=[],Gd=[],Wd=new Map,Kd=0,Qd=!1,Jd=!1,Yd=new Set,Xd=null,Zd=new Map,ef=new Map,tf=new Map,nf=[],rf=0,sf=0,of=0,af=!1;function De(){return qd}function Kl(n){qd=n}function la(){return zd}function cf(n){zd=n}function bn(){return Gd}function fr(n){Gd=n}function wr(){return Wd}function pE(n){Wd=n}function ua(){return Kd}function lf(n){Kd=n}function Et(){return Qd}function uf(n){Qd=n}function hf(){return Jd}function Ws(n){Jd=n}function ke(){return Yd}function mE(n){Yd=n}function gE(){return Xd}function df(n){Xd=n}function Ks(){return Zd}function yE(n){Zd=n}function ha(){return ef}function _E(n){ef=n}function da(){return tf}function vE(n){tf=n}function fa(){return nf}function Qs(n){nf=n}function ff(){return rf}function pa(n){rf=n}function IE(){return sf}function pf(n){sf=n}function mf(){return of}function ma(n){of=n}function EE(){return af}function TE(n){af=n}let gf=!0;function wE(){return gf}function Eo(n){gf=n}function _n(n){const e=Math.floor(n/3600).toString().padStart(2,"0"),t=Math.floor(n%3600/60).toString().padStart(2,"0"),r=(n%60).toString().padStart(2,"0");return`${e}:${t}:${r}`}function AE(n){return n==="none"?"Uncategorized":n.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(" ")}function yf(n){if(n===null)return"";const e=Date.now()-n;return e>=mp?"price-very-stale":e>=pp?"price-stale":""}function Ut(n,e=null){return!wE()||e===vn?n:n*(1-gp)}function ga(n){const e=Hd(),t=jd();if(n.price===null)return!(e!==null&&e>0);const r=n.price*n.totalQuantity,s=Ut(r,n.baseId);return!(e!==null&&s<e||t!==null&&s>t)}function Js(){return Ue().reduce((e,t)=>{if(!ga(t))return e;if(t.price!==null){const r=t.totalQuantity*t.price;return e+Ut(r,t.baseId)}return e},0)}function Ar(){const n=Ue(),e=wr(),t=ke(),r=Hd(),s=jd();let o=0;for(const a of n){if(a.price===null||t.has(a.baseId))continue;const c=a.totalQuantity,u=e.get(a.baseId)||0,d=c-u;if(a.baseId===vn){const f=d*a.price;o+=f}else{if(d<=0)continue;const f=d*a.price,_=Ut(f,a.baseId);if(r!==null&&_<r||s!==null&&_>s)continue;o+=_}}for(const a of t){const c=n.find(w=>w.baseId===a);if(!c||c.price===null)continue;const u=c.totalQuantity,f=(e.get(a)||0)-u;if(f===0)continue;const _=Math.abs(f)*c.price;f>0?o-=_:o+=_}return o}let _f,vf,ya,If,Ys;function SE(n,e,t,r,s){_f=n,vf=e,ya=t,If=r,Ys=s}function bE(){const n=Js();pf(n),Ys(n)}function CE(){ma(0);const n=Js();pf(n),cf([]),ee.resetRealtimeTimer(),ya.textContent=_n(0),rr(),Ys(n)}function rr(){const n=Js(),e=mf()/3600,t=IE(),r=e>0?(n-t)/e:0;Ys(n),De()==="realtime"&&(_f.textContent=n.toFixed(2),vf.textContent=r.toFixed(2)),If()}async function Ql(){const n=await ee.getTimerState();ma(n.realtimeSeconds),ya.textContent=_n(n.realtimeSeconds)}let Ef,Tf,_a,va,Ia,Sr,br,Cr,wf,Af,Ea,Ta;function RE(n,e,t,r,s,o,a,c,u,d,f,_){Ef=n,Tf=e,_a=t,va=r,Ia=s,Sr=o,br=a,Cr=c,wf=u,Af=d,Ea=f,Ta=_}function PE(){wf()}function Sf(){const n=Ue(),e=wr(),t=Ks(),r=ha(),s=da(),o=ke();e.clear(),t.clear(),r.clear(),s.clear();for(const a of n)e.set(a.baseId,a.totalQuantity),o.has(a.baseId)&&t.set(a.baseId,a.totalQuantity);if(fr([]),Qs([]),pa(0),De()==="hourly"){const a=bn();a.push({time:Date.now(),value:0}),fr(a)}va.style.display="none",Ia.style.display="inline-block",Sr.style.display="inline-block",br.style.display="none",_a.textContent="00:00:00",uf(!0),Ws(!1),ee.startHourlyTimer(),sr(),Ea(),Ta()}function kE(){const n=Ue(),e=ke(),t=Ks(),r=wr(),s=ha(),o=da();for(const a of e){const c=n.find(f=>f.baseId===a),u=c?c.totalQuantity:0,d=t.get(a)??r.get(a)??u;if(r.get(a),u<d){const f=d-u,_=s.get(a)||0;s.set(a,_+f)}if(u>d){const f=u-d,_=o.get(a)||0;o.set(a,_+f)}}}function wa(){const n=Ue(),e=ke(),t=Ks();for(const r of e){const s=n.find(o=>o.baseId===r);s&&t.set(r,s.totalQuantity)}}function DE(){const n=Ar(),e=Math.floor(ua()/3600),t=ff(),r=bn(),s=fa(),o=ke(),a=Ue(),c=Ks(),u=ha(),d=da(),f={hourNumber:e,startValue:t,endValue:n,earnings:n-t,history:[...r]};s.push(f),Qs(s),pa(n),fr([{time:Date.now(),value:n}]),u.clear(),d.clear();for(const w of o){const b=a.find(k=>k.baseId===w);b&&c.set(w,b.totalQuantity)}const _=document.querySelector(".stats-container");if(_){const w=document.createElement("div");w.className="earnings-animation",w.textContent=`Hour ${e} Complete! +${f.earnings.toFixed(2)} FE`,w.style.color="#10b981",_.appendChild(w),setTimeout(()=>w.remove(),2e3)}}function NE(){Ws(!0),ee.pauseHourlyTimer(),wa(),Sr.style.display="none",br.style.display="inline-block",Cr()}function LE(){Ws(!1),ee.resumeHourlyTimer(),wa(),Sr.style.display="inline-block",br.style.display="none",Cr()}function VE(){ee.stopHourlyTimer();const n=Ar(),e=fa(),t=bn(),r=ff(),o={hourNumber:e.length+1,startValue:r,endValue:n,earnings:n-r,history:[...t]};e.push(o),Qs(e),Af(),va.style.display="inline-block",Ia.style.display="none",Sr.style.display="none",br.style.display="none",_a.textContent="00:00:00",lf(0),uf(!1),Ws(!1),Ea(),Ta(),Cr()}function sr(){const n=Ar(),e=ua()/3600,t=e>0?n/e:0;De()==="hourly"&&(Ef.textContent=n.toFixed(2),Tf.textContent=t.toFixed(2)),Cr()}function bf(){const n=Ue(),e=De(),t=Et();if(e==="hourly"&&t){const r=wr(),s=ke();return n.filter(o=>!s.has(o.baseId)).map(o=>{const a=o.totalQuantity,c=r.get(o.baseId)||0,u=a-c;return{...o,totalQuantity:u}}).filter(o=>o.baseId===vn?!0:o.totalQuantity>0)}return n}function ME(){const n=bf(),e=aE(),t=$d(),r=Gs(),s=aa(),o=ca();let a=n.filter(c=>{if(e&&!c.itemName.toLowerCase().includes(e.toLowerCase()))return!1;if(t!==null){const u=r[c.baseId];if(((u==null?void 0:u.group)||"none")!==t)return!1}return ga(c)});return a.sort((c,u)=>{let d=0;if(s==="priceUnit"){const f=c.price??-1,_=u.price??-1;d=f-_}else if(s==="priceTotal"){const f=Ut((c.price??0)*c.totalQuantity,c.baseId),_=Ut((u.price??0)*u.totalQuantity,u.baseId);d=f-_}return o==="asc"?d:-d}),a}function OE(n){if(n.pageId===null||n.slotId===null)return"";const e=n.pageId===102?"P1":n.pageId===103?"P2":`P${n.pageId}`,t=n.slotId+1;return`${e}:${t}`}function xE(){const n=document.getElementById("usageSection"),e=document.getElementById("usageContent");if(!n||!e)return;const t=De(),r=Et(),s=ke();if(t==="hourly"&&r&&s.size>0){n.style.display="block";const o=Ue(),a=wr(),c=Gs(),u=[];for(const f of s){const _=o.find(C=>C.baseId===f),w=_?_.totalQuantity:0,k=(a.get(f)||0)-w;if(!_){const C=c[f];C&&u.push({baseId:f,itemName:C.name,netUsage:k,price:0});continue}u.push({baseId:f,itemName:_.itemName,netUsage:k,price:_.price||0})}if(u.length===0){n.style.display="none";return}u.sort((f,_)=>{const w=f.price>0?Math.abs(f.netUsage*f.price):0;return(_.price>0?Math.abs(_.netUsage*_.price):0)-w});let d=0;e.innerHTML=u.map(({baseId:f,itemName:_,netUsage:w,price:b})=>{const k=b>0?b:0,C=b>0?Math.abs(w)*b:0;w>0?d-=C:w<0&&(d+=C);const P=w>0?"-":w<0?"+":"",O=w!==0?`${P}${Math.abs(w)}`:"0",H=w>0?"-":w<0?"+":"",q=b>0&&w!==0?`${H}${C.toFixed(2)} FE`:"- FE";return`
        <div class="item-row">
          <div class="item-name">
            <img src="./assets/${f}.webp" 
                 alt="${_}" 
                 class="item-icon"
                 onerror="this.style.display='none'">
            <div class="item-name-content">
              <div class="item-name-text">${_}</div>
            </div>
          </div>
          <div class="item-quantity">${O}</div>
          <div class="item-price">
            <div class="price-single ${b===0?"no-price":""}">
              ${b>0?k.toFixed(2):"Not Set"}
            </div>
            ${b>0&&w!==0?`<div class="price-total">${q}</div>`:""}
          </div>
        </div>
      `}).join("")+(u.length>0&&d!==0?`
      <div class="usage-footer">
        <div class="usage-footer-label">Net Impact:</div>
        <div class="usage-footer-total">${d>0?"+":""}${d.toFixed(2)} FE</div>
      </div>
    `:"")}else n.style.display="none"}const FE=`
<span class="price-help-icon">
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx="8" cy="8" r="6.5"/>
    <text x="8" y="11.5" text-anchor="middle" font-size="9" font-weight="600" fill="currentColor" stroke="none">i</text>
  </svg>
  <span class="price-help-tooltip">
    <strong>Price Color Guide</strong><br>
    <span style="color: #fff;">● White</span> = Fresh (&lt; 3 days)<br>
    <span style="color: #DE5C0B;">● Orange</span> = Stale (3-7 days)<br>
    <span style="color: #982104;">● Dark Orange</span> = Very stale (7+ days)
  </span>
</span>`;function Ae(){xE();const n=document.getElementById("inventory");if(!n)return;const e=ME(),t=De(),r=Et();if(e.length===0){const s=t==="hourly"&&r?"No new items gained yet":"No items match your filters";n.innerHTML=`<div class="loading">${s}</div>`;return}n.innerHTML=e.map(s=>{const o=s.price!==null?s.price*s.totalQuantity:null,a=o!==null?Ut(o,s.baseId):null,c=OE(s),u=yf(s.priceTimestamp);return`
      <div class="item-row">
        <div class="item-name">
          <img src="./assets/${s.baseId}.webp" 
               alt="${s.itemName}" 
               class="item-icon"
               onerror="this.style.display='none'">
          <div class="item-name-content">
            <div class="item-label">${s.itemName}</div>
            ${c?`<div class="page-label">${c}</div>`:""}
          </div>
        </div>
        <div class="item-quantity">${s.totalQuantity.toLocaleString()}</div>
        <div class="item-price">
          <div class="price-single ${s.price===null?"no-price":""} ${u}">
            ${s.price!==null?s.price.toFixed(2):"Not Set"}
          </div>
          ${a!==null?`<div class="price-total ${u}">${a.toFixed(2)}</div>`:""}
        </div>
      </div>
    `}).join(""),Cf()}function Cf(){const n=aa(),e=ca();document.querySelectorAll(".inventory-section [data-sort]").forEach(t=>{const r=t.dataset.sort;r&&(r==="priceUnit"?t.innerHTML="Price"+FE:t.textContent="Total",t.classList.remove("sort-active","sort-asc","sort-desc"),r===n&&(t.classList.add("sort-active"),t.classList.add(e==="asc"?"sort-asc":"sort-desc")))})}function ze(n){const e=document.getElementById("breakdown");if(!e)return;const t=bf(),r=Gs(),s=$d(),o=new Map;for(const c of t){if(c.price===null||c.totalQuantity<=0||!ga(c))continue;const u=r[c.baseId];if(!u||u.tradable===!1)continue;const d=u.group||"none",f=c.price*c.totalQuantity,_=Ut(f,c.baseId);o.set(d,(o.get(d)||0)+_)}const a=Array.from(o.entries()).map(([c,u])=>({group:c,total:u})).filter(({total:c})=>c>0).sort((c,u)=>u.total-c.total);if(a.length===0){e.innerHTML='<div class="breakdown-empty">No items with prices</div>';return}e.innerHTML=a.map(({group:c,total:u})=>{const d=AE(c);return`
      <div class="breakdown-group ${s===c?"selected":""}" data-group="${c}" title="${d}">
        <img src="./assets/${c}.webp" alt="${d}" class="breakdown-icon" title="${d}" onerror="this.style.display='none'">
        <span class="breakdown-group-value" title="${d}">${u.toFixed(0)} FE</span>
      </div>
    `}).join(""),e.querySelectorAll(".breakdown-group").forEach(c=>{c.addEventListener("click",()=>{const u=c.dataset.group;u&&(Wl(s===u?null:u),ze(n),n())})})}let Pe=null;function BE(){const n=document.getElementById("wealth-graph");if(!n)return;const e=n.getContext("2d");Pe&&Pe.destroy(),Pe=new Chart(e,{type:"line",data:{labels:[],datasets:[{label:"Wealth (FE)",data:[],borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:10}},y:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",callback:function(t){const r=t;return r%1===0?r.toFixed(0):r.toFixed(1)}}}},plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:t=>{if(t.length===0||!Pe)return"";const s=t[0].parsed.y;return`Wealth: ${s%1===0?s.toFixed(0):s.toFixed(1)} FE`},label:t=>{if(!Pe)return"";const r=t.dataIndex,s=Pe.currentHistory||(De()==="realtime"?la():bn());if(r>=0&&r<s.length){const o=s[r],a=new Date(o.time),c=Math.floor(a.getSeconds()/60)*60,u=new Date(a);u.setSeconds(c),u.setMilliseconds(0);const d=u.getHours().toString().padStart(2,"0"),f=u.getMinutes().toString().padStart(2,"0");return`${d}:${f}`}return""},footer:()=>""}}},interaction:{intersect:!1,mode:"index"}}}),ks()}function UE(n){const t={time:Date.now(),value:Math.round(n)},r=la();r.push(t),r.length>yp&&r.shift(),cf(r),De()==="realtime"&&ks()}function ks(){if(!Pe)return;const n=De(),e=n==="realtime"?la():bn(),t=e.length/3600;let r=60;t>5&&(r=120),t>10&&(r=180),t>20&&(r=240);const s=e.map((a,c)=>{const u=new Date(a.time),d=u.getMinutes(),f=u.getHours();return c===0||c===e.length-1?`${f.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`:e.length>0&&Math.floor((a.time-e[0].time)/6e4)%r===0?`${f.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`:""}),o=e.map(a=>a.value);Pe.data.labels=s,Pe.data.datasets[0].data=o,Pe.options.scales.x.ticks.maxTicksLimit=Math.min(12,Math.ceil(t)),Pe.currentHistory=e,Pe.currentMode=n,Pe.update("none")}function $E(n,e){const t=document.getElementById(`hourGraph${e}`);if(!t)return;const r=t.getContext("2d");if(n.history.length===0)return;const s=Math.max(1,Math.floor(n.history.length/60)),o=n.history.filter((d,f)=>f%s===0||f===n.history.length-1),a=Array.from({length:61},(d,f)=>f%10===0?`${f}m`:""),c=Array.from({length:61},(d,f)=>{const _=Math.floor(f/60*(o.length-1)),w=o[_];return{x:f,y:w?w.value-n.startValue:0,time:w?w.time:0}}),u=n.history.length>0?n.history[0].time:Date.now();new Chart(r,{type:"line",data:{labels:a,datasets:[{data:c.map(d=>d.y),borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,animation:!1,scales:{x:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:7}},y:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:5,callback:function(d){const f=d;return f%1===0?f.toFixed(0):f.toFixed(1)}}}},plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:d=>{if(d.length===0)return"";const _=d[0].parsed.y;return`${_%1===0?_.toFixed(0):_.toFixed(1)} FE`},label:d=>{const f=d.dataIndex;if(f>=0&&f<c.length){const _=c[f];let w;_.time>0?w=new Date(_.time):w=new Date(u+f*6e4);const b=Math.floor(w.getSeconds()/60)*60,k=new Date(w);k.setSeconds(b),k.setMilliseconds(0);const C=k.getHours().toString().padStart(2,"0"),P=k.getMinutes().toString().padStart(2,"0");return`${C}:${P}`}return""},footer:()=>""}}},interaction:{intersect:!1,mode:"index"}}})}let Rf,Pf;function HE(n,e){Rf=n,Pf=e}function jE(){const n=document.getElementById("breakdownModal"),e=document.getElementById("breakdownTotal"),t=document.getElementById("breakdownHours");if(!n||!e||!t)return;const r=fa(),s=ua(),o=r.reduce((a,c)=>a+c.earnings,0);e.textContent=`${o.toFixed(2)} FE`,t.innerHTML=r.map((a,c)=>(a.hourNumber<=Math.floor(s/3600)||_n(s%3600).substring(3),`
      <div class="hour-card">
        <div class="hour-header">
          <div class="hour-label">Hour ${a.hourNumber}</div>
          <div class="hour-earnings">+${a.earnings.toFixed(2)} FE</div>
        </div>
        <canvas class="hour-graph" id="hourGraph${c}"></canvas>
      </div>
    `)).join(""),n.classList.add("active"),setTimeout(()=>{r.forEach((a,c)=>{$E(a,c)})},100)}function qE(){const n=document.getElementById("breakdownModal");n&&(n.classList.remove("active"),Qs([]),pE(new Map),fr([]),pa(0),mE(new Set),yE(new Map),_E(new Map),vE(new Map),Rf(),Pf())}const Gt={resonance:(n,e,t)=>t==="5028"||t==="5040",beaconsT8:(n,e,t)=>e==="beacon"&&(n.includes("(Timemark 8)")||n==="Deep Space Beacon"),beaconsT7:(n,e,t)=>e==="beacon"&&(n.includes("(Timemark 7)")||!n.includes("(Timemark 8)")&&n!=="Deep Space Beacon"),probes:(n,e,t)=>e==="compass"&&n.includes("Probe"),scalpels:(n,e,t)=>e==="compass"&&n.includes("Scalpel"),compasses:(n,e,t)=>e==="compass"&&!n.includes("Probe")&&!n.includes("Scalpel")},zE=[{key:"resonance",title:"Resonance",categorizer:Gt.resonance},{key:"beaconsT8",title:"T8 Beacons",categorizer:Gt.beaconsT8},{key:"beaconsT7",title:"T7 Beacons",categorizer:Gt.beaconsT7},{key:"probes",title:"Probes",categorizer:Gt.probes},{key:"scalpels",title:"Scalpels",categorizer:Gt.scalpels},{key:"compasses",title:"Compasses/Astrolabes",categorizer:Gt.compasses}];function Jl(){const n=document.getElementById("compassBeaconPromptModal");n&&n.classList.add("active")}function GE(){const n=document.getElementById("compassBeaconPromptModal");n&&n.classList.remove("active")}function WE(){const n=document.getElementById("compassBeaconSelectionModal"),e=document.getElementById("compassBeaconCheckboxes"),t=document.getElementById("compassBeaconSearch"),r=document.getElementById("compassBeaconHelperActions");if(!n||!e)return;const s=Ue(),o=Gs(),a=ke();e.innerHTML="",a.clear(),t&&(t.value="");const c=localStorage.getItem("lastCompassBeaconSelection");r&&(c?r.style.display="block":r.style.display="none");const u=zE.map(N=>({...N,items:[]}));for(const[N,x]of Object.entries(o))if(x.group==="compass"||x.group==="beacon"||x.group==="currency"){const V=s.find(g=>g.baseId===N),I={baseId:N,itemName:x.name,group:x.group,quantity:V?V.totalQuantity:0};for(const g of u)if(g.categorizer(x.name,x.group,N)){g.items.push(I);break}}u.forEach(N=>{N.items.sort((x,V)=>x.itemName.localeCompare(V.itemName))});const d=u,f=new Set;f.add("5028"),df(f);const _=()=>{e.querySelectorAll('input[type="checkbox"]:checked').forEach(x=>{const V=x.dataset.baseid;V&&f.add(V)})},w=()=>{const N=document.getElementById("compassBeaconSelectionConfirm");N&&(Array.from(f).some(V=>V!=="5028")?(N.style.display="block",setTimeout(()=>{N.classList.add("visible")},10)):(N.classList.remove("visible"),setTimeout(()=>{N.classList.contains("visible")||(N.style.display="none")},300)))},b=(N,x)=>{x?f.add(N):f.delete(N),w()},k=N=>{const x=document.createElement("div");x.className="compass-beacon-checkbox-item";const V=document.createElement("label"),I=document.createElement("input");I.type="checkbox",I.dataset.baseid=N.baseId,I.dataset.type=N.group,I.checked=f.has(N.baseId),I.addEventListener("change",()=>{b(N.baseId,I.checked)});const g=document.createElement("span");g.className="checkbox-label";const m=document.createElement("img"),v="./";m.src=`${v}assets/${N.baseId}.webp`,m.alt=N.itemName,m.className="checkbox-icon",m.onerror=()=>{m.style.display="none"};const E=document.createElement("span");if(E.textContent=N.itemName,g.appendChild(m),g.appendChild(E),N.quantity>0){const T=document.createElement("span");T.className="checkbox-quantity",T.textContent=`(${N.quantity})`,g.appendChild(T)}return V.appendChild(I),V.appendChild(g),x.appendChild(V),x},C=N=>{if(N.items.length===0)return;const x=document.createElement("div");x.className="compass-beacon-group-header",x.textContent=N.title,e.appendChild(x);const V=document.createElement("div");V.className="compass-beacon-group-items",N.items.forEach(I=>{const g=k(I);V.appendChild(g)}),e.appendChild(V)},P=(N,x)=>{const V=x.toLowerCase();return{...N,items:N.items.filter(I=>I.itemName.toLowerCase().includes(V))}},O=(N,x=!1)=>{if(e.children.length>0&&!x&&_(),e.innerHTML="",N.forEach(V=>C(V)),e.children.length===0){const V=document.createElement("div");V.style.textAlign="center",V.style.color="var(--border)",V.style.padding="20px",V.textContent="No items found",e.appendChild(V)}};O(d),t&&(t.oninput=N=>{const x=N.target.value.trim();if(x==="")O(d);else{const V=d.map(I=>P(I,x));O(V)}});const H=document.getElementById("compassBeaconSelectionClear");H&&(H.onclick=()=>{f.clear(),f.add("5028"),w();const N=(t==null?void 0:t.value.trim())||"";if(N==="")O(d,!0);else{const x=d.map(V=>P(V,N));O(x,!0)}});const q=document.getElementById("compassBeaconRestore");q&&(q.onclick=()=>{const N=localStorage.getItem("lastCompassBeaconSelection");if(N)try{const x=JSON.parse(N);f.clear(),x.forEach(I=>{f.add(I)}),w();const V=(t==null?void 0:t.value.trim())||"";if(V==="")O(d,!0);else{const I=d.map(g=>P(g,V));O(I,!0)}}catch(x){console.error("Failed to restore last selection:",x)}}),w(),n.classList.add("active")}function kf(){const n=document.getElementById("compassBeaconSelectionModal");n&&n.classList.remove("active"),df(null)}function KE(){const n=ke(),e=gE();n.clear(),e?e.forEach(r=>{n.add(r)}):document.querySelectorAll('#compassBeaconSelectionModal input[type="checkbox"]:checked').forEach(s=>{const o=s.dataset.baseid;o&&n.add(o)});const t=Array.from(n);localStorage.setItem("lastCompassBeaconSelection",JSON.stringify(t)),console.log(`✅ Including ${n.size} compasses/beacons in hourly calculation`),kf(),Sf()}document.getElementById("updateModal");document.getElementById("updateModalTitle");document.getElementById("updateModalSubtitle");document.getElementById("updateModalMessage");document.getElementById("updateModalChangelog");document.getElementById("updateProgressContainer");document.getElementById("updateProgressFill");document.getElementById("updateProgressText");document.getElementById("updateBtnPrimary");document.getElementById("updateBtnSecondary");let xi={},jn=null,Wt=null,ot=null,Yl,Xl;const hs=document.getElementById("settingsModal"),QE=document.getElementById("settingsCloseBtn"),qe=document.getElementById("settingsSaveBtn"),Ne=document.getElementById("settingsFooterMessage"),Fi=document.getElementById("generalSection"),Bi=document.getElementById("preferencesSection"),Kt=document.getElementById("includeTaxCheckbox"),qn=document.getElementById("cloudSyncCheckbox"),Zr=document.getElementById("cloudSyncHelperText"),Ui=document.querySelectorAll(".settings-sidebar-item"),Zl=document.getElementById("settingsDownloadDesktopBtn");function JE(n,e,t,r){Yl=e,Xl=t;const s=document.getElementById("openSettingsBtn");s&&s.addEventListener("click",async()=>{r.open=!1;const o=document.getElementById("settingsMenu");o&&(o.style.display="none"),xi=await ee.getSettings(),jn=xi.includeTax!==void 0?xi.includeTax:!0,Eo(jn);const a=await ee.getCloudSyncStatus();ot=a.enabled,Wt=a.enabled,Kt&&(Kt.checked=jn),qn&&Zr&&ot!==null&&(qn.checked=ot,Zr.textContent=ot?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices."),qe.disabled=!1,qe.textContent="Save",Ne.textContent="",Ne.classList.remove("show","success","error"),Fi.classList.add("active"),Bi.classList.remove("active"),Ui.forEach(c=>{c.getAttribute("data-section")==="general"?c.classList.add("active"):c.classList.remove("active")}),hs.classList.add("active")}),QE.addEventListener("click",()=>{eu()}),hs.addEventListener("click",o=>{o.target===hs&&eu()}),Kt&&Kt.addEventListener("change",()=>{Kt&&(jn=Kt.checked)}),Zl&&Zl.addEventListener("click",()=>{window.open("https://github.com/Syncingoutt/Fenix/releases","_blank","noopener,noreferrer")}),qn&&qn.addEventListener("change",()=>{Wt=qn.checked}),Ui.forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-section");a&&(Ui.forEach(c=>c.classList.remove("active")),o.classList.add("active"),a==="general"?(Fi.classList.add("active"),Bi.classList.remove("active")):a==="preferences"&&(Fi.classList.remove("active"),Bi.classList.add("active")))})}),qe.addEventListener("click",async()=>{qe.disabled=!0,qe.textContent="Saving...";try{const o={},a=document.getElementById("includeTaxCheckbox"),c=a?a.checked:jn??!1;if(o.includeTax=c,Wt!==null&&ot!==null&&Wt!==ot){const d=await ee.setCloudSyncEnabled(Wt);if(!d.success){Ne.textContent=d.error||"Failed to update cloud sync",Ne.classList.add("show","error"),qe.disabled=!1,qe.textContent="Save";return}ot=Wt,Zr&&(Zr.textContent=ot?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices.")}const u=await ee.saveSettings(o);u.success?(Eo(o.includeTax??!1),Ne.textContent="Settings saved successfully",Ne.classList.add("show","success"),Xl(Ue()),Yl()):(Ne.textContent=u.error||"Failed to save settings",Ne.classList.add("show","error"))}catch(o){console.error("Failed to save settings:",o),Ne.textContent=o.message||"Failed to save settings",Ne.classList.add("show","error")}finally{qe.disabled=!1,qe.textContent="Save"}})}function eu(){hs.classList.remove("active"),Ne.textContent="",Ne.classList.remove("show","success","error")}const YE=document.getElementById("syncConsentModal"),tu=document.getElementById("syncConsentEnableBtn"),nu=document.getElementById("syncConsentDisableBtn");function ru(){YE.classList.remove("active")}function XE(){tu&&tu.addEventListener("click",async()=>{await ee.setCloudSyncEnabled(!0),ru()}),nu&&nu.addEventListener("click",async()=>{await ee.setCloudSyncEnabled(!1),ru()}),ee.setCloudSyncEnabled(!0)}const ir=document.getElementById("syncDisableConfirmModal"),su=document.getElementById("syncDisableCancelBtn"),iu=document.getElementById("syncDisableConfirmBtn");let kt=null;function $i(){ir&&(ir.classList.remove("active"),kt=null)}function ZE(){ir&&(su&&su.addEventListener("click",()=>{kt&&kt(!1),$i()}),iu&&iu.addEventListener("click",async()=>{kt&&kt(!0),$i()}),ir.addEventListener("click",n=>{n.target===ir&&(kt&&kt(!1),$i())}))}const ou=document.getElementById("settingsButton"),Qt=document.getElementById("settingsMenu"),au=document.getElementById("appVersion");let Jt=!1;function eT(){return ee.getAppVersion().then(n=>{au&&(au.textContent=n)}),ou&&ou.addEventListener("click",n=>{n.stopPropagation(),Jt=!Jt,Qt&&(Qt.style.display=Jt?"block":"none")}),document.addEventListener("click",()=>{Jt&&(Jt=!1,Qt&&(Qt.style.display="none"))}),Qt&&Qt.addEventListener("click",n=>{n.stopPropagation()}),{open:Jt}}const cu=document.getElementById("wealthValue"),lu=document.getElementById("wealthHourly"),ds=document.getElementById("realtimeBtn"),fs=document.getElementById("hourlyBtn"),To=document.getElementById("hourlyControls"),Aa=document.getElementById("startHourly"),Sa=document.getElementById("stopHourly"),ba=document.getElementById("pauseHourly"),Ca=document.getElementById("resumeHourly"),uu=document.getElementById("hourlyTimer"),or=document.getElementById("timer"),ps=document.getElementById("resetRealtimeBtn"),Yt=document.getElementById("minPriceInput"),Xt=document.getElementById("maxPriceInput"),Hi=document.getElementById("searchInput");document.getElementById("clearSearch");function tT(){Aa.style.display="inline-block",Sa.style.display="none",ba.style.display="none",Ca.style.display="none",To.classList.remove("active"),ds.classList.add("active"),fs.classList.remove("active"),ps.style.display="block"}let es,hu,du,fu;function nT(n,e,t,r){es=n,hu=e,du=t,fu=r;function s(){const o=Yt==null?void 0:Yt.value.trim(),a=Xt==null?void 0:Xt.value.trim(),c=o&&o!==""?parseFloat(o):null,u=a&&a!==""?parseFloat(a):null;if(c!==null&&u!==null&&c>u)return;dE(c),fE(u),es();const d=De();d==="realtime"?du():d==="hourly"&&Et()&&fu(),hu()}Yt==null||Yt.addEventListener("input",s),Xt==null||Xt.addEventListener("input",s),document.querySelectorAll("[data-sort]").forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.sort;if(!a)return;const c=aa(),u=ca();c===a?Gl(u==="asc"?"desc":"asc"):(uE(a),Gl("desc")),es()})}),Hi==null||Hi.addEventListener("input",o=>{const a=o.target.value;hE(a),es()})}let pu,mu,gu,yu,_u,vu,Iu,Rt,ts,ji,Eu,ns,Tu,qi,wu,Au,Su;function rT(n,e,t,r,s,o,a,c,u,d,f,_,w,b,k,C,P,O){var H,q,N,x,V,I,g;pu=n,mu=e,gu=t,yu=r,_u=s,vu=o,Iu=a,Rt=c,ts=u,ji=d,Eu=f,ns=w,Tu=b,qi=k,wu=C,Au=P,Su=O,ds.addEventListener("click",()=>{Kl("realtime"),ds.classList.add("active"),fs.classList.remove("active"),To.classList.remove("active"),or.style.display="block",ps.style.display="block",or.textContent=_n(mf()),vu(),Rt(),ts(Rt),ji()}),fs.addEventListener("click",()=>{if(Kl("hourly"),ds.classList.remove("active"),fs.classList.add("active"),To.classList.add("active"),or.style.display="none",ps.style.display="none",Et())Iu(),Rt(),ts(Rt);else{const m=document.getElementById("wealthValue"),v=document.getElementById("wealthHourly");m&&(m.textContent="0.00"),v&&(v.textContent="0.00"),Rt(),ts(Rt)}ji(),Eu()}),Aa.addEventListener("click",pu),Sa.addEventListener("click",mu),ba.addEventListener("click",gu),Ca.addEventListener("click",yu),ps.addEventListener("click",_u),(H=document.getElementById("compassBeaconPromptNo"))==null||H.addEventListener("click",()=>{ke().clear(),ns(),Au()}),(q=document.getElementById("compassBeaconPromptYes"))==null||q.addEventListener("click",()=>{ns(),Tu()}),(N=document.getElementById("compassBeaconSelectionClose"))==null||N.addEventListener("click",()=>{ke().clear(),qi()}),(x=document.getElementById("compassBeaconSelectionConfirm"))==null||x.addEventListener("click",wu),(V=document.getElementById("compassBeaconPromptModal"))==null||V.addEventListener("click",m=>{m.target===document.getElementById("compassBeaconPromptModal")&&(ke().clear(),ns())}),(I=document.getElementById("compassBeaconSelectionModal"))==null||I.addEventListener("click",m=>{m.target===document.getElementById("compassBeaconSelectionModal")&&(ke().clear(),qi())}),(g=document.getElementById("closeBreakdown"))==null||g.addEventListener("click",Su)}function sT(n){let e=null,t=null,r=!1;const s=10*1e3,o="fenix_setup_guide_dismissed",a=document.getElementById("ctaBanner"),c=document.getElementById("ctaCloseBtn");a&&(localStorage.getItem("fenix_cta_dismissed")==="true"||a.classList.remove("is-hidden")),a&&c&&c.addEventListener("click",()=>{a.classList.add("is-hidden"),localStorage.setItem("fenix_cta_dismissed","true")});const u=document.getElementById("uploadLogBtn");if(u){const m=document.createElement("input");m.type="file",m.accept=".log",m.style.display="none",document.body.appendChild(m),u.addEventListener("click",()=>{m.click()}),m.addEventListener("change",async v=>{var y;const E=v.target,T=(y=E.files)==null?void 0:y[0];if(T){if(!T.name.toLowerCase().endsWith(".log")){alert("Please select a .log file");return}try{u.disabled=!0;const X=u.querySelector("span");X&&(X.textContent="Uploading..."),await zl(T),x(!0),X&&(X.textContent="Upload Log")}catch(X){console.error("Failed to upload log file:",X),alert(`Failed to upload: ${X.message||"Unknown error"}`)}finally{u.disabled=!1,E.value=""}}})}const d=document.getElementById("watchLogBtn");if(d){const m=E=>{const T=d.querySelector("span");T&&(T.textContent=E?"Stop Watch":"Watch Log")},v=()=>{t!==null&&(window.clearInterval(t),t=null),m(!1)};d.addEventListener("click",async()=>{const E=window.showOpenFilePicker;if(!E){alert("Live log watch is only supported in Chromium-based browsers (Chrome/Edge).");return}if(t!==null){v();return}try{const[y]=await E({types:[{description:"UE Log",accept:{"text/plain":[".log"]}}],multiple:!1});e=y??null}catch{return}if(!e)return;m(!0),q();const T=async()=>{if(!(!e||r)){r=!0;try{const y=await e.getFile();await zl(y),x(!0)}catch(y){console.warn("Failed to read watched log file:",y)}finally{r=!1}}};T(),t=window.setInterval(T,s)})}const f=document.getElementById("setupGuideModal"),_=document.getElementById("setupGuideClose"),w=document.getElementById("setupGuidePrev"),b=document.getElementById("setupGuideNext"),k=document.getElementById("setupGuideProgress"),C=document.querySelectorAll(".setup-guide-step"),P=document.getElementById("setupGuideSpotlight"),O=document.getElementById("openSetupGuideLink"),H=document.getElementById("setupGuideSpotlightBack"),q=()=>{localStorage.setItem(o,"true")},N=m=>{if(C.forEach((v,E)=>{v.classList.toggle("active",E===m)}),k&&(k.textContent=`Step ${m+1} of ${C.length}`),w&&(w.style.display=m===0?"none":""),b&&(b.style.display=m===C.length-1?"none":""),P){const v=m===C.length-1;if(P.classList.toggle("active",v),f&&f.classList.toggle("active",!v),v){const E=document.querySelector(".log-cta-actions");if(E){const X=E.getBoundingClientRect(),$e=Math.max(0,X.left-8),Cn=Math.max(0,X.top-8),Tt=X.width+16,wt=X.height+16;P.style.setProperty("--spotlight-x",`${$e}px`),P.style.setProperty("--spotlight-y",`${Cn}px`),P.style.setProperty("--spotlight-w",`${Tt}px`),P.style.setProperty("--spotlight-h",`${wt}px`)}const y=document.querySelector(".segmented-wrapper")??E;if(y){const X=y.getBoundingClientRect(),$e=Math.max(0,X.left),Cn=Math.max(0,X.top-84);P.style.setProperty("--note-x",`${$e}px`),P.style.setProperty("--note-y",`${Cn}px`)}}}},x=m=>{f&&(f.classList.remove("active"),P&&P.classList.remove("active"),q())};if(f&&C.length>0){let m=0;w==null||w.addEventListener("click",()=>{m=Math.max(0,m-1),N(m)}),b==null||b.addEventListener("click",()=>{m=Math.min(C.length-1,m+1),N(m)}),_==null||_.addEventListener("click",()=>x()),H==null||H.addEventListener("click",()=>{m=Math.max(0,m-1),N(m)}),f.addEventListener("click",T=>{T.target===f&&x()}),window.addEventListener("resize",()=>{const T=Array.from(C).findIndex(y=>y.classList.contains("active"));T>=0&&N(T)}),localStorage.getItem(o)==="true"||(f.classList.add("active"),N(m))}O&&f&&C.length>0&&O.addEventListener("click",()=>{let m=0;f.classList.add("active"),localStorage.removeItem(o),N(m)});const V=document.querySelectorAll(".nav-item"),I=document.querySelectorAll(".page");function g(m){V.forEach(T=>T.classList.remove("active"));const v=document.getElementById(`nav-${m}`);v&&v.classList.add("active"),I.forEach(T=>T.classList.remove("active"));const E=document.getElementById(`page-${m}`);E&&E.classList.add("active")}V.forEach(m=>{m.addEventListener("click",()=>{const v=m.id.replace("nav-","");g(v)})})}let bu={},Cu={},Df=[],Nf=[],wo="currency",Ao="",So="price",Qn="desc";function iT(n,e){return e?"Last updated: unavailable":n?`Last updated: ${new Date(n).toLocaleString()}`:"Last updated: --"}function Ru(){const n=document.getElementById("pricesLastUpdated");if(!n)return;const{lastUpdated:e,lastError:t}=ee.getPriceCacheStatus();n.textContent=iT(e,t)}function oT(n,e,t){if(n&&n.length>=2){const s=[...n].sort((c,u)=>c.date.localeCompare(u.date)),o=s[0],a=s[s.length-1];if(o.price>0){const u=(a.price-o.price)/o.price*100;return u>.01?{trend:"up",percent:u}:u<-.01?{trend:"down",percent:u}:{trend:"neutral",percent:0}}}return(Date.now()-t)/(1e3*60*60)<6?{trend:"neutral",percent:0}:{trend:"down",percent:-1.5}}function aT(n,e,t){const r=n.getContext("2d");if(!r||e.length===0)return;const s=n.width,o=n.height,a=2;if(r.clearRect(0,0,s,o),e.length===1){const b=o/2;r.strokeStyle=t==="up"?"#4CAF50":t==="down"?"#F44336":"#7E7E7E",r.lineWidth=1.5,r.beginPath(),r.moveTo(a,b),r.lineTo(s-a,b),r.stroke();return}const c=Math.min(...e),d=Math.max(...e)-c||1;let f;if(e.length>50){const b=Math.ceil(e.length/50);f=e.filter((k,C)=>C%b===0||C===e.length-1)}else f=e;const _=t==="up"||t==="neutral"&&f[f.length-1]>=f[0];r.strokeStyle=_?"#4CAF50":"#F44336",r.fillStyle=_?"rgba(76, 175, 80, 0.1)":"rgba(244, 67, 54, 0.1)",r.lineWidth=1.5,r.beginPath();const w=(s-a*2)/(f.length-1);f.forEach((b,k)=>{const C=a+k*w,P=(b-c)/d,O=o-a-P*(o-a*2);k===0?r.moveTo(C,O):r.lineTo(C,O)}),r.stroke(),r.lineTo(s-a,o-a),r.lineTo(a,o-a),r.closePath(),r.fill()}function cT(n,e){if(n&&n.length>0)return[...n].sort((s,o)=>s.date.localeCompare(o.date)).map(s=>s.price);const t=e>0?e:0;return new Array(7).fill(t)}function lT(n){return n===0?"0.00":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(2)+"K":n.toFixed(2)}function uT(n){return!n||Number.isNaN(n)?"--":new Date(n).toLocaleString()}function hT(n,e){const t=`sparkline-${n.baseId}`,r=cT(n.history,n.price),o=`./assets/${n.baseId}.webp`,a=`trend-${n.trend}`,c=lT(n.price),u=n.price>0,d=u?yf(n.timestamp):"",f=u?d:"no-price",_=u?`${n.trendPercent>0?"+":""}${n.trendPercent.toFixed(0)}%`:"";return`
    <tr class="prices-row" data-base-id="${n.baseId}">
      <td class="prices-col-name">
        <div class="prices-name-cell">
          <img src="${o}" alt="${n.name}" class="prices-item-icon" onerror="this.style.display='none'">
          <span class="prices-item-name">${dT(n.name)}</span>
        </div>
      </td>
      <td class="prices-col-updated">
        <span class="prices-updated-at">${uT(n.timestamp)}</span>
      </td>
      <td class="prices-col-price">
        <span class="prices-price-value ${f}">${c}</span>
      </td>
      <td class="prices-col-sparkline">
        <div class="prices-sparkline-cell">
          <canvas id="${t}" class="prices-sparkline" width="80" height="28" 
                  data-prices="${r.join(",")}" 
                  data-trend="${n.trend}"></canvas>
          <span class="prices-trend ${a}">${_}</span>
        </div>
      </td>
    </tr>
  `}function dT(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}function fT(n,e,t){return[...n].sort((s,o)=>{let a,c;switch(e){case"name":a=s.name.toLowerCase(),c=o.name.toLowerCase();break;case"price":a=s.price,c=o.price;break;case"trend":a=s.trendPercent,c=o.trendPercent;break;default:return 0}return a<c?t==="asc"?-1:1:a>c?t==="asc"?1:-1:0})}function Xs(){const n=document.getElementById("pricesTableBody");if(!n)return;const e=fT(Nf,So,Qn),t=document.getElementById("pricesItemCount");t&&(t.textContent=`${e.length} item${e.length!==1?"s":""}`),n.innerHTML=e.map((r,s)=>hT(r)).join(""),setTimeout(()=>{e.forEach(r=>{const s=document.getElementById(`sparkline-${r.baseId}`);if(s){const o=s.getAttribute("data-prices"),a=s.getAttribute("data-trend");if(o){const c=o.split(",").map(u=>parseFloat(u));aT(s,c,a)}}})},0)}async function zi(){try{const[n,e]=await Promise.all([ee.getPriceCache(),ee.getItemDatabase()]);bu=e,Cu=n,Df=Object.entries(bu).map(([s,o])=>{if(s===vn||o.tradable===!1)return null;const a=o.name||`Unknown Item (${s})`,c=Cu[s],u=(c==null?void 0:c.price)??0,d=(c==null?void 0:c.timestamp)??Date.now(),f=c==null?void 0:c.listingCount,_=c==null?void 0:c.history,w=u>0?oT(_,u,d):{trend:"neutral",percent:0};return{baseId:s,name:a,price:u,timestamp:d,listingCount:f,trend:w.trend,trendPercent:w.percent,group:o.group,history:_}}).filter(s=>s!==null).sort((s,o)=>s.name.localeCompare(o.name)),Ra(),Xs(),Ru(),setInterval(Ru,60*1e3)}catch(n){console.error("Failed to load prices:",n)}}function Ra(){let n=[...Df];if(Ao){const e=Ao.toLowerCase();n=n.filter(t=>t.name.toLowerCase().includes(e)||t.baseId.toLowerCase().includes(e))}else wo!=="all"&&(n=n.filter(e=>e.group===wo));Nf=n}function Pu(n){Ao=n.trim(),Ra(),Xs()}function pT(n){wo=n,document.querySelectorAll(".prices-sidebar-item").forEach(e=>{e.classList.remove("active"),e.getAttribute("data-group")===n&&e.classList.add("active")}),Ra(),Xs()}function mT(n){So===n?Qn=Qn==="asc"?"desc":"asc":(So=n,Qn="asc"),document.querySelectorAll(".prices-table th").forEach(e=>{e.classList.remove("sort-asc","sort-desc"),e.getAttribute("data-sort")===n&&e.classList.add(`sort-${Qn}`)}),Xs()}function gT(){const n=document.getElementById("pricesSearchInput"),e=document.getElementById("pricesClearSearch"),t=document.querySelectorAll(".prices-table th[data-sort]");n&&n.addEventListener("input",o=>{const a=o.target.value;Pu(a),e&&(e.style.display=a?"block":"none")}),e&&e.addEventListener("click",()=>{n&&(n.value="",Pu(""),e.style.display="none")}),t.forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-sort");a&&mT(a)})}),document.querySelectorAll(".prices-sidebar-item").forEach(o=>{o.addEventListener("click",()=>{const a=o.getAttribute("data-group");a&&pT(a)})});const s=document.getElementById("page-prices");s&&new MutationObserver(a=>{a.forEach(c=>{c.type==="attributes"&&c.attributeName==="class"&&s.classList.contains("active")&&zi()})}).observe(s,{attributes:!0}),s!=null&&s.classList.contains("active")&&zi(),ee.onInventoryUpdate(()=>{const o=document.getElementById("page-prices");o!=null&&o.classList.contains("active")&&zi()})}function Gi(){const n=De(),e=Et();n==="hourly"&&e?Ar():Js()}function Lf(n){rr(),Et()&&!hf()&&sr(),ze(Ae)}async function ku(){const[n,e]=await Promise.all([ee.getInventory(),ee.getItemDatabase()]);lE(e);const t=n.map(r=>r.baseId===vn?{...r,price:1}:r);cE(t),EE()||(bE(),TE(!0)),Et()&&!hf()&&kE(),wa(),Ae(),Lf(),ze(Ae)}async function yT(){tT(),BE(),HE(Ae,()=>ze(Ae)),XE(),ZE();const n=eT();JE(Ae,()=>ze(Ae),Lf,n),SE(cu,lu,or,Gi,UE),RE(cu,lu,uu,Aa,Sa,ba,Ca,Gi,Jl,jE,Ae,()=>ze(Ae)),nT(Ae,()=>ze(Ae),rr,sr),rT(PE,VE,NE,LE,CE,rr,sr,Ae,()=>ze(Ae),ks,Gi,Jl,GE,WE,kf,KE,Sf,qE),sT(),gT(),ee.onTimerTick(r=>{if(r.type==="realtime")ma(r.seconds),De()==="realtime"&&(or.textContent=_n(r.seconds)),rr();else if(r.type==="hourly"){lf(r.seconds),uu.textContent=_n(r.seconds);const s=Ar();if(De()==="hourly"){const o=bn();o.push({time:Date.now(),value:s}),fr(o),ks()}sr(),Ae(),ze(Ae),r.seconds%3600===0&&r.seconds>0&&DE()}}),ee.onInventoryUpdate(()=>{ku()});const[e,t]=await Promise.all([ee.getSettings(),ee.isLogPathConfigured()]);Eo(e.includeTax!==void 0?e.includeTax:!1),t?(await ku(),await Ql()):await Ql(),Cf()}async function Du(){await Nd(),await yT()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Du):Du();
