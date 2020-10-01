const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const mime = require('mime');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/');
});

router.get('/img/:id', async function(req, res, next) {
	const image = await fetch('https://gw2trivia.com/api/graphql', {
		method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
		body: JSON.stringify({
			query: `{
				imageById(id: ${req.params.id}) { content, type }
			}`
		})
	}).then(response => response.json())
	.then(response => response.data.imageById);
	res.set('Content-Type', mime.getType(image.type));
	res.send(Buffer.from(image.content.replace(/^data:image\/\w+;base64,/, ""), 'base64'));
});

module.exports = router;
