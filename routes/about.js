const express = require('express');
const router = express.Router();

/* GET stats page. */
router.get('/stats', function(req, res, next) {
	res.render('about/stats', { 
		title: 'GW2Trivia', 
		subtitle: 'Statistiques', 
		description: 'Statistiques sur Questions pour un Quaggan.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon',
		res,
	});
});

/* GET support page. */
router.get('/support', function(req, res, next) {
	res.render('about/support', { 
		title: 'GW2Trivia', 
		subtitle: 'Soutenir GW2Trivia', 
		description: 'Le soutien peut être fait par différents moyens.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon',
		res,
	});
});

/* GET legal page. */
router.get('/legal', function(req, res, next) {
	res.render('about/legal', { 
		title: 'GW2Trivia', 
		subtitle: 'Mentions légales', 
		description: 'Tester vos connaissances sur l\'univers de Guild Wars en participant à Questions pour un Quaggan, un jeu présenté par Ogden Guéripierre.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon, mentions, legal',
		res,
	});
});

/* GET projects page. */
router.get('/projects', function(req, res, next) {
	res.render('about/projects', { 
		title: 'GW2Trivia', 
		subtitle: 'Autres projets', 
		description: 'Autres projets liés à l\'univers de Guild Wars 2.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon, projects',
		res,
	});
});

/* GET partners page. */
router.get('/partners', function(req, res, next) {
	res.render('about/partners', { 
		title: 'GW2Trivia', 
		subtitle: 'Partenaires GW2Trivia', 
		description: 'Créateurs de contenus participants, d\'une manière ou d\'une autre à l\'activité du projet.',
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, ogden guéripierre, jeu, gw2trivia, trivia, culture, pandraghon, partner, youtube, book',
		res,
	});
});

module.exports = router;

