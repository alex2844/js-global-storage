(function () {
	'use strict';
	(class globalStorage {
		globalStorageEvent(opts) {
			return Object.defineProperties(new CustomEvent(opts.type), {
				id: {
					value: this['#broadcast'].name,
					enumerable: true
				},
				key: {
					value: (opts.key || null),
					enumerable: true
				},
				oldValue: {
					value: (opts.oldValue || null),
					enumerable: true
				},
				newValue: {
					value: (opts.newValue || null),
					enumerable: true
				},
				url: {
					value: (opts.url || null),
					enumerable: true
				},
				path: {
					value: (opts.path || []),
					enumerable: true
				},
				storageArea: {
					value: this,
					enumerable: true
				}
			});
		}
		constructor(opts) {
			if (opts) {
				if (opts.url) {
					if (opts.url.indexOf('//docs.google.com/spreadsheets/d/') > -1) {
						opts.spreadsheet = opts.url.split('/d/')[1].split('/')[0];
						delete opts.url;
					}
				}
				if (opts.spreadsheet) {
					if (!opts.proxy && (navigator.userAgent.indexOf('/bot') > -1))
						opts.proxy = 'https://proxy.fetchcors.workers.dev/';
					else if (!document.querySelector('link[href="https://spreadsheets.google.com"]')) {
						let link = document.createElement('link');
						link.rel = 'preconnect';
						link.href = 'https://spreadsheets.google.com';
						document.getElementsByTagName('head')[0].appendChild(link);
					}
					Object.defineProperty(this, '#cache', {
						value: new Proxy({}, {
							get (target, k) {
								return (localStorage.sheetStorageCache ? JSON.parse(localStorage.sheetStorageCache) : {})[k];
							},
							set (target, k, v) {
								let cache = (localStorage.sheetStorageCache ? JSON.parse(localStorage.sheetStorageCache) : {});
								cache[k] = {
									time: Math.round(new Date().getTime()/1000),
									body: v
								};
								localStorage.sheetStorageCache = JSON.stringify(cache);
								return true;
							}
						}),
						enumerable: false
					});
				}
			}
			Object.defineProperty(this, '#opts', {
				value: (opts || null),
				enumerable: false
			});
			if (('BroadcastChannel' in window) && (!this['#opts'] || !this['#opts'].spreadsheet)) {
				Object.defineProperty(this, '#broadcast', {
					value: new BroadcastChannel('globalStorageBroadcast:'+this.hash(this['#opts'])),
					enumerable: false
				});
				this['#broadcast'].addEventListener('message', e => {
					if (this['#opts'].providers) {
						if (e.data.cron) {
							if (this['#timers'].cron)
								clearTimeout(this['#timers'].cron);
							if (this['#timers'].multitabs)
								clearTimeout(this['#timers'].multitabs);
							this['#timers'].multitabs = setTimeout(() => this.cron(), (10 * 60 * 1000));
						}else{
							this['#data'] = JSON.parse(localStorage.getItem('syncStorageCache'+(this['#opts'].prefix ? '_'+this['#opts'].prefix : '')));
							this.reload();
						}
					}
					window.dispatchEvent(this.globalStorageEvent(e.data));
				});
			}
			return this.reload(true);
		}
		get length() {
			return Object.keys(this).length;
		}
		reload(init) {
			if (!init)
				Object.keys(this).forEach(key => (delete this[key]));
			if (this['#opts']) {
				if (this['#opts'].spreadsheet)
					return (
						(this['#opts'].lists || (
							this['#cache'][this['#opts'].spreadsheet] &&
							((Math.round(new Date().getTime()/1000) - this['#cache'][this['#opts'].spreadsheet].time) < (60 * 60)) &&
							(this['#opts'].lists = this['#cache'][this['#opts'].spreadsheet].body)
						))
						? Promise.resolve(this['#opts'].lists)
						: fetch((this['#opts'].proxy || '')+'https://spreadsheets.google.com/feeds/worksheets/'+this['#opts'].spreadsheet+'/public/basic?alt=json').then(res => {
							return res.json().then(res => (this['#cache'][this['#opts'].spreadsheet] = res.feed.entry.map(v => ({
								id: v.id.$t.split('/').slice(-1)[0],
								title: v.content.$t,
								time: Math.round(new Date(v.updated.$t).getTime()/1000)
							}))));
						})
					).then(res => {
						res.forEach(v => Object.defineProperty(this, v.title, {
							enumerable: true,
							get() {
								return this.fetchList(v.id);
							}
						}));
						const props = Object.getOwnPropertyNames(this.__proto__).concat(['then']);
						return new Proxy(this, {
							get (target, k) {
								return (((props.indexOf(k) == -1) && !target.hasOwnProperty(k)) ? Promise.reject() : target[k]);
							}
						});
					});
				else if (this['#opts'].providers) {
					if (init) {
						let key = 'syncStorageCache'+(this['#opts'].prefix ? '_'+this['#opts'].prefix : '');
						Object.defineProperties(this, {
							'#timers': {
								value: {},
								enumerable: false,
								writable: true,
								configurable: true
							},
							'#data': {
								value: (localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [
									globalStorage.merge(globalStorage.default(this['#opts'].default))
								]),
								enumerable: false,
								writable: true,
								configurable: true
							}
						});
						return this.auth(null);
					}else{
						console.log('reload');
						let data = globalStorage.merge(...(this['#data']).map(d => d.config));
						for (let k in data) {
							// this[k] = data[k];
							Object.defineProperty(this, k, {
								value: data[k],
								enumerable: true,
								writable: true,
								configurable: true
							});
						}
					}
				}else if (this['#opts'].cookie)
					document.cookie.split('; ').filter(v => v).forEach(v => (this[v.split('=')[0]] = v.split('=').slice(1).join('=')));
			}
			return (this.__isProxy ? this : new Proxy(this, {
				set: (obj, key, val) => {
					console.log('SET', { obj, key, val });
					this.save(key, obj[key], (obj[key] = val));
					return true;
				},
				get: (target, key) => {
					if (key !== '__isProxy')
						return target[key];
					return true;
				}
			}));
		}
		users() {
			return this['#data'].map(v => v.user).filter(v => v);
		}
		users_add(user, token, res, rej) {
			console.log('add', { user });
			if (this.users().length)
				console.log('adding 2 user'); // data-api="/api/auth/token"
				// gapi.auth2.getAuthInstance().currentUser.get().grantOfflineAccess().then(e => console.log(e));
			else if (!user) {
				if (('corsProxy' in window) && ('gapi' in corsProxy))
					corsProxy.gapi().then(token => {
						token.time = Math.round(new Date().getTime()/1000);
						gapi.client.setToken({
							access_token: token.access_token
						});
						return gapi.client.request({
							path: 'https://people.googleapis.com/v1/people/me',
							params: {
								personFields: 'emailAddresses,names,photos'
							}
						}).then(e => this.users_add({
							id: e.result.emailAddresses[0].value,
							name: e.result.names[0].displayName,
							iconURL: e.result.photos[0].url,
							provider: 'https://accounts.google.com'
						}, token, res, rej), err => rej(err));
					});
				else
					gapi.auth2.getAuthInstance().signIn().then(user => {
						const profile = user.getBasicProfile();
						let user_ = {
							id: profile.getEmail(),
							name: profile.getName(),
							iconURL: profile.getImageUrl(),
							provider: 'https://accounts.google.com'
						};
						if (!!window.PasswordCredential)
							navigator.credentials.store(new FederatedCredential(user_));
						return this.users_add(user_, null, res, rej);
					}, err => rej(err));
			}else{
				let user_,
					users = this.users();
				if ((user_ = (users.length ? users.findIndex(v => (v.id == user.id)) : 0)) > -1) {
					this['#data'][user_].user = user;
					if (token)
						this['#data'][user_].token = token;
				}else
					user_ = this['#data'].push(globalStorage.merge(globalStorage.default(this['#opts'].default), {
						user: user,
						token: (token || {})
					})) - 1;
				console.log('USER', user, user_);
				return res(this.fetchFind());
			}
		}
		gapi() {
			return new Promise((res, rej) => {
				if ('gapi' in window)
					return gapi.load('client', () => res());
				let script = document.createElement('script');
				script.src = 'https://apis.google.com/js/api.js';
				script.addEventListener('load', () => gapi.load('client', () => res()));
				script.addEventListener('error', err => rej(err));
				document.body.appendChild(script);
			});
		}
		auth(id, res, rej) {
			if (res && rej) {
				// this['#timers'].auth = setTimeout(() => rej('Timeout'), 5000);
				return gapi.client.init({
					apiKey: this['#opts'].providers.google.key,
					clientId: this['#opts'].providers.google.id,
					scope: [
						'https://www.googleapis.com/auth/drive.appfolder',
						'https://www.googleapis.com/auth/user.emails.read',
						'https://www.googleapis.com/auth/userinfo.email',
						'https://www.googleapis.com/auth/userinfo.profile'
				   ].join(' ')
				}).then(() => {
					// clearTimeout(this['#timers'].auth);
					console.log('init', { id });
					if (id) {
						const auth2 = gapi.auth2.getAuthInstance();
						if (auth2.isSignedIn.get()) {
							const
								user = auth2.currentUser.get(),
								profile = user.getBasicProfile();
							let user_ = {
								id: profile.getEmail(),
								name: profile.getName(),
								iconURL: profile.getImageUrl(),
								provider: 'https://accounts.google.com'
							};
							if (user_.id === id)
								return this.users_add(user_, null, res, rej);
						}
						auth2.signIn({ login_hint: (id || '') }).then(user => {
							const profile = user.getBasicProfile();
							return this.users_add({
								id: profile.getEmail(),
								name: profile.getName(),
								iconURL: profile.getImageUrl(),
								provider: 'https://accounts.google.com'
							}, null, res, rej);
						}, err => rej(err));
					}else if (!this.users().length)
						this.users_add(null, null, res, rej);
					else{
						// console.log('gapi_cron', this.ttl());
						// this.gapi_cron(this.ttl() ? 0 : (5 * 60 * 1000)).then(() => this._status('auth', 'ready'));
						res();
					}
				}, err => {
					// clearTimeout(this['#timers'].auth);
					rej(err);
				});
			}else
				return new Promise((res, rej) => {
					if (this.users().length || (id !== null))
						this.gapi().then(() => this.auth(id, res, rej));
					else if (id === null)
						this.credentials('silent').then(id => (id ? this.auth(id).then(() => res()).catch(() => rej()) : res(null)));
					else
						res(null);
				}).then(e => ((e !== null) ? this.cron() : this.reload()));
				// }).catch(err => console.error(err)).then(() => this.reload());
		}
		cron() {
			let time = Math.round(new Date().getTime()/1000);
			if (this['#data'][0].token.access_token) {
				if ((this['#data'][0].token.time + this['#data'][0].token.expires_in) > (time + 30))
					gapi.client.setToken({
						access_token: this['#data'][0].token.access_token
					});
				else if (('corsProxy' in window) && ('gapi' in corsProxy))
					return corsProxy.gapi().then(token => {
						token.time = Math.round(new Date().getTime()/1000);
						gapi.client.setToken({
							access_token: token.access_token
						});
						return this.cron(this['#data'][0].token = token);
					});
			}
			// return this.reload();
			return new Promise((res, rej) => {
				this['#broadcast'].postMessage({ cron: true });
				if (this['#timers'].cron)
					clearTimeout(this['#timers'].cron);
				let delay = (((time - this['#data'][0].time) > (5 * 60)) ? 0 : (5 * 60 * 1000));
				if (delay) {
					console.log('skip wait cron', delay);
					res(this.reload());
				}
				this['#timers'].cron = setTimeout(() => {
					console.log('Starting periodic sources sync: '+delay);
					let hash = this.hash(this['#data'][0].config);
					this.fetchConfigLoad().then(() => {
						let body = this.reload();
						if (delay && (hash != this.hash(this['#data'][0].config)))
							window.dispatchEvent(this.globalStorageEvent({
								url: location.href,
								type: 'storage'
							}));
						return this.cron(res(body));
					}).catch(e => {
						this['#data'][0] = globalStorage.default(this['#data'][0].config);
						this.save();
						rej(e);
					});
				}, delay);
			});
		}
		credentials(mode) {
			let is = (!window.PasswordCredential || !window.PublicKeyCredential || navigator.webdriver || !window.chrome || (navigator.userAgent.indexOf('/bots') > -1));
			return (is ? Promise.resolve(null) : navigator.credentials.get({
				federated: { providers: [ 'https://accounts.google.com' ] },
				mediation: mode
			}).then(cred => {
				if (!cred)
					return null;
				switch (cred.type) {
					case 'federated': {
						switch (cred.provider) {
							case 'https://accounts.google.com': {
								return cred.id;
							}
						}
					}
				}
			}));
		}
		fetchFind(restore) {
			let key = 'syncStorage'+(this['#opts'].prefix ? '_'+this['#opts'].prefix : '');
			return new Promise((res, rej) => {
				if (this['#data'][0].id)
					return res();
				console.log('Finded remote file');
				gapi.client.request({
					path: '/drive/v3/files',
					params: {
						spaces: 'appDataFolder',
						fields: 'files(id, name)',
						pageSize: 500,
						q: `name = '${key}_config.json'`,
						orderBy: 'createdTime'
					}
				}).then(body => {
					if (body.result.files.length) {
						console.log('find file', body.result.files);
						res(this.fetchConfigLoad(restore, (this['#data'][0].id = body.result.files[0].id)));
					}else
						gapi.client.request({
							path: '/drive/v3/files/',
							method: 'POST',
							body: {
								name: `${key}_config.json`,
								mimeType: 'application/json',
								parents: [ 'appDataFolder' ]
							}
						}).then(body => {
							console.log('create file', body.result);
							res(this['#data'][0].id = body.result.id);
						}, err => rej(err));
				}, err => rej(err));
			});
		}
		fetchConfigLoad(restore, merge) {
			return new Promise((res, rej) => {
				if (!this['#data'][0].id)
					return res();
				console.log('fetchConfigLoad');
				gapi.client.request({
					path: '/drive/v3/files/'+this['#data'][0].id,
					params: { alt: 'media' }
				}).then(body => {
					if (body.result) {
						console.log(
							'BODY',
							this['#data'][0].config,
							body.result
						);
						this['#data'][0].config = (merge ? globalStorage.merge(this['#data'][0].config, body.result) : Object.assign(this['#data'][0].config, body.result));
						// let data = globalStorage.merge(...(this['#data']).map(d => d.config));
					}else
						console.log('BODY', body);
					this['#timers'].hash = this.hash(this['#data'][0].config);
					this.save();
					return res();
				}, err => {
					console.log('error fetchConfigLoad');
					if (restore)
						rej(e);
					else
						res(this.fetchFind(true, this['#data'][0].id = null));
				});
			});
		}
		fetchList(id) {
			return (
				(this['#cache'][this['#opts'].spreadsheet+'/'+id] && ((Math.round(new Date().getTime()/1000) - this['#cache'][this['#opts'].spreadsheet+'/'+id].time) < (60 * 60)))
				? Promise.resolve(this['#cache'][this['#opts'].spreadsheet+'/'+id].body)
				: fetch((this['#opts'].proxy || '')+'https://spreadsheets.google.com/feeds/cells/'+this['#opts'].spreadsheet+'/'+(id || 'od6')+'/public/values?alt=json').then(res => {
					return res.json().then(res => (this['#cache'][this['#opts'].spreadsheet+'/'+id] = (res.feed.entry ? res.feed.entry.reduce((arr, cur) => {
						while (arr.length < cur.gs$cell.row) {
							arr.push([]);
						}
						let cur_ = arr[arr.length - 1];
						while ((cur_.length + 1) < cur.gs$cell.col) {
							cur_.push('');
						}
						cur_.push(cur.content.$t);
						return arr;
					}, []) : [])));
				})
			).then(res => {
				return Object.defineProperties({}, {
					cells: {
						value: res,
						enumerable: true
					},
					json: {
						enumerable: true,
						get() {
							return res.slice(1).reduce((arr, cur) => {
								arr.push(cur.reduce((obj, cur_, i) => {
									obj[res[0][i]] = cur_;
									return obj;
								}, {}));
								return arr;
							}, []);
						}
					}
				});
			});
		}
		hash(json) {
			return ((typeof(json) == 'string') ? json : JSON.stringify(json)).split('').reduce((a, b) => {
				a = ((a<<5)-a) + b.charCodeAt(0);
				return a & a;
			}, 0);
		}
		getItem(key) {
			let self = (('path' in this) ? this.path[0] : this);
			if (self['#opts'] && self['#opts'].spreadsheet)
				return this[key];
			else if (self['#opts'] && self['#opts'].providers && (typeof(this[key]) == 'object')) {
				let path = (this.path || [ this ]);
				path.push(this[key]),
				Object.defineProperties(this[key], {
					id: {
						value: key,
						enumerable: false
					},
					path: {
						value: path,
						enumerable: false,
						writable: true,
						configurable: true
					}
				});
				Object.getOwnPropertyNames(self.__proto__).forEach(k => Object.defineProperty(this[key], k, {
					value: self.__proto__[k],
					enumerable: false
				}));
				return this[key];
			}
			if (this.hasOwnProperty(key))
				return String(this[key]);
			return null;
		}
		setItem(key, val) {
			let self = (('path' in this) ? this.path[0] : this);
			if (self['#opts']) {
				if (self['#opts'].cookie) {
					let expires = new Date();
					expires.setTime(expires.getTime()+(1*24*60*60*1000));
					document.cookie = key+'='+val+';path=/'+';expires='+expires.toUTCString();
				}else if (self['#opts'].providers) {
					let oldValue = this[key];
					this[key] = val;
					for (let i in self['#data']) {
						let d = self['#data'][i].config;
						if ('path' in this)
							this.path.slice(1).forEach(v => (d = d[v.id]));
						d[key] = val;
					}
					if ('path' in this)
						self.save(key, oldValue, val, this.path);
					return undefined;
				}
			}
			this[key] = ((val === undefined) ? null : String(val));
		}
		removeItem(key) {
			let self = (('path' in this) ? this.path[0] : this);
			if (self['#opts']) {
				if (self['#opts'].cookie)
					document.cookie = key+'=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				else if (self['#opts'].providers) {
					let oldValue = this[key];
					this[key] = undefined;
					delete this[key];
					for (let i in self['#data']) {
						let d = self['#data'][i].config;
						if ('path' in this)
							this.path.slice(1).forEach(v => (d = d[v.id]));
						d[key] = undefined;
						delete d[key];
					}
					if ('path' in this)
						self.save(key, oldValue, undefined, this.path);
					return undefined;
				}
			}
			this[key] = undefined;
			delete this[key];
		}
		clear() {
			Object.keys(this).forEach(key => (delete this[key]));
			this.save();
		}
		key(i) {
			if (i == undefined)
				throw new TypeError("Failed to execute 'key' on 'Storage': 1 argument required, but only 0 present.");
			return Object.keys(this)[i];
		}
		save(key, oldValue, newValue, path) {
			if (key && (oldValue === newValue))
				return;
			if (!this['#opts'].providers && ('BroadcastChannel' in window))
				this['#broadcast'].postMessage({
					key, oldValue, newValue,
					path: (path ? path.slice(1).map(p => p.id) : []),
					url: location.href,
					type: 'storage'
					// type: 'storage:remote'
				});
			console.log('SAVE', this);
			let self = (('path' in this) ? this.path[0] : this);
			if (self['#opts'] && self['#opts'].providers) {
				for (let i in self['#data']) {
					self['#data'][i].time = Math.round(new Date().getTime()/1000);
				}
				if (self['#timers'].save)
					clearTimeout(self['#timers'].save);
				self['#timers'].save = setTimeout(() => {
					localStorage.setItem('syncStorageCache'+(self['#opts'].prefix ? '_'+self['#opts'].prefix : ''), JSON.stringify(self['#data']));
					if (this['#opts'].providers && ('BroadcastChannel' in window))
						this['#broadcast'].postMessage({
							key, oldValue, newValue,
							path: (path ? path.slice(1).map(p => p.id) : []),
							url: location.href,
							type: 'storage'
							// type: 'storage:remote'
						});
					if (self['#timers'].sync)
						clearTimeout(self['#timers'].sync);
					let hash = self.hash(self['#data'][0].config);
					if (self['#timers'].hash == hash)
						console.log('hash == hash');
					if (('gapi' in window) && (gapi.auth2.getAuthInstance().isSignedIn.get() || self['#data'][0].token.access_token) && (self['#timers'].hash != hash)) {
						self['#timers'].hash = hash;
						self['#timers'].sync = setTimeout(() => {
							self['#data'].forEach(d => {
								console.log('sync', d.config);
								gapi.client.request({
									path: '/upload/drive/v3/files/'+d.id,
									method: 'PATCH',
									params: { uploadType: 'media' },
									body: ((typeof(d.config) == 'string') ? d.config : JSON.stringify(d.config))
								}).then(() => {}, err => console.log('error sync', err));
							});
							delete self['#timers'].sync;
						}, 2250);
					}
					delete self['#timers'].save;
				}, 250);
			}
		}
		static default(config) {
			return {
				id: null,
				time: null,
				user: null,
				token: {},
				config: (config || { welcome: false })
			}
		}
		static merge() {
			let src, p,
				dst = {},
				args = [].splice.call(arguments, 0);
			while (args.length > 0) {
				if (toString.call((src = args.splice(0, 1)[0])) == '[object Object]')
					for (p in src) {
						if (!src.hasOwnProperty(p))
							continue;
						else if (toString.call(src[p]) == '[object Object]')
							dst[p] = this.merge((dst[p] || {}), src[p]);
						else if (dst[p] && (toString.call(src[p]) == '[object Array]')) {
							if (Object.keys(src[p]).length > 0)
								dst[p] = src[p].concat(dst[p]);
						}else
							dst[p] = src[p];
					}
			}
			return dst;
		}
		static init() {
			window.globalStorage = this;
			if (!('sessionStorage' in window))
				window.sessionStorage = new this();
			if (!('localStorage' in window))
				window.localStorage = new this(); // new globalStorage({ file: './db.json' });
			window.cookieStorage = new this({ cookie: true });
		}
	}).init();
}());
