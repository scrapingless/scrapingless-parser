const conf = require("../config.json").config;
const { URL } = require("url");
const fse = require("fs-extra"); // v 5.0.0
const fs = require("fs");
const path = require("path");
const stringHash = require("string-hash");
const { err } = require("./retMessages");
var br = require("./puppeteerBrowser");
var dateDiff = require('date-diff');


/** 
 * Download page in file cache
 */
var getPageCache = async function (url,force,pipeConf) {
  var urlHash = stringHash(url);
  var cacheFolder = path.resolve("./public/cache/") + "/" + urlHash;
  var cacheRelativePath = "cache/" + urlHash + "/";

  //check cache exist and time
  var cached = true;
  if(fs.existsSync(cacheFolder)){
      const { birthtime } = await fs.statSync(cacheFolder);
      var diff = new dateDiff(Date.now(), birthtime);
      if(conf.offlineDownloader.cacheUrlMinutes < diff.minutes())
        cached = false;
  }
  else cached = false;

  if(force !== undefined){
    if(force === true || force === 'true')
      cached = false;
  }

  //clean and process
  if(!cached){
    await fse.remove(cacheFolder); 
    await offline(url, cacheFolder, cacheRelativePath,pipeConf);
    return { "downloaded": cacheFolder, "link" : '/cache/' + urlHash + '/index.html'};
  }
  else return { "downloaded": "already in cache:" + urlHash,"link" : '/cache/' + urlHash + '/index.html' };
  
  
};

var cleanAllCache = async function (url,force) {
  var cacheFolder = path.resolve("./public/cache/")
  await fse.emptyDir(cacheFolder);
  return {"status" : "all cache cleaned"};
}

/**
 * Download url resources offline
 */
var offline = async function (url, cacheFolder, cacheRelativePath) {
  let browser = await br.loadBrowser(60000);
  let page = await browser.newPage();

  //var invalidChars = ["\\", ":", "*", '"', "<", ">", "|"];

  page.on("response", async (response) => {
      const url = new URL(response.url());
      var pathname = url.pathname;
      let filePath = path.resolve(`${cacheFolder}${pathname}`);

      var buf = await response.buffer();

      await fse.outputFile(filePath, buf, (err) => {
        if (err != null) console.log("FS: " + err + " --> " + filePath); // => null
      });
  
  });

  await page.goto(url);
  //await br.waitFor(pipeConf,page);

  //html replace relative reference with local cache
  var html = await page.evaluate(() => document.querySelector("*").outerHTML);
  html = html.replace(new RegExp('href="/', "g"),'href="/' + cacheRelativePath);
  html = html.replace(new RegExp('src="/', "g"), 'src="/' + cacheRelativePath);
  html = html.replace(new RegExp("href='/", "g"),"href='/" + cacheRelativePath);
  html = html.replace(new RegExp("src='/", "g"), "src='/" + cacheRelativePath);
  await fse.outputFile(cacheFolder + "/index.html", html);

  //TODO
  /***
   * Search all broken href (es. assets/style.css => is api/assets/style.css)
   * Cors XHR FIX
   */

  /* 4 
  setTimeout(async () => {
    await browser.close();
  }, 5000);*/

  await page.close();
  await browser.close();
};


module.exports = {
  getPageCache,
  cleanAllCache
};
