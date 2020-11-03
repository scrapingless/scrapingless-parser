var axios = require('axios');
var url = "http://www.amazon.com/Harry-Potter-Sorcerers-Stone-MinaLima/dp/1338596705";
var parseUrl = "http://localhost:8080/parse/direct?ruleName=bookDemo&version=0.1&url=" + url;


axios.get(url, {
  headers: {
    Referer: 'http://www.amazon.com',
    'X-Requested-With': 'XMLHttpRequest'
  }
}).then(function (response) {

    axios.post(
        parseUrl,
        response.data,
        {
            headers: {                 
                'Content-Type' : 'text/plain' 
            }
        }).then(function(res){
            console.log(res.data);
        });
    
  });