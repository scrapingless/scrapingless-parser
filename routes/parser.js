var express = require('express');
var router = express.Router();
var parser = require('../utils/parser')
var scraper = require('../utils/scrape')
var pipe = require('../utils/pipe')
const fs = require('fs');

/** Scraping using automated browser or API (by config) and automatic parse-rule detection */
router.post('/scrape/auto', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await scraper.scrape(req.query.url,await pipe.getPipeConf(req.query.url,'auto','','',)));
});

/** Scraping using automated browser or API (by config) with specific rule (no url-filter regex applied) */
router.post('/scrape/direct', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await scraper.scrape(req.query.url,await pipe.getPipeConf(req.query.url,'direct',req.query.ruleName,req.query.version)));
});

/** Parse using default rule by domain */
router.post('/parse/auto', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.body,await pipe.getPipeConf(req.query.url,'auto','','')));
});
/** Parse using specific (no url-filter regex applied) */
router.post('/parse/direct', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.body,await pipe.getPipeConf(req.query.url,'direct',req.query.ruleName,req.query.version)));
});


module.exports = router;
