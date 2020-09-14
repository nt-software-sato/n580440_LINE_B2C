WeChat.controller('ApplyRepairCtrl', ["$scope", "$http", "$cookies", "$timeout", "$mdSidenav", "$mdUtil", "$cacheFactory", "$modal", "$mdDialog", "i18n", function ($scope, $http, $cookies, $timeout, $mdSidenav, $mdUtil, $cacheFactory, $modal, $mdDialog, i18n) {
  $scope.RepairParameters = {};
  $scope.AppId = window.localStorage.getItem('b2c_appId');
  $scope.Maintenance = 0;
  $scope.InspectionStyle = 1;
  $scope.StoreList = []; //門店json
  $scope.CauseList = [];
  $scope.EquipmentName = '';
  $scope.AreaStr = ""; //最終已選擇區域名單    
  $scope.itemsAreaStr = []; //已選擇區域暫存參數
  $scope.itemsCauseStr = [];
  $scope.PriorityId = "";
  $scope.Unit = $cookies.Unit;
  $scope.CauseSelect = [];
  $scope.Record = {};
  $scope.isStore = false;
  $scope.isStart = false;
  $scope.isplayVoice = false;
  $scope.isSubmit = false;
  $scope.isShowSetting = false;
  $scope.isWPStoreUser = false;
  $scope.isShowArea = true;
  $scope.CompanyId = $cookies.CompanyId;
  $scope.StoreUser = $cookies.StoreUser;
  $scope.StoreSearch = "";
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
  $scope.SettingInfo = [{
    "nCount": null,
    "nHeight": null,
    "nWidth": null,
    "nLong": null
  }];
  $scope.RepairParameters = {
    'StageId': 0,
    'Source': 4,
    'UserId': $cookies.UserId,
    'UserName': $cookies.UserName,
    'UnitId': $cookies.UnitId,
    'Unit': $cookies.Unit,
    'IPositionIds': [],
    'ICauseIds': [],
    'CauseId': '',
    'Causes': '',
    'Description': '',
    'ImageMediaIds': [],
    'VoiceMediaId': '',
    'CompanyId': $cookies.CompanyId
  };
  $scope.MediasParamenter = {
    'Key': '',
    'FileSoure': 40,
    'Medias': {
      'image': [],
      'voice': []
    }
  };
  $scope.equipment = {
    "UnitId": $cookies.UnitId,
    "Unit": $cookies.Unit,
    "EquipmentTypeClass": 0,
    "EquipmentTypeId": "",
    "EquipmentTypeName": "",
    "EquipmentName": "",
    "EquipmentCode": "",
    "IPositionIds": []
  };
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
  $scope.Equipmentpos = [];
  $scope.TypeList = [];
  $scope.StoreUser = $cookies.StoreUser;
  $scope.IsShowToScanQRCode = false;
  $scope.IsShowAddCause = false;
  $scope.IsWPStylePriorityList = false;
  $scope.IsAutoSetPosition = false;
  // 王品 5/23
  var Client_Permissions = ["f96f98e2-38f9-456a-9813-82d899536a82", "eb296708-6fc6-43f0-b506-0ca0fa91e1cd", "6c690014-2571-48db-ac5a-c6ba2572a3bb", "c1a24352-46a1-4301-9b96-a67c92691336", "C4B0E179-8121-487E-AA63-59635ACF2447"];
  if (Client_Permissions.indexOf($cookies.CompanyId) > -1) {
    $scope.IsShowToScanQRCode = true;
    $scope.IsShowAddCause = true;
    $scope.IsWPStylePriorityList = true;
    //if(parseInt($scope.StoreUser) === 1){
    if ($cookies.CompanyId !== 'f96f98e2-38f9-456a-9813-82d899536a82' && $cookies.CompanyId !== 'c1a24352-46a1-4301-9b96-a67c92691336') {
      $scope.isWPStoreUser = true;
    }
    //}
  };
  if (Client_Permissions.indexOf($cookies.CompanyId) > -1) {
    $scope.IsAutoSetPosition = true;
  };
  //设定微信调用
  $scope.Load_WX = function () {
    wx.config({
      debug: false,
      appId: $scope.AppId,
      timestamp: 1437377735,
      nonceStr: 'n580440',
      signature: window.localStorage.getItem($scope.AppId + "_signature"),
      jsApiList: ['checkJsApi', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord', 'stopRecord', 'onRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage',  'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard']
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
  $scope.exists = function (item, list) {
    return list.indexOf(item) > -1;
  };
  //获取单位资料
  $scope.GetStore = function () {
    $http({
      url: ApiMapper.sApi + '/s/unit/maps',
      method: 'GET',
      cache: true,
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (Unitdata) {
      console.log(i18n.t("1001"))
      $scope.Unitdata = Unitdata;
      // alert(JSON.stringify($scope.Unitdata));
      _.forEach(Unitdata[1], function (Item1) {
        $scope.UnitLeve4data = [];
        Item1.isSelected = false;
        _.forEach(Unitdata[3], function (Item2) {
          $scope.UnitLeve4data.push(Item2);
          if (Item2.Level2 == Item1.UnitId) {
            Item2.Level2Name = Item1.Unit;
            Item2.isSelected = false;
          }
          if (Item2.UnitId == $cookies.UnitId) {
            $scope.isStore = true;
            $scope.Unit = Item2.Unit;
            $scope.RepairParameters.UnitId = Item2.UnitId;
            $scope.RepairParameters.Unit = Item2.Unit;
            //$scope.UnitLeve4data.push(Item1);
          }
          if (!$scope.isStore) {
            var CompanyInfo = Unitdata[0];
            $scope.Unit = CompanyInfo[0].Unit;
          }
        });
        $scope.StoreList.push(Item1);
      });
      $scope.GetEquipment($cookies.UnitId);
    }).error(function (status) {
      alert("获取部门信息错误！");
    });
  };
  $scope.GetStore();
  $scope.AreaIds = [];
  $scope.ProvinceIds = [];
  $scope.isSelectLeve2 = function (UnitItem) {
    _.forEach($scope.Unitdata[1],function (Item) {
      Item.isSelected = false;
      if (Item.UnitId == UnitItem.UnitId) {
        UnitItem.isSelected = !UnitItem.isSelected;
      }
    });
    if (UnitItem.isSelected) {
      $scope.AreaIds = [UnitItem.UnitId];
      $scope.ProvinceIds = [];
    }
    $scope.UnitLeve3data = _.filter($scope.Unitdata[2],function (Item) {
      return Item.Level2 == UnitItem.UnitId;
    });
  };
  $scope.isSelectLeve3 = function (UnitItem) {
    _.forEach($scope.Unitdata[2],function (Item) {
      Item.isSelected = false;
      if (Item.UnitId == UnitItem.UnitId) {
        UnitItem.isSelected = !UnitItem.isSelected;
      }
    });
    if (UnitItem.isSelected) {
      $scope.ProvinceIds = [UnitItem.UnitId];
    }
  };
  $scope.reLoadLeve4 = function () {
    $scope.UnitLeve4data = _.filter($scope.Unitdata[3],function (Item) {
      if ($scope.ProvinceIds.length > 0) {
        return Item.Level3 == $scope.ProvinceIds[0];
      } else {
        return Item.Level2 == $scope.AreaIds[0];
      }
    });
  };
  $scope.isSelectLeve4 = function (UnitItem) {
    _.forEach($scope.UnitLeve4data,function (Item) {
      Item.isSelected = false;
      if (Item.UnitId == UnitItem.UnitId) {
        UnitItem.isSelected = !UnitItem.isSelected;
      }
    });
    if (UnitItem.isSelected) { //將門店資料帶回
      $scope.Unit = UnitItem.Unit;
      $scope.RepairParameters.Unit = UnitItem.Unit;
      $scope.RepairParameters.UnitId = UnitItem.UnitId;
      $scope.RepairParameters.EquipmentCode = '';
      $scope.EquipmentName = '';
      $scope.RepairParameters.ICauseIds = [];
      $scope.CauseList = [];
      $scope.itemsCauseStr = [];
      $scope.ICauses = '';
      $scope.setSelect4Cause();
      $scope.GetEquipment($scope.RepairParameters.UnitId);
    }
  };
  //设定保养预设时间
  $scope.SetEstDate = function () {
    $scope.RepairParameters.EstArrivalTime = GetNow();
    $scope.EstArrivalTime = FormatDate(GetNow());
    $('input[name="EstArrivalDate"]').val($scope.EstArrivalTime);
  };
  $('input[name="EstArrivalDate"]').daterangepicker({
    singleDatePicker: true,
    showDropdowns: false,
    format: 'YYYY/MM/DD',
    "minDate": GetNow()
  });
  //设定报修/保养
  $scope.setInspection = function (Tag) {
    $scope.Maintenance = Tag;
    $scope.IsInspection = Tag == 0 ? false : true;
    $scope.SetEstDate();
    if ($scope.RepairParameters.UnitId != null && $scope.RepairParameters.UnitId != "") {
      $scope.reloadParameters();
      $scope.GetEquipment();
    }
  }
  //重置报修信息
  $scope.reloadParameters = function () {
    $scope.AreaStr = "";
    $scope.ICauses = "";
    $scope.EquipmentName = "";
    $scope.RepairParameters.EquipmentCode = '';
    $scope.RepairParameters.EquipmentName = '';
    $scope.AreasList = [];
    $scope.CauseList = [];
    $scope.PriorityList = [];
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
  }
  //调用微信扫一扫接口获取设备
  $scope.ToscanQRCode = function () {
    //微信扫一扫功能
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
      success: function (res) {
        $scope.QRCodeStr = res.resultStr;
        //解密单位二维码信息
        $http({
          url: ApiMapper.sApi + "/s/equipment/code/" + encodeURIComponent($scope.QRCodeStr),
          contentType: "application/json",
          headers: {
            "Passport": $cookies.Passport
          },
          method: "GET",
        }).success(function (data) {
          $scope.RepairParameters.EquipmentCode = data.EquipmentCode;
          $scope.RepairParameters.EquipmentTypeId = data.EquipmentTypeId;
          $scope.RepairParameters.EquipmentTypeClass = data.EquipmentTypeClass;
          $scope.RepairParameters.EquipmentId = data.EquipmentId;
          $scope.RepairParameters.EquipmentName = data.EquipmentName;
          $scope.EquipmentName = '[' + data.EquipmentCode + "]  " + data.EquipmentName;
          $scope.RepairParameters.IPositionIds = [];
          $scope.RepairParameters.IPositionIds = data.IPositionIds;
          $scope.GetPriority(); //加载报修时限数据
          $scope.GetCause(); //加载报修原因
          $scope.GetMaintainer();
        }).error(function (data) {
          alert(data.Messages);
        });
      }
    });
  };
  //根据设备类别获取预设维修厂商
  $scope.GetMaintainer = function () {
    $http({
      url: ApiMapper.sApi + "/s/punit/allocated/" + $scope.RepairParameters.EquipmentTypeClass + '/' + $scope.RepairParameters.EquipmentId,
      contentType: "application/json",
      headers: {
        "Passport": $cookies.Passport
      },
      method: "GET",
    }).success(function (data) {
      $scope.RepairParameters.MaintainerId = data.MaintainerId;
      $scope.RepairParameters.MaintainerName = data.MaintainerName;
      $scope.RepairParameters.StrongholdId = data.StrongholdId;
      $scope.RepairParameters.StrongholdName = data.StrongholdName;
      $scope.GetMaintainerInfo();
    }).error(function (data) {
      alert(data.Messages);
    });
  };
  //获取维修商资讯
  $scope.GetMaintainerInfo = function () {
    //$timeout(function () {
    //获取部门信息
    $http({
      url: ApiMapper.ccApi + '/g/punit/' + $scope.RepairParameters.MaintainerId + '/' + $scope.RepairParameters.StrongholdId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      cache: false
    }).success(function (data) {
      var StrongholdInfo = $scope.RepairParameters.MaintainerName + '-' + $scope.RepairParameters.StrongholdName + "\n 联系人：";
      if (data.Liaison.length > 0) {
        _.forEach(data.Liaison,function (Item) {
          if (Item.Name != null && Item.Name != "") {
            StrongholdInfo += Item.Name.toString();
          }
          if (Item.PhoneNo != null && Item.PhoneNo != "") {
            StrongholdInfo += "  联系电话：" + Item.PhoneNo.toString() + "\n";
          }
        });
      }
      $scope.RepairParameters.StrongholdInfo = StrongholdInfo;
    });
    //}, 200);
  };
  //获取设备/设施
  $scope.GetEquipment = function (UnitId) {
    $scope.reloadParameters();
    var parameterStr = {
      'UnitId': $scope.RepairParameters.UnitId,
      'TopicType': 1,
      'Maintenance': $scope.Maintenance
    };
    if ($scope.CompanyId == "eb296708-6fc6-43f0-b506-0ca0fa91e1cd" || $scope.CompanyId == "6c690014-2571-48db-ac5a-c6ba2572a3bb" || $scope.CompanyId == "C4B0E179-8121-487E-AA63-59635ACF2447") {
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
      $scope.GetFacilities(); //获取设施列表
    };
    $http({
      url: ApiMapper.sApi + '/s/equipment/classification',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: JSON.stringify(parameterStr)
    }).success(function (data) {
      if ($scope.CompanyId == "eb296708-6fc6-43f0-b506-0ca0fa91e1cd" || $scope.CompanyId == "6c690014-2571-48db-ac5a-c6ba2572a3bb" || $scope.CompanyId == "C4B0E179-8121-487E-AA63-59635ACF2447") {
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
        _(data).each(function (Items) {
          var EquipmentList = Items.children;
          _(EquipmentList).each(function (Lists) {
            Lists.EquipmentTypeName = Items.EquipmentTypeName;
            var EquipmentCode = Lists.EquipmentCode.split('-');
            Lists.SortNo = parseInt(EquipmentCode[1]);
            $scope.EquipmentList.forEach(function (equipmentType, index) {
              if (equipmentType.EquipmentTypeClass == Lists.EquipmentTypeClass) {
                $scope.EquipmentList[index].children.push(Lists);
              };
            });
          });
        });
        _($scope.EquipmentList).each(function (Item) {
          Item.children = _.sortBy(Item.children, 'SortNo');
        });
      }
    });
  };
  //获取王品设施列表
  $scope.GetFacilities = function () {
    var parameterStr = {
      'UnitId': $scope.RepairParameters.UnitId,
      'TopicType': 4,
      'Maintenance': $scope.Maintenance
    };
    $http({
      url: ApiMapper.sApi + '/s/equipment/classification',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: JSON.stringify(parameterStr)
    }).success(function (res) {
      _(res).each(function (Items) {
        var EquipmentList = Items.children;
        _(EquipmentList).each(function (Lists) {
          Lists.EquipmentTypeName = Items.EquipmentTypeName;
          var EquipmentCode = Lists.EquipmentCode.split('-');
          Lists.SortNo = parseInt(EquipmentCode[1]);
          $scope.EquipmentList[1].children.push(Lists);
        });
      });
    });
  };
  $scope.reloadCause = function () {
    $scope.CauseList = [];
    $scope._CauseList = [];
    $scope.PriorityList = [];
    $scope.RepairParameters.Priority = '';
    $scope.RepairParameters.Emergency = 0;
    $scope.RepairParameters.Limitation = 0;
  };
  //选择设备帶入地區資料
  $scope.ShowArea = function (Equipment, PositionByTypeEquipmentTypeName) {
    //王品设施不显示区域 2019R5
    if (PositionByTypeEquipmentTypeName === "设施" && $scope.isWPStoreUser) {
      $scope.isShowArea = false;
    } else {
      $scope.isShowArea = true;
    }
    //写入设备资料到报修主档
    if ($scope.RepairParameters.EquipmentCode == '') {
      $scope.AreasList = [];
      $scope.CauseList = [];
      $scope.PriorityList = [];
      $scope.ICauses = "";
      $scope.RepairParameters.EquipmentTypeId = '';
      $scope.RepairParameters.EquipmentTypeClass = '';
      $scope.RepairParameters.EquipmentId = '';
      $scope.RepairParameters.EquipmentName = '';
      $scope.RepairParameters.IsRezPhotos = 0;
      $scope.RepairParameters.IPositionIds = [];
      $scope.RepairParameters.MaintainerId = '';
      $scope.RepairParameters.StrongholdId = '';
      $scope.RepairParameters.IsSupportArea = 0;
      $scope.reloadCause();
    }
    $scope.RepairParameters.EquipmentCode = Equipment.EquipmentCode;
    $scope.RepairParameters.EquipmentTypeId = Equipment.EquipmentTypeId;
    $scope.RepairParameters.EquipmentTypeClass = Equipment.EquipmentTypeClass;
    $scope.RepairParameters.EquipmentId = Equipment.EquipmentId;
    $scope.RepairParameters.EquipmentName = Equipment.EquipmentName;
    $scope.RepairParameters.IsRezPhotos = Equipment.IsRezPhotos;
    $scope.RepairParameters.IPositionIds = Equipment.PositionIds.split();
    $scope.RepairParameters.MaintainerId = Equipment.MaintainerId;
    $scope.RepairParameters.StrongholdId = Equipment.StrongholdId;
    $scope.RepairParameters.IsSupportArea = Equipment.IsSupportArea;
    $scope.EquipmentName = '[' + $scope.RepairParameters.EquipmentCode + "]  " + $scope.RepairParameters.EquipmentName;
    $scope.reloadCause();
    if ($scope.IsInspection) {
      $scope.getCause4Inspection();
    } else {
      $scope.GetCause(); //加载报修原因
    }
    $http({
      url: ApiMapper.sApi + '/s/equipmentpos/' + Equipment.EquipmentId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (List, status) {
      $scope.RepairParameters.IPositionIds = [];
      $scope.itemsAreaStr = [];
      $scope.AreaStr = '';
      if (List.length == 1) {
        _(List).each(function (Item) {
          Item.Selected = true;
        });
        if ($scope.IsAutoSetPosition == false) {
          $scope.toggleForArea(List[0]);
        }
      } else if (List.length > 1) {
        _(List).each(function (Item) {
          Item.Selected = false;
        });
      }
      $scope.AreasList = List;
      if ($scope.IsAutoSetPosition) {
        List.forEach(function (item) {
          if (item.Position == PositionByTypeEquipmentTypeName) {
            $scope.itemsAreaStr.push(item.Region + '-' + item.Position);
            $scope.RepairParameters.IPositionIds.push(item.PositionId);
          };
        });
        $scope.AreaStr = $scope.itemsAreaStr.toString();
      };
    }).error(function (List, status) {});
    if ($scope.IsAutoSetPosition) {
      $scope.EQ_close('');
    };
  };
  $scope.toggleForArea = function (item) {
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
  $scope.existsForArea = function (item, list) {
    return list.indexOf(item) > -1;
  };
  //设定报修原因Select2
  $scope.setSelect4Cause = function () {
    /**取消王品新增报修原因功能20170801*/
    // if($scope.CompanyId=="eb296708-6fc6-43f0-b506-0ca0fa91e1cd"){
    //     //$scope.CauseList=[{'CauseId':'','Cause':''}];
    //     $("#multi-append").select2({ tags: true,placeholder: "请选择报修原因"}).change(function () {
    //         $timeout(function () {
    //             $scope.RepairParameters.ICauseIds = _($("#multi-append").select2("val")).toArray(); 
    //         }, 200);
    //     });
    // }else{
    $timeout(function () {
      //$("#multi-append").select2({ placeholder: "请选择报修原因",tags: true }).change(function () {
      $("#multi-append").data('select2').destroy();
      $("#multi-append").off("change");
      $("#multi-append").select2({
        placeholder: "请选择报修原因"
      }).change(function () {
        $timeout(function () {
          $scope.RepairParameters.ICauseIds = _($("#multi-append").select2("val")).toArray();
          if ($scope.RepairParameters.ICauseIds.length > 0) {
            $scope.GetPriority(); //加载报修时限数据
          };
          var objItem = $("#multi-append").select2("data");
          $scope.isOpenSetting = false;
          _(objItem).each(function (item) {
            if (item.text == "亚克力板坏" || item.text == "亚克力门板坏") {
              $('#equipment_setting').modal('show');
              $scope.isOpenSetting = true;
            }
          });
          _($scope.CauseList).each(function (Items01) {
            _(Items01.children).each(function (Items02) {
              if (Items02.ICauseIds == $scope.RepairParameters.ICauseIds) {
                $scope.RepairParameters.Priority = Items02.Priority;
                $scope.RepairParameters.Emergency = Items02.Emergency;
                $scope.RepairParameters.Limitation = Items02.Limitation;
              }
            });
          });
        }, 200);
      });
    }, 200);
    // }    
  };
  //获取报修原因
  $scope.GetCause = function () {
    $scope.RepairParameters.ICauseIds = [];
    $scope.itemsCauseStr = [];
    $scope.ICauses = '';
    if ($scope.RepairParameters.MaintainerId == null || $scope.RepairParameters.MaintainerId == "") {
      $scope.RepairParameters.MaintainerId = 'None';
    }
    $http({
      url: ApiMapper.sApi + '/s/equipmentcause/' + $scope.RepairParameters.EquipmentId + '/' + $scope.RepairParameters.MaintainerId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: JSON.stringify({
        'EquipmentTypeId': $scope.RepairParameters.EquipmentTypeId,
        'EquipmentName': $scope.RepairParameters.EquipmentName,
        'MaintainerId': $scope.RepairParameters.MaintainerId
      })
    }).success(function (List, status) {
      $scope.CauseList = [];
      var CauseList = List.children;
      _(CauseList).each(function (item) {
        if (item.Status == 1) {
          $scope.CauseList.push(item);
        }
      });
      $scope.setSelect4Cause();
    }).error(function (List, status) {});
  };
  //产生新原因
  $scope.createCause = function () {
    $mdDialog.show({
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      template: '<md-dialog>' +
        '  <md-dialog-content>' +
        '    <h5 class="md-title text-center" style="font-size:14px;">新增原因</h5>' +
        '    <input type="text" ng-model="Cause.value" placeholder="请输入...">' +
        '  </md-dialog-content>' + '  <div class="md-actions">' +
        '    <md-button ng-click="cancelDialog()" class="md-primary">' +
        '      取消' +
        '    </md-button>' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      确定' +
        '    </md-button>' +
        '  </div>' +
        '</md-dialog>',
      controller: function DialogController($scope, $mdDialog) {
        $scope.Cause = {
          value: ''
        };
        $scope.cancelDialog = function () {
          $mdDialog.cancel();
        };
        $scope.closeDialog = function () {
          $mdDialog.hide($scope.Cause.value);
        };
      }
    }).then(function (NewCause) {
      if (NewCause != null && NewCause != "") {
        var param = {
          "Cause": NewCause,
          "EquipmentId": $scope.RepairParameters.EquipmentId,
          "StoreUser": $scope.StoreUser
        };
        $http({
          url: ApiMapper.sApi + '/s/equipmentcause/create',
          method: 'Post',
          contentType: 'application/json',
          headers: {
            'Passport': $cookies.Passport
          },
          data: JSON.stringify(param)
        }).success(function (data, status) {
          if ($scope.IsInspection) {
            $scope.getCause4Inspection();
          } else {
            $scope.GetCause(); //加载报修原因
          }
        }).error(function (error, status) {
          alert(error.Messages);
        });
      }
    }, function () {
      // console.log('cancel');
    });
  };
  //获取保养设备原因
  $scope.getCause4Inspection = function () {
    $scope.RepairParameters.CauseIds = "";
    $scope.itemsCauseStr = [];
    $scope.ICauses = '';
    // if($scope.RepairParameters.MaintainerId==null||$scope.RepairParameters.MaintainerId==""){$scope.RepairParameters.MaintainerId='None';}
    $http({
      url: ApiMapper.sApi + '/s/equipmentcause/inspect/' + $scope.RepairParameters.EquipmentId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function (List, status) {
      $scope.InspectionCauseList = [];
      var InspectionCauseList = List.children;
      _(InspectionCauseList).each(function (item) {
        if (item.Status == 1) {
          $scope.InspectionCauseList.push(item);
        }
      });
    }).error(function (List, status) {});
  }
  //获取报修时限
  $scope.GetPriority = function () {
    $scope.PriorityList = [];
    var PriorityParamerters = {
      "EquipmentTypeClass": $scope.RepairParameters.EquipmentTypeClass,
      "EquipmentId": $scope.RepairParameters.EquipmentId,
      "MaintainerId": $scope.RepairParameters.MaintainerId,
      "CauseIds": $scope.RepairParameters.ICauseIds,
      "IsSupportArea": $scope.RepairParameters.IsSupportArea
    };
    $http({
      url: ApiMapper.sApi + '/s/priority',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: JSON.stringify(PriorityParamerters)
    }).success(function (List, status) {
      $scope.PriorityList = [];
      $scope.PriorityCount = 0;
      _(List).each(function (Items) {
        if (Items.EquipmentTypeClass == $scope.RepairParameters.EquipmentTypeClass || Items.EquipmentTypeClass == 99) {
          Items.ischecked = false;
          $scope.PriorityCount += 1;
          $scope.PriorityList.push(Items);
        }
      });
      // 王品不預設第一個選項
      // 王品 5/23
      if (['eb296708-6fc6-43f0-b506-0ca0fa91e1cd', '6c690014-2571-48db-ac5a-c6ba2572a3bb', 'f96f98e2-38f9-456a-9813-82d899536a82', 'C4B0E179-8121-487E-AA63-59635ACF2447'].indexOf($cookies.CompanyId) == -1) {
        $scope.PriorityList[0].ischecked = true;
        $scope.RepairParameters.PriorityId = $scope.PriorityList[0].PriorityId;
        $scope.RepairParameters.Priority = $scope.PriorityList[0].Priority;
        $scope.RepairParameters.Emergency = $scope.PriorityList[0].Emergency;
        $scope.RepairParameters.Limitation = $scope.PriorityList[0].Limitation;
      };
    }).error(function (List, status) {});
  };
  //设定报修时限
  $scope.SetPriority = function (Priority) {
    _($scope.PriorityList).each(function (Items) {
      Items.ischecked = false;
      if (Items.PriorityId == Priority.PriorityId) {
        Items.ischecked = true;
      }
    });
    // 王品 5/23 增加85 7/25
    if (['308ffed8-d4a7-4ad5-8b61-6cce3c66cd06', 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd', '6c690014-2571-48db-ac5a-c6ba2572a3bb', 'f96f98e2-38f9-456a-9813-82d899536a82', 'C4B0E179-8121-487E-AA63-59635ACF2447'].indexOf($cookies.CompanyId) > -1) {
      var hasUrgent = Priority.Priority.indexOf('紧急');
      if (hasUrgent !== -1) {
        alert('请注意，紧急报修上门费比一般报修高！');
      }
    };
    $scope.RepairParameters.PriorityId = Priority.PriorityId;
    $scope.RepairParameters.Priority = Priority.Priority;
    $scope.RepairParameters.Emergency = Priority.Emergency;
    $scope.RepairParameters.Limitation = Priority.Limitation;
  };
  $scope.openAddEquipment = function () {
    var AddEquipmentModalInstance = $modal.open({
      animation: true,
      templateUrl: 'app/CaseList/SearchGroup/Case_search_equipment_add.html',
      controller: AddEquipmentCtr,
      size: 'md',
      resolve: {
        UnitId: function () {
          return $scope.RepairParameters.UnitId;
        },
        Unit: function () {
          return $scope.RepairParameters.Unit;
        }
      }
    });
    AddEquipmentModalInstance.result.then(function (result) {
      $scope.GetEquipment($scope.RepairParameters.UnitId);
    }, function () {});
  };
  //整体照片
  $scope.chooseWhole = function () {
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      success: function (res) {
        if ($scope.imagesList.WholeIds.length > 0) {
          //$scope.imagesList.localIds = $scope.imagesList.localIds.concat(res.localIds);
          Array.prototype.push.apply($scope.imagesList.WholeIds, res.localIds);
        } else {
          $scope.imagesList.WholeIds = res.localIds;
        }
        $scope.imagesList.serverIds = [];
        $scope.$apply();
        $timeout(function () {
          _($scope.imagesList.WholeIds).each(function (Item, i) {
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
  $scope.RemoveWhole = function (idx) {
    $scope.imagesList.WholeIds.splice(idx, 1);
  };
  //局部照片
  $scope.chooseImage = function () {
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      success: function (res) {
        if ($scope.imagesList.localIds.length > 0) {
          //$scope.imagesList.localIds = $scope.imagesList.localIds.concat(res.localIds);
          Array.prototype.push.apply($scope.imagesList.localIds, res.localIds);
        } else {
          $scope.imagesList.localIds = res.localIds;
        }
        $scope.imagesList.serverIds = [];
        $scope.$apply();
        $timeout(function () {
          _($scope.imagesList.localIds).each(function (Item, i) {
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
  $scope.RemoveImg = function (idx) {
    $scope.imagesList.localIds.splice(idx, 1);
  };
  //语音
  $scope.startRecord = function () {
    wx.startRecord({
      success: function (res) {
        $scope.isStart = true;
        $scope.$apply();
      }
    });
  };
  $scope.stopRecord = function () {
    wx.stopRecord({
      success: function (res) {
        $scope.isStart = false;
        $scope.Record.localId = res.localId;
        $scope.$apply();
      }
    });
  };
  wx.onVoiceRecordEnd({
    complete: function (res) {
      $scope.Record.localId = res.localId;
      alert('录音时间已超过一分钟');
    }
  });
  //播放录音
  $scope.playVoice = function () {
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
        success: function (res) {
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
  $scope.pauseVoice = function () {
    wx.pauseVoice({
      localId: $scope.Record.localId
    });
  };
  //停止播放音频
  $scope.stopVoice = function () {
    wx.stopVoice({
      localId: $scope.Record.localId
    });
  };
  //监听语音播放完毕接口
  wx.onVoicePlayEnd({
    success: function (res) {
      $scope.isplayVoice = false;
    }
  });
  //上传录音档
  $scope.UpdateRecord = function () {
    wx.uploadVoice({
      localId: $scope.Record.localId,
      success: function (res) {
        $scope.Record.serverId = res.serverId;
      }
    });
  };
  //关闭微信浏览器
  $scope.CloseBrowser = function () {
    //WeixinJSBridge.call('closeWindow');
    wx.closeWindow();
  };
  //生成销案密码
  $scope.SetClosedNo = function (n) {
    var rnd = "";
    for (var i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
    return rnd;
  };
  $scope.RepairParameters.ClosedNo = $scope.SetClosedNo(4);
  //上传
  $scope.onLoad01 = true;
  $scope.onLoad02 = true;
  var i = 0;
  var length = $scope.imagesList.allIds.length;
  $scope.uploadImageIds = {};
  $scope.upload = function () {
    setTimeout(function () {
      var uploadedId = $scope.uploadImageIds[$scope.imagesList.allIds[i]];
      if (typeof uploadedId === "undefined" || uploadedId === "") {
        //获取本地图片Base64编码数据
        // wx.getLocalImgData({
        //   localId: $scope.imagesList.allIds[i], // 图片的localID
        //   success: function (res) {
        //     var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
            
        //   }
        // });
        var localId = $scope.imagesList.allIds[i].toString();
        //解决IOS无法上传的坑
        if (localId.indexOf("wxlocalresource") != -1) {
          localId = localId.replace("wxlocalresource", "wxLocalResource");
        }
        wx.uploadImage({
          localId: localId,
          isShowProgressTips: 1,
          success: function (res) {
            //保存至已上传图片对象
            res.id = res.serverId.toUpperCase();
            $scope.uploadImageIds[$scope.imagesList.allIds[i]] = res.serverId;
            i++;
            $scope.imagesList.serverIds.push(res.serverId);
            $scope.RepairParameters.ImageMediaIds.push(res.serverId);
            $scope.MediasParamenter.Medias.image.push(res.serverId);
            if (i < length) {
              $scope.upload();
            } else {
              $scope.onLoad01 = false;
              $scope.Submit_Repair();
            }
          },
          fail: function (error) {
            $scope.imagesList.serverIds = [];
            $scope.RepairParameters.ImageMediaIds = [];
            $scope.MediasParamenter.Medias.image = [];
            alert("上传图片发生服务器错误！ ");
          }
        });
      } else {
        i++;
        $scope.imagesList.serverIds.push(uploadedId);
        $scope.RepairParameters.ImageMediaIds.push(uploadedId);
        $scope.MediasParamenter.Medias.image.push(uploadedId);
        if (i < length) {
          $scope.upload();
        } else {
          $scope.onLoad01 = false;
          $scope.Submit_Repair();
        }
      }
    }, 100);
  };
  $scope.uploadimages = function () {
    if ($scope.onLoad01) {
      $scope.imagesList.serverIds = [];
      $scope.MediasParamenter.Medias.image = [];
      $scope.RepairParameters.ImageMediaIds = [];
      i = 0;
      length = $scope.imagesList.allIds.length;
      $scope.upload();
    }
  };
  $scope.uploadVoice = function () {
    if ($scope.onLoad02) {
      wx.uploadVoice({
        localId: $scope.Record.localId,
        isShowProgressTips: 1,
        success: function (res) {
          $scope.Record.serverId = res.serverId;
          $scope.onLoad02 = false;
          $scope.RepairParameters.VoiceMediaId = $scope.Record.serverId;
          $scope.MediasParamenter.Medias.voice = [];
          $scope.MediasParamenter.Medias.voice.push($scope.Record.serverId);
          $scope.Submit_Repair();
        },
        fail: function (error) {
          $scope.RepairParameters.VoiceMediaId = [];
          $scope.MediasParamenter.Medias.voice = [];
          alert("上传发生服务器错误！ ");
        }
      });
    }
  };
  //保存媒体档案到580440
  $scope.LoadMedias = function (RequisitionId) {
    $scope.MediasParamenter.Key = RequisitionId;
    //alert(JSON.stringify($scope.MediasParamenter));
    $http({
      url: ApiMapper.wxApi + '/wx/files/' + $scope.AppId,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: $scope.MediasParamenter
    }).success(function (data) {
      if (data != "Saved") {
        $scope.isSubmit = false;
        alert('报修失败！\n\r请联系580-440报修中心！');
        return false;
      } else {
        $scope.isSubmit = false;
        alert('成功报修！\n\r单号：' + $scope.CaseNo);
        $scope.CloseBrowser();
      }
    }).error(function (List, status) {
      $scope.isSubmit = false;
      alert('报修失败！\n\r请联系580-440报修中心！');
    });
  };
  //送出报修
  $scope.SubmitCount = 0;
  $scope.Submit_Repair = function () {
      if (!$scope.IsInspection) {
      if ($scope.RepairParameters.PriorityId == '' || $scope.RepairParameters.PriorityId == undefined) {
        $scope.isSubmit = false;
        alert('请选择报修原因及报修时限！');
        return false;
      };
    };
    if ($scope.RepairParameters.IsRezPhotos == 1) {
      if ($scope.imagesList.WholeIds.length == 0) {
        $scope.isSubmit = false;
        alert('请上传报修整体照片！');
        return false;
      } else if ($scope.imagesList.localIds.length == 0) {
        $scope.isSubmit = false;
        alert('请上传报修局部照片！');
        return false;
      }
    }
    $scope.imagesList.allIds = $scope.imagesList.WholeIds.concat($scope.imagesList.localIds);
    $scope.isSubmit = true;
    if ($scope.imagesList.allIds.length > 0 && $scope.onLoad01) {
      $scope.uploadimages();
    } else if ($scope.Record.localId != "" && $scope.onLoad02) {
      $scope.uploadVoice();
    } else {
      if ($scope.SubmitCount == 0) {
        $scope.SubmitCount = 1;
        //alert( JSON.stringify($scope.RepairParameters));
        if ($scope.RepairParameters.UnitId == '' || $scope.RepairParameters.UnitId == undefined) {
          $scope.isSubmit = false;
          $scope.SubmitCount = 0;
          alert('请选择报修单位！');
          return false;
        } else if ($scope.RepairParameters.EquipmentCode == '' || $scope.RepairParameters.EquipmentCode == undefined) {
          $scope.isSubmit = false;
          $scope.SubmitCount = 0;
          alert('请选择报修设备！');
          return false;
        }
        if (!$scope.IsInspection) {
          if (($scope.RepairParameters.ICauseIds.length == 0 || $scope.RepairParameters.ICauseIds == undefined) && $scope.RepairParameters.Description == '') {
            $scope.isSubmit = false;
            $scope.SubmitCount = 0;
            alert('请说明报修原因！');
            return false;
          } else if ($scope.RepairParameters.PriorityId == '' || $scope.RepairParameters.PriorityId == undefined) {
            $scope.isSubmit = false;
            $scope.SubmitCount = 0;
            alert('请选择维修时限！');
            return false;
          }
        }
        if ($scope.IsInspection) {
          if ($scope.RepairParameters.CauseIds == "") {
            $scope.isSubmit = false;
            alert('请选择保养类型！');
            return false;
          }
          if ($scope.RepairParameters.EstArrivalTime == "") {
            $scope.isSubmit = false;
            alert('请选择保养预计到场时间！');
            return false;
          } else {
            $scope.RepairParameters.EstArrivalTime = FormatDateTime($scope.RepairParameters.EstArrivalTime);
            var EstArrivalDate = $('input[name="EstArrivalDate"]').val();
            var myDate = new Date($scope.RepairParameters.EstArrivalTime);
            var _hh = myDate.getHours();
            var _mm = myDate.getMinutes();
            var _ss = myDate.getSeconds();
            $scope.RepairParameters.EstArrivalTime = '' + EstArrivalDate + ' ' + _hh + ':' + _mm + ':' + _ss;
          }
        }
        if ($scope.isOpenSetting) {
          $scope.RepairParameters.Description = $scope.RepairParameters.Description + "\n\r" + $scope.SettingStr;
        }
        var myDate = new Date();
        var _YY = myDate.getFullYear();
        var _MM = myDate.getMonth() + 1;
        var _DD = myDate.getDate();
        var _hh = myDate.getHours();
        var _mm = myDate.getMinutes();
        var _ss = myDate.getSeconds();
        $scope.RepairParameters.RequestTime = '' + _YY + '/' + _MM + '/' + _DD + ' ' + _hh + ':' + _mm + ':' + _ss;
        var submitURI = "s/rez";
        if ($scope.IsInspection) {
          submitURI = "s/inspect";
        }
        $http({
          url: ApiMapper.sApi + '/' + submitURI,
          method: 'POST',
          contentType: 'application/json',
          headers: {
            'Passport': $cookies.Passport
          },
          data: $scope.RepairParameters
        }).success(function (data) {
          if (data.Receipt.StatusCode != 1) {
            $scope.isSubmit = false;
            $scope.SubmitCount = 0;
            alert('报修失败！\n\r请联系580-440报修中心！');
            return false;
          } else {
            if ($scope.imagesList.allIds.length > 0 || $scope.Record.localId != "") {
              $scope.CaseNo = data.CaseNo;
              $scope.LoadMedias(data.RequisitionId);
            } else {
              window._p=$cookies.Passport;
              window._k=data.RequisitionId
              pond1.processFiles().then(files => {
                  pond2.processFiles().then(files => {
                    $scope.isSubmit = false;
                    alert('成功報修！\n\r單號：' + data.CaseNo);
                    window.location.reload();
                  });
              });
              $scope.CloseBrowser();
            }
          }
        }).error(function (error, status) {
          $scope.SubmitCount = 0;
          $scope.isSubmit = false;
          alert(error.Messages);
        });
      }
    }
  };
  $scope.toggleRight = function (navID) {
    $mdSidenav(navID).toggle();
  };
  $scope.closeDenav = function (navID) {
    $mdSidenav(navID).close();
  };
  //部门选择關閉滑出頁面
  $scope.store_close = function (e) {
    $mdSidenav('Store').close().then(function () {
      if (e != "") {
        //將門店資料帶回
        $scope.Unit = e.Unit;
        $scope.RepairParameters.Unit = e.Unit;
        $scope.RepairParameters.UnitId = e.UnitId;
        $scope.RepairParameters.EquipmentCode = '';
        $scope.EquipmentName = '';
        $scope.RepairParameters.ICauseIds = [];
        $scope.CauseList = [];
        $scope.itemsCauseStr = [];
        $scope.ICauses = '';
        $scope.setSelect4Cause();
        $scope.GetEquipment($scope.RepairParameters.UnitId);
      }
    });
  };
  //设施设备modal关闭事件
  $scope.EQ_close = function (e) {
    $mdSidenav('Area').close().then(function () {
      $scope.RepairParameters.ICauseIds = [];
      //$scope.CauseList = [];          
      $scope.setSelect4Cause();
    });
  };
  //设定报修原因并关闭页面
  $scope.SetCauseIds = function (item) {
    var idx = $scope.RepairParameters.ICauseIds.indexOf(item.CauseId);
    if (idx > -1) {
      $scope.RepairParameters.ICauseIds.splice(idx, 1);
      $scope.itemsCauseStr.splice(idx, 1);
    } else {
      $scope.RepairParameters.ICauseIds.push(item.CauseId);
      $scope.itemsCauseStr.push(item.Cause);
    }
    $scope.ICauses = $scope.itemsCauseStr.toString();
    //alert($scope.ICauses);
  };
  $scope.SettingStr = "";
  $scope.setSetting = function () {
    var isNan4Long = false;
    var isNan4Width = false;
    var isNan4Height = false;
    var isNan4Count = false;
    $scope.isVerification = true;
    var emptyCount = 0;
    var nIdex = 0;
    $scope.SettingStr = $scope.EquipmentName + "\n\r";
    _($scope.SettingInfo).each(function (item, idx) {
      nIdex = 0;
      if (item.nLong == null || item.nLong == "") {
        emptyCount += 1;
      } else if (isNaN(item.nLong)) {
        isNan4Long = true;
      }
      if (item.nWidth == null || item.nWidth == "") {
        emptyCount += 1;
      } else if (isNaN(item.nWidth)) {
        isNan4Width = true;
      }
      if (item.nHeight == null || item.nHeight == "") {
        emptyCount += 1;
      } else if (isNaN(item.nHeight)) {
        isNan4Height = true;
      }
      if (item.nCount == null || item.nCount == "") {
        emptyCount += 1;
      } else if (isNaN(item.nCount)) {
        isNan4Count = true;
      }
      if (emptyCount > 0 && emptyCount < 4) {
        alert('请输入全部尺寸参数！');
        $scope.isVerification = false;
      } else if (emptyCount == 4) {
        if ($scope.SettingInfo.length == 1) {
          alert('必须要有一种尺寸的亚克力板！');
          $scope.isVerification = false;
        } else {
          $scope.SettingInfo.splice(idx, 1);
        }
      } else {
        $scope.SettingStr = $scope.SettingStr + "\n\r 长(" + item.nLong + ")mmX宽(" + item.nWidth + ")mmX厚(" + item.nHeight + ")mmX" + item.nCount;
      }
    });
    if (isNan4Long) {
      alert('长度必须是数字！');
      return false;
    }
    if (isNan4Width) {
      alert('宽度必须是数字！');
      return false;
    }
    if (isNan4Height) {
      alert('厚度必须是数字！');
      return false;
    }
    if (isNan4Count) {
      alert('数量必须是数字！');
      return false;
    }
    $scope.isShowSetting = true;
    if ($scope.isVerification) {
      $('#equipment_setting').modal('hide');
    }
    // $('#confirmAddSetting').modal('show'); 
  };
  $scope.confirmAddSetting = function (nStatus) {
    if (parseInt(nStatus) == 1) {
      $scope.SettingInfo.push({
        "nCount": null,
        "nHeight": null,
        "nWidth": null,
        "nLong": null
      });
      $('#confirmAddSetting').modal('hide');
    } else {
      $('#confirmAddSetting').modal('hide');
      $scope.setSetting();
    }
    $scope.showConfirm = false;
    $('#equipment_setting').css({
      "z-index": 1050
    });
  };
  $scope.showConfirmModal = function () {
    $scope.showConfirm = true;
    $('#equipment_setting').css({
      "z-index": 99
    });
    $('#confirmAddSetting').modal('show');
  };
  $scope.removeItem4Setting = function (idx) {
    if ($scope.SettingInfo.length > 1) {
      $scope.SettingInfo.splice(idx, 1);
    } else {
      alert('必须要有一种尺寸的亚克力板！');
    }
  };
}]);