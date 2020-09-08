var WeChat = angular.module('WeChat', [
  'pascalprecht.translate',
  'angular-md5',
  'ngMaterial',
  'ngMessages',
  'ngCookies',
  'ngProgress',
  'ngTouch',
  'hmTouchEvents',
  'ui.bootstrap',
  'daterangepicker'
]);

WeChat.config(['$translateProvider', function ($translateProvider) {
  //var lang = window.localStorage.lang || 'zh-cn';
  var lang = navigator.language.toLowerCase() || 'zh-cn';
  //var lang = 'zh-cn';
  
  $translateProvider.translations('zh-cn', zhCN);
  $translateProvider.translations('zh-tw', zhTW);

  $translateProvider.preferredLanguage(lang);
}]);

Base64 = { _0: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (b) { var a = ""; var d, c, h, j, i, f, g; var e = 0; b = Base64._1(b); while (e < b.length) { d = b.charCodeAt(e++); c = b.charCodeAt(e++); h = b.charCodeAt(e++); j = d >> 2; i = ((d & 3) << 4) | (c >> 4); f = ((c & 15) << 2) | (h >> 6); g = h & 63; if (isNaN(c)) { f = g = 64 } else if (isNaN(h)) { g = 64 } a = a + this._0.charAt(j) + this._0.charAt(i) + this._0.charAt(f) + this._0.charAt(g) } return a }, decode: function (b) { var a = ""; var d, c, h; var j, i, f, g; var e = 0; b = b.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (e < b.length) { j = this._0.indexOf(b.charAt(e++)); i = this._0.indexOf(b.charAt(e++)); f = this._0.indexOf(b.charAt(e++)); g = this._0.indexOf(b.charAt(e++)); d = (j << 2) | (i >> 4); c = ((i & 15) << 4) | (f >> 2); h = ((f & 3) << 6) | g; a = a + String.fromCharCode(d); if (f != 64) { a = a + String.fromCharCode(c) } if (g != 64) { a = a + String.fromCharCode(h) } } a = Base64._2(a); return a }, _1: function (b) { b = b.replace(/\r\n/g, "\n"); var a = ""; for (var d = 0; d < b.length; d++) { var c = b.charCodeAt(d); if (c < 128) { a += String.fromCharCode(c) } else if ((c > 127) && (c < 2048)) { a += String.fromCharCode((c >> 6) | 192); a += String.fromCharCode((c & 63) | 128) } else { a += String.fromCharCode((c >> 12) | 224); a += String.fromCharCode(((c >> 6) & 63) | 128); a += String.fromCharCode((c & 63) | 128) } } return a }, _2: function (b) { var a = ""; var d = 0; var c = c1 = c2 = 0; while (d < b.length) { c = b.charCodeAt(d); if (c < 128) { a += String.fromCharCode(c); d++ } else if ((c > 191) && (c < 224)) { c2 = b.charCodeAt(d + 1); a += String.fromCharCode(((c & 31) << 6) | (c2 & 63)); d += 2 } else { c2 = b.charCodeAt(d + 1); c3 = b.charCodeAt(d + 2); a += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)); d += 3 } } return a } };

// WeChat.config(function ($mdDateLocaleProvider) {
//   /**
//    * @param date {Date}
//    * @returns {string} string representation of the provided date
//    */
//   $mdDateLocaleProvider.formatDate = function (date) {
//     return date ? moment(date).format('YYYY/MM/DD') : '';
//   };

//   /**
//    * @param dateString {string} string that can be converted to a Date
//    * @returns {Date} JavaScript Date object created from the provided dateString
//    */
//   $mdDateLocaleProvider.parseDate = function (dateString) {
//     var m = moment(dateString, 'YYYY/MM/DD', true);
//     return m.isValid() ? m.toDate() : new Date(NaN);
//   };

//   /**
//    * Check if the date string is complete enough to parse. This avoids calls to parseDate
//    * when the user has only typed in the first digit or two of the date.
//    * Allow only a day and month to be specified.
//    * @param dateString {string} date string to evaluate for parsing
//    * @returns {boolean} true if the date string is complete enough to be parsed
//    */
//   $mdDateLocaleProvider.isDateComplete = function (dateString) {
//     dateString = dateString.trim();
//     // Look for two chunks of content (either numbers or text) separated by delimiters.
//     var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ .,]+|[/-]))([a-zA-Z]{3,}|[0-9]{1,4})/;
//     return re.test(dateString);
//   };
// });

var getQueryString = function (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
};
var getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };
//获取当前时间
var GetNow = function () {
  var myDate = new Date();
  var _YY = myDate.getFullYear();
  var _MM = myDate.getMonth() + 1;
  var _DD = myDate.getDate();
  var _hh = myDate.getHours();
  var _mm = myDate.getMinutes();
  var _ss = myDate.getSeconds();
  var _now = '' + _YY + '/' + _MM + '/' + _DD + ' ' + _hh + ':' + _mm + ':' + _ss;
  return _now;
};
//时间格式
var FormatDateTime = function (date) {
  var myDate = new Date(date);
  var _YY = myDate.getFullYear();
  var _MM = myDate.getMonth() + 1;
  var _DD = myDate.getDate();
  var _hh = myDate.getHours();
  var _mm = myDate.getMinutes();
  var _ss = myDate.getSeconds();
  var _now = '' + _YY + '/' + _MM + '/' + _DD + ' ' + _hh + ':' + _mm + ':' + _ss;
  return _now;
};
//日期格式
var FormatDate = function (date) {
  var a = date.split(/[^0-9]/);
  var d = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
  var myDate = new Date(d);
  var _YY = myDate.getFullYear();
  var _MM = myDate.getMonth() + 1;
  var _DD = myDate.getDate();
  var _hh = myDate.getHours();
  var _mm = myDate.getMinutes();
  var _ss = myDate.getSeconds();
  var _now = '' + _YY + '/' + _MM + '/' + _DD;
  return _now;
};

var FormatTIME = function (date) {
  var myDate = new Date(date);
  var _hh = '00' + myDate.getHours();
  var _mm = '00' + myDate.getMinutes();
  var _ss = '00' + myDate.getSeconds();
  var _time = '' + _hh.substr(_hh.length - 2, 2) + ':' + _mm.substr(_mm.length - 2, 2);
  return _time;
};

//时间比较
var ValidtorTime = function (dt1, dt2) {
  var d1 = new Date(dt1).getTime();
  var d2 = new Date(dt2).getTime();
  if (d1 > d2) {
    return false;
  }
  return true;
};

var FormatLogoURI = function (v) {
  var patt = /_sh|_szw/gi;
  var result = v.replace(patt, "");

  return result;
};
/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * 例子： 
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
 */
Date.prototype.Format = function (fmt) {
  if (typeof fmt === "undefined") fmt = "yyyy/MM/dd hh:mm:ss";
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

//获取前一个月的时间
var GetPreMonth = function (fmt) {
  if (typeof fmt === "undefined") fmt = "yyyy/MM/dd hh:mm:ss";
  var now = new Date();
  now.setMonth(now.getMonth() - 1);

  return new Date(now).Format(fmt)
}

// 測試用
// let __Passport = "WVeaR4IpFGKINT2KpMGsUEhyn8XFpgBlSpIa5N90Ya2zfLIvI5BVln%252F8UHpsGpJS1b117KODVpDnSqyGH%252B0azS%252FXyaFIDF15uXgvuE7niR2MHeFQfgffKhpSWZvNdvQ013uug210zHnc5VGzyHeHWXzpNpJZDItypgGPEnX0ygJwzydcMg1MoxJLKWKTusBhAqB11poZSAlKq5cSnxUBIqwfavuTtMtlmc7%252Fx%252BmyAtYhXsPpDE9F72VH%252FjDeH68FnClIKwgiKwX2okChzTI9Y%252Fc1wnd45FhkmnpaA2u60vrWH479y8nb80EhfezOdvMooiq9QiZ9vDYNhJM8IQHRnqh3s%252BmfkS%252Bjwhe8zxtHBwSBzdjgt1dd9fRcCCHoGU0KEGm5jImASu9J5q8KBJYuja%252FME7aSZduja0rU9VOnZWQ5hLTlT1YZopEma5069ZjrrrEI%252BuvOdgsmaejcEOXvC9H%252FZRZY4vpuStQgVEIEz%252FmHKVwGtf0vuXdxU5YE7R4P";
// document.cookie = "UserId=SF140389;";
// document.cookie = "UnitId=STJT;";
// document.cookie = "Unit=天泰集团;";
// document.cookie = "UserName=方海勇;";
// document.cookie = "CompanyId=c1a24352-46a1-4301-9b96-a67c92691336;";
// document.cookie = "StoreUser=1;";
// document.cookie = "Updated=1;";
// document.cookie = "Passport="+__Passport;
// localStorage.setItem('Passport', __Passport);

// 測試用
// document.cookie = "UserId=3030011;";
// document.cookie = "UnitId=wp_hdq;";
// document.cookie = "Unit=王品上海仙霞店;";
// document.cookie = "UserName=王品管理員;";
// document.cookie = "CompanyId=eb296708-6fc6-43f0-b506-0ca0fa91e1cd;";
// document.cookie = "StoreUser=0;";
// document.cookie = "Updated=1;";
// document.cookie = "Passport=XhF5BeKzIlOqCYH0Kb5LN2b7dkgVkCJ0BxfKNXCyA0%2BpXV5TBUofBXbsGQ%2Fu5WMOpbNCgYICK0XRxyUzU7zVWypr00esLJB8cidodMiNgMo5%2F%2Bof1vrxEOpE9iOwSs5miQvGrhhHGG%2BgemqbMqpjw0%2F3NHd0RpDV36bY7adImD9SFc%2BMKcdSyD7h8t%2Bp5pY%2FPEBGm4Gt%2BKTNl8rFXpet05CwMUmA6USApvU7LxRChxvcDO%2FdCkN%2FsLpWMT2mY3ZjWS77KQCcOkKo9HLJWCIE4kG4bfCln%2BxM7zyK9Fk2nxkldC3Xhg0KoW7cTTbiRWXwo7w2yumIovMCtXtyY1bBTknDpFCLZRdaM8Mxp9dW2Le74yLg2YcA%2FIR3MruotoyY9k3k%2BizdJPVTlI4xnGrIfpIvQW%2Fv8OT4olyjfpZEQPh%2Bc1ByPoavVkf2xbaTxm6%2Fml91hTHqYn6N02airL8UMu45PnF05opUPFQgRvq%2FPAjxF5YVN%2FGjkZb6I2gUoQwR00zBrgzNT%2FrQY%2FJ62yVYFg%3D%3D";
// localStorage.setItem('Passport', 'XhF5BeKzIlOqCYH0Kb5LN2b7dkgVkCJ0BxfKNXCyA0%2BpXV5TBUofBXbsGQ%2Fu5WMOpbNCgYICK0XRxyUzU7zVWypr00esLJB8cidodMiNgMo5%2F%2Bof1vrxEOpE9iOwSs5miQvGrhhHGG%2BgemqbMqpjw0%2F3NHd0RpDV36bY7adImD9SFc%2BMKcdSyD7h8t%2Bp5pY%2FPEBGm4Gt%2BKTNl8rFXpet05CwMUmA6USApvU7LxRChxvcDO%2FdCkN%2FsLpWMT2mY3ZjWS77KQCcOkKo9HLJWCIE4kG4bfCln%2BxM7zyK9Fk2nxkldC3Xhg0KoW7cTTbiRWXwo7w2yumIovMCtXtyY1bBTknDpFCLZRdaM8Mxp9dW2Le74yLg2YcA%2FIR3MruotoyY9k3k%2BizdJPVTlI4xnGrIfpIvQW%2Fv8OT4olyjfpZEQPh%2Bc1ByPoavVkf2xbaTxm6%2Fml91hTHqYn6N02airL8UMu45PnF05opUPFQgRvq%2FPAjxF5YVN%2FGjkZb6I2gUoQwR00zBrgzNT%2FrQY%2FJ62yVYFg%3D%3D');

// document.cookie = "UserId=0000308;";
// document.cookie = "UnitId=wp_hdq;";
// document.cookie = "Unit=华东区;";
// document.cookie = "UserName=梁同峰;";
// document.cookie = "CompanyId=eb296708-6fc6-43f0-b506-0ca0fa91e1cd;";
// document.cookie = "StoreUser=0;";
// document.cookie = "Updated=1;";
// document.cookie = "Passport=XhF5BeKzIlOqCYH0Kb5LN80C1Uxn2BestS7okVquJXaZK5lGOMfUQUT32mq1ZJhPyrFW%2FO7r64SGjzDY%2BUGhhFkwUJ8CbpP9Zy7ppnxEm%2FLQlsOpuCVDUa6aw64NeTu1MbB6U9dCNm1cSLXM7zm119%2BsJm3a1iSavyEEOjgDlywH2yNJtpmCMi8wMcEJpQ6fIOTWn4On6DrDLzmbjazfboz3USp%2FUEPSpKIl66LRm%2FLWXF1ri%2FTkdO1TvGhBk3giSbYx5E%2FqjcXGxHBmDzBH%2BAChDb0ymz7%2BVyQVynWs2N3UWOpZtFLq1v48MpJgoLBLDfZLxQIw9Y2v0oyb8c0aibEOgu7eLRgZo54aLqYdBgJx2sy4ZlkNsOOqdN531MHM%2BDfNPYFdv6CjYSiLReKypTxMkAwXtV%2F%2BTkLWYovdavPGZOqk4DXM%2FwIuzUpA%2FUxn9o0ItZKjvXSdmvcs50ZljsGhnN0wNRZmKSe5TPs8JZ5k5uJTjE2dZ56RdO7unUhyK7Y7clCi5Nygj%2FkRWPV2Pw%3D%3D";
// localStorage.setItem('Passport', 'XhF5BeKzIlOqCYH0Kb5LN80C1Uxn2BestS7okVquJXaZK5lGOMfUQUT32mq1ZJhPyrFW%2FO7r64SGjzDY%2BUGhhFkwUJ8CbpP9Zy7ppnxEm%2FLQlsOpuCVDUa6aw64NeTu1MbB6U9dCNm1cSLXM7zm119%2BsJm3a1iSavyEEOjgDlywH2yNJtpmCMi8wMcEJpQ6fIOTWn4On6DrDLzmbjazfboz3USp%2FUEPSpKIl66LRm%2FLWXF1ri%2FTkdO1TvGhBk3giSbYx5E%2FqjcXGxHBmDzBH%2BAChDb0ymz7%2BVyQVynWs2N3UWOpZtFLq1v48MpJgoLBLDfZLxQIw9Y2v0oyb8c0aibEOgu7eLRgZo54aLqYdBgJx2sy4ZlkNsOOqdN531MHM%2BDfNPYFdv6CjYSiLReKypTxMkAwXtV%2F%2BTkLWYovdavPGZOqk4DXM%2FwIuzUpA%2FUxn9o0ItZKjvXSdmvcs50ZljsGhnN0wNRZmKSe5TPs8JZ5k5uJTjE2dZ56RdO7unUhyK7Y7clCi5Nygj%2FkRWPV2Pw%3D%3D');

var __Passport = "dFSpJ67930WuTjZ8p2o6cMx4N9IZpa%2Bqjjgt8bfnyEQxf%2FZQ%2FB2PrHtb7F6%2FYHRls2kLfVPMU2WIj6CyqEtonWDNldKYqFnFZBs8fgk%2Ft6ue7vPjafrAbaI%2B%2F0I5jImA4AbmHMAUMcZ021buQbVumTKz%2FGKKTrylHCR%2Bs0pfUQIQQfpVlC7UX%2F%2BjNovRlHQ57%2FbVithkJTb8ACxmgreI3lZGF1luU%2F9ASH7LbsHeVoALpKiNrKi0y6%2BY65WBs8jXSkFQ1qn4QcxoO0oH4%2B9Oqs8%2BJwhacL8vwvAow2X7fcrtAURo9ngjWWxNQTqGGrw9J7ZFAb1HShLXRivOlIbOey2aALWvx0lPl%2FkIxIodQGVUz1nieX41D2tokncTQZmU43B%2BNBMACLN9Zqjhc5WBo8GMEg%2B98COsBdW1rs4fuh9iVK7iy%2FaGVE%2FwL%2BAE4z8j5ofNRiHTU9U3EFXbQy1s4M%2BGnT4n6jQjuh7hgIfuFQGWqkSNLKHhTk5MD9eU8Nmg";
document.cookie = "UserId=ZNKJ001;";
document.cookie = "UnitId=ZNGC;";
document.cookie = "Unit=智能科技股份有限公司;";
document.cookie = "UserName=张小凡;";
document.cookie = "CompanyId=c9fd2a01-26a6-4409-93bf-36f2f7d7b553;";
document.cookie = "StoreUser=0;";
document.cookie = "Updated=1;";
document.cookie = "Passport=" + __Passport;
localStorage.setItem('Passport', __Passport);
