const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

/* GET token page. */
router.get('/token', function(req, res, next) {
	const SCOPES = [
		'chat:read',
		'chat:edit',
		'channel:read:redemptions',
		'channel:manage:redemptions',
		//'moderator:manage:announcements',
	];
	
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: process.env.TWITCH_CLIENT_ID,
		scope: SCOPES.join(' '),
		redirect_uri: process.env.TWITCH_CLIENT_REDIRECT
	});
	return res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`);
});

/* GET token callback page. */
router.get('/token/callback', function(req, res, next) {
	const { query } = req;
	const params = new URLSearchParams({
		code: query.code,
		client_id: process.env.TWITCH_CLIENT_ID,
		client_secret: process.env.TWITCH_CLIENT_SECRET,
		grant_type: 'authorization_code',
		redirect_uri: process.env.TWITCH_CLIENT_REDIRECT
	});
	console.log(params);
	fetch(`https://id.twitch.tv/oauth2/token`, {
		method: 'post',
		body: params
	}).then(response => response.json())
	.then(response => {
		console.log(response);
		const { access_token, refresh_token } = response;

		fetch('https://api.twitch.tv/helix/users', {
			headers: {
				'Client-Id': process.env.TWITCH_CLIENT_ID,
				'Authorization': `Bearer ${access_token}`
			}
		}).then(response => response.json())
		.then(response => {
			console.log(response);
			const { id, login } = response.data[0];

			res.postgresClient.connect();
			res.postgresClient.query(
				`INSERT INTO qpub.channels (room_id, name, user_token, refresh_token) VALUES ($1, $2, $3, $4)
				ON CONFLICT (room_id) DO UPDATE SET name = $2, user_token = $3, refresh_token = $4, invalid_token = FALSE`, 
				[id, login, access_token, refresh_token]
			).catch(console.error);
			return res.send('OK');
		}).catch(console.error);
		
	})
	.catch(console.error);
});


module.exports = router;

