const conf = require("../config.json").config;
const puppeteer = require('puppeteer');

var loadBrowser = async function(timeout){

    let browser = undefined;

    if(timeout !== undefined){
        conf.scraper.timeout = timeout;
    }

    //endpoint or local
    if (
      conf.scraper.puppeteerEndPoint !== undefined &&
      conf.scraper.puppeteerEndPoint !== "" &&
      conf.scraper.puppeteerEndPoint !== {}
    ) {
      conf.scraper.puppeteerLaunchConf.browserWSEndpoint =
        conf.scraper.puppeteerEndPoint;
      browser = await puppeteer.connect(conf.scraper.puppeteerLaunchConf);
    } else browser = await puppeteer.launch(conf.scraper.puppeteerLaunchConf);

    return browser;
}

/**
 * Apply Wait for by configuration
 */
var waitFor = async function(pipeConf,page){
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

module.exports = {
    loadBrowser,
    waitFor
  };
  