const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { gql } = require('graphql-request');

/* GET articles list. */
router.get('/', async function(request, res, next) {
	const query = gql`
	{
		allArticles {
			nodes { 
				id, slug, title, description, createdAt, updatedAt, validatedAt,
				imageByImageId { id },
				categories { nodes { id name slug } },
				userByUserId { id, username, avatarUrl, discriminator } 
			}
			pageInfo { hasPreviousPage, hasNextPage }
			totalCount
		}
	}
	`;

	const { data } = await res.graphQLClient.rawRequest(query);
	res.render('articles/index', {
		title: 'GW2Trivia',
		subtitle: 'Articles',
		description: 'Des articles sur le lore de l\'univers de Guild Wars, rédigés par des passionnés.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, articles, lore',
		data,
		res,
	});
});

/* GET articles creation. */
router.get('/create', function(request, res, next) {
	res.render('articles/create', {
		title: 'GW2Trivia',
		subtitle: 'Nouvel article',
		description: 'Des articles sur le lore de l\'univers de Guild Wars, rédigés par des passionnés.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, articles, lore',
		res,
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
	
	const query = gql`
	{
		articleById(id: ${id}) {
			id, slug, title, description, createdAt, updatedAt, validatedAt, html,
			pagesByArticleId { nodes { id html } },
			imageByImageId { id },
			categories { nodes { id name slug } },
			userByUserId { id, username, avatarUrl, discriminator }
		}
	}
	`;

	const { data } = await res.graphQLClient.rawRequest(query);
	const values = {
		title: 'GW2Trivia',
		subtitle: 'Articles',
		description: data.articleById.description,
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon',
		page_title: data.articleById.title,
		id,
		type: 'article',
		section: 'Articles',
		author: `${data.articleById.userByUserId.username}#${data.articleById.userByUserId.discriminator}`,
		published_time: data.articleById.createdAt,
		data,
		article: data.articleById,
		res,
	};
	if (data.articleById.imageByImageId) {
		values['image'] = `https://gw2trivia.com/assets/img/${data.articleById.imageByImageId.id}`;
	}
	res.render('articles/view', values);
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
			id,
			res
		}))
		.catch(err => console.error(err));
});

module.exports = router;
