WeChat.controller('ConfirmCodeCtrl', ['$scope', '$http', '$timeout', '$window', '$cookies', '$filter', function ($scope, $http, $timeout, $window, $cookies, $filter) {
    $scope.AppId = window.localStorage.getItem('b2c_appId');
    $scope.OpenId = window.localStorage.getItem($scope.AppId);
    $scope.UserId = $cookies.UserId;
    $scope.UserName = $cookies.UserName;
    $scope.Updated = $cookies.Updated;
    $scope.Unit = $cookies.Unit;
    //$scope.UnitId = '';//$cookies.UnitId;
    $scope.UnitInfo = {"UnitId":"","PassCode":""};
    $scope.ExpiredTime = $filter('date')($cookies.ExpiredTime, 'yyyy/MM/dd HH:mm:ss');
    $scope.isSubmit = false;
    $scope.isOuttime = true;

    //设定微信调用
    $scope.Load_WX = function () {
        wx.config({
            debug: false,
            appId: $scope.AppId,
            timestamp: 1437377735,
            nonceStr: 'n580440',
            signature: window.localStorage.getItem($scope.AppId + "_signature"),
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
        //wx.ready(function () {
        //    $timeout(function () {
        //        wx.closeWindow();
        //    }, 500);
        //});
        wx.error(function (res) {
            $http({
                url: ApiMapper.wxApi + '/wx/r/ticket/' + $scope.AppId,
                method: 'GET',
                cache: false,
                contentType: 'application/json'
            }).success(function (data) {
                var ticket = data;
                window.localStorage.setItem($scope.AppId +"_ticket", ticket);
                var String1 = "jsapi_ticket=" + ticket + "&noncestr=n580440&timestamp=1437377735&url=" + window.location.href;
                window.localStorage.setItem($scope.AppId +"_signature", hex_sha1(String1));
                $scope.Load_WX();
            });
        });
    };
    $scope.Load_WX();
    //获取门店二维码
    $scope.loadQRcode = function () {
        $http({
            url: ApiMapper.sApi + '/s/unit/info/qrcode/' + $cookies.UnitId,
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            method: "GET",
        }).success(function (data) {
            $scope.QRCodeUri = data;
        }).error(function (data) {
            alert(data.Messages);
        });
    };
    //调用微信扫一扫接口
    $scope.ToscanQRCode = function () {
        //微信扫一扫功能
        wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
                $scope.QRCodeStr = res.resultStr;
                //解密门店二维码信息
                $http({
                    url: ApiMapper.sApi + '/s/unit/info/decrypt?encrypt=' + encodeURIComponent($scope.QRCodeStr),
                    contentType: 'application/json',
                    headers: { 'Passport': $cookies.Passport },
                    method: "GET",
                }).success(function (data) {
                    $scope.UnitInfo.UnitId = data.UnitId;
                    $scope.UnitInfo.PassCode = data.PassCode;
                }).error(function (data) {
                    alert(data.Messages);
                });
            }
        });
    };
    
    
    if (parseInt($scope.Updated) == 1) {
        $scope.loadQRcode();
        $scope.isOuttime = false;
    }
    //确认门店密码
    $scope.ConfirmPassCode = function () {
        if($scope.UnitInfo.UnitId==""){
            $scope.UnitInfo.UnitId=$('input[name=UnitId]').val();
            $scope.UnitInfo.PassCode=$('input[name=passCode]').val();
        }
        $scope.isSubmit = true;
        $http({
            url: ApiMapper.sApi + '/s/user/validtime/' + $scope.UserId,
            method: 'PATCH',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport},
            data: { 'UnitId': $scope.UnitInfo.UnitId, 'PassCode': $scope.UnitInfo.PassCode }
        }).success(function (data) {
            if (data.StatusCode == 1) {
                alert("门店密码确认成功！");
                $cookies.ExpiredTime = $filter('date')(new Date(data.Messages), 'yyyy/MM/dd HH:mm:ss');//data.Messages;
                wx.closeWindow();
            } else {
                $scope.isSubmit = false;
                alert(data.Messages);
            }
        }).error(function (data) {
            alert(data.Messages);
            $scope.isSubmit = false;
            //alert("获取Ticket失败！");
        });
    };
}])
;