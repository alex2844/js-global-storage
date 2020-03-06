window.addEventListener('storage', e => console.log('storage', e));
window.addEventListener('storage:remote', e => console.log('storage:remote', e));
/*
(async () => {
	window.sheetStorage = await new globalStorage({
		spreadsheet: '1gONg1oQAdScmV0ueqIzJiwybSCBjVN3CFvDFfMLS67k',
		lists: [{
			id: 'osikvag',
			title: 'chrome'
		}]
	});
	console.log(
		'sheetStorage', sheetStorage
	);
	console.log(
		(await sheetStorage.chrome).json
	);
})();
*/
var showMenu = () => {
	document.querySelector('aside').dataset.open = true;
}
(async () => {
	window.sheetStorage = await new globalStorage({
		url: 'https://docs.google.com/spreadsheets/d/1gONg1oQAdScmV0ueqIzJiwybSCBjVN3CFvDFfMLS67k/edit#gid=1684217105',
	});
	console.log(
		'sheetStorage', sheetStorage
	);
	var prefix = ((location.host == 'localhost') ? '#' : ((location.host == 'alex2844.github.io') ? '?' : '/')); // hash=#, href=?, pathname=/
	var snippets = {
		keyword: 'News and stories around Google products',
		chrome: 'Articles and insights about new features in Chrome.',
		search: 'Updates and interesting stories around Google Search'
	};
	var getUrl = () => trimSlashes(location[(prefix == '/') ? 'pathname' : ((prefix == '?') ? 'href' : 'hash')]);
	var trimSlashes = pathName => pathName.replace('/', '').replace('?', '').replace('/', '').replace('#', '');
	var showError = code => {
		var article = document.querySelector('article'),
			code = code.toString().replace(/^error_/, ''),
			item = document.importNode(document.querySelector('template#error').content, true);
		item.querySelector('h3').textContent = code;
		if (!getUrl().match('error_'+code))
			history.pushState(null, window.title, prefix+'error_'+code);
		article.innerHTML = '';
		article.append(item);
	}
	var showStoriesForCategory = category => {
		if (category.startsWith('error'))
			showError(category);
		else{
			document.querySelector('meta[name="description"]').setAttribute('content', (snippets[category] || ''));
			sheetStorage.getItem(category).then(res => res.json).then(stories => {
				var article = document.querySelector('article');
				article.innerHTML = '';
				document.title = 'News about '+(document.querySelector('h1').textContent = stories[0].category);
				return stories.map(story => {
					var item = document.importNode(document.querySelector('template#story-item').content, true);
					item.querySelector('.card').id = story.id;
					item.querySelector('h3').textContent = 'by '+story.author;
					item.querySelector('img').alt = item.querySelector('h2').textContent = story.title;
					item.querySelector('img').src = 'https://drive.google.com/uc?export=download&id='+story.imgId;
					item.querySelector('p').textContent = story.summary;
					return item;
				}).forEach(card => article.appendChild(card));
			}).catch(e => {
				console.error(e);
				showError(404);
			});
		}
	}
	window.addEventListener('click', evt => {
		if ((evt.target.tagName != 'BUTTON') && document.querySelector('aside').dataset.open)
			delete document.querySelector('aside').dataset.open;
		if (!evt.target.classList.contains('spa-link'))
			return;
		evt.preventDefault();
		var category = trimSlashes(evt.target.getAttribute('href'));
		if (category == '')
			category = 'keyword';
		showStoriesForCategory(category);
		var href = evt.target.getAttribute('href');
		if (prefix == '#')
			href = href.replace('?', '#').replace('/', '');
		history.pushState({ category }, window.title, (href || prefix));
	});
	window.addEventListener('popstate', evt => {
		var category = evt.state ? evt.state.category : getUrl();
		if (category == '')
			category = 'keyword';
		showStoriesForCategory(category);
	});
	var category = getUrl();
	if (category == '')
		category = 'keyword';
	showStoriesForCategory(category);
})();
