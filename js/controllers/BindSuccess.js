WeChat.controller('BindSuccessCtrl', ['$scope', '$http', '$timeout', '$window', '$cookies', '$filter', function($scope, $http, $timeout, $window, $cookies, $filter) {
  $scope.UserName = $cookies.UserName;
  $scope.Unit = $cookies.Unit;
  $scope.UnitId = $cookies.UnitId;
  $scope.StoreUser = $cookies.StoreUser;
  $scope.ExpiredTime = $filter('date')($cookies.ExpiredTime, 'yyyy/MM/dd HH:mm:ss');

  $scope.AppId = ApiMapper.AppId;
  $scope.OpenId = window.localStorage.getItem($scope.AppId);
  console.log($scope.AppId,$scope.OpenId)
  //$timeout(function () {
  //    location.href = 'apply_repair.html';
  //}, 2000);
  //location.href = 'apply_repair.html';
  //设定微信调用
  $scope.Load_WX = function() {
    wx.config({
      debug: false,
      appId: $scope.AppId,
      timestamp: 1437377735,
      nonceStr: 'n580440',
      signature: window.localStorage.getItem($scope.AppId + "_signature"),
      jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord', 'stopRecord', 'onRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard']
    });
    wx.ready(function() {
      //$timeout(function () {
      //    wx.closeWindow();
      //}, 500);
    });
    wx.error(function(res) {
      $http({
        url: ApiMapper.wxApi + '/wx/r/ticket/' + $scope.AppId,
        method: 'GET',
        cache: false,
        contentType: 'application/json'
      }).success(function(data) {
        var ticket = data;
        window.localStorage.setItem($scope.AppId + "_ticket", ticket);
        var String1 = "jsapi_ticket=" + ticket + "&noncestr=n580440&timestamp=1437377735&url=" + window.location.href;
        window.localStorage.setItem($scope.AppId + "_signature", hex_sha1(String1));
        $scope.Load_WX();
      });
    });
  };
  $scope.Load_WX();
  // document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
  //     WeixinJSBridge.call('hideToolbar');
  //     WeixinJSBridge.call('hideOptionMenu');
  // });
  //获取门店二维码
  $scope.loadQRcode = function() {
    $http({
      url: ApiMapper.sApi + '/s/unit/info/qrcode/' + $scope.UnitId,
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      method: "GET",
    }).success(function(data) {
      //alert(data);
      $scope.QRCodeUri = data;
    }).error(function(data) {
      alert(data.Messages);
    });
  };
  $scope.loadQRcode();
  //解除绑定
  $scope.Unbind = function() {
    $http({
      url: `${ApiMapper.wxApi}/wx/unbind/${$scope.AppId}/${$scope.OpenId}`,
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      method: "PATCH",
    }).success(function(data) {
      alert("已解绑!");
      wx.closeWindow();
    }).error(function(data) {
      alert(data.Messages);
    });
  };
}]);