/**
 * Utility for overwrites all transformation templates to a full rule value
 * Substitute each referred template with full configuration
 */
var _ = require('underscore');
var applyTemplates =  function(rule,loader,domain,lev0){

    var ttr =  loader.getTemplates(lev0);
    if(ttr !== undefined)
        rule = overwriteTransform(rule,ttr);

    return rule;
}


/**
 * Apply single transformation overwrite
 */
var applyTransform = function(transformation,ttr){
    var tr =[];
    var key = Object.keys(transformation)[0];
  
    if(key === '0'){
        //tr.push(ttr[transformation]);
        return ttr[transformation];
    }
    else if(key !== 'rule'){
        return _.extend({},ttr[key],transformation[key]);
        //tr.push( _.extend({},ttr[key],transformation[key])); 
    }
    else {
        //tr.push(transformation);
        return transformation;
    }
   
}

/** Apply overwrite for all childs of container rule type */
var overwriteTransformContainer = function(el,ttr){
    if(el.type === "container"){
        var fields =[];
        el.fields.forEach(field => {
            if(field.transform !== undefined){
                
                var fieldTr = [];
                field.transform.forEach(ftr => {

                    tmpTr = applyTransform(ftr,ttr);
                    if(tmpTr !== undefined){
                        var subTr = [];
                        if(tmpTr.transform !== undefined){
                            tmpTr.transform.forEach(t => { 
                                subTr.push(applyTransform(t,ttr));
                            });
                            tmpTr.transform= subTr;
                        }
    
                        fieldTr.push(tmpTr);
                    }
                    else fieldTr.push(ftr);
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
  
        el = overwriteTransformContainer(el,ttr);
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