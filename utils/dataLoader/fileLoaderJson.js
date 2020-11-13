var fs = require('fs');
var confPath = process.env.CONFPATH || process.env.PWD + '/data/';

    

    var getParseFilter = (domain) => {
        try {
            var parseFilter = confPath + domain + '/url-filters.json';
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
            var rPath = confPath;
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
            var tpl = confPath + domain + '/templates/transform.json';
            var data = fs.readFileSync(tpl);
            return JSON.parse(data);
        } catch (error) {
            return undefined;
        }
        
    };

    var getFieldTemplates =  (domain) => {
        try {
            var tpl = confPath + domain + '/templates/fields.json';
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