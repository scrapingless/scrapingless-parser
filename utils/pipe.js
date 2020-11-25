
const extractDomain = require("extract-domain");

/** 
 * Define witch configuration loader use
 * Default: yamlLoader
 * TODO: create loader for mongodb or other databases 
 */
var loaderType = process.env.LOADERTYPE || 'yamlLoader';
var loader = require("./dataLoader/" + loaderType);


/**
 * Load pipe to run 
 */
var getPipeConf = async (url,parseType,ruleName,version) => {
  try {
    var domain = extractDomain(url);
    var urlFilter = loader.getParseFilter(domain);

    if (urlFilter !== undefined && urlFilter !== null) {
      //find pipe to apply
      var pipeConf = "";
      for (let i = 0; i < urlFilter.filters.length; i++) {
        const el =  urlFilter.filters[i];

        var urlMatch = false; 
        var re = new RegExp(el.filter, "gim");

        if(url.match(re))
          urlMatch = true;
        

        if(parseType === "direct")
            urlMatch = true;

        if(urlMatch === true){
          pipeConf = urlFilter.pipes[el.pipe];
          pipeConf.domain = domain;
          pipeConf.browser = el.browser; 
        }

        
        if (pipeConf !== "") {            
            return pipeConf;
        }
          
      }
      return undefined;
    }

  } catch (error) {
    return undefined;
  }
 
}



module.exports = {
  getPipeConf: getPipeConf
};
