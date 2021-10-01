import ArticleElement from './ArticleElement.js';

export default class ArticleContainerElement extends HTMLElement {

	connectedCallback() {
		this.parse();
	}

	parse() {
		const {
			mode = 'edit',
		} = this.dataset || {};

		const func_name = `render_${mode}`;
		if (!this[func_name]) {
			console.error(`${func_name} not found, cannot instantiate the article container.`);
			return;
		}
		this[func_name]();
	}

	render_edit() {
		const {
			id = 'new',
		} = this.dataset || {};
		const template = document.querySelector('#article-edit-template');
		const node = document.importNode(template.content, true);
		const el = node.querySelector('.article');

		const title_el = el.querySelector('[name=title]');
		const description_el = el.querySelector('[name=description]');
		const markdown_el = el.querySelector('[name=markdown]');
		const form_el = el.querySelector('form');
		const file_el = el.querySelector('input[name=image]');

		this._origin = {};

		const mode = id === 'new' ? 'create' : 'update';

		form_el.querySelector('.action-search-category').addEventListener('click', () => {
			const category_input_li = GW2Trivia.createMultiSelectRow('input-category', GW2Trivia.all_categories);
			const category_input = category_input_li.querySelector('select');
			form_el.querySelector('.label-categories .input-list').appendChild(category_input_li);
			category_input.focus();
		});

		if (mode === 'update') {			
			const headers = {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			};
			fetch('/api/graphql', {
				method: "post",
				headers,
				body: JSON.stringify({
					query: `{
						articleById(id: ${id}) { ${GW2Trivia.article_fields_with_markdown} }
					}`
				})
			})
				.then(response => response.json())
				.then(async response => {
					// wait for main thread to finish initialisation
					await Promise.all(GW2Trivia.init_promises);
					const article = response.data.articleById;
					this._origin = article;
					this.article = article;
					title_el.value = article.title;
					description_el.value = article.description;
					markdown_el.value = article.markdown;

					if (article.categories.nodes.length) {
						const categories_input_fragment = document.createDocumentFragment();
						article.categories.nodes.map(category => {
							categories_input_fragment.appendChild(GW2Trivia.createMultiSelectRow('input-category', GW2Trivia.all_categories, category));
						});
						el.querySelector('.label-categories .input-list').appendChild(categories_input_fragment);
					}
				});
		}

		form_el.addEventListener('submit', async (event) => {
			event.preventDefault();
			event.stopPropagation();

			form_el.querySelectorAll('input, button').forEach(el => el.disabled = true);

			const data = {};
			let action;
			let mutation;
			
			const category_els = form_el.querySelectorAll('select[name="input-category"]');

			if (title_el.value !== this._origin.title) {
				data['title'] = title_el.value;
			}

			if (description_el.value !== this._origin.description) {
				data['description'] = description_el.value;
			}

			if (markdown_el.value !== this._origin.markdown) {
				data['markdown'] = markdown_el.value;
			}

			for (let i = 0, imax = category_els.length ; i < imax ; i++) {
				const category_el = category_els[i];
				const content = category_el.value;
				const categ_id = category_el.dataset.id;
				const deleted = category_el.dataset.deleted;
				if (deleted) {
					action = 'deleteByArticleIdAndCategoryId';
					mutation = { articleId: this.article.id, categoryId: Number(categ_id) };
				} else if (content) {
					if (categ_id === 'new') {
						action = 'create';
						mutation = { categoryId: Number(content) };
					} else if (category_el.dataset.origin !== content) {
						action = 'updateByArticleIdAndCategoryId';
						mutation = {
							categoriesArticlesRelPatch: { categoryId: Number(content) }, 
							articleId: this.article.id, categoryId: Number(categ_id)
						};
					}
				}
				if (action && mutation) {
					'articlesCategoriesRels' in data || (data['articlesCategoriesRels'] = {});
					action in data['articlesCategoriesRels'] || (data['articlesCategoriesRels'][action] = []);
					data['articlesCategoriesRels'][action].push(mutation);
				}
			}

			const image_files = file_el.files;
			if (image_files.length) {
				const file = image_files[0];

				if (file.type.startsWith('image/')) {
					const content = btoa(await GW2Trivia.readFileSync(file));
					console.log(content);
					data['image'] = { create: {
						content,
						type: file.type,
						userId: GW2Trivia.current_user.id
					} };
				}
			}

			if (!Object.entries(data).length) {
				form_el.querySelectorAll('input, button').forEach(el => el.disabled = false);
				return false;
			}

			if (mode === 'create') {
				data['userId'] = GW2Trivia.current_user.id;
			}

			mutation = `
				mutation {
					${mode === 'create' ? 'createArticle' : 'updateArticleById'}(input: {
						${mode === 'create' ? 'article' : 'articlePatch'}: ${GW2Trivia.parseItemToGraphQL(data)}
						${mode === 'update' ? `, id: ${id}` : ''}
					}) {
						article { id, slug }
					}
				}
			`;

			console.debug(mutation);

			fetch('/api/graphql', {
				method: "post",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: mutation,
				}),
			})
				.then(response => response.json())
				.then(response => {
					const article = response.data[mode === 'create' ? 'createArticle' : 'updateArticleById'].article;
					if (article.id) {
						location = `/articles/view/${article.id}/${article.slug}`;
					} else {
						form_el.querySelectorAll('input, button').forEach(el => el.disabled = false);
					}
				}).catch(e => {
					form_el.querySelectorAll('input, button').forEach(el => el.disabled = false);
				});
		}, false)

		this.appendChild(node);
	}

	render_view() {
		const {
			id,
		} = this.dataset || {};

		if (!id) {
			location = '/articles';
		}

		const headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		};
		fetch('/api/graphql', {
			method: "post",
			headers,
			body: JSON.stringify({
				query: `{ articleById(id: ${id}) { ${GW2Trivia.article_fields_with_html} } }`
			})
		})
			.then(response => response.json())
			.then(response => {
				const article = response.data.articleById;
				article['mode'] = 'view';
				this.appendChild(new ArticleElement(article));
			});
	}

	render_list() {
		const headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		};
		/*fetch('/api/graphql', {
			method: "post",
			headers,
			body: JSON.stringify({
				query: `{
				  allArticles {
					nodes { ${GW2Trivia.article_fields} }
					pageInfo { hasPreviousPage, hasNextPage }
					totalCount
				  }
				}`
			})
		})
			.then(response => response.json())
			.then(response => {
				console.debug(response);
				const { nodes } = response.data.allArticles;
				for (let i = 0, imax = nodes.length ; i < imax ; i++) {
					const article = nodes[i];
					article['mode'] = 'list';
					this.appendChild(new ArticleElement(article));
				}
			});*/
	}

}
