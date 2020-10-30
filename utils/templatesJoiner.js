
var applyTemplates =  function(rule,loader,domain,lev0){

    var ruleTemplate =  loader.getFieldTemplates(lev0);
    if(ruleTemplate !== undefined)
        rule = overwriteRule(rule,ruleTemplate);

    var ttr =  loader.getTransformTemplates(lev0);
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
                f.name = el.name;
                f.css.selectors = el.selectors;

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

/** Replace template name with real config object  */
var overwriteTransform = function(rule,ttr){
    var data = [];
  
    rule.data.forEach(el => {
        var tr =[];
  
        if(el.transform !== undefined){
            el.transform.forEach(transformation => {
                var exist= false;
                if (typeof transformation === 'string' || transformation instanceof String){
                  if(ttr[transformation] !== undefined){            
                    tr.push(ttr[transformation]);           
                  }   
                  //else tr.push(transformation);
                }
                else tr.push(transformation);
        
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