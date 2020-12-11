var express = require('express');
var router = express.Router();

/** try devtools */
router.post('/dev', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json'); 
    var dev = require('../utils/devtools')  
    res.send(await dev.test(req.query.url));
});

/** offline download */
router.post('/offline', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json'); 
    var downloader = require('../utils/downloader');
    var pipe = require('../utils/pipe');

    var pipeConf = undefined;
    if(req.query.ruleName !== undefined)
         pipeConf = await pipe.getPipeConf(req.query.url,'direct',req.query.ruleName,req.query.version);
    else  pipeConf = await pipe.getPipeConf(req.query.url,'auto','','',);

    res.send(await downloader.getPageCache(req.query.url,req.query.force,pipeConf,req.query.enableJs));
});

/** offline download */
router.post('/cleancache', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json'); 
    var downloader = require('../utils/downloader')  
    res.send(await downloader.cleanAllCache());
});


module.exports = router;