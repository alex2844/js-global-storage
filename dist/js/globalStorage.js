var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(c){var a=0;return function(){return a<c.length?{done:!1,value:c[a++]}:{done:!0}}};$jscomp.arrayIterator=function(c){return{next:$jscomp.arrayIteratorImpl(c)}};$jscomp.makeIterator=function(c){var a="undefined"!=typeof Symbol&&Symbol.iterator&&c[Symbol.iterator];return a?a.call(c):$jscomp.arrayIterator(c)};$jscomp.arrayFromIterator=function(c){for(var a,b=[];!(a=c.next()).done;)b.push(a.value);return b};
$jscomp.arrayFromIterable=function(c){return c instanceof Array?c:$jscomp.arrayFromIterator($jscomp.makeIterator(c))};$jscomp.getGlobal=function(c){c=["object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global,c];for(var a=0;a<c.length;++a){var b=c[a];if(b&&b.Math==Math)return b}return globalThis};$jscomp.global=$jscomp.getGlobal(this);$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;
$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(c,a,b){c!=Array.prototype&&c!=Object.prototype&&(c[a]=b.value)};$jscomp.polyfill=function(c,a,b,f){if(a){b=$jscomp.global;c=c.split(".");for(f=0;f<c.length-1;f++){var d=c[f];d in b||(b[d]={});b=b[d]}c=c[c.length-1];f=b[c];a=a(f);a!=f&&null!=a&&$jscomp.defineProperty(b,c,{configurable:!0,writable:!0,value:a})}};
$jscomp.polyfill("globalThis",function(c){return c||$jscomp.global},"es_next","es3");$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.SymbolClass=function(c,a){this.$jscomp$symbol$id_=c;$jscomp.defineProperty(this,"description",{configurable:!0,writable:!0,value:a})};$jscomp.SymbolClass.prototype.toString=function(){return this.$jscomp$symbol$id_};
$jscomp.Symbol=function(){function c(b){if(this instanceof c)throw new TypeError("Symbol is not a constructor");return new $jscomp.SymbolClass($jscomp.SYMBOL_PREFIX+(b||"")+"_"+a++,b)}var a=0;return c}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var c=$jscomp.global.Symbol.iterator;c||(c=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("Symbol.iterator"));"function"!=typeof Array.prototype[c]&&$jscomp.defineProperty(Array.prototype,c,{configurable:!0,writable:!0,value:function(){return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))}});$jscomp.initSymbolIterator=function(){}};
$jscomp.initSymbolAsyncIterator=function(){$jscomp.initSymbol();var c=$jscomp.global.Symbol.asyncIterator;c||(c=$jscomp.global.Symbol.asyncIterator=$jscomp.global.Symbol("Symbol.asyncIterator"));$jscomp.initSymbolAsyncIterator=function(){}};$jscomp.iteratorPrototype=function(c){$jscomp.initSymbolIterator();c={next:c};c[$jscomp.global.Symbol.iterator]=function(){return this};return c};
$jscomp.iteratorFromArray=function(c,a){$jscomp.initSymbolIterator();c instanceof String&&(c+="");var b=0,f={next:function(){if(b<c.length){var d=b++;return{value:a(d,c[d]),done:!1}}f.next=function(){return{done:!0,value:void 0}};return f.next()}};f[Symbol.iterator]=function(){return f};return f};$jscomp.polyfill("Array.prototype.keys",function(c){return c?c:function(){return $jscomp.iteratorFromArray(this,function(a){return a})}},"es6","es3");$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.polyfill("Promise",function(c){function a(){this.batch_=null}function b(a){return a instanceof d?a:new d(function(g,b){g(a)})}if(c&&!$jscomp.FORCE_POLYFILL_PROMISE)return c;a.prototype.asyncExecute=function(a){if(null==this.batch_){this.batch_=[];var g=this;this.asyncExecuteFunction(function(){g.executeBatch_()})}this.batch_.push(a)};var f=$jscomp.global.setTimeout;a.prototype.asyncExecuteFunction=function(a){f(a,0)};a.prototype.executeBatch_=function(){for(;this.batch_&&this.batch_.length;){var a=
this.batch_;this.batch_=[];for(var b=0;b<a.length;++b){var d=a[b];a[b]=null;try{d()}catch(m){this.asyncThrow_(m)}}}this.batch_=null};a.prototype.asyncThrow_=function(a){this.asyncExecuteFunction(function(){throw a;})};var d=function(a){this.state_=0;this.result_=void 0;this.onSettledCallbacks_=[];var b=this.createResolveAndReject_();try{a(b.resolve,b.reject)}catch(l){b.reject(l)}};d.prototype.createResolveAndReject_=function(){function a(a){return function(g){d||(d=!0,a.call(b,g))}}var b=this,d=!1;
return{resolve:a(this.resolveTo_),reject:a(this.reject_)}};d.prototype.resolveTo_=function(a){if(a===this)this.reject_(new TypeError("A Promise cannot resolve to itself"));else if(a instanceof d)this.settleSameAsPromise_(a);else{a:switch(typeof a){case "object":var b=null!=a;break a;case "function":b=!0;break a;default:b=!1}b?this.resolveToNonPromiseObj_(a):this.fulfill_(a)}};d.prototype.resolveToNonPromiseObj_=function(a){var b=void 0;try{b=a.then}catch(l){this.reject_(l);return}"function"==typeof b?
this.settleSameAsThenable_(b,a):this.fulfill_(a)};d.prototype.reject_=function(a){this.settle_(2,a)};d.prototype.fulfill_=function(a){this.settle_(1,a)};d.prototype.settle_=function(a,b){if(0!=this.state_)throw Error("Cannot settle("+a+", "+b+"): Promise already settled in state"+this.state_);this.state_=a;this.result_=b;this.executeOnSettledCallbacks_()};d.prototype.executeOnSettledCallbacks_=function(){if(null!=this.onSettledCallbacks_){for(var a=0;a<this.onSettledCallbacks_.length;++a)h.asyncExecute(this.onSettledCallbacks_[a]);
this.onSettledCallbacks_=null}};var h=new a;d.prototype.settleSameAsPromise_=function(a){var b=this.createResolveAndReject_();a.callWhenSettled_(b.resolve,b.reject)};d.prototype.settleSameAsThenable_=function(a,b){var d=this.createResolveAndReject_();try{a.call(b,d.resolve,d.reject)}catch(m){d.reject(m)}};d.prototype.then=function(a,b){function c(a,b){return"function"==typeof a?function(b){try{f(a(b))}catch(n){g(n)}}:b}var f,g,h=new d(function(a,b){f=a;g=b});this.callWhenSettled_(c(a,f),c(b,g));return h};
d.prototype.catch=function(a){return this.then(void 0,a)};d.prototype.callWhenSettled_=function(a,b){function d(){switch(c.state_){case 1:a(c.result_);break;case 2:b(c.result_);break;default:throw Error("Unexpected state: "+c.state_);}}var c=this;null==this.onSettledCallbacks_?h.asyncExecute(d):this.onSettledCallbacks_.push(d)};d.resolve=b;d.reject=function(a){return new d(function(b,d){d(a)})};d.race=function(a){return new d(function(d,c){for(var f=$jscomp.makeIterator(a),g=f.next();!g.done;g=f.next())b(g.value).callWhenSettled_(d,
c)})};d.all=function(a){var c=$jscomp.makeIterator(a),f=c.next();return f.done?b([]):new d(function(a,d){function g(b){return function(d){h[b]=d;k--;0==k&&a(h)}}var h=[],k=0;do h.push(void 0),k++,b(f.value).callWhenSettled_(g(h.length-1),d),f=c.next();while(!f.done)})};return d},"es6","es3");$jscomp.findInternal=function(c,a,b){c instanceof String&&(c=String(c));for(var f=c.length,d=0;d<f;d++){var h=c[d];if(a.call(b,h,d,c))return{i:d,v:h}}return{i:-1,v:void 0}};
$jscomp.polyfill("Array.prototype.findIndex",function(c){return c?c:function(a,b){return $jscomp.findInternal(this,a,b).i}},"es6","es3");$jscomp.owns=function(c,a){return Object.prototype.hasOwnProperty.call(c,a)};$jscomp.assign="function"==typeof Object.assign?Object.assign:function(c,a){for(var b=1;b<arguments.length;b++){var f=arguments[b];if(f)for(var d in f)$jscomp.owns(f,d)&&(c[d]=f[d])}return c};$jscomp.polyfill("Object.assign",function(c){return c||$jscomp.assign},"es6","es3");
(function(){var c=function(a){var b=this,c=this;Object.defineProperty(this,"#storageAvailable",{value:function(){try{var a=window.localStorage;a.setItem("__storage_test__","__storage_test__");a.removeItem("__storage_test__");return!0}catch(g){return!1}}(),enumerable:!1});if(a&&(a.url&&-1<a.url.indexOf("//docs.google.com/spreadsheets/d/")&&(a.spreadsheet=a.url.split("/d/")[1].split("/")[0],delete a.url),a.spreadsheet)){if(!a.proxy&&-1<navigator.userAgent.indexOf("/bot"))a.proxy="https://proxy.fetchcors.workers.dev/";
else if(!document.querySelector('link[href="https://spreadsheets.google.com"]')){var d=document.createElement("link");d.rel="preconnect";d.href="https://spreadsheets.google.com";document.getElementsByTagName("head")[0].appendChild(d)}Object.defineProperty(this,"#cache",{value:new Proxy({},{get:function(a,b){return(c["#storageAvailable"]&&localStorage.sheetStorageCache?JSON.parse(localStorage.sheetStorageCache):{})[b]},set:function(a,b,d){c["#storageAvailable"]&&(a=localStorage.sheetStorageCache?JSON.parse(localStorage.sheetStorageCache):
{},a[b]={time:Math.round((new Date).getTime()/1E3),body:d},localStorage.sheetStorageCache=JSON.stringify(a));return!0}}),enumerable:!1})}Object.defineProperty(this,"#opts",{value:a||null,enumerable:!1});!("BroadcastChannel"in window)||this["#opts"]&&this["#opts"].spreadsheet||(Object.defineProperty(this,"#broadcast",{value:new BroadcastChannel("globalStorageBroadcast:"+this.hash(this["#opts"])),enumerable:!1}),this["#broadcast"].addEventListener("message",function(a){b["#opts"].providers&&(a.data.cron?
(b["#timers"].cron&&clearTimeout(b["#timers"].cron),b["#timers"].multitabs&&clearTimeout(b["#timers"].multitabs),b["#timers"].multitabs=setTimeout(function(){return b.cron()},6E5)):(b["#data"]=JSON.parse(localStorage.getItem("syncStorageCache"+(b["#opts"].prefix?"_"+b["#opts"].prefix:""))),b.reload()));window.dispatchEvent(b.globalStorageEvent(a.data))}));return this.reload(!0)};c.prototype.globalStorageEvent=function(a){return Object.defineProperties(new CustomEvent(a.type),{id:{value:this["#broadcast"].name,
enumerable:!0},key:{value:a.key||null,enumerable:!0},oldValue:{value:a.oldValue||null,enumerable:!0},newValue:{value:a.newValue||null,enumerable:!0},url:{value:a.url||null,enumerable:!0},path:{value:a.path||[],enumerable:!0},storageArea:{value:this,enumerable:!0}})};c.prototype.reload=function(a){var b=this;a||Object.keys(this).forEach(function(a){return delete b[a]});if(this["#opts"]){if(this["#opts"].spreadsheet)return(this["#opts"].lists||this["#cache"][this["#opts"].spreadsheet]&&3600>Math.round((new Date).getTime()/
1E3)-this["#cache"][this["#opts"].spreadsheet].time&&(this["#opts"].lists=this["#cache"][this["#opts"].spreadsheet].body)?Promise.resolve(this["#opts"].lists):fetch((this["#opts"].proxy||"")+"https://spreadsheets.google.com/feeds/worksheets/"+this["#opts"].spreadsheet+"/public/basic?alt=json").then(function(a){return a.json().then(function(a){return b["#cache"][b["#opts"].spreadsheet]=a.feed.entry.map(function(a){return{id:a.id.$t.split("/").slice(-1)[0],title:a.content.$t,time:Math.round((new Date(a.updated.$t)).getTime()/
1E3)}})})})).then(function(a){a.forEach(function(a){return Object.defineProperty(b,a.title,{enumerable:!0,get:function(){return this.fetchList(a.id)}})});var d=Object.getOwnPropertyNames(b.__proto__).concat(["then"]);return new Proxy(b,{get:function(a,b){return-1!=d.indexOf(b)||a.hasOwnProperty(b)?a[b]:Promise.reject()}})});if(this["#opts"].providers){if(a){var f="syncStorageCache"+(this["#opts"].prefix?"_"+this["#opts"].prefix:"");Object.defineProperties(this,{"#timers":{value:{},enumerable:!1,writable:!0,
configurable:!0},"#data":{value:localStorage.getItem(f)?JSON.parse(localStorage.getItem(f)):[c.merge(c.default(this["#opts"].default))],enumerable:!1,writable:!0,configurable:!0}});return this.auth(null)}console.log("reload");a=c.merge.apply(c,$jscomp.arrayFromIterable(this["#data"].map(function(a){return a.config})));for(f in a)Object.defineProperty(this,f,{value:a[f],enumerable:!0,writable:!0,configurable:!0})}else this["#opts"].cookie&&document.cookie.split("; ").filter(function(a){return a}).forEach(function(a){return b[a.split("=")[0]]=
a.split("=").slice(1).join("=")})}return this.__isProxy?this:new Proxy(this,{set:function(a,c,f){console.log("SET",{obj:a,key:c,val:f});b.save(c,a[c],a[c]=f);return!0},get:function(a,b){return"__isProxy"!==b?a[b]:!0}})};c.prototype.users=function(){return this["#data"].map(function(a){return a.user}).filter(function(a){return a})};c.prototype.users_add=function(a,b,f,d){var h=this;console.log("add",{user:a});if(this.users().length)console.log("adding 2 user");else{if(a){var g=this.users();-1<(g=g.length?
g.findIndex(function(b){return b.id==a.id}):0)?(this["#data"][g].user=a,b&&(this["#data"][g].token=b)):g=this["#data"].push(c.merge(c.default(this["#opts"].default),{user:a,token:b||{}}))-1;console.log("USER",a,g);return f(this.fetchFind())}"corsProxy"in window&&corsProxy&&"gapi"in corsProxy?corsProxy.gapi().then(function(a){a.time=Math.round((new Date).getTime()/1E3);gapi.client.setToken({access_token:a.access_token});return gapi.client.request({path:"https://people.googleapis.com/v1/people/me",
params:{personFields:"emailAddresses,names,photos"}}).then(function(b){return h.users_add({id:b.result.emailAddresses[0].value,name:b.result.names[0].displayName,iconURL:b.result.photos[0].url,provider:"https://accounts.google.com"},a,f,d)},function(a){return d(a)})}):gapi.auth2.getAuthInstance().signIn().then(function(a){a=a.getBasicProfile();a={id:a.getEmail(),name:a.getName(),iconURL:a.getImageUrl(),provider:"https://accounts.google.com"};window.PasswordCredential&&navigator.credentials.store(new FederatedCredential(a));
return h.users_add(a,null,f,d)},function(a){return d(a)})}};c.prototype.gapi=function(){return new Promise(function(a,b){if("gapi"in window)return gapi.load("client",function(){return a()});var c=document.createElement("script");c.src="https://apis.google.com/js/api.js";c.addEventListener("load",function(){return gapi.load("client",function(){return a()})});c.addEventListener("error",function(a){return b(a)});document.body.appendChild(c)})};c.prototype.auth=function(a,b,c){var d=this;return b&&c?
gapi.client.init({apiKey:this["#opts"].providers.google.key,clientId:this["#opts"].providers.google.id,scope:"https://www.googleapis.com/auth/drive.appfolder https://www.googleapis.com/auth/user.emails.read https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"}).then(function(){"corsProxy"in window&&corsProxy&&"async"in corsProxy&&"gapiAsync"in corsProxy&&(corsProxy.gapi=function(){return corsProxy.async("gapiAsync",{client_id:d["#opts"].providers.google.id,
scope:gapi.auth2.getAuthInstance().getInitialScopes()}).then(function(a){return JSON.parse(a)})});console.log("init",{id:a});if(a){var f=gapi.auth2.getAuthInstance();if(f.isSignedIn.get()){var g=f.currentUser.get().getBasicProfile();g={id:g.getEmail(),name:g.getName(),iconURL:g.getImageUrl(),provider:"https://accounts.google.com"};if(g.id===a)return d.users_add(g,null,b,c)}f.signIn({login_hint:a||""}).then(function(a){a=a.getBasicProfile();return d.users_add({id:a.getEmail(),name:a.getName(),iconURL:a.getImageUrl(),
provider:"https://accounts.google.com"},null,b,c)},function(a){return c(a)})}else d.users().length?b():d.users_add(null,null,b,c)},function(a){c(a)}):(new Promise(function(b,c){d.users().length||null!==a?d.gapi().then(function(){return d.auth(a,b,c)}):null===a?d.credentials("silent").then(function(a){return a?d.auth(a).then(function(){return b()}).catch(function(a){return c(a)}):b(null)}):b(null)})).then(function(a){return null!==a?d.cron():d.reload()})};c.prototype.cron=function(){var a=this,b=Math.round((new Date).getTime()/
1E3);if(this["#data"][0].token.access_token)if(this["#data"][0].token.time+this["#data"][0].token.expires_in>b+30)gapi.client.setToken({access_token:this["#data"][0].token.access_token});else if("corsProxy"in window&&corsProxy&&"gapi"in corsProxy)return corsProxy.gapi().then(function(b){b.time=Math.round((new Date).getTime()/1E3);gapi.client.setToken({access_token:b.access_token});return a.cron(a["#data"][0].token=b)});return new Promise(function(f,d){a["#broadcast"].postMessage({cron:!0});a["#timers"].cron&&
clearTimeout(a["#timers"].cron);var h=300<b-a["#data"][0].time?0:3E5;h&&(console.log("skip wait cron",h),f(a.reload()));a["#timers"].cron=setTimeout(function(){console.log("Starting periodic sources sync: "+h);var b=a.hash(a["#data"][0].config);a.fetchConfigLoad().then(function(){var c=a.reload();h&&b!=a.hash(a["#data"][0].config)&&window.dispatchEvent(a.globalStorageEvent({url:location.href,type:"storage"}));return a.cron(f(c))}).catch(function(b){a["#data"][0]=c.default(a["#data"][0].config);a.save();
d(b)})},h)})};c.prototype.credentials=function(a){return!window.PasswordCredential||!window.PublicKeyCredential||navigator.webdriver||!window.chrome||-1<navigator.userAgent.indexOf("/bots")?Promise.resolve(null):navigator.credentials.get({federated:{providers:["https://accounts.google.com"]},mediation:a}).then(function(a){if(!a)return null;switch(a.type){case "federated":switch(a.provider){case "https://accounts.google.com":return a.id}}})};c.prototype.fetchFind=function(a){var b=this,c="syncStorage"+
(this["#opts"].prefix?"_"+this["#opts"].prefix:"");return new Promise(function(d,f){if(b["#data"][0].id)return d();console.log("Finded remote file");gapi.client.request({path:"/drive/v3/files",params:{spaces:"appDataFolder",fields:"files(id, name)",pageSize:500,q:"name = '"+c+"_config.json'",orderBy:"createdTime"}}).then(function(g){g.result.files.length?(console.log("find file",g.result.files),d(b.fetchConfigLoad(a,b["#data"][0].id=g.result.files[0].id))):gapi.client.request({path:"/drive/v3/files/",
method:"POST",body:{name:c+"_config.json",mimeType:"application/json",parents:["appDataFolder"]}}).then(function(a){console.log("create file",a.result);d(b["#data"][0].id=a.result.id)},function(a){return f(a)})},function(a){return f(a)})})};c.prototype.fetchConfigLoad=function(a,b){var f=this;return new Promise(function(d,h){if(!f["#data"][0].id)return d();console.log("fetchConfigLoad");gapi.client.request({path:"/drive/v3/files/"+f["#data"][0].id,params:{alt:"media"}}).then(function(a){a.result?
(console.log("BODY",f["#data"][0].config,a.result),f["#data"][0].config=b?c.merge(f["#data"][0].config,a.result):Object.assign(f["#data"][0].config,a.result)):console.log("BODY",a);f["#timers"].hash=f.hash(f["#data"][0].config);f.save();return d()},function(b){console.log("error fetchConfigLoad");a?h(e):d(f.fetchFind(!0,f["#data"][0].id=null))})})};c.prototype.fetchList=function(a){var b=this;return(this["#cache"][this["#opts"].spreadsheet+"/"+a]&&3600>Math.round((new Date).getTime()/1E3)-this["#cache"][this["#opts"].spreadsheet+
"/"+a].time?Promise.resolve(this["#cache"][this["#opts"].spreadsheet+"/"+a].body):fetch((this["#opts"].proxy||"")+"https://spreadsheets.google.com/feeds/cells/"+this["#opts"].spreadsheet+"/"+(a||"od6")+"/public/values?alt=json",{signal:this["#opts"].signal}).then(function(c){return c.json().then(function(c){return b["#cache"][b["#opts"].spreadsheet+"/"+a]=c.feed.entry?c.feed.entry.reduce(function(a,b){for(;a.length<b.gs$cell.row;)a.push([]);for(var c=a[a.length-1];c.length+1<b.gs$cell.col;)c.push("");
c.push(b.content.$t);return a},[]):[]})})).then(function(a){return Object.defineProperties({},{cells:{value:a,enumerable:!0},json:{enumerable:!0,get:function(){return a.slice(1).reduce(function(b,c){b.push(c.reduce(function(b,c,d){b[a[0][d]]=c;return b},{}));return b},[])}}})})};c.prototype.hash=function(a){return("string"==typeof a?a:JSON.stringify(a)).split("").reduce(function(a,c){a=(a<<5)-a+c.charCodeAt(0);return a&a},0)};c.prototype.getItem=function(a){var b=this,c="path"in this?this.path[0]:
this;if(c["#opts"]&&c["#opts"].spreadsheet)return this[a];if(c["#opts"]&&c["#opts"].providers&&"object"==typeof this[a]){var d=this.path||[this];d.push(this[a]);Object.defineProperties(this[a],{id:{value:a,enumerable:!1},path:{value:d,enumerable:!1,writable:!0,configurable:!0}});Object.getOwnPropertyNames(c.__proto__).forEach(function(d){return Object.defineProperty(b[a],d,{value:c.__proto__[d],enumerable:!1})});return this[a]}return this.hasOwnProperty(a)?String(this[a]):null};c.prototype.setItem=
function(a,b){var c="path"in this?this.path[0]:this;if(c["#opts"])if(c["#opts"].cookie)c=new Date,c.setTime(c.getTime()+864E5),document.cookie=a+"="+b+";path=/;expires="+c.toUTCString();else if(c["#opts"].providers){var d=this[a];this[a]=b;var h={},g;for(g in c["#data"])h.$jscomp$loop$prop$d$3=c["#data"][g].config,"path"in this&&this.path.slice(1).forEach(function(a){return function(b){return a.$jscomp$loop$prop$d$3=a.$jscomp$loop$prop$d$3[b.id]}}(h)),h.$jscomp$loop$prop$d$3[a]=b,h={$jscomp$loop$prop$d$3:h.$jscomp$loop$prop$d$3};
"path"in this&&c.save(a,d,b,this.path);return}this[a]=void 0===b?null:String(b)};c.prototype.removeItem=function(a){var b="path"in this?this.path[0]:this;if(b["#opts"])if(b["#opts"].cookie)document.cookie=a+"=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";else if(b["#opts"].providers){var c=this[a];this[a]=void 0;delete this[a];var d={},h;for(h in b["#data"])d.$jscomp$loop$prop$d$5=b["#data"][h].config,"path"in this&&this.path.slice(1).forEach(function(a){return function(b){return a.$jscomp$loop$prop$d$5=
a.$jscomp$loop$prop$d$5[b.id]}}(d)),d.$jscomp$loop$prop$d$5[a]=void 0,delete d.$jscomp$loop$prop$d$5[a],d={$jscomp$loop$prop$d$5:d.$jscomp$loop$prop$d$5};"path"in this&&b.save(a,c,void 0,this.path);return}this[a]=void 0;delete this[a]};c.prototype.clear=function(){var a=this;Object.keys(this).forEach(function(b){return delete a[b]});this.save()};c.prototype.key=function(a){if(void 0==a)throw new TypeError("Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present.");return Object.keys(this)[a]};
c.prototype.save=function(a,b,c,d){var f=this;if(!a||b!==c){!this["#opts"].providers&&"BroadcastChannel"in window&&this["#broadcast"].postMessage({key:a,oldValue:b,newValue:c,path:d?d.slice(1).map(function(a){return a.id}):[],url:location.href,type:"storage"});console.log("SAVE",this);var g="path"in this?this.path[0]:this;if(g["#opts"]&&g["#opts"].providers){for(var k in g["#data"])g["#data"][k].time=Math.round((new Date).getTime()/1E3);g["#timers"].save&&clearTimeout(g["#timers"].save);g["#timers"].save=
setTimeout(function(){localStorage.setItem("syncStorageCache"+(g["#opts"].prefix?"_"+g["#opts"].prefix:""),JSON.stringify(g["#data"]));f["#opts"].providers&&"BroadcastChannel"in window&&f["#broadcast"].postMessage({key:a,oldValue:b,newValue:c,path:d?d.slice(1).map(function(a){return a.id}):[],url:location.href,type:"storage"});g["#timers"].sync&&clearTimeout(g["#timers"].sync);var h=g.hash(g["#data"][0].config);g["#timers"].hash==h&&console.log("hash == hash");"gapi"in window&&(gapi.auth2.getAuthInstance().isSignedIn.get()||
g["#data"][0].token.access_token)&&g["#timers"].hash!=h&&(g["#timers"].hash=h,g["#timers"].sync=setTimeout(function(){g["#data"].forEach(function(a){console.log("sync",a.config);gapi.client.request({path:"/upload/drive/v3/files/"+a.id,method:"PATCH",params:{uploadType:"media"},body:"string"==typeof a.config?a.config:JSON.stringify(a.config)}).then(function(){},function(a){return console.log("error sync",a)})});delete g["#timers"].sync},2250));delete g["#timers"].save},250)}}};c.default=function(a){return{id:null,
time:null,user:null,token:{},config:a||{welcome:!1}}};c.merge=function(){for(var a,b,c={},d=[].splice.call(arguments,0);0<d.length;)if("[object Object]"==toString.call(a=d.splice(0,1)[0]))for(b in a)a.hasOwnProperty(b)&&("[object Object]"==toString.call(a[b])?c[b]=this.merge(c[b]||{},a[b]):c[b]&&"[object Array]"==toString.call(a[b])?0<Object.keys(a[b]).length&&(c[b]=a[b].concat(c[b])):c[b]=a[b]);return c};c.init=function(){window.globalStorage=this;"sessionStorage"in window||(window.sessionStorage=
new this);"localStorage"in window||(window.localStorage=new this);window.cookieStorage=new this({cookie:!0})};$jscomp.global.Object.defineProperties(c.prototype,{length:{configurable:!0,enumerable:!0,get:function(){return Object.keys(this).length}}});c.init()})();