const anchor = require('markdown-it-anchor');
const md = require('markdown-it')({
	html:         false,        // Enable HTML tags in source
	xhtmlOut:     false,        // Use '/' to close single tags (<br />).
								// This is only for full CommonMark compatibility.
	breaks:       true,         // Convert '\n' in paragraphs into <br>
	langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
								// useful for external highlighters.
	linkify: 	  false,  		// Autoconvert URL-like text to links
})
	.use(require('markdown-it-sub'))
	.use(require('markdown-it-sup'))
	.use(require('markdown-it-footnote'))
	.use(require('markdown-it-abbr'))
	.use(require('markdown-it-mark'))
	.use(require('markdown-it-task-lists'))
	.use(anchor, { 
		permalink: anchor.permalink.ariaHidden({
			placement: 'after'
		})
	})
	.use(require('markdown-it-toc-done-right'))
	.use(require('../public/js/markdown-it/markdown-it-figure.js'), {
		dataType: false,  // <figure data-type="image">, default: false
		figcaption: true,  // <figcaption>alternative text</figcaption>, default: false
		tabindex: false, // <figure tabindex="1+n">..., default: false
		link: true // <a href="img.png"><img src="img.png"></a>, default: false
	});

md.renderer.rules.footnote_block_open = () => (
	'<h1 class="mt-3">Notes :</h1>\n' +
	'<section class="footnotes">\n' +
	'<ol class="footnotes-list">\n'
);

module.exports = async (payload, helpers) => {
	const { schema, table, id, markdown } = payload;
	const html = md.render(/\[\[toc\]\]/gi.test(markdown) ? markdown : '[[TOC]]\n\n' + markdown)
		.replace(/'/gi, '&apos;')
		.replace(/(<\s*h)(\d+)/gi, (str, p1, p2) => `${p1}${Number(p2)+2}`);
		console.log(html.substring(0, 300));
	helpers.query(`UPDATE ${schema}.${table} SET html = '${html}' WHERE id = ${id}`);
};

/* 

CREATE OR REPLACE FUNCTION gw2trivia.html_from_markdown() RETURNS trigger AS $$
BEGIN
  PERFORM graphile_worker.add_job('markdown', json_build_object(
	  'schema', TG_TABLE_SCHEMA,
	  'table', TG_TABLE_NAME,
	  'id', NEW.id,
	  'markdown', NEW.markdown
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

CREATE TRIGGER articles_markdown_inserted
 AFTER INSERT ON gw2trivia.articles
 FOR EACH ROW
 EXECUTE PROCEDURE gw2trivia.html_from_markdown();
CREATE TRIGGER articles_markdown_updated
 AFTER UPDATE ON gw2trivia.articles
 FOR EACH ROW
 WHEN (NEW.markdown IS DISTINCT FROM OLD.markdown)
 EXECUTE PROCEDURE gw2trivia.html_from_markdown();

*/