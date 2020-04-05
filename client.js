window.addEventListener('storage', e => console.log('storage', e));
// window.addEventListener('storage:remote', e => console.log('storage:remote', e));

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
	window.syncStorage = await new globalStorage({
		default: {
			favorite: {}
		},
		providers: {
			google: {
				key: 'AIzaSyDt7ZsW_aS0eal8h-ymtg1j0jt_c7kyh9I',
				id: '1012347140595-1rofcp855gd4qbfdv73a84t9jvk8jtkg.apps.googleusercontent.com'
			}
		},
		prefix: 'example'
	});
	var userIcon = e => {
		let users = e.users(),
			btn = document.querySelector('#sync');
		if (users.length) {
			btn.classList.remove('material-icons');
			btn.style.setProperty('--iconURL', 'url('+users[0].iconURL.replace('s96-', 's64-')+')');
		}else
			btn.classList.add('material-icons');
	}
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
		document.title = (document.querySelector('h1').textContent = 'Error')+' '+(item.querySelector('h3').textContent = code);
		/*
		if (!getUrl().match('error_'+code))
			history.pushState(null, window.title, prefix+'error_'+code);
			*/
		article.innerHTML = '';
		article.append(item);
	}
	var showStoriesForCategory = category => {
		scrollTo(0, 0);
		var active = document.querySelector('.spa-link-cat.active');
		if (active)
			active.classList.remove('active');
		if (category.startsWith('error'))
			showError(category);
		else{
			var html = document.querySelector('html');
			html.classList.add('spinner');
			document.querySelector('meta[name="description"]').setAttribute('content', (snippets[category] || ''));
			document.querySelector('link[type="application/rss+xml"]').setAttribute('href', 'https://alex2844.github.io/pages_feeds/feeds/feed_globalStorage_'+category+'.xml');
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
								imgEl = item.querySelector('img'),
								favEl = item.querySelector('.favorite');
							item.querySelector('.card').id = story.id;
							item.querySelector('h3').textContent = story.time+' (by '+story.author+')';
							imgEl.alt = item.querySelector('h2').textContent = story.title;
							imgEl.src = (story.imgUrl || (story.imgId ? 'https://drive.google.com/uc?export=download&id='+story.imgId : story.imgSrc));
							imgEl.onerror = () => {
								imgEl.src = (story.imgId ? 'https://drive.google.com/uc?export=download&id='+story.imgId : story.imgSrc);
								imgEl.onerror = null;
							}
							item.querySelector('p').textContent = story.summary;
							item.querySelector('a button').textContent = story.category;
							item.querySelector('a').href = './'+prefix+category;
							if (syncStorage.favorite[story.id])
								favEl.textContent = 'favorite';
							favEl.onclick = () => {
								if (favEl.textContent == 'favorite') {
									syncStorage.getItem('favorite').removeItem(story.id);
									favEl.textContent = 'favorite_border';
								}else{
									syncStorage.getItem('favorite').setItem(story.id, 1);
									favEl.textContent = 'favorite';
								}
							}
							return item;
						}).forEach(card => article.appendChild(card));
				}else{
					document.querySelector('.spa-link-cat#spa_'+category).classList.add('active');
					document.title = 'News about '+(document.querySelector('h1').textContent = stories[0].category);
					return stories.map(story => {
						var item = document.importNode(document.querySelector('template#story-item').content, true),
							imgEl = item.querySelector('img'),
							favEl = item.querySelector('.favorite');
						item.querySelector('.card').id = story.id;
						item.querySelector('h3').textContent = 'by '+story.author;
						imgEl.alt = item.querySelector('h2').textContent = story.title;
						if (story.imgUrl) {
							imgEl.onerror = () => {
								imgEl.src = (story.imgId ? 'https://drive.google.com/uc?export=download&id='+story.imgId : story.imgSrc);
								imgEl.srcset = '';
								imgEl.onerror = null;
							}
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
							imgEl.src = (story.imgId ? 'https://drive.google.com/uc?export=download&id='+story.imgId : story.imgSrc);
						item.querySelector('p').textContent = story.summary;
						if (syncStorage.favorite[story.id])
							favEl.textContent = 'favorite';
						favEl.onclick = () => {
							if (favEl.textContent == 'favorite') {
								syncStorage.getItem('favorite').removeItem(story.id);
								favEl.textContent = 'favorite_border';
							}else{
								syncStorage.getItem('favorite').setItem(story.id, 1);
								favEl.textContent = 'favorite';
							}
						}
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
	window.addEventListener('storage', e => {
		if (e.id == syncStorage['#broadcast'].name)
			[].slice.call(document.querySelectorAll('article .card')).forEach(item => {
				item.querySelector('.favorite').textContent = (syncStorage.favorite[item.id] ? 'favorite' : 'favorite_border');
			});
	});
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
	console.log(
		'sheetStorage', sheetStorage
	);
	console.log(
		'syncStorage', syncStorage
	);
	console.log(
		'getItem_2', JSON.stringify(syncStorage['#data'], null, '\t')
	);
	userIcon(syncStorage);
	document.querySelector('#sync').addEventListener('click', async () => {
		if (syncStorage.users().length)
			alert('Вы уже вошли как '+syncStorage['#data'][0].user.name+' ('+syncStorage['#data'][0].user.id+')');
		else{
			syncStorage.auth().then(e => {
				console.log('Done', e);
				userIcon(e);
			}).catch(err => {
				switch (err.error) {
					case 'popup_blocked_by_browser': {
						return alert('Ваш браузер заблокировал всплывающее окно, попробуйте ещё раз');
					}
					default: {
						return console.error(err);
					}
				}
			});
		}
	});
	var category = getUrl().split('-')[0];
	if (category == '')
		category = 'keyword';
	showStoriesForCategory(category);
})();
