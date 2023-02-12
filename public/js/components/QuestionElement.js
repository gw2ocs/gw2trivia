export default class QuestionElement extends HTMLElement {

	parse() {
		this.user = this.question.userByUserId;
		this.images = this.question.images && this.question.images.nodes || [];
		this.tips = this.question.tipsByQuestionId && this.question.tipsByQuestionId.nodes || [];
		this.answers = this.question.answersByQuestionId && this.question.answersByQuestionId.nodes || [];
		this.categories = this.question.categories && this.question.categories.nodes || [];
	}

	toggleMode(question_el, mode) {
		question_el.querySelector('.question-display').hidden = mode !== 'display';
		question_el.querySelector('.question-edit').hidden = mode !== 'edit';
	}

	toggleModeEvent(event) {
		event.preventDefault();
		const el = event.currentTarget;
		const class_list = el.classList;
		const question_el = el.closest('.question');
		const mode = class_list.contains('action-edit') ? 'edit' : 'display';
		this.toggleMode(question_el, mode);
	}

	createMultiSelectRow(className, options, data) {
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
	}

	createMultiInputRow(className, data) {
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
	}

	createMultiImageRow(className, data) {
		const input_li = document.createElement('li');
		const input = document.createElement('input');
		const img = document.createElement('img');
		const input_delete_button = document.createElement('button');
		if (data) {
			Object.assign(input, {
				value: data.id,
				className: className,
				name: className,
				type: 'hidden',
			});
			Object.assign(input.dataset, {
				origin: data.id,
				id: data.id,
			});
			Object.assign(img.dataset, {
				src: `/assets/img/${data.id}.${data.extension}`
			})
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
		input_li.appendChild(img);
		input_li.appendChild(input_delete_button);
		return input_li;
	}

	populate(question_el) {
		const date_format = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		};
		Object.assign(question_el.querySelector('.question-title'), {
			textContent: this.question.title,
			title: this.question.title,
		});
		question_el.querySelector('.question-header .question-points').prepend(this.question.points);
		question_el.querySelector('.question-header .question-tips-count').prepend(this.tips.length);
		question_el.querySelector('.question-header .user-name').textContent = `${this.user.username}#${this.user.discriminator}`;
		Object.assign(question_el.querySelector('.question-header .user-avatar'), {
			src: `${this.user.avatarUrl}?size=128`,
			alt: `${this.user.username}#${this.user.discriminator}`,
			title: `${this.user.username}#${this.user.discriminator}`,
		});
		Object.assign(question_el.querySelector('.question-header .question-creation-date'), {
			dateTime: new Date(this.question.createdAt).toISOString(),
			textContent: new Date(this.question.createdAt).toLocaleDateString(window.navigator.language, date_format),
		});
		question_el.querySelector('.question-details .user-name').textContent = `${this.user.username}#${this.user.discriminator}`;
		question_el.querySelector('.question-details .question-author').href = `/users/view/${this.user.id}`;
		Object.assign(question_el.querySelector('.question-details .user-avatar'), {
			src: `${this.user.avatarUrl}?size=128`,
			alt: `${this.user.username}#${this.user.discriminator}`,
		});
		Object.assign(question_el.querySelector('.question-details .question-creation-date'), {
			dateTime: new Date(this.question.createdAt).toISOString(),
			textContent: new Date(this.question.createdAt).toLocaleDateString(window.navigator.language, date_format),
		});
		question_el.querySelector('.question-link').href = `/questions/view/${this.question.id}/${this.question.slug}`;
		question_el.querySelector('.question-edit').hidden = true;
		if (window.GW2Trivia.current_user && window.GW2Trivia.current_user.id === this.user.id || window.GW2Trivia.current_group && window.GW2Trivia.current_group.isAdmin) {
			question_el.querySelector('.action-edit').hidden = false;
			question_el.querySelector('.action-show-answers').disabled = false;
			question_el.querySelector('.action-delete').hidden = false;
			question_el.querySelector('.question-tips-action-alt').hidden = true;

			if (!this.question.validated && window.GW2Trivia.current_group && window.GW2Trivia.current_group.isAdmin) {
				question_el.querySelector('.action-validate').hidden = false;
			}
		}
		question_el.querySelector('.action-edit').addEventListener('click', () => { 
			this.toggleMode(question_el, 'edit'); 
			question_el.querySelectorAll('img[data-src]:not([src])').forEach(img => img.src = img.dataset.src);
		}, false);
		question_el.querySelector('.action-cancel').addEventListener('click', () => { this.toggleMode(question_el, 'display') }, false);
		question_el.querySelector('.action-delete').addEventListener('click', () => {
			if (confirm(`La question "${this.question.title}" sera définitivement supprimée.`)) {
				// delete the question
				fetch('/api/graphql', {
					method: "post",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						query: `mutation { deleteQuestionById(input: { id: ${this.question.id} }) { deletedQuestionId }}`,
					}),
				})
					.then(response => response.json())
					.then(data => {
						question_el.parentElement.removeChild(question_el);
					});
			}
		}, false);
		question_el.querySelector('.action-validate').addEventListener('click', () => {
			if (confirm(`La question "${this.question.title}" sera validée.`)) {
				// validate the question
				fetch('/api/graphql', {
					method: "post",
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						query: `mutation { updateQuestionById(input: { questionPatch: { validated: ${JSON.stringify(new Date())} }, id: ${this.question.id} }) { clientMutationId }}`,
					}),
				})
					.then(response => response.json())
					.then(data => {
						question_el.parentElement.removeChild(question_el);
					});
			}
		}, false);

		question_el.querySelector('.input-title').value = this.question.title;
		question_el.querySelector('.input-title').dataset.origin = this.question.title;
		question_el.querySelector('.input-notes').value = this.question.notes;
		question_el.querySelector('.input-notes').dataset.origin = this.question.notes;
		question_el.querySelector('.input-points').value = this.question.points;
		question_el.querySelector('.input-points').dataset.origin = this.question.points;
		question_el.querySelector('.input-spoil').checked = this.question.spoil;
		question_el.querySelector('.input-spoil').dataset.origin = this.question.spoil;

		if (this.categories.length) {
			const category_ul_el = question_el.querySelectorAll('.question-categories');
			const categories_fragment = document.createDocumentFragment();
			const categories_input_fragment = document.createDocumentFragment();
			this.categories.map(category => {
				const category_el = document.createElement('li');
				const category_link_el = document.createElement('a');
				Object.assign(category_link_el, {
					textContent: category.name,
					href: `/questions?categories=${category.id}`
				});
				//category_el.textContent = category.name;
				category_el.appendChild(category_link_el);
				categories_fragment.appendChild(category_el);
				categories_input_fragment.appendChild(this.createMultiSelectRow('input-category', GW2Trivia.all_categories, category));
			});
			question_el.querySelector('.label-categories .input-list').appendChild(categories_input_fragment);
			category_ul_el.forEach(ul => ul.append(categories_fragment.cloneNode(true)));
			question_el.querySelectorAll('.question-has-categories').forEach(el => el.hidden = false);
		}

		if (this.tips.length) {
			const tip_ul_el = document.createElement('ul');
			const tip_input_fragment = document.createDocumentFragment();
			this.tips.map(tip => {
				const tip_el = document.createElement('li');
				tip_el.textContent = tip.content;
				tip_ul_el.appendChild(tip_el);
				tip_input_fragment.appendChild(this.createMultiInputRow('input-tip', tip));
			});
			question_el.querySelector('.label-tips .input-list').appendChild(tip_input_fragment);
			question_el.querySelector('.question-tips').appendChild(tip_ul_el);
			question_el.querySelector('.question-tips').hidden = false;
		} else {
			question_el.querySelector('.question-tips-alt').hidden = false;
		}

		const answer_container = question_el.querySelector('.question-answers');
		if (this.answers.length) {
			const answer_ul_el = document.createElement('ul');
			const answer_input_fragment = document.createDocumentFragment();
			this.answers.map(answer => {
				const answer_el = document.createElement('li');
				answer_el.textContent = answer.content;
				answer_ul_el.appendChild(answer_el);
				answer_input_fragment.appendChild(this.createMultiInputRow('input-answer', answer));
			});
			question_el.querySelector('.label-answers .input-list').appendChild(answer_input_fragment);
			answer_container.appendChild(answer_ul_el);
		}
		question_el.querySelector('.action-show-answers').addEventListener('click', () => {
			answer_container.hidden = false;
			question_el.querySelector('.question-answers-action').hidden = true;
		}, false);

		if (this.images.length) {
			const image_list_el = document.createDocumentFragment();
			const image_input_fragment = document.createDocumentFragment();
			this.images.map(image => {
				const image_el = document.createElement('img');
				image_el.dataset.src = `/assets/img/${image.id}.${image.extension}`;
				image_list_el.appendChild(image_el);
				image_input_fragment.appendChild(this.createMultiImageRow('input-image', image));
			});
			question_el.querySelector('.label-images .input-list').appendChild(image_input_fragment);
			question_el.querySelector('.question-images').appendChild(image_list_el);
			question_el.querySelectorAll('.question-has-image').forEach(el => el.hidden = false);
		}

		if (this.question.spoil) {
			question_el.querySelectorAll('.question-spoil').forEach(el => el.hidden = false);
		}

	}

	render() {
		const questionTemplate = document.querySelector('#question-template');
		const question_node = document.importNode(questionTemplate.content, true);
		const question_el = question_node.querySelector('.question');
		question_el.classList.add(this.question && this.question.validated ? 'validated' : 'suggested');
		question_el.dataset.id = this.question && this.question.id || 'new';
		if (Object.entries(this.question).length) {
			this.populate(question_el);
		} else {
			this.toggleMode(question_el, 'edit');
		}

		const form = question_el.querySelector('.question-edit');
		form.querySelector('.action-new-tip').addEventListener('click', () => {
			const tip_input_li = this.createMultiInputRow('input-tip');
			const tip_input = tip_input_li.querySelector('input');
			form.querySelector('.label-tips .input-list').appendChild(tip_input_li);
			tip_input.focus();
		});
		form.querySelector('.action-new-answer').addEventListener('click', () => {
			const answer_input_li = this.createMultiInputRow('input-answer');
			const answer_input = answer_input_li.querySelector('input');
			form.querySelector('.label-answers .input-list').appendChild(answer_input_li);
			answer_input.focus();
		});
		form.querySelector('.action-search-category').addEventListener('click', () => {
			const category_input_li = this.createMultiSelectRow('input-category', GW2Trivia.all_categories);
			const category_input = category_input_li.querySelector('select');
			form.querySelector('.label-categories .input-list').appendChild(category_input_li);
			category_input.focus();
		});
		form.querySelector('.action-new-image').addEventListener('click', () => {
			const image_input_li = this.createMultiInputRow('input-image');
			const image_input = image_input_li.querySelector('input');
			image_input.type = 'file';
			form.querySelector('.label-images .input-list').appendChild(image_input_li);
			image_input.focus();
		});
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			event.stopPropagation();
			form.querySelectorAll('input, button').forEach(el => el.disabled = true);
			const edited_fields = {};
			const title_el = form.querySelector('input[name="title"]');
			const points_el = form.querySelector('input[name="points"]');
			const spoil_el = form.querySelector('input[name="spoil"]');
			const notes_el = form.querySelector('textarea[name="notes"]');
			const tip_els = form.querySelectorAll('input[name="input-tip"]');
			const answer_els = form.querySelectorAll('input[name="input-answer"]');
			const category_els = form.querySelectorAll('select[name="input-category"]');
			const image_els = form.querySelectorAll('input[name="input-image"]');
			const mutations = [];
			let mutation_count = 0;

			const question_id = form.parentElement.dataset.id;
			const mode = question_id === 'new' ? 'create' : 'update';

			const question_data = {};

			if (title_el.value !== title_el.dataset.origin) {
				edited_fields['title'] = title_el.value;
				question_data['title'] = title_el.value;
			}
			if (points_el.value !== points_el.dataset.origin) {
				edited_fields['points'] = Number(points_el.value);
				question_data['points'] = Number(points_el.value);
			}
			if (String(spoil_el.checked) !== spoil_el.dataset.origin) {
				edited_fields['spoil'] = spoil_el.checked;
				question_data['spoil'] = spoil_el.checked;
			}
			if (notes_el.value !== notes_el.dataset.origin) {
				edited_fields['notes'] = notes_el.value;
				question_data['notes'] = notes_el.value;
			}

			for (let i = 0, imax = tip_els.length ; i < imax ; i++) {
				const tip_el = tip_els[i];
				const content = tip_el.value.trim();
				const id = tip_el.dataset.id;
				const deleted = tip_el.dataset.deleted;
				let action;
				let mutation;
				if (deleted) {
					action = 'deleteById';
					mutation = {id: Number(id)};
					mutations.push(`mut${mutation_count++}: deleteTipById(input: {id: ${id}}) { deletedTipId }`);
				} else if (content) {
					if (id === 'new') {
						action = 'create';
						mutation = {content};
						mutations.push(`mut${mutation_count++}: createTip( 
							input: { 
								tip: { 
									questionId: ${this.question.id}, 
									content: ${JSON.stringify(content)} 
								} 
							} 
						) { tip { id } }`);
					} else if (tip_el.dataset.origin !== content) {
						action = 'updateById';
						mutation = {tipPatch: {content}, id: Number(id)};
						mutations.push(`mut${mutation_count++}: updateTipById(
							input: {
								tipPatch: {
									content: ${JSON.stringify(content)}
								}, 
								id: ${id}
							}
						) { tip { id } }`);
					}	
				}
				if (action && mutation) {
					'tips' in question_data || (question_data['tips'] = {});
					action in question_data['tips'] || (question_data['tips'][action] = []);
					question_data['tips'][action].push(mutation);
				}
			}

			for (let i = 0, imax = answer_els.length ; i < imax ; i++) {
				const answer_el = answer_els[i];
				const content = answer_el.value.trim();
				const id = answer_el.dataset.id;
				const deleted = answer_el.dataset.deleted;
				let action;
				let mutation;
				if (deleted) {
					action = 'deleteById';
					mutation = {id: Number(id)};
					mutations.push(`mut${mutation_count++}: deleteAnswerById(input: {id: ${id}}) { deletedAnswerId }`);
				} else if (content) {
					if (id === 'new') {
						action = 'create';
						mutation = {content};
						mutations.push(`mut${mutation_count++}: createAnswer( 
							input: { 
								answer: { 
									questionId: ${this.question.id}, 
									content: ${JSON.stringify(content)} 
								} 
							} 
						) { answer { id } }`);
					} else if (answer_el.dataset.origin !== content) {
						action = 'updateById';
						mutation = {answerPatch: {content}, id: Number(id)};
						mutations.push(`mut${mutation_count++}: updateAnswerById(
							input: {
								answerPatch: {
									content: ${JSON.stringify(content)}
								}, 
								id: ${id}
							}
						) { answer { id } }`);
					}
				}
				if (action && mutation) {
					'answers' in question_data || (question_data['answers'] = {});
					action in question_data['answers'] || (question_data['answers'][action] = []);
					question_data['answers'][action].push(mutation);
				}
			}

			for (let i = 0, imax = category_els.length ; i < imax ; i++) {
				const category_el = category_els[i];
				const content = category_el.value;
				const id = category_el.dataset.id;
				const deleted = category_el.dataset.deleted;
				let action;
				let mutation;
				if (deleted) {
					action = 'deleteByCategoryIdAndQuestionId';
					mutation = { questionId: this.question.id, categoryId: Number(id) };
					mutations.push(`mut${mutation_count++}: deleteAnswerById(input: {id: ${id}}) { deletedAnswerId }`);
				} else if (content) {
					if (id === 'new') {
						action = 'create';
						mutation = { categoryId: Number(content) };
						mutations.push(`mut${mutation_count++}: createAnswer( 
							input: { 
								answer: { 
									questionId: ${this.question.id}, 
									content: ${JSON.stringify(content)} 
								} 
							} 
						) { answer { id } }`);
					} else if (category_el.dataset.origin !== content) {
						action = 'updateByCategoryIdAndQuestionId';
						mutation = {
							categoriesQuestionsRelPatch: { categoryId: Number(content) }, 
							questionId: this.question.id, categoryId: Number(id)
						};
						mutations.push(`mut${mutation_count++}: updateAnswerById(
							input: {
								answerPatch: {
									content: ${JSON.stringify(content)}
								}, 
								id: ${id}
							}
						) { answer { id } }`);
					}
				}
				if (action && mutation) {
					'categoriesQuestionsRels' in question_data || (question_data['categoriesQuestionsRels'] = {});
					action in question_data['categoriesQuestionsRels'] || (question_data['categoriesQuestionsRels'][action] = []);
					question_data['categoriesQuestionsRels'][action].push(mutation);
				}
			}

			const readFileSync = (file) => {
				return new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = (e) => resolve(e.target.result);
					reader.readAsDataURL(file);
				});
			}

			for (let i = 0, imax = image_els.length ; i < imax ; i++) {
				let action;
				let mutation;
				const image_el = image_els[i];
				const id = image_el.dataset.id;
				const deleted = image_el.dataset.deleted;
				if (deleted) {
					action = 'deleteByImageIdAndQuestionId';
					mutation = { questionId: this.question.id, imageId: Number(id) };
					mutations.push(`mut${mutation_count++}: deleteImageById(input: {id: ${id}}) { deletedImageId }`);
				} else {
					if (id === 'new') {
						const image_files = image_el.files;
						for (let j = 0, jmax = image_files.length ; j < jmax ; j++) {
							action = 'create';
							const file = image_files[j];

							if (!file.type.startsWith('image/')) continue;

							const content = btoa(await readFileSync(file));
							console.log(content);
							mutation = { image: { create: {
								content,
								type: file.type,
								userId: GW2Trivia.current_user.id
							} } };
						}
					}
				}
				if (action && mutation) {
					'imagesQuestionsRels' in question_data || (question_data['imagesQuestionsRels'] = {});
					action in question_data['imagesQuestionsRels'] || (question_data['imagesQuestionsRels'][action] = []);
					question_data['imagesQuestionsRels'][action].push(mutation);
				}
			}

			if (!mutations && !Object.entries(edited_fields).length) {
				// nothing to save => cancel ?
				form.querySelectorAll('input, button').forEach(el => el.disabled = false);
				return false;
			}

			if (!Object.entries(question_data).length) {
				form.querySelectorAll('input, button').forEach(el => el.disabled = false);
				return false;
			}

			if (mode === 'create') {
				question_data['userId'] = GW2Trivia.current_user.id;
			}

			console.debug(question_data);

			const parseItemToGraphQL = item => Array.isArray(item)
				? `[${item.map(v => parseItemToGraphQL(v)).join(', ')}]`
				: typeof item === 'object' && !!item 
					? `{${Object.entries(item).map(([key, value]) => `${key}: ${parseItemToGraphQL(value)}`).join(', ')}}`
					: JSON.stringify(item);

			const mutation = `
				mutation {
					${mode === 'create' ? 'createQuestion' : 'updateQuestionById'}(input: {
						${mode === 'create' ? 'question' : 'questionPatch'}: ${parseItemToGraphQL(question_data)}
						${mode === 'update' ? `, id: ${question_id}` : ''}
					}) {
						question { ${GW2Trivia.question_fields_with_answers} }
					}
				}
			`;
			console.debug(mutation);

			if (Object.entries(edited_fields).length) {
				mutations.push(`updateQuestionById (
                    input: {
                        questionPatch: { ${Object.keys(edited_fields).map(key => `${key}: ${JSON.stringify(edited_fields[key])}`).join(', ')} },
                        id: ${this.question.id}
                    }
                  ) {
                    question { ${GW2Trivia.question_fields_with_answers} }
                  }`);
			}

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
				.then(data => {
					console.debug(data);
					const el = form.parentElement;
					const question_data = (data.data.createQuestion || data.data.updateQuestionById).question;
					el.parentElement.replaceChild(new QuestionElement(question_data), el);
				}).catch(e => {
					form.querySelectorAll('input, button').forEach(el => el.disabled = false);
				});
		}, false);

		const details_el = question_el.querySelector('.question-display');
		details_el.addEventListener("toggle", event => {
			details_el.querySelectorAll('img[data-src]:not([src])').forEach(img => img.src = img.dataset.src);
		});
		if (this.options.open) {
			details_el.open = this.options.open;
		}

		return question_node;
	}

	constructor(data, options) {
		super();

		this.question = data || {};
		this.options = options || {};

		this.parse();
		return this.render();
	}

}
