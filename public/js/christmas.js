console.log('Special event loading: Christmas');

// Load calendar widget
const img = document.createElement('img');
Object.assign(img, {
	src: 'https://calendrier.gw2.fr/widget',
	alt: 'Calendrier de l\'Avent communautaire',
	width: 320,
	height: 100
});

const anchor = document.createElement('a');
Object.assign(anchor, {
	href: 'https://calendrier.gw2.fr',
	target: '_blank',
	id: 'calendar-widget',
});

anchor.append(img);
document.body.append(anchor);