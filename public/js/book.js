(() => {
	document.querySelectorAll('.book').forEach(b => b.addEventListener('click', (e) => {
		b.classList.toggle('book-viewback');
	}));
})();