
var err = function(msg){

    if(msg != ""){
        return {"error" : true,"errorMessage" : msg}
    }
    else  return{"error" : false,"errorMessage" : ""}

}
var ok = function(json){

    var m = {"error" : false,"errorMessage" : ""}
    return Object.assign(m,json);
}
var okmsg = function(msg){
 return {"error" : false,"errorMessage" : msg}
}

module.exports = {
    err  : err,
    ok : ok,
    okmsg : okmsg
}