export default class ArticleElement extends HTMLElement {
	
	constructor(options) {
		/*
		Options contains:
		- title
		- description
		- html
		*/
		super();
		this['article'] = options;
	}

	connectedCallback() {
		this.parse();
	}

	parse() {
		const {
			mode = 'list',
		} = Object.assign({}, this.dataset || {}, this.article || {});

		const func_name = `render_${mode}`;
		if (!this[func_name]) {
			console.error(`${func_name} not found, cannot instantiate the article container.`);
			return;
		}
		this[func_name]();
	}

	render_list() {
		const template = document.querySelector('#article-list-template');
		const node = document.importNode(template.content, true);
		const el = node.querySelector('.article');

		const title_el = el.querySelector('.article-title');
		const description_el = el.querySelector('.article-description');

		Object.assign(title_el, {
			textContent: this.article.title,
			href: `/articles/view/${this.article.id}/${this.article.slug}`
		});
		description_el.textContent = this.article.description;
		description_el.innerHTML = description_el.innerHTML.replace(/\n/gi, '<br/>');
		el.querySelector('.user-name').textContent = `${this.article.userByUserId.username}#${this.article.userByUserId.discriminator}`;
		el.querySelector('.article-author').href = `/users/view/${this.article.userByUserId.id}`;
		Object.assign(el.querySelector('.user-avatar'), {
			src: `${this.article.userByUserId.avatarUrl}?size=128`,
			alt: `${this.article.userByUserId.username}#${this.article.userByUserId.discriminator}`,
			title: `${this.article.userByUserId.username}#${this.article.userByUserId.discriminator}`,
		});
		Object.assign(el.querySelector('.article-creation-date'), {
			dateTime: new Date(this.article.createdAt).toISOString(),
			textContent: new Date(this.article.createdAt).toLocaleDateString(window.navigator.language, GW2Trivia.date_format),
		});
		if (this.article.imageByImageId) {
			el.style['background-image'] = `radial-gradient(ellipse closest-side, var(--article-list-background-center), var(--article-list-background-border)), url(/assets/img/${this.article.imageByImageId.id})`;
		}
		if (this.article.categories.nodes.length) {
			const category_ul_el = el.querySelectorAll('.article-categories');
			const categories_fragment = document.createDocumentFragment();
			this.article.categories.nodes.map(category => {
				const category_el = document.createElement('li');
				const category_link_el = document.createElement('a');
				Object.assign(category_link_el, {
					textContent: category.name,
					href: `/questions?categories=${category.id}`
				});
				category_el.appendChild(category_link_el);
				categories_fragment.appendChild(category_el);
			});
			category_ul_el.forEach(ul => ul.append(categories_fragment.cloneNode(true)));
			el.querySelectorAll('.article-has-categories').forEach(el => el.hidden = false);
		}

		this.appendChild(node);
	}

	extractHeadings($contentElement) {
		const headingElements = [...$contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')];
		const headings = []; // top level heading
		let previous = false;
		for (let i = 0, imax = headingElements.length ; i < imax ; i++) {
			const headingData = headingElements[i];
			const heading = {
				title: headingData.innerText.replace(/#*$/g,''),
				depth: Number(headingData.nodeName.replace(/\D/g,'')),
      			id: headingData.getAttribute('id'),
				children: [],
				parent: false,
			};
			if (previous) {
				if (previous.depth < heading.depth) {
					previous.children.push(heading);
					heading.parent = previous;
				} else if (previous.depth === heading.depth) {
					if (previous.parent) {
						previous.parent.children.push(heading);
						heading.parent = previous.parent;
					}
				} else {
					let parent = previous.parent;
					while (parent && parent.depth >= heading.depth) {
						parent = parent.parent;
					}
					if (parent) {
						parent.children.push(heading);
						heading.parent = parent;
					}
				}
			}
			if (!heading.parent) {
				headings.push(heading);
			}
			previous = heading;
		}
		return headings;
	}

	generateOneHeadingMarkup(heading) {
		return `
		<li>
			<a href="#${heading.id}">${heading.title}</a>
			${heading.children.length ? `<ol>${heading.children.map(h => this.generateOneHeadingMarkup(h)).join('\n')}</ol>` : ''}
		</li>
		`;
	}

	generateLinkMarkup(headings) {
		return `
		<ol>
			${headings.map(h => this.generateOneHeadingMarkup(h)).join('\n')}
		</ol>
		`;
	}

	render_view() {
		const el = document.querySelector('.article-content');
		const tocData = this.extractHeadings(el);
		if (tocData.length) {
			const tocHtml = this.generateLinkMarkup(tocData);
			const tocEl = document.querySelector('.table-of-contents');
			tocEl.innerHTML = tocHtml;
			tocEl.hidden = false;
		}
		/*const template = document.querySelector('#article-view-template');
		const node = document.importNode(template.content, true);
		const el = node.querySelector('.article');

		const title_el = el.querySelector('.article-title');
		const description_el = el.querySelector('.article-description');
		const content_el = el.querySelector('.article-content');

		const siblings_query = `next: allArticles(first: 1, filters: { validatedAt: { isNull: false, greaterThan: ${JSON.stringify(this.article.validatedAt)} } }) { modes { id slug title } }
previous: allArticles(last: 1, filters: { validatedAt: { isNull: false, lessThan: ${JSON.stringify(this.article.validatedAt)} } }) { modes { id slug title } }`;

		title_el.textContent = this.article.title;
		description_el.textContent = this.article.description;
		description_el.innerHTML = description_el.innerHTML.replace(/\n/gi, '<br/>');
		content_el.innerHTML = this.article.html;
		el.querySelector('.user-name').textContent = `${this.article.userByUserId.username}#${this.article.userByUserId.discriminator}`;
		el.querySelector('.article-author').href = `/users/view/${this.article.userByUserId.id}`;
		Object.assign(el.querySelector('.user-avatar'), {
			src: `${this.article.userByUserId.avatarUrl}?size=128`,
			alt: `${this.article.userByUserId.username}#${this.article.userByUserId.discriminator}`,
			title: `${this.article.userByUserId.username}#${this.article.userByUserId.discriminator}`,
		});
		Object.assign(el.querySelector('.article-creation-date'), {
			dateTime: new Date(this.article.createdAt).toISOString(),
			textContent: new Date(this.article.createdAt).toLocaleDateString(window.navigator.language, GW2Trivia.date_format),
		});
		el.querySelector('.article-link').href = `/articles/view/${this.article.id}/${this.article.slug}`;
		
		if (this.article.categories.nodes.length) {
			const category_ul_el = el.querySelectorAll('.article-categories');
			const categories_fragment = document.createDocumentFragment();
			this.article.categories.nodes.map(category => {
				const category_el = document.createElement('li');
				const category_link_el = document.createElement('a');
				Object.assign(category_link_el, {
					textContent: category.name,
					href: `/questions?categories=${category.id}`
				});
				category_el.appendChild(category_link_el);
				categories_fragment.appendChild(category_el);
			});
			category_ul_el.forEach(ul => ul.append(categories_fragment.cloneNode(true)));
			el.querySelectorAll('.article-has-categories').forEach(el => el.hidden = false);
		}

		if (window.GW2Trivia.current_user && window.GW2Trivia.current_user.id === this.article.userId || window.GW2Trivia.current_group && window.GW2Trivia.current_group.isAdmin) {
			Object.assign(el.querySelector('.article-action-edit'), {
				href: `/articles/edit/${this.article.id}/${this.article.slug}`,
				hidden: false
			});
			
			if (!this.article.validatedAt && window.GW2Trivia.current_group && window.GW2Trivia.current_group.isAdmin) {
				//el.querySelector('.article-action-validate').hidden = false;
			}
		}

		this.appendChild(node);*/
	}

}
