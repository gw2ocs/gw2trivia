console.log('Special event loading: Aprilfool');

// change Ogden image
const ogden_img = document.querySelector('.home-ogden img');
if (ogden_img) {
	ogden_img.src = '/img/aprilfool/ogden.png';
}

// change Ogden presentation
const ogden_dialogue = document.querySelector('.home-dialogue');
if (ogden_dialogue) {
	ogden_dialogue.querySelector('p:nth-child(2)').innerHTML = `Je suis le <a href="https://wiki-fr.guildwars2.com/wiki/Seigneur_Faren" rel="noreferrer"
	target="_blank">Seigneur Faren</a>, le véritable héros de la Tyrie.<br/>
Bien que j'excelle sur les champs de bataille, ma culture est également sans failles.<br/>
C'est donc tout à fait naturel que je succède à Ogden Guéripierre, enfin parti prendre sa retraite. Quelques changements sont à prévoir !
<ul>
<li>Questions pour un Quaggan devient Questions pour un Seigneur.</li>
<li>Des frais de participation vont être mis en place afin d'assurer ma pérénité financière. Le montant s'élève à 2 <i class="gw2-gold-coin"></i> / mois.</li>
<li>Tous les points et succès ont été réinitialisés afin que tout le monde reparte sur un pied d'égalité.</li>
</ul>`;
}