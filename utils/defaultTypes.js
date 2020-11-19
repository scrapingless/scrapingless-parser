var _ = require('underscore');

var basic = {
    "type": "basic",
    "css": {
      "returnType": "",
      "selectors": [],
      "attributeTag":""
    },
    "staticVal": "",
    "emptyVal": "",
    "transform": []
};

var multipleByTag = {
    "type" : "multipleByTag",           
    "css":{
        "selectors": [],
        "returnType" : "",
        "attributeTag" : "",
        "attributeTagKeys" : [],
        "exclude": []
    },
    "transform" : [  
    ]
};

var multipleKeyVal = {
    "type": "multipleKeyVal",
    "css": {
        "returnType": "",            
        "selectors": [],
        "keySelector" : "",
        "valueSelector" : "",
        "removeKeySpaces" : true
    },
    "emptyVal": "",
    "transform": [
    
    ]
};

var subFields = {
    "type": "subFields",
        "css": {
        "returnType": "",
        "attributeTag": "",
        "selectors": ["h2"]
    },
    "fields": [
    ],
    "transform": [
    
    ]
};



var applyDefaults = (type,data) =>{
 
    if(type === "basic" || type === "multiple")
        return _.extend({},basic,data);
    else if (type === "multipleByTag")
        return _.extend({},multipleByTag,data);
    else if (type === "multipleKeyVal")
        return _.extend({},multipleKeyVal,data);     
    else if (type === "subFields")
        return _.extend({},subFields,data);      
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