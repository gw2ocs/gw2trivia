import ModalElement from './ModalElement.js';

export default class EditorElement extends HTMLElement {

	constructor(options) {
		super();
		
		this.render()

		Object.assign(this, options);

		return this;
	}

	get content_el() {
		return this.querySelector('.editor-content');
	}

	get preview_el() {
		return this.querySelector('.editor-preview');
	}

	get value() {
		return this.content_el.value;
	}

	set value(val) {
		this.content_el.value = val;
	}

	get name() {
		return this.content_el.name;
	}

	set name(val) {
		this.content_el.name = val;
	}

	get id() {
		return this.content_el.id;
	}

	set id(val) {
		this.content_el.id = val;
	}

	get dataset() {
		return this.content_el.dataset;
	}

	render() {
		const editor_template = document.querySelector('#markdown-editor-template');
		const editor_node = document.importNode(editor_template.content, true);
		const editor_el = editor_node.querySelector('.editor-container');

		this.appendChild(editor_node);

		const { attributes, content_el } = this;
		for (let i = attributes.length - 1 ; i >= 0 ; --i) {
			content_el.setAttribute(attributes[i].name, attributes[i].value);
			this.removeAttribute(attributes[i].name);
		}

		this.querySelectorAll('.editor-actions button[data-markdown-tag]').forEach(button => button.addEventListener('click', () => { this.addMarkup(button.dataset) } ));
		this.querySelectorAll('.editor-actions button[data-markdown-singleline]').forEach(button => button.addEventListener('click', () => { this.addMarkupSingleline(button.dataset) } ));
		this.querySelectorAll('.editor-actions button[data-markdown-line]').forEach(button => button.addEventListener('click', () => { this.addMarkupLine(button.dataset) } ));
		this.querySelectorAll('.editor-actions button[data-function]').forEach(button => {
			const func_name = button.dataset.function;
			const func = this[func_name];
			if (!func) {
				console.error(`${func_name} is not a function of the markdown editor.`);
				return;
			}
			button.addEventListener('click', () => { this[func_name](button.dataset) });
		});
		content_el.addEventListener('input', () => { 
			if (this.previewTimeout) {
				clearTimeout(this.previewTimeout);
			}
			this.previewTimeout = setTimeout(() => { this.preview(); }, 750);
		});
		content_el.dispatchEvent(new Event('input'));

		return editor_node;
	}

	addMarkup({ start, end}) {
		if (!end) { end = start; }
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		content_el.value = content_el.value.substring(0, selectionStart)
			+ start
			+ content_el.value.substring(selectionStart, selectionEnd)
			+ end 
			+ content_el.value.substring(selectionEnd, content_el.value.length);
		content_el.focus();
		content_el.selectionStart = selectionStart + start.length;
		content_el.selectionEnd = selectionEnd + start.length;
		content_el.dispatchEvent(new Event('input'));
	}

	addMarkupSingleline({ markdownSingleline, newline}) {
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		const pos = content_el.value.charAt(selectionStart - 1) === '\n'
					? selectionStart
					: content_el.value.substring(0, selectionStart).lastIndexOf('\n') + 1;
		const str = `${pos !== 0 && newline !== undefined ? '\n' : ''}${markdownSingleline}${newline !== undefined ? '\n' : ''}`;
		content_el.value = content_el.value.substring(0, pos)
			+ str
			+ content_el.value.substring(pos, content_el.value.length); 
		content_el.focus();
		content_el.selectionStart = selectionStart + str.length;
		content_el.selectionEnd = selectionEnd + str.length;
		content_el.dispatchEvent(new Event('input'));
	}

	addMarkupLine({ markdownLine }) {
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		const pos = content_el.value.charAt(selectionStart - 1) === '\n'
					? selectionStart
					: content_el.value.substring(0, selectionStart).lastIndexOf('\n') + 1;
		const start_offset = markdownLine.length;
		const end_offset = markdownLine.length * content_el.value.substring(pos, selectionEnd).split('\n').length;
		content_el.value = content_el.value.substring(0, pos)
			+ markdownLine
			+ content_el.value.substring(pos, selectionEnd).split('\n').join(`\n${markdownLine}`)
			+ content_el.value.substring(selectionEnd, content_el.value.length); 
		content_el.focus();
		content_el.selectionStart = selectionStart + start_offset;
		content_el.selectionEnd = selectionEnd + end_offset;
		content_el.dispatchEvent(new Event('input'));
	}

	addHeader() {
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		const pos = content_el.value.charAt(selectionStart - 1) === '\n'
					? selectionStart
					: content_el.value.substring(0, selectionStart).lastIndexOf('\n') + 1;
		const str = `#${content_el.value.charAt(pos) === '#' ? '' : ' '}`;
		content_el.value = content_el.value.substring(0, pos)
			+ str
			+ content_el.value.substring(pos, content_el.value.length); 
		content_el.focus();
		content_el.selectionStart = selectionStart + str.length;
		content_el.selectionEnd = selectionEnd + str.length;
		content_el.dispatchEvent(new Event('input'));
	}

	addLink() {
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		document.body.appendChild(new ModalElement({
			title: 'Insérer un lien',
			body_template: '#link-modal-template',
			init: el => {
				el.querySelector('input[name=link]').focus();
				el.querySelector('input[name=text]').value = content_el.value.substring(selectionStart, selectionEnd);
			},
			validate_callback: el => {
				const url = el.querySelector('input[name=link]').value;
				let text = el.querySelector('input[name=text]').value;
				if (!text) {
					text = url;
				}
				const offset = 1;
				content_el.value = content_el.value.substring(0, selectionStart) + `[${text}](${url})` + content_el.value.substring(selectionEnd, content_el.value.length);
				content_el.focus();
				content_el.selectionStart = selectionStart + offset;
				content_el.selectionEnd = selectionEnd + offset;
				content_el.dispatchEvent(new Event('input'));
			}
		}));
	}

	addImage() {
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		const readFileSync = (file) => {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => resolve(e.target.result);
				reader.readAsDataURL(file);
			});
		}

		document.body.appendChild(new ModalElement({
			title: 'Insérer une image',
			body_template: '#image-modal-template',
			init: el => {
				el.querySelector('input[name=url]').focus();
				el.querySelector('input[name=alt]').value = content_el.value.substring(selectionStart, selectionEnd);
			},
			validate_callback: async el => {
				let url = el.querySelector('input[name=url]').value;
				const text = el.querySelector('input[name=alt]').value;
				const file_el = el.querySelector('input[name=file]');
				const image_files = file_el.files;
				if (image_files.length) {
					const file = image_files[0];

					if (file.type.startsWith('image/')) {
						const content = btoa(await readFileSync(file));
						const mutation = { image: {
							content,
							type: file.type,
							userId: GW2Trivia.current_user.id
						} };
						const headers = {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						};
						const image = await fetch('/api/graphql', {
							method: "post",
							headers,
							body: JSON.stringify({
								query: `mutation {
									createImage(input: ${GW2Trivia.parseItemToGraphQL(mutation)} ) {
										image { id extension }
									}
								}`
							})
						})
							.then(response => response.json())
							.then(response => response.data.createImage.image);
						url = `/assets/img/${image.id}`;
					}
				}
				const offset = 2;
				content_el.value = content_el.value.substring(0, selectionStart) 
						+ `![${text}](${url})` 
						+ content_el.value.substring(selectionEnd, content_el.value.length);
				content_el.focus();
				content_el.selectionStart = selectionStart + offset;
				content_el.selectionEnd = selectionEnd + offset;
				content_el.dispatchEvent(new Event('input'));
			}
		}));
	}

	addFootnote() {
		const { content_el } = this;
		const { selectionStart, selectionEnd } = content_el;
		document.body.appendChild(new ModalElement({
			title: 'Insérer une note de bas de page',
			body_template: '#footnote-modal-template',
			init: el => {
				el.querySelector('input[name=tag]').focus();
				el.querySelector('input[name=tag]').value = content_el.value.substring(selectionStart, selectionEnd);
			},
			validate_callback: el => {
				const footnote = el.querySelector('textarea[name=footnote]').value;
				const tag = el.querySelector('input[name=tag]').value;
				const offset = 1;
				content_el.value = content_el.value.substring(0, selectionEnd) + `[^${tag}]` + content_el.value.substring(selectionEnd, content_el.value.length) + `\n\n[^${tag}]: ${footnote}`;
				content_el.focus();
				content_el.selectionStart = selectionStart + offset;
				content_el.selectionEnd = selectionEnd + offset;
				content_el.dispatchEvent(new Event('input'));
			}
		}));
	}

	preview() {
		const content = this.content_el.value;
		const html = GW2Trivia.markdown.render(content);
		this.preview_el.innerHTML = html;
	}

}
