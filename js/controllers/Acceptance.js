'use strict';

WeChat.controller('AcceptanceCtrl', function($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $cacheFactory, $filter, $sce, $mdDialog) {

  $scope.OrderbyParames = [{
    "name": "DateM",
    "OrderBy": 1
  }, {
    "name": "OverTimeInterval",
    "OrderBy": 0
  }];
  $scope.SearhParams = {
    'RezConditions': [3, 8, 32],
    'CheckIn': 1,
    'UnitIds': [],
    'MaintainerIds': [],
    'EquipmentIds': [],
    'FuzzyCaseCode': null,
    'Emergency': [0, 1, 2],
    'IsInspection': 2,
    'Orders': $scope.OrderbyParames
  };
  $scope.UserId = $cookies.UserId;
  $scope.StoreUser = $cookies.StoreUser;
  $scope.AppId = ApiMapper.AppId;
  $scope.Passport = window.localStorage.getItem('Passport');
  $scope.UrlStr = $(location).attr('search') || "Unknown";
  $scope.RequisitionId = $scope.UrlStr.split('?requisitionId=')[1];
  if ($scope.RequisitionId != undefined && $scope.RequisitionId != "undefined") {
    $scope.RequisitionId = $scope.RequisitionId.split('&')[0];
  }
  if ($(location).attr('href').indexOf("sign_in") > 0) {
    $scope.CaseNO = 1;
    $scope.isQrcode = true;
  } else {
    $scope.CaseNO = 2;
    $scope.isQrcode = false;
  }
  $scope.tabName;
  $scope.tabId;
  $scope.Select2List = [{
    "Id": "",
    "Text": ""
  }];
  $scope.SelectedList01 = [];
  $scope.SelectedList02 = [];
  $scope.SelectedList03 = [];
  $scope.Select2Data01 = [];
  $scope.Select2Data02 = [];
  $scope.Select2Data03 = [];
  $scope.StoreSelectedList = [];
  $scope.MaintainerSelectedList = [];
  $scope.EquipmentSelectedList = [];
  $scope.UnitIds = [];
  $scope.MaintainerIds = [];
  $scope.StrongholdIds = [];
  $scope.Equipments = [];
  $scope.Select2Data = [];
  $scope.Select2SelectedList = [];
  $scope.isSubmit = false;
  $scope.imagesList = {
    'localIds': [],
    'serverIds': []
  };
  $scope.imagesWOList = {
    'localIds': [],
    'serverIds': []
  };
  $scope.tabName = "单位";
  $scope.tabId = "Store";

  $scope.pcompanyList = [];
  $scope.StoreList = [];
  $scope.RepairList = [];
  $scope.RepairInfo = {};
  $scope.RequisitionIds = [];
  $scope.AreasSelected = [];
  $scope.itemsAreaStr = [];
  $scope.CheckedIds = [];
  $scope.RepairListSelected = [];
  $scope.currentPage = 1;
  $scope.isLoading = false;
  $scope.isSend4Ajax = false;
  $scope.isAllSelected = false;
  $scope.isShowMore = false;
  $scope.longPressSta = true;
  $scope.isShowList = false;
  $scope.isShowDetail = false;
  $scope.IsUItoWP = false; // 是否王品
  $scope.pcompanyName = '';
  $scope.EquipmentName = '';
  $scope.Unit = '请选择单位';
  $scope.RepairCounts = 0;
  $scope.WPUIpage = 'selectPage' // 王品跳轉頁面
  $scope.Survey = {
    v: 5
  };
  $scope.Survey1 = {
    v: 5
  };
  $scope.RequisitionStatus = {
    "Filing": false,
    "Assignment": true,
    "InStore": false,
    'Pending': false,
    'Overtime': false
  };
  //左邊功能選單
  $scope.SearchTitle;
  //左邊功能選單
  $scope.SidenavList = [{
    "name": "进阶查询",
    "Event": "Muti"
  }, {
    "name": "单号查询",
    "Event": "No"
  }];
  // 2019/03/15 调整查询与排序UI
  $scope.RequestTime = {
    "StartDate": null,
    "EndDate": null
  };
  $scope.Emergency = {
    'Yes': true,
    'Normal': true,
    'DontCare': true
  };
  $scope.RequisitionStatus = {
    "Filing": false,
    "Assignment": true,
    "InStore": true,
    "Acceptance": false,
    "Revocation": false,
    "OnConfirm": false,
    "OnProcess": false,
    "RawMaterialPending": false
  };
  $scope.EquipmentList = [];
  $scope.menuName = "二维码签到";
  $scope.QRCodeUri = "#";
  $scope.isShowCode = false;
  // 判斷是否為巡檢
  $scope.IsInspection = 0;
  $scope.SetStatus = function() {
    $timeout(function() {
      $scope.SearhParams.RezConditions = [];
      $scope.RequisitionStatus.Pending ? $scope.SearhParams.RezConditions.push(32) : '';
      $scope.RequisitionStatus.Filing ? $scope.SearhParams.RezConditions.push(2) : '';
      $scope.RequisitionStatus.Assignment ? $scope.SearhParams.RezConditions.push(3) : '';
      $scope.RequisitionStatus.InStore ? $scope.SearhParams.RezConditions.push(8) : '';
      $scope.RequisitionStatus.Overtime ? $scope.SearhParams.Overtime = 1 : $scope.SearhParams.Overtime = 0;

      $scope.ForCallback();
    }, 100);
  };

  $scope.FormatLogoURI = FormatLogoURI;
  //设定微信调用
  $scope.Load_WX = function() {
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
  $scope.deliberatelyTrustDangerousSnippet = function(snippet) {
    return $sce.trustAsHtml(snippet);
  };
  $scope.$watch('longPressSta', function(v) {
    if (v) {
      _($scope.RepairList).each(function(Item) {
        Item.swipeState = false;
        Item.Selected = false;
      });
    }
  });
  $scope.$watch("isQrcode", function(v) {
    if (v) {
      $scope.SearhParams.RezConditions = [3, 8];
      $scope.CaseNO = 1;
    } else {
      $scope.SearhParams.RezConditions = [3, 8, 32];
      $scope.CaseNO = 2;
    }
  });
  var Func_Timeouter_Lock;
  $scope.Repair_Time = function(Tag) {
    if ($scope.TimesForLock == 100) {
      $timeout.cancel(Func_Timeouter_Lock);
      $scope.TimesForLock = 0;
      if (Tag == "S") {
        $scope.SearchRepair(1);
        $scope.GetProvider();
      } else {
        $scope.GetEquipment4Areas();
      }
    } else {
      $scope.TimesForLock = $scope.TimesForLock + 1;
      Func_Timeouter_Lock = $timeout(function() {
        $scope.Repair_Time(Tag);
      }, 1);
    }
  };
  //获取当前时间
  $scope.GetNow = function() {
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
  $scope.FormatDateTime = function(date) {
    var a = date.split(/[^0-9]/);
    var d = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
    var myDate = new Date(d);
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
  $scope.FormatDate = function(date) {
    console.log(date.toString());
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
  //报修时限
  $scope.EmergencyName = "全部";
  $scope.EmergencyIds = [0, 1, 2];
  $scope.InspectionName = "全部";
  $scope.IsInspection = 2;
  //取得門店資料
  $scope.GetStore = function() {
    $http({
      url: ApiMapper.sApi + '/s/unit/maps',
      method: 'GET',
      cache: false,
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(Unitdata) {
      $scope.StoreList = [];
      $scope.Unitdata = Unitdata;
      _($scope.Unitdata[1]).each(function(Item1) {
        $scope.StoreList.push({
          'Id': Item1.UnitId,
          'Text': Item1.Unit,
          'isSelected': false,
          'Level1': '',
          'Level2': '',
          'UnitLevel': 10
        });
        _($scope.Unitdata[2]).each(function(Item2) {
          if (Item2.Level2 == Item1.UnitId) {
            $scope.StoreList.push({
              'Id': Item2.UnitId,
              'Text': '　' + Item2.Unit,
              'isSelected': false,
              'Level1': '',
              'Level2': '',
              'UnitLevel': 20
            });
            _($scope.Unitdata[3]).each(function(Item3) {
              if (Item3.Level3 == Item2.UnitId) {
                $scope.StoreList.push({
                  'Id': Item3.UnitId,
                  'Text': '　　' + Item3.Unit,
                  'isSelected': false,
                  'Level1': Item1.UnitId,
                  'Level2': Item2.UnitId,
                  'UnitLevel': 100
                });
              }
              if (Item3.UnitId == $cookies.UnitId) {
                $scope.SearhParams.UnitIds.push(Item3.UnitId);
                $scope.UnitIds.push(Item3.UnitId);
                $scope.Unit = Item3.Unit;
                $scope.Select2List = [{
                  "Id": Item3.UnitId,
                  "Text": Item3.Unit
                }];
                $scope.StoreSelectedList = $scope.Select2List;
                $scope.SelectedList01 = $scope.Select2List;
                $scope.GetEquipment4Areas();
                $scope.GetProvider();
              }
            });
          }
        });
        //$scope.StoreList.push(ParentItem); 
      });
      $scope.Select2Data01 = $scope.StoreList;
      // $scope.SearchRepair(1);
      // if ($scope.RequisitionId != undefined && $scope.RequisitionId != "undefined") {
      //   var RepairItem = {
      //     "RequisitionId": $scope.RequisitionId,
      //     "swipeState": false
      //   };
      //   $scope.WPUIpage = "listPage";
      //   $scope.GetDetail(RepairItem, "Detail", '0');
      // }
    });
  };
  //取得维修商資料
  $scope.GetProvider = function() {
    if ($scope.UnitIds.length > 0) {
      $http({
        url: ApiMapper.sApi + '/s/rez/misc/spCategory',
        method: 'POST',
        cache: false,
        contentType: 'application/json',
        headers: {
          'Passport': $scope.Passport
        },
        data: {
          'UnitIds': $scope.UnitIds,
          'RequisitionStatus': [1, 2, 4, 5, 6]
        }
      }).success(function(Unitdata) {
        $scope.pcompanyName = '';
        $scope.pcompanyList = [];
        _(Unitdata).each(function(Item) {
          $scope.pcompanyList.push({
            'Id': Item.MaintainerId,
            'Text': Item.MaintainerName,
            'isSelected': false
          });
          $scope.Select2Data02.push({
            'Id': Item.MaintainerId,
            'Text': Item.MaintainerName,
            'isSelected': false
          });
        });
      });
    }
  };

  //获取设备类别和设备
  $scope.GetEquipment4Areas = function() {
    //$scope.SearhParams.positionIds = $scope.AreasSelected;
    $scope.EquipmentList = [];
    $http({
      url: ApiMapper.sApi + '/s/rez/misc/etCategory',
      cache: false,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: JSON.stringify({
        'UnitIds': $scope.UnitIds,
        'RequisitionStatus': [1, 2, 4, 5, 6]
      })
    }).success(function(data) {
      _(data).each(function(Lists) {
        $scope.EquipmentList.push({
          'Id': Lists.EquipmentId,
          'Text': Lists.EquipmentName,
          'isSelected': false
        });
        $scope.Select2Data03.push({
          'Id': Lists.EquipmentId,
          'Text': Lists.EquipmentName,
          'isSelected': false
        });
      });
    }).error(function(data) {
      $scope.isShowList = true;
    });
  };

  //禁用按钮
  $scope.isShowButton = function(Tag, n) {
    if (Tag == "ADD") {
      if ($scope.Select2List[n].Id == "") {
        return true;
      } else if (n == 0 && $scope.Select2List.length > 1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (n == 0 && $scope.Select2List.length == 1 && $scope.Select2List[n].Id == "") {
        return true;
      } else {
        return false;
      }
    }
  };
  //新增报修项目
  $scope.AddToSelect2 = function(Index) {
    if (!$scope.isShowButton('ADD', Index)) {
      $timeout(function() {
        $scope.Select2List.push({
          'Id': '',
          'text': ''
        });
        $timeout(function() {
          $("[name=single]").select2({
            placeholder: "请输入关键字!" //,
            //matcher: function (term, text, opt) {
            //    return text.toUpperCase().indexOf(term.toUpperCase()) >= 0
            //        || opt.attr("value").toUpperCase().indexOf(term.toUpperCase()) >= 0;
            //}
          })
        }, 300);
      }, 200);
    }
  };
  //删除报修项目
  $scope.RemoveForSelect2 = function(Index) {
    if (!$scope.isShowButton('Delete', Index)) {
      if ($scope.Select2List.length > 1) {
        $scope.Select2List.splice(Index, 1);
      } else {
        $scope.Select2List = [{
          "Id": "",
          "Text": ""
        }];
        if ($scope.tabId == "Store") {
          $scope.Select2Data01 = [];
          $scope.SelectedList01 = [];
        } else if ($scope.tabId == "Maintainer") {
          $scope.Select2Data02 = [];
          $scope.SelectedList02 = [];
        } else {
          $scope.Select2Data03 = [];
          $scope.SelectedList03 = [];
        }
        $timeout(function() {
          $("[name=single]").select2({
            placeholder: "请输入关键字!"
          });
        }, 200);
      }
    }
  };
  //加载进阶选择页签于资料
  $scope.LoadMnti = function(n) {
    if (parseInt(n) == 0) {
      $scope.tabName = "单位";
      $scope.tabId = "Store";
      $scope.Select2Data = $scope.StoreList;
      if ($scope.SelectedList01.length > 0) {
        $scope.Select2List = $scope.SelectedList01;
      } else {
        $scope.Select2List = [{
          "Id": "",
          "Text": ""
        }];
      }

    } else if (parseInt(n) == 1) {
      $scope.tabName = "维修商";
      $scope.tabId = "Maintainer";
      $scope.Select2Data = $scope.pcompanyList;
      if ($scope.SelectedList02.length > 0) {
        $scope.Select2List = $scope.SelectedList02;
      } else {
        $scope.Select2List = [{
          "Id": "",
          "Text": ""
        }];
      }
    } else {
      $scope.tabName = "设施 / 设备";
      $scope.tabId = "Equipment";
      $scope.Select2Data = $scope.EquipmentList;
      if ($scope.SelectedList03.length > 0) {
        $scope.Select2List = $scope.SelectedList03;
      } else {
        $scope.Select2List = [{
          "Id": "",
          "Text": ""
        }];
      }
    }

    $timeout(function() {
      _($scope.Select2List).each(function(Item, n) {
        if (Item.Id != "") {
          var $example = $("[name=single]:eq(" + n + ")").select2({
            placeholder: "请输入关键字!"
          });
          $example.val(Item.Id).trigger("change");
        } else {
          $("[name=single]").select2({
            placeholder: "请输入关键字!"
          });
        }
      });
    }, 300);
  };
  //文本框获取焦点
  $scope.rSetSelect2Values = function(Item) {
    Item.isSelected = false;
    Item.Text = "";
    Item.Id = "";
  };
  //文本关键字查询--高亮
  $scope.SetFiterHighlight = function(Select2Item) {
    $scope.Select2Data = [];
    if ($scope.tabId == "Store") {
      _($scope.StoreList).each(function(Item) {
        var ItemObject = Item;
        var ItemText = Item.Text;
        ItemText = ItemText.replace("<span style='color:red;'>", "");
        Item.Text = ItemText.replace("</span>", "");
        if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text) >= 0) {
          var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
          ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
          $scope.Select2Data.push({
            'Id': Item.Id,
            'Text': ItemText.replace(Select2Item.Text, nTextStr)
          });

          ItemText = ItemText.replace("<span style='color:red;'>", "");
          Item.Text = ItemText.replace("</span>", "");
        }
      });
    } else if ($scope.tabId == "Maintainer") {
      _($scope.pcompanyList).each(function(Item) {
        var ItemObject = Item.Text;
        var ItemText = Item.Text;
        ItemText = ItemText.replace("<span style='color:red;'>", "");
        Item.Text = ItemText.replace("</span>", "");
        if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text) >= 0) {
          var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
          ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
          $scope.Select2Data.push({
            'Id': Item.Id,
            'Text': ItemText.replace(Select2Item.Text, nTextStr)
          });

          ItemText = ItemText.replace("<span style='color:red;'>", "");
          Item.Text = ItemText.replace("</span>", "");
        }
      });
    } else {
      _($scope.EquipmentList).each(function(Item) {
        var ItemObject = Item.Text;
        var ItemText = Item.Text;
        ItemText = ItemText.replace("<span style='color:red;'>", "");
        Item.Text = ItemText.replace("</span>", "");
        if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text) >= 0) {
          var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
          ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
          $scope.Select2Data.push({
            'Id': Item.Id,
            'Text': ItemText.replace(Select2Item.Text, nTextStr)
          });

          ItemText = ItemText.replace("<span style='color:red;'>", "");
          Item.Text = ItemText.replace("</span>", "");
        }
      });
    }
  };
  //设定Select2选中值
  $scope.SetSelect2Values = function(Item, n) {
    $(".NT_side_footer").removeClass('unfixed');
    Item.isSelected = !Item.isSelected;
    var ItemText = $scope.Select2Data[n].Text;
    ItemText = ItemText.replace("　", "");
    ItemText = ItemText.replace("　", "");
    ItemText = ItemText.replace("<span style='color:red;'>", "");
    ItemText = ItemText.replace("</span>", "");
    Item.Text = ItemText;
    Item.Id = $scope.Select2Data[n].Id;

    $timeout(function() {
      if ($scope.tabId == "Store") {
        $scope.Select2Data01 = $scope.Select2Data;
        $scope.SelectedList01 = _.uniq($scope.Select2List);
      } else if ($scope.tabId == "Maintainer") {
        $scope.Select2Data02 = $scope.Select2Data;
        $scope.SelectedList02 = $scope.Select2List;
      } else {
        $scope.Select2Data03 = $scope.Select2Data;
        $scope.SelectedList03 = $scope.Select2List;
      }
    }, 300);
  };
  //清除所有选择
  $scope.clearSelect2Values = function() {
    resetAllParams();
    $scope.Select2Data01 = $scope.StoreList;
    $scope.Select2Data02 = $scope.pcompanyList;
    $scope.Select2Data03 = $scope.EquipmentList;

    $scope.StoreSelectedList = [];
    $scope.MaintainerSelectedList = [];
    $scope.EquipmentSelectedList = [];
    _($scope.Select2List).each(function(Item, n) {
      Item.Id = "";
      Item.Text = "";
    });
    _($scope.Select2Data01).each(function(Item) {
      Item.isSelected = false;
    });
    _($scope.SelectedList01).each(function(Item) {
      Item.isSelected = false;
    });
    _($scope.SelectedList02).each(function(Item) {
      Item.isSelected = false;
    });
    _($scope.SelectedList03).each(function(Item) {
      Item.isSelected = false;
    });

    $scope.Unit = "";
    $scope.closeDenav('Multi');
    $scope.SearchRepair($scope.currentPage);
  };

  var resetAllParams = function() {
    $scope.RequestTime = {
      "StartDate": null,
      "EndDate": null
    };
    $scope.Emergency = {
      'Yes': true,
      'Normal': true,
      'DontCare': true
    };
    $scope.RequisitionStatus = {
      "Filing": false,
      "Assignment": true,
      "InStore": true,
      "Acceptance": false,
      "Revocation": false,
      "OnConfirm": false,
      "OnProcess": false,
      "RawMaterialPending": false
    };

    $scope.SearhParams = {
      'RezConditions': [3, 8, 32],
      'CheckIn': 1,
      'UnitIds': [],
      'MaintainerIds': [],
      'EquipmentIds': [],
      'FuzzyCaseCode': null,
      'Emergency': [0, 1, 2],
      'IsInspection': 2,
      'Orders': $scope.OrderbyParames
    };
  };
  //确认查询
  $scope.gotoSearch = function() {
    //$scope.StoreList = $scope.Select2Data01;
    //$scope.pcompanyList = $scope.Select2Data02;
    //$scope.EquipmentList = $scope.Select2Data03;
    $scope.SearhParams.UnitIds = [];
    $scope.SearhParams.MaintainerIds = [];
    $scope.SearhParams.EquipmentIds = [];
    var UnitName = [];
    _($scope.StoreSelectedList).each(function(Item) {
      UnitName.push(Item.Text);
      _($scope.StoreList).each(function(Areas) {
        if (Areas.Id == Item.Id || Item.Id == Areas.Level1 || Item.Id == Areas.Level2) {
          $scope.SearhParams.UnitIds.push(Areas.Id);
        }
      });
      $scope.SearhParams.UnitIds.push(Item.Id);
    });
    $scope.Unit = UnitName.toString();
    _($scope.MaintainerSelectedList).each(function(Item) {
      if (Item.Id != "" && Item.Id != null) {
        $scope.SearhParams.MaintainerIds.push(Item.Id);
      }
    });
    _($scope.EquipmentSelectedList).each(function(Item) {
      if (Item.Id != "" && Item.Id != null) {
        $scope.SearhParams.EquipmentIds.push(Item.Id);
      }
    });
    $scope.closeDenav('Multi');
    $scope.SearchRepair($scope.currentPage);
  };
  //清除所有选择
  $scope.clearSelect2Values4Item = function() {
    //$(".NT_side_footer").removeClass('unfixed');
    _($scope.Select2List).each(function(Item, n) {
      Item.Id = "";
      Item.Text = "";
    });
    _($scope.Select2Data).each(function(Item) {
      Item.isSelected = false;
    });
    if ($scope.tabId == "Store") {
      $scope.StoreList = $scope.Select2Data;
    } else if ($scope.tabId == "Maintainer") {
      $scope.pcompanyList = $scope.Select2Data;
    } else {
      $scope.EquipmentList = $scope.Select2Data;
    }
  };
  //获取下层资料
  $scope.loadSelect2Data4Item = function() {
    if ($scope.tabId == "Store") {
      $scope.StoreSelectedList = _.uniq($scope.SelectedList01);
      $scope.UnitIds = [];
      var UnitName = [];
      _($scope.StoreSelectedList).each(function(Item) {
        UnitName.push(Item.Text);
        _($scope.Select2Data01).each(function(Areas) {
          if (Areas.Id == Item.Id || Item.Id == Areas.Level1 || Item.Id == Areas.Level2) {
            $scope.UnitIds.push(Areas.Id);
          }
        });
        $scope.UnitIds.push(Item.Id);
      });
      $scope.GetProvider();
      $scope.GetEquipment4Areas();

      $scope.Unit = UnitName.toString();
      $scope.MaintainerSelectedList = [];
      $scope.EquipmentSelectedList = [];
    } else if ($scope.tabId == "Maintainer") {
      $scope.MaintainerSelectedList = $scope.SelectedList02;
    } else {
      $scope.EquipmentSelectedList = $scope.SelectedList03;
    }
  };
  //加载查询条件
  $scope.loadSearchParams = function(e) {
    if (e == "No") {
      //window.location.href = "search_no.html";
      $scope.Search4No = true;
      $scope.isShowNo = true;
      $scope.isShowMulti = false;
    } else {
      //window.location.href = "search_muti.html";
      $scope.Search4No = false;
      $scope.isShowNo = false;
      $scope.isShowMulti = true;
    }
  };
  //列表查询
  $scope.SearchRepair = function(currentPage) {
    $scope.isShowMore = false;

    if (parseInt(currentPage) > 0) {
      $scope.currentPage = currentPage;
    } else {
      $scope.currentPage = 1;
    }
    //加载更多内容不显示loading动画
    if ($scope.currentPage <= 1) {
      $scope.isLoading = true;
    }
    if ($scope.Search4No) {
      $scope.SearhParams.UnitIds = [];
      $scope.SearhParams.MaintainerIds = [];
      $scope.SearhParams.EquipmentIds = [];
    } else {
      $scope.SearhParams.RequestTime = [];
      $scope.RequestTime.StartDate == null ? '' : $scope.SearhParams.RequestTime.push($scope.RequestTime.StartDate);
      $scope.RequestTime.EndDate == null ? '' : $scope.SearhParams.RequestTime.push($scope.RequestTime.EndDate);
    }
    //排序
    //$scope.SearhParams.Orders = $scope.OrderbyParames;
    //设备报修时限
    //$scope.SearhParams.Emergency = $scope.EmergencyIds; //alert(JSON.stringify($scope.SearhParams));
    //$scope.SearhParams.IsInspection = $scope.IsInspection;

    $http({
      url: ApiMapper.sApi + '/s/rez/f/' + $scope.currentPage,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: JSON.stringify($scope.SearhParams)
    }).success(function(data) {

      if ($scope.currentPage == 1) {
        $scope.RepairList = [];
      }
      if (data[1].length > 0) {
        $scope.isShowDetail = true;
        $scope.RepairCounts = parseInt(data[0]);
        $scope.isShowMore = $scope.RepairCounts > 1 ? true : false;
        if ($scope.currentPage == $scope.RepairCounts) {
          $scope.isShowMore = false;
        }
        _(data[1]).each(function(Item) {
          Item.Selected = false;
          Item.swipeState = false;
          Item.showCode = false;
          Item.QRCodeUri = ApiMapper.sApi + '/s/rez/free/qr/' + Item.RequisitionId + '/' + $scope.UserId;
        });
        Array.prototype.push.apply($scope.RepairList, data[1]);
      } else {
        $scope.isShowDetail = false;
        $scope.isShowMore = false;
      }
      $scope.isLoading = false;

      if ($scope.RequisitionId != undefined && $scope.RequisitionId != "undefined") {
        var RepairItem = {
          "RequisitionId": $scope.RequisitionId,
          "swipeState": false
        };
        $scope.WPUIpage = "listPage";
        $scope.GetDetail(RepairItem, "Detail", '0');
        $scope.RequisitionId == undefined;
      }
    }).error(function() {
      $scope.isLoading = false;
    });
  };

  //加载更多
  $scope.LoadMore = function() {
    $scope.currentPage = $scope.currentPage + 1;
    if ($scope.isShowNo) {
      $scope.SetCaseCode();
    } else {
      $scope.SearchRepair($scope.currentPage);
    }
    if ($scope.currentPage == $scope.RepairCounts) {
      $scope.isShowMore = false;
    }
  };
  //报修单号查询
  $scope.SetCaseCode = function() {
    $scope.SearhParams.UnitIds = [];
    $scope.SearhParams.MaintainerIds = [];
    $scope.SearhParams.EquipmentIds = [];
    $timeout.cancel(Func_Timeouter_Lock);
    $timeout(function() {
      $scope.TimesForLock = 0;
      $scope.Repair_Time('S');
    }, 100);
  };
  //回调函数
  $scope.ForCallback = function() {
    $timeout(function() {
      if ($scope.isShowNo) {
        $scope.SetCaseCode();
      } else {
        $scope.SearchRepair($scope.currentPage);
      }
    }, 300);
  };
  //获取报修原因
  $scope.GetCause = function() {
    var CauseList = [];
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
          //_(List).each(function (Item) {
          _(List.children).each(function(Item01) {
            if (Description.indexOf(Item01.CauseId) >= 0) {
              CauseList.push(Item01.Cause);
            }
          });
          //});
          if ($scope.RepairInfo.Description != '') {
            CauseList.push($scope.RepairInfo.Description);
          }
          $scope.CauseList = CauseList.toString();
        }).error(function(List, status) {});
      }
    } else if ($scope.RepairInfo.Description != '') {
      CauseList.push($scope.RepairInfo.Description);
      $scope.CauseList = CauseList.toString();
    }
  };
  //获取设备/设施
  $scope.GetEquipment = function(UnitId) {
    var parameterStr = {
      'UnitId': UnitId
    };
    if ($scope.CompanyId == "eb296708-6fc6-43f0-b506-0ca0fa91e1cd" || $scope.CompanyId == "6c690014-2571-48db-ac5a-c6ba2572a3bb") {
      parameterStr.TopicType = 3;
      $scope.EquipmentList[0] = {
        'EquipmentTypeClass': 0,
        'ClassName': '设备',
        'children': []
      };
      $scope.EquipmentList[1] = {
        'EquipmentTypeClass': 1,
        'ClassName': '设施',
        'children': []
      };
      $scope.GetFacilities(UnitId); //获取设施列表
    };
    $http({
      url: ApiMapper.sApi + '/s/equipment/classification',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: JSON.stringify(parameterStr)
    }).success(function(data) {
      if ($scope.CompanyId == "eb296708-6fc6-43f0-b506-0ca0fa91e1cd" || $scope.CompanyId == "6c690014-2571-48db-ac5a-c6ba2572a3bb") {
        $scope.EquipmentList[0].children = data;
        // _($scope.EquipmentList[0].children).each(function (Item) {
        //     Item.ClassName = Item.EquipmentTypeName;
        // });
      } else {
        $scope.EquipmentList = [{
          'EquipmentTypeClass': 0,
          'ClassName': '设备',
          'children': []
        }, {
          'EquipmentTypeClass': 1,
          'ClassName': '设施',
          'children': []
        }, {
          'EquipmentTypeClass': 2,
          'ClassName': '资讯',
          'children': []
        }, {
          'EquipmentTypeClass': 99,
          'ClassName': '其它',
          'children': []
        }];
        _(data).each(function(Items) {
          var EquipmentList = Items.children;
          _(EquipmentList).each(function(Lists) {
            Lists.EquipmentTypeName = Items.EquipmentTypeName;
            var EquipmentCode = Lists.EquipmentCode.split('-');
            Lists.SortNo = parseInt(EquipmentCode[1]);
            $scope.EquipmentList.forEach(function(equipmentType, index) {
              if (equipmentType.EquipmentTypeClass == Lists.EquipmentTypeClass) {
                $scope.EquipmentList[index].children.push(Lists);
              };
            });
          });
        });

        _($scope.EquipmentList).each(function(Item) {
          Item.children = _.sortBy(Item.children, 'SortNo');
        });
      }
    });
  };
  //获取王品设施列表
  $scope.GetFacilities = function(UnitId) {
    var parameterStr = {
      'UnitId': UnitId
    };
    $http({
      url: ApiMapper.sApi + '/s/equipment/classification',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: JSON.stringify(parameterStr)
    }).success(function(res) {
      _(res).each(function(Items) {
        var EquipmentList = Items.children;
        _(EquipmentList).each(function(Lists) {
          Lists.EquipmentTypeName = Items.EquipmentTypeName;
          var EquipmentCode = Lists.EquipmentCode.split('-');
          Lists.SortNo = parseInt(EquipmentCode[1]);

          $scope.EquipmentList[1].children.push(Lists);
        });
      });

    });
  };
  //选择设备帶入地區資料
  $scope.ShowArea = function(Equipment) {
    //写入设备资料到报修主档
    if ($scope.AcceptanceParameters.History.IFixed[0].EquipmentCode == '') {
      $scope.AcceptanceParameters.History.IFixed[0] = {
        "EquipmentCode": '',
        "EquipmentName": ''
      }; //实际维修设备

    }
    $scope.AcceptanceParameters.History.IFixed = [{
      "EquipmentCode": Equipment.EquipmentCode,
      "EquipmentName": Equipment.EquipmentName
    }];
    $scope.closeDenav('Area');
    // $http({
    //     url: ApiMapper.sApi + '/s/equipmentpos/' + Equipment.EquipmentId,
    //     method: 'GET',
    //     contentType: 'application/json',
    //     headers: { 'Passport': $scope.Passport }
    // }).success(function (List, status) {
    //     $scope.RepairParameters.IPositionIds = [];
    //     $scope.itemsAreaStr = [];
    //     $scope.AreaStr = '';
    //     if (List.length == 1) {
    //         _(List).each(function (Item) { Item.Selected = true; });
    //         $scope.toggleForArea(List[0])
    //     } else if (List.length > 1) {
    //         _(List).each(function (Item) { Item.Selected = false; });
    //     }
    //     $scope.AreasList = List;                
    // }).error(function (List, status) { });
  };
  $scope.toggleForArea = function(item) {
    var idx = $scope.RepairParameters.IPositionIds.indexOf(item.PositionId);
    if (idx > -1) {
      $scope.RepairParameters.IPositionIds.splice(idx, 1);
      $scope.itemsAreaStr.splice(idx, 1);
    } else {
      $scope.RepairParameters.IPositionIds.push(item.PositionId);
      $scope.itemsAreaStr.push(item.Region + '-' + item.Position);
    }
    $scope.AreaStr = $scope.itemsAreaStr.toString();
  };
  $scope.existsForArea = function(item, list) {
    return list.indexOf(item) > -1;
  };

  // 到场 与 完修 不预设带入时间
  $scope.dateObj = {
    "RealDate": '',
    "CompleteDate": ''
  };
  $scope.DateBLock = {
    'value': false
  };
  // $scope.FormatDate($scope.GetNow())

  $scope.SearchRepair(1);
  //加载案件详情
  $scope.GetDetail = function(RepairItem, Tag, IsInspection) {
    $scope.dateObj = {
      "RealDate": '',
      "CompleteDate": ''
    };
    $scope.DateBLock.value = false;
    $scope.$broadcast("ui.bootstrap.timepicker.NTClearTime");
    $scope.IsInspection = IsInspection;
    RepairItem.swipeState = !RepairItem.swipeState;
    $scope.imagesList = {
      'localIds': [],
      'serverIds': []
    };
    $scope.imagesWOList = {
      'localIds': [],
      'serverIds': []
    };
    if (!$scope.longPressSta) {
      $scope.toggleDenav('right_cancel_sign');
    } else {
      console.log($scope.longPressSta);
      $scope.toggleDenav('RepairDetail');
      //location.href="Case_Detail.html?requisitionId="+RepairItem.RequisitionId;
    }
    $scope.RepairInfo = {};
    $scope.CheckedIds = [];
    $scope.Survey.v = 5;
    $scope.Survey1.v = 5;
    $scope.AcceptanceParameters = {};
    $scope.AcceptanceParameters.History = {
      'AcceptanceMethod': 0,
      'RequisitionId': '',
      'Instructions': '',
      'Remark': '',
      'WorkerId': '',
      'RealArrivalTime': '',
      'CompleteTime': '',
      'StageId': 100,
      'IsEmail': 0,
      'IsContact': 0,
      'CallInOrOut': 6
    };
    $scope.AcceptanceParameters.Surveies = [{
      'RequisitionId': RepairItem.RequisitionId,
      'Score5': 1,
      'Score4': 0,
      'Score3': 0,
      'Score2': 0,
      'Score1': 0,
      'Status': 1,
      'Remark': '',
      'SortNo': 0
    }, {
      'RequisitionId': RepairItem.RequisitionId,
      'Score5': 1,
      'Score4': 0,
      'Score3': 0,
      'Score2': 0,
      'Score1': 0,
      'Status': 1,
      'SortNo': 1
    }];

    $http({
      url: ApiMapper.sApi + '/s/rez/' + RepairItem.RequisitionId + '/' + $scope.IsInspection,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) { //lert(JSON.stringify(data));
      $scope.RepairInfo = data.Requisition;
      $scope.RepairInfo.EstArrivalTime = $filter('date')($scope.RepairInfo.EstArrivalTime, 'yyyy/MM/dd HH:mm:ss');
      $scope.RepairInfo.DateA = $filter('date')($scope.RepairInfo.DateA, 'yyyy/MM/dd HH:mm:ss');
      // C D 点不自动带时间 $scope.GetNow()
      $scope.AcceptanceParameters.History.RealArrivalTime = '';
      $scope.AcceptanceParameters.History.CompleteTime = '';
      $scope.AcceptanceParameters.History.RequisitionId = $scope.RepairInfo.RequisitionId;
      $scope.AcceptanceParameters.History.IFixed = [{
        "EquipmentCode": $scope.RepairInfo.EquipmentCode,
        "EquipmentName": $scope.RepairInfo.EquipmentName
      }]; //实际维修设备
      if ($scope.RepairInfo.IFixed != null && $scope.RepairInfo.IFixed.length > 0) {
        $scope.AcceptanceParameters.History.IFixed = $scope.RepairInfo.IFixed;
      }
      $scope.GetEquipment($scope.RepairInfo.UnitId);

      $scope.AcceptanceParameters.History.AcceptanceMethod = $scope.RepairInfo.AcceptanceMethod;
      $scope.AcceptanceParameters.History.WorkerId = $scope.RepairInfo.WorkerId;
      $scope.AcceptanceParameters.History.WorkerName = $scope.RepairInfo.WorkerName;
      $scope.AcceptanceParameters.History.WorkerPhoneNo = parseInt($scope.RepairInfo.WorkerPhoneNo);
      $scope.AcceptanceParameters.History.Instructions = $scope.RepairInfo.Instructions;

      // if($scope.RepairInfo.GeneralStageId==4){                
      if ($scope.RepairInfo.DateC != null && $scope.RepairInfo.DateC != "") {
        $scope.dateObj.RealDate = $scope.FormatDate($scope.RepairInfo.DateC);
        $scope.AcceptanceParameters.History.RealArrivalTime = $scope.RepairInfo.DateC; //实际到店时间  
        $scope.DateBLock.value = true;

        $('input[name="Realdate"]').val($scope.dateObj.RealDate);
        $('[name=RealdateTime]').val($scope.AcceptanceParameters.History.RealArrivalTime);
      };

      if ($scope.RepairInfo.DateD != null && $scope.RepairInfo.DateD != "") {
        $scope.dateObj.CompleteDate = $scope.FormatDate($scope.RepairInfo.DateD);
        $scope.AcceptanceParameters.History.CompleteTime = $scope.RepairInfo.DateD; //实际离店时间                          

        $('input[name="Completedate"]').val($scope.dateObj.CompleteDate);
        $('[name=CompletedateTime]').val($scope.AcceptanceParameters.History.CompleteTime);
      };
      // }


      $('input[name="Realdate"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: false,
        format: 'YYYY/MM/DD'
      });

      var CompletedateMinDate = $scope.dateObj.RealDate || new Date();
      $('input[name="Completedate"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: false,
        format: 'YYYY/MM/DD' //,
        //minDate: $scope.FormatDate(CompletedateMinDate)
      });

      // 到场时间若有变动就改变完修的 minDate
      $('input[name="Realdate"]').on('apply.daterangepicker', function(ev, picker) {
        var minDate = picker.startDate;
        $('input[name="Completedate"]').data('daterangepicker').minDate = minDate;
        $('input[name="Completedate"]').data('daterangepicker').updateCalendars();
      });

      //获取报修原因与备注
      $scope.GetCause();
      if (Tag == "Sign") {
        console.log(RepairItem.RequisitionId);

        $scope.GetCheckinHistories(RepairItem.RequisitionId);
      }
      if ($scope.RepairInfo.StageId != 100 && $scope.RepairInfo.StageId != -100) {
        if ($scope.RepairInfo.DateB != '' && $scope.RepairInfo.DateB != null) {
          $scope.isAcceptance = true;
        }
      }
      if (parseInt($scope.RepairInfo.IsLocked) == 1) {
        if ($scope.RepairInfo.PreservedUserId != $cookies.UserId) {
          alert($scope.RepairInfo.PreservedUserName + '正在编辑此案件,编辑完成后才可新增案件记录！');
          return false;
        } else if ($scope.RepairInfo.PreservedUserId == $cookies.UserId) {}
      }

      // if ($scope.RepairInfo.DateC != null && $scope.RepairInfo.DateC != "") {
      //     $scope.AcceptanceParameters.History.RealArrivalTime = $scope.FormatDateTime($scope.RepairInfo.DateC);
      // }

      $scope.AcceptanceParameters.Surveies = [{
        'RequisitionId': data.RequisitionId,
        'CompanyId': data.CompanyId,
        'Score5': 1,
        'Score4': 0,
        'Score3': 0,
        'Score2': 0,
        'Score1': 0,
        'Status': 1,
        'Remark': '',
        'SortNo': 0
      }, {
        'RequisitionId': data.RequisitionId,
        'CompanyId': data.CompanyId,
        'Score5': 1,
        'Score4': 0,
        'Score3': 0,
        'Score2': 0,
        'Score1': 0,
        'Status': 1,
        'SortNo': 1
      }];
      $scope.GetEquipmentpos();
      //獲取历程报价
      $scope.LoadHistoryQuoteData(RepairItem.RequisitionId);
    });
  };

  //历程报价
  $scope.LoadHistoryQuoteData = function(rID) {
    $scope.EvaluatedData = [];
    $http({
      url: ApiMapper.sApi + '/s/evaluated/' + rID,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
    }).success(function(data) {

      $scope.EvaluatedData = data;
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
  //获取打卡历程
  $scope.GetCheckinHistories = function(Id) {
    $http({
      url: ApiMapper.sApi + '/s/checkin/' + Id,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {
      $scope.RepairInfo.CheckinHistories = [];
      _(data).each(function(Item) {
        Item.Selected = false;
      });
      $scope.RepairInfo.CheckinHistories = data;
    });
  };
  //获取打卡用Qrcode
  $scope.getQrcode = function(rId) {
    $http({
      url: ApiMapper.sApi + '/s/rez/qr/' + rId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      }
    }).success(function(data) {

    });
  };
  //部门选择關閉滑出頁面
  $scope.SetStore = function(e) {
    $mdSidenav('Store').close()
      .then(function() {
        if (e != "") {
          //將門店資料帶回
          $scope.SearhParams = {
            'RequisitionStatus': [1],
            'CheckIn': 1,
            'UnitIds': []
          };
          $scope.Unit = e.Unit;
          $scope.SearhParams.UnitIds.push(e.UnitId);
          if ($scope.isShowStore) {
            $scope.GetProvider();
            $scope.SearchRepair(1);
          } else if ($scope.isShowEquipment) {
            $scope.GetAreas();
          } else {
            $scope.GetProvider();
          }
        }
      });
  };
  //維修商查询
  $scope.SetMaintainer = function(e) {
    $mdSidenav('Maintainer').close()
      .then(function() {
        $scope.SearhParams = {
          'RequisitionStatus': [1],
          'CheckIn': 1,
          'UnitIds': $scope.SearhParams.UnitIds,
          'MaintainerIds': []
        };
        //排序
        $scope.SearhParams.Orders = $scope.OrderbyParames;
        $scope.pcompanyName = e.MaintainerName;
        $scope.SearhParams.MaintainerIds.push(e.MaintainerId);
        $scope.SearchRepair(1);
      });
  };
  //依设备编号查询
  $scope.ECodeSearch = function(Equipment) {
    $mdSidenav('right-Area').close()
      .then(function() {
        $scope.SearhParams = {
          'RequisitionStatus': [1],
          'CheckIn': 1,
          'UnitIds': $scope.SearhParams.UnitIds,
          'EquipmentIds': []
        };
        //排序
        $scope.SearhParams.Orders = $scope.OrderbyParames;
        $scope.EquipmentName = Equipment.EquipmentName;
        $scope.SearhParams.EquipmentIds.push(Equipment.EquipmentId);
        $scope.SearchRepair(1);
      });
  };
  $scope.exists = function(item, list) {
    return list.indexOf(item) > -1;
  };
  //选择区域
  $scope.SetAreas = function(item) {
    $scope.EquipmentName = '';
    $scope.SearhParams.EquipmentIds = [];
    var idx = $scope.AreasSelected.indexOf(item.PositionId);
    if (idx > -1) {
      $scope.AreasSelected.splice(idx, 1);
      //$scope.itemsAreaStr.splice(idx, 1);
    } else {
      $scope.AreasSelected.push(item.PositionId);
      //$scope.itemsAreaStr.push(item.Region + '-' + item.Position);
    }
    $scope.SearhParams.positionIds = $scope.AreasSelected;
    //$scope.AreaStr = $scope.itemsAreaStr.toString();
    //$scope.Timeouter4Areas();//延时查询区域
  };
  //区域查询设备延时
  $scope.Timeouter4Areas = function() {
    $timeout.cancel(Func_Timeouter_Lock);
    $timeout(function() {
      $scope.TimesForLock = 0;
      $scope.Repair_Time('A');
    }, 100);
  };
  //选择打卡记录
  $scope.SetCheckedIds = function(Item) {
    Item.Selected = !Item.Selected;
    var idx = $scope.CheckedIds.indexOf(Item.Id);
    if (idx > -1) {
      $scope.CheckedIds.splice(idx, 1);
    } else {
      $scope.CheckedIds.push(Item.Id);
    }
  };
  //选择报修单
  $scope.SetRequisitions = function(Item) {
    Item.Selected = !Item.Selected;
    var idx = $scope.RequisitionIds.indexOf(Item.RequisitionId);
    if (idx > -1) {
      $scope.RequisitionIds.splice(idx, 1);
      $scope.RepairListSelected.splice(idx, 1);
    } else {
      $scope.RequisitionIds.push(Item.RequisitionId);
      $scope.RepairListSelected.push(Item);
    }
  };
  //时间比较
  $scope.ValidtorTime = function(dt1, dt2) {
    // 时间比对
    var d1 = new Date(dt1).getTime();
    var d2 = new Date(dt2).getTime();
    if (d1 > d2) {
      return false;
    };
    return true;
  };

  //时间格式检查
  $scope.IsTime = function(dt1, dt2) {
    var d1 = new Date(dt1).getTime();
    var d2 = new Date(dt2).getTime();
    if (isNaN(d1) || isNaN(d2)) {
      return false;
    } else {
      return true;
    };
  };

  $scope.SetSurvey = function() {
    setTimeout(function() {
      var S1Remark = $scope.AcceptanceParameters.Surveies[0].Remark;
      $scope.AcceptanceParameters.Surveies[0] = {
        'RequisitionId': $scope.AcceptanceParameters.History.RequisitionId,
        'Score5': 0,
        'Score4': 0,
        'Score3': 0,
        'Score2': 0,
        'Score1': 0,
        'Status': 1,
        'SortNo': 0,
        'Remark': S1Remark
      };
      $scope.AcceptanceParameters.Surveies[1] = {
        'RequisitionId': $scope.AcceptanceParameters.History.RequisitionId,
        'Score5': 0,
        'Score4': 0,
        'Score3': 0,
        'Score2': 0,
        'Score1': 0,
        'Status': 1,
        'SortNo': 1
      };
      if ($scope.Survey.v == 1) {
        $scope.AcceptanceParameters.Surveies[0].Score1 = 1;
      } else if ($scope.Survey.v == 2) {
        $scope.AcceptanceParameters.Surveies[0].Score2 = 1;
      } else if ($scope.Survey.v == 3) {
        $scope.AcceptanceParameters.Surveies[0].Score3 = 1;
      } else if ($scope.Survey.v == 4) {
        $scope.AcceptanceParameters.Surveies[0].Score4 = 1;
      } else if ($scope.Survey.v == 5) {
        $scope.AcceptanceParameters.Surveies[0].Score5 = 1;
      };

      if ($scope.Survey1.v == 1) {
        $scope.AcceptanceParameters.Surveies[1].Score1 = 1;
      } else if ($scope.Survey1.v == 2) {
        $scope.AcceptanceParameters.Surveies[1].Score2 = 1;
      } else if ($scope.Survey1.v == 3) {
        $scope.AcceptanceParameters.Surveies[1].Score3 = 1;
      } else if ($scope.Survey1.v == 4) {
        $scope.AcceptanceParameters.Surveies[1].Score4 = 1;
      } else if ($scope.Survey1.v == 5) {
        $scope.AcceptanceParameters.Surveies[1].Score5 = 1;
      };
    }, 10);
  };
  //设定签到预设时间
  $scope.SetSignDate = function() {
    $scope.DateC = $scope.GetNow();
    $scope.singalDate = $scope.FormatDate($scope.GetNow());
    $('input[name="singaldate"]').val($scope.singalDate);
  };
  //照片    
  var length = $scope.imagesList.localIds.length;
  var lengthWO = $scope.imagesWOList.localIds.length;
  $scope.chooseImage = function(Tag) {
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      success: function(res) {
        if (Tag == "Other") {
          if ($scope.imagesList.localIds.length > 0) {
            //$scope.imagesList.localIds = $scope.imagesList.localIds.concat(res.localIds);
            Array.prototype.push.apply($scope.imagesList.localIds, res.localIds);
          } else {
            $scope.imagesList.localIds = res.localIds;
          }
          $scope.imagesList.serverIds = [];
          $scope.$apply();
          $timeout(function() {
            _($scope.imagesList.localIds).each(function(Item, i) {
              $('#advPic' + i).attr({
                'src': Item,
                'width': '72px',
                'height': '72px'
              });
            });
          }, 500);
        } else {
          if ($scope.imagesWOList.localIds.length > 0) {
            Array.prototype.push.apply($scope.imagesWOList.localIds, res.localIds);
          } else {
            $scope.imagesWOList.localIds = res.localIds;
          }
          $scope.imagesWOList.serverIds = [];
          $scope.$apply();
          $timeout(function() {
            _($scope.imagesWOList.localIds).each(function(Item, i) {
              $('#advWOPic' + i).attr({
                'src': Item,
                'width': '72px',
                'height': '72px'
              });
            });
          }, 500);
        }

        length = $scope.imagesList.localIds.length;
        lengthWO = $scope.imagesWOList.localIds.length;
      }
    });
  };
  //删除照片
  $scope.RemoveImg = function(Tag, idx) {
    if (Tag == "Other") {
      $scope.imagesList.localIds.splice(idx, 1);
    } else {
      $scope.imagesWOList.localIds.splice(idx, 1);
    }
  };
  //上传
  $scope.onLoad = true;
  $scope.MediasParamenter = {
    'Key': '',
    'FileSoure': 40,
    'Medias': {
      'image': [],
      'voice': []
    }
  };
  // 工单
  $scope.MediasWOParamenter = {
    'Key': '',
    'FileSoure': 51,
    'Medias': {
      'image': [],
      'voice': []
    }
  };
  var i = 0;
  $scope.uploadImageIds = {};
  $scope.upload = function() {
    var uploadedId = $scope.uploadImageIds[$scope.imagesList.localIds[i]];
    if (typeof uploadedId === "undefined" || uploadedId === "") {
      wx.uploadImage({
        localId: $scope.imagesList.localIds[i],
        isShowProgressTips: 1,
        success: function(res) {
          //保存至已上传图片对象
          $scope.uploadImageIds[$scope.imagesList.localIds[i]] = res.serverId;
          i++;
          $scope.imagesList.serverIds.push(res.serverId);
          $scope.AcceptanceParameters.History.ImageMediaIds.push(res.serverId);
          $scope.MediasParamenter.Medias.image.push(res.serverId);
          if (i < length) {
            $scope.upload();
          } else {
            if (lengthWO == 0) {
              $scope.onLoad = false;
              $scope.Acceptance();
            } else {
              i = 0;
              $scope.AcceptanceParameters.History.ImageWOMediaIds = [];
              $scope.MediasWOParamenter.Medias.image = [];
              $scope.uploadWO();
            }
          }
        },
        fail: function(error) {
          $scope.imagesList.serverIds = [];
          $scope.AcceptanceParameters.History.ImageMediaIds = [];
          $scope.MediasParamenter.Medias.image = [];
          alert("上传图片发生服务器错误！ ");
        }
      });
    } else {
      i++;
      $scope.imagesList.serverIds.push(uploadedId);
      $scope.AcceptanceParameters.History.ImageMediaIds.push(uploadedId);
      $scope.MediasParamenter.Medias.image.push(ruploadedId);
      if (i < length) {
        $scope.upload();
      } else {
        if (lengthWO == 0) {
          $scope.onLoad = false;
          $scope.Acceptance();
        } else {
          i = 0;
          $scope.AcceptanceParameters.History.ImageWOMediaIds = [];
          $scope.MediasWOParamenter.Medias.image = [];
          $scope.uploadWO();
        }
      }
    }
  };
  //上传工单
  $scope.uploadWO = function() {
    var uploadedId = $scope.uploadImageIds[$scope.imagesWOList.localIds[i]];
    if (typeof uploadedId === "undefined" || uploadedId === "") {
      wx.uploadImage({
        localId: $scope.imagesWOList.localIds[i],
        isShowProgressTips: 1,
        success: function(res) {
          $scope.uploadImageIds[$scope.imagesWOList.localIds[i]] = res.serverId;
          i++;
          $scope.imagesWOList.serverIds.push(res.serverId);
          $scope.AcceptanceParameters.History.ImageWOMediaIds.push(res.serverId);
          $scope.MediasWOParamenter.Medias.image.push(res.serverId);
          if (i < lengthWO) {
            $scope.uploadWO();
          } else {
            $scope.onLoad = false;
            $scope.Acceptance();
          }
        },
        fail: function(error) {
          $scope.imagesWOList.serverIds = [];
          $scope.AcceptanceParameters.History.ImageWOMediaIds = [];
          $scope.MediasWOParamenter.Medias.image = [];
          alert("上传图片发生服务器错误！ ");
        }
      });
    } else {
      i++;
      $scope.imagesWOList.serverIds.push(uploadedId);
      $scope.AcceptanceParameters.History.ImageWOMediaIds.push(uploadedId);
      $scope.MediasWOParamenter.Medias.image.push(uploadedId);
      if (i < lengthWO) {
        $scope.uploadWO();
      } else {
        $scope.onLoad = false;
        $scope.Acceptance();
      }
    }
  };
  $scope.uploadimages = function() {
    if ($scope.onLoad) {
      $scope.imagesList.serverIds = [];
      $scope.MediasParamenter.Medias.image = [];
      $scope.MediasWOParamenter.Medias.image = [];
      $scope.AcceptanceParameters.History.ImageMediaIds = [];
      i = 0;
      length = $scope.imagesList.localIds.length;
      $scope.upload();
    }
  };
  //保存媒体档案到580440
  $scope.LoadMedias = function(RequisitionId) {
    $scope.MediasParamenter.Key = RequisitionId;
    $http({
      url: ApiMapper.wxApi + '/wx/files/' + $scope.AppId,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: $scope.MediasParamenter
    }).success(function(data) {
      if (data != "Saved") {
        $scope.isSend4Ajax = false;
        alert('验收图片上传失败！\n\r请联系580-440报修中心！');
        $scope.closeDenav('RepairDetail');
        $timeout(function() {
          $scope.SearchRepair(1);
        }, 500);
      } else {
        if (lengthWO == 0) {
          $scope.isSend4Ajax = false;
          alert("您已完成：" + $scope.RepairInfo.CaseNo + "的销案！");
          $scope.closeDenav('RepairDetail');
          $timeout(function() {
            $scope.SearchRepair(1);
          }, 500);
        } else {
          $scope.LoadMediasWO(RequisitionId);
        }
      }
    }).error(function(List, status) {
      $scope.isSubmit = false;
      alert('验收成功，验收图片上传失败！\n\r请联系580-440报修中心！');
    });
  };
  $scope.LoadMediasWO = function(RequisitionId) {
    $scope.MediasWOParamenter.Key = RequisitionId;
    $http({
      url: ApiMapper.wxApi + '/wx/files/' + $scope.AppId,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: $scope.MediasWOParamenter
    }).success(function(data) {
      if (data != "Saved") {
        $scope.isSend4Ajax = false;
        alert('工单图片上传失败！\n\r请联系580-440报修中心！');
        $scope.closeDenav('RepairDetail');
        $timeout(function() {
          $scope.SearchRepair(1);
        }, 500);
      } else {
        $scope.isSend4Ajax = false;
        alert("您已完成：" + $scope.RepairInfo.CaseNo + "的销案！");
        $scope.closeDenav('RepairDetail');
        $timeout(function() {
          $scope.SearchRepair(1);
        }, 500);
      }
    }).error(function(List, status) {
      $scope.isSubmit = false;
      alert('验收成功，报修单工单上传失败！\n\r请联系580-440报修中心！');
    });
  };
  //验收
  $scope.Acceptance = function(Id) {
    $scope.AcceptanceParameters.History.Source = 4;
    $scope.AcceptanceParameters.History.ResponseTime = $scope.GetNow();
    var RealArrivalDate = $('input[name="Realdate"]').val();
    var CompleteDate = $('input[name="Completedate"]').val();
    var myDate1 = new Date($scope.AcceptanceParameters.History.RealArrivalTime);
    var myDate2 = new Date($scope.AcceptanceParameters.History.CompleteTime);
    var _hh = myDate1.getHours();
    var _mm = myDate1.getMinutes();
    var _ss = myDate1.getSeconds();
    $scope.AcceptanceParameters.History.RealArrivalTime = '' + RealArrivalDate + ' ' + _hh + ':' + _mm + ':' + _ss;
    _hh = myDate2.getHours();
    _mm = myDate2.getMinutes();
    _ss = myDate2.getSeconds();
    $scope.AcceptanceParameters.History.CompleteTime = '' + CompleteDate + ' ' + _hh + ':' + _mm + ':' + _ss;
    var theTime = $scope.GetNow();
    if (!$scope.IsTime($scope.AcceptanceParameters.History.RealArrivalTime, $scope.AcceptanceParameters.History.CompleteTime)) {
      alert('请确认时间格式是否正确！');
      return false;
    } else if (!$scope.ValidtorTime($scope.AcceptanceParameters.History.RealArrivalTime, $scope.GetNow())) {
      alert('到店时间必须早于当前时间！');
      return false;
    } else if ((!$scope.ValidtorTime($scope.RepairInfo.DateB, $scope.AcceptanceParameters.History.RealArrivalTime)) && ($scope.IsInspection == 0)) {
      alert('到店时间必须晚于派工时间！');
      return false;
    } else if ($scope.ValidtorTime($scope.GetNow(), $scope.AcceptanceParameters.History.CompleteTime)) {
      alert('完修离店时间必须早于当前时间！');
      return false;
    } else if (!$scope.ValidtorTime($scope.AcceptanceParameters.History.RealArrivalTime, $scope.AcceptanceParameters.History.CompleteTime)) {
      alert('完修离店时间必须晚于到店时间！');
      return false;
    } else if ($scope.imagesWOList.localIds.length == 0 && $scope.IsUItoWP) {
      alert('请上传工单图片');
      return false;
    } else if ($scope.imagesList.localIds.length == 0 && $scope.IsUItoWP) {
      alert('请上传相关图片');
      return false;
    } else if ($scope.RepairInfo.AcceptanceMethod == 1 && lengthWO == 0) {
      // 2017/06/12 台新规格，寄送配件须上传工单
      alert("请上传工单！");
      return false;
    } else {
      // 王品需跳出確認視窗
      if ($scope.IsUItoWP) {
        var parentEl = angular.element("#RepairDetail");
        var confirm = $mdDialog.confirm()
          .parent(parentEl)
          .title('请检查该笔案件的维修费用是否已填写？')
          .ariaLabel('Lucky day')
          .ok('继续结案操作')
          .cancel('去确认一下，先不结案');

        $mdDialog.show(confirm).then(function() {
          $mdDialog.hide('success');
          $scope.isSend4Ajax = true;
          if ($scope.imagesList.localIds.length > 0 && $scope.onLoad) {
            $scope.uploadimages();
          } else {
            $scope.AcceptanceParameters.History.RealArrivalTime = $scope.FormatDateTime($scope.AcceptanceParameters.History.RealArrivalTime);
            $scope.AcceptanceParameters.History.CompleteTime = $scope.FormatDateTime($scope.AcceptanceParameters.History.CompleteTime);
            //alert(JSON.stringify($scope.AcceptanceParameters));alert($scope.AcceptanceParameters.History.RequisitionId);
            $http({
              url: ApiMapper.sApi + '/s/rez/Acceptance/' + $scope.AcceptanceParameters.History.RequisitionId,
              method: 'PATCH',
              contentType: 'application/json',
              headers: {
                'Passport': $scope.Passport
              },
              data: $scope.AcceptanceParameters
            }).success(function(data) { //alert(JSON.stringify(data));
              $scope.Survey.v = 5;
              $scope.Survey1.v = 5;
              if (parseInt(data.StatusCode) == 2) {
                alert(data.Messages);
                $scope.isSend4Ajax = false;
              } else {
                if ($scope.imagesList.localIds.length > 0) {
                  $scope.LoadMedias(data.Messages);
                } else {
                  $scope.isSend4Ajax = false;
                  alert("您已完成：" + $scope.RepairInfo.CaseNo + "的销案！");
                  $scope.closeDenav('RepairDetail');
                  $timeout(function() {
                    $scope.SearchRepair(1);
                  }, 500);
                }
              }
            }).error(function(data) {
              alert(data.Messages);
            });
          }
        }, function() {
          $mdDialog.cancel();
        });
      } else {
        $scope.isSend4Ajax = true;
        if ($scope.imagesList.localIds.length > 0 && $scope.onLoad) {
          $scope.uploadimages();
        } else {
          $scope.AcceptanceParameters.History.RealArrivalTime = $scope.FormatDateTime($scope.AcceptanceParameters.History.RealArrivalTime);
          $scope.AcceptanceParameters.History.CompleteTime = $scope.FormatDateTime($scope.AcceptanceParameters.History.CompleteTime);
          //alert(JSON.stringify($scope.AcceptanceParameters));alert($scope.AcceptanceParameters.History.RequisitionId);
          $http({
            url: ApiMapper.sApi + '/s/rez/Acceptance/' + $scope.AcceptanceParameters.History.RequisitionId,
            method: 'PATCH',
            contentType: 'application/json',
            headers: {
              'Passport': $scope.Passport
            },
            data: $scope.AcceptanceParameters
          }).success(function(data) { //alert(JSON.stringify(data));
            $scope.Survey.v = 5;
            $scope.Survey1.v = 5;
            if (parseInt(data.StatusCode) == 2) {
              alert(data.Messages);
              $scope.isSend4Ajax = false;
            } else {
              if ($scope.imagesList.localIds.length > 0) {
                $scope.LoadMedias(data.Messages);
              } else {
                $scope.isSend4Ajax = false;
                alert("您已完成：" + $scope.RepairInfo.CaseNo + "的销案！");
                $scope.closeDenav('RepairDetail');
                $timeout(function() {
                  $scope.SearchRepair(1);
                }, 500);
              }
            }
          }).error(function(data) {
            alert(data.Messages);
          });
        }
      }

    }
  };
  //取消簽到
  $scope.doCancelSign = function() {
    if ($scope.CheckedIds.length == 0) {
      $scope.isSend4Ajax = false;
      alert('请选择需要取消签到的报修单!');
    } else {
      $scope.isSend4Ajax = true;
      $http({
        url: ApiMapper.sApi + '/s/checkin/cancel/' + $scope.RepairInfo.RequisitionId,
        method: 'PATCH',
        contentType: 'application/json',
        headers: {
          'Passport': $scope.Passport
        },
        data: $scope.CheckedIds
      }).success(function(data) {
        $scope.isSend4Ajax = false;
        if (data.StatusCode == 1) {
          alert("成功取消签到！");
          $scope.closeDenav('right_cancel_sign');
        }
      });
    }
  };
  //簽到
  $scope.doSign = function() {
    if ($scope.RequisitionIds.length == 0) {
      $scope.isSend4Ajax = false;
      alert('请选择需要签到的报修单!');
    } else {
      var DateC = $('input[name="singaldate"]').val();
      var myDate = new Date($scope.DateC);
      var _hh = myDate.getHours();
      var _mm = myDate.getMinutes();
      var _ss = myDate.getSeconds();
      var _now = '' + DateC + ' ' + _hh + ':' + _mm + ':' + _ss;
      var theTime = $scope.GetNow();

      if (!$scope.ValidtorTime(_now, theTime)) {
        alert("签到时间必须早于当前时间！");
        return false;
      } else {
        //alert(_now);return false;
        var doSignList = {
          "RequisitionId": $scope.RequisitionIds,
          "DateC": $scope.FormatDateTime(_now)
        };
        $scope.isSend4Ajax = true;
        $http({
          url: ApiMapper.sApi + '/s/checkin',
          method: 'POST',
          contentType: 'application/json',
          headers: {
            'Passport': $scope.Passport
          },
          data: JSON.stringify(doSignList)
        }).success(function(data) {
          $scope.isSend4Ajax = false;
          if (data.StatusCode == 1) {
            //$scope.longPressSta = true;
            $scope.RequisitionIds = [];
            $scope.RepairListSelected = [];
            _($scope.RepairList).each(function(Item) {
              Item.Selected = false;
              Item.swipeState = false;
            });
            alert("签到成功！");
          } else if (data.StatusCode == 3) {
            //$scope.longPressSta = true;
            $scope.RequisitionIds = [];
            $scope.RepairListSelected = [];
            _($scope.RepairList).each(function(Item) {
              Item.Selected = false;
              Item.swipeState = false;
            });
            alert(data.Messages);
          }
          $scope.SearchRepair($scope.currentPage);
        }).error(function() {
          $scope.isSend4Ajax = false;
        });
      }
    }
  };
  $scope.loadQrcode = function(ItemObj) {
    $scope.isShowCode = true;
    $scope.QRCodeUri = ItemObj.QRCodeUri;
  };
  $scope.closeQrcode = function() {
    $scope.isShowCode = false;
    $scope.QRCodeUri = "#";
    // _($scope.RepairList).each(function(item){
    //     item.showCode=false;
    // });
  };
  //退出签到模式
  $scope.doCancel = function() {
    $scope.RepairListSelected = [];
    $scope.RequisitionIds = [];
    _($scope.RepairList).each(function(Item) {
      Item.Selected = false;
      Item.swipeState = false;
      Item.showCode = false;
    });
  };
  $scope.toggleCheckin = function(tag) {
    $scope.isQrcode = tag == 0 ? true : false;
    $scope.RepairListSelected = [];
    $scope.RequisitionIds = [];
    _($scope.RepairList).each(function(Item) {
      Item.Selected = false;
      Item.swipeState = false;
      Item.showCode = false;
    });

  };
  //全選
  $scope.selectAll = function() {
    $scope.isAllSelected = !$scope.isAllSelected;
    $scope.RequisitionIds = [];
    if ($scope.isAllSelected) {
      _($scope.RepairList).each(function(Item) {
        Item.Selected = $scope.isAllSelected;
        $scope.RequisitionIds.push(Item.RequisitionId);
      });
    } else {
      _($scope.RepairList).each(function(Item) {
        Item.Selected = $scope.isAllSelected;
      });
    }
  };
  //选择打卡列表
  $scope.selectIds = function(RepairItem) {
    RepairItem.Selected = !RepairItem.Selected;
    var idx = $scope.RequisitionIds.indexOf(RepairItem.RequisitionId);
    if (idx > -1) {
      $scope.RequisitionIds.splice(idx, 1);
      $scope.RepairListSelected.splice(idx, 1);
    } else {
      $scope.RequisitionIds.push(RepairItem.RequisitionId);
      $scope.RepairListSelected.push(RepairItem);
    }
  };
  //取消打卡全選
  $scope.isAllChecked = false;
  $scope.Checked4All = function() {
    $scope.isAllChecked = !$scope.isAllChecked;
    $scope.CheckedIds = [];
    if ($scope.isAllChecked) {
      _($scope.RepairInfo.CheckinHistories).each(function(Item) {
        Item.Selected = $scope.isAllChecked;
        $scope.CheckedIds.push(Item.Id);
      });
    }
  };

  $scope.doSecondaryAction = function(event) {
    $mdDialog.show(
      $mdDialog.alert()
      .title('案件详情')
      .content('案件详情内容')
      .ariaLabel('Secondary click demo')
      .ok('验收')
      .targetEvent(event)
    );
  };
  //介面控制
  $scope.toggleDenav = function(navID) {
    if ((navID == 'right-Area' || navID == 'Maintainer') && $scope.SearhParams.UnitIds.length == 0) {
      alert('请先选择单位！');
      return false;
    }
    $mdSidenav(navID).toggle();
  };

  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function() {
      $mdSidenav(navID)
        .then(function() {});
    }, 300);
    return debounceFn;
  };
  $scope.toggleRight = function(navID) {
    $mdSidenav(navID).toggle();
  };
  //關閉頁面
  $scope.closeDenav = function(navID) {
    $mdSidenav(navID)
      .close()
      .then(function() {
        _($scope.RepairList).each(function(Item) {
          Item.swipeState = false;
        });
      });
  };
  //长按事件
  $scope.onHammer = function onHammer(Item) {
    $scope.longPressSta = !$scope.longPressSta;
    $scope.RepairListSelected = [];
    if ($scope.longPressSta) {
      $scope.RequisitionIds = [];
      _($scope.RepairList).each(function(Item) {
        Item.Selected = false;
        Item.swipeState = false;
      });
    } else {
      $scope.toggleDenavFN = '';
      Item.Selected = !Item.Selected;
      $scope.RepairListSelected.push(Item);
      $scope.RequisitionIds.push(Item.RequisitionId);
    }
  };

  // 2018/11/14 新增 王品用

  /**********************/
  /****  選擇分類页面   ***/
  /**********************/

  // 選擇案件分類-進入列表
  $scope.SelectSearch = function(selectClass, DivisionId, DivisionName) {
    // 暂存部門资料
    $scope.DivisionTempData = {
      'DivisionId': DivisionId,
      'DivisionName': DivisionName
    };
    if (selectClass == '进行中') {
      $scope.SearhParams.UnitDivisionIds = [DivisionId];
      $scope.SearchRepair(1);
      $scope.WPUIpage = 'listPage';
    };
  };

  // 获取案件分类-数字(進行中)
  $scope.GetCaseCount = function() {
    $http({
      // 師傅到場:1 我要結案:2 但目前參數一樣所以都給1
      url: ApiMapper.sApi + '/s/rez/all/count/' + $scope.CaseNO,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: {
        'UnitRegionIds': [],
        'IsInspection': 2
      }
    }).success(function(data) {
      $scope.CaseCountList = data;
      // console.log($scope.CaseCountList);
    });
  };

  // 返回-案件分类(清除狀態/獲取分類數字)
  $scope.ClassPage = function() {
    $scope.RepairList = [];
    $scope.currentPage = 1;

    $scope.WPUIpage = 'selectPage';
    // 重新獲取案件分類數字 "Identity"  0:None 1:SVR  2:調度  3:維修師傅
    $scope.GetCaseCount();
  };

  // 王品確認 並且觸發王品專屬功能
  if ($cookies.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' || $cookies.CompanyId == '6c690014-2571-48db-ac5a-c6ba2572a3bb'|| $cookies.CompanyId == 'c1a24352-46a1-4301-9b96-a67c92691336') {
    $scope.IsUItoWP = true;
    $scope.GetCaseCount(); // 載入案件數量
  }

  // $scope.GetStore();
  if (parseInt($scope.StoreUser) === 0) {
    $scope.GetStore();
  } else {
    $scope.UnitIds = [$cookies.UnitId];
    $scope.GetProvider();
  }
});