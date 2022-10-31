const express = require('express');
const btoa = require('btoa');
const router = express.Router();
const fetch = require('node-fetch');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { 
		title: 'GW2Trivia', 
		subtitle: 'Jeu de culture générale sur l\'univers de Guild Wars', 
		description: 'Tester vos connaissances sur l\'univers de Guild Wars en participant à Questions pour un Quaggan, un jeu présenté par Ogden Guéripierre.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon',
		res,
	});
});

router.get('/logout', function (req, res, next) {
	const cookies = req.cookies;
	for (const cookie in cookies) {
		if (!cookies.hasOwnProperty(cookie)) {
			continue;
		}
		res.cookie(cookie, '', { expires: new Date(0), maxAge: new Date(0), sameSite: true });
	}
	res.clearCookie('token', { httpOnly: true, signed: true, sameSite: true });
	res.redirect('/');
});

router.get('/login', function (req, res, next) {
	const url = new URL('https://discord.com/api/oauth2/authorize');
	url.searchParams.set('client_id', process.env.DISCORD_CLIENTID);
	url.searchParams.set('redirect_uri', 'https://gw2trivia.com/login_callback');
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('prompt', 'none');
	url.searchParams.set('scope', 'identify email');
	res.redirect(url);
});

router.get('/login_callback', async function (req, res, next) {
	const params = req.query;
	console.log({params});
	if (!params.code) {
		const {error, error_description} = params;
		return res.redirect('/');
	}
	const token_url = new URL('https://discord.com/api/v6/oauth2/token');
	const token_data = new URLSearchParams();
	
	token_data.append('client_id', process.env.DISCORD_CLIENTID);
	token_data.append('client_secret', process.env.DISCORD_SECRET);
	token_data.append('redirect_uri', 'https://gw2trivia.com/login_callback');
	token_data.append('grant_type', 'authorization_code');
	token_data.append('scope', 'identify email');
	token_data.append('code', params.code);

	const token_response = await fetch(token_url, {
		method: 'POST',
		body: token_data,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	}).then(response => response.json());

	const user_url = new URL('https://discord.com/api/v6/users/@me');
	const user_response = await fetch(user_url, {
		method: 'get',
		headers: { Authorization: `${token_response.token_type} ${token_response.access_token}` },
	}).then(response => response.json());

	const user = await fetch('https://gw2trivia.com/api/graphql', {
		method: 'post',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${jwt.sign({ aud: process.env.JWT_AUD, role: process.env.PG_ADMIN_ROLE, user_id: process.env.ADMINID }, process.env.JWT_SECRET)}`
		},
		body: JSON.stringify({
			query: `mutation {
				insertOrUpdateUser(input: {
				  discordId: ${JSON.stringify(user_response.id)},
				  discriminator: ${JSON.stringify(user_response.discriminator)},
				  locale: ${JSON.stringify(user_response.locale)},
				  username: ${JSON.stringify(user_response.username)},
				  avatar: ${user_response.avatar ? JSON.stringify(user_response.avatar) : 'null'}
				}) { user { 
					id username discriminator locale avatarUrl
					groupByGroupId { id name isAdmin }
				} }
			}`
		})
	}).then(response => response.json())
	.then(response => response.data.insertOrUpdateUser.user)
		.catch(err => console.error(err));
	if (!user) {
		res.redirect('/');
	}
	const token = jwt.sign({ aud: process.env.JWT_AUD, role: process.env.PG_USER_ROLE, user_id: user.id  }, process.env.JWT_SECRET);
	res.locals.token = token;
	res.cookie('token', token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, signed: true, sameSite: true });
	console.log(JSON.stringify(user));
	res.cookie('current_user', JSON.stringify(user), { maxAge: 7 * 24 * 3600 * 1000, sameSite: true });

	res.redirect(`/?redirect=${encodeURIComponent('/')}`);
});

/* GET stats page. */
router.get('/stats', function(req, res, next) {
	res.render('stats', { 
		title: 'GW2Trivia', 
		subtitle: 'Statistiques', 
		description: 'Statistiques sur Questions pour un Quaggan.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon',
		res,
	});
});

/* GET support page. */
router.get('/support', function(req, res, next) {
	res.render('support', { 
		title: 'GW2Trivia', 
		subtitle: 'Support', 
		description: 'Statistiques sur Questions pour un Quaggan.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon',
		res,
	});
});

/* GET legal page. */
router.get('/legal', function(req, res, next) {
	res.render('legal', { 
		title: 'GW2Trivia', 
		subtitle: 'Mentions légales', 
		description: 'Tester vos connaissances sur l\'univers de Guild Wars en participant à Questions pour un Quaggan, un jeu présenté par Ogden Guéripierre.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon, mentions, legal',
		res,
	});
});

router.get('/gw2', function(req, res, next) {
	return res.redirect('https://www.kqzyfj.com/click-100581015-13024577');
});

router.get('/f2p', function(req, res, next) {
	return res.redirect('https://www.jdoqocy.com/click-100581015-14414545 ');
});

module.exports = router;

