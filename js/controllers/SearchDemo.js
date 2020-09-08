'use strict';

WeChat.controller('SearchRepairCtrl', ['$scope', '$http', '$timeout', '$cookies', '$mdSidenav', '$mdUtil', '$filter', '$sce', 'ngProgress', 'i18n', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter, $sce,ngProgress , i18n) {
  $scope.StoreUser = $cookies.StoreUser;
  //取得openID
  //流程是AppID(公眾號ID) > codeID(驗證碼) > openID(使用者在這個公眾號的ID) > (API) > 使用者資訊
  $scope.AppId = ApiMapper.AppId;
  $scope.OpenId = window.localStorage.getItem($scope.AppId);
  $scope.UrlStr = $(location).attr("search") || "Unknown";
  if ($scope.UrlStr != "Unknown") {
    $scope.RedirectUri = decodeURIComponent($scope.UrlStr.split("?redirect_uri=")[1]);
    $scope.RedirectUri = $scope.RedirectUri.replace("&", "?");
    $scope.Code = decodeURIComponent($scope.UrlStr.split("?code=")[1]);
  };
  $scope.getOpenId = function () {
    //如果沒有openID才去取得
    if ($scope.OpenId == undefined || $scope.OpenId == null || $scope.OpenId == "null") {
      if ($scope.Code == "undefined" || $scope.Code == undefined) { //判断地址是否有带Code
        //這邊是微信登入取得網址 記得要把xxxxx.html改成當前的網頁
        var urlstr = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + $scope.AppId + "&redirect_uri=" + encodeURIComponent(ApiMapper.PathStr + "search_no.html") + "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
        location.href = urlstr;
      } else {
        //codeID也就是驗證碼
        var CodeId = $scope.Code.split("&")[0]; //從連結上面擷取code資料
        var newUrl = ApiMapper.wxApi + "/wx/r/openId?appId=" + $scope.AppId + "&code=" + CodeId; //呼叫Gina API
        //取得OpenID
        $http.get(newUrl).success(function (data) {
          //alert("Code:" + CodeId + "|openid:" + data.openid);
          $scope.OpenId = data.openid;
          window.localStorage.setItem($scope.AppId, $scope.OpenId);
        }).error(function (data) {
          wx.closeWindow();
        });
      }
    }
  }

  //取得openId 記得最後開微信要打開
  // $scope.getOpenId();

  $scope.IsUItoWP = false; // 是否王品
  $scope.WPUIpage = 'selectPage'
  if ($cookies.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' || $cookies.CompanyId == '6c690014-2571-48db-ac5a-c6ba2572a3bb') {
    $scope.IsUItoWP = true;
    $scope.GroupParames = {
      "Regions": [],
      "Emergencys": [i18n.t("11074"), i18n.t("11075")],
      "TypeName": []
    };
  } else {
    $scope.IsUItoWP = false;
    $scope.WPUIpage = 'listPage';
  }
  //王品区域logo去除中间分区代码
  $scope.FormatLogoURI = FormatLogoURI;

  $scope.OrderbyParames = [{
    "name": "DateM",
    "OrderBy": 1
  }, {
    "name": "OverTimeInterval",
    "OrderBy": 0
  }];
  $scope.SearhParams = {
    'UnitIds': [],
    'MaintainerIds': [],
    'EquipmentIds': [],
    'FuzzyCaseCode': null,
    'RezConditions': [2,3,4,5,7,8],
    'Emergency': [],
    'IsInspection': 2,
    'UnitRegionIds': [],
    'UnitDivisionIds': [],
    'EquipmentTypeClass': [],
    'EquipmentSubTypeId': [],
    'Orders': $scope.OrderbyParames
  };
  $scope.pcompanyList = [];
  $scope.StoreList = [];

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
  $scope.tabName = i18n.t("2081");
  $scope.tabId = "Store";

  $scope.RepairList = [];
  $scope.RepairInfo = {};
  $scope.RequisitionIds = [];
  $scope.AreasSelected = [];
  $scope.itemsAreaStr = [];
  $scope.CheckedIds = [];
  $scope.currentPage = 1;
  $scope.isLoading = true;
  $scope.isAllSelected = false;
  $scope.isShowMore = false;
  $scope.isShowList = false;
  $scope.isShowDetail = false;
  $scope.Overtime = false;
  $scope.Search4No = false;
  $scope.isProgress = false;
  $scope.RepairCounts = 0;
  $scope.pcompanyName = '';
  $scope.EquipmentName = '';
  $scope.Unit = i18n.t("1001");
  $scope.Survey = 5;
  $scope.Survey1 = 5;

  //左邊功能選單
  $scope.SearchTitle;
  $scope.SidenavList = [{
    "name": i18n.t("2001"),
    "Event": "Muti"
  }, {
    "name": i18n.t("11128"),
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
    'DontCare': false
  };
  $scope.RequisitionStatus = {
    "Filing": true,
    "Assignment": true,
    "InStore": true,
    "Acceptance": true,
    "Revocation": true,
    "OnConfirm": true,
    "OnProcess": true,
    "RawMaterialPending": true
  };

  $scope.EquipmentList = [];
  $scope.$watchCollection('RequisitionStatus', function () {
    if (!$scope.RequisitionStatus.Filing &&
      !$scope.RequisitionStatus.Assignment &&
      !$scope.RequisitionStatus.Confirmed &&
      !$scope.RequisitionStatus.InStore &&
      !$scope.RequisitionStatus.Draft &&
      !$scope.RequisitionStatus.OnTheRoad &&
      !$scope.RequisitionStatus.Acceptance &&
      !$scope.RequisitionStatus.Revocation &&
      !$scope.RequisitionStatus.RawMaterialPending) {
      if ($scope.SearhParams.RezConditions[0] == 2) $scope.RequisitionStatus.Filing = true;
      else if ($scope.SearhParams.RezConditions[0] == 3) $scope.RequisitionStatus.Assignment = true;
      else if ($scope.SearhParams.RezConditions[0] == 32) $scope.RequisitionStatus.Confirmed = true;
      else if ($scope.SearhParams.RezConditions[0] == 8) $scope.RequisitionStatus.InStore = true;
      else if ($scope.SearhParams.RezConditions[0] == 4) $scope.RequisitionStatus.Acceptance = true;
      else if ($scope.SearhParams.RezConditions[0] == 5) $scope.RequisitionStatus.Revocation = true;
      else if ($scope.SearhParams.RezConditions[0] == 6) $scope.RequisitionStatus.Draft = true;
      else if ($scope.SearhParams.RezConditions[0] == 91) $scope.RequisitionStatus.RawMaterialPending = true;
    } else {
      $scope.SearhParams.RezConditions = [];
      $scope.RequisitionStatus.Draft ? $scope.SearhParams.RezConditions.push(6) : '';
      $scope.RequisitionStatus.Filing ? $scope.SearhParams.RezConditions.push(2) : '';
      $scope.RequisitionStatus.Confirmed ? $scope.SearhParams.RezConditions.push(32) : '';
      $scope.RequisitionStatus.Assignment ? $scope.SearhParams.RezConditions.push(3) : '';
      $scope.RequisitionStatus.InStore ? $scope.SearhParams.RezConditions.push(8) : '';
      $scope.RequisitionStatus.Acceptance ? $scope.SearhParams.RezConditions.push(4) : '';
      $scope.RequisitionStatus.Revocation ? $scope.SearhParams.RezConditions.push(5) : '';
      $scope.RequisitionStatus.RawMaterialPending ? $scope.SearhParams.RezConditions.push(91) : '';
      $scope.RequisitionStatus.Overtime ? $scope.SearhParams.Overtime = 1 : '';
      $timeout.cancel(Func_Timeouter_Lock);
      $timeout(function () {
        $scope.TimesForLock = 0;
        $scope.Repair_Time('S');
      }, 100);
    }
  });
  $scope.deliberatelyTrustDangerousSnippet = function (snippet) {
    return $sce.trustAsHtml(snippet);
  };
  var Func_Timeouter_Lock;
  var Func_Timeouter_Search;
  $scope.Repair_Time = function (Tag) {
    if ($scope.TimesForLock == 100) { //原本 200
      $timeout.cancel(Func_Timeouter_Lock);
      $scope.TimesForLock = 0;
      if (Tag == "S") {
        $scope.SearchRepair(1);
        //$scope.GetProvider();
      } else {
        $scope.GetEquipment4Areas();
      }
    } else {
      $scope.TimesForLock = $scope.TimesForLock + 1;
      Func_Timeouter_Lock = $timeout(function () {
        $scope.Repair_Time(Tag);
      }, 1);
    }
  };
  $scope.Repair_Search = function(){
    $timeout(function () {
      $scope.SearchRepair(1);
    }, 5 * 1000);
  };
  //报修时限
  $scope.EmergencyName = i18n.t("11049");
  $scope.EmergencyIds = [0, 1, 2];
  $scope.InspectionName = i18n.t("11049");
  $scope.IsInspection = 4;
  //王品查询，获取区域
  $scope.getRegions = function () {
    $http({
      url: ApiMapper.sApi + '/s/unit/region',
      method: 'GET',
      cache: false,
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (res) {
      $scope.RegionList = res;
    }).error(function (res) {
      $scope.RegionList = [];
    });
  };
  /***
   * 2019R5
   * 铃铛提醒资讯案件
   */
  $scope.getFacility = function () {
    $http({
      url: ApiMapper.sApi + '/s/rez/all/count/facility',
      method: 'GET',
      cache: false,
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (res) {
      $scope.notifyCount = res;
    }).error(function (res) {
      $scope.notifyCount = 0;
    });
  };

  // 获取保养案件类型
  $scope.SubTypeSelected = [];
  $scope.getInspectionType = function () {
    $http({
      url: ApiMapper.sApi + '/s/equipmenttype/inspection',
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (data) {
      $scope.inspectionType = data;
    }).error(function () {

    });
  }
  $scope.setInspectionType = function (item) {
    item.Selected = !item.Selected;
    if (item.Selected) {
      $scope.SubTypeSelected.push(item.EquipmentSubTypeId);
      $scope.GroupParames.TypeName.push(item.EquipmentSubTypeName);
      // 添加至查询参数
      $scope.SearhParams.EquipmentSubTypeId.push(item.EquipmentSubTypeId);
    } else {
      var idx = $scope.SubTypeSelected.indexOf(item.EquipmentSubTypeId);
      $scope.SubTypeSelected.splice(idx, 1);
      $scope.GroupParames.TypeName.splice(idx, 1);

      $scope.SearhParams.EquipmentSubTypeId.splice(idx, 1);
      console.log($scope.SubTypeSelected, $scope.SearhParams.EquipmentSubTypeId)
    }
  }
  /**/
  //取得門店資料
  $scope.GetStore = function () {
    $http({
      url: ApiMapper.sApi + '/s/unit/maps',
      method: 'GET',
      cache: false,
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (Unitdata) {
      $scope.StoreList = [];
      $scope.Unitdata = Unitdata;
      _($scope.Unitdata[1]).each(function (Item1) { // + '[' + Item1.UnitId + ']'
        $scope.StoreList.push({
          'Id': Item1.UnitId,
          'Text': Item1.Unit,
          'isSelected': false,
          'Level1': '',
          'Level2': '',
          'UnitLevel': 10
        });
        _($scope.Unitdata[2]).each(function (Item2) {
          if (Item2.Level2 == Item1.UnitId) { //+ '[' + Item2.UnitId + ']'
            $scope.StoreList.push({
              'Id': Item2.UnitId,
              'Text': '　' + Item2.Unit,
              'isSelected': false,
              'Level1': '',
              'Level2': '',
              'UnitLevel': 20
            });
            _($scope.Unitdata[3]).each(function (Item3) {
              if (Item3.Level3 == Item2.UnitId) { //+ '[' + Item3.UnitId + ']'
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
    });
  };
  //取得维修商資料 
  $scope.GetProvider = function () {
    if ($scope.UnitIds.length > 0) {
      $http({
        url: ApiMapper.sApi + '/s/rez/misc/spCategory',
        method: 'POST',
        cache: false,
        contentType: 'application/json',
        headers: {
          'Passport': $cookies.Passport
        },
        data: {
          'UnitIds': $scope.UnitIds,
          'RequisitionStatus': [1, 2, 4, 5, 6]
        }
      }).success(function (Unitdata) {
        $scope.pcompanyName = '';
        $scope.pcompanyList = [];
        _(Unitdata).each(function (Item) {
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
  if (parseInt($scope.StoreUser) === 0) {
    $scope.GetStore();
  } else {
    $scope.UnitIds = [$cookies.UnitId];
    $scope.GetProvider();
  }
  //获取设备类别和设备
  $scope.GetEquipment4Areas = function () {
    //$scope.SearhParams.positionIds = $scope.AreasSelected;
    $scope.EquipmentList = [];
    $http({
      url: ApiMapper.sApi + '/s/rez/misc/etCategory',
      cache: false,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: JSON.stringify({
        'UnitIds': $scope.UnitIds,
        'RequisitionStatus': [1, 2, 4, 5, 6]
      })
    }).success(function (data) {
      _(data).each(function (Lists) { //+ '[' + Lists.EquipmentCode + ']'
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
    }).error(function (data) {
      $scope.isShowList = true;
    });
  };

  //禁用按钮
  $scope.isShowButton = function (Tag, n) {
    var ItemId = $scope.Select2List[n].Id;
    if (Tag == "ADD") {
      if (ItemId == "") {
        return true;
      } else if (n == 0 && $scope.Select2List.length > 1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (n == 0 && $scope.Select2List.length == 1 && (ItemId == "" || ItemId == null)) {
        return true;
      } else {
        return false;
      }
    }
  };
  //新增报修项目
  $scope.AddToSelect2 = function (Index) {
    if (!$scope.isShowButton('ADD', Index)) {
      $scope.Select2List.push({
        'Id': '',
        'text': ''
      });
    }
  };
  //删除报修项目
  $scope.RemoveForSelect2 = function (Index) {
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
      }
    }
  };

  //加载进阶选择页签于资料
  $scope.LoadMnti = function (n) {
    if (parseInt(n) == 0) {
      $scope.tabName = i18n.t("2081");
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
      $scope.tabName = i18n.t("2085");
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
      $scope.tabName = i18n.t("11129");
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
  };
  //文本框获取焦点
  $scope.rSetSelect2Values = function (Item) {
    Item.isSelected = false;
    Item.Text = "";
    Item.Id = "";
  };
  //文本关键字查询--高亮
  $scope.SetFiterHighlight = function (Select2Item) {
    $scope.Select2Data = [];
    if ($scope.tabId == "Store") {
      _($scope.StoreList).each(function (Item) {
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
      _($scope.pcompanyList).each(function (Item) {
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
      _($scope.EquipmentList).each(function (Item) {
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
  $scope.SetSelect2Values = function (Item, n) {
    $(".NT_side_footer").removeClass('unfixed');
    Item.isSelected = !Item.isSelected;
    var ItemText = $scope.Select2Data[n].Text;
    ItemText = ItemText.replace("　", "");
    ItemText = ItemText.replace("　", "");
    ItemText = ItemText.replace("<span style='color:red;'>", "");
    ItemText = ItemText.replace("</span>", "");
    Item.Text = ItemText;
    Item.Id = $scope.Select2Data[n].Id;

    $timeout(function () {
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

  var resetAllParams = function () {
    $scope.RequestTime = {
      "StartDate": null,
      "EndDate": null
    };
    $scope.Emergency = {
      'Yes': true,
      'Normal': true,
      'DontCare': false
    };
    $scope.RequisitionStatus = {
      "Filing": true,
      "Assignment": true,
      "InStore": true,
      "Acceptance": true,
      "Revocation": true,
      "OnConfirm": true,
      "OnProcess": true,
      "RawMaterialPending": true
    };

    $scope.SearhParams = {
      'UnitIds': [],
      'MaintainerIds': [],
      'EquipmentIds': [],
      'FuzzyCaseCode': null,
      'RezConditions': [2,3,4,5,7,8],
      'Emergency': [0, 1, 2],
      'IsInspection': 4,
      'UnitRegionIds': [],
      'UnitDivisionIds': [],
      'EquipmentTypeClass': [0, 1],
      'EquipmentSubTypeId': [],
      'Orders': $scope.OrderbyParames
    };
  };
  //清除所有选择
  $scope.clearSelect2Values = function () {
    resetAllParams();
    $scope.Select2Data01 = $scope.StoreList;
    $scope.Select2Data02 = $scope.pcompanyList;
    $scope.Select2Data03 = $scope.EquipmentList;

    $scope.StoreSelectedList = [];
    $scope.MaintainerSelectedList = [];
    $scope.EquipmentSelectedList = [];
    _($scope.Select2List).each(function (Item, n) {
      Item.Id = "";
      Item.Text = "";
    });
    _($scope.Select2Data01).each(function (Item) {
      Item.isSelected = false;
    });
    _($scope.SelectedList01).each(function (Item) {
      Item.isSelected = false;
    });
    _($scope.SelectedList02).each(function (Item) {
      Item.isSelected = false;
    });
    _($scope.SelectedList03).each(function (Item) {
      Item.isSelected = false;
    });

    $scope.Unit = "";
    $scope.closeDenav('Multi');
    $scope.SearchRepair($scope.currentPage);
  };
  //确认查询
  $scope.gotoSearch = function () {
    //$scope.StoreList = $scope.Select2Data01;
    //$scope.pcompanyList = $scope.Select2Data02;
    //$scope.EquipmentList = $scope.Select2Data03;
    $scope.SearhParams.UnitIds = [];
    $scope.SearhParams.MaintainerIds = [];
    $scope.SearhParams.EquipmentIds = [];
    var UnitName = [];
    _($scope.StoreSelectedList).each(function (Item) {
      UnitName.push(Item.Text);
      _($scope.StoreList).each(function (Areas) {
        if (Areas.Id == Item.Id || Item.Id == Areas.Level1 || Item.Id == Areas.Level2) {
          $scope.SearhParams.UnitIds.push(Areas.Id);
        }
      });
      $scope.SearhParams.UnitIds.push(Item.Id);
    });
    $scope.Unit = UnitName.toString();
    _($scope.MaintainerSelectedList).each(function (Item) {
      if (Item.Id != "" && Item.Id != null) {
        $scope.SearhParams.MaintainerIds.push(Item.Id);
      }
    });
    _($scope.EquipmentSelectedList).each(function (Item) {
      if (Item.Id != "" && Item.Id != null) {
        $scope.SearhParams.EquipmentIds.push(Item.Id);
      }
    });
    $scope.closeDenav('Multi');
    $scope.SearchRepair($scope.currentPage);
  };
  /*
   *王品2019R5新增功能
   *
   */
  $scope.clearSelect2GroupValues = function () {
    $scope.SearhParams.UnitRegionIds = [];
    $scope.SearhParams.Emergency = [0, 1, 2];
    $scope.SearhParams.EquipmentSubTypeId = [];
    $scope.SearhParams.IsInspection = 4;

    $scope.GroupParames = {
      "Regions": [],
      "Emergencys": [i18n.t("11074"), i18n.t("11075")],
      "TypeName": []
    };

    $scope.Emergency = {
      'Yes': true,
      'Normal': true,
      'DontCare': false
    };
    console.log($scope.Emergency);
    $scope.SubTypeSelected = [];
    _($scope.inspectionType).each(function (item) {
      item.Selected = false;
    });
    $scope.closeDenav('Group');
    $scope.GetCaseCount();
  };
  $scope.gotoGroupSearch = function () {
    $scope.closeDenav('Group');
    $scope.GetCaseCount();
  };
  //资讯案件提醒事件
  $scope.getNotifyList = function () {
    $scope.SearhParams.EquipmentTypeClass = [1];
    $scope.SearhParams.RezConditions = [2];
    $scope.SearhParams.IsInspection = 4;

    $scope.SearchRepair(1);
    $scope.WPUIpage = 'listPage';
  };

  //清除所有选择
  $scope.clearSelect2Values4Item = function () {
    //$(".NT_side_footer").removeClass('unfixed');
    _($scope.Select2List).each(function (Item, n) {
      Item.Id = "";
      Item.Text = "";
    });
    _($scope.Select2Data).each(function (Item) {
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
  $scope.loadSelect2Data4Item = function () {
    if ($scope.tabId == "Store") {
      $scope.StoreSelectedList = _.uniq($scope.SelectedList01);
      $scope.UnitIds = [];
      var UnitName = [];
      _($scope.StoreSelectedList).each(function (Item) {
        UnitName.push(Item.Text);
        _($scope.Select2Data01).each(function (Areas) {
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
  $scope.loadSearchParams = function (e) {
    if (e == "No") {
      window.location.href = "search_no.html";
    } else {
      window.location.href = "search_muti.html";
    }
  };
  // 重新查詢
  $scope.$on("ReloadSearch", function (event, data) {
    $scope.SearchRepair($scope.currentPage);
  });

  //列表查询
  $scope.SearchRepair = function (currentPage) {
    $scope.isShowMore = false;

    if (parseInt(currentPage) > 0) {
      $scope.currentPage = currentPage;
    } else {
      $scope.currentPage = 1;
    }
    
    //加载更多内容不显示loading动画
    if ($scope.currentPage <= 1 && $scope.RepairList.length === 0) {
      $scope.isLoading = true;
    }else if($scope.RepairList.length>0){
      $scope.isProgress = true;
      ngProgress.start();
    }
    if ($scope.Search4No) {
      $scope.isLoading = true;
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
    //不是正式機的APPID也不是測試機的AppId 就是別人的AppId
    //使用Appid判斷是否散戶查詢 如果是傳送的data須加上openid
    var SearhParams = $scope.SearhParams;
    if (
      $scope.AppId == 'wxb04d43e40105795a' ||
      $scope.AppId == 'wxb39ebe28ba7036a5'
    ) {
      SearhParams = $scope.SearhParams;
    } else {
      SearhParams.OpenId = $scope.OpenId;
    }
    //console.log(SearhParams);
    $scope.Repair_Search();
    $http({
      url: ApiMapper.sApi + '/s/rez/f/' + $scope.currentPage,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: JSON.stringify(SearhParams)
    }).success(function (data) {
      if ($scope.currentPage == 1) {
        $scope.RepairList = [];
      }
      
      if (data[2] > 0) {
        $scope.isShowDetail = true;
        $scope.RepairCounts = parseInt(data[0]);
        $scope.isShowMore = $scope.RepairCounts > 1 ? true : false;
        if ($scope.currentPage == $scope.RepairCounts) {
          $scope.isShowMore = false;
        } else {
          $scope.isShowMore = true;
        }
        _(data[1]).each(function (Item) {
          Item.Selected = false;
          Item.swipeState = false;
        });
        Array.prototype.push.apply($scope.RepairList, data[1]);
      } else {
        $scope.isShowDetail = false;
        $scope.isShowMore = false;
      }
      $scope.isLoading = false;
      ngProgress.complete();
$scope.isProgress = false;
    }).error(function () {
      ngProgress.complete();
      $scope.isProgress = false;
      $scope.isLoading = false;
    });
  };
  //加载更多
  $scope.LoadMore = function () {
    $scope.currentPage = $scope.currentPage + 1;
    $scope.SearchRepair($scope.currentPage);
    if ($scope.currentPage == $scope.RepairCounts) {
      $scope.isShowMore = false;
    }
  };
  //保修单号查询
  $scope.SetCaseCode = function () {
    $scope.SearhParams.UnitIds = [];
    $scope.SearhParams.MaintainerIds = [];
    $scope.SearhParams.EquipmentIds = [];
    $timeout.cancel(Func_Timeouter_Lock);
    $timeout(function () {
      $scope.TimesForLock = 0;
      $scope.Repair_Time('S');
    }, 100);
  };
  //回调函数
  $scope.ForCallback = function () {
    $timeout(function () {
      $scope.SearchRepair($scope.currentPage);
    }, 200);
  };
  // $scope.ForCallback();

  //关闭 Sidenav
  $scope.CloseSidenav = function (navID) {
    $mdSidenav(navID).close()
      .then(function () {});
  };
  //加载案件详情
  $scope.GetDetail = function (RepairItem, Tag) {
    window.localStorage.setItem("DetailId", RepairItem.RequisitionId);
    if (Tag == "Sign") {
      $mdSidenav('right_cancel_sign').toggle();
    } else {
      $scope.$broadcast("RepairList2Detail", RepairItem.RequisitionId);
      $mdSidenav('RepairDetail').toggle();
      //location.href = "Case_Detail.html?requisitionId=" + RepairItem.RequisitionId;
    }
    $scope.RepairInfo = {};
    $scope.CheckedIds = [];
    // $http({
    //     url: ApiMapper.sApi + '/s/rez/' + RepairItem.RequisitionId,
    //     method: 'GET',
    //     contentType: 'application/json',
    //     headers: { 'Passport': $cookies.Passport }
    // }).success(function (data) {
    //     $scope.RepairInfo = data;
    //     if ($scope.RepairInfo.EstArrivalTime != null && $scope.RepairInfo.EstArrivalTime != "")
    //         $scope.RepairInfo.EstArrivalTime = $filter('date')(new Date($scope.RepairInfo.EstArrivalTime), 'yyyy/MM/dd HH:mm:ss');

    //     if ($scope.RepairInfo.DateA != null && $scope.RepairInfo.DateA != "")
    //         $scope.RepairInfo.DateA = $filter('date')(new Date($scope.RepairInfo.DateA), 'yyyy/MM/dd HH:mm:ss');
    //     if (Tag == "Sign") {
    //         $scope.GetCheckinHistories(Id);
    //     }
    //     $scope.RepairInfo.IntervalAB = $scope.M2H($scope.RepairInfo.IntervalAB);
    //     $scope.RepairInfo.IntervalBC = $scope.M2H($scope.RepairInfo.IntervalBC);
    //     $scope.RepairInfo.IntervalCD = $scope.M2H($scope.RepairInfo.IntervalCD);
    //     $scope.RepairInfo.IntervalAD = $scope.M2H($scope.RepairInfo.IntervalAD);
    //     if ($scope.RepairInfo.StageId != 100 && $scope.RepairInfo.StageId != -100) {
    //         if ($scope.RepairInfo.DateB != '' && $scope.RepairInfo.DateB != null) {
    //             $scope.isAcceptance = true;
    //         }
    //     }
    //     if (parseInt($scope.RepairInfo.IsLocked) == 1) {
    //         if ($scope.RepairInfo.PreservedUserId != $cookies.UserId) {
    //             alert($scope.RepairInfo.PreservedUserName + '正在编辑此案件,编辑完成后才可新增案件记录！');
    //             return false;
    //         } else if ($scope.RepairInfo.PreservedUserId == $cookies.UserId) {
    //         }
    //     }
    //     //获取报修原因与备注
    //     $scope.GetCause();
    //     $scope.GetEquipmentpos();
    //     $scope.GetUnitInfo();
    //     $scope.getHistory();
    // });
  };
  //获取区域(案件详情)
  $scope.GetEquipmentpos = function () {
    if ($scope.RepairInfo.IPositionIds != null) {
      var IPositionIds = $scope.RepairInfo.IPositionIds;
      if (IPositionIds != '') {
        $http({
          url: ApiMapper.sApi + '/s/equipmentpos/' + $scope.RepairInfo.EquipmentId,
          method: 'GET',
          contentType: 'application/json',
          headers: {
            'Passport': $cookies.Passport
          },
          cache: false
        }).success(function (data) {
          $scope.Equipmentpos = _(data).filter(function (Item) {
            return IPositionIds.indexOf(Item.PositionId) >= 0;
          });
        });
      }
    }
  };
  //获取报修进度列表
  $scope.getHistory = function () {
    $http({
      url: ApiMapper.sApi + '/s/rez/history/' + $scope.RepairInfo.RequisitionId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (data) {
      if (data.length > 0) {
        data = data.reverse();
        $scope._TableData = data;
        _($scope._TableData).each(function (Item) {
          Item.ResponseTime = $filter('date')(new Date(Item.ResponseTime), 'yyyy/MM/dd HH:mm:ss');
        });
        if ($scope._TableData.length > 0) {
          $scope.isTimeline = true;
        }
        console.log('值為');
        console.log($scope._TableData);
      }
    });
  };
  //获取单位信息
  $scope.GetUnitInfo = function () {
    //获取部门信息
    $http({
      url: ApiMapper.sApi + '/s/unit/' + Base64.encode($scope.RepairInfo.UnitId),
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      cache: false
    }).success(function (data) {
      $scope.DeptInfo = data;
    });
  };
  //获取打卡历程
  $scope.GetCheckinHistories = function (Id) {
    $http({
      url: ApiMapper.sApi + '/s/checkin/' + Id,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (data) {
      $scope.RepairInfo.CheckinHistories = [];
      _(data).each(function (Item) {
        Item.Selected = false;
      });
      $scope.RepairInfo.CheckinHistories = data;
    });
  };
  //时间转换(分钟转为小时)
  $scope.M2H = function (mm) {
    var hh = 0;
    var _mm = 0;
    hh = mm / 60;
    _mm = mm % 60 * 100 / 60;
    hh = '' + hh + '.' + _mm;
    return parseFloat(hh).toFixed(2);
  };
  //部门选择關閉滑出頁面
  $scope.SetStore = function (e) {
    $mdSidenav('Store').close()
      .then(function () {
        if (e != "") {
          //將門店資料帶回
          $scope.SearhParams = {
            'UnitIds': [],
            'RequisitionStatus': $scope.SearhParams.RezConditions
          };
          $scope.Unit = e.Unit;
          $scope.SearhParams.UnitIds.push(e.UnitId);
          $scope.GetProvider();
          $scope.GetAreas();
        }
      });
  };
  //維修商查询
  $scope.SetMaintainer = function (e) {
    $mdSidenav('Maintainer').close()
      .then(function () {
        $scope.SearhParams = {
          'UnitIds': $scope.SearhParams.UnitIds,
          'RequisitionStatus': $scope.SearhParams.RezConditions,
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
  $scope.ECodeSearch = function (Equipment) {
    $mdSidenav('right-Area').close()
      .then(function () {
        $scope.SearhParams = {
          'UnitIds': $scope.SearhParams.UnitIds,
          'EquipmentIds': [],
          'RequisitionStatus': $scope.SearhParams.RezConditions
        };
        //排序
        $scope.SearhParams.Orders = $scope.OrderbyParames;
        $scope.EquipmentName = Equipment.EquipmentName;
        $scope.SearhParams.EquipmentIds.push(Equipment.EquipmentId);
        $scope.SearchRepair(1);
      });
  };
  $scope.exists = function (item, list) {
    return list.indexOf(item) > -1;
  };
  //选择区域
  $scope.SetAreas = function (item) {
    $scope.EquipmentName = '';
    $scope.SearhParams.EquipmentIds = [];
    var idx = $scope.AreasSelected.indexOf(item.PositionId);
    if (idx > -1) {
      $scope.AreasSelected.splice(idx, 1);
      $scope.itemsAreaStr.splice(idx, 1);
    } else {
      $scope.AreasSelected.push(item.PositionId);
      $scope.itemsAreaStr.push(item.Region + '-' + item.Position);
    }
    $scope.AreaStr = $scope.itemsAreaStr.toString();
    $scope.SearhParams.positionIds = $scope.AreasSelected;
    //$scope.Timeouter4Areas();
  };
  //区域查询设备延时
  $scope.Timeouter4Areas = function () {
    $timeout.cancel(Func_Timeouter_Lock);
    $scope.TimesForLock = 0;
    $scope.Repair_Time('A');
  };
  //选择打卡记录
  $scope.SetCheckedIds = function (Item) {
    Item.Selected = !Item.Selected;
    var idx = $scope.CheckedIds.indexOf(Item.Id);
    if (idx > -1) {
      $scope.CheckedIds.splice(idx, 1);
    } else {
      $scope.CheckedIds.push(Item.Id);
    }
  };
  //选择报修单
  $scope.SetRequisitions = function (Id) {
    var idx = $scope.RequisitionIds.indexOf(Id);
    if (idx > -1) {
      $scope.RequisitionIds.splice(idx, 1);
    } else {
      $scope.RequisitionIds.push(Id);
    }
  };
  //时间格式
  $scope.FormatDATE = FormatDate;

  $scope.toggleDenav = function (navID) {
    $mdSidenav(navID).toggle();
  };

  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function () {
      $mdSidenav(navID)
        .then(function () {});
    }, 300);
    return debounceFn;
  };
  //關閉頁面
  $scope.closeDenav = function (navID) {
    $scope.swipeState = false;
    $mdSidenav(navID)
      .close()
      .then(function () {

      });
  };
  $scope.onHammer = function onHammer(event) {
    $scope.eventType = event.type;
    //長按則將$scope.longPressSta 設為 false;
    if (event.type == 'press') {
      $scope.longPressSta = false;
      $scope.toggleDenavFN = '';
    }
  };
  //控制icon變化
  $scope.change_openicon = function () {
    if ($scope.CollapseState == false) {
      $scope.CollapseState = true;
    } else {
      $scope.CollapseState = false;
    }
  }

  // 2018/11/14 新增 王品用
  /**********************/
  /****  選擇分類页面   ***/
  /**********************/

  // 選擇案件分類-進入列表
  $scope.SelectSearch = function (selectClass, DivisionId, DivisionName) {
    $scope.RepairList = [];
    $scope.RequisitionStatus = {
      "Filing": false,
      "Assignment": false,
      "Confirmed": false,
      "InStore": false,
      "Acceptance": false,
      "Revocation": false,
      "Overtime": false,
      "RawMaterialPending": false
    };
    // 暂存部門资料
    $scope.DivisionTempData = {
      'DivisionId': DivisionId,
      'DivisionName': DivisionName
    };
    // 傳送選擇的部門
    $scope.SearhParams.UnitDivisionIds = [DivisionId];
    $scope.SearhParams.RequestTime = [];
    switch (selectClass) {
      case i18n.t("2002"):
        $scope.RequisitionStatus.InStore = true;
        $scope.WPUIpage = 'listPage';
        break;
      case i18n.t("2003"):
        $scope.RequisitionStatus.Assignment = true;
        $scope.WPUIpage = 'listPage';
        break;
      case i18n.t("2004"):
        $scope.RequisitionStatus.Filing = true;
        $scope.WPUIpage = 'listPage';
        break;
      case i18n.t("2005"):
        $scope.RequisitionStatus.Confirmed = true;
        $scope.WPUIpage = 'listPage';
        break;
      case i18n.t("2006"):
        $scope.RequestTime = {
          "StartDate": GetPreMonth(),
          "EndDate": new Date().Format()
        };
        $scope.RequisitionStatus.Acceptance = true;
        $scope.WPUIpage = 'listPage';
        break;
      case i18n.t("2008"):
        $scope.RequestTime = {
          "StartDate": GetPreMonth(),
          "EndDate": new Date().Format()
        };
        $scope.RequisitionStatus.Revocation = true;
        $scope.WPUIpage = 'listPage';
        break;
    }
  };

  // 获取案件分类-数字(進行中)
  $scope.GetCaseCount = function () {
    $scope.isLoading = true;
    var paramesStr = {
      'UnitRegionIds': [],
      'EquipmentTypeClass': [0, 1],
      'IsInspection': $scope.SearhParams.IsInspection
    };
    if ($scope.SearhParams.EquipmentTypeClass.length > 0) {
      paramesStr.EquipmentTypeClass = $scope.SearhParams.EquipmentTypeClass;
    }
    if ($scope.SearhParams.UnitRegionIds.length > 0) {
      paramesStr.UnitRegionIds = $scope.SearhParams.UnitRegionIds;
    }
    if ($scope.SearhParams.EquipmentSubTypeId.length > 0) {
      paramesStr.EquipmentSubTypeId = $scope.SearhParams.EquipmentSubTypeId;
    }
    $http({
      // 查詢: 0
      url: ApiMapper.sApi + '/s/rez/all/count/0',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: paramesStr
    }).success(function (data) {
      $scope.CaseCountList = data;
      if ($cookies.CompanyId === '308ffed8-d4a7-4ad5-8b61-6cce3c66cd06') {
        _($scope.CaseCountList).each(function (item) {
          item.ImgUrl = $cookies.CompanyId;
        });
      } else {
        _($scope.CaseCountList).each(function (item) {
          item.ImgUrl = FormatLogoURI(item.DivisionId);
        });
      }

      $scope.isLoading = false;
    }).error(function (res) {
      $scope.isLoading = false;
    });
  };

  // 返回-案件分类(清除狀態/獲取分類數字)
  $scope.ClassPage = function () {
    // filter 狀態歸零
    $scope.SearhParams.RezConditions = [2,3,4,5,7,8];
    $scope.RequisitionStatus = {
      "Filing": true,
      "Assignment": true,
      "Confirmed": true,
      "InStore": true,
      "Acceptance": true,
      "Revocation": true,
      "Overtime": true,
      "RawMaterialPending": true
    };
    $scope.RepairList = [];
    $scope.currentPage = 1;

    $scope.WPUIpage = 'selectPage';
    // 重新獲取案件分類數字 "Identity"  0:None 1:SVR  2:調度  3:維修師傅
    $scope.GetCaseCount();
  };

  $scope.callback2case = function () {
    $scope.WPUIpage = 'selectPage';
    $scope.ClassPage();
  };

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }


  // 王品確認 並且觸發王品專屬功能
  if ($cookies.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' || $cookies.CompanyId == '6c690014-2571-48db-ac5a-c6ba2572a3bb') {
    $scope.IsUItoWP = true;
    // filter 狀態歸零
    $scope.SearhParams.RezConditions = [2,3,4,5,7,8];
    $scope.RequisitionStatus = {
      "Filing": true,
      "Assignment": true,
      "Confirmed": true,
      "InStore": true,
      "Acceptance": true,
      "Revocation": true,
      "Overtime": true,
      "RawMaterialPending": true
    };
    $scope.RepairList = [];
    $scope.currentPage = 1;
    $scope.isLoading = true;
    $scope.GetCaseCount(); // 載入案件數量
    //2019R5
    $scope.getRegions();
    $scope.getFacility();
    // 20190815
    $scope.getInspectionType();
  } else {
    var _SelectClass = getParameterByName('selectClass');
    // let _DivisionId = getParameterByName('DivisionId');
    // let _DivisionName = getParameterByName('DivisionName');

    if (!!_SelectClass) {
      $scope.isLoading = true;
      switch (_SelectClass) {
        case 'Arrived':
          _SelectClass = i18n.t("2002");
          break;
        case 'Dispatched':
          _SelectClass = i18n.t("2003");
          break;
        case 'Registered':
          _SelectClass = i18n.t("2004");
          break;
        case 'Confirmed':
          _SelectClass = i18n.t("2005");
          break;
        case 'Acceptance':
          _SelectClass = i18n.t("2006");
          break;
        case 'Revocation':
          _SelectClass = i18n.t("2008");
          break;
      }
      $scope.SelectSearch(_SelectClass, null, null);
    }
  }
}]);