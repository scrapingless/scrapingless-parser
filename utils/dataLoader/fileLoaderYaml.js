var fs = require('fs');
const yaml = require('js-yaml');
var confPath = process.env.CONFPATH || process.env.PWD + '/data/';

    

    var getParseFilter = (domain) => {
        try {
            var parseFilter = confPath + domain + '/url-filters.yaml';
            var data = yaml.safeLoad(fs.readFileSync(parseFilter));
            return data;
        } catch (error) {
            return JSON.stringify({
                "status": "error",
                "message": "cannot load " + domain + '/url-filters.yaml',
                "stack": error
            });
        }
        
        
    };

    var getParseRule =  (name)=> {
        try {
            var rPath = confPath;
            var file = rPath +  name + '.yaml';            
            var data = yaml.safeLoad(fs.readFileSync(file));
            return data;
        } catch (error) {
            return JSON.stringify({
                "status": "error",
                "message": "cannot load " + domain + '/url-filters.yaml',
                "stack": error
            });
        }
    };

    
    var getTransformTemplates = (domain) => {
        try {
            var tpl = confPath + domain + '/templates/transform.yaml';
            var data = yaml.safeLoad(fs.readFileSync(tpl));
            return data;
        } catch (error) {
            return undefined;
        }
        
    };

    var getFieldTemplates =  (domain) => {
        try {
            var tpl = confPath + domain + '/templates/fields.yaml';
            var data = yaml.safeLoad(fs.readFileSync(tpl));
            return data;
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