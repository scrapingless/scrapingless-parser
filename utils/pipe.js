var fs = require("fs");
const extractDomain = require("extract-domain");
var er = require("./retMessages");
var tpl = require("./templatesJoiner");
const { PRIORITY_BELOW_NORMAL } = require("constants");
const { group } = require("console");


var loaderType = process.env.LOADERTYPE || 'fileLoaderYaml';
var loader = require("./dataLoader/" + loaderType);

var getPipeConf = async (url,parseType,ruleName,version) => {
  try {
    var domain = extractDomain(url);
    var urlFilter = loader.getParseFilter(domain);

    if (urlFilter !== undefined && urlFilter !== null) {
      //find pipe to apply
      var pipeConf = "";
      for (let i = 0; i < urlFilter.length; i++) {
        const el = urlFilter[i];

        var urlMatch = false;
        for (let x = 0; x < el.regexes.length; x++) {
          const r = el.regexes[x];
          var re = new RegExp(r, "gim");

          if(url.match(re))
            urlMatch = true;
        }

        if(parseType === "direct")
            urlMatch = true;

        if(urlMatch === true){
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
        }

        if (pipeConf != "") {
            pipeConf.domain = domain;
            return pipeConf;
        }
          
      }
    }

  } catch (error) {
    return undefined;
  }
}



module.exports = {
  getPipeConf: getPipeConf
};
