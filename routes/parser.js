var express = require('express');
var router = express.Router();
var conf = require('../config.json') 
var parser = require('../utils/parser')
var er = require('../utils/retMessages')
const fs = require('fs');


/** Parse using default rule by domain */
router.post('/parse/auto', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.body,'auto','',''));
});


/** Parse using specific rule by domain */
router.post('/parse/rule', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.body,'custom',req.query.ruleName,req.query.version));
});

/** Parse using specific (no url-filter regex applied) */
router.post('/parse/direct', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.body,'direct',req.query.ruleName,req.query.version));
});

/** Parse with simple  html loading using specific (no url-filter regex applied) */
router.all('/test/parse/direct', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    var data = await parser.testRunner(req.query.url,req.body,'direct',req.query.ruleName,req.query.version);
    res.send(data);
});


/** Parse with simple  html loading using default rule by domain */
router.all('/test/parse/auto', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.testRunner(req.query.url,req.body,'auto','',''));
});



module.exports = router;
