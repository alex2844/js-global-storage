window.addEventListener('storage', e => console.log('storage', e));
window.addEventListener('storage:remote', e => console.log('storage:remote', e));

var showMenu = () => {
	document.querySelector('aside').dataset.open = true;
}
(async () => {
	window.sheetStorage = await new globalStorage({
		spreadsheet: '1gONg1oQAdScmV0ueqIzJiwybSCBjVN3CFvDFfMLS67k',
        lists: [
			{ id: 'od6', title: 'keyword' },
			{ id: 'osikvag', title: 'chrome' },
			{ id: 'oruqm6j', title: 'search' }
		]
	});
	console.log(
		'sheetStorage', sheetStorage
	);
	var prefix = ((location.host == 'localhost') ? '#' : '?'); // hash=#, search=?, pathname=/
	var snippets = {
		keyword: 'News and stories around Google products',
		chrome: 'Articles and insights about new features in Chrome.',
		search: 'Updates and interesting stories around Google Search'
	};
	var getUrl = () => trimSlashes(decodeURIComponent(location[(prefix == '/') ? 'pathname' : ((prefix == '?') ? 'search' : 'hash')]));
	var trimSlashes = pathName => [
		/\?(.*?)\?/, '/', '?', '/', '#', /^\./, /\&(.*?)$/, /\+$/
	].reduce((res, cur) => res.replace(cur, ''), pathName); // pathName.replace(/\?(.*?)\?/, '').replace('/', '').replace('?', '').replace('/', '').replace('#', '').replace(/^\./, '').replace(/\&(.*?)$/, '').replace(/\+$/, '');
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
		var active = document.querySelector('.spa-link-cat.active');
		if (active)
			active.classList.remove('active');
		if (category.startsWith('error'))
			showError(category);
		else{
			var html = document.querySelector('html');
			html.classList.add('spinner');
			document.querySelector('meta[name="description"]').setAttribute('content', (snippets[category] || ''));
			sheetStorage.getItem(category).then(res => res.json).then(stories => {
				var storyId = getUrl().replace(category, '').replace(/^-/, ''),
					article = document.querySelector('article');
				article.innerHTML = '';
				if (storyId) {
					var stories = stories.filter(story => (story.id == storyId));
					if (!stories.length)
						showError(category);
					else
						return stories.map(story => {
							document.title = (document.querySelector('h1').textContent = story.title)+' by '+story.author;
							var item = document.importNode(document.querySelector('template#story-item-one').content, true),
								imgEl = item.querySelector('img');
							item.querySelector('.card').id = story.id;
							item.querySelector('h3').textContent = story.time+' (by '+story.author+')';
							imgEl.alt = item.querySelector('h2').textContent = story.title;
							imgEl.src = (story.imgUrl || 'https://drive.google.com/uc?export=download&id='+story.imgId);
							item.querySelector('p').textContent = story.summary;
							item.querySelector('a button').textContent = story.category;
							item.querySelector('a').href = './'+prefix+category;
							return item;
						}).forEach(card => article.appendChild(card));
				}else{
					document.querySelector('.spa-link-cat#spa_'+category).classList.add('active');
					document.title = 'News about '+(document.querySelector('h1').textContent = stories[0].category);
					return stories.map(story => {
						var item = document.importNode(document.querySelector('template#story-item').content, true),
							imgEl = item.querySelector('img');
						item.querySelector('.card').id = story.id;
						item.querySelector('h3').textContent = 'by '+story.author;
						imgEl.alt = item.querySelector('h2').textContent = story.title;
						if (story.imgUrl) {
							imgEl.src = story.imgUrl;
							imgEl.srcset = [
								story.imgUrl+'=w100 100w',
								story.imgUrl+'=w200 200w',
								story.imgUrl+'=w300 300w',
								story.imgUrl+'=w400 400w'
							].join(', ');
							imgEl.sizes = [
								'(max-width: 479px) 100vw',
								'(max-width: 839px) 50vw',
								'(max-width: 1024px) 33vw',
								'25vw'
							].join(', ');
						}else
							imgEl.src = 'https://drive.google.com/uc?export=download&id='+story.imgId;
						item.querySelector('p').textContent = story.summary;
						[].slice.call(item.querySelectorAll('a')).forEach(a => (a.href = './'+prefix+category+'-'+story.id));
						return item;
					}).forEach(card => article.appendChild(card));
				}
			}).catch(e => {
				console.error(e);
				showError(404);
			}).then(() => html.classList.remove('spinner'));
		}
	}
	window.addEventListener('click', evt => {
		if ((evt.target.tagName != 'BUTTON') && document.querySelector('aside').dataset.open)
			delete document.querySelector('aside').dataset.open;
		if (evt.target.classList.contains('spa-link-cat')) {
			evt.preventDefault();
			var category = trimSlashes(evt.target.getAttribute('href'));
			if (category == '')
				category = 'keyword';
			showStoriesForCategory(category);
			var href = evt.target.getAttribute('href');
			if (prefix == '#')
				href = href.replace('?', '#').replace('./', '').replace('/', '');
			history.pushState({ category }, window.title, (href || prefix));
		}else if (evt.target.classList.contains('spa-link-item')) {
			evt.preventDefault();
			var href = evt.target.closest('a').getAttribute('href'),
				category = trimSlashes(href).split('-')[0];
			if (prefix == '#')
				href = href.replace('?', '#').replace('./', '').replace('/', '');
			history.pushState({ category }, window.title, (href || prefix));
			showStoriesForCategory(category);
		}
	});
	window.addEventListener('popstate', evt => {
		var category = evt.state ? evt.state.category : getUrl().split('-')[0];
		if (category == '')
			category = 'keyword';
		showStoriesForCategory(category);
	});
	var category = getUrl().split('-')[0];
	if (category == '')
		category = 'keyword';
	showStoriesForCategory(category);
})();
