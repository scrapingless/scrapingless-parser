const conf = require("../config.json").config;
const { URL } = require("url");
const fse = require("fs-extra"); // v 5.0.0
const fs = require("fs");
const path = require("path");
const stringHash = require("string-hash");
const { err } = require("./retMessages");
var br = require("./puppeteerBrowser");
var dateDiff = require("date-diff");
const cheerio = require("cheerio");

/**
 * Download page in file cache
 */
var getPageCache = async function (url, force, pipeConf, enableJs = true) {
  var urlHash = stringHash(url);
  var cacheFolder = path.resolve("./public/cache/") + "/" + urlHash;
  var cacheRelativePath = "cache/" + urlHash + "/";

  //check cache exist and time
  var cached = true;
  if (fs.existsSync(cacheFolder)) {
    const { birthtime } = await fs.statSync(cacheFolder);
    var diff = new dateDiff(Date.now(), birthtime);
    if (conf.offlineDownloader.cacheUrlMinutes < diff.minutes()) cached = false;
  } else cached = false;

  if (force !== undefined) {
    if (force === true || force === "true") cached = false;
  }

  //clean and process
  if (!cached) {
    await fse.remove(cacheFolder);
    await offline(url, cacheFolder, cacheRelativePath, pipeConf, enableJs,urlHash);
    return {
      downloaded: cacheFolder,
      link: "/cache/" + urlHash + "/index.html",
    };
  } else
    return {
      downloaded: "already in cache:" + urlHash,
      link: "/cache/" + urlHash + "/index.html",
    };
};

/** Clean all cache */
var cleanAllCache = async function (url, force) {
  var cacheFolder = path.resolve("./public/cache/");
  await fse.emptyDir(cacheFolder);
  return { status: "all cache cleaned" };
};

/**
 * Download url resources offline
 */
var offline = async function (url, cacheFolder, cacheRelativePath, pipeConf,enableJs,urlHash) {
  let browser = await br.loadBrowser(60000);
  let page = await browser.newPage();

  //https://developers.google.com/web/tools/puppeteer/articles/ssr
  // 1. Intercept network requests.
  //await page.setRequestInterception(true);

  /*page.on('request', req => {
    // 2. Ignore requests for resources that don't produce DOM
    // (images, stylesheets, media).
    const allowlist = ['document', 'script', 'xhr', 'fetch'];
    if (!allowlist.includes(req.resourceType())) {
      return req.abort();
    }

    // 3. Pass through all other requests.
    req.continue();
  });*/ 

  if (enableJs === false) await page.setJavaScriptEnabled(false);

  const stylesheetContents = {};
  var data = [];

  page.on("response", async (response) => {
    const responseUrl = new URL(response.url());
    var pathname = responseUrl.pathname;
    let filePath = path.resolve(`${cacheFolder}${pathname}`);
 
    
    if ([200, 201, 304].includes(response.status())  ) {
      /*
          const sameOrigin = new URL(responseUrl).origin === new URL(url).origin;
          const isStylesheet = response.request().resourceType() === 'stylesheet';
          if (sameOrigin && isStylesheet) {
            stylesheetContents[responseUrl] = await response.text();
          }
       */

      //save data to replace into HTML
      if (!pathname.includes("#") && !pathname.endsWith(".html") && !pathname.endsWith(".htm") && pathname !== "/") {
        if (pathname.startsWith("/")) {
          pathname = pathname.substring(1);
        }
        var to = cacheRelativePath + pathname;      

        if (!to.startsWith("/")) to = "/" + to; 
          to = to.replace("//", "/");

        //console.log('from: ' + pathname + ' => to: ' + to + ' ---- ' +response.url());
        data.push({ from: response.url(), to: to });
      }

      //save offline data
      try {
        console.log(pathname,urlHash)
        if(!filePath.includes('+')  && pathname !== ''  && pathname !== '/' && pathname !== urlHash){
          var buf = await response.buffer();

          await fse.outputFile(filePath, buf, (err) => {
            if (err != null) console.log("FS: " + err + " --> " + filePath); // => null
          });
        }
        
      } catch (error) {
         // console.error(resource.url());
      }
    } 
  });

  await page.goto(url, { waitUntil: "networkidle2" });
  if(pipeConf !== undefined)
    await br.waitFor(pipeConf,page);

  //Inline the CSS.
  // Replace stylesheets in the page with their equivalent <style>.
  /*await page.$$eval('link[rel="stylesheet"]', (links, content) => {
    links.forEach(link => {
      const cssText = content[link.href];
      if (cssText) {
        const style = document.createElement('style');
        style.textContent = cssText;
        link.replaceWith(style);
      }
    });
  }, stylesheetContents);*/

 
  var html = await page.content();
  await page.close();
  await browser.close();

  //replace html data
  data.push({ from: "main.ced65300.js", to: "___" });
  data.forEach((el) => {
    html = html.replace(el.from, el.to);
  });

  

  /* 4 
  setTimeout(async () => {
    await browser.close();
  }, 5000);*/

  //save index.html
  await fse.outputFile(cacheFolder + "/index.html", html);
};



module.exports = {
  getPageCache,
  cleanAllCache,
};
