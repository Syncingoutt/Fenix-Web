(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();const _g=72*60*60*1e3,vg=7*24*60*60*1e3,Ig=.125,tn="100300",Eg=7200;class wg{constructor(e,t={}){this.itemDatabase=e,this.inventory=new Map,this.priceCache=new Map;for(const[r,s]of Object.entries(t))this.priceCache.set(r,s)}buildInventory(e){const t=new Map;for(const r of e)t.set(r.fullId,r);this.inventory.clear();for(const r of t.values()){const s=this.itemDatabase[r.baseId];if(!s||s.tradable===!1)continue;const i=s.name;if(this.inventory.has(r.baseId)){const a=this.inventory.get(r.baseId);a.totalQuantity+=r.bagNum,a.instances+=1,r.timestamp>a.lastUpdated&&(a.lastUpdated=r.timestamp)}else{const a=this.priceCache.get(r.baseId),c=a?a.price:null,u=a?a.timestamp:null;this.inventory.set(r.baseId,{itemName:i,totalQuantity:r.bagNum,baseId:r.baseId,price:c,priceTimestamp:u,instances:1,lastUpdated:r.timestamp,pageId:r.pageId,slotId:r.slotId})}}return this.inventory}hydrateInventory(e){this.inventory.clear();for(const t of e)this.inventory.set(t.baseId,{...t})}updatePrice(e,t,r,s=Date.now()){const i=Math.floor(s/216e5)*216e5,a=new Date(i).toISOString().slice(0,13)+":00:00";let c=[];const u=this.priceCache.get(e);u!=null&&u.history&&Array.isArray(u.history)&&(c=[...u.history]);const h=c.findIndex(m=>m.date===a);h>=0?c[h]={date:a,price:t}:c.push({date:a,price:t}),c.sort((m,g)=>m.date.localeCompare(g.date)),c.length>28&&(c=c.slice(c.length-28));const f={price:t,timestamp:s,...r!==void 0&&{listingCount:r},...c.length>0&&{history:c}};if(this.priceCache.set(e,f),this.inventory.has(e)){const m=this.inventory.get(e);m.price=t,m.priceTimestamp=s}}applyPriceCache(e){for(const[t,r]of Object.entries(e))if(this.priceCache.set(t,r),this.inventory.has(t)){const s=this.inventory.get(t);s.price=r.price,s.priceTimestamp=r.timestamp}}getInventory(){return Array.from(this.inventory.values()).filter(e=>{const t=this.itemDatabase[e.baseId];return t!=null&&t.tradable!==!1}).sort((e,t)=>{const r=e.itemName.localeCompare(t.itemName);return r!==0?r:e.baseId.localeCompare(t.baseId)})}getInventoryMap(){return this.inventory}getPriceCacheAsObject(){const e={};return this.priceCache.forEach((t,r)=>{e[r]=t}),e}}const Tg="fenix_price_history",Ag=1,xn="priceHistory";function xa(){return typeof indexedDB<"u"}function Ad(){return new Promise((n,e)=>{if(!xa()){e(new Error("IndexedDB not available"));return}const t=indexedDB.open(Tg,Ag);t.onupgradeneeded=()=>{const r=t.result;r.objectStoreNames.contains(xn)||r.createObjectStore(xn,{keyPath:"baseId"})},t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error)})}function bg(n){return new Promise((e,t)=>{n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function bd(){try{if(!xa())return{};const n=await Ad(),t=n.transaction(xn,"readonly").objectStore(xn),r=await bg(t.getAll());n.close();const s={};for(const i of r)i!=null&&i.baseId&&Array.isArray(i.history)&&(s[i.baseId]=i.history);return s}catch(n){return console.error("Failed to load price history from IndexedDB:",n),{}}}async function Sg(n){try{if(!xa())return;const e=await Ad(),t=e.transaction(xn,"readwrite"),r=t.objectStore(xn),s=Date.now();Object.entries(n).forEach(([i,a])=>{r.put({baseId:i,history:a,updatedAt:s})}),await new Promise((i,a)=>{t.oncomplete=()=>i(),t.onerror=()=>a(t.error),t.onabort=()=>a(t.error)}),e.close()}catch(e){console.error("Failed to save price history to IndexedDB:",e)}}function Cg(n,e,t){const r=Array.isArray(n)?[...n]:[],s=Math.floor(t/(6*60*60*1e3))*(6*60*60*1e3),i=new Date(s).toISOString().slice(0,13)+":00:00",a=r.findIndex(c=>c.date===i);return a>=0?r[a]={date:i,price:e}:r.push({date:i,price:e}),r.sort((c,u)=>c.date.localeCompare(u.date)),r.length>28?r.slice(r.length-28):r}async function iu(n){const e=await bd(),t={},r={};for(const[s,i]of Object.entries(n)){const a=Cg(e[s],i.price,i.timestamp);t[s]=a,r[s]={...i,history:a}}return Object.keys(t).length>0&&await Sg(t),r}function Rg(n,e){const t={...n};for(const[r,s]of Object.entries(e)){const i=n[r],a=s.listingCount??0,c=(i==null?void 0:i.listingCount)??0;let u="use-cloud";i&&(s.timestamp>i.timestamp?u="use-cloud":s.timestamp<i.timestamp?u="keep-local":a>c?u="use-cloud":u="keep-local"),u==="use-cloud"&&(t[r]={...s,...(i==null?void 0:i.history)&&{history:i.history}})}return t}const Sd="fenix_price_cache";async function Cd(){try{let e=await fetch("./item_database.json");if(!e.ok)throw new Error(`Failed to load item database: ${e.statusText}`);return await e.json()}catch(n){return console.error("Failed to load item database:",n),{}}}async function Rd(n){try{const e=localStorage.getItem(Sd);let t={};if(e){const s=JSON.parse(e),i={};let a=!1;for(const[c,u]of Object.entries(s))typeof u=="number"?(i[c]={price:u,timestamp:Date.now()},a=!0):i[c]=u;a&&console.log("Migrated price cache to new format with timestamps"),t=i}const r=await bd();if(Object.keys(r).length>0)for(const[s,i]of Object.entries(r))t[s]&&(t[s]={...t[s],history:i});if(!n)return t;try{const s=Object.keys(t).length===0,i=await n({forceFull:s}),a=Rg(t,i);return Object.keys(i).length>0&&await Ir(a),a}catch(s){return console.error("Failed to load cloud price cache:",s),t}}catch(e){return console.error("Failed to load price cache:",e),{}}}async function Ir(n){try{localStorage.setItem(Sd,JSON.stringify(n))}catch(e){console.error("Failed to save price cache:",e)}}const Pd="fenix_config";function kd(){try{const n=localStorage.getItem(Pd);if(n)return JSON.parse(n)}catch(n){console.warn("Failed to read config from localStorage:",n)}return{}}function Pg(n){try{localStorage.setItem(Pd,JSON.stringify(n))}catch(e){throw console.error("Failed to save config to localStorage:",e),e}}function kg(){return kd().settings||{}}function Dg(n){const e=kd();e.settings={...e.settings,...n},Pg(e)}function Ng(n){return n.split("_")[0]}function Ma(n){return n!==null&&n>=100}function ou(n){if(!n.includes("BagMgr@:InitBagData"))return null;const e=n.match(/PageId\s*=\s*(\d+)/),t=e?parseInt(e[1]):null;if(!Ma(t))return null;const r=n.match(/SlotId\s*=\s*(\d+)/),s=r?parseInt(r[1]):null,i=n.match(/ConfigBaseId\s*=\s*(\d+)/);if(!i)return null;const a=i[1],c=n.match(/Num\s*=\s*(\d+)/);if(!c)return null;const u=parseInt(c[1]),h=n.match(/\[([\d\.\-:]+)\]/),f=h?h[1]:"unknown",m=`${a}_init_${t}_${s}_${f}`;return{timestamp:f,action:"Add",fullId:m,baseId:a,bagNum:u,slotId:s,pageId:t}}function au(n){const e=n.match(/Id=([^\s]+)/);if(!e)return null;const t=e[1],r=Ng(t);let s="Unknown";n.includes("ItemChange@ Add")?s="Add":n.includes("ItemChange@ Update")?s="Update":n.includes("ItemChange@ Remove")?s="Remove":n.includes("ItemChange@ Delete")&&(s="Delete");const i=n.match(/BagNum=(\d+)/);let a=0;if(i)a=parseInt(i[1]);else if(s!=="Delete")return null;const c=n.match(/in\s+PageId\s*=\s*(\d+)/)||n.match(/PageId\s*=\s*(\d+)/),u=c?parseInt(c[1]):null;if(!Ma(u))return null;const h=n.match(/\[([\d\.\-:]+)\]/),f=h?h[1]:"unknown",m=n.match(/SlotId\s*=\s*(\d+)/),g=m?parseInt(m[1]):null;return{timestamp:f,action:s,fullId:t,baseId:r,bagNum:a,slotId:g,pageId:u}}function Vg(n){const e=n.split(`
`);let t=-1,r=-1;for(let u=e.length-1;u>=0;u--){const h=e[u];if(h.includes("ItemChange@ ProtoName=ResetItemsLayout end")&&r===-1&&(r=u),h.includes("ItemChange@ ProtoName=ResetItemsLayout start")&&t===-1&&r!==-1){t=u;break}}if(t!==-1&&r!==-1){const u=[],h=Math.min(r+500,e.length),f=new Set;for(let m=r;m<h;m++){const g=e[m];if(g.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const E=ou(g);if(E){const S=u.findIndex(R=>R.pageId===E.pageId&&R.slotId===E.slotId&&R.slotId!==null&&E.slotId!==null);S>=0?u[S]=E:u.push(E),E.pageId!==null&&f.add(E.pageId)}}for(let m=h;m<e.length;m++){const g=e[m];if(g.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;const E=ou(g);if(E){const S=u.findIndex(R=>R.pageId===E.pageId&&R.slotId===E.slotId&&R.slotId!==null&&E.slotId!==null);S>=0?u[S]=E:u.push(E),E.pageId!==null&&f.add(E.pageId)}if(f.size>=2){let S=!1;for(let R=m+1;R<Math.min(m+50,e.length);R++){if(e[R].includes("BagMgr@:InitBagData")){S=!0;break}if(e[R].includes("ItemChange@ ProtoName=ResetItemsLayout start"))break}if(!S)break}}for(let m=r;m<e.length;m++){const g=e[m];if(g.includes("ItemChange@ ProtoName=ResetItemsLayout start"))break;if(g.includes("ItemChange@")&&g.includes("Id=")){const E=au(g);if(E){const S=u.findIndex(R=>R.fullId===E.fullId);if(S>=0)u[S]=E;else if(E.slotId!==null){const R=u.findIndex(P=>P.baseId===E.baseId&&P.pageId===E.pageId&&P.slotId===E.slotId&&P.slotId!==null);R>=0?u[R]=E:u.push(E)}else u.push(E)}}}if(u.length>0)return u}const s=new Map;for(let u=e.length-1;u>=0;u--){const f=e[u].match(/ItemChange@\s+Reset\s+PageId=(\d+)/);if(!f)continue;const m=parseInt(f[1]);Ma(m)&&(s.has(m)||s.set(m,u))}let i=1/0;s.forEach(u=>{u<i&&(i=u)});const a=i===1/0?e:e.slice(i),c=[];for(const u of a)if(u.includes("ItemChange@")&&u.includes("Id=")){const h=au(u);h&&c.push(h)}return c}var cu={};/**
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
 */const Dd=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Lg=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},Nd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,c=a?n[s+1]:0,u=s+2<n.length,h=u?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let g=(c&15)<<2|h>>6,E=h&63;u||(E=64,a||(g=64)),r.push(t[f],t[m],t[g],t[E])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Dd(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Lg(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new xg;const g=i<<2|c>>4;if(r.push(g),h!==64){const E=c<<4&240|h>>2;if(r.push(E),m!==64){const S=h<<6&192|m;r.push(S)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class xg extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Mg=function(n){const e=Dd(n);return Nd.encodeByteArray(e,!0)},Ys=function(n){return Mg(n).replace(/\./g,"")},Vd=function(n){try{return Nd.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Og(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Fg=()=>Og().__FIREBASE_DEFAULTS__,Bg=()=>{if(typeof process>"u"||typeof cu>"u")return;const n=cu.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Ug=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Vd(n[1]);return e&&JSON.parse(e)},_i=()=>{try{return Fg()||Bg()||Ug()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Ld=n=>{var e,t;return(t=(e=_i())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},$g=n=>{const e=Ld(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},xd=()=>{var n;return(n=_i())===null||n===void 0?void 0:n.config},Md=n=>{var e;return(e=_i())===null||e===void 0?void 0:e[`_${n}`]};/**
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
 */class Hg{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function jg(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Ys(JSON.stringify(t)),Ys(JSON.stringify(a)),""].join(".")}/**
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
 */function Ve(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function qg(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ve())}function zg(){var n;const e=(n=_i())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Gg(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Wg(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Kg(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Qg(){const n=Ve();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Yg(){return!zg()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Jg(){try{return typeof indexedDB=="object"}catch{return!1}}function Xg(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const Zg="FirebaseError";class ht extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Zg,Object.setPrototypeOf(this,ht.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Gr.prototype.create)}}class Gr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?ey(i,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new ht(s,c,r)}}function ey(n,e){return n.replace(ty,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const ty=/\{\$([^}]+)}/g;function ny(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Js(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(lu(i)&&lu(a)){if(!Js(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function lu(n){return n!==null&&typeof n=="object"}/**
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
 */function Wr(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function ry(n,e){const t=new sy(n,e);return t.subscribe.bind(t)}class sy{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");iy(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=go),s.error===void 0&&(s.error=go),s.complete===void 0&&(s.complete=go);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function iy(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function go(){}/**
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
 */function He(n){return n&&n._delegate?n._delegate:n}class nn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Qt="[DEFAULT]";/**
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
 */class oy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Hg;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(cy(e))try{this.getOrInitializeService({instanceIdentifier:Qt})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Qt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Qt){return this.instances.has(e)}getOptions(e=Qt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&a.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ay(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Qt){return this.component?this.component.multipleInstances?e:Qt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ay(n){return n===Qt?void 0:n}function cy(n){return n.instantiationMode==="EAGER"}/**
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
 */class ly{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new oy(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var j;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(j||(j={}));const uy={debug:j.DEBUG,verbose:j.VERBOSE,info:j.INFO,warn:j.WARN,error:j.ERROR,silent:j.SILENT},hy=j.INFO,dy={[j.DEBUG]:"log",[j.VERBOSE]:"log",[j.INFO]:"info",[j.WARN]:"warn",[j.ERROR]:"error"},fy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=dy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Oa{constructor(e){this.name=e,this._logLevel=hy,this._logHandler=fy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in j))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?uy[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,j.DEBUG,...e),this._logHandler(this,j.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,j.VERBOSE,...e),this._logHandler(this,j.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,j.INFO,...e),this._logHandler(this,j.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,j.WARN,...e),this._logHandler(this,j.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,j.ERROR,...e),this._logHandler(this,j.ERROR,...e)}}const py=(n,e)=>e.some(t=>n instanceof t);let uu,hu;function my(){return uu||(uu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function gy(){return hu||(hu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Od=new WeakMap,Jo=new WeakMap,Fd=new WeakMap,yo=new WeakMap,Fa=new WeakMap;function yy(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t(bt(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Od.set(t,n)}).catch(()=>{}),Fa.set(e,n),e}function _y(n){if(Jo.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});Jo.set(n,e)}let Xo={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Jo.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Fd.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return bt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function vy(n){Xo=n(Xo)}function Iy(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(_o(this),e,...t);return Fd.set(r,e.sort?e.sort():[e]),bt(r)}:gy().includes(n)?function(...e){return n.apply(_o(this),e),bt(Od.get(this))}:function(...e){return bt(n.apply(_o(this),e))}}function Ey(n){return typeof n=="function"?Iy(n):(n instanceof IDBTransaction&&_y(n),py(n,my())?new Proxy(n,Xo):n)}function bt(n){if(n instanceof IDBRequest)return yy(n);if(yo.has(n))return yo.get(n);const e=Ey(n);return e!==n&&(yo.set(n,e),Fa.set(e,n)),e}const _o=n=>Fa.get(n);function wy(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(n,e),c=bt(a);return r&&a.addEventListener("upgradeneeded",u=>{r(bt(a.result),u.oldVersion,u.newVersion,bt(a.transaction),u)}),t&&a.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const Ty=["get","getKey","getAll","getAllKeys","count"],Ay=["put","add","delete","clear"],vo=new Map;function du(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(vo.get(e))return vo.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=Ay.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Ty.includes(t)))return;const i=async function(a,...c){const u=this.transaction(a,s?"readwrite":"readonly");let h=u.store;return r&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),s&&u.done]))[0]};return vo.set(e,i),i}vy(n=>({...n,get:(e,t,r)=>du(e,t)||n.get(e,t,r),has:(e,t)=>!!du(e,t)||n.has(e,t)}));/**
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
 */class by{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Sy(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Sy(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Zo="@firebase/app",fu="0.10.13";/**
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
 */const at=new Oa("@firebase/app"),Cy="@firebase/app-compat",Ry="@firebase/analytics-compat",Py="@firebase/analytics",ky="@firebase/app-check-compat",Dy="@firebase/app-check",Ny="@firebase/auth",Vy="@firebase/auth-compat",Ly="@firebase/database",xy="@firebase/data-connect",My="@firebase/database-compat",Oy="@firebase/functions",Fy="@firebase/functions-compat",By="@firebase/installations",Uy="@firebase/installations-compat",$y="@firebase/messaging",Hy="@firebase/messaging-compat",jy="@firebase/performance",qy="@firebase/performance-compat",zy="@firebase/remote-config",Gy="@firebase/remote-config-compat",Wy="@firebase/storage",Ky="@firebase/storage-compat",Qy="@firebase/firestore",Yy="@firebase/vertexai-preview",Jy="@firebase/firestore-compat",Xy="firebase",Zy="10.14.1";/**
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
 */const ea="[DEFAULT]",e_={[Zo]:"fire-core",[Cy]:"fire-core-compat",[Py]:"fire-analytics",[Ry]:"fire-analytics-compat",[Dy]:"fire-app-check",[ky]:"fire-app-check-compat",[Ny]:"fire-auth",[Vy]:"fire-auth-compat",[Ly]:"fire-rtdb",[xy]:"fire-data-connect",[My]:"fire-rtdb-compat",[Oy]:"fire-fn",[Fy]:"fire-fn-compat",[By]:"fire-iid",[Uy]:"fire-iid-compat",[$y]:"fire-fcm",[Hy]:"fire-fcm-compat",[jy]:"fire-perf",[qy]:"fire-perf-compat",[zy]:"fire-rc",[Gy]:"fire-rc-compat",[Wy]:"fire-gcs",[Ky]:"fire-gcs-compat",[Qy]:"fire-fst",[Jy]:"fire-fst-compat",[Yy]:"fire-vertex","fire-js":"fire-js",[Xy]:"fire-js-all"};/**
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
 */const Xs=new Map,t_=new Map,ta=new Map;function pu(n,e){try{n.container.addComponent(e)}catch(t){at.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Mn(n){const e=n.name;if(ta.has(e))return at.debug(`There were multiple attempts to register component ${e}.`),!1;ta.set(e,n);for(const t of Xs.values())pu(t,n);for(const t of t_.values())pu(t,n);return!0}function Ba(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function rt(n){return n.settings!==void 0}/**
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
 */const n_={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},St=new Gr("app","Firebase",n_);/**
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
 */class r_{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new nn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw St.create("app-deleted",{appName:this._name})}}/**
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
 */const zn=Zy;function Bd(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ea,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw St.create("bad-app-name",{appName:String(s)});if(t||(t=xd()),!t)throw St.create("no-options");const i=Xs.get(s);if(i){if(Js(t,i.options)&&Js(r,i.config))return i;throw St.create("duplicate-app",{appName:s})}const a=new ly(s);for(const u of ta.values())a.addComponent(u);const c=new r_(t,r,a);return Xs.set(s,c),c}function Ud(n=ea){const e=Xs.get(n);if(!e&&n===ea&&xd())return Bd();if(!e)throw St.create("no-app",{appName:n});return e}function Ct(n,e,t){var r;let s=(r=e_[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const c=[`Unable to register library "${s}" with version "${e}":`];i&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),at.warn(c.join(" "));return}Mn(new nn(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const s_="firebase-heartbeat-database",i_=1,Dr="firebase-heartbeat-store";let Io=null;function $d(){return Io||(Io=wy(s_,i_,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Dr)}catch(t){console.warn(t)}}}}).catch(n=>{throw St.create("idb-open",{originalErrorMessage:n.message})})),Io}async function o_(n){try{const t=(await $d()).transaction(Dr),r=await t.objectStore(Dr).get(Hd(n));return await t.done,r}catch(e){if(e instanceof ht)at.warn(e.message);else{const t=St.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});at.warn(t.message)}}}async function mu(n,e){try{const r=(await $d()).transaction(Dr,"readwrite");await r.objectStore(Dr).put(e,Hd(n)),await r.done}catch(t){if(t instanceof ht)at.warn(t.message);else{const r=St.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});at.warn(r.message)}}}function Hd(n){return`${n.name}!${n.options.appId}`}/**
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
 */const a_=1024,c_=30*24*60*60*1e3;class l_{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new h_(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=gu();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=c_}),this._storage.overwrite(this._heartbeatsCache))}catch(r){at.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=gu(),{heartbeatsToSend:r,unsentEntries:s}=u_(this._heartbeatsCache.heartbeats),i=Ys(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return at.warn(t),""}}}function gu(){return new Date().toISOString().substring(0,10)}function u_(n,e=a_){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),yu(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),yu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class h_{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Jg()?Xg().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await o_(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return mu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return mu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function yu(n){return Ys(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function d_(n){Mn(new nn("platform-logger",e=>new by(e),"PRIVATE")),Mn(new nn("heartbeat",e=>new l_(e),"PRIVATE")),Ct(Zo,fu,n),Ct(Zo,fu,"esm2017"),Ct("fire-js","")}d_("");var f_="firebase",p_="10.14.1";/**
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
 */Ct(f_,p_,"app");function Ua(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function jd(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const m_=jd,qd=new Gr("auth","Firebase",jd());/**
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
 */const Zs=new Oa("@firebase/auth");function g_(n,...e){Zs.logLevel<=j.WARN&&Zs.warn(`Auth (${zn}): ${n}`,...e)}function xs(n,...e){Zs.logLevel<=j.ERROR&&Zs.error(`Auth (${zn}): ${n}`,...e)}/**
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
 */function ct(n,...e){throw $a(n,...e)}function Ke(n,...e){return $a(n,...e)}function zd(n,e,t){const r=Object.assign(Object.assign({},m_()),{[e]:t});return new Gr("auth","Firebase",r).create(e,{appName:n.name})}function Rt(n){return zd(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function $a(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return qd.create(n,...e)}function B(n,e,...t){if(!n)throw $a(e,...t)}function st(n){const e="INTERNAL ASSERTION FAILED: "+n;throw xs(e),new Error(e)}function lt(n,e){n||st(e)}/**
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
 */function na(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function y_(){return _u()==="http:"||_u()==="https:"}function _u(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
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
 */function __(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(y_()||Wg()||"connection"in navigator)?navigator.onLine:!0}function v_(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class Kr{constructor(e,t){this.shortDelay=e,this.longDelay=t,lt(t>e,"Short delay should be less than long delay!"),this.isMobile=qg()||Kg()}get(){return __()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ha(n,e){lt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class Gd{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;st("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;st("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;st("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const I_={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const E_=new Kr(3e4,6e4);function vi(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Gn(n,e,t,r,s={}){return Wd(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const c=Wr(Object.assign({key:n.config.apiKey},a)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const h=Object.assign({method:e,headers:u},i);return Gg()||(h.referrerPolicy="no-referrer"),Gd.fetch()(Qd(n,n.config.apiHost,t,c),h)})}async function Wd(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},I_),e);try{const s=new w_(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw bs(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const c=i.ok?a.errorMessage:a.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw bs(n,"credential-already-in-use",a);if(u==="EMAIL_EXISTS")throw bs(n,"email-already-in-use",a);if(u==="USER_DISABLED")throw bs(n,"user-disabled",a);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw zd(n,f,h);ct(n,f)}}catch(s){if(s instanceof ht)throw s;ct(n,"network-request-failed",{message:String(s)})}}async function Kd(n,e,t,r,s={}){const i=await Gn(n,e,t,r,s);return"mfaPendingCredential"in i&&ct(n,"multi-factor-auth-required",{_serverResponse:i}),i}function Qd(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?Ha(n.config,s):`${n.config.apiScheme}://${s}`}class w_{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Ke(this.auth,"network-request-failed")),E_.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function bs(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Ke(n,e,r);return s.customData._tokenResponse=t,s}/**
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
 */async function T_(n,e){return Gn(n,"POST","/v1/accounts:delete",e)}async function Yd(n,e){return Gn(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Er(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function A_(n,e=!1){const t=He(n),r=await t.getIdToken(e),s=ja(r);B(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Er(Eo(s.auth_time)),issuedAtTime:Er(Eo(s.iat)),expirationTime:Er(Eo(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Eo(n){return Number(n)*1e3}function ja(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return xs("JWT malformed, contained fewer than 3 sections"),null;try{const s=Vd(t);return s?JSON.parse(s):(xs("Failed to decode base64 JWT payload"),null)}catch(s){return xs("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function vu(n){const e=ja(n);return B(e,"internal-error"),B(typeof e.exp<"u","internal-error"),B(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Nr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof ht&&b_(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function b_({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class S_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class ra{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Er(this.lastLoginAt),this.creationTime=Er(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ei(n){var e;const t=n.auth,r=await n.getIdToken(),s=await Nr(n,Yd(t,{idToken:r}));B(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Jd(i.providerUserInfo):[],c=R_(n.providerData,a),u=n.isAnonymous,h=!(n.email&&i.passwordHash)&&!(c!=null&&c.length),f=u?h:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:c,metadata:new ra(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function C_(n){const e=He(n);await ei(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function R_(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Jd(n){return n.map(e=>{var{providerId:t}=e,r=Ua(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function P_(n,e){const t=await Wd(n,{},async()=>{const r=Wr({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=Qd(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",Gd.fetch()(a,{method:"POST",headers:c,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function k_(n,e){return Gn(n,"POST","/v2/accounts:revokeToken",vi(n,e))}/**
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
 */class Cn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){B(e.idToken,"internal-error"),B(typeof e.idToken<"u","internal-error"),B(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):vu(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){B(e.length!==0,"internal-error");const t=vu(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(B(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await P_(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new Cn;return r&&(B(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(B(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(B(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Cn,this.toJSON())}_performRefresh(){return st("not implemented")}}/**
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
 */function yt(n,e){B(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class it{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=Ua(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new S_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new ra(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Nr(this,this.stsTokenManager.getToken(this.auth,e));return B(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return A_(this,e)}reload(){return C_(this)}_assign(e){this!==e&&(B(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new it(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){B(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await ei(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(rt(this.auth.app))return Promise.reject(Rt(this.auth));const e=await this.getIdToken();return await Nr(this,T_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,a,c,u,h,f;const m=(r=t.displayName)!==null&&r!==void 0?r:void 0,g=(s=t.email)!==null&&s!==void 0?s:void 0,E=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,S=(a=t.photoURL)!==null&&a!==void 0?a:void 0,R=(c=t.tenantId)!==null&&c!==void 0?c:void 0,P=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,F=(h=t.createdAt)!==null&&h!==void 0?h:void 0,H=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:V,emailVerified:O,isAnonymous:J,providerData:Q,stsTokenManager:T}=t;B(V&&T,e,"internal-error");const _=Cn.fromJSON(this.name,T);B(typeof V=="string",e,"internal-error"),yt(m,e.name),yt(g,e.name),B(typeof O=="boolean",e,"internal-error"),B(typeof J=="boolean",e,"internal-error"),yt(E,e.name),yt(S,e.name),yt(R,e.name),yt(P,e.name),yt(F,e.name),yt(H,e.name);const v=new it({uid:V,auth:e,email:g,emailVerified:O,displayName:m,isAnonymous:J,photoURL:S,phoneNumber:E,tenantId:R,stsTokenManager:_,createdAt:F,lastLoginAt:H});return Q&&Array.isArray(Q)&&(v.providerData=Q.map(w=>Object.assign({},w))),P&&(v._redirectEventId=P),v}static async _fromIdTokenResponse(e,t,r=!1){const s=new Cn;s.updateFromServerResponse(t);const i=new it({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await ei(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];B(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Jd(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Cn;c.updateFromIdToken(r);const u=new it({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new ra(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,h),u}}/**
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
 */const Iu=new Map;function ot(n){lt(n instanceof Function,"Expected a class definition");let e=Iu.get(n);return e?(lt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Iu.set(n,e),e)}/**
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
 */class Xd{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Xd.type="NONE";const Eu=Xd;/**
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
 */function Ms(n,e,t){return`firebase:${n}:${e}:${t}`}class Rn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Ms(this.userKey,s.apiKey,i),this.fullPersistenceKey=Ms("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?it._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Rn(ot(Eu),e,r);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||ot(Eu);const a=Ms(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(a);if(f){const m=it._fromJSON(e,f);h!==i&&(c=m),i=h;break}}catch{}const u=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new Rn(i,e,r):(i=u[0],c&&await i._set(a,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new Rn(i,e,r))}}/**
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
 */function wu(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(nf(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Zd(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(sf(e))return"Blackberry";if(of(e))return"Webos";if(ef(e))return"Safari";if((e.includes("chrome/")||tf(e))&&!e.includes("edge/"))return"Chrome";if(rf(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Zd(n=Ve()){return/firefox\//i.test(n)}function ef(n=Ve()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function tf(n=Ve()){return/crios\//i.test(n)}function nf(n=Ve()){return/iemobile/i.test(n)}function rf(n=Ve()){return/android/i.test(n)}function sf(n=Ve()){return/blackberry/i.test(n)}function of(n=Ve()){return/webos/i.test(n)}function qa(n=Ve()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function D_(n=Ve()){var e;return qa(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function N_(){return Qg()&&document.documentMode===10}function af(n=Ve()){return qa(n)||rf(n)||of(n)||sf(n)||/windows phone/i.test(n)||nf(n)}/**
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
 */function cf(n,e=[]){let t;switch(n){case"Browser":t=wu(Ve());break;case"Worker":t=`${wu(Ve())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${zn}/${r}`}/**
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
 */class V_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,c)=>{try{const u=e(i);a(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function L_(n,e={}){return Gn(n,"GET","/v2/passwordPolicy",vi(n,e))}/**
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
 */const x_=6;class M_{constructor(e){var t,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:x_,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,a,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(a=u.containsNumericCharacter)!==null&&a!==void 0?a:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class O_{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Tu(this),this.idTokenSubscription=new Tu(this),this.beforeStateQueue=new V_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=qd,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ot(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await Rn.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Yd(this,{idToken:e}),r=await it._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(rt(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!a||a===c)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return B(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ei(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=v_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(rt(this.app))return Promise.reject(Rt(this));const t=e?He(e):null;return t&&B(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&B(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return rt(this.app)?Promise.reject(Rt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return rt(this.app)?Promise.reject(Rt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ot(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await L_(this),t=new M_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Gr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await k_(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ot(e)||this._popupRedirectResolver;B(t,this,"argument-error"),this.redirectPersistenceManager=await Rn.create(this,[ot(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(B(c,this,"internal-error"),c.then(()=>{a||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{a=!0,u()}}else{const u=e.addObserver(t);return()=>{a=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return B(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=cf(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&g_(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Ii(n){return He(n)}class Tu{constructor(e){this.auth=e,this.observer=null,this.addObserver=ry(t=>this.observer=t)}get next(){return B(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let za={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function F_(n){za=n}function B_(n){return za.loadJS(n)}function U_(){return za.gapiScript}function $_(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function H_(n,e){const t=Ba(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Js(i,e??{}))return s;ct(s,"already-initialized")}return t.initialize({options:e})}function j_(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(ot);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function q_(n,e,t){const r=Ii(n);B(r._canInitEmulator,r,"emulator-config-failed"),B(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=lf(e),{host:a,port:c}=z_(e),u=c===null?"":`:${c}`;r.config.emulator={url:`${i}//${a}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),G_()}function lf(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function z_(n){const e=lf(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Au(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Au(a)}}}function Au(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function G_(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class uf{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return st("not implemented")}_getIdTokenResponse(e){return st("not implemented")}_linkToIdToken(e,t){return st("not implemented")}_getReauthenticationResolver(e){return st("not implemented")}}/**
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
 */async function Pn(n,e){return Kd(n,"POST","/v1/accounts:signInWithIdp",vi(n,e))}/**
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
 */const W_="http://localhost";class rn extends uf{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new rn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):ct("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=Ua(t,["providerId","signInMethod"]);if(!r||!s)return null;const a=new rn(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Pn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Pn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Pn(e,t)}buildRequest(){const e={requestUri:W_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Wr(t)}return e}}/**
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
 */class hf{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Qr extends hf{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class _t extends Qr{constructor(){super("facebook.com")}static credential(e){return rn._fromParams({providerId:_t.PROVIDER_ID,signInMethod:_t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return _t.credentialFromTaggedObject(e)}static credentialFromError(e){return _t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return _t.credential(e.oauthAccessToken)}catch{return null}}}_t.FACEBOOK_SIGN_IN_METHOD="facebook.com";_t.PROVIDER_ID="facebook.com";/**
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
 */class vt extends Qr{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return rn._fromParams({providerId:vt.PROVIDER_ID,signInMethod:vt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return vt.credentialFromTaggedObject(e)}static credentialFromError(e){return vt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return vt.credential(t,r)}catch{return null}}}vt.GOOGLE_SIGN_IN_METHOD="google.com";vt.PROVIDER_ID="google.com";/**
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
 */class It extends Qr{constructor(){super("github.com")}static credential(e){return rn._fromParams({providerId:It.PROVIDER_ID,signInMethod:It.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return It.credentialFromTaggedObject(e)}static credentialFromError(e){return It.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return It.credential(e.oauthAccessToken)}catch{return null}}}It.GITHUB_SIGN_IN_METHOD="github.com";It.PROVIDER_ID="github.com";/**
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
 */class Et extends Qr{constructor(){super("twitter.com")}static credential(e,t){return rn._fromParams({providerId:Et.PROVIDER_ID,signInMethod:Et.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Et.credentialFromTaggedObject(e)}static credentialFromError(e){return Et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Et.credential(t,r)}catch{return null}}}Et.TWITTER_SIGN_IN_METHOD="twitter.com";Et.PROVIDER_ID="twitter.com";/**
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
 */async function K_(n,e){return Kd(n,"POST","/v1/accounts:signUp",vi(n,e))}/**
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
 */class Vt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await it._fromIdTokenResponse(e,r,s),a=bu(r);return new Vt({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=bu(r);return new Vt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function bu(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function Q_(n){var e;if(rt(n.app))return Promise.reject(Rt(n));const t=Ii(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new Vt({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await K_(t,{returnSecureToken:!0}),s=await Vt._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
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
 */class ti extends ht{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,ti.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new ti(e,t,r,s)}}function df(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?ti._fromErrorAndOperation(n,i,e,r):i})}async function Y_(n,e,t=!1){const r=await Nr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Vt._forOperation(n,"link",r)}/**
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
 */async function J_(n,e,t=!1){const{auth:r}=n;if(rt(r.app))return Promise.reject(Rt(r));const s="reauthenticate";try{const i=await Nr(n,df(r,s,e,n),t);B(i.idToken,r,"internal-error");const a=ja(i.idToken);B(a,r,"internal-error");const{sub:c}=a;return B(n.uid===c,r,"user-mismatch"),Vt._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&ct(r,"user-mismatch"),i}}/**
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
 */async function X_(n,e,t=!1){if(rt(n.app))return Promise.reject(Rt(n));const r="signIn",s=await df(n,r,e),i=await Vt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function Z_(n,e,t,r){return He(n).onIdTokenChanged(e,t,r)}function ev(n,e,t){return He(n).beforeAuthStateChanged(e,t)}const ni="__sak";/**
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
 */class ff{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(ni,"1"),this.storage.removeItem(ni),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const tv=1e3,nv=10;class pf extends ff{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=af(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,u)=>{this.notifyListeners(a,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);N_()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,nv):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},tv)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}pf.type="LOCAL";const rv=pf;/**
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
 */class mf extends ff{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}mf.type="SESSION";const gf=mf;/**
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
 */function sv(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Ei{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Ei(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(a).map(async h=>h(t.origin,i)),u=await sv(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ei.receivers=[];/**
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
 */function Ga(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class iv{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((c,u)=>{const h=Ga("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const g=m;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(g.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function Qe(){return window}function ov(n){Qe().location.href=n}/**
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
 */function yf(){return typeof Qe().WorkerGlobalScope<"u"&&typeof Qe().importScripts=="function"}async function av(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function cv(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function lv(){return yf()?self:null}/**
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
 */const _f="firebaseLocalStorageDb",uv=1,ri="firebaseLocalStorage",vf="fbase_key";class Yr{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function wi(n,e){return n.transaction([ri],e?"readwrite":"readonly").objectStore(ri)}function hv(){const n=indexedDB.deleteDatabase(_f);return new Yr(n).toPromise()}function sa(){const n=indexedDB.open(_f,uv);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(ri,{keyPath:vf})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(ri)?e(r):(r.close(),await hv(),e(await sa()))})})}async function Su(n,e,t){const r=wi(n,!0).put({[vf]:e,value:t});return new Yr(r).toPromise()}async function dv(n,e){const t=wi(n,!1).get(e),r=await new Yr(t).toPromise();return r===void 0?null:r.value}function Cu(n,e){const t=wi(n,!0).delete(e);return new Yr(t).toPromise()}const fv=800,pv=3;class If{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await sa(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>pv)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return yf()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ei._getInstance(lv()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await av(),!this.activeServiceWorker)return;this.sender=new iv(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||cv()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await sa();return await Su(e,ni,"1"),await Cu(e,ni),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Su(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>dv(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Cu(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=wi(s,!1).getAll();return new Yr(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),fv)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}If.type="LOCAL";const mv=If;new Kr(3e4,6e4);/**
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
 */function gv(n,e){return e?ot(e):(B(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class Wa extends uf{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Pn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Pn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Pn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function yv(n){return X_(n.auth,new Wa(n),n.bypassAuthState)}function _v(n){const{auth:e,user:t}=n;return B(t,e,"internal-error"),J_(t,new Wa(n),n.bypassAuthState)}async function vv(n){const{auth:e,user:t}=n;return B(t,e,"internal-error"),Y_(t,new Wa(n),n.bypassAuthState)}/**
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
 */class Ef{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:c}=e;if(a){this.reject(a);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return yv;case"linkViaPopup":case"linkViaRedirect":return vv;case"reauthViaPopup":case"reauthViaRedirect":return _v;default:ct(this.auth,"internal-error")}}resolve(e){lt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){lt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const Iv=new Kr(2e3,1e4);class Tn extends Ef{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Tn.currentPopupAction&&Tn.currentPopupAction.cancel(),Tn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return B(e,this.auth,"internal-error"),e}async onExecution(){lt(this.filter.length===1,"Popup operations only handle one event");const e=Ga();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ke(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ke(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Tn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ke(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Iv.get())};e()}}Tn.currentPopupAction=null;/**
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
 */const Ev="pendingRedirect",Os=new Map;class wv extends Ef{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Os.get(this.auth._key());if(!e){try{const r=await Tv(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Os.set(this.auth._key(),e)}return this.bypassAuthState||Os.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Tv(n,e){const t=Sv(e),r=bv(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function Av(n,e){Os.set(n._key(),e)}function bv(n){return ot(n._redirectPersistence)}function Sv(n){return Ms(Ev,n.config.apiKey,n.name)}async function Cv(n,e,t=!1){if(rt(n.app))return Promise.reject(Rt(n));const r=Ii(n),s=gv(r,e),a=await new wv(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const Rv=10*60*1e3;class Pv{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!kv(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!wf(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Ke(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Rv&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ru(e))}saveEventToCache(e){this.cachedEventUids.add(Ru(e)),this.lastProcessedEventTime=Date.now()}}function Ru(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function wf({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function kv(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return wf(n);default:return!1}}/**
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
 */async function Dv(n,e={}){return Gn(n,"GET","/v1/projects",e)}/**
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
 */const Nv=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Vv=/^https?/;async function Lv(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Dv(n);for(const t of e)try{if(xv(t))return}catch{}ct(n,"unauthorized-domain")}function xv(n){const e=na(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Vv.test(t))return!1;if(Nv.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const Mv=new Kr(3e4,6e4);function Pu(){const n=Qe().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Ov(n){return new Promise((e,t)=>{var r,s,i;function a(){Pu(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Pu(),t(Ke(n,"network-request-failed"))},timeout:Mv.get()})}if(!((s=(r=Qe().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Qe().gapi)===null||i===void 0)&&i.load)a();else{const c=$_("iframefcb");return Qe()[c]=()=>{gapi.load?a():t(Ke(n,"network-request-failed"))},B_(`${U_()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw Fs=null,e})}let Fs=null;function Fv(n){return Fs=Fs||Ov(n),Fs}/**
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
 */const Bv=new Kr(5e3,15e3),Uv="__/auth/iframe",$v="emulator/auth/iframe",Hv={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},jv=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function qv(n){const e=n.config;B(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ha(e,$v):`https://${n.config.authDomain}/${Uv}`,r={apiKey:e.apiKey,appName:n.name,v:zn},s=jv.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${Wr(r).slice(1)}`}async function zv(n){const e=await Fv(n),t=Qe().gapi;return B(t,n,"internal-error"),e.open({where:document.body,url:qv(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Hv,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=Ke(n,"network-request-failed"),c=Qe().setTimeout(()=>{i(a)},Bv.get());function u(){Qe().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(a)})}))}/**
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
 */const Gv={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Wv=500,Kv=600,Qv="_blank",Yv="http://localhost";class ku{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Jv(n,e,t,r=Wv,s=Kv){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u=Object.assign(Object.assign({},Gv),{width:r.toString(),height:s.toString(),top:i,left:a}),h=Ve().toLowerCase();t&&(c=tf(h)?Qv:t),Zd(h)&&(e=e||Yv,u.scrollbars="yes");const f=Object.entries(u).reduce((g,[E,S])=>`${g}${E}=${S},`,"");if(D_(h)&&c!=="_self")return Xv(e||"",c),new ku(null);const m=window.open(e||"",c,f);B(m,n,"popup-blocked");try{m.focus()}catch{}return new ku(m)}function Xv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const Zv="__/auth/handler",eI="emulator/auth/handler",tI=encodeURIComponent("fac");async function Du(n,e,t,r,s,i){B(n.config.authDomain,n,"auth-domain-config-required"),B(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:zn,eventId:s};if(e instanceof hf){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",ny(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))a[f]=m}if(e instanceof Qr){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),h=u?`#${tI}=${encodeURIComponent(u)}`:"";return`${nI(n)}?${Wr(c).slice(1)}${h}`}function nI({config:n}){return n.emulator?Ha(n,eI):`https://${n.authDomain}/${Zv}`}/**
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
 */const wo="webStorageSupport";class rI{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=gf,this._completeRedirectFn=Cv,this._overrideRedirectResult=Av}async _openPopup(e,t,r,s){var i;lt((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await Du(e,t,r,na(),s);return Jv(e,a,Ga())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await Du(e,t,r,na(),s);return ov(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(lt(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await zv(e),r=new Pv(e);return t.register("authEvent",s=>(B(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(wo,{type:wo},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[wo];a!==void 0&&t(!!a),ct(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Lv(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return af()||ef()||qa()}}const sI=rI;var Nu="@firebase/auth",Vu="1.7.9";/**
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
 */class iI{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){B(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function oI(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function aI(n){Mn(new nn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;B(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:cf(n)},h=new O_(r,s,i,u);return j_(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Mn(new nn("auth-internal",e=>{const t=Ii(e.getProvider("auth").getImmediate());return(r=>new iI(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ct(Nu,Vu,oI(n)),Ct(Nu,Vu,"esm2017")}/**
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
 */const cI=5*60,lI=Md("authIdTokenMaxAge")||cI;let Lu=null;const uI=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>lI)return;const s=t==null?void 0:t.token;Lu!==s&&(Lu=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function hI(n=Ud()){const e=Ba(n,"auth");if(e.isInitialized())return e.getImmediate();const t=H_(n,{popupRedirectResolver:sI,persistence:[mv,rv,gf]}),r=Md("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=uI(i.toString());ev(t,a,()=>a(t.currentUser)),Z_(t,c=>a(c))}}const s=Ld("auth");return s&&q_(t,`http://${s}`),t}function dI(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}F_({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=Ke("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",dI().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});aI("Browser");var xu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Xt,Tf;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,_){function v(){}v.prototype=_.prototype,T.D=_.prototype,T.prototype=new v,T.prototype.constructor=T,T.C=function(w,A,I){for(var y=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)y[Y-2]=arguments[Y];return _.prototype[A].apply(w,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,_,v){v||(v=0);var w=Array(16);if(typeof _=="string")for(var A=0;16>A;++A)w[A]=_.charCodeAt(v++)|_.charCodeAt(v++)<<8|_.charCodeAt(v++)<<16|_.charCodeAt(v++)<<24;else for(A=0;16>A;++A)w[A]=_[v++]|_[v++]<<8|_[v++]<<16|_[v++]<<24;_=T.g[0],v=T.g[1],A=T.g[2];var I=T.g[3],y=_+(I^v&(A^I))+w[0]+3614090360&4294967295;_=v+(y<<7&4294967295|y>>>25),y=I+(A^_&(v^A))+w[1]+3905402710&4294967295,I=_+(y<<12&4294967295|y>>>20),y=A+(v^I&(_^v))+w[2]+606105819&4294967295,A=I+(y<<17&4294967295|y>>>15),y=v+(_^A&(I^_))+w[3]+3250441966&4294967295,v=A+(y<<22&4294967295|y>>>10),y=_+(I^v&(A^I))+w[4]+4118548399&4294967295,_=v+(y<<7&4294967295|y>>>25),y=I+(A^_&(v^A))+w[5]+1200080426&4294967295,I=_+(y<<12&4294967295|y>>>20),y=A+(v^I&(_^v))+w[6]+2821735955&4294967295,A=I+(y<<17&4294967295|y>>>15),y=v+(_^A&(I^_))+w[7]+4249261313&4294967295,v=A+(y<<22&4294967295|y>>>10),y=_+(I^v&(A^I))+w[8]+1770035416&4294967295,_=v+(y<<7&4294967295|y>>>25),y=I+(A^_&(v^A))+w[9]+2336552879&4294967295,I=_+(y<<12&4294967295|y>>>20),y=A+(v^I&(_^v))+w[10]+4294925233&4294967295,A=I+(y<<17&4294967295|y>>>15),y=v+(_^A&(I^_))+w[11]+2304563134&4294967295,v=A+(y<<22&4294967295|y>>>10),y=_+(I^v&(A^I))+w[12]+1804603682&4294967295,_=v+(y<<7&4294967295|y>>>25),y=I+(A^_&(v^A))+w[13]+4254626195&4294967295,I=_+(y<<12&4294967295|y>>>20),y=A+(v^I&(_^v))+w[14]+2792965006&4294967295,A=I+(y<<17&4294967295|y>>>15),y=v+(_^A&(I^_))+w[15]+1236535329&4294967295,v=A+(y<<22&4294967295|y>>>10),y=_+(A^I&(v^A))+w[1]+4129170786&4294967295,_=v+(y<<5&4294967295|y>>>27),y=I+(v^A&(_^v))+w[6]+3225465664&4294967295,I=_+(y<<9&4294967295|y>>>23),y=A+(_^v&(I^_))+w[11]+643717713&4294967295,A=I+(y<<14&4294967295|y>>>18),y=v+(I^_&(A^I))+w[0]+3921069994&4294967295,v=A+(y<<20&4294967295|y>>>12),y=_+(A^I&(v^A))+w[5]+3593408605&4294967295,_=v+(y<<5&4294967295|y>>>27),y=I+(v^A&(_^v))+w[10]+38016083&4294967295,I=_+(y<<9&4294967295|y>>>23),y=A+(_^v&(I^_))+w[15]+3634488961&4294967295,A=I+(y<<14&4294967295|y>>>18),y=v+(I^_&(A^I))+w[4]+3889429448&4294967295,v=A+(y<<20&4294967295|y>>>12),y=_+(A^I&(v^A))+w[9]+568446438&4294967295,_=v+(y<<5&4294967295|y>>>27),y=I+(v^A&(_^v))+w[14]+3275163606&4294967295,I=_+(y<<9&4294967295|y>>>23),y=A+(_^v&(I^_))+w[3]+4107603335&4294967295,A=I+(y<<14&4294967295|y>>>18),y=v+(I^_&(A^I))+w[8]+1163531501&4294967295,v=A+(y<<20&4294967295|y>>>12),y=_+(A^I&(v^A))+w[13]+2850285829&4294967295,_=v+(y<<5&4294967295|y>>>27),y=I+(v^A&(_^v))+w[2]+4243563512&4294967295,I=_+(y<<9&4294967295|y>>>23),y=A+(_^v&(I^_))+w[7]+1735328473&4294967295,A=I+(y<<14&4294967295|y>>>18),y=v+(I^_&(A^I))+w[12]+2368359562&4294967295,v=A+(y<<20&4294967295|y>>>12),y=_+(v^A^I)+w[5]+4294588738&4294967295,_=v+(y<<4&4294967295|y>>>28),y=I+(_^v^A)+w[8]+2272392833&4294967295,I=_+(y<<11&4294967295|y>>>21),y=A+(I^_^v)+w[11]+1839030562&4294967295,A=I+(y<<16&4294967295|y>>>16),y=v+(A^I^_)+w[14]+4259657740&4294967295,v=A+(y<<23&4294967295|y>>>9),y=_+(v^A^I)+w[1]+2763975236&4294967295,_=v+(y<<4&4294967295|y>>>28),y=I+(_^v^A)+w[4]+1272893353&4294967295,I=_+(y<<11&4294967295|y>>>21),y=A+(I^_^v)+w[7]+4139469664&4294967295,A=I+(y<<16&4294967295|y>>>16),y=v+(A^I^_)+w[10]+3200236656&4294967295,v=A+(y<<23&4294967295|y>>>9),y=_+(v^A^I)+w[13]+681279174&4294967295,_=v+(y<<4&4294967295|y>>>28),y=I+(_^v^A)+w[0]+3936430074&4294967295,I=_+(y<<11&4294967295|y>>>21),y=A+(I^_^v)+w[3]+3572445317&4294967295,A=I+(y<<16&4294967295|y>>>16),y=v+(A^I^_)+w[6]+76029189&4294967295,v=A+(y<<23&4294967295|y>>>9),y=_+(v^A^I)+w[9]+3654602809&4294967295,_=v+(y<<4&4294967295|y>>>28),y=I+(_^v^A)+w[12]+3873151461&4294967295,I=_+(y<<11&4294967295|y>>>21),y=A+(I^_^v)+w[15]+530742520&4294967295,A=I+(y<<16&4294967295|y>>>16),y=v+(A^I^_)+w[2]+3299628645&4294967295,v=A+(y<<23&4294967295|y>>>9),y=_+(A^(v|~I))+w[0]+4096336452&4294967295,_=v+(y<<6&4294967295|y>>>26),y=I+(v^(_|~A))+w[7]+1126891415&4294967295,I=_+(y<<10&4294967295|y>>>22),y=A+(_^(I|~v))+w[14]+2878612391&4294967295,A=I+(y<<15&4294967295|y>>>17),y=v+(I^(A|~_))+w[5]+4237533241&4294967295,v=A+(y<<21&4294967295|y>>>11),y=_+(A^(v|~I))+w[12]+1700485571&4294967295,_=v+(y<<6&4294967295|y>>>26),y=I+(v^(_|~A))+w[3]+2399980690&4294967295,I=_+(y<<10&4294967295|y>>>22),y=A+(_^(I|~v))+w[10]+4293915773&4294967295,A=I+(y<<15&4294967295|y>>>17),y=v+(I^(A|~_))+w[1]+2240044497&4294967295,v=A+(y<<21&4294967295|y>>>11),y=_+(A^(v|~I))+w[8]+1873313359&4294967295,_=v+(y<<6&4294967295|y>>>26),y=I+(v^(_|~A))+w[15]+4264355552&4294967295,I=_+(y<<10&4294967295|y>>>22),y=A+(_^(I|~v))+w[6]+2734768916&4294967295,A=I+(y<<15&4294967295|y>>>17),y=v+(I^(A|~_))+w[13]+1309151649&4294967295,v=A+(y<<21&4294967295|y>>>11),y=_+(A^(v|~I))+w[4]+4149444226&4294967295,_=v+(y<<6&4294967295|y>>>26),y=I+(v^(_|~A))+w[11]+3174756917&4294967295,I=_+(y<<10&4294967295|y>>>22),y=A+(_^(I|~v))+w[2]+718787259&4294967295,A=I+(y<<15&4294967295|y>>>17),y=v+(I^(A|~_))+w[9]+3951481745&4294967295,T.g[0]=T.g[0]+_&4294967295,T.g[1]=T.g[1]+(A+(y<<21&4294967295|y>>>11))&4294967295,T.g[2]=T.g[2]+A&4294967295,T.g[3]=T.g[3]+I&4294967295}r.prototype.u=function(T,_){_===void 0&&(_=T.length);for(var v=_-this.blockSize,w=this.B,A=this.h,I=0;I<_;){if(A==0)for(;I<=v;)s(this,T,I),I+=this.blockSize;if(typeof T=="string"){for(;I<_;)if(w[A++]=T.charCodeAt(I++),A==this.blockSize){s(this,w),A=0;break}}else for(;I<_;)if(w[A++]=T[I++],A==this.blockSize){s(this,w),A=0;break}}this.h=A,this.o+=_},r.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var _=1;_<T.length-8;++_)T[_]=0;var v=8*this.o;for(_=T.length-8;_<T.length;++_)T[_]=v&255,v/=256;for(this.u(T),T=Array(16),_=v=0;4>_;++_)for(var w=0;32>w;w+=8)T[v++]=this.g[_]>>>w&255;return T};function i(T,_){var v=c;return Object.prototype.hasOwnProperty.call(v,T)?v[T]:v[T]=_(T)}function a(T,_){this.h=_;for(var v=[],w=!0,A=T.length-1;0<=A;A--){var I=T[A]|0;w&&I==_||(v[A]=I,w=!1)}this.g=v}var c={};function u(T){return-128<=T&&128>T?i(T,function(_){return new a([_|0],0>_?-1:0)}):new a([T|0],0>T?-1:0)}function h(T){if(isNaN(T)||!isFinite(T))return m;if(0>T)return P(h(-T));for(var _=[],v=1,w=0;T>=v;w++)_[w]=T/v|0,v*=4294967296;return new a(_,0)}function f(T,_){if(T.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(T.charAt(0)=="-")return P(f(T.substring(1),_));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var v=h(Math.pow(_,8)),w=m,A=0;A<T.length;A+=8){var I=Math.min(8,T.length-A),y=parseInt(T.substring(A,A+I),_);8>I?(I=h(Math.pow(_,I)),w=w.j(I).add(h(y))):(w=w.j(v),w=w.add(h(y)))}return w}var m=u(0),g=u(1),E=u(16777216);n=a.prototype,n.m=function(){if(R(this))return-P(this).m();for(var T=0,_=1,v=0;v<this.g.length;v++){var w=this.i(v);T+=(0<=w?w:4294967296+w)*_,_*=4294967296}return T},n.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(S(this))return"0";if(R(this))return"-"+P(this).toString(T);for(var _=h(Math.pow(T,6)),v=this,w="";;){var A=O(v,_).g;v=F(v,A.j(_));var I=((0<v.g.length?v.g[0]:v.h)>>>0).toString(T);if(v=A,S(v))return I+w;for(;6>I.length;)I="0"+I;w=I+w}},n.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function S(T){if(T.h!=0)return!1;for(var _=0;_<T.g.length;_++)if(T.g[_]!=0)return!1;return!0}function R(T){return T.h==-1}n.l=function(T){return T=F(this,T),R(T)?-1:S(T)?0:1};function P(T){for(var _=T.g.length,v=[],w=0;w<_;w++)v[w]=~T.g[w];return new a(v,~T.h).add(g)}n.abs=function(){return R(this)?P(this):this},n.add=function(T){for(var _=Math.max(this.g.length,T.g.length),v=[],w=0,A=0;A<=_;A++){var I=w+(this.i(A)&65535)+(T.i(A)&65535),y=(I>>>16)+(this.i(A)>>>16)+(T.i(A)>>>16);w=y>>>16,I&=65535,y&=65535,v[A]=y<<16|I}return new a(v,v[v.length-1]&-2147483648?-1:0)};function F(T,_){return T.add(P(_))}n.j=function(T){if(S(this)||S(T))return m;if(R(this))return R(T)?P(this).j(P(T)):P(P(this).j(T));if(R(T))return P(this.j(P(T)));if(0>this.l(E)&&0>T.l(E))return h(this.m()*T.m());for(var _=this.g.length+T.g.length,v=[],w=0;w<2*_;w++)v[w]=0;for(w=0;w<this.g.length;w++)for(var A=0;A<T.g.length;A++){var I=this.i(w)>>>16,y=this.i(w)&65535,Y=T.i(A)>>>16,X=T.i(A)&65535;v[2*w+2*A]+=y*X,H(v,2*w+2*A),v[2*w+2*A+1]+=I*X,H(v,2*w+2*A+1),v[2*w+2*A+1]+=y*Y,H(v,2*w+2*A+1),v[2*w+2*A+2]+=I*Y,H(v,2*w+2*A+2)}for(w=0;w<_;w++)v[w]=v[2*w+1]<<16|v[2*w];for(w=_;w<2*_;w++)v[w]=0;return new a(v,0)};function H(T,_){for(;(T[_]&65535)!=T[_];)T[_+1]+=T[_]>>>16,T[_]&=65535,_++}function V(T,_){this.g=T,this.h=_}function O(T,_){if(S(_))throw Error("division by zero");if(S(T))return new V(m,m);if(R(T))return _=O(P(T),_),new V(P(_.g),P(_.h));if(R(_))return _=O(T,P(_)),new V(P(_.g),_.h);if(30<T.g.length){if(R(T)||R(_))throw Error("slowDivide_ only works with positive integers.");for(var v=g,w=_;0>=w.l(T);)v=J(v),w=J(w);var A=Q(v,1),I=Q(w,1);for(w=Q(w,2),v=Q(v,2);!S(w);){var y=I.add(w);0>=y.l(T)&&(A=A.add(v),I=y),w=Q(w,1),v=Q(v,1)}return _=F(T,A.j(_)),new V(A,_)}for(A=m;0<=T.l(_);){for(v=Math.max(1,Math.floor(T.m()/_.m())),w=Math.ceil(Math.log(v)/Math.LN2),w=48>=w?1:Math.pow(2,w-48),I=h(v),y=I.j(_);R(y)||0<y.l(T);)v-=w,I=h(v),y=I.j(_);S(I)&&(I=g),A=A.add(I),T=F(T,y)}return new V(A,T)}n.A=function(T){return O(this,T).h},n.and=function(T){for(var _=Math.max(this.g.length,T.g.length),v=[],w=0;w<_;w++)v[w]=this.i(w)&T.i(w);return new a(v,this.h&T.h)},n.or=function(T){for(var _=Math.max(this.g.length,T.g.length),v=[],w=0;w<_;w++)v[w]=this.i(w)|T.i(w);return new a(v,this.h|T.h)},n.xor=function(T){for(var _=Math.max(this.g.length,T.g.length),v=[],w=0;w<_;w++)v[w]=this.i(w)^T.i(w);return new a(v,this.h^T.h)};function J(T){for(var _=T.g.length+1,v=[],w=0;w<_;w++)v[w]=T.i(w)<<1|T.i(w-1)>>>31;return new a(v,T.h)}function Q(T,_){var v=_>>5;_%=32;for(var w=T.g.length-v,A=[],I=0;I<w;I++)A[I]=0<_?T.i(I+v)>>>_|T.i(I+v+1)<<32-_:T.i(I+v);return new a(A,T.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Tf=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=f,Xt=a}).apply(typeof xu<"u"?xu:typeof self<"u"?self:typeof window<"u"?window:{});var Ss=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Af,fr,bf,Bs,ia,Sf,Cf,Rf;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,l,d){return o==Array.prototype||o==Object.prototype||(o[l]=d.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ss=="object"&&Ss];for(var l=0;l<o.length;++l){var d=o[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(o,l){if(l)e:{var d=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var b=o[p];if(!(b in d))break e;d=d[b]}o=o[o.length-1],p=d[o],l=l(p),l!=p&&l!=null&&e(d,o,{configurable:!0,writable:!0,value:l})}}function i(o,l){o instanceof String&&(o+="");var d=0,p=!1,b={next:function(){if(!p&&d<o.length){var C=d++;return{value:l(C,o[C]),done:!1}}return p=!0,{done:!0,value:void 0}}};return b[Symbol.iterator]=function(){return b},b}s("Array.prototype.values",function(o){return o||function(){return i(this,function(l,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function u(o){var l=typeof o;return l=l!="object"?l:o?Array.isArray(o)?"array":l:"null",l=="array"||l=="object"&&typeof o.length=="number"}function h(o){var l=typeof o;return l=="object"&&o!=null||l=="function"}function f(o,l,d){return o.call.apply(o.bind,arguments)}function m(o,l,d){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var b=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(b,p),o.apply(l,b)}}return function(){return o.apply(l,arguments)}}function g(o,l,d){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,g.apply(null,arguments)}function E(o,l){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function S(o,l){function d(){}d.prototype=l.prototype,o.aa=l.prototype,o.prototype=new d,o.prototype.constructor=o,o.Qb=function(p,b,C){for(var N=Array(arguments.length-2),Z=2;Z<arguments.length;Z++)N[Z-2]=arguments[Z];return l.prototype[b].apply(p,N)}}function R(o){const l=o.length;if(0<l){const d=Array(l);for(let p=0;p<l;p++)d[p]=o[p];return d}return[]}function P(o,l){for(let d=1;d<arguments.length;d++){const p=arguments[d];if(u(p)){const b=o.length||0,C=p.length||0;o.length=b+C;for(let N=0;N<C;N++)o[b+N]=p[N]}else o.push(p)}}class F{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function H(o){return/^[\s\xa0]*$/.test(o)}function V(){var o=c.navigator;return o&&(o=o.userAgent)?o:""}function O(o){return O[" "](o),o}O[" "]=function(){};var J=V().indexOf("Gecko")!=-1&&!(V().toLowerCase().indexOf("webkit")!=-1&&V().indexOf("Edge")==-1)&&!(V().indexOf("Trident")!=-1||V().indexOf("MSIE")!=-1)&&V().indexOf("Edge")==-1;function Q(o,l,d){for(const p in o)l.call(d,o[p],p,o)}function T(o,l){for(const d in o)l.call(void 0,o[d],d,o)}function _(o){const l={};for(const d in o)l[d]=o[d];return l}const v="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function w(o,l){let d,p;for(let b=1;b<arguments.length;b++){p=arguments[b];for(d in p)o[d]=p[d];for(let C=0;C<v.length;C++)d=v[C],Object.prototype.hasOwnProperty.call(p,d)&&(o[d]=p[d])}}function A(o){var l=1;o=o.split(":");const d=[];for(;0<l&&o.length;)d.push(o.shift()),l--;return o.length&&d.push(o.join(":")),d}function I(o){c.setTimeout(()=>{throw o},0)}function y(){var o=ge;let l=null;return o.g&&(l=o.g,o.g=o.g.next,o.g||(o.h=null),l.next=null),l}class Y{constructor(){this.h=this.g=null}add(l,d){const p=X.get();p.set(l,d),this.h?this.h.next=p:this.g=p,this.h=p}}var X=new F(()=>new he,o=>o.reset());class he{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let pe,ie=!1,ge=new Y,Bt=()=>{const o=c.Promise.resolve(void 0);pe=()=>{o.then(os)}};var os=()=>{for(var o;o=y();){try{o.h.call(o.g)}catch(d){I(d)}var l=X;l.j(o),100>l.h&&(l.h++,o.next=l.g,l.g=o)}ie=!1};function Ge(){this.s=this.s,this.C=this.C}Ge.prototype.s=!1,Ge.prototype.ma=function(){this.s||(this.s=!0,this.N())},Ge.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function ye(o,l){this.type=o,this.g=this.target=l,this.defaultPrevented=!1}ye.prototype.h=function(){this.defaultPrevented=!0};var qi=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var o=!1,l=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const d=()=>{};c.addEventListener("test",d,l),c.removeEventListener("test",d,l)}catch{}return o}();function Ut(o,l){if(ye.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var d=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=l,l=o.relatedTarget){if(J){e:{try{O(l.nodeName);var b=!0;break e}catch{}b=!1}b||(l=null)}}else d=="mouseover"?l=o.fromElement:d=="mouseout"&&(l=o.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:zi[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Ut.aa.h.call(this)}}S(Ut,ye);var zi={2:"touch",3:"pen",4:"mouse"};Ut.prototype.h=function(){Ut.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ln="closure_listenable_"+(1e6*Math.random()|0),$m=0;function Hm(o,l,d,p,b){this.listener=o,this.proxy=null,this.src=l,this.type=d,this.capture=!!p,this.ha=b,this.key=++$m,this.da=this.fa=!1}function as(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function cs(o){this.src=o,this.g={},this.h=0}cs.prototype.add=function(o,l,d,p,b){var C=o.toString();o=this.g[C],o||(o=this.g[C]=[],this.h++);var N=Wi(o,l,p,b);return-1<N?(l=o[N],d||(l.fa=!1)):(l=new Hm(l,this.src,C,!!p,b),l.fa=d,o.push(l)),l};function Gi(o,l){var d=l.type;if(d in o.g){var p=o.g[d],b=Array.prototype.indexOf.call(p,l,void 0),C;(C=0<=b)&&Array.prototype.splice.call(p,b,1),C&&(as(l),o.g[d].length==0&&(delete o.g[d],o.h--))}}function Wi(o,l,d,p){for(var b=0;b<o.length;++b){var C=o[b];if(!C.da&&C.listener==l&&C.capture==!!d&&C.ha==p)return b}return-1}var Ki="closure_lm_"+(1e6*Math.random()|0),Qi={};function ol(o,l,d,p,b){if(Array.isArray(l)){for(var C=0;C<l.length;C++)ol(o,l[C],d,p,b);return null}return d=ll(d),o&&o[ln]?o.K(l,d,h(p)?!!p.capture:!1,b):jm(o,l,d,!1,p,b)}function jm(o,l,d,p,b,C){if(!l)throw Error("Invalid event type");var N=h(b)?!!b.capture:!!b,Z=Ji(o);if(Z||(o[Ki]=Z=new cs(o)),d=Z.add(l,d,p,N,C),d.proxy)return d;if(p=qm(),d.proxy=p,p.src=o,p.listener=d,o.addEventListener)qi||(b=N),b===void 0&&(b=!1),o.addEventListener(l.toString(),p,b);else if(o.attachEvent)o.attachEvent(cl(l.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function qm(){function o(d){return l.call(o.src,o.listener,d)}const l=zm;return o}function al(o,l,d,p,b){if(Array.isArray(l))for(var C=0;C<l.length;C++)al(o,l[C],d,p,b);else p=h(p)?!!p.capture:!!p,d=ll(d),o&&o[ln]?(o=o.i,l=String(l).toString(),l in o.g&&(C=o.g[l],d=Wi(C,d,p,b),-1<d&&(as(C[d]),Array.prototype.splice.call(C,d,1),C.length==0&&(delete o.g[l],o.h--)))):o&&(o=Ji(o))&&(l=o.g[l.toString()],o=-1,l&&(o=Wi(l,d,p,b)),(d=-1<o?l[o]:null)&&Yi(d))}function Yi(o){if(typeof o!="number"&&o&&!o.da){var l=o.src;if(l&&l[ln])Gi(l.i,o);else{var d=o.type,p=o.proxy;l.removeEventListener?l.removeEventListener(d,p,o.capture):l.detachEvent?l.detachEvent(cl(d),p):l.addListener&&l.removeListener&&l.removeListener(p),(d=Ji(l))?(Gi(d,o),d.h==0&&(d.src=null,l[Ki]=null)):as(o)}}}function cl(o){return o in Qi?Qi[o]:Qi[o]="on"+o}function zm(o,l){if(o.da)o=!0;else{l=new Ut(l,this);var d=o.listener,p=o.ha||o.src;o.fa&&Yi(o),o=d.call(p,l)}return o}function Ji(o){return o=o[Ki],o instanceof cs?o:null}var Xi="__closure_events_fn_"+(1e9*Math.random()>>>0);function ll(o){return typeof o=="function"?o:(o[Xi]||(o[Xi]=function(l){return o.handleEvent(l)}),o[Xi])}function Ae(){Ge.call(this),this.i=new cs(this),this.M=this,this.F=null}S(Ae,Ge),Ae.prototype[ln]=!0,Ae.prototype.removeEventListener=function(o,l,d,p){al(this,o,l,d,p)};function Le(o,l){var d,p=o.F;if(p)for(d=[];p;p=p.F)d.push(p);if(o=o.M,p=l.type||l,typeof l=="string")l=new ye(l,o);else if(l instanceof ye)l.target=l.target||o;else{var b=l;l=new ye(p,o),w(l,b)}if(b=!0,d)for(var C=d.length-1;0<=C;C--){var N=l.g=d[C];b=ls(N,p,!0,l)&&b}if(N=l.g=o,b=ls(N,p,!0,l)&&b,b=ls(N,p,!1,l)&&b,d)for(C=0;C<d.length;C++)N=l.g=d[C],b=ls(N,p,!1,l)&&b}Ae.prototype.N=function(){if(Ae.aa.N.call(this),this.i){var o=this.i,l;for(l in o.g){for(var d=o.g[l],p=0;p<d.length;p++)as(d[p]);delete o.g[l],o.h--}}this.F=null},Ae.prototype.K=function(o,l,d,p){return this.i.add(String(o),l,!1,d,p)},Ae.prototype.L=function(o,l,d,p){return this.i.add(String(o),l,!0,d,p)};function ls(o,l,d,p){if(l=o.i.g[String(l)],!l)return!0;l=l.concat();for(var b=!0,C=0;C<l.length;++C){var N=l[C];if(N&&!N.da&&N.capture==d){var Z=N.listener,ve=N.ha||N.src;N.fa&&Gi(o.i,N),b=Z.call(ve,p)!==!1&&b}}return b&&!p.defaultPrevented}function ul(o,l,d){if(typeof o=="function")d&&(o=g(o,d));else if(o&&typeof o.handleEvent=="function")o=g(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(o,l||0)}function hl(o){o.g=ul(()=>{o.g=null,o.i&&(o.i=!1,hl(o))},o.l);const l=o.h;o.h=null,o.m.apply(null,l)}class Gm extends Ge{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:hl(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Jn(o){Ge.call(this),this.h=o,this.g={}}S(Jn,Ge);var dl=[];function fl(o){Q(o.g,function(l,d){this.g.hasOwnProperty(d)&&Yi(l)},o),o.g={}}Jn.prototype.N=function(){Jn.aa.N.call(this),fl(this)},Jn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Zi=c.JSON.stringify,Wm=c.JSON.parse,Km=class{stringify(o){return c.JSON.stringify(o,void 0)}parse(o){return c.JSON.parse(o,void 0)}};function eo(){}eo.prototype.h=null;function pl(o){return o.h||(o.h=o.i())}function ml(){}var Xn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function to(){ye.call(this,"d")}S(to,ye);function no(){ye.call(this,"c")}S(no,ye);var $t={},gl=null;function us(){return gl=gl||new Ae}$t.La="serverreachability";function yl(o){ye.call(this,$t.La,o)}S(yl,ye);function Zn(o){const l=us();Le(l,new yl(l))}$t.STAT_EVENT="statevent";function _l(o,l){ye.call(this,$t.STAT_EVENT,o),this.stat=l}S(_l,ye);function xe(o){const l=us();Le(l,new _l(l,o))}$t.Ma="timingevent";function vl(o,l){ye.call(this,$t.Ma,o),this.size=l}S(vl,ye);function er(o,l){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){o()},l)}function tr(){this.g=!0}tr.prototype.xa=function(){this.g=!1};function Qm(o,l,d,p,b,C){o.info(function(){if(o.g)if(C)for(var N="",Z=C.split("&"),ve=0;ve<Z.length;ve++){var W=Z[ve].split("=");if(1<W.length){var be=W[0];W=W[1];var Se=be.split("_");N=2<=Se.length&&Se[1]=="type"?N+(be+"="+W+"&"):N+(be+"=redacted&")}}else N=null;else N=C;return"XMLHTTP REQ ("+p+") [attempt "+b+"]: "+l+`
`+d+`
`+N})}function Ym(o,l,d,p,b,C,N){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+b+"]: "+l+`
`+d+`
`+C+" "+N})}function un(o,l,d,p){o.info(function(){return"XMLHTTP TEXT ("+l+"): "+Xm(o,d)+(p?" "+p:"")})}function Jm(o,l){o.info(function(){return"TIMEOUT: "+l})}tr.prototype.info=function(){};function Xm(o,l){if(!o.g)return l;if(!l)return null;try{var d=JSON.parse(l);if(d){for(o=0;o<d.length;o++)if(Array.isArray(d[o])){var p=d[o];if(!(2>p.length)){var b=p[1];if(Array.isArray(b)&&!(1>b.length)){var C=b[0];if(C!="noop"&&C!="stop"&&C!="close")for(var N=1;N<b.length;N++)b[N]=""}}}}return Zi(d)}catch{return l}}var hs={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Il={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},ro;function ds(){}S(ds,eo),ds.prototype.g=function(){return new XMLHttpRequest},ds.prototype.i=function(){return{}},ro=new ds;function pt(o,l,d,p){this.j=o,this.i=l,this.l=d,this.R=p||1,this.U=new Jn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new El}function El(){this.i=null,this.g="",this.h=!1}var wl={},so={};function io(o,l,d){o.L=1,o.v=gs(Xe(l)),o.m=d,o.P=!0,Tl(o,null)}function Tl(o,l){o.F=Date.now(),fs(o),o.A=Xe(o.v);var d=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),Ol(d.i,"t",p),o.C=0,d=o.j.J,o.h=new El,o.g=tu(o.j,d?l:null,!o.m),0<o.O&&(o.M=new Gm(g(o.Y,o,o.g),o.O)),l=o.U,d=o.g,p=o.ca;var b="readystatechange";Array.isArray(b)||(b&&(dl[0]=b.toString()),b=dl);for(var C=0;C<b.length;C++){var N=ol(d,b[C],p||l.handleEvent,!1,l.h||l);if(!N)break;l.g[N.key]=N}l=o.H?_(o.H):{},o.m?(o.u||(o.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,l)):(o.u="GET",o.g.ea(o.A,o.u,null,l)),Zn(),Qm(o.i,o.u,o.A,o.l,o.R,o.m)}pt.prototype.ca=function(o){o=o.target;const l=this.M;l&&Ze(o)==3?l.j():this.Y(o)},pt.prototype.Y=function(o){try{if(o==this.g)e:{const Se=Ze(this.g);var l=this.g.Ba();const fn=this.g.Z();if(!(3>Se)&&(Se!=3||this.g&&(this.h.h||this.g.oa()||ql(this.g)))){this.J||Se!=4||l==7||(l==8||0>=fn?Zn(3):Zn(2)),oo(this);var d=this.g.Z();this.X=d;t:if(Al(this)){var p=ql(this.g);o="";var b=p.length,C=Ze(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Ht(this),nr(this);var N="";break t}this.h.i=new c.TextDecoder}for(l=0;l<b;l++)this.h.h=!0,o+=this.h.i.decode(p[l],{stream:!(C&&l==b-1)});p.length=0,this.h.g+=o,this.C=0,N=this.h.g}else N=this.g.oa();if(this.o=d==200,Ym(this.i,this.u,this.A,this.l,this.R,Se,d),this.o){if(this.T&&!this.K){t:{if(this.g){var Z,ve=this.g;if((Z=ve.g?ve.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!H(Z)){var W=Z;break t}}W=null}if(d=W)un(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,ao(this,d);else{this.o=!1,this.s=3,xe(12),Ht(this),nr(this);break e}}if(this.P){d=!0;let qe;for(;!this.J&&this.C<N.length;)if(qe=Zm(this,N),qe==so){Se==4&&(this.s=4,xe(14),d=!1),un(this.i,this.l,null,"[Incomplete Response]");break}else if(qe==wl){this.s=4,xe(15),un(this.i,this.l,N,"[Invalid Chunk]"),d=!1;break}else un(this.i,this.l,qe,null),ao(this,qe);if(Al(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Se!=4||N.length!=0||this.h.h||(this.s=1,xe(16),d=!1),this.o=this.o&&d,!d)un(this.i,this.l,N,"[Invalid Chunked Response]"),Ht(this),nr(this);else if(0<N.length&&!this.W){this.W=!0;var be=this.j;be.g==this&&be.ba&&!be.M&&(be.j.info("Great, no buffering proxy detected. Bytes received: "+N.length),po(be),be.M=!0,xe(11))}}else un(this.i,this.l,N,null),ao(this,N);Se==4&&Ht(this),this.o&&!this.J&&(Se==4?Jl(this.j,this):(this.o=!1,fs(this)))}else gg(this.g),d==400&&0<N.indexOf("Unknown SID")?(this.s=3,xe(12)):(this.s=0,xe(13)),Ht(this),nr(this)}}}catch{}finally{}};function Al(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Zm(o,l){var d=o.C,p=l.indexOf(`
`,d);return p==-1?so:(d=Number(l.substring(d,p)),isNaN(d)?wl:(p+=1,p+d>l.length?so:(l=l.slice(p,p+d),o.C=p+d,l)))}pt.prototype.cancel=function(){this.J=!0,Ht(this)};function fs(o){o.S=Date.now()+o.I,bl(o,o.I)}function bl(o,l){if(o.B!=null)throw Error("WatchDog timer not null");o.B=er(g(o.ba,o),l)}function oo(o){o.B&&(c.clearTimeout(o.B),o.B=null)}pt.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Jm(this.i,this.A),this.L!=2&&(Zn(),xe(17)),Ht(this),this.s=2,nr(this)):bl(this,this.S-o)};function nr(o){o.j.G==0||o.J||Jl(o.j,o)}function Ht(o){oo(o);var l=o.M;l&&typeof l.ma=="function"&&l.ma(),o.M=null,fl(o.U),o.g&&(l=o.g,o.g=null,l.abort(),l.ma())}function ao(o,l){try{var d=o.j;if(d.G!=0&&(d.g==o||co(d.h,o))){if(!o.K&&co(d.h,o)&&d.G==3){try{var p=d.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var b=p;if(b[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<o.F)ws(d),Is(d);else break e;fo(d),xe(18)}}else d.za=b[1],0<d.za-d.T&&37500>b[2]&&d.F&&d.v==0&&!d.C&&(d.C=er(g(d.Za,d),6e3));if(1>=Rl(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else qt(d,11)}else if((o.K||d.g==o)&&ws(d),!H(l))for(b=d.Da.g.parse(l),l=0;l<b.length;l++){let W=b[l];if(d.T=W[0],W=W[1],d.G==2)if(W[0]=="c"){d.K=W[1],d.ia=W[2];const be=W[3];be!=null&&(d.la=be,d.j.info("VER="+d.la));const Se=W[4];Se!=null&&(d.Aa=Se,d.j.info("SVER="+d.Aa));const fn=W[5];fn!=null&&typeof fn=="number"&&0<fn&&(p=1.5*fn,d.L=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;const qe=o.g;if(qe){const As=qe.g?qe.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(As){var C=p.h;C.g||As.indexOf("spdy")==-1&&As.indexOf("quic")==-1&&As.indexOf("h2")==-1||(C.j=C.l,C.g=new Set,C.h&&(lo(C,C.h),C.h=null))}if(p.D){const mo=qe.g?qe.g.getResponseHeader("X-HTTP-Session-Id"):null;mo&&(p.ya=mo,ne(p.I,p.D,mo))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-o.F,d.j.info("Handshake RTT: "+d.R+"ms")),p=d;var N=o;if(p.qa=eu(p,p.J?p.ia:null,p.W),N.K){Pl(p.h,N);var Z=N,ve=p.L;ve&&(Z.I=ve),Z.B&&(oo(Z),fs(Z)),p.g=N}else Ql(p);0<d.i.length&&Es(d)}else W[0]!="stop"&&W[0]!="close"||qt(d,7);else d.G==3&&(W[0]=="stop"||W[0]=="close"?W[0]=="stop"?qt(d,7):ho(d):W[0]!="noop"&&d.l&&d.l.ta(W),d.v=0)}}Zn(4)}catch{}}var eg=class{constructor(o,l){this.g=o,this.map=l}};function Sl(o){this.l=o||10,c.PerformanceNavigationTiming?(o=c.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Cl(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Rl(o){return o.h?1:o.g?o.g.size:0}function co(o,l){return o.h?o.h==l:o.g?o.g.has(l):!1}function lo(o,l){o.g?o.g.add(l):o.h=l}function Pl(o,l){o.h&&o.h==l?o.h=null:o.g&&o.g.has(l)&&o.g.delete(l)}Sl.prototype.cancel=function(){if(this.i=kl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function kl(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let l=o.i;for(const d of o.g.values())l=l.concat(d.D);return l}return R(o.i)}function tg(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(u(o)){for(var l=[],d=o.length,p=0;p<d;p++)l.push(o[p]);return l}l=[],d=0;for(p in o)l[d++]=o[p];return l}function ng(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(u(o)||typeof o=="string"){var l=[];o=o.length;for(var d=0;d<o;d++)l.push(d);return l}l=[],d=0;for(const p in o)l[d++]=p;return l}}}function Dl(o,l){if(o.forEach&&typeof o.forEach=="function")o.forEach(l,void 0);else if(u(o)||typeof o=="string")Array.prototype.forEach.call(o,l,void 0);else for(var d=ng(o),p=tg(o),b=p.length,C=0;C<b;C++)l.call(void 0,p[C],d&&d[C],o)}var Nl=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function rg(o,l){if(o){o=o.split("&");for(var d=0;d<o.length;d++){var p=o[d].indexOf("="),b=null;if(0<=p){var C=o[d].substring(0,p);b=o[d].substring(p+1)}else C=o[d];l(C,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function jt(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof jt){this.h=o.h,ps(this,o.j),this.o=o.o,this.g=o.g,ms(this,o.s),this.l=o.l;var l=o.i,d=new ir;d.i=l.i,l.g&&(d.g=new Map(l.g),d.h=l.h),Vl(this,d),this.m=o.m}else o&&(l=String(o).match(Nl))?(this.h=!1,ps(this,l[1]||"",!0),this.o=rr(l[2]||""),this.g=rr(l[3]||"",!0),ms(this,l[4]),this.l=rr(l[5]||"",!0),Vl(this,l[6]||"",!0),this.m=rr(l[7]||"")):(this.h=!1,this.i=new ir(null,this.h))}jt.prototype.toString=function(){var o=[],l=this.j;l&&o.push(sr(l,Ll,!0),":");var d=this.g;return(d||l=="file")&&(o.push("//"),(l=this.o)&&o.push(sr(l,Ll,!0),"@"),o.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&o.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&o.push("/"),o.push(sr(d,d.charAt(0)=="/"?og:ig,!0))),(d=this.i.toString())&&o.push("?",d),(d=this.m)&&o.push("#",sr(d,cg)),o.join("")};function Xe(o){return new jt(o)}function ps(o,l,d){o.j=d?rr(l,!0):l,o.j&&(o.j=o.j.replace(/:$/,""))}function ms(o,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);o.s=l}else o.s=null}function Vl(o,l,d){l instanceof ir?(o.i=l,lg(o.i,o.h)):(d||(l=sr(l,ag)),o.i=new ir(l,o.h))}function ne(o,l,d){o.i.set(l,d)}function gs(o){return ne(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function rr(o,l){return o?l?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function sr(o,l,d){return typeof o=="string"?(o=encodeURI(o).replace(l,sg),d&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function sg(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Ll=/[#\/\?@]/g,ig=/[#\?:]/g,og=/[#\?]/g,ag=/[#\?@]/g,cg=/#/g;function ir(o,l){this.h=this.g=null,this.i=o||null,this.j=!!l}function mt(o){o.g||(o.g=new Map,o.h=0,o.i&&rg(o.i,function(l,d){o.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}n=ir.prototype,n.add=function(o,l){mt(this),this.i=null,o=hn(this,o);var d=this.g.get(o);return d||this.g.set(o,d=[]),d.push(l),this.h+=1,this};function xl(o,l){mt(o),l=hn(o,l),o.g.has(l)&&(o.i=null,o.h-=o.g.get(l).length,o.g.delete(l))}function Ml(o,l){return mt(o),l=hn(o,l),o.g.has(l)}n.forEach=function(o,l){mt(this),this.g.forEach(function(d,p){d.forEach(function(b){o.call(l,b,p,this)},this)},this)},n.na=function(){mt(this);const o=Array.from(this.g.values()),l=Array.from(this.g.keys()),d=[];for(let p=0;p<l.length;p++){const b=o[p];for(let C=0;C<b.length;C++)d.push(l[p])}return d},n.V=function(o){mt(this);let l=[];if(typeof o=="string")Ml(this,o)&&(l=l.concat(this.g.get(hn(this,o))));else{o=Array.from(this.g.values());for(let d=0;d<o.length;d++)l=l.concat(o[d])}return l},n.set=function(o,l){return mt(this),this.i=null,o=hn(this,o),Ml(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[l]),this.h+=1,this},n.get=function(o,l){return o?(o=this.V(o),0<o.length?String(o[0]):l):l};function Ol(o,l,d){xl(o,l),0<d.length&&(o.i=null,o.g.set(hn(o,l),R(d)),o.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],l=Array.from(this.g.keys());for(var d=0;d<l.length;d++){var p=l[d];const C=encodeURIComponent(String(p)),N=this.V(p);for(p=0;p<N.length;p++){var b=C;N[p]!==""&&(b+="="+encodeURIComponent(String(N[p]))),o.push(b)}}return this.i=o.join("&")};function hn(o,l){return l=String(l),o.j&&(l=l.toLowerCase()),l}function lg(o,l){l&&!o.j&&(mt(o),o.i=null,o.g.forEach(function(d,p){var b=p.toLowerCase();p!=b&&(xl(this,p),Ol(this,b,d))},o)),o.j=l}function ug(o,l){const d=new tr;if(c.Image){const p=new Image;p.onload=E(gt,d,"TestLoadImage: loaded",!0,l,p),p.onerror=E(gt,d,"TestLoadImage: error",!1,l,p),p.onabort=E(gt,d,"TestLoadImage: abort",!1,l,p),p.ontimeout=E(gt,d,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else l(!1)}function hg(o,l){const d=new tr,p=new AbortController,b=setTimeout(()=>{p.abort(),gt(d,"TestPingServer: timeout",!1,l)},1e4);fetch(o,{signal:p.signal}).then(C=>{clearTimeout(b),C.ok?gt(d,"TestPingServer: ok",!0,l):gt(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(b),gt(d,"TestPingServer: error",!1,l)})}function gt(o,l,d,p,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),p(d)}catch{}}function dg(){this.g=new Km}function fg(o,l,d){const p=d||"";try{Dl(o,function(b,C){let N=b;h(b)&&(N=Zi(b)),l.push(p+C+"="+encodeURIComponent(N))})}catch(b){throw l.push(p+"type="+encodeURIComponent("_badmap")),b}}function ys(o){this.l=o.Ub||null,this.j=o.eb||!1}S(ys,eo),ys.prototype.g=function(){return new _s(this.l,this.j)},ys.prototype.i=function(o){return function(){return o}}({});function _s(o,l){Ae.call(this),this.D=o,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}S(_s,Ae),n=_s.prototype,n.open=function(o,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=l,this.readyState=1,ar(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(l.body=o),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,or(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,ar(this)),this.g&&(this.readyState=3,ar(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Fl(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Fl(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var l=o.value?o.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!o.done}))&&(this.response=this.responseText+=l)}o.done?or(this):ar(this),this.readyState==3&&Fl(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,or(this))},n.Qa=function(o){this.g&&(this.response=o,or(this))},n.ga=function(){this.g&&or(this)};function or(o){o.readyState=4,o.l=null,o.j=null,o.v=null,ar(o)}n.setRequestHeader=function(o,l){this.u.append(o,l)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,o.push(d[0]+": "+d[1]),d=l.next();return o.join(`\r
`)};function ar(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(_s.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Bl(o){let l="";return Q(o,function(d,p){l+=p,l+=":",l+=d,l+=`\r
`}),l}function uo(o,l,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=Bl(d),typeof o=="string"?d!=null&&encodeURIComponent(String(d)):ne(o,l,d))}function oe(o){Ae.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}S(oe,Ae);var pg=/^https?$/i,mg=["POST","PUT"];n=oe.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,l,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);l=l?l.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():ro.g(),this.v=this.o?pl(this.o):pl(ro),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(l,String(o),!0),this.B=!1}catch(C){Ul(this,C);return}if(o=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var b in p)d.set(b,p[b]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const C of p.keys())d.set(C,p.get(C));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(C=>C.toLowerCase()=="content-type"),b=c.FormData&&o instanceof c.FormData,!(0<=Array.prototype.indexOf.call(mg,l,void 0))||p||b||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[C,N]of d)this.g.setRequestHeader(C,N);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{jl(this),this.u=!0,this.g.send(o),this.u=!1}catch(C){Ul(this,C)}};function Ul(o,l){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=l,o.m=5,$l(o),vs(o)}function $l(o){o.A||(o.A=!0,Le(o,"complete"),Le(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,Le(this,"complete"),Le(this,"abort"),vs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),vs(this,!0)),oe.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Hl(this):this.bb())},n.bb=function(){Hl(this)};function Hl(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Ze(o)!=4||o.Z()!=2)){if(o.u&&Ze(o)==4)ul(o.Ea,0,o);else if(Le(o,"readystatechange"),Ze(o)==4){o.h=!1;try{const N=o.Z();e:switch(N){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var p;if(p=N===0){var b=String(o.D).match(Nl)[1]||null;!b&&c.self&&c.self.location&&(b=c.self.location.protocol.slice(0,-1)),p=!pg.test(b?b.toLowerCase():"")}d=p}if(d)Le(o,"complete"),Le(o,"success");else{o.m=6;try{var C=2<Ze(o)?o.g.statusText:""}catch{C=""}o.l=C+" ["+o.Z()+"]",$l(o)}}finally{vs(o)}}}}function vs(o,l){if(o.g){jl(o);const d=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,l||Le(o,"ready");try{d.onreadystatechange=p}catch{}}}function jl(o){o.I&&(c.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function Ze(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<Ze(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var l=this.g.responseText;return o&&l.indexOf(o)==0&&(l=l.substring(o.length)),Wm(l)}};function ql(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function gg(o){const l={};o=(o.g&&2<=Ze(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(H(o[p]))continue;var d=A(o[p]);const b=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const C=l[b]||[];l[b]=C,C.push(d)}T(l,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function cr(o,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[o]||l}function zl(o){this.Aa=0,this.i=[],this.j=new tr,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=cr("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=cr("baseRetryDelayMs",5e3,o),this.cb=cr("retryDelaySeedMs",1e4,o),this.Wa=cr("forwardChannelMaxRetries",2,o),this.wa=cr("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Sl(o&&o.concurrentRequestLimit),this.Da=new dg,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=zl.prototype,n.la=8,n.G=1,n.connect=function(o,l,d,p){xe(0),this.W=o,this.H=l||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.I=eu(this,null,this.W),Es(this)};function ho(o){if(Gl(o),o.G==3){var l=o.U++,d=Xe(o.I);if(ne(d,"SID",o.K),ne(d,"RID",l),ne(d,"TYPE","terminate"),lr(o,d),l=new pt(o,o.j,l),l.L=2,l.v=gs(Xe(d)),d=!1,c.navigator&&c.navigator.sendBeacon)try{d=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!d&&c.Image&&(new Image().src=l.v,d=!0),d||(l.g=tu(l.j,null),l.g.ea(l.v)),l.F=Date.now(),fs(l)}Zl(o)}function Is(o){o.g&&(po(o),o.g.cancel(),o.g=null)}function Gl(o){Is(o),o.u&&(c.clearTimeout(o.u),o.u=null),ws(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&c.clearTimeout(o.s),o.s=null)}function Es(o){if(!Cl(o.h)&&!o.s){o.s=!0;var l=o.Ga;pe||Bt(),ie||(pe(),ie=!0),ge.add(l,o),o.B=0}}function yg(o,l){return Rl(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=l.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=er(g(o.Ga,o,l),Xl(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const b=new pt(this,this.j,o);let C=this.o;if(this.S&&(C?(C=_(C),w(C,this.S)):C=this.S),this.m!==null||this.O||(b.H=C,C=null),this.P)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=Kl(this,b,l),d=Xe(this.I),ne(d,"RID",o),ne(d,"CVER",22),this.D&&ne(d,"X-HTTP-Session-Id",this.D),lr(this,d),C&&(this.O?l="headers="+encodeURIComponent(String(Bl(C)))+"&"+l:this.m&&uo(d,this.m,C)),lo(this.h,b),this.Ua&&ne(d,"TYPE","init"),this.P?(ne(d,"$req",l),ne(d,"SID","null"),b.T=!0,io(b,d,null)):io(b,d,l),this.G=2}}else this.G==3&&(o?Wl(this,o):this.i.length==0||Cl(this.h)||Wl(this))};function Wl(o,l){var d;l?d=l.l:d=o.U++;const p=Xe(o.I);ne(p,"SID",o.K),ne(p,"RID",d),ne(p,"AID",o.T),lr(o,p),o.m&&o.o&&uo(p,o.m,o.o),d=new pt(o,o.j,d,o.B+1),o.m===null&&(d.H=o.o),l&&(o.i=l.D.concat(o.i)),l=Kl(o,d,1e3),d.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),lo(o.h,d),io(d,p,l)}function lr(o,l){o.H&&Q(o.H,function(d,p){ne(l,p,d)}),o.l&&Dl({},function(d,p){ne(l,p,d)})}function Kl(o,l,d){d=Math.min(o.i.length,d);var p=o.l?g(o.l.Na,o.l,o):null;e:{var b=o.i;let C=-1;for(;;){const N=["count="+d];C==-1?0<d?(C=b[0].g,N.push("ofs="+C)):C=0:N.push("ofs="+C);let Z=!0;for(let ve=0;ve<d;ve++){let W=b[ve].g;const be=b[ve].map;if(W-=C,0>W)C=Math.max(0,b[ve].g-100),Z=!1;else try{fg(be,N,"req"+W+"_")}catch{p&&p(be)}}if(Z){p=N.join("&");break e}}}return o=o.i.splice(0,d),l.D=o,p}function Ql(o){if(!o.g&&!o.u){o.Y=1;var l=o.Fa;pe||Bt(),ie||(pe(),ie=!0),ge.add(l,o),o.v=0}}function fo(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=er(g(o.Fa,o),Xl(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,Yl(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=er(g(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,xe(10),Is(this),Yl(this))};function po(o){o.A!=null&&(c.clearTimeout(o.A),o.A=null)}function Yl(o){o.g=new pt(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var l=Xe(o.qa);ne(l,"RID","rpc"),ne(l,"SID",o.K),ne(l,"AID",o.T),ne(l,"CI",o.F?"0":"1"),!o.F&&o.ja&&ne(l,"TO",o.ja),ne(l,"TYPE","xmlhttp"),lr(o,l),o.m&&o.o&&uo(l,o.m,o.o),o.L&&(o.g.I=o.L);var d=o.g;o=o.ia,d.L=1,d.v=gs(Xe(l)),d.m=null,d.P=!0,Tl(d,o)}n.Za=function(){this.C!=null&&(this.C=null,Is(this),fo(this),xe(19))};function ws(o){o.C!=null&&(c.clearTimeout(o.C),o.C=null)}function Jl(o,l){var d=null;if(o.g==l){ws(o),po(o),o.g=null;var p=2}else if(co(o.h,l))d=l.D,Pl(o.h,l),p=1;else return;if(o.G!=0){if(l.o)if(p==1){d=l.m?l.m.length:0,l=Date.now()-l.F;var b=o.B;p=us(),Le(p,new vl(p,d)),Es(o)}else Ql(o);else if(b=l.s,b==3||b==0&&0<l.X||!(p==1&&yg(o,l)||p==2&&fo(o)))switch(d&&0<d.length&&(l=o.h,l.i=l.i.concat(d)),b){case 1:qt(o,5);break;case 4:qt(o,10);break;case 3:qt(o,6);break;default:qt(o,2)}}}function Xl(o,l){let d=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(d*=2),d*l}function qt(o,l){if(o.j.info("Error code "+l),l==2){var d=g(o.fb,o),p=o.Xa;const b=!p;p=new jt(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||ps(p,"https"),gs(p),b?ug(p.toString(),d):hg(p.toString(),d)}else xe(2);o.G=0,o.l&&o.l.sa(l),Zl(o),Gl(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),xe(2)):(this.j.info("Failed to ping google.com"),xe(1))};function Zl(o){if(o.G=0,o.ka=[],o.l){const l=kl(o.h);(l.length!=0||o.i.length!=0)&&(P(o.ka,l),P(o.ka,o.i),o.h.i.length=0,R(o.i),o.i.length=0),o.l.ra()}}function eu(o,l,d){var p=d instanceof jt?Xe(d):new jt(d);if(p.g!="")l&&(p.g=l+"."+p.g),ms(p,p.s);else{var b=c.location;p=b.protocol,l=l?l+"."+b.hostname:b.hostname,b=+b.port;var C=new jt(null);p&&ps(C,p),l&&(C.g=l),b&&ms(C,b),d&&(C.l=d),p=C}return d=o.D,l=o.ya,d&&l&&ne(p,d,l),ne(p,"VER",o.la),lr(o,p),p}function tu(o,l,d){if(l&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=o.Ca&&!o.pa?new oe(new ys({eb:d})):new oe(o.pa),l.Ha(o.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function nu(){}n=nu.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Ts(){}Ts.prototype.g=function(o,l){return new Ue(o,l)};function Ue(o,l){Ae.call(this),this.g=new zl(l),this.l=o,this.h=l&&l.messageUrlParams||null,o=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(o?o["X-WebChannel-Content-Type"]=l.messageContentType:o={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(o?o["X-WebChannel-Client-Profile"]=l.va:o={"X-WebChannel-Client-Profile":l.va}),this.g.S=o,(o=l&&l.Sb)&&!H(o)&&(this.g.m=o),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!H(l)&&(this.g.D=l,o=this.h,o!==null&&l in o&&(o=this.h,l in o&&delete o[l])),this.j=new dn(this)}S(Ue,Ae),Ue.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Ue.prototype.close=function(){ho(this.g)},Ue.prototype.o=function(o){var l=this.g;if(typeof o=="string"){var d={};d.__data__=o,o=d}else this.u&&(d={},d.__data__=Zi(o),o=d);l.i.push(new eg(l.Ya++,o)),l.G==3&&Es(l)},Ue.prototype.N=function(){this.g.l=null,delete this.j,ho(this.g),delete this.g,Ue.aa.N.call(this)};function ru(o){to.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var l=o.__sm__;if(l){e:{for(const d in l){o=d;break e}o=void 0}(this.i=o)&&(o=this.i,l=l!==null&&o in l?l[o]:void 0),this.data=l}else this.data=o}S(ru,to);function su(){no.call(this),this.status=1}S(su,no);function dn(o){this.g=o}S(dn,nu),dn.prototype.ua=function(){Le(this.g,"a")},dn.prototype.ta=function(o){Le(this.g,new ru(o))},dn.prototype.sa=function(o){Le(this.g,new su)},dn.prototype.ra=function(){Le(this.g,"b")},Ts.prototype.createWebChannel=Ts.prototype.g,Ue.prototype.send=Ue.prototype.o,Ue.prototype.open=Ue.prototype.m,Ue.prototype.close=Ue.prototype.close,Rf=function(){return new Ts},Cf=function(){return us()},Sf=$t,ia={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},hs.NO_ERROR=0,hs.TIMEOUT=8,hs.HTTP_ERROR=6,Bs=hs,Il.COMPLETE="complete",bf=Il,ml.EventType=Xn,Xn.OPEN="a",Xn.CLOSE="b",Xn.ERROR="c",Xn.MESSAGE="d",Ae.prototype.listen=Ae.prototype.K,fr=ml,oe.prototype.listenOnce=oe.prototype.L,oe.prototype.getLastError=oe.prototype.Ka,oe.prototype.getLastErrorCode=oe.prototype.Ba,oe.prototype.getStatus=oe.prototype.Z,oe.prototype.getResponseJson=oe.prototype.Oa,oe.prototype.getResponseText=oe.prototype.oa,oe.prototype.send=oe.prototype.ea,oe.prototype.setWithCredentials=oe.prototype.Ha,Af=oe}).apply(typeof Ss<"u"?Ss:typeof self<"u"?self:typeof window<"u"?window:{});const Mu="@firebase/firestore";/**
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
 */class Re{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Re.UNAUTHENTICATED=new Re(null),Re.GOOGLE_CREDENTIALS=new Re("google-credentials-uid"),Re.FIRST_PARTY=new Re("first-party-uid"),Re.MOCK_USER=new Re("mock-user");/**
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
 */let Wn="10.14.0";/**
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
 */const sn=new Oa("@firebase/firestore");function ur(){return sn.logLevel}function x(n,...e){if(sn.logLevel<=j.DEBUG){const t=e.map(Ka);sn.debug(`Firestore (${Wn}): ${n}`,...t)}}function ut(n,...e){if(sn.logLevel<=j.ERROR){const t=e.map(Ka);sn.error(`Firestore (${Wn}): ${n}`,...t)}}function On(n,...e){if(sn.logLevel<=j.WARN){const t=e.map(Ka);sn.warn(`Firestore (${Wn}): ${n}`,...t)}}function Ka(n){if(typeof n=="string")return n;try{/**
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
 */function $(n="Unexpected state"){const e=`FIRESTORE (${Wn}) INTERNAL ASSERTION FAILED: `+n;throw ut(e),new Error(e)}function ae(n,e){n||$()}function z(n,e){return n}/**
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
 */const D={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class L extends ht{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Pt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
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
 */class Pf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class fI{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Re.UNAUTHENTICATED))}shutdown(){}}class pI{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class mI{constructor(e){this.t=e,this.currentUser=Re.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ae(this.o===void 0);let r=this.i;const s=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let i=new Pt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Pt,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Pt)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(ae(typeof r.accessToken=="string"),new Pf(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ae(e===null||typeof e=="string"),new Re(e)}}class gI{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=Re.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class yI{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new gI(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Re.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class _I{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class vI{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){ae(this.o===void 0);const r=i=>{i.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,x("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(ae(typeof t.token=="string"),this.R=t.token,new _I(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function II(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class kf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=II(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function K(n,e){return n<e?-1:n>e?1:0}function Fn(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
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
 */class me{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new L(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new L(D.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new L(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new L(D.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return me.fromMillis(Date.now())}static fromDate(e){return me.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new me(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?K(this.nanoseconds,e.nanoseconds):K(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class U{constructor(e){this.timestamp=e}static fromTimestamp(e){return new U(e)}static min(){return new U(new me(0,0))}static max(){return new U(new me(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class Vr{constructor(e,t,r){t===void 0?t=0:t>e.length&&$(),r===void 0?r=e.length-t:r>e.length-t&&$(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Vr.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Vr?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),a=t.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class re extends Vr{construct(e,t,r){return new re(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new L(D.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new re(t)}static emptyPath(){return new re([])}}const EI=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class De extends Vr{construct(e,t,r){return new De(e,t,r)}static isValidIdentifier(e){return EI.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),De.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new De(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new L(D.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new L(D.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new L(D.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(i(),s++)}if(i(),a)throw new L(D.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new De(t)}static emptyPath(){return new De([])}}/**
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
 */class M{constructor(e){this.path=e}static fromPath(e){return new M(re.fromString(e))}static fromName(e){return new M(re.fromString(e).popFirst(5))}static empty(){return new M(re.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&re.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return re.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new M(new re(e.slice()))}}function wI(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=U.fromTimestamp(r===1e9?new me(t+1,0):new me(t,r));return new Lt(s,M.empty(),e)}function TI(n){return new Lt(n.readTime,n.key,-1)}class Lt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Lt(U.min(),M.empty(),-1)}static max(){return new Lt(U.max(),M.empty(),-1)}}function AI(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=M.comparator(n.documentKey,e.documentKey),t!==0?t:K(n.largestBatchId,e.largestBatchId))}/**
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
 */const bI="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class SI{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function Qa(n){if(n.code!==D.FAILED_PRECONDITION||n.message!==bI)throw n;x("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class k{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&$(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new k((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof k?t:k.resolve(t)}catch(t){return k.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):k.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):k.reject(t)}static resolve(e){return new k((t,r)=>{t(e)})}static reject(e){return new k((t,r)=>{r(e)})}static waitFor(e){return new k((t,r)=>{let s=0,i=0,a=!1;e.forEach(c=>{++s,c.next(()=>{++i,a&&i===s&&t()},u=>r(u))}),a=!0,i===s&&t()})}static or(e){let t=k.resolve(!1);for(const r of e)t=t.next(s=>s?k.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new k((r,s)=>{const i=e.length,a=new Array(i);let c=0;for(let u=0;u<i;u++){const h=u;t(e[h]).next(f=>{a[h]=f,++c,c===i&&r(a)},f=>s(f))}})}static doWhile(e,t){return new k((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function CI(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Jr(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class Ya{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Ya.oe=-1;function Ti(n){return n==null}function si(n){return n===0&&1/n==-1/0}function RI(n){return typeof n=="number"&&Number.isInteger(n)&&!si(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */function Ou(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Xr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Df(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class ue{constructor(e,t){this.comparator=e,this.root=t||Ie.EMPTY}insert(e,t){return new ue(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ie.BLACK,null,null))}remove(e){return new ue(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ie.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Cs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Cs(this.root,e,this.comparator,!1)}getReverseIterator(){return new Cs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Cs(this.root,e,this.comparator,!0)}}class Cs{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ie{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Ie.RED,this.left=s??Ie.EMPTY,this.right=i??Ie.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Ie(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Ie.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Ie.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ie.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ie.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw $();const e=this.left.check();if(e!==this.right.check())throw $();return e+(this.isRed()?0:1)}}Ie.EMPTY=null,Ie.RED=!0,Ie.BLACK=!1;Ie.EMPTY=new class{constructor(){this.size=0}get key(){throw $()}get value(){throw $()}get color(){throw $()}get left(){throw $()}get right(){throw $()}copy(e,t,r,s,i){return this}insert(e,t,r){return new Ie(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class we{constructor(e){this.comparator=e,this.data=new ue(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Fu(this.data.getIterator())}getIteratorFrom(e){return new Fu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof we)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new we(this.comparator);return t.data=e,t}}class Fu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Tt{constructor(e){this.fields=e,e.sort(De.comparator)}static empty(){return new Tt([])}unionWith(e){let t=new we(De.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Tt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Fn(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class Nf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Te{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Nf("Invalid base64 string: "+i):i}}(e);return new Te(t)}static fromUint8Array(e){const t=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new Te(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return K(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Te.EMPTY_BYTE_STRING=new Te("");const PI=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function xt(n){if(ae(!!n),typeof n=="string"){let e=0;const t=PI.exec(n);if(ae(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:le(n.seconds),nanos:le(n.nanos)}}function le(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function on(n){return typeof n=="string"?Te.fromBase64String(n):Te.fromUint8Array(n)}/**
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
 */function Ja(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Xa(n){const e=n.mapValue.fields.__previous_value__;return Ja(e)?Xa(e):e}function Lr(n){const e=xt(n.mapValue.fields.__local_write_time__.timestampValue);return new me(e.seconds,e.nanos)}/**
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
 */class kI{constructor(e,t,r,s,i,a,c,u,h){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h}}class xr{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new xr("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof xr&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const Rs={mapValue:{}};function an(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ja(n)?4:NI(n)?9007199254740991:DI(n)?10:11:$()}function Je(n,e){if(n===e)return!0;const t=an(n);if(t!==an(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Lr(n).isEqual(Lr(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=xt(s.timestampValue),c=xt(i.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return on(s.bytesValue).isEqual(on(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return le(s.geoPointValue.latitude)===le(i.geoPointValue.latitude)&&le(s.geoPointValue.longitude)===le(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return le(s.integerValue)===le(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=le(s.doubleValue),c=le(i.doubleValue);return a===c?si(a)===si(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return Fn(n.arrayValue.values||[],e.arrayValue.values||[],Je);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},c=i.mapValue.fields||{};if(Ou(a)!==Ou(c))return!1;for(const u in a)if(a.hasOwnProperty(u)&&(c[u]===void 0||!Je(a[u],c[u])))return!1;return!0}(n,e);default:return $()}}function Mr(n,e){return(n.values||[]).find(t=>Je(t,e))!==void 0}function Bn(n,e){if(n===e)return 0;const t=an(n),r=an(e);if(t!==r)return K(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return K(n.booleanValue,e.booleanValue);case 2:return function(i,a){const c=le(i.integerValue||i.doubleValue),u=le(a.integerValue||a.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return Bu(n.timestampValue,e.timestampValue);case 4:return Bu(Lr(n),Lr(e));case 5:return K(n.stringValue,e.stringValue);case 6:return function(i,a){const c=on(i),u=on(a);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(i,a){const c=i.split("/"),u=a.split("/");for(let h=0;h<c.length&&h<u.length;h++){const f=K(c[h],u[h]);if(f!==0)return f}return K(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,a){const c=K(le(i.latitude),le(a.latitude));return c!==0?c:K(le(i.longitude),le(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Uu(n.arrayValue,e.arrayValue);case 10:return function(i,a){var c,u,h,f;const m=i.fields||{},g=a.fields||{},E=(c=m.value)===null||c===void 0?void 0:c.arrayValue,S=(u=g.value)===null||u===void 0?void 0:u.arrayValue,R=K(((h=E==null?void 0:E.values)===null||h===void 0?void 0:h.length)||0,((f=S==null?void 0:S.values)===null||f===void 0?void 0:f.length)||0);return R!==0?R:Uu(E,S)}(n.mapValue,e.mapValue);case 11:return function(i,a){if(i===Rs.mapValue&&a===Rs.mapValue)return 0;if(i===Rs.mapValue)return 1;if(a===Rs.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),h=a.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const g=K(u[m],f[m]);if(g!==0)return g;const E=Bn(c[u[m]],h[f[m]]);if(E!==0)return E}return K(u.length,f.length)}(n.mapValue,e.mapValue);default:throw $()}}function Bu(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return K(n,e);const t=xt(n),r=xt(e),s=K(t.seconds,r.seconds);return s!==0?s:K(t.nanos,r.nanos)}function Uu(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Bn(t[s],r[s]);if(i)return i}return K(t.length,r.length)}function Un(n){return oa(n)}function oa(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=xt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return on(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return M.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=oa(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${oa(t.fields[a])}`;return s+"}"}(n.mapValue):$()}function $u(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function aa(n){return!!n&&"integerValue"in n}function Za(n){return!!n&&"arrayValue"in n}function Hu(n){return!!n&&"nullValue"in n}function ju(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function To(n){return!!n&&"mapValue"in n}function DI(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function wr(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Xr(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=wr(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=wr(n.arrayValue.values[t]);return e}return Object.assign({},n)}function NI(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class We{constructor(e){this.value=e}static empty(){return new We({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!To(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=wr(t)}setAll(e){let t=De.emptyPath(),r={},s=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}a?r[c.lastSegment()]=wr(a):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());To(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Je(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];To(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Xr(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new We(wr(this.value))}}/**
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
 */class ke{constructor(e,t,r,s,i,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=c}static newInvalidDocument(e){return new ke(e,0,U.min(),U.min(),U.min(),We.empty(),0)}static newFoundDocument(e,t,r,s){return new ke(e,1,t,U.min(),r,s,0)}static newNoDocument(e,t){return new ke(e,2,t,U.min(),U.min(),We.empty(),0)}static newUnknownDocument(e,t){return new ke(e,3,t,U.min(),U.min(),We.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=We.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=We.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ke&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ke(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class ii{constructor(e,t){this.position=e,this.inclusive=t}}function qu(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=M.comparator(M.fromName(a.referenceValue),t.key):r=Bn(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function zu(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Je(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Or{constructor(e,t="asc"){this.field=e,this.dir=t}}function VI(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Vf{}class fe extends Vf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new xI(e,t,r):t==="array-contains"?new FI(e,r):t==="in"?new BI(e,r):t==="not-in"?new UI(e,r):t==="array-contains-any"?new $I(e,r):new fe(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new MI(e,r):new OI(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Bn(t,this.value)):t!==null&&an(this.value)===an(t)&&this.matchesComparison(Bn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return $()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ze extends Vf{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new ze(e,t)}matches(e){return Lf(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Lf(n){return n.op==="and"}function xf(n){return LI(n)&&Lf(n)}function LI(n){for(const e of n.filters)if(e instanceof ze)return!1;return!0}function ca(n){if(n instanceof fe)return n.field.canonicalString()+n.op.toString()+Un(n.value);if(xf(n))return n.filters.map(e=>ca(e)).join(",");{const e=n.filters.map(t=>ca(t)).join(",");return`${n.op}(${e})`}}function Mf(n,e){return n instanceof fe?function(r,s){return s instanceof fe&&r.op===s.op&&r.field.isEqual(s.field)&&Je(r.value,s.value)}(n,e):n instanceof ze?function(r,s){return s instanceof ze&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,c)=>i&&Mf(a,s.filters[c]),!0):!1}(n,e):void $()}function Of(n){return n instanceof fe?function(t){return`${t.field.canonicalString()} ${t.op} ${Un(t.value)}`}(n):n instanceof ze?function(t){return t.op.toString()+" {"+t.getFilters().map(Of).join(" ,")+"}"}(n):"Filter"}class xI extends fe{constructor(e,t,r){super(e,t,r),this.key=M.fromName(r.referenceValue)}matches(e){const t=M.comparator(e.key,this.key);return this.matchesComparison(t)}}class MI extends fe{constructor(e,t){super(e,"in",t),this.keys=Ff("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class OI extends fe{constructor(e,t){super(e,"not-in",t),this.keys=Ff("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Ff(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>M.fromName(r.referenceValue))}class FI extends fe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Za(t)&&Mr(t.arrayValue,this.value)}}class BI extends fe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Mr(this.value.arrayValue,t)}}class UI extends fe{constructor(e,t){super(e,"not-in",t)}matches(e){if(Mr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Mr(this.value.arrayValue,t)}}class $I extends fe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Za(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Mr(this.value.arrayValue,r))}}/**
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
 */class HI{constructor(e,t=null,r=[],s=[],i=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=c,this.ue=null}}function Gu(n,e=null,t=[],r=[],s=null,i=null,a=null){return new HI(n,e,t,r,s,i,a)}function ec(n){const e=z(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>ca(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Ti(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Un(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Un(r)).join(",")),e.ue=t}return e.ue}function tc(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!VI(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Mf(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!zu(n.startAt,e.startAt)&&zu(n.endAt,e.endAt)}function la(n){return M.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class Kn{constructor(e,t=null,r=[],s=[],i=null,a="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=c,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function jI(n,e,t,r,s,i,a,c){return new Kn(n,e,t,r,s,i,a,c)}function Ai(n){return new Kn(n)}function Wu(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Bf(n){return n.collectionGroup!==null}function Tr(n){const e=z(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new we(De.comparator);return a.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Or(i,r))}),t.has(De.keyField().canonicalString())||e.ce.push(new Or(De.keyField(),r))}return e.ce}function Ye(n){const e=z(n);return e.le||(e.le=qI(e,Tr(n))),e.le}function qI(n,e){if(n.limitType==="F")return Gu(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Or(s.field,i)});const t=n.endAt?new ii(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new ii(n.startAt.position,n.startAt.inclusive):null;return Gu(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ua(n,e){const t=n.filters.concat([e]);return new Kn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function oi(n,e,t){return new Kn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function bi(n,e){return tc(Ye(n),Ye(e))&&n.limitType===e.limitType}function Uf(n){return`${ec(Ye(n))}|lt:${n.limitType}`}function In(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Of(s)).join(", ")}]`),Ti(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Un(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Un(s)).join(",")),`Target(${r})`}(Ye(n))}; limitType=${n.limitType})`}function Si(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):M.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of Tr(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(a,c,u){const h=qu(a,c,u);return a.inclusive?h<=0:h<0}(r.startAt,Tr(r),s)||r.endAt&&!function(a,c,u){const h=qu(a,c,u);return a.inclusive?h>=0:h>0}(r.endAt,Tr(r),s))}(n,e)}function zI(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function $f(n){return(e,t)=>{let r=!1;for(const s of Tr(n)){const i=GI(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function GI(n,e,t){const r=n.field.isKeyField()?M.comparator(e.key,t.key):function(i,a,c){const u=a.data.field(i),h=c.data.field(i);return u!==null&&h!==null?Bn(u,h):$()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return $()}}/**
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
 */class Qn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Xr(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Df(this.inner)}size(){return this.innerSize}}/**
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
 */const WI=new ue(M.comparator);function Mt(){return WI}const Hf=new ue(M.comparator);function pr(...n){let e=Hf;for(const t of n)e=e.insert(t.key,t);return e}function KI(n){let e=Hf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Jt(){return Ar()}function jf(){return Ar()}function Ar(){return new Qn(n=>n.toString(),(n,e)=>n.isEqual(e))}const QI=new we(M.comparator);function G(...n){let e=QI;for(const t of n)e=e.add(t);return e}const YI=new we(K);function JI(){return YI}/**
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
 */function nc(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:si(e)?"-0":e}}function qf(n){return{integerValue:""+n}}function XI(n,e){return RI(e)?qf(e):nc(n,e)}/**
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
 */class Ci{constructor(){this._=void 0}}function ZI(n,e,t){return n instanceof ha?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Ja(i)&&(i=Xa(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(t,e):n instanceof ai?zf(n,e):n instanceof ci?Gf(n,e):function(s,i){const a=tE(s,i),c=Ku(a)+Ku(s.Pe);return aa(a)&&aa(s.Pe)?qf(c):nc(s.serializer,c)}(n,e)}function eE(n,e,t){return n instanceof ai?zf(n,e):n instanceof ci?Gf(n,e):t}function tE(n,e){return n instanceof da?function(r){return aa(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class ha extends Ci{}class ai extends Ci{constructor(e){super(),this.elements=e}}function zf(n,e){const t=Wf(e);for(const r of n.elements)t.some(s=>Je(s,r))||t.push(r);return{arrayValue:{values:t}}}class ci extends Ci{constructor(e){super(),this.elements=e}}function Gf(n,e){let t=Wf(e);for(const r of n.elements)t=t.filter(s=>!Je(s,r));return{arrayValue:{values:t}}}class da extends Ci{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Ku(n){return le(n.integerValue||n.doubleValue)}function Wf(n){return Za(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function nE(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof ai&&s instanceof ai||r instanceof ci&&s instanceof ci?Fn(r.elements,s.elements,Je):r instanceof da&&s instanceof da?Je(r.Pe,s.Pe):r instanceof ha&&s instanceof ha}(n.transform,e.transform)}class Zt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Zt}static exists(e){return new Zt(void 0,e)}static updateTime(e){return new Zt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Us(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class rc{}function Kf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new sE(n.key,Zt.none()):new sc(n.key,n.data,Zt.none());{const t=n.data,r=We.empty();let s=new we(De.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new Ri(n.key,r,new Tt(s.toArray()),Zt.none())}}function rE(n,e,t){n instanceof sc?function(s,i,a){const c=s.value.clone(),u=Yu(s.fieldTransforms,i,a.transformResults);c.setAll(u),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof Ri?function(s,i,a){if(!Us(s.precondition,i))return void i.convertToUnknownDocument(a.version);const c=Yu(s.fieldTransforms,i,a.transformResults),u=i.data;u.setAll(Qf(s)),u.setAll(c),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function br(n,e,t,r){return n instanceof sc?function(i,a,c,u){if(!Us(i.precondition,a))return c;const h=i.value.clone(),f=Ju(i.fieldTransforms,u,a);return h.setAll(f),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof Ri?function(i,a,c,u){if(!Us(i.precondition,a))return c;const h=Ju(i.fieldTransforms,u,a),f=a.data;return f.setAll(Qf(i)),f.setAll(h),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(i,a,c){return Us(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function Qu(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Fn(r,s,(i,a)=>nE(i,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class sc extends rc{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Ri extends rc{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Qf(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Yu(n,e,t){const r=new Map;ae(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,c=e.data.field(i.field);r.set(i.field,eE(a,c,t[s]))}return r}function Ju(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,ZI(i,a,e))}return r}class sE extends rc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class iE{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&rE(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=br(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=br(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=jf();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let c=this.applyToLocalView(a,i.mutatedFields);c=t.has(s.key)?null:c;const u=Kf(a,c);u!==null&&r.set(s.key,u),a.isValidDocument()||a.convertToNoDocument(U.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),G())}isEqual(e){return this.batchId===e.batchId&&Fn(this.mutations,e.mutations,(t,r)=>Qu(t,r))&&Fn(this.baseMutations,e.baseMutations,(t,r)=>Qu(t,r))}}/**
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
 */class oE{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class aE{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var de,q;function Yf(n){if(n===void 0)return ut("GRPC error has no .code"),D.UNKNOWN;switch(n){case de.OK:return D.OK;case de.CANCELLED:return D.CANCELLED;case de.UNKNOWN:return D.UNKNOWN;case de.DEADLINE_EXCEEDED:return D.DEADLINE_EXCEEDED;case de.RESOURCE_EXHAUSTED:return D.RESOURCE_EXHAUSTED;case de.INTERNAL:return D.INTERNAL;case de.UNAVAILABLE:return D.UNAVAILABLE;case de.UNAUTHENTICATED:return D.UNAUTHENTICATED;case de.INVALID_ARGUMENT:return D.INVALID_ARGUMENT;case de.NOT_FOUND:return D.NOT_FOUND;case de.ALREADY_EXISTS:return D.ALREADY_EXISTS;case de.PERMISSION_DENIED:return D.PERMISSION_DENIED;case de.FAILED_PRECONDITION:return D.FAILED_PRECONDITION;case de.ABORTED:return D.ABORTED;case de.OUT_OF_RANGE:return D.OUT_OF_RANGE;case de.UNIMPLEMENTED:return D.UNIMPLEMENTED;case de.DATA_LOSS:return D.DATA_LOSS;default:return $()}}(q=de||(de={}))[q.OK=0]="OK",q[q.CANCELLED=1]="CANCELLED",q[q.UNKNOWN=2]="UNKNOWN",q[q.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",q[q.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",q[q.NOT_FOUND=5]="NOT_FOUND",q[q.ALREADY_EXISTS=6]="ALREADY_EXISTS",q[q.PERMISSION_DENIED=7]="PERMISSION_DENIED",q[q.UNAUTHENTICATED=16]="UNAUTHENTICATED",q[q.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",q[q.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",q[q.ABORTED=10]="ABORTED",q[q.OUT_OF_RANGE=11]="OUT_OF_RANGE",q[q.UNIMPLEMENTED=12]="UNIMPLEMENTED",q[q.INTERNAL=13]="INTERNAL",q[q.UNAVAILABLE=14]="UNAVAILABLE",q[q.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function cE(){return new TextEncoder}/**
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
 */const lE=new Xt([4294967295,4294967295],0);function Xu(n){const e=cE().encode(n),t=new Tf;return t.update(e),new Uint8Array(t.digest())}function Zu(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Xt([t,r],0),new Xt([s,i],0)]}class ic{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new mr(`Invalid padding: ${t}`);if(r<0)throw new mr(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new mr(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new mr(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Xt.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(Xt.fromNumber(r)));return s.compare(lE)===1&&(s=new Xt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=Xu(e),[r,s]=Zu(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new ic(i,s,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.Ie===0)return;const t=Xu(e),[r,s]=Zu(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class mr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Pi{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Zr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Pi(U.min(),s,new ue(K),Mt(),G())}}class Zr{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Zr(r,t,G(),G(),G())}}/**
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
 */class $s{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class Jf{constructor(e,t){this.targetId=e,this.me=t}}class Xf{constructor(e,t,r=Te.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class eh{constructor(){this.fe=0,this.ge=nh(),this.pe=Te.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=G(),t=G(),r=G();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:$()}}),new Zr(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=nh()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,ae(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class uE{constructor(e){this.Le=e,this.Be=new Map,this.ke=Mt(),this.qe=th(),this.Qe=new ue(K)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:$()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(la(i))if(r===0){const a=new M(i.path);this.Ue(t,a,ke.newNoDocument(a,U.min()))}else ae(r===1);else{const a=this.Ye(t);if(a!==r){const c=this.Ze(e),u=c?this.Xe(c,e,a):1;if(u!==0){this.je(t);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,h)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,c;try{a=on(r).toUint8Array()}catch(u){if(u instanceof Nf)return On("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new ic(a,s,i)}catch(u){return On(u instanceof mr?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.Ie===0?null:c}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const a=this.Le.tt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,a)=>{const c=this.Je(a);if(c){if(i.current&&la(c.target)){const u=new M(c.target.path);this.ke.get(u)!==null||this.it(a,u)||this.Ue(a,u,ke.newNoDocument(u,e))}i.be&&(t.set(a,i.ve()),i.Ce())}});let r=G();this.qe.forEach((i,a)=>{let c=!0;a.forEachWhile(u=>{const h=this.Je(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new Pi(e,t,this.Qe,this.ke,r);return this.ke=Mt(),this.qe=th(),this.Qe=new ue(K),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new eh,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new we(K),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||x("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new eh),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function th(){return new ue(M.comparator)}function nh(){return new ue(M.comparator)}const hE={asc:"ASCENDING",desc:"DESCENDING"},dE={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},fE={and:"AND",or:"OR"};class pE{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function fa(n,e){return n.useProto3Json||Ti(e)?e:{value:e}}function pa(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Zf(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function kn(n){return ae(!!n),U.fromTimestamp(function(t){const r=xt(t);return new me(r.seconds,r.nanos)}(n))}function ep(n,e){return ma(n,e).canonicalString()}function ma(n,e){const t=function(s){return new re(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function tp(n){const e=re.fromString(n);return ae(op(e)),e}function Ao(n,e){const t=tp(e);if(t.get(1)!==n.databaseId.projectId)throw new L(D.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new L(D.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new M(rp(t))}function np(n,e){return ep(n.databaseId,e)}function mE(n){const e=tp(n);return e.length===4?re.emptyPath():rp(e)}function rh(n){return new re(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function rp(n){return ae(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function gE(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:$()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,f){return h.useProto3Json?(ae(f===void 0||typeof f=="string"),Te.fromBase64String(f||"")):(ae(f===void 0||f instanceof Buffer||f instanceof Uint8Array),Te.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(h){const f=h.code===void 0?D.UNKNOWN:Yf(h.code);return new L(f,h.message||"")}(a);t=new Xf(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ao(n,r.document.name),i=kn(r.document.updateTime),a=r.document.createTime?kn(r.document.createTime):U.min(),c=new We({mapValue:{fields:r.document.fields}}),u=ke.newFoundDocument(s,i,a,c),h=r.targetIds||[],f=r.removedTargetIds||[];t=new $s(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Ao(n,r.document),i=r.readTime?kn(r.readTime):U.min(),a=ke.newNoDocument(s,i),c=r.removedTargetIds||[];t=new $s([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Ao(n,r.document),i=r.removedTargetIds||[];t=new $s([],i,s,null)}else{if(!("filter"in e))return $();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new aE(s,i),c=r.targetId;t=new Jf(c,a)}}return t}function yE(n,e){return{documents:[np(n,e.path)]}}function _E(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=np(n,s);const i=function(h){if(h.length!==0)return ip(ze.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const a=function(h){if(h.length!==0)return h.map(f=>function(g){return{field:En(g.field),direction:EE(g.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=fa(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:t,parent:s}}function vE(n){let e=mE(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){ae(r===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const g=sp(m);return g instanceof ze&&xf(g)?g.getFilters():[g]}(t.where));let a=[];t.orderBy&&(a=function(m){return m.map(g=>function(S){return new Or(wn(S.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(S.direction))}(g))}(t.orderBy));let c=null;t.limit&&(c=function(m){let g;return g=typeof m=="object"?m.value:m,Ti(g)?null:g}(t.limit));let u=null;t.startAt&&(u=function(m){const g=!!m.before,E=m.values||[];return new ii(E,g)}(t.startAt));let h=null;return t.endAt&&(h=function(m){const g=!m.before,E=m.values||[];return new ii(E,g)}(t.endAt)),jI(e,s,a,i,c,"F",u,h)}function IE(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return $()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function sp(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=wn(t.unaryFilter.field);return fe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=wn(t.unaryFilter.field);return fe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=wn(t.unaryFilter.field);return fe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=wn(t.unaryFilter.field);return fe.create(a,"!=",{nullValue:"NULL_VALUE"});default:return $()}}(n):n.fieldFilter!==void 0?function(t){return fe.create(wn(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return $()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return ze.create(t.compositeFilter.filters.map(r=>sp(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return $()}}(t.compositeFilter.op))}(n):$()}function EE(n){return hE[n]}function wE(n){return dE[n]}function TE(n){return fE[n]}function En(n){return{fieldPath:n.canonicalString()}}function wn(n){return De.fromServerFormat(n.fieldPath)}function ip(n){return n instanceof fe?function(t){if(t.op==="=="){if(ju(t.value))return{unaryFilter:{field:En(t.field),op:"IS_NAN"}};if(Hu(t.value))return{unaryFilter:{field:En(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(ju(t.value))return{unaryFilter:{field:En(t.field),op:"IS_NOT_NAN"}};if(Hu(t.value))return{unaryFilter:{field:En(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:En(t.field),op:wE(t.op),value:t.value}}}(n):n instanceof ze?function(t){const r=t.getFilters().map(s=>ip(s));return r.length===1?r[0]:{compositeFilter:{op:TE(t.op),filters:r}}}(n):$()}function op(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */class At{constructor(e,t,r,s,i=U.min(),a=U.min(),c=Te.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new At(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new At(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new At(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new At(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class AE{constructor(e){this.ct=e}}function bE(n){const e=vE({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?oi(e,e.limit,"L"):e}/**
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
 */class SE{constructor(){this.un=new CE}addToCollectionParentIndex(e,t){return this.un.add(t),k.resolve()}getCollectionParents(e,t){return k.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return k.resolve()}deleteFieldIndex(e,t){return k.resolve()}deleteAllFieldIndexes(e){return k.resolve()}createTargetIndexes(e,t){return k.resolve()}getDocumentsMatchingTarget(e,t){return k.resolve(null)}getIndexType(e,t){return k.resolve(0)}getFieldIndexes(e,t){return k.resolve([])}getNextCollectionGroupToUpdate(e){return k.resolve(null)}getMinOffset(e,t){return k.resolve(Lt.min())}getMinOffsetFromCollectionGroup(e,t){return k.resolve(Lt.min())}updateCollectionGroup(e,t,r){return k.resolve()}updateIndexEntries(e,t){return k.resolve()}}class CE{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new we(re.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new we(re.comparator)).toArray()}}/**
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
 */class $n{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new $n(0)}static kn(){return new $n(-1)}}/**
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
 */class RE{constructor(){this.changes=new Qn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,ke.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?k.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class PE{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class kE{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&br(r.mutation,s,Tt.empty(),me.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,G()).next(()=>r))}getLocalViewOfDocuments(e,t,r=G()){const s=Jt();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let a=pr();return i.forEach((c,u)=>{a=a.insert(c,u.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=Jt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,G()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,s){let i=Mt();const a=Ar(),c=function(){return Ar()}();return t.forEach((u,h)=>{const f=r.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof Ri)?i=i.insert(h.key,h):f!==void 0?(a.set(h.key,f.mutation.getFieldMask()),br(f.mutation,h,f.mutation.getFieldMask(),me.now())):a.set(h.key,Tt.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((h,f)=>a.set(h,f)),t.forEach((h,f)=>{var m;return c.set(h,new PE(f,(m=a.get(h))!==null&&m!==void 0?m:null))}),c))}recalculateAndSaveOverlays(e,t){const r=Ar();let s=new ue((a,c)=>a-c),i=G();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(u=>{const h=t.get(u);if(h===null)return;let f=r.get(u)||Tt.empty();f=c.applyToLocalView(h,f),r.set(u,f);const m=(s.get(c.batchId)||G()).add(u);s=s.insert(c.batchId,m)})}).next(()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),h=u.key,f=u.value,m=jf();f.forEach(g=>{if(!i.has(g)){const E=Kf(t.get(g),r.get(g));E!==null&&m.set(g,E),i=i.add(g)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,m))}return k.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(a){return M.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Bf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):k.resolve(Jt());let c=-1,u=i;return a.next(h=>k.forEach(h,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(f)?k.resolve():this.remoteDocumentCache.getEntry(e,f).next(g=>{u=u.insert(f,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,u,h,G())).next(f=>({batchId:c,changes:KI(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new M(t)).next(r=>{let s=pr();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=pr();return this.indexManager.getCollectionParents(e,i).next(c=>k.forEach(c,u=>{const h=function(m,g){return new Kn(g,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(f=>{f.forEach((m,g)=>{a=a.insert(m,g)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(a=>{i.forEach((u,h)=>{const f=h.getKey();a.get(f)===null&&(a=a.insert(f,ke.newInvalidDocument(f)))});let c=pr();return a.forEach((u,h)=>{const f=i.get(u);f!==void 0&&br(f.mutation,h,Tt.empty(),me.now()),Si(t,h)&&(c=c.insert(u,h))}),c})}}/**
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
 */class DE{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return k.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:kn(s.createTime)}}(t)),k.resolve()}getNamedQuery(e,t){return k.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:bE(s.bundledQuery),readTime:kn(s.readTime)}}(t)),k.resolve()}}/**
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
 */class NE{constructor(){this.overlays=new ue(M.comparator),this.Ir=new Map}getOverlay(e,t){return k.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Jt();return k.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),k.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),k.resolve()}getOverlaysForCollection(e,t,r){const s=Jt(),i=t.length+1,a=new M(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return k.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new ue((h,f)=>h-f);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let f=i.get(h.largestBatchId);f===null&&(f=Jt(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=Jt(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>c.set(h,f)),!(c.size()>=s)););return k.resolve(c)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new oE(t,r));let i=this.Ir.get(t);i===void 0&&(i=G(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
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
 */class VE{constructor(){this.sessionToken=Te.EMPTY_BYTE_STRING}getSessionToken(e){return k.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,k.resolve()}}/**
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
 */class oc{constructor(){this.Tr=new we(_e.Er),this.dr=new we(_e.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new _e(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new _e(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new M(new re([])),r=new _e(t,e),s=new _e(t,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new M(new re([])),r=new _e(t,e),s=new _e(t,e+1);let i=G();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const t=new _e(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class _e{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return M.comparator(e.key,t.key)||K(e.wr,t.wr)}static Ar(e,t){return K(e.wr,t.wr)||M.comparator(e.key,t.key)}}/**
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
 */class LE{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new we(_e.Er)}checkEmpty(e){return k.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new iE(i,t,r,s);this.mutationQueue.push(a);for(const c of s)this.br=this.br.add(new _e(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return k.resolve(a)}lookupMutationBatch(e,t){return k.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return k.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return k.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return k.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new _e(t,0),s=new _e(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const c=this.Dr(a.wr);i.push(c)}),k.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new we(K);return t.forEach(s=>{const i=new _e(s,0),a=new _e(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],c=>{r=r.add(c.wr)})}),k.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;M.isDocumentKey(i)||(i=i.child(""));const a=new _e(new M(i),0);let c=new we(K);return this.br.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(u.wr)),!0)},a),k.resolve(this.Cr(c))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){ae(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return k.forEach(t.mutations,s=>{const i=new _e(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new _e(t,0),s=this.br.firstAfterOrEqual(r);return k.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,k.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class xE{constructor(e){this.Mr=e,this.docs=function(){return new ue(M.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return k.resolve(r?r.document.mutableCopy():ke.newInvalidDocument(t))}getEntries(e,t){let r=Mt();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():ke.newInvalidDocument(s))}),k.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=Mt();const a=t.path,c=new M(a.child("")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||AI(TI(f),r)<=0||(s.has(f.key)||Si(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return k.resolve(i)}getAllFromCollectionGroup(e,t,r,s){$()}Or(e,t){return k.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new ME(this)}getSize(e){return k.resolve(this.size)}}class ME extends RE{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),k.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
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
 */class OE{constructor(e){this.persistence=e,this.Nr=new Qn(t=>ec(t),tc),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.Lr=0,this.Br=new oc,this.targetCount=0,this.kr=$n.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),k.resolve()}getLastRemoteSnapshotVersion(e){return k.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return k.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),k.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),k.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new $n(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,k.resolve()}updateTargetData(e,t){return this.Kn(t),k.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,k.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),k.waitFor(i).next(()=>s)}getTargetCount(e){return k.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return k.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),k.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),k.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),k.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return k.resolve(r)}containsKey(e,t){return k.resolve(this.Br.containsKey(t))}}/**
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
 */class FE{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Ya(0),this.Kr=!1,this.Kr=!0,this.$r=new VE,this.referenceDelegate=e(this),this.Ur=new OE(this),this.indexManager=new SE,this.remoteDocumentCache=function(s){return new xE(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new AE(t),this.Gr=new DE(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new NE,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new LE(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){x("MemoryPersistence","Starting transaction:",e);const s=new BE(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return k.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class BE extends SI{constructor(e){super(),this.currentSequenceNumber=e}}class ac{constructor(e){this.persistence=e,this.Jr=new oc,this.Yr=null}static Zr(e){return new ac(e)}get Xr(){if(this.Yr)return this.Yr;throw $()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),k.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),k.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),k.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return k.forEach(this.Xr,r=>{const s=M.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,U.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return k.or([()=>k.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
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
 */class cc{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=G(),s=G();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new cc(e,t.fromCache,r,s)}}/**
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
 */class UE{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class $E{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Yg()?8:CI(Ve())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new UE;return this.Xi(e,t,a).next(c=>{if(i.result=c,this.zi)return this.es(e,t,a,c.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(ur()<=j.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",In(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),k.resolve()):(ur()<=j.DEBUG&&x("QueryEngine","Query:",In(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(ur()<=j.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",In(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ye(t))):k.resolve())}Yi(e,t){if(Wu(t))return k.resolve(null);let r=Ye(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=oi(t,null,"F"),r=Ye(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=G(...i);return this.Ji.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{const h=this.ts(t,c);return this.ns(t,h,a,u.readTime)?this.Yi(e,oi(t,null,"F")):this.rs(e,h,t,u)}))})))}Zi(e,t,r,s){return Wu(t)||s.isEqual(U.min())?k.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(t,i);return this.ns(t,a,r,s)?k.resolve(null):(ur()<=j.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),In(t)),this.rs(e,a,t,wI(s,-1)).next(c=>c))})}ts(e,t){let r=new we($f(e));return t.forEach((s,i)=>{Si(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return ur()<=j.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",In(t)),this.Ji.getDocumentsMatchingQuery(e,t,Lt.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
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
 */class HE{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new ue(K),this._s=new Qn(i=>ec(i),tc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new kE(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function jE(n,e,t,r){return new HE(n,e,t,r)}async function ap(n,e){const t=z(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],c=[];let u=G();for(const h of s){a.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of i){c.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(h=>({hs:h,removedBatchIds:a,addedBatchIds:c}))})})}function cp(n){const e=z(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function qE(n,e){const t=z(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const c=[];e.targetChanges.forEach((f,m)=>{const g=s.get(m);if(!g)return;c.push(t.Ur.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.Ur.addMatchingKeys(i,f.addedDocuments,m)));let E=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?E=E.withResumeToken(Te.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):f.resumeToken.approximateByteSize()>0&&(E=E.withResumeToken(f.resumeToken,r)),s=s.insert(m,E),function(R,P,F){return R.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-R.snapshotVersion.toMicroseconds()>=3e8?!0:F.addedDocuments.size+F.modifiedDocuments.size+F.removedDocuments.size>0}(g,E,f)&&c.push(t.Ur.updateTargetData(i,E))});let u=Mt(),h=G();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),c.push(zE(i,a,e.documentUpdates).next(f=>{u=f.Ps,h=f.Is})),!r.isEqual(U.min())){const f=t.Ur.getLastRemoteSnapshotVersion(i).next(m=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(f)}return k.waitFor(c).next(()=>a.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,u,h)).next(()=>u)}).then(i=>(t.os=s,i))}function zE(n,e,t){let r=G(),s=G();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let a=Mt();return t.forEach((c,u)=>{const h=i.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(U.min())?(e.removeEntry(c,u.readTime),a=a.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),a=a.insert(c,u)):x("LocalStore","Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)}),{Ps:a,Is:s}})}function GE(n,e){const t=z(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,k.resolve(s)):t.Ur.allocateTargetId(r).next(a=>(s=new At(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function ga(n,e,t){const r=z(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Jr(a))throw a;x("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function sh(n,e,t){const r=z(n);let s=U.min(),i=G();return r.persistence.runTransaction("Execute query","readwrite",a=>function(u,h,f){const m=z(u),g=m._s.get(f);return g!==void 0?k.resolve(m.os.get(g)):m.Ur.getTargetData(h,f)}(r,a,Ye(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,c.targetId).next(u=>{i=u})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?s:U.min(),t?i:G())).next(c=>(WE(r,zI(e),c),{documents:c,Ts:i})))}function WE(n,e,t){let r=n.us.get(e)||U.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}class ih{constructor(){this.activeTargetIds=JI()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class KE{constructor(){this.so=new ih,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new ih,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class QE{_o(e){}shutdown(){}}/**
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
 */class oh{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){x("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){x("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let Ps=null;function bo(){return Ps===null?Ps=function(){return 268435456+Math.round(2147483648*Math.random())}():Ps++,"0x"+Ps.toString(16)}/**
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
 */const YE={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
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
 */class JE{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
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
 */const Ce="WebChannelConnection";class XE extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,a){const c=bo(),u=this.xo(t,r.toUriEncodedString());x("RestConnection",`Sending RPC '${t}' ${c}:`,u,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,a),this.No(t,u,h,s).then(f=>(x("RestConnection",`Received RPC '${t}' ${c}: `,f),f),f=>{throw On("RestConnection",`RPC '${t}' ${c} failed with error: `,f,"url: ",u,"request:",s),f})}Lo(t,r,s,i,a,c){return this.Mo(t,r,s,i,a)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Wn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>t[a]=i),s&&s.headers.forEach((i,a)=>t[a]=i)}xo(t,r){const s=YE[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=bo();return new Promise((a,c)=>{const u=new Af;u.setWithCredentials(!0),u.listenOnce(bf.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Bs.NO_ERROR:const f=u.getResponseJson();x(Ce,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(f)),a(f);break;case Bs.TIMEOUT:x(Ce,`RPC '${e}' ${i} timed out`),c(new L(D.DEADLINE_EXCEEDED,"Request time out"));break;case Bs.HTTP_ERROR:const m=u.getStatus();if(x(Ce,`RPC '${e}' ${i} failed with status:`,m,"response text:",u.getResponseText()),m>0){let g=u.getResponseJson();Array.isArray(g)&&(g=g[0]);const E=g==null?void 0:g.error;if(E&&E.status&&E.message){const S=function(P){const F=P.toLowerCase().replace(/_/g,"-");return Object.values(D).indexOf(F)>=0?F:D.UNKNOWN}(E.status);c(new L(S,E.message))}else c(new L(D.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new L(D.UNAVAILABLE,"Connection failed."));break;default:$()}}finally{x(Ce,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);x(Ce,`RPC '${e}' ${i} sending request:`,s),u.send(t,"POST",h,r,15)})}Bo(e,t,r){const s=bo(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Rf(),c=Cf(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const f=i.join("");x(Ce,`Creating RPC '${e}' stream ${s}: ${f}`,u);const m=a.createWebChannel(f,u);let g=!1,E=!1;const S=new JE({Io:P=>{E?x(Ce,`Not sending because RPC '${e}' stream ${s} is closed:`,P):(g||(x(Ce,`Opening RPC '${e}' stream ${s} transport.`),m.open(),g=!0),x(Ce,`RPC '${e}' stream ${s} sending:`,P),m.send(P))},To:()=>m.close()}),R=(P,F,H)=>{P.listen(F,V=>{try{H(V)}catch(O){setTimeout(()=>{throw O},0)}})};return R(m,fr.EventType.OPEN,()=>{E||(x(Ce,`RPC '${e}' stream ${s} transport opened.`),S.yo())}),R(m,fr.EventType.CLOSE,()=>{E||(E=!0,x(Ce,`RPC '${e}' stream ${s} transport closed`),S.So())}),R(m,fr.EventType.ERROR,P=>{E||(E=!0,On(Ce,`RPC '${e}' stream ${s} transport errored:`,P),S.So(new L(D.UNAVAILABLE,"The operation could not be completed")))}),R(m,fr.EventType.MESSAGE,P=>{var F;if(!E){const H=P.data[0];ae(!!H);const V=H,O=V.error||((F=V[0])===null||F===void 0?void 0:F.error);if(O){x(Ce,`RPC '${e}' stream ${s} received error:`,O);const J=O.status;let Q=function(v){const w=de[v];if(w!==void 0)return Yf(w)}(J),T=O.message;Q===void 0&&(Q=D.INTERNAL,T="Unknown error status: "+J+" with message "+O.message),E=!0,S.So(new L(Q,T)),m.close()}else x(Ce,`RPC '${e}' stream ${s} received:`,H),S.bo(H)}}),R(c,Sf.STAT_EVENT,P=>{P.stat===ia.PROXY?x(Ce,`RPC '${e}' stream ${s} detected buffering proxy`):P.stat===ia.NOPROXY&&x(Ce,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{S.wo()},0),S}}function So(){return typeof document<"u"?document:null}/**
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
 */function ki(n){return new pE(n,!0)}/**
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
 */class lp{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&x("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class ZE{constructor(e,t,r,s,i,a,c,u){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new lp(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===D.RESOURCE_EXHAUSTED?(ut(t.toString()),ut("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===D.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new L(D.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return x("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(x("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class ew extends ZE{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=gE(this.serializer,e),r=function(i){if(!("targetChange"in i))return U.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?U.min():a.readTime?kn(a.readTime):U.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=rh(this.serializer),t.addTarget=function(i,a){let c;const u=a.target;if(c=la(u)?{documents:yE(i,u)}:{query:_E(i,u)._t},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Zf(i,a.resumeToken);const h=fa(i,a.expectedCount);h!==null&&(c.expectedCount=h)}else if(a.snapshotVersion.compareTo(U.min())>0){c.readTime=pa(i,a.snapshotVersion.toTimestamp());const h=fa(i,a.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const r=IE(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=rh(this.serializer),t.removeTarget=e,this.a_(t)}}/**
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
 */class tw extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new L(D.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,ma(t,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===D.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new L(D.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Lo(e,ma(t,r),s,a,c,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===D.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new L(D.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class nw{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(ut(t),this.D_=!1):x("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class rw{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{ts(this)&&(x("RemoteStore","Restarting streams for network reachability change."),await async function(u){const h=z(u);h.L_.add(4),await es(h),h.q_.set("Unknown"),h.L_.delete(4),await Di(h)}(this))})}),this.q_=new nw(r,s)}}async function Di(n){if(ts(n))for(const e of n.B_)await e(!0)}async function es(n){for(const e of n.B_)await e(!1)}function up(n,e){const t=z(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),dc(t)?hc(t):Yn(t).r_()&&uc(t,e))}function lc(n,e){const t=z(n),r=Yn(t);t.N_.delete(e),r.r_()&&hp(t,e),t.N_.size===0&&(r.r_()?r.o_():ts(t)&&t.q_.set("Unknown"))}function uc(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(U.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Yn(n).A_(e)}function hp(n,e){n.Q_.xe(e),Yn(n).R_(e)}function hc(n){n.Q_=new uE({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),Yn(n).start(),n.q_.v_()}function dc(n){return ts(n)&&!Yn(n).n_()&&n.N_.size>0}function ts(n){return z(n).L_.size===0}function dp(n){n.Q_=void 0}async function sw(n){n.q_.set("Online")}async function iw(n){n.N_.forEach((e,t)=>{uc(n,e)})}async function ow(n,e){dp(n),dc(n)?(n.q_.M_(e),hc(n)):n.q_.set("Unknown")}async function aw(n,e,t){if(n.q_.set("Online"),e instanceof Xf&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const c of i.targetIds)s.N_.has(c)&&(await s.remoteSyncer.rejectListen(c,a),s.N_.delete(c),s.Q_.removeTarget(c))}(n,e)}catch(r){x("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ah(n,r)}else if(e instanceof $s?n.Q_.Ke(e):e instanceof Jf?n.Q_.He(e):n.Q_.We(e),!t.isEqual(U.min()))try{const r=await cp(n.localStore);t.compareTo(r)>=0&&await function(i,a){const c=i.Q_.rt(a);return c.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=i.N_.get(h);f&&i.N_.set(h,f.withResumeToken(u.resumeToken,a))}}),c.targetMismatches.forEach((u,h)=>{const f=i.N_.get(u);if(!f)return;i.N_.set(u,f.withResumeToken(Te.EMPTY_BYTE_STRING,f.snapshotVersion)),hp(i,u);const m=new At(f.target,u,h,f.sequenceNumber);uc(i,m)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){x("RemoteStore","Failed to raise snapshot:",r),await ah(n,r)}}async function ah(n,e,t){if(!Jr(e))throw e;n.L_.add(1),await es(n),n.q_.set("Offline"),t||(t=()=>cp(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{x("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Di(n)})}async function ch(n,e){const t=z(n);t.asyncQueue.verifyOperationInProgress(),x("RemoteStore","RemoteStore received new credentials");const r=ts(t);t.L_.add(3),await es(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Di(t)}async function cw(n,e){const t=z(n);e?(t.L_.delete(2),await Di(t)):e||(t.L_.add(2),await es(t),t.q_.set("Unknown"))}function Yn(n){return n.K_||(n.K_=function(t,r,s){const i=z(t);return i.w_(),new ew(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:sw.bind(null,n),Ro:iw.bind(null,n),mo:ow.bind(null,n),d_:aw.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),dc(n)?hc(n):n.q_.set("Unknown")):(await n.K_.stop(),dp(n))})),n.K_}/**
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
 */class fc{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Pt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,c=new fc(e,t,a,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new L(D.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function fp(n,e){if(ut("AsyncQueue",`${e}: ${n}`),Jr(n))return new L(D.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class Dn{constructor(e){this.comparator=e?(t,r)=>e(t,r)||M.comparator(t.key,r.key):(t,r)=>M.comparator(t.key,r.key),this.keyedMap=pr(),this.sortedSet=new ue(this.comparator)}static emptySet(e){return new Dn(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Dn)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Dn;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class lh{constructor(){this.W_=new ue(M.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):$():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Hn{constructor(e,t,r,s,i,a,c,u,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new Hn(e,t,Dn.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&bi(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class lw{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class uw{constructor(){this.queries=uh(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=z(t),i=s.queries;s.queries=uh(),i.forEach((a,c)=>{for(const u of c.j_)u.onError(r)})})(this,new L(D.ABORTED,"Firestore shutting down"))}}function uh(){return new Qn(n=>Uf(n),bi)}async function pc(n,e){const t=z(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new lw,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const c=fp(a,`Initialization of query '${In(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&gc(t)}async function mc(n,e){const t=z(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function hw(n,e){const t=z(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const c of a.j_)c.X_(s)&&(r=!0);a.z_=s}}r&&gc(t)}function dw(n,e,t){const r=z(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function gc(n){n.Y_.forEach(e=>{e.next()})}var ya,hh;(hh=ya||(ya={})).ea="default",hh.Cache="cache";class yc{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Hn(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Hn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==ya.Cache}}/**
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
 */class pp{constructor(e){this.key=e}}class mp{constructor(e){this.key=e}}class fw{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=G(),this.mutatedKeys=G(),this.Aa=$f(e),this.Ra=new Dn(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new lh,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,c=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const g=s.get(f),E=Si(this.query,m)?m:null,S=!!g&&this.mutatedKeys.has(g.key),R=!!E&&(E.hasLocalMutations||this.mutatedKeys.has(E.key)&&E.hasCommittedMutations);let P=!1;g&&E?g.data.isEqual(E.data)?S!==R&&(r.track({type:3,doc:E}),P=!0):this.ga(g,E)||(r.track({type:2,doc:E}),P=!0,(u&&this.Aa(E,u)>0||h&&this.Aa(E,h)<0)&&(c=!0)):!g&&E?(r.track({type:0,doc:E}),P=!0):g&&!E&&(r.track({type:1,doc:g}),P=!0,(u||h)&&(c=!0)),P&&(E?(a=a.add(E),i=R?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:c,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,m)=>function(E,S){const R=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return $()}};return R(E)-R(S)}(f.type,m.type)||this.Aa(f.doc,m.doc)),this.pa(r),s=s!=null&&s;const c=t&&!s?this.ya():[],u=this.da.size===0&&this.current&&!s?1:0,h=u!==this.Ea;return this.Ea=u,a.length!==0||h?{snapshot:new Hn(this.query,e.Ra,i,a,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:c}:{wa:c}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new lh,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=G(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new mp(r))}),this.da.forEach(r=>{e.has(r)||t.push(new pp(r))}),t}ba(e){this.Ta=e.Ts,this.da=G();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Hn.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class pw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class mw{constructor(e){this.key=e,this.va=!1}}class gw{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Qn(c=>Uf(c),bi),this.Ma=new Map,this.xa=new Set,this.Oa=new ue(M.comparator),this.Na=new Map,this.La=new oc,this.Ba={},this.ka=new Map,this.qa=$n.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function yw(n,e,t=!0){const r=Ip(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await gp(r,e,t,!0),s}async function _w(n,e){const t=Ip(n);await gp(t,e,!0,!1)}async function gp(n,e,t,r){const s=await GE(n.localStore,Ye(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await vw(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&up(n.remoteStore,s),c}async function vw(n,e,t,r,s){n.Ka=(m,g,E)=>async function(R,P,F,H){let V=P.view.ma(F);V.ns&&(V=await sh(R.localStore,P.query,!1).then(({documents:T})=>P.view.ma(T,V)));const O=H&&H.targetChanges.get(P.targetId),J=H&&H.targetMismatches.get(P.targetId)!=null,Q=P.view.applyChanges(V,R.isPrimaryClient,O,J);return fh(R,P.targetId,Q.wa),Q.snapshot}(n,m,g,E);const i=await sh(n.localStore,e,!0),a=new fw(e,i.Ts),c=a.ma(i.documents),u=Zr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=a.applyChanges(c,n.isPrimaryClient,u);fh(n,t,h.wa);const f=new pw(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),h.snapshot}async function Iw(n,e,t){const r=z(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!bi(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await ga(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&lc(r.remoteStore,s.targetId),_a(r,s.targetId)}).catch(Qa)):(_a(r,s.targetId),await ga(r.localStore,s.targetId,!0))}async function Ew(n,e){const t=z(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),lc(t.remoteStore,r.targetId))}async function yp(n,e){const t=z(n);try{const r=await qE(t.localStore,e);e.targetChanges.forEach((s,i)=>{const a=t.Na.get(i);a&&(ae(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?ae(a.va):s.removedDocuments.size>0&&(ae(a.va),a.va=!1))}),await vp(t,r,e)}catch(r){await Qa(r)}}function dh(n,e,t){const r=z(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,a)=>{const c=a.view.Z_(e);c.snapshot&&s.push(c.snapshot)}),function(a,c){const u=z(a);u.onlineState=c;let h=!1;u.queries.forEach((f,m)=>{for(const g of m.j_)g.Z_(c)&&(h=!0)}),h&&gc(u)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function ww(n,e,t){const r=z(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new ue(M.comparator);a=a.insert(i,ke.newNoDocument(i,U.min()));const c=G().add(i),u=new Pi(U.min(),new Map,new ue(K),a,c);await yp(r,u),r.Oa=r.Oa.remove(i),r.Na.delete(e),_c(r)}else await ga(r.localStore,e,!1).then(()=>_a(r,e,t)).catch(Qa)}function _a(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||_p(n,r)})}function _p(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(lc(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),_c(n))}function fh(n,e,t){for(const r of t)r instanceof pp?(n.La.addReference(r.key,e),Tw(n,r)):r instanceof mp?(x("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||_p(n,r.key)):$()}function Tw(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(x("SyncEngine","New document in limbo: "+t),n.xa.add(r),_c(n))}function _c(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new M(re.fromString(e)),r=n.qa.next();n.Na.set(r,new mw(t)),n.Oa=n.Oa.insert(t,r),up(n.remoteStore,new At(Ye(Ai(t.path)),r,"TargetPurposeLimboResolution",Ya.oe))}}async function vp(n,e,t){const r=z(n),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((c,u)=>{a.push(r.Ka(u,e,t).then(h=>{var f;if((h||t)&&r.isPrimaryClient){const m=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(h){s.push(h);const m=cc.Wi(u.targetId,h);i.push(m)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(u,h){const f=z(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>k.forEach(h,g=>k.forEach(g.$i,E=>f.persistence.referenceDelegate.addReference(m,g.targetId,E)).next(()=>k.forEach(g.Ui,E=>f.persistence.referenceDelegate.removeReference(m,g.targetId,E)))))}catch(m){if(!Jr(m))throw m;x("LocalStore","Failed to update sequence numbers: "+m)}for(const m of h){const g=m.targetId;if(!m.fromCache){const E=f.os.get(g),S=E.snapshotVersion,R=E.withLastLimboFreeSnapshotVersion(S);f.os=f.os.insert(g,R)}}}(r.localStore,i))}async function Aw(n,e){const t=z(n);if(!t.currentUser.isEqual(e)){x("SyncEngine","User change. New user:",e.toKey());const r=await ap(t.localStore,e);t.currentUser=e,function(i,a){i.ka.forEach(c=>{c.forEach(u=>{u.reject(new L(D.CANCELLED,a))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await vp(t,r.hs)}}function bw(n,e){const t=z(n),r=t.Na.get(e);if(r&&r.va)return G().add(r.key);{let s=G();const i=t.Ma.get(e);if(!i)return s;for(const a of i){const c=t.Fa.get(a);s=s.unionWith(c.view.Va)}return s}}function Ip(n){const e=z(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=yp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=bw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=ww.bind(null,e),e.Ca.d_=hw.bind(null,e.eventManager),e.Ca.$a=dw.bind(null,e.eventManager),e}class li{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ki(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return jE(this.persistence,new $E,e.initialUser,this.serializer)}Ga(e){return new FE(ac.Zr,this.serializer)}Wa(e){return new KE}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}li.provider={build:()=>new li};class va{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>dh(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Aw.bind(null,this.syncEngine),await cw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new uw}()}createDatastore(e){const t=ki(e.databaseInfo.databaseId),r=function(i){return new XE(i)}(e.databaseInfo);return function(i,a,c,u){return new tw(i,a,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,a,c){return new rw(r,s,i,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>dh(this.syncEngine,t,0),function(){return oh.D()?new oh:new QE}())}createSyncEngine(e,t){return function(s,i,a,c,u,h,f){const m=new gw(s,i,a,c,u,h);return f&&(m.Qa=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=z(s);x("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await es(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}va.provider={build:()=>new va};/**
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
 */class vc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):ut("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */class Sw{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Re.UNAUTHENTICATED,this.clientId=kf.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{x("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(x("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Pt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=fp(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Co(n,e){n.asyncQueue.verifyOperationInProgress(),x("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await ap(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function ph(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Cw(n);x("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>ch(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>ch(e.remoteStore,s)),n._onlineComponents=e}async function Cw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){x("FirestoreClient","Using user provided OfflineComponentProvider");try{await Co(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===D.FAILED_PRECONDITION||s.code===D.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;On("Error using user provided cache. Falling back to memory cache: "+t),await Co(n,new li)}}else x("FirestoreClient","Using default OfflineComponentProvider"),await Co(n,new li);return n._offlineComponents}async function Rw(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(x("FirestoreClient","Using user provided OnlineComponentProvider"),await ph(n,n._uninitializedComponentsProvider._online)):(x("FirestoreClient","Using default OnlineComponentProvider"),await ph(n,new va))),n._onlineComponents}async function ui(n){const e=await Rw(n),t=e.eventManager;return t.onListen=yw.bind(null,e.syncEngine),t.onUnlisten=Iw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=_w.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Ew.bind(null,e.syncEngine),t}function Pw(n,e,t={}){const r=new Pt;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,c,u,h){const f=new vc({next:g=>{f.Za(),a.enqueueAndForget(()=>mc(i,m));const E=g.docs.has(c);!E&&g.fromCache?h.reject(new L(D.UNAVAILABLE,"Failed to get document because the client is offline.")):E&&g.fromCache&&u&&u.source==="server"?h.reject(new L(D.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(g)},error:g=>h.reject(g)}),m=new yc(Ai(c.path),f,{includeMetadataChanges:!0,_a:!0});return pc(i,m)}(await ui(n),n.asyncQueue,e,t,r)),r.promise}function kw(n,e,t={}){const r=new Pt;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,c,u,h){const f=new vc({next:g=>{f.Za(),a.enqueueAndForget(()=>mc(i,m)),g.fromCache&&u.source==="server"?h.reject(new L(D.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),m=new yc(c,f,{includeMetadataChanges:!0,_a:!0});return pc(i,m)}(await ui(n),n.asyncQueue,e,t,r)),r.promise}/**
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
 */function Ep(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const mh=new Map;/**
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
 */function wp(n,e,t){if(!t)throw new L(D.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Dw(n,e,t,r){if(e===!0&&r===!0)throw new L(D.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function gh(n){if(!M.isDocumentKey(n))throw new L(D.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function yh(n){if(M.isDocumentKey(n))throw new L(D.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Ni(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":$()}function kt(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new L(D.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Ni(n);throw new L(D.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function Nw(n,e){if(e<=0)throw new L(D.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
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
 */class _h{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new L(D.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new L(D.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Dw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ep((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new L(D.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Vi{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new _h({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new L(D.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new L(D.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new _h(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new fI;switch(r.type){case"firstParty":return new yI(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new L(D.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=mh.get(t);r&&(x("ComponentProvider","Removing Datastore"),mh.delete(t),r.terminate())}(this),Promise.resolve()}}function Vw(n,e,t,r={}){var s;const i=(n=kt(n,Vi))._getSettings(),a=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&On("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let c,u;if(typeof r.mockUserToken=="string")c=r.mockUserToken,u=Re.MOCK_USER;else{c=jg(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new L(D.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new Re(h)}n._authCredentials=new pI(new Pf(c,u))}}/**
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
 */class dt{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new dt(this.firestore,e,this._query)}}class Be{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Dt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Be(this.firestore,e,this._key)}}class Dt extends dt{constructor(e,t,r){super(e,t,Ai(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Be(this.firestore,null,new M(e))}withConverter(e){return new Dt(this.firestore,e,this._path)}}function vh(n,e,...t){if(n=He(n),wp("collection","path",e),n instanceof Vi){const r=re.fromString(e,...t);return yh(r),new Dt(n,null,r)}{if(!(n instanceof Be||n instanceof Dt))throw new L(D.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(re.fromString(e,...t));return yh(r),new Dt(n.firestore,null,r)}}function Ih(n,e,...t){if(n=He(n),arguments.length===1&&(e=kf.newId()),wp("doc","path",e),n instanceof Vi){const r=re.fromString(e,...t);return gh(r),new Be(n,null,new M(r))}{if(!(n instanceof Be||n instanceof Dt))throw new L(D.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(re.fromString(e,...t));return gh(r),new Be(n.firestore,n instanceof Dt?n.converter:null,new M(r))}}/**
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
 */class Eh{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new lp(this,"async_queue_retry"),this.Vu=()=>{const r=So();r&&x("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=So();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=So();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Pt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Jr(e))throw e;x("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(r);throw ut("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=fc.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&$()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function wh(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class Fr extends Vi{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Eh,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Eh(e),this._firestoreClient=void 0,await e}}}function Lw(n,e){const t=typeof n=="object"?n:Ud(),r=typeof n=="string"?n:"(default)",s=Ba(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=$g("firestore");i&&Vw(s,...i)}return s}function Ic(n){if(n._terminated)throw new L(D.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||xw(n),n._firestoreClient}function xw(n){var e,t,r;const s=n._freezeSettings(),i=function(c,u,h,f){return new kI(c,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Ep(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new Sw(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
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
 */class jn{constructor(e){this._byteString=e}static fromBase64String(e){try{return new jn(Te.fromBase64String(e))}catch(t){throw new L(D.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new jn(Te.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class Tp{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new L(D.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new De(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class Ap{constructor(e){this._methodName=e}}/**
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
 */class Ec{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new L(D.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new L(D.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return K(this._lat,e._lat)||K(this._long,e._long)}}/**
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
 */class wc{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
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
 */const Mw=/^__.*__$/;function bp(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw $()}}class Tc{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Tc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return Ia(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(bp(this.Cu)&&Mw.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Ow{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||ki(e)}Qu(e,t,r,s=!1){return new Tc({Cu:e,methodName:t,qu:r,path:De.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Fw(n){const e=n._freezeSettings(),t=ki(n._databaseId);return new Ow(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Bw(n,e,t,r=!1){return Ac(t,n.Qu(r?4:3,e))}function Ac(n,e){if(Sp(n=He(n)))return $w("Unsupported field value:",e,n),Uw(n,e);if(n instanceof Ap)return function(r,s){if(!bp(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const c of r){let u=Ac(c,s.Lu(a));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),a++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=He(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return XI(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=me.fromDate(r);return{timestampValue:pa(s.serializer,i)}}if(r instanceof me){const i=new me(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:pa(s.serializer,i)}}if(r instanceof Ec)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof jn)return{bytesValue:Zf(s.serializer,r._byteString)};if(r instanceof Be){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:ep(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof wc)return function(a,c){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(u=>{if(typeof u!="number")throw c.Bu("VectorValues must only contain numeric values.");return nc(c.serializer,u)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${Ni(r)}`)}(n,e)}function Uw(n,e){const t={};return Df(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Xr(n,(r,s)=>{const i=Ac(s,e.Mu(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Sp(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof me||n instanceof Ec||n instanceof jn||n instanceof Be||n instanceof Ap||n instanceof wc)}function $w(n,e,t){if(!Sp(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=Ni(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}const Hw=new RegExp("[~\\*/\\[\\]]");function jw(n,e,t){if(e.search(Hw)>=0)throw Ia(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Tp(...e.split("."))._internalPath}catch{throw Ia(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ia(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${r}`),a&&(u+=` in document ${s}`),u+=")"),new L(D.INVALID_ARGUMENT,c+n+u)}/**
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
 */class Cp{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Be(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new qw(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Li("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class qw extends Cp{data(){return super.data()}}function Li(n,e){return typeof e=="string"?jw(n,e):e instanceof Tp?e._internalPath:e._delegate._internalPath}/**
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
 */function Rp(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new L(D.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class bc{}class Sc extends bc{}function Th(n,e,...t){let r=[];e instanceof bc&&r.push(e),r=r.concat(t),function(i){const a=i.filter(u=>u instanceof Cc).length,c=i.filter(u=>u instanceof xi).length;if(a>1||a>0&&c>0)throw new L(D.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class xi extends Sc{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new xi(e,t,r)}_apply(e){const t=this._parse(e);return Pp(e._query,t),new dt(e.firestore,e.converter,ua(e._query,t))}_parse(e){const t=Fw(e.firestore);return function(i,a,c,u,h,f,m){let g;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new L(D.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Ch(m,f);const E=[];for(const S of m)E.push(Sh(u,i,S));g={arrayValue:{values:E}}}else g=Sh(u,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Ch(m,f),g=Bw(c,a,m,f==="in"||f==="not-in");return fe.create(h,f,g)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Ah(n,e,t){const r=e,s=Li("where",n);return xi._create(s,r,t)}class Cc extends bc{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Cc(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:ze.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let a=s;const c=i.getFlattenedFilters();for(const u of c)Pp(a,u),a=ua(a,u)}(e._query,t),new dt(e.firestore,e.converter,ua(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Rc extends Sc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Rc(e,t)}_apply(e){const t=function(s,i,a){if(s.startAt!==null)throw new L(D.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new L(D.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Or(i,a)}(e._query,this._field,this._direction);return new dt(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new Kn(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function bh(n,e="asc"){const t=e,r=Li("orderBy",n);return Rc._create(r,t)}class Pc extends Sc{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Pc(e,t,r)}_apply(e){return new dt(e.firestore,e.converter,oi(e._query,this._limit,this._limitType))}}function zw(n){return Nw("limit",n),Pc._create("limit",n,"F")}function Sh(n,e,t){if(typeof(t=He(t))=="string"){if(t==="")throw new L(D.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Bf(e)&&t.indexOf("/")!==-1)throw new L(D.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(re.fromString(t));if(!M.isDocumentKey(r))throw new L(D.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return $u(n,new M(r))}if(t instanceof Be)return $u(n,t._key);throw new L(D.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ni(t)}.`)}function Ch(n,e){if(!Array.isArray(n)||n.length===0)throw new L(D.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Pp(n,e){const t=function(s,i){for(const a of s)for(const c of a.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new L(D.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new L(D.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class Gw{convertValue(e,t="none"){switch(an(e)){case 0:return null;case 1:return e.booleanValue;case 2:return le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(on(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw $()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Xr(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>le(a.doubleValue));return new wc(i)}convertGeoPoint(e){return new Ec(le(e.latitude),le(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Xa(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Lr(e));default:return null}}convertTimestamp(e){const t=xt(e);return new me(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=re.fromString(e);ae(op(r));const s=new xr(r.get(1),r.get(3)),i=new M(r.popFirst(5));return s.isEqual(t)||ut(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */class gr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class kp extends Cp{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Hs(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Li("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class Hs extends kp{data(e={}){return super.data(e)}}class Dp{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new gr(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Hs(this._firestore,this._userDataWriter,r.key,r,new gr(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new L(D.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(c=>{const u=new Hs(s._firestore,s._userDataWriter,c.doc.key,c.doc,new gr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const u=new Hs(s._firestore,s._userDataWriter,c.doc.key,c.doc,new gr(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return c.type!==0&&(h=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:Ww(c.type),doc:u,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function Ww(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return $()}}/**
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
 */function Kw(n){n=kt(n,Be);const e=kt(n.firestore,Fr);return Pw(Ic(e),n._key).then(t=>Np(e,n,t))}class kc extends Gw{constructor(e){super(),this.firestore=e}convertBytes(e){return new jn(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Be(this.firestore,null,t)}}function Rh(n){n=kt(n,dt);const e=kt(n.firestore,Fr),t=Ic(e),r=new kc(e);return Rp(n._query),kw(t,n._query).then(s=>new Dp(e,r,n,s))}function Qw(n,...e){var t,r,s;n=He(n);let i={includeMetadataChanges:!1,source:"default"},a=0;typeof e[a]!="object"||wh(e[a])||(i=e[a],a++);const c={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(wh(e[a])){const m=e[a];e[a]=(t=m.next)===null||t===void 0?void 0:t.bind(m),e[a+1]=(r=m.error)===null||r===void 0?void 0:r.bind(m),e[a+2]=(s=m.complete)===null||s===void 0?void 0:s.bind(m)}let u,h,f;if(n instanceof Be)h=kt(n.firestore,Fr),f=Ai(n._key.path),u={next:m=>{e[a]&&e[a](Np(h,n,m))},error:e[a+1],complete:e[a+2]};else{const m=kt(n,dt);h=kt(m.firestore,Fr),f=m._query;const g=new kc(h);u={next:E=>{e[a]&&e[a](new Dp(h,g,m,E))},error:e[a+1],complete:e[a+2]},Rp(n._query)}return function(g,E,S,R){const P=new vc(R),F=new yc(E,P,S);return g.asyncQueue.enqueueAndForget(async()=>pc(await ui(g),F)),()=>{P.Za(),g.asyncQueue.enqueueAndForget(async()=>mc(await ui(g),F))}}(Ic(h),f,c,u)}function Np(n,e,t){const r=t.docs.get(e._key),s=new kc(n);return new kp(n,s,e._key,r,new gr(t.hasPendingWrites,t.fromCache),e.converter)}(function(e,t=!0){(function(s){Wn=s})(zn),Mn(new nn("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),c=new Fr(new mI(r.getProvider("auth-internal")),new vI(r.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new L(D.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new xr(h.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:t},i),c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),Ct(Mu,"4.7.3",e),Ct(Mu,"4.7.3","esm2017")})();const Vp="fenix_cloud_sync_config",Ea={apiKey:"AIzaSyAvz0DRZIJLNHQsHmPg7LaUq9s3N2eEQtg",authDomain:"fenix-2c341.firebaseapp.com",projectId:"fenix-2c341",appId:"1:387287127608:web:c4e5aa07b3b91389c5b8cd",messagingSenderId:"387287127608",storageBucket:"fenix-2c341.firebasestorage.app"},Ro={enabled:!0,syncConsent:"granted",firebase:{...Ea}},Yw=20*60*1e3,yr="s12-lunaria",Ph=`pricesSnapshots/${yr}`,Lp="fenix_price_last_sync_at";function ks(n){return typeof n=="number"&&Number.isFinite(n)?n:n instanceof me?n.toMillis():null}function Jw(){try{const n=localStorage.getItem(Lp),e=n?Number(n):0;return Number.isFinite(e)?e:0}catch{return 0}}function kh(n){try{localStorage.setItem(Lp,String(n))}catch(e){console.error("Failed to persist price sync timestamp:",e)}}function Po(){try{const n=localStorage.getItem(Vp);if(n){const e=JSON.parse(n),t={...Ro,...e,firebase:{...Ro.firebase,...e.firebase||{}}};return xp(Xw(t))}}catch(n){console.error("Failed to read cloud sync config:",n)}return{...Ro}}function Xw(n){const e={...n.firebase};let t=!1;return Object.keys(Ea).forEach(r=>{const s=e[r];(!s||String(s).trim()==="")&&(e[r]=Ea[r],t=!0)}),t?{...n,firebase:e}:n}function xp(n){let e=n.syncConsent,t=n.enabled;return e||(e="pending"),e==="pending"?t=!1:e==="granted"?t=!0:e==="denied"&&(t=!1),n.syncConsent===e&&n.enabled===t?n:{...n,syncConsent:e,enabled:t}}function Dh(n){try{localStorage.setItem(Vp,JSON.stringify(n))}catch(e){console.error("Failed to save cloud sync config:",e)}}function Zw(n){const e=n.firebase;return!!e.apiKey&&!!e.authDomain&&!!e.projectId&&!!e.appId}class eT{constructor(){this.config=null,this.app=null,this.auth=null,this.db=null,this.lastSyncAt=0,this.lastSyncCache={},this.initializing=null,this.lastSyncCursorMs=null,this.snapshotUnsub=null,this.lastCacheUpdatedAt=null,this.lastCacheError=null,this.onPriceUpdateCallback=null}getSyncStatus(){this.config||(this.config=Po());const e=xp(this.config);e!==this.config&&(this.config=e,Dh(this.config));const t=this.config.enabled===!0,r=this.config.syncConsent??"pending";return{enabled:t,consent:r}}async setSyncEnabled(e){this.config||(this.config=Po());const t=e?"granted":"denied";this.config.enabled=e,this.config.syncConsent=t,Dh(this.config),e&&await this.initialize()}async initialize(){if(this.initializing)return this.initializing;this.initializing=this.initializeInternal();const e=await this.initializing;return this.initializing=null,e}async initializeInternal(){if(this.config=Po(),typeof this.config.lastSyncCursorMs=="number"&&(this.lastSyncCursorMs=this.config.lastSyncCursorMs),!this.config.enabled)return!1;if(!Zw(this.config))return console.warn("[sync] Firebase config missing. Sync disabled."),!1;if(this.app||(this.app=Bd(this.config.firebase)),this.auth||(this.auth=hI(this.app)),this.db||(this.db=Lw(this.app)),!this.auth.currentUser)try{await Q_(this.auth)}catch(e){return console.error("Failed to sign in anonymously:",e),!1}return this.subscribeToSnapshot(),!0}async syncPrices(e){if(!await this.initialize()||!this.db)return{};const r=Date.now();if(this.lastSyncAt||(this.lastSyncAt=Jw()),Object.keys(this.lastSyncCache).length===0&&(this.lastSyncCache=await Rd(),Object.keys(this.lastSyncCache).length>0)){const s=Object.values(this.lastSyncCache).map(i=>i.timestamp).filter(i=>typeof i=="number"&&Number.isFinite(i)).reduce((i,a)=>Math.max(i,a),0);this.lastCacheUpdatedAt=s||this.lastCacheUpdatedAt}if(!(e!=null&&e.forceFull)&&this.lastSyncAt&&r-this.lastSyncAt<Yw)return this.lastSyncCache;try{const s=Ih(this.db,Ph),i=await Kw(s);if(!i.exists())return this.lastCacheError="Price snapshot not available",this.lastSyncCache;const a=i.data(),c=a==null?void 0:a.data,u=ks(a==null?void 0:a.lastUpdated)??null,h={};if(c&&typeof c=="object")for(const[m,g]of Object.entries(c)){const E=typeof(g==null?void 0:g.price)=="number"?g.price:null,S=ks(g==null?void 0:g.timestamp);if(E===null||S===null)continue;const R=typeof(g==null?void 0:g.listingCount)=="number"?g.listingCount:void 0;h[m]={price:E,timestamp:S,...R!==void 0?{listingCount:R}:{}}}const f=await iu(h);return this.lastSyncAt=r,kh(r),this.lastSyncCache=f,this.lastCacheUpdatedAt=u,this.lastCacheError=null,f}catch(s){return console.error("Failed to sync prices from snapshot:",s),this.lastCacheError="Failed to read prices",this.lastSyncCache}}subscribeToSnapshot(){if(!this.db||this.snapshotUnsub)return;const e=Ih(this.db,Ph);this.snapshotUnsub=Qw(e,async t=>{if(!t.exists())return;const r=t.data(),s=r==null?void 0:r.data,i=ks(r==null?void 0:r.lastUpdated)??null,a={};if(s&&typeof s=="object")for(const[u,h]of Object.entries(s)){const f=typeof(h==null?void 0:h.price)=="number"?h.price:null,m=ks(h==null?void 0:h.timestamp);if(f===null||m===null)continue;const g=typeof(h==null?void 0:h.listingCount)=="number"?h.listingCount:void 0;a[u]={price:f,timestamp:m,...g!==void 0?{listingCount:g}:{}}}const c=await iu(a);this.lastSyncCache=c,this.lastSyncAt=Date.now(),kh(this.lastSyncAt),this.lastCacheUpdatedAt=i,this.lastCacheError=null,this.onPriceUpdateCallback&&this.onPriceUpdateCallback(c)},t=>{console.error("Failed to subscribe to price snapshot:",t),this.lastCacheError="Failed to subscribe to price snapshot"})}async getPriceHistory(e){if(!await this.initialize()||!this.db)return[];const r=e.baseId.trim();if(!/^\d+$/.test(r))return[];const s=(e.leagueId||yr).trim()||yr,i=Number.isFinite(e.maxDays)?Math.max(1,Math.min(180,Math.floor(e.maxDays))):120,a=Date.now()-i*24*60*60*1e3,c=Number.isFinite(e.maxSnapshotDocs)?Math.max(100,Math.min(2e4,Math.floor(e.maxSnapshotDocs))):null;try{const u=vh(this.db,"priceChecks",s,"items",r,"events"),h=c!==null?Th(u,Ah("timestamp",">=",a),bh("timestamp","asc"),zw(c)):Th(u,Ah("timestamp",">=",a),bh("timestamp","asc"));return(await Rh(h)).docs.map(g=>{const E=g.data(),S=typeof E.price=="number"?E.price:null,R=typeof E.timestamp=="number"?E.timestamp:null;if(S===null||R===null)return null;const P=typeof E.listingCount=="number"?E.listingCount:void 0;return{date:new Date(R).toISOString().slice(0,10),timestamp:R,price:S,...P!==void 0?{listingCount:P}:{}}}).filter(g=>g!==null)}catch(u){return console.error("Failed to fetch price history:",u),[]}}async getPriceHistoryBatch(e){if(!await this.initialize()||!this.db)return{};const r=((e==null?void 0:e.leagueId)||yr).trim()||yr;try{const s={},i=vh(this.db,"prices7d",r,"items");return(await Rh(i)).docs.forEach(c=>{const u=c.id;if(!/^\d+$/.test(u))return;const h=c.data(),m=(Array.isArray(h.history7d)?h.history7d:[]).map(g=>{if(!g||typeof g!="object")return null;const E=g,S=typeof E.t=="number"?E.t:typeof E.timestamp=="number"?E.timestamp:null,R=typeof E.p=="number"?E.p:typeof E.price=="number"?E.price:null;if(S===null||R===null)return null;const P=typeof E.l=="number"?E.l:typeof E.listingCount=="number"?E.listingCount:void 0;return{date:new Date(S).toISOString().slice(0,10),timestamp:S,price:R,...P!==void 0?{listingCount:P}:{}}}).filter(g=>g!==null).sort((g,E)=>g.timestamp-E.timestamp);m.length>0&&(s[u]=m)}),s}catch(s){return console.error("Failed to fetch batch price history:",s),{}}}getCacheStatus(){return{lastUpdated:this.lastCacheUpdatedAt,lastError:this.lastCacheError}}onPriceUpdate(e){this.onPriceUpdateCallback=e}}let te=null,Nn=null,ce=null,Nh=null,Sr=null,hi=0,Cr=0,wa=!1,_r=!1,Dc=[],Mp=[];const Nc="fenix_inventory_cache";function Vh(){if(!te)return;const n=te.getInventory();n.length!==0&&localStorage.setItem(Nc,JSON.stringify(n))}async function Op(){Nn=await Cd(),ce=new eT,await ce.setSyncEnabled(!0),ce.onPriceUpdate(async t=>{te&&(te.applyPriceCache(t),await Ir(te.getPriceCacheAsObject()),Vh(),js())});const n=await Rd(t=>ce?ce.syncPrices(t):Promise.resolve({}));if(te=new wg(Nn,n),ce&&te){const t=await ce.syncPrices({forceFull:!0});Object.keys(t).length>0&&(te.applyPriceCache(t),await Ir(te.getPriceCacheAsObject()))}const e=localStorage.getItem(Nc);if(e&&te)try{const t=JSON.parse(e);Array.isArray(t)&&(te.hydrateInventory(t),te.applyPriceCache(te.getPriceCacheAsObject()),js())}catch(t){console.warn("Failed to restore cached inventory:",t)}setInterval(async()=>{if(ce){const t=await ce.syncPrices({forceFull:!0});te&&(te.applyPriceCache(t),await Ir(te.getPriceCacheAsObject()),Vh(),js())}},20*60*1e3),tT()}function tT(){Nh||(Nh=window.setInterval(()=>{hi++,Dc.forEach(n=>n({type:"realtime",seconds:hi}))},1e3))}function nT(){Sr||(Sr=window.setInterval(()=>{wa&&!_r&&(Cr++,Dc.forEach(n=>n({type:"hourly",seconds:Cr})))},1e3))}function rT(){Sr&&(clearInterval(Sr),Sr=null)}function js(){Mp.forEach(n=>n())}const ee={async getInventory(){return te?te.getInventory().map(e=>e.baseId===tn?{...e,price:1}:e):[]},async getItemDatabase(){return Nn||(Nn=await Cd()),Nn},async getPriceCache(){return te?te.getPriceCacheAsObject():{}},async getPriceHistory(n){if(!ce)return[];const e=(n==null?void 0:n.baseId)??"",t=n==null?void 0:n.leagueId,r=n==null?void 0:n.maxDays,s=n==null?void 0:n.maxSnapshotDocs;return ce.getPriceHistory({baseId:e,leagueId:t,maxDays:r,maxSnapshotDocs:s})},async getPriceHistoryBatch(n){if(!ce)return{};const e=n==null?void 0:n.leagueId,t=n==null?void 0:n.maxDays,r=n==null?void 0:n.maxSnapshotDocs;return ce.getPriceHistoryBatch({leagueId:e,maxDays:t,maxSnapshotDocs:r})},getPriceCacheStatus(){return ce?ce.getCacheStatus():{lastUpdated:null,lastError:"Price sync not initialized"}},onInventoryUpdate(n){Mp.push(n)},startHourlyTimer(){wa=!0,_r=!1,Cr=0,nT()},pauseHourlyTimer(){_r=!0},resumeHourlyTimer(){_r=!1},stopHourlyTimer(){wa=!1,_r=!1,Cr=0,rT()},resetRealtimeTimer(){hi=0},async getTimerState(){return{realtimeSeconds:hi,hourlySeconds:Cr}},onTimerTick(n){Dc.push(n)},async getAppVersion(){return"2.4.0"},async checkForUpdates(){return{success:!1,message:"Updates not available in web version"}},onUpdateStatus(n){},onUpdateProgress(n){},onShowUpdateDialog(n){},onUpdateDownloadedTransition(n){},sendUpdateDialogResponse(n){},async isLogPathConfigured(){return localStorage.getItem("fenix_log_uploaded")==="true"},async selectLogFile(){return null},onShowLogPathSetup(n){},async getSettings(){return kg()},async saveSettings(n){try{return Dg(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to save settings"}}},async getUsernameInfo(){return{canChange:!1}},async setUsername(n){return{success:!1,error:"Username not supported in web version"}},async getCloudSyncStatus(){return ce?ce.getSyncStatus():{enabled:!1,consent:"pending"}},async setCloudSyncEnabled(n){if(!ce)return{success:!1,error:"Price sync service not initialized"};try{return await ce.setSyncEnabled(n),{success:!0}}catch(e){return{success:!1,error:e.message||"Failed to update cloud sync setting"}}},onShowSyncConsent(n){},async testKeybind(n){return{success:!1,error:"Keybinds not supported in web version"}},onCloseSettingsModal(n){},onWindowModeChanged(n){},minimizeWindow(){},maximizeWindow(){},closeWindow(){},openExternal(n){try{window.open(n,"_blank","noopener,noreferrer")}catch(e){console.warn("Failed to open external URL:",e)}},onMaximizeStateChanged(n){},async getMaximizeState(){return!1}};async function Lh(n){return new Promise((e,t)=>{const r=new FileReader;r.onload=async s=>{var i;try{const a=(i=s.target)==null?void 0:i.result,c=Vg(a);if((!te||!Nn)&&await Op(),te){if(te.buildInventory(c),ce){const u=await ce.syncPrices({forceFull:!0});te.applyPriceCache(u)}await Ir(te.getPriceCacheAsObject()),localStorage.setItem(Nc,JSON.stringify(te.getInventory())),localStorage.setItem("fenix_log_uploaded","true"),js(),e()}else t(new Error("Inventory manager not initialized"))}catch(a){t(a)}},r.onerror=()=>{t(new Error("Failed to read file"))},r.readAsText(n)})}let Fp=[],Bp={},Up="priceTotal",$p="desc",Hp="",jp=null,qp=null,zp=null,qs=new Set;function ft(){return Fp}function Mi(){return Bp}function Vc(){return Up}function Lc(){return $p}function sT(){return Hp}function Gp(){return jp}function Wp(){return qp}function Kp(){return zp}function Br(n){return!qs.has(n)}function iT(n){Fp=n}function oT(n){Bp=n}function aT(n){Up=n}function xh(n){$p=n}function cT(n){Hp=n}function Mh(n){jp=n}function lT(n){qp=n}function uT(n){zp=n}function hT(n){qs.has(n)?qs.delete(n):qs.add(n)}let Qp="realtime",Yp=[],Jp=[],Xp=new Map,Zp=0,em=!1,tm=!1,nm=new Set,rm=new Map,sm=new Map,im=new Map,om=[],am=0,cm=0,lm=0,um=!1;function je(){return Qp}function Oh(n){Qp=n}function hm(){return Yp}function dm(n){Yp=n}function ns(){return Jp}function Ur(n){Jp=n}function rs(){return Xp}function dT(n){Xp=n}function xc(){return Zp}function fm(n){Zp=n}function Ot(){return em}function pm(n){em=n}function mm(){return tm}function Oi(n){tm=n}function Ft(){return nm}function fT(n){nm=n}function Fi(){return rm}function pT(n){rm=n}function Mc(){return sm}function mT(n){sm=n}function Oc(){return im}function gT(n){im=n}function Fc(){return om}function Bi(n){om=n}function gm(){return am}function Bc(n){am=n}function yT(){return cm}function ym(n){cm=n}function _m(){return lm}function Uc(n){lm=n}function _T(){return um}function vT(n){um=n}let vm=!0;function IT(){return vm}function Ta(n){vm=n}function qn(n){const e=Math.floor(n/3600).toString().padStart(2,"0"),t=Math.floor(n%3600/60).toString().padStart(2,"0"),r=(n%60).toString().padStart(2,"0");return`${e}:${t}:${r}`}function ET(n){return n==="none"?"Uncategorized":n.split("_").map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join(" ")}function wT(n){if(n===null)return"";const e=Date.now()-n;return e>=vg?"price-very-stale":e>=_g?"price-stale":""}function cn(n,e=null){return!IT()||e===tn?n:n*(1-Ig)}function $c(n){const e=Wp(),t=Kp();if(n.price===null)return!(e!==null&&e>0);const r=n.price*n.totalQuantity,s=cn(r,n.baseId);return!(e!==null&&s<e||t!==null&&s>t)}function Hc(){return ft().reduce((e,t)=>{if(!Br(t.baseId)||!$c(t))return e;if(t.price!==null){const r=t.totalQuantity*t.price;return e+cn(r,t.baseId)}return e},0)}function Ui(){const n=ft(),e=rs(),t=Ft(),r=Wp(),s=Kp();let i=0;for(const a of n){if(a.price===null||!Br(a.baseId)||t.has(a.baseId))continue;const c=a.totalQuantity,u=e.get(a.baseId)||0,h=c-u;if(a.baseId===tn){const f=h*a.price;i+=f}else{if(h<=0)continue;const f=h*a.price,m=cn(f,a.baseId);if(r!==null&&m<r||s!==null&&m>s)continue;i+=m}}for(const a of t){if(!Br(a))continue;const c=n.find(g=>g.baseId===a);if(!c||c.price===null)continue;const u=c.totalQuantity,f=(e.get(a)||0)-u;if(f===0)continue;const m=Math.abs(f)*c.price;f>0?i-=m:i+=m}return i}let Im,Em,jc,$i;function TT(n,e,t,r){Im=n,Em=e,jc=t,$i=r}function AT(){const n=Hc();ym(n),$i(n)}function bT(){Uc(0);const n=Hc();ym(n),dm([]),ee.resetRealtimeTimer(),jc.textContent=qn(0),Rr(),$i(n)}function Rr(){const n=Hc(),e=_m()/3600,t=yT(),r=e>0?(n-t)/e:0;$i(n),je()==="realtime"&&(Im.textContent=n.toFixed(2),Em.textContent=r.toFixed(2))}async function Fh(){const n=await ee.getTimerState();Uc(n.realtimeSeconds),jc.textContent=qn(n.realtimeSeconds)}let wm,Tm,qc,zc,Gc,ss,is,Am,Wc,Kc;function ST(n,e,t,r,s,i,a,c,u,h){wm=n,Tm=e,qc=t,zc=r,Gc=s,ss=i,is=a,Am=c,Wc=u,Kc=h}function CT(){const n=Ft(),e=Mi();n.clear();for(const[t,r]of Object.entries(e)){const s=r.group??"";(s==="compass"||s==="beacon"||s==="probe"||s==="scalpel"||(t==="5028"||t==="5040"))&&n.add(t)}}function RT(){CT(),PT()}function PT(){const n=ft(),e=rs(),t=Fi(),r=Mc(),s=Oc(),i=Ft();e.clear(),t.clear(),r.clear(),s.clear();for(const a of n)e.set(a.baseId,a.totalQuantity),i.has(a.baseId)&&t.set(a.baseId,a.totalQuantity);if(Ur([]),Bi([]),Bc(0),je()==="hourly"){const a=ns();a.push({time:Date.now(),value:0}),Ur(a)}zc.style.display="none",Gc.style.display="inline-block",ss.style.display="inline-block",is.style.display="none",qc.textContent="00:00:00",pm(!0),Oi(!1),ee.startHourlyTimer(),Pr(),Wc(),Kc()}function kT(){const n=ft(),e=Ft(),t=Fi(),r=rs(),s=Mc(),i=Oc();for(const a of e){const c=n.find(f=>f.baseId===a),u=c?c.totalQuantity:0,h=t.get(a)??r.get(a)??u;if(r.get(a),u<h){const f=h-u,m=s.get(a)||0;s.set(a,m+f)}if(u>h){const f=u-h,m=i.get(a)||0;i.set(a,m+f)}}}function Qc(){const n=ft(),e=Ft(),t=Fi();for(const r of e){const s=n.find(i=>i.baseId===r);s&&t.set(r,s.totalQuantity)}}function DT(){const n=Ui(),e=Math.floor(xc()/3600),t=gm(),r=ns(),s=Fc(),i=Ft(),a=ft(),c=Fi(),u=Mc(),h=Oc(),f={hourNumber:e,startValue:t,endValue:n,earnings:n-t,history:[...r]};s.push(f),Bi(s),Bc(n),Ur([{time:Date.now(),value:n}]),u.clear(),h.clear();for(const g of i){const E=a.find(S=>S.baseId===g);E&&c.set(g,E.totalQuantity)}const m=document.querySelector(".stats-container");if(m){const g=document.createElement("div");g.className="earnings-animation",g.textContent=`Hour ${e} Complete! +${f.earnings.toFixed(2)} FE`,g.style.color="#10b981",m.appendChild(g),setTimeout(()=>g.remove(),2e3)}}function NT(){Oi(!0),ee.pauseHourlyTimer(),Qc(),ss.style.display="none",is.style.display="inline-block"}function VT(){Oi(!1),ee.resumeHourlyTimer(),Qc(),ss.style.display="inline-block",is.style.display="none"}function LT(){ee.stopHourlyTimer();const n=Ui(),e=Fc(),t=ns(),r=gm(),i={hourNumber:e.length+1,startValue:r,endValue:n,earnings:n-r,history:[...t]};e.push(i),Bi(e),Am(),zc.style.display="inline-block",Gc.style.display="none",ss.style.display="none",is.style.display="none",qc.textContent="00:00:00",fm(0),pm(!1),Oi(!1),Wc(),Kc()}function Pr(){const n=Ui(),e=xc()/3600,t=e>0?n/e:0;je()==="hourly"&&(wm.textContent=n.toFixed(2),Tm.textContent=t.toFixed(2))}function bm(){const n=ft(),e=je(),t=Ot();if(e==="hourly"&&t){const r=rs(),s=Ft();return n.filter(i=>!s.has(i.baseId)).map(i=>{const a=i.totalQuantity,c=r.get(i.baseId)||0,u=a-c;return{...i,totalQuantity:u}}).filter(i=>i.baseId===tn?!0:i.totalQuantity>0)}return n}function xT(){const n=bm(),e=sT(),t=Gp(),r=Mi(),s=Vc(),i=Lc();let a=n.filter(c=>{if(e&&!c.itemName.toLowerCase().includes(e.toLowerCase()))return!1;if(t!==null){const u=r[c.baseId];if(((u==null?void 0:u.group)||"none")!==t)return!1}return $c(c)});return a.sort((c,u)=>{let h=0;if(s==="priceUnit"){const f=c.price??-1,m=u.price??-1;h=f-m}else if(s==="priceTotal"){const f=cn((c.price??0)*c.totalQuantity,c.baseId),m=cn((u.price??0)*u.totalQuantity,u.baseId);h=f-m}return i==="asc"?h:-h}),a}function MT(){const n=document.getElementById("usageSection"),e=document.getElementById("usageContent");if(!n||!e)return;const t=je(),r=Ot(),s=Ft();if(t==="hourly"&&r&&s.size>0){n.style.display="block";const i=ft(),a=rs(),c=Mi(),u=[];for(const f of s){const m=i.find(R=>R.baseId===f),g=m?m.totalQuantity:0,S=(a.get(f)||0)-g;if(!(S<=0)){if(!m){const R=c[f];R&&u.push({baseId:f,itemName:R.name,netUsage:S,price:0});continue}u.push({baseId:f,itemName:m.itemName,netUsage:S,price:m.price||0})}}if(u.length===0){n.style.display="none";return}u.sort((f,m)=>{const g=f.price>0?Math.abs(f.netUsage*f.price):0;return(m.price>0?Math.abs(m.netUsage*m.price):0)-g});let h=0;e.innerHTML=u.map(({baseId:f,itemName:m,netUsage:g,price:E})=>{const S=E>0?E:0,R=E>0?Math.abs(g)*E:0;g>0?h-=R:g<0&&(h+=R);const P=g>0?"-":g<0?"+":"",F=g!==0?`${P}${Math.abs(g)}`:"0",H=g>0?"-":g<0?"+":"",V=E>0&&g!==0?`${H}${R.toFixed(2)} FE`:"- FE";return`
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
          <div class="item-quantity">${F}</div>
          <div class="item-price">
            <div class="price-single ${E===0?"no-price":""}">
              ${E>0?S.toFixed(2):"Not Set"}
            </div>
            ${E>0&&g!==0?`<div class="price-total">${V}</div>`:""}
          </div>
        </div>
      `}).join("")+(u.length>0&&h!==0?`
      <div class="usage-footer">
        <div class="usage-footer-label">Net Impact:</div>
        <div class="usage-footer-total">${h>0?"+":""}${h.toFixed(2)} FE</div>
      </div>
    `:"")}else n.style.display="none"}function Me(){MT();const n=document.getElementById("inventory");if(!n)return;const e=xT(),t=je(),r=Ot();if(e.length===0){const s=t==="hourly"&&r?"No new items gained yet":"No items match your filters";n.innerHTML=`<div class="loading">${s}</div>`;return}n.innerHTML=e.map(s=>{const i=s.price!==null?s.price*s.totalQuantity:null,a=i!==null?cn(i,s.baseId):null,c=Br(s.baseId);return`
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
    `}).join(""),Sm()}function Sm(){const n=Vc(),e=Lc();document.querySelectorAll(".inventory-section [data-sort]").forEach(t=>{const r=t.dataset.sort;r&&(r==="priceUnit"?t.textContent="Price":r==="quantity"?t.textContent="Quantity":t.textContent="Total",t.classList.remove("sort-active","sort-asc","sort-desc"),r===n&&(t.classList.add("sort-active"),t.classList.add(e==="asc"?"sort-asc":"sort-desc")))})}function nt(n){const e=document.getElementById("breakdown");if(!e)return;const t=bm(),r=Mi(),s=Gp(),i=new Map;for(const c of t){if(c.price===null||!Br(c.baseId)||c.totalQuantity<=0||!$c(c))continue;const u=r[c.baseId];if(!u||u.tradable===!1)continue;const h=u.group||"none",f=c.price*c.totalQuantity,m=cn(f,c.baseId);i.set(h,(i.get(h)||0)+m)}const a=Array.from(i.entries()).map(([c,u])=>({group:c,total:u})).filter(({total:c})=>c>0).sort((c,u)=>u.total-c.total);if(a.length===0){e.innerHTML="";return}e.innerHTML=a.map(({group:c,total:u})=>{const h=ET(c);return`
      <div class="breakdown-group ${s===c?"selected":""}" data-group="${c}" title="${h}">
        <div class="breakdown-icon-box">
          <img src="./assets/${c}.webp" alt="${h}" class="breakdown-icon" title="${h}" onerror="this.style.display='none'">
        </div>
        <span class="breakdown-group-value" title="${h}">${u.toFixed(0)}</span>
      </div>
    `}).join(""),e.querySelectorAll(".breakdown-group").forEach(c=>{c.addEventListener("click",()=>{const u=c.dataset.group;u&&(Mh(s===u?null:u),nt(n),n())})})}let Oe=null,pn=null,Ds=null;function Aa(){Oe&&(Ds!==null&&cancelAnimationFrame(Ds),Ds=requestAnimationFrame(()=>{Ds=null,Oe.resize(),Oe.update("none")}))}function OT(){const n=document.getElementById("wealth-graph");if(!n)return;const e=n.getContext("2d");Oe&&Oe.destroy(),pn==null||pn.disconnect(),pn=null;const t=getComputedStyle(document.documentElement).getPropertyValue("--border").trim()||"#7e7e7e";if(Oe=new Chart(e,{type:"line",data:{datasets:[{label:"Wealth (FE)",data:[],borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,devicePixelRatio:typeof window<"u"?Math.min(window.devicePixelRatio,3):2,animation:!1,normalized:!0,scales:{x:{type:"time",display:!0,bounds:"data",time:{minUnit:"minute",tooltipFormat:"HH:mm:ss",displayFormats:{minute:"HH:mm",hour:"HH:mm",day:"MMM d, HH:mm"}},border:{color:t},grid:{display:!1},ticks:{color:"#FAFAFA",autoSkip:!0,includeBounds:!0,maxTicksLimit:10}},y:{display:!0,border:{color:t},grid:{display:!1},ticks:{color:"#FAFAFA",precision:0,callback:function(r){const s=r;return s%1===0?s.toString():""}}}},parsing:!1,plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:r=>{if(r.length===0)return"";const i=r[0].parsed.y;return`Wealth: ${Math.round(i)} FE`},label:r=>{const s=r.parsed.x;return s?new Date(s).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}):""},footer:()=>""}},decimation:{enabled:!0,algorithm:"lttb",samples:1e3}},interaction:{intersect:!1,mode:"nearest",axis:"x"}}}),typeof ResizeObserver<"u"){const r=n.parentElement??n;pn=new ResizeObserver(()=>{Aa()}),pn.observe(r)}Aa(),di()}function FT(){Aa()}function BT(n){const t={time:Date.now(),value:Math.round(n)},r=hm();r.push(t),r.length>Eg&&r.shift(),dm(r),je()==="realtime"&&di()}function di(){if(!Oe)return;const n=je(),e=n==="realtime"?hm():ns();let t=e.map(s=>({x:s.time,y:s.value}));const r=document.getElementById("wealth-graph-placeholder");if(r&&(n==="hourly"&&e.length===0?r.classList.add("visible"):r.classList.remove("visible")),Oe.options.scales.x.ticks.maxTicksLimit=10,e.length>0){const s=e[0].time,i=Math.floor(s/6e4)*6e4,a=e[e.length-1].time;i<s&&(t=[{x:i,y:e[0].value},...t]),Oe.data.datasets[0].data=t,Oe.options.scales.x.min=i,Oe.options.scales.x.max=a}else Oe.data.datasets[0].data=t,Oe.options.scales.x.min=void 0,Oe.options.scales.x.max=void 0;Oe.update("none")}const Cm=[{key:"timer",targetId:"style1TimeValueWrap"},{key:"resetRealtimeBtn",targetId:"style1TimeValueWrap"},{key:"hourlyControls",targetId:"style1TimeControlsSlot"},{key:"wealthHourly",targetId:"style1PerHourValue"},{key:"wealthValue",targetId:"style1TotalValue"}];let Bh=!1,Uh=null;const Rm=new Map,Pm=new Map;function ko(){const n=document.body.classList.contains("layout-style-1");for(const e of Cm){const t=Rm.get(e.key),r=Pm.get(e.key);if(!t||!r)continue;if(n){const i=document.getElementById(e.targetId);if(!i)continue;t.parentElement!==i&&i.appendChild(t);continue}const s=r.parentNode;s&&(t.parentNode===s&&t.previousSibling===r||s.insertBefore(t,r.nextSibling))}}function UT(){if(Bh){ko();return}for(const n of Cm){const e=document.getElementById(n.key);if(!e||!e.parentNode)continue;const t=document.createComment(`style1-anchor-${n.key}`);e.parentNode.insertBefore(t,e),Rm.set(n.key,e),Pm.set(n.key,t)}ko(),Uh=new MutationObserver(()=>{ko()}),Uh.observe(document.body,{attributes:!0,attributeFilter:["class"]}),Bh=!0}function $T(n,e){const t=document.getElementById(`hourGraph${e}`);if(!t)return;const r=t.getContext("2d");if(n.history.length===0)return;const s=Math.max(1,Math.floor(n.history.length/60)),i=n.history.filter((h,f)=>f%s===0||f===n.history.length-1),a=Array.from({length:61},(h,f)=>f%10===0?`${f}m`:""),c=Array.from({length:61},(h,f)=>{const m=Math.floor(f/60*(i.length-1)),g=i[m];return{x:f,y:g?g.value-n.startValue:0,time:g?g.time:0}}),u=n.history.length>0?n.history[0].time:Date.now();new Chart(r,{type:"line",data:{labels:a,datasets:[{data:c.map(h=>h.y),borderColor:"#DE5C0B",backgroundColor:"rgba(222, 92, 11, 0.1)",borderWidth:2,tension:.4,pointRadius:0,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,animation:!1,scales:{x:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:7}},y:{display:!0,grid:{color:"#7E7E7E",drawBorder:!1},ticks:{color:"#FAFAFA",maxTicksLimit:5,callback:function(h){const f=h;return f%1===0?f.toFixed(0):f.toFixed(1)}}}},plugins:{legend:{display:!1},tooltip:{enabled:!0,backgroundColor:"#272727",titleColor:"#FAFAFA",bodyColor:"#FAFAFA",borderColor:"#7E7E7E",borderWidth:1,displayColors:!1,boxWidth:0,boxHeight:0,callbacks:{title:h=>{if(h.length===0)return"";const m=h[0].parsed.y;return`${m%1===0?m.toFixed(0):m.toFixed(1)} FE`},label:h=>{const f=h.dataIndex;if(f>=0&&f<c.length){const m=c[f];let g;m.time>0?g=new Date(m.time):g=new Date(u+f*6e4);const E=Math.floor(g.getSeconds()/60)*60,S=new Date(g);S.setSeconds(E),S.setMilliseconds(0);const R=S.getHours().toString().padStart(2,"0"),P=S.getMinutes().toString().padStart(2,"0");return`${R}:${P}`}return""},footer:()=>""}}},interaction:{intersect:!1,mode:"index"}}})}let km,Dm;function HT(n,e){km=n,Dm=e}function jT(){const n=document.getElementById("breakdownModal"),e=document.getElementById("breakdownTotal"),t=document.getElementById("breakdownHours");if(!n||!e||!t)return;const r=Fc(),s=xc(),i=r.reduce((a,c)=>a+c.earnings,0);e.textContent=`${i.toFixed(2)} FE`,t.innerHTML=r.map((a,c)=>(a.hourNumber<=Math.floor(s/3600)||qn(s%3600).substring(3),`
      <div class="hour-card">
        <div class="hour-header">
          <div class="hour-label">Hour ${a.hourNumber}</div>
          <div class="hour-earnings">+${a.earnings.toFixed(2)} FE</div>
        </div>
        <canvas class="hour-graph" id="hourGraph${c}"></canvas>
      </div>
    `)).join(""),n.classList.add("active"),setTimeout(()=>{r.forEach((a,c)=>{$T(a,c)})},100)}function qT(){const n=document.getElementById("breakdownModal");n&&(n.classList.remove("active"),Bi([]),dT(new Map),Ur([]),Bc(0),fT(new Set),pT(new Map),mT(new Map),gT(new Map),km(),Dm())}const zT="https://github.com/Giboork/TLI-tracker-translated",GT="https://github.com/astockman99/TITrack",An=document.getElementById("updateModal"),$h=document.getElementById("updateModalTitle"),Hh=document.getElementById("updateModalSubtitle"),jh=document.getElementById("updateModalMessage"),Do=document.getElementById("updateModalChangelog"),qh=document.getElementById("updateProgressContainer"),No=document.getElementById("updateBtnPrimary"),Vo=document.getElementById("updateBtnSecondary");function WT(){!An||!$h||!Hh||!jh||!Do||!qh||!No||!Vo||($h.textContent="Goodbye from Fenix",Hh.textContent="",jh.textContent="Thanks for using Fenix. This website will shut down on April 30th. I suggest moving onto a new tracker instead. Here are some trusted community tools that are safe and free:",Do.innerHTML=`<a href="${zT}" target="_blank" rel="noopener noreferrer">YiHuo Etor</a> or <a href="${GT}" target="_blank" rel="noopener noreferrer">TITrack</a>`,Do.style.display="block",qh.style.display="none",No.textContent="Understood",Vo.style.display="none",No.onclick=()=>{Lo()},Vo.onclick=null,An.onclick=n=>{n.target===An&&Lo()},document.addEventListener("keydown",n=>{n.key==="Escape"&&Lo()}),An.classList.add("active"))}function Lo(){An&&An.classList.remove("active")}function KT(){WT()}let xo={},hr=null,mn=null,et=null,zh,Gh,Mo=!1,Oo=!1;const Fo=document.getElementById("settingsBackBtn"),Bo=document.getElementById("generalSection"),Uo=document.getElementById("preferencesSection"),gn=document.getElementById("includeTaxCheckbox"),zt=document.getElementById("cloudSyncCheckbox"),Ns=document.getElementById("cloudSyncHelperText"),$o=document.querySelectorAll(".settings-sidebar-item"),Wh=document.getElementById("settingsDownloadDesktopBtn");function QT(n,e,t,r){zh=e,Gh=t;const s=document.querySelector(".header");function i(){document.querySelectorAll(".nav-item").forEach(f=>f.classList.remove("active")),document.querySelectorAll(".page").forEach(f=>f.classList.remove("active"));const h=document.getElementById("page-settings");h&&h.classList.add("active"),s&&s.classList.add("hidden")}async function a(){const h={},f=document.getElementById("includeTaxCheckbox"),m=f?f.checked:hr??!1;if(h.includeTax=m,mn!==null&&et!==null&&mn!==et){if(!(await ee.setCloudSyncEnabled(mn)).success){zt&&(zt.checked=et);return}et=mn,Ns&&(Ns.textContent=et?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices.")}(await ee.saveSettings(h)).success&&(Ta(h.includeTax??!1),Gh(ft()),zh())}async function c(){if(Mo){Oo=!0;return}Mo=!0;do{Oo=!1;try{await a()}catch(h){console.error("Auto-save settings failed:",h)}}while(Oo);Mo=!1}const u=document.getElementById("openSettingsBtn");u&&u.addEventListener("click",async()=>{r.open=!1;const h=document.getElementById("myAccountMenu"),f=document.getElementById("myAccountButton");h&&(h.style.display="none"),f&&f.classList.remove("active"),xo=await ee.getSettings(),hr=xo.includeTax!==void 0?xo.includeTax:!0,Ta(hr);const m=await ee.getCloudSyncStatus();et=m.enabled,mn=m.enabled,gn&&(gn.checked=hr),zt&&Ns&&et!==null&&(zt.checked=et,Ns.textContent=et?"Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.":"Cloud Sync is disabled. You will only see local prices."),Bo.classList.add("active"),Uo.classList.remove("active"),$o.forEach(g=>{g.getAttribute("data-section")==="general"?g.classList.add("active"):g.classList.remove("active")}),i()}),Fo==null||Fo.addEventListener("click",()=>{YT()}),gn&&gn.addEventListener("change",()=>{gn&&(hr=gn.checked,c())}),Wh&&Wh.addEventListener("click",()=>{window.open("https://github.com/Syncingoutt/Fenix/releases","_blank","noopener,noreferrer")}),zt&&zt.addEventListener("change",()=>{mn=zt.checked,c()}),$o.forEach(h=>{h.addEventListener("click",()=>{const f=h.getAttribute("data-section");f&&($o.forEach(m=>m.classList.remove("active")),h.classList.add("active"),f==="general"?(Bo.classList.add("active"),Uo.classList.remove("active")):f==="preferences"&&(Bo.classList.remove("active"),Uo.classList.add("active")))})})}function YT(){document.querySelectorAll(".page").forEach(r=>r.classList.remove("active"));const n=document.getElementById("page-home");n&&n.classList.add("active"),document.querySelectorAll(".nav-item").forEach(r=>r.classList.remove("active"));const e=document.getElementById("nav-home");e&&e.classList.add("active");const t=document.querySelector(".header");t&&t.classList.remove("hidden")}const JT=document.getElementById("syncConsentModal"),Kh=document.getElementById("syncConsentEnableBtn"),Qh=document.getElementById("syncConsentDisableBtn");function Yh(){JT.classList.remove("active")}function XT(){Kh&&Kh.addEventListener("click",async()=>{await ee.setCloudSyncEnabled(!0),Yh()}),Qh&&Qh.addEventListener("click",async()=>{await ee.setCloudSyncEnabled(!1),Yh()}),ee.setCloudSyncEnabled(!0)}const kr=document.getElementById("syncDisableConfirmModal"),Jh=document.getElementById("syncDisableCancelBtn"),Xh=document.getElementById("syncDisableConfirmBtn");let Yt=null;function Ho(){kr&&(kr.classList.remove("active"),Yt=null)}function ZT(){kr&&(Jh&&Jh.addEventListener("click",()=>{Yt&&Yt(!1),Ho()}),Xh&&Xh.addEventListener("click",async()=>{Yt&&Yt(!0),Ho()}),kr.addEventListener("click",n=>{n.target===kr&&(Yt&&Yt(!1),Ho())}))}const Gt=document.getElementById("myAccountButton"),yn=document.getElementById("myAccountMenu"),Zh=document.getElementById("appVersion");let Wt=!1;function e0(){return ee.getAppVersion().then(n=>{Zh&&(Zh.textContent=n)}),Gt&&Gt.addEventListener("click",n=>{n.stopPropagation(),Wt=!Wt,yn&&(yn.style.display=Wt?"block":"none"),Gt&&(Wt?Gt.classList.add("active"):Gt.classList.remove("active"))}),document.addEventListener("click",()=>{Wt&&(Wt=!1,yn&&(yn.style.display="none"),Gt&&Gt.classList.remove("active"))}),yn&&yn.addEventListener("click",n=>{n.stopPropagation()}),{open:Wt}}const ed=document.getElementById("wealthValue"),td=document.getElementById("wealthHourly"),zs=document.getElementById("realtimeBtn"),Gs=document.getElementById("hourlyBtn"),ba=document.getElementById("hourlyControls"),Yc=document.getElementById("startHourly"),Jc=document.getElementById("stopHourly"),Xc=document.getElementById("pauseHourly"),Zc=document.getElementById("resumeHourly"),nd=document.getElementById("hourlyTimer"),Vn=document.getElementById("timer"),Ws=document.getElementById("resetRealtimeBtn"),_n=document.getElementById("minPriceInput"),vn=document.getElementById("maxPriceInput"),jo=document.getElementById("searchInput");document.getElementById("clearSearch");function t0(){Yc.style.display="inline-block",Jc.style.display="none",Xc.style.display="none",Zc.style.display="none",ba.classList.remove("active"),zs.classList.add("active"),Gs.classList.remove("active"),Vn.style.display="block",Ws.style.display="block"}let dr,qo,zo,Go;function n0(n,e,t,r){dr=n,qo=e,zo=t,Go=r;function s(){const a=_n==null?void 0:_n.value.trim(),c=vn==null?void 0:vn.value.trim(),u=a&&a!==""?parseFloat(a):null,h=c&&c!==""?parseFloat(c):null;if(u!==null&&h!==null&&u>h)return;lT(u),uT(h),dr();const f=je();f==="realtime"?zo():f==="hourly"&&Ot()&&Go(),qo()}_n==null||_n.addEventListener("input",s),vn==null||vn.addEventListener("input",s);const i=document.getElementById("inventory");i==null||i.addEventListener("click",a=>{const c=a.target.closest(".inventory-item-checkbox");if(!c)return;const u=c.dataset.baseId;if(!u)return;a.preventDefault(),hT(u),dr(),qo();const h=je();h==="realtime"?zo():h==="hourly"&&Ot()&&Go()}),document.querySelectorAll(".inventory-section [data-sort]").forEach(a=>{a.addEventListener("click",()=>{const c=a.dataset.sort;if(!c)return;const u=Vc(),h=Lc();u===c?xh(h==="asc"?"desc":"asc"):(aT(c),xh("desc")),dr()})}),jo==null||jo.addEventListener("input",a=>{const c=a.target.value;cT(c),dr()})}let rd,sd,id,od,ad,cd,ld,Kt,Vs,Wo,ud;function r0(n,e,t,r,s,i,a,c,u,h,f){var m;rd=n,sd=e,id=t,od=r,ad=s,cd=i,ld=a,Kt=c,Vs=u,Wo=h,ud=f,zs.addEventListener("click",()=>{Oh("realtime"),zs.classList.add("active"),Gs.classList.remove("active"),ba.classList.remove("active"),Vn.style.display="block",Ws.style.display="block",Vn.textContent=qn(_m()),cd(),Kt(),Vs(Kt),Wo()}),Gs.addEventListener("click",()=>{if(Oh("hourly"),zs.classList.remove("active"),Gs.classList.add("active"),ba.classList.add("active"),Vn.style.display="none",Ws.style.display="none",Ot())ld(),Kt(),Vs(Kt);else{const g=document.getElementById("wealthValue"),E=document.getElementById("wealthHourly");g&&(g.textContent="0.00"),E&&(E.textContent="0.00"),Kt(),Vs(Kt)}Wo()}),Yc.addEventListener("click",rd),Jc.addEventListener("click",sd),Xc.addEventListener("click",id),Zc.addEventListener("click",od),Ws.addEventListener("click",ad),(m=document.getElementById("closeBreakdown"))==null||m.addEventListener("click",ud)}function s0(n){let e=null,t=null,r=!1;const s=10*1e3,i="fenix_setup_guide_dismissed",a=document.getElementById("ctaBanner"),c=document.getElementById("ctaCloseBtn");a&&(localStorage.getItem("fenix_cta_dismissed")==="true"||a.classList.remove("is-hidden")),a&&c&&(c.addEventListener("click",()=>{a.classList.add("is-hidden"),localStorage.setItem("fenix_cta_dismissed","true")}),a.addEventListener("click",I=>{const y=I.target;y&&(y.closest("#ctaCloseBtn")||y.closest(".cta-close"))&&(a.classList.add("is-hidden"),localStorage.setItem("fenix_cta_dismissed","true"))}));const u=document.getElementById("uploadLogBtn");if(u){const I=document.createElement("input");I.type="file",I.accept=".log",I.style.display="none",document.body.appendChild(I),u.addEventListener("click",()=>{I.click()}),I.addEventListener("change",async y=>{var he;const Y=y.target,X=(he=Y.files)==null?void 0:he[0];if(X){if(!X.name.toLowerCase().endsWith(".log")){alert("Please select a .log file");return}try{u.disabled=!0;const pe=u.querySelector("span");pe&&(pe.textContent="Uploading..."),await Lh(X),J(!0),pe&&(pe.textContent="Upload Log")}catch(pe){console.error("Failed to upload log file:",pe),alert(`Failed to upload: ${pe.message||"Unknown error"}`)}finally{u.disabled=!1,Y.value=""}}})}const h=document.getElementById("watchLogBtn");if(h){const I=Y=>{const X=h.querySelector("span");X&&(X.textContent=Y?"Stop Watch":"Watch Log")},y=()=>{t!==null&&(window.clearInterval(t),t=null),I(!1)};h.addEventListener("click",async()=>{const Y=window.showOpenFilePicker;if(!Y){alert("Live log watch is only supported in Chromium-based browsers (Chrome/Edge).");return}if(t!==null){y();return}try{const[he]=await Y({types:[{description:"UE Log",accept:{"text/plain":[".log"]}}],multiple:!1});e=he??null}catch{return}if(!e)return;I(!0),V();const X=async()=>{if(!(!e||r)){r=!0;try{const he=await e.getFile();await Lh(he),J(!0)}catch(he){console.warn("Failed to read watched log file:",he)}finally{r=!1}}};X(),t=window.setInterval(X,s)})}const f=document.getElementById("setupGuideModal"),m=document.getElementById("setupGuideClose"),g=document.getElementById("setupGuidePrev"),E=document.getElementById("setupGuideNext"),S=document.getElementById("setupGuideProgress"),R=document.querySelectorAll(".setup-guide-step"),P=document.getElementById("setupGuideSpotlight"),F=document.getElementById("openSetupGuideLink"),H=document.getElementById("setupGuideSpotlightBack"),V=()=>{localStorage.setItem(i,"true")},O=I=>{if(R.forEach((y,Y)=>{y.classList.toggle("active",Y===I)}),S&&(S.textContent=`Step ${I+1} of ${R.length}`),g&&(g.style.display=I===0?"none":""),E&&(E.style.display=I===R.length-1?"none":""),P){const y=I===R.length-1;if(P.classList.toggle("active",y),document.body.classList.toggle("setup-guide-focus-active",y),f&&f.classList.toggle("active",!y),y){const Y=document.getElementById("uploadLogBtn"),X=document.getElementById("watchLogBtn");if(Y||X){const ie=Y==null?void 0:Y.getBoundingClientRect(),ge=X==null?void 0:X.getBoundingClientRect(),Bt=Math.min((ie==null?void 0:ie.left)??Number.POSITIVE_INFINITY,(ge==null?void 0:ge.left)??Number.POSITIVE_INFINITY),os=Math.min((ie==null?void 0:ie.top)??Number.POSITIVE_INFINITY,(ge==null?void 0:ge.top)??Number.POSITIVE_INFINITY),Ge=Math.max((ie==null?void 0:ie.right)??Number.NEGATIVE_INFINITY,(ge==null?void 0:ge.right)??Number.NEGATIVE_INFINITY),ye=Math.max((ie==null?void 0:ie.bottom)??Number.NEGATIVE_INFINITY,(ge==null?void 0:ge.bottom)??Number.NEGATIVE_INFINITY),qi=Math.max(0,Bt-8),Ut=Math.max(0,os-8),zi=Math.max(0,Ge-Bt)+16,ln=Math.max(0,ye-os)+16;P.style.setProperty("--spotlight-x",`${qi}px`),P.style.setProperty("--spotlight-y",`${Ut}px`),P.style.setProperty("--spotlight-w",`${zi}px`),P.style.setProperty("--spotlight-h",`${ln}px`)}const pe=document.querySelector(".log-cta-actions")??Y??X;if(pe){const ie=pe.getBoundingClientRect(),ge=Math.max(0,ie.left),Bt=Math.max(0,ie.top-84);P.style.setProperty("--note-x",`${ge}px`),P.style.setProperty("--note-y",`${Bt}px`)}}}},J=I=>{f&&(f.classList.remove("active"),P&&P.classList.remove("active"),document.body.classList.remove("setup-guide-focus-active"),V())};if(f&&R.length>0){let I=0;g==null||g.addEventListener("click",()=>{I=Math.max(0,I-1),O(I)}),E==null||E.addEventListener("click",()=>{I=Math.min(R.length-1,I+1),O(I)}),m==null||m.addEventListener("click",()=>J()),H==null||H.addEventListener("click",()=>{I=Math.max(0,I-1),O(I)}),f.addEventListener("click",X=>{X.target===f&&J()}),window.addEventListener("resize",()=>{if(localStorage.getItem(i)==="true")return;const pe=Array.from(R).findIndex(ie=>ie.classList.contains("active"));pe>=0&&O(pe)}),localStorage.getItem(i)==="true"||(f.classList.add("active"),O(I))}F&&f&&R.length>0&&F.addEventListener("click",()=>{let I=0;f.classList.add("active"),localStorage.removeItem(i),O(I)});const Q=document.querySelectorAll(".nav-item"),T=document.querySelectorAll(".page"),_=document.querySelector(".header");function v(I){const y=I.replace(/^#\/?/,"").trim().toLowerCase();return y&&document.getElementById(`page-${y}`)?y:null}function w(I,y={}){const Y=document.getElementById(`page-${I}`);if(!Y)return;Q.forEach(he=>he.classList.remove("active"));const X=document.getElementById(`nav-${I}`);if(X&&X.classList.add("active"),T.forEach(he=>he.classList.remove("active")),Y.classList.add("active"),_&&_.classList.remove("hidden"),y.updateHash!==!1){const he=`#${I}`;window.location.hash!==he&&(window.location.hash=he)}}Q.forEach(I=>{I.addEventListener("click",()=>{const y=I.id.replace("nav-","");w(y)})}),window.addEventListener("hashchange",()=>{const I=v(window.location.hash);I&&w(I,{updateHash:!1})});const A=v(window.location.hash);A&&w(A,{updateHash:!1})}let Ko={},Qo={},Nt=[],Nm=[],fi="price",bn="desc",Sa="currency",Ca="",Pe="s12-lunaria",Fe=null,$e=null;const Hi=new Map,Ra=new Set;let en={},el=!1,se=[],Ne=0,Ee=0,Ln=0,Ks=0,Pa=0,ka="",$r=!0;const i0=20*60*1e3,Vm="fenix_prices_page_cache_v1",o0=24,hd=1;let dd=0;const Hr=new Map;let Yo="",pi=!1,mi=null,Lm=0,Da=0,xm=0,wt=0,fd=null,vr=!1,Qs="";function jr(n){if(n&&n.length>=2){let e=n[0],t=n[0],r=gi(e,0),s=r;if(n.forEach((i,a)=>{const c=gi(i,a);c<r&&(e=i,r=c),(c>s||c===s&&a>0)&&(t=i,s=c)}),e.price>0){const a=(t.price-e.price)/e.price*100;return a>=hd?{trend:"up",percent:a}:a<=-hd?{trend:"down",percent:a}:{trend:"neutral",percent:0}}}return{trend:"neutral",percent:0}}function gi(n,e){if(typeof n.timestamp=="number"&&Number.isFinite(n.timestamp))return n.timestamp;const t=Date.parse(n.date);return Number.isFinite(t)?t+e/1e3:e}function a0(n,e,t){const r=n.getContext("2d");if(!r||e.length===0)return;const s=n.width,i=n.height,a=2;if(r.clearRect(0,0,s,i),t==="neutral"){const g=i/2;r.strokeStyle="#7E7E7E",r.lineWidth=1.5,r.beginPath(),r.moveTo(a,g),r.lineTo(s-a,g),r.stroke();return}if(e.length===1){const g=i/2;r.strokeStyle=t==="up"?"#4CAF50":t==="down"?"#F44336":"#7E7E7E",r.lineWidth=1.5,r.beginPath(),r.moveTo(a,g),r.lineTo(s-a,g),r.stroke();return}const c=Math.min(...e),h=Math.max(...e)-c||1;let f;if(e.length>50){const g=Math.ceil(e.length/50);f=e.filter((E,S)=>S%g===0||S===e.length-1)}else f=e;t==="up"?(r.strokeStyle="#4CAF50",r.fillStyle="rgba(76, 175, 80, 0.1)"):(r.strokeStyle="#F44336",r.fillStyle="rgba(244, 67, 54, 0.1)"),r.lineWidth=1.5,r.beginPath();const m=(s-a*2)/(f.length-1);f.forEach((g,E)=>{const S=a+E*m,R=(g-c)/h,P=i-a-R*(i-a*2);E===0?r.moveTo(S,P):r.lineTo(S,P)}),r.stroke(),r.lineTo(s-a,i-a),r.lineTo(a,i-a),r.closePath(),r.fill()}function c0(n,e){if(n&&n.length>0)return[...n].map((r,s)=>({point:r,index:s})).sort((r,s)=>gi(r.point,r.index)-gi(s.point,s.index)).map(({point:r})=>r.price);const t=e>0?e:0;return new Array(7).fill(t)}function Na(n){return n===0?"0.00":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(2)+"K":n.toFixed(2)}function l0(n){if(!Number.isFinite(n)||n<=0)return"0";if(n<1)return n.toFixed(2);if(n>=1e6){const e=n/1e6,t=e>=10?0:1;return`${e.toFixed(t)}m`}if(n>=1e3){const e=n/1e3,t=e>=10?0:1;return`${e.toFixed(t)}k`}return n.toFixed(0)}function u0(n){return Number.isFinite(n)?new Date(n).toLocaleDateString(void 0,{weekday:"short",month:"long",day:"numeric",year:"numeric"}):"--"}function h0(){return Fe?Nt.find(n=>n.baseId===Fe)??null:null}function d0(n){var r;const e=(r=n==null?void 0:n.canvas)==null?void 0:r.parentElement;if(!e)return null;let t=e.querySelector("#pricesDetailChartTooltip");return t||(t=document.createElement("div"),t.id="pricesDetailChartTooltip",t.className="prices-detail-chart-tooltip",t.style.opacity="0",e.appendChild(t),t)}function f0(n){var T,_,v;const{chart:e,tooltip:t}=n,r=d0(e);if(!r)return;if(!t||t.opacity===0||!Array.isArray(t.dataPoints)||t.dataPoints.length===0){r.style.opacity="0";return}const s=t.dataPoints[0],i=Number((s==null?void 0:s.dataIndex)??0),a=(_=(T=e==null?void 0:e.data)==null?void 0:T.labels)==null?void 0:_[i],c=Number(a),u=Number((s==null?void 0:s.raw)??((v=s==null?void 0:s.parsed)==null?void 0:v.y)??0),h=h0(),f=h?yi(h.baseId):"",m=(h==null?void 0:h.name)??"Item",g=Om(m);r.innerHTML=`
    <div class="prices-detail-chart-tooltip-date">${u0(c)}</div>
    <div class="prices-detail-chart-tooltip-row">
      <span class="prices-detail-chart-tooltip-fe">${l0(u)}</span>
      <img src="${yi("100300")}" alt="FE" class="prices-detail-chart-tooltip-icon prices-detail-chart-tooltip-fe-icon" onerror="this.style.display='none'">
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
  `;const E=Number((e==null?void 0:e.width)??0),S=Number((e==null?void 0:e.height)??0),R=Number(t.caretX??0),P=Number(t.caretY??0),F=18,H=r.offsetWidth,V=r.offsetHeight,J=R+F+H<=E-4?R+F:Math.max(4,R-H-F),Q=P+F+V<=S-4?P+F:Math.max(4,P-V-F);r.style.left=`${J}px`,r.style.top=`${Q}px`,r.style.opacity="1"}function p0(n){return!n||Number.isNaN(n)?"--":new Date(n).toLocaleString()}function Mm(){try{const n=localStorage.getItem(Vm);if(!n)return{byLeague:{}};const e=JSON.parse(n);return!e||typeof e!="object"||typeof e.byLeague!="object"||e.byLeague===null?{byLeague:{}}:e}catch{return{byLeague:{}}}}function Va(n){const t=Mm().byLeague[n];if(!t||typeof t!="object")return null;const r=t.historyByItem&&typeof t.historyByItem=="object"?t.historyByItem:{},s=typeof t.nextRefreshAllowedAt=="number"&&Number.isFinite(t.nextRefreshAllowedAt)?t.nextRefreshAllowedAt:0;return{historyByItem:r,nextRefreshAllowedAt:s}}function m0(n,e,t){const r=Mm();r.byLeague[n]={historyByItem:e,nextRefreshAllowedAt:t,cachedAt:Date.now()};try{localStorage.setItem(Vm,JSON.stringify(r))}catch(s){console.error("Failed to persist prices page cache:",s)}}function g0(n){const e=Math.max(0,n),t=Math.ceil(e/1e3),r=Math.floor(t/60),s=t%60;return`${String(r).padStart(2,"0")}:${String(s).padStart(2,"0")}`}function tl(){const n=document.getElementById("pricesRefreshBtn"),e=document.getElementById("pricesRefreshStatus");if(!n||!e)return;if(!$r){n.disabled=!0,n.classList.remove("is-cooldown"),e.textContent="Cloud sync disabled";return}const t=Date.now(),r=Math.max(0,wt-t),s=r>0;n.disabled=s,n.classList.toggle("is-cooldown",s),s?e.textContent=`Refresh available in ${g0(r)}`:e.textContent="Refresh ready"}function y0(){fd===null&&(fd=window.setInterval(()=>{tl()},1e3))}function yi(n){return`./assets/${n}.webp`}function _0(n){return`https://tlidb.com/en/${n.trim().replace(/['’]/g,"").replace(/[^A-Za-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"Unknown_Item"}`}function v0(n,e){const t=en[n];let r=t&&t.length>0?t:e;if(r.length===0)return null;if(!t||t.length===0){const a=Math.max(...r.map(c=>c.timestamp||0));if(Number.isFinite(a)&&a>0){const c=a-6048e5,u=r.filter(h=>h.timestamp>=c);u.length>0&&(r=u)}}const s=r.map(a=>a.price).filter(a=>Number.isFinite(a)&&a>=0);return s.length===0?null:s.reduce((a,c)=>a+c,0)/s.length}function nl(n,e,t){const r=document.getElementById("pricesDetailPriceValue"),s=document.getElementById("pricesDetailAveragePriceValue");if(r&&(r.textContent=Na(e)),s){const i=v0(n,t);s.textContent=i===null?"--":Na(i)}}function I0(n){if(!n||n.length===0)return[];const e=Date.now();return n.map((t,r)=>{const s=Date.parse(t.date),i=typeof t.timestamp=="number"&&Number.isFinite(t.timestamp)?t.timestamp:Number.isFinite(s)?s:e+r;return{date:t.date,timestamp:i,price:t.price}}).sort((t,r)=>t.timestamp-r.timestamp)}function E0(n){const e=`sparkline-${n.baseId}`,t=sl(n),r=n.price>0?jr(t):{trend:"neutral",percent:0},s=yi(n.baseId),i=`trend-${r.trend}`,a=Na(n.price),c=n.price>0,u=c?wT(n.timestamp):"",h=c?u:"no-price",f=c?r.trend==="neutral"?"0%":`${r.percent>0?"+":""}${Math.round(r.percent)}%`:"";return`
    <tr class="prices-row" data-base-id="${n.baseId}">
      <td class="prices-col-name">
        <div class="prices-name-cell">
          <img src="${s}" alt="${n.name}" class="prices-item-icon" onerror="this.style.display='none'">
          <span class="prices-item-name">${Om(n.name)}</span>
        </div>
      </td>
      <td class="prices-col-updated">
        <span class="prices-updated-at">${p0(n.timestamp)}</span>
      </td>
      <td class="prices-col-price">
        <span class="prices-price-value ${h}">${a}</span>
      </td>
      <td class="prices-col-sparkline">
        <div class="prices-sparkline-cell">
          <canvas id="${e}" class="prices-sparkline" width="80" height="28" 
                  ></canvas>
          <span class="prices-trend ${i}">${f}</span>
        </div>
      </td>
    </tr>
  `}function Om(n){const e=document.createElement("div");return e.textContent=n,e.innerHTML}function w0(n,e,t){return[...n].sort((s,i)=>{let a,c;switch(e){case"name":a=s.name.toLowerCase(),c=i.name.toLowerCase();break;case"price":a=s.price,c=i.price;break;case"trend":a=Id(s),c=Id(i);break;default:return 0}return a<c?t==="asc"?-1:1:a>c?t==="asc"?1:-1:0})}function ji(){const n=document.getElementById("pricesTableBody");if(!n)return;const e=w0(Nm,fi,bn);document.querySelectorAll(".prices-table th").forEach(s=>{s.classList.remove("sort-asc","sort-desc"),s.getAttribute("data-sort")===fi&&s.classList.add(`sort-${bn}`)});const t=document.getElementById("pricesItemCount");t&&(t.textContent=`${e.length} item${e.length!==1?"s":""}`),n.innerHTML=e.map(s=>E0(s)).join("");const r=e.map(s=>{const i=sl(s),a=s.price>0?jr(i):{trend:"neutral",percent:0};return{item:s,history:i,trendData:a}});P0(r)}function qr(n){el=n;const e=document.getElementById("pricesListView"),t=document.getElementById("pricesDetailView");e&&(e.style.display=n?"none":"block"),t&&(t.style.display=n?"block":"none")}function pd(n){return new Date(n).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function md(n,e){const t=n.replace("#","");if(t.length!==6)return`rgba(222, 92, 11, ${e})`;const r=parseInt(t.slice(0,2),16),s=parseInt(t.slice(2,4),16),i=parseInt(t.slice(4,6),16);return`rgba(${r}, ${s}, ${i}, ${e})`}function T0(){const n=getComputedStyle(document.documentElement);return{primary:n.getPropertyValue("--primary").trim()||"#DE5C0B",text:n.getPropertyValue("--text").trim()||"#FAFAFA",border:n.getPropertyValue("--border").trim()||"#7E7E7E",bgShade:n.getPropertyValue("--bg-shade").trim()||"#272727"}}function Fm(n){const e=Hi.get(`${Pe}:${n}`);if(e&&e.length>0)return e;const t=en[n];if(t&&t.length>0)return t;const r=Nt.find(s=>s.baseId===n);return r!=null&&r.history&&r.history.length>0?I0(r.history):[]}function A0(n){if(n.length===0)return 0;const e=Date.now()-7*24*60*60*1e3,t=n.findIndex(r=>r.timestamp>=e);return t>=0?t:Math.max(0,n.length-1)}function Bm(){if(se.length===0)return[];const n=Math.max(0,Math.min(Ne,se.length-1)),e=Math.max(n,Math.min(Ee,se.length-1));return se.slice(n,e+1)}function zr(){const n=document.getElementById("pricesRangeStart"),e=document.getElementById("pricesRangeEnd"),t=document.getElementById("pricesRangeNavigatorStart"),r=document.getElementById("pricesRangeNavigatorEnd"),s=document.getElementById("pricesRangeLabel"),i=document.getElementById("pricesRangeHoverStart"),a=document.getElementById("pricesRangeHoverEnd"),c=i==null?void 0:i.parentElement,u=document.getElementById("pricesRangeSliderShell"),h=document.getElementById("pricesRangeNavigatorShell"),f=se.length;if(!n||!e||!t||!r||!s||!u||!h||!i||!a)return;if(f===0){n.min="0",n.max="0",n.value="0",n.disabled=!0,e.min="0",e.max="0",e.value="0",e.disabled=!0,t.min="0",t.max="0",t.value="0",t.disabled=!0,r.min="0",r.max="0",r.value="0",r.disabled=!0,s.textContent="No data available",i.textContent="--",a.textContent="--",u.style.setProperty("--prices-range-start","0%"),u.style.setProperty("--prices-range-end","100%"),h.style.setProperty("--prices-range-start","0%"),h.style.setProperty("--prices-range-end","100%"),c==null||c.style.setProperty("--prices-range-start","0%"),c==null||c.style.setProperty("--prices-range-end","100%");return}const m=f-1;n.disabled=!1,e.disabled=!1,t.disabled=!1,r.disabled=!1,n.min="0",n.max=String(m),e.min="0",e.max=String(m),t.min="0",t.max=String(m),r.min="0",r.max=String(m),n.value=String(Ne),e.value=String(Ee),t.value=String(Ne),r.value=String(Ee);const g=se[Ne],E=se[Ee];s.textContent=`${Ee-Ne+1} checks`,i.textContent=pd(g.timestamp),a.textContent=pd(E.timestamp);const S=m===0?0:Ne/m*100,R=m===0?100:Ee/m*100;u.style.setProperty("--prices-range-start",`${S}%`),u.style.setProperty("--prices-range-end",`${R}%`),h.style.setProperty("--prices-range-start",`${S}%`),h.style.setProperty("--prices-range-end",`${R}%`),c==null||c.style.setProperty("--prices-range-start",`${S}%`),c==null||c.style.setProperty("--prices-range-end",`${R}%`)}function tt(n){const e=document.getElementById("pricesRangeStart"),t=document.getElementById("pricesRangeEnd"),r=document.getElementById("pricesRangeNavigatorStart"),s=document.getElementById("pricesRangeNavigatorEnd");!e||!t||(n==="start"?(e.classList.add("prices-range-slider-active"),t.classList.remove("prices-range-slider-active"),r==null||r.classList.add("prices-range-slider-active"),s==null||s.classList.remove("prices-range-slider-active")):(t.classList.add("prices-range-slider-active"),e.classList.remove("prices-range-slider-active"),s==null||s.classList.add("prices-range-slider-active"),r==null||r.classList.remove("prices-range-slider-active")))}function b0(n,e){const t=Math.max(0,se.length-1),r=Math.max(0,Math.min(n,t)),s=Math.max(r,Math.min(e,t));return{start:r,end:s}}function Sn(n,e){if(se.length===0)return;const t=b0(n,e);Ne=t.start,Ee=t.end,zr(),La(Bm())}function S0(n,e){const t=e.getBoundingClientRect();if(t.width<=0||se.length===0)return 0;const r=Math.max(0,Math.min(1,(n-t.left)/t.width));return Math.round(r*(se.length-1))}function gd(n,e){if(se.length===0)return;const t=n.target;if(t.closest("input.prices-range-slider")||t.closest(".prices-range-selection"))return;const r=e==="main"?document.getElementById("pricesRangeSliderShell"):document.getElementById("pricesRangeNavigatorShell");if(!r)return;const s=S0(n.clientX,r),i=Math.max(0,Ee-Ne),a=Math.floor(i/2),c=s-a;Sn(c,c+i)}function yd(n,e){if(se.length===0)return;const r=n.target.closest(".prices-range-selection");r&&(pi=!0,mi=e,Lm=n.clientX,Da=Ne,xm=Ee,r.setPointerCapture(n.pointerId),n.preventDefault())}function C0(n){if(!pi||!mi||se.length===0)return;const e=mi==="main"?document.getElementById("pricesRangeSliderShell"):document.getElementById("pricesRangeNavigatorShell");if(!e)return;const t=e.getBoundingClientRect();if(t.width<=0)return;const r=(n.clientX-Lm)/t.width,s=se.length-1,i=Math.round(r*s),a=xm-Da;let c=Da+i;c=Math.max(0,Math.min(c,s-a));const u=Math.min(s,c+a);Sn(c,u)}function _d(n){if(pi){if(n){const e=n.target;try{e==null||e.releasePointerCapture(n.pointerId)}catch{}}pi=!1,mi=null}}function rl(n,e){if(se=[...n].sort((t,r)=>t.timestamp-r.timestamp),se.length===0){Ne=0,Ee=0,zr(),La([]);return}e?(Ne=A0(se),Ee=se.length-1):(Ee=Math.min(Ee,se.length-1),Ne=Math.min(Ne,Ee)),zr(),La(Bm())}async function R0(n){if(!$r)return;const e=`${Pe}:${n}`;if(Ra.has(e))return;const t=++Ks;try{const r=await ee.getPriceHistory({baseId:n,leagueId:Pe,maxDays:90});if(t!==Ks)return;if(Hi.set(e,r??[]),Ra.add(e),Fe===n){rl(r??[],!0);const s=Nt.find(i=>i.baseId===n);s&&nl(n,s.price,r??[])}}catch(r){if(t!==Ks)return;console.error("Failed to fetch item detail history:",r)}}function La(n){const e=document.getElementById("pricesDetailChart"),t=document.getElementById("pricesDetailEmpty");if(!e||!t)return;const r=T0();if(n.length===0){if($e){const h=document.getElementById("pricesDetailChartTooltip");h&&h.remove(),$e.destroy(),$e=null}Yo="",t.textContent="No history yet for this item.",t.style.display="flex";return}t.style.display="none";const s=[...n].sort((h,f)=>h.timestamp-f.timestamp),i=s.map(h=>`${h.timestamp}:${h.price}`).join("|");if($e&&i===Yo)return;Yo=i;const a=s.map(h=>h.timestamp),c=s.map(h=>h.price),u=s.length>120?0:3;if($e){$e.data.labels=a;const h=$e.data.datasets[0];h.data=c,h.borderColor=r.primary,h.backgroundColor=md(r.primary,.1),h.pointRadius=u,h.pointHoverRadius=u===0?3:4,h.pointBackgroundColor=r.primary,$e.update("none");return}$e=new Chart(e.getContext("2d"),{type:"line",data:{labels:a,datasets:[{label:"Price (FE)",data:c,borderColor:r.primary,backgroundColor:md(r.primary,.1),fill:!0,tension:.25,pointRadius:u,pointHoverRadius:u===0?3:4,pointBackgroundColor:r.primary,pointBorderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{enabled:!1,external:f0,backgroundColor:r.bgShade,borderColor:r.border,borderWidth:1,titleColor:r.text,bodyColor:r.text,displayColors:!1}},scales:{x:{ticks:{color:r.text,maxRotation:0,autoSkip:!0,maxTicksLimit:10,callback:function(h){if(arguments[1]%3!==0)return"";const m=typeof h=="number"?h:Number(h),g=this.getLabelForValue(m),E=Number(g);if(!Number.isFinite(E))return"";const S=new Date(E);return S.getDate()===1?S.toLocaleDateString(void 0,{month:"short"}):String(S.getDate())}},border:{color:r.border},grid:{display:!0,color:"rgba(126, 126, 126, 0.25)",drawTicks:!1}},y:{ticks:{color:r.text},border:{color:r.border},grid:{display:!0,color:"rgba(126, 126, 126, 0.25)",drawTicks:!1},beginAtZero:!1}}}})}async function vd(n){const e=Nt.find(c=>c.baseId===n);if(!e)return;Fe=n,Ln+=1;const t=Ln;qr(!0);const r=document.getElementById("pricesDetailName"),s=document.getElementById("pricesDetailIcon");r&&(r.textContent=e.name,r.dataset.tlidbUrl=_0(e.name),r.disabled=!1),s&&(s.src=yi(e.baseId),s.alt=e.name,s.style.display="block",s.onerror=()=>{s.style.display="none"});const i=`${Pe}:${n}`,a=Fm(n);Hi.set(i,a),nl(n,e.price,a),!(t!==Ln||Fe!==n)&&(rl(a,!0),$r&&R0(n))}function sl(n){const e=en[n.baseId];if(e&&e.length>0){const t=Hr.get(n.baseId);if(t)return t;const r=e.map(s=>({date:s.date,price:s.price,timestamp:s.timestamp}));return Hr.set(n.baseId,r),r}return n.history}function Id(n){if(n.price<=0)return 0;const e=sl(n);return jr(e).percent}function P0(n){const e=++dd;let t=0;const r=()=>{if(e!==dd)return;const s=Math.min(t+o0,n.length);for(;t<s;t+=1){const i=n[t],a=document.getElementById(`sparkline-${i.item.baseId}`);if(!a)continue;const c=c0(i.history,i.item.price);a0(a,c,i.trendData.trend)}t<n.length&&requestAnimationFrame(r)};requestAnimationFrame(r)}async function Ls(n){const e=(n==null?void 0:n.manualRefresh)===!0;try{const[t,r]=await Promise.all([ee.getItemDatabase(),ee.getCloudSyncStatus()]);Ko=t,$r=!!(r!=null&&r.enabled);let s=[];if($r){let i=null;const a=Va(Pe);wt=(a==null?void 0:a.nextRefreshAllowedAt)??0;const c=e&&wt>Date.now();!e&&a&&(i=a.historyByItem),(!i||e)&&(c&&a?i=a.historyByItem:(i=await ee.getPriceHistoryBatch({leagueId:Pe,maxDays:7,maxSnapshotDocs:160})??{},e&&(wt=Date.now()+i0),m0(Pe,i,wt))),en=i??{},Hr.clear(),Pa=Date.now(),ka=Pe,Qo={};const u=[];Object.entries(Ko).forEach(([h,f])=>{if(h===tn||f.tradable===!1)return;const m=f.name||`Unknown Item (${h})`,E=[...en[h]??[]].sort((O,J)=>O.timestamp-J.timestamp),S=E.length>0?E[E.length-1]:null,R=E.map(O=>({date:O.date,price:O.price,timestamp:O.timestamp})),P=(S==null?void 0:S.price)??0,F=(S==null?void 0:S.timestamp)??0,H=S==null?void 0:S.listingCount,V=P>0?jr(R):{trend:"neutral",percent:0};u.push({baseId:h,name:m,price:P,timestamp:F,listingCount:H,trend:V.trend,trendPercent:V.percent,group:f.group,history:R})}),s=u.sort((h,f)=>h.name.localeCompare(f.name))}else{wt=0,Qo=await ee.getPriceCache(),en={},Hr.clear(),Pa=0,ka="";const a=[];Object.entries(Ko).forEach(([c,u])=>{if(c===tn||u.tradable===!1)return;const h=u.name||`Unknown Item (${c})`,f=Qo[c],m=(f==null?void 0:f.price)??0,g=(f==null?void 0:f.timestamp)??0,E=f==null?void 0:f.listingCount,S=f==null?void 0:f.history,R=m>0?jr(S):{trend:"neutral",percent:0};a.push({baseId:c,name:h,price:m,timestamp:g,listingCount:E,trend:R.trend,trendPercent:R.percent,group:u.group,history:S})}),s=a.sort((c,u)=>c.name.localeCompare(u.name))}if(Nt=s,Fe&&!Nt.some(i=>i.baseId===Fe)&&(Fe=null,Ln+=1,qr(!1),$e)){const i=document.getElementById("pricesDetailChartTooltip");i&&i.remove(),$e.destroy(),$e=null}if(il(),ji(),Fe){const i=Fm(Fe);rl(i,!1);const a=Nt.find(c=>c.baseId===Fe);a&&nl(Fe,a.price,i)}vr=!0,Qs=Pe,tl()}catch(t){console.error("Failed to load prices:",t)}}function il(){let n=[...Nt];if(Ca){const e=Ca.toLowerCase();n=n.filter(t=>t.name.toLowerCase().includes(e)||t.baseId.toLowerCase().includes(e))}else Sa!=="all"&&(n=n.filter(e=>e.group===Sa));Nm=n}function Ed(n){Ca=n.trim(),il(),ji()}function k0(n){Sa=n,el&&(Ln+=1,qr(!1)),document.querySelectorAll(".prices-sidebar-item").forEach(e=>{e.classList.remove("active"),e.getAttribute("data-group")===n&&e.classList.add("active")}),il(),ji()}function D0(n){fi===n?bn=bn==="asc"?"desc":"asc":(fi=n,bn="asc"),document.querySelectorAll(".prices-table th").forEach(e=>{e.classList.remove("sort-asc","sort-desc"),e.getAttribute("data-sort")===n&&e.classList.add(`sort-${bn}`)}),ji()}function N0(){var H;const n=document.getElementById("pricesSearchInput"),e=document.getElementById("pricesClearSearch"),t=document.querySelectorAll(".prices-table th[data-sort]"),r=document.getElementById("pricesTableBody"),s=document.getElementById("pricesSeasonSelect"),i=document.getElementById("pricesRefreshBtn"),a=document.getElementById("pricesDetailBackBtn"),c=document.getElementById("pricesDetailName"),u=document.getElementById("pricesRangeSliderShell"),h=document.getElementById("pricesRangeNavigatorShell"),f=document.getElementById("pricesRangeMainSelection"),m=document.getElementById("pricesRangeNavigatorSelection"),g=document.getElementById("pricesRangeStart"),E=document.getElementById("pricesRangeEnd"),S=document.getElementById("pricesRangeNavigatorStart"),R=document.getElementById("pricesRangeNavigatorEnd");n&&n.addEventListener("input",V=>{const O=V.target.value;Ed(O),e&&(e.style.display=O?"block":"none")}),e&&e.addEventListener("click",()=>{n&&(n.value="",Ed(""),e.style.display="none")}),t.forEach(V=>{V.addEventListener("click",()=>{const O=V.getAttribute("data-sort");O&&D0(O)})}),r&&r.addEventListener("click",V=>{const J=V.target.closest("tr[data-base-id]"),Q=J==null?void 0:J.getAttribute("data-base-id");Q&&vd(Q)}),s&&(Pe=s.value,s.addEventListener("change",()=>{var V;Pe=s.value,wt=((V=Va(Pe))==null?void 0:V.nextRefreshAllowedAt)??0,Hi.clear(),Ra.clear(),se=[],Ne=0,Ee=0,zr(),Ks+=1,en={},Hr.clear(),Pa=0,ka="",vr=!1,Ls(),el&&Fe&&vd(Fe)})),i&&i.addEventListener("click",()=>{Ls({manualRefresh:!0})}),a&&a.addEventListener("click",()=>{Ln+=1,qr(!1)}),c&&c.addEventListener("click",()=>{const V=c.dataset.tlidbUrl;V&&ee.openExternal(V)}),g&&(g.addEventListener("pointerdown",()=>tt("start")),g.addEventListener("focus",()=>tt("start")),g.addEventListener("input",()=>{if(se.length===0)return;const V=Number(g.value);Number.isFinite(V)&&Sn(V,Ee)})),E&&(E.addEventListener("pointerdown",()=>tt("end")),E.addEventListener("focus",()=>tt("end")),E.addEventListener("input",()=>{if(se.length===0)return;const V=Number(E.value);Number.isFinite(V)&&Sn(Ne,V)})),S&&(S.addEventListener("pointerdown",()=>tt("start")),S.addEventListener("focus",()=>tt("start")),S.addEventListener("input",()=>{if(se.length===0)return;const V=Number(S.value);Number.isFinite(V)&&Sn(V,Ee)})),R&&(R.addEventListener("pointerdown",()=>tt("end")),R.addEventListener("focus",()=>tt("end")),R.addEventListener("input",()=>{if(se.length===0)return;const V=Number(R.value);Number.isFinite(V)&&Sn(Ne,V)})),u&&u.addEventListener("pointerdown",V=>gd(V,"main")),h&&h.addEventListener("pointerdown",V=>gd(V,"nav")),f&&f.addEventListener("pointerdown",V=>yd(V,"main")),m&&m.addEventListener("pointerdown",V=>yd(V,"nav")),document.addEventListener("pointermove",C0),document.addEventListener("pointerup",V=>_d(V)),document.addEventListener("pointercancel",V=>_d(V)),document.querySelectorAll(".prices-sidebar-item").forEach(V=>{V.addEventListener("click",()=>{const O=V.getAttribute("data-group");O&&k0(O)})});const F=document.getElementById("page-prices");F&&(new MutationObserver(O=>{O.forEach(J=>{J.type==="attributes"&&J.attributeName==="class"&&F.classList.contains("active")&&(!vr||Qs!==Pe)&&(vr=!0,Qs=Pe,Ls())})}).observe(F,{attributes:!0}),F.classList.contains("active")&&(vr=!0,Qs=Pe,Ls())),tt("end"),zr(),qr(!1),ee.onInventoryUpdate(()=>{}),wt=((H=Va(Pe))==null?void 0:H.nextRefreshAllowedAt)??0,y0(),tl()}function Um(n){Rr(),Ot()&&!mm()&&Pr(),nt(Me)}async function wd(){const[n,e]=await Promise.all([ee.getInventory(),ee.getItemDatabase()]);oT(e);const t=n.map(r=>r.baseId===tn?{...r,price:1}:r);iT(t),_T()||(AT(),vT(!0)),Ot()&&!mm()&&kT(),Qc(),Me(),Um(),nt(Me)}async function V0(){document.body.classList.add("layout-style-1"),t0(),OT(),UT(),FT(),HT(Me,()=>nt(Me)),KT(),XT(),ZT();const n=e0();QT(Me,()=>nt(Me),Um,n),TT(ed,td,Vn,BT),ST(ed,td,nd,Yc,Jc,Xc,Zc,jT,Me,()=>nt(Me)),n0(Me,()=>nt(Me),Rr,Pr),r0(RT,LT,NT,VT,bT,Rr,Pr,Me,()=>nt(Me),di,qT),s0(),N0(),ee.onTimerTick(r=>{if(r.type==="realtime")Uc(r.seconds),je()==="realtime"&&(Vn.textContent=qn(r.seconds)),Rr();else if(r.type==="hourly"){fm(r.seconds),nd.textContent=qn(r.seconds);const s=Ui();if(je()==="hourly"){const i=ns();i.push({time:Date.now(),value:s}),Ur(i),di()}Pr(),Me(),nt(Me),r.seconds%3600===0&&r.seconds>0&&DT()}}),ee.onInventoryUpdate(()=>{wd()});const[e,t]=await Promise.all([ee.getSettings(),ee.isLogPathConfigured()]);Ta(e.includeTax!==void 0?e.includeTax:!1),t?(await wd(),await Fh()):await Fh(),Sm()}async function Td(){await Op(),await V0()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Td):Td();
