export default class PaginationElement extends HTMLElement {

	parse() {
		const { limit = 10, offset = 0 } = this.question_container_el.dataset || {};
		this.limit = Number(limit);
		this.offset = Number(offset);
		this.total_questions = this.data.totalCount;
		this.total_pages = Math.ceil(this.total_questions / this.limit);
		this.current_page = Math.floor(this.offset / this.limit) + 1;
		this.has_next = this.data.pageInfo.hasNextPage;
		this.has_prev = this.data.pageInfo.hasPreviousPage;
	}

	render() {
		const pagination_template = document.querySelector('#pagination-template');
		const pagination_node = document.importNode(pagination_template.content, true);
		const pagination_el = pagination_node.querySelector('.pagination-container');

		const button_prev = pagination_el.querySelector('.pagination-prev');
		const button_next = pagination_el.querySelector('.pagination-next');

		pagination_el.querySelector('.pagination-current-page').textContent = this.current_page;
		pagination_el.querySelector('.pagination-last-page').textContent = this.total_pages;
		button_prev.toggleAttribute('disabled', !this.has_prev);
		button_next.toggleAttribute('disabled', !this.has_next);

		button_prev.addEventListener('click', () => {
			const prev = this.offset - this.limit;
			this.question_container_el.dataset['offset'] = prev > 0 ? prev : 0;
			GW2Trivia.loadQuestions(this.question_container_el);
		});

		button_next.addEventListener('click', () => {
			this.question_container_el.dataset['offset'] = this.offset + this.limit;
			GW2Trivia.loadQuestions(this.question_container_el);
		});
		
		return pagination_node;
	}

	constructor(data, question_container_el) {
		super();

		this.data = data || {};
		this.question_container_el = question_container_el;

		this.parse();
		return this.render();
	}

}
