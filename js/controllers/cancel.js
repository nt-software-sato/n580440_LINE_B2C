WeChat.controller('CancelListCtrl', ['$scope', '$http', '$timeout', '$mdSidenav', '$mdUtil', '$cookies', '$window', '$filter', '$sce', function($scope, $http, $timeout, $mdSidenav, $mdUtil, $cookies, $window, $filter, $sce) {
  $scope.StoreUser = $cookies.StoreUser;
  $scope.OrderbyParames = [{
    "name": "DateM",
    "OrderBy": 1
  }];
  $scope.SearhParams = {
    'RezConditions': [2, 3, 6],
    'UnitIds': [],
    'MaintainerIds': [],
    'EquipmentIds': [],
    'FuzzyCaseCode': null,
    'Emergency': [0, 1, 2],
    'IsInspection': 2,
    'Orders': $scope.OrderbyParames
  };

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
  $scope.tabName = "单位";
  $scope.tabId = "Store";

  $scope.currentPage = 1;
  $scope.selected = [];
  $scope.StoreList = [];
  $scope.pcompanyList = [];
  $scope.EquipmentList4All = [];
  $scope.AreasSelected = [];
  $scope.RepairInfo = {};
  $scope.itemsAreaStr = [];
  $scope.AreaStr = "";
  $scope.Unit = '请选择单位';
  $scope.isShowEquipment = false;
  $scope.isShowMaintainer = false;
  $scope.isShowMore = false;
  $scope.isShowList = false;
  $scope.isCancel = false;
  $scope.isShowDetail = false;
  $scope.pcompanyName = '';
  $scope.EquipmentName = '';
  $scope.RepairCounts = 0;
  $scope.IsUItoWP = false; // 是否王品
  $scope.WPUIpage = 'selectPage';

  //左邊功能選單
  $scope.SidenavList = [{
    "name": "综合查询",
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
  $scope.TotalItem = {
    'Id': '',
    'Name': '总金额',
    'Count': 1,
    'UnitPrice': ''
  };
  $scope.IsNumberDisabled = false;

  $scope.IsUseHistoryQuote = false;
  if (['eb296708-6fc6-43f0-b506-0ca0fa91e1cd', '6c690014-2571-48db-ac5a-c6ba2572a3bb', 'f96f98e2-38f9-456a-9813-82d899536a82', '308ffed8-d4a7-4ad5-8b61-6cce3c66cd06'].indexOf($cookies.CompanyId) > -1) {
    $scope.IsUseHistoryQuote = true;
  };


  $scope.FormatLogoURI = FormatLogoURI;
  $scope.deliberatelyTrustDangerousSnippet = function(snippet) {
    return $sce.trustAsHtml(snippet);
  };
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
        'Passport': $cookies.Passport
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
      $scope.SearchRepair(1);
    });
  };
  $scope.GetStore();
  //取得维修商資料
  $scope.GetProvider = function() {
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
  if (parseInt($scope.StoreUser) === 0) {
    $scope.GetStore();
  } else {
    $scope.UnitIds = [$cookies.UnitId];
    $scope.GetProvider();
  }
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
        'Passport': $cookies.Passport
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
      'RezConditions': [2, 3, 6],
      'UnitIds': [],
      'MaintainerIds': [],
      'EquipmentIds': [],
      'FuzzyCaseCode': null,
      'Emergency': [0, 1, 2],
      'IsInspection': 2,
      'Orders': $scope.OrderbyParames
    };
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
      window.location.href = "search_no.html";
    } else {
      window.location.href = "search_muti.html";
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
    $http({
      url: ApiMapper.sApi + '/s/rez/f/' + $scope.currentPage,
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
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
        });
        Array.prototype.push.apply($scope.RepairList, data[1]);
      } else {
        $scope.isShowDetail = false;
        $scope.isShowMore = false;
      }
      $scope.isLoading = false;
    }).error(function() {
      $scope.isLoading = false;
    });
  };
  //加载更多
  $scope.LoadMore = function() {
    $scope.currentPage = $scope.currentPage + 1;
    $scope.SearchRepair($scope.currentPage);
    if ($scope.currentPage == $scope.RepairCounts) {
      $scope.isShowMore = false;
    }
  };
  //部门查询
  $scope.Search4Store = function(Store) {
    $mdSidenav('Store').close()
      .then(function() {
        if (Store != "") {
          //將門店資料帶回
          $scope.SearhParams.UnitIds = [];
          $scope.Unit = Store.Unit;
          $scope.SearhParams.UnitIds.push(Store.UnitId);
          $scope.SearchRepair(1);
        }
      });
  };
  //依设备编号查询
  $scope.ECodeSearch = function(Equipment) {
    $mdSidenav('Area').close()
      .then(function() {
        $scope.SearhParams = {
          'RezConditions': [2, 3, 6],
          'UnitIds': $scope.SearhParams.UnitIds,
          'EquipmentIds': []
        };
        $scope.EquipmentName = Equipment.EquipmentName;
        $scope.SearhParams.EquipmentIds.push(Equipment.EquipmentId);
        $scope.SearchRepair(1);
      });
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
      $scope.SearchRepair($scope.currentPage);
    }, 300);
  };
  //获取报修原因
  $scope.GetCause = function() {
    var CauseList = [];
    if ($scope.RepairInfo.ICauseIds != null) {
      if ($scope.RepairInfo.ICauseIds.length > 0) {
        // if ($scope.RepairParameters.MaintainerId == null || $scope.RepairParameters.MaintainerId == "") {
        //   $scope.RepairParameters.MaintainerId = 'None';
        // }
        $http({
          url: ApiMapper.sApi + '/s/equipmentcause/' + $scope.RepairInfo.EquipmentId + '/' + $scope.RepairInfo.MaintainerId,
          method: 'GET',
          contentType: 'application/json',
          headers: {
            'Passport': $cookies.Passport
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

  //获取保养设备原因
  $scope.getCause4Inspection = function() {
    $http({
      url: ApiMapper.sApi + '/s/equipmentcause/inspect/' + $scope.RepairInfo.EquipmentId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function(List, status) {
      var Description = $scope.RepairInfo.ICauseIds;
      _(List.children).each(function(Item01) {
        if (Description.indexOf(Item01.CauseId) >= 0) {
          CauseList.push(Item01.Cause);
        }
      });
      if ($scope.RepairInfo.Description != '') {
        CauseList.push($scope.RepairInfo.Description);
      }
      $scope.CauseList = CauseList.toString();
    }).error(function(List, status) {});
  }
  //格式化案件详情内容
  $scope.FormatDetailInfo = function(RepairDetails) {
    $scope.RepairInfo = RepairDetails.Requisition; //报修单详细信息     
    var TitleName = "85°C单位报修案件详情";
    if ($scope.CompanyId != "308ffed8-d4a7-4ad5-8b61-6cce3c66cd06") {
      TitleName = "王品报修案件详情";
    }
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
    // 向胜取消报修直接取消案件
    // if (RepairDetails.MaintainerInfo.MaintainerId === "b99d868e-3793-4cff-9817-b57401d12d63") {
    //   $scope.RevocationParameters.History.StageId = -100;
    // }
    if ([
      "09fd490e-1525-4051-b176-51231c6c82cf", 
      "11ee42ab-0baf-4232-bdd6-aa1bdee03411", 
      "34d01bb8-31db-484d-99e7-ffb95b6baee8", 
      "426e4e7b-897c-4cb9-8f5a-ec04b633a946", 
      "5735d8d1-354d-418c-ad3c-a3b7ba53f119", 
      "6f0726f7-311d-47ec-aee5-9e2eefb9b4e7", 
      "a6ed9119-4575-4667-85ee-dd68b1e0d176", 
      "c64c64de-6d09-40e1-bcb7-c0e704f71bb0", 
      "d3c11809-3b81-48d0-886a-5bbfe9fb9f48", 
      "e2c4b7f3-4f6a-431c-95dc-dad3d93269e6"]
      .indexOf($scope.CompanyId) > -1) {
      $scope.RevocationParameters.History.StageId = -100;
    }
    $scope.RevocationParameters.History.RequisitionId = $scope.RepairInfo.RequisitionId;
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

    //报修单进度列表
    if (RepairDetails.Histories.length > 0) {
      $scope._TableData = _(RepairDetails.Histories).map(function(Item) {
        Item.ResponseTime = $filter('date')(new Date(Item.ResponseTime), 'yyyy/MM/dd HH:mm:ss');
        _(Item.Thumbnail).each(function(ThumbItem, i) {
          ThumbItem.FilePath = ThumbItem.FilePath.replace('~', '');
          ThumbItem.FilePath = ApiMapper.ccApi + '/' + ThumbItem.FilePath;
          ThumbItem.Src = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;

          ThumbItem.thumb = ThumbItem.FilePath;
          ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
        });
        return Item;
      });
      $scope._TableData = RepairDetails.Histories;
      $scope.isTimeline = true;
    }
  };

  $scope.$watchCollection('TotalItem', function() {
    var PriceRegular = /^(?!0)\d*$/;
    if ($scope.RevocationParameters.History.IsNeedEvaluated == 1) {
      $scope.IsNumberDisabled = false;
      if ($scope.TotalItem.UnitPrice.length == 0) {
        $scope.IsNumberDisabled = true;
      } else if (isFinite($scope.TotalItem.UnitPrice) == false) {
        $scope.IsNumberDisabled = true;
      } else if ($scope.TotalItem.UnitPrice.length > 1 && PriceRegular.test($scope.TotalItem.UnitPrice) == false) {
        $scope.IsNumberDisabled = true;
      } else {
        $scope.IsNumberDisabled = false;
      }
    };
  });

  $scope.$watchCollection('RevocationParameters.History.IsNeedEvaluated', function() {
    if ($scope.RevocationParameters.History.IsNeedEvaluated == 1) {
      $scope.IsNumberDisabled = true;
      $scope.TotalItem.UnitPrice = '';
    } else {
      $scope.IsNumberDisabled = false;
      $scope.TotalItem.UnitPrice = '';
    };
  });

  //加载案件详情
  $scope.GetDetail = function(RepairItem) {
    $scope.toggleDenav('RepairDetail');
    $scope.RepairInfo = {};
    $scope.RevocationParameters = {};
    $scope.RevocationParameters.History = {
      'RequisitionId': '',
      'Source': 4,
      'Remark': '',
      'StageId': -100,
      'IsEmail': 0,
      'IsContact': 0,
      'RevocationName': $cookies.UserName,
      'CallInOrOut': 6,
      'IsNeedEvaluated': -1,
      'IEvaluated': []
    };

    $scope.TotalItem = {
      'Id': '',
      'Name': '总金额',
      'Count': 1,
      'UnitPrice': ''
    };
    $scope.IsNumberDisabled = false;

    // 待料已分配提示
    function checkBeAllocated() {
      $http({
        url: ApiMapper.sApi + '/s/rez/checkBeAllocated/' + RepairItem.RequisitionId,
        method: 'Get',
        contentType: 'application/json',
        headers: {
          'Passport': $cookies.Passport
        }
      }).success(function(data) {
        if (data) {
          alert('提示：相关待料历程，厂商已进行分配。');
        };
      }).error(function(error) {
        alert(error.Messages);
      });
    };

    $http({
      url: ApiMapper.sApi + '/s/rez/' + RepairItem.RequisitionId + '/0',
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      }
    }).success(function(data) {
      // 2018/6/25 向胜待料提示
      checkBeAllocated();
      $scope.FormatDetailInfo(data);
      //获取报修原因与备注
      $scope.GetCause();
      $scope.GetEquipmentpos();

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
            'Passport': $cookies.Passport
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
  //选择单位并关闭页面
  $scope.SetStore = function(Store) {
    $mdSidenav('Store').close();
    $scope.SearhParams.UnitIds = [];
    $scope.SearhParams.UnitIds.push(Store.UnitId);
    $scope.Unit = Store.Unit;
    if ($scope.isShowStore) {
      $scope.Search4Store(Store);
    } else if ($scope.isShowEquipment) {
      $scope.GetAreas();
    } else {
      $scope.GetProvider();
    }
  };
  //維修商查询
  $scope.SetMaintainer = function(e) {
    $mdSidenav('Maintainer').close()
      .then(function() {
        $scope.SearhParams = {
          'RequisitionStatus': [1, 6],
          'UnitIds': $scope.SearhParams.UnitIds,
          'MaintainerIds': []
        };
        $scope.pcompanyName = e.NickName;
        $scope.SearhParams.MaintainerIds.push(e.MaintainerId);
        $scope.SearchRepair(1);
      });
  };
  //加载查询条件
  $scope.loadSearchParams = function(e) {
    if (e == "No") {
      window.location.href = "search_no.html";
    } else {
      window.location.href = "search_muti.html";
    }
  };
  //选择区域
  $scope.SetAreas = function(item) {
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
  $scope.Timeouter4Areas = function() {
    $timeout.cancel(Func_Timeouter_Lock);
    $scope.TimesForLock = 0;
    $scope.Repair_Time('A');
  };

  $scope.toggleDenav = function(navID) {
    if ((navID == 'right-Area' || navID == 'Maintainer') && $scope.SearhParams.UnitIds.length == 0) {
      alert('请先选择单位！');
      return false;
    }
    $mdSidenav(navID).toggle();
  };
  //切換頁面   
  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function() {
      $mdSidenav(navID)
        .toggle()
        .then(function() {});
    }, 300);
    return debounceFn;
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
  $scope.exists = function(item, list) {
    return list.indexOf(item) > -1;
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
  //撤销案件
  $scope.Revocation = function() {
    $scope.isCancel = true;
    if ($scope.RevocationParameters.History.IsNeedEvaluated == 1) {
      $scope.RevocationParameters.History.IEvaluated = [];
      $scope.RevocationParameters.History.IEvaluated.push($scope.TotalItem);
    };
    $scope.RevocationParameters.History.ResponseTime = $scope.GetNow();
    $http({
      url: ApiMapper.sApi + '/s/rez/Revocation/' + $scope.RepairInfo.RequisitionId,
      method: 'PATCH',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: $scope.RevocationParameters
    }).success(function(data) {
      $scope.isCancel = false;
      alert("您已取消：" + $scope.RepairInfo.CaseNo + "的报修！");
      $scope.closeDenav('RepairDetail');
      $scope.SearchRepair(1);
    });
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
      // 取消報修: 3
      url: ApiMapper.sApi + '/s/rez/all/count/3',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
      data: {
        'UnitRegionIds': [],
        'IsInspection': 2
      }
    }).success(function(data) {
      $scope.CaseCountList = data;
      console.log($scope.CaseCountList);
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
  if ($cookies.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' || $cookies.CompanyId == '6c690014-2571-48db-ac5a-c6ba2572a3bb') {
    $scope.IsUItoWP = true;
    $scope.GetCaseCount(); // 載入案件數量
  }
}]);