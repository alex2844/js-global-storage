if (typeof(require) == 'function') {
	global.fetch = require('js-global-fetch').fetch;
	global.XML = require('js-global-xml');
}
