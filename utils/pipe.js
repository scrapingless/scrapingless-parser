
const extractDomain = require("extract-domain");


var loaderType = process.env.LOADERTYPE || 'fileLoaderYaml';
var loader = require("./dataLoader/" + loaderType);

var getPipeConf = async (url,parseType,ruleName,version) => {
  try {
    var domain = extractDomain(url);
    var urlFilter = loader.getParseFilter(domain);

    if (urlFilter !== undefined && urlFilter !== null) {
      //find pipe to apply
      var pipeConf = "";
      var x = urlFilter['filters'];
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

        /*if(urlMatch === true){
            for (let y = 0; y < el.pipes.length; y++) {
                var aPipe = el.pipes[y];
    
                if (parseType === "auto" && aPipe.default === true) {
                    pipeConf = el;
                    pipeConf = {...el,...aPipe};
                    delete pipeConf.pipes;
                    break;
                } else if (aPipe.name == ruleName && aPipe.version == version) {
                    pipeConf = el;
                    pipeConf = {...el,...aPipe};
                    delete pipeConf.pipes;
                    break;
                }
                 else if (parseType === "direct" && aPipe.name == ruleName && aPipe.version == version) {
                   pipeConf = el;
                    pipeConf = {...el,...aPipe};
                    delete pipeConf.pipes;
                    break;
                }
              }
        }*/

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
