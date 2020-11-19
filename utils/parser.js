var fs = require("fs");
const cheerio = require("cheerio");
var transform = require("./transform");
var er = require("./retMessages");
var tpl = require("./templatesJoiner");
var defTypes = require("./defaultTypes");
const { PRIORITY_BELOW_NORMAL } = require("constants");
const { group } = require("console");


var $ = cheerio.load("");
var result = [];

var loaderType = process.env.LOADERTYPE || 'fileLoaderYaml';
var loader = require("./dataLoader/" + loaderType);



var autoParse = async (url, html, pipeConf) => {
  try {
   
      //RUN PIPE
      if (pipeConf !== undefined || pipeConf !== "") {
        if (pipeConf.scrapers !== null) {
          return await performPipe(pipeConf, html,pipeConf.domain);
        }
        else return er.err("Cannot find any pipe for url: " + url);
      } else return er.err("Cannot find any pipe for url: " + url);
  } catch (error) {
    return er.err("General error: " + error);
  }
};


//PIPELINE
var performPipe = async (pipeConf, html,domain) => {
  $ = cheerio.load(html);
  var pipeResult = [{}];
  data = [];

  for await (const pipeRule of pipeConf.scrapers) {
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

//Get first node from selectors list
var getFirstNodeCustom = function (selectors,node) {
  for (s in selectors) {
    var node = $(node).find(selectors[s]);
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
  if (value === (undefined || null || "" || isNaN(value) || '')) {
  //if ( value === undefined || value === null || isNaN(value) || value === "" ) {
    if (customVal === undefined) 
       customVal = "";
    return customVal;
  } 
  else 
  return value;
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
  var node = getFirstNode(item.selectors);
  var value = getNodeValue(
    item.returnType,
    item.attributeTag,
    node,
    0,
    item.staticVal,
    item.emptyVal
    
  );
  value = transform.transform(value, item.transform, result);
  return keyValJson(item.name, value);
};
var parseMultiple = function (item) {
  //get all nodes
  var nodes = getNodes(item.selectors);

  //Apply rule
  var values = [];
  $(nodes).each(function (i, node) {
    var value = getNodeValue(
      item.returnType,
      item.attributeTag,
      $(node),
      0,
      item.staticVal,
      item.emptyVal
    );
    if(value !== "")
      values.push(transform.transform(value, item.transform, result));
  });

  return keyValJson(item.name, values);
};

/** foreach node search attribute except excluded */
var parseMultipleByTag = function (item) {
  //get all nodes
  var nodes = getNodes(item.selectors);

  //Apply rule
  var values = {};
  $(nodes).each(function (i, node) {
    var value = getNodeValue(
      item.returnType,
      item.attributeTag,
      $(node),
      0,
      item.staticVal,
      item.emptyVal
    );

    if (value === undefined) value = "";

    item.attributeTagKeys.forEach((k) => {
      var key = getNodeValue(
        item.returnType,
        k,
        $(node),
        0,
        item.staticVal,
        item.emptyVal
      );
      if (key !== undefined) {
        if (!item.exclude.includes(key)) {
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
  var nodes = getNodes(item.selectors);

  //Apply rule
  var values = {};
  $(nodes).each(function (i, node) {
    
    var keyNode = $(node).find(item.keySelector);
    var key = getNodeValue(
      item.returnType,
      item.attributeTag,
      $(keyNode),
      0,
      item.staticVal,
      item.emptyVal
    );

    var valueNode = $(node).find(item.valueSelector);
    var value = getNodeValue(
      item.returnType,
      item.attributeTag,
      $(valueNode),
      0,
      item.staticVal,
      item.emptyVal
    );

    if (value === undefined) value = "";

    var _key = item.name + '/' + key;
    key = transform.transform(key, item.transform, result);
    if(item.removeKeySpaces === true)
       key = key.replace(' ','');
    values[key] = transform.transform(value, item.transform, result);;

  });
  return keyValJson(item.name, values);
};

var parseSubFields = function (item) {
  //get all nodes
  var nodes = getNodes(item.selectors);

  var data = [];
  //Apply rule
  $(nodes).each(function (i, node) {
    var subFields = [];
    if (item.fields !== undefined) {
      item.fields.forEach(function (field) {
        
        field = defTypes.applyDefaults("basic",field);
        var n = node;
        if(field.selectors !== undefined && field.selectors.length > 0)
          n = getFirstNodeCustom(field.selectors,node);
        
        var value = getNodeValue(
          field.returnType,
          field.attributeTag,
          n,
          nodes.length,
          field.staticVal,
          field.emptyVal
        );

        if(field.transform !== undefined && field.transform.length > 0){
          value = transform.transform(value, field.transform, result);
        }

        
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
        val = parseBasic(defTypes.applyDefaults("basic",item));
      } else if (item.type == "multiple") {
        val = parseMultiple(defTypes.applyDefaults("multiple",item));
      } else if (item.type == "multipleByTag") {
        val = parseMultipleByTag(defTypes.applyDefaults("multipleByTag",item));
      } else if (item.type == "multipleKeyVal") {
        val = parseMultipleKeyVal(defTypes.applyDefaults("multipleKeyVal",item));
      } else if (item.type == "subFields") {
        val = parseSubFields(defTypes.applyDefaults("subFields",item));
      }

      if(val[item.name] === undefined)
        val[item.name] = "";

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


module.exports = {
  performPipe: performPipe,
  autoParse: autoParse
};
