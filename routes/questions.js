const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

/* GET questions list. */
router.get('/', function(request, res, next) {
	res.render('questions/index', {
		title: 'GW2Trivia',
		subtitle: 'Questions',
		description: 'Plus de 1000 questions sur l\'univers de Guild Wars apportées par la communauté, dans Questions pour un Quaggan.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, questions',
		validated: '1',
		res,
	});
});

/* GET suggested questions list. */
router.get('/suggestions', function(request, res, next) {
	res.render('questions/index', {
		title: 'GW2Trivia',
		subtitle: 'Suggestions',
		description: 'Liste des questions en attente de validation. Venez proposer les votres !',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, suggestions',
		validated: '0',
		res,
	});
});

/* GET question view. */
router.get('/view/:slug', async function(request, res, next) {
	const { slug } = request.params;
	if (!slug) {
		res.redirect('/');
	}
	const [ id, ...s ] = slug.split('-');
	res.redirect(301, `/questions/view/${id}/${s.join('-')}`);
});

/* GET question view. */
router.get('/view/:id/:slug', async function(request, res, next) {
	const { id, slug } = request.params;
	if (!id) {
		res.redirect('/');
	}
	const user = await fetch('https://gw2trivia.com/api/graphql', {
		method: 'post',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `{ questionById(id: ${id}) { title createdAt userByUserId { username discriminator } } }`
		})
	}).then(response => response.json())
		.then(response => res.render('questions/view', {
			title: 'GW2Trivia',
			subtitle: 'Questions',
			description: response.data.questionById.title,
			keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon',
			page_title: response.data.questionById.title,
			id,
			type: 'article',
			section: 'Questions',
			author: `${response.data.questionById.userByUserId.username}`,
			published_time: response.data.questionById.createdAt,
			res,
		}))
		.catch(err => {
			console.error(err);
			next();
		});
});

module.exports = router;
