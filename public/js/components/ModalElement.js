export default class ModalElement extends HTMLElement {

	constructor(options) {
		/*
		Options contains:
		- title
		- body
		- body_template
		- cancel_callback
		- validate_callback
		*/
		super();
		this['modal'] = options;
	}

	connectedCallback() {
		this.render();
	}

	render() {
		const template = document.querySelector('#modal-template');
		const node = document.importNode(template.content, true);
		const el = node.querySelector('.modal');
		const title_el = el.querySelector('.modal-title');
		const body_el = el.querySelector('.modal-body');

		if (this.modal.title) {
			title_el.innerHTML = this.modal.title;
		}

		if (this.modal.body) {
			body_el.innerHTML = this.modal.body;
		}

		if (this.modal.body_template) {
			const body_template = document.querySelector(this.modal.body_template);
			if (!body_template) {
				console.error(`${this.modal.body_template} not found.`);
			} else {
				const body_node = document.importNode(body_template.content, true);
				body_el.appendChild(body_node);
			}
		}

		this.appendChild(node);

		this.addEventListener('submit', () => { this.validateModal() }, true);

		this.querySelectorAll('button[data-close]').forEach(button => button.addEventListener('click', () => { this.closeModal() } ));
		this.querySelectorAll('button[data-validate]').forEach(button => button.addEventListener('click', () => { this.validateModal() } ));

		if (this.modal.init) {
			this.modal.init(this);
		}
	}

	closeModal() {
		if (this.modal.close_callback) {
			this.modal.close_callback(this);
		}
		this.parentNode.removeChild(this);
	}

	async validateModal() {
		if (this.modal.validate_callback) {
			await this.modal.validate_callback(this);
		}
		this.parentNode.removeChild(this);
	}

}
