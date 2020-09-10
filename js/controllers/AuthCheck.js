WeChat.controller('AuthCheckCtrl', ['$scope', '$http', '$location', '$window', '$cookies', '$cookieStore', function ($scope, $http, $location, $window, $cookies, $cookieStore) {
    $scope.AppId = ApiMapper.AppId;
    window.localStorage.setItem("b2c_appId", $scope.AppId);
    if (window.localStorage.getItem('RedirectUri') == null || window.localStorage.getItem('RedirectUri') == "null") {
        window.localStorage.setItem("RedirectUri", "account_success.html");
    }
    
    //window.localStorage.removeItem($scope.AppId+"_signature");
    $scope.UrlStr = $(location).attr('search') || "Unknown";
    $scope.RedirectUri = decodeURIComponent($scope.UrlStr.split('?redirect_uri=')[1]);
    $scope.RedirectUri = $scope.RedirectUri.replace('&', '?');
    $scope.OpenId = window.localStorage.getItem($scope.AppId);
    $scope.Ticket = window.localStorage.getItem($scope.AppId + "_ticket");
    //记录来源页面
    if ($scope.RedirectUri != "undefined" && $scope.RedirectUri != undefined && $scope.RedirectUri != null) {
        window.localStorage.setItem("RedirectUri", $scope.RedirectUri);
        $scope.RedirectUri = window.localStorage.getItem('RedirectUri');
    } else {
        $scope.RedirectUri = window.localStorage.getItem('RedirectUri');
    }
    $scope.Code = decodeURIComponent($scope.UrlStr.split('?code=')[1]);
    //$scope.Code = Request.QueryString('code').toString(); alert($scope.Code);

    //获取当前时间
    $scope.GetNow = function () {
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
    //时间比较
    $scope.ValidtorTime = function (dt1, dt2) {
        var d1 = new Date(dt1).getTime();
        var d2 = new Date(dt2).getTime();
        if (d1 > d2) {
            return false;
        }
        return true;
    };
    $scope.reloadWX = 0;
    
    //设定微信调用
    $scope.Load_WX = function () {
        $scope.reloadWX += 1;
        wx.config({
          debug: false,
          appId: $scope.AppId,
          timestamp: 1437377735,
          nonceStr: 'n580440',
          signature: window.localStorage.getItem($scope.AppId + '_signature'),
          jsApiList: [
              'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'translateVoice',
            'startRecord',
            'stopRecord',
            'onRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard'
        ]
        });
        wx.error(function (res) {
            if($scope.reloadWX < 10){
                $http({
                    url: ApiMapper.wxApi + '/wx/r/ticket/' + $scope.AppId,
                    method: 'GET',
                    cache: false,
                    contentType: 'application/json'
                }).success(function (data) {
                    var ticket = data;
                    window.localStorage.setItem($scope.AppId + '_ticket', ticket);
                    var String1 = 'jsapi_ticket=' + ticket + '&noncestr=n580440&timestamp=1437377735&url=' + window.location.href;
                    window.localStorage.setItem($scope.AppId + '_signature', hex_sha1(String1)); //alert(String1);
                    console.log(ApiMapper.PathStr+'authorize.html?redirect_uri='+$scope.RedirectUri);
                    $scope.Load_WX();
                });
            }
        });
    };
      
    //$scope.Load_WX();
    //获取帐号绑定信息
    $scope.GetAccountInfo = function () {
        $http({
            url: ApiMapper.lineApi + "/line/s/signin/" + $scope.OpenId,
            method: "GET",
        }).success(function (data) {
            if (data.Code == 100) {
                var UserInfo = data.o[0];
                //alert( $scope.OpenId+"||"+JSON.stringify(UserInfo));
                $cookies.UserId = UserInfo.Id;
                $cookies.Passport = UserInfo.Passport;
                $cookies.UnitId = UserInfo.UnitId;
                $cookies.Unit = UserInfo.Unit;
                $cookies.UserName = UserInfo.Name;
                $cookies.CompanyId = UserInfo.CompanyId; //alert(ApiMapper.PathStr);
                $cookies.StoreUser = UserInfo.StoreUser;
                $cookies.ExpiredTime = UserInfo.ExpiredTime;
                $cookies.Updated = UserInfo.Updated;
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 1);
                jQuery.cookie("UserInfo", UserInfo, {
                    path: '/',
                    expires: expireDate
                });
                window.localStorage.setItem("Passport", UserInfo.Passport);
                // if($scope.RedirectUri!="change_Password.html"){
                if ($scope.ValidtorTime(UserInfo.ExpiredTime, $scope.GetNow()) && parseInt(UserInfo.StoreUser) == 1 && parseInt(UserInfo.Updated) == 0) {
                    $cookies.Updated = 0;
                    location.replace(ApiMapper.PathStr + "confirm_PassCode.html");
                } else {
                    if (UserInfo.ChangePassword == 1) {
                        location.replace(ApiMapper.PathStr + "forget_Password.html");
                    } else {
                        // location.replace(ApiMapper.PathStr + $scope.RedirectUri);
                        window.location.href = ApiMapper.PathStr + $scope.RedirectUri;
                    }
                }
                // }
            } else {
                if(parseInt(data.Code) === 209){      
                    // alert(data.Messages);      
                    // wx.closeWindow();                    
                    RedirectUri = ApiMapper.PathStr + 'noService.html';
                    location.replace(RedirectUri);
                }else{
                    location.replace(ApiMapper.PathStr + 'account.html?redirect_uri=' + encodeURIComponent(ApiMapper.PathStr + $scope.RedirectUri));
                }
            }
        }).error(function (data) {
            if(parseInt(data.Code) === 209){            
                wx.closeWindow();
            }else{
                location.replace(ApiMapper.PathStr + 'account.html?redirect_uri=' + encodeURIComponent(ApiMapper.PathStr + $scope.RedirectUri));
            }
        });
    };
    if ($scope.OpenId == "undefined" || $scope.OpenId == undefined || $scope.OpenId == null || $scope.OpenId == "null") {
        if ($scope.Code == "undefined") { //判断地址是否有带Code            
            $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + $scope.AppId + '&redirect_uri=' + encodeURIComponent(ApiMapper.PathStr + 'authorize.html') + '&response_type=code&scope=snsapi_base#wechat_redirect';
        } else {
            var newUrl = ApiMapper.wxApi + '/wx/r/openId?appId=' + $scope.AppId + '&code=' + $scope.Code; //呼叫Gina API
            //取得OpenID
            $http.get(newUrl).success(function (data) {
                $scope.OpenId = data.openid;
                window.localStorage.setItem($scope.AppId, $scope.OpenId);
                //$scope.GetAccountInfo();
                window.location.href = ApiMapper.PathStr+'authorize.html?redirect_uri='+$scope.RedirectUri;
            }).error(function (data) {
                location.replace(ApiMapper.PathStr + 'account.html');
            });
        }
    } else {
        $scope.GetAccountInfo();
    }

    // if ($scope.Ticket == undefined || $scope.Ticket == null) {
    //     $http({
    //         url: ApiMapper.wxApi + '/wx/r/ticket/' + $scope.AppId,
    //         method: 'GET',
    //         contentType: 'application/json'
    //     }).success(function (data) {
    //         $scope.Ticket = data;
    //         window.localStorage.setItem($scope.AppId + "_ticket", $scope.Ticket);
    //         var String1 = "jsapi_ticket=" + $scope.Ticket + "&noncestr=n580440&timestamp=1437377735&url=" + window.location.href;
    //         window.localStorage.setItem($scope.AppId + "_signature", hex_sha1(String1));
    //     }).error(function (data) {
    //         //alert("获取Ticket失败！");
    //     });
    // }
}]);