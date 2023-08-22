var express = require('express'),
	router = express.Router(),
	services = require('../services'),
	path = require('path'),
	request = require('request');

router.get('/:mfg/:img', function(req, res) {
	var url = process.env.MANTA_URI + '/images/' + req.params.mfg + '/' + req.params.img;

	request.head(url, function(err, response, body){
		if (response.statusCode !== 404) return request(url).pipe(res);

		services.advanceAuto.storePartForScraping(req.params.mfg, path.basename(req.params.img, path.extname(req.params.img)));

		res.setHeader("Cache-Control", "public, max-age=86400");
		res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());

		res.sendFile(path.join(__dirname, '../res', 'img-placeholder.png'));
	});
});

router.get('/not-available', function (req, res) {
	res.setHeader("Cache-Control", "public, max-age=86400");
	res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());

	res.sendFile(path.join(__dirname, '../res/image-not-available.png'));

	// request.head("l", function (err, response, body) {
		// if (response.statusCode !== 404) return request(url).pipe(res);

		// res.setHeader("Cache-Control", "public, max-age=86400");
		// res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());

		// res.sendFile(path.join(__dirname, '../res/image-not-available.png', 'img-placeholder.png'));
	// });
});

module.exports = router;
