var fs = require("fs");
const cheerio = require("cheerio");
var transform = require("./transform");
const extractDomain = require("extract-domain");
var er = require("./retMessages");
var tpl = require("./templatesJoiner");
const { PRIORITY_BELOW_NORMAL } = require("constants");
const { group } = require("console");


var $ = cheerio.load("");
var result = [];

var loaderType = process.env.LOADERTYPE || 'fileLoader';
var loader = require("./dataLoader/" + loaderType);

var autoParse = async (url, html, parseType, ruleName, version) => {
  try {
    var domain = extractDomain(url);
    var urlFilter = loader.getParseFilter(domain);

    if (urlFilter != undefined && urlFilter != null) {
      //find pipe to apply
      var pipeConf = "";
      for (let i = 0; i < urlFilter.urls.length; i++) {
        const el = urlFilter.urls[i];

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
                  pipeConf = aPipe;
                  break;
                } else if (aPipe.name == ruleName && aPipe.version == version) {
                  pipeConf = aPipe;
                  break;
                }
                 else if (parseType === "direct" && aPipe.name == ruleName && aPipe.version == version) {
                    pipeConf = aPipe;
                break;
                }
              }
        }

         

        if (pipeConf != "") break;
      }

      //RUN PIPE
      if (pipeConf !== "") {
        if (pipeConf.pipes !== null) return await performPipe(pipeConf, html,domain);
        else return er.err("Cannot find any pipe for url: " + url);
      } else return er.err("Cannot find any pipe for url: " + url);
    } else return er.err("Cannot find any url-filter for domain: " + domain);
  } catch (error) {
    return er.err("General error: " + error);
  }
};

//PIPELINE
var performPipe = async (pipeConf, html,domain) => {
  $ = cheerio.load(html);
  var pipeResult = [{}];
  data = [];

  for await (const pipeRule of pipeConf.rules) {
    //Load rule
    var rule = loader.getParseRule(pipeRule);
   
    if (rule != undefined) {
      rule = tpl.applyTemplates(rule,loader,domain,pipeRule.split('/')[0]);
      pipeResult = parse(rule, $);
      data.push(await arrayToJson(pipeResult));
    }
  }

  //Sort output by Key
  var unordered = await arrayToJson(await data);
  const ordered = {};
  Object.keys(unordered)
    .sort()
    .forEach(function (key) {
      ordered[key] = unordered[key];
    });
  return ordered;

  //return   await arrayToJson(await data);
};



//Merge arrays to json
var arrayToJson = async function (arr) {
  const json = {};
  arr.forEach((obj1) => {
    Object.keys(obj1).forEach((key) => (json[key] = obj1[key]));
  });
  return json;
};

//Get all nodes from selectors list
var getNodes = function (selectors) {
  for (s in selectors) {
    var nodes = $(selectors[s]);
    if (nodes.length > 0) {
      return nodes;
    }
  }
  return [];
};

//Get first node from selectors list
var getFirstNode = function (selectors) {
  for (s in selectors) {
    var node = $(selectors[s]);
    if (node.length > 0) return node;
  }
  return [];
};

//Return value for html Element
var getNodeValue = function (
  type,
  attrName,
  node,
  counts,
  staticVal,
  emptyVal
) {
  try {
    if (type == "text") {
      return emptyValueCheck($(node).text(), emptyVal);
    } else if (type == "attribute") {
      return emptyValueCheck($(node).attr(attrName), emptyVal);
    } else if (type == "html") {
      return emptyValueCheck($(node).html(), emptyVal);
    } else if (type == "count") {
      return emptyValueCheck(counts, emptyVal);
    } else if (type == "static") {
      return staticVal;
    } else return "type not valid";
  } catch (error) {
    return "error";
  }
};

//Return custom value or blank if value is invalid or empty
var emptyValueCheck = function (value, customVal) {
  if (value == (undefined || null || "" || isNaN(value))) {
    // value == undefined || value == null || isNaN(value) || value == "" ) {
    if (customVal === undefined) customVal = "";
    return customVal;
  } else return value;
};

//Generate key/val json ok
var keyValJson = function (key, value) {
  var o = {};

  //check if numeric
  var num = value * 1;
  if (!isNaN(num)) o[key] = num;
  else o[key] = value;

  //check boolean
  if (value != undefined) {
    var vl = value.toString().toLowerCase();
    if (vl == "true") o[key] = true;
    else if (vl == "false") o[key] = false;
  }

  //check empty array
  if (value != undefined) {
    if (Array.isArray(value)) {
      if (value.length <= 0) {
        o[key] = [];
      }
    }
  }

  return o;
};

var parseBasic = function (item) {
  var node = getFirstNode(item.css.selectors);
  var value = getNodeValue(
    item.css.returnType,
    item.css.attributeTag,
    node,
    0,
    item.staticVal,
    item.emptyValueCustomVal
  );
  value = transform.transform(value, item.transform, result);
  return keyValJson(item.name, value);
};
var parseMultiple = function (item) {
  //get all nodes
  var nodes = getNodes(item.css.selectors);

  //Apply rule
  var values = [];
  $(nodes).each(function (i, node) {
    var value = getNodeValue(
      item.css.returnType,
      item.css.attributeTag,
      $(node),
      0,
      item.staticVal,
      item.emptyValueCustomVal
    );
    if(value !== "")
      values.push(transform.transform(value, item.transform, result));
  });

  return keyValJson(item.name, values);
};

/** foreach node search attribute except excluded */
var parseMultipleByTag = function (item) {
  //get all nodes
  var nodes = getNodes(item.css.selectors);

  //Apply rule
  var values = {};
  $(nodes).each(function (i, node) {
    var value = getNodeValue(
      item.css.returnType,
      item.css.attributeTag,
      $(node),
      0,
      item.staticVal,
      item.emptyValueCustomVal
    );

    if (value === undefined) value = "";

    item.css.attributeTagKeys.forEach((k) => {
      var key = getNodeValue(
        item.css.returnType,
        k,
        $(node),
        0,
        item.staticVal,
        item.emptyValueCustomVal
      );
      if (key !== undefined) {
        if (!item.css.exclude.includes(key)) {
          values[key] = transform.transform(value, item.transform, result);
        }
      }
    });
  });
  return keyValJson(item.name, values);
};

/** foreach node search attribute except excluded */
var parseMultipleKeyVal = function (item) {
  //get all nodes
  var nodes = getNodes(item.css.selectors);

  //Apply rule
  var values = {};
  $(nodes).each(function (i, node) {
    
    var keyNode = $(node).find(item.css.keySelector);
    var key = getNodeValue(
      item.css.returnType,
      item.css.attributeTag,
      $(keyNode),
      0,
      item.staticVal,
      item.emptyValueCustomVal
    );

    var valueNode = $(node).find(item.css.valueSelector);
    var value = getNodeValue(
      item.css.returnType,
      item.css.attributeTag,
      $(valueNode),
      0,
      item.staticVal,
      item.emptyValueCustomVal
    );

    if (value === undefined) value = "";

    var _key = item.name + '/' + key;
    key = transform.transform(key, item.transform, result);
    if(item.css.removeKeySpaces === true)
       key = key.replace(' ','');
    values[key] = transform.transform(value, item.transform, result);;

  });
  return keyValJson(item.name, values);
};

var parseSubFields = function (item) {
  //get all nodes
  var nodes = getNodes(item.css.selectors);

  var data = [];
  //Apply rule
  $(nodes).each(function (i, node) {
    var subFields = [];
    if (item.fields !== undefined) {
      item.fields.forEach(function (field) {
        //var node = getFirstNode(field.css.selectors);
        var value = getNodeValue(
          field.css.returnType,
          field.css.attributeTag,
          node,
          nodes.length,
          field.staticVal,
          field.emptyValueCustomVal
        );
        value = transform.transform(value, field.transform, result);
        subFields.push(keyValJson(field.name, value));
      });
    }
    data.push(subFields);
  });

  return keyValJson(item.name, data);
};

//SINGLE RULE PARSE
var parse = (rule, $) => {
  result = [];
  groups = {};
  //Fields
  if (rule.data !== undefined) {
    rule.data.forEach(function (item) {
      var val = undefined;
      if (item.type == "basic") {
        val = parseBasic(item);
      } else if (item.type == "multiple") {
        val = parseMultiple(item);
      } else if (item.type == "multipleByTag") {
        val = parseMultipleByTag(item);
      } else if (item.type == "multipleKeyVal") {
        val = parseMultipleKeyVal(item);
      } else if (item.type == "subFields") {
        val = parseSubFields(item);
      }

      //grouping
      if (item.name.includes("/")) {
        var steps = item.name.split("/");
        groups = initGroups(steps, groups, steps.length, val[item.name]);
      } else result.push(val);
    });
  }

  if (groups !== {}) result.push(groups);
  return result;
};

/** hierarchical json generator
 *  example: from => "data/test/demo"
 *  to:
 *  { "data" :
 *   "test" :{
 *      "demo":{}
 *   }
 * } *
 */
var initGroups = function (steps, groups, size, val) {
  var k0,
    k1,
    k2,
    k3,
    k4,
    k5 = "";
  steps.forEach(function (gr, i) {
    if (i === 0) {
      if (groups[gr] === undefined) groups[gr] = {};
    } else if (i === 1) {
      k0 = Object.keys(groups)[0];
      if (size === i + 1) groups[k0][gr] = val;
    } else if (i === 2) {
      k1 = Object.keys(groups[k0])[0];
      if (size === i + 1) groups[k0][k1][gr] = val;
    } else if (i === 3) {
      k2 = Object.keys(groups[k0][k1])[0];
      if (size === i + 1) groups[k0][k1][k2][gr] = val;
    } else if (i === 4) {
      k3 = Object.keys(groups[k0][k1][k2])[0];
      if (size === i + 1) groups[k0][k1][k2][k3][gr] = val;
    } else if (i === 5) {
      k4 = Object.keys(groups[k0][k1][k2][k3])[0];
      var keys = Object.keys(groups);
      if (size === i + 1) groups[k0][k1][k2][k3][k4][gr] = val;
    } else if (i === 6) {
      k5 = Object.keys(groups[k0][k1][k2][k3][k4])[0];
      var keys = Object.keys(groups);
      if (size === i + 1) groups[k0][k1][k2][k3][k4][k5][gr] = val;
    }
  });
  return groups;
};

/** Load Html and run pipe by type */
var testRunner = async function(url, html, parseType, ruleName, version){
  var axios = require('axios');
  var domain = extractDomain(url);
  var data = {};
  await axios.get(url, {
    headers: {
      Referer: domain,
      'X-Requested-With': 'XMLHttpRequest'
    }
  }).catch(async function (error) {
    return {"error": error};
  }).then(async function (response) {
      
      if (parseType === "auto" ){
        data = await autoParse(url,response.data,'auto','','');
      }          
      else  {
        data = await  autoParse(url,response.data,'direct',ruleName,version)
      } 
    });
    return data;
}

module.exports = {
  performPipe: performPipe,
  autoParse: autoParse,
  testRunner:testRunner
};
