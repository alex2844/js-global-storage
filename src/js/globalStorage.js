(function () {
	'use strict';
	(class globalStorage {
		globalStorageEvent(opts) {
			return Object.defineProperties(new CustomEvent(opts.type), {
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
				this['#broadcast'].addEventListener('message', e => window.dispatchEvent(this.globalStorageEvent(e.data)));
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
						? new Promise((res, rej) => res(this['#opts'].lists))
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
								console.log(v);
								return this.fetchList(v.id);
							}
						}));
						const self = this;
						return new Proxy(this, {
							get (target, k) {
								return (((['then', 'getItem'].indexOf(k) == -1) && !target.hasOwnProperty(k)) ? new Promise((res, rej) => rej()) : target[k]);
							}
						});
					});
				else if (this['#opts'].cookie)
					document.cookie.split('; ').filter(v => v).forEach(v => (this[v.split('=')[0]] = v.split('=').slice(1).join('=')));
			}
			return new Proxy(this, {
				set: (obj, key, val) => {
					console.log('SET', { obj, key, val });
					this.save(key, obj[key], (obj[key] = val));
					return true;
				}
			});
		}
		fetchList(id) {
			return (
				(this['#cache'][this['#opts'].spreadsheet+'/'+id] && ((Math.round(new Date().getTime()/1000) - this['#cache'][this['#opts'].spreadsheet+'/'+id].time) < (60 * 60)))
				? new Promise((res, rej) => res(this['#cache'][this['#opts'].spreadsheet+'/'+id].body))
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
			return JSON.stringify(json).split('').reduce((a, b) => {
				a = ((a<<5)-a) + b.charCodeAt(0);
				return a & a;
			}, 0);
		}
		getItem(key) {
			if (this['#opts'] && this['#opts'].spreadsheet)
				return this[key];
			if (this.hasOwnProperty(key))
				return String(this[key]);
			return null;
		}
		setItem(key, val) {
			if (this['#opts']) {
				if (this['#opts'].cookie) {
					var expires = new Date();
					expires.setTime(expires.getTime()+(1*24*60*60*1000));
					document.cookie = key+'='+val+';path=/'+';expires='+expires.toUTCString();
				}
			}
			this[key] = ((val === undefined) ? null : String(val));
		}
		removeItem(key) {
			if (this['#opts']) {
				if (this['#opts'].cookie)
					document.cookie = key+'=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
		save(key, oldValue, newValue) {
			alert('SAVE');
			if (oldValue === newValue)
				return;
			if ('BroadcastChannel' in window)
				this['#broadcast'].postMessage({
					key, oldValue, newValue,
					url: location.href,
					type: 'storage:remote'
				});
			console.log('SAVE', this);
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
