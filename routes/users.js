var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
//const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET user view. */
router.get('/view/:id', async function(request, res, next) {
	const { id } = request.params;
	if (!id) {
		res.redirect('/');
	}
	const user = await fetch('https://gw2trivia.com/api/graphql', {
		method: 'post',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			//Authorization: `Bearer ${jwt.sign({ aud: process.env.JWT_AUD, role: process.env.PG_USER_ROLE, user_id: process.env.ADMINID }, process.env.JWT_SECRET)}`
		},
		body: JSON.stringify({
			query: `{ userById(id: ${id}) { 
				username discriminator avatarUrl
				articlesByUserId { totalCount }
				achievementsByAchievementsUsersRelUserIdAndAchievementId(orderBy: SEQUENCE_ASC) { totalCount nodes { description icon id name theme } }
				questionsByUserId { totalCount } 
				} }`
		})
	}).then(response => response.json())
		.then(response => res.render('users/view', {
			title: 'GW2Trivia',
			subtitle: 'Utilisateur',
			description: `Profil de ${response.data.userById.username}#${response.data.userById.discriminator}`,
			keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture, pandraghon',
			page_title: `${response.data.userById.username}#${response.data.userById.discriminator}`,
			id,
			type: 'article',
			section: 'Utilisateurs',
			record: response.data.userById,
			res,
		}))
		.catch(err => console.error(err));
});

module.exports = router;
