import ArticleContainerElement from "./components/ArticleContainerElement.js";
import ArticleElement from "./components/ArticleElement.js";
import EditorElement from "./components/EditorElement.js";
import ModalElement from "./components/ModalElement.js";
import QuestionElement from "./components/QuestionElement.js";
import PaginationElement from "./components/PaginationElement.js";

let token = false;
let current_user = false;
let current_group = false;
window.GW2Trivia = {
	question_fields: `id, slug, fullSlug, title, points, createdAt, validated, spoil,
                  images { nodes { id extension } },
				categories { nodes { id name slug } },
                  userByUserId { id, username, avatarUrl, discriminator },
                  tipsByQuestionId { nodes { id, content } }`,
	question_fields_with_answers: `id, slug, fullSlug, title, points, createdAt, validated, spoil, notes,
                  images { nodes { id extension } },
		  		categories { nodes { id name slug } },
                  userByUserId { id, username, avatarUrl, discriminator },
                  tipsByQuestionId { nodes { id, content } },
				  answersByQuestionId { nodes { id, content } }`,
	article_fields: `id, slug, title, description, createdAt, updatedAt, validatedAt,
					imageByImageId { id extension },
					categories { nodes { id name slug } },
					userByUserId { id, username, avatarUrl, discriminator }`,
	article_fields_with_html: `id, slug, title, description, createdAt, updatedAt, validatedAt, html,
					pagesByArticleId { nodes { id html } },
					imageByImageId { id extension },
					categories { nodes { id name slug } },
					userByUserId { id, username, avatarUrl, discriminator }`,
	article_fields_with_markdown: `id, slug, title, description, createdAt, updatedAt, validatedAt, markdown,
					pagesByArticleId { nodes { id markdown } },
					imageByImageId { id extension },
					categories { nodes { id name slug } },
					userByUserId { id, username, avatarUrl, discriminator }`,
	date_format: {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	},
	init_promises: [],

	parseItemToGraphQL: item => Array.isArray(item)
		? `[${item.map(v => GW2Trivia.parseItemToGraphQL(v)).join(', ')}]`
		: typeof item === 'object' && !!item 
			? `{${Object.entries(item).map(([key, value]) => `${key}: ${GW2Trivia.parseItemToGraphQL(value)}`).join(', ')}}`
			: JSON.stringify(item),

	createMultiInputRow: (className, data) => {
		const input_li = document.createElement('li');
		const input = document.createElement('input');
		const input_delete_button = document.createElement('button');
		if (data) {
			Object.assign(input, {
				value: data.content,
				className: className,
				name: className,
				type: 'text',
			});
			Object.assign(input.dataset, {
				origin: data.content,
				id: data.id,
			});
		} else {
			Object.assign(input, {
				className: className,
				name: className,
			});
			Object.assign(input.dataset, {
				id: 'new',
			});
		}
		Object.assign(input_delete_button, {
			className: 'input-action',
			type: 'button',
			innerHTML: '<i class="mdi mdi-trash-can-outline"></i>'
		});
		input_delete_button.addEventListener('click', () => {
			if (input.dataset.id === 'new') {
				input_li.parentElement.removeChild(input_li);
			} else {
				input_li.hidden = true;
				input.dataset.deleted = true;
			}

		});
		input_li.appendChild(input);
		input_li.appendChild(input_delete_button);
		return input_li;
	},

	createMultiSelectRow: (className, options, data) => {
		const input_li = document.createElement('li');
		const input = document.createElement('select');
		const input_delete_button = document.createElement('button');
		for (let i = 0, imax = options.length ; i < imax ; i++) {
			const option = options[i];
			const option_el = document.createElement('option');
			Object.assign(option_el, {
				value: option.id,
				textContent: option.name,
			});
			if (data && data.id === option.id) {
				option_el.selected = true;
			}
			input.appendChild(option_el);
		}
		if (data) {
			Object.assign(input, {
				className: className,
				name: className,
			});
			Object.assign(input.dataset, {
				origin: data.id,
				id: data.id,
			});
		} else {
			Object.assign(input, {
				className: className,
				name: className,
			});
			Object.assign(input.dataset, {
				id: 'new',
			});
		}
		Object.assign(input_delete_button, {
			className: 'input-action',
			type: 'button',
			innerHTML: '<i class="mdi mdi-trash-can-outline"></i>'
		});
		input_delete_button.addEventListener('click', () => {
			if (input.dataset.id === 'new') {
				input_li.parentElement.removeChild(input_li);
			} else {
				input_li.hidden = true;
				input.dataset.deleted = true;
			}

		});
		input_li.appendChild(input);
		input_li.appendChild(input_delete_button);
		return input_li;
	},

	readFileSync: (file) => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.readAsDataURL(file);
		});
	},
};

customElements.define('article-container', ArticleContainerElement);
customElements.define('article-simple', ArticleElement);
customElements.define('markdown-editor', EditorElement);
customElements.define('question-article', QuestionElement);
customElements.define('pagination-nav', PaginationElement);
customElements.define('modal-simple', ModalElement);

const manageDarkTheme = () => {
    const btn = document.querySelector(".toggle-theme");
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme == "dark") {
        document.body.classList.toggle("dark-mode");
    } else if (currentTheme == "light") {
        document.body.classList.toggle("light-mode");
    }
    btn.addEventListener("click", function() {
        if (prefersDarkScheme.matches) {
            document.body.classList.toggle("light-mode");
            var theme = document.body.classList.contains("light-mode") ? "light" : "dark";
        } else {
            document.body.classList.toggle("dark-mode");
            var theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        }
        localStorage.setItem("theme", theme);
    });
};

const loadQuestions = (container_el) => {
	const {
		validated = false,
		limit = 10,
		offset = 0,
		orderby = 'CREATED_AT_ASC',
		pagination = '1',
		user_id = '',
		categories = '',
		title = '',
		id = '',
	} = container_el.dataset || {};
	const filters = [];
	if (id) {
		filters.push(`id: { equalTo: ${id} }`);
	} else if (validated !== false && validated !== '') {
		filters.push(`validated: { isNull: ${validated === '0'} }`);
	}
	
	if (user_id) {
		filters.push(`userId: { equalTo: ${user_id} }`);
	}
	if (title) {
		filters.push(`or: [ ${title.split(' ').map(part => `{ title: { includesInsensitive: ${JSON.stringify(part)} } }`).join(', ')} ]`);
	}
	if (categories) {
		filters.push(`categoriesQuestionsRelsByQuestionId: { some: { categoryId: { in: [${categories}] } } }`);
	}
	console.debug(filters);
	const headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	};
	fetch('/api/graphql', {
		method: "post",
		headers,
		body: JSON.stringify({
			query: `{
              allQuestions(first: ${limit}, offset: ${offset}, orderBy: ${orderby}${filters.length ? `, filter: { ${filters.join(', ')} }` : ''}) {
                nodes { ${GW2Trivia.question_fields_with_answers} }
		pageInfo { hasPreviousPage, hasNextPage }
		totalCount
              }
            }`
		})
	})
		.then(response => response.json())
		.then(data => {
			const questions = data.data.allQuestions.nodes;
			container_el.innerHTML = '';

			if (pagination === '1' || pagination === 'true') {
				container_el.appendChild(new PaginationElement(data.data.allQuestions, container_el));
			}

			const imax = questions.length;
			for (let i = 0; i < imax; i++) {
				container_el.appendChild(new QuestionElement(questions[i], {
					open: limit === 1 || limit === '1',
				}));
			}
			if (!imax) {
				container_el.appendChild(document.importNode(document.querySelector('#no-questions').content, true));
			}

			if (pagination === '1' || pagination === 'true') {
				container_el.appendChild(new PaginationElement(data.data.allQuestions, container_el));
			}
		});
};

const loadActions = () => {
	const new_question = document.querySelector('.action-new-question');
	if (new_question) {
		if (!GW2Trivia.current_user) {
			new_question.hidden = true;
		} else {
			new_question.addEventListener('click', () => {
				const { target } = new_question.dataset;
				const target_el = document.querySelector(target);
				target_el.insertBefore(new QuestionElement(), target_el.firstChild);
			});
		}
	}
};

const loadMenus = () => {
	// const logout_link = document.querySelector('#logout-link a');
	// if (logout_link) {
	// 	logout_link.addEventListener('click', () => {
	// 		localStorage.clear();
	// 	});
	// }
	document.querySelectorAll('.layout-nav ul').forEach(el => {
		el.addEventListener('mousemove', e => {
			const { x, y } = el.getBoundingClientRect();
			el.style.setProperty('--x', e.clientX - x);
			el.style.setProperty('--y', e.clientY - y);
		});
	})
};

const loadData = async () => {
	const queries = [
		// users
		`allUsers { nodes { id username discriminator } }`,

		// categories
		`allCategories { nodes { id name slug } }`,
	];

	return fetch('/api/graphql', {
		method: "post",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: `{ ${queries.join('\n')} }`
		})
	})
		.then(response => response.json())
		.then(data => {
		   Object.assign(GW2Trivia, {
			   all_users: data.data.allUsers.nodes, 
			   all_categories: data.data.allCategories.nodes
			});
		});
}

const loadSearch = () => {
	const search_form = document.querySelector('.search-form');
	if (!search_form) return;

	const question_container_el = document.querySelector(search_form.dataset['target'] || '.question-container');

	const default_user_id = GW2Trivia.search_params.has('user_id') ? GW2Trivia.search_params.get('user_id') : '';
	const default_category_id = GW2Trivia.search_params.has('categories') ? GW2Trivia.search_params.get('categories') : '';
	const default_title = GW2Trivia.search_params.has('title') ? GW2Trivia.search_params.get('title') : '';
	const default_validated = GW2Trivia.search_params.has('validated') ? GW2Trivia.search_params.get('validated') : '1';
	const default_order_by = GW2Trivia.search_params.has('order_by') ? GW2Trivia.search_params.get('order_by') : 'CREATED_AT';
	const default_direction = GW2Trivia.search_params.has('direction') ? GW2Trivia.search_params.get('direction') : 'ASC';
	const default_limit = GW2Trivia.search_params.has('limit') ? GW2Trivia.search_params.get('limit') : question_container_el.dataset['limit'] || '10';

	question_container_el.dataset['title'] = default_title;
	question_container_el.dataset['user_id'] = default_user_id;
	question_container_el.dataset['validated'] = default_validated;
	question_container_el.dataset['orderby'] = `${default_order_by}_${default_direction}`;
	question_container_el.dataset['limit'] = default_limit;
	question_container_el.dataset['categories'] = default_category_id;

	const user_select = search_form.querySelector('select[name=user_id]');
	const category_select = search_form.querySelector('select[name=categories]');
	const order_by_select = search_form.querySelector('select[name=order_by]');
	const direction_select = search_form.querySelector('select[name=direction]');
	const validated_select = search_form.querySelector('select[name=validated]');
	const title_input = search_form.querySelector('input[name=title]');
	const limit_input = search_form.querySelector('input[name=limit]');

	const { all_users, all_categories } = GW2Trivia;

	const create_user_option = (data) => {
		const user_option = document.createElement('option');
		Object.assign(user_option, data);
		if (`${data.value}` === default_user_id) {
			user_option.selected = 'selected';
		}
		return user_option;
	};
	user_select.appendChild(create_user_option({
		value: '',
		textContent: 'Tous'
	}));
	for (let i = 0, imax = all_users.length ; i < imax ; i++) {
		const user = all_users[i];
		user_select.appendChild(create_user_option({
			value: user.id,
			textContent: `${user.username}#${user.discriminator}`
		}));
	}

	const create_category_option = (data) => {
		const category_option = document.createElement('option');
		Object.assign(category_option, data);
		if (default_category_id.split(',').includes(`${data.value}`)) {
			category_option.selected = 'selected';
		}
		return category_option;
	};
	category_select.appendChild(create_category_option({
		value: '',
		textContent: 'Toutes'
	}));
	for (let i = 0, imax = all_categories.length ; i < imax ; i++) {
		const category = all_categories[i];
		category_select.appendChild(create_category_option({
			value: category.id,
			textContent: category.name
		}));
	}

	if (default_title) {
		title_input.value = default_title;
	}

	if (default_limit) {
		limit_input.value = default_limit;
	}

	order_by_select.querySelector(`option[value=${default_order_by}]`).selected = 'selected';
	direction_select.querySelector(`option[value=${default_direction}]`).selected = 'selected';
	validated_select.querySelector(`option[value="${default_validated}"]`).selected = 'selected';

	search_form.addEventListener('submit', (event) => {
		event.preventDefault();
		event.stopPropagation();
		
		// Update the container dataset
		const data = {
			title: title_input.value,
			user_id: user_select.options[user_select.selectedIndex].value,
			orderby: `${order_by_select.options[order_by_select.selectedIndex].value}_${direction_select.options[direction_select.selectedIndex].value}`,
			limit: limit_input.value,
			validated: validated_select[validated_select.selectedIndex].value,
			categories: [...category_select.selectedOptions].map(option => option.value).join(','),
		};
		Object.assign(question_container_el.dataset, data);

		// Replace orderby by order_by and direction for the History API
		delete data['orderby'];
		Object.assign(data, {
			order_by: order_by_select.options[order_by_select.selectedIndex].value,
			direction: direction_select.options[direction_select.selectedIndex].value
		});
		if (window.history) {
			history.pushState(data, null, `?${new URLSearchParams(data)}`);
		}

		// Reload the questions based on the search params
		loadQuestions(question_container_el);
	});
};

const loadQuestionContainers = () => {
	const containers = document.querySelectorAll(`.question-container`);
	const imax = containers.length;
	for (let i = 0 ; i < imax ; i++) {
		loadQuestions(containers[i]);
	}
};

async function main() {

	manageDarkTheme();

	GW2Trivia.markdown = window.markdownit({
		html:         false,        // Enable HTML tags in source
		xhtmlOut:     false,        // Use '/' to close single tags (<br />).
									// This is only for full CommonMark compatibility.
		breaks:       true,         // Convert '\n' in paragraphs into <br>
		langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
									// useful for external highlighters.
		linkify: 	  false,  		// Autoconvert URL-like text to links
	})
		.use(window.markdownitSub)
		.use(window.markdownitSup)
		.use(window.markdownitAbbr)
		.use(window.markdownitMark)
		.use(window.markdownitFootnote)
		.use(window.markdownitTaskLists)
		.use(window.markdownitFigure, {
			dataType: false,   // <figure data-type="image">, default: false
			figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
			tabindex: false,   // <figure tabindex="1+n">..., default: false
			link: true         // <a href="img.png"><img src="img.png"></a>, default: false
		})
		.use(window.markdownItAnchor, { 
			permalink: window.markdownItAnchor.permalink.ariaHidden({
				placement: 'after'
			})
		 })
		.use(window.markdownItTocDoneRight);

	GW2Trivia.markdown.renderer.rules.footnote_block_open = () => (
		'<h3 class="mt-3">Notes :</h3>\n' +
		'<section class="footnotes">\n' +
		'<ol class="footnotes-list">\n'
	);

	GW2Trivia.search_params = new URLSearchParams(location.search);

	if (GW2Trivia.search_params.has('redirect')) {
		location = decodeURIComponent(GW2Trivia.search_params.get('redirect'));
		return;
	}

	const cookies = {};

	if (document.cookie) {
		const cookies_str = document.cookie.split('; ');
		for (let i = 0, imax = cookies_str.length ; i < imax ; i++) {
			const cookie = cookies_str[i].split('=');
			cookies[cookie[0]] = cookie.length > 1 && cookie[1];
		}
		if (cookies.current_user) {
			cookies.current_user = JSON.parse(decodeURIComponent(cookies.current_user));
		}
	}

	current_user = cookies.current_user;
	current_group = current_user && current_user.groupByGroupId;

	if (current_user) {
		document.querySelector('#profile-link .user-avatar').src = `${current_user.avatarUrl}?size=128`;
		document.querySelector('#profile-link .user-name').innerText = `${current_user.username}#${current_user.discriminator}`;
		document.querySelector('#profile-link #nav-profile').href = `/users/view/${current_user.id}`;
		document.getElementById('profile-link').hidden = false;
		document.getElementById('logout-link').hidden = false;
		document.getElementById('login-link').hidden = true;
		GW2Trivia.token = token;
		GW2Trivia.current_user = current_user;
		GW2Trivia.current_group = current_group;
	}

	loadActions();
	loadMenus();
	GW2Trivia.init_promises.push(loadData());
	await Promise.all(GW2Trivia.init_promises);
	loadSearch();
	// TODO: put in the search function
	loadQuestionContainers();

	window.onpopstate = (event) => {
		console.debug(`Location: ${document.location}, state: ${JSON.stringify(event.state)}`);
		// TODO: extract state to populate the search and update the page without reloading
		if (event && event.state) {
			location.reload();
		}
	}
}

Object.assign(GW2Trivia, {
	loadQuestions,
	loadQuestionContainers,
	loadActions,
	loadMenus,
	loadSearch
});

main();
