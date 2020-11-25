var dateFormat = require("dateformat");
var defTypes = require("./defaultTypes");
var value = value;
var rule = rule;

/**
 * Manage single value data transformation using configured "transformation rule"
 */
class DataTr {
  constructor(value, rule, fields) {
    this.value = value;
    this.rule = rule;
    this.fields = fields;
  }

  //Transform value
  process() {
    if (this.rule !== undefined) {
      this.rule.forEach((el) => {
        try {


          switch (el.rule) {
            case "split":
              this.splitOrToArray(defTypes.applyOnError(el));
              break;
            case "appendPrepend":
              this.appendPrepend(defTypes.applyOnError(el));
              break;
            case "boolInvert":
              this.boolInvert(defTypes.applyOnError(el));
              break;
            case "calc":
              this.calc(defTypes.applyOnError(el));
              break;
            case "caseLowerUpper":
              this.caseLowerUpper(defTypes.applyOnError(el));
              break;
            case "checker":
              this.checker(defTypes.applyOnError(el));
              break;
            case "dateConvert":
              this.dateConvert(defTypes.applyOnError(el));
              break;
            case "ifRule":
              this.ifRule(defTypes.applyOnError(el));
              break;
            case "percentConvert":
              this.percentConvert(defTypes.applyOnError(el));
              break;
            case "regexReplace":
              this.regexReplace(defTypes.applyOnError(el));
              break;
            case "trim":
              this.trimmer(defTypes.applyOnError(el));
              break;
            case "subString":
              this.subString(defTypes.applyOnError(el));
              break;

            /*
                            //TODO
                            case "callUrl":
                                    this.callUrl()
                                break;
                            */

            default:
              break;
          }

        

        } catch (error) {
          this.onerror(el);
        }
      });
    }

    return this.value;
  }

  /**
   * Search field (already parsed&transformed) by name
   */
  getField(name) {
    var f = null;
    for (let i = 0; i < this.fields.length; i++) {
      var key = Object.keys(this.fields[i])[0];

      if (key == name) {
        f = this.fields[i];
      }
    }

    return f;
  }

  /** what to do on general error in transformation  */
  onerror(el) {
    if (el.onerror != undefined) {
      if (el.onerror.type == "empty") {
        this.value = "";
      } else if (el.onerror.type == "zero") {
        this.value = 0;
      } else if (el.onerror.type == "original" || el.onerror.type == "skip") {
        //this.value = this.value
      } else if (el.onerror.type == "customVal") {
        this.value = el.onerror.customVal;
      } else if (el.onerror.type == "emptyArray") {
        this.value = [];
      }
    }
  }

  /***
   * Splitting or convert  to array
   */
  splitOrToArray(el) {
    if (el.type == "toArray") {
      this.value = this.value.split(el.splitSeparator).map(function (item) {
        return item.trim();
      });
    } else if (el.type == "getSingleIndex") {
      var data = this.value.split(el.splitSeparator);
      var i = el.index - 1;
      if (data.length > i) {
        this.value = data[i];
      }
    } else if (el.type == "joinMultipleIndexes") {
      var data = this.value.split(el.splitSeparator);
      var v2 = "";
      data.forEach(function (val, i) {
        if (el.multipleIndex.includes(i)) {
          v2 = v2 + val + el.joinSeparator;
        }
      });
      v2 = v2.trimRight(el.joinSeparator);
      this.value = v2;
    }
  }

  /**
   * Append prepend Value from static text or from other source
   *      */
  appendPrepend(el) {
    var val = "";
    if (el.valueType == "static") {
      val = el.value;
    } else if (el.valueType == "fromField") {
      var f = this.getField(el.fieldName);
      if (f != null) this.value = f[el.fieldName];
    }

    if (el.type == "append") {
      this.value = this.value + val;
    } else if (el.type == "prepend") {
      this.value = val + this.value;
    }
  }

  /**
   * Invert bool value
   */
  boolInvert(el) {
    try {
      var vl = this.value.toString().toLowerCase();
      if (vl == "true") {
        return "false";
      } else if (this.value == "false") {
        return "true";
      }
    } catch (error) {}
  }

  /**
   * Some Calcs
   * @param {*} el
   */
  calc(el) {
    try {
      var v = parseFloat(this.value);
      if (!isNaN(v)) {
        //get operands
        var i = 1;
        if (el.argumentType == "static") i = el.argument;
        else if (el.argumentType == "fromField") {
          var f = this.getField(el.fieldName);
          if (f != null) i = f[el.fieldName];
        }
        i = parseFloat(i);

        if (el.operator == "+") {
          this.value = v + i;
        } else if (el.operator == "-") {
          this.value = v - i;
        } else if (el.operator == "*") {
          this.value = v * i;
        } else if (el.operator == "/") {
          this.value = v / i;
        }
      }
    } catch (error) {}
  }

  /** Case sensitive insensitive */
  caseLowerUpper(el) {
    if (el.type == "upper") {
      this.value = this.value.toUpperCase();
    } else if (el.type == "lower") {
      this.value = this.value.toLowerCase();
    } else if (el.type == "capitalize") {
      this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
    }
  }

  /** value type checker */
  checker(el) {
    if (el.type == "double" || el.type == "numeric") {
      if (isNaN(parseFloat(this.value))) this.onerror(el);
    } else if (el.type == "bool") {
      var vl = value.toString().toLowerCase();
      if (vl == "true" || vl == "false" || typeof this.value === "boolean") {
      } else this.onerror(el);
    } else if (el.type == "date") {
      var msec = Date.parse(this.value);
      if (isNaN(msec)) this.onerror(el);
    } else if (el.type == "empty") {
      if (this.value.toString() == "") this.onerror(el);
    }
  }

  /**Convert value (as date) to specific date format */
  dateConvert(el) {
    try {
      var msec = Date.parse(this.value);
      this.value = dateFormat(msec, el.toFormat);
    } catch (error) {
      this.onerror(el);
    }
  }

  /**Conditional Action if > then */
  ifRule(el) {
    //get value from to check
    var val = "";
    if (el.checkType == "customVal") {
      val = el.checkCustomVal;
    } else if (el.checkType == "fieldValue") {
      var f = this.getField(el.fieldName);
      if (f != null) val = f[el.fieldName];
    }

    //Case sensitive?
    var vv = this.value;
    if (el.caseInsensitive == true) {
      val = val.toLowerCase();
      vv = vv.toLowerCase();
    }

    if (val != "") {
      //Execute validate
      if (el.type == "equal") {
        if (vv == val) this.ifApply(el);
      } else if (el.type == "notEqual") {
        if (vv != val) this.ifApply(el);
      } else if (el.type == "startWith") {
        if (vv.startsWith(val)) this.ifApply(el);
      } 
      else if (el.type == "notStartWith") {
        if (!vv.startsWith(val)) this.ifApply(el);
      } else if (el.type == "endsWith") {
        if (vv.endsWith(val)) this.ifApply(el);
      } else if (el.type == "notEndsWith") {
        if (!vv.endsWith(val)) this.ifApply(el);
      } else if (el.type == "contains") {
        if (vv.includes(val)) this.ifApply(el);
      } else if (el.type == "notContains") {
        if (!vv.includes(val)) this.ifApply(el);
      } else if (el.type == "emptyOrNull") {
        if (vv == "") {
          this.ifApply(el);
        } else if (vv == null) {
          this.ifApply(el);
        }
      } else if (el.type == "notEmpty") {
        if (vv != "") {
          this.ifApply(el);
        }
      } else if (el.type == "enabledValues") {
        if (el.caseInsensitive == true) {
          var words = el.checkCustomValues.map((v) => v.toLowerCase());
          if (words.includes(vv)) this.ifApply(el);
        } else {
          if (words.includes(vv)) this.ifApply(el);
        }
      }
    }
  }

  /** Apply the value type only if the ifRule match */
  ifApply(el) {
    if (el.applyType == "customVal") {
      this.value = el.applyCustomVal;
    } else if (el.applyType == "multipleValues") {
      this.value = el.applyCustomValues;
    } else if (el.applyType == "fieldValue") {
      var f = this.getField(el.fieldName);
      if (f != null) this.value = f[el.fieldName];
    }else if (el.applyType == "transform") {
      this.value = new DataTr(this.value,el.transform,this.fields).process();
      var tmp = "";
    }

   
  }

  /** apply % calculation value to */
  percentConvert(el) {
    try {
      var res = (this.value * 100) / el.maxValue;
      if (el.appendPercentSymbol == true) {
        res = res + "%";
      }
      this.value = res;
    } catch (error) {
      this.onerror(el);
    }
  }

  /* apply match or regex */
  regexReplace(el) {
    el.regexRules.forEach((regexRule) => {
      var s = this.value.toString();
      var i = regexRule.lastIndexOf("/");
      var re = new RegExp(regexRule);
      if (i > 0) {
        var tmpRegexRule = regexRule.substring(0, i);
        var flags = regexRule.substring(i).replace("/", "");
        var re = new RegExp(tmpRegexRule, flags);
      }

      if (el.type == "match") {
        var v = "";
        var tmp = this.value.match(re);
        this.value.match(re).forEach((m) => {
          v = v + m + el.matchJoinerSeparator;
        });
        this.value = v.trimRight(el.matchJoinerSeparator);
      } else if (el.type == "replace") {
        this.value = this.value.replace(re, el.replaceVal);
      } else if (el.type == "matchByIndex") {
        var val = "";
        var matches = s.match(re);
        for (let index = 0; index < matches.length; index++) {
          const element = matches[index];
          if (el.matchIndex.includes(index))
            val = val + matches[index] + el.matchJoinerSeparator;
        }
        this.value = v.trimRight(el.matchJoinerSeparator);
      } else if (el.type == "replaceByField") {
        var f = this.getField(el.fieldName);
        if (f != null) {
          var v = f[el.fieldName];
          this.value = this.value.replace(re, v);
        }
      }
    });
  }

  /* Trim */
  trimmer(el) {
    if (el.type == "both") {
      this.value = this.value.trim(el.value);
    } else if (el.type == "left") {
      var pattern = "^" + el.value;
      var re2 = new RegExp(pattern, "gim");
      this.value = this.value.replace(re2, "").trim();
    } else if (el.type == "right") {
      var pattern = el.value + "+$";
      var re2 = new RegExp(pattern, "gim");
      this.value = this.value.replace(re2, "").trim();
    }
  }

  /* apply substring substitutions */
  subString(el) {
    if (el.getType === "before") {
      var i = this.value.indexOf(el.findString);
      if(i > 0)
        this.value = this.value.substr(0, i);
    }
    if (el.getType === "after") {
      var i = this.value.indexOf(el.findString);      
      this.value = this.value.substring(i, this.value.length );
    }
    if (el.getType === "beforeFromEnd") {
      var i = this.value.lastIndexOf(el.findString);
      this.value = this.value.substr(0, i);
    }
    if (el.getType === "afterFromEnd") {
      var i = this.value.lastIndexOf(el.findString);      
      this.value = this.value.substring(i, this.value.length );
    }
    var tmp = this.value.substring(this.value.length-100);
  }

  //TODO
  callUrl(el) {}
}

var transform = function (value, rule, result) {
  tr = new DataTr(value, rule, result);
  return tr.process();
};

module.exports = {
  transform: transform,
};
