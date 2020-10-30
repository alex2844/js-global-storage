let onOpen = () => {
	SpreadsheetApp.getActiveSpreadsheet().addMenu('Admin', [
		{ name: 'Clear table', functionName: 'clear' },
		{ name: 'Run parser', functionName: 'parser' }
	]);
}
let clear = () => {
	SpreadsheetApp.getActive().getSheets().forEach(list => {
		var range = list.getRange('A1:E30');
		range.clear();
		range.setBackground('none');
	});
}
let parser = () => {
	SpreadsheetApp.getActive().getSheets().forEach(list => {
		list.getRange('A1:E30').clear();
		fetch('https://blog.google/products/'+list.getName()+'/rss').then(res => res.text()).then(text => XML.parse(text)).then(body => {
			var data = body.rss.channel.item.map(item => ({
				id: item.link['#text'].split('/')[5],
				title: item.og.title['#text'],
				description: (item.og.description['#text'] || '').replace(/(<([^>]+)>)/ig, ''),
				text: (item.description['#text'] || '')
					.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1').replace(/<(html|head|body|div)\b[^>]*>/gi, '').replace(/<\/(html|head|body|div)>/gi, ''),
				image: (item.og.image ? item.og.image['#text'] : null)
			}));
			var keys = Object.keys(data[0]),
				rows = [ keys ].concat(data.map(v => Object.values(v)));
			list.getRange(1, 1, 1, keys.length).setBackground('silver');
			list.getRange(1, 1, rows.length, keys.length).setValues(rows);
		}).catch(err => console.log('err', err));
	});
}
