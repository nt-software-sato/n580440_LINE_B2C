'use strict';

WeChat.controller('ShareDetailCtrl', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter) {
  //var Id = Request.QueryString('requisitionId').toString();
  $scope.AppId = window.localStorage.getItem('b2c_appId');
  $scope.UrlStr = $(location).attr('search') || "Unknown";
  $scope.RequestParams = $scope.UrlStr.split('?requisitionId=')[1];
  $scope.RequisitionId = $scope.RequestParams.split('&')[0]; //alert($scope.RequisitionId);
  $scope.pcompanyList = [];
  $scope.ImgList = [];
  $scope.ThumbList = [];
  $scope.StoreList = [];
  $scope.RepairInfo = {};
  $scope.RequisitionIds = [];
  $scope.AreasSelected = [];
  $scope.itemsAreaStr = [];
  $scope.isLoading = false;
  $scope.isShowDetail = false;
  $scope.IsThumbs = false;
  $scope.CollapseState = false;
  $scope.Voice = {};
  $scope.playing = false;
  $scope._Patch;
  $scope.Survey = 5;
  $scope.Survey1 = 5;
  $scope.audio;
  $scope.isShowVoice = false;

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
    wx.error(function (res) {
      $http({
        url: ApiMapper.wxApi + '/wx/r/ticket/' + $scope.AppId,
        method: 'GET',
        cache: false,
        contentType: 'application/json'
      }).success(function (data) {
        var ticket = data;
        window.localStorage.setItem($scope.AppId + "_ticket", ticket);
        var String1 = "jsapi_ticket=" + ticket + "&noncestr=n580440&timestamp=1437377735&url=" + window.location.href;
        window.localStorage.setItem($scope.AppId + "_signature", hex_sha1(String1)); //alert(String1);
        $scope.Load_WX();
      });
    });
  };
  $scope.Load_WX();

  //加载案件详情
  $scope.GetDetail = function (Id) {
    $scope.RepairInfo = {};
    $scope.CheckedIds = [];
    $http({
      url: ApiMapper.ccApi + '/g/rez/free/' + Id,
      method: 'GET',
      contentType: 'application/json'
    }).success(function (data) {
      $scope.RepairInfo = data.Requisition;
      var TitleName = "85°C单位报修案件详情";
      var shareDate = {
        title: TitleName, // 分享标题
        desc: $scope.RepairInfo.CaseNo + '\n\r' + $scope.RepairInfo.Unit + '\n\r[' + $scope.RepairInfo.EquipmentCode + ']' + $scope.RepairInfo.EquipmentName + '\n\r' + $scope.RepairInfo.Priority, // 分享描述
        link: ApiMapper.PathStr + 'Share_Detail.html?requisitionId=' + $scope.RequisitionId // 分享链接
        //imgUrl: '', // 分享图标
      };
      wx.ready(function () {
        wx.onMenuShareAppMessage(shareDate); //分享给朋友
        wx.onMenuShareTimeline(shareDate); //分享到朋友圈
        wx.onMenuShareQQ(shareDate); //分享到QQ
      });
      if ($scope.RepairInfo.EstArrivalTime != null && $scope.RepairInfo.EstArrivalTime != "")
        $scope.RepairInfo.EstArrivalTime = $filter('date')(new Date($scope.RepairInfo.EstArrivalTime), 'yyyy/MM/dd HH:mm:ss');

      if ($scope.RepairInfo.DateA != null && $scope.RepairInfo.DateA != "")
        $scope.RepairInfo.DateA = $filter('date')(new Date($scope.RepairInfo.DateA), 'yyyy/MM/dd HH:mm:ss');
      $scope.RepairInfo.IntervalAB = $scope.M2H($scope.RepairInfo.IntervalAB);
      $scope.RepairInfo.IntervalBC = $scope.M2H($scope.RepairInfo.IntervalBC);
      $scope.RepairInfo.IntervalCD = $scope.M2H($scope.RepairInfo.IntervalCD);
      $scope.RepairInfo.IntervalAD = $scope.M2H($scope.RepairInfo.IntervalAD);

      if ($scope.RepairInfo.Cause != "" && $scope.RepairInfo.Description != '') {
        $scope.RepairInfo.Cause += "," + $scope.RepairInfo.Description;
      } else if ($scope.RepairInfo.Cause == "" && $scope.RepairInfo.Description != '') {
        $scope.RepairInfo.Cause = $scope.RepairInfo.Description;
      }
      //alert(JSON.stringify(data));
      $scope.isShow = true;
      _($scope.RepairInfo.Files).each(function (Item) {
        if (parseInt(Item.Type) == 2) {
          $scope.isShowVoice = true;
          $scope.Voice = Item;
          $scope.Voice.Thumbnail = ApiMapper.ccApi + $scope.Voice.FilePath;
          $scope.audioLoading(); //加载录音档
        } else {
          Item.FilePath = Item.FilePath.replace('~', '');
          Item.FilePath = ApiMapper.ccApi + '/' + Item.FilePath;
          Item.Src = ApiMapper.ccApi + '/cc/image/' + Item.Id;

          Item.thumb = Item.FilePath;
          Item.img = ApiMapper.ccApi + '/cc/image/' + Item.Id;
          $scope.IsThumbs = true;
          $scope.ThumbList.push(Item);
        }
      });

      $scope._TableData = data.Histories;
      _($scope._TableData).each(function (Item, n) {
        Item.ResponseTime = $filter('date')(new Date(Item.ResponseTime), 'yyyy/MM/dd HH:mm:ss');
        Item.Thumbnail = [];
        Item.Voice = [];
        _(Item.Files).each(function (FileItem) {
          if (parseInt(FileItem.Type) == 2) {
            Item.Voice.push(FileItem);
          } else {
            FileItem.FilePath = FileItem.FilePath.replace('~', '');
            FileItem.FilePath = ApiMapper.ccApi + '/' + FileItem.FilePath;
            FileItem.Src = ApiMapper.ccApi + '/cc/image/' + FileItem.Id;

            FileItem.thumb = FileItem.FilePath;
            FileItem.img = ApiMapper.ccApi + '/cc/image/' + FileItem.Id;
            $scope.IsThumbs = true;
            Item.Thumbnail.push(FileItem);
          }
        });
      });
      if ($scope._TableData.length > 0) {
        $scope.isTimeline = true;
      }

    }).error(function () {
      alert("ERROR");
    });
  };

  $scope.ShowImg = function (Id) {
    $('#ShowImg').attr({
      'src': ApiMapper.ccApi + '/cc/image/' + Id
    });
  };

  //加载录音档
  $scope.audioLoading = function () {
    $scope.playing = false;
    $scope.audio = document.createElement('audio');
    $scope.audio.src = $scope.Voice.Thumbnail;

    $scope.audio.addEventListener('ended', function () {
      $scope.$apply(function () {
        $scope.stop()
      });
    });

  };
  //播放录音
  $scope.play = function () {
    if (!$scope.playing) {
      $scope.audio = document.createElement('audio');
      $scope.audio.src = $scope.Voice.Thumbnail;

      $scope.audio.addEventListener('ended', function () {
        $scope.$apply(function () {
          $scope.stop()
        });
      });
      $scope.audio.play();
      $scope.playing = true;
    } else {
      $scope.audio.pause();
      $scope.playing = false;
    }
  };
  //停止播放录音
  $scope.stop = function () {
    $scope.audio.pause();
    $scope.playing = false;
  };
  $scope.GetDetail($scope.RequisitionId);
  //加载报修进度图片
  $scope.ListShowImg = function (n, i) {
    var imgStr = ApiMapper.ccApi + '/' + $scope._TableData[n].Thumbnail[i].FilePath;
    $('#List_' + n + '_' + i).attr({
      'src': imgStr
    });
  };
  //播放报修进度留言
  $scope.PlayVoice = function (Id) {
    if (!$scope.playing) {
      $http({
        url: ApiMapper.ccApi + '/cc/voicefile/' + Id,
        method: 'GET',
        contentType: 'application/json',
        headers: {
          'Passport': $cookies.Passport
        }
      }).success(function (data) {
        if (data.length > 0) {
          $scope.isShowVoice = true;
          $scope.Voice = data[0];
          $scope.Voice.Thumbnail = ApiMapper.ccApi + "/" + $scope.Voice.Thumbnail;
          //加载录音档
          $scope.audio = document.createElement('audio');
          $scope.audio.src = $scope.Voice.Thumbnail;
          $scope.audio.addEventListener('ended', function () {
            $scope.$apply(function () {
              $scope.stop()
            });
          });
          $scope.audio.play();
          $scope.playing = true;
        } else {
          $scope.isShowVoice = true;
        }
      });
    } else {
      $scope.audio.pause();
      $scope.playing = false;
    }
  };
  //时间格式
  $scope.FormatDATE = function (date) {
    var myDate = new Date(date);
    var _YY = myDate.getFullYear();
    var _MM = myDate.getMonth() + 1;
    var _DD = myDate.getDate();
    var _hh = myDate.getHours();
    var _mm = myDate.getMinutes();
    var _ss = myDate.getSeconds();
    var _now = '' + _YY + '/' + _MM + '/' + _DD;
    return _now;
  };

  //控制icon變化
  $scope.change_openicon = function () {
    $scope.CollapseState = !$scope.CollapseState;
  }
  //时间转换(分钟转为小时)
  $scope.M2H = function (mm) {
    var hh = 0;
    var _mm = 0;
    hh = mm / 60;
    _mm = mm % 60 * 100 / 60;
    hh = '' + hh + '.' + _mm;
    return parseFloat(hh).toFixed(2);
  };
});