const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

/* GET articles list. */
router.get('/', function(request, res, next) {
	res.render('articles/index', {
		title: 'GW2Trivia',
		subtitle: 'Articles',
		description: 'Des articles sur le lore de l\'univers de Guild Wars, rédigés par des passionnés.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, articles, lore',
	});
});

/* GET articles creation. */
router.get('/create', function(request, res, next) {
	res.render('articles/create', {
		title: 'GW2Trivia',
		subtitle: 'Nouvel article',
		description: 'Des articles sur le lore de l\'univers de Guild Wars, rédigés par des passionnés.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, articles, lore',
	});
});

/* GET article view. */
router.get('/view/:slug', async function(request, res, next) {
	const { slug } = request.params;
	if (!slug) {
		res.redirect('/');
	}
	const [ id, ...s ] = slug.split('-');
	res.redirect(301, `/articles/view/${id}/${s.join('-')}`);
});

/* GET article view. */
router.get('/view/:id/:slug', async function(request, res, next) {
	const { id, slug } = request.params;
	if (!id) {
		res.redirect('/');
	}
	const headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};
	if (request.headers['authorization']) {
		headers['Authorization'] = request.headers['authorization']
	}
	console.log(headers);
	fetch('https://gw2trivia.com/api/graphql', {
		method: 'post',
		headers,
		body: JSON.stringify({
			query: `{ articleById(id: ${id}) { title description createdAt userByUserId { username discriminator } imageByImageId { id } } }`
		})
	}).then(response => response.json())
		.then(response => {
			const values = {
				title: 'GW2Trivia',
				subtitle: 'Articles',
				description: response.data.articleById.description,
				keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon',
				page_title: response.data.articleById.title,
				id,
				type: 'article',
				section: 'Articles',
				author: `${response.data.articleById.userByUserId.username}#${response.data.articleById.userByUserId.discriminator}`,
				published_time: response.data.articleById.createdAt,
			};
			if (response.data.articleById.imageByImageId) {
				values['image'] = `https://gw2trivia.com/assets/img/${response.data.articleById.imageByImageId.id}`;
			}
			res.render('articles/view', values);
		})
		.catch(err => console.error(err));
});

/* GET article edit. */
router.get('/edit/:id/:slug', async function(request, res, next) {
	const { id, slug } = request.params;
	if (!id) {
		res.redirect('/');
	}
	const headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};
	if (request.headers['authorization']) {
		headers['Authorization'] = request.headers['authorization']
	}
	fetch('https://gw2trivia.com/api/graphql', {
		method: 'post',
		headers,
		body: JSON.stringify({
			query: `{ articleById(id: ${id}) { title description } }`
		})
	}).then(response => response.json())
		.then(response => res.render('articles/edit', {
			title: 'GW2Trivia',
			subtitle: 'Articles',
			description: response.data.articleById.description,
			keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon',
			page_title: response.data.articleById.title,
			id
		}))
		.catch(err => console.error(err));
});

module.exports = router;
