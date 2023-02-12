const imagemin = require('imagemin');
const mime = require('mime');
const path = require('path');
const fs = require('fs').promises;
const imageminJpegtran = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

function decodeBase64Image(dataString) {
	const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};
  
	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}
  
	response.type = matches[1];
	response.data = Buffer.from(matches[2], 'base64');
  
	return response;
}

module.exports = async (payload, helpers) => {
	console.log(payload.id, payload.type);
	const { id, type, content } = payload;
	if (!content) return;
	helpers.query(`UPDATE gw2trivia.images SET extension='${mime.getExtension(type)}' where id=${id}`);
	try {
		const content_min = await imagemin.buffer(decodeBase64Image(content).data, {
			plugins: [
				imageminJpegtran(),
				imageminPngquant({quality: [0.6, 0.8]})
			]
		});
		helpers.query(`UPDATE gw2trivia.images SET content=decode('${content_min.toString('base64')}', 'escape') where id=${id}`);
		fs.writeFile(`${path.join(__dirname, '..', 'filestore')}/assets/img/${id}.${mime.getExtension(type)}`, content_min);
	} catch(err) {
		console.error('Error during imagemin:');
		console.error(err);
		try {
			//helpers.query(`UPDATE gw2trivia.images SET extension='${mime.getExtension(type)}' where id=${id}`);
			fs.writeFile(`${path.join(__dirname, '..', 'filestore')}/assets/img/${id}.${mime.getExtension(type)}`, Buffer.from(content.replace(/^data:image\/\w+;base64,/, ""), 'base64'));
		} catch(e) {}
	}
};
