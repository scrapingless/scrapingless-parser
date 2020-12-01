const puppeteer = require('puppeteer');

async function initializeCDP(page) {
  const client = await page.target().createCDPSession();

}

var test = async function(url){
    const browser = await puppeteer.launch({
        headless:false, 
        defaultViewport:null,
        devtools: true,
      });
      const wsEndpoint = browser.wsEndpoint();
      
    
      const page = (await browser.pages())[0];
      
      //const page = await browser.newPage();
      await page.goto(url);
      const pageId = page.target()._targetId;

      const pageTargeUrl = `${wsEndpoint.replace('ws://', '').match(/.*(?=\/browser)/)[0]}/page/${pageId}`
    console.log(pageTargeUrl);

    // build the full debugging url for the page I want to inspect
    const pageDebuggingUrl = `chrome-devtools://devtools/bundled/devtools_app.html?ws=${pageTargeUrl}`;

    console.log(pageDebuggingUrl);
       // open the debugging UI in a new tab that Puppeteer can interact with
    const devtoolsPage = await browser.newPage();
    await devtoolsPage.goto(pageDebuggingUrl);
    await devtoolsPage.bringToFront();
      //await initializeCDP(page);
    
     /* browser.on('targetcreated', async (target) => {
        const page = await target.page();
        await initializeCDP(page);
      })*/
}

module.exports = {
    test
  };