(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const tg=72*60*60*1e3,ng=7*24*60*60*1e3,rg=.125,Xt="100300",sg=7200;class ig{constructor(e,t={}){this.itemDatabase=e,this.inventory=new Map,this.priceCache=new Map;for(const[r,s]of Object.entries(t))this.priceCache.set(r,s)}buildInventory(e){const t=new Map;for(const r of e)t.set(r.fullId,r);this.inventory.clear();for(const r of t.values()){const s=this.itemDatabase[r.baseId];if(!s||s.tradable===!1)continue;const i=s.name;if(this.inventory.has(r.baseId)){const a=this.inventory.get(r.baseId);a.totalQuantity+=r.bagNum,a.instances+=1,r.timestamp>a.lastUpdated&&(a.lastUpdated=r.timestamp)}else{const a=this.priceCache.get(r.baseId),c=a?a.price:null,u=a?a.timestamp:null;this.inventory.set(r.baseId,{itemName:i,totalQuantity:r.bagNum,baseId:r.baseId,price:c,priceTimestamp:u,instances:1,lastUpdated:r.timestamp,pageId:r.pageId,slotId:r.slotId})}}return this.inventory}hydrateInventory(e){this.inventory.clear();for(const t of e)this.inventory.set(t.baseId,{...t})}updatePrice(e,t,r,s=Date.now()){const i=Math.floor(s/216e5)*216e5,a=new Date(i).toISOString().slice(0,13)+":00:00";let c=[];const u=this.priceCache.get(e);u!=null&&u.history&&Array.isArray(u.history)&&(c=[...u.history]);const d=c.findIndex(m=>m.date===a);d>=0?c[d]={date:a,price:t}:c.push({date:a,price:t}),c.sort((m,g)=>m.date.localeCompare(g.date)),c.length>28&&(c=c.slice(c.length-28));const f={price:t,timestamp:s,...r!==void 0&&{listingCount:r},...c.length>0&&{history:c}};if(this.priceCache.set(e,f),this.inventory.has(e)){const m=this.inventory.get(e);m.price=t,m.priceTimestamp=s}}applyPriceCache(e){for(const[t,r]of Object.entries(e))if(this.priceCache.set(t,r),this.inventory.has(t)){const s=this.inventory.get(t);s.price=r.price,s.priceTimestamp=r.timestamp}}getInventory(){return Array.from(this.inventory.values()).filter(e=>{const t=this.itemDatabase[e.baseId];return t!=null&&t.tradable!==!1}).sort((e,t)=>{const r=e.itemName.localeCompare(t.itemName);return r!==0?r:e.baseId.localeCompare(t.baseId)})}getInventoryMap(){return this.inventory}getPriceCacheAsObject(){const e={};return this.priceCache.forEach((t,r)=>{e[r]=t}),e}}const og="fenix_price_history",ag=1,Dn="priceHistory";function ba(){return typeof indexedDB<"u"}function cd(){return new Promise((n,e)=>{if(!ba()){e(new Error("IndexedDB not available"));return}const t=indexedDB.open(og,ag);t.onupgradeneeded=()=>{const r=t.result;r.objectStoreNames.contains(Dn)||r.createObjectStore(Dn,{keyPath:"baseId"})},t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error)})}function cg(n){return new Promise((e,t)=>{n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function ld(){try{if(!ba())return{};const n=await cd(),t=n.transaction(Dn,"readonly").objectStore(Dn),r=await cg(t.getAll());n.close();const s={};for(const i of r)i!=null&&i.baseId&&Array.isArray(i.history)&&(s[i.baseId]=i.history);return s}catch(n){return console.error("Failed to load price history from IndexedDB:",n),{}}}async function lg(n){try{if(!ba())return;const e=await cd(),t=e.transaction(Dn,"readwrite"),r=t.objectStore(Dn),s=Date.now();Object.entries(n).forEach(([i,a])=>{r.put({baseId:i,history:a,updatedAt:s})}),await new Promise((i,a)=>{t.oncomplete=()=>i(),t.onerror=()=>a(t.error),t.onabort=()=>a(t.error)}),e.close()}catch(e){console.error("Failed to save price history to IndexedDB:",e)}}function ug(n,e,t){const r=Array.isArray(n)?[...n]:[],s=Math.floor(t/(6*60*60*1e3))*(6*60*60*1e3),i=new Date(s).toISOString().slice(0,13)+":00:00",a=r.findIndex(c=>c.date===i);return a>=0?r[a]={date:i,price:e}:r.push({date:i,price:e}),r.sort((c,u)=>c.date.localeCompare(u.date)),r.length>28?r.slice(r.length-28):r}async function Kl(n){const e=await ld(),t={},r={};for(const[s,i]of Object.entries(n)){const a=ug(e[s],i.price,i.timestamp);t[s]=a,r[s]={...i,history:a}}return Object.keys(t).length>0&&await lg(t),r}function hg(n,e){const t={...n};for(const[r,s]of Object.entries(e)){const i=n[r],a=s.listingCount??0,c=(i==null?void 0:i.listingCount)??0;let u="use-cloud";i&&(s.timestamp>i.timestamp?u="use-cloud":s.timestamp<i.timestamp?u="keep-local":a>c?u="use-cloud":u="keep-local"),u==="use-cloud"&&(t[r]={...s,...(i==null?void 0:i.history)&&{history:i.history}})}return t}const ud="fenix_price_cache";async function hd(){try{let e=await fetch("./item_database.json");if(!e.ok)throw new Error(`Failed to load item database: ${e.statusText}`);return await e.json()}catch(n){return console.error("Failed to load item database:",n),{}}}async function dd(n){try{const e=localStorage.getItem(ud);let t={};if(e){const s=JSON.parse(e),i={};let a=!1;for(const[c,u]of Object.entries(s))typeof u=="number"?(i[c]={price:u,timestamp:Date.now()},a=!0):i[c]=u;a&&console.log("Migrated price cache to new format with timestamps"),t=i}const r=await ld();if(Object.keys(r).length>0)for(const[s,i]of Object.entries(r))t[s]&&(t[s]={...t[s],history:i});if(!n)return t;try{const s=Object.keys(t).length===0,i=await n({forceFull:s}),a=hg(t,i);return Object.keys(i).length>0&&await mr(a),a}catch(s){return console.error("Failed to load cloud price cache:",s),t}}catch(e){return console.error("Failed to load price cache:",e),{}}}async function mr(n){try{localStorage.setItem(ud,JSON.stringify(n))}catch(e){console.error("Failed to save price cache:",e)}}const fd="fenix_config";function pd(){try{const n=localStorage.getItem(fd);if(n)return JSON.parse(n)}catch(n){console.warn("Failed to read config from localStorage:",n)}return{}}function dg(n){try{localStorage.setItem(fd,JSON.stringify(n))}catch(e){throw console.error("Failed to save config to localStorage:",e),e}}function fg(){return pd().settings||{}}function pg(n){const e=pd();e.settings={...e.settings,...n},dg(e)}function mg(n){return n.split("_")[0]}function Sa(n){return n!==null&&n>=100}function Ql(n){if(!n.includes("BagMgr@:InitBagData"))return null;const e=n.match(/PageId\s*=\s*(\d+)/),t=e?parseInt(e[1]):null;if(!Sa(t))return null;const r=n.match(/SlotId\s*=\s*(\d+)/),s=r?parseInt(r[1]):null,i=n.match(/ConfigBaseId\s*=\s*(\d+)/);if(!i)return null;const a=i[1],c=n.match(/Num\s*=\s*(\d+)/);if(!c)return null;const u=parseInt(c[1]),d=n.match(/\[([\d\.\-:]+)\]/),f=d?d[1]:"unknown",m=`${a}_init_${t}_${s}_${f}`;return{timestamp:f,action:"Add",fullId:m,baseId:a,bagNum:u,slotId:s,pageId:t}}function Yl(n){const e=n.match(/Id=([^\s]+)/);if(!e)return null;const t=e[1],r=mg(t);let s="Unknown";n.includes("ItemChange@ Add")?s="Add":n.includes("ItemChange@ Update")?s="Update":n.includes("ItemChange@ Remove")?s="Remove":n.includes("ItemChange@ Delete")&&(s="Delete");const i=n.match(/BagNum=(\d+)/);let a=0;if(i)a=parseInt(i[1]);else if(s!=="Delete")return null;const c=n.match(/in\s+PageId\s*=\s*(\d+)/)||n.match(/PageId\s*=\s*(\d+)/),u=c?parseInt(c[1]):null;if(!Sa(u))return null;const d=n.match(/\[([\d\.\-:]+)\]/),f=d?d[1]:"unknown",m=n.match(/SlotId\s*=\s*(\d+)/),g=m?parseInt(m[1]):null;return{timestamp:f,action:s,fullId:t,baseId:r,bagNum:a,slotId:g,pageId:u}}function gg(n){const e=n.split(`
`);let t=-1,r=-1;for(let u=e.length-1;u>=0;u--){const d=e[u];if(d.includes("ItemChange@ ProtoName=ResetItemsLayout end")&&r===-1&&(r=u),d.includes("ItemChange@ ProtoName=ResetItemsLayout start")&&t===-1&&r!==-1){t=u;break}}if(t!==-1&&r!==-1){const u=[],d=Math.min(r+500,e.length),f=new Set;for(let m=r;m<d;m++){const g=e[m];if(g.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const E=Ql(g);if(E){const C=u.findIndex(R=>R.pageId===E.pageId&&R.slotId===E.slotId&&R.slotId!==null&&E.slotId!==null);C>=0?u[C]=E:u.push(E),E.pageId!==null&&f.add(E.pageId)}}for(let m=d;m<e.length;m++){const g=e[m];if(g.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const E=Ql(g);if(E){const C=u.findIndex(R=>R.pageId===E.pageId&&R.slotId===E.slotId&&R.slotId!==null&&E.slotId!==null);C>=0?u[C]=E:u.push(E),E.pageId!==null&&f.add(E.pageId)}if(f.size>=2){let C=!1;for(let R=m+1;R<Math.min(m+50,e.length);R++){if(e[R].includes("BagMgr@:InitBagData")){C=!0;break}if(e[R].includes("ItemChange@ ProtoName=ResetItemsLayout start"))break}if(!C)break}}for(let m=r;m<e.length;m++){const g=e[m];if(g.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;if(g.includes("ItemChange@")&&g.includes("Id=")){const E=Yl(g);if(E){const C=u.findIndex(R=>R.fullId===E.fullId);if(C>=0)u[C]=E;else if(E.slotId!==null){const R=u.findIndex(P=>P.baseId===E.baseId&&P.pageId===E.pageId&&P.slotId===E.slotId&&P.slotId!==null);R>=0?u[R]=E:u.push(E)}else u.push(E)}}}if(u.length>0)return u}const s=new Map;for(let u=e.length-1;u>=0;u--){const f=e[u].match(/ItemChange@\s+Reset\s+PageId=(\d+)/);if(!f)continue;const m=parseInt(f[1]);Sa(m)&&(s.has(m)||s.set(m,u))}let i=1/0;s.forEach(u=>{u<i&&(i=u)});const a=i===1/0?e:e.slice(i),c=[];for(const u of a)if(u.includes("ItemChange@")&&u.includes("Id=")){const d=Yl(u);d&&c.push(d)}return c}var Jl={};/**
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
 */const md=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},yg=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},gd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,u=s+2<n.length,d=u?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let g=(c&15)<<2|d>>6,E=d&63;u||(E=64,a||(g=64)),r.push(t[f],t[m],t[g],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(md(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):yg(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||d==null||m==null)throw new _g;const g=i<<2|c>>4;if(r.push(g),d!==64){const E=c<<4&240|d>>2;if(r.push(E),m!==64){const C=d<<6&192|m;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class _g extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const vg=function(n){const e=md(n);return gd.encodeByteArray(e,!0)},js=function(n){return vg(n).replace(/\./g,"")},yd=function(n){try{return gd.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Ig(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Eg=()=>Ig().__FIREBASE_DEFAULTS__,wg=()=>{if(typeof process>"u"||typeof Jl>"u")return;const n=Jl.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Tg=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&yd(n[1]);return e&&JSON.parse(e)},di=()=>{try{return Eg()||wg()||Tg()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},_d=n=>{var e,t;return(t=(e=di())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Ag=n=>{const e=_d(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},vd=()=>{var n;return(n=di())===null||n===void 0?void 0:n.config},Id=n=>{var e;return(e=di())===null||e===void 0?void 0:e[`_${n}`]};/**
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
 */class bg{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function Sg(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[js(JSON.stringify(t)),js(JSON.stringify(a)),""].join(".")}/**
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
 */function ke(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Cg(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ke())}function Rg(){var n;const e=(n=di())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Pg(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function kg(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Dg(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ng(){const n=ke();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Vg(){return!Rg()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Lg(){try{return typeof indexedDB=="object"}catch{return!1}}function xg(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const Mg="FirebaseError";class lt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Mg,Object.setPrototypeOf(this,lt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Br.prototype.create)}}class Br{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Og(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new lt(s,c,r)}}function Og(n,e){return n.replace(Fg,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Fg=/\{\$([^}]+)}/g;function Ug(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function qs(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(Xl(i)&&Xl(a)){if(!qs(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Xl(n){return n!==null&&typeof n=="object"}/**
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
 */function $r(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Bg(n,e){const t=new $g(n,e);return t.subscribe.bind(t)}class $g{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Hg(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=lo),s.error===void 0&&(s.error=lo),s.complete===void 0&&(s.complete=lo);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Hg(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function lo(){}/**
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
 */function Ue(n){return n&&n._delegate?n._delegate:n}class Zt{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Gt="[DEFAULT]";/**
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
 */class jg{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new bg;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(zg(e))try{this.getOrInitializeService({instanceIdentifier:Gt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Gt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Gt){return this.instances.has(e)}getOptions(e=Gt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:qg(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Gt){return this.component?this.component.multipleInstances?e:Gt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function qg(n){return n===Gt?void 0:n}function zg(n){return n.instantiationMode==="EAGER"}/**
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
 */class Gg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new jg(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var H;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(H||(H={}));const Wg={debug:H.DEBUG,verbose:H.VERBOSE,info:H.INFO,warn:H.WARN,error:H.ERROR,silent:H.SILENT},Kg=H.INFO,Qg={[H.DEBUG]:"log",[H.VERBOSE]:"log",[H.INFO]:"info",[H.WARN]:"warn",[H.ERROR]:"error"},Yg=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Qg[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ca{constructor(e){this.name=e,this._logLevel=Kg,this._logHandler=Yg,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in H))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Wg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,H.DEBUG,...e),this._logHandler(this,H.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,H.VERBOSE,...e),this._logHandler(this,H.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,H.INFO,...e),this._logHandler(this,H.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,H.WARN,...e),this._logHandler(this,H.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,H.ERROR,...e),this._logHandler(this,H.ERROR,...e)}}const Jg=(n,e)=>e.some(t=>n instanceof t);let Zl,eu;function Xg(){return Zl||(Zl=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Zg(){return eu||(eu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Ed=new WeakMap,Ho=new WeakMap,wd=new WeakMap,uo=new WeakMap,Ra=new WeakMap;function ey(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t(wt(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Ed.set(t,n)}).catch(()=>{}),Ra.set(e,n),e}function ty(n){if(Ho.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});Ho.set(n,e)}let jo={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Ho.get(n);if(e==="objectStoreNames")return n.objectStoreNames||wd.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return wt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function ny(n){jo=n(jo)}function ry(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(ho(this),e,...t);return wd.set(r,e.sort?e.sort():[e]),wt(r)}:Zg().includes(n)?function(...e){return n.apply(ho(this),e),wt(Ed.get(this))}:function(...e){return wt(n.apply(ho(this),e))}}function sy(n){return typeof n=="function"?ry(n):(n instanceof IDBTransaction&&ty(n),Jg(n,Xg())?new Proxy(n,jo):n)}function wt(n){if(n instanceof IDBRequest)return ey(n);if(uo.has(n))return uo.get(n);const e=sy(n);return e!==n&&(uo.set(n,e),Ra.set(e,n)),e}const ho=n=>Ra.get(n);function iy(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(n,e),c=wt(a);return r&&a.addEventListener("upgradeneeded",u=>{r(wt(a.result),u.oldVersion,u.newVersion,wt(a.transaction),u)}),t&&a.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const oy=["get","getKey","getAll","getAllKeys","count"],ay=["put","add","delete","clear"],fo=new Map;function tu(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(fo.get(e))return fo.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=ay.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||oy.includes(t)))return;const i=async function(a,...c){const u=this.transaction(a,s?"readwrite":"readonly");let d=u.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[t](...c),s&&u.done]))[0]};return fo.set(e,i),i}ny(n=>({...n,get:(e,t,r)=>tu(e,t)||n.get(e,t,r),has:(e,t)=>!!tu(e,t)||n.has(e,t)}));/**
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
 */class cy{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(ly(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function ly(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const qo="@firebase/app",nu="0.10.13";/**
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
 */const it=new Ca("@firebase/app"),uy="@firebase/app-compat",hy="@firebase/analytics-compat",dy="@firebase/analytics",fy="@firebase/app-check-compat",py="@firebase/app-check",my="@firebase/auth",gy="@firebase/auth-compat",yy="@firebase/database",_y="@firebase/data-connect",vy="@firebase/database-compat",Iy="@firebase/functions",Ey="@firebase/functions-compat",wy="@firebase/installations",Ty="@firebase/installations-compat",Ay="@firebase/messaging",by="@firebase/messaging-compat",Sy="@firebase/performance",Cy="@firebase/performance-compat",Ry="@firebase/remote-config",Py="@firebase/remote-config-compat",ky="@firebase/storage",Dy="@firebase/storage-compat",Ny="@firebase/firestore",Vy="@firebase/vertexai-preview",Ly="@firebase/firestore-compat",xy="firebase",My="10.14.1";/**
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
 */const zo="[DEFAULT]",Oy={[qo]:"fire-core",[uy]:"fire-core-compat",[dy]:"fire-analytics",[hy]:"fire-analytics-compat",[py]:"fire-app-check",[fy]:"fire-app-check-compat",[my]:"fire-auth",[gy]:"fire-auth-compat",[yy]:"fire-rtdb",[_y]:"fire-data-connect",[vy]:"fire-rtdb-compat",[Iy]:"fire-fn",[Ey]:"fire-fn-compat",[wy]:"fire-iid",[Ty]:"fire-iid-compat",[Ay]:"fire-fcm",[by]:"fire-fcm-compat",[Sy]:"fire-perf",[Cy]:"fire-perf-compat",[Ry]:"fire-rc",[Py]:"fire-rc-compat",[ky]:"fire-gcs",[Dy]:"fire-gcs-compat",[Ny]:"fire-fst",[Ly]:"fire-fst-compat",[Vy]:"fire-vertex","fire-js":"fire-js",[xy]:"fire-js-all"};/**
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
 */const zs=new Map,Fy=new Map,Go=new Map;function ru(n,e){try{n.container.addComponent(e)}catch(t){it.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Nn(n){const e=n.name;if(Go.has(e))return it.debug(`There were multiple attempts to register component ${e}.`),!1;Go.set(e,n);for(const t of zs.values())ru(t,n);for(const t of Fy.values())ru(t,n);return!0}function Pa(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function tt(n){return n.settings!==void 0}/**
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
 */const Uy={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Tt=new Br("app","Firebase",Uy);/**
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
 */class By{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Zt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Tt.create("app-deleted",{appName:this._name})}}/**
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
 */const $n=My;function Td(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:zo,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw Tt.create("bad-app-name",{appName:String(s)});if(t||(t=vd()),!t)throw Tt.create("no-options");const i=zs.get(s);if(i){if(qs(t,i.options)&&qs(r,i.config))return i;throw Tt.create("duplicate-app",{appName:s})}const a=new Gg(s);for(const u of Go.values())a.addComponent(u);const c=new By(t,r,a);return zs.set(s,c),c}function Ad(n=zo){const e=zs.get(n);if(!e&&n===zo&&vd())return Td();if(!e)throw Tt.create("no-app",{appName:n});return e}function At(n,e,t){var r;let s=(r=Oy[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const c=[`Unable to register library "${s}" with version "${e}":`];i&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),it.warn(c.join(" "));return}Nn(new Zt(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const $y="firebase-heartbeat-database",Hy=1,Sr="firebase-heartbeat-store";let po=null;function bd(){return po||(po=iy($y,Hy,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Sr)}catch(t){console.warn(t)}}}}).catch(n=>{throw Tt.create("idb-open",{originalErrorMessage:n.message})})),po}async function jy(n){try{const t=(await bd()).transaction(Sr),r=await t.objectStore(Sr).get(Sd(n));return await t.done,r}catch(e){if(e instanceof lt)it.warn(e.message);else{const t=Tt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});it.warn(t.message)}}}async function su(n,e){try{const r=(await bd()).transaction(Sr,"readwrite");await r.objectStore(Sr).put(e,Sd(n)),await r.done}catch(t){if(t instanceof lt)it.warn(t.message);else{const r=Tt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});it.warn(r.message)}}}function Sd(n){return`${n.name}!${n.options.appId}`}/**
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
 */const qy=1024,zy=30*24*60*60*1e3;class Gy{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Ky(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=iu();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=zy}),this._storage.overwrite(this._heartbeatsCache))}catch(r){it.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=iu(),{heartbeatsToSend:r,unsentEntries:s}=Wy(this._heartbeatsCache.heartbeats),i=js(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return it.warn(t),""}}}function iu(){return new Date().toISOString().substring(0,10)}function Wy(n,e=qy){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),ou(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ou(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Ky{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Lg()?xg().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await jy(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return su(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return su(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ou(n){return js(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function Qy(n){Nn(new Zt("platform-logger",e=>new cy(e),"PRIVATE")),Nn(new Zt("heartbeat",e=>new Gy(e),"PRIVATE")),At(qo,nu,n),At(qo,nu,"esm2017"),At("fire-js","")}Qy("");var Yy="firebase",Jy="10.14.1";/**
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
 */At(Yy,Jy,"app");function ka(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function Cd(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Xy=Cd,Rd=new Br("auth","Firebase",Cd());/**
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
 */const Gs=new Ca("@firebase/auth");function Zy(n,...e){Gs.logLevel<=H.WARN&&Gs.warn(`Auth (${$n}): ${n}`,...e)}function Ps(n,...e){Gs.logLevel<=H.ERROR&&Gs.error(`Auth (${$n}): ${n}`,...e)}/**
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
 */function ot(n,...e){throw Da(n,...e)}function Ge(n,...e){return Da(n,...e)}function Pd(n,e,t){const r=Object.assign(Object.assign({},Xy()),{[e]:t});return new Br("auth","Firebase",r).create(e,{appName:n.name})}function bt(n){return Pd(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Da(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Rd.create(n,...e)}function F(n,e,...t){if(!n)throw Da(e,...t)}function nt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ps(e),new Error(e)}function at(n,e){n||nt(e)}/**
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
 */function Wo(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function e_(){return au()==="http:"||au()==="https:"}function au(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
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
 */function t_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(e_()||kg()||"connection"in navigator)?navigator.onLine:!0}function n_(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class Hr{constructor(e,t){this.shortDelay=e,this.longDelay=t,at(t>e,"Short delay should be less than long delay!"),this.isMobile=Cg()||Dg()}get(){return t_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Na(n,e){at(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class kd{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;nt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;nt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;nt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const r_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const s_=new Hr(3e4,6e4);function fi(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Hn(n,e,t,r,s={}){return Dd(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const c=$r(Object.assign({key:n.config.apiKey},a)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:u},i);return Pg()||(d.referrerPolicy="no-referrer"),kd.fetch()(Vd(n,n.config.apiHost,t,c),d)})}async function Dd(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},r_),e);try{const s=new i_(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Is(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[u,d]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Is(n,"credential-already-in-use",a);if(u==="EMAIL_EXISTS")throw Is(n,"email-already-in-use",a);if(u==="USER_DISABLED")throw Is(n,"user-disabled",a);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Pd(n,f,d);ot(n,f)}}catch(s){if(s instanceof lt)throw s;ot(n,"network-request-failed",{message:String(s)})}}async function Nd(n,e,t,r,s={}){const i=await Hn(n,e,t,r,s);return"mfaPendingCredential"in i&&ot(n,"multi-factor-auth-required",{_serverResponse:i}),i}function Vd(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?Na(n.config,s):`${n.config.apiScheme}://${s}`}class i_{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Ge(this.auth,"network-request-failed")),s_.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Is(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Ge(n,e,r);return s.customData._tokenResponse=t,s}/**
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
 */async function o_(n,e){return Hn(n,"POST","/v1/accounts:delete",e)}async function Ld(n,e){return Hn(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function gr(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function a_(n,e=!1){const t=Ue(n),r=await t.getIdToken(e),s=Va(r);F(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:gr(mo(s.auth_time)),issuedAtTime:gr(mo(s.iat)),expirationTime:gr(mo(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function mo(n){return Number(n)*1e3}function Va(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Ps("JWT malformed, contained fewer than 3 sections"),null;try{const s=yd(t);return s?JSON.parse(s):(Ps("Failed to decode base64 JWT payload"),null)}catch(s){return Ps("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function cu(n){const e=Va(n);return F(e,"internal-error"),F(typeof e.exp<"u","internal-error"),F(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Cr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof lt&&c_(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function c_({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class l_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Ko{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=gr(this.lastLoginAt),this.creationTime=gr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Ws(n){var e;const t=n.auth,r=await n.getIdToken(),s=await Cr(n,Ld(t,{idToken:r}));F(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?xd(i.providerUserInfo):[],c=h_(n.providerData,a),u=n.isAnonymous,d=!(n.email&&i.passwordHash)&&!(c!=null&&c.length),f=u?d:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:c,metadata:new Ko(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function u_(n){const e=Ue(n);await Ws(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function h_(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function xd(n){return n.map(e=>{var{providerId:t}=e,r=ka(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function d_(n,e){const t=await Dd(n,{},async()=>{const r=$r({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=Vd(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",kd.fetch()(a,{method:"POST",headers:c,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function f_(n,e){return Hn(n,"POST","/v2/accounts:revokeToken",fi(n,e))}/**
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
 */class Tn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){F(e.idToken,"internal-error"),F(typeof e.idToken<"u","internal-error"),F(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):cu(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){F(e.length!==0,"internal-error");const t=cu(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(F(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await d_(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new Tn;return r&&(F(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(F(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(F(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Tn,this.toJSON())}_performRefresh(){return nt("not implemented")}}/**
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
 */function mt(n,e){F(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class rt{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=ka(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new l_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Ko(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Cr(this,this.stsTokenManager.getToken(this.auth,e));return F(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return a_(this,e)}reload(){return u_(this)}_assign(e){this!==e&&(F(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new rt(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){F(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Ws(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(tt(this.auth.app))return Promise.reject(bt(this.auth));const e=await this.getIdToken();return await Cr(this,o_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,a,c,u,d,f;const m=(r=t.displayName)!==null&&r!==void 0?r:void 0,g=(s=t.email)!==null&&s!==void 0?s:void 0,E=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,C=(a=t.photoURL)!==null&&a!==void 0?a:void 0,R=(c=t.tenantId)!==null&&c!==void 0?c:void 0,P=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,N=(d=t.createdAt)!==null&&d!==void 0?d:void 0,O=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:B,emailVerified:z,isAnonymous:he,providerData:J,stsTokenManager:T}=t;F(B&&T,e,"internal-error");const _=Tn.fromJSON(this.name,T);F(typeof B=="string",e,"internal-error"),mt(m,e.name),mt(g,e.name),F(typeof z=="boolean",e,"internal-error"),F(typeof he=="boolean",e,"internal-error"),mt(E,e.name),mt(C,e.name),mt(R,e.name),mt(P,e.name),mt(N,e.name),mt(O,e.name);const I=new rt({uid:B,auth:e,email:g,emailVerified:z,displayName:m,isAnonymous:he,photoURL:C,phoneNumber:E,tenantId:R,stsTokenManager:_,createdAt:N,lastLoginAt:O});return J&&Array.isArray(J)&&(I.providerData=J.map(v=>Object.assign({},v))),P&&(I._redirectEventId=P),I}static async _fromIdTokenResponse(e,t,r=!1){const s=new Tn;s.updateFromServerResponse(t);const i=new rt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Ws(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];F(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?xd(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Tn;c.updateFromIdToken(r);const u=new rt({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Ko(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,d),u}}/**
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
 */const lu=new Map;function st(n){at(n instanceof Function,"Expected a class definition");let e=lu.get(n);return e?(at(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,lu.set(n,e),e)}/**
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
 */class Md{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Md.type="NONE";const uu=Md;/**
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
 */function ks(n,e,t){return`firebase:${n}:${e}:${t}`}class An{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=ks(this.userKey,s.apiKey,i),this.fullPersistenceKey=ks("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?rt._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new An(st(uu),e,r);const s=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let i=s[0]||st(uu);const a=ks(r,e.config.apiKey,e.name);let c=null;for(const d of t)try{const f=await d._get(a);if(f){const m=rt._fromJSON(e,f);d!==i&&(c=m),i=d;break}}catch{}const u=s.filter(d=>d._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new An(i,e,r):(i=u[0],c&&await i._set(a,c.toJSON()),await Promise.all(t.map(async d=>{if(d!==i)try{await d._remove(a)}catch{}})),new An(i,e,r))}}/**
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
 */function hu(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Bd(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Od(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Hd(e))return"Blackberry";if(jd(e))return"Webos";if(Fd(e))return"Safari";if((e.includes("chrome/")||Ud(e))&&!e.includes("edge/"))return"Chrome";if($d(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Od(n=ke()){return/firefox\//i.test(n)}function Fd(n=ke()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ud(n=ke()){return/crios\//i.test(n)}function Bd(n=ke()){return/iemobile/i.test(n)}function $d(n=ke()){return/android/i.test(n)}function Hd(n=ke()){return/blackberry/i.test(n)}function jd(n=ke()){return/webos/i.test(n)}function La(n=ke()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function p_(n=ke()){var e;return La(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function m_(){return Ng()&&document.documentMode===10}function qd(n=ke()){return La(n)||$d(n)||jd(n)||Hd(n)||/windows phone/i.test(n)||Bd(n)}/**
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
 */function zd(n,e=[]){let t;switch(n){case"Browser":t=hu(ke());break;case"Worker":t=`${hu(ke())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${$n}/${r}`}/**
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
 */class g_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const u=e(i);a(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function y_(n,e={}){return Hn(n,"GET","/v2/passwordPolicy",fi(n,e))}/**
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
 */const __=6;class v_{constructor(e){var t,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:__,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,a,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(a=u.containsNumericCharacter)!==null&&a!==void 0?a:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class I_{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new du(this),this.idTokenSubscription=new du(this),this.beforeStateQueue=new g_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Rd,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=st(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await An.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Ld(this,{idToken:e}),r=await rt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(tt(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!a||a===c)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return F(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ws(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=n_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(tt(this.app))return Promise.reject(bt(this));const t=e?Ue(e):null;return t&&F(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&F(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return tt(this.app)?Promise.reject(bt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return tt(this.app)?Promise.reject(bt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(st(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await y_(this),t=new v_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Br("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await f_(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&st(e)||this._popupRedirectResolver;F(t,this,"argument-error"),this.redirectPersistenceManager=await An.create(this,[st(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(F(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{a=!0,u()}}else{const u=e.addObserver(t);return()=>{a=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return F(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=zd(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Zy(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function pi(n){return Ue(n)}class du{constructor(e){this.auth=e,this.observer=null,this.addObserver=Bg(t=>this.observer=t)}get next(){return F(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let xa={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function E_(n){xa=n}function w_(n){return xa.loadJS(n)}function T_(){return xa.gapiScript}function A_(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function b_(n,e){const t=Pa(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(qs(i,e??{}))return s;ot(s,"already-initialized")}return t.initialize({options:e})}function S_(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(st);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function C_(n,e,t){const r=pi(n);F(r._canInitEmulator,r,"emulator-config-failed"),F(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Gd(e),{host:a,port:c}=R_(e),u=c===null?"":`:${c}`;r.config.emulator={url:`${i}//${a}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),P_()}function Gd(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function R_(n){const e=Gd(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:fu(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:fu(a)}}}function fu(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function P_(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class Wd{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return nt("not implemented")}_getIdTokenResponse(e){return nt("not implemented")}_linkToIdToken(e,t){return nt("not implemented")}_getReauthenticationResolver(e){return nt("not implemented")}}/**
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
 */async function bn(n,e){return Nd(n,"POST","/v1/accounts:signInWithIdp",fi(n,e))}/**
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
 */const k_="http://localhost";class en extends Wd{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new en(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):ot("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=ka(t,["providerId","signInMethod"]);if(!r||!s)return null;const a=new en(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return bn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,bn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,bn(e,t)}buildRequest(){const e={requestUri:k_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=$r(t)}return e}}/**
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
 */class Kd{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class jr extends Kd{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class gt extends jr{constructor(){super("facebook.com")}static credential(e){return en._fromParams({providerId:gt.PROVIDER_ID,signInMethod:gt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return gt.credentialFromTaggedObject(e)}static credentialFromError(e){return gt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return gt.credential(e.oauthAccessToken)}catch{return null}}}gt.FACEBOOK_SIGN_IN_METHOD="facebook.com";gt.PROVIDER_ID="facebook.com";/**
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
 */class yt extends jr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return en._fromParams({providerId:yt.PROVIDER_ID,signInMethod:yt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return yt.credentialFromTaggedObject(e)}static credentialFromError(e){return yt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return yt.credential(t,r)}catch{return null}}}yt.GOOGLE_SIGN_IN_METHOD="google.com";yt.PROVIDER_ID="google.com";/**
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
 */class _t extends jr{constructor(){super("github.com")}static credential(e){return en._fromParams({providerId:_t.PROVIDER_ID,signInMethod:_t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return _t.credentialFromTaggedObject(e)}static credentialFromError(e){return _t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return _t.credential(e.oauthAccessToken)}catch{return null}}}_t.GITHUB_SIGN_IN_METHOD="github.com";_t.PROVIDER_ID="github.com";/**
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
 */class vt extends jr{constructor(){super("twitter.com")}static credential(e,t){return en._fromParams({providerId:vt.PROVIDER_ID,signInMethod:vt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return vt.credentialFromTaggedObject(e)}static credentialFromError(e){return vt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return vt.credential(t,r)}catch{return null}}}vt.TWITTER_SIGN_IN_METHOD="twitter.com";vt.PROVIDER_ID="twitter.com";/**
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
 */async function D_(n,e){return Nd(n,"POST","/v1/accounts:signUp",fi(n,e))}/**
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
 */class kt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await rt._fromIdTokenResponse(e,r,s),a=pu(r);return new kt({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=pu(r);return new kt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function pu(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function N_(n){var e;if(tt(n.app))return Promise.reject(bt(n));const t=pi(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new kt({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await D_(t,{returnSecureToken:!0}),s=await kt._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
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
 */class Ks extends lt{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Ks.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Ks(e,t,r,s)}}function Qd(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ks._fromErrorAndOperation(n,i,e,r):i})}async function V_(n,e,t=!1){const r=await Cr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return kt._forOperation(n,"link",r)}/**
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
 */async function L_(n,e,t=!1){const{auth:r}=n;if(tt(r.app))return Promise.reject(bt(r));const s="reauthenticate";try{const i=await Cr(n,Qd(r,s,e,n),t);F(i.idToken,r,"internal-error");const a=Va(i.idToken);F(a,r,"internal-error");const{sub:c}=a;return F(n.uid===c,r,"user-mismatch"),kt._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&ot(r,"user-mismatch"),i}}/**
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
 */async function x_(n,e,t=!1){if(tt(n.app))return Promise.reject(bt(n));const r="signIn",s=await Qd(n,r,e),i=await kt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function M_(n,e,t,r){return Ue(n).onIdTokenChanged(e,t,r)}function O_(n,e,t){return Ue(n).beforeAuthStateChanged(e,t)}const Qs="__sak";/**
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
 */class Yd{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Qs,"1"),this.storage.removeItem(Qs),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const F_=1e3,U_=10;class Jd extends Yd{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=qd(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,u)=>{this.notifyListeners(a,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);m_()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,U_):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},F_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Jd.type="LOCAL";const B_=Jd;/**
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
 */class Xd extends Yd{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Xd.type="SESSION";const Zd=Xd;/**
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
 */function $_(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class mi{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new mi(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async d=>d(t.origin,i)),u=await $_(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}mi.receivers=[];/**
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
 */function Ma(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class H_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,u)=>{const d=Ma("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const g=m;if(g.data.eventId===d)switch(g.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(g.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function We(){return window}function j_(n){We().location.href=n}/**
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
 */function ef(){return typeof We().WorkerGlobalScope<"u"&&typeof We().importScripts=="function"}async function q_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function z_(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function G_(){return ef()?self:null}/**
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
 */const tf="firebaseLocalStorageDb",W_=1,Ys="firebaseLocalStorage",nf="fbase_key";class qr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function gi(n,e){return n.transaction([Ys],e?"readwrite":"readonly").objectStore(Ys)}function K_(){const n=indexedDB.deleteDatabase(tf);return new qr(n).toPromise()}function Qo(){const n=indexedDB.open(tf,W_);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Ys,{keyPath:nf})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Ys)?e(r):(r.close(),await K_(),e(await Qo()))})})}async function mu(n,e,t){const r=gi(n,!0).put({[nf]:e,value:t});return new qr(r).toPromise()}async function Q_(n,e){const t=gi(n,!1).get(e),r=await new qr(t).toPromise();return r===void 0?null:r.value}function gu(n,e){const t=gi(n,!0).delete(e);return new qr(t).toPromise()}const Y_=800,J_=3;class rf{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Qo(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>J_)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ef()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=mi._getInstance(G_()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await q_(),!this.activeServiceWorker)return;this.sender=new H_(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||z_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Qo();return await mu(e,Qs,"1"),await gu(e,Qs),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>mu(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Q_(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>gu(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=gi(s,!1).getAll();return new qr(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Y_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}rf.type="LOCAL";const X_=rf;new Hr(3e4,6e4);/**
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
 */function Z_(n,e){return e?st(e):(F(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class Oa extends Wd{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return bn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return bn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return bn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function ev(n){return x_(n.auth,new Oa(n),n.bypassAuthState)}function tv(n){const{auth:e,user:t}=n;return F(t,e,"internal-error"),L_(t,new Oa(n),n.bypassAuthState)}async function nv(n){const{auth:e,user:t}=n;return F(t,e,"internal-error"),V_(t,new Oa(n),n.bypassAuthState)}/**
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
 */class sf{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return ev;case"linkViaPopup":case"linkViaRedirect":return nv;case"reauthViaPopup":case"reauthViaRedirect":return tv;default:ot(this.auth,"internal-error")}}resolve(e){at(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){at(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const rv=new Hr(2e3,1e4);class In extends sf{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,In.currentPopupAction&&In.currentPopupAction.cancel(),In.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return F(e,this.auth,"internal-error"),e}async onExecution(){at(this.filter.length===1,"Popup operations only handle one event");const e=Ma();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ge(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ge(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,In.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ge(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,rv.get())};e()}}In.currentPopupAction=null;/**
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
 */const sv="pendingRedirect",Ds=new Map;class iv extends sf{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Ds.get(this.auth._key());if(!e){try{const r=await ov(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ds.set(this.auth._key(),e)}return this.bypassAuthState||Ds.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function ov(n,e){const t=lv(e),r=cv(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function av(n,e){Ds.set(n._key(),e)}function cv(n){return st(n._redirectPersistence)}function lv(n){return ks(sv,n.config.apiKey,n.name)}async function uv(n,e,t=!1){if(tt(n.app))return Promise.reject(bt(n));const r=pi(n),s=Z_(r,e),a=await new iv(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const hv=10*60*1e3;class dv{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!fv(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!of(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Ge(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=hv&&this.cachedEventUids.clear(),this.cachedEventUids.has(yu(e))}saveEventToCache(e){this.cachedEventUids.add(yu(e)),this.lastProcessedEventTime=Date.now()}}function yu(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function of({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function fv(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return of(n);default:return!1}}/**
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
 */async function pv(n,e={}){return Hn(n,"GET","/v1/projects",e)}/**
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
 */const mv=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,gv=/^https?/;async function yv(n){if(n.config.emulator)return;const{authorizedDomains:e}=await pv(n);for(const t of e)try{if(_v(t))return}catch{}ot(n,"unauthorized-domain")}function _v(n){const e=Wo(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!gv.test(t))return!1;if(mv.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const vv=new Hr(3e4,6e4);function _u(){const n=We().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Iv(n){return new Promise((e,t)=>{var r,s,i;function a(){_u(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{_u(),t(Ge(n,"network-request-failed"))},timeout:vv.get()})}if(!((s=(r=We().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=We().gapi)===null||i===void 0)&&i.load)a();else{const c=A_("iframefcb");return We()[c]=()=>{gapi.load?a():t(Ge(n,"network-request-failed"))},w_(`${T_()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw Ns=null,e})}let Ns=null;function Ev(n){return Ns=Ns||Iv(n),Ns}/**
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
 */const wv=new Hr(5e3,15e3),Tv="__/auth/iframe",Av="emulator/auth/iframe",bv={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Sv=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Cv(n){const e=n.config;F(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Na(e,Av):`https://${n.config.authDomain}/${Tv}`,r={apiKey:e.apiKey,appName:n.name,v:$n},s=Sv.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${$r(r).slice(1)}`}async function Rv(n){const e=await Ev(n),t=We().gapi;return F(t,n,"internal-error"),e.open({where:document.body,url:Cv(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:bv,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=Ge(n,"network-request-failed"),c=We().setTimeout(()=>{i(a)},wv.get());function u(){We().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(a)})}))}/**
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
 */const Pv={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},kv=500,Dv=600,Nv="_blank",Vv="http://localhost";class vu{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Lv(n,e,t,r=kv,s=Dv){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u=Object.assign(Object.assign({},Pv),{width:r.toString(),height:s.toString(),top:i,left:a}),d=ke().toLowerCase();t&&(c=Ud(d)?Nv:t),Od(d)&&(e=e||Vv,u.scrollbars="yes");const f=Object.entries(u).reduce((g,[E,C])=>`${g}${E}=${C},`,"");if(p_(d)&&c!=="_self")return xv(e||"",c),new vu(null);const m=window.open(e||"",c,f);F(m,n,"popup-blocked");try{m.focus()}catch{}return new vu(m)}function xv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const Mv="__/auth/handler",Ov="emulator/auth/handler",Fv=encodeURIComponent("fac");async function Iu(n,e,t,r,s,i){F(n.config.authDomain,n,"auth-domain-config-required"),F(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:$n,eventId:s};if(e instanceof Kd){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Ug(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))a[f]=m}if(e instanceof jr){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),d=u?`#${Fv}=${encodeURIComponent(u)}`:"";return`${Uv(n)}?${$r(c).slice(1)}${d}`}function Uv({config:n}){return n.emulator?Na(n,Ov):`https://${n.authDomain}/${Mv}`}/**
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
 */const go="webStorageSupport";class Bv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Zd,this._completeRedirectFn=uv,this._overrideRedirectResult=av}async _openPopup(e,t,r,s){var i;at((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await Iu(e,t,r,Wo(),s);return Lv(e,a,Ma())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await Iu(e,t,r,Wo(),s);return j_(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(at(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Rv(e),r=new dv(e);return t.register("authEvent",s=>(F(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(go,{type:go},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[go];a!==void 0&&t(!!a),ot(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=yv(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return qd()||Fd()||La()}}const $v=Bv;var Eu="@firebase/auth",wu="1.7.9";/**
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
 */class Hv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){F(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function jv(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function qv(n){Nn(new Zt("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;F(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:zd(n)},d=new I_(r,s,i,u);return S_(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Nn(new Zt("auth-internal",e=>{const t=pi(e.getProvider("auth").getImmediate());return(r=>new Hv(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),At(Eu,wu,jv(n)),At(Eu,wu,"esm2017")}/**
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
 */const zv=5*60,Gv=Id("authIdTokenMaxAge")||zv;let Tu=null;const Wv=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>Gv)return;const s=t==null?void 0:t.token;Tu!==s&&(Tu=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function Kv(n=Ad()){const e=Pa(n,"auth");if(e.isInitialized())return e.getImmediate();const t=b_(n,{popupRedirectResolver:$v,persistence:[X_,B_,Zd]}),r=Id("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=Wv(i.toString());O_(t,a,()=>a(t.currentUser)),M_(t,c=>a(c))}}const s=_d("auth");return s&&C_(t,`http://${s}`),t}function Qv(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}E_({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=Ge("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",Qv().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});qv("Browser");var Au=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Qt,af;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,_){function I(){}I.prototype=_.prototype,T.D=_.prototype,T.prototype=new I,T.prototype.constructor=T,T.C=function(v,w,A){for(var y=Array(arguments.length-2),se=2;se<arguments.length;se++)y[se-2]=arguments[se];return _.prototype[w].apply(v,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,_,I){I||(I=0);var v=Array(16);if(typeof _=="string")for(var w=0;16>w;++w)v[w]=_.charCodeAt(I++)|_.charCodeAt(I++)<<8|_.charCodeAt(I++)<<16|_.charCodeAt(I++)<<24;else for(w=0;16>w;++w)v[w]=_[I++]|_[I++]<<8|_[I++]<<16|_[I++]<<24;_=T.g[0],I=T.g[1],w=T.g[2];var A=T.g[3],y=_+(A^I&(w^A))+v[0]+3614090360&4294967295;_=I+(y<<7&4294967295|y>>>25),y=A+(w^_&(I^w))+v[1]+3905402710&4294967295,A=_+(y<<12&4294967295|y>>>20),y=w+(I^A&(_^I))+v[2]+606105819&4294967295,w=A+(y<<17&4294967295|y>>>15),y=I+(_^w&(A^_))+v[3]+3250441966&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(A^I&(w^A))+v[4]+4118548399&4294967295,_=I+(y<<7&4294967295|y>>>25),y=A+(w^_&(I^w))+v[5]+1200080426&4294967295,A=_+(y<<12&4294967295|y>>>20),y=w+(I^A&(_^I))+v[6]+2821735955&4294967295,w=A+(y<<17&4294967295|y>>>15),y=I+(_^w&(A^_))+v[7]+4249261313&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(A^I&(w^A))+v[8]+1770035416&4294967295,_=I+(y<<7&4294967295|y>>>25),y=A+(w^_&(I^w))+v[9]+2336552879&4294967295,A=_+(y<<12&4294967295|y>>>20),y=w+(I^A&(_^I))+v[10]+4294925233&4294967295,w=A+(y<<17&4294967295|y>>>15),y=I+(_^w&(A^_))+v[11]+2304563134&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(A^I&(w^A))+v[12]+1804603682&4294967295,_=I+(y<<7&4294967295|y>>>25),y=A+(w^_&(I^w))+v[13]+4254626195&4294967295,A=_+(y<<12&4294967295|y>>>20),y=w+(I^A&(_^I))+v[14]+2792965006&4294967295,w=A+(y<<17&4294967295|y>>>15),y=I+(_^w&(A^_))+v[15]+1236535329&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(w^A&(I^w))+v[1]+4129170786&4294967295,_=I+(y<<5&4294967295|y>>>27),y=A+(I^w&(_^I))+v[6]+3225465664&4294967295,A=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(A^_))+v[11]+643717713&4294967295,w=A+(y<<14&4294967295|y>>>18),y=I+(A^_&(w^A))+v[0]+3921069994&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^A&(I^w))+v[5]+3593408605&4294967295,_=I+(y<<5&4294967295|y>>>27),y=A+(I^w&(_^I))+v[10]+38016083&4294967295,A=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(A^_))+v[15]+3634488961&4294967295,w=A+(y<<14&4294967295|y>>>18),y=I+(A^_&(w^A))+v[4]+3889429448&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^A&(I^w))+v[9]+568446438&4294967295,_=I+(y<<5&4294967295|y>>>27),y=A+(I^w&(_^I))+v[14]+3275163606&4294967295,A=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(A^_))+v[3]+4107603335&4294967295,w=A+(y<<14&4294967295|y>>>18),y=I+(A^_&(w^A))+v[8]+1163531501&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^A&(I^w))+v[13]+2850285829&4294967295,_=I+(y<<5&4294967295|y>>>27),y=A+(I^w&(_^I))+v[2]+4243563512&4294967295,A=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(A^_))+v[7]+1735328473&4294967295,w=A+(y<<14&4294967295|y>>>18),y=I+(A^_&(w^A))+v[12]+2368359562&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(I^w^A)+v[5]+4294588738&4294967295,_=I+(y<<4&4294967295|y>>>28),y=A+(_^I^w)+v[8]+2272392833&4294967295,A=_+(y<<11&4294967295|y>>>21),y=w+(A^_^I)+v[11]+1839030562&4294967295,w=A+(y<<16&4294967295|y>>>16),y=I+(w^A^_)+v[14]+4259657740&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^A)+v[1]+2763975236&4294967295,_=I+(y<<4&4294967295|y>>>28),y=A+(_^I^w)+v[4]+1272893353&4294967295,A=_+(y<<11&4294967295|y>>>21),y=w+(A^_^I)+v[7]+4139469664&4294967295,w=A+(y<<16&4294967295|y>>>16),y=I+(w^A^_)+v[10]+3200236656&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^A)+v[13]+681279174&4294967295,_=I+(y<<4&4294967295|y>>>28),y=A+(_^I^w)+v[0]+3936430074&4294967295,A=_+(y<<11&4294967295|y>>>21),y=w+(A^_^I)+v[3]+3572445317&4294967295,w=A+(y<<16&4294967295|y>>>16),y=I+(w^A^_)+v[6]+76029189&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^A)+v[9]+3654602809&4294967295,_=I+(y<<4&4294967295|y>>>28),y=A+(_^I^w)+v[12]+3873151461&4294967295,A=_+(y<<11&4294967295|y>>>21),y=w+(A^_^I)+v[15]+530742520&4294967295,w=A+(y<<16&4294967295|y>>>16),y=I+(w^A^_)+v[2]+3299628645&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(w^(I|~A))+v[0]+4096336452&4294967295,_=I+(y<<6&4294967295|y>>>26),y=A+(I^(_|~w))+v[7]+1126891415&4294967295,A=_+(y<<10&4294967295|y>>>22),y=w+(_^(A|~I))+v[14]+2878612391&4294967295,w=A+(y<<15&4294967295|y>>>17),y=I+(A^(w|~_))+v[5]+4237533241&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~A))+v[12]+1700485571&4294967295,_=I+(y<<6&4294967295|y>>>26),y=A+(I^(_|~w))+v[3]+2399980690&4294967295,A=_+(y<<10&4294967295|y>>>22),y=w+(_^(A|~I))+v[10]+4293915773&4294967295,w=A+(y<<15&4294967295|y>>>17),y=I+(A^(w|~_))+v[1]+2240044497&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~A))+v[8]+1873313359&4294967295,_=I+(y<<6&4294967295|y>>>26),y=A+(I^(_|~w))+v[15]+4264355552&4294967295,A=_+(y<<10&4294967295|y>>>22),y=w+(_^(A|~I))+v[6]+2734768916&4294967295,w=A+(y<<15&4294967295|y>>>17),y=I+(A^(w|~_))+v[13]+1309151649&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~A))+v[4]+4149444226&4294967295,_=I+(y<<6&4294967295|y>>>26),y=A+(I^(_|~w))+v[11]+3174756917&4294967295,A=_+(y<<10&4294967295|y>>>22),y=w+(_^(A|~I))+v[2]+718787259&4294967295,w=A+(y<<15&4294967295|y>>>17),y=I+(A^(w|~_))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+_&4294967295,T.g[1]=T.g[1]+(w+(y<<21&4294967295|y>>>11))&4294967295,T.g[2]=T.g[2]+w&4294967295,T.g[3]=T.g[3]+A&4294967295}r.prototype.u=function(T,_){_===void 0&&(_=T.length);for(var I=_-this.blockSize,v=this.B,w=this.h,A=0;A<_;){if(w==0)for(;A<=I;)s(this,T,A),A+=this.blockSize;if(typeof T=="string"){for(;A<_;)if(v[w++]=T.charCodeAt(A++),w==this.blockSize){s(this,v),w=0;break}}else for(;A<_;)if(v[w++]=T[A++],w==this.blockSize){s(this,v),w=0;break}}this.h=w,this.o+=_},r.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var _=1;_<T.length-8;++_)T[_]=0;var I=8*this.o;for(_=T.length-8;_<T.length;++_)T[_]=I&255,I/=256;for(this.u(T),T=Array(16),_=I=0;4>_;++_)for(var v=0;32>v;v+=8)T[I++]=this.g[_]>>>v&255;return T};function i(T,_){var I=c;return Object.prototype.hasOwnProperty.call(I,T)?I[T]:I[T]=_(T)}function a(T,_){this.h=_;for(var I=[],v=!0,w=T.length-1;0<=w;w--){var A=T[w]|0;v&&A==_||(I[w]=A,v=!1)}this.g=I}var c={};function u(T){return-128<=T&&128>T?i(T,function(_){return new a([_|0],0>_?-1:0)}):new a([T|0],0>T?-1:0)}function d(T){if(isNaN(T)||!isFinite(T))return m;if(0>T)return P(d(-T));for(var _=[],I=1,v=0;T>=I;v++)_[v]=T/I|0,I*=4294967296;return new a(_,0)}function f(T,_){if(T.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(T.charAt(0)=="-")return P(f(T.substring(1),_));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var I=d(Math.pow(_,8)),v=m,w=0;w<T.length;w+=8){var A=Math.min(8,T.length-w),y=parseInt(T.substring(w,w+A),_);8>A?(A=d(Math.pow(_,A)),v=v.j(A).add(d(y))):(v=v.j(I),v=v.add(d(y)))}return v}var m=u(0),g=u(1),E=u(16777216);n=a.prototype,n.m=function(){if(R(this))return-P(this).m();for(var T=0,_=1,I=0;I<this.g.length;I++){var v=this.i(I);T+=(0<=v?v:4294967296+v)*_,_*=4294967296}return T},n.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(C(this))return"0";if(R(this))return"-"+P(this).toString(T);for(var _=d(Math.pow(T,6)),I=this,v="";;){var w=z(I,_).g;I=N(I,w.j(_));var A=((0<I.g.length?I.g[0]:I.h)>>>0).toString(T);if(I=w,C(I))return A+v;for(;6>A.length;)A="0"+A;v=A+v}},n.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function C(T){if(T.h!=0)return!1;for(var _=0;_<T.g.length;_++)if(T.g[_]!=0)return!1;return!0}function R(T){return T.h==-1}n.l=function(T){return T=N(this,T),R(T)?-1:C(T)?0:1};function P(T){for(var _=T.g.length,I=[],v=0;v<_;v++)I[v]=~T.g[v];return new a(I,~T.h).add(g)}n.abs=function(){return R(this)?P(this):this},n.add=function(T){for(var _=Math.max(this.g.length,T.g.length),I=[],v=0,w=0;w<=_;w++){var A=v+(this.i(w)&65535)+(T.i(w)&65535),y=(A>>>16)+(this.i(w)>>>16)+(T.i(w)>>>16);v=y>>>16,A&=65535,y&=65535,I[w]=y<<16|A}return new a(I,I[I.length-1]&-2147483648?-1:0)};function N(T,_){return T.add(P(_))}n.j=function(T){if(C(this)||C(T))return m;if(R(this))return R(T)?P(this).j(P(T)):P(P(this).j(T));if(R(T))return P(this.j(P(T)));if(0>this.l(E)&&0>T.l(E))return d(this.m()*T.m());for(var _=this.g.length+T.g.length,I=[],v=0;v<2*_;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(var w=0;w<T.g.length;w++){var A=this.i(v)>>>16,y=this.i(v)&65535,se=T.i(w)>>>16,de=T.i(w)&65535;I[2*v+2*w]+=y*de,O(I,2*v+2*w),I[2*v+2*w+1]+=A*de,O(I,2*v+2*w+1),I[2*v+2*w+1]+=y*se,O(I,2*v+2*w+1),I[2*v+2*w+2]+=A*se,O(I,2*v+2*w+2)}for(v=0;v<_;v++)I[v]=I[2*v+1]<<16|I[2*v];for(v=_;v<2*_;v++)I[v]=0;return new a(I,0)};function O(T,_){for(;(T[_]&65535)!=T[_];)T[_+1]+=T[_]>>>16,T[_]&=65535,_++}function B(T,_){this.g=T,this.h=_}function z(T,_){if(C(_))throw Error("division by zero");if(C(T))return new B(m,m);if(R(T))return _=z(P(T),_),new B(P(_.g),P(_.h));if(R(_))return _=z(T,P(_)),new B(P(_.g),_.h);if(30<T.g.length){if(R(T)||R(_))throw Error("slowDivide_ only works with positive integers.");for(var I=g,v=_;0>=v.l(T);)I=he(I),v=he(v);var w=J(I,1),A=J(v,1);for(v=J(v,2),I=J(I,2);!C(v);){var y=A.add(v);0>=y.l(T)&&(w=w.add(I),A=y),v=J(v,1),I=J(I,1)}return _=N(T,w.j(_)),new B(w,_)}for(w=m;0<=T.l(_);){for(I=Math.max(1,Math.floor(T.m()/_.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),A=d(I),y=A.j(_);R(y)||0<y.l(T);)I-=v,A=d(I),y=A.j(_);C(A)&&(A=g),w=w.add(A),T=N(T,y)}return new B(w,T)}n.A=function(T){return z(this,T).h},n.and=function(T){for(var _=Math.max(this.g.length,T.g.length),I=[],v=0;v<_;v++)I[v]=this.i(v)&T.i(v);return new a(I,this.h&T.h)},n.or=function(T){for(var _=Math.max(this.g.length,T.g.length),I=[],v=0;v<_;v++)I[v]=this.i(v)|T.i(v);return new a(I,this.h|T.h)},n.xor=function(T){for(var _=Math.max(this.g.length,T.g.length),I=[],v=0;v<_;v++)I[v]=this.i(v)^T.i(v);return new a(I,this.h^T.h)};function he(T){for(var _=T.g.length+1,I=[],v=0;v<_;v++)I[v]=T.i(v)<<1|T.i(v-1)>>>31;return new a(I,T.h)}function J(T,_){var I=_>>5;_%=32;for(var v=T.g.length-I,w=[],A=0;A<v;A++)w[A]=0<_?T.i(A+I)>>>_|T.i(A+I+1)<<32-_:T.i(A+I);return new a(w,T.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,af=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,Qt=a}).apply(typeof Au<"u"?Au:typeof self<"u"?self:typeof window<"u"?window:{});var Es=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var cf,lr,lf,Vs,Yo,uf,hf,df;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,l,h){return o==Array.prototype||o==Object.prototype||(o[l]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Es=="object"&&Es];for(var l=0;l<o.length;++l){var h=o[l];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(o,l){if(l)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var b=o[p];if(!(b in h))break e;h=h[b]}o=o[o.length-1],p=h[o],l=l(p),l!=p&&l!=null&&e(h,o,{configurable:!0,writable:!0,value:l})}}function i(o,l){o instanceof String&&(o+="");var h=0,p=!1,b={next:function(){if(!p&&h<o.length){var S=h++;return{value:l(S,o[S]),done:!1}}return p=!0,{done:!0,value:void 0}}};return b[Symbol.iterator]=function(){return b},b}s("Array.prototype.values",function(o){return o||function(){return i(this,function(l,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function u(o){var l=typeof o;return l=l!="object"?l:o?Array.isArray(o)?"array":l:"null",l=="array"||l=="object"&&typeof o.length=="number"}function d(o){var l=typeof o;return l=="object"&&o!=null||l=="function"}function f(o,l,h){return o.call.apply(o.bind,arguments)}function m(o,l,h){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var b=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(b,p),o.apply(l,b)}}return function(){return o.apply(l,arguments)}}function g(o,l,h){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,g.apply(null,arguments)}function E(o,l){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function C(o,l){function h(){}h.prototype=l.prototype,o.aa=l.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(p,b,S){for(var V=Array(arguments.length-2),Q=2;Q<arguments.length;Q++)V[Q-2]=arguments[Q];return l.prototype[b].apply(p,V)}}function R(o){const l=o.length;if(0<l){const h=Array(l);for(let p=0;p<l;p++)h[p]=o[p];return h}return[]}function P(o,l){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(u(p)){const b=o.length||0,S=p.length||0;o.length=b+S;for(let V=0;V<S;V++)o[b+V]=p[V]}else o.push(p)}}class N{constructor(l,h){this.i=l,this.j=h,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function O(o){return/^[\s\xa0]*$/.test(o)}function B(){var o=c.navigator;return o&&(o=o.userAgent)?o:""}function z(o){return z[" "](o),o}z[" "]=function(){};var he=B().indexOf("Gecko")!=-1&&!(B().toLowerCase().indexOf("webkit")!=-1&&B().indexOf("Edge")==-1)&&!(B().indexOf("Trident")!=-1||B().indexOf("MSIE")!=-1)&&B().indexOf("Edge")==-1;function J(o,l,h){for(const p in o)l.call(h,o[p],p,o)}function T(o,l){for(const h in o)l.call(void 0,o[h],h,o)}function _(o){const l={};for(const h in o)l[h]=o[h];return l}const I="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(o,l){let h,p;for(let b=1;b<arguments.length;b++){p=arguments[b];for(h in p)o[h]=p[h];for(let S=0;S<I.length;S++)h=I[S],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function w(o){var l=1;o=o.split(":");const h=[];for(;0<l&&o.length;)h.push(o.shift()),l--;return o.length&&h.push(o.join(":")),h}function A(o){c.setTimeout(()=>{throw o},0)}function y(){var o=on;let l=null;return o.g&&(l=o.g,o.g=o.g.next,o.g||(o.h=null),l.next=null),l}class se{constructor(){this.h=this.g=null}add(l,h){const p=de.get();p.set(l,h),this.h?this.h.next=p:this.g=p,this.h=p}}var de=new N(()=>new fe,o=>o.reset());class fe{constructor(){this.next=this.g=this.h=null}set(l,h){this.h=l,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let ce,je=!1,on=new se,es=()=>{const o=c.Promise.resolve(void 0);ce=()=>{o.then(Fi)}};var Fi=()=>{for(var o;o=y();){try{o.h.call(o.g)}catch(h){A(h)}var l=de;l.j(o),100>l.h&&(l.h++,o.next=l.g,l.g=o)}je=!1};function qe(){this.s=this.s,this.C=this.C}qe.prototype.s=!1,qe.prototype.ma=function(){this.s||(this.s=!0,this.N())},qe.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function me(o,l){this.type=o,this.g=this.target=l,this.defaultPrevented=!1}me.prototype.h=function(){this.defaultPrevented=!0};var Ui=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var o=!1,l=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};c.addEventListener("test",h,l),c.removeEventListener("test",h,l)}catch{}return o}();function Ot(o,l){if(me.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=l,l=o.relatedTarget){if(he){e:{try{z(l.nodeName);var b=!0;break e}catch{}b=!1}b||(l=null)}}else h=="mouseover"?l=o.fromElement:h=="mouseout"&&(l=o.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:Tm[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Ot.aa.h.call(this)}}C(Ot,me);var Tm={2:"touch",3:"pen",4:"mouse"};Ot.prototype.h=function(){Ot.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ts="closure_listenable_"+(1e6*Math.random()|0),Am=0;function bm(o,l,h,p,b){this.listener=o,this.proxy=null,this.src=l,this.type=h,this.capture=!!p,this.ha=b,this.key=++Am,this.da=this.fa=!1}function ns(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function rs(o){this.src=o,this.g={},this.h=0}rs.prototype.add=function(o,l,h,p,b){var S=o.toString();o=this.g[S],o||(o=this.g[S]=[],this.h++);var V=$i(o,l,p,b);return-1<V?(l=o[V],h||(l.fa=!1)):(l=new bm(l,this.src,S,!!p,b),l.fa=h,o.push(l)),l};function Bi(o,l){var h=l.type;if(h in o.g){var p=o.g[h],b=Array.prototype.indexOf.call(p,l,void 0),S;(S=0<=b)&&Array.prototype.splice.call(p,b,1),S&&(ns(l),o.g[h].length==0&&(delete o.g[h],o.h--))}}function $i(o,l,h,p){for(var b=0;b<o.length;++b){var S=o[b];if(!S.da&&S.listener==l&&S.capture==!!h&&S.ha==p)return b}return-1}var Hi="closure_lm_"+(1e6*Math.random()|0),ji={};function Qc(o,l,h,p,b){if(Array.isArray(l)){for(var S=0;S<l.length;S++)Qc(o,l[S],h,p,b);return null}return h=Xc(h),o&&o[ts]?o.K(l,h,d(p)?!!p.capture:!1,b):Sm(o,l,h,!1,p,b)}function Sm(o,l,h,p,b,S){if(!l)throw Error("Invalid event type");var V=d(b)?!!b.capture:!!b,Q=zi(o);if(Q||(o[Hi]=Q=new rs(o)),h=Q.add(l,h,p,V,S),h.proxy)return h;if(p=Cm(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)Ui||(b=V),b===void 0&&(b=!1),o.addEventListener(l.toString(),p,b);else if(o.attachEvent)o.attachEvent(Jc(l.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function Cm(){function o(h){return l.call(o.src,o.listener,h)}const l=Rm;return o}function Yc(o,l,h,p,b){if(Array.isArray(l))for(var S=0;S<l.length;S++)Yc(o,l[S],h,p,b);else p=d(p)?!!p.capture:!!p,h=Xc(h),o&&o[ts]?(o=o.i,l=String(l).toString(),l in o.g&&(S=o.g[l],h=$i(S,h,p,b),-1<h&&(ns(S[h]),Array.prototype.splice.call(S,h,1),S.length==0&&(delete o.g[l],o.h--)))):o&&(o=zi(o))&&(l=o.g[l.toString()],o=-1,l&&(o=$i(l,h,p,b)),(h=-1<o?l[o]:null)&&qi(h))}function qi(o){if(typeof o!="number"&&o&&!o.da){var l=o.src;if(l&&l[ts])Bi(l.i,o);else{var h=o.type,p=o.proxy;l.removeEventListener?l.removeEventListener(h,p,o.capture):l.detachEvent?l.detachEvent(Jc(h),p):l.addListener&&l.removeListener&&l.removeListener(p),(h=zi(l))?(Bi(h,o),h.h==0&&(h.src=null,l[Hi]=null)):ns(o)}}}function Jc(o){return o in ji?ji[o]:ji[o]="on"+o}function Rm(o,l){if(o.da)o=!0;else{l=new Ot(l,this);var h=o.listener,p=o.ha||o.src;o.fa&&qi(o),o=h.call(p,l)}return o}function zi(o){return o=o[Hi],o instanceof rs?o:null}var Gi="__closure_events_fn_"+(1e9*Math.random()>>>0);function Xc(o){return typeof o=="function"?o:(o[Gi]||(o[Gi]=function(l){return o.handleEvent(l)}),o[Gi])}function we(){qe.call(this),this.i=new rs(this),this.M=this,this.F=null}C(we,qe),we.prototype[ts]=!0,we.prototype.removeEventListener=function(o,l,h,p){Yc(this,o,l,h,p)};function De(o,l){var h,p=o.F;if(p)for(h=[];p;p=p.F)h.push(p);if(o=o.M,p=l.type||l,typeof l=="string")l=new me(l,o);else if(l instanceof me)l.target=l.target||o;else{var b=l;l=new me(p,o),v(l,b)}if(b=!0,h)for(var S=h.length-1;0<=S;S--){var V=l.g=h[S];b=ss(V,p,!0,l)&&b}if(V=l.g=o,b=ss(V,p,!0,l)&&b,b=ss(V,p,!1,l)&&b,h)for(S=0;S<h.length;S++)V=l.g=h[S],b=ss(V,p,!1,l)&&b}we.prototype.N=function(){if(we.aa.N.call(this),this.i){var o=this.i,l;for(l in o.g){for(var h=o.g[l],p=0;p<h.length;p++)ns(h[p]);delete o.g[l],o.h--}}this.F=null},we.prototype.K=function(o,l,h,p){return this.i.add(String(o),l,!1,h,p)},we.prototype.L=function(o,l,h,p){return this.i.add(String(o),l,!0,h,p)};function ss(o,l,h,p){if(l=o.i.g[String(l)],!l)return!0;l=l.concat();for(var b=!0,S=0;S<l.length;++S){var V=l[S];if(V&&!V.da&&V.capture==h){var Q=V.listener,ye=V.ha||V.src;V.fa&&Bi(o.i,V),b=Q.call(ye,p)!==!1&&b}}return b&&!p.defaultPrevented}function Zc(o,l,h){if(typeof o=="function")h&&(o=g(o,h));else if(o&&typeof o.handleEvent=="function")o=g(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(o,l||0)}function el(o){o.g=Zc(()=>{o.g=null,o.i&&(o.i=!1,el(o))},o.l);const l=o.h;o.h=null,o.m.apply(null,l)}class Pm extends qe{constructor(l,h){super(),this.m=l,this.l=h,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:el(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Wn(o){qe.call(this),this.h=o,this.g={}}C(Wn,qe);var tl=[];function nl(o){J(o.g,function(l,h){this.g.hasOwnProperty(h)&&qi(l)},o),o.g={}}Wn.prototype.N=function(){Wn.aa.N.call(this),nl(this)},Wn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Wi=c.JSON.stringify,km=c.JSON.parse,Dm=class{stringify(o){return c.JSON.stringify(o,void 0)}parse(o){return c.JSON.parse(o,void 0)}};function Ki(){}Ki.prototype.h=null;function rl(o){return o.h||(o.h=o.i())}function sl(){}var Kn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Qi(){me.call(this,"d")}C(Qi,me);function Yi(){me.call(this,"c")}C(Yi,me);var Ft={},il=null;function is(){return il=il||new we}Ft.La="serverreachability";function ol(o){me.call(this,Ft.La,o)}C(ol,me);function Qn(o){const l=is();De(l,new ol(l))}Ft.STAT_EVENT="statevent";function al(o,l){me.call(this,Ft.STAT_EVENT,o),this.stat=l}C(al,me);function Ne(o){const l=is();De(l,new al(l,o))}Ft.Ma="timingevent";function cl(o,l){me.call(this,Ft.Ma,o),this.size=l}C(cl,me);function Yn(o,l){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){o()},l)}function Jn(){this.g=!0}Jn.prototype.xa=function(){this.g=!1};function Nm(o,l,h,p,b,S){o.info(function(){if(o.g)if(S)for(var V="",Q=S.split("&"),ye=0;ye<Q.length;ye++){var W=Q[ye].split("=");if(1<W.length){var Te=W[0];W=W[1];var Ae=Te.split("_");V=2<=Ae.length&&Ae[1]=="type"?V+(Te+"="+W+"&"):V+(Te+"=redacted&")}}else V=null;else V=S;return"XMLHTTP REQ ("+p+") [attempt "+b+"]: "+l+`
`+h+`
`+V})}function Vm(o,l,h,p,b,S,V){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+b+"]: "+l+`
`+h+`
`+S+" "+V})}function an(o,l,h,p){o.info(function(){return"XMLHTTP TEXT ("+l+"): "+xm(o,h)+(p?" "+p:"")})}function Lm(o,l){o.info(function(){return"TIMEOUT: "+l})}Jn.prototype.info=function(){};function xm(o,l){if(!o.g)return l;if(!l)return null;try{var h=JSON.parse(l);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var p=h[o];if(!(2>p.length)){var b=p[1];if(Array.isArray(b)&&!(1>b.length)){var S=b[0];if(S!="noop"&&S!="stop"&&S!="close")for(var V=1;V<b.length;V++)b[V]=""}}}}return Wi(h)}catch{return l}}var os={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ll={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Ji;function as(){}C(as,Ki),as.prototype.g=function(){return new XMLHttpRequest},as.prototype.i=function(){return{}},Ji=new as;function dt(o,l,h,p){this.j=o,this.i=l,this.l=h,this.R=p||1,this.U=new Wn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new ul}function ul(){this.i=null,this.g="",this.h=!1}var hl={},Xi={};function Zi(o,l,h){o.L=1,o.v=hs(Ye(l)),o.m=h,o.P=!0,dl(o,null)}function dl(o,l){o.F=Date.now(),cs(o),o.A=Ye(o.v);var h=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),Sl(h.i,"t",p),o.C=0,h=o.j.J,o.h=new ul,o.g=ql(o.j,h?l:null,!o.m),0<o.O&&(o.M=new Pm(g(o.Y,o,o.g),o.O)),l=o.U,h=o.g,p=o.ca;var b="readystatechange";Array.isArray(b)||(b&&(tl[0]=b.toString()),b=tl);for(var S=0;S<b.length;S++){var V=Qc(h,b[S],p||l.handleEvent,!1,l.h||l);if(!V)break;l.g[V.key]=V}l=o.H?_(o.H):{},o.m?(o.u||(o.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,l)):(o.u="GET",o.g.ea(o.A,o.u,null,l)),Qn(),Nm(o.i,o.u,o.A,o.l,o.R,o.m)}dt.prototype.ca=function(o){o=o.target;const l=this.M;l&&Je(o)==3?l.j():this.Y(o)},dt.prototype.Y=function(o){try{if(o==this.g)e:{const Ae=Je(this.g);var l=this.g.Ba();const un=this.g.Z();if(!(3>Ae)&&(Ae!=3||this.g&&(this.h.h||this.g.oa()||Vl(this.g)))){this.J||Ae!=4||l==7||(l==8||0>=un?Qn(3):Qn(2)),eo(this);var h=this.g.Z();this.X=h;t:if(fl(this)){var p=Vl(this.g);o="";var b=p.length,S=Je(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Ut(this),Xn(this);var V="";break t}this.h.i=new c.TextDecoder}for(l=0;l<b;l++)this.h.h=!0,o+=this.h.i.decode(p[l],{stream:!(S&&l==b-1)});p.length=0,this.h.g+=o,this.C=0,V=this.h.g}else V=this.g.oa();if(this.o=h==200,Vm(this.i,this.u,this.A,this.l,this.R,Ae,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Q,ye=this.g;if((Q=ye.g?ye.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!O(Q)){var W=Q;break t}}W=null}if(h=W)an(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,to(this,h);else{this.o=!1,this.s=3,Ne(12),Ut(this),Xn(this);break e}}if(this.P){h=!0;let $e;for(;!this.J&&this.C<V.length;)if($e=Mm(this,V),$e==Xi){Ae==4&&(this.s=4,Ne(14),h=!1),an(this.i,this.l,null,"[Incomplete Response]");break}else if($e==hl){this.s=4,Ne(15),an(this.i,this.l,V,"[Invalid Chunk]"),h=!1;break}else an(this.i,this.l,$e,null),to(this,$e);if(fl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ae!=4||V.length!=0||this.h.h||(this.s=1,Ne(16),h=!1),this.o=this.o&&h,!h)an(this.i,this.l,V,"[Invalid Chunked Response]"),Ut(this),Xn(this);else if(0<V.length&&!this.W){this.W=!0;var Te=this.j;Te.g==this&&Te.ba&&!Te.M&&(Te.j.info("Great, no buffering proxy detected. Bytes received: "+V.length),ao(Te),Te.M=!0,Ne(11))}}else an(this.i,this.l,V,null),to(this,V);Ae==4&&Ut(this),this.o&&!this.J&&(Ae==4?Bl(this.j,this):(this.o=!1,cs(this)))}else Zm(this.g),h==400&&0<V.indexOf("Unknown SID")?(this.s=3,Ne(12)):(this.s=0,Ne(13)),Ut(this),Xn(this)}}}catch{}finally{}};function fl(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Mm(o,l){var h=o.C,p=l.indexOf(`
`,h);return p==-1?Xi:(h=Number(l.substring(h,p)),isNaN(h)?hl:(p+=1,p+h>l.length?Xi:(l=l.slice(p,p+h),o.C=p+h,l)))}dt.prototype.cancel=function(){this.J=!0,Ut(this)};function cs(o){o.S=Date.now()+o.I,pl(o,o.I)}function pl(o,l){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Yn(g(o.ba,o),l)}function eo(o){o.B&&(c.clearTimeout(o.B),o.B=null)}dt.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Lm(this.i,this.A),this.L!=2&&(Qn(),Ne(17)),Ut(this),this.s=2,Xn(this)):pl(this,this.S-o)};function Xn(o){o.j.G==0||o.J||Bl(o.j,o)}function Ut(o){eo(o);var l=o.M;l&&typeof l.ma=="function"&&l.ma(),o.M=null,nl(o.U),o.g&&(l=o.g,o.g=null,l.abort(),l.ma())}function to(o,l){try{var h=o.j;if(h.G!=0&&(h.g==o||no(h.h,o))){if(!o.K&&no(h.h,o)&&h.G==3){try{var p=h.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var b=p;if(b[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)ys(h),ms(h);else break e;oo(h),Ne(18)}}else h.za=b[1],0<h.za-h.T&&37500>b[2]&&h.F&&h.v==0&&!h.C&&(h.C=Yn(g(h.Za,h),6e3));if(1>=yl(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else $t(h,11)}else if((o.K||h.g==o)&&ys(h),!O(l))for(b=h.Da.g.parse(l),l=0;l<b.length;l++){let W=b[l];if(h.T=W[0],W=W[1],h.G==2)if(W[0]=="c"){h.K=W[1],h.ia=W[2];const Te=W[3];Te!=null&&(h.la=Te,h.j.info("VER="+h.la));const Ae=W[4];Ae!=null&&(h.Aa=Ae,h.j.info("SVER="+h.Aa));const un=W[5];un!=null&&typeof un=="number"&&0<un&&(p=1.5*un,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const $e=o.g;if($e){const vs=$e.g?$e.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(vs){var S=p.h;S.g||vs.indexOf("spdy")==-1&&vs.indexOf("quic")==-1&&vs.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(ro(S,S.h),S.h=null))}if(p.D){const co=$e.g?$e.g.getResponseHeader("X-HTTP-Session-Id"):null;co&&(p.ya=co,Z(p.I,p.D,co))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var V=o;if(p.qa=jl(p,p.J?p.ia:null,p.W),V.K){_l(p.h,V);var Q=V,ye=p.L;ye&&(Q.I=ye),Q.B&&(eo(Q),cs(Q)),p.g=V}else Fl(p);0<h.i.length&&gs(h)}else W[0]!="stop"&&W[0]!="close"||$t(h,7);else h.G==3&&(W[0]=="stop"||W[0]=="close"?W[0]=="stop"?$t(h,7):io(h):W[0]!="noop"&&h.l&&h.l.ta(W),h.v=0)}}Qn(4)}catch{}}var Om=class{constructor(o,l){this.g=o,this.map=l}};function ml(o){this.l=o||10,c.PerformanceNavigationTiming?(o=c.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function gl(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function yl(o){return o.h?1:o.g?o.g.size:0}function no(o,l){return o.h?o.h==l:o.g?o.g.has(l):!1}function ro(o,l){o.g?o.g.add(l):o.h=l}function _l(o,l){o.h&&o.h==l?o.h=null:o.g&&o.g.has(l)&&o.g.delete(l)}ml.prototype.cancel=function(){if(this.i=vl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function vl(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let l=o.i;for(const h of o.g.values())l=l.concat(h.D);return l}return R(o.i)}function Fm(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(u(o)){for(var l=[],h=o.length,p=0;p<h;p++)l.push(o[p]);return l}l=[],h=0;for(p in o)l[h++]=o[p];return l}function Um(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(u(o)||typeof o=="string"){var l=[];o=o.length;for(var h=0;h<o;h++)l.push(h);return l}l=[],h=0;for(const p in o)l[h++]=p;return l}}}function Il(o,l){if(o.forEach&&typeof o.forEach=="function")o.forEach(l,void 0);else if(u(o)||typeof o=="string")Array.prototype.forEach.call(o,l,void 0);else for(var h=Um(o),p=Fm(o),b=p.length,S=0;S<b;S++)l.call(void 0,p[S],h&&h[S],o)}var El=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Bm(o,l){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var p=o[h].indexOf("="),b=null;if(0<=p){var S=o[h].substring(0,p);b=o[h].substring(p+1)}else S=o[h];l(S,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function Bt(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Bt){this.h=o.h,ls(this,o.j),this.o=o.o,this.g=o.g,us(this,o.s),this.l=o.l;var l=o.i,h=new tr;h.i=l.i,l.g&&(h.g=new Map(l.g),h.h=l.h),wl(this,h),this.m=o.m}else o&&(l=String(o).match(El))?(this.h=!1,ls(this,l[1]||"",!0),this.o=Zn(l[2]||""),this.g=Zn(l[3]||"",!0),us(this,l[4]),this.l=Zn(l[5]||"",!0),wl(this,l[6]||"",!0),this.m=Zn(l[7]||"")):(this.h=!1,this.i=new tr(null,this.h))}Bt.prototype.toString=function(){var o=[],l=this.j;l&&o.push(er(l,Tl,!0),":");var h=this.g;return(h||l=="file")&&(o.push("//"),(l=this.o)&&o.push(er(l,Tl,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(er(h,h.charAt(0)=="/"?jm:Hm,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",er(h,zm)),o.join("")};function Ye(o){return new Bt(o)}function ls(o,l,h){o.j=h?Zn(l,!0):l,o.j&&(o.j=o.j.replace(/:$/,""))}function us(o,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);o.s=l}else o.s=null}function wl(o,l,h){l instanceof tr?(o.i=l,Gm(o.i,o.h)):(h||(l=er(l,qm)),o.i=new tr(l,o.h))}function Z(o,l,h){o.i.set(l,h)}function hs(o){return Z(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Zn(o,l){return o?l?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function er(o,l,h){return typeof o=="string"?(o=encodeURI(o).replace(l,$m),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function $m(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Tl=/[#\/\?@]/g,Hm=/[#\?:]/g,jm=/[#\?]/g,qm=/[#\?@]/g,zm=/#/g;function tr(o,l){this.h=this.g=null,this.i=o||null,this.j=!!l}function ft(o){o.g||(o.g=new Map,o.h=0,o.i&&Bm(o.i,function(l,h){o.add(decodeURIComponent(l.replace(/\+/g," ")),h)}))}n=tr.prototype,n.add=function(o,l){ft(this),this.i=null,o=cn(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(l),this.h+=1,this};function Al(o,l){ft(o),l=cn(o,l),o.g.has(l)&&(o.i=null,o.h-=o.g.get(l).length,o.g.delete(l))}function bl(o,l){return ft(o),l=cn(o,l),o.g.has(l)}n.forEach=function(o,l){ft(this),this.g.forEach(function(h,p){h.forEach(function(b){o.call(l,b,p,this)},this)},this)},n.na=function(){ft(this);const o=Array.from(this.g.values()),l=Array.from(this.g.keys()),h=[];for(let p=0;p<l.length;p++){const b=o[p];for(let S=0;S<b.length;S++)h.push(l[p])}return h},n.V=function(o){ft(this);let l=[];if(typeof o=="string")bl(this,o)&&(l=l.concat(this.g.get(cn(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)l=l.concat(o[h])}return l},n.set=function(o,l){return ft(this),this.i=null,o=cn(this,o),bl(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[l]),this.h+=1,this},n.get=function(o,l){return o?(o=this.V(o),0<o.length?String(o[0]):l):l};function Sl(o,l,h){Al(o,l),0<h.length&&(o.i=null,o.g.set(cn(o,l),R(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],l=Array.from(this.g.keys());for(var h=0;h<l.length;h++){var p=l[h];const S=encodeURIComponent(String(p)),V=this.V(p);for(p=0;p<V.length;p++){var b=S;V[p]!==""&&(b+="="+encodeURIComponent(String(V[p]))),o.push(b)}}return this.i=o.join("&")};function cn(o,l){return l=String(l),o.j&&(l=l.toLowerCase()),l}function Gm(o,l){l&&!o.j&&(ft(o),o.i=null,o.g.forEach(function(h,p){var b=p.toLowerCase();p!=b&&(Al(this,p),Sl(this,b,h))},o)),o.j=l}function Wm(o,l){const h=new Jn;if(c.Image){const p=new Image;p.onload=E(pt,h,"TestLoadImage: loaded",!0,l,p),p.onerror=E(pt,h,"TestLoadImage: error",!1,l,p),p.onabort=E(pt,h,"TestLoadImage: abort",!1,l,p),p.ontimeout=E(pt,h,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else l(!1)}function Km(o,l){const h=new Jn,p=new AbortController,b=setTimeout(()=>{p.abort(),pt(h,"TestPingServer: timeout",!1,l)},1e4);fetch(o,{signal:p.signal}).then(S=>{clearTimeout(b),S.ok?pt(h,"TestPingServer: ok",!0,l):pt(h,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(b),pt(h,"TestPingServer: error",!1,l)})}function pt(o,l,h,p,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),p(h)}catch{}}function Qm(){this.g=new Dm}function Ym(o,l,h){const p=h||"";try{Il(o,function(b,S){let V=b;d(b)&&(V=Wi(b)),l.push(p+S+"="+encodeURIComponent(V))})}catch(b){throw l.push(p+"type="+encodeURIComponent("_badmap")),b}}function ds(o){this.l=o.Ub||null,this.j=o.eb||!1}C(ds,Ki),ds.prototype.g=function(){return new fs(this.l,this.j)},ds.prototype.i=function(o){return function(){return o}}({});function fs(o,l){we.call(this),this.D=o,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(fs,we),n=fs.prototype,n.open=function(o,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=l,this.readyState=1,rr(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(l.body=o),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,nr(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,rr(this)),this.g&&(this.readyState=3,rr(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Cl(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Cl(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var l=o.value?o.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!o.done}))&&(this.response=this.responseText+=l)}o.done?nr(this):rr(this),this.readyState==3&&Cl(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,nr(this))},n.Qa=function(o){this.g&&(this.response=o,nr(this))},n.ga=function(){this.g&&nr(this)};function nr(o){o.readyState=4,o.l=null,o.j=null,o.v=null,rr(o)}n.setRequestHeader=function(o,l){this.u.append(o,l)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],l=this.h.entries();for(var h=l.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=l.next();return o.join(`\r
`)};function rr(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(fs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Rl(o){let l="";return J(o,function(h,p){l+=p,l+=":",l+=h,l+=`\r
`}),l}function so(o,l,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=Rl(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):Z(o,l,h))}function ne(o){we.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(ne,we);var Jm=/^https?$/i,Xm=["POST","PUT"];n=ne.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,l,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);l=l?l.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Ji.g(),this.v=this.o?rl(this.o):rl(Ji),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(l,String(o),!0),this.B=!1}catch(S){Pl(this,S);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var b in p)h.set(b,p[b]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const S of p.keys())h.set(S,p.get(S));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(S=>S.toLowerCase()=="content-type"),b=c.FormData&&o instanceof c.FormData,!(0<=Array.prototype.indexOf.call(Xm,l,void 0))||p||b||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,V]of h)this.g.setRequestHeader(S,V);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Nl(this),this.u=!0,this.g.send(o),this.u=!1}catch(S){Pl(this,S)}};function Pl(o,l){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=l,o.m=5,kl(o),ps(o)}function kl(o){o.A||(o.A=!0,De(o,"complete"),De(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,De(this,"complete"),De(this,"abort"),ps(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ps(this,!0)),ne.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Dl(this):this.bb())},n.bb=function(){Dl(this)};function Dl(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Je(o)!=4||o.Z()!=2)){if(o.u&&Je(o)==4)Zc(o.Ea,0,o);else if(De(o,"readystatechange"),Je(o)==4){o.h=!1;try{const V=o.Z();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var h;if(!(h=l)){var p;if(p=V===0){var b=String(o.D).match(El)[1]||null;!b&&c.self&&c.self.location&&(b=c.self.location.protocol.slice(0,-1)),p=!Jm.test(b?b.toLowerCase():"")}h=p}if(h)De(o,"complete"),De(o,"success");else{o.m=6;try{var S=2<Je(o)?o.g.statusText:""}catch{S=""}o.l=S+" ["+o.Z()+"]",kl(o)}}finally{ps(o)}}}}function ps(o,l){if(o.g){Nl(o);const h=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,l||De(o,"ready");try{h.onreadystatechange=p}catch{}}}function Nl(o){o.I&&(c.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function Je(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<Je(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var l=this.g.responseText;return o&&l.indexOf(o)==0&&(l=l.substring(o.length)),km(l)}};function Vl(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Zm(o){const l={};o=(o.g&&2<=Je(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(O(o[p]))continue;var h=w(o[p]);const b=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const S=l[b]||[];l[b]=S,S.push(h)}T(l,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function sr(o,l,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||l}function Ll(o){this.Aa=0,this.i=[],this.j=new Jn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=sr("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=sr("baseRetryDelayMs",5e3,o),this.cb=sr("retryDelaySeedMs",1e4,o),this.Wa=sr("forwardChannelMaxRetries",2,o),this.wa=sr("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new ml(o&&o.concurrentRequestLimit),this.Da=new Qm,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=Ll.prototype,n.la=8,n.G=1,n.connect=function(o,l,h,p){Ne(0),this.W=o,this.H=l||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=jl(this,null,this.W),gs(this)};function io(o){if(xl(o),o.G==3){var l=o.U++,h=Ye(o.I);if(Z(h,"SID",o.K),Z(h,"RID",l),Z(h,"TYPE","terminate"),ir(o,h),l=new dt(o,o.j,l),l.L=2,l.v=hs(Ye(h)),h=!1,c.navigator&&c.navigator.sendBeacon)try{h=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!h&&c.Image&&(new Image().src=l.v,h=!0),h||(l.g=ql(l.j,null),l.g.ea(l.v)),l.F=Date.now(),cs(l)}Hl(o)}function ms(o){o.g&&(ao(o),o.g.cancel(),o.g=null)}function xl(o){ms(o),o.u&&(c.clearTimeout(o.u),o.u=null),ys(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&c.clearTimeout(o.s),o.s=null)}function gs(o){if(!gl(o.h)&&!o.s){o.s=!0;var l=o.Ga;ce||es(),je||(ce(),je=!0),on.add(l,o),o.B=0}}function eg(o,l){return yl(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=l.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Yn(g(o.Ga,o,l),$l(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const b=new dt(this,this.j,o);let S=this.o;if(this.S&&(S?(S=_(S),v(S,this.S)):S=this.S),this.m!==null||this.O||(b.H=S,S=null),this.P)e:{for(var l=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=h;break e}if(l===4096||h===this.i.length-1){l=h+1;break e}}l=1e3}else l=1e3;l=Ol(this,b,l),h=Ye(this.I),Z(h,"RID",o),Z(h,"CVER",22),this.D&&Z(h,"X-HTTP-Session-Id",this.D),ir(this,h),S&&(this.O?l="headers="+encodeURIComponent(String(Rl(S)))+"&"+l:this.m&&so(h,this.m,S)),ro(this.h,b),this.Ua&&Z(h,"TYPE","init"),this.P?(Z(h,"$req",l),Z(h,"SID","null"),b.T=!0,Zi(b,h,null)):Zi(b,h,l),this.G=2}}else this.G==3&&(o?Ml(this,o):this.i.length==0||gl(this.h)||Ml(this))};function Ml(o,l){var h;l?h=l.l:h=o.U++;const p=Ye(o.I);Z(p,"SID",o.K),Z(p,"RID",h),Z(p,"AID",o.T),ir(o,p),o.m&&o.o&&so(p,o.m,o.o),h=new dt(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),l&&(o.i=l.D.concat(o.i)),l=Ol(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),ro(o.h,h),Zi(h,p,l)}function ir(o,l){o.H&&J(o.H,function(h,p){Z(l,p,h)}),o.l&&Il({},function(h,p){Z(l,p,h)})}function Ol(o,l,h){h=Math.min(o.i.length,h);var p=o.l?g(o.l.Na,o.l,o):null;e:{var b=o.i;let S=-1;for(;;){const V=["count="+h];S==-1?0<h?(S=b[0].g,V.push("ofs="+S)):S=0:V.push("ofs="+S);let Q=!0;for(let ye=0;ye<h;ye++){let W=b[ye].g;const Te=b[ye].map;if(W-=S,0>W)S=Math.max(0,b[ye].g-100),Q=!1;else try{Ym(Te,V,"req"+W+"_")}catch{p&&p(Te)}}if(Q){p=V.join("&");break e}}}return o=o.i.splice(0,h),l.D=o,p}function Fl(o){if(!o.g&&!o.u){o.Y=1;var l=o.Fa;ce||es(),je||(ce(),je=!0),on.add(l,o),o.v=0}}function oo(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Yn(g(o.Fa,o),$l(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,Ul(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Yn(g(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ne(10),ms(this),Ul(this))};function ao(o){o.A!=null&&(c.clearTimeout(o.A),o.A=null)}function Ul(o){o.g=new dt(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var l=Ye(o.qa);Z(l,"RID","rpc"),Z(l,"SID",o.K),Z(l,"AID",o.T),Z(l,"CI",o.F?"0":"1"),!o.F&&o.ja&&Z(l,"TO",o.ja),Z(l,"TYPE","xmlhttp"),ir(o,l),o.m&&o.o&&so(l,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=hs(Ye(l)),h.m=null,h.P=!0,dl(h,o)}n.Za=function(){this.C!=null&&(this.C=null,ms(this),oo(this),Ne(19))};function ys(o){o.C!=null&&(c.clearTimeout(o.C),o.C=null)}function Bl(o,l){var h=null;if(o.g==l){ys(o),ao(o),o.g=null;var p=2}else if(no(o.h,l))h=l.D,_l(o.h,l),p=1;else return;if(o.G!=0){if(l.o)if(p==1){h=l.m?l.m.length:0,l=Date.now()-l.F;var b=o.B;p=is(),De(p,new cl(p,h)),gs(o)}else Fl(o);else if(b=l.s,b==3||b==0&&0<l.X||!(p==1&&eg(o,l)||p==2&&oo(o)))switch(h&&0<h.length&&(l=o.h,l.i=l.i.concat(h)),b){case 1:$t(o,5);break;case 4:$t(o,10);break;case 3:$t(o,6);break;default:$t(o,2)}}}function $l(o,l){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*l}function $t(o,l){if(o.j.info("Error code "+l),l==2){var h=g(o.fb,o),p=o.Xa;const b=!p;p=new Bt(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||ls(p,"https"),hs(p),b?Wm(p.toString(),h):Km(p.toString(),h)}else Ne(2);o.G=0,o.l&&o.l.sa(l),Hl(o),xl(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Ne(2)):(this.j.info("Failed to ping google.com"),Ne(1))};function Hl(o){if(o.G=0,o.ka=[],o.l){const l=vl(o.h);(l.length!=0||o.i.length!=0)&&(P(o.ka,l),P(o.ka,o.i),o.h.i.length=0,R(o.i),o.i.length=0),o.l.ra()}}function jl(o,l,h){var p=h instanceof Bt?Ye(h):new Bt(h);if(p.g!="")l&&(p.g=l+"."+p.g),us(p,p.s);else{var b=c.location;p=b.protocol,l=l?l+"."+b.hostname:b.hostname,b=+b.port;var S=new Bt(null);p&&ls(S,p),l&&(S.g=l),b&&us(S,b),h&&(S.l=h),p=S}return h=o.D,l=o.ya,h&&l&&Z(p,h,l),Z(p,"VER",o.la),ir(o,p),p}function ql(o,l,h){if(l&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=o.Ca&&!o.pa?new ne(new ds({eb:h})):new ne(o.pa),l.Ha(o.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function zl(){}n=zl.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function _s(){}_s.prototype.g=function(o,l){return new Oe(o,l)};function Oe(o,l){we.call(this),this.g=new Ll(l),this.l=o,this.h=l&&l.messageUrlParams||null,o=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(o?o["X-WebChannel-Content-Type"]=l.messageContentType:o={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(o?o["X-WebChannel-Client-Profile"]=l.va:o={"X-WebChannel-Client-Profile":l.va}),this.g.S=o,(o=l&&l.Sb)&&!O(o)&&(this.g.m=o),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!O(l)&&(this.g.D=l,o=this.h,o!==null&&l in o&&(o=this.h,l in o&&delete o[l])),this.j=new ln(this)}C(Oe,we),Oe.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Oe.prototype.close=function(){io(this.g)},Oe.prototype.o=function(o){var l=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=Wi(o),o=h);l.i.push(new Om(l.Ya++,o)),l.G==3&&gs(l)},Oe.prototype.N=function(){this.g.l=null,delete this.j,io(this.g),delete this.g,Oe.aa.N.call(this)};function Gl(o){Qi.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var l=o.__sm__;if(l){e:{for(const h in l){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,l=l!==null&&o in l?l[o]:void 0),this.data=l}else this.data=o}C(Gl,Qi);function Wl(){Yi.call(this),this.status=1}C(Wl,Yi);function ln(o){this.g=o}C(ln,zl),ln.prototype.ua=function(){De(this.g,"a")},ln.prototype.ta=function(o){De(this.g,new Gl(o))},ln.prototype.sa=function(o){De(this.g,new Wl)},ln.prototype.ra=function(){De(this.g,"b")},_s.prototype.createWebChannel=_s.prototype.g,Oe.prototype.send=Oe.prototype.o,Oe.prototype.open=Oe.prototype.m,Oe.prototype.close=Oe.prototype.close,df=function(){return new _s},hf=function(){return is()},uf=Ft,Yo={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},os.NO_ERROR=0,os.TIMEOUT=8,os.HTTP_ERROR=6,Vs=os,ll.COMPLETE="complete",lf=ll,sl.EventType=Kn,Kn.OPEN="a",Kn.CLOSE="b",Kn.ERROR="c",Kn.MESSAGE="d",we.prototype.listen=we.prototype.K,lr=sl,ne.prototype.listenOnce=ne.prototype.L,ne.prototype.getLastError=ne.prototype.Ka,ne.prototype.getLastErrorCode=ne.prototype.Ba,ne.prototype.getStatus=ne.prototype.Z,ne.prototype.getResponseJson=ne.prototype.Oa,ne.prototype.getResponseText=ne.prototype.oa,ne.prototype.send=ne.prototype.ea,ne.prototype.setWithCredentials=ne.prototype.Ha,cf=ne}).apply(typeof Es<"u"?Es:typeof self<"u"?self:typeof window<"u"?window:{});const bu="@firebase/firestore";/**
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
 */class Se{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Se.UNAUTHENTICATED=new Se(null),Se.GOOGLE_CREDENTIALS=new Se("google-credentials-uid"),Se.FIRST_PARTY=new Se("first-party-uid"),Se.MOCK_USER=new Se("mock-user");/**
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
 */let jn="10.14.0";/**
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
 */const tn=new Ca("@firebase/firestore");function or(){return tn.logLevel}function x(n,...e){if(tn.logLevel<=H.DEBUG){const t=e.map(Fa);tn.debug(`Firestore (${jn}): ${n}`,...t)}}function ct(n,...e){if(tn.logLevel<=H.ERROR){const t=e.map(Fa);tn.error(`Firestore (${jn}): ${n}`,...t)}}function Vn(n,...e){if(tn.logLevel<=H.WARN){const t=e.map(Fa);tn.warn(`Firestore (${jn}): ${n}`,...t)}}function Fa(n){if(typeof n=="string")return n;try{/**
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
 */function $(n="Unexpected state"){const e=`FIRESTORE (${jn}) INTERNAL ASSERTION FAILED: `+n;throw ct(e),new Error(e)}function re(n,e){n||$()}function q(n,e){return n}/**
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
 */const D={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class L extends lt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class St{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
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
 */class ff{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Yv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Se.UNAUTHENTICATED))}shutdown(){}}class Jv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Xv{constructor(e){this.t=e,this.currentUser=Se.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){re(this.o===void 0);let r=this.i;const s=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let i=new St;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new St,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new St)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(re(typeof r.accessToken=="string"),new ff(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return re(e===null||typeof e=="string"),new Se(e)}}class Zv{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=Se.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class eI{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new Zv(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Se.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class tI{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class nI{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){re(this.o===void 0);const r=i=>{i.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,x("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(re(typeof t.token=="string"),this.R=t.token,new tI(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function rI(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class pf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=rI(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function K(n,e){return n<e?-1:n>e?1:0}function Ln(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
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
 */class pe{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new L(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new L(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new L(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new L(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return pe.fromMillis(Date.now())}static fromDate(e){return pe.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new pe(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?K(this.nanoseconds,e.nanoseconds):K(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class U{constructor(e){this.timestamp=e}static fromTimestamp(e){return new U(e)}static min(){return new U(new pe(0,0))}static max(){return new U(new pe(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class Rr{constructor(e,t,r){t===void 0?t=0:t>e.length&&$(),r===void 0?r=e.length-t:r>e.length-t&&$(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Rr.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Rr?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),a=t.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class ee extends Rr{construct(e,t,r){return new ee(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new L(D.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new ee(t)}static emptyPath(){return new ee([])}}const sI=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Re extends Rr{construct(e,t,r){return new Re(e,t,r)}static isValidIdentifier(e){return sI.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Re.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Re(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new L(D.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new L(D.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new L(D.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new L(D.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Re(t)}static emptyPath(){return new Re([])}}/**
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
 */class M{constructor(e){this.path=e}static fromPath(e){return new M(ee.fromString(e))}static fromName(e){return new M(ee.fromString(e).popFirst(5))}static empty(){return new M(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new M(new ee(e.slice()))}}function iI(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=U.fromTimestamp(r===1e9?new pe(t+1,0):new pe(t,r));return new Dt(s,M.empty(),e)}function oI(n){return new Dt(n.readTime,n.key,-1)}class Dt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Dt(U.min(),M.empty(),-1)}static max(){return new Dt(U.max(),M.empty(),-1)}}function aI(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=M.comparator(n.documentKey,e.documentKey),t!==0?t:K(n.largestBatchId,e.largestBatchId))}/**
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
 */const cI="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class lI{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function Ua(n){if(n.code!==D.FAILED_PRECONDITION||n.message!==cI)throw n;x("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class k{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&$(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new k((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof k?t:k.resolve(t)}catch(t){return k.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):k.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):k.reject(t)}static resolve(e){return new k((t,r)=>{t(e)})}static reject(e){return new k((t,r)=>{r(e)})}static waitFor(e){return new k((t,r)=>{let s=0,i=0,a=!1;e.forEach(c=>{++s,c.next(()=>{++i,a&&i===s&&t()},u=>r(u))}),a=!0,i===s&&t()})}static or(e){let t=k.resolve(!1);for(const r of e)t=t.next(s=>s?k.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new k((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let u=0;u<i;u++){const d=u;t(e[d]).next(f=>{a[d]=f,++c,c===i&&r(a)},f=>s(f))}})}static doWhile(e,t){return new k((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function uI(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function zr(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class Ba{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Ba.oe=-1;function yi(n){return n==null}function Js(n){return n===0&&1/n==-1/0}function hI(n){return typeof n=="number"&&Number.isInteger(n)&&!Js(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */function Su(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Gr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function mf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class ae{constructor(e,t){this.comparator=e,this.root=t||_e.EMPTY}insert(e,t){return new ae(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,_e.BLACK,null,null))}remove(e){return new ae(this.comparator,this.root.remove(e,this.comparator).copy(null,null,_e.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ws(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ws(this.root,e,this.comparator,!1)}getReverseIterator(){return new ws(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ws(this.root,e,this.comparator,!0)}}class ws{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class _e{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??_e.RED,this.left=s??_e.EMPTY,this.right=i??_e.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new _e(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return _e.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return _e.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,_e.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,_e.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw $();const e=this.left.check();if(e!==this.right.check())throw $();return e+(this.isRed()?0:1)}}_e.EMPTY=null,_e.RED=!0,_e.BLACK=!1;_e.EMPTY=new class{constructor(){this.size=0}get key(){throw $()}get value(){throw $()}get color(){throw $()}get left(){throw $()}get right(){throw $()}copy(e,t,r,s,i){return this}insert(e,t,r){return new _e(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class Ie{constructor(e){this.comparator=e,this.data=new ae(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Cu(this.data.getIterator())}getIteratorFrom(e){return new Cu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof Ie)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new Ie(this.comparator);return t.data=e,t}}class Cu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class It{constructor(e){this.fields=e,e.sort(Re.comparator)}static empty(){return new It([])}unionWith(e){let t=new Ie(Re.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new It(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Ln(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class gf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Ee{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new gf("Invalid base64 string: "+i):i}}(e);return new Ee(t)}static fromUint8Array(e){const t=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new Ee(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return K(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ee.EMPTY_BYTE_STRING=new Ee("");const dI=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Nt(n){if(re(!!n),typeof n=="string"){let e=0;const t=dI.exec(n);if(re(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:oe(n.seconds),nanos:oe(n.nanos)}}function oe(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function nn(n){return typeof n=="string"?Ee.fromBase64String(n):Ee.fromUint8Array(n)}/**
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
 */function $a(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Ha(n){const e=n.mapValue.fields.__previous_value__;return $a(e)?Ha(e):e}function Pr(n){const e=Nt(n.mapValue.fields.__local_write_time__.timestampValue);return new pe(e.seconds,e.nanos)}/**
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
 */class fI{constructor(e,t,r,s,i,a,c,u,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=d}}class kr{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new kr("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof kr&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const Ts={mapValue:{}};function rn(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?$a(n)?4:mI(n)?9007199254740991:pI(n)?10:11:$()}function Qe(n,e){if(n===e)return!0;const t=rn(n);if(t!==rn(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Pr(n).isEqual(Pr(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=Nt(s.timestampValue),c=Nt(i.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return nn(s.bytesValue).isEqual(nn(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return oe(s.geoPointValue.latitude)===oe(i.geoPointValue.latitude)&&oe(s.geoPointValue.longitude)===oe(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return oe(s.integerValue)===oe(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=oe(s.doubleValue),c=oe(i.doubleValue);return a===c?Js(a)===Js(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return Ln(n.arrayValue.values||[],e.arrayValue.values||[],Qe);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},c=i.mapValue.fields||{};if(Su(a)!==Su(c))return!1;for(const u in a)if(a.hasOwnProperty(u)&&(c[u]===void 0||!Qe(a[u],c[u])))return!1;return!0}(n,e);default:return $()}}function Dr(n,e){return(n.values||[]).find(t=>Qe(t,e))!==void 0}function xn(n,e){if(n===e)return 0;const t=rn(n),r=rn(e);if(t!==r)return K(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return K(n.booleanValue,e.booleanValue);case 2:return function(i,a){const c=oe(i.integerValue||i.doubleValue),u=oe(a.integerValue||a.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return Ru(n.timestampValue,e.timestampValue);case 4:return Ru(Pr(n),Pr(e));case 5:return K(n.stringValue,e.stringValue);case 6:return function(i,a){const c=nn(i),u=nn(a);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(i,a){const c=i.split("/"),u=a.split("/");for(let d=0;d<c.length&&d<u.length;d++){const f=K(c[d],u[d]);if(f!==0)return f}return K(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,a){const c=K(oe(i.latitude),oe(a.latitude));return c!==0?c:K(oe(i.longitude),oe(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Pu(n.arrayValue,e.arrayValue);case 10:return function(i,a){var c,u,d,f;const m=i.fields||{},g=a.fields||{},E=(c=m.value)===null||c===void 0?void 0:c.arrayValue,C=(u=g.value)===null||u===void 0?void 0:u.arrayValue,R=K(((d=E==null?void 0:E.values)===null||d===void 0?void 0:d.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return R!==0?R:Pu(E,C)}(n.mapValue,e.mapValue);case 11:return function(i,a){if(i===Ts.mapValue&&a===Ts.mapValue)return 0;if(i===Ts.mapValue)return 1;if(a===Ts.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),d=a.fields||{},f=Object.keys(d);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const g=K(u[m],f[m]);if(g!==0)return g;const E=xn(c[u[m]],d[f[m]]);if(E!==0)return E}return K(u.length,f.length)}(n.mapValue,e.mapValue);default:throw $()}}function Ru(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return K(n,e);const t=Nt(n),r=Nt(e),s=K(t.seconds,r.seconds);return s!==0?s:K(t.nanos,r.nanos)}function Pu(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=xn(t[s],r[s]);if(i)return i}return K(t.length,r.length)}function Mn(n){return Jo(n)}function Jo(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=Nt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return nn(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return M.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Jo(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${Jo(t.fields[a])}`;return s+"}"}(n.mapValue):$()}function ku(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Xo(n){return!!n&&"integerValue"in n}function ja(n){return!!n&&"arrayValue"in n}function Du(n){return!!n&&"nullValue"in n}function Nu(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function yo(n){return!!n&&"mapValue"in n}function pI(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function yr(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Gr(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=yr(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=yr(n.arrayValue.values[t]);return e}return Object.assign({},n)}function mI(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class ze{constructor(e){this.value=e}static empty(){return new ze({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!yo(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=yr(t)}setAll(e){let t=Re.emptyPath(),r={},s=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=yr(a):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());yo(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Qe(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];yo(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Gr(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new ze(yr(this.value))}}/**
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
 */class Ce{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new Ce(e,0,U.min(),U.min(),U.min(),ze.empty(),0)}static newFoundDocument(e,t,r,s){return new Ce(e,1,t,U.min(),r,s,0)}static newNoDocument(e,t){return new Ce(e,2,t,U.min(),U.min(),ze.empty(),0)}static newUnknownDocument(e,t){return new Ce(e,3,t,U.min(),U.min(),ze.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ze.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ze.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ce&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ce(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Xs{constructor(e,t){this.position=e,this.inclusive=t}}function Vu(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=M.comparator(M.fromName(a.referenceValue),t.key):r=xn(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Lu(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Qe(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Nr{constructor(e,t="asc"){this.field=e,this.dir=t}}function gI(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class yf{}class ue extends yf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new _I(e,t,r):t==="array-contains"?new EI(e,r):t==="in"?new wI(e,r):t==="not-in"?new TI(e,r):t==="array-contains-any"?new AI(e,r):new ue(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new vI(e,r):new II(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(xn(t,this.value)):t!==null&&rn(this.value)===rn(t)&&this.matchesComparison(xn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return $()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class He extends yf{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new He(e,t)}matches(e){return _f(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function _f(n){return n.op==="and"}function vf(n){return yI(n)&&_f(n)}function yI(n){for(const e of n.filters)if(e instanceof He)return!1;return!0}function Zo(n){if(n instanceof ue)return n.field.canonicalString()+n.op.toString()+Mn(n.value);if(vf(n))return n.filters.map(e=>Zo(e)).join(",");{const e=n.filters.map(t=>Zo(t)).join(",");return`${n.op}(${e})`}}function If(n,e){return n instanceof ue?function(r,s){return s instanceof ue&&r.op===s.op&&r.field.isEqual(s.field)&&Qe(r.value,s.value)}(n,e):n instanceof He?function(r,s){return s instanceof He&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,c)=>i&&If(a,s.filters[c]),!0):!1}(n,e):void $()}function Ef(n){return n instanceof ue?function(t){return`${t.field.canonicalString()} ${t.op} ${Mn(t.value)}`}(n):n instanceof He?function(t){return t.op.toString()+" {"+t.getFilters().map(Ef).join(" ,")+"}"}(n):"Filter"}class _I extends ue{constructor(e,t,r){super(e,t,r),this.key=M.fromName(r.referenceValue)}matches(e){const t=M.comparator(e.key,this.key);return this.matchesComparison(t)}}class vI extends ue{constructor(e,t){super(e,"in",t),this.keys=wf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class II extends ue{constructor(e,t){super(e,"not-in",t),this.keys=wf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function wf(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>M.fromName(r.referenceValue))}class EI extends ue{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return ja(t)&&Dr(t.arrayValue,this.value)}}class wI extends ue{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Dr(this.value.arrayValue,t)}}class TI extends ue{constructor(e,t){super(e,"not-in",t)}matches(e){if(Dr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Dr(this.value.arrayValue,t)}}class AI extends ue{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!ja(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Dr(this.value.arrayValue,r))}}/**
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
 */class bI{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.ue=null}}function xu(n,e=null,t=[],r=[],s=null,i=null,a=null){return new bI(n,e,t,r,s,i,a)}function qa(n){const e=q(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Zo(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),yi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Mn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Mn(r)).join(",")),e.ue=t}return e.ue}function za(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!gI(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!If(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!Lu(n.startAt,e.startAt)&&Lu(n.endAt,e.endAt)}function ea(n){return M.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class qn{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function SI(n,e,t,r,s,i,a,c){return new qn(n,e,t,r,s,i,a,c)}function _i(n){return new qn(n)}function Mu(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Tf(n){return n.collectionGroup!==null}function _r(n){const e=q(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new Ie(Re.comparator);return a.filters.forEach(u=>{u.getFlattenedFilters().forEach(d=>{d.isInequality()&&(c=c.add(d.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Nr(i,r))}),t.has(Re.keyField().canonicalString())||e.ce.push(new Nr(Re.keyField(),r))}return e.ce}function Ke(n){const e=q(n);return e.le||(e.le=CI(e,_r(n))),e.le}function CI(n,e){if(n.limitType==="F")return xu(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Nr(s.field,i)});const t=n.endAt?new Xs(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Xs(n.startAt.position,n.startAt.inclusive):null;return xu(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ta(n,e){const t=n.filters.concat([e]);return new qn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Zs(n,e,t){return new qn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function vi(n,e){return za(Ke(n),Ke(e))&&n.limitType===e.limitType}function Af(n){return`${qa(Ke(n))}|lt:${n.limitType}`}function yn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Ef(s)).join(", ")}]`),yi(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Mn(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Mn(s)).join(",")),`Target(${r})`}(Ke(n))}; limitType=${n.limitType})`}function Ii(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):M.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of _r(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(a,c,u){const d=Vu(a,c,u);return a.inclusive?d<=0:d<0}(r.startAt,_r(r),s)||r.endAt&&!function(a,c,u){const d=Vu(a,c,u);return a.inclusive?d>=0:d>0}(r.endAt,_r(r),s))}(n,e)}function RI(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function bf(n){return(e,t)=>{let r=!1;for(const s of _r(n)){const i=PI(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function PI(n,e,t){const r=n.field.isKeyField()?M.comparator(e.key,t.key):function(i,a,c){const u=a.data.field(i),d=c.data.field(i);return u!==null&&d!==null?xn(u,d):$()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return $()}}/**
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
 */class zn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Gr(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return mf(this.inner)}size(){return this.innerSize}}/**
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
 */const kI=new ae(M.comparator);function Vt(){return kI}const Sf=new ae(M.comparator);function ur(...n){let e=Sf;for(const t of n)e=e.insert(t.key,t);return e}function DI(n){let e=Sf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Kt(){return vr()}function Cf(){return vr()}function vr(){return new zn(n=>n.toString(),(n,e)=>n.isEqual(e))}const NI=new Ie(M.comparator);function G(...n){let e=NI;for(const t of n)e=e.add(t);return e}const VI=new Ie(K);function LI(){return VI}/**
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
 */function Ga(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Js(e)?"-0":e}}function Rf(n){return{integerValue:""+n}}function xI(n,e){return hI(e)?Rf(e):Ga(n,e)}/**
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
 */class Ei{constructor(){this._=void 0}}function MI(n,e,t){return n instanceof na?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&$a(i)&&(i=Ha(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(t,e):n instanceof ei?Pf(n,e):n instanceof ti?kf(n,e):function(s,i){const a=FI(s,i),c=Ou(a)+Ou(s.Pe);return Xo(a)&&Xo(s.Pe)?Rf(c):Ga(s.serializer,c)}(n,e)}function OI(n,e,t){return n instanceof ei?Pf(n,e):n instanceof ti?kf(n,e):t}function FI(n,e){return n instanceof ra?function(r){return Xo(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class na extends Ei{}class ei extends Ei{constructor(e){super(),this.elements=e}}function Pf(n,e){const t=Df(e);for(const r of n.elements)t.some(s=>Qe(s,r))||t.push(r);return{arrayValue:{values:t}}}class ti extends Ei{constructor(e){super(),this.elements=e}}function kf(n,e){let t=Df(e);for(const r of n.elements)t=t.filter(s=>!Qe(s,r));return{arrayValue:{values:t}}}class ra extends Ei{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Ou(n){return oe(n.integerValue||n.doubleValue)}function Df(n){return ja(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function UI(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof ei&&s instanceof ei||r instanceof ti&&s instanceof ti?Ln(r.elements,s.elements,Qe):r instanceof ra&&s instanceof ra?Qe(r.Pe,s.Pe):r instanceof na&&s instanceof na}(n.transform,e.transform)}class Yt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Yt}static exists(e){return new Yt(void 0,e)}static updateTime(e){return new Yt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ls(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Wa{}function Nf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new $I(n.key,Yt.none()):new Ka(n.key,n.data,Yt.none());{const t=n.data,r=ze.empty();let s=new Ie(Re.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new wi(n.key,r,new It(s.toArray()),Yt.none())}}function BI(n,e,t){n instanceof Ka?function(s,i,a){const c=s.value.clone(),u=Uu(s.fieldTransforms,i,a.transformResults);c.setAll(u),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof wi?function(s,i,a){if(!Ls(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=Uu(s.fieldTransforms,i,a.transformResults),u=i.data;u.setAll(Vf(s)),u.setAll(c),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Ir(n,e,t,r){return n instanceof Ka?function(i,a,c,u){if(!Ls(i.precondition,a))return c;const d=i.value.clone(),f=Bu(i.fieldTransforms,u,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof wi?function(i,a,c,u){if(!Ls(i.precondition,a))return c;const d=Bu(i.fieldTransforms,u,a),f=a.data;return f.setAll(Vf(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(i,a,c){return Ls(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function Fu(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Ln(r,s,(i,a)=>UI(i,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Ka extends Wa{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class wi extends Wa{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Vf(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Uu(n,e,t){const r=new Map;re(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,OI(a,c,t[s]))}return r}function Bu(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,MI(i,a,e))}return r}class $I extends Wa{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class HI{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&BI(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Ir(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Ir(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Cf();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const u=Nf(a,c);u!==null&&r.set(s.key,u),a.isValidDocument()||a.convertToNoDocument(U.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),G())}isEqual(e){return this.batchId===e.batchId&&Ln(this.mutations,e.mutations,(t,r)=>Fu(t,r))&&Ln(this.baseMutations,e.baseMutations,(t,r)=>Fu(t,r))}}/**
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
 */class jI{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class qI{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var le,j;function Lf(n){if(n===void 0)return ct("GRPC error has no .code"),D.UNKNOWN;switch(n){case le.OK:return D.OK;case le.CANCELLED:return D.CANCELLED;case le.UNKNOWN:return D.UNKNOWN;case le.DEADLINE_EXCEEDED:return D.DEADLINE_EXCEEDED;case le.RESOURCE_EXHAUSTED:return D.RESOURCE_EXHAUSTED;case le.INTERNAL:return D.INTERNAL;case le.UNAVAILABLE:return D.UNAVAILABLE;case le.UNAUTHENTICATED:return D.UNAUTHENTICATED;case le.INVALID_ARGUMENT:return D.INVALID_ARGUMENT;case le.NOT_FOUND:return D.NOT_FOUND;case le.ALREADY_EXISTS:return D.ALREADY_EXISTS;case le.PERMISSION_DENIED:return D.PERMISSION_DENIED;case le.FAILED_PRECONDITION:return D.FAILED_PRECONDITION;case le.ABORTED:return D.ABORTED;case le.OUT_OF_RANGE:return D.OUT_OF_RANGE;case le.UNIMPLEMENTED:return D.UNIMPLEMENTED;case le.DATA_LOSS:return D.DATA_LOSS;default:return $()}}(j=le||(le={}))[j.OK=0]="OK",j[j.CANCELLED=1]="CANCELLED",j[j.UNKNOWN=2]="UNKNOWN",j[j.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",j[j.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",j[j.NOT_FOUND=5]="NOT_FOUND",j[j.ALREADY_EXISTS=6]="ALREADY_EXISTS",j[j.PERMISSION_DENIED=7]="PERMISSION_DENIED",j[j.UNAUTHENTICATED=16]="UNAUTHENTICATED",j[j.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",j[j.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",j[j.ABORTED=10]="ABORTED",j[j.OUT_OF_RANGE=11]="OUT_OF_RANGE",j[j.UNIMPLEMENTED=12]="UNIMPLEMENTED",j[j.INTERNAL=13]="INTERNAL",j[j.UNAVAILABLE=14]="UNAVAILABLE",j[j.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function zI(){return new TextEncoder}/**
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
 */const GI=new Qt([4294967295,4294967295],0);function $u(n){const e=zI().encode(n),t=new af;return t.update(e),new Uint8Array(t.digest())}function Hu(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Qt([t,r],0),new Qt([s,i],0)]}class Qa{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new hr(`Invalid padding: ${t}`);if(r<0)throw new hr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new hr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new hr(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Qt.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(Qt.fromNumber(r)));return s.compare(GI)===1&&(s=new Qt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=$u(e),[r,s]=Hu(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Qa(i,s,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.Ie===0)return;const t=$u(e),[r,s]=Hu(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class hr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Ti{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Wr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Ti(U.min(),s,new ae(K),Vt(),G())}}class Wr{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Wr(r,t,G(),G(),G())}}/**
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
 */class xs{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class xf{constructor(e,t){this.targetId=e,this.me=t}}class Mf{constructor(e,t,r=Ee.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class ju{constructor(){this.fe=0,this.ge=zu(),this.pe=Ee.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=G(),t=G(),r=G();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:$()}}),new Wr(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=zu()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,re(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class WI{constructor(e){this.Le=e,this.Be=new Map,this.ke=Vt(),this.qe=qu(),this.Qe=new ae(K)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:$()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(ea(i))if(r===0){const a=new M(i.path);this.Ue(t,a,Ce.newNoDocument(a,U.min()))}else re(r===1);else{const a=this.Ye(t);if(a!==r){const c=this.Ze(e),u=c?this.Xe(c,e,a):1;if(u!==0){this.je(t);const d=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=nn(r).toUint8Array()}catch(u){if(u instanceof gf)return Vn("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new Qa(a,s,i)}catch(u){return Vn(u instanceof hr?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.Ie===0?null:c}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const a=this.Le.tt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,a)=>{const c=this.Je(a);if(c){if(i.current&&ea(c.target)){const u=new M(c.target.path);this.ke.get(u)!==null||this.it(a,u)||this.Ue(a,u,Ce.newNoDocument(u,e))}i.be&&(t.set(a,i.ve()),i.Ce())}});let r=G();this.qe.forEach((i,a)=>{let c=!0;a.forEachWhile(u=>{const d=this.Je(u);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new Ti(e,t,this.Qe,this.ke,r);return this.ke=Vt(),this.qe=qu(),this.Qe=new ae(K),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new ju,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new Ie(K),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||x("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new ju),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function qu(){return new ae(M.comparator)}function zu(){return new ae(M.comparator)}const KI={asc:"ASCENDING",desc:"DESCENDING"},QI={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},YI={and:"AND",or:"OR"};class JI{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function sa(n,e){return n.useProto3Json||yi(e)?e:{value:e}}function ia(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Of(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Sn(n){return re(!!n),U.fromTimestamp(function(t){const r=Nt(t);return new pe(r.seconds,r.nanos)}(n))}function Ff(n,e){return oa(n,e).canonicalString()}function oa(n,e){const t=function(s){return new ee(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function Uf(n){const e=ee.fromString(n);return re(qf(e)),e}function _o(n,e){const t=Uf(e);if(t.get(1)!==n.databaseId.projectId)throw new L(D.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new L(D.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new M($f(t))}function Bf(n,e){return Ff(n.databaseId,e)}function XI(n){const e=Uf(n);return e.length===4?ee.emptyPath():$f(e)}function Gu(n){return new ee(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function $f(n){return re(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function ZI(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:$()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(re(f===void 0||typeof f=="string"),Ee.fromBase64String(f||"")):(re(f===void 0||f instanceof Buffer||f instanceof Uint8Array),Ee.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(d){const f=d.code===void 0?D.UNKNOWN:Lf(d.code);return new L(f,d.message||"")}(a);t=new Mf(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=_o(n,r.document.name),i=Sn(r.document.updateTime),a=r.document.createTime?Sn(r.document.createTime):U.min(),c=new ze({mapValue:{fields:r.document.fields}}),u=Ce.newFoundDocument(s,i,a,c),d=r.targetIds||[],f=r.removedTargetIds||[];t=new xs(d,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=_o(n,r.document),i=r.readTime?Sn(r.readTime):U.min(),a=Ce.newNoDocument(s,i),c=r.removedTargetIds||[];t=new xs([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=_o(n,r.document),i=r.removedTargetIds||[];t=new xs([],i,s,null)}else{if(!("filter"in e))return $();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new qI(s,i),c=r.targetId;t=new xf(c,a)}}return t}function eE(n,e){return{documents:[Bf(n,e.path)]}}function tE(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Bf(n,s);const i=function(d){if(d.length!==0)return jf(He.create(d,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(g){return{field:_n(g.field),direction:sE(g.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=sa(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:s}}function nE(n){let e=XI(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){re(r===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const g=Hf(m);return g instanceof He&&vf(g)?g.getFilters():[g]}(t.where));let a=[];t.orderBy&&(a=function(m){return m.map(g=>function(C){return new Nr(vn(C.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(g))}(t.orderBy));let c=null;t.limit&&(c=function(m){let g;return g=typeof m=="object"?m.value:m,yi(g)?null:g}(t.limit));let u=null;t.startAt&&(u=function(m){const g=!!m.before,E=m.values||[];return new Xs(E,g)}(t.startAt));let d=null;return t.endAt&&(d=function(m){const g=!m.before,E=m.values||[];return new Xs(E,g)}(t.endAt)),SI(e,s,a,i,c,"F",u,d)}function rE(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return $()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Hf(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=vn(t.unaryFilter.field);return ue.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=vn(t.unaryFilter.field);return ue.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=vn(t.unaryFilter.field);return ue.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=vn(t.unaryFilter.field);return ue.create(a,"!=",{nullValue:"NULL_VALUE"});default:return $()}}(n):n.fieldFilter!==void 0?function(t){return ue.create(vn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return $()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return He.create(t.compositeFilter.filters.map(r=>Hf(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return $()}}(t.compositeFilter.op))}(n):$()}function sE(n){return KI[n]}function iE(n){return QI[n]}function oE(n){return YI[n]}function _n(n){return{fieldPath:n.canonicalString()}}function vn(n){return Re.fromServerFormat(n.fieldPath)}function jf(n){return n instanceof ue?function(t){if(t.op==="=="){if(Nu(t.value))return{unaryFilter:{field:_n(t.field),op:"IS_NAN"}};if(Du(t.value))return{unaryFilter:{field:_n(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Nu(t.value))return{unaryFilter:{field:_n(t.field),op:"IS_NOT_NAN"}};if(Du(t.value))return{unaryFilter:{field:_n(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:_n(t.field),op:iE(t.op),value:t.value}}}(n):n instanceof He?function(t){const r=t.getFilters().map(s=>jf(s));return r.length===1?r[0]:{compositeFilter:{op:oE(t.op),filters:r}}}(n):$()}function qf(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */class Et{constructor(e,t,r,s,i=U.min(),a=U.min(),c=Ee.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new Et(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Et(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Et(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Et(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class aE{constructor(e){this.ct=e}}function cE(n){const e=nE({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Zs(e,e.limit,"L"):e}/**
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
 */class lE{constructor(){this.un=new uE}addToCollectionParentIndex(e,t){return this.un.add(t),k.resolve()}getCollectionParents(e,t){return k.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return k.resolve()}deleteFieldIndex(e,t){return k.resolve()}deleteAllFieldIndexes(e){return k.resolve()}createTargetIndexes(e,t){return k.resolve()}getDocumentsMatchingTarget(e,t){return k.resolve(null)}getIndexType(e,t){return k.resolve(0)}getFieldIndexes(e,t){return k.resolve([])}getNextCollectionGroupToUpdate(e){return k.resolve(null)}getMinOffset(e,t){return k.resolve(Dt.min())}getMinOffsetFromCollectionGroup(e,t){return k.resolve(Dt.min())}updateCollectionGroup(e,t,r){return k.resolve()}updateIndexEntries(e,t){return k.resolve()}}class uE{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new Ie(ee.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Ie(ee.comparator)).toArray()}}/**
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
 */class On{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new On(0)}static kn(){return new On(-1)}}/**
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
 */class hE{constructor(){this.changes=new zn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ce.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?k.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class dE{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class fE{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Ir(r.mutation,s,It.empty(),pe.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,G()).next(()=>r))}getLocalViewOfDocuments(e,t,r=G()){const s=Kt();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let a=ur();return i.forEach((c,u)=>{a=a.insert(c,u.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=Kt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,G()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,s){let i=Vt();const a=vr(),c=function(){return vr()}();return t.forEach((u,d)=>{const f=r.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof wi)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),Ir(f.mutation,d,f.mutation.getFieldMask(),pe.now())):a.set(d.key,It.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var m;return c.set(d,new dE(f,(m=a.get(d))!==null&&m!==void 0?m:null))}),c))}recalculateAndSaveOverlays(e,t){const r=vr();let s=new ae((a,c)=>a-c),i=G();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(u=>{const d=t.get(u);if(d===null)return;let f=r.get(u)||It.empty();f=c.applyToLocalView(d,f),r.set(u,f);const m=(s.get(c.batchId)||G()).add(u);s=s.insert(c.batchId,m)})}).next(()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),d=u.key,f=u.value,m=Cf();f.forEach(g=>{if(!i.has(g)){const E=Nf(t.get(g),r.get(g));E!==null&&m.set(g,E),i=i.add(g)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,m))}return k.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(a){return M.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Tf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):k.resolve(Kt());let c=-1,u=i;return a.next(d=>k.forEach(d,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(f)?k.resolve():this.remoteDocumentCache.getEntry(e,f).next(g=>{u=u.insert(f,g)}))).next(()=>this.populateOverlays(e,d,i)).next(()=>this.computeViews(e,u,d,G())).next(f=>({batchId:c,changes:DI(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new M(t)).next(r=>{let s=ur();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=ur();return this.indexManager.getCollectionParents(e,i).next(c=>k.forEach(c,u=>{const d=function(m,g){return new qn(g,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next(f=>{f.forEach((m,g)=>{a=a.insert(m,g)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(a=>{i.forEach((u,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,Ce.newInvalidDocument(f)))});let c=ur();return a.forEach((u,d)=>{const f=i.get(u);f!==void 0&&Ir(f.mutation,d,It.empty(),pe.now()),Ii(t,d)&&(c=c.insert(u,d))}),c})}}/**
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
 */class pE{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return k.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:Sn(s.createTime)}}(t)),k.resolve()}getNamedQuery(e,t){return k.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:cE(s.bundledQuery),readTime:Sn(s.readTime)}}(t)),k.resolve()}}/**
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
 */class mE{constructor(){this.overlays=new ae(M.comparator),this.Ir=new Map}getOverlay(e,t){return k.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Kt();return k.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),k.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),k.resolve()}getOverlaysForCollection(e,t,r){const s=Kt(),i=t.length+1,a=new M(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const u=c.getNext().value,d=u.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return k.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new ae((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=i.get(d.largestBatchId);f===null&&(f=Kt(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const c=Kt(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((d,f)=>c.set(d,f)),!(c.size()>=s)););return k.resolve(c)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new jI(t,r));let i=this.Ir.get(t);i===void 0&&(i=G(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
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
 */class gE{constructor(){this.sessionToken=Ee.EMPTY_BYTE_STRING}getSessionToken(e){return k.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,k.resolve()}}/**
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
 */class Ya{constructor(){this.Tr=new Ie(ge.Er),this.dr=new Ie(ge.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new ge(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new ge(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new M(new ee([])),r=new ge(t,e),s=new ge(t,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new M(new ee([])),r=new ge(t,e),s=new ge(t,e+1);let i=G();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const t=new ge(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ge{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return M.comparator(e.key,t.key)||K(e.wr,t.wr)}static Ar(e,t){return K(e.wr,t.wr)||M.comparator(e.key,t.key)}}/**
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
 */class yE{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new Ie(ge.Er)}checkEmpty(e){return k.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new HI(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.br=this.br.add(new ge(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return k.resolve(a)}lookupMutationBatch(e,t){return k.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return k.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return k.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return k.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ge(t,0),s=new ge(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const c=this.Dr(a.wr);i.push(c)}),k.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new Ie(K);return t.forEach(s=>{const i=new ge(s,0),a=new ge(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],c=>{r=r.add(c.wr)})}),k.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;M.isDocumentKey(i)||(i=i.child(""));const a=new ge(new M(i),0);let c=new Ie(K);return this.br.forEachWhile(u=>{const d=u.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(c=c.add(u.wr)),!0)},a),k.resolve(this.Cr(c))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){re(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return k.forEach(t.mutations,s=>{const i=new ge(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new ge(t,0),s=this.br.firstAfterOrEqual(r);return k.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,k.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class _E{constructor(e){this.Mr=e,this.docs=function(){return new ae(M.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return k.resolve(r?r.document.mutableCopy():Ce.newInvalidDocument(t))}getEntries(e,t){let r=Vt();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ce.newInvalidDocument(s))}),k.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=Vt();const a=t.path,c=new M(a.child("")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:d,value:{document:f}}=u.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||aI(oI(f),r)<=0||(s.has(f.key)||Ii(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return k.resolve(i)}getAllFromCollectionGroup(e,t,r,s){$()}Or(e,t){return k.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new vE(this)}getSize(e){return k.resolve(this.size)}}class vE extends hE{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),k.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
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
 */class IE{constructor(e){this.persistence=e,this.Nr=new zn(t=>qa(t),za),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Ya,this.targetCount=0,this.kr=On.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),k.resolve()}getLastRemoteSnapshotVersion(e){return k.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return k.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),k.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),k.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new On(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,k.resolve()}updateTargetData(e,t){return this.Kn(t),k.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,k.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),k.waitFor(i).next(()=>s)}getTargetCount(e){return k.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return k.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),k.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),k.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),k.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return k.resolve(r)}containsKey(e,t){return k.resolve(this.Br.containsKey(t))}}/**
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
 */class EE{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Ba(0),this.Kr=!1,this.Kr=!0,this.$r=new gE,this.referenceDelegate=e(this),this.Ur=new IE(this),this.indexManager=new lE,this.remoteDocumentCache=function(s){return new _E(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new aE(t),this.Gr=new pE(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new mE,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new yE(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){x("MemoryPersistence","Starting transaction:",e);const s=new wE(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return k.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class wE extends lI{constructor(e){super(),this.currentSequenceNumber=e}}class Ja{constructor(e){this.persistence=e,this.Jr=new Ya,this.Yr=null}static Zr(e){return new Ja(e)}get Xr(){if(this.Yr)return this.Yr;throw $()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),k.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),k.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),k.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return k.forEach(this.Xr,r=>{const s=M.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,U.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return k.or([()=>k.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
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
 */class Xa{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=G(),s=G();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Xa(e,t.fromCache,r,s)}}/**
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
 */class TE{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class AE{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Vg()?8:uI(ke())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new TE;return this.Xi(e,t,a).next(c=>{if(i.result=c,this.zi)return this.es(e,t,a,c.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(or()<=H.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",yn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),k.resolve()):(or()<=H.DEBUG&&x("QueryEngine","Query:",yn(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(or()<=H.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",yn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ke(t))):k.resolve())}Yi(e,t){if(Mu(t))return k.resolve(null);let r=Ke(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=Zs(t,null,"F"),r=Ke(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=G(...i);return this.Ji.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{const d=this.ts(t,c);return this.ns(t,d,a,u.readTime)?this.Yi(e,Zs(t,null,"F")):this.rs(e,d,t,u)}))})))}Zi(e,t,r,s){return Mu(t)||s.isEqual(U.min())?k.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(t,i);return this.ns(t,a,r,s)?k.resolve(null):(or()<=H.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),yn(t)),this.rs(e,a,t,iI(s,-1)).next(c=>c))})}ts(e,t){let r=new Ie(bf(e));return t.forEach((s,i)=>{Ii(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return or()<=H.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",yn(t)),this.Ji.getDocumentsMatchingQuery(e,t,Dt.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
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
 */class bE{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new ae(K),this._s=new zn(i=>qa(i),za),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new fE(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function SE(n,e,t,r){return new bE(n,e,t,r)}async function zf(n,e){const t=q(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],c=[];let u=G();for(const d of s){a.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}for(const d of i){c.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:c}))})})}function Gf(n){const e=q(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function CE(n,e){const t=q(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const c=[];e.targetChanges.forEach((f,m)=>{const g=s.get(m);if(!g)return;c.push(t.Ur.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.Ur.addMatchingKeys(i,f.addedDocuments,m)));let E=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?E=E.withResumeToken(Ee.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):f.resumeToken.approximateByteSize()>0&&(E=E.withResumeToken(f.resumeToken,r)),s=s.insert(m,E),function(R,P,N){return R.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-R.snapshotVersion.toMicroseconds()>=3e8?!0:N.addedDocuments.size+N.modifiedDocuments.size+N.removedDocuments.size>0}(g,E,f)&&c.push(t.Ur.updateTargetData(i,E))});let u=Vt(),d=G();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),c.push(RE(i,a,e.documentUpdates).next(f=>{u=f.Ps,d=f.Is})),!r.isEqual(U.min())){const f=t.Ur.getLastRemoteSnapshotVersion(i).next(m=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(f)}return k.waitFor(c).next(()=>a.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,u,d)).next(()=>u)}).then(i=>(t.os=s,i))}function RE(n,e,t){let r=G(),s=G();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let a=Vt();return t.forEach((c,u)=>{const d=i.get(c);u.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(U.min())?(e.removeEntry(c,u.readTime),a=a.insert(c,u)):!d.isValidDocument()||u.version.compareTo(d.version)>0||u.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(u),a=a.insert(c,u)):x("LocalStore","Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",u.version)}),{Ps:a,Is:s}})}function PE(n,e){const t=q(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,k.resolve(s)):t.Ur.allocateTargetId(r).next(a=>(s=new Et(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function aa(n,e,t){const r=q(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!zr(a))throw a;x("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Wu(n,e,t){const r=q(n);let s=U.min(),i=G();return r.persistence.runTransaction("Execute query","readwrite",a=>function(u,d,f){const m=q(u),g=m._s.get(f);return g!==void 0?k.resolve(m.os.get(g)):m.Ur.getTargetData(d,f)}(r,a,Ke(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,c.targetId).next(u=>{i=u})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?s:U.min(),t?i:G())).next(c=>(kE(r,RI(e),c),{documents:c,Ts:i})))}function kE(n,e,t){let r=n.us.get(e)||U.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}class Ku{constructor(){this.activeTargetIds=LI()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class DE{constructor(){this.so=new Ku,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Ku,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class NE{_o(e){}shutdown(){}}/**
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
 */class Qu{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){x("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){x("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let As=null;function vo(){return As===null?As=function(){return 268435456+Math.round(2147483648*Math.random())}():As++,"0x"+As.toString(16)}/**
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
 */const VE={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
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
 */class LE{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
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
 */const be="WebChannelConnection";class xE extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,a){const c=vo(),u=this.xo(t,r.toUriEncodedString());x("RestConnection",`Sending RPC '${t}' ${c}:`,u,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,i,a),this.No(t,u,d,s).then(f=>(x("RestConnection",`Received RPC '${t}' ${c}: `,f),f),f=>{throw Vn("RestConnection",`RPC '${t}' ${c} failed with error: `,f,"url: ",u,"request:",s),f})}Lo(t,r,s,i,a,c){return this.Mo(t,r,s,i,a)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+jn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>t[a]=i),s&&s.headers.forEach((i,a)=>t[a]=i)}xo(t,r){const s=VE[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=vo();return new Promise((a,c)=>{const u=new cf;u.setWithCredentials(!0),u.listenOnce(lf.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Vs.NO_ERROR:const f=u.getResponseJson();x(be,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(f)),a(f);break;case Vs.TIMEOUT:x(be,`RPC '${e}' ${i} timed out`),c(new L(D.DEADLINE_EXCEEDED,"Request time out"));break;case Vs.HTTP_ERROR:const m=u.getStatus();if(x(be,`RPC '${e}' ${i} failed with status:`,m,"response text:",u.getResponseText()),m>0){let g=u.getResponseJson();Array.isArray(g)&&(g=g[0]);const E=g==null?void 0:g.error;if(E&&E.status&&E.message){const C=function(P){const N=P.toLowerCase().replace(/_/g,"-");return Object.values(D).indexOf(N)>=0?N:D.UNKNOWN}(E.status);c(new L(C,E.message))}else c(new L(D.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new L(D.UNAVAILABLE,"Connection failed."));break;default:$()}}finally{x(be,`RPC '${e}' ${i} completed.`)}});const d=JSON.stringify(s);x(be,`RPC '${e}' ${i} sending request:`,s),u.send(t,"POST",d,r,15)})}Bo(e,t,r){const s=vo(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=df(),c=hf(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(u.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const f=i.join("");x(be,`Creating RPC '${e}' stream ${s}: ${f}`,u);const m=a.createWebChannel(f,u);let g=!1,E=!1;const C=new LE({Io:P=>{E?x(be,`Not sending because RPC '${e}' stream ${s} is closed:`,P):(g||(x(be,`Opening RPC '${e}' stream ${s} transport.`),m.open(),g=!0),x(be,`RPC '${e}' stream ${s} sending:`,P),m.send(P))},To:()=>m.close()}),R=(P,N,O)=>{P.listen(N,B=>{try{O(B)}catch(z){setTimeout(()=>{throw z},0)}})};return R(m,lr.EventType.OPEN,()=>{E||(x(be,`RPC '${e}' stream ${s} transport opened.`),C.yo())}),R(m,lr.EventType.CLOSE,()=>{E||(E=!0,x(be,`RPC '${e}' stream ${s} transport closed`),C.So())}),R(m,lr.EventType.ERROR,P=>{E||(E=!0,Vn(be,`RPC '${e}' stream ${s} transport errored:`,P),C.So(new L(D.UNAVAILABLE,"The operation could not be completed")))}),R(m,lr.EventType.MESSAGE,P=>{var N;if(!E){const O=P.data[0];re(!!O);const B=O,z=B.error||((N=B[0])===null||N===void 0?void 0:N.error);if(z){x(be,`RPC '${e}' stream ${s} received error:`,z);const he=z.status;let J=function(I){const v=le[I];if(v!==void 0)return Lf(v)}(he),T=z.message;J===void 0&&(J=D.INTERNAL,T="Unknown error status: "+he+" with message "+z.message),E=!0,C.So(new L(J,T)),m.close()}else x(be,`RPC '${e}' stream ${s} received:`,O),C.bo(O)}}),R(c,uf.STAT_EVENT,P=>{P.stat===Yo.PROXY?x(be,`RPC '${e}' stream ${s} detected buffering proxy`):P.stat===Yo.NOPROXY&&x(be,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{C.wo()},0),C}}function Io(){return typeof document<"u"?document:null}/**
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
 */function Ai(n){return new JI(n,!0)}/**
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
 */class Wf{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&x("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class ME{constructor(e,t,r,s,i,a,c,u){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Wf(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===D.RESOURCE_EXHAUSTED?(ct(t.toString()),ct("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===D.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new L(D.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return x("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(x("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class OE extends ME{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=ZI(this.serializer,e),r=function(i){if(!("targetChange"in i))return U.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?U.min():a.readTime?Sn(a.readTime):U.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=Gu(this.serializer),t.addTarget=function(i,a){let c;const u=a.target;if(c=ea(u)?{documents:eE(i,u)}:{query:tE(i,u)._t},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Of(i,a.resumeToken);const d=sa(i,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo(U.min())>0){c.readTime=ia(i,a.snapshotVersion.toTimestamp());const d=sa(i,a.expectedCount);d!==null&&(c.expectedCount=d)}return c}(this.serializer,e);const r=rE(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=Gu(this.serializer),t.removeTarget=e,this.a_(t)}}/**
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
 */class FE extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new L(D.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,oa(t,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===D.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new L(D.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Lo(e,oa(t,r),s,a,c,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===D.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new L(D.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class UE{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(ct(t),this.D_=!1):x("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class BE{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{Qr(this)&&(x("RemoteStore","Restarting streams for network reachability change."),await async function(u){const d=q(u);d.L_.add(4),await Kr(d),d.q_.set("Unknown"),d.L_.delete(4),await bi(d)}(this))})}),this.q_=new UE(r,s)}}async function bi(n){if(Qr(n))for(const e of n.B_)await e(!0)}async function Kr(n){for(const e of n.B_)await e(!1)}function Kf(n,e){const t=q(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),nc(t)?tc(t):Gn(t).r_()&&ec(t,e))}function Za(n,e){const t=q(n),r=Gn(t);t.N_.delete(e),r.r_()&&Qf(t,e),t.N_.size===0&&(r.r_()?r.o_():Qr(t)&&t.q_.set("Unknown"))}function ec(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(U.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Gn(n).A_(e)}function Qf(n,e){n.Q_.xe(e),Gn(n).R_(e)}function tc(n){n.Q_=new WI({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),Gn(n).start(),n.q_.v_()}function nc(n){return Qr(n)&&!Gn(n).n_()&&n.N_.size>0}function Qr(n){return q(n).L_.size===0}function Yf(n){n.Q_=void 0}async function $E(n){n.q_.set("Online")}async function HE(n){n.N_.forEach((e,t)=>{ec(n,e)})}async function jE(n,e){Yf(n),nc(n)?(n.q_.M_(e),tc(n)):n.q_.set("Unknown")}async function qE(n,e,t){if(n.q_.set("Online"),e instanceof Mf&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const c of i.targetIds)s.N_.has(c)&&(await s.remoteSyncer.rejectListen(c,a),s.N_.delete(c),s.Q_.removeTarget(c))}(n,e)}catch(r){x("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Yu(n,r)}else if(e instanceof xs?n.Q_.Ke(e):e instanceof xf?n.Q_.He(e):n.Q_.We(e),!t.isEqual(U.min()))try{const r=await Gf(n.localStore);t.compareTo(r)>=0&&await function(i,a){const c=i.Q_.rt(a);return c.targetChanges.forEach((u,d)=>{if(u.resumeToken.approximateByteSize()>0){const f=i.N_.get(d);f&&i.N_.set(d,f.withResumeToken(u.resumeToken,a))}}),c.targetMismatches.forEach((u,d)=>{const f=i.N_.get(u);if(!f)return;i.N_.set(u,f.withResumeToken(Ee.EMPTY_BYTE_STRING,f.snapshotVersion)),Qf(i,u);const m=new Et(f.target,u,d,f.sequenceNumber);ec(i,m)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){x("RemoteStore","Failed to raise snapshot:",r),await Yu(n,r)}}async function Yu(n,e,t){if(!zr(e))throw e;n.L_.add(1),await Kr(n),n.q_.set("Offline"),t||(t=()=>Gf(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{x("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await bi(n)})}async function Ju(n,e){const t=q(n);t.asyncQueue.verifyOperationInProgress(),x("RemoteStore","RemoteStore received new credentials");const r=Qr(t);t.L_.add(3),await Kr(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await bi(t)}async function zE(n,e){const t=q(n);e?(t.L_.delete(2),await bi(t)):e||(t.L_.add(2),await Kr(t),t.q_.set("Unknown"))}function Gn(n){return n.K_||(n.K_=function(t,r,s){const i=q(t);return i.w_(),new OE(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:$E.bind(null,n),Ro:HE.bind(null,n),mo:jE.bind(null,n),d_:qE.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),nc(n)?tc(n):n.q_.set("Unknown")):(await n.K_.stop(),Yf(n))})),n.K_}/**
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
 */class rc{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new St,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new rc(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new L(D.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Jf(n,e){if(ct("AsyncQueue",`${e}: ${n}`),zr(n))return new L(D.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class Cn{constructor(e){this.comparator=e?(t,r)=>e(t,r)||M.comparator(t.key,r.key):(t,r)=>M.comparator(t.key,r.key),this.keyedMap=ur(),this.sortedSet=new ae(this.comparator)}static emptySet(e){return new Cn(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Cn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Cn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Xu{constructor(){this.W_=new ae(M.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):$():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Fn{constructor(e,t,r,s,i,a,c,u,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new Fn(e,t,Cn.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&vi(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class GE{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class WE{constructor(){this.queries=Zu(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=q(t),i=s.queries;s.queries=Zu(),i.forEach((a,c)=>{for(const u of c.j_)u.onError(r)})})(this,new L(D.ABORTED,"Firestore shutting down"))}}function Zu(){return new zn(n=>Af(n),vi)}async function sc(n,e){const t=q(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new GE,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=Jf(a,`Initialization of query '${yn(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&oc(t)}async function ic(n,e){const t=q(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function KE(n,e){const t=q(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.j_)c.X_(s)&&(r=!0);a.z_=s}}r&&oc(t)}function QE(n,e,t){const r=q(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function oc(n){n.Y_.forEach(e=>{e.next()})}var ca,eh;(eh=ca||(ca={})).ea="default",eh.Cache="cache";class ac{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Fn(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Fn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==ca.Cache}}/**
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
 */class Xf{constructor(e){this.key=e}}class Zf{constructor(e){this.key=e}}class YE{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=G(),this.mutatedKeys=G(),this.Aa=bf(e),this.Ra=new Cn(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Xu,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const g=s.get(f),E=Ii(this.query,m)?m:null,C=!!g&&this.mutatedKeys.has(g.key),R=!!E&&(E.hasLocalMutations||this.mutatedKeys.has(E.key)&&E.hasCommittedMutations);let P=!1;g&&E?g.data.isEqual(E.data)?C!==R&&(r.track({type:3,doc:E}),P=!0):this.ga(g,E)||(r.track({type:2,doc:E}),P=!0,(u&&this.Aa(E,u)>0||d&&this.Aa(E,d)<0)&&(c=!0)):!g&&E?(r.track({type:0,doc:E}),P=!0):g&&!E&&(r.track({type:1,doc:g}),P=!0,(u||d)&&(c=!0)),P&&(E?(a=a.add(E),i=R?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:c,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,m)=>function(E,C){const R=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return $()}};return R(E)-R(C)}(f.type,m.type)||this.Aa(f.doc,m.doc)),this.pa(r),s=s!=null&&s;const c=t&&!s?this.ya():[],u=this.da.size===0&&this.current&&!s?1:0,d=u!==this.Ea;return this.Ea=u,a.length!==0||d?{snapshot:new Fn(this.query,e.Ra,i,a,e.mutatedKeys,u===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:c}:{wa:c}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Xu,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=G(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new Zf(r))}),this.da.forEach(r=>{e.has(r)||t.push(new Xf(r))}),t}ba(e){this.Ta=e.Ts,this.da=G();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Fn.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class JE{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class XE{constructor(e){this.key=e,this.va=!1}}class ZE{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new zn(c=>Af(c),vi),this.Ma=new Map,this.xa=new Set,this.Oa=new ae(M.comparator),this.Na=new Map,this.La=new Ya,this.Ba={},this.ka=new Map,this.qa=On.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function ew(n,e,t=!0){const r=sp(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await ep(r,e,t,!0),s}async function tw(n,e){const t=sp(n);await ep(t,e,!0,!1)}async function ep(n,e,t,r){const s=await PE(n.localStore,Ke(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await nw(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&Kf(n.remoteStore,s),c}async function nw(n,e,t,r,s){n.Ka=(m,g,E)=>async function(R,P,N,O){let B=P.view.ma(N);B.ns&&(B=await Wu(R.localStore,P.query,!1).then(({documents:T})=>P.view.ma(T,B)));const z=O&&O.targetChanges.get(P.targetId),he=O&&O.targetMismatches.get(P.targetId)!=null,J=P.view.applyChanges(B,R.isPrimaryClient,z,he);return nh(R,P.targetId,J.wa),J.snapshot}(n,m,g,E);const i=await Wu(n.localStore,e,!0),a=new YE(e,i.Ts),c=a.ma(i.documents),u=Wr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(c,n.isPrimaryClient,u);nh(n,t,d.wa);const f=new JE(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function rw(n,e,t){const r=q(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!vi(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await aa(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&Za(r.remoteStore,s.targetId),la(r,s.targetId)}).catch(Ua)):(la(r,s.targetId),await aa(r.localStore,s.targetId,!0))}async function sw(n,e){const t=q(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Za(t.remoteStore,r.targetId))}async function tp(n,e){const t=q(n);try{const r=await CE(t.localStore,e);e.targetChanges.forEach((s,i)=>{const a=t.Na.get(i);a&&(re(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?re(a.va):s.removedDocuments.size>0&&(re(a.va),a.va=!1))}),await rp(t,r,e)}catch(r){await Ua(r)}}function th(n,e,t){const r=q(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,a)=>{const c=a.view.Z_(e);c.snapshot&&s.push(c.snapshot)}),function(a,c){const u=q(a);u.onlineState=c;let d=!1;u.queries.forEach((f,m)=>{for(const g of m.j_)g.Z_(c)&&(d=!0)}),d&&oc(u)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function iw(n,e,t){const r=q(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new ae(M.comparator);a=a.insert(i,Ce.newNoDocument(i,U.min()));const c=G().add(i),u=new Ti(U.min(),new Map,new ae(K),a,c);await tp(r,u),r.Oa=r.Oa.remove(i),r.Na.delete(e),cc(r)}else await aa(r.localStore,e,!1).then(()=>la(r,e,t)).catch(Ua)}function la(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||np(n,r)})}function np(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(Za(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),cc(n))}function nh(n,e,t){for(const r of t)r instanceof Xf?(n.La.addReference(r.key,e),ow(n,r)):r instanceof Zf?(x("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||np(n,r.key)):$()}function ow(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(x("SyncEngine","New document in limbo: "+t),n.xa.add(r),cc(n))}function cc(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new M(ee.fromString(e)),r=n.qa.next();n.Na.set(r,new XE(t)),n.Oa=n.Oa.insert(t,r),Kf(n.remoteStore,new Et(Ke(_i(t.path)),r,"TargetPurposeLimboResolution",Ba.oe))}}async function rp(n,e,t){const r=q(n),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((c,u)=>{a.push(r.Ka(u,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const m=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(d){s.push(d);const m=Xa.Wi(u.targetId,d);i.push(m)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(u,d){const f=q(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>k.forEach(d,g=>k.forEach(g.$i,E=>f.persistence.referenceDelegate.addReference(m,g.targetId,E)).next(()=>k.forEach(g.Ui,E=>f.persistence.referenceDelegate.removeReference(m,g.targetId,E)))))}catch(m){if(!zr(m))throw m;x("LocalStore","Failed to update sequence numbers: "+m)}for(const m of d){const g=m.targetId;if(!m.fromCache){const E=f.os.get(g),C=E.snapshotVersion,R=E.withLastLimboFreeSnapshotVersion(C);f.os=f.os.insert(g,R)}}}(r.localStore,i))}async function aw(n,e){const t=q(n);if(!t.currentUser.isEqual(e)){x("SyncEngine","User change. New user:",e.toKey());const r=await zf(t.localStore,e);t.currentUser=e,function(i,a){i.ka.forEach(c=>{c.forEach(u=>{u.reject(new L(D.CANCELLED,a))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await rp(t,r.hs)}}function cw(n,e){const t=q(n),r=t.Na.get(e);if(r&&r.va)return G().add(r.key);{let s=G();const i=t.Ma.get(e);if(!i)return s;for(const a of i){const c=t.Fa.get(a);s=s.unionWith(c.view.Va)}return s}}function sp(n){const e=q(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=tp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=cw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=iw.bind(null,e),e.Ca.d_=KE.bind(null,e.eventManager),e.Ca.$a=QE.bind(null,e.eventManager),e}class ni{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ai(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return SE(this.persistence,new AE,e.initialUser,this.serializer)}Ga(e){return new EE(Ja.Zr,this.serializer)}Wa(e){return new DE}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ni.provider={build:()=>new ni};class ua{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>th(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=aw.bind(null,this.syncEngine),await zE(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new WE}()}createDatastore(e){const t=Ai(e.databaseInfo.databaseId),r=function(i){return new xE(i)}(e.databaseInfo);return function(i,a,c,u){return new FE(i,a,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,a,c){return new BE(r,s,i,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>th(this.syncEngine,t,0),function(){return Qu.D()?new Qu:new NE}())}createSyncEngine(e,t){return function(s,i,a,c,u,d,f){const m=new ZE(s,i,a,c,u,d);return f&&(m.Qa=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=q(s);x("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Kr(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}ua.provider={build:()=>new ua};/**
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
 */class lc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):ct("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */class lw{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Se.UNAUTHENTICATED,this.clientId=pf.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{x("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(x("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new St;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Jf(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Eo(n,e){n.asyncQueue.verifyOperationInProgress(),x("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await zf(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function rh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await uw(n);x("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Ju(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Ju(e.remoteStore,s)),n._onlineComponents=e}async function uw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){x("FirestoreClient","Using user provided OfflineComponentProvider");try{await Eo(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===D.FAILED_PRECONDITION||s.code===D.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Vn("Error using user provided cache. Falling back to memory cache: "+t),await Eo(n,new ni)}}else x("FirestoreClient","Using default OfflineComponentProvider"),await Eo(n,new ni);return n._offlineComponents}async function hw(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(x("FirestoreClient","Using user provided OnlineComponentProvider"),await rh(n,n._uninitializedComponentsProvider._online)):(x("FirestoreClient","Using default OnlineComponentProvider"),await rh(n,new ua))),n._onlineComponents}async function ri(n){const e=await hw(n),t=e.eventManager;return t.onListen=ew.bind(null,e.syncEngine),t.onUnlisten=rw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=tw.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=sw.bind(null,e.syncEngine),t}function dw(n,e,t={}){const r=new St;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,c,u,d){const f=new lc({next:g=>{f.Za(),a.enqueueAndForget(()=>ic(i,m));const E=g.docs.has(c);!E&&g.fromCache?d.reject(new L(D.UNAVAILABLE,"Failed to get document because the client is offline.")):E&&g.fromCache&&u&&u.source==="server"?d.reject(new L(D.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(g)},error:g=>d.reject(g)}),m=new ac(_i(c.path),f,{includeMetadataChanges:!0,_a:!0});return sc(i,m)}(await ri(n),n.asyncQueue,e,t,r)),r.promise}function fw(n,e,t={}){const r=new St;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,c,u,d){const f=new lc({next:g=>{f.Za(),a.enqueueAndForget(()=>ic(i,m)),g.fromCache&&u.source==="server"?d.reject(new L(D.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(g)},error:g=>d.reject(g)}),m=new ac(c,f,{includeMetadataChanges:!0,_a:!0});return sc(i,m)}(await ri(n),n.asyncQueue,e,t,r)),r.promise}/**
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
 */function ip(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const sh=new Map;/**
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
 */function op(n,e,t){if(!t)throw new L(D.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function pw(n,e,t,r){if(e===!0&&r===!0)throw new L(D.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function ih(n){if(!M.isDocumentKey(n))throw new L(D.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function oh(n){if(M.isDocumentKey(n))throw new L(D.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Si(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":$()}function Ct(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new L(D.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Si(n);throw new L(D.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function mw(n,e){if(e<=0)throw new L(D.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
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
 */class ah{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new L(D.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new L(D.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}pw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ip((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ci{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ah({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new L(D.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new L(D.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ah(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Yv;switch(r.type){case"firstParty":return new eI(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new L(D.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=sh.get(t);r&&(x("ComponentProvider","Removing Datastore"),sh.delete(t),r.terminate())}(this),Promise.resolve()}}function gw(n,e,t,r={}){var s;const i=(n=Ct(n,Ci))._getSettings(),a=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&Vn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let c,u;if(typeof r.mockUserToken=="string")c=r.mockUserToken,u=Se.MOCK_USER;else{c=Sg(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new L(D.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new Se(d)}n._authCredentials=new Jv(new ff(c,u))}}/**
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
 */class ut{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ut(this.firestore,e,this._query)}}class Me{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Rt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Me(this.firestore,e,this._key)}}class Rt extends ut{constructor(e,t,r){super(e,t,_i(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Me(this.firestore,null,new M(e))}withConverter(e){return new Rt(this.firestore,e,this._path)}}function ch(n,e,...t){if(n=Ue(n),op("collection","path",e),n instanceof Ci){const r=ee.fromString(e,...t);return oh(r),new Rt(n,null,r)}{if(!(n instanceof Me||n instanceof Rt))throw new L(D.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return oh(r),new Rt(n.firestore,null,r)}}function lh(n,e,...t){if(n=Ue(n),arguments.length===1&&(e=pf.newId()),op("doc","path",e),n instanceof Ci){const r=ee.fromString(e,...t);return ih(r),new Me(n,null,new M(r))}{if(!(n instanceof Me||n instanceof Rt))throw new L(D.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return ih(r),new Me(n.firestore,n instanceof Rt?n.converter:null,new M(r))}}/**
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
 */class uh{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Wf(this,"async_queue_retry"),this.Vu=()=>{const r=Io();r&&x("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Io();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Io();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new St;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!zr(e))throw e;x("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(r);throw ct("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=rc.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&$()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function hh(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class Vr extends Ci{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new uh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new uh(e),this._firestoreClient=void 0,await e}}}function yw(n,e){const t=typeof n=="object"?n:Ad(),r=typeof n=="string"?n:"(default)",s=Pa(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=Ag("firestore");i&&gw(s,...i)}return s}function uc(n){if(n._terminated)throw new L(D.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||_w(n),n._firestoreClient}function _w(n){var e,t,r;const s=n._freezeSettings(),i=function(c,u,d,f){return new fI(c,u,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,ip(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new lw(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
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
 */class Un{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Un(Ee.fromBase64String(e))}catch(t){throw new L(D.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Un(Ee.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class ap{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new L(D.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Re(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class cp{constructor(e){this._methodName=e}}/**
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
 */class hc{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new L(D.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new L(D.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return K(this._lat,e._lat)||K(this._long,e._long)}}/**
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
 */class dc{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
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
 */const vw=/^__.*__$/;function lp(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw $()}}class fc{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new fc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return ha(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(lp(this.Cu)&&vw.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Iw{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Ai(e)}Qu(e,t,r,s=!1){return new fc({Cu:e,methodName:t,qu:r,path:Re.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ew(n){const e=n._freezeSettings(),t=Ai(n._databaseId);return new Iw(n._databaseId,!!e.ignoreUndefinedProperties,t)}function ww(n,e,t,r=!1){return pc(t,n.Qu(r?4:3,e))}function pc(n,e){if(up(n=Ue(n)))return Aw("Unsupported field value:",e,n),Tw(n,e);if(n instanceof cp)return function(r,s){if(!lp(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const c of r){let u=pc(c,s.Lu(a));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),a++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=Ue(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return xI(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=pe.fromDate(r);return{timestampValue:ia(s.serializer,i)}}if(r instanceof pe){const i=new pe(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ia(s.serializer,i)}}if(r instanceof hc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Un)return{bytesValue:Of(s.serializer,r._byteString)};if(r instanceof Me){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Ff(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof dc)return function(a,c){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(u=>{if(typeof u!="number")throw c.Bu("VectorValues must only contain numeric values.");return Ga(c.serializer,u)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${Si(r)}`)}(n,e)}function Tw(n,e){const t={};return mf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Gr(n,(r,s)=>{const i=pc(s,e.Mu(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function up(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof pe||n instanceof hc||n instanceof Un||n instanceof Me||n instanceof cp||n instanceof dc)}function Aw(n,e,t){if(!up(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=Si(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}const bw=new RegExp("[~\\*/\\[\\]]");function Sw(n,e,t){if(e.search(bw)>=0)throw ha(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ap(...e.split("."))._internalPath}catch{throw ha(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function ha(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${r}`),a&&(u+=` in document ${s}`),u+=")"),new L(D.INVALID_ARGUMENT,c+n+u)}/**
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
 */class hp{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Me(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Cw(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Ri("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Cw extends hp{data(){return super.data()}}function Ri(n,e){return typeof e=="string"?Sw(n,e):e instanceof ap?e._internalPath:e._delegate._internalPath}/**
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
 */function dp(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new L(D.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class mc{}class gc extends mc{}function dh(n,e,...t){let r=[];e instanceof mc&&r.push(e),r=r.concat(t),function(i){const a=i.filter(u=>u instanceof yc).length,c=i.filter(u=>u instanceof Pi).length;if(a>1||a>0&&c>0)throw new L(D.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class Pi extends gc{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Pi(e,t,r)}_apply(e){const t=this._parse(e);return fp(e._query,t),new ut(e.firestore,e.converter,ta(e._query,t))}_parse(e){const t=Ew(e.firestore);return function(i,a,c,u,d,f,m){let g;if(d.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new L(D.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){gh(m,f);const E=[];for(const C of m)E.push(mh(u,i,C));g={arrayValue:{values:E}}}else g=mh(u,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||gh(m,f),g=ww(c,a,m,f==="in"||f==="not-in");return ue.create(d,f,g)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function fh(n,e,t){const r=e,s=Ri("where",n);return Pi._create(s,r,t)}class yc extends mc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new yc(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:He.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let a=s;const c=i.getFlattenedFilters();for(const u of c)fp(a,u),a=ta(a,u)}(e._query,t),new ut(e.firestore,e.converter,ta(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class _c extends gc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new _c(e,t)}_apply(e){const t=function(s,i,a){if(s.startAt!==null)throw new L(D.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new L(D.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Nr(i,a)}(e._query,this._field,this._direction);return new ut(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new qn(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function ph(n,e="asc"){const t=e,r=Ri("orderBy",n);return _c._create(r,t)}class vc extends gc{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new vc(e,t,r)}_apply(e){return new ut(e.firestore,e.converter,Zs(e._query,this._limit,this._limitType))}}function Rw(n){return mw("limit",n),vc._create("limit",n,"F")}function mh(n,e,t){if(typeof(t=Ue(t))=="string"){if(t==="")throw new L(D.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Tf(e)&&t.indexOf("/")!==-1)throw new L(D.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ee.fromString(t));if(!M.isDocumentKey(r))throw new L(D.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ku(n,new M(r))}if(t instanceof Me)return ku(n,t._key);throw new L(D.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Si(t)}.`)}function gh(n,e){if(!Array.isArray(n)||n.length===0)throw new L(D.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function fp(n,e){const t=function(s,i){for(const a of s)for(const c of a.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new L(D.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new L(D.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class Pw{convertValue(e,t="none"){switch(rn(e)){case 0:return null;case 1:return e.booleanValue;case 2:return oe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(nn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw $()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Gr(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>oe(a.doubleValue));return new dc(i)}convertGeoPoint(e){return new hc(oe(e.latitude),oe(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ha(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Pr(e));default:return null}}convertTimestamp(e){const t=Nt(e);return new pe(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ee.fromString(e);re(qf(r));const s=new kr(r.get(1),r.get(3)),i=new M(r.popFirst(5));return s.isEqual(t)||ct(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */class dr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class pp extends hp{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Ms(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Ri("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class Ms extends pp{data(e={}){return super.data(e)}}class mp{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new dr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Ms(this._firestore,this._userDataWriter,r.key,r,new dr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new L(D.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(c=>{const u=new Ms(s._firestore,s._userDataWriter,c.doc.key,c.doc,new dr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const u=new Ms(s._firestore,s._userDataWriter,c.doc.key,c.doc,new dr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:kw(c.type),doc:u,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function kw(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return $()}}/**
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
 */function Dw(n){n=Ct(n,Me);const e=Ct(n.firestore,Vr);return dw(uc(e),n._key).then(t=>gp(e,n,t))}class Ic extends Pw{constructor(e){super(),this.firestore=e}convertBytes(e){return new Un(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Me(this.firestore,null,t)}}function yh(n){n=Ct(n,ut);const e=Ct(n.firestore,Vr),t=uc(e),r=new Ic(e);return dp(n._query),fw(t,n._query).then(s=>new mp(e,r,n,s))}function Nw(n,...e){var t,r,s;n=Ue(n);let i={includeMetadataChanges:!1,source:"default"},a=0;typeof e[a]!="object"||hh(e[a])||(i=e[a],a++);const c={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(hh(e[a])){const m=e[a];e[a]=(t=m.next)===null||t===void 0?void 0:t.bind(m),e[a+1]=(r=m.error)===null||r===void 0?void 0:r.bind(m),e[a+2]=(s=m.complete)===null||s===void 0?void 0:s.bind(m)}let u,d,f;if(n instanceof Me)d=Ct(n.firestore,Vr),f=_i(n._key.path),u={next:m=>{e[a]&&e[a](gp(d,n,m))},error:e[a+1],complete:e[a+2]};else{const m=Ct(n,ut);d=Ct(m.firestore,Vr),f=m._query;const g=new Ic(d);u={next:E=>{e[a]&&e[a](new mp(d,g,m,E))},error:e[a+1],complete:e[a+2]},dp(n._query)}return function(g,E,C,R){const P=new lc(R),N=new ac(E,P,C);return g.asyncQueue.enqueueAndForget(async()=>sc(await ri(g),N)),()=>{P.Za(),g.asyncQueue.enqueueAndForget(async()=>ic(await ri(g),N))}}(uc(d),f,c,u)}function gp(n,e,t){const r=t.docs.get(e._key),s=new Ic(n);return new pp(n,s,e._key,r,new dr(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){(function(s){jn=s})($n),Nn(new Zt("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new Vr(new Xv(r.getProvider("auth-internal")),new nI(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new L(D.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new kr(d.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:t},i),c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),At(bu,"4.7.3",e),At(bu,"4.7.3","esm2017")})();const yp="fenix_cloud_sync_config",da={apiKey:"AIzaSyAvz0DRZIJLNHQsHmPg7LaUq9s3N2eEQtg",authDomain:"fenix-2c341.firebaseapp.com",projectId:"fenix-2c341",appId:"1:387287127608:web:c4e5aa07b3b91389c5b8cd",messagingSenderId:"387287127608",storageBucket:"fenix-2c341.firebasestorage.app"},wo={enabled:!0,syncConsent:"granted",firebase:{...da}},Vw=20*60*1e3,fr="s11-vorax",_h=`pricesSnapshots/${fr}`,_p="fenix_price_last_sync_at";function bs(n){return typeof n=="number"&&Number.isFinite(n)?n:n instanceof pe?n.toMillis():null}function Lw(){try{const n=localStorage.getItem(_p),e=n?Number(n):0;return Number.isFinite(e)?e:0}catch{return 0}}function vh(n){try{localStorage.setItem(_p,String(n))}catch(e){console.error("Failed to persist price sync timestamp:",e)}}function To(){try{const n=localStorage.getItem(yp);if(n){const e=JSON.parse(n),t={...wo,...e,firebase:{...wo.firebase,...e.firebase||{}}};return vp(xw(t))}}catch(n){console.error("Failed to read cloud sync config:",n)}return{...wo}}function xw(n){const e={...n.firebase};let t=!1;return Object.keys(da).forEach(r=>{const s=e[r];(!s||String(s).trim()==="")&&(e[r]=da[r],t=!0)}),t?{...n,firebase:e}:n}function vp(n){let e=n.syncConsent,t=n.enabled;return e||(e="pending"),e==="pending"?t=!1:e==="granted"?t=!0:e==="denied"&&(t=!1),n.syncConsent===e&&n.enabled===t?n:{...n,syncConsent:e,enabled:t}}function Ih(n){try{localStorage.setItem(yp,JSON.stringify(n))}catch(e){console.error("Failed to save cloud sync config:",e)}}function Mw(n){const e=n.firebase;return!!e.apiKey&&!!e.authDomain&&!!e.projectId&&!!e.appId}class Ow{constructor(){this.config=null,this.app=null,this.auth=null,this.db=null,this.lastSyncAt=0,this.lastSyncCache={},this.initializing=null,this.lastSyncCursorMs=null,this.snapshotUnsub=null,this.lastCacheUpdatedAt=null,this.lastCacheError=null,this.onPriceUpdateCallback=null}getSyncStatus(){this.config||(this.config=To());const e=vp(this.config);e!==this.config&&(this.config=e,Ih(this.config));const t=this.config.enabled===!0,r=this.config.syncConsent??"pending";return{enabled:t,consent:r}}async setSyncEnabled(e){this.config||(this.config=To());const t=e?"granted":"denied";this.config.enabled=e,this.config.syncConsent=t,Ih(this.config),e&&await this.initialize()}async initialize(){if(this.initializing)return this.initializing;this.initializing=this.initializeInternal();const e=await this.initializing;return this.initializing=null,e}async initializeInternal(){if(this.config=To(),typeof this.config.lastSyncCursorMs=="number"&&(this.lastSyncCursorMs=this.config.lastSyncCursorMs),!this.config.enabled)return!1;if(!Mw(this.config))return console.warn("[sync] Firebase config missing. Sync disabled."),!1;if(this.app||(this.app=Td(this.config.firebase)),this.auth||(this.auth=Kv(this.app)),this.db||(this.db=yw(this.app)),!this.auth.currentUser)try{await N_(this.auth)}catch(e){return console.error("Failed to sign in anonymously:",e),!1}return this.subscribeToSnapshot(),!0}async syncPrices(e){if(!await this.initialize()||!this.db)return{};const r=Date.now();if(this.lastSyncAt||(this.lastSyncAt=Lw()),Object.keys(this.lastSyncCache).length===0&&(this.lastSyncCache=await dd(),Object.keys(this.lastSyncCache).length>0)){const s=Object.values(this.lastSyncCache).map(i=>i.timestamp).filter(i=>typeof i=="number"&&Number.isFinite(i)).reduce((i,a)=>Math.max(i,a),0);this.lastCacheUpdatedAt=s||this.lastCacheUpdatedAt}if(!(e!=null&&e.forceFull)&&this.lastSyncAt&&r-this.lastSyncAt<Vw)return this.lastSyncCache;try{const s=lh(this.db,_h),i=await Dw(s);if(!i.exists())return this.lastCacheError="Price snapshot not available",this.lastSyncCache;const a=i.data(),c=a==null?void 0:a.data,u=bs(a==null?void 0:a.lastUpdated)??null,d={};if(c&&typeof c=="object")for(const[m,g]of Object.entries(c)){const E=typeof(g==null?void 0:g.price)=="number"?g.price:null,C=bs(g==null?void 0:g.timestamp);if(E===null||C===null)continue;const R=typeof(g==null?void 0:g.listingCount)=="number"?g.listingCount:void 0;d[m]={price:E,timestamp:C,...R!==void 0?{listingCount:R}:{}}}const f=await Kl(d);return this.lastSyncAt=r,vh(r),this.lastSyncCache=f,this.lastCacheUpdatedAt=u,this.lastCacheError=null,f}catch(s){return console.error("Failed to sync prices from snapshot:",s),this.lastCacheError="Failed to read prices",this.lastSyncCache}}subscribeToSnapshot(){if(!this.db||this.snapshotUnsub)return;const e=lh(this.db,_h);this.snapshotUnsub=Nw(e,async t=>{if(!t.exists())return;const r=t.data(),s=r==null?void 0:r.data,i=bs(r==null?void 0:r.lastUpdated)??null,a={};if(s&&typeof s=="object")for(const[u,d]of Object.entries(s)){const f=typeof(d==null?void 0:d.price)=="number"?d.price:null,m=bs(d==null?void 0:d.timestamp);if(f===null||m===null)continue;const g=typeof(d==null?void 0:d.listingCount)=="number"?d.listingCount:void 0;a[u]={price:f,timestamp:m,...g!==void 0?{listingCount:g}:{}}}const c=await Kl(a);this.lastSyncCache=c,this.lastSyncAt=Date.now(),vh(this.lastSyncAt),this.lastCacheUpdatedAt=i,this.lastCacheError=null,this.onPriceUpdateCallback&&this.onPriceUpdateCallback(c)},t=>{console.error("Failed to subscribe to price snapshot:",t),this.lastCacheError="Failed to subscribe to price snapshot"})}async getPriceHistory(e){if(!await this.initialize()||!this.db)return[];const r=e.baseId.trim();if(!/^\d+$/.test(r))return[];const s=(e.leagueId||fr).trim()||fr,i=Number.isFinite(e.maxDays)?Math.max(1,Math.min(180,Math.floor(e.maxDays))):120,a=Date.now()-i*24*60*60*1e3,c=Number.isFinite(e.maxSnapshotDocs)?Math.max(100,Math.min(2e4,Math.floor(e.maxSnapshotDocs))):null;try{const u=ch(this.db,"priceChecks",s,"items",r,"events"),d=c!==null?dh(u,fh("timestamp",">=",a),ph("timestamp","asc"),Rw(c)):dh(u,fh("timestamp",">=",a),ph("timestamp","asc"));return(await yh(d)).docs.map(g=>{const E=g.data(),C=typeof E.price=="number"?E.price:null,R=typeof E.timestamp=="number"?E.timestamp:null;if(C===null||R===null)return null;const P=typeof E.listingCount=="number"?E.listingCount:void 0;return{date:new Date(R).toISOString().slice(0,10),timestamp:R,price:C,...P!==void 0?{listingCount:P}:{}}}).filter(g=>g!==null)}catch(u){return console.error("Failed to fetch price history:",u),[]}}async getPriceHistoryBatch(e){if(!await this.initialize()||!this.db)return{};const r=((e==null?void 0:e.leagueId)||fr).trim()||fr;try{const s={},i=ch(this.db,"prices7d",r,"items");return(await yh(i)).docs.forEach(c=>{const u=c.id;if(!/^\d+$/.test(u))return;const d=c.data(),m=(Array.isArray(d.history7d)?d.history7d:[]).map(g=>{if(!g||typeof g!="object")return null;const E=g,C=typeof E.t=="number"?E.t:typeof E.timestamp=="number"?E.timestamp:null,R=typeof E.p=="number"?E.p:typeof E.price=="number"?E.price:null;if(C===null||R===null)return null;const P=typeof E.l=="number"?E.l:typeof E.listingCount=="number"?E.listingCount:void 0;return{date:new Date(C).toISOString().slice(0,10),timestamp:C,price:R,...P!==void 0?{listingCount:P}:{}}}).filter(g=>g!==null).sort((g,E)=>g.timestamp-E.timestamp);m.length>0&&(s[u]=m)}),s}catch(s){return console.error("Failed to fetch batch price history:",s),{}}}getCacheStatus(){return{lastUpdated:this.lastCacheUpdatedAt,lastError:this.lastCacheError}}onPriceUpdate(e){this.onPriceUpdateCallback=e}}let X=null,Rn=null,ie=null,Eh=null,Er=null,si=0,wr=0,fa=!1,pr=!1,Ec=[],Ip=[];const wc="fenix_inventory_cache";function wh(){if(!X)return;const n=X.getInventory();n.length!==0&&localStorage.setItem(wc,JSON.stringify(n))}async function Ep(){Rn=await hd(),ie=new Ow,await ie.setSyncEnabled(!0),ie.onPriceUpdate(async t=>{X&&(X.applyPriceCache(t),await mr(X.getPriceCacheAsObject()),wh(),Os())});const n=await dd(t=>ie?ie.syncPrices(t):Promise.resolve({}));if(X=new ig(Rn,n),ie&&X){const t=await ie.syncPrices({forceFull:!0});Object.keys(t).length>0&&(X.applyPriceCache(t),await mr(X.getPriceCacheAsObject()))}const e=localStorage.getItem(wc);if(e&&X)try{const t=JSON.parse(e);Array.isArray(t)&&(X.hydrateInventory(t),X.applyPriceCache(X.getPriceCacheAsObject()),Os())}catch(t){console.warn("Failed to restore cached inventory:",t)}setInterval(async()=>{if(ie){const t=await ie.syncPrices({forceFull:!0});X&&(X.applyPriceCache(t),await mr(X.getPriceCacheAsObject()),wh(),Os())}},20*60*1e3),Fw()}function Fw(){Eh||(Eh=window.setInterval(()=>{si++,Ec.forEach(n=>n({type:"realtime",seconds:si}))},1e3))}function Uw(){Er||(Er=window.setInterval(()=>{fa&&!pr&&(wr++,Ec.forEach(n=>n({type:"hourly",seconds:wr})))},1e3))}function Bw(){Er&&(clearInterval(Er),Er=null)}function Os(){Ip.forEach(n=>n())}const Y={async getInventory(){return X?X.getInventory().map(e=>e.baseId===Xt?{...e,price:1}:e):[]},async getItemDatabase(){return Rn||(Rn=await hd()),Rn},async getPriceCache(){return X?X.getPriceCacheAsObject():{}},async getPriceHistory(n){if(!ie)return[];const e=(n==null?void 0:n.baseId)??"",t=n==null?void 0:n.leagueId,r=n==null?void 0:n.maxDays,s=n==null?void 0:n.maxSnapshotDocs;return ie.getPriceHistory({baseId:e,leagueId:t,maxDays:r,maxSnapshotDocs:s})},async getPriceHistoryBatch(n){if(!ie)return{};const e=n==null?void 0:n.leagueId,t=n==null?void 0:n.maxDays,r=n==null?void 0:n.maxSnapshotDocs;return ie.getPriceHistoryBatch({leagueId:e,maxDays:t,maxSnapshotDocs:r})},getPriceCacheStatus(){return ie?ie.getCacheStatus():{lastUpdated:null,lastError:"Price sync not initialized"}},onInventoryUpdate(n){Ip.push(n)},startHourlyTimer(){fa=!0,pr=!1,wr=0,Uw()},pauseHourlyTimer(){pr=!0},resumeHourlyTimer(){pr=!1},stopHourlyTimer(){fa=!1,pr=!1,wr=0,Bw()},resetRealtimeTimer(){si=0},async getTimerState(){return{realtimeSeconds:si,hourlySeconds:wr}},onTimerTick(n){Ec.push(n)},async getAppVersion(){return"2.4.0"},async checkForUpdates(){return{success:!1,message:"Updates not available in web version"}},onUpdateStatus(n){},onUpdateProgress(n){},onShowUpdateDialog(n){},onUpdateDownloadedTransition(n){},sendUpdateDialogResponse(n){},async isLogPathConfigured(){return localStorage.getItem("fenix_log_uploaded")==="true"},async selectLogFile(){return null},onShowLogPathSetup(n){},async getSettings(){return fg()},async saveSettings(n){try{return pg(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to save settings"}}},async getUsernameInfo(){return{canChange:!1}},async setUsername(n){return{success:!1,error:"Username not supported in web version"}},async getCloudSyncStatus(){return ie?ie.getSyncStatus():{enabled:!1,consent:"pending"}},async setCloudSyncEnabled(n){if(!ie)return{success:!1,error:"Price sync service not initialized"};try{return await ie.setSyncEnabled(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to update cloud sync setting"}}},onShowSyncConsent(n){},async testKeybind(n){return{success:!1,error:"Keybinds not supported in web version"}},onCloseSettingsModal(n){},onWindowModeChanged(n){},minimizeWindow(){},maximizeWindow(){},closeWindow(){},openExternal(n){try{window.open(n,"_blank","noopener,noreferrer")}catch(e){console.warn("Failed to open external URL:",e)}},onMaximizeStateChanged(n){},async getMaximizeState(){return!1}};async function Th(n){return new Promise((e,t)=>{const r=new FileReader;r.onload=async s=>{var i;try{const a=(i=s.target)==null?void 0:i.result,c=gg(a);if((!X||!Rn)&&await Ep(),X){if(X.buildInventory(c),ie){const u=await ie.syncPrices({forceFull:!0});X.applyPriceCache(u)}await mr(X.getPriceCacheAsObject()),localStorage.setItem(wc,JSON.stringify(X.getInventory())),localStorage.setItem("fenix_log_uploaded","true"),Os(),e()}else t(new Error("Inventory manager not initialized"))}catch(a){t(a)}},r.onerror=()=>{t(new Error("Failed to read file"))},r.readAsText(n)})}let wp=[],Tp={},Ap="priceTotal",bp="desc",Sp="",Cp=null,Rp=null,Pp=null,Fs=new Set;function ht(){return wp}function ki(){return Tp}function Tc(){return Ap}function Ac(){return bp}function $w(){return Sp}function kp(){return Cp}function Dp(){return Rp}function Np(){return Pp}function Lr(n){return!Fs.has(n)}function Hw(n){wp=n}function jw(n){Tp=n}function qw(n){Ap=n}function Ah(n){bp=n}function zw(n){Sp=n}function bh(n){Cp=n}function Gw(n){Rp=n}function Ww(n){Pp=n}function Kw(n){Fs.has(n)?Fs.delete(n):Fs.add(n)}let Vp="realtime",Lp=[],xp=[],Mp=new Map,Op=0,Fp=!1,Up=!1,Bp=new Set,$p=new Map,Hp=new Map,jp=new Map,qp=[],zp=0,Gp=0,Wp=0,Kp=!1;function Be(){return Vp}function Sh(n){Vp=n}function Qp(){return Lp}function Yp(n){Lp=n}function Yr(){return xp}function xr(n){xp=n}function Jr(){return Mp}function Qw(n){Mp=n}function bc(){return Op}function Jp(n){Op=n}function Lt(){return Fp}function Xp(n){Fp=n}function Zp(){return Up}function Di(n){Up=n}function Mt(){return Bp}function Yw(n){Bp=n}function Ni(){return $p}function Jw(n){$p=n}function Sc(){return Hp}function Xw(n){Hp=n}function Cc(){return jp}function Zw(n){jp=n}function Rc(){return qp}function Vi(n){qp=n}function em(){return zp}function Pc(n){zp=n}function eT(){return Gp}function tm(n){Gp=n}function nm(){return Wp}function kc(n){Wp=n}function tT(){return Kp}function nT(n){Kp=n}let rm=!0;function rT(){return rm}function pa(n){rm=n}function Bn(n){const e=Math.floor(n/3600).toString().padStart(2,"0"),t=Math.floor(n%3600/60).toString().padStart(2,"0"),r=(n%60).toString().padStart(2,"0");return`${e}:${t}:${r}`}function sT(n){return n==="none"?"Uncategorized":n.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(" ")}function iT(n){if(n===null)return"";const e=Date.now()-n;return e>=ng?"price-very-stale":e>=tg?"price-stale":""}function sn(n,e=null){return!rT()||e===Xt?n:n*(1-rg)}function Dc(n){const e=Dp(),t=Np();if(n.price===null)return!(e!==null&&e>0);const r=n.price*n.totalQuantity,s=sn(r,n.baseId);return!(e!==null&&s<e||t!==null&&s>t)}function Nc(){return ht().reduce((e,t)=>{if(!Lr(t.baseId)||!Dc(t))return e;if(t.price!==null){const r=t.totalQuantity*t.price;return e+sn(r,t.baseId)}return e},0)}function Li(){const n=ht(),e=Jr(),t=Mt(),r=Dp(),s=Np();let i=0;for(const a of n){if(a.price===null||!Lr(a.baseId)||t.has(a.baseId))continue;const c=a.totalQuantity,u=e.get(a.baseId)||0,d=c-u;if(a.baseId===Xt){const f=d*a.price;i+=f}else{if(d<=0)continue;const f=d*a.price,m=sn(f,a.baseId);if(r!==null&&m<r||s!==null&&m>s)continue;i+=m}}for(const a of t){if(!Lr(a))continue;const c=n.find(g=>g.baseId===a);if(!c||c.price===null)continue;const u=c.totalQuantity,f=(e.get(a)||0)-u;if(f===0)continue;const m=Math.abs(f)*c.price;f>0?i-=m:i+=m}return i}let sm,im,Vc,xi;function oT(n,e,t,r){sm=n,im=e,Vc=t,xi=r}function aT(){const n=Nc();tm(n),xi(n)}function cT(){kc(0);const n=Nc();tm(n),Yp([]),Y.resetRealtimeTimer(),Vc.textContent=Bn(0),Tr(),xi(n)}function Tr(){const n=Nc(),e=nm()/3600,t=eT(),r=e>0?(n-t)/e:0;xi(n),Be()==="realtime"&&(sm.textContent=n.toFixed(2),im.textContent=r.toFixed(2))}async function Ch(){const n=await Y.getTimerState();kc(n.realtimeSeconds),Vc.textContent=Bn(n.realtimeSeconds)}let om,am,Lc,xc,Mc,Xr,Zr,cm,Oc,Fc;function lT(n,e,t,r,s,i,a,c,u,d){om=n,am=e,Lc=t,xc=r,Mc=s,Xr=i,Zr=a,cm=c,Oc=u,Fc=d}function uT(){const n=Mt(),e=ki();n.clear();for(const[t,r]of Object.entries(e)){const s=r.group??"";(s==="compass"||s==="beacon"||s==="probe"||s==="scalpel"||(t==="5028"||t==="5040"))&&n.add(t)}}function hT(){uT(),dT()}function dT(){const n=ht(),e=Jr(),t=Ni(),r=Sc(),s=Cc(),i=Mt();e.clear(),t.clear(),r.clear(),s.clear();for(const a of n)e.set(a.baseId,a.totalQuantity),i.has(a.baseId)&&t.set(a.baseId,a.totalQuantity);if(xr([]),Vi([]),Pc(0),Be()==="hourly"){const a=Yr();a.push({time:Date.now(),value:0}),xr(a)}xc.style.display="none",Mc.style.display="inline-block",Xr.style.display="inline-block",Zr.style.display="none",Lc.textContent="00:00:00",Xp(!0),Di(!1),Y.startHourlyTimer(),Ar(),Oc(),Fc()}function fT(){const n=ht(),e=Mt(),t=Ni(),r=Jr(),s=Sc(),i=Cc();for(const a of e){const c=n.find(f=>f.baseId===a),u=c?c.totalQuantity:0,d=t.get(a)??r.get(a)??u;if(r.get(a),u<d){const f=d-u,m=s.get(a)||0;s.set(a,m+f)}if(u>d){const f=u-d,m=i.get(a)||0;i.set(a,m+f)}}}function Uc(){const n=ht(),e=Mt(),t=Ni();for(const r of e){const s=n.find(i=>i.baseId===r);s&&t.set(r,s.totalQuantity)}}function pT(){const n=Li(),e=Math.floor(bc()/3600),t=em(),r=Yr(),s=Rc(),i=Mt(),a=ht(),c=Ni(),u=Sc(),d=Cc(),f={hourNumber:e,startValue:t,endValue:n,earnings:n-t,history:[...r]};s.push(f),Vi(s),Pc(n),xr([{time:Date.now(),value:n}]),u.clear(),d.clear();for(const g of i){const E=a.find(C=>C.baseId===g);E&&c.set(g,E.totalQuantity)}const m=document.querySelector(".stats-container");if(m){const g=document.createElement("div");g.className="earnings-animation",g.textContent=`Hour ${e} Complete! +${f.earnings.toFixed(2)} FE`,g.style.color="#10b981",m.appendChild(g),setTimeout(()=>g.remove(),2e3)}}function mT(){Di(!0),Y.pauseHourlyTimer(),Uc(),Xr.style.display="none",Zr.style.display="inline-block"}function gT(){Di(!1),Y.resumeHourlyTimer(),Uc(),Xr.style.display="inline-block",Zr.style.display="none"}function yT(){Y.stopHourlyTimer();const n=Li(),e=Rc(),t=Yr(),r=em(),i={hourNumber:e.length+1,startValue:r,endValue:n,earnings:n-r,history:[...t]};e.push(i),Vi(e),cm(),xc.style.display="inline-block",Mc.style.display="none",Xr.style.display="none",Zr.style.display="none",Lc.textContent="00:00:00",Jp(0),Xp(!1),Di(!1),Oc(),Fc()}function Ar(){const n=Li(),e=bc()/3600,t=e>0?n/e:0;Be()==="hourly"&&(om.textContent=n.toFixed(2),am.textContent=t.toFixed(2))}function lm(){const n=ht(),e=Be(),t=Lt();if(e==="hourly"&&t){const r=Jr(),s=Mt();return n.filter(i=>!s.has(i.baseId)).map(i=>{const a=i.totalQuantity,c=r.get(i.baseId)||0,u=a-c;return{...i,totalQuantity:u}}).filter(i=>i.baseId===Xt?!0:i.totalQuantity>0)}return n}function _T(){const n=lm(),e=$w(),t=kp(),r=ki(),s=Tc(),i=Ac();let a=n.filter(c=>{if(e&&!c.itemName.toLowerCase().includes(e.toLowerCase()))return!1;if(t!==null){const u=r[c.baseId];if(((u==null?void 0:u.group)||"none")!==t)return!1}return Dc(c)});return a.sort((c,u)=>{let d=0;if(s==="priceUnit"){const f=c.price??-1,m=u.price??-1;d=f-m}else if(s==="priceTotal"){const f=sn((c.price??0)*c.totalQuantity,c.baseId),m=sn((u.price??0)*u.totalQuantity,u.baseId);d=f-m}return i==="asc"?d:-d}),a}function vT(){const n=document.getElementById("usageSection"),e=document.getElementById("usageContent");if(!n||!e)return;const t=Be(),r=Lt(),s=Mt();if(t==="hourly"&&r&&s.size>0){n.style.display="block";const i=ht(),a=Jr(),c=ki(),u=[];for(const f of s){const m=i.find(R=>R.baseId===f),g=m?m.totalQuantity:0,C=(a.get(f)||0)-g;if(!(C<=0)){if(!m){const R=c[f];R&&u.push({baseId:f,itemName:R.name,netUsage:C,price:0});continue}u.push({baseId:f,itemName:m.itemName,netUsage:C,price:m.price||0})}}if(u.length===0){n.style.display="none";return}u.sort((f,m)=>{const g=f.price>0?Math.abs(f.netUsage*f.price):0;return(m.price>0?Math.abs(m.netUsage*m.price):0)-g});let d=0;e.innerHTML=u.map(({baseId:f,itemName:m,netUsage:g,price:E})=>{const C=E>0?E:0,R=E>0?Math.abs(g)*E:0;g>0?d-=R:g<0&&(d+=R);const P=g>0?"-":g<0?"+":"",N=g!==0?`${P}${Math.abs(g)}`:"0",O=g>0?"-":g<0?"+":"",B=E>0&&g!==0?`${O}${R.toFixed(2)} FE`:"- FE";return`
        <div class="item-row">
          <div class="item-name">
            <img src="./assets/${f}.webp" 
                 alt="${m}" 
                 class="item-icon"
                 onerror="this.style.display='none'">
            <div class="item-name-content">
              <div class="item-name-text">${m}</div>
            </div>
          </div>
          <div class="item-quantity">${N}</div>
          <div class="item-price">
            <div class="price-single ${E===0?"no-price":""}">
              ${E>0?C.toFixed(2):"Not Set"}
            </div>
            ${E>0&&g!==0?`<div class="price-total">${B}</div>`:""}
          </div>
        </div>
      `}).join("")+(u.length>0&&d!==0?`
      <div class="usage-footer">
        <div class="usage-footer-label">Net Impact:</div>
        <div class="usage-footer-total">${d>0?"+":""}${d.toFixed(2)} FE</div>
      </div>
    `:"")}else n.style.display="none"}function Ve(){vT();const n=document.getElementById("inventory");if(!n)return;const e=_T(),t=Be(),r=Lt();if(e.length===0){const s=t==="hourly"&&r?"No new items gained yet":"No items match your filters";n.innerHTML=`<div class="loading">${s}</div>`;return}n.innerHTML=e.map(s=>{const i=s.price!==null?s.price*s.totalQuantity:null,a=i!==null?sn(i,s.baseId):null,c=Lr(s.baseId);return`
      <div class="item-row">
        <div class="item-checkbox-cell">
          <button type="button" class="inventory-item-checkbox ${c?"checked":""}" data-base-id="${s.baseId}" aria-label="${c?"Exclude from total":"Include in total"}" title="${c?"Exclude from total":"Include in total"}">
            ${c?'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6L5 9L10 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':""}
          </button>
        </div>
        <div class="item-name">
          <img src="./assets/${s.baseId}.webp" 
               alt="${s.itemName}" 
               class="item-icon"
               onerror="this.style.display='none'">
          <div class="item-name-content">
            <div class="item-label">${s.itemName}</div>
          </div>
        </div>
        <div class="item-quantity">${s.totalQuantity.toLocaleString()}</div>
        <div class="item-price">
          <div class="price-single ${s.price===null?"no-price":""}">
            ${s.price!==null?s.price.toFixed(2):"Not Set"}
          </div>
          ${a!==null?`<div class="price-total">${a.toFixed(2)}</div>`:""}
        </div>
      </div>
    `}).join(""),um()}function um(){const n=Tc(),e=Ac();document.querySelectorAll(".inventory-section [data-sort]").forEach(t=>{const r=t.dataset.sort;r&&(r==="priceUnit"?t.textContent="Price":r==="quantity"?t.textContent="Quantity":t.textContent="Total",t.classList.remove("sort-active","sort-asc","sort-desc"),r===n&&(t.classList.add("sort-active"),t.classList.add(e==="asc"?"sort-asc":"sort-desc")))})}function et(n){const e=document.getElementById("breakdown");if(!e)return;const t=lm(),r=ki(),s=kp(),i=new Map;for(const c of t){if(c.price===null||!Lr(c.baseId)||c.totalQuantity<=0||!Dc(c))continue;const u=r[c.baseId];if(!u||u.tradable===!1)continue;const d=u.group||"none",f=c.price*c.totalQuantity,m=sn(f,c.baseId);i.set(d,(i.get(d)||0)+m)}const a=Array.from(i.entries()).map(([c,u])=>({group:c,total:u})).filter(({total:c})=>c>0).sort((c,u)=>u.total-c.total);if(a.length===0){e.innerHTML="";return}e.innerHTML=a.map(({group:c,total:u})=>{const d=sT(c);return`
      <div class="breakdown-group ${s===c?"selected":""}" data-group="${c}" title="${d}">
        <div class="breakdown-icon-box">
          <img src="./assets/${c}.webp" alt="${d}" class="breakdown-icon" title="${d}" onerror="this.style.display='none'">
        </div>
        <span class="breakdown-group-value" title="${d}">${u.toFixed(0)}</span>
      </div>
    `}).join(""),e.querySelectorAll(".breakdown-group").forEach(c=>{c.addEventListener("click",()=>{const u=c.dataset.group;u&&(bh(s===u?null:u),et(n),n())})})}let Le=null,hn=null,Ss=null;function ma(){Le&&(Ss!==null&&cancelAnimationFrame(Ss),Ss=requestAnimationFrame(()=>{Ss=null,Le.resize(),Le.update("none")}))}function IT(){const n=document.getElementById("wealth-graph");if(!n)return;const e=n.getContext("2d");Le&&Le.destroy(),hn==null||hn.disconnect(),hn=null;const t=getComputedStyle(document.documentElement).getPropertyValue("--border").trim()||"#7e7e7e";if(Le=new Chart(e,{type:"line",data:{datasets:[{label:"Wealth (FE)",data:[],borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,devicePixelRatio:typeof window<"u"?Math.min(window.devicePixelRatio,3):2,animation:!1,normalized:!0,scales:{x:{type:"time",display:!0,bounds:"data",time:{minUnit:"minute",tooltipFormat:"HH:mm:ss",displayFormats:{minute:"HH:mm",hour:"HH:mm",day:"MMM d, HH:mm"}},border:{color:t},grid:{display:!1},ticks:{color:"#FAFAFA",autoSkip:!0,includeBounds:!0,maxTicksLimit:10}},y:{display:!0,border:{color:t},grid:{display:!1},ticks:{color:"#FAFAFA",precision:0,callback:function(r){const s=r;return s%1===0?s.toString():""}}}},parsing:!1,plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:r=>{if(r.length===0)return"";const i=r[0].parsed.y;return`Wealth: ${Math.round(i)} FE`},label:r=>{const s=r.parsed.x;return s?new Date(s).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}):""},footer:()=>""}},decimation:{enabled:!0,algorithm:"lttb",samples:1e3}},interaction:{intersect:!1,mode:"nearest",axis:"x"}}}),typeof ResizeObserver<"u"){const r=n.parentElement??n;hn=new ResizeObserver(()=>{ma()}),hn.observe(r)}ma(),ii()}function ET(){ma()}function wT(n){const t={time:Date.now(),value:Math.round(n)},r=Qp();r.push(t),r.length>sg&&r.shift(),Yp(r),Be()==="realtime"&&ii()}function ii(){if(!Le)return;const n=Be(),e=n==="realtime"?Qp():Yr();let t=e.map(s=>({x:s.time,y:s.value}));const r=document.getElementById("wealth-graph-placeholder");if(r&&(n==="hourly"&&e.length===0?r.classList.add("visible"):r.classList.remove("visible")),Le.options.scales.x.ticks.maxTicksLimit=10,e.length>0){const s=e[0].time,i=Math.floor(s/6e4)*6e4,a=e[e.length-1].time;i<s&&(t=[{x:i,y:e[0].value},...t]),Le.data.datasets[0].data=t,Le.options.scales.x.min=i,Le.options.scales.x.max=a}else Le.data.datasets[0].data=t,Le.options.scales.x.min=void 0,Le.options.scales.x.max=void 0;Le.update("none")}const hm=[{key:"timer",targetId:"style1TimeValueWrap"},{key:"resetRealtimeBtn",targetId:"style1TimeValueWrap"},{key:"hourlyControls",targetId:"style1TimeControlsSlot"},{key:"wealthHourly",targetId:"style1PerHourValue"},{key:"wealthValue",targetId:"style1TotalValue"}];let Rh=!1,Ph=null;const dm=new Map,fm=new Map;function Ao(){const n=document.body.classList.contains("layout-style-1");for(const e of hm){const t=dm.get(e.key),r=fm.get(e.key);if(!t||!r)continue;if(n){const i=document.getElementById(e.targetId);if(!i)continue;t.parentElement!==i&&i.appendChild(t);continue}const s=r.parentNode;s&&(t.parentNode===s&&t.previousSibling===r||s.insertBefore(t,r.nextSibling))}}function TT(){if(Rh){Ao();return}for(const n of hm){const e=document.getElementById(n.key);if(!e||!e.parentNode)continue;const t=document.createComment(`style1-anchor-${n.key}`);e.parentNode.insertBefore(t,e),dm.set(n.key,e),fm.set(n.key,t)}Ao(),Ph=new MutationObserver(()=>{Ao()}),Ph.observe(document.body,{attributes:!0,attributeFilter:["class"]}),Rh=!0}function AT(n,e){const t=document.getElementById(`hourGraph${e}`);if(!t)return;const r=t.getContext("2d");if(n.history.length===0)return;const s=Math.max(1,Math.floor(n.history.length/60)),i=n.history.filter((d,f)=>f%s===0||f===n.history.length-1),a=Array.from({length:61},(d,f)=>f%10===0?`${f}m`:""),c=Array.from({length:61},(d,f)=>{const m=Math.floor(f/60*(i.length-1)),g=i[m];return{x:f,y:g?g.value-n.startValue:0,time:g?g.time:0}}),u=n.history.length>0?n.history[0].time:Date.now();new Chart(r,{type:"line",data:{labels:a,datasets:[{data:c.map(d=>d.y),borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,animation:!1,scales:{x:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:7}},y:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:5,callback:function(d){const f=d;return f%1===0?f.toFixed(0):f.toFixed(1)}}}},plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:d=>{if(d.length===0)return"";const m=d[0].parsed.y;return`${m%1===0?m.toFixed(0):m.toFixed(1)} FE`},label:d=>{const f=d.dataIndex;if(f>=0&&f<c.length){const m=c[f];let g;m.time>0?g=new Date(m.time):g=new Date(u+f*6e4);const E=Math.floor(g.getSeconds()/60)*60,C=new Date(g);C.setSeconds(E),C.setMilliseconds(0);const R=C.getHours().toString().padStart(2,"0"),P=C.getMinutes().toString().padStart(2,"0");return`${R}:${P}`}return""},footer:()=>""}}},interaction:{intersect:!1,mode:"index"}}})}let pm,mm;function bT(n,e){pm=n,mm=e}function ST(){const n=document.getElementById("breakdownModal"),e=document.getElementById("breakdownTotal"),t=document.getElementById("breakdownHours");if(!n||!e||!t)return;const r=Rc(),s=bc(),i=r.reduce((a,c)=>a+c.earnings,0);e.textContent=`${i.toFixed(2)} FE`,t.innerHTML=r.map((a,c)=>(a.hourNumber<=Math.floor(s/3600)||Bn(s%3600).substring(3),`
      <div class="hour-card">
        <div class="hour-header">
          <div class="hour-label">Hour ${a.hourNumber}</div>
          <div class="hour-earnings">+${a.earnings.toFixed(2)} FE</div>
        </div>
        <canvas class="hour-graph" id="hourGraph${c}"></canvas>
      </div>
    `)).join(""),n.classList.add("active"),setTimeout(()=>{r.forEach((a,c)=>{AT(a,c)})},100)}function CT(){const n=document.getElementById("breakdownModal");n&&(n.classList.remove("active"),Vi([]),Qw(new Map),xr([]),Pc(0),Yw(new Set),Jw(new Map),Xw(new Map),Zw(new Map),pm(),mm())}document.getElementById("updateModal");document.getElementById("updateModalTitle");document.getElementById("updateModalSubtitle");document.getElementById("updateModalMessage");document.getElementById("updateModalChangelog");document.getElementById("updateProgressContainer");document.getElementById("updateProgressFill");document.getElementById("updateProgressText");document.getElementById("updateBtnPrimary");document.getElementById("updateBtnSecondary");let bo={},ar=null,dn=null,Xe=null,kh,Dh,So=!1,Co=!1;const Ro=document.getElementById("settingsBackBtn"),Po=document.getElementById("generalSection"),ko=document.getElementById("preferencesSection"),fn=document.getElementById("includeTaxCheckbox"),Ht=document.getElementById("cloudSyncCheckbox"),Cs=document.getElementById("cloudSyncHelperText"),Do=document.querySelectorAll(".settings-sidebar-item"),Nh=document.getElementById("settingsDownloadDesktopBtn");function RT(n,e,t,r){kh=e,Dh=t;const s=document.querySelector(".header");function i(){document.querySelectorAll(".nav-item").forEach(f=>f.classList.remove("active")),document.querySelectorAll(".page").forEach(f=>f.classList.remove("active"));const d=document.getElementById("page-settings");d&&d.classList.add("active"),s&&s.classList.add("hidden")}async function a(){const d={},f=document.getElementById("includeTaxCheckbox"),m=f?f.checked:ar??!1;if(d.includeTax=m,dn!==null&&Xe!==null&&dn!==Xe){if(!(await Y.setCloudSyncEnabled(dn)).success){Ht&&(Ht.checked=Xe);return}Xe=dn,Cs&&(Cs.textContent=Xe?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices.")}(await Y.saveSettings(d)).success&&(pa(d.includeTax??!1),Dh(ht()),kh())}async function c(){if(So){Co=!0;return}So=!0;do{Co=!1;try{await a()}catch(d){console.error("Auto-save settings failed:",d)}}while(Co);So=!1}const u=document.getElementById("openSettingsBtn");u&&u.addEventListener("click",async()=>{r.open=!1;const d=document.getElementById("myAccountMenu"),f=document.getElementById("myAccountButton");d&&(d.style.display="none"),f&&f.classList.remove("active"),bo=await Y.getSettings(),ar=bo.includeTax!==void 0?bo.includeTax:!0,pa(ar);const m=await Y.getCloudSyncStatus();Xe=m.enabled,dn=m.enabled,fn&&(fn.checked=ar),Ht&&Cs&&Xe!==null&&(Ht.checked=Xe,Cs.textContent=Xe?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices."),Po.classList.add("active"),ko.classList.remove("active"),Do.forEach(g=>{g.getAttribute("data-section")==="general"?g.classList.add("active"):g.classList.remove("active")}),i()}),Ro==null||Ro.addEventListener("click",()=>{PT()}),fn&&fn.addEventListener("change",()=>{fn&&(ar=fn.checked,c())}),Nh&&Nh.addEventListener("click",()=>{window.open("https://github.com/Syncingoutt/Fenix/releases","_blank","noopener,noreferrer")}),Ht&&Ht.addEventListener("change",()=>{dn=Ht.checked,c()}),Do.forEach(d=>{d.addEventListener("click",()=>{const f=d.getAttribute("data-section");f&&(Do.forEach(m=>m.classList.remove("active")),d.classList.add("active"),f==="general"?(Po.classList.add("active"),ko.classList.remove("active")):f==="preferences"&&(Po.classList.remove("active"),ko.classList.add("active")))})})}function PT(){document.querySelectorAll(".page").forEach(r=>r.classList.remove("active"));const n=document.getElementById("page-home");n&&n.classList.add("active"),document.querySelectorAll(".nav-item").forEach(r=>r.classList.remove("active"));const e=document.getElementById("nav-home");e&&e.classList.add("active");const t=document.querySelector(".header");t&&t.classList.remove("hidden")}const kT=document.getElementById("syncConsentModal"),Vh=document.getElementById("syncConsentEnableBtn"),Lh=document.getElementById("syncConsentDisableBtn");function xh(){kT.classList.remove("active")}function DT(){Vh&&Vh.addEventListener("click",async()=>{await Y.setCloudSyncEnabled(!0),xh()}),Lh&&Lh.addEventListener("click",async()=>{await Y.setCloudSyncEnabled(!1),xh()}),Y.setCloudSyncEnabled(!0)}const br=document.getElementById("syncDisableConfirmModal"),Mh=document.getElementById("syncDisableCancelBtn"),Oh=document.getElementById("syncDisableConfirmBtn");let Wt=null;function No(){br&&(br.classList.remove("active"),Wt=null)}function NT(){br&&(Mh&&Mh.addEventListener("click",()=>{Wt&&Wt(!1),No()}),Oh&&Oh.addEventListener("click",async()=>{Wt&&Wt(!0),No()}),br.addEventListener("click",n=>{n.target===br&&(Wt&&Wt(!1),No())}))}const jt=document.getElementById("myAccountButton"),pn=document.getElementById("myAccountMenu"),Fh=document.getElementById("appVersion");let qt=!1;function VT(){return Y.getAppVersion().then(n=>{Fh&&(Fh.textContent=n)}),jt&&jt.addEventListener("click",n=>{n.stopPropagation(),qt=!qt,pn&&(pn.style.display=qt?"block":"none"),jt&&(qt?jt.classList.add("active"):jt.classList.remove("active"))}),document.addEventListener("click",()=>{qt&&(qt=!1,pn&&(pn.style.display="none"),jt&&jt.classList.remove("active"))}),pn&&pn.addEventListener("click",n=>{n.stopPropagation()}),{open:qt}}const Uh=document.getElementById("wealthValue"),Bh=document.getElementById("wealthHourly"),Us=document.getElementById("realtimeBtn"),Bs=document.getElementById("hourlyBtn"),ga=document.getElementById("hourlyControls"),Bc=document.getElementById("startHourly"),$c=document.getElementById("stopHourly"),Hc=document.getElementById("pauseHourly"),jc=document.getElementById("resumeHourly"),$h=document.getElementById("hourlyTimer"),Pn=document.getElementById("timer"),$s=document.getElementById("resetRealtimeBtn"),mn=document.getElementById("minPriceInput"),gn=document.getElementById("maxPriceInput"),Vo=document.getElementById("searchInput");document.getElementById("clearSearch");function LT(){Bc.style.display="inline-block",$c.style.display="none",Hc.style.display="none",jc.style.display="none",ga.classList.remove("active"),Us.classList.add("active"),Bs.classList.remove("active"),Pn.style.display="block",$s.style.display="block"}let cr,Lo,xo,Mo;function xT(n,e,t,r){cr=n,Lo=e,xo=t,Mo=r;function s(){const a=mn==null?void 0:mn.value.trim(),c=gn==null?void 0:gn.value.trim(),u=a&&a!==""?parseFloat(a):null,d=c&&c!==""?parseFloat(c):null;if(u!==null&&d!==null&&u>d)return;Gw(u),Ww(d),cr();const f=Be();f==="realtime"?xo():f==="hourly"&&Lt()&&Mo(),Lo()}mn==null||mn.addEventListener("input",s),gn==null||gn.addEventListener("input",s);const i=document.getElementById("inventory");i==null||i.addEventListener("click",a=>{const c=a.target.closest(".inventory-item-checkbox");if(!c)return;const u=c.dataset.baseId;if(!u)return;a.preventDefault(),Kw(u),cr(),Lo();const d=Be();d==="realtime"?xo():d==="hourly"&&Lt()&&Mo()}),document.querySelectorAll(".inventory-section [data-sort]").forEach(a=>{a.addEventListener("click",()=>{const c=a.dataset.sort;if(!c)return;const u=Tc(),d=Ac();u===c?Ah(d==="asc"?"desc":"asc"):(qw(c),Ah("desc")),cr()})}),Vo==null||Vo.addEventListener("input",a=>{const c=a.target.value;zw(c),cr()})}let Hh,jh,qh,zh,Gh,Wh,Kh,zt,Rs,Oo,Qh;function MT(n,e,t,r,s,i,a,c,u,d,f){var m;Hh=n,jh=e,qh=t,zh=r,Gh=s,Wh=i,Kh=a,zt=c,Rs=u,Oo=d,Qh=f,Us.addEventListener("click",()=>{Sh("realtime"),Us.classList.add("active"),Bs.classList.remove("active"),ga.classList.remove("active"),Pn.style.display="block",$s.style.display="block",Pn.textContent=Bn(nm()),Wh(),zt(),Rs(zt),Oo()}),Bs.addEventListener("click",()=>{if(Sh("hourly"),Us.classList.remove("active"),Bs.classList.add("active"),ga.classList.add("active"),Pn.style.display="none",$s.style.display="none",Lt())Kh(),zt(),Rs(zt);else{const g=document.getElementById("wealthValue"),E=document.getElementById("wealthHourly");g&&(g.textContent="0.00"),E&&(E.textContent="0.00"),zt(),Rs(zt)}Oo()}),Bc.addEventListener("click",Hh),$c.addEventListener("click",jh),Hc.addEventListener("click",qh),jc.addEventListener("click",zh),$s.addEventListener("click",Gh),(m=document.getElementById("closeBreakdown"))==null||m.addEventListener("click",Qh)}function OT(n){let e=null,t=null,r=!1;const s=10*1e3,i="fenix_setup_guide_dismissed",a=document.getElementById("ctaBanner"),c=document.getElementById("ctaCloseBtn");a&&(localStorage.getItem("fenix_cta_dismissed")==="true"||a.classList.remove("is-hidden")),a&&c&&(c.addEventListener("click",()=>{a.classList.add("is-hidden"),localStorage.setItem("fenix_cta_dismissed","true")}),a.addEventListener("click",v=>{const w=v.target;w&&(w.closest("#ctaCloseBtn")||w.closest(".cta-close"))&&(a.classList.add("is-hidden"),localStorage.setItem("fenix_cta_dismissed","true"))}));const u=document.getElementById("uploadLogBtn");if(u){const v=document.createElement("input");v.type="file",v.accept=".log",v.style.display="none",document.body.appendChild(v),u.addEventListener("click",()=>{v.click()}),v.addEventListener("change",async w=>{var se;const A=w.target,y=(se=A.files)==null?void 0:se[0];if(y){if(!y.name.toLowerCase().endsWith(".log")){alert("Please select a .log file");return}try{u.disabled=!0;const de=u.querySelector("span");de&&(de.textContent="Uploading..."),await Th(y),he(!0),de&&(de.textContent="Upload Log")}catch(de){console.error("Failed to upload log file:",de),alert(`Failed to upload: ${de.message||"Unknown error"}`)}finally{u.disabled=!1,A.value=""}}})}const d=document.getElementById("watchLogBtn");if(d){const v=A=>{const y=d.querySelector("span");y&&(y.textContent=A?"Stop Watch":"Watch Log")},w=()=>{t!==null&&(window.clearInterval(t),t=null),v(!1)};d.addEventListener("click",async()=>{const A=window.showOpenFilePicker;if(!A){alert("Live log watch is only supported in Chromium-based browsers (Chrome/Edge).");return}if(t!==null){w();return}try{const[se]=await A({types:[{description:"UE Log",accept:{"text/plain":[".log"]}}],multiple:!1});e=se??null}catch{return}if(!e)return;v(!0),B();const y=async()=>{if(!(!e||r)){r=!0;try{const se=await e.getFile();await Th(se),he(!0)}catch(se){console.warn("Failed to read watched log file:",se)}finally{r=!1}}};y(),t=window.setInterval(y,s)})}const f=document.getElementById("setupGuideModal"),m=document.getElementById("setupGuideClose"),g=document.getElementById("setupGuidePrev"),E=document.getElementById("setupGuideNext"),C=document.getElementById("setupGuideProgress"),R=document.querySelectorAll(".setup-guide-step"),P=document.getElementById("setupGuideSpotlight"),N=document.getElementById("openSetupGuideLink"),O=document.getElementById("setupGuideSpotlightBack"),B=()=>{localStorage.setItem(i,"true")},z=v=>{if(R.forEach((w,A)=>{w.classList.toggle("active",A===v)}),C&&(C.textContent=`Step ${v+1} of ${R.length}`),g&&(g.style.display=v===0?"none":""),E&&(E.style.display=v===R.length-1?"none":""),P){const w=v===R.length-1;if(P.classList.toggle("active",w),document.body.classList.toggle("setup-guide-focus-active",w),f&&f.classList.toggle("active",!w),w){const A=document.getElementById("uploadLogBtn"),y=document.getElementById("watchLogBtn");if(A||y){const fe=A==null?void 0:A.getBoundingClientRect(),ce=y==null?void 0:y.getBoundingClientRect(),je=Math.min((fe==null?void 0:fe.left)??Number.POSITIVE_INFINITY,(ce==null?void 0:ce.left)??Number.POSITIVE_INFINITY),on=Math.min((fe==null?void 0:fe.top)??Number.POSITIVE_INFINITY,(ce==null?void 0:ce.top)??Number.POSITIVE_INFINITY),es=Math.max((fe==null?void 0:fe.right)??Number.NEGATIVE_INFINITY,(ce==null?void 0:ce.right)??Number.NEGATIVE_INFINITY),Fi=Math.max((fe==null?void 0:fe.bottom)??Number.NEGATIVE_INFINITY,(ce==null?void 0:ce.bottom)??Number.NEGATIVE_INFINITY),qe=Math.max(0,je-8),me=Math.max(0,on-8),Ui=Math.max(0,es-je)+16,Ot=Math.max(0,Fi-on)+16;P.style.setProperty("--spotlight-x",`${qe}px`),P.style.setProperty("--spotlight-y",`${me}px`),P.style.setProperty("--spotlight-w",`${Ui}px`),P.style.setProperty("--spotlight-h",`${Ot}px`)}const de=document.querySelector(".log-cta-actions")??A??y;if(de){const fe=de.getBoundingClientRect(),ce=Math.max(0,fe.left),je=Math.max(0,fe.top-84);P.style.setProperty("--note-x",`${ce}px`),P.style.setProperty("--note-y",`${je}px`)}}}},he=v=>{f&&(f.classList.remove("active"),P&&P.classList.remove("active"),document.body.classList.remove("setup-guide-focus-active"),B())};if(f&&R.length>0){let v=0;g==null||g.addEventListener("click",()=>{v=Math.max(0,v-1),z(v)}),E==null||E.addEventListener("click",()=>{v=Math.min(R.length-1,v+1),z(v)}),m==null||m.addEventListener("click",()=>he()),O==null||O.addEventListener("click",()=>{v=Math.max(0,v-1),z(v)}),f.addEventListener("click",y=>{y.target===f&&he()}),window.addEventListener("resize",()=>{if(localStorage.getItem(i)==="true")return;const de=Array.from(R).findIndex(fe=>fe.classList.contains("active"));de>=0&&z(de)}),localStorage.getItem(i)==="true"||(f.classList.add("active"),z(v))}N&&f&&R.length>0&&N.addEventListener("click",()=>{let v=0;f.classList.add("active"),localStorage.removeItem(i),z(v)});const J=document.querySelectorAll(".nav-item"),T=document.querySelectorAll(".page"),_=document.querySelector(".header");function I(v){J.forEach(y=>y.classList.remove("active"));const w=document.getElementById(`nav-${v}`);w&&w.classList.add("active"),T.forEach(y=>y.classList.remove("active"));const A=document.getElementById(`page-${v}`);A&&A.classList.add("active"),_&&_.classList.remove("hidden")}J.forEach(v=>{v.addEventListener("click",()=>{const w=v.id.replace("nav-","");I(w)})})}let Fo={},Uo={},Pt=[],gm=[],oi="price",En="desc",ya="currency",_a="",xt="s11-vorax",xe=null,Fe=null;const Mi=new Map,va=new Set;let Jt={},qc=!1,te=[],Pe=0,ve=0,kn=0,Hs=0,Ia=0,Ea="",ai=!0;const FT=24,Yh=1;let Jh=0;const Mr=new Map;let Bo="",ci=!1,li=null,ym=0,wa=0,_m=0;function Or(n){if(n&&n.length>=2){let e=n[0],t=n[0],r=ui(e,0),s=r;if(n.forEach((i,a)=>{const c=ui(i,a);c<r&&(e=i,r=c),(c>s||c===s&&a>0)&&(t=i,s=c)}),e.price>0){const a=(t.price-e.price)/e.price*100;return a>=Yh?{trend:"up",percent:a}:a<=-Yh?{trend:"down",percent:a}:{trend:"neutral",percent:0}}}return{trend:"neutral",percent:0}}function ui(n,e){if(typeof n.timestamp=="number"&&Number.isFinite(n.timestamp))return n.timestamp;const t=Date.parse(n.date);return Number.isFinite(t)?t+e/1e3:e}function UT(n,e,t){const r=n.getContext("2d");if(!r||e.length===0)return;const s=n.width,i=n.height,a=2;if(r.clearRect(0,0,s,i),t==="neutral"){const g=i/2;r.strokeStyle="#7E7E7E",r.lineWidth=1.5,r.beginPath(),r.moveTo(a,g),r.lineTo(s-a,g),r.stroke();return}if(e.length===1){const g=i/2;r.strokeStyle=t==="up"?"#4CAF50":t==="down"?"#F44336":"#7E7E7E",r.lineWidth=1.5,r.beginPath(),r.moveTo(a,g),r.lineTo(s-a,g),r.stroke();return}const c=Math.min(...e),d=Math.max(...e)-c||1;let f;if(e.length>50){const g=Math.ceil(e.length/50);f=e.filter((E,C)=>C%g===0||C===e.length-1)}else f=e;t==="up"?(r.strokeStyle="#4CAF50",r.fillStyle="rgba(76, 175, 80, 0.1)"):(r.strokeStyle="#F44336",r.fillStyle="rgba(244, 67, 54, 0.1)"),r.lineWidth=1.5,r.beginPath();const m=(s-a*2)/(f.length-1);f.forEach((g,E)=>{const C=a+E*m,R=(g-c)/d,P=i-a-R*(i-a*2);E===0?r.moveTo(C,P):r.lineTo(C,P)}),r.stroke(),r.lineTo(s-a,i-a),r.lineTo(a,i-a),r.closePath(),r.fill()}function BT(n,e){if(n&&n.length>0)return[...n].map((r,s)=>({point:r,index:s})).sort((r,s)=>ui(r.point,r.index)-ui(s.point,s.index)).map(({point:r})=>r.price);const t=e>0?e:0;return new Array(7).fill(t)}function Ta(n){return n===0?"0.00":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(2)+"K":n.toFixed(2)}function $T(n){if(!Number.isFinite(n)||n<=0)return"0";if(n>=1e6){const e=n/1e6,t=e>=10?0:1;return`${e.toFixed(t)}m`}if(n>=1e3){const e=n/1e3,t=e>=10?0:1;return`${e.toFixed(t)}k`}return n.toFixed(0)}function HT(n){return Number.isFinite(n)?new Date(n).toLocaleDateString(void 0,{weekday:"short",month:"long",day:"numeric",year:"numeric"}):"--"}function jT(){return xe?Pt.find(n=>n.baseId===xe)??null:null}function qT(n){var r;const e=(r=n==null?void 0:n.canvas)==null?void 0:r.parentElement;if(!e)return null;let t=e.querySelector("#pricesDetailChartTooltip");return t||(t=document.createElement("div"),t.id="pricesDetailChartTooltip",t.className="prices-detail-chart-tooltip",t.style.opacity="0",e.appendChild(t),t)}function zT(n){var T,_,I;const{chart:e,tooltip:t}=n,r=qT(e);if(!r)return;if(!t||t.opacity===0||!Array.isArray(t.dataPoints)||t.dataPoints.length===0){r.style.opacity="0";return}const s=t.dataPoints[0],i=Number((s==null?void 0:s.dataIndex)??0),a=(_=(T=e==null?void 0:e.data)==null?void 0:T.labels)==null?void 0:_[i],c=Number(a),u=Number((s==null?void 0:s.raw)??((I=s==null?void 0:s.parsed)==null?void 0:I.y)??0),d=jT(),f=d?hi(d.baseId):"",m=(d==null?void 0:d.name)??"Item",g=vm(m);r.innerHTML=`
    <div class="prices-detail-chart-tooltip-date">${HT(c)}</div>
    <div class="prices-detail-chart-tooltip-row">
      <span class="prices-detail-chart-tooltip-fe">${$T(u)}</span>
      <img src="${hi("100300")}" alt="FE" class="prices-detail-chart-tooltip-icon prices-detail-chart-tooltip-fe-icon" onerror="this.style.display='none'">
      <span class="prices-detail-chart-tooltip-arrow" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3 4 7l4 4"></path>
          <path d="M4 7h16"></path>
          <path d="m16 21 4-4-4-4"></path>
          <path d="M20 17H4"></path>
        </svg>
      </span>
      <span class="prices-detail-chart-tooltip-qty">1.0</span>
      ${f?`<img src="${f}" alt="${g}" class="prices-detail-chart-tooltip-icon prices-detail-chart-tooltip-item-icon" onerror="this.style.display='none'">`:""}
    </div>
  `;const E=Number((e==null?void 0:e.width)??0),C=Number((e==null?void 0:e.height)??0),R=Number(t.caretX??0),P=Number(t.caretY??0),N=18,O=r.offsetWidth,B=r.offsetHeight,he=R+N+O<=E-4?R+N:Math.max(4,R-O-N),J=P+N+B<=C-4?P+N:Math.max(4,P-B-N);r.style.left=`${he}px`,r.style.top=`${J}px`,r.style.opacity="1"}function GT(n){return!n||Number.isNaN(n)?"--":new Date(n).toLocaleString()}function hi(n){return`./assets/${n}.webp`}function WT(n){return`https://tlidb.com/en/${n.trim().replace(/['’]/g,"").replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"Unknown_Item"}`}function KT(n,e){const t=Jt[n];let r=t&&t.length>0?t:e;if(r.length===0)return null;if(!t||t.length===0){const a=Math.max(...r.map(c=>c.timestamp||0));if(Number.isFinite(a)&&a>0){const c=a-6048e5,u=r.filter(d=>d.timestamp>=c);u.length>0&&(r=u)}}const s=r.map(a=>a.price).filter(a=>Number.isFinite(a)&&a>=0);return s.length===0?null:s.reduce((a,c)=>a+c,0)/s.length}function zc(n,e,t){const r=document.getElementById("pricesDetailPriceValue"),s=document.getElementById("pricesDetailAveragePriceValue");if(r&&(r.textContent=Ta(e)),s){const i=KT(n,t);s.textContent=i===null?"--":Ta(i)}}function QT(n){if(!n||n.length===0)return[];const e=Date.now();return n.map((t,r)=>{const s=Date.parse(t.date),i=typeof t.timestamp=="number"&&Number.isFinite(t.timestamp)?t.timestamp:Number.isFinite(s)?s:e+r;return{date:t.date,timestamp:i,price:t.price}}).sort((t,r)=>t.timestamp-r.timestamp)}function YT(n){const e=`sparkline-${n.baseId}`,t=Wc(n),r=n.price>0?Or(t):{trend:"neutral",percent:0},s=hi(n.baseId),i=`trend-${r.trend}`,a=Ta(n.price),c=n.price>0,u=c?iT(n.timestamp):"",d=c?u:"no-price",f=c?r.trend==="neutral"?"0%":`${r.percent>0?"+":""}${Math.round(r.percent)}%`:"";return`
    <tr class="prices-row" data-base-id="${n.baseId}">
      <td class="prices-col-name">
        <div class="prices-name-cell">
          <img src="${s}" alt="${n.name}" class="prices-item-icon" onerror="this.style.display='none'">
          <span class="prices-item-name">${vm(n.name)}</span>
        </div>
      </td>
      <td class="prices-col-updated">
        <span class="prices-updated-at">${GT(n.timestamp)}</span>
      </td>
      <td class="prices-col-price">
        <span class="prices-price-value ${d}">${a}</span>
      </td>
      <td class="prices-col-sparkline">
        <div class="prices-sparkline-cell">
          <canvas id="${e}" class="prices-sparkline" width="80" height="28" 
                  ></canvas>
          <span class="prices-trend ${i}">${f}</span>
        </div>
      </td>
    </tr>
  `}function vm(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}function JT(n,e,t){return[...n].sort((s,i)=>{let a,c;switch(e){case"name":a=s.name.toLowerCase(),c=i.name.toLowerCase();break;case"price":a=s.price,c=i.price;break;case"trend":a=sd(s),c=sd(i);break;default:return 0}return a<c?t==="asc"?-1:1:a>c?t==="asc"?1:-1:0})}function Oi(){const n=document.getElementById("pricesTableBody");if(!n)return;const e=JT(gm,oi,En);document.querySelectorAll(".prices-table th").forEach(s=>{s.classList.remove("sort-asc","sort-desc"),s.getAttribute("data-sort")===oi&&s.classList.add(`sort-${En}`)});const t=document.getElementById("pricesItemCount");t&&(t.textContent=`${e.length} item${e.length!==1?"s":""}`),n.innerHTML=e.map(s=>YT(s)).join("");const r=e.map(s=>{const i=Wc(s),a=s.price>0?Or(i):{trend:"neutral",percent:0};return{item:s,history:i,trendData:a}});s0(r)}function Fr(n){qc=n;const e=document.getElementById("pricesListView"),t=document.getElementById("pricesDetailView");e&&(e.style.display=n?"none":"block"),t&&(t.style.display=n?"block":"none")}function Xh(n){return new Date(n).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function Zh(n,e){const t=n.replace("#","");if(t.length!==6)return`rgba(222, 92, 11, ${e})`;const r=parseInt(t.slice(0,2),16),s=parseInt(t.slice(2,4),16),i=parseInt(t.slice(4,6),16);return`rgba(${r}, ${s}, ${i}, ${e})`}function XT(){const n=getComputedStyle(document.documentElement);return{primary:n.getPropertyValue("--primary").trim()||"#DE5C0B",text:n.getPropertyValue("--text").trim()||"#FAFAFA",border:n.getPropertyValue("--border").trim()||"#7E7E7E",bgShade:n.getPropertyValue("--bg-shade").trim()||"#272727"}}function Im(n){const e=Mi.get(`${xt}:${n}`);if(e&&e.length>0)return e;const t=Jt[n];if(t&&t.length>0)return t;const r=Pt.find(s=>s.baseId===n);return r!=null&&r.history&&r.history.length>0?QT(r.history):[]}function ZT(n){if(n.length===0)return 0;const e=Date.now()-7*24*60*60*1e3,t=n.findIndex(r=>r.timestamp>=e);return t>=0?t:Math.max(0,n.length-1)}function Em(){if(te.length===0)return[];const n=Math.max(0,Math.min(Pe,te.length-1)),e=Math.max(n,Math.min(ve,te.length-1));return te.slice(n,e+1)}function Ur(){const n=document.getElementById("pricesRangeStart"),e=document.getElementById("pricesRangeEnd"),t=document.getElementById("pricesRangeNavigatorStart"),r=document.getElementById("pricesRangeNavigatorEnd"),s=document.getElementById("pricesRangeLabel"),i=document.getElementById("pricesRangeHoverStart"),a=document.getElementById("pricesRangeHoverEnd"),c=i==null?void 0:i.parentElement,u=document.getElementById("pricesRangeSliderShell"),d=document.getElementById("pricesRangeNavigatorShell"),f=te.length;if(!n||!e||!t||!r||!s||!u||!d||!i||!a)return;if(f===0){n.min="0",n.max="0",n.value="0",n.disabled=!0,e.min="0",e.max="0",e.value="0",e.disabled=!0,t.min="0",t.max="0",t.value="0",t.disabled=!0,r.min="0",r.max="0",r.value="0",r.disabled=!0,s.textContent="No data available",i.textContent="--",a.textContent="--",u.style.setProperty("--prices-range-start","0%"),u.style.setProperty("--prices-range-end","100%"),d.style.setProperty("--prices-range-start","0%"),d.style.setProperty("--prices-range-end","100%"),c==null||c.style.setProperty("--prices-range-start","0%"),c==null||c.style.setProperty("--prices-range-end","100%");return}const m=f-1;n.disabled=!1,e.disabled=!1,t.disabled=!1,r.disabled=!1,n.min="0",n.max=String(m),e.min="0",e.max=String(m),t.min="0",t.max=String(m),r.min="0",r.max=String(m),n.value=String(Pe),e.value=String(ve),t.value=String(Pe),r.value=String(ve);const g=te[Pe],E=te[ve];s.textContent=`${ve-Pe+1} checks`,i.textContent=Xh(g.timestamp),a.textContent=Xh(E.timestamp);const C=m===0?0:Pe/m*100,R=m===0?100:ve/m*100;u.style.setProperty("--prices-range-start",`${C}%`),u.style.setProperty("--prices-range-end",`${R}%`),d.style.setProperty("--prices-range-start",`${C}%`),d.style.setProperty("--prices-range-end",`${R}%`),c==null||c.style.setProperty("--prices-range-start",`${C}%`),c==null||c.style.setProperty("--prices-range-end",`${R}%`)}function Ze(n){const e=document.getElementById("pricesRangeStart"),t=document.getElementById("pricesRangeEnd"),r=document.getElementById("pricesRangeNavigatorStart"),s=document.getElementById("pricesRangeNavigatorEnd");!e||!t||(n==="start"?(e.classList.add("prices-range-slider-active"),t.classList.remove("prices-range-slider-active"),r==null||r.classList.add("prices-range-slider-active"),s==null||s.classList.remove("prices-range-slider-active")):(t.classList.add("prices-range-slider-active"),e.classList.remove("prices-range-slider-active"),s==null||s.classList.add("prices-range-slider-active"),r==null||r.classList.remove("prices-range-slider-active")))}function e0(n,e){const t=Math.max(0,te.length-1),r=Math.max(0,Math.min(n,t)),s=Math.max(r,Math.min(e,t));return{start:r,end:s}}function wn(n,e){if(te.length===0)return;const t=e0(n,e);Pe=t.start,ve=t.end,Ur(),Aa(Em())}function t0(n,e){const t=e.getBoundingClientRect();if(t.width<=0||te.length===0)return 0;const r=Math.max(0,Math.min(1,(n-t.left)/t.width));return Math.round(r*(te.length-1))}function ed(n,e){if(te.length===0)return;const t=n.target;if(t.closest("input.prices-range-slider")||t.closest(".prices-range-selection"))return;const r=e==="main"?document.getElementById("pricesRangeSliderShell"):document.getElementById("pricesRangeNavigatorShell");if(!r)return;const s=t0(n.clientX,r),i=Math.max(0,ve-Pe),a=Math.floor(i/2),c=s-a;wn(c,c+i)}function td(n,e){if(te.length===0)return;const r=n.target.closest(".prices-range-selection");r&&(ci=!0,li=e,ym=n.clientX,wa=Pe,_m=ve,r.setPointerCapture(n.pointerId),n.preventDefault())}function n0(n){if(!ci||!li||te.length===0)return;const e=li==="main"?document.getElementById("pricesRangeSliderShell"):document.getElementById("pricesRangeNavigatorShell");if(!e)return;const t=e.getBoundingClientRect();if(t.width<=0)return;const r=(n.clientX-ym)/t.width,s=te.length-1,i=Math.round(r*s),a=_m-wa;let c=wa+i;c=Math.max(0,Math.min(c,s-a));const u=Math.min(s,c+a);wn(c,u)}function nd(n){if(ci){if(n){const e=n.target;try{e==null||e.releasePointerCapture(n.pointerId)}catch{}}ci=!1,li=null}}function Gc(n,e){if(te=[...n].sort((t,r)=>t.timestamp-r.timestamp),te.length===0){Pe=0,ve=0,Ur(),Aa([]);return}e?(Pe=ZT(te),ve=te.length-1):(ve=Math.min(ve,te.length-1),Pe=Math.min(Pe,ve)),Ur(),Aa(Em())}async function r0(n){if(!ai)return;const e=`${xt}:${n}`;if(va.has(e))return;const t=++Hs;try{const r=await Y.getPriceHistory({baseId:n,leagueId:xt,maxDays:90});if(t!==Hs)return;if(Mi.set(e,r??[]),va.add(e),xe===n){Gc(r??[],!0);const s=Pt.find(i=>i.baseId===n);s&&zc(n,s.price,r??[])}}catch(r){if(t!==Hs)return;console.error("Failed to fetch item detail history:",r)}}function Aa(n){const e=document.getElementById("pricesDetailChart"),t=document.getElementById("pricesDetailEmpty");if(!e||!t)return;const r=XT();if(n.length===0){if(Fe){const d=document.getElementById("pricesDetailChartTooltip");d&&d.remove(),Fe.destroy(),Fe=null}Bo="",t.textContent="No history yet for this item.",t.style.display="flex";return}t.style.display="none";const s=[...n].sort((d,f)=>d.timestamp-f.timestamp),i=s.map(d=>`${d.timestamp}:${d.price}`).join("|");if(Fe&&i===Bo)return;Bo=i;const a=s.map(d=>d.timestamp),c=s.map(d=>d.price),u=s.length>120?0:3;if(Fe){Fe.data.labels=a;const d=Fe.data.datasets[0];d.data=c,d.borderColor=r.primary,d.backgroundColor=Zh(r.primary,.1),d.pointRadius=u,d.pointHoverRadius=u===0?3:4,d.pointBackgroundColor=r.primary,Fe.update("none");return}Fe=new Chart(e.getContext("2d"),{type:"line",data:{labels:a,datasets:[{label:"Price (FE)",data:c,borderColor:r.primary,backgroundColor:Zh(r.primary,.1),fill:!0,tension:.25,pointRadius:u,pointHoverRadius:u===0?3:4,pointBackgroundColor:r.primary,pointBorderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{enabled:!1,external:zT,backgroundColor:r.bgShade,borderColor:r.border,borderWidth:1,titleColor:r.text,bodyColor:r.text,displayColors:!1}},scales:{x:{ticks:{color:r.text,maxRotation:0,autoSkip:!0,maxTicksLimit:10,callback:function(d){if(arguments[1]%3!==0)return"";const m=typeof d=="number"?d:Number(d),g=this.getLabelForValue(m),E=Number(g);if(!Number.isFinite(E))return"";const C=new Date(E);return C.getDate()===1?C.toLocaleDateString(void 0,{month:"short"}):String(C.getDate())}},border:{color:r.border},grid:{display:!0,color:"rgba(126, 126, 126, 0.25)",drawTicks:!1}},y:{ticks:{color:r.text},border:{color:r.border},grid:{display:!0,color:"rgba(126, 126, 126, 0.25)",drawTicks:!1},beginAtZero:!1}}}})}async function rd(n){const e=Pt.find(c=>c.baseId===n);if(!e)return;xe=n,kn+=1;const t=kn;Fr(!0);const r=document.getElementById("pricesDetailName"),s=document.getElementById("pricesDetailIcon");r&&(r.textContent=e.name,r.dataset.tlidbUrl=WT(e.name),r.disabled=!1),s&&(s.src=hi(e.baseId),s.alt=e.name,s.style.display="block",s.onerror=()=>{s.style.display="none"});const i=`${xt}:${n}`,a=Im(n);Mi.set(i,a),zc(n,e.price,a),!(t!==kn||xe!==n)&&(Gc(a,!0),ai&&r0(n))}function Wc(n){const e=Jt[n.baseId];if(e&&e.length>0){const t=Mr.get(n.baseId);if(t)return t;const r=e.map(s=>({date:s.date,price:s.price,timestamp:s.timestamp}));return Mr.set(n.baseId,r),r}return n.history}function sd(n){if(n.price<=0)return 0;const e=Wc(n);return Or(e).percent}function s0(n){const e=++Jh;let t=0;const r=()=>{if(e!==Jh)return;const s=Math.min(t+FT,n.length);for(;t<s;t+=1){const i=n[t],a=document.getElementById(`sparkline-${i.item.baseId}`);if(!a)continue;const c=BT(i.history,i.item.price);UT(a,c,i.trendData.trend)}t<n.length&&requestAnimationFrame(r)};requestAnimationFrame(r)}async function $o(){try{const[n,e]=await Promise.all([Y.getItemDatabase(),Y.getCloudSyncStatus()]);Fo=n,ai=!!(e!=null&&e.enabled);let t=[];if(ai){Jt=await Y.getPriceHistoryBatch({leagueId:xt,maxDays:7,maxSnapshotDocs:160})??{},Mr.clear(),Ia=Date.now(),Ea=xt,Uo={};const s=[];Object.entries(Fo).forEach(([i,a])=>{if(i===Xt||a.tradable===!1)return;const c=a.name||`Unknown Item (${i})`,d=[...Jt[i]??[]].sort((P,N)=>P.timestamp-N.timestamp),f=d.length>0?d[d.length-1]:null,m=d.map(P=>({date:P.date,price:P.price,timestamp:P.timestamp})),g=(f==null?void 0:f.price)??0,E=(f==null?void 0:f.timestamp)??0,C=f==null?void 0:f.listingCount,R=g>0?Or(m):{trend:"neutral",percent:0};s.push({baseId:i,name:c,price:g,timestamp:E,listingCount:C,trend:R.trend,trendPercent:R.percent,group:a.group,history:m})}),t=s.sort((i,a)=>i.name.localeCompare(a.name))}else{Uo=await Y.getPriceCache(),Jt={},Mr.clear(),Ia=0,Ea="";const s=[];Object.entries(Fo).forEach(([i,a])=>{if(i===Xt||a.tradable===!1)return;const c=a.name||`Unknown Item (${i})`,u=Uo[i],d=(u==null?void 0:u.price)??0,f=(u==null?void 0:u.timestamp)??0,m=u==null?void 0:u.listingCount,g=u==null?void 0:u.history,E=d>0?Or(g):{trend:"neutral",percent:0};s.push({baseId:i,name:c,price:d,timestamp:f,listingCount:m,trend:E.trend,trendPercent:E.percent,group:a.group,history:g})}),t=s.sort((i,a)=>i.name.localeCompare(a.name))}if(Pt=t,xe&&!Pt.some(r=>r.baseId===xe)&&(xe=null,kn+=1,Fr(!1),Fe)){const r=document.getElementById("pricesDetailChartTooltip");r&&r.remove(),Fe.destroy(),Fe=null}if(Kc(),Oi(),xe){const r=Im(xe);Gc(r,!1);const s=Pt.find(i=>i.baseId===xe);s&&zc(xe,s.price,r)}}catch(n){console.error("Failed to load prices:",n)}}function Kc(){let n=[...Pt];if(_a){const e=_a.toLowerCase();n=n.filter(t=>t.name.toLowerCase().includes(e)||t.baseId.toLowerCase().includes(e))}else ya!=="all"&&(n=n.filter(e=>e.group===ya));gm=n}function id(n){_a=n.trim(),Kc(),Oi()}function i0(n){ya=n,qc&&(kn+=1,Fr(!1)),document.querySelectorAll(".prices-sidebar-item").forEach(e=>{e.classList.remove("active"),e.getAttribute("data-group")===n&&e.classList.add("active")}),Kc(),Oi()}function o0(n){oi===n?En=En==="asc"?"desc":"asc":(oi=n,En="asc"),document.querySelectorAll(".prices-table th").forEach(e=>{e.classList.remove("sort-asc","sort-desc"),e.getAttribute("data-sort")===n&&e.classList.add(`sort-${En}`)}),Oi()}function a0(){const n=document.getElementById("pricesSearchInput"),e=document.getElementById("pricesClearSearch"),t=document.querySelectorAll(".prices-table th[data-sort]"),r=document.getElementById("pricesTableBody"),s=document.getElementById("pricesSeasonSelect"),i=document.getElementById("pricesDetailBackBtn"),a=document.getElementById("pricesDetailName"),c=document.getElementById("pricesRangeSliderShell"),u=document.getElementById("pricesRangeNavigatorShell"),d=document.getElementById("pricesRangeMainSelection"),f=document.getElementById("pricesRangeNavigatorSelection"),m=document.getElementById("pricesRangeStart"),g=document.getElementById("pricesRangeEnd"),E=document.getElementById("pricesRangeNavigatorStart"),C=document.getElementById("pricesRangeNavigatorEnd");n&&n.addEventListener("input",N=>{const O=N.target.value;id(O),e&&(e.style.display=O?"block":"none")}),e&&e.addEventListener("click",()=>{n&&(n.value="",id(""),e.style.display="none")}),t.forEach(N=>{N.addEventListener("click",()=>{const O=N.getAttribute("data-sort");O&&o0(O)})}),r&&r.addEventListener("click",N=>{const B=N.target.closest("tr[data-base-id]"),z=B==null?void 0:B.getAttribute("data-base-id");z&&rd(z)}),s&&(xt=s.value,s.addEventListener("change",()=>{xt=s.value,Mi.clear(),va.clear(),te=[],Pe=0,ve=0,Ur(),Hs+=1,Jt={},Mr.clear(),Ia=0,Ea="",$o(),qc&&xe&&rd(xe)})),i&&i.addEventListener("click",()=>{kn+=1,Fr(!1)}),a&&a.addEventListener("click",()=>{const N=a.dataset.tlidbUrl;N&&Y.openExternal(N)}),m&&(m.addEventListener("pointerdown",()=>Ze("start")),m.addEventListener("focus",()=>Ze("start")),m.addEventListener("input",()=>{if(te.length===0)return;const N=Number(m.value);Number.isFinite(N)&&wn(N,ve)})),g&&(g.addEventListener("pointerdown",()=>Ze("end")),g.addEventListener("focus",()=>Ze("end")),g.addEventListener("input",()=>{if(te.length===0)return;const N=Number(g.value);Number.isFinite(N)&&wn(Pe,N)})),E&&(E.addEventListener("pointerdown",()=>Ze("start")),E.addEventListener("focus",()=>Ze("start")),E.addEventListener("input",()=>{if(te.length===0)return;const N=Number(E.value);Number.isFinite(N)&&wn(N,ve)})),C&&(C.addEventListener("pointerdown",()=>Ze("end")),C.addEventListener("focus",()=>Ze("end")),C.addEventListener("input",()=>{if(te.length===0)return;const N=Number(C.value);Number.isFinite(N)&&wn(Pe,N)})),c&&c.addEventListener("pointerdown",N=>ed(N,"main")),u&&u.addEventListener("pointerdown",N=>ed(N,"nav")),d&&d.addEventListener("pointerdown",N=>td(N,"main")),f&&f.addEventListener("pointerdown",N=>td(N,"nav")),document.addEventListener("pointermove",n0),document.addEventListener("pointerup",N=>nd(N)),document.addEventListener("pointercancel",N=>nd(N)),document.querySelectorAll(".prices-sidebar-item").forEach(N=>{N.addEventListener("click",()=>{const O=N.getAttribute("data-group");O&&i0(O)})});const P=document.getElementById("page-prices");P&&new MutationObserver(O=>{O.forEach(B=>{B.type==="attributes"&&B.attributeName==="class"&&P.classList.contains("active")&&$o()})}).observe(P,{attributes:!0}),Ze("end"),Ur(),Fr(!1),Y.onInventoryUpdate(()=>{const N=document.getElementById("page-prices");N!=null&&N.classList.contains("active")&&$o()})}function wm(n){Tr(),Lt()&&!Zp()&&Ar(),et(Ve)}async function od(){const[n,e]=await Promise.all([Y.getInventory(),Y.getItemDatabase()]);jw(e);const t=n.map(r=>r.baseId===Xt?{...r,price:1}:r);Hw(t),tT()||(aT(),nT(!0)),Lt()&&!Zp()&&fT(),Uc(),Ve(),wm(),et(Ve)}async function c0(){document.body.classList.add("layout-style-1"),LT(),IT(),TT(),ET(),bT(Ve,()=>et(Ve)),DT(),NT();const n=VT();RT(Ve,()=>et(Ve),wm,n),oT(Uh,Bh,Pn,wT),lT(Uh,Bh,$h,Bc,$c,Hc,jc,ST,Ve,()=>et(Ve)),xT(Ve,()=>et(Ve),Tr,Ar),MT(hT,yT,mT,gT,cT,Tr,Ar,Ve,()=>et(Ve),ii,CT),OT(),a0(),Y.onTimerTick(r=>{if(r.type==="realtime")kc(r.seconds),Be()==="realtime"&&(Pn.textContent=Bn(r.seconds)),Tr();else if(r.type==="hourly"){Jp(r.seconds),$h.textContent=Bn(r.seconds);const s=Li();if(Be()==="hourly"){const i=Yr();i.push({time:Date.now(),value:s}),xr(i),ii()}Ar(),Ve(),et(Ve),r.seconds%3600===0&&r.seconds>0&&pT()}}),Y.onInventoryUpdate(()=>{od()});const[e,t]=await Promise.all([Y.getSettings(),Y.isLogPathConfigured()]);pa(e.includeTax!==void 0?e.includeTax:!1),t?(await od(),await Ch()):await Ch(),um()}async function ad(){await Ep(),await c0()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ad):ad();
