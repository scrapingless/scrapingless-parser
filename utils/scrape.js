const conf = require('../config.json').config;
const parser = require('./parser');


/**
 *  Perform html data scraping using a configured browser
 * Load Html and run "Parser/pipe"
 */
var scrape = async function(url, pipeConf){
     
    var browserType = conf.scraper.browser;
    

    if(pipeConf !== undefined){

      //override global browser config
      if(pipeConf.browser !== undefined){
        browserType = pipeConf.browser;
      }
      var html ="";
      if(browserType === 'simple')
          html = await simpleBrowser(url,pipeConf);
      else if(browserType === 'puppeteer')
          html = await puppetterBrowser(url,pipeConf);
      else if(browserType === 'api')
          html = await apiBrowser(url,pipeConf);
  
      return await parser.autoParse(url, html, pipeConf);
    }
    else return {"error": "pipe not found"};
}

/**
 *  Perform html data scraping using a configured browser
 * return html
 */
var html = async function(url, pipeConf){
     
  var browserType = conf.scraper.browser;
  

  if(pipeConf !== undefined){

    //override global browser config
    if(pipeConf.browser !== undefined){
      browserType = pipeConf.browser;
    }
  }
    var html ="";
    if(browserType === 'simple')
        return await simpleBrowser(url,pipeConf);
    else if(browserType === 'puppeteer')
        return await puppetterBrowser(url,pipeConf);
    else if(browserType === 'api')
        return await apiBrowser(url,pipeConf);

    return "";
}
var br = require("./puppeteerBrowser");

/**
 * Get Html using puppetter Browser
 */
var puppetterBrowser = async function(url,pipeConf){
  var br = require("./puppeteerBrowser");
  let browser = await br.loadBrowser(60000);
    try {                
        let page = await browser.newPage();
        await page.goto(url);
        await br.waitFor(pipeConf,page);
        
        
        //get HTML
        const html = await page.evaluate(() => document.querySelector('*').outerHTML);
        await page.close();
        await browser.close();
        return html;
       
    } catch (error) {
        if(browser !== undefined){
          try {
            await browser.close();
          } catch (error) {            
          }
        }
        return "error: " + error;
    }
    
}


/**
 * Get Html using external endpoint
 */
var apiBrowser = async function(url){
    var axios = require('axios');
    var html ="";

    var parameters = config.scraper.apiParams;
    parameters[config.scraper.apiParamsUrlKey] = url;

    if(config.scraper.apiMethod === 'POST'){
        await axios.get(config.scraper.apiUrl,parameters)
            .catch(async function (error) {
               return "";
          }).then(async function (response) {        
            html = response.data;
            });
        
    }
    else {
        await axios.post(config.scraper.apiUrl,parameters)
        .catch(async function (error) {
           return "";
      }).then(async function (response) {        
        html = response.data;
        });    
    }
    return data;
}

/**
 * Get Html using axios
 */
var simpleBrowser = async function(url){
    var axios = require('axios');
    const extractDomain = require("extract-domain");
    var domain = extractDomain(url);
    var data = {};
    await axios.get(url, {
      headers: {
        Referer: domain,
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).catch(async function (error) {
      return "";
    }).then(async function (response) {        
        data = response.data;
      });
      
      return data;
  };

module.exports = {
    scrape,
    html
  };