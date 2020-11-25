var _ = require('underscore');

/***
 * Define default values for rules
 */

var basic = {
    "css": {
      "valueType": "",
      "selectors": [],
      "attributeTag":""
    },
    "staticVal": "",
    "emptyVal": "",
    "transform": []
};

var attrFilter = {         
    "css":{
        "selectors": [],
        "valueType" : "",
        "attributeTag" : "",
        "attributeTagKeys" : [],
        "exclude": []
    },
    "transform" : [  
    ]
};

var keyVal = {
    "css": {
        "valueType": "",            
        "selectors": [],
        "keySelector" : "",
        "valueSelector" : "",
        "removeKeySpaces" : true
    },
    "emptyVal": "",
    "transform": [
    
    ]
};

var container = {
        "css": {
        "valueType": "",
        "attributeTag": "",
        "selectors": ["h2"]
    },
    "fields": [
    ],
    "transform": [
    
    ]
};



var applyDefaults = (type,data) =>{
 
    if(type === "basic" || type === "array")
        return _.extend({},basic,data);
    else if (type === "attrFilter")
        return _.extend({},attrFilter,data);
    else if (type === "keyVal")
        return _.extend({},keyVal,data);     
    else if (type === "container")
        return _.extend({},container,data);      
    else return data;
};


var onError = {
    "onerror": {
        "customVal": "",
        "type": "customVal"
      }
};

var applyOnError =(data) => {
    return _.extend({},onError,data);    
};



module.exports = {
    applyDefaults,
    applyOnError
}