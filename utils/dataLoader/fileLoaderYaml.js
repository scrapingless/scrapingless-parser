var fs = require('fs');
var glob = require('glob');
const yaml = require('js-yaml');
var _ = require('underscore');

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

    

    var getTemplates =  (domain,type) => {
        try {

            var data = {};
           // glob.sync(path, {}, (err, files)=>{fieldsFiles=files;});
            var files = glob.sync(confPath + '_templates/'+type+'/*.yaml');
            files.forEach(file => {
                var globalTemplate = yaml.safeLoad(fs.readFileSync(file));
                data =  _.extend({},data,globalTemplate);
            });

           
            var localTemplate = yaml.safeLoad(fs.readFileSync(confPath + domain + '/templates/'+type+'.yaml'));
            data =  _.extend({},data,localTemplate);
            return data;
        } catch (error) {
            return undefined;
        }
        
    };

   
 module.exports = {
    getParseFilter:getParseFilter,
    getParseRule : getParseRule,
    getTemplates
}