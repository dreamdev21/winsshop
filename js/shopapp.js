
//var App=angular.module('starter', ['ionic','angular-rickshaw','ngDragDrop','ui.router','ui.bootstrap','ui.bootstrap-slider','angularMoment','nvd3ChartDirectives'])
var app=angular.module('starter', ['ionic','ui.bootstrap','ngTouch','ui.checkbox'])
.filter("displayprice", function() {
  return function(input,comma) {
    if (isNaN(parseFloat(input))) return "";
    comma = (typeof comma==='undefined') ? "." : ",";
    input = Math.round(parseFloat(input)*100)/100;
    var d = input.toString().split(".");
    if (d.length===1) return input+comma+"-";
    if (d[1].length<2) return input+"0";
    return input;
  }
})
.filter("formatPrice", function() {
	
  return function(price, digits, thoSeperator, decSeperator, bdisplayprice) {
    var i;
    if(price == null) return '';
    if (isNaN(parseFloat(price))) return "0,-";
    //console.log(price,digits);
    digits = (typeof digits === "undefined") ? 2 : digits;
    bdisplayprice = (typeof bdisplayprice === "undefined") ? true : bdisplayprice;
    thoSeperator = (typeof thoSeperator === "undefined") ? "." : thoSeperator;
    decSeperator = (typeof decSeperator === "undefined") ? "," : decSeperator;
    price = price.toString();
    var _temp = price.split(".");
    var dig = (typeof _temp[1] === "undefined") ? "00" : _temp[1];
    if (bdisplayprice && parseInt(dig,10)===0) {
        dig = "-";
    } else {
        dig = dig.toString();
        if (dig.length > digits) {
            dig = (Math.round(parseFloat("0." + dig) * Math.pow(10, digits))).toString();
        }
        for (i = dig.length; i < digits; i++) {
            dig += "0";
        }
    }
    var num = _temp[0];
    var s = "",
        ii = 0;
    for (i = num.length - 1; i > -1; i--) {
        s = ((ii++ % 3 === 2) ? ((i > 0) ? thoSeperator : "") : "") + num.substr(i, 1) + s;
    }
   // console.log(s + decSeperator + dig);
    return s + decSeperator + dig;
}
})
.filter("formatPriceEuro", function() {
	
  return function(price, digits, thoSeperator, decSeperator, bdisplayprice) {
    var i;
    if(price == null) return '';
    //console.log(price,digits);
    digits = (typeof digits === "undefined") ? 2 : digits;
    bdisplayprice = (typeof bdisplayprice === "undefined") ? true : bdisplayprice;
    thoSeperator = (typeof thoSeperator === "undefined") ? "." : thoSeperator;
    decSeperator = (typeof decSeperator === "undefined") ? "," : decSeperator;
    price = price.toString();
    var _temp = price.split(".");
    var dig = (typeof _temp[1] === "undefined") ? "00" : _temp[1];
    if (bdisplayprice && parseInt(dig,10)===0) {
        dig = "00";
    } else {
        dig = dig.toString();
        if (dig.length > digits) {
            dig = (Math.round(parseFloat("0." + dig) * Math.pow(10, digits))).toString();
        }
        for (i = dig.length; i < digits; i++) {
            dig += "0";
        }
    }
    var num = _temp[0];
    var s = "",
        ii = 0;
    for (i = num.length - 1; i > -1; i--) {
        s = ((ii++ % 3 === 2) ? ((i > 0) ? thoSeperator : "") : "") + num.substr(i, 1) + s;
    }
   // console.log(s + decSeperator + dig);
    return s + decSeperator + dig+ " €";
}
})
.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
  	if (isNaN(parseFloat(input))) return "";
    var result= $filter('number')(input * 100, decimals) + '%';
    return result.replace(".", ",")
  };
}])

 