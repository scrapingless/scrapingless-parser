const conf = require('../config.json').config;
const parser = require('./parser');
const pipe = require('./pipe');


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


/**
 * Get Html using puppetter Browser
 */
var puppetterBrowser = async function(url,pipeConf){
  let browser = undefined;
    try {
        const puppeteer = require('puppeteer');

        
        //endpoint or local
        if(conf.scraper.puppeteerEndPoint !== undefined && 
            conf.scraper.puppeteerEndPoint!== "" && 
            conf.scraper.puppeteerEndPoint!== {}){
                conf.scraper.puppeteerLaunchConf.browserWSEndpoint = conf.scraper.puppeteerEndPoint;
                browser = await puppeteer.connect(conf.scraper.puppeteerLaunchConf);  
        }
        else browser = await puppeteer.launch(conf.scraper.puppeteerLaunchConf);        
        
        let page = await browser.newPage();
        await page.goto(url);

        
        if(pipeConf !== undefined && pipeConf.wait !== undefined){
            if(pipeConf.wait.waitSelectors !== undefined){
                if(pipeConf.wait.waitSelectors.length > 0){
                if(pipeConf.wait.waitType === 'first'){

                       

                       const waitFirst = async _ => {                         
                          
                            for (let index = 0; index < pipeConf.wait.waitSelectors.length; index++) {
                              var w = pipeConf.wait.waitSelectors[index];
                              var found = false;
                              try {
                                await page.waitForSelector(w, getWaitOptions(pipeConf));
                                found = true;
                              } catch (error) {
                                //console.log("The element didn't appear.")
                              }

                              if(found === true)
                                break;

                            }
                          }
                          await waitFirst();
                    }
                    else if(pipeConf.wait.waitType === 'all'){
                        const raceSelectors = (page, selectors) => {
                            return Promise.race(
                              selectors.map(selector => {
                                return page
                                  .waitForSelector(selector,getWaitOptions(pipeConf))
                                  .then(() => selector);
                              }),
                            );
                          };

                          const selector = await raceSelectors(page, pipeConf.wait.waitSelectors);
                    }
                }   
            }
            
           
        }
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
 * load puppetter wait options
 */
var getWaitOptions = function(pipeConf){
    var waitOptions = {visible: true,timeout:30000};
    if(pipeConf.wait.waitTimeout !== undefined)
        waitOptions.timeout = pipeConf.wait.waitTimeout;
        if(pipeConf.wait.waitVisibility !== undefined)
           waitOptions.visible = pipeConf.wait.waitVisibility;
    return waitOptions;
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