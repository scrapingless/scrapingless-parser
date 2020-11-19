
var _ = require('underscore');
var applyTemplates =  function(rule,loader,domain,lev0){

   
    var ruleTemplate =  loader.getTemplates(lev0,'fields');
    if(ruleTemplate !== undefined)
        rule = overwriteRule(rule,ruleTemplate);

    var ttr =  loader.getTemplates(lev0,'transform');
    if(ttr !== undefined)
        rule = overwriteTransform(rule,ttr);

    return rule;
}

var overwriteRule = function(rule,ruleTemplate){
    var validTypes = ["basic","multiple", "multipleByTag","multipleKeyVal","subFields"];
    var data = [];
   
    rule.data.forEach(el => {
   
        if(!validTypes.includes(el.type)){
             
            //template exist
            var f = JSON.parse(JSON.stringify(ruleTemplate[el.type]));
            if(f !== undefined){    
                //f.transform = f.transform.push(el.transform);
                f = _.extend({},el,f);        
                //f.name = el.name;
                //f.selectors = el.selectors;

                if(f.transform === undefined)
                    f.transform = [];
                if(el.transform === undefined)
                    el.transform = [];
                
                el.transform.forEach(tr => {
                    f.transform.push(tr);
                });
                
                data.push(f);
            }
            else data.push(el);
        }
        else data.push(el);

    });
    rule.data = data;
    return rule;
}

/**
 * Recursive Transformation templates override
 * @param {} transformation 
 * @param {*} ttr 
 */
var applyTransform = function(transformation,ttr){
    var tr =[];
    var key = Object.keys(transformation)[0];
  
    if(key === '0'){
        tr.push(ttr[transformation]);
    }
    else if(key !== 'rule'){
        tr.push( _.extend({},ttr[key],transformation[key])); 
    }
    else tr.push(transformation);
   
    return tr;
}

var overwriteTransformSubFields = function(el,ttr){
    if(el.type === "subFields"){
        var fields =[];
        el.fields.forEach(field => {
            if(field.transform !== undefined){
                
                var fieldTr = [];
                field.transform.forEach(ftr => {

                    tmpTr = applyTransform(ftr,ttr)[0];
                  

                    var subTr = [];
                    if(tmpTr.transform !== undefined){
                        tmpTr.transform.forEach(t => { 
                            subTr.push(applyTransform(t,ttr)[0]);
                        });
                        tmpTr.transform= subTr;
                    }

                    fieldTr.push(tmpTr);
                    //tmp.push(overwriteTransform( {"data": [{"transform" : [ftr]}] },ttr).data[0].transform);
                });
                
                
                field.transform = fieldTr;
                fields.push(field);
            }
            else fields.push(field);
                
        });
        el.fields = fields;
    }
    return el;
}

/** Replace template name with real config object  */
var overwriteTransform = function(rule,ttr){
    var data = [];
  
    rule.data.forEach(el => {
        var tr =[];
  
        el = overwriteTransformSubFields(el,ttr);
        if(el.transform !== undefined){
            el.transform.forEach(transformation => {

                if(transformation.transform !== undefined){
                    transformation.transform = applyTransform(transformation.transform,ttr);
                }   

                tr.push(applyTransform(transformation,ttr)); 
                    
            });
            el.transform = tr;
            data.push(el);
        }
        else {
            el.transform = [];
            data.push(el);
        }
        
    });
    rule.data = data;
    return rule;
  }

module.exports = {
    overwriteTransform: overwriteTransform,
    applyTemplates : applyTemplates
}