const express = require('express');
const httpErrors = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { postgraphile } = require('postgraphile');
const fetch = require('node-fetch');
const { run } = require("graphile-worker");
const { GraphQLClient, gql } = require('graphql-request');
const pg = require('pg');

const PgManyToManyPlugin = require('@graphile-contrib/pg-many-to-many');
const PgByteaPlugin = require('./plugins/pg-bytea');
const ConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PostGraphileNestedMutations = require('@priotas/postgraphile-plugin-nested-mutations');

const indexRouter = require('./routes/index');
const assetsRouter = require('./routes/assets');
const aboutRouter = require('./routes/about');
const usersRouter = require('./routes/users');
const questionsRouter = require('./routes/questions');
const articlesRouter = require('./routes/articles');
const novelsRouter = require('./routes/novels');
const qpubRouter = require('./routes/qpub');

const app = express();

console.log(process.version);

String.prototype.escapeHtml = function() {
    const tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '5MB' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'SuperSecretAAAA'));
app.use(express.static(path.join(__dirname, 'public'), {
	dotfiles: 'ignore',
	maxAge: '7d',
}));
app.use(express.static(path.join(__dirname, 'filestore'), {
	dotfiles: 'ignore',
	maxAge: '7d',
}));
app.use('/mdi', express.static(path.join(__dirname, 'node_modules/@mdi/font'), {
	dotfiles: 'ignore',
	maxAge: '31d',
}));
const modules_dist = ['markdown-it', 'markdown-it-sub', 'markdown-it-sup', 'markdown-it-footnote', 'markdown-it-abbr', 'markdown-it-mark', 'markdown-it-anchor', 'markdown-it-toc-done-right', 'markdown-it-task-lists'];
for (let i = modules_dist.length - 1 ; i >= 0 ; --i) {
	const mod = modules_dist[i];
	app.use(`/${mod}`, express.static(path.join(__dirname, `node_modules/${mod}/dist`), {
		dotfiles: 'ignore',
		maxAge: '31d',
	}));
}
const modules = ['markdown-it-implicit-figures'];
for (let i = modules.length - 1 ; i >= 0 ; --i) {
	const mod = modules[i];
	app.use(`/${mod}`, express.static(path.join(__dirname, `node_modules/${mod}`), {
		dotfiles: 'ignore',
		maxAge: '31d',
	}));
}

app.use((req, res, next) => {
	const date = new Date();
	let special_date = false;

	if (date.getDate() === 1 && date.getMonth() === 3) {
		special_date = 'aprilfool';
	}

	if (date.getMonth() === 11 && date.getDate() <= 25) {
		special_date = 'christmas';
	}

	if (req.query.special) {
		special_date = req.query.special;
	}

	Object.assign(res, {
		current_date: date,
		special_date
	});
	next();
});

app.use(async (req, res, next) => {
	const { token } = req.signedCookies;
	const graphOptions = {};
	if (token) {
		req.headers['authorization'] = `Bearer ${token}`;
		res.cookie('token', token, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, signed: true, sameSite: true });
		graphOptions['headers'] = {
			authorization: `Bearer ${token}`
		};
	}
	res.graphQLClient = new GraphQLClient('https://gw2trivia.com/api/graphql', graphOptions);
	res.postgresClient = new pg.Client({
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		database: process.env.POSTGRES_DB,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD
	});
	if (token) {
		const query = gql`
		{
			currentUser {
				id username discriminator avatarUrl
			}
			currentGroup {
				id isAdmin name
			}
		}
		`;
		try {
			const { data } = await res.graphQLClient.rawRequest(query);
			Object.assign(req, data);
		} catch (e) {
			console.error("Failed to fetch current user");
		}
	}
	next();
});

app.use('/api', postgraphile(process.env.DATABASE_URL, [process.env.DATABASE], {
	appendPlugins: [
		PgByteaPlugin,
		PgManyToManyPlugin,
		ConnectionFilterPlugin,
		PostGraphileNestedMutations,
	],
	graphileBuildOptions: {
		nestedMutationsSimpleFieldNames: true,
		connectionFilterRelations: true,
	},
	/*pgSettings: async req => {
		const settings = {};
		const { token } = req.signedCookies;
		if (token) {
			settings['http.headers.Authorization'] = `Bearer ${token}`;
		}
		return settings;
	},*/
	pgDefaultRole: process.env.PG_DEFAULT_ROLE,
	ignoreRBAC: false,
	ignoreIndexes: true,
	bodySizeLimit: '5MB',
	dynamicJson: true,
	graphqlRoute: "/graphql",
	graphiql: true,
	enhanceGraphiql: true,
	graphiqlRoute: "/graphiql",
	enableQueryBatching: true,
	jwtSecret: process.env.JWT_SECRET,
	jwtPgTypeIdentifier: process.env.JWT_TOKEN,
}));

app.use(async (req, res, next) => {
	const now = new Date().toISOString();
	const query = gql`
	{
		allAnnouncements(filter: {and: [
			{or: [
				{startAt: {isNull: true}},
				{startAt: {lessThanOrEqualTo: "${now}"}}
			]},
			{or: [
				{endAt: {isNull: true}},
				{endAt: {greaterThanOrEqualTo: "${now}"}}
			]}
		]}) {
			nodes { id summary content type }
		}
	}
	`;
	try {
		const { data } = await res.graphQLClient.rawRequest(query);
		Object.assign(res, data);
	} catch (e) {
		console.error("Failed to fetch announcements");
	}
	next();
});

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/assets', assetsRouter);
app.use('/users', usersRouter);
app.use('/questions', questionsRouter);
app.use('/articles', articlesRouter);
app.use('/novels', novelsRouter);
app.use('/qpub', qpubRouter);



// 404 handler
app.use((request, response, next) => {
	next(httpErrors(404));
});

// error handler
app.use((error, request, response, next) => {
	response.locals.message = error.message;
	response.locals.error = request.app.get('env') === 'development' ? error : {};
	const status = error.status || 500;
	const data = {
		title: 'GW2Trivia',
		subtitle: 'Jeu de culture générale sur l\'univers de Guild Wars',
		description: `Erreur ${status}`,
		keywords: 'questions pour un quaggan, guild wars, gw, gw2, jeu, gw2trivia, trivia, culture',
		page_title: `Erreur ${status}`,
		res: response,
	};
	response.status(status);
	response.render('error', data);
});

async function main() {
	// Run a worker to execute jobs:
	const runner = await run({
		connectionString: process.env.WORKER_DATABASE_URL,
		concurrency: 5,
		// Install signal handlers for graceful shutdown on SIGINT, SIGTERM, etc
		noHandleSignals: false,
		pollInterval: 1000,
		taskDirectory: path.join(__dirname, 'tasks'),
	});
}

main().catch((err) => {
	console.error(err);
});

module.exports = app;

