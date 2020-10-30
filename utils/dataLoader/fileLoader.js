var fs = require('fs');
var conf = require('../../config.json');


    

    var getParseFilter = (domain) => {
        try {
            var parseFilter = conf.config.dataPath + domain + '/url-filters.json';
            var data = fs.readFileSync(parseFilter);
            return JSON.parse(data);
        } catch (error) {
            return JSON.stringify({
                "status": "error",
                "message": "cannot load " + domain + '/url-filters.json',
                "stack": error
            });
        }
        
        
    };

    var getParseRule =  (name)=> {
        try {
            var rPath = conf.config.dataPath;
            var jsonFile = rPath +  name + '.json';            
            var data = fs.readFileSync(jsonFile);
            return JSON.parse(data);
        } catch (error) {
            return JSON.stringify({
                "status": "error",
                "message": "cannot load " + domain + '/url-filters.json',
                "stack": error
            });
        }
    };

    
    var getTransformTemplates = (domain) => {
        try {
            var tpl = conf.config.dataPath + domain + '/templates/transform.json';
            var data = fs.readFileSync(tpl);
            return JSON.parse(data);
        } catch (error) {
            return undefined;
        }
        
    };

    var getFieldTemplates =  (domain) => {
        try {
            var tpl = conf.config.dataPath + domain + '/templates/fields.json';
            var data = fs.readFileSync(tpl);
            return JSON.parse(data);
        } catch (error) {
            return undefined;
        }
        
    };

   
 module.exports = {
    getParseFilter:getParseFilter,
    getParseRule : getParseRule,
    getTransformTemplates: getTransformTemplates,
    getFieldTemplates:getFieldTemplates
}