// 申诉 Ctl
function AppealController($scope, $mdDialog, params, $http, $timeout, $q) {
  $scope.AppId = ApiMapper.AppId;
  // 修改原先z-index
  setTimeout(function() {
    $('.md-dialog-container').css('z-index', 3000);
  }, 0);
  // 获取参数
  $scope.RepairInfo = params.RepairInfo;
  $scope.CauseList = params.CauseList;
  $scope.Equipmentpos = params.Equipmentpos;
  $scope.IsRezPhotos = $scope.RepairInfo.IsRezPhotos;
  $scope.isSubmit = false;
  $scope.isplayVoice = false;
  $scope.imagesList = {
    'WholeIds': [],
    'localIds': [],
    'allIds': [],
    'serverIds': []
  };
  $scope.Record = {
    'localId': '',
    'serverId': ''
  };
  $scope.MediasParamenter = {
    'Key': '',
    'FileSoure': 44,
    'Medias': {
      'image': [],
      'voice': []
    }
  };
  $scope.Data = {
    AppealCause: ''
  };
  $scope.AppealResponse = {};
  // 修改标题
  $scope.change_title = function(title) {
    var $body = $('body');
    document.title = title;
    var $iframe = $('<iframe src="/favicon.ico"></iframe>');
    $iframe.on('load', function() {
      setTimeout(function() {
        $iframe.off('load').remove();
      }, 0);
    }).appendTo($body);
  };
  $scope.change_title('我要申诉');
  //语音
  $scope.startRecord = function() {
    wx.startRecord({
      success: function(res) {
        $scope.isStart = true;
        $scope.$apply();
      }
    });
  };
  $scope.stopRecord = function() {
    wx.stopRecord({
      success: function(res) {
        $scope.isStart = false;
        $scope.Record.localId = res.localId;
        $scope.$apply();
      }
    });
  };
  wx.onVoiceRecordEnd({
    complete: function(res) {
      $scope.Record.localId = res.localId;
      alert('录音时间已超过一分钟');
    }
  });
  //播放录音
  $scope.playVoice = function() {
    $scope.isplayVoice = !$scope.isplayVoice;
    if ($scope.isplayVoice) {
      if ($scope.Record.localId == '') {
        alert('请先录音！');
        return;
      }
      wx.playVoice({
        localId: $scope.Record.localId
      });
      //监听语音播放完毕接口
      wx.onVoicePlayEnd({
        success: function(res) {
          $scope.isplayVoice = false;
        }
      });
    } else {
      wx.pauseVoice({
        localId: $scope.Record.localId
      });
    }
  };
  //暂停播放音频
  $scope.pauseVoice = function() {
    wx.pauseVoice({
      localId: $scope.Record.localId
    });
  };
  //停止播放音频
  $scope.stopVoice = function() {
    wx.stopVoice({
      localId: $scope.Record.localId
    });
  };
  //监听语音播放完毕接口
  wx.onVoicePlayEnd({
    success: function(res) {
      $scope.isplayVoice = false;
    }
  });
  //选取整体照片
  $scope.chooseWhole = function() {
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      success: function(res) {
        if ($scope.imagesList.WholeIds.length > 0) {
          Array.prototype.push.apply($scope.imagesList.WholeIds, res.localIds);
        } else {
          $scope.imagesList.WholeIds = res.localIds;
        }
        $scope.imagesList.serverIds = [];
        $scope.$apply();
        $timeout(function() {
          _.forEach($scope.imagesList.WholeIds,function(Item, i) {
            $('#wholePic' + i).attr({
              'src': Item,
              'width': '72px',
              'height': '72px'
            });
          });
        }, 500);
      }
    });
  };
  //删除照片
  $scope.RemoveWhole = function(idx) {
    $scope.imagesList.WholeIds.splice(idx, 1);
  };
  //选取局部照片
  $scope.chooseImage = function() {
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      success: function(res) {
        if ($scope.imagesList.localIds.length > 0) {
          //$scope.imagesList.localIds = $scope.imagesList.localIds.concat(res.localIds);
          Array.prototype.push.apply($scope.imagesList.localIds, res.localIds);
        } else {
          $scope.imagesList.localIds = res.localIds;
        }
        $scope.imagesList.serverIds = [];
        $scope.$apply();
        $timeout(function() {
          _.forEach($scope.imagesList.localIds,function(Item, i) {
            $('#advPic' + i).attr({
              'src': Item,
              'width': '72px',
              'height': '72px'
            });
          });
        }, 500);
      }
    });
  };
  //删除照片
  $scope.RemoveImg = function(idx) {
    $scope.imagesList.localIds.splice(idx, 1);
  };
  $scope.hide = function() {
    $scope.change_title(params.PageTitle);
    $mdDialog.hide();
  };
  //1.上传录音档到微信
  $scope.createUpdateRecordPromise = function() {
    var UpdateRecordDefer = $q.defer();
    var UpdateRecordPromise = UpdateRecordDefer.promise;
    if ($scope.Record.localId.length > 0) {
      wx.uploadVoice({
        localId: $scope.Record.localId,
        success: function(res) {
          $scope.Record.serverId = res.serverId;
          $scope.MediasParamenter.Medias.voice = [];
          $scope.MediasParamenter.Medias.voice.push($scope.Record.serverId);
          UpdateRecordDefer.resolve('Success');
        }
      });
    } else {
      setTimeout(function() {
        UpdateRecordDefer.resolve('Success');
      }, 10);
    };
    return UpdateRecordPromise;
  };
  //2.上传照片到微信
  $scope.createUploadImagePromise = function() {
    var UploadImageDefer = $q.defer();
    var UploadImagePromise = UploadImageDefer.promise;
    var i = 0;
    var length = $scope.imagesList.allIds.length;
    $scope.upload = function() {
      // 有照片就上傳
      if (length != 0) {
        setTimeout(function() {
          wx.uploadImage({
            localId: $scope.imagesList.allIds[i],
            isShowProgressTips: 1,
            success: function(res) {
              i++;
              $scope.imagesList.serverIds.push(res.serverId);
              $scope.MediasParamenter.Medias.image.push(res.serverId);
              if (i < length) {
                // 继续上传
                $scope.upload();
              } else {
                // 已全部上传完成
                UploadImageDefer.resolve('Success');
              }
            }
          });
        }, 100);
      } else {
        //没照片 
        setTimeout(function() {
          UploadImageDefer.resolve('Success');
        }, 10);
      };
    };
    $scope.upload();
    return UploadImagePromise;
  };
  //3.写历程
  $scope.createAppealPromise = function() {
    var AppealDefer = $q.defer();
    var AppealPromise = AppealDefer.promise;
    // 設定參數
    var ReCaseParameters = {
      "RequisitionId": $scope.RepairInfo.RequisitionId,
      "Source": 4, //web:2 , weixin:4
      "AppealCause": $scope.Data.AppealCause
    };
    $http({
      url: ApiMapper.sApi + '/s/appeal/create',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': params.Passport
      },
      data: JSON.stringify(ReCaseParameters)
    }).success(function(data) {
      $scope.AppealResponse = data;
      AppealDefer.resolve('Success');
    }).error(function(data) {
      alert(data.Messages);
    });
    return AppealPromise;
  }
  //4.照片id与历程id写回自己伺服器
  $scope.createLoadMediasPromise = function(RequisitionId) {
    var LoadMediasPromiseDefer = $q.defer();
    var LoadMediasPromisePromise = LoadMediasPromiseDefer.promise;
    if ($scope.imagesList.allIds.length > 0 || $scope.Record.localId != "") {
      $scope.MediasParamenter.Key = $scope.AppealResponse.RequisitionId;
      $http({
        url: ApiMapper.wxApi + '/wx/files/' + $scope.AppId,
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'Passport': params.Passport
        },
        data: $scope.MediasParamenter
      }).success(function(data) {
        if (data != "Saved") {
          $scope.isSubmit = false;
          alert('报修失败！\n\r请联系580-440报修中心！');
          return false;
        } else {
          LoadMediasPromiseDefer.resolve('Success');
        }
      }).error(function(List, status) {
        $scope.isSubmit = false;
        alert('报修失败！\n\r请联系580-440报修中心！');
      });
    } else {
      LoadMediasPromiseDefer.resolve('Success');
    };
    return LoadMediasPromisePromise;
  };
  $scope.ok = function() {
    $scope.isSubmit = true;
    // // 申诉原因检查
    if ($scope.Data.AppealCause == '') {
      $scope.isSubmit = false;
      alert('请填写申诉原因！');
      return false;
    };
    // 报修照片检查
    if ($scope.IsRezPhotos == 1) {
      if ($scope.imagesList.WholeIds.length == 0) {
        $scope.isSubmit = false;
        alert('请上传报修整体照片！');
        return false;
      } else if ($scope.imagesList.localIds.length == 0) {
        $scope.isSubmit = false;
        alert('请上传报修局部照片！');
        return false;
      };
    };
    // 照片id合起来
    $scope.imagesList.allIds = $scope.imagesList.WholeIds.concat($scope.imagesList.localIds);
    // 1.上传音档 Promise >> 2.上传照片 Promise >> 3.写历程 Promise>> 4.照片id回传自己的伺服器 Promise
    var UpdateRecordPromise = $scope.createUpdateRecordPromise();
    UpdateRecordPromise.then(function(data) {
      if (data == 'Success') {
        console.log('UpdateRecordPromise Sucess');
        var UploadImagePromise = $scope.createUploadImagePromise();
        return UploadImagePromise;
      };
    }).then(function(data) {
      if (data == 'Success') {
        console.log('UploadImagePromise Sucess');
        var AppealPromise = $scope.createAppealPromise();
        return AppealPromise;
      };
    }).then(function(data) {
      if (data == 'Success') {
        console.log('AppealPromise Sucess');
        var LoadMediasPromise = $scope.createLoadMediasPromise();
        return LoadMediasPromise;
      };
    }).then(function(data) {
      if (data == 'Success') {
        $scope.isSubmit = false;
        console.log('LoadMediasPromise Sucess');
        setTimeout(function() {
          alert('单号：' + $scope.AppealResponse.CaseNo);
          $scope.change_title(params.PageTitle);
          $mdDialog.hide({
            RequisitionId: $scope.RepairInfo.RequisitionId
          });
        }, 0);
      };
    })
  };
  $scope.cancel = function() {
    $scope.change_title(params.PageTitle);
    $mdDialog.cancel();
  };
};
// 新增进度选项
function ListBottomSheetCtrl($scope, $mdBottomSheet) {
  $scope.items = [{
    name: '联系厂商',
    stageId: '30',
    icon: 'fa fa-phone fa-1-5x'
  }, {
    name: '追踪厂商',
    stageId: '31',
    icon: 'fa fa-history fa-1-5x'
  }, {
    name: '取消派工',
    stageId: '34',
    icon: 'fa fa-exclamation-circle fa-1-5x'
  }, {
    name: '案件留言',
    stageId: '12',
    icon: 'fa fa-comment-o fa-1-5x'
  }, {
    name: '设备调拨',
    stageId: '60',
    icon: 'fa fa-random fa-1-5x'
  }];
  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
};
// 详情 Ctl
WeChat.controller('DetailCtrl', ['$scope', '$http', '$timeout', '$location', '$window', '$cookies', '$sce', '$mdSidenav', '$mdUtil', '$filter', '$mdDialog', '$mdBottomSheet', function ($scope, $http, $timeout, $location, $window, $cookies ,$sce, $mdSidenav, $mdUtil, $filter, $mdDialog, $mdBottomSheet) {
  //var Id = Request.QueryString('requisitionId').toString();
  $scope.AppId = ApiMapper.AppId;
  $scope.UrlStr = $(location).attr('search') || "Unknown";
  // $scope.RequisitionId = $scope.UrlStr.split('?requisitionId=')[1]; 
  // if($scope.RequisitionId !=undefined&&$scope.RequisitionId !="undefined"){
  //     $scope.RequisitionId = $scope.RequisitionId.split('&')[0];
  // }
  $scope.RequisitionId = ""; //window.localStorage.getItem("DetailId");
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
  $scope.IsThumbs_Request = false;
  $scope.IsThumbs_Response = false;
  $scope.CollapseState = false;
  $scope.Voice = {};
  $scope.playing = false;
  $scope._Patch;
  $scope.audio;
  $scope.Survey = 5;
  $scope.Survey1 = 5;
  $scope.Passport = window.localStorage.getItem('Passport');
  $scope.CompanyId = $cookies.CompanyId;
  $scope.StoreUser = $cookies.StoreUser;
  $scope.AppealBtnIsDisabled = true;
  $scope.WPCaseAppealBtnIsDisabled = true;
  $scope.WPQuoteAppealBtnIsDisabled = true;
  $scope.IsToAddForHistory = false;
  $scope.hasAddForHistoryPermissions = false;
  $scope.hasConfirmCaseAppealPermissions = false;
  $scope.hasQuoteAppealPermissions = false;
  $scope.hasUseQuotePermissions = false;
  // 王品權限設定
  $scope.IsUItoWP = false;
  var Client_Permissions = ["f96f98e2-38f9-456a-9813-82d899536a82", "eb296708-6fc6-43f0-b506-0ca0fa91e1cd", "6c690014-2571-48db-ac5a-c6ba2572a3bb", "c1a24352-46a1-4301-9b96-a67c92691336", "C4B0E179-8121-487E-AA63-59635ACF2447"];
  //暫存物件
  $scope.userInfo = {
    address: "",
    tel: ""
  };
 
  // 一般申诉(结案待确认)(王品)
  if (Client_Permissions.indexOf($scope.CompanyId) > -1) {
    $scope.hasConfirmCaseAppealPermissions = true;
    $scope.IsUItoWP = true;
  };
  // 费用申诉(王品)
  if (Client_Permissions.indexOf($scope.CompanyId) > -1) {
    $scope.hasQuoteAppealPermissions = true;
  };
  // 新增历程(王品)
  if ((Client_Permissions.indexOf($scope.CompanyId) > -1) && $scope.StoreUser == 0) {
    $scope.hasAddForHistoryPermissions = true;
  };
  // 报价(85的报价)
  if (['308ffed8-d4a7-4ad5-8b61-6cce3c66cd06'].indexOf($scope.CompanyId) > -1) {
    $scope.hasUseQuotePermissions = true;
  };
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
        window.localStorage.setItem($scope.AppId + "_signature", hex_sha1(String1)); //alert(String1);
        $scope.Load_WX();
      });
    });
  };
  $scope.Load_WX();
   $scope.deliberatelyTrustDangerousSnippet = function (snippet) {
     return $sce.trustAsHtml(snippet);
   };
  // 申訴視窗
  $scope.showAppeal = function(ev) {
    $mdDialog.show({
      controller: AppealController,
      templateUrl: 'app/Dialog/appeal.tmpl.html',
      locals: {
        params: {
          'Passport': window.localStorage.getItem('Passport'),
          'RequisitionId': $scope.RequisitionId,
          'RepairInfo': $scope.RepairInfo,
          'Equipmentpos': $scope.Equipmentpos,
          'CauseList': $scope.CauseList,
          'PageTitle': $(document).find("title").text()
        }
      },
      targetEvent: ev,
    }).then(function(result) {
      // 通知刷新案件详情
      $scope.$broadcast("RepairList2Detail", result.RequisitionId);
      // 關閉案件詳情
      // $scope.closeDenav('RepairDetail');
      // 刷新案件列表
      $scope.$emit("ReloadSearch");
    }, function() {
      // $scope.alert = 'You cancelled the dialog.';
    });
  };
  //判断是否有使用申诉的权限
  $scope.getAppealBtnIsDisabled = function(RequisitionId) {
    $scope.AppealBtnIsDisabled = true;
    $scope.WPCaseAppealBtnIsDisabled = true;
    $scope.WPQuoteAppealBtnIsDisabled = true;
    // 结案后申诉
    $http({
      url: ApiMapper.sApi + '/s/appeal/isHasPermission/' + RequisitionId,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      $scope.AppealBtnIsDisabled = !data;
    }).error(function(msg) {
      alert(JSON.stringify(msg));
    });
    // 结案待确认申诉 0維修申訴
    $http({
      url: ApiMapper.sApi + '/s/appeal/before/isHasPermission/0/' + RequisitionId,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      $scope.WPCaseAppealBtnIsDisabled = !data;
    }).error(function(msg) {
      alert(JSON.stringify(msg));
    });
    // 结案待确认申诉 1費用申訴
    $http({
      url: ApiMapper.sApi + '/s/appeal/before/isHasPermission/1/' + RequisitionId,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      $scope.WPQuoteAppealBtnIsDisabled = !data;
    }).error(function(msg) {
      alert(JSON.stringify(msg));
    });
  };
  $scope.showConfirmationAppeal = function(type) {
    var clickedItem = {};
    if (type == 1) {
      clickedItem = {
        name: '维修申诉',
        stageId: '-97'
      };
    } else {
      clickedItem = {
        name: '费用申诉',
        stageId: '-98'
      };
    };
    $mdDialog.show({
      controller: AddHistoryController,
      templateUrl: 'app/Dialog/addHistory.tmpl.html',
      locals: {
        params: {
          'Passport': window.localStorage.getItem('Passport'),
          'RequisitionId': $scope.RequisitionId,
          'RepairInfo': $scope.RepairInfo,
          'Equipmentpos': $scope.Equipmentpos,
          'CauseList': $scope.CauseList,
          'PageTitle': $(document).find("title").text(),
          'CaseType': clickedItem
        }
      },
      // targetEvent: ev,
    }).then(function(result) {
      // 通知刷新案件详情
      $scope.$broadcast("RepairList2Detail", result.RequisitionId);
      // 刷新案件列表
      $scope.$emit("ReloadSearch");
    }, function() {
      // $scope.alert = 'You cancelled the dialog.';
    });
  };
  $scope.showListBottomSheet = function($event) {
    $mdBottomSheet.show({
      templateUrl: 'bottom-sheet-list-template.html',
      controller: ListBottomSheetCtrl,
      targetEvent: $event
    }).then(function(clickedItem) {
      $mdDialog.show({
        controller: AddHistoryController,
        templateUrl: 'app/Dialog/addHistory.tmpl.html',
        locals: {
          params: {
            'Passport': window.localStorage.getItem('Passport'),
            'RequisitionId': $scope.RequisitionId,
            'RepairInfo': $scope.RepairInfo,
            'Equipmentpos': $scope.Equipmentpos,
            'CauseList': $scope.CauseList,
            'PageTitle': $(document).find("title").text(),
            'CaseType': clickedItem
          }
        },
        // targetEvent: ev,
      }).then(function(result) {
        // 通知刷新案件详情
        $scope.$broadcast("RepairList2Detail", result.RequisitionId);
        // 刷新案件列表
        $scope.$emit("ReloadSearch");
      }, function() {
        // $scope.alert = 'You cancelled the dialog.';
      });
    });
    setTimeout(function() {
      $('md-bottom-sheet').css('z-index', 3000);
      $('.md-bottom-sheet-backdrop').css('z-index', 2999);
    }, 500);
  };
  //关闭 Sidenav
  $scope.CloseSidenav = function(navID) {
    $mdSidenav(navID).close().then(function() {
      //$log.debug("close RIGHT is done");
    });
  };
  //获取报修原因
  $scope.GetCause = function() {
    var CauseList = [];
    var pattern = /\\n\\r/g;
    if ($scope.RepairInfo.ICauseIds != null) {
      if ($scope.RepairInfo.ICauseIds.length > 0) {
        if ($scope.RepairInfo.MaintainerId == null || $scope.RepairInfo.MaintainerId == "") {
          $scope.RepairInfo.MaintainerId = 'None';
        }
        $http({
          url: ApiMapper.sApi + '/s/equipmentcause/' + $scope.RepairInfo.EquipmentId + '/' + $scope.RepairInfo.MaintainerId,
          method: 'GET',
          contentType: 'application/json',
          headers: {
            'Passport': $scope.Passport
          },
          data: JSON.stringify({
            'EquipmentTypeId': $scope.RepairInfo.EquipmentTypeId,
            'EquipmentName': $scope.RepairInfo.EquipmentName
          })
        }).success(function(List, status) {
          var Description = $scope.RepairInfo.ICauseIds;
          //_(List).forEach(function (Item) {
          _.forEach(List.children,function(Item01) {
            if (Description.indexOf(Item01.CauseId) >= 0) {
              CauseList.push(Item01.Cause);
            }
          });
          //});
          if ($scope.RepairInfo.Description != '') {
            CauseList.push($scope.RepairInfo.Description);
          }
          $scope.CauseList = CauseList.toString();
          $scope.CauseList = $scope.CauseList.replace(pattern, "<br>");
        }).error(function(List, status) {});
      }
    } else if ($scope.RepairInfo.Description != '') {
      CauseList.push($scope.RepairInfo.Description);
      $scope.CauseList = CauseList.toString();
      $scope.CauseList = $scope.CauseList.replace(pattern, "<br>");
    }
  };
  //格式化案件详情内容
  $scope.FormatDetailInfo = function(RepairDetails) {
    $scope.RepairInfo = RepairDetails.Requisition; //报修单详细信息     
    console.log('報修單詳細訊息');
    console.log($scope.RepairInfo);
    var TitleName = "85°C单位报修案件详情";
    if ($scope.CompanyId != "308ffed8-d4a7-4ad5-8b61-6cce3c66cd06") {
      TitleName = "王品报修案件详情";
    };
    //指派厂商联系人与电话
    if (RepairDetails.MaintainerInfo != null && RepairDetails.MaintainerInfo != "") {
      $scope.RepairInfo.MaintainerInfo = RepairDetails.MaintainerInfo;
      if ($scope.RepairInfo.MaintainerInfo.Liaisons != null && $scope.RepairInfo.MaintainerInfo.Liaisons != "") {
        _.forEach($scope.RepairInfo.MaintainerInfo.Liaisons,function(Item) {
          if (Item.Email != "" && Item.Email != null) {
            Item.Email = Item.Email.split(',');
          }
        });
      }
      $scope.RepairInfo.MaintainerName = RepairDetails.MaintainerInfo.MaintainerName;
      $scope.RepairInfo.StrongholdName = RepairDetails.MaintainerInfo.StrongholderName;
    };
    var shareDate = {
      title: TitleName, // 分享标题
      desc: $scope.RepairInfo.CaseNo + '\n\r' + $scope.RepairInfo.Unit + '\n\r[' + $scope.RepairInfo.EquipmentCode + ']' + $scope.RepairInfo.EquipmentName + '\n\r' + $scope.RepairInfo.Priority, // 分享描述
      link: ApiMapper.PathStr + 'Share_Detail.html?requisitionId=' + $scope.RequisitionId // 分享链接
      //imgUrl: '', // 分享图标
    };
    wx.ready(function() {
      wx.onMenuShareAppMessage(shareDate); //分享给朋友
      wx.onMenuShareTimeline(shareDate); //分享到朋友圈
      wx.onMenuShareQQ(shareDate); //分享到QQ
    });
    if ($scope.RepairInfo.EstArrivalTime != null && $scope.RepairInfo.EstArrivalTime != "") $scope.RepairInfo.EstArrivalTime = $filter('date')($scope.RepairInfo.EstArrivalTime, 'yyyy/MM/dd HH:mm:ss');
    if ($scope.RepairInfo.DateA != null && $scope.RepairInfo.DateA != "") $scope.RepairInfo.DateA = $filter('date')($scope.RepairInfo.DateA, 'yyyy/MM/dd HH:mm:ss');
    $scope.RepairInfo.IntervalAB = $scope.M2H($scope.RepairInfo.IntervalAB);
    $scope.RepairInfo.IntervalBC = $scope.M2H($scope.RepairInfo.IntervalBC);
    $scope.RepairInfo.IntervalCD = $scope.M2H($scope.RepairInfo.IntervalCD);
    $scope.RepairInfo.IntervalAD = $scope.M2H($scope.RepairInfo.IntervalAD);
    //报修图片
    if ($scope.RepairInfo.RequestFiles.length > 0) {
      _.forEach($scope.RepairInfo.RequestFiles,function(ThumbItem) {
        if (ThumbItem.Type == 1) {
          $scope.IsThumbs_Request = true;
          ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
          ThumbItem.thumb = ThumbItem.FilePath;
          ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
          $scope.ThumbList.push(ThumbItem);
        } else {
          $scope.isShowVoice = true;
          $scope.Voice = {
            "Thumbnail": ApiMapper.FileApi + '/' + ThumbItem.FilePath
          };
          $scope.audioLoading(); //加载录音档
        }
      });
    };
    //维修后图片
    if ($scope.RepairInfo.ResponseFiles.length > 0) {
      _.forEach($scope.RepairInfo.ResponseFiles,function(ThumbItem) {
        if (ThumbItem.Type == 1) {
          $scope.IsThumbs_Response = true;
          ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
          ThumbItem.thumb = ThumbItem.FilePath;
          ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
          $scope.ThumbList_Response.push(ThumbItem);
        }
      });
    };
    //报修单进度列表
    if (RepairDetails.Histories.length > 0) {
      $scope._TableData = _(RepairDetails.Histories).map(function(Item) {
        _.forEach(Item.Thumbnail,function(ThumbItem, i) {
          ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
          ThumbItem.Src = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
          ThumbItem.thumb = ThumbItem.FilePath;
          ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
        });
        if (Item.Voice.length == 1) {
          Item.Voice[0].IsPlay = false;
        };
        return Item;
      });
      $scope._TableData = RepairDetails.Histories;
      $scope.isTimeline = true;
    };
    // 是否能新增历程
    if ($scope.RepairInfo.StageId != -1 && $scope.RepairInfo.StageId != 1 && $scope.RepairInfo.StageId != 100 && $scope.RepairInfo.StageId != -100) {
      $scope.IsToAddForHistory = true;
    } else {
      $scope.IsToAddForHistory = false;
    };
    if ($scope.RepairInfo.DateE != "null" && $scope.RepairInfo.DateE != null && $scope.RepairInfo.DateE != '') {
      $scope.IsToAddForHistory = false;
    };
    $scope.IsUseConfirmStaff = false;
    if (['eb296708-6fc6-43f0-b506-0ca0fa91e1cd', 'c1a24352-46a1-4301-9b96-a67c92691336', '6c690014-2571-48db-ac5a-c6ba2572a3bb', 'f96f98e2-38f9-456a-9813-82d899536a82'].indexOf($scope.RepairInfo.CompanyId) > -1) {
      $scope.IsUseConfirmStaff = true;
    };
    $scope.GetCause();
    $scope.GetEquipmentpos();
    $scope.getAppealBtnIsDisabled($scope.RepairInfo.RequisitionId);
  };
  //加载案件详情
  $scope.GetDetail = function(Id) {
    $scope.RepairInfo = {};
    $scope.CheckedIds = [];
    $scope.IsThumbs_Response = false;
    $scope.ThumbList_Response = [];
    $scope.isShowVoice = false;
    $scope.IsThumbs_Request = false;
    $scope.ThumbList = [];
    $http({
      url: ApiMapper.sApi + '/s/rez/' + Id + '/0',
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) { //alert(JSON.stringify(data));
      $scope.FormatDetailInfo(data);
      $scope.isShow = true;
      //获取报修原因与备注
      $scope.GetUnitInfo();
      //$scope.getHistory();
      $scope.GetQuote(); //报价
      $scope.GetPay(); //请款
      $scope.GetAccrual(); //计提
    }).error(function(data) {
      alert(JSON.stringify(data));
    });
  };
  //获取区域(案件详情)
  $scope.GetEquipmentpos = function() {
    if ($scope.RepairInfo.IPositionIds != null) {
      var IPositionIds = $scope.RepairInfo.IPositionIds;
      if (IPositionIds != '') {
        $http({
          url: ApiMapper.sApi + '/s/equipmentpos/' + $scope.RepairInfo.EquipmentId,
          method: 'GET',
          contentType: 'application/json',
          headers: {
            'Passport': $scope.Passport
          },
          cache: false
        }).success(function(data) {
          $scope.Equipmentpos = _(data).filter(function(Item) {
            return IPositionIds.indexOf(Item.PositionId) >= 0;
          });
        });
      }
    }
  };
  //获取单位信息
  $scope.GetUnitInfo = function() {
    //获取部门信息
    $http({
      url: ApiMapper.sApi + '/s/unit/' + $scope.RepairInfo.UnitId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      cache: false
    }).success(function(data) {
      $scope.userInfo = {
        address: "",
        tel: ""
      };
      //判斷是不是散戶 IsRetail == 1 代表散戶
      if ($scope.RepairInfo.IsRetail == 1) {
        $scope.userInfo.tel = $scope.RepairInfo.UserId;
        $scope.userInfo.address = $scope.RepairInfo.Address;
      } else {
        $scope.userInfo.address = data.FullAddress;
        //$scope.userInfo.tel = data.IPhoneNos[0];
        if (typeof data.IPhoneNos != "null" && data.IPhoneNos != null) {
          $scope.userInfo.tel = data.IPhoneNos.toString();
        }
      }
    });
  };
  //接收父控制器广播，刷新案件详情
  $scope.$on("RepairList2Detail", function(event, data) {
    $scope.RequisitionId = data;
    $scope.GetDetail($scope.RequisitionId);
  });
  if ($scope.RequisitionId == "" || $scope.RequisitionId == null || $scope.RequisitionId == "null") {
    $scope.RequisitionId = $scope.UrlStr.split('?requisitionId=')[1];
    if ($scope.RequisitionId != undefined && $scope.RequisitionId != "undefined") {
      $scope.RequisitionId = $scope.RequisitionId.split('&')[0];
      $scope.GetDetail($scope.RequisitionId);
    }
  }
  $scope.ShowImg = function(Id) {
    $('#ShowImg').attr({
      'src': ApiMapper.ccApi + '/cc/image/' + Id
    });
  };
  //获取留言
  $scope.GetVoice = function(Id) {
    $http({
      url: ApiMapper.ccApi + '/cc/voicefile/' + Id,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      if (data.length > 0) {
        $scope.isShowVoice = true;
        $scope.Voice = data[0];
        $scope.Voice.Thumbnail = ApiMapper.ccApi + $scope.Voice.Thumbnail;
        $scope.audioLoading(); //加载录音档
      } else {
        $scope.isShowVoice = false;
      }
    });
  };
  //加载录音档
  $scope.audioLoading = function() {
    $scope.playing = false;
    $scope.audio = document.createElement('audio');
    $scope.audio.src = $scope.Voice.Thumbnail;
    $scope.audio.addEventListener('ended', function() {
      $scope.$apply(function() {
        $scope.stop()
      });
    });
  };
  //播放录音
  $scope.play = function() {
    if (!$scope.playing) {
      $scope.audio = document.createElement('audio');
      $scope.audio.src = $scope.Voice.Thumbnail;
      $scope.audio.addEventListener('ended', function() {
        $scope.$apply(function() {
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
  $scope.stop = function() {
    $scope.audio.pause();
    $scope.playing = false;
  };
  //加载报修进度图片
  $scope.ListShowImg = function(n, i) {
    var imgStr = ApiMapper.ccApi + '/' + $scope._TableData[n].Thumbnail[i].FilePath;
    $('#List_' + n + '_' + i).attr({
      'src': imgStr
    });
  };
  // //播放报修进度留言
  // $scope.PlayVoice = function (Id) {
  //     if (!$scope.playing) {
  //         $http({
  //             url: ApiMapper.ccApi + '/cc/voicefile/' + Id,
  //             method: 'GET',
  //             contentType: 'application/json',
  //             headers: {
  //                 'Passport': $scope.Passport
  //             }
  //         }).success(function (data) {
  //             if (data.length > 0) {
  //                 $scope.isShowVoice = true;
  //                 $scope.Voice = data[0];
  //                 $scope.Voice.Thumbnail = ApiMapper.ccApi + "/" + $scope.Voice.Thumbnail;
  //                 //加载录音档
  //                 $scope.audio = document.createElement('audio');
  //                 $scope.audio.src = $scope.Voice.Thumbnail;
  //                 $scope.audio.addEventListener('ended', function () {
  //                     $scope.$apply(function () {
  //                         $scope.stop()
  //                     });
  //                 });
  //                 $scope.audio.play();
  //                 $scope.playing = true;
  //             } else {
  //                 $scope.isShowVoice = true;
  //             }
  //         });
  //     } else {
  //         $scope.audio.pause();
  //         $scope.playing = false;
  //     }
  // };
  //播放报修进度留言
  $scope.PlayVoice = function(Item, FilePath, index) {
    Item.IsPlay = true;
    $scope.HistoryAudio = {
      'audio': '',
      'index': index
    };
    $scope.HistoryAudio.audio = document.createElement('audio');
    $scope.HistoryAudio.audio.src = ApiMapper.FileApi + "/" + FilePath;
    $scope.HistoryAudio.audio.play();
    $scope.HistoryAudio.audio.addEventListener('ended', function() {
      $scope.$apply(function() {
        $scope._TableData[$scope.HistoryAudio.index].Voice[0].IsPlay = false;
        $scope.HistoryAudio.audio.pause();
      });
    });
  };
  $scope.StopVoice = function(Item) {
    Item.IsPlay = false;
    $scope.HistoryAudio.audio.pause();
  };
  //报价
  $scope.GetQuote = function() {
    $scope.QuoteInfo = {
      'ApplyPrice': "-",
      'ApprovePrice': "-",
      'OnGoing': "-",
      'Closed': "-",
      'OnGoingQuotes': [],
      'ClosedQuotes': []
    };
    $http({
      url: ApiMapper.sApi + '/s/quote/' + $scope.RepairInfo.RequisitionId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      _.forEach(data.OnGoingQuotes,function(Item) {
        if (Item.CreatedTime != null && Item.CreatedTime != "") {
          Item.CreatedTime = $filter('date')(new Date(Item.CreatedTime), 'yyyy/MM/dd<br/>HH:mm');
        }
      });
      _.forEach(data.ClosedQuotes,function(Item) {
        if (Item.CreatedTime != null && Item.CreatedTime != "") {
          Item.CreatedTime = $filter('date')(new Date(Item.CreatedTime), 'yyyy/MM/dd<br/>HH:mm');
        }
      });
      $scope.QuoteInfo = data;
    });
  };
  //请款
  $scope.GetPay = function() {
    $scope.PayInfo = {
      "QuotePrice": '-',
      "SupplyPrice": '-',
      "ApplyPrice": '-',
      "CheckedPrice": '-',
      'Process': '-',
      "Approves": []
    };
    $http({
      url: ApiMapper.sApi + '/s/pay/' + $scope.RepairInfo.RequisitionId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      switch (data.Process) {
        case 1:
          data.ProcessName = '区维修专员';
          break;
        case 2:
          data.ProcessName = '区维修专员副理';
          break;
        case 3:
          data.ProcessName = '区工程主管';
          break;
        case 4:
          data.ProcessName = '总部工程部主管';
          break;
        case 5:
          data.ProcessName = '总部工程处主管';
          break;
        case 6:
          data.ProcessName = '营运经理';
          break;
        case 11:
          data.ProcessName = '品保主管';
          break;
        case 12:
          data.ProcessName = '店长';
          break;
        case 21:
          data.ProcessName = '区工程主管';
          break;
        case 100:
          data.ProcessName = '完成';
          break;
      }
      _.forEach(data.Approves,function(Item) {
        if (Item.CreatedTime != null && Item.CreatedTime != "") {
          Item.CreatedTime = $filter('date')(new Date(Item.CreatedTime), 'yyyy/MM/dd<br/>HH:mm');
          switch (Item.Result) {
            case 2:
              Item.ResultName = '同意';
              break;
            case 3:
              Item.ResultName = '驳回';
              break;
            case 5:
              Item.ResultName = '完成';
              break;
          }
        }
      });
      $scope.PayInfo = data;
    });
  };
  //计提
  $scope.GetAccrual = function() {
    $scope.AccrualInfo = {
      "Type": '-',
      "TypeName": '',
      "Process": '-',
      "ProcessName": '',
      "Approves": []
    };
    $http({
      url: ApiMapper.sApi + '/s/accrual/' + $scope.RepairInfo.RequisitionId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      if (data.Type == 0) data.TypeName = '一般';
      else if (data.Type == 1) data.TypeName = '巡检';
      else if (data.Type == 2) data.TypeName = '统包';
      switch (data.Process) {
        case 1:
          data.ProcessName = '区工程主管';
          break;
        case 2:
          data.ProcessName = '区总';
          break;
        case 11:
          data.ProcessName = '品保主管';
          break;
        case 12:
          data.ProcessName = '店长';
          break;
        case 21:
          data.ProcessName = '区工程主管';
          break;
        case 22:
          data.ProcessName = '总部工程处主管';
          break;
        case 100:
          data.ProcessName = '完成';
          break;
      }
      _.forEach(data.Approves,function(Item) {
        if (Item.CreatedTime != null && Item.CreatedTime != "") {
          Item.CreatedTime = $filter('date')(new Date(Item.CreatedTime), 'yyyy/MM/dd<br/>HH:mm');
          switch (Item.Result) {
            case 2:
              Item.ResultName = '同意';
              break;
            case 3:
              Item.ResultName = '驳回';
              break;
            case 5:
              Item.ResultName = '完成';
              break;
          }
        }
      });
      $scope.AccrualInfo = data;
    });
  };
  //时间格式
  $scope.FormatDATE = function(date) {
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
  $scope.toggleDenav = function(navID) {
    if ((navID == 'right-Area' || navID == 'Maintainer') && $scope.SearhParams.UnitIds.length == 0) {
      alert('请先选择单位！');
      return false;
    }
    //swipe事件class的判断条件
    if (navID == 'right_cancel_sign') {
      $scope.swipeState = true;
    } else {
      $scope.swipeState = false;
    }
    $mdSidenav(navID).toggle();
  };

  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function() {
      $mdSidenav(navID).then(function() {});
    }, 300);
    return debounceFn;
  };
  //關閉頁面
  $scope.closeDenav = function(navID) {
    $scope.swipeState = false;
    $mdSidenav(navID).close().then(function() {
      $mdSidenav('MoveDetail').close();
    });
  };
  //控制icon變化
  $scope.change_openicon = function() {
    $scope.CollapseState = !$scope.CollapseState;
  }
  //时间转换(分钟转为小时)
  $scope.M2H = function(mm) {
    var hh = 0;
    var _mm = 0;
    hh = mm / 60;
    _mm = mm % 60 * 100 / 60;
    hh = '' + hh + '.' + _mm;
    return parseFloat(hh).toFixed(2);
  };
  $scope.previewImage = function(page, imgList) {
    var MyCurrent = imgList[page].img;
    var MyUrls = [];
    _.forEach(imgList,function(item) {
      MyUrls.push(item.img)
    });
    wx.previewImage({
      current: MyCurrent, // 当前显示图片的http链接
      urls: MyUrls // 需要预览的图片http链接列表
    });
  };
  //打开设备调拨详情
  $scope.moveOrder;
  $scope.moveHist = [];
  $scope.openMoveOrderDetail = function (moveOrderId) {
    var moveTypeName = ["unknown", "设备调拨", "返厂维修"];
    var stepName = ["待发货", "已发货", "已收货", "已取消"];
    var stepName4Histories = ["申请", "发货", "收货", "取消"];
    $http({
      url: ApiMapper.sApi + '/s/moveOder/detail/' + moveOrderId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function (res) {
      $scope.moveOrder = res.MoveOrder;
      $scope.moveOrder.CurrentStepName = stepName[res.MoveOrder.CurrentStep];
      $scope.moveOrder.MoveTypeName = moveTypeName[res.MoveOrder.MoveType];

      $scope.moveHist = _.forEach(res.MoveOrderHistories, item => {
        item.tlType = "tl-item";
        item.tlSubType = "tl-wrap b-info";
        item.StepTime = stepName4Histories[item.Step];
      });
      $mdSidenav('MoveDetail').toggle();
    }).error(function (List, status) {});
  };


}]);