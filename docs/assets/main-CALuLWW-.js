(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const Lp=72*60*60*1e3,Vp=7*24*60*60*1e3,Mp=.125,En="100300",Op=7200;class xp{constructor(e,t={}){this.itemDatabase=e,this.inventory=new Map,this.priceCache=new Map;for(const[r,s]of Object.entries(t))this.priceCache.set(r,s)}buildInventory(e){const t=new Map;for(const r of e)t.set(r.fullId,r);this.inventory.clear();for(const r of t.values()){const s=this.itemDatabase[r.baseId];if(s&&s.tradable===!1)continue;const i=s?s.name:`Unknown Item (${r.baseId})`;if(this.inventory.has(r.baseId)){const a=this.inventory.get(r.baseId);a.totalQuantity+=r.bagNum,a.instances+=1,r.timestamp>a.lastUpdated&&(a.lastUpdated=r.timestamp)}else{const a=this.priceCache.get(r.baseId),c=a?a.price:null,u=a?a.timestamp:null;this.inventory.set(r.baseId,{itemName:i,totalQuantity:r.bagNum,baseId:r.baseId,price:c,priceTimestamp:u,instances:1,lastUpdated:r.timestamp,pageId:r.pageId,slotId:r.slotId})}}return this.inventory}hydrateInventory(e){this.inventory.clear();for(const t of e)this.inventory.set(t.baseId,{...t})}updatePrice(e,t,r,s=Date.now()){const i=Math.floor(s/216e5)*216e5,a=new Date(i).toISOString().slice(0,13)+":00:00";let c=[];const u=this.priceCache.get(e);u!=null&&u.history&&Array.isArray(u.history)&&(c=[...u.history]);const d=c.findIndex(y=>y.date===a);d>=0?c[d]={date:a,price:t}:c.push({date:a,price:t}),c.sort((y,I)=>y.date.localeCompare(I.date)),c.length>28&&(c=c.slice(c.length-28));const f={price:t,timestamp:s,...r!==void 0&&{listingCount:r},...c.length>0&&{history:c}};if(this.priceCache.set(e,f),this.inventory.has(e)){const y=this.inventory.get(e);y.price=t,y.priceTimestamp=s}}applyPriceCache(e){for(const[t,r]of Object.entries(e))if(this.priceCache.set(t,r),this.inventory.has(t)){const s=this.inventory.get(t);s.price=r.price,s.priceTimestamp=r.timestamp}}getInventory(){return Array.from(this.inventory.values()).filter(e=>{const t=this.itemDatabase[e.baseId];return!t||t.tradable!==!1}).sort((e,t)=>{const r=e.itemName.localeCompare(t.itemName);return r!==0?r:e.baseId.localeCompare(t.baseId)})}getInventoryMap(){return this.inventory}getPriceCacheAsObject(){const e={};return this.priceCache.forEach((t,r)=>{e[r]=t}),e}}const Fp="fenix_price_history",Up=1,dn="priceHistory";function No(){return typeof indexedDB<"u"}function Hu(){return new Promise((n,e)=>{if(!No()){e(new Error("IndexedDB not available"));return}const t=indexedDB.open(Fp,Up);t.onupgradeneeded=()=>{const r=t.result;r.objectStoreNames.contains(dn)||r.createObjectStore(dn,{keyPath:"baseId"})},t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error)})}function Bp(n){return new Promise((e,t)=>{n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function ju(){try{if(!No())return{};const n=await Hu(),t=n.transaction(dn,"readonly").objectStore(dn),r=await Bp(t.getAll());n.close();const s={};for(const i of r)i!=null&&i.baseId&&Array.isArray(i.history)&&(s[i.baseId]=i.history);return s}catch(n){return console.error("Failed to load price history from IndexedDB:",n),{}}}async function $p(n){try{if(!No())return;const e=await Hu(),t=e.transaction(dn,"readwrite"),r=t.objectStore(dn),s=Date.now();Object.entries(n).forEach(([i,a])=>{r.put({baseId:i,history:a,updatedAt:s})}),await new Promise((i,a)=>{t.oncomplete=()=>i(),t.onerror=()=>a(t.error),t.onabort=()=>a(t.error)}),e.close()}catch(e){console.error("Failed to save price history to IndexedDB:",e)}}function Hp(n,e,t){const r=Array.isArray(n)?[...n]:[],s=Math.floor(t/(6*60*60*1e3))*(6*60*60*1e3),i=new Date(s).toISOString().slice(0,13)+":00:00",a=r.findIndex(c=>c.date===i);return a>=0?r[a]={date:i,price:e}:r.push({date:i,price:e}),r.sort((c,u)=>c.date.localeCompare(u.date)),r.length>28?r.slice(r.length-28):r}async function Mc(n){const e=await ju(),t={},r={};for(const[s,i]of Object.entries(n)){const a=Hp(e[s],i.price,i.timestamp);t[s]=a,r[s]={...i,history:a}}return Object.keys(t).length>0&&await $p(t),r}function jp(n,e){const t={...n};for(const[r,s]of Object.entries(e)){const i=n[r],a=s.listingCount??0,c=(i==null?void 0:i.listingCount)??0;let u="use-cloud";i&&(s.timestamp>i.timestamp?u="use-cloud":s.timestamp<i.timestamp?u="keep-local":a>c?u="use-cloud":u="keep-local"),u==="use-cloud"&&(t[r]={...s,...(i==null?void 0:i.history)&&{history:i.history}})}return t}const qu="fenix_price_cache";async function zu(){try{let e=await fetch("./item_database.json");if(!e.ok)throw new Error(`Failed to load item database: ${e.statusText}`);return await e.json()}catch(n){return console.error("Failed to load item database:",n),{}}}async function Gu(n){try{const e=localStorage.getItem(qu);let t={};if(e){const s=JSON.parse(e),i={};let a=!1;for(const[c,u]of Object.entries(s))typeof u=="number"?(i[c]={price:u,timestamp:Date.now()},a=!0):i[c]=u;a&&console.log("Migrated price cache to new format with timestamps"),t=i}const r=await ju();if(Object.keys(r).length>0)for(const[s,i]of Object.entries(r))t[s]&&(t[s]={...t[s],history:i});if(!n)return t;try{const s=Object.keys(t).length===0,i=await n({forceFull:s}),a=jp(t,i);return Object.keys(i).length>0&&await vs(a),a}catch(s){return console.error("Failed to load cloud price cache:",s),t}}catch(e){return console.error("Failed to load price cache:",e),{}}}async function vs(n){try{localStorage.setItem(qu,JSON.stringify(n))}catch(e){console.error("Failed to save price cache:",e)}}const Wu="fenix_config";function Ku(){try{const n=localStorage.getItem(Wu);if(n)return JSON.parse(n)}catch(n){console.warn("Failed to read config from localStorage:",n)}return{}}function qp(n){try{localStorage.setItem(Wu,JSON.stringify(n))}catch(e){throw console.error("Failed to save config to localStorage:",e),e}}function zp(){return Ku().settings||{}}function Gp(n){const e=Ku();e.settings={...e.settings,...n},qp(e)}function Wp(n){return n.split("_")[0]}function Oc(n){if(!n.includes("BagMgr@:InitBagData"))return null;const e=n.match(/PageId\s*=\s*(\d+)/),t=e?parseInt(e[1]):null;if(t!==102&&t!==103)return null;const r=n.match(/SlotId\s*=\s*(\d+)/),s=r?parseInt(r[1]):null,i=n.match(/ConfigBaseId\s*=\s*(\d+)/);if(!i)return null;const a=i[1],c=n.match(/Num\s*=\s*(\d+)/);if(!c)return null;const u=parseInt(c[1]),d=n.match(/\[([\d\.\-:]+)\]/),f=d?d[1]:"unknown",y=`${a}_init_${t}_${s}_${f}`;return{timestamp:f,action:"Add",fullId:y,baseId:a,bagNum:u,slotId:s,pageId:t}}function xc(n){const e=n.match(/Id=([^\s]+)/);if(!e)return null;const t=e[1],r=Wp(t),s=n.match(/BagNum=(\d+)/);if(!s)return null;const i=parseInt(s[1]),a=n.match(/PageId=(\d+)/),c=a?parseInt(a[1]):null;if(c!==102&&c!==103)return null;const u=n.match(/\[([\d\.\-:]+)\]/),d=u?u[1]:"unknown";let f="Unknown";n.includes("ItemChange@ Add")?f="Add":n.includes("ItemChange@ Update")?f="Update":n.includes("ItemChange@ Remove")&&(f="Remove");const y=n.match(/SlotId=(\d+)/),I=y?parseInt(y[1]):null;return{timestamp:d,action:f,fullId:t,baseId:r,bagNum:i,slotId:I,pageId:c}}function Kp(n){const e=n.split(`
`);let t=-1,r=-1;for(let d=e.length-1;d>=0;d--){const f=e[d];if(f.includes("ItemChange@ ProtoName=ResetItemsLayout end")&&r===-1&&(r=d),f.includes("ItemChange@ ProtoName=ResetItemsLayout start")&&t===-1&&r!==-1){t=d;break}}if(t!==-1&&r!==-1){const d=[],f=Math.min(r+500,e.length);let y=!1,I=!1;for(let S=r;S<f;S++){const P=e[S];if(P.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const C=Oc(P);if(C){const k=d.findIndex(V=>V.pageId===C.pageId&&V.slotId===C.slotId&&V.slotId!==null&&C.slotId!==null);k>=0?d[k]=C:d.push(C),C.pageId===102&&(y=!0),C.pageId===103&&(I=!0)}}if(!y||!I)for(let S=f;S<e.length;S++){const P=e[S];if(P.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const C=Oc(P);if(C){const k=d.findIndex(V=>V.pageId===C.pageId&&V.slotId===C.slotId&&V.slotId!==null&&C.slotId!==null);k>=0?d[k]=C:d.push(C),C.pageId===102&&(y=!0),C.pageId===103&&(I=!0)}if(y&&I){let k=!1;for(let V=S+1;V<Math.min(S+50,e.length);V++){if(e[V].includes("BagMgr@:InitBagData")){k=!0;break}if(e[V].includes("ItemChange@ ProtoName=ResetItemsLayout start"))break}if(!k)break}}for(let S=r;S<e.length;S++){const P=e[S];if(P.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;if(P.includes("ItemChange@")&&P.includes("Id=")){const C=xc(P);if(C){const k=d.findIndex(V=>V.fullId===C.fullId);if(k>=0)d[k]=C;else if(C.slotId!==null){const V=d.findIndex(H=>H.baseId===C.baseId&&H.pageId===C.pageId&&H.slotId===C.slotId&&H.slotId!==null);V>=0?d[V]=C:d.push(C)}else d.push(C)}}}if(d.length>0)return d}let s=-1,i=-1;for(let d=e.length-1;d>=0;d--){const f=e[d];if(f.includes("ItemChange@ Reset PageId=102")&&s===-1&&(s=d),f.includes("ItemChange@ Reset PageId=103")&&i===-1&&(i=d),s!==-1&&i!==-1)break}const a=Math.min(s===-1?1/0:s,i===-1?1/0:i),c=a===1/0?e:e.slice(a),u=[];for(const d of c)if(d.includes("ItemChange@")&&d.includes("Id=")){const f=xc(d);f&&u.push(f)}return u}var Fc={};/**
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
 */const Qu=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Qp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},Ju={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,u=s+2<n.length,d=u?n[s+2]:0,f=i>>2,y=(i&3)<<4|c>>4;let I=(c&15)<<2|d>>6,S=d&63;u||(S=64,a||(I=64)),r.push(t[f],t[y],t[I],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Qu(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Qp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const y=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||d==null||y==null)throw new Jp;const I=i<<2|c>>4;if(r.push(I),d!==64){const S=c<<4&240|d>>2;if(r.push(S),y!==64){const P=d<<6&192|y;r.push(P)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Jp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Yp=function(n){const e=Qu(n);return Ju.encodeByteArray(e,!0)},Is=function(n){return Yp(n).replace(/\./g,"")},Yu=function(n){try{return Ju.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Xp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Zp=()=>Xp().__FIREBASE_DEFAULTS__,em=()=>{if(typeof process>"u"||typeof Fc>"u")return;const n=Fc.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},tm=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Yu(n[1]);return e&&JSON.parse(e)},xs=()=>{try{return Zp()||em()||tm()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Xu=n=>{var e,t;return(t=(e=xs())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},nm=n=>{const e=Xu(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Zu=()=>{var n;return(n=xs())===null||n===void 0?void 0:n.config},eh=n=>{var e;return(e=xs())===null||e===void 0?void 0:e[`_${n}`]};/**
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
 */class rm{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function sm(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Is(JSON.stringify(t)),Is(JSON.stringify(a)),""].join(".")}/**
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
 */function Ee(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function im(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ee())}function om(){var n;const e=(n=xs())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function am(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function cm(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function lm(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function um(){const n=Ee();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function hm(){return!om()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function dm(){try{return typeof indexedDB=="object"}catch{return!1}}function fm(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const pm="FirebaseError";class tt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=pm,Object.setPrototypeOf(this,tt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,yr.prototype.create)}}class yr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?mm(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new tt(s,c,r)}}function mm(n,e){return n.replace(gm,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const gm=/\{\$([^}]+)}/g;function ym(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Es(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(Uc(i)&&Uc(a)){if(!Es(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Uc(n){return n!==null&&typeof n=="object"}/**
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
 */function _r(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function _m(n,e){const t=new vm(n,e);return t.subscribe.bind(t)}class vm{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Im(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=ki),s.error===void 0&&(s.error=ki),s.complete===void 0&&(s.complete=ki);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Im(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ki(){}/**
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
 */function Tt(n){return n&&n._delegate?n._delegate:n}class xt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Dt="[DEFAULT]";/**
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
 */class Em{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new rm;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(wm(e))try{this.getOrInitializeService({instanceIdentifier:Dt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Dt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Dt){return this.instances.has(e)}getOptions(e=Dt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Tm(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Dt){return this.component?this.component.multipleInstances?e:Dt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Tm(n){return n===Dt?void 0:n}function wm(n){return n.instantiationMode==="EAGER"}/**
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
 */class Am{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Em(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var z;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(z||(z={}));const Sm={debug:z.DEBUG,verbose:z.VERBOSE,info:z.INFO,warn:z.WARN,error:z.ERROR,silent:z.SILENT},bm=z.INFO,Cm={[z.DEBUG]:"log",[z.VERBOSE]:"log",[z.INFO]:"info",[z.WARN]:"warn",[z.ERROR]:"error"},Rm=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Cm[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Lo{constructor(e){this.name=e,this._logLevel=bm,this._logHandler=Rm,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in z))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Sm[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,z.DEBUG,...e),this._logHandler(this,z.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,z.VERBOSE,...e),this._logHandler(this,z.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,z.INFO,...e),this._logHandler(this,z.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,z.WARN,...e),this._logHandler(this,z.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,z.ERROR,...e),this._logHandler(this,z.ERROR,...e)}}const Pm=(n,e)=>e.some(t=>n instanceof t);let Bc,$c;function km(){return Bc||(Bc=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Dm(){return $c||($c=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const th=new WeakMap,eo=new WeakMap,nh=new WeakMap,Di=new WeakMap,Vo=new WeakMap;function Nm(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t(pt(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&th.set(t,n)}).catch(()=>{}),Vo.set(e,n),e}function Lm(n){if(eo.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});eo.set(n,e)}let to={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return eo.get(n);if(e==="objectStoreNames")return n.objectStoreNames||nh.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return pt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Vm(n){to=n(to)}function Mm(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Ni(this),e,...t);return nh.set(r,e.sort?e.sort():[e]),pt(r)}:Dm().includes(n)?function(...e){return n.apply(Ni(this),e),pt(th.get(this))}:function(...e){return pt(n.apply(Ni(this),e))}}function Om(n){return typeof n=="function"?Mm(n):(n instanceof IDBTransaction&&Lm(n),Pm(n,km())?new Proxy(n,to):n)}function pt(n){if(n instanceof IDBRequest)return Nm(n);if(Di.has(n))return Di.get(n);const e=Om(n);return e!==n&&(Di.set(n,e),Vo.set(e,n)),e}const Ni=n=>Vo.get(n);function xm(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(n,e),c=pt(a);return r&&a.addEventListener("upgradeneeded",u=>{r(pt(a.result),u.oldVersion,u.newVersion,pt(a.transaction),u)}),t&&a.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const Fm=["get","getKey","getAll","getAllKeys","count"],Um=["put","add","delete","clear"],Li=new Map;function Hc(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Li.get(e))return Li.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=Um.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Fm.includes(t)))return;const i=async function(a,...c){const u=this.transaction(a,s?"readwrite":"readonly");let d=u.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[t](...c),s&&u.done]))[0]};return Li.set(e,i),i}Vm(n=>({...n,get:(e,t,r)=>Hc(e,t)||n.get(e,t,r),has:(e,t)=>!!Hc(e,t)||n.has(e,t)}));/**
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
 */class Bm{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if($m(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function $m(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const no="@firebase/app",jc="0.10.13";/**
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
 */const Ye=new Lo("@firebase/app"),Hm="@firebase/app-compat",jm="@firebase/analytics-compat",qm="@firebase/analytics",zm="@firebase/app-check-compat",Gm="@firebase/app-check",Wm="@firebase/auth",Km="@firebase/auth-compat",Qm="@firebase/database",Jm="@firebase/data-connect",Ym="@firebase/database-compat",Xm="@firebase/functions",Zm="@firebase/functions-compat",eg="@firebase/installations",tg="@firebase/installations-compat",ng="@firebase/messaging",rg="@firebase/messaging-compat",sg="@firebase/performance",ig="@firebase/performance-compat",og="@firebase/remote-config",ag="@firebase/remote-config-compat",cg="@firebase/storage",lg="@firebase/storage-compat",ug="@firebase/firestore",hg="@firebase/vertexai-preview",dg="@firebase/firestore-compat",fg="firebase",pg="10.14.1";/**
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
 */const ro="[DEFAULT]",mg={[no]:"fire-core",[Hm]:"fire-core-compat",[qm]:"fire-analytics",[jm]:"fire-analytics-compat",[Gm]:"fire-app-check",[zm]:"fire-app-check-compat",[Wm]:"fire-auth",[Km]:"fire-auth-compat",[Qm]:"fire-rtdb",[Jm]:"fire-data-connect",[Ym]:"fire-rtdb-compat",[Xm]:"fire-fn",[Zm]:"fire-fn-compat",[eg]:"fire-iid",[tg]:"fire-iid-compat",[ng]:"fire-fcm",[rg]:"fire-fcm-compat",[sg]:"fire-perf",[ig]:"fire-perf-compat",[og]:"fire-rc",[ag]:"fire-rc-compat",[cg]:"fire-gcs",[lg]:"fire-gcs-compat",[ug]:"fire-fst",[dg]:"fire-fst-compat",[hg]:"fire-vertex","fire-js":"fire-js",[fg]:"fire-js-all"};/**
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
 */const Ts=new Map,gg=new Map,so=new Map;function qc(n,e){try{n.container.addComponent(e)}catch(t){Ye.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function fn(n){const e=n.name;if(so.has(e))return Ye.debug(`There were multiple attempts to register component ${e}.`),!1;so.set(e,n);for(const t of Ts.values())qc(t,n);for(const t of gg.values())qc(t,n);return!0}function Mo(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function We(n){return n.settings!==void 0}/**
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
 */const yg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},mt=new yr("app","Firebase",yg);/**
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
 */class _g{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new xt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw mt.create("app-deleted",{appName:this._name})}}/**
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
 */const Tn=pg;function rh(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ro,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw mt.create("bad-app-name",{appName:String(s)});if(t||(t=Zu()),!t)throw mt.create("no-options");const i=Ts.get(s);if(i){if(Es(t,i.options)&&Es(r,i.config))return i;throw mt.create("duplicate-app",{appName:s})}const a=new Am(s);for(const u of so.values())a.addComponent(u);const c=new _g(t,r,a);return Ts.set(s,c),c}function sh(n=ro){const e=Ts.get(n);if(!e&&n===ro&&Zu())return rh();if(!e)throw mt.create("no-app",{appName:n});return e}function gt(n,e,t){var r;let s=(r=mg[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const c=[`Unable to register library "${s}" with version "${e}":`];i&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ye.warn(c.join(" "));return}fn(new xt(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const vg="firebase-heartbeat-database",Ig=1,lr="firebase-heartbeat-store";let Vi=null;function ih(){return Vi||(Vi=xm(vg,Ig,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(lr)}catch(t){console.warn(t)}}}}).catch(n=>{throw mt.create("idb-open",{originalErrorMessage:n.message})})),Vi}async function Eg(n){try{const t=(await ih()).transaction(lr),r=await t.objectStore(lr).get(oh(n));return await t.done,r}catch(e){if(e instanceof tt)Ye.warn(e.message);else{const t=mt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ye.warn(t.message)}}}async function zc(n,e){try{const r=(await ih()).transaction(lr,"readwrite");await r.objectStore(lr).put(e,oh(n)),await r.done}catch(t){if(t instanceof tt)Ye.warn(t.message);else{const r=mt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ye.warn(r.message)}}}function oh(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Tg=1024,wg=30*24*60*60*1e3;class Ag{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new bg(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Gc();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=wg}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Ye.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Gc(),{heartbeatsToSend:r,unsentEntries:s}=Sg(this._heartbeatsCache.heartbeats),i=Is(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Ye.warn(t),""}}}function Gc(){return new Date().toISOString().substring(0,10)}function Sg(n,e=Tg){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),Wc(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Wc(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class bg{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return dm()?fm().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Eg(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return zc(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return zc(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Wc(n){return Is(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function Cg(n){fn(new xt("platform-logger",e=>new Bm(e),"PRIVATE")),fn(new xt("heartbeat",e=>new Ag(e),"PRIVATE")),gt(no,jc,n),gt(no,jc,"esm2017"),gt("fire-js","")}Cg("");var Rg="firebase",Pg="10.14.1";/**
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
 */gt(Rg,Pg,"app");function Oo(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function ah(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const kg=ah,ch=new yr("auth","Firebase",ah());/**
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
 */const ws=new Lo("@firebase/auth");function Dg(n,...e){ws.logLevel<=z.WARN&&ws.warn(`Auth (${Tn}): ${n}`,...e)}function os(n,...e){ws.logLevel<=z.ERROR&&ws.error(`Auth (${Tn}): ${n}`,...e)}/**
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
 */function Xe(n,...e){throw xo(n,...e)}function Me(n,...e){return xo(n,...e)}function lh(n,e,t){const r=Object.assign(Object.assign({},kg()),{[e]:t});return new yr("auth","Firebase",r).create(e,{appName:n.name})}function yt(n){return lh(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function xo(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return ch.create(n,...e)}function B(n,e,...t){if(!n)throw xo(e,...t)}function Ke(n){const e="INTERNAL ASSERTION FAILED: "+n;throw os(e),new Error(e)}function Ze(n,e){n||Ke(e)}/**
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
 */function io(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function Ng(){return Kc()==="http:"||Kc()==="https:"}function Kc(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
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
 */function Lg(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Ng()||cm()||"connection"in navigator)?navigator.onLine:!0}function Vg(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class vr{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ze(t>e,"Short delay should be less than long delay!"),this.isMobile=im()||lm()}get(){return Lg()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Fo(n,e){Ze(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class uh{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Ke("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Ke("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Ke("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Mg={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Og=new vr(3e4,6e4);function Fs(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function wn(n,e,t,r,s={}){return hh(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const c=_r(Object.assign({key:n.config.apiKey},a)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:u},i);return am()||(d.referrerPolicy="no-referrer"),uh.fetch()(fh(n,n.config.apiHost,t,c),d)})}async function hh(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},Mg),e);try{const s=new xg(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Jr(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[u,d]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Jr(n,"credential-already-in-use",a);if(u==="EMAIL_EXISTS")throw Jr(n,"email-already-in-use",a);if(u==="USER_DISABLED")throw Jr(n,"user-disabled",a);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw lh(n,f,d);Xe(n,f)}}catch(s){if(s instanceof tt)throw s;Xe(n,"network-request-failed",{message:String(s)})}}async function dh(n,e,t,r,s={}){const i=await wn(n,e,t,r,s);return"mfaPendingCredential"in i&&Xe(n,"multi-factor-auth-required",{_serverResponse:i}),i}function fh(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?Fo(n.config,s):`${n.config.apiScheme}://${s}`}class xg{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Me(this.auth,"network-request-failed")),Og.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Jr(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Me(n,e,r);return s.customData._tokenResponse=t,s}/**
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
 */async function Fg(n,e){return wn(n,"POST","/v1/accounts:delete",e)}async function ph(n,e){return wn(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Xn(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ug(n,e=!1){const t=Tt(n),r=await t.getIdToken(e),s=Uo(r);B(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Xn(Mi(s.auth_time)),issuedAtTime:Xn(Mi(s.iat)),expirationTime:Xn(Mi(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Mi(n){return Number(n)*1e3}function Uo(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return os("JWT malformed, contained fewer than 3 sections"),null;try{const s=Yu(t);return s?JSON.parse(s):(os("Failed to decode base64 JWT payload"),null)}catch(s){return os("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Qc(n){const e=Uo(n);return B(e,"internal-error"),B(typeof e.exp<"u","internal-error"),B(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function ur(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof tt&&Bg(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Bg({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class $g{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class oo{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Xn(this.lastLoginAt),this.creationTime=Xn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function As(n){var e;const t=n.auth,r=await n.getIdToken(),s=await ur(n,ph(t,{idToken:r}));B(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?mh(i.providerUserInfo):[],c=jg(n.providerData,a),u=n.isAnonymous,d=!(n.email&&i.passwordHash)&&!(c!=null&&c.length),f=u?d:!1,y={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:c,metadata:new oo(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(n,y)}async function Hg(n){const e=Tt(n);await As(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function jg(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function mh(n){return n.map(e=>{var{providerId:t}=e,r=Oo(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function qg(n,e){const t=await hh(n,{},async()=>{const r=_r({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=fh(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",uh.fetch()(a,{method:"POST",headers:c,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function zg(n,e){return wn(n,"POST","/v2/accounts:revokeToken",Fs(n,e))}/**
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
 */class sn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){B(e.idToken,"internal-error"),B(typeof e.idToken<"u","internal-error"),B(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Qc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){B(e.length!==0,"internal-error");const t=Qc(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(B(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await qg(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new sn;return r&&(B(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(B(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(B(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new sn,this.toJSON())}_performRefresh(){return Ke("not implemented")}}/**
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
 */function ot(n,e){B(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Qe{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=Oo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new $g(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new oo(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await ur(this,this.stsTokenManager.getToken(this.auth,e));return B(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Ug(this,e)}reload(){return Hg(this)}_assign(e){this!==e&&(B(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Qe(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){B(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await As(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(We(this.auth.app))return Promise.reject(yt(this.auth));const e=await this.getIdToken();return await ur(this,Fg(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,a,c,u,d,f;const y=(r=t.displayName)!==null&&r!==void 0?r:void 0,I=(s=t.email)!==null&&s!==void 0?s:void 0,S=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,P=(a=t.photoURL)!==null&&a!==void 0?a:void 0,C=(c=t.tenantId)!==null&&c!==void 0?c:void 0,k=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,V=(d=t.createdAt)!==null&&d!==void 0?d:void 0,H=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:q,emailVerified:L,isAnonymous:x,providerData:M,stsTokenManager:E}=t;B(q&&E,e,"internal-error");const g=sn.fromJSON(this.name,E);B(typeof q=="string",e,"internal-error"),ot(y,e.name),ot(I,e.name),B(typeof L=="boolean",e,"internal-error"),B(typeof x=="boolean",e,"internal-error"),ot(S,e.name),ot(P,e.name),ot(C,e.name),ot(k,e.name),ot(V,e.name),ot(H,e.name);const m=new Qe({uid:q,auth:e,email:I,emailVerified:L,displayName:y,isAnonymous:x,photoURL:P,phoneNumber:S,tenantId:C,stsTokenManager:g,createdAt:V,lastLoginAt:H});return M&&Array.isArray(M)&&(m.providerData=M.map(v=>Object.assign({},v))),k&&(m._redirectEventId=k),m}static async _fromIdTokenResponse(e,t,r=!1){const s=new sn;s.updateFromServerResponse(t);const i=new Qe({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await As(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];B(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?mh(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new sn;c.updateFromIdToken(r);const u=new Qe({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new oo(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,d),u}}/**
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
 */const Jc=new Map;function Je(n){Ze(n instanceof Function,"Expected a class definition");let e=Jc.get(n);return e?(Ze(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Jc.set(n,e),e)}/**
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
 */class gh{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}gh.type="NONE";const Yc=gh;/**
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
 */function as(n,e,t){return`firebase:${n}:${e}:${t}`}class on{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=as(this.userKey,s.apiKey,i),this.fullPersistenceKey=as("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Qe._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new on(Je(Yc),e,r);const s=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let i=s[0]||Je(Yc);const a=as(r,e.config.apiKey,e.name);let c=null;for(const d of t)try{const f=await d._get(a);if(f){const y=Qe._fromJSON(e,f);d!==i&&(c=y),i=d;break}}catch{}const u=s.filter(d=>d._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new on(i,e,r):(i=u[0],c&&await i._set(a,c.toJSON()),await Promise.all(t.map(async d=>{if(d!==i)try{await d._remove(a)}catch{}})),new on(i,e,r))}}/**
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
 */function Xc(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Ih(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(yh(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Th(e))return"Blackberry";if(wh(e))return"Webos";if(_h(e))return"Safari";if((e.includes("chrome/")||vh(e))&&!e.includes("edge/"))return"Chrome";if(Eh(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function yh(n=Ee()){return/firefox\//i.test(n)}function _h(n=Ee()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function vh(n=Ee()){return/crios\//i.test(n)}function Ih(n=Ee()){return/iemobile/i.test(n)}function Eh(n=Ee()){return/android/i.test(n)}function Th(n=Ee()){return/blackberry/i.test(n)}function wh(n=Ee()){return/webos/i.test(n)}function Bo(n=Ee()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Gg(n=Ee()){var e;return Bo(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function Wg(){return um()&&document.documentMode===10}function Ah(n=Ee()){return Bo(n)||Eh(n)||wh(n)||Th(n)||/windows phone/i.test(n)||Ih(n)}/**
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
 */function Sh(n,e=[]){let t;switch(n){case"Browser":t=Xc(Ee());break;case"Worker":t=`${Xc(Ee())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Tn}/${r}`}/**
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
 */class Kg{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const u=e(i);a(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Qg(n,e={}){return wn(n,"GET","/v2/passwordPolicy",Fs(n,e))}/**
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
 */const Jg=6;class Yg{constructor(e){var t,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:Jg,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,a,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(a=u.containsNumericCharacter)!==null&&a!==void 0?a:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class Xg{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Zc(this),this.idTokenSubscription=new Zc(this),this.beforeStateQueue=new Kg(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=ch,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Je(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await on.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await ph(this,{idToken:e}),r=await Qe._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(We(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!a||a===c)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return B(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await As(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Vg()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(We(this.app))return Promise.reject(yt(this));const t=e?Tt(e):null;return t&&B(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&B(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return We(this.app)?Promise.reject(yt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return We(this.app)?Promise.reject(yt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Je(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Qg(this),t=new Yg(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new yr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await zg(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Je(e)||this._popupRedirectResolver;B(t,this,"argument-error"),this.redirectPersistenceManager=await on.create(this,[Je(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(B(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{a=!0,u()}}else{const u=e.addObserver(t);return()=>{a=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return B(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Sh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Dg(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Us(n){return Tt(n)}class Zc{constructor(e){this.auth=e,this.observer=null,this.addObserver=_m(t=>this.observer=t)}get next(){return B(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let $o={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Zg(n){$o=n}function ey(n){return $o.loadJS(n)}function ty(){return $o.gapiScript}function ny(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function ry(n,e){const t=Mo(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Es(i,e??{}))return s;Xe(s,"already-initialized")}return t.initialize({options:e})}function sy(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Je);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function iy(n,e,t){const r=Us(n);B(r._canInitEmulator,r,"emulator-config-failed"),B(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=bh(e),{host:a,port:c}=oy(e),u=c===null?"":`:${c}`;r.config.emulator={url:`${i}//${a}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),ay()}function bh(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function oy(n){const e=bh(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:el(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:el(a)}}}function el(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function ay(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class Ch{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Ke("not implemented")}_getIdTokenResponse(e){return Ke("not implemented")}_linkToIdToken(e,t){return Ke("not implemented")}_getReauthenticationResolver(e){return Ke("not implemented")}}/**
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
 */async function an(n,e){return dh(n,"POST","/v1/accounts:signInWithIdp",Fs(n,e))}/**
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
 */const cy="http://localhost";class Ft extends Ch{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Ft(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Xe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=Oo(t,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Ft(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return an(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,an(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,an(e,t)}buildRequest(){const e={requestUri:cy,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=_r(t)}return e}}/**
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
 */class Rh{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Ir extends Rh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class ct extends Ir{constructor(){super("facebook.com")}static credential(e){return Ft._fromParams({providerId:ct.PROVIDER_ID,signInMethod:ct.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ct.credentialFromTaggedObject(e)}static credentialFromError(e){return ct.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ct.credential(e.oauthAccessToken)}catch{return null}}}ct.FACEBOOK_SIGN_IN_METHOD="facebook.com";ct.PROVIDER_ID="facebook.com";/**
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
 */class lt extends Ir{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Ft._fromParams({providerId:lt.PROVIDER_ID,signInMethod:lt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return lt.credentialFromTaggedObject(e)}static credentialFromError(e){return lt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return lt.credential(t,r)}catch{return null}}}lt.GOOGLE_SIGN_IN_METHOD="google.com";lt.PROVIDER_ID="google.com";/**
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
 */class ut extends Ir{constructor(){super("github.com")}static credential(e){return Ft._fromParams({providerId:ut.PROVIDER_ID,signInMethod:ut.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ut.credentialFromTaggedObject(e)}static credentialFromError(e){return ut.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ut.credential(e.oauthAccessToken)}catch{return null}}}ut.GITHUB_SIGN_IN_METHOD="github.com";ut.PROVIDER_ID="github.com";/**
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
 */class ht extends Ir{constructor(){super("twitter.com")}static credential(e,t){return Ft._fromParams({providerId:ht.PROVIDER_ID,signInMethod:ht.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ht.credentialFromTaggedObject(e)}static credentialFromError(e){return ht.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ht.credential(t,r)}catch{return null}}}ht.TWITTER_SIGN_IN_METHOD="twitter.com";ht.PROVIDER_ID="twitter.com";/**
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
 */async function ly(n,e){return dh(n,"POST","/v1/accounts:signUp",Fs(n,e))}/**
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
 */class _t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await Qe._fromIdTokenResponse(e,r,s),a=tl(r);return new _t({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=tl(r);return new _t({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function tl(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function uy(n){var e;if(We(n.app))return Promise.reject(yt(n));const t=Us(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new _t({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await ly(t,{returnSecureToken:!0}),s=await _t._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
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
 */class Ss extends tt{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Ss.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Ss(e,t,r,s)}}function Ph(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ss._fromErrorAndOperation(n,i,e,r):i})}async function hy(n,e,t=!1){const r=await ur(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return _t._forOperation(n,"link",r)}/**
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
 */async function dy(n,e,t=!1){const{auth:r}=n;if(We(r.app))return Promise.reject(yt(r));const s="reauthenticate";try{const i=await ur(n,Ph(r,s,e,n),t);B(i.idToken,r,"internal-error");const a=Uo(i.idToken);B(a,r,"internal-error");const{sub:c}=a;return B(n.uid===c,r,"user-mismatch"),_t._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Xe(r,"user-mismatch"),i}}/**
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
 */async function fy(n,e,t=!1){if(We(n.app))return Promise.reject(yt(n));const r="signIn",s=await Ph(n,r,e),i=await _t._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function py(n,e,t,r){return Tt(n).onIdTokenChanged(e,t,r)}function my(n,e,t){return Tt(n).beforeAuthStateChanged(e,t)}const bs="__sak";/**
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
 */class kh{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(bs,"1"),this.storage.removeItem(bs),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const gy=1e3,yy=10;class Dh extends kh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Ah(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,u)=>{this.notifyListeners(a,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);Wg()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,yy):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},gy)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Dh.type="LOCAL";const _y=Dh;/**
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
 */class Nh extends kh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Nh.type="SESSION";const Lh=Nh;/**
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
 */function vy(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Bs{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Bs(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async d=>d(t.origin,i)),u=await vy(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Bs.receivers=[];/**
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
 */function Ho(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class Iy{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,u)=>{const d=Ho("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(y){const I=y;if(I.data.eventId===d)switch(I.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(I.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function Oe(){return window}function Ey(n){Oe().location.href=n}/**
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
 */function Vh(){return typeof Oe().WorkerGlobalScope<"u"&&typeof Oe().importScripts=="function"}async function Ty(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function wy(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function Ay(){return Vh()?self:null}/**
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
 */const Mh="firebaseLocalStorageDb",Sy=1,Cs="firebaseLocalStorage",Oh="fbase_key";class Er{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function $s(n,e){return n.transaction([Cs],e?"readwrite":"readonly").objectStore(Cs)}function by(){const n=indexedDB.deleteDatabase(Mh);return new Er(n).toPromise()}function ao(){const n=indexedDB.open(Mh,Sy);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Cs,{keyPath:Oh})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Cs)?e(r):(r.close(),await by(),e(await ao()))})})}async function nl(n,e,t){const r=$s(n,!0).put({[Oh]:e,value:t});return new Er(r).toPromise()}async function Cy(n,e){const t=$s(n,!1).get(e),r=await new Er(t).toPromise();return r===void 0?null:r.value}function rl(n,e){const t=$s(n,!0).delete(e);return new Er(t).toPromise()}const Ry=800,Py=3;class xh{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ao(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Py)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Vh()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Bs._getInstance(Ay()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Ty(),!this.activeServiceWorker)return;this.sender=new Iy(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||wy()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ao();return await nl(e,bs,"1"),await rl(e,bs),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>nl(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Cy(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>rl(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=$s(s,!1).getAll();return new Er(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Ry)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}xh.type="LOCAL";const ky=xh;new vr(3e4,6e4);/**
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
 */function Dy(n,e){return e?Je(e):(B(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class jo extends Ch{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return an(e,this._buildIdpRequest())}_linkToIdToken(e,t){return an(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return an(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Ny(n){return fy(n.auth,new jo(n),n.bypassAuthState)}function Ly(n){const{auth:e,user:t}=n;return B(t,e,"internal-error"),dy(t,new jo(n),n.bypassAuthState)}async function Vy(n){const{auth:e,user:t}=n;return B(t,e,"internal-error"),hy(t,new jo(n),n.bypassAuthState)}/**
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
 */class Fh{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Ny;case"linkViaPopup":case"linkViaRedirect":return Vy;case"reauthViaPopup":case"reauthViaRedirect":return Ly;default:Xe(this.auth,"internal-error")}}resolve(e){Ze(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ze(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const My=new vr(2e3,1e4);class rn extends Fh{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,rn.currentPopupAction&&rn.currentPopupAction.cancel(),rn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return B(e,this.auth,"internal-error"),e}async onExecution(){Ze(this.filter.length===1,"Popup operations only handle one event");const e=Ho();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Me(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Me(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,rn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Me(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,My.get())};e()}}rn.currentPopupAction=null;/**
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
 */const Oy="pendingRedirect",cs=new Map;class xy extends Fh{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=cs.get(this.auth._key());if(!e){try{const r=await Fy(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}cs.set(this.auth._key(),e)}return this.bypassAuthState||cs.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Fy(n,e){const t=$y(e),r=By(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function Uy(n,e){cs.set(n._key(),e)}function By(n){return Je(n._redirectPersistence)}function $y(n){return as(Oy,n.config.apiKey,n.name)}async function Hy(n,e,t=!1){if(We(n.app))return Promise.reject(yt(n));const r=Us(n),s=Dy(r,e),a=await new xy(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const jy=10*60*1e3;class qy{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!zy(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Uh(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Me(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=jy&&this.cachedEventUids.clear(),this.cachedEventUids.has(sl(e))}saveEventToCache(e){this.cachedEventUids.add(sl(e)),this.lastProcessedEventTime=Date.now()}}function sl(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Uh({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function zy(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Uh(n);default:return!1}}/**
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
 */async function Gy(n,e={}){return wn(n,"GET","/v1/projects",e)}/**
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
 */const Wy=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ky=/^https?/;async function Qy(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Gy(n);for(const t of e)try{if(Jy(t))return}catch{}Xe(n,"unauthorized-domain")}function Jy(n){const e=io(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Ky.test(t))return!1;if(Wy.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const Yy=new vr(3e4,6e4);function il(){const n=Oe().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Xy(n){return new Promise((e,t)=>{var r,s,i;function a(){il(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{il(),t(Me(n,"network-request-failed"))},timeout:Yy.get()})}if(!((s=(r=Oe().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Oe().gapi)===null||i===void 0)&&i.load)a();else{const c=ny("iframefcb");return Oe()[c]=()=>{gapi.load?a():t(Me(n,"network-request-failed"))},ey(`${ty()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw ls=null,e})}let ls=null;function Zy(n){return ls=ls||Xy(n),ls}/**
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
 */const e_=new vr(5e3,15e3),t_="__/auth/iframe",n_="emulator/auth/iframe",r_={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},s_=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function i_(n){const e=n.config;B(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Fo(e,n_):`https://${n.config.authDomain}/${t_}`,r={apiKey:e.apiKey,appName:n.name,v:Tn},s=s_.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${_r(r).slice(1)}`}async function o_(n){const e=await Zy(n),t=Oe().gapi;return B(t,n,"internal-error"),e.open({where:document.body,url:i_(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:r_,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=Me(n,"network-request-failed"),c=Oe().setTimeout(()=>{i(a)},e_.get());function u(){Oe().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(a)})}))}/**
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
 */const a_={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},c_=500,l_=600,u_="_blank",h_="http://localhost";class ol{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function d_(n,e,t,r=c_,s=l_){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u=Object.assign(Object.assign({},a_),{width:r.toString(),height:s.toString(),top:i,left:a}),d=Ee().toLowerCase();t&&(c=vh(d)?u_:t),yh(d)&&(e=e||h_,u.scrollbars="yes");const f=Object.entries(u).reduce((I,[S,P])=>`${I}${S}=${P},`,"");if(Gg(d)&&c!=="_self")return f_(e||"",c),new ol(null);const y=window.open(e||"",c,f);B(y,n,"popup-blocked");try{y.focus()}catch{}return new ol(y)}function f_(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const p_="__/auth/handler",m_="emulator/auth/handler",g_=encodeURIComponent("fac");async function al(n,e,t,r,s,i){B(n.config.authDomain,n,"auth-domain-config-required"),B(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Tn,eventId:s};if(e instanceof Rh){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",ym(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,y]of Object.entries({}))a[f]=y}if(e instanceof Ir){const f=e.getScopes().filter(y=>y!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),d=u?`#${g_}=${encodeURIComponent(u)}`:"";return`${y_(n)}?${_r(c).slice(1)}${d}`}function y_({config:n}){return n.emulator?Fo(n,m_):`https://${n.authDomain}/${p_}`}/**
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
 */const Oi="webStorageSupport";class __{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Lh,this._completeRedirectFn=Hy,this._overrideRedirectResult=Uy}async _openPopup(e,t,r,s){var i;Ze((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await al(e,t,r,io(),s);return d_(e,a,Ho())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await al(e,t,r,io(),s);return Ey(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Ze(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await o_(e),r=new qy(e);return t.register("authEvent",s=>(B(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Oi,{type:Oi},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[Oi];a!==void 0&&t(!!a),Xe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Qy(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Ah()||_h()||Bo()}}const v_=__;var cl="@firebase/auth",ll="1.7.9";/**
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
 */class I_{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){B(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function E_(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function T_(n){fn(new xt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;B(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Sh(n)},d=new Xg(r,s,i,u);return sy(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),fn(new xt("auth-internal",e=>{const t=Us(e.getProvider("auth").getImmediate());return(r=>new I_(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),gt(cl,ll,E_(n)),gt(cl,ll,"esm2017")}/**
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
 */const w_=5*60,A_=eh("authIdTokenMaxAge")||w_;let ul=null;const S_=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>A_)return;const s=t==null?void 0:t.token;ul!==s&&(ul=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function b_(n=sh()){const e=Mo(n,"auth");if(e.isInitialized())return e.getImmediate();const t=ry(n,{popupRedirectResolver:v_,persistence:[ky,_y,Lh]}),r=eh("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=S_(i.toString());my(t,a,()=>a(t.currentUser)),py(t,c=>a(c))}}const s=Xu("auth");return s&&iy(t,`http://${s}`),t}function C_(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Zg({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=Me("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",C_().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});T_("Browser");var hl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Vt,Bh;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(E,g){function m(){}m.prototype=g.prototype,E.D=g.prototype,E.prototype=new m,E.prototype.constructor=E,E.C=function(v,T,w){for(var _=Array(arguments.length-2),X=2;X<arguments.length;X++)_[X-2]=arguments[X];return g.prototype[T].apply(v,_)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(E,g,m){m||(m=0);var v=Array(16);if(typeof g=="string")for(var T=0;16>T;++T)v[T]=g.charCodeAt(m++)|g.charCodeAt(m++)<<8|g.charCodeAt(m++)<<16|g.charCodeAt(m++)<<24;else for(T=0;16>T;++T)v[T]=g[m++]|g[m++]<<8|g[m++]<<16|g[m++]<<24;g=E.g[0],m=E.g[1],T=E.g[2];var w=E.g[3],_=g+(w^m&(T^w))+v[0]+3614090360&4294967295;g=m+(_<<7&4294967295|_>>>25),_=w+(T^g&(m^T))+v[1]+3905402710&4294967295,w=g+(_<<12&4294967295|_>>>20),_=T+(m^w&(g^m))+v[2]+606105819&4294967295,T=w+(_<<17&4294967295|_>>>15),_=m+(g^T&(w^g))+v[3]+3250441966&4294967295,m=T+(_<<22&4294967295|_>>>10),_=g+(w^m&(T^w))+v[4]+4118548399&4294967295,g=m+(_<<7&4294967295|_>>>25),_=w+(T^g&(m^T))+v[5]+1200080426&4294967295,w=g+(_<<12&4294967295|_>>>20),_=T+(m^w&(g^m))+v[6]+2821735955&4294967295,T=w+(_<<17&4294967295|_>>>15),_=m+(g^T&(w^g))+v[7]+4249261313&4294967295,m=T+(_<<22&4294967295|_>>>10),_=g+(w^m&(T^w))+v[8]+1770035416&4294967295,g=m+(_<<7&4294967295|_>>>25),_=w+(T^g&(m^T))+v[9]+2336552879&4294967295,w=g+(_<<12&4294967295|_>>>20),_=T+(m^w&(g^m))+v[10]+4294925233&4294967295,T=w+(_<<17&4294967295|_>>>15),_=m+(g^T&(w^g))+v[11]+2304563134&4294967295,m=T+(_<<22&4294967295|_>>>10),_=g+(w^m&(T^w))+v[12]+1804603682&4294967295,g=m+(_<<7&4294967295|_>>>25),_=w+(T^g&(m^T))+v[13]+4254626195&4294967295,w=g+(_<<12&4294967295|_>>>20),_=T+(m^w&(g^m))+v[14]+2792965006&4294967295,T=w+(_<<17&4294967295|_>>>15),_=m+(g^T&(w^g))+v[15]+1236535329&4294967295,m=T+(_<<22&4294967295|_>>>10),_=g+(T^w&(m^T))+v[1]+4129170786&4294967295,g=m+(_<<5&4294967295|_>>>27),_=w+(m^T&(g^m))+v[6]+3225465664&4294967295,w=g+(_<<9&4294967295|_>>>23),_=T+(g^m&(w^g))+v[11]+643717713&4294967295,T=w+(_<<14&4294967295|_>>>18),_=m+(w^g&(T^w))+v[0]+3921069994&4294967295,m=T+(_<<20&4294967295|_>>>12),_=g+(T^w&(m^T))+v[5]+3593408605&4294967295,g=m+(_<<5&4294967295|_>>>27),_=w+(m^T&(g^m))+v[10]+38016083&4294967295,w=g+(_<<9&4294967295|_>>>23),_=T+(g^m&(w^g))+v[15]+3634488961&4294967295,T=w+(_<<14&4294967295|_>>>18),_=m+(w^g&(T^w))+v[4]+3889429448&4294967295,m=T+(_<<20&4294967295|_>>>12),_=g+(T^w&(m^T))+v[9]+568446438&4294967295,g=m+(_<<5&4294967295|_>>>27),_=w+(m^T&(g^m))+v[14]+3275163606&4294967295,w=g+(_<<9&4294967295|_>>>23),_=T+(g^m&(w^g))+v[3]+4107603335&4294967295,T=w+(_<<14&4294967295|_>>>18),_=m+(w^g&(T^w))+v[8]+1163531501&4294967295,m=T+(_<<20&4294967295|_>>>12),_=g+(T^w&(m^T))+v[13]+2850285829&4294967295,g=m+(_<<5&4294967295|_>>>27),_=w+(m^T&(g^m))+v[2]+4243563512&4294967295,w=g+(_<<9&4294967295|_>>>23),_=T+(g^m&(w^g))+v[7]+1735328473&4294967295,T=w+(_<<14&4294967295|_>>>18),_=m+(w^g&(T^w))+v[12]+2368359562&4294967295,m=T+(_<<20&4294967295|_>>>12),_=g+(m^T^w)+v[5]+4294588738&4294967295,g=m+(_<<4&4294967295|_>>>28),_=w+(g^m^T)+v[8]+2272392833&4294967295,w=g+(_<<11&4294967295|_>>>21),_=T+(w^g^m)+v[11]+1839030562&4294967295,T=w+(_<<16&4294967295|_>>>16),_=m+(T^w^g)+v[14]+4259657740&4294967295,m=T+(_<<23&4294967295|_>>>9),_=g+(m^T^w)+v[1]+2763975236&4294967295,g=m+(_<<4&4294967295|_>>>28),_=w+(g^m^T)+v[4]+1272893353&4294967295,w=g+(_<<11&4294967295|_>>>21),_=T+(w^g^m)+v[7]+4139469664&4294967295,T=w+(_<<16&4294967295|_>>>16),_=m+(T^w^g)+v[10]+3200236656&4294967295,m=T+(_<<23&4294967295|_>>>9),_=g+(m^T^w)+v[13]+681279174&4294967295,g=m+(_<<4&4294967295|_>>>28),_=w+(g^m^T)+v[0]+3936430074&4294967295,w=g+(_<<11&4294967295|_>>>21),_=T+(w^g^m)+v[3]+3572445317&4294967295,T=w+(_<<16&4294967295|_>>>16),_=m+(T^w^g)+v[6]+76029189&4294967295,m=T+(_<<23&4294967295|_>>>9),_=g+(m^T^w)+v[9]+3654602809&4294967295,g=m+(_<<4&4294967295|_>>>28),_=w+(g^m^T)+v[12]+3873151461&4294967295,w=g+(_<<11&4294967295|_>>>21),_=T+(w^g^m)+v[15]+530742520&4294967295,T=w+(_<<16&4294967295|_>>>16),_=m+(T^w^g)+v[2]+3299628645&4294967295,m=T+(_<<23&4294967295|_>>>9),_=g+(T^(m|~w))+v[0]+4096336452&4294967295,g=m+(_<<6&4294967295|_>>>26),_=w+(m^(g|~T))+v[7]+1126891415&4294967295,w=g+(_<<10&4294967295|_>>>22),_=T+(g^(w|~m))+v[14]+2878612391&4294967295,T=w+(_<<15&4294967295|_>>>17),_=m+(w^(T|~g))+v[5]+4237533241&4294967295,m=T+(_<<21&4294967295|_>>>11),_=g+(T^(m|~w))+v[12]+1700485571&4294967295,g=m+(_<<6&4294967295|_>>>26),_=w+(m^(g|~T))+v[3]+2399980690&4294967295,w=g+(_<<10&4294967295|_>>>22),_=T+(g^(w|~m))+v[10]+4293915773&4294967295,T=w+(_<<15&4294967295|_>>>17),_=m+(w^(T|~g))+v[1]+2240044497&4294967295,m=T+(_<<21&4294967295|_>>>11),_=g+(T^(m|~w))+v[8]+1873313359&4294967295,g=m+(_<<6&4294967295|_>>>26),_=w+(m^(g|~T))+v[15]+4264355552&4294967295,w=g+(_<<10&4294967295|_>>>22),_=T+(g^(w|~m))+v[6]+2734768916&4294967295,T=w+(_<<15&4294967295|_>>>17),_=m+(w^(T|~g))+v[13]+1309151649&4294967295,m=T+(_<<21&4294967295|_>>>11),_=g+(T^(m|~w))+v[4]+4149444226&4294967295,g=m+(_<<6&4294967295|_>>>26),_=w+(m^(g|~T))+v[11]+3174756917&4294967295,w=g+(_<<10&4294967295|_>>>22),_=T+(g^(w|~m))+v[2]+718787259&4294967295,T=w+(_<<15&4294967295|_>>>17),_=m+(w^(T|~g))+v[9]+3951481745&4294967295,E.g[0]=E.g[0]+g&4294967295,E.g[1]=E.g[1]+(T+(_<<21&4294967295|_>>>11))&4294967295,E.g[2]=E.g[2]+T&4294967295,E.g[3]=E.g[3]+w&4294967295}r.prototype.u=function(E,g){g===void 0&&(g=E.length);for(var m=g-this.blockSize,v=this.B,T=this.h,w=0;w<g;){if(T==0)for(;w<=m;)s(this,E,w),w+=this.blockSize;if(typeof E=="string"){for(;w<g;)if(v[T++]=E.charCodeAt(w++),T==this.blockSize){s(this,v),T=0;break}}else for(;w<g;)if(v[T++]=E[w++],T==this.blockSize){s(this,v),T=0;break}}this.h=T,this.o+=g},r.prototype.v=function(){var E=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);E[0]=128;for(var g=1;g<E.length-8;++g)E[g]=0;var m=8*this.o;for(g=E.length-8;g<E.length;++g)E[g]=m&255,m/=256;for(this.u(E),E=Array(16),g=m=0;4>g;++g)for(var v=0;32>v;v+=8)E[m++]=this.g[g]>>>v&255;return E};function i(E,g){var m=c;return Object.prototype.hasOwnProperty.call(m,E)?m[E]:m[E]=g(E)}function a(E,g){this.h=g;for(var m=[],v=!0,T=E.length-1;0<=T;T--){var w=E[T]|0;v&&w==g||(m[T]=w,v=!1)}this.g=m}var c={};function u(E){return-128<=E&&128>E?i(E,function(g){return new a([g|0],0>g?-1:0)}):new a([E|0],0>E?-1:0)}function d(E){if(isNaN(E)||!isFinite(E))return y;if(0>E)return k(d(-E));for(var g=[],m=1,v=0;E>=m;v++)g[v]=E/m|0,m*=4294967296;return new a(g,0)}function f(E,g){if(E.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(E.charAt(0)=="-")return k(f(E.substring(1),g));if(0<=E.indexOf("-"))throw Error('number format error: interior "-" character');for(var m=d(Math.pow(g,8)),v=y,T=0;T<E.length;T+=8){var w=Math.min(8,E.length-T),_=parseInt(E.substring(T,T+w),g);8>w?(w=d(Math.pow(g,w)),v=v.j(w).add(d(_))):(v=v.j(m),v=v.add(d(_)))}return v}var y=u(0),I=u(1),S=u(16777216);n=a.prototype,n.m=function(){if(C(this))return-k(this).m();for(var E=0,g=1,m=0;m<this.g.length;m++){var v=this.i(m);E+=(0<=v?v:4294967296+v)*g,g*=4294967296}return E},n.toString=function(E){if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(P(this))return"0";if(C(this))return"-"+k(this).toString(E);for(var g=d(Math.pow(E,6)),m=this,v="";;){var T=L(m,g).g;m=V(m,T.j(g));var w=((0<m.g.length?m.g[0]:m.h)>>>0).toString(E);if(m=T,P(m))return w+v;for(;6>w.length;)w="0"+w;v=w+v}},n.i=function(E){return 0>E?0:E<this.g.length?this.g[E]:this.h};function P(E){if(E.h!=0)return!1;for(var g=0;g<E.g.length;g++)if(E.g[g]!=0)return!1;return!0}function C(E){return E.h==-1}n.l=function(E){return E=V(this,E),C(E)?-1:P(E)?0:1};function k(E){for(var g=E.g.length,m=[],v=0;v<g;v++)m[v]=~E.g[v];return new a(m,~E.h).add(I)}n.abs=function(){return C(this)?k(this):this},n.add=function(E){for(var g=Math.max(this.g.length,E.g.length),m=[],v=0,T=0;T<=g;T++){var w=v+(this.i(T)&65535)+(E.i(T)&65535),_=(w>>>16)+(this.i(T)>>>16)+(E.i(T)>>>16);v=_>>>16,w&=65535,_&=65535,m[T]=_<<16|w}return new a(m,m[m.length-1]&-2147483648?-1:0)};function V(E,g){return E.add(k(g))}n.j=function(E){if(P(this)||P(E))return y;if(C(this))return C(E)?k(this).j(k(E)):k(k(this).j(E));if(C(E))return k(this.j(k(E)));if(0>this.l(S)&&0>E.l(S))return d(this.m()*E.m());for(var g=this.g.length+E.g.length,m=[],v=0;v<2*g;v++)m[v]=0;for(v=0;v<this.g.length;v++)for(var T=0;T<E.g.length;T++){var w=this.i(v)>>>16,_=this.i(v)&65535,X=E.i(T)>>>16,He=E.i(T)&65535;m[2*v+2*T]+=_*He,H(m,2*v+2*T),m[2*v+2*T+1]+=w*He,H(m,2*v+2*T+1),m[2*v+2*T+1]+=_*X,H(m,2*v+2*T+1),m[2*v+2*T+2]+=w*X,H(m,2*v+2*T+2)}for(v=0;v<g;v++)m[v]=m[2*v+1]<<16|m[2*v];for(v=g;v<2*g;v++)m[v]=0;return new a(m,0)};function H(E,g){for(;(E[g]&65535)!=E[g];)E[g+1]+=E[g]>>>16,E[g]&=65535,g++}function q(E,g){this.g=E,this.h=g}function L(E,g){if(P(g))throw Error("division by zero");if(P(E))return new q(y,y);if(C(E))return g=L(k(E),g),new q(k(g.g),k(g.h));if(C(g))return g=L(E,k(g)),new q(k(g.g),g.h);if(30<E.g.length){if(C(E)||C(g))throw Error("slowDivide_ only works with positive integers.");for(var m=I,v=g;0>=v.l(E);)m=x(m),v=x(v);var T=M(m,1),w=M(v,1);for(v=M(v,2),m=M(m,2);!P(v);){var _=w.add(v);0>=_.l(E)&&(T=T.add(m),w=_),v=M(v,1),m=M(m,1)}return g=V(E,T.j(g)),new q(T,g)}for(T=y;0<=E.l(g);){for(m=Math.max(1,Math.floor(E.m()/g.m())),v=Math.ceil(Math.log(m)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),w=d(m),_=w.j(g);C(_)||0<_.l(E);)m-=v,w=d(m),_=w.j(g);P(w)&&(w=I),T=T.add(w),E=V(E,_)}return new q(T,E)}n.A=function(E){return L(this,E).h},n.and=function(E){for(var g=Math.max(this.g.length,E.g.length),m=[],v=0;v<g;v++)m[v]=this.i(v)&E.i(v);return new a(m,this.h&E.h)},n.or=function(E){for(var g=Math.max(this.g.length,E.g.length),m=[],v=0;v<g;v++)m[v]=this.i(v)|E.i(v);return new a(m,this.h|E.h)},n.xor=function(E){for(var g=Math.max(this.g.length,E.g.length),m=[],v=0;v<g;v++)m[v]=this.i(v)^E.i(v);return new a(m,this.h^E.h)};function x(E){for(var g=E.g.length+1,m=[],v=0;v<g;v++)m[v]=E.i(v)<<1|E.i(v-1)>>>31;return new a(m,E.h)}function M(E,g){var m=g>>5;g%=32;for(var v=E.g.length-m,T=[],w=0;w<v;w++)T[w]=0<g?E.i(w+m)>>>g|E.i(w+m+1)<<32-g:E.i(w+m);return new a(T,E.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Bh=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,Vt=a}).apply(typeof hl<"u"?hl:typeof self<"u"?self:typeof window<"u"?window:{});var Yr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var $h,Gn,Hh,us,co,jh,qh,zh;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,l,h){return o==Array.prototype||o==Object.prototype||(o[l]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Yr=="object"&&Yr];for(var l=0;l<o.length;++l){var h=o[l];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(o,l){if(l)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var A=o[p];if(!(A in h))break e;h=h[A]}o=o[o.length-1],p=h[o],l=l(p),l!=p&&l!=null&&e(h,o,{configurable:!0,writable:!0,value:l})}}function i(o,l){o instanceof String&&(o+="");var h=0,p=!1,A={next:function(){if(!p&&h<o.length){var b=h++;return{value:l(b,o[b]),done:!1}}return p=!0,{done:!0,value:void 0}}};return A[Symbol.iterator]=function(){return A},A}s("Array.prototype.values",function(o){return o||function(){return i(this,function(l,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function u(o){var l=typeof o;return l=l!="object"?l:o?Array.isArray(o)?"array":l:"null",l=="array"||l=="object"&&typeof o.length=="number"}function d(o){var l=typeof o;return l=="object"&&o!=null||l=="function"}function f(o,l,h){return o.call.apply(o.bind,arguments)}function y(o,l,h){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var A=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(A,p),o.apply(l,A)}}return function(){return o.apply(l,arguments)}}function I(o,l,h){return I=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:y,I.apply(null,arguments)}function S(o,l){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function P(o,l){function h(){}h.prototype=l.prototype,o.aa=l.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(p,A,b){for(var D=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)D[Y-2]=arguments[Y];return l.prototype[A].apply(p,D)}}function C(o){const l=o.length;if(0<l){const h=Array(l);for(let p=0;p<l;p++)h[p]=o[p];return h}return[]}function k(o,l){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(u(p)){const A=o.length||0,b=p.length||0;o.length=A+b;for(let D=0;D<b;D++)o[A+D]=p[D]}else o.push(p)}}class V{constructor(l,h){this.i=l,this.j=h,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function H(o){return/^[\s\xa0]*$/.test(o)}function q(){var o=c.navigator;return o&&(o=o.userAgent)?o:""}function L(o){return L[" "](o),o}L[" "]=function(){};var x=q().indexOf("Gecko")!=-1&&!(q().toLowerCase().indexOf("webkit")!=-1&&q().indexOf("Edge")==-1)&&!(q().indexOf("Trident")!=-1||q().indexOf("MSIE")!=-1)&&q().indexOf("Edge")==-1;function M(o,l,h){for(const p in o)l.call(h,o[p],p,o)}function E(o,l){for(const h in o)l.call(void 0,o[h],h,o)}function g(o){const l={};for(const h in o)l[h]=o[h];return l}const m="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(o,l){let h,p;for(let A=1;A<arguments.length;A++){p=arguments[A];for(h in p)o[h]=p[h];for(let b=0;b<m.length;b++)h=m[b],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function T(o){var l=1;o=o.split(":");const h=[];for(;0<l&&o.length;)h.push(o.shift()),l--;return o.length&&h.push(o.join(":")),h}function w(o){c.setTimeout(()=>{throw o},0)}function _(){var o=oi;let l=null;return o.g&&(l=o.g,o.g=o.g.next,o.g||(o.h=null),l.next=null),l}class X{constructor(){this.h=this.g=null}add(l,h){const p=He.get();p.set(l,h),this.h?this.h.next=p:this.g=p,this.h=p}}var He=new V(()=>new Rn,o=>o.reset());class Rn{constructor(){this.next=this.g=this.h=null}set(l,h){this.h=l,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let At,St=!1,oi=new X,Ma=()=>{const o=c.Promise.resolve(void 0);At=()=>{o.then(Zf)}};var Zf=()=>{for(var o;o=_();){try{o.h.call(o.g)}catch(h){w(h)}var l=He;l.j(o),100>l.h&&(l.h++,o.next=l.g,l.g=o)}St=!1};function nt(){this.s=this.s,this.C=this.C}nt.prototype.s=!1,nt.prototype.ma=function(){this.s||(this.s=!0,this.N())},nt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function pe(o,l){this.type=o,this.g=this.target=l,this.defaultPrevented=!1}pe.prototype.h=function(){this.defaultPrevented=!0};var ep=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var o=!1,l=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};c.addEventListener("test",h,l),c.removeEventListener("test",h,l)}catch{}return o}();function Pn(o,l){if(pe.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=l,l=o.relatedTarget){if(x){e:{try{L(l.nodeName);var A=!0;break e}catch{}A=!1}A||(l=null)}}else h=="mouseover"?l=o.fromElement:h=="mouseout"&&(l=o.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:tp[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Pn.aa.h.call(this)}}P(Pn,pe);var tp={2:"touch",3:"pen",4:"mouse"};Pn.prototype.h=function(){Pn.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Dr="closure_listenable_"+(1e6*Math.random()|0),np=0;function rp(o,l,h,p,A){this.listener=o,this.proxy=null,this.src=l,this.type=h,this.capture=!!p,this.ha=A,this.key=++np,this.da=this.fa=!1}function Nr(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Lr(o){this.src=o,this.g={},this.h=0}Lr.prototype.add=function(o,l,h,p,A){var b=o.toString();o=this.g[b],o||(o=this.g[b]=[],this.h++);var D=ci(o,l,p,A);return-1<D?(l=o[D],h||(l.fa=!1)):(l=new rp(l,this.src,b,!!p,A),l.fa=h,o.push(l)),l};function ai(o,l){var h=l.type;if(h in o.g){var p=o.g[h],A=Array.prototype.indexOf.call(p,l,void 0),b;(b=0<=A)&&Array.prototype.splice.call(p,A,1),b&&(Nr(l),o.g[h].length==0&&(delete o.g[h],o.h--))}}function ci(o,l,h,p){for(var A=0;A<o.length;++A){var b=o[A];if(!b.da&&b.listener==l&&b.capture==!!h&&b.ha==p)return A}return-1}var li="closure_lm_"+(1e6*Math.random()|0),ui={};function Oa(o,l,h,p,A){if(Array.isArray(l)){for(var b=0;b<l.length;b++)Oa(o,l[b],h,p,A);return null}return h=Ua(h),o&&o[Dr]?o.K(l,h,d(p)?!!p.capture:!1,A):sp(o,l,h,!1,p,A)}function sp(o,l,h,p,A,b){if(!l)throw Error("Invalid event type");var D=d(A)?!!A.capture:!!A,Y=di(o);if(Y||(o[li]=Y=new Lr(o)),h=Y.add(l,h,p,D,b),h.proxy)return h;if(p=ip(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)ep||(A=D),A===void 0&&(A=!1),o.addEventListener(l.toString(),p,A);else if(o.attachEvent)o.attachEvent(Fa(l.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function ip(){function o(h){return l.call(o.src,o.listener,h)}const l=op;return o}function xa(o,l,h,p,A){if(Array.isArray(l))for(var b=0;b<l.length;b++)xa(o,l[b],h,p,A);else p=d(p)?!!p.capture:!!p,h=Ua(h),o&&o[Dr]?(o=o.i,l=String(l).toString(),l in o.g&&(b=o.g[l],h=ci(b,h,p,A),-1<h&&(Nr(b[h]),Array.prototype.splice.call(b,h,1),b.length==0&&(delete o.g[l],o.h--)))):o&&(o=di(o))&&(l=o.g[l.toString()],o=-1,l&&(o=ci(l,h,p,A)),(h=-1<o?l[o]:null)&&hi(h))}function hi(o){if(typeof o!="number"&&o&&!o.da){var l=o.src;if(l&&l[Dr])ai(l.i,o);else{var h=o.type,p=o.proxy;l.removeEventListener?l.removeEventListener(h,p,o.capture):l.detachEvent?l.detachEvent(Fa(h),p):l.addListener&&l.removeListener&&l.removeListener(p),(h=di(l))?(ai(h,o),h.h==0&&(h.src=null,l[li]=null)):Nr(o)}}}function Fa(o){return o in ui?ui[o]:ui[o]="on"+o}function op(o,l){if(o.da)o=!0;else{l=new Pn(l,this);var h=o.listener,p=o.ha||o.src;o.fa&&hi(o),o=h.call(p,l)}return o}function di(o){return o=o[li],o instanceof Lr?o:null}var fi="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ua(o){return typeof o=="function"?o:(o[fi]||(o[fi]=function(l){return o.handleEvent(l)}),o[fi])}function me(){nt.call(this),this.i=new Lr(this),this.M=this,this.F=null}P(me,nt),me.prototype[Dr]=!0,me.prototype.removeEventListener=function(o,l,h,p){xa(this,o,l,h,p)};function Te(o,l){var h,p=o.F;if(p)for(h=[];p;p=p.F)h.push(p);if(o=o.M,p=l.type||l,typeof l=="string")l=new pe(l,o);else if(l instanceof pe)l.target=l.target||o;else{var A=l;l=new pe(p,o),v(l,A)}if(A=!0,h)for(var b=h.length-1;0<=b;b--){var D=l.g=h[b];A=Vr(D,p,!0,l)&&A}if(D=l.g=o,A=Vr(D,p,!0,l)&&A,A=Vr(D,p,!1,l)&&A,h)for(b=0;b<h.length;b++)D=l.g=h[b],A=Vr(D,p,!1,l)&&A}me.prototype.N=function(){if(me.aa.N.call(this),this.i){var o=this.i,l;for(l in o.g){for(var h=o.g[l],p=0;p<h.length;p++)Nr(h[p]);delete o.g[l],o.h--}}this.F=null},me.prototype.K=function(o,l,h,p){return this.i.add(String(o),l,!1,h,p)},me.prototype.L=function(o,l,h,p){return this.i.add(String(o),l,!0,h,p)};function Vr(o,l,h,p){if(l=o.i.g[String(l)],!l)return!0;l=l.concat();for(var A=!0,b=0;b<l.length;++b){var D=l[b];if(D&&!D.da&&D.capture==h){var Y=D.listener,ue=D.ha||D.src;D.fa&&ai(o.i,D),A=Y.call(ue,p)!==!1&&A}}return A&&!p.defaultPrevented}function Ba(o,l,h){if(typeof o=="function")h&&(o=I(o,h));else if(o&&typeof o.handleEvent=="function")o=I(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(o,l||0)}function $a(o){o.g=Ba(()=>{o.g=null,o.i&&(o.i=!1,$a(o))},o.l);const l=o.h;o.h=null,o.m.apply(null,l)}class ap extends nt{constructor(l,h){super(),this.m=l,this.l=h,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:$a(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function kn(o){nt.call(this),this.h=o,this.g={}}P(kn,nt);var Ha=[];function ja(o){M(o.g,function(l,h){this.g.hasOwnProperty(h)&&hi(l)},o),o.g={}}kn.prototype.N=function(){kn.aa.N.call(this),ja(this)},kn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var pi=c.JSON.stringify,cp=c.JSON.parse,lp=class{stringify(o){return c.JSON.stringify(o,void 0)}parse(o){return c.JSON.parse(o,void 0)}};function mi(){}mi.prototype.h=null;function qa(o){return o.h||(o.h=o.i())}function za(){}var Dn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function gi(){pe.call(this,"d")}P(gi,pe);function yi(){pe.call(this,"c")}P(yi,pe);var bt={},Ga=null;function Mr(){return Ga=Ga||new me}bt.La="serverreachability";function Wa(o){pe.call(this,bt.La,o)}P(Wa,pe);function Nn(o){const l=Mr();Te(l,new Wa(l))}bt.STAT_EVENT="statevent";function Ka(o,l){pe.call(this,bt.STAT_EVENT,o),this.stat=l}P(Ka,pe);function we(o){const l=Mr();Te(l,new Ka(l,o))}bt.Ma="timingevent";function Qa(o,l){pe.call(this,bt.Ma,o),this.size=l}P(Qa,pe);function Ln(o,l){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){o()},l)}function Vn(){this.g=!0}Vn.prototype.xa=function(){this.g=!1};function up(o,l,h,p,A,b){o.info(function(){if(o.g)if(b)for(var D="",Y=b.split("&"),ue=0;ue<Y.length;ue++){var Q=Y[ue].split("=");if(1<Q.length){var ge=Q[0];Q=Q[1];var ye=ge.split("_");D=2<=ye.length&&ye[1]=="type"?D+(ge+"="+Q+"&"):D+(ge+"=redacted&")}}else D=null;else D=b;return"XMLHTTP REQ ("+p+") [attempt "+A+"]: "+l+`
`+h+`
`+D})}function hp(o,l,h,p,A,b,D){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+A+"]: "+l+`
`+h+`
`+b+" "+D})}function jt(o,l,h,p){o.info(function(){return"XMLHTTP TEXT ("+l+"): "+fp(o,h)+(p?" "+p:"")})}function dp(o,l){o.info(function(){return"TIMEOUT: "+l})}Vn.prototype.info=function(){};function fp(o,l){if(!o.g)return l;if(!l)return null;try{var h=JSON.parse(l);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var p=h[o];if(!(2>p.length)){var A=p[1];if(Array.isArray(A)&&!(1>A.length)){var b=A[0];if(b!="noop"&&b!="stop"&&b!="close")for(var D=1;D<A.length;D++)A[D]=""}}}}return pi(h)}catch{return l}}var Or={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Ja={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},_i;function xr(){}P(xr,mi),xr.prototype.g=function(){return new XMLHttpRequest},xr.prototype.i=function(){return{}},_i=new xr;function rt(o,l,h,p){this.j=o,this.i=l,this.l=h,this.R=p||1,this.U=new kn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ya}function Ya(){this.i=null,this.g="",this.h=!1}var Xa={},vi={};function Ii(o,l,h){o.L=1,o.v=$r(je(l)),o.m=h,o.P=!0,Za(o,null)}function Za(o,l){o.F=Date.now(),Fr(o),o.A=je(o.v);var h=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),fc(h.i,"t",p),o.C=0,h=o.j.J,o.h=new Ya,o.g=Dc(o.j,h?l:null,!o.m),0<o.O&&(o.M=new ap(I(o.Y,o,o.g),o.O)),l=o.U,h=o.g,p=o.ca;var A="readystatechange";Array.isArray(A)||(A&&(Ha[0]=A.toString()),A=Ha);for(var b=0;b<A.length;b++){var D=Oa(h,A[b],p||l.handleEvent,!1,l.h||l);if(!D)break;l.g[D.key]=D}l=o.H?g(o.H):{},o.m?(o.u||(o.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,l)):(o.u="GET",o.g.ea(o.A,o.u,null,l)),Nn(),up(o.i,o.u,o.A,o.l,o.R,o.m)}rt.prototype.ca=function(o){o=o.target;const l=this.M;l&&qe(o)==3?l.j():this.Y(o)},rt.prototype.Y=function(o){try{if(o==this.g)e:{const ye=qe(this.g);var l=this.g.Ba();const Gt=this.g.Z();if(!(3>ye)&&(ye!=3||this.g&&(this.h.h||this.g.oa()||Ic(this.g)))){this.J||ye!=4||l==7||(l==8||0>=Gt?Nn(3):Nn(2)),Ei(this);var h=this.g.Z();this.X=h;t:if(ec(this)){var p=Ic(this.g);o="";var A=p.length,b=qe(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Ct(this),Mn(this);var D="";break t}this.h.i=new c.TextDecoder}for(l=0;l<A;l++)this.h.h=!0,o+=this.h.i.decode(p[l],{stream:!(b&&l==A-1)});p.length=0,this.h.g+=o,this.C=0,D=this.h.g}else D=this.g.oa();if(this.o=h==200,hp(this.i,this.u,this.A,this.l,this.R,ye,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Y,ue=this.g;if((Y=ue.g?ue.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!H(Y)){var Q=Y;break t}}Q=null}if(h=Q)jt(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ti(this,h);else{this.o=!1,this.s=3,we(12),Ct(this),Mn(this);break e}}if(this.P){h=!0;let Le;for(;!this.J&&this.C<D.length;)if(Le=pp(this,D),Le==vi){ye==4&&(this.s=4,we(14),h=!1),jt(this.i,this.l,null,"[Incomplete Response]");break}else if(Le==Xa){this.s=4,we(15),jt(this.i,this.l,D,"[Invalid Chunk]"),h=!1;break}else jt(this.i,this.l,Le,null),Ti(this,Le);if(ec(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ye!=4||D.length!=0||this.h.h||(this.s=1,we(16),h=!1),this.o=this.o&&h,!h)jt(this.i,this.l,D,"[Invalid Chunked Response]"),Ct(this),Mn(this);else if(0<D.length&&!this.W){this.W=!0;var ge=this.j;ge.g==this&&ge.ba&&!ge.M&&(ge.j.info("Great, no buffering proxy detected. Bytes received: "+D.length),Ri(ge),ge.M=!0,we(11))}}else jt(this.i,this.l,D,null),Ti(this,D);ye==4&&Ct(this),this.o&&!this.J&&(ye==4?Cc(this.j,this):(this.o=!1,Fr(this)))}else Dp(this.g),h==400&&0<D.indexOf("Unknown SID")?(this.s=3,we(12)):(this.s=0,we(13)),Ct(this),Mn(this)}}}catch{}finally{}};function ec(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function pp(o,l){var h=o.C,p=l.indexOf(`
`,h);return p==-1?vi:(h=Number(l.substring(h,p)),isNaN(h)?Xa:(p+=1,p+h>l.length?vi:(l=l.slice(p,p+h),o.C=p+h,l)))}rt.prototype.cancel=function(){this.J=!0,Ct(this)};function Fr(o){o.S=Date.now()+o.I,tc(o,o.I)}function tc(o,l){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Ln(I(o.ba,o),l)}function Ei(o){o.B&&(c.clearTimeout(o.B),o.B=null)}rt.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(dp(this.i,this.A),this.L!=2&&(Nn(),we(17)),Ct(this),this.s=2,Mn(this)):tc(this,this.S-o)};function Mn(o){o.j.G==0||o.J||Cc(o.j,o)}function Ct(o){Ei(o);var l=o.M;l&&typeof l.ma=="function"&&l.ma(),o.M=null,ja(o.U),o.g&&(l=o.g,o.g=null,l.abort(),l.ma())}function Ti(o,l){try{var h=o.j;if(h.G!=0&&(h.g==o||wi(h.h,o))){if(!o.K&&wi(h.h,o)&&h.G==3){try{var p=h.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var A=p;if(A[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)Wr(h),zr(h);else break e;Ci(h),we(18)}}else h.za=A[1],0<h.za-h.T&&37500>A[2]&&h.F&&h.v==0&&!h.C&&(h.C=Ln(I(h.Za,h),6e3));if(1>=sc(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Pt(h,11)}else if((o.K||h.g==o)&&Wr(h),!H(l))for(A=h.Da.g.parse(l),l=0;l<A.length;l++){let Q=A[l];if(h.T=Q[0],Q=Q[1],h.G==2)if(Q[0]=="c"){h.K=Q[1],h.ia=Q[2];const ge=Q[3];ge!=null&&(h.la=ge,h.j.info("VER="+h.la));const ye=Q[4];ye!=null&&(h.Aa=ye,h.j.info("SVER="+h.Aa));const Gt=Q[5];Gt!=null&&typeof Gt=="number"&&0<Gt&&(p=1.5*Gt,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const Le=o.g;if(Le){const Qr=Le.g?Le.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Qr){var b=p.h;b.g||Qr.indexOf("spdy")==-1&&Qr.indexOf("quic")==-1&&Qr.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(Ai(b,b.h),b.h=null))}if(p.D){const Pi=Le.g?Le.g.getResponseHeader("X-HTTP-Session-Id"):null;Pi&&(p.ya=Pi,Z(p.I,p.D,Pi))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var D=o;if(p.qa=kc(p,p.J?p.ia:null,p.W),D.K){ic(p.h,D);var Y=D,ue=p.L;ue&&(Y.I=ue),Y.B&&(Ei(Y),Fr(Y)),p.g=D}else Sc(p);0<h.i.length&&Gr(h)}else Q[0]!="stop"&&Q[0]!="close"||Pt(h,7);else h.G==3&&(Q[0]=="stop"||Q[0]=="close"?Q[0]=="stop"?Pt(h,7):bi(h):Q[0]!="noop"&&h.l&&h.l.ta(Q),h.v=0)}}Nn(4)}catch{}}var mp=class{constructor(o,l){this.g=o,this.map=l}};function nc(o){this.l=o||10,c.PerformanceNavigationTiming?(o=c.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function rc(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function sc(o){return o.h?1:o.g?o.g.size:0}function wi(o,l){return o.h?o.h==l:o.g?o.g.has(l):!1}function Ai(o,l){o.g?o.g.add(l):o.h=l}function ic(o,l){o.h&&o.h==l?o.h=null:o.g&&o.g.has(l)&&o.g.delete(l)}nc.prototype.cancel=function(){if(this.i=oc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function oc(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let l=o.i;for(const h of o.g.values())l=l.concat(h.D);return l}return C(o.i)}function gp(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(u(o)){for(var l=[],h=o.length,p=0;p<h;p++)l.push(o[p]);return l}l=[],h=0;for(p in o)l[h++]=o[p];return l}function yp(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(u(o)||typeof o=="string"){var l=[];o=o.length;for(var h=0;h<o;h++)l.push(h);return l}l=[],h=0;for(const p in o)l[h++]=p;return l}}}function ac(o,l){if(o.forEach&&typeof o.forEach=="function")o.forEach(l,void 0);else if(u(o)||typeof o=="string")Array.prototype.forEach.call(o,l,void 0);else for(var h=yp(o),p=gp(o),A=p.length,b=0;b<A;b++)l.call(void 0,p[b],h&&h[b],o)}var cc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function _p(o,l){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var p=o[h].indexOf("="),A=null;if(0<=p){var b=o[h].substring(0,p);A=o[h].substring(p+1)}else b=o[h];l(b,A?decodeURIComponent(A.replace(/\+/g," ")):"")}}}function Rt(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Rt){this.h=o.h,Ur(this,o.j),this.o=o.o,this.g=o.g,Br(this,o.s),this.l=o.l;var l=o.i,h=new Fn;h.i=l.i,l.g&&(h.g=new Map(l.g),h.h=l.h),lc(this,h),this.m=o.m}else o&&(l=String(o).match(cc))?(this.h=!1,Ur(this,l[1]||"",!0),this.o=On(l[2]||""),this.g=On(l[3]||"",!0),Br(this,l[4]),this.l=On(l[5]||"",!0),lc(this,l[6]||"",!0),this.m=On(l[7]||"")):(this.h=!1,this.i=new Fn(null,this.h))}Rt.prototype.toString=function(){var o=[],l=this.j;l&&o.push(xn(l,uc,!0),":");var h=this.g;return(h||l=="file")&&(o.push("//"),(l=this.o)&&o.push(xn(l,uc,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(xn(h,h.charAt(0)=="/"?Ep:Ip,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",xn(h,wp)),o.join("")};function je(o){return new Rt(o)}function Ur(o,l,h){o.j=h?On(l,!0):l,o.j&&(o.j=o.j.replace(/:$/,""))}function Br(o,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);o.s=l}else o.s=null}function lc(o,l,h){l instanceof Fn?(o.i=l,Ap(o.i,o.h)):(h||(l=xn(l,Tp)),o.i=new Fn(l,o.h))}function Z(o,l,h){o.i.set(l,h)}function $r(o){return Z(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function On(o,l){return o?l?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function xn(o,l,h){return typeof o=="string"?(o=encodeURI(o).replace(l,vp),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function vp(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var uc=/[#\/\?@]/g,Ip=/[#\?:]/g,Ep=/[#\?]/g,Tp=/[#\?@]/g,wp=/#/g;function Fn(o,l){this.h=this.g=null,this.i=o||null,this.j=!!l}function st(o){o.g||(o.g=new Map,o.h=0,o.i&&_p(o.i,function(l,h){o.add(decodeURIComponent(l.replace(/\+/g," ")),h)}))}n=Fn.prototype,n.add=function(o,l){st(this),this.i=null,o=qt(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(l),this.h+=1,this};function hc(o,l){st(o),l=qt(o,l),o.g.has(l)&&(o.i=null,o.h-=o.g.get(l).length,o.g.delete(l))}function dc(o,l){return st(o),l=qt(o,l),o.g.has(l)}n.forEach=function(o,l){st(this),this.g.forEach(function(h,p){h.forEach(function(A){o.call(l,A,p,this)},this)},this)},n.na=function(){st(this);const o=Array.from(this.g.values()),l=Array.from(this.g.keys()),h=[];for(let p=0;p<l.length;p++){const A=o[p];for(let b=0;b<A.length;b++)h.push(l[p])}return h},n.V=function(o){st(this);let l=[];if(typeof o=="string")dc(this,o)&&(l=l.concat(this.g.get(qt(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)l=l.concat(o[h])}return l},n.set=function(o,l){return st(this),this.i=null,o=qt(this,o),dc(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[l]),this.h+=1,this},n.get=function(o,l){return o?(o=this.V(o),0<o.length?String(o[0]):l):l};function fc(o,l,h){hc(o,l),0<h.length&&(o.i=null,o.g.set(qt(o,l),C(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],l=Array.from(this.g.keys());for(var h=0;h<l.length;h++){var p=l[h];const b=encodeURIComponent(String(p)),D=this.V(p);for(p=0;p<D.length;p++){var A=b;D[p]!==""&&(A+="="+encodeURIComponent(String(D[p]))),o.push(A)}}return this.i=o.join("&")};function qt(o,l){return l=String(l),o.j&&(l=l.toLowerCase()),l}function Ap(o,l){l&&!o.j&&(st(o),o.i=null,o.g.forEach(function(h,p){var A=p.toLowerCase();p!=A&&(hc(this,p),fc(this,A,h))},o)),o.j=l}function Sp(o,l){const h=new Vn;if(c.Image){const p=new Image;p.onload=S(it,h,"TestLoadImage: loaded",!0,l,p),p.onerror=S(it,h,"TestLoadImage: error",!1,l,p),p.onabort=S(it,h,"TestLoadImage: abort",!1,l,p),p.ontimeout=S(it,h,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else l(!1)}function bp(o,l){const h=new Vn,p=new AbortController,A=setTimeout(()=>{p.abort(),it(h,"TestPingServer: timeout",!1,l)},1e4);fetch(o,{signal:p.signal}).then(b=>{clearTimeout(A),b.ok?it(h,"TestPingServer: ok",!0,l):it(h,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(A),it(h,"TestPingServer: error",!1,l)})}function it(o,l,h,p,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),p(h)}catch{}}function Cp(){this.g=new lp}function Rp(o,l,h){const p=h||"";try{ac(o,function(A,b){let D=A;d(A)&&(D=pi(A)),l.push(p+b+"="+encodeURIComponent(D))})}catch(A){throw l.push(p+"type="+encodeURIComponent("_badmap")),A}}function Hr(o){this.l=o.Ub||null,this.j=o.eb||!1}P(Hr,mi),Hr.prototype.g=function(){return new jr(this.l,this.j)},Hr.prototype.i=function(o){return function(){return o}}({});function jr(o,l){me.call(this),this.D=o,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}P(jr,me),n=jr.prototype,n.open=function(o,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=l,this.readyState=1,Bn(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(l.body=o),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Un(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Bn(this)),this.g&&(this.readyState=3,Bn(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;pc(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function pc(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var l=o.value?o.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!o.done}))&&(this.response=this.responseText+=l)}o.done?Un(this):Bn(this),this.readyState==3&&pc(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,Un(this))},n.Qa=function(o){this.g&&(this.response=o,Un(this))},n.ga=function(){this.g&&Un(this)};function Un(o){o.readyState=4,o.l=null,o.j=null,o.v=null,Bn(o)}n.setRequestHeader=function(o,l){this.u.append(o,l)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],l=this.h.entries();for(var h=l.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=l.next();return o.join(`\r
`)};function Bn(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(jr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function mc(o){let l="";return M(o,function(h,p){l+=p,l+=":",l+=h,l+=`\r
`}),l}function Si(o,l,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=mc(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):Z(o,l,h))}function te(o){me.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}P(te,me);var Pp=/^https?$/i,kp=["POST","PUT"];n=te.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,l,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);l=l?l.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():_i.g(),this.v=this.o?qa(this.o):qa(_i),this.g.onreadystatechange=I(this.Ea,this);try{this.B=!0,this.g.open(l,String(o),!0),this.B=!1}catch(b){gc(this,b);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var A in p)h.set(A,p[A]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const b of p.keys())h.set(b,p.get(b));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(b=>b.toLowerCase()=="content-type"),A=c.FormData&&o instanceof c.FormData,!(0<=Array.prototype.indexOf.call(kp,l,void 0))||p||A||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,D]of h)this.g.setRequestHeader(b,D);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{vc(this),this.u=!0,this.g.send(o),this.u=!1}catch(b){gc(this,b)}};function gc(o,l){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=l,o.m=5,yc(o),qr(o)}function yc(o){o.A||(o.A=!0,Te(o,"complete"),Te(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,Te(this,"complete"),Te(this,"abort"),qr(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),qr(this,!0)),te.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?_c(this):this.bb())},n.bb=function(){_c(this)};function _c(o){if(o.h&&typeof a<"u"&&(!o.v[1]||qe(o)!=4||o.Z()!=2)){if(o.u&&qe(o)==4)Ba(o.Ea,0,o);else if(Te(o,"readystatechange"),qe(o)==4){o.h=!1;try{const D=o.Z();e:switch(D){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var h;if(!(h=l)){var p;if(p=D===0){var A=String(o.D).match(cc)[1]||null;!A&&c.self&&c.self.location&&(A=c.self.location.protocol.slice(0,-1)),p=!Pp.test(A?A.toLowerCase():"")}h=p}if(h)Te(o,"complete"),Te(o,"success");else{o.m=6;try{var b=2<qe(o)?o.g.statusText:""}catch{b=""}o.l=b+" ["+o.Z()+"]",yc(o)}}finally{qr(o)}}}}function qr(o,l){if(o.g){vc(o);const h=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,l||Te(o,"ready");try{h.onreadystatechange=p}catch{}}}function vc(o){o.I&&(c.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function qe(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<qe(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var l=this.g.responseText;return o&&l.indexOf(o)==0&&(l=l.substring(o.length)),cp(l)}};function Ic(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Dp(o){const l={};o=(o.g&&2<=qe(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(H(o[p]))continue;var h=T(o[p]);const A=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const b=l[A]||[];l[A]=b,b.push(h)}E(l,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function $n(o,l,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||l}function Ec(o){this.Aa=0,this.i=[],this.j=new Vn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=$n("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=$n("baseRetryDelayMs",5e3,o),this.cb=$n("retryDelaySeedMs",1e4,o),this.Wa=$n("forwardChannelMaxRetries",2,o),this.wa=$n("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new nc(o&&o.concurrentRequestLimit),this.Da=new Cp,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=Ec.prototype,n.la=8,n.G=1,n.connect=function(o,l,h,p){we(0),this.W=o,this.H=l||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=kc(this,null,this.W),Gr(this)};function bi(o){if(Tc(o),o.G==3){var l=o.U++,h=je(o.I);if(Z(h,"SID",o.K),Z(h,"RID",l),Z(h,"TYPE","terminate"),Hn(o,h),l=new rt(o,o.j,l),l.L=2,l.v=$r(je(h)),h=!1,c.navigator&&c.navigator.sendBeacon)try{h=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!h&&c.Image&&(new Image().src=l.v,h=!0),h||(l.g=Dc(l.j,null),l.g.ea(l.v)),l.F=Date.now(),Fr(l)}Pc(o)}function zr(o){o.g&&(Ri(o),o.g.cancel(),o.g=null)}function Tc(o){zr(o),o.u&&(c.clearTimeout(o.u),o.u=null),Wr(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&c.clearTimeout(o.s),o.s=null)}function Gr(o){if(!rc(o.h)&&!o.s){o.s=!0;var l=o.Ga;At||Ma(),St||(At(),St=!0),oi.add(l,o),o.B=0}}function Np(o,l){return sc(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=l.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Ln(I(o.Ga,o,l),Rc(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const A=new rt(this,this.j,o);let b=this.o;if(this.S&&(b?(b=g(b),v(b,this.S)):b=this.S),this.m!==null||this.O||(A.H=b,b=null),this.P)e:{for(var l=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=h;break e}if(l===4096||h===this.i.length-1){l=h+1;break e}}l=1e3}else l=1e3;l=Ac(this,A,l),h=je(this.I),Z(h,"RID",o),Z(h,"CVER",22),this.D&&Z(h,"X-HTTP-Session-Id",this.D),Hn(this,h),b&&(this.O?l="headers="+encodeURIComponent(String(mc(b)))+"&"+l:this.m&&Si(h,this.m,b)),Ai(this.h,A),this.Ua&&Z(h,"TYPE","init"),this.P?(Z(h,"$req",l),Z(h,"SID","null"),A.T=!0,Ii(A,h,null)):Ii(A,h,l),this.G=2}}else this.G==3&&(o?wc(this,o):this.i.length==0||rc(this.h)||wc(this))};function wc(o,l){var h;l?h=l.l:h=o.U++;const p=je(o.I);Z(p,"SID",o.K),Z(p,"RID",h),Z(p,"AID",o.T),Hn(o,p),o.m&&o.o&&Si(p,o.m,o.o),h=new rt(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),l&&(o.i=l.D.concat(o.i)),l=Ac(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),Ai(o.h,h),Ii(h,p,l)}function Hn(o,l){o.H&&M(o.H,function(h,p){Z(l,p,h)}),o.l&&ac({},function(h,p){Z(l,p,h)})}function Ac(o,l,h){h=Math.min(o.i.length,h);var p=o.l?I(o.l.Na,o.l,o):null;e:{var A=o.i;let b=-1;for(;;){const D=["count="+h];b==-1?0<h?(b=A[0].g,D.push("ofs="+b)):b=0:D.push("ofs="+b);let Y=!0;for(let ue=0;ue<h;ue++){let Q=A[ue].g;const ge=A[ue].map;if(Q-=b,0>Q)b=Math.max(0,A[ue].g-100),Y=!1;else try{Rp(ge,D,"req"+Q+"_")}catch{p&&p(ge)}}if(Y){p=D.join("&");break e}}}return o=o.i.splice(0,h),l.D=o,p}function Sc(o){if(!o.g&&!o.u){o.Y=1;var l=o.Fa;At||Ma(),St||(At(),St=!0),oi.add(l,o),o.v=0}}function Ci(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Ln(I(o.Fa,o),Rc(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,bc(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Ln(I(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,we(10),zr(this),bc(this))};function Ri(o){o.A!=null&&(c.clearTimeout(o.A),o.A=null)}function bc(o){o.g=new rt(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var l=je(o.qa);Z(l,"RID","rpc"),Z(l,"SID",o.K),Z(l,"AID",o.T),Z(l,"CI",o.F?"0":"1"),!o.F&&o.ja&&Z(l,"TO",o.ja),Z(l,"TYPE","xmlhttp"),Hn(o,l),o.m&&o.o&&Si(l,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=$r(je(l)),h.m=null,h.P=!0,Za(h,o)}n.Za=function(){this.C!=null&&(this.C=null,zr(this),Ci(this),we(19))};function Wr(o){o.C!=null&&(c.clearTimeout(o.C),o.C=null)}function Cc(o,l){var h=null;if(o.g==l){Wr(o),Ri(o),o.g=null;var p=2}else if(wi(o.h,l))h=l.D,ic(o.h,l),p=1;else return;if(o.G!=0){if(l.o)if(p==1){h=l.m?l.m.length:0,l=Date.now()-l.F;var A=o.B;p=Mr(),Te(p,new Qa(p,h)),Gr(o)}else Sc(o);else if(A=l.s,A==3||A==0&&0<l.X||!(p==1&&Np(o,l)||p==2&&Ci(o)))switch(h&&0<h.length&&(l=o.h,l.i=l.i.concat(h)),A){case 1:Pt(o,5);break;case 4:Pt(o,10);break;case 3:Pt(o,6);break;default:Pt(o,2)}}}function Rc(o,l){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*l}function Pt(o,l){if(o.j.info("Error code "+l),l==2){var h=I(o.fb,o),p=o.Xa;const A=!p;p=new Rt(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||Ur(p,"https"),$r(p),A?Sp(p.toString(),h):bp(p.toString(),h)}else we(2);o.G=0,o.l&&o.l.sa(l),Pc(o),Tc(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),we(2)):(this.j.info("Failed to ping google.com"),we(1))};function Pc(o){if(o.G=0,o.ka=[],o.l){const l=oc(o.h);(l.length!=0||o.i.length!=0)&&(k(o.ka,l),k(o.ka,o.i),o.h.i.length=0,C(o.i),o.i.length=0),o.l.ra()}}function kc(o,l,h){var p=h instanceof Rt?je(h):new Rt(h);if(p.g!="")l&&(p.g=l+"."+p.g),Br(p,p.s);else{var A=c.location;p=A.protocol,l=l?l+"."+A.hostname:A.hostname,A=+A.port;var b=new Rt(null);p&&Ur(b,p),l&&(b.g=l),A&&Br(b,A),h&&(b.l=h),p=b}return h=o.D,l=o.ya,h&&l&&Z(p,h,l),Z(p,"VER",o.la),Hn(o,p),p}function Dc(o,l,h){if(l&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=o.Ca&&!o.pa?new te(new Hr({eb:h})):new te(o.pa),l.Ha(o.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Nc(){}n=Nc.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Kr(){}Kr.prototype.g=function(o,l){return new Re(o,l)};function Re(o,l){me.call(this),this.g=new Ec(l),this.l=o,this.h=l&&l.messageUrlParams||null,o=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(o?o["X-WebChannel-Content-Type"]=l.messageContentType:o={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(o?o["X-WebChannel-Client-Profile"]=l.va:o={"X-WebChannel-Client-Profile":l.va}),this.g.S=o,(o=l&&l.Sb)&&!H(o)&&(this.g.m=o),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!H(l)&&(this.g.D=l,o=this.h,o!==null&&l in o&&(o=this.h,l in o&&delete o[l])),this.j=new zt(this)}P(Re,me),Re.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Re.prototype.close=function(){bi(this.g)},Re.prototype.o=function(o){var l=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=pi(o),o=h);l.i.push(new mp(l.Ya++,o)),l.G==3&&Gr(l)},Re.prototype.N=function(){this.g.l=null,delete this.j,bi(this.g),delete this.g,Re.aa.N.call(this)};function Lc(o){gi.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var l=o.__sm__;if(l){e:{for(const h in l){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,l=l!==null&&o in l?l[o]:void 0),this.data=l}else this.data=o}P(Lc,gi);function Vc(){yi.call(this),this.status=1}P(Vc,yi);function zt(o){this.g=o}P(zt,Nc),zt.prototype.ua=function(){Te(this.g,"a")},zt.prototype.ta=function(o){Te(this.g,new Lc(o))},zt.prototype.sa=function(o){Te(this.g,new Vc)},zt.prototype.ra=function(){Te(this.g,"b")},Kr.prototype.createWebChannel=Kr.prototype.g,Re.prototype.send=Re.prototype.o,Re.prototype.open=Re.prototype.m,Re.prototype.close=Re.prototype.close,zh=function(){return new Kr},qh=function(){return Mr()},jh=bt,co={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Or.NO_ERROR=0,Or.TIMEOUT=8,Or.HTTP_ERROR=6,us=Or,Ja.COMPLETE="complete",Hh=Ja,za.EventType=Dn,Dn.OPEN="a",Dn.CLOSE="b",Dn.ERROR="c",Dn.MESSAGE="d",me.prototype.listen=me.prototype.K,Gn=za,te.prototype.listenOnce=te.prototype.L,te.prototype.getLastError=te.prototype.Ka,te.prototype.getLastErrorCode=te.prototype.Ba,te.prototype.getStatus=te.prototype.Z,te.prototype.getResponseJson=te.prototype.Oa,te.prototype.getResponseText=te.prototype.oa,te.prototype.send=te.prototype.ea,te.prototype.setWithCredentials=te.prototype.Ha,$h=te}).apply(typeof Yr<"u"?Yr:typeof self<"u"?self:typeof window<"u"?window:{});const dl="@firebase/firestore";/**
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
 */let An="10.14.0";/**
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
 */const Ut=new Lo("@firebase/firestore");function jn(){return Ut.logLevel}function O(n,...e){if(Ut.logLevel<=z.DEBUG){const t=e.map(qo);Ut.debug(`Firestore (${An}): ${n}`,...t)}}function et(n,...e){if(Ut.logLevel<=z.ERROR){const t=e.map(qo);Ut.error(`Firestore (${An}): ${n}`,...t)}}function pn(n,...e){if(Ut.logLevel<=z.WARN){const t=e.map(qo);Ut.warn(`Firestore (${An}): ${n}`,...t)}}function qo(n){if(typeof n=="string")return n;try{/**
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
 */function j(n="Unexpected state"){const e=`FIRESTORE (${An}) INTERNAL ASSERTION FAILED: `+n;throw et(e),new Error(e)}function re(n,e){n||j()}function W(n,e){return n}/**
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
 */const N={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class F extends tt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Mt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
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
 */class Gh{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class R_{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(ve.UNAUTHENTICATED))}shutdown(){}}class P_{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class k_{constructor(e){this.t=e,this.currentUser=ve.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){re(this.o===void 0);let r=this.i;const s=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let i=new Mt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Mt,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{O("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(O("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Mt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(O("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(re(typeof r.accessToken=="string"),new Gh(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return re(e===null||typeof e=="string"),new ve(e)}}class D_{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=ve.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class N_{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new D_(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(ve.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class L_{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class V_{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){re(this.o===void 0);const r=i=>{i.error!=null&&O("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,O("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{O("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):O("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(re(typeof t.token=="string"),this.R=t.token,new L_(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function M_(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class Wh{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=M_(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function J(n,e){return n<e?-1:n>e?1:0}function mn(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
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
 */class Ce{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new F(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new F(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new F(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new F(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return Ce.fromMillis(Date.now())}static fromDate(e){return Ce.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new Ce(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class ${constructor(e){this.timestamp=e}static fromTimestamp(e){return new $(e)}static min(){return new $(new Ce(0,0))}static max(){return new $(new Ce(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class hr{constructor(e,t,r){t===void 0?t=0:t>e.length&&j(),r===void 0?r=e.length-t:r>e.length-t&&j(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return hr.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof hr?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),a=t.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class ne extends hr{construct(e,t,r){return new ne(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new F(N.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new ne(t)}static emptyPath(){return new ne([])}}const O_=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class be extends hr{construct(e,t,r){return new be(e,t,r)}static isValidIdentifier(e){return O_.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),be.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new be(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new F(N.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new F(N.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new F(N.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new F(N.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new be(t)}static emptyPath(){return new be([])}}/**
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
 */class U{constructor(e){this.path=e}static fromPath(e){return new U(ne.fromString(e))}static fromName(e){return new U(ne.fromString(e).popFirst(5))}static empty(){return new U(ne.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ne.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ne.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new U(new ne(e.slice()))}}function x_(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=$.fromTimestamp(r===1e9?new Ce(t+1,0):new Ce(t,r));return new vt(s,U.empty(),e)}function F_(n){return new vt(n.readTime,n.key,-1)}class vt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new vt($.min(),U.empty(),-1)}static max(){return new vt($.max(),U.empty(),-1)}}function U_(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=U.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
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
 */const B_="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class $_{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function zo(n){if(n.code!==N.FAILED_PRECONDITION||n.message!==B_)throw n;O("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class R{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&j(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new R((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof R?t:R.resolve(t)}catch(t){return R.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):R.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):R.reject(t)}static resolve(e){return new R((t,r)=>{t(e)})}static reject(e){return new R((t,r)=>{r(e)})}static waitFor(e){return new R((t,r)=>{let s=0,i=0,a=!1;e.forEach(c=>{++s,c.next(()=>{++i,a&&i===s&&t()},u=>r(u))}),a=!0,i===s&&t()})}static or(e){let t=R.resolve(!1);for(const r of e)t=t.next(s=>s?R.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new R((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let u=0;u<i;u++){const d=u;t(e[d]).next(f=>{a[d]=f,++c,c===i&&r(a)},f=>s(f))}})}static doWhile(e,t){return new R((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function H_(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Tr(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class Go{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Go.oe=-1;function Hs(n){return n==null}function lo(n){return n===0&&1/n==-1/0}/**
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
 */function fl(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function js(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function j_(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class ie{constructor(e,t){this.comparator=e,this.root=t||he.EMPTY}insert(e,t){return new ie(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,he.BLACK,null,null))}remove(e){return new ie(this.comparator,this.root.remove(e,this.comparator).copy(null,null,he.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Xr(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Xr(this.root,e,this.comparator,!1)}getReverseIterator(){return new Xr(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Xr(this.root,e,this.comparator,!0)}}class Xr{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class he{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??he.RED,this.left=s??he.EMPTY,this.right=i??he.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new he(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return he.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return he.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,he.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,he.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw j();const e=this.left.check();if(e!==this.right.check())throw j();return e+(this.isRed()?0:1)}}he.EMPTY=null,he.RED=!0,he.BLACK=!1;he.EMPTY=new class{constructor(){this.size=0}get key(){throw j()}get value(){throw j()}get color(){throw j()}get left(){throw j()}get right(){throw j()}copy(e,t,r,s,i){return this}insert(e,t,r){return new he(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class de{constructor(e){this.comparator=e,this.data=new ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new pl(this.data.getIterator())}getIteratorFrom(e){return new pl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof de)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new de(this.comparator);return t.data=e,t}}class pl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class dt{constructor(e){this.fields=e,e.sort(be.comparator)}static empty(){return new dt([])}unionWith(e){let t=new de(be.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new dt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return mn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class Kh extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class fe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Kh("Invalid base64 string: "+i):i}}(e);return new fe(t)}static fromUint8Array(e){const t=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new fe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}fe.EMPTY_BYTE_STRING=new fe("");const q_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function It(n){if(re(!!n),typeof n=="string"){let e=0;const t=q_.exec(n);if(re(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:se(n.seconds),nanos:se(n.nanos)}}function se(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Bt(n){return typeof n=="string"?fe.fromBase64String(n):fe.fromUint8Array(n)}/**
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
 */function Wo(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Ko(n){const e=n.mapValue.fields.__previous_value__;return Wo(e)?Ko(e):e}function dr(n){const e=It(n.mapValue.fields.__local_write_time__.timestampValue);return new Ce(e.seconds,e.nanos)}/**
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
 */class z_{constructor(e,t,r,s,i,a,c,u,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=d}}class fr{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new fr("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof fr&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const Zr={mapValue:{}};function $t(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Wo(n)?4:W_(n)?9007199254740991:G_(n)?10:11:j()}function Ue(n,e){if(n===e)return!0;const t=$t(n);if(t!==$t(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return dr(n).isEqual(dr(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=It(s.timestampValue),c=It(i.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return Bt(s.bytesValue).isEqual(Bt(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return se(s.geoPointValue.latitude)===se(i.geoPointValue.latitude)&&se(s.geoPointValue.longitude)===se(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return se(s.integerValue)===se(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=se(s.doubleValue),c=se(i.doubleValue);return a===c?lo(a)===lo(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return mn(n.arrayValue.values||[],e.arrayValue.values||[],Ue);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},c=i.mapValue.fields||{};if(fl(a)!==fl(c))return!1;for(const u in a)if(a.hasOwnProperty(u)&&(c[u]===void 0||!Ue(a[u],c[u])))return!1;return!0}(n,e);default:return j()}}function pr(n,e){return(n.values||[]).find(t=>Ue(t,e))!==void 0}function gn(n,e){if(n===e)return 0;const t=$t(n),r=$t(e);if(t!==r)return J(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return function(i,a){const c=se(i.integerValue||i.doubleValue),u=se(a.integerValue||a.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return ml(n.timestampValue,e.timestampValue);case 4:return ml(dr(n),dr(e));case 5:return J(n.stringValue,e.stringValue);case 6:return function(i,a){const c=Bt(i),u=Bt(a);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(i,a){const c=i.split("/"),u=a.split("/");for(let d=0;d<c.length&&d<u.length;d++){const f=J(c[d],u[d]);if(f!==0)return f}return J(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,a){const c=J(se(i.latitude),se(a.latitude));return c!==0?c:J(se(i.longitude),se(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return gl(n.arrayValue,e.arrayValue);case 10:return function(i,a){var c,u,d,f;const y=i.fields||{},I=a.fields||{},S=(c=y.value)===null||c===void 0?void 0:c.arrayValue,P=(u=I.value)===null||u===void 0?void 0:u.arrayValue,C=J(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((f=P==null?void 0:P.values)===null||f===void 0?void 0:f.length)||0);return C!==0?C:gl(S,P)}(n.mapValue,e.mapValue);case 11:return function(i,a){if(i===Zr.mapValue&&a===Zr.mapValue)return 0;if(i===Zr.mapValue)return 1;if(a===Zr.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),d=a.fields||{},f=Object.keys(d);u.sort(),f.sort();for(let y=0;y<u.length&&y<f.length;++y){const I=J(u[y],f[y]);if(I!==0)return I;const S=gn(c[u[y]],d[f[y]]);if(S!==0)return S}return J(u.length,f.length)}(n.mapValue,e.mapValue);default:throw j()}}function ml(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=It(n),r=It(e),s=J(t.seconds,r.seconds);return s!==0?s:J(t.nanos,r.nanos)}function gl(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=gn(t[s],r[s]);if(i)return i}return J(t.length,r.length)}function yn(n){return uo(n)}function uo(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=It(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Bt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return U.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=uo(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${uo(t.fields[a])}`;return s+"}"}(n.mapValue):j()}function ho(n){return!!n&&"integerValue"in n}function Qo(n){return!!n&&"arrayValue"in n}function yl(n){return!!n&&"nullValue"in n}function _l(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function xi(n){return!!n&&"mapValue"in n}function G_(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Zn(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return js(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Zn(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Zn(n.arrayValue.values[t]);return e}return Object.assign({},n)}function W_(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class Ve{constructor(e){this.value=e}static empty(){return new Ve({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!xi(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Zn(t)}setAll(e){let t=be.emptyPath(),r={},s=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=Zn(a):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());xi(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ue(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];xi(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){js(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Ve(Zn(this.value))}}/**
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
 */class Ie{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ie(e,0,$.min(),$.min(),$.min(),Ve.empty(),0)}static newFoundDocument(e,t,r,s){return new Ie(e,1,t,$.min(),r,s,0)}static newNoDocument(e,t){return new Ie(e,2,t,$.min(),$.min(),Ve.empty(),0)}static newUnknownDocument(e,t){return new Ie(e,3,t,$.min(),$.min(),Ve.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual($.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ve.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ve.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=$.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ie&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ie(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Rs{constructor(e,t){this.position=e,this.inclusive=t}}function vl(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=U.comparator(U.fromName(a.referenceValue),t.key):r=gn(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Il(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Ue(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Ps{constructor(e,t="asc"){this.field=e,this.dir=t}}function K_(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Qh{}class ce extends Qh{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new J_(e,t,r):t==="array-contains"?new Z_(e,r):t==="in"?new ev(e,r):t==="not-in"?new tv(e,r):t==="array-contains-any"?new nv(e,r):new ce(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new Y_(e,r):new X_(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(gn(t,this.value)):t!==null&&$t(this.value)===$t(t)&&this.matchesComparison(gn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return j()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Be extends Qh{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Be(e,t)}matches(e){return Jh(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Jh(n){return n.op==="and"}function Yh(n){return Q_(n)&&Jh(n)}function Q_(n){for(const e of n.filters)if(e instanceof Be)return!1;return!0}function fo(n){if(n instanceof ce)return n.field.canonicalString()+n.op.toString()+yn(n.value);if(Yh(n))return n.filters.map(e=>fo(e)).join(",");{const e=n.filters.map(t=>fo(t)).join(",");return`${n.op}(${e})`}}function Xh(n,e){return n instanceof ce?function(r,s){return s instanceof ce&&r.op===s.op&&r.field.isEqual(s.field)&&Ue(r.value,s.value)}(n,e):n instanceof Be?function(r,s){return s instanceof Be&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,c)=>i&&Xh(a,s.filters[c]),!0):!1}(n,e):void j()}function Zh(n){return n instanceof ce?function(t){return`${t.field.canonicalString()} ${t.op} ${yn(t.value)}`}(n):n instanceof Be?function(t){return t.op.toString()+" {"+t.getFilters().map(Zh).join(" ,")+"}"}(n):"Filter"}class J_ extends ce{constructor(e,t,r){super(e,t,r),this.key=U.fromName(r.referenceValue)}matches(e){const t=U.comparator(e.key,this.key);return this.matchesComparison(t)}}class Y_ extends ce{constructor(e,t){super(e,"in",t),this.keys=ed("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class X_ extends ce{constructor(e,t){super(e,"not-in",t),this.keys=ed("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function ed(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>U.fromName(r.referenceValue))}class Z_ extends ce{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Qo(t)&&pr(t.arrayValue,this.value)}}class ev extends ce{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&pr(this.value.arrayValue,t)}}class tv extends ce{constructor(e,t){super(e,"not-in",t)}matches(e){if(pr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!pr(this.value.arrayValue,t)}}class nv extends ce{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Qo(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>pr(this.value.arrayValue,r))}}/**
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
 */class rv{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.ue=null}}function El(n,e=null,t=[],r=[],s=null,i=null,a=null){return new rv(n,e,t,r,s,i,a)}function Jo(n){const e=W(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>fo(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Hs(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>yn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>yn(r)).join(",")),e.ue=t}return e.ue}function Yo(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!K_(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Xh(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Il(n.startAt,e.startAt)&&Il(n.endAt,e.endAt)}function po(n){return U.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class qs{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function sv(n,e,t,r,s,i,a,c){return new qs(n,e,t,r,s,i,a,c)}function zs(n){return new qs(n)}function Tl(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function iv(n){return n.collectionGroup!==null}function er(n){const e=W(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new de(be.comparator);return a.filters.forEach(u=>{u.getFlattenedFilters().forEach(d=>{d.isInequality()&&(c=c.add(d.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Ps(i,r))}),t.has(be.keyField().canonicalString())||e.ce.push(new Ps(be.keyField(),r))}return e.ce}function xe(n){const e=W(n);return e.le||(e.le=ov(e,er(n))),e.le}function ov(n,e){if(n.limitType==="F")return El(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Ps(s.field,i)});const t=n.endAt?new Rs(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Rs(n.startAt.position,n.startAt.inclusive):null;return El(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function mo(n,e,t){return new qs(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Gs(n,e){return Yo(xe(n),xe(e))&&n.limitType===e.limitType}function td(n){return`${Jo(xe(n))}|lt:${n.limitType}`}function en(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Zh(s)).join(", ")}]`),Hs(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>yn(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>yn(s)).join(",")),`Target(${r})`}(xe(n))}; limitType=${n.limitType})`}function Ws(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):U.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of er(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(a,c,u){const d=vl(a,c,u);return a.inclusive?d<=0:d<0}(r.startAt,er(r),s)||r.endAt&&!function(a,c,u){const d=vl(a,c,u);return a.inclusive?d>=0:d>0}(r.endAt,er(r),s))}(n,e)}function av(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function nd(n){return(e,t)=>{let r=!1;for(const s of er(n)){const i=cv(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function cv(n,e,t){const r=n.field.isKeyField()?U.comparator(e.key,t.key):function(i,a,c){const u=a.data.field(i),d=c.data.field(i);return u!==null&&d!==null?gn(u,d):j()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return j()}}/**
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
 */class Sn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){js(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return j_(this.inner)}size(){return this.innerSize}}/**
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
 */const lv=new ie(U.comparator);function Et(){return lv}const rd=new ie(U.comparator);function Wn(...n){let e=rd;for(const t of n)e=e.insert(t.key,t);return e}function uv(n){let e=rd;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Lt(){return tr()}function sd(){return tr()}function tr(){return new Sn(n=>n.toString(),(n,e)=>n.isEqual(e))}const hv=new de(U.comparator);function K(...n){let e=hv;for(const t of n)e=e.add(t);return e}const dv=new de(J);function fv(){return dv}/**
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
 */function pv(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:lo(e)?"-0":e}}function mv(n){return{integerValue:""+n}}/**
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
 */class Ks{constructor(){this._=void 0}}function gv(n,e,t){return n instanceof go?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Wo(i)&&(i=Ko(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(t,e):n instanceof ks?id(n,e):n instanceof Ds?od(n,e):function(s,i){const a=_v(s,i),c=wl(a)+wl(s.Pe);return ho(a)&&ho(s.Pe)?mv(c):pv(s.serializer,c)}(n,e)}function yv(n,e,t){return n instanceof ks?id(n,e):n instanceof Ds?od(n,e):t}function _v(n,e){return n instanceof yo?function(r){return ho(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class go extends Ks{}class ks extends Ks{constructor(e){super(),this.elements=e}}function id(n,e){const t=ad(e);for(const r of n.elements)t.some(s=>Ue(s,r))||t.push(r);return{arrayValue:{values:t}}}class Ds extends Ks{constructor(e){super(),this.elements=e}}function od(n,e){let t=ad(e);for(const r of n.elements)t=t.filter(s=>!Ue(s,r));return{arrayValue:{values:t}}}class yo extends Ks{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function wl(n){return se(n.integerValue||n.doubleValue)}function ad(n){return Qo(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function vv(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof ks&&s instanceof ks||r instanceof Ds&&s instanceof Ds?mn(r.elements,s.elements,Ue):r instanceof yo&&s instanceof yo?Ue(r.Pe,s.Pe):r instanceof go&&s instanceof go}(n.transform,e.transform)}class Ot{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ot}static exists(e){return new Ot(void 0,e)}static updateTime(e){return new Ot(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function hs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Xo{}function cd(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Ev(n.key,Ot.none()):new Zo(n.key,n.data,Ot.none());{const t=n.data,r=Ve.empty();let s=new de(be.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new Qs(n.key,r,new dt(s.toArray()),Ot.none())}}function Iv(n,e,t){n instanceof Zo?function(s,i,a){const c=s.value.clone(),u=Sl(s.fieldTransforms,i,a.transformResults);c.setAll(u),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof Qs?function(s,i,a){if(!hs(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=Sl(s.fieldTransforms,i,a.transformResults),u=i.data;u.setAll(ld(s)),u.setAll(c),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function nr(n,e,t,r){return n instanceof Zo?function(i,a,c,u){if(!hs(i.precondition,a))return c;const d=i.value.clone(),f=bl(i.fieldTransforms,u,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof Qs?function(i,a,c,u){if(!hs(i.precondition,a))return c;const d=bl(i.fieldTransforms,u,a),f=a.data;return f.setAll(ld(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(y=>y.field))}(n,e,t,r):function(i,a,c){return hs(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function Al(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&mn(r,s,(i,a)=>vv(i,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Zo extends Xo{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Qs extends Xo{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function ld(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Sl(n,e,t){const r=new Map;re(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,yv(a,c,t[s]))}return r}function bl(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,gv(i,a,e))}return r}class Ev extends Xo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Tv{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&Iv(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=nr(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=nr(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=sd();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const u=cd(a,c);u!==null&&r.set(s.key,u),a.isValidDocument()||a.convertToNoDocument($.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),K())}isEqual(e){return this.batchId===e.batchId&&mn(this.mutations,e.mutations,(t,r)=>Al(t,r))&&mn(this.baseMutations,e.baseMutations,(t,r)=>Al(t,r))}}/**
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
 */class wv{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class Av{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var oe,G;function ud(n){if(n===void 0)return et("GRPC error has no .code"),N.UNKNOWN;switch(n){case oe.OK:return N.OK;case oe.CANCELLED:return N.CANCELLED;case oe.UNKNOWN:return N.UNKNOWN;case oe.DEADLINE_EXCEEDED:return N.DEADLINE_EXCEEDED;case oe.RESOURCE_EXHAUSTED:return N.RESOURCE_EXHAUSTED;case oe.INTERNAL:return N.INTERNAL;case oe.UNAVAILABLE:return N.UNAVAILABLE;case oe.UNAUTHENTICATED:return N.UNAUTHENTICATED;case oe.INVALID_ARGUMENT:return N.INVALID_ARGUMENT;case oe.NOT_FOUND:return N.NOT_FOUND;case oe.ALREADY_EXISTS:return N.ALREADY_EXISTS;case oe.PERMISSION_DENIED:return N.PERMISSION_DENIED;case oe.FAILED_PRECONDITION:return N.FAILED_PRECONDITION;case oe.ABORTED:return N.ABORTED;case oe.OUT_OF_RANGE:return N.OUT_OF_RANGE;case oe.UNIMPLEMENTED:return N.UNIMPLEMENTED;case oe.DATA_LOSS:return N.DATA_LOSS;default:return j()}}(G=oe||(oe={}))[G.OK=0]="OK",G[G.CANCELLED=1]="CANCELLED",G[G.UNKNOWN=2]="UNKNOWN",G[G.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",G[G.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",G[G.NOT_FOUND=5]="NOT_FOUND",G[G.ALREADY_EXISTS=6]="ALREADY_EXISTS",G[G.PERMISSION_DENIED=7]="PERMISSION_DENIED",G[G.UNAUTHENTICATED=16]="UNAUTHENTICATED",G[G.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",G[G.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",G[G.ABORTED=10]="ABORTED",G[G.OUT_OF_RANGE=11]="OUT_OF_RANGE",G[G.UNIMPLEMENTED=12]="UNIMPLEMENTED",G[G.INTERNAL=13]="INTERNAL",G[G.UNAVAILABLE=14]="UNAVAILABLE",G[G.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function Sv(){return new TextEncoder}/**
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
 */const bv=new Vt([4294967295,4294967295],0);function Cl(n){const e=Sv().encode(n),t=new Bh;return t.update(e),new Uint8Array(t.digest())}function Rl(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Vt([t,r],0),new Vt([s,i],0)]}class ea{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Kn(`Invalid padding: ${t}`);if(r<0)throw new Kn(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Kn(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Kn(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Vt.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(Vt.fromNumber(r)));return s.compare(bv)===1&&(s=new Vt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=Cl(e),[r,s]=Rl(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new ea(i,s,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.Ie===0)return;const t=Cl(e),[r,s]=Rl(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Kn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Js{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,wr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Js($.min(),s,new ie(J),Et(),K())}}class wr{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new wr(r,t,K(),K(),K())}}/**
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
 */class ds{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class hd{constructor(e,t){this.targetId=e,this.me=t}}class dd{constructor(e,t,r=fe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Pl{constructor(){this.fe=0,this.ge=Dl(),this.pe=fe.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=K(),t=K(),r=K();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:j()}}),new wr(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Dl()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,re(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class Cv{constructor(e){this.Le=e,this.Be=new Map,this.ke=Et(),this.qe=kl(),this.Qe=new ie(J)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:j()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(po(i))if(r===0){const a=new U(i.path);this.Ue(t,a,Ie.newNoDocument(a,$.min()))}else re(r===1);else{const a=this.Ye(t);if(a!==r){const c=this.Ze(e),u=c?this.Xe(c,e,a):1;if(u!==0){this.je(t);const d=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=Bt(r).toUint8Array()}catch(u){if(u instanceof Kh)return pn("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new ea(a,s,i)}catch(u){return pn(u instanceof Kn?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.Ie===0?null:c}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const a=this.Le.tt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,a)=>{const c=this.Je(a);if(c){if(i.current&&po(c.target)){const u=new U(c.target.path);this.ke.get(u)!==null||this.it(a,u)||this.Ue(a,u,Ie.newNoDocument(u,e))}i.be&&(t.set(a,i.ve()),i.Ce())}});let r=K();this.qe.forEach((i,a)=>{let c=!0;a.forEachWhile(u=>{const d=this.Je(u);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new Js(e,t,this.Qe,this.ke,r);return this.ke=Et(),this.qe=kl(),this.Qe=new ie(J),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new Pl,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new de(J),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||O("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Pl),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function kl(){return new ie(U.comparator)}function Dl(){return new ie(U.comparator)}const Rv={asc:"ASCENDING",desc:"DESCENDING"},Pv={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},kv={and:"AND",or:"OR"};class Dv{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function _o(n,e){return n.useProto3Json||Hs(e)?e:{value:e}}function Nv(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Lv(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function cn(n){return re(!!n),$.fromTimestamp(function(t){const r=It(t);return new Ce(r.seconds,r.nanos)}(n))}function Vv(n,e){return vo(n,e).canonicalString()}function vo(n,e){const t=function(s){return new ne(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function fd(n){const e=ne.fromString(n);return re(_d(e)),e}function Fi(n,e){const t=fd(e);if(t.get(1)!==n.databaseId.projectId)throw new F(N.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new F(N.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new U(md(t))}function pd(n,e){return Vv(n.databaseId,e)}function Mv(n){const e=fd(n);return e.length===4?ne.emptyPath():md(e)}function Nl(n){return new ne(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function md(n){return re(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Ov(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:j()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(re(f===void 0||typeof f=="string"),fe.fromBase64String(f||"")):(re(f===void 0||f instanceof Buffer||f instanceof Uint8Array),fe.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(d){const f=d.code===void 0?N.UNKNOWN:ud(d.code);return new F(f,d.message||"")}(a);t=new dd(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Fi(n,r.document.name),i=cn(r.document.updateTime),a=r.document.createTime?cn(r.document.createTime):$.min(),c=new Ve({mapValue:{fields:r.document.fields}}),u=Ie.newFoundDocument(s,i,a,c),d=r.targetIds||[],f=r.removedTargetIds||[];t=new ds(d,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Fi(n,r.document),i=r.readTime?cn(r.readTime):$.min(),a=Ie.newNoDocument(s,i),c=r.removedTargetIds||[];t=new ds([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Fi(n,r.document),i=r.removedTargetIds||[];t=new ds([],i,s,null)}else{if(!("filter"in e))return j();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new Av(s,i),c=r.targetId;t=new hd(c,a)}}return t}function xv(n,e){return{documents:[pd(n,e.path)]}}function Fv(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=pd(n,s);const i=function(d){if(d.length!==0)return yd(Be.create(d,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(I){return{field:tn(I.field),direction:$v(I.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=_o(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:s}}function Uv(n){let e=Mv(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){re(r===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(y){const I=gd(y);return I instanceof Be&&Yh(I)?I.getFilters():[I]}(t.where));let a=[];t.orderBy&&(a=function(y){return y.map(I=>function(P){return new Ps(nn(P.field),function(k){switch(k){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(P.direction))}(I))}(t.orderBy));let c=null;t.limit&&(c=function(y){let I;return I=typeof y=="object"?y.value:y,Hs(I)?null:I}(t.limit));let u=null;t.startAt&&(u=function(y){const I=!!y.before,S=y.values||[];return new Rs(S,I)}(t.startAt));let d=null;return t.endAt&&(d=function(y){const I=!y.before,S=y.values||[];return new Rs(S,I)}(t.endAt)),sv(e,s,a,i,c,"F",u,d)}function Bv(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return j()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function gd(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=nn(t.unaryFilter.field);return ce.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=nn(t.unaryFilter.field);return ce.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=nn(t.unaryFilter.field);return ce.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=nn(t.unaryFilter.field);return ce.create(a,"!=",{nullValue:"NULL_VALUE"});default:return j()}}(n):n.fieldFilter!==void 0?function(t){return ce.create(nn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return j()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Be.create(t.compositeFilter.filters.map(r=>gd(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return j()}}(t.compositeFilter.op))}(n):j()}function $v(n){return Rv[n]}function Hv(n){return Pv[n]}function jv(n){return kv[n]}function tn(n){return{fieldPath:n.canonicalString()}}function nn(n){return be.fromServerFormat(n.fieldPath)}function yd(n){return n instanceof ce?function(t){if(t.op==="=="){if(_l(t.value))return{unaryFilter:{field:tn(t.field),op:"IS_NAN"}};if(yl(t.value))return{unaryFilter:{field:tn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(_l(t.value))return{unaryFilter:{field:tn(t.field),op:"IS_NOT_NAN"}};if(yl(t.value))return{unaryFilter:{field:tn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:tn(t.field),op:Hv(t.op),value:t.value}}}(n):n instanceof Be?function(t){const r=t.getFilters().map(s=>yd(s));return r.length===1?r[0]:{compositeFilter:{op:jv(t.op),filters:r}}}(n):j()}function _d(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */class ft{constructor(e,t,r,s,i=$.min(),a=$.min(),c=fe.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new ft(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ft(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ft(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ft(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class qv{constructor(e){this.ct=e}}function zv(n){const e=Uv({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?mo(e,e.limit,"L"):e}/**
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
 */class Gv{constructor(){this.un=new Wv}addToCollectionParentIndex(e,t){return this.un.add(t),R.resolve()}getCollectionParents(e,t){return R.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return R.resolve()}deleteFieldIndex(e,t){return R.resolve()}deleteAllFieldIndexes(e){return R.resolve()}createTargetIndexes(e,t){return R.resolve()}getDocumentsMatchingTarget(e,t){return R.resolve(null)}getIndexType(e,t){return R.resolve(0)}getFieldIndexes(e,t){return R.resolve([])}getNextCollectionGroupToUpdate(e){return R.resolve(null)}getMinOffset(e,t){return R.resolve(vt.min())}getMinOffsetFromCollectionGroup(e,t){return R.resolve(vt.min())}updateCollectionGroup(e,t,r){return R.resolve()}updateIndexEntries(e,t){return R.resolve()}}class Wv{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new de(ne.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new de(ne.comparator)).toArray()}}/**
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
 */class _n{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new _n(0)}static kn(){return new _n(-1)}}/**
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
 */class Kv{constructor(){this.changes=new Sn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ie.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?R.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class Qv{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class Jv{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&nr(r.mutation,s,dt.empty(),Ce.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,K()).next(()=>r))}getLocalViewOfDocuments(e,t,r=K()){const s=Lt();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let a=Wn();return i.forEach((c,u)=>{a=a.insert(c,u.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=Lt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,K()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,s){let i=Et();const a=tr(),c=function(){return tr()}();return t.forEach((u,d)=>{const f=r.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof Qs)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),nr(f.mutation,d,f.mutation.getFieldMask(),Ce.now())):a.set(d.key,dt.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var y;return c.set(d,new Qv(f,(y=a.get(d))!==null&&y!==void 0?y:null))}),c))}recalculateAndSaveOverlays(e,t){const r=tr();let s=new ie((a,c)=>a-c),i=K();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(u=>{const d=t.get(u);if(d===null)return;let f=r.get(u)||dt.empty();f=c.applyToLocalView(d,f),r.set(u,f);const y=(s.get(c.batchId)||K()).add(u);s=s.insert(c.batchId,y)})}).next(()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),d=u.key,f=u.value,y=sd();f.forEach(I=>{if(!i.has(I)){const S=cd(t.get(I),r.get(I));S!==null&&y.set(I,S),i=i.add(I)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,y))}return R.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(a){return U.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):iv(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):R.resolve(Lt());let c=-1,u=i;return a.next(d=>R.forEach(d,(f,y)=>(c<y.largestBatchId&&(c=y.largestBatchId),i.get(f)?R.resolve():this.remoteDocumentCache.getEntry(e,f).next(I=>{u=u.insert(f,I)}))).next(()=>this.populateOverlays(e,d,i)).next(()=>this.computeViews(e,u,d,K())).next(f=>({batchId:c,changes:uv(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new U(t)).next(r=>{let s=Wn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=Wn();return this.indexManager.getCollectionParents(e,i).next(c=>R.forEach(c,u=>{const d=function(y,I){return new qs(I,null,y.explicitOrderBy.slice(),y.filters.slice(),y.limit,y.limitType,y.startAt,y.endAt)}(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next(f=>{f.forEach((y,I)=>{a=a.insert(y,I)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(a=>{i.forEach((u,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,Ie.newInvalidDocument(f)))});let c=Wn();return a.forEach((u,d)=>{const f=i.get(u);f!==void 0&&nr(f.mutation,d,dt.empty(),Ce.now()),Ws(t,d)&&(c=c.insert(u,d))}),c})}}/**
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
 */class Yv{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return R.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:cn(s.createTime)}}(t)),R.resolve()}getNamedQuery(e,t){return R.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:zv(s.bundledQuery),readTime:cn(s.readTime)}}(t)),R.resolve()}}/**
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
 */class Xv{constructor(){this.overlays=new ie(U.comparator),this.Ir=new Map}getOverlay(e,t){return R.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Lt();return R.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),R.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),R.resolve()}getOverlaysForCollection(e,t,r){const s=Lt(),i=t.length+1,a=new U(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const u=c.getNext().value,d=u.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return R.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new ie((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=i.get(d.largestBatchId);f===null&&(f=Lt(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const c=Lt(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((d,f)=>c.set(d,f)),!(c.size()>=s)););return R.resolve(c)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new wv(t,r));let i=this.Ir.get(t);i===void 0&&(i=K(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
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
 */class Zv{constructor(){this.sessionToken=fe.EMPTY_BYTE_STRING}getSessionToken(e){return R.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,R.resolve()}}/**
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
 */class ta{constructor(){this.Tr=new de(le.Er),this.dr=new de(le.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new le(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new le(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new U(new ne([])),r=new le(t,e),s=new le(t,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new U(new ne([])),r=new le(t,e),s=new le(t,e+1);let i=K();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const t=new le(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class le{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return U.comparator(e.key,t.key)||J(e.wr,t.wr)}static Ar(e,t){return J(e.wr,t.wr)||U.comparator(e.key,t.key)}}/**
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
 */class eI{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new de(le.Er)}checkEmpty(e){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Tv(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.br=this.br.add(new le(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return R.resolve(a)}lookupMutationBatch(e,t){return R.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return R.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new le(t,0),s=new le(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const c=this.Dr(a.wr);i.push(c)}),R.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(J);return t.forEach(s=>{const i=new le(s,0),a=new le(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],c=>{r=r.add(c.wr)})}),R.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;U.isDocumentKey(i)||(i=i.child(""));const a=new le(new U(i),0);let c=new de(J);return this.br.forEachWhile(u=>{const d=u.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(c=c.add(u.wr)),!0)},a),R.resolve(this.Cr(c))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){re(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return R.forEach(t.mutations,s=>{const i=new le(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new le(t,0),s=this.br.firstAfterOrEqual(r);return R.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,R.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class tI{constructor(e){this.Mr=e,this.docs=function(){return new ie(U.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return R.resolve(r?r.document.mutableCopy():Ie.newInvalidDocument(t))}getEntries(e,t){let r=Et();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ie.newInvalidDocument(s))}),R.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=Et();const a=t.path,c=new U(a.child("")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:d,value:{document:f}}=u.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||U_(F_(f),r)<=0||(s.has(f.key)||Ws(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return R.resolve(i)}getAllFromCollectionGroup(e,t,r,s){j()}Or(e,t){return R.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new nI(this)}getSize(e){return R.resolve(this.size)}}class nI extends Kv{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),R.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
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
 */class rI{constructor(e){this.persistence=e,this.Nr=new Sn(t=>Jo(t),Yo),this.lastRemoteSnapshotVersion=$.min(),this.highestTargetId=0,this.Lr=0,this.Br=new ta,this.targetCount=0,this.kr=_n.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),R.resolve()}getLastRemoteSnapshotVersion(e){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return R.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),R.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new _n(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,R.resolve()}updateTargetData(e,t){return this.Kn(t),R.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,R.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),R.waitFor(i).next(()=>s)}getTargetCount(e){return R.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return R.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),R.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),R.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),R.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return R.resolve(r)}containsKey(e,t){return R.resolve(this.Br.containsKey(t))}}/**
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
 */class sI{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Go(0),this.Kr=!1,this.Kr=!0,this.$r=new Zv,this.referenceDelegate=e(this),this.Ur=new rI(this),this.indexManager=new Gv,this.remoteDocumentCache=function(s){return new tI(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new qv(t),this.Gr=new Yv(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Xv,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new eI(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){O("MemoryPersistence","Starting transaction:",e);const s=new iI(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return R.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class iI extends $_{constructor(e){super(),this.currentSequenceNumber=e}}class na{constructor(e){this.persistence=e,this.Jr=new ta,this.Yr=null}static Zr(e){return new na(e)}get Xr(){if(this.Yr)return this.Yr;throw j()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),R.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),R.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),R.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.Xr,r=>{const s=U.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,$.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return R.or([()=>R.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
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
 */class ra{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=K(),s=K();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new ra(e,t.fromCache,r,s)}}/**
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
 */class oI{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class aI{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return hm()?8:H_(Ee())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new oI;return this.Xi(e,t,a).next(c=>{if(i.result=c,this.zi)return this.es(e,t,a,c.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(jn()<=z.DEBUG&&O("QueryEngine","SDK will not create cache indexes for query:",en(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),R.resolve()):(jn()<=z.DEBUG&&O("QueryEngine","Query:",en(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(jn()<=z.DEBUG&&O("QueryEngine","The SDK decides to create cache indexes for query:",en(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xe(t))):R.resolve())}Yi(e,t){if(Tl(t))return R.resolve(null);let r=xe(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=mo(t,null,"F"),r=xe(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=K(...i);return this.Ji.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{const d=this.ts(t,c);return this.ns(t,d,a,u.readTime)?this.Yi(e,mo(t,null,"F")):this.rs(e,d,t,u)}))})))}Zi(e,t,r,s){return Tl(t)||s.isEqual($.min())?R.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(t,i);return this.ns(t,a,r,s)?R.resolve(null):(jn()<=z.DEBUG&&O("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),en(t)),this.rs(e,a,t,x_(s,-1)).next(c=>c))})}ts(e,t){let r=new de(nd(e));return t.forEach((s,i)=>{Ws(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return jn()<=z.DEBUG&&O("QueryEngine","Using full collection scan to execute query:",en(t)),this.Ji.getDocumentsMatchingQuery(e,t,vt.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
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
 */class cI{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new ie(J),this._s=new Sn(i=>Jo(i),Yo),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Jv(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function lI(n,e,t,r){return new cI(n,e,t,r)}async function vd(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],c=[];let u=K();for(const d of s){a.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}for(const d of i){c.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:c}))})})}function Id(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function uI(n,e){const t=W(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const c=[];e.targetChanges.forEach((f,y)=>{const I=s.get(y);if(!I)return;c.push(t.Ur.removeMatchingKeys(i,f.removedDocuments,y).next(()=>t.Ur.addMatchingKeys(i,f.addedDocuments,y)));let S=I.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(y)!==null?S=S.withResumeToken(fe.EMPTY_BYTE_STRING,$.min()).withLastLimboFreeSnapshotVersion($.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),s=s.insert(y,S),function(C,k,V){return C.resumeToken.approximateByteSize()===0||k.snapshotVersion.toMicroseconds()-C.snapshotVersion.toMicroseconds()>=3e8?!0:V.addedDocuments.size+V.modifiedDocuments.size+V.removedDocuments.size>0}(I,S,f)&&c.push(t.Ur.updateTargetData(i,S))});let u=Et(),d=K();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),c.push(hI(i,a,e.documentUpdates).next(f=>{u=f.Ps,d=f.Is})),!r.isEqual($.min())){const f=t.Ur.getLastRemoteSnapshotVersion(i).next(y=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(f)}return R.waitFor(c).next(()=>a.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,u,d)).next(()=>u)}).then(i=>(t.os=s,i))}function hI(n,e,t){let r=K(),s=K();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let a=Et();return t.forEach((c,u)=>{const d=i.get(c);u.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual($.min())?(e.removeEntry(c,u.readTime),a=a.insert(c,u)):!d.isValidDocument()||u.version.compareTo(d.version)>0||u.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(u),a=a.insert(c,u)):O("LocalStore","Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",u.version)}),{Ps:a,Is:s}})}function dI(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,R.resolve(s)):t.Ur.allocateTargetId(r).next(a=>(s=new ft(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function Io(n,e,t){const r=W(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Tr(a))throw a;O("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Ll(n,e,t){const r=W(n);let s=$.min(),i=K();return r.persistence.runTransaction("Execute query","readwrite",a=>function(u,d,f){const y=W(u),I=y._s.get(f);return I!==void 0?R.resolve(y.os.get(I)):y.Ur.getTargetData(d,f)}(r,a,xe(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,c.targetId).next(u=>{i=u})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?s:$.min(),t?i:K())).next(c=>(fI(r,av(e),c),{documents:c,Ts:i})))}function fI(n,e,t){let r=n.us.get(e)||$.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}class Vl{constructor(){this.activeTargetIds=fv()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class pI{constructor(){this.so=new Vl,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Vl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class mI{_o(e){}shutdown(){}}/**
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
 */class Ml{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){O("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){O("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let es=null;function Ui(){return es===null?es=function(){return 268435456+Math.round(2147483648*Math.random())}():es++,"0x"+es.toString(16)}/**
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
 */const gI={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
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
 */class yI{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
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
 */const _e="WebChannelConnection";class _I extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,a){const c=Ui(),u=this.xo(t,r.toUriEncodedString());O("RestConnection",`Sending RPC '${t}' ${c}:`,u,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,i,a),this.No(t,u,d,s).then(f=>(O("RestConnection",`Received RPC '${t}' ${c}: `,f),f),f=>{throw pn("RestConnection",`RPC '${t}' ${c} failed with error: `,f,"url: ",u,"request:",s),f})}Lo(t,r,s,i,a,c){return this.Mo(t,r,s,i,a)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+An}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>t[a]=i),s&&s.headers.forEach((i,a)=>t[a]=i)}xo(t,r){const s=gI[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=Ui();return new Promise((a,c)=>{const u=new $h;u.setWithCredentials(!0),u.listenOnce(Hh.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case us.NO_ERROR:const f=u.getResponseJson();O(_e,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(f)),a(f);break;case us.TIMEOUT:O(_e,`RPC '${e}' ${i} timed out`),c(new F(N.DEADLINE_EXCEEDED,"Request time out"));break;case us.HTTP_ERROR:const y=u.getStatus();if(O(_e,`RPC '${e}' ${i} failed with status:`,y,"response text:",u.getResponseText()),y>0){let I=u.getResponseJson();Array.isArray(I)&&(I=I[0]);const S=I==null?void 0:I.error;if(S&&S.status&&S.message){const P=function(k){const V=k.toLowerCase().replace(/_/g,"-");return Object.values(N).indexOf(V)>=0?V:N.UNKNOWN}(S.status);c(new F(P,S.message))}else c(new F(N.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new F(N.UNAVAILABLE,"Connection failed."));break;default:j()}}finally{O(_e,`RPC '${e}' ${i} completed.`)}});const d=JSON.stringify(s);O(_e,`RPC '${e}' ${i} sending request:`,s),u.send(t,"POST",d,r,15)})}Bo(e,t,r){const s=Ui(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=zh(),c=qh(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(u.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const f=i.join("");O(_e,`Creating RPC '${e}' stream ${s}: ${f}`,u);const y=a.createWebChannel(f,u);let I=!1,S=!1;const P=new yI({Io:k=>{S?O(_e,`Not sending because RPC '${e}' stream ${s} is closed:`,k):(I||(O(_e,`Opening RPC '${e}' stream ${s} transport.`),y.open(),I=!0),O(_e,`RPC '${e}' stream ${s} sending:`,k),y.send(k))},To:()=>y.close()}),C=(k,V,H)=>{k.listen(V,q=>{try{H(q)}catch(L){setTimeout(()=>{throw L},0)}})};return C(y,Gn.EventType.OPEN,()=>{S||(O(_e,`RPC '${e}' stream ${s} transport opened.`),P.yo())}),C(y,Gn.EventType.CLOSE,()=>{S||(S=!0,O(_e,`RPC '${e}' stream ${s} transport closed`),P.So())}),C(y,Gn.EventType.ERROR,k=>{S||(S=!0,pn(_e,`RPC '${e}' stream ${s} transport errored:`,k),P.So(new F(N.UNAVAILABLE,"The operation could not be completed")))}),C(y,Gn.EventType.MESSAGE,k=>{var V;if(!S){const H=k.data[0];re(!!H);const q=H,L=q.error||((V=q[0])===null||V===void 0?void 0:V.error);if(L){O(_e,`RPC '${e}' stream ${s} received error:`,L);const x=L.status;let M=function(m){const v=oe[m];if(v!==void 0)return ud(v)}(x),E=L.message;M===void 0&&(M=N.INTERNAL,E="Unknown error status: "+x+" with message "+L.message),S=!0,P.So(new F(M,E)),y.close()}else O(_e,`RPC '${e}' stream ${s} received:`,H),P.bo(H)}}),C(c,jh.STAT_EVENT,k=>{k.stat===co.PROXY?O(_e,`RPC '${e}' stream ${s} detected buffering proxy`):k.stat===co.NOPROXY&&O(_e,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{P.wo()},0),P}}function Bi(){return typeof document<"u"?document:null}/**
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
 */function Ed(n){return new Dv(n,!0)}/**
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
 */class Td{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&O("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class vI{constructor(e,t,r,s,i,a,c,u){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Td(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===N.RESOURCE_EXHAUSTED?(et(t.toString()),et("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===N.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new F(N.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return O("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(O("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class II extends vI{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=Ov(this.serializer,e),r=function(i){if(!("targetChange"in i))return $.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?$.min():a.readTime?cn(a.readTime):$.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=Nl(this.serializer),t.addTarget=function(i,a){let c;const u=a.target;if(c=po(u)?{documents:xv(i,u)}:{query:Fv(i,u)._t},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Lv(i,a.resumeToken);const d=_o(i,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo($.min())>0){c.readTime=Nv(i,a.snapshotVersion.toTimestamp());const d=_o(i,a.expectedCount);d!==null&&(c.expectedCount=d)}return c}(this.serializer,e);const r=Bv(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=Nl(this.serializer),t.removeTarget=e,this.a_(t)}}/**
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
 */class EI extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new F(N.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,vo(t,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new F(N.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Lo(e,vo(t,r),s,a,c,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new F(N.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class TI{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(et(t),this.D_=!1):O("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class wI{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{Sr(this)&&(O("RemoteStore","Restarting streams for network reachability change."),await async function(u){const d=W(u);d.L_.add(4),await Ar(d),d.q_.set("Unknown"),d.L_.delete(4),await Ys(d)}(this))})}),this.q_=new TI(r,s)}}async function Ys(n){if(Sr(n))for(const e of n.B_)await e(!0)}async function Ar(n){for(const e of n.B_)await e(!1)}function wd(n,e){const t=W(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),aa(t)?oa(t):bn(t).r_()&&ia(t,e))}function sa(n,e){const t=W(n),r=bn(t);t.N_.delete(e),r.r_()&&Ad(t,e),t.N_.size===0&&(r.r_()?r.o_():Sr(t)&&t.q_.set("Unknown"))}function ia(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo($.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}bn(n).A_(e)}function Ad(n,e){n.Q_.xe(e),bn(n).R_(e)}function oa(n){n.Q_=new Cv({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),bn(n).start(),n.q_.v_()}function aa(n){return Sr(n)&&!bn(n).n_()&&n.N_.size>0}function Sr(n){return W(n).L_.size===0}function Sd(n){n.Q_=void 0}async function AI(n){n.q_.set("Online")}async function SI(n){n.N_.forEach((e,t)=>{ia(n,e)})}async function bI(n,e){Sd(n),aa(n)?(n.q_.M_(e),oa(n)):n.q_.set("Unknown")}async function CI(n,e,t){if(n.q_.set("Online"),e instanceof dd&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const c of i.targetIds)s.N_.has(c)&&(await s.remoteSyncer.rejectListen(c,a),s.N_.delete(c),s.Q_.removeTarget(c))}(n,e)}catch(r){O("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Ol(n,r)}else if(e instanceof ds?n.Q_.Ke(e):e instanceof hd?n.Q_.He(e):n.Q_.We(e),!t.isEqual($.min()))try{const r=await Id(n.localStore);t.compareTo(r)>=0&&await function(i,a){const c=i.Q_.rt(a);return c.targetChanges.forEach((u,d)=>{if(u.resumeToken.approximateByteSize()>0){const f=i.N_.get(d);f&&i.N_.set(d,f.withResumeToken(u.resumeToken,a))}}),c.targetMismatches.forEach((u,d)=>{const f=i.N_.get(u);if(!f)return;i.N_.set(u,f.withResumeToken(fe.EMPTY_BYTE_STRING,f.snapshotVersion)),Ad(i,u);const y=new ft(f.target,u,d,f.sequenceNumber);ia(i,y)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){O("RemoteStore","Failed to raise snapshot:",r),await Ol(n,r)}}async function Ol(n,e,t){if(!Tr(e))throw e;n.L_.add(1),await Ar(n),n.q_.set("Offline"),t||(t=()=>Id(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{O("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Ys(n)})}async function xl(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),O("RemoteStore","RemoteStore received new credentials");const r=Sr(t);t.L_.add(3),await Ar(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Ys(t)}async function RI(n,e){const t=W(n);e?(t.L_.delete(2),await Ys(t)):e||(t.L_.add(2),await Ar(t),t.q_.set("Unknown"))}function bn(n){return n.K_||(n.K_=function(t,r,s){const i=W(t);return i.w_(),new II(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:AI.bind(null,n),Ro:SI.bind(null,n),mo:bI.bind(null,n),d_:CI.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),aa(n)?oa(n):n.q_.set("Unknown")):(await n.K_.stop(),Sd(n))})),n.K_}/**
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
 */class ca{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Mt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new ca(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new F(N.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function bd(n,e){if(et("AsyncQueue",`${e}: ${n}`),Tr(n))return new F(N.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class ln{constructor(e){this.comparator=e?(t,r)=>e(t,r)||U.comparator(t.key,r.key):(t,r)=>U.comparator(t.key,r.key),this.keyedMap=Wn(),this.sortedSet=new ie(this.comparator)}static emptySet(e){return new ln(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof ln)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new ln;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Fl{constructor(){this.W_=new ie(U.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):j():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class vn{constructor(e,t,r,s,i,a,c,u,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new vn(e,t,ln.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Gs(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class PI{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class kI{constructor(){this.queries=Ul(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=W(t),i=s.queries;s.queries=Ul(),i.forEach((a,c)=>{for(const u of c.j_)u.onError(r)})})(this,new F(N.ABORTED,"Firestore shutting down"))}}function Ul(){return new Sn(n=>td(n),Gs)}async function Cd(n,e){const t=W(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new PI,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=bd(a,`Initialization of query '${en(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&la(t)}async function Rd(n,e){const t=W(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function DI(n,e){const t=W(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.j_)c.X_(s)&&(r=!0);a.z_=s}}r&&la(t)}function NI(n,e,t){const r=W(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function la(n){n.Y_.forEach(e=>{e.next()})}var Eo,Bl;(Bl=Eo||(Eo={})).ea="default",Bl.Cache="cache";class Pd{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new vn(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=vn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Eo.Cache}}/**
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
 */class kd{constructor(e){this.key=e}}class Dd{constructor(e){this.key=e}}class LI{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=K(),this.mutatedKeys=K(),this.Aa=nd(e),this.Ra=new ln(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Fl,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,y)=>{const I=s.get(f),S=Ws(this.query,y)?y:null,P=!!I&&this.mutatedKeys.has(I.key),C=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let k=!1;I&&S?I.data.isEqual(S.data)?P!==C&&(r.track({type:3,doc:S}),k=!0):this.ga(I,S)||(r.track({type:2,doc:S}),k=!0,(u&&this.Aa(S,u)>0||d&&this.Aa(S,d)<0)&&(c=!0)):!I&&S?(r.track({type:0,doc:S}),k=!0):I&&!S&&(r.track({type:1,doc:I}),k=!0,(u||d)&&(c=!0)),k&&(S?(a=a.add(S),i=C?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:c,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,y)=>function(S,P){const C=k=>{switch(k){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return j()}};return C(S)-C(P)}(f.type,y.type)||this.Aa(f.doc,y.doc)),this.pa(r),s=s!=null&&s;const c=t&&!s?this.ya():[],u=this.da.size===0&&this.current&&!s?1:0,d=u!==this.Ea;return this.Ea=u,a.length!==0||d?{snapshot:new vn(this.query,e.Ra,i,a,e.mutatedKeys,u===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:c}:{wa:c}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Fl,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=K(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new Dd(r))}),this.da.forEach(r=>{e.has(r)||t.push(new kd(r))}),t}ba(e){this.Ta=e.Ts,this.da=K();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return vn.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class VI{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class MI{constructor(e){this.key=e,this.va=!1}}class OI{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Sn(c=>td(c),Gs),this.Ma=new Map,this.xa=new Set,this.Oa=new ie(U.comparator),this.Na=new Map,this.La=new ta,this.Ba={},this.ka=new Map,this.qa=_n.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function xI(n,e,t=!0){const r=Od(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await Nd(r,e,t,!0),s}async function FI(n,e){const t=Od(n);await Nd(t,e,!0,!1)}async function Nd(n,e,t,r){const s=await dI(n.localStore,xe(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await UI(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&wd(n.remoteStore,s),c}async function UI(n,e,t,r,s){n.Ka=(y,I,S)=>async function(C,k,V,H){let q=k.view.ma(V);q.ns&&(q=await Ll(C.localStore,k.query,!1).then(({documents:E})=>k.view.ma(E,q)));const L=H&&H.targetChanges.get(k.targetId),x=H&&H.targetMismatches.get(k.targetId)!=null,M=k.view.applyChanges(q,C.isPrimaryClient,L,x);return Hl(C,k.targetId,M.wa),M.snapshot}(n,y,I,S);const i=await Ll(n.localStore,e,!0),a=new LI(e,i.Ts),c=a.ma(i.documents),u=wr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(c,n.isPrimaryClient,u);Hl(n,t,d.wa);const f=new VI(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function BI(n,e,t){const r=W(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!Gs(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Io(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&sa(r.remoteStore,s.targetId),To(r,s.targetId)}).catch(zo)):(To(r,s.targetId),await Io(r.localStore,s.targetId,!0))}async function $I(n,e){const t=W(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),sa(t.remoteStore,r.targetId))}async function Ld(n,e){const t=W(n);try{const r=await uI(t.localStore,e);e.targetChanges.forEach((s,i)=>{const a=t.Na.get(i);a&&(re(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?re(a.va):s.removedDocuments.size>0&&(re(a.va),a.va=!1))}),await Md(t,r,e)}catch(r){await zo(r)}}function $l(n,e,t){const r=W(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,a)=>{const c=a.view.Z_(e);c.snapshot&&s.push(c.snapshot)}),function(a,c){const u=W(a);u.onlineState=c;let d=!1;u.queries.forEach((f,y)=>{for(const I of y.j_)I.Z_(c)&&(d=!0)}),d&&la(u)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function HI(n,e,t){const r=W(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new ie(U.comparator);a=a.insert(i,Ie.newNoDocument(i,$.min()));const c=K().add(i),u=new Js($.min(),new Map,new ie(J),a,c);await Ld(r,u),r.Oa=r.Oa.remove(i),r.Na.delete(e),ua(r)}else await Io(r.localStore,e,!1).then(()=>To(r,e,t)).catch(zo)}function To(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||Vd(n,r)})}function Vd(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(sa(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),ua(n))}function Hl(n,e,t){for(const r of t)r instanceof kd?(n.La.addReference(r.key,e),jI(n,r)):r instanceof Dd?(O("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||Vd(n,r.key)):j()}function jI(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(O("SyncEngine","New document in limbo: "+t),n.xa.add(r),ua(n))}function ua(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new U(ne.fromString(e)),r=n.qa.next();n.Na.set(r,new MI(t)),n.Oa=n.Oa.insert(t,r),wd(n.remoteStore,new ft(xe(zs(t.path)),r,"TargetPurposeLimboResolution",Go.oe))}}async function Md(n,e,t){const r=W(n),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((c,u)=>{a.push(r.Ka(u,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const y=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,y?"current":"not-current")}if(d){s.push(d);const y=ra.Wi(u.targetId,d);i.push(y)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(u,d){const f=W(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",y=>R.forEach(d,I=>R.forEach(I.$i,S=>f.persistence.referenceDelegate.addReference(y,I.targetId,S)).next(()=>R.forEach(I.Ui,S=>f.persistence.referenceDelegate.removeReference(y,I.targetId,S)))))}catch(y){if(!Tr(y))throw y;O("LocalStore","Failed to update sequence numbers: "+y)}for(const y of d){const I=y.targetId;if(!y.fromCache){const S=f.os.get(I),P=S.snapshotVersion,C=S.withLastLimboFreeSnapshotVersion(P);f.os=f.os.insert(I,C)}}}(r.localStore,i))}async function qI(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){O("SyncEngine","User change. New user:",e.toKey());const r=await vd(t.localStore,e);t.currentUser=e,function(i,a){i.ka.forEach(c=>{c.forEach(u=>{u.reject(new F(N.CANCELLED,a))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Md(t,r.hs)}}function zI(n,e){const t=W(n),r=t.Na.get(e);if(r&&r.va)return K().add(r.key);{let s=K();const i=t.Ma.get(e);if(!i)return s;for(const a of i){const c=t.Fa.get(a);s=s.unionWith(c.view.Va)}return s}}function Od(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ld.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=zI.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=HI.bind(null,e),e.Ca.d_=DI.bind(null,e.eventManager),e.Ca.$a=NI.bind(null,e.eventManager),e}class Ns{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ed(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return lI(this.persistence,new aI,e.initialUser,this.serializer)}Ga(e){return new sI(na.Zr,this.serializer)}Wa(e){return new pI}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ns.provider={build:()=>new Ns};class wo{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>$l(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=qI.bind(null,this.syncEngine),await RI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new kI}()}createDatastore(e){const t=Ed(e.databaseInfo.databaseId),r=function(i){return new _I(i)}(e.databaseInfo);return function(i,a,c,u){return new EI(i,a,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,a,c){return new wI(r,s,i,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>$l(this.syncEngine,t,0),function(){return Ml.D()?new Ml:new mI}())}createSyncEngine(e,t){return function(s,i,a,c,u,d,f){const y=new OI(s,i,a,c,u,d);return f&&(y.Qa=!0),y}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=W(s);O("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Ar(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}wo.provider={build:()=>new wo};/**
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
 */class xd{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):et("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */class GI{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=ve.UNAUTHENTICATED,this.clientId=Wh.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{O("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(O("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Mt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=bd(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function $i(n,e){n.asyncQueue.verifyOperationInProgress(),O("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await vd(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function jl(n,e){n.asyncQueue.verifyOperationInProgress();const t=await WI(n);O("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>xl(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>xl(e.remoteStore,s)),n._onlineComponents=e}async function WI(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){O("FirestoreClient","Using user provided OfflineComponentProvider");try{await $i(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===N.FAILED_PRECONDITION||s.code===N.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;pn("Error using user provided cache. Falling back to memory cache: "+t),await $i(n,new Ns)}}else O("FirestoreClient","Using default OfflineComponentProvider"),await $i(n,new Ns);return n._offlineComponents}async function KI(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(O("FirestoreClient","Using user provided OnlineComponentProvider"),await jl(n,n._uninitializedComponentsProvider._online)):(O("FirestoreClient","Using default OnlineComponentProvider"),await jl(n,new wo))),n._onlineComponents}async function Ao(n){const e=await KI(n),t=e.eventManager;return t.onListen=xI.bind(null,e.syncEngine),t.onUnlisten=BI.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=FI.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=$I.bind(null,e.syncEngine),t}function QI(n,e,t={}){const r=new Mt;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,c,u,d){const f=new xd({next:I=>{f.Za(),a.enqueueAndForget(()=>Rd(i,y));const S=I.docs.has(c);!S&&I.fromCache?d.reject(new F(N.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&I.fromCache&&u&&u.source==="server"?d.reject(new F(N.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(I)},error:I=>d.reject(I)}),y=new Pd(zs(c.path),f,{includeMetadataChanges:!0,_a:!0});return Cd(i,y)}(await Ao(n),n.asyncQueue,e,t,r)),r.promise}/**
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
 */function Fd(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const ql=new Map;/**
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
 */function JI(n,e,t){if(!t)throw new F(N.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function YI(n,e,t,r){if(e===!0&&r===!0)throw new F(N.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function zl(n){if(!U.isDocumentKey(n))throw new F(N.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function XI(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":j()}function un(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new F(N.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=XI(n);throw new F(N.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */class Gl{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new F(N.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new F(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}YI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Fd((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new F(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new F(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new F(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ha{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Gl({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new F(N.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new F(N.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Gl(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new R_;switch(r.type){case"firstParty":return new N_(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new F(N.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=ql.get(t);r&&(O("ComponentProvider","Removing Datastore"),ql.delete(t),r.terminate())}(this),Promise.resolve()}}function ZI(n,e,t,r={}){var s;const i=(n=un(n,ha))._getSettings(),a=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&pn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let c,u;if(typeof r.mockUserToken=="string")c=r.mockUserToken,u=ve.MOCK_USER;else{c=sm(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new F(N.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new ve(d)}n._authCredentials=new P_(new Gh(c,u))}}/**
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
 */class Xs{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Xs(this.firestore,e,this._query)}}class Fe{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new mr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Fe(this.firestore,e,this._key)}}class mr extends Xs{constructor(e,t,r){super(e,t,zs(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Fe(this.firestore,null,new U(e))}withConverter(e){return new mr(this.firestore,e,this._path)}}function Wl(n,e,...t){if(n=Tt(n),arguments.length===1&&(e=Wh.newId()),JI("doc","path",e),n instanceof ha){const r=ne.fromString(e,...t);return zl(r),new Fe(n,null,new U(r))}{if(!(n instanceof Fe||n instanceof mr))throw new F(N.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ne.fromString(e,...t));return zl(r),new Fe(n.firestore,n instanceof mr?n.converter:null,new U(r))}}/**
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
 */class Kl{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Td(this,"async_queue_retry"),this.Vu=()=>{const r=Bi();r&&O("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Bi();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Bi();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Mt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Tr(e))throw e;O("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(r);throw et("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=ca.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&j()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function Ql(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class Ls extends ha{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Kl,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Kl(e),this._firestoreClient=void 0,await e}}}function eE(n,e){const t=typeof n=="object"?n:sh(),r=typeof n=="string"?n:"(default)",s=Mo(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=nm("firestore");i&&ZI(s,...i)}return s}function Ud(n){if(n._terminated)throw new F(N.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||tE(n),n._firestoreClient}function tE(n){var e,t,r;const s=n._freezeSettings(),i=function(c,u,d,f){return new z_(c,u,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Fd(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new GI(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
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
 */class Vs{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Vs(fe.fromBase64String(e))}catch(t){throw new F(N.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Vs(fe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class Bd{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new F(N.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new be(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class nE{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new F(N.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new F(N.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}}/**
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
 */class rE{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}const sE=new RegExp("[~\\*/\\[\\]]");function iE(n,e,t){if(e.search(sE)>=0)throw Jl(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n);try{return new Bd(...e.split("."))._internalPath}catch{throw Jl(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n)}}function Jl(n,e,t,r,s){let i=`Function ${e}() called with invalid data`;i+=". ";let a="";return new F(N.INVALID_ARGUMENT,i+n+a)}/**
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
 */class $d{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Fe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new oE(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Hd("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class oE extends $d{data(){return super.data()}}function Hd(n,e){return typeof e=="string"?iE(n,e):e instanceof Bd?e._internalPath:e._delegate._internalPath}/**
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
 */function aE(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new F(N.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class cE{convertValue(e,t="none"){switch($t(e)){case 0:return null;case 1:return e.booleanValue;case 2:return se(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Bt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw j()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return js(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>se(a.doubleValue));return new rE(i)}convertGeoPoint(e){return new nE(se(e.latitude),se(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ko(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(dr(e));default:return null}}convertTimestamp(e){const t=It(e);return new Ce(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ne.fromString(e);re(_d(r));const s=new fr(r.get(1),r.get(3)),i=new U(r.popFirst(5));return s.isEqual(t)||et(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */class Qn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class jd extends $d{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new fs(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Hd("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class fs extends jd{data(e={}){return super.data(e)}}class lE{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Qn(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new fs(this._firestore,this._userDataWriter,r.key,r,new Qn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new F(N.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(c=>{const u=new fs(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Qn(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const u=new fs(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Qn(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:uE(c.type),doc:u,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function uE(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return j()}}/**
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
 */function hE(n){n=un(n,Fe);const e=un(n.firestore,Ls);return QI(Ud(e),n._key).then(t=>zd(e,n,t))}class qd extends cE{constructor(e){super(),this.firestore=e}convertBytes(e){return new Vs(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Fe(this.firestore,null,t)}}function dE(n,...e){var t,r,s;n=Tt(n);let i={includeMetadataChanges:!1,source:"default"},a=0;typeof e[a]!="object"||Ql(e[a])||(i=e[a],a++);const c={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(Ql(e[a])){const y=e[a];e[a]=(t=y.next)===null||t===void 0?void 0:t.bind(y),e[a+1]=(r=y.error)===null||r===void 0?void 0:r.bind(y),e[a+2]=(s=y.complete)===null||s===void 0?void 0:s.bind(y)}let u,d,f;if(n instanceof Fe)d=un(n.firestore,Ls),f=zs(n._key.path),u={next:y=>{e[a]&&e[a](zd(d,n,y))},error:e[a+1],complete:e[a+2]};else{const y=un(n,Xs);d=un(y.firestore,Ls),f=y._query;const I=new qd(d);u={next:S=>{e[a]&&e[a](new lE(d,I,y,S))},error:e[a+1],complete:e[a+2]},aE(n._query)}return function(I,S,P,C){const k=new xd(C),V=new Pd(S,k,P);return I.asyncQueue.enqueueAndForget(async()=>Cd(await Ao(I),V)),()=>{k.Za(),I.asyncQueue.enqueueAndForget(async()=>Rd(await Ao(I),V))}}(Ud(d),f,c,u)}function zd(n,e,t){const r=t.docs.get(e._key),s=new qd(n);return new jd(n,s,e._key,r,new Qn(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){(function(s){An=s})(Tn),fn(new xt("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new Ls(new k_(r.getProvider("auth-internal")),new V_(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new F(N.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new fr(d.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:t},i),c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),gt(dl,"4.7.3",e),gt(dl,"4.7.3","esm2017")})();const Gd="fenix_cloud_sync_config",So={apiKey:"AIzaSyAvz0DRZIJLNHQsHmPg7LaUq9s3N2eEQtg",authDomain:"fenix-2c341.firebaseapp.com",projectId:"fenix-2c341",appId:"1:387287127608:web:c4e5aa07b3b91389c5b8cd",messagingSenderId:"387287127608",storageBucket:"fenix-2c341.firebasestorage.app"},Hi={enabled:!0,syncConsent:"granted",firebase:{...So}},fE=20*60*1e3,pE="s11-vorax",Yl=`pricesSnapshots/${pE}`,Wd="fenix_price_last_sync_at";function ts(n){return typeof n=="number"&&Number.isFinite(n)?n:n instanceof Ce?n.toMillis():null}function mE(){try{const n=localStorage.getItem(Wd),e=n?Number(n):0;return Number.isFinite(e)?e:0}catch{return 0}}function Xl(n){try{localStorage.setItem(Wd,String(n))}catch(e){console.error("Failed to persist price sync timestamp:",e)}}function ji(){try{const n=localStorage.getItem(Gd);if(n){const e=JSON.parse(n),t={...Hi,...e,firebase:{...Hi.firebase,...e.firebase||{}}};return Kd(gE(t))}}catch(n){console.error("Failed to read cloud sync config:",n)}return{...Hi}}function gE(n){const e={...n.firebase};let t=!1;return Object.keys(So).forEach(r=>{const s=e[r];(!s||String(s).trim()==="")&&(e[r]=So[r],t=!0)}),t?{...n,firebase:e}:n}function Kd(n){let e=n.syncConsent,t=n.enabled;return e||(e="pending"),e==="pending"?t=!1:e==="granted"?t=!0:e==="denied"&&(t=!1),n.syncConsent===e&&n.enabled===t?n:{...n,syncConsent:e,enabled:t}}function Zl(n){try{localStorage.setItem(Gd,JSON.stringify(n))}catch(e){console.error("Failed to save cloud sync config:",e)}}function yE(n){const e=n.firebase;return!!e.apiKey&&!!e.authDomain&&!!e.projectId&&!!e.appId}class _E{constructor(){this.config=null,this.app=null,this.auth=null,this.db=null,this.lastSyncAt=0,this.lastSyncCache={},this.initializing=null,this.lastSyncCursorMs=null,this.snapshotUnsub=null,this.lastCacheUpdatedAt=null,this.lastCacheError=null,this.onPriceUpdateCallback=null}getSyncStatus(){this.config||(this.config=ji());const e=Kd(this.config);e!==this.config&&(this.config=e,Zl(this.config));const t=this.config.enabled===!0,r=this.config.syncConsent??"pending";return{enabled:t,consent:r}}async setSyncEnabled(e){this.config||(this.config=ji());const t=e?"granted":"denied";this.config.enabled=e,this.config.syncConsent=t,Zl(this.config),e&&await this.initialize()}async initialize(){if(this.initializing)return this.initializing;this.initializing=this.initializeInternal();const e=await this.initializing;return this.initializing=null,e}async initializeInternal(){if(this.config=ji(),typeof this.config.lastSyncCursorMs=="number"&&(this.lastSyncCursorMs=this.config.lastSyncCursorMs),!this.config.enabled)return!1;if(!yE(this.config))return console.warn("[sync] Firebase config missing. Sync disabled."),!1;if(this.app||(this.app=rh(this.config.firebase)),this.auth||(this.auth=b_(this.app)),this.db||(this.db=eE(this.app)),!this.auth.currentUser)try{await uy(this.auth)}catch(e){return console.error("Failed to sign in anonymously:",e),!1}return this.subscribeToSnapshot(),!0}async syncPrices(e){if(!await this.initialize()||!this.db)return{};const r=Date.now();if(this.lastSyncAt||(this.lastSyncAt=mE()),Object.keys(this.lastSyncCache).length===0&&(this.lastSyncCache=await Gu(),Object.keys(this.lastSyncCache).length>0)){const s=Object.values(this.lastSyncCache).map(i=>i.timestamp).filter(i=>typeof i=="number"&&Number.isFinite(i)).reduce((i,a)=>Math.max(i,a),0);this.lastCacheUpdatedAt=s||this.lastCacheUpdatedAt}if(!(e!=null&&e.forceFull)&&this.lastSyncAt&&r-this.lastSyncAt<fE)return this.lastSyncCache;try{const s=Wl(this.db,Yl),i=await hE(s);if(!i.exists())return this.lastCacheError="Price snapshot not available",this.lastSyncCache;const a=i.data(),c=a==null?void 0:a.data,u=ts(a==null?void 0:a.lastUpdated)??null,d={};if(c&&typeof c=="object")for(const[y,I]of Object.entries(c)){const S=typeof(I==null?void 0:I.price)=="number"?I.price:null,P=ts(I==null?void 0:I.timestamp);if(S===null||P===null)continue;const C=typeof(I==null?void 0:I.listingCount)=="number"?I.listingCount:void 0;d[y]={price:S,timestamp:P,...C!==void 0?{listingCount:C}:{}}}const f=await Mc(d);return this.lastSyncAt=r,Xl(r),this.lastSyncCache=f,this.lastCacheUpdatedAt=u,this.lastCacheError=null,f}catch(s){return console.error("Failed to sync prices from snapshot:",s),this.lastCacheError="Failed to read prices",this.lastSyncCache}}subscribeToSnapshot(){if(!this.db||this.snapshotUnsub)return;const e=Wl(this.db,Yl);this.snapshotUnsub=dE(e,async t=>{if(!t.exists())return;const r=t.data(),s=r==null?void 0:r.data,i=ts(r==null?void 0:r.lastUpdated)??null,a={};if(s&&typeof s=="object")for(const[u,d]of Object.entries(s)){const f=typeof(d==null?void 0:d.price)=="number"?d.price:null,y=ts(d==null?void 0:d.timestamp);if(f===null||y===null)continue;const I=typeof(d==null?void 0:d.listingCount)=="number"?d.listingCount:void 0;a[u]={price:f,timestamp:y,...I!==void 0?{listingCount:I}:{}}}const c=await Mc(a);this.lastSyncCache=c,this.lastSyncAt=Date.now(),Xl(this.lastSyncAt),this.lastCacheUpdatedAt=i,this.lastCacheError=null,this.onPriceUpdateCallback&&this.onPriceUpdateCallback(c)},t=>{console.error("Failed to subscribe to price snapshot:",t),this.lastCacheError="Failed to subscribe to price snapshot"})}getCacheStatus(){return{lastUpdated:this.lastCacheUpdatedAt,lastError:this.lastCacheError}}onPriceUpdate(e){this.onPriceUpdateCallback=e}}let ae=null,hn=null,Se=null,eu=null,rr=null,Ms=0,sr=0,bo=!1,Jn=!1,da=[],Qd=[];const Jd="fenix_inventory_cache";async function Yd(){hn=await zu(),Se=new _E,await Se.setSyncEnabled(!0),Se.onPriceUpdate(async t=>{ae&&(ae.applyPriceCache(t),await vs(ae.getPriceCacheAsObject()),ps())});const n=await Gu(t=>Se?Se.syncPrices(t):Promise.resolve({}));ae=new xp(hn,n);const e=localStorage.getItem(Jd);if(e&&ae)try{const t=JSON.parse(e);Array.isArray(t)&&(ae.hydrateInventory(t),ps())}catch(t){console.warn("Failed to restore cached inventory:",t)}setInterval(async()=>{if(Se){const t=await Se.syncPrices({forceFull:!0});ae&&(ae.applyPriceCache(t),await vs(ae.getPriceCacheAsObject()),ps())}},20*60*1e3),vE()}function vE(){eu||(eu=window.setInterval(()=>{Ms++,da.forEach(n=>n({type:"realtime",seconds:Ms}))},1e3))}function IE(){rr||(rr=window.setInterval(()=>{bo&&!Jn&&(sr++,da.forEach(n=>n({type:"hourly",seconds:sr})))},1e3))}function EE(){rr&&(clearInterval(rr),rr=null)}function ps(){Qd.forEach(n=>n())}const ee={async getInventory(){return ae?ae.getInventory().map(e=>e.baseId===En?{...e,price:1}:e):[]},async getItemDatabase(){return hn||(hn=await zu()),hn},async getPriceCache(){return ae?ae.getPriceCacheAsObject():{}},getPriceCacheStatus(){return Se?Se.getCacheStatus():{lastUpdated:null,lastError:"Price sync not initialized"}},onInventoryUpdate(n){Qd.push(n)},startHourlyTimer(){bo=!0,Jn=!1,sr=0,IE()},pauseHourlyTimer(){Jn=!0},resumeHourlyTimer(){Jn=!1},stopHourlyTimer(){bo=!1,Jn=!1,sr=0,EE()},resetRealtimeTimer(){Ms=0},async getTimerState(){return{realtimeSeconds:Ms,hourlySeconds:sr}},onTimerTick(n){da.push(n)},async getAppVersion(){return"2.4.0"},async checkForUpdates(){return{success:!1,message:"Updates not available in web version"}},onUpdateStatus(n){},onUpdateProgress(n){},onShowUpdateDialog(n){},onUpdateDownloadedTransition(n){},sendUpdateDialogResponse(n){},async isLogPathConfigured(){return localStorage.getItem("fenix_log_uploaded")==="true"},async selectLogFile(){return null},onShowLogPathSetup(n){},async getSettings(){return zp()},async saveSettings(n){try{return Gp(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to save settings"}}},async getUsernameInfo(){return{canChange:!1}},async setUsername(n){return{success:!1,error:"Username not supported in web version"}},async getCloudSyncStatus(){return Se?Se.getSyncStatus():{enabled:!1,consent:"pending"}},async setCloudSyncEnabled(n){if(!Se)return{success:!1,error:"Price sync service not initialized"};try{return await Se.setSyncEnabled(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to update cloud sync setting"}}},onShowSyncConsent(n){},async testKeybind(n){return{success:!1,error:"Keybinds not supported in web version"}},onCloseSettingsModal(n){},onWindowModeChanged(n){},minimizeWindow(){},maximizeWindow(){},closeWindow(){},onMaximizeStateChanged(n){},async getMaximizeState(){return!1},toggleOverlayWidget(){},updateOverlayWidget(n){},onWidgetPauseHourly(n){},onWidgetResumeHourly(n){}};async function tu(n){return new Promise((e,t)=>{const r=new FileReader;r.onload=async s=>{var i;try{const a=(i=s.target)==null?void 0:i.result,c=Kp(a);if((!ae||!hn)&&await Yd(),ae){if(ae.buildInventory(c),Se){const u=await Se.syncPrices({forceFull:!0});ae.applyPriceCache(u)}await vs(ae.getPriceCacheAsObject()),localStorage.setItem(Jd,JSON.stringify(ae.getInventory())),localStorage.setItem("fenix_log_uploaded","true"),ps(),e()}else t(new Error("Inventory manager not initialized"))}catch(a){t(a)}},r.onerror=()=>{t(new Error("Failed to read file"))},r.readAsText(n)})}let Xd=[],Zd={},ef="priceTotal",tf="desc",nf="",rf=null,sf=null,of=null;function $e(){return Xd}function Zs(){return Zd}function fa(){return ef}function pa(){return tf}function TE(){return nf}function af(){return rf}function cf(){return sf}function lf(){return of}function wE(n){Xd=n}function AE(n){Zd=n}function SE(n){ef=n}function nu(n){tf=n}function bE(n){nf=n}function ru(n){rf=n}function CE(n){sf=n}function RE(n){of=n}let uf="realtime",hf=[],df=[],ff=new Map,pf=0,mf=!1,gf=!1,yf=new Set,_f=null,vf=new Map,If=new Map,Ef=new Map,Tf=[],wf=0,Af=0,Sf=0,bf=!1;function De(){return uf}function su(n){uf=n}function ma(){return hf}function Cf(n){hf=n}function Cn(){return df}function gr(n){df=n}function br(){return ff}function PE(n){ff=n}function ga(){return pf}function Rf(n){pf=n}function wt(){return mf}function Pf(n){mf=n}function kf(){return gf}function ei(n){gf=n}function ke(){return yf}function kE(n){yf=n}function DE(){return _f}function Df(n){_f=n}function ti(){return vf}function NE(n){vf=n}function ya(){return If}function LE(n){If=n}function _a(){return Ef}function VE(n){Ef=n}function va(){return Tf}function ni(n){Tf=n}function Nf(){return wf}function Ia(n){wf=n}function ME(){return Af}function Lf(n){Af=n}function Vf(){return Sf}function Ea(n){Sf=n}function OE(){return bf}function xE(n){bf=n}let Mf=!0;function FE(){return Mf}function Co(n){Mf=n}function In(n){const e=Math.floor(n/3600).toString().padStart(2,"0"),t=Math.floor(n%3600/60).toString().padStart(2,"0"),r=(n%60).toString().padStart(2,"0");return`${e}:${t}:${r}`}function UE(n){return n==="none"?"Uncategorized":n.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(" ")}function Of(n){if(n===null)return"";const e=Date.now()-n;return e>=Vp?"price-very-stale":e>=Lp?"price-stale":""}function Ht(n,e=null){return!FE()||e===En?n:n*(1-Mp)}function Ta(n){const e=cf(),t=lf();if(n.price===null)return!(e!==null&&e>0);const r=n.price*n.totalQuantity,s=Ht(r,n.baseId);return!(e!==null&&s<e||t!==null&&s>t)}function ri(){return $e().reduce((e,t)=>{if(!Ta(t))return e;if(t.price!==null){const r=t.totalQuantity*t.price;return e+Ht(r,t.baseId)}return e},0)}function Cr(){const n=$e(),e=br(),t=ke(),r=cf(),s=lf();let i=0;for(const a of n){if(a.price===null||t.has(a.baseId))continue;const c=a.totalQuantity,u=e.get(a.baseId)||0,d=c-u;if(a.baseId===En){const f=d*a.price;i+=f}else{if(d<=0)continue;const f=d*a.price,y=Ht(f,a.baseId);if(r!==null&&y<r||s!==null&&y>s)continue;i+=y}}for(const a of t){const c=n.find(I=>I.baseId===a);if(!c||c.price===null)continue;const u=c.totalQuantity,f=(e.get(a)||0)-u;if(f===0)continue;const y=Math.abs(f)*c.price;f>0?i-=y:i+=y}return i}let xf,Ff,wa,Uf,si;function BE(n,e,t,r,s){xf=n,Ff=e,wa=t,Uf=r,si=s}function $E(){const n=ri();Lf(n),si(n)}function HE(){Ea(0);const n=ri();Lf(n),Cf([]),ee.resetRealtimeTimer(),wa.textContent=In(0),ir(),si(n)}function ir(){const n=ri(),e=Vf()/3600,t=ME(),r=e>0?(n-t)/e:0;si(n),De()==="realtime"&&(xf.textContent=n.toFixed(2),Ff.textContent=r.toFixed(2)),Uf()}async function iu(){const n=await ee.getTimerState();Ea(n.realtimeSeconds),wa.textContent=In(n.realtimeSeconds)}let Bf,$f,Aa,Sa,ba,Rr,Pr,kr,Hf,jf,Ca,Ra;function jE(n,e,t,r,s,i,a,c,u,d,f,y){Bf=n,$f=e,Aa=t,Sa=r,ba=s,Rr=i,Pr=a,kr=c,Hf=u,jf=d,Ca=f,Ra=y}function qE(){Hf()}function qf(){const n=$e(),e=br(),t=ti(),r=ya(),s=_a(),i=ke();e.clear(),t.clear(),r.clear(),s.clear();for(const a of n)e.set(a.baseId,a.totalQuantity),i.has(a.baseId)&&t.set(a.baseId,a.totalQuantity);if(gr([]),ni([]),Ia(0),De()==="hourly"){const a=Cn();a.push({time:Date.now(),value:0}),gr(a)}Sa.style.display="none",ba.style.display="inline-block",Rr.style.display="inline-block",Pr.style.display="none",Aa.textContent="00:00:00",Pf(!0),ei(!1),ee.startHourlyTimer(),or(),Ca(),Ra()}function zE(){const n=$e(),e=ke(),t=ti(),r=br(),s=ya(),i=_a();for(const a of e){const c=n.find(f=>f.baseId===a),u=c?c.totalQuantity:0,d=t.get(a)??r.get(a)??u;if(r.get(a),u<d){const f=d-u,y=s.get(a)||0;s.set(a,y+f)}if(u>d){const f=u-d,y=i.get(a)||0;i.set(a,y+f)}}}function Pa(){const n=$e(),e=ke(),t=ti();for(const r of e){const s=n.find(i=>i.baseId===r);s&&t.set(r,s.totalQuantity)}}function GE(){const n=Cr(),e=Math.floor(ga()/3600),t=Nf(),r=Cn(),s=va(),i=ke(),a=$e(),c=ti(),u=ya(),d=_a(),f={hourNumber:e,startValue:t,endValue:n,earnings:n-t,history:[...r]};s.push(f),ni(s),Ia(n),gr([{time:Date.now(),value:n}]),u.clear(),d.clear();for(const I of i){const S=a.find(P=>P.baseId===I);S&&c.set(I,S.totalQuantity)}const y=document.querySelector(".stats-container");if(y){const I=document.createElement("div");I.className="earnings-animation",I.textContent=`Hour ${e} Complete! +${f.earnings.toFixed(2)} FE`,I.style.color="#10b981",y.appendChild(I),setTimeout(()=>I.remove(),2e3)}}function WE(){ei(!0),ee.pauseHourlyTimer(),Pa(),Rr.style.display="none",Pr.style.display="inline-block",kr()}function KE(){ei(!1),ee.resumeHourlyTimer(),Pa(),Rr.style.display="inline-block",Pr.style.display="none",kr()}function QE(){ee.stopHourlyTimer();const n=Cr(),e=va(),t=Cn(),r=Nf(),i={hourNumber:e.length+1,startValue:r,endValue:n,earnings:n-r,history:[...t]};e.push(i),ni(e),jf(),Sa.style.display="inline-block",ba.style.display="none",Rr.style.display="none",Pr.style.display="none",Aa.textContent="00:00:00",Rf(0),Pf(!1),ei(!1),Ca(),Ra(),kr()}function or(){const n=Cr(),e=ga()/3600,t=e>0?n/e:0;De()==="hourly"&&(Bf.textContent=n.toFixed(2),$f.textContent=t.toFixed(2)),kr()}function zf(){const n=$e(),e=De(),t=wt();if(e==="hourly"&&t){const r=br(),s=ke();return n.filter(i=>!s.has(i.baseId)).map(i=>{const a=i.totalQuantity,c=r.get(i.baseId)||0,u=a-c;return{...i,totalQuantity:u}}).filter(i=>i.baseId===En?!0:i.totalQuantity>0)}return n}function JE(){const n=zf(),e=TE(),t=af(),r=Zs(),s=fa(),i=pa();let a=n.filter(c=>{if(e&&!c.itemName.toLowerCase().includes(e.toLowerCase()))return!1;if(t!==null){const u=r[c.baseId];if(((u==null?void 0:u.group)||"none")!==t)return!1}return Ta(c)});return a.sort((c,u)=>{let d=0;if(s==="priceUnit"){const f=c.price??-1,y=u.price??-1;d=f-y}else if(s==="priceTotal"){const f=Ht((c.price??0)*c.totalQuantity,c.baseId),y=Ht((u.price??0)*u.totalQuantity,u.baseId);d=f-y}return i==="asc"?d:-d}),a}function YE(n){if(n.pageId===null||n.slotId===null)return"";const e=n.pageId===102?"P1":n.pageId===103?"P2":`P${n.pageId}`,t=n.slotId+1;return`${e}:${t}`}function XE(){const n=document.getElementById("usageSection"),e=document.getElementById("usageContent");if(!n||!e)return;const t=De(),r=wt(),s=ke();if(t==="hourly"&&r&&s.size>0){n.style.display="block";const i=$e(),a=br(),c=Zs(),u=[];for(const f of s){const y=i.find(C=>C.baseId===f),I=y?y.totalQuantity:0,P=(a.get(f)||0)-I;if(!y){const C=c[f];C&&u.push({baseId:f,itemName:C.name,netUsage:P,price:0});continue}u.push({baseId:f,itemName:y.itemName,netUsage:P,price:y.price||0})}if(u.length===0){n.style.display="none";return}u.sort((f,y)=>{const I=f.price>0?Math.abs(f.netUsage*f.price):0;return(y.price>0?Math.abs(y.netUsage*y.price):0)-I});let d=0;e.innerHTML=u.map(({baseId:f,itemName:y,netUsage:I,price:S})=>{const P=S>0?S:0,C=S>0?Math.abs(I)*S:0;I>0?d-=C:I<0&&(d+=C);const k=I>0?"-":I<0?"+":"",V=I!==0?`${k}${Math.abs(I)}`:"0",H=I>0?"-":I<0?"+":"",q=S>0&&I!==0?`${H}${C.toFixed(2)} FE`:"- FE";return`
        <div class="item-row">
          <div class="item-name">
            <img src="./assets/${f}.webp" 
                 alt="${y}" 
                 class="item-icon"
                 onerror="this.style.display='none'">
            <div class="item-name-content">
              <div class="item-name-text">${y}</div>
            </div>
          </div>
          <div class="item-quantity">${V}</div>
          <div class="item-price">
            <div class="price-single ${S===0?"no-price":""}">
              ${S>0?P.toFixed(2):"Not Set"}
            </div>
            ${S>0&&I!==0?`<div class="price-total">${q}</div>`:""}
          </div>
        </div>
      `}).join("")+(u.length>0&&d!==0?`
      <div class="usage-footer">
        <div class="usage-footer-label">Net Impact:</div>
        <div class="usage-footer-total">${d>0?"+":""}${d.toFixed(2)} FE</div>
      </div>
    `:"")}else n.style.display="none"}const ZE=`
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
</span>`;function Ae(){XE();const n=document.getElementById("inventory");if(!n)return;const e=JE(),t=De(),r=wt();if(e.length===0){const s=t==="hourly"&&r?"No new items gained yet":"No items match your filters";n.innerHTML=`<div class="loading">${s}</div>`;return}n.innerHTML=e.map(s=>{const i=s.price!==null?s.price*s.totalQuantity:null,a=i!==null?Ht(i,s.baseId):null,c=YE(s),u=Of(s.priceTimestamp);return`
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
    `}).join(""),Gf()}function Gf(){const n=fa(),e=pa();document.querySelectorAll(".inventory-section [data-sort]").forEach(t=>{const r=t.dataset.sort;r&&(r==="priceUnit"?t.innerHTML="Price"+ZE:t.textContent="Total",t.classList.remove("sort-active","sort-asc","sort-desc"),r===n&&(t.classList.add("sort-active"),t.classList.add(e==="asc"?"sort-asc":"sort-desc")))})}function Ge(n){const e=document.getElementById("breakdown");if(!e)return;const t=zf(),r=Zs(),s=af(),i=new Map;for(const c of t){if(c.price===null||c.totalQuantity<=0||!Ta(c))continue;const u=r[c.baseId];if(!u||u.tradable===!1)continue;const d=u.group||"none",f=c.price*c.totalQuantity,y=Ht(f,c.baseId);i.set(d,(i.get(d)||0)+y)}const a=Array.from(i.entries()).map(([c,u])=>({group:c,total:u})).filter(({total:c})=>c>0).sort((c,u)=>u.total-c.total);if(a.length===0){e.innerHTML='<div class="breakdown-empty">No items with prices</div>';return}e.innerHTML=a.map(({group:c,total:u})=>{const d=UE(c);return`
      <div class="breakdown-group ${s===c?"selected":""}" data-group="${c}" title="${d}">
        <img src="./assets/${c}.webp" alt="${d}" class="breakdown-icon" title="${d}" onerror="this.style.display='none'">
        <span class="breakdown-group-value" title="${d}">${u.toFixed(0)} FE</span>
      </div>
    `}).join(""),e.querySelectorAll(".breakdown-group").forEach(c=>{c.addEventListener("click",()=>{const u=c.dataset.group;u&&(ru(s===u?null:u),Ge(n),n())})})}let Pe=null;function eT(){const n=document.getElementById("wealth-graph");if(!n)return;const e=n.getContext("2d");Pe&&Pe.destroy(),Pe=new Chart(e,{type:"line",data:{labels:[],datasets:[{label:"Wealth (FE)",data:[],borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:10}},y:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",callback:function(t){const r=t;return r%1===0?r.toFixed(0):r.toFixed(1)}}}},plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:t=>{if(t.length===0||!Pe)return"";const s=t[0].parsed.y;return`Wealth: ${s%1===0?s.toFixed(0):s.toFixed(1)} FE`},label:t=>{if(!Pe)return"";const r=t.dataIndex,s=Pe.currentHistory||(De()==="realtime"?ma():Cn());if(r>=0&&r<s.length){const i=s[r],a=new Date(i.time),c=Math.floor(a.getSeconds()/60)*60,u=new Date(a);u.setSeconds(c),u.setMilliseconds(0);const d=u.getHours().toString().padStart(2,"0"),f=u.getMinutes().toString().padStart(2,"0");return`${d}:${f}`}return""},footer:()=>""}}},interaction:{intersect:!1,mode:"index"}}}),Os()}function tT(n){const t={time:Date.now(),value:Math.round(n)},r=ma();r.push(t),r.length>Op&&r.shift(),Cf(r),De()==="realtime"&&Os()}function Os(){if(!Pe)return;const n=De(),e=n==="realtime"?ma():Cn(),t=e.length/3600;let r=60;t>5&&(r=120),t>10&&(r=180),t>20&&(r=240);const s=e.map((a,c)=>{const u=new Date(a.time),d=u.getMinutes(),f=u.getHours();return c===0||c===e.length-1?`${f.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`:e.length>0&&Math.floor((a.time-e[0].time)/6e4)%r===0?`${f.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`:""}),i=e.map(a=>a.value);Pe.data.labels=s,Pe.data.datasets[0].data=i,Pe.options.scales.x.ticks.maxTicksLimit=Math.min(12,Math.ceil(t)),Pe.currentHistory=e,Pe.currentMode=n,Pe.update("none")}function nT(n,e){const t=document.getElementById(`hourGraph${e}`);if(!t)return;const r=t.getContext("2d");if(n.history.length===0)return;const s=Math.max(1,Math.floor(n.history.length/60)),i=n.history.filter((d,f)=>f%s===0||f===n.history.length-1),a=Array.from({length:61},(d,f)=>f%10===0?`${f}m`:""),c=Array.from({length:61},(d,f)=>{const y=Math.floor(f/60*(i.length-1)),I=i[y];return{x:f,y:I?I.value-n.startValue:0,time:I?I.time:0}}),u=n.history.length>0?n.history[0].time:Date.now();new Chart(r,{type:"line",data:{labels:a,datasets:[{data:c.map(d=>d.y),borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,animation:!1,scales:{x:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:7}},y:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:5,callback:function(d){const f=d;return f%1===0?f.toFixed(0):f.toFixed(1)}}}},plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:d=>{if(d.length===0)return"";const y=d[0].parsed.y;return`${y%1===0?y.toFixed(0):y.toFixed(1)} FE`},label:d=>{const f=d.dataIndex;if(f>=0&&f<c.length){const y=c[f];let I;y.time>0?I=new Date(y.time):I=new Date(u+f*6e4);const S=Math.floor(I.getSeconds()/60)*60,P=new Date(I);P.setSeconds(S),P.setMilliseconds(0);const C=P.getHours().toString().padStart(2,"0"),k=P.getMinutes().toString().padStart(2,"0");return`${C}:${k}`}return""},footer:()=>""}}},interaction:{intersect:!1,mode:"index"}}})}let Wf,Kf;function rT(n,e){Wf=n,Kf=e}function sT(){const n=document.getElementById("breakdownModal"),e=document.getElementById("breakdownTotal"),t=document.getElementById("breakdownHours");if(!n||!e||!t)return;const r=va(),s=ga(),i=r.reduce((a,c)=>a+c.earnings,0);e.textContent=`${i.toFixed(2)} FE`,t.innerHTML=r.map((a,c)=>(a.hourNumber<=Math.floor(s/3600)||In(s%3600).substring(3),`
      <div class="hour-card">
        <div class="hour-header">
          <div class="hour-label">Hour ${a.hourNumber}</div>
          <div class="hour-earnings">+${a.earnings.toFixed(2)} FE</div>
        </div>
        <canvas class="hour-graph" id="hourGraph${c}"></canvas>
      </div>
    `)).join(""),n.classList.add("active"),setTimeout(()=>{r.forEach((a,c)=>{nT(a,c)})},100)}function iT(){const n=document.getElementById("breakdownModal");n&&(n.classList.remove("active"),ni([]),PE(new Map),gr([]),Ia(0),kE(new Set),NE(new Map),LE(new Map),VE(new Map),Wf(),Kf())}const Wt={resonance:(n,e,t)=>t==="5028"||t==="5040",beaconsT8:(n,e,t)=>e==="beacon"&&(n.includes("(Timemark 8)")||n==="Deep Space Beacon"),beaconsT7:(n,e,t)=>e==="beacon"&&(n.includes("(Timemark 7)")||!n.includes("(Timemark 8)")&&n!=="Deep Space Beacon"),probes:(n,e,t)=>e==="compass"&&n.includes("Probe"),scalpels:(n,e,t)=>e==="compass"&&n.includes("Scalpel"),compasses:(n,e,t)=>e==="compass"&&!n.includes("Probe")&&!n.includes("Scalpel")},oT=[{key:"resonance",title:"Resonance",categorizer:Wt.resonance},{key:"beaconsT8",title:"T8 Beacons",categorizer:Wt.beaconsT8},{key:"beaconsT7",title:"T7 Beacons",categorizer:Wt.beaconsT7},{key:"probes",title:"Probes",categorizer:Wt.probes},{key:"scalpels",title:"Scalpels",categorizer:Wt.scalpels},{key:"compasses",title:"Compasses/Astrolabes",categorizer:Wt.compasses}];function ou(){const n=document.getElementById("compassBeaconPromptModal");n&&n.classList.add("active")}function aT(){const n=document.getElementById("compassBeaconPromptModal");n&&n.classList.remove("active")}function cT(){const n=document.getElementById("compassBeaconSelectionModal"),e=document.getElementById("compassBeaconCheckboxes"),t=document.getElementById("compassBeaconSearch"),r=document.getElementById("compassBeaconHelperActions");if(!n||!e)return;const s=$e(),i=Zs(),a=ke();e.innerHTML="",a.clear(),t&&(t.value="");const c=localStorage.getItem("lastCompassBeaconSelection");r&&(c?r.style.display="block":r.style.display="none");const u=oT.map(L=>({...L,items:[]}));for(const[L,x]of Object.entries(i))if(x.group==="compass"||x.group==="beacon"||x.group==="currency"){const M=s.find(g=>g.baseId===L),E={baseId:L,itemName:x.name,group:x.group,quantity:M?M.totalQuantity:0};for(const g of u)if(g.categorizer(x.name,x.group,L)){g.items.push(E);break}}u.forEach(L=>{L.items.sort((x,M)=>x.itemName.localeCompare(M.itemName))});const d=u,f=new Set;f.add("5028"),Df(f);const y=()=>{e.querySelectorAll('input[type="checkbox"]:checked').forEach(x=>{const M=x.dataset.baseid;M&&f.add(M)})},I=()=>{const L=document.getElementById("compassBeaconSelectionConfirm");L&&(Array.from(f).some(M=>M!=="5028")?(L.style.display="block",setTimeout(()=>{L.classList.add("visible")},10)):(L.classList.remove("visible"),setTimeout(()=>{L.classList.contains("visible")||(L.style.display="none")},300)))},S=(L,x)=>{x?f.add(L):f.delete(L),I()},P=L=>{const x=document.createElement("div");x.className="compass-beacon-checkbox-item";const M=document.createElement("label"),E=document.createElement("input");E.type="checkbox",E.dataset.baseid=L.baseId,E.dataset.type=L.group,E.checked=f.has(L.baseId),E.addEventListener("change",()=>{S(L.baseId,E.checked)});const g=document.createElement("span");g.className="checkbox-label";const m=document.createElement("img"),v="./";m.src=`${v}assets/${L.baseId}.webp`,m.alt=L.itemName,m.className="checkbox-icon",m.onerror=()=>{m.style.display="none"};const T=document.createElement("span");if(T.textContent=L.itemName,g.appendChild(m),g.appendChild(T),L.quantity>0){const w=document.createElement("span");w.className="checkbox-quantity",w.textContent=`(${L.quantity})`,g.appendChild(w)}return M.appendChild(E),M.appendChild(g),x.appendChild(M),x},C=L=>{if(L.items.length===0)return;const x=document.createElement("div");x.className="compass-beacon-group-header",x.textContent=L.title,e.appendChild(x);const M=document.createElement("div");M.className="compass-beacon-group-items",L.items.forEach(E=>{const g=P(E);M.appendChild(g)}),e.appendChild(M)},k=(L,x)=>{const M=x.toLowerCase();return{...L,items:L.items.filter(E=>E.itemName.toLowerCase().includes(M))}},V=(L,x=!1)=>{if(e.children.length>0&&!x&&y(),e.innerHTML="",L.forEach(M=>C(M)),e.children.length===0){const M=document.createElement("div");M.style.textAlign="center",M.style.color="var(--border)",M.style.padding="20px",M.textContent="No items found",e.appendChild(M)}};V(d),t&&(t.oninput=L=>{const x=L.target.value.trim();if(x==="")V(d);else{const M=d.map(E=>k(E,x));V(M)}});const H=document.getElementById("compassBeaconSelectionClear");H&&(H.onclick=()=>{f.clear(),f.add("5028"),I();const L=(t==null?void 0:t.value.trim())||"";if(L==="")V(d,!0);else{const x=d.map(M=>k(M,L));V(x,!0)}});const q=document.getElementById("compassBeaconRestore");q&&(q.onclick=()=>{const L=localStorage.getItem("lastCompassBeaconSelection");if(L)try{const x=JSON.parse(L);f.clear(),x.forEach(E=>{f.add(E)}),I();const M=(t==null?void 0:t.value.trim())||"";if(M==="")V(d,!0);else{const E=d.map(g=>k(g,M));V(E,!0)}}catch(x){console.error("Failed to restore last selection:",x)}}),I(),n.classList.add("active")}function Qf(){const n=document.getElementById("compassBeaconSelectionModal");n&&n.classList.remove("active"),Df(null)}function lT(){const n=ke(),e=DE();n.clear(),e?e.forEach(r=>{n.add(r)}):document.querySelectorAll('#compassBeaconSelectionModal input[type="checkbox"]:checked').forEach(s=>{const i=s.dataset.baseid;i&&n.add(i)});const t=Array.from(n);localStorage.setItem("lastCompassBeaconSelection",JSON.stringify(t)),console.log(`✅ Including ${n.size} compasses/beacons in hourly calculation`),Qf(),qf()}document.getElementById("updateModal");document.getElementById("updateModalTitle");document.getElementById("updateModalSubtitle");document.getElementById("updateModalMessage");document.getElementById("updateModalChangelog");document.getElementById("updateProgressContainer");document.getElementById("updateProgressFill");document.getElementById("updateProgressText");document.getElementById("updateBtnPrimary");document.getElementById("updateBtnSecondary");let qi={},qn=null,Kt=null,at=null,au,cu;const ms=document.getElementById("settingsModal"),uT=document.getElementById("settingsCloseBtn"),ze=document.getElementById("settingsSaveBtn"),Ne=document.getElementById("settingsFooterMessage"),zi=document.getElementById("generalSection"),Gi=document.getElementById("preferencesSection"),Qt=document.getElementById("includeTaxCheckbox"),zn=document.getElementById("cloudSyncCheckbox"),ns=document.getElementById("cloudSyncHelperText"),Wi=document.querySelectorAll(".settings-sidebar-item"),lu=document.getElementById("settingsDownloadDesktopBtn");function hT(n,e,t,r){au=e,cu=t;const s=document.getElementById("openSettingsBtn");s&&s.addEventListener("click",async()=>{r.open=!1;const i=document.getElementById("settingsMenu");i&&(i.style.display="none"),qi=await ee.getSettings(),qn=qi.includeTax!==void 0?qi.includeTax:!0,Co(qn);const a=await ee.getCloudSyncStatus();at=a.enabled,Kt=a.enabled,Qt&&(Qt.checked=qn),zn&&ns&&at!==null&&(zn.checked=at,ns.textContent=at?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices."),ze.disabled=!1,ze.textContent="Save",Ne.textContent="",Ne.classList.remove("show","success","error"),zi.classList.add("active"),Gi.classList.remove("active"),Wi.forEach(c=>{c.getAttribute("data-section")==="general"?c.classList.add("active"):c.classList.remove("active")}),ms.classList.add("active")}),uT.addEventListener("click",()=>{uu()}),ms.addEventListener("click",i=>{i.target===ms&&uu()}),Qt&&Qt.addEventListener("change",()=>{Qt&&(qn=Qt.checked)}),lu&&lu.addEventListener("click",()=>{window.open("https://github.com/Syncingoutt/Fenix/releases","_blank","noopener,noreferrer")}),zn&&zn.addEventListener("change",()=>{Kt=zn.checked}),Wi.forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-section");a&&(Wi.forEach(c=>c.classList.remove("active")),i.classList.add("active"),a==="general"?(zi.classList.add("active"),Gi.classList.remove("active")):a==="preferences"&&(zi.classList.remove("active"),Gi.classList.add("active")))})}),ze.addEventListener("click",async()=>{ze.disabled=!0,ze.textContent="Saving...";try{const i={},a=document.getElementById("includeTaxCheckbox"),c=a?a.checked:qn??!1;if(i.includeTax=c,Kt!==null&&at!==null&&Kt!==at){const d=await ee.setCloudSyncEnabled(Kt);if(!d.success){Ne.textContent=d.error||"Failed to update cloud sync",Ne.classList.add("show","error"),ze.disabled=!1,ze.textContent="Save";return}at=Kt,ns&&(ns.textContent=at?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices.")}const u=await ee.saveSettings(i);u.success?(Co(i.includeTax??!1),Ne.textContent="Settings saved successfully",Ne.classList.add("show","success"),cu($e()),au()):(Ne.textContent=u.error||"Failed to save settings",Ne.classList.add("show","error"))}catch(i){console.error("Failed to save settings:",i),Ne.textContent=i.message||"Failed to save settings",Ne.classList.add("show","error")}finally{ze.disabled=!1,ze.textContent="Save"}})}function uu(){ms.classList.remove("active"),Ne.textContent="",Ne.classList.remove("show","success","error")}const dT=document.getElementById("syncConsentModal"),hu=document.getElementById("syncConsentEnableBtn"),du=document.getElementById("syncConsentDisableBtn");function fu(){dT.classList.remove("active")}function fT(){hu&&hu.addEventListener("click",async()=>{await ee.setCloudSyncEnabled(!0),fu()}),du&&du.addEventListener("click",async()=>{await ee.setCloudSyncEnabled(!1),fu()}),ee.setCloudSyncEnabled(!0)}const ar=document.getElementById("syncDisableConfirmModal"),pu=document.getElementById("syncDisableCancelBtn"),mu=document.getElementById("syncDisableConfirmBtn");let Nt=null;function Ki(){ar&&(ar.classList.remove("active"),Nt=null)}function pT(){ar&&(pu&&pu.addEventListener("click",()=>{Nt&&Nt(!1),Ki()}),mu&&mu.addEventListener("click",async()=>{Nt&&Nt(!0),Ki()}),ar.addEventListener("click",n=>{n.target===ar&&(Nt&&Nt(!1),Ki())}))}const gu=document.getElementById("settingsButton"),Jt=document.getElementById("settingsMenu"),yu=document.getElementById("appVersion");let Yt=!1;function mT(){return ee.getAppVersion().then(n=>{yu&&(yu.textContent=n)}),gu&&gu.addEventListener("click",n=>{n.stopPropagation(),Yt=!Yt,Jt&&(Jt.style.display=Yt?"block":"none")}),document.addEventListener("click",()=>{Yt&&(Yt=!1,Jt&&(Jt.style.display="none"))}),Jt&&Jt.addEventListener("click",n=>{n.stopPropagation()}),{open:Yt}}const _u=document.getElementById("wealthValue"),vu=document.getElementById("wealthHourly"),gs=document.getElementById("realtimeBtn"),ys=document.getElementById("hourlyBtn"),Ro=document.getElementById("hourlyControls"),ka=document.getElementById("startHourly"),Da=document.getElementById("stopHourly"),Na=document.getElementById("pauseHourly"),La=document.getElementById("resumeHourly"),Iu=document.getElementById("hourlyTimer"),cr=document.getElementById("timer"),_s=document.getElementById("resetRealtimeBtn"),Xt=document.getElementById("minPriceInput"),Zt=document.getElementById("maxPriceInput"),Qi=document.getElementById("searchInput");document.getElementById("clearSearch");function gT(){ka.style.display="inline-block",Da.style.display="none",Na.style.display="none",La.style.display="none",Ro.classList.remove("active"),gs.classList.add("active"),ys.classList.remove("active"),_s.style.display="block"}let rs,Eu,Tu,wu;function yT(n,e,t,r){rs=n,Eu=e,Tu=t,wu=r;function s(){const i=Xt==null?void 0:Xt.value.trim(),a=Zt==null?void 0:Zt.value.trim(),c=i&&i!==""?parseFloat(i):null,u=a&&a!==""?parseFloat(a):null;if(c!==null&&u!==null&&c>u)return;CE(c),RE(u),rs();const d=De();d==="realtime"?Tu():d==="hourly"&&wt()&&wu(),Eu()}Xt==null||Xt.addEventListener("input",s),Zt==null||Zt.addEventListener("input",s),document.querySelectorAll("[data-sort]").forEach(i=>{i.addEventListener("click",()=>{const a=i.dataset.sort;if(!a)return;const c=fa(),u=pa();c===a?nu(u==="asc"?"desc":"asc"):(SE(a),nu("desc")),rs()})}),Qi==null||Qi.addEventListener("input",i=>{const a=i.target.value;bE(a),rs()})}let Au,Su,bu,Cu,Ru,Pu,ku,kt,ss,Ji,Du,is,Nu,Yi,Lu,Vu,Mu;function _T(n,e,t,r,s,i,a,c,u,d,f,y,I,S,P,C,k,V){var H,q,L,x,M,E,g;Au=n,Su=e,bu=t,Cu=r,Ru=s,Pu=i,ku=a,kt=c,ss=u,Ji=d,Du=f,is=I,Nu=S,Yi=P,Lu=C,Vu=k,Mu=V,gs.addEventListener("click",()=>{su("realtime"),gs.classList.add("active"),ys.classList.remove("active"),Ro.classList.remove("active"),cr.style.display="block",_s.style.display="block",cr.textContent=In(Vf()),Pu(),kt(),ss(kt),Ji()}),ys.addEventListener("click",()=>{if(su("hourly"),gs.classList.remove("active"),ys.classList.add("active"),Ro.classList.add("active"),cr.style.display="none",_s.style.display="none",wt())ku(),kt(),ss(kt);else{const m=document.getElementById("wealthValue"),v=document.getElementById("wealthHourly");m&&(m.textContent="0.00"),v&&(v.textContent="0.00"),kt(),ss(kt)}Ji(),Du()}),ka.addEventListener("click",Au),Da.addEventListener("click",Su),Na.addEventListener("click",bu),La.addEventListener("click",Cu),_s.addEventListener("click",Ru),(H=document.getElementById("compassBeaconPromptNo"))==null||H.addEventListener("click",()=>{ke().clear(),is(),Vu()}),(q=document.getElementById("compassBeaconPromptYes"))==null||q.addEventListener("click",()=>{is(),Nu()}),(L=document.getElementById("compassBeaconSelectionClose"))==null||L.addEventListener("click",()=>{ke().clear(),Yi()}),(x=document.getElementById("compassBeaconSelectionConfirm"))==null||x.addEventListener("click",Lu),(M=document.getElementById("compassBeaconPromptModal"))==null||M.addEventListener("click",m=>{m.target===document.getElementById("compassBeaconPromptModal")&&(ke().clear(),is())}),(E=document.getElementById("compassBeaconSelectionModal"))==null||E.addEventListener("click",m=>{m.target===document.getElementById("compassBeaconSelectionModal")&&(ke().clear(),Yi())}),(g=document.getElementById("closeBreakdown"))==null||g.addEventListener("click",Mu)}function vT(n){let e=null,t=null,r=!1;const s=10*1e3,i="fenix_setup_guide_dismissed",a=document.getElementById("ctaBanner"),c=document.getElementById("ctaCloseBtn");a&&(localStorage.getItem("fenix_cta_dismissed")==="true"||a.classList.remove("is-hidden")),a&&c&&c.addEventListener("click",()=>{a.classList.add("is-hidden"),localStorage.setItem("fenix_cta_dismissed","true")});const u=document.getElementById("uploadLogBtn");if(u){const m=document.createElement("input");m.type="file",m.accept=".log",m.style.display="none",document.body.appendChild(m),u.addEventListener("click",()=>{m.click()}),m.addEventListener("change",async v=>{var _;const T=v.target,w=(_=T.files)==null?void 0:_[0];if(w){if(!w.name.toLowerCase().endsWith(".log")){alert("Please select a .log file");return}try{u.disabled=!0;const X=u.querySelector("span");X&&(X.textContent="Uploading..."),await tu(w),x(!0),X&&(X.textContent="Upload Log")}catch(X){console.error("Failed to upload log file:",X),alert(`Failed to upload: ${X.message||"Unknown error"}`)}finally{u.disabled=!1,T.value=""}}})}const d=document.getElementById("watchLogBtn");if(d){const m=T=>{const w=d.querySelector("span");w&&(w.textContent=T?"Stop Watch":"Watch Log")},v=()=>{t!==null&&(window.clearInterval(t),t=null),m(!1)};d.addEventListener("click",async()=>{const T=window.showOpenFilePicker;if(!T){alert("Live log watch is only supported in Chromium-based browsers (Chrome/Edge).");return}if(t!==null){v();return}try{const[_]=await T({types:[{description:"UE Log",accept:{"text/plain":[".log"]}}],multiple:!1});e=_??null}catch{return}if(!e)return;m(!0),q();const w=async()=>{if(!(!e||r)){r=!0;try{const _=await e.getFile();await tu(_),x(!0)}catch(_){console.warn("Failed to read watched log file:",_)}finally{r=!1}}};w(),t=window.setInterval(w,s)})}const f=document.getElementById("setupGuideModal"),y=document.getElementById("setupGuideClose"),I=document.getElementById("setupGuidePrev"),S=document.getElementById("setupGuideNext"),P=document.getElementById("setupGuideProgress"),C=document.querySelectorAll(".setup-guide-step"),k=document.getElementById("setupGuideSpotlight"),V=document.getElementById("openSetupGuideLink"),H=document.getElementById("setupGuideSpotlightBack"),q=()=>{localStorage.setItem(i,"true")},L=m=>{if(C.forEach((v,T)=>{v.classList.toggle("active",T===m)}),P&&(P.textContent=`Step ${m+1} of ${C.length}`),I&&(I.style.display=m===0?"none":""),S&&(S.style.display=m===C.length-1?"none":""),k){const v=m===C.length-1;if(k.classList.toggle("active",v),f&&f.classList.toggle("active",!v),v){const T=document.querySelector(".log-cta-actions");if(T){const X=T.getBoundingClientRect(),He=Math.max(0,X.left-8),Rn=Math.max(0,X.top-8),At=X.width+16,St=X.height+16;k.style.setProperty("--spotlight-x",`${He}px`),k.style.setProperty("--spotlight-y",`${Rn}px`),k.style.setProperty("--spotlight-w",`${At}px`),k.style.setProperty("--spotlight-h",`${St}px`)}const _=document.querySelector(".segmented-wrapper")??T;if(_){const X=_.getBoundingClientRect(),He=Math.max(0,X.left),Rn=Math.max(0,X.top-84);k.style.setProperty("--note-x",`${He}px`),k.style.setProperty("--note-y",`${Rn}px`)}}}},x=m=>{f&&(f.classList.remove("active"),k&&k.classList.remove("active"),q())};if(f&&C.length>0){let m=0;I==null||I.addEventListener("click",()=>{m=Math.max(0,m-1),L(m)}),S==null||S.addEventListener("click",()=>{m=Math.min(C.length-1,m+1),L(m)}),y==null||y.addEventListener("click",()=>x()),H==null||H.addEventListener("click",()=>{m=Math.max(0,m-1),L(m)}),f.addEventListener("click",w=>{w.target===f&&x()}),window.addEventListener("resize",()=>{const w=Array.from(C).findIndex(_=>_.classList.contains("active"));w>=0&&L(w)}),localStorage.getItem(i)==="true"||(f.classList.add("active"),L(m))}V&&f&&C.length>0&&V.addEventListener("click",()=>{let m=0;f.classList.add("active"),localStorage.removeItem(i),L(m)});const M=document.querySelectorAll(".nav-item"),E=document.querySelectorAll(".page");function g(m){M.forEach(w=>w.classList.remove("active"));const v=document.getElementById(`nav-${m}`);v&&v.classList.add("active"),E.forEach(w=>w.classList.remove("active"));const T=document.getElementById(`page-${m}`);T&&T.classList.add("active")}M.forEach(m=>{m.addEventListener("click",()=>{const v=m.id.replace("nav-","");g(v)})})}let Ou={},xu={},Jf=[],Yf=[],Po="currency",ko="",Do="price",Yn="desc";function IT(n,e){return e?"Last updated: unavailable":n?`Last updated: ${new Date(n).toLocaleString()}`:"Last updated: --"}function Fu(){const n=document.getElementById("pricesLastUpdated");if(!n)return;const{lastUpdated:e,lastError:t}=ee.getPriceCacheStatus();n.textContent=IT(e,t)}function ET(n,e,t){if(n&&n.length>=2){const s=[...n].sort((c,u)=>c.date.localeCompare(u.date)),i=s[0],a=s[s.length-1];if(i.price>0){const u=(a.price-i.price)/i.price*100;return u>.01?{trend:"up",percent:u}:u<-.01?{trend:"down",percent:u}:{trend:"neutral",percent:0}}}return(Date.now()-t)/(1e3*60*60)<6?{trend:"neutral",percent:0}:{trend:"down",percent:-1.5}}function TT(n,e,t){const r=n.getContext("2d");if(!r||e.length===0)return;const s=n.width,i=n.height,a=2;if(r.clearRect(0,0,s,i),e.length===1){const S=i/2;r.strokeStyle=t==="up"?"#4CAF50":t==="down"?"#F44336":"#7E7E7E",r.lineWidth=1.5,r.beginPath(),r.moveTo(a,S),r.lineTo(s-a,S),r.stroke();return}const c=Math.min(...e),d=Math.max(...e)-c||1;let f;if(e.length>50){const S=Math.ceil(e.length/50);f=e.filter((P,C)=>C%S===0||C===e.length-1)}else f=e;const y=t==="up"||t==="neutral"&&f[f.length-1]>=f[0];r.strokeStyle=y?"#4CAF50":"#F44336",r.fillStyle=y?"rgba(76, 175, 80, 0.1)":"rgba(244, 67, 54, 0.1)",r.lineWidth=1.5,r.beginPath();const I=(s-a*2)/(f.length-1);f.forEach((S,P)=>{const C=a+P*I,k=(S-c)/d,V=i-a-k*(i-a*2);P===0?r.moveTo(C,V):r.lineTo(C,V)}),r.stroke(),r.lineTo(s-a,i-a),r.lineTo(a,i-a),r.closePath(),r.fill()}function wT(n,e){if(n&&n.length>0)return[...n].sort((s,i)=>s.date.localeCompare(i.date)).map(s=>s.price);const t=e>0?e:0;return new Array(7).fill(t)}function AT(n){return n===0?"0.00":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(2)+"K":n.toFixed(2)}function ST(n){return!n||Number.isNaN(n)?"--":new Date(n).toLocaleString()}function bT(n,e){const t=`sparkline-${n.baseId}`,r=wT(n.history,n.price),i=`./assets/${n.baseId}.webp`,a=`trend-${n.trend}`,c=AT(n.price),u=n.price>0,d=u?Of(n.timestamp):"",f=u?d:"no-price",y=u?`${n.trendPercent>0?"+":""}${n.trendPercent.toFixed(0)}%`:"";return`
    <tr class="prices-row" data-base-id="${n.baseId}">
      <td class="prices-col-name">
        <div class="prices-name-cell">
          <img src="${i}" alt="${n.name}" class="prices-item-icon" onerror="this.style.display='none'">
          <span class="prices-item-name">${CT(n.name)}</span>
        </div>
      </td>
      <td class="prices-col-updated">
        <span class="prices-updated-at">${ST(n.timestamp)}</span>
      </td>
      <td class="prices-col-price">
        <span class="prices-price-value ${f}">${c}</span>
      </td>
      <td class="prices-col-sparkline">
        <div class="prices-sparkline-cell">
          <canvas id="${t}" class="prices-sparkline" width="80" height="28" 
                  data-prices="${r.join(",")}" 
                  data-trend="${n.trend}"></canvas>
          <span class="prices-trend ${a}">${y}</span>
        </div>
      </td>
    </tr>
  `}function CT(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}function RT(n,e,t){return[...n].sort((s,i)=>{let a,c;switch(e){case"name":a=s.name.toLowerCase(),c=i.name.toLowerCase();break;case"price":a=s.price,c=i.price;break;case"trend":a=s.trendPercent,c=i.trendPercent;break;default:return 0}return a<c?t==="asc"?-1:1:a>c?t==="asc"?1:-1:0})}function ii(){const n=document.getElementById("pricesTableBody");if(!n)return;const e=RT(Yf,Do,Yn),t=document.getElementById("pricesItemCount");t&&(t.textContent=`${e.length} item${e.length!==1?"s":""}`),n.innerHTML=e.map((r,s)=>bT(r)).join(""),setTimeout(()=>{e.forEach(r=>{const s=document.getElementById(`sparkline-${r.baseId}`);if(s){const i=s.getAttribute("data-prices"),a=s.getAttribute("data-trend");if(i){const c=i.split(",").map(u=>parseFloat(u));TT(s,c,a)}}})},0)}async function Xi(){try{const[n,e]=await Promise.all([ee.getPriceCache(),ee.getItemDatabase()]);Ou=e,xu=n,Jf=Object.entries(Ou).map(([s,i])=>{if(s===En||i.tradable===!1)return null;const a=i.name||`Unknown Item (${s})`,c=xu[s],u=(c==null?void 0:c.price)??0,d=(c==null?void 0:c.timestamp)??Date.now(),f=c==null?void 0:c.listingCount,y=c==null?void 0:c.history,I=u>0?ET(y,u,d):{trend:"neutral",percent:0};return{baseId:s,name:a,price:u,timestamp:d,listingCount:f,trend:I.trend,trendPercent:I.percent,group:i.group,history:y}}).filter(s=>s!==null).sort((s,i)=>s.name.localeCompare(i.name)),Va(),ii(),Fu(),setInterval(Fu,60*1e3)}catch(n){console.error("Failed to load prices:",n)}}function Va(){let n=[...Jf];if(ko){const e=ko.toLowerCase();n=n.filter(t=>t.name.toLowerCase().includes(e)||t.baseId.toLowerCase().includes(e))}else Po!=="all"&&(n=n.filter(e=>e.group===Po));Yf=n}function Uu(n){ko=n.trim(),Va(),ii()}function PT(n){Po=n,document.querySelectorAll(".prices-sidebar-item").forEach(e=>{e.classList.remove("active"),e.getAttribute("data-group")===n&&e.classList.add("active")}),Va(),ii()}function kT(n){Do===n?Yn=Yn==="asc"?"desc":"asc":(Do=n,Yn="asc"),document.querySelectorAll(".prices-table th").forEach(e=>{e.classList.remove("sort-asc","sort-desc"),e.getAttribute("data-sort")===n&&e.classList.add(`sort-${Yn}`)}),ii()}function DT(){const n=document.getElementById("pricesSearchInput"),e=document.getElementById("pricesClearSearch"),t=document.querySelectorAll(".prices-table th[data-sort]");n&&n.addEventListener("input",i=>{const a=i.target.value;Uu(a),e&&(e.style.display=a?"block":"none")}),e&&e.addEventListener("click",()=>{n&&(n.value="",Uu(""),e.style.display="none")}),t.forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-sort");a&&kT(a)})}),document.querySelectorAll(".prices-sidebar-item").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-group");a&&PT(a)})});const s=document.getElementById("page-prices");s&&new MutationObserver(a=>{a.forEach(c=>{c.type==="attributes"&&c.attributeName==="class"&&s.classList.contains("active")&&Xi()})}).observe(s,{attributes:!0}),s!=null&&s.classList.contains("active")&&Xi(),ee.onInventoryUpdate(()=>{const i=document.getElementById("page-prices");i!=null&&i.classList.contains("active")&&Xi()})}function Zi(){const n=De(),e=wt();n==="hourly"&&e?Cr():ri()}function Xf(n){ir(),wt()&&!kf()&&or(),Ge(Ae)}async function Bu(){const[n,e]=await Promise.all([ee.getInventory(),ee.getItemDatabase()]);AE(e);const t=n.map(r=>r.baseId===En?{...r,price:1}:r);wE(t),OE()||($E(),xE(!0)),wt()&&!kf()&&zE(),Pa(),Ae(),Xf(),Ge(Ae)}async function NT(){gT(),eT(),rT(Ae,()=>Ge(Ae)),fT(),pT();const n=mT();hT(Ae,()=>Ge(Ae),Xf,n),BE(_u,vu,cr,Zi,tT),jE(_u,vu,Iu,ka,Da,Na,La,Zi,ou,sT,Ae,()=>Ge(Ae)),yT(Ae,()=>Ge(Ae),ir,or),_T(qE,QE,WE,KE,HE,ir,or,Ae,()=>Ge(Ae),Os,Zi,ou,aT,cT,Qf,lT,qf,iT),vT(),DT(),ee.onTimerTick(r=>{if(r.type==="realtime")Ea(r.seconds),De()==="realtime"&&(cr.textContent=In(r.seconds)),ir();else if(r.type==="hourly"){Rf(r.seconds),Iu.textContent=In(r.seconds);const s=Cr();if(De()==="hourly"){const i=Cn();i.push({time:Date.now(),value:s}),gr(i),Os()}or(),Ae(),Ge(Ae),r.seconds%3600===0&&r.seconds>0&&GE()}}),ee.onInventoryUpdate(()=>{Bu()});const[e,t]=await Promise.all([ee.getSettings(),ee.isLogPathConfigured()]);Co(e.includeTax!==void 0?e.includeTax:!1),t?(await Bu(),await iu()):await iu(),Gf()}async function $u(){await Yd(),await NT()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$u):$u();
