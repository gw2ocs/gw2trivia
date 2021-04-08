const imagemin = require('imagemin');
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
	const { id, content } = payload;
	if (!content) return;
	const content_min = await imagemin.buffer(decodeBase64Image(content).data, {
		plugins: [
			imageminJpegtran(),
			imageminPngquant({quality: [0.6, 0.8]})
		]
	});
	helpers.query(`UPDATE gw2trivia.images SET content=decode('${content_min.toString('base64')}', 'escape') where id=${id}`);
};
