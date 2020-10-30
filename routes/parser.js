var express = require('express');
var router = express.Router();
var conf = require('../config.json') 
var parser = require('../utils/parser')
var er = require('../utils/retMessages')
const fs = require('fs');


/** Parse using default rule by domain */
router.post('/parse/auto', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.text,'auto','',''));
});

/** Parse using specific rule by domain */
router.post('/parse/rule', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.text,'custom',req.query.ruleName,req.query.version));
});

/** Parse using specific (no url-filter regex applied) */
router.post('/parse/direct', async function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');   
    res.send(await parser.autoParse(req.query.url,req.text,'direct',req.query.ruleName,req.query.version));
});




module.exports = router;
