const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { gql } = require('graphql-request');

/* GET novels list. */
router.get('/', async function(request, res, next) {
	const query = gql`
	{
		allNovels {
			nodes { 
				id, slug, title, summary, shortSummary, createdAt, updatedAt,
				cover, backCover, path, collection, volume,
				userByUserId { id, username, avatarUrl, discriminator } 
			}
			pageInfo { hasPreviousPage, hasNextPage }
			totalCount
		}
	}
	`;

	const { data } = await res.graphQLClient.rawRequest(query);
	res.render('novels/index', {
		title: 'GW2Trivia',
		subtitle: 'Romans',
		description: 'Des romans et des nouvelles dans l\'univers de Guild Wars, rédigés par des passionnés.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon, articles, lore',
		data,
		res,
	});
});

/* GET novel view. */
router.get('/view/:id/:slug', async function(request, res, next) {
	const { id, slug } = request.params;
	if (!id) {
		res.redirect('/');
	}
	
	const query = gql`
	{
		novelById(id: ${id}) {
			id, slug, title, summary, shortSummary, createdAt, updatedAt,
			cover, backCover, path, pdf, epub, collection, volume, youtube,
			userByUserId { id, username, avatarUrl, discriminator }
		}
	}
	`;

	const { data } = await res.graphQLClient.rawRequest(query);
	const values = {
		title: 'GW2Trivia',
		subtitle: 'Romans',
		description: data.novelById.shortSummary,
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon',
		page_title: data.novelById.title,
		id,
		type: 'article',
		section: 'Articles',
		author: `${data.novelById.userByUserId.username}#${data.novelById.userByUserId.discriminator}`,
		published_time: data.novelById.createdAt,
		data,
		novel: data.novelById,
		res,
	};
	if (data.novelById.cover) {
		values['image'] = `https://gw2trivia.com/${data.novelById.path}/${data.novelById.cover}`;
	}
	res.render('novels/view', values);
});

module.exports = router;
