'use strict';

WeChat.controller('gotoDelayCtrl', function ($scope, $cookies) {
    $scope.IsShowMoreMaintainerList = false;
    if ($cookies.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' || $cookies.CompanyId == '6c690014-2571-48db-ac5a-c6ba2572a3bb') {
        $scope.IsShowMoreMaintainerList = true;
    };
    //导航至列表页
    $scope.gotoDelayList = function (n) {
        switch (n) {
            case 0:
                $cookies.Delayer = "Store";
                break;
            case 1:
                $cookies.Delayer = "Maintainer";
                break;
            case 2:
                $cookies.Delayer = "MaintainerByAccept";
                break;
            case 3:
                $cookies.Delayer = "MaintainerByCheckIn";
                break;
            case 4:
                $cookies.Delayer = "MaintainerByFinish";
                break;
            default:
                $cookies.Delayer = "Store";
                break;
        };
        location.replace("Delay_list_Maintainer.html");
    };
});

WeChat.controller('DelayCtrl', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $cacheFactory, $filter, $sce) {
    $scope.IsUItoWP = false;
    if ($cookies.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' || $cookies.CompanyId == 'f96f98e2-38f9-456a-9813-82d899536a82') {
        $scope.IsUItoWP = true;
    };
    $scope.ListStyle = {};

    $scope.SearhParams = {
        'RezConditions': [2, 3, 8],
        'Overtime': 1,
        'Emergency': [0, 1, 2],
        'UnitIds': [],
        'MaintainerIds': [],
        'IsInspection': 2
    };
    $scope.OrderbyParames = [{
        "name": "DateM",
        "OrderBy": 1
    }];
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
    $scope.isShowStore = false;
    $scope.isShowNo = false;
    $scope.isShowDelayList = true;
    $scope.isShowEquipment = false;
    $scope.isAllSelected = false;
    $scope.isShowMore = false;
    $scope.longPressSta = true;
    $scope.isShowList = false;
    $scope.isShowDetail = false;
    $scope.pcompanyName = '';
    $scope.EquipmentName = '';
    $scope.Unit = '请选择单位';
    $scope.RepairCounts = 0;
    $scope.Delayer = $cookies.Delayer;
    $scope.DelayList = [];
    $scope.showDelayTab = 'List';
    $scope.SearchDelay = "";
    $scope.DelaySelectInfo = null;
    //报修时限
    $scope.EmergencyId = 9;
    $scope.EmergencyName = "全部";
    $scope.EmergencyIds = [0, 1, 2];
    $scope.InspectionName = "全部";
    $scope.IsInspection = 2;
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
    $scope.DelayParams = [];
    $scope.isMultiple = true;
    $scope.TitleName = "报修单位";
    if ($scope.Delayer == "Maintainer") {
        $scope.TitleName = "维修商";
    } else if ($scope.Delayer == "MaintainerByAccept") {
        $scope.TitleName = "接单逾时排行榜";
    } else if ($scope.Delayer == "MaintainerByCheckIn") {
        $scope.TitleName = "到店逾时排行榜";
    } else if ($scope.Delayer == "MaintainerByFinish") {
        $scope.TitleName = "结案待确认逾时排行榜";
    };

    //左邊功能選單
    $scope.SearchTitle;
    //报修时限
    $scope.EmergencyName = "全部";
    $scope.EmergencyIds = [0, 1, 2];
    $scope.SidenavList = [{
        "name": "综合查询",
        "Event": "Store"
    }, {
        "name": "综合查询",
        "Event": "Equipment"
    }, {
        "name": "报修单查询",
        "Event": "No"
    }];
    $scope.EquipmentList = [];

    $scope.deliberatelyTrustDangerousSnippet = function (snippet) {
        return $sce.trustAsHtml(snippet);
    };
    $scope.SetEmergencyId = function (e) {
        $scope.EmergencyId = e;
        $scope.EmergencyIds = [];
        if (parseInt(e) == 9) {
            $scope.EmergencyName = "全部";
            $scope.EmergencyIds = [0, 1, 2];
        } else if (parseInt(e) == 0) {
            $scope.EmergencyName = "紧急";
            $scope.EmergencyIds = [0];
        } else {
            $scope.EmergencyName = "非紧急";
            $scope.EmergencyIds = [1, 2];
        };

        $timeout.cancel(Func_Timeouter_Lock);
        $timeout(function () {
            $scope.TimesForLock = 0;
            $scope.Repair_Time('S');
        }, 100);
    };
    //取得門店資料
    $scope.GetStore = function () {
        $http({
            url: ApiMapper.sApi + '/s/rez/misc/unitCategory',
            method: 'POST',
            cache: false,
            contentType: 'application/json',
            headers: {
                'Passport': $cookies.Passport
            },
            data: {
                'MaintainerIds': [$scope.DelaySelectInfo.UnitId],
                'RequisitionStatus': [1, 2]
            }
        }).success(function (Unitdata) {
            // alert(JSON.stringify(Unitdata));
            $scope.StoreList = [];
            $scope.Unitdata = Unitdata;
            $scope.Select2Data = [];
            _($scope.Unitdata[1]).each(function (Item1) {
                _($scope.Unitdata[2]).each(function (Item2) {
                    if (Item2.Level2 == Item1.UnitId) {
                        _($scope.Unitdata[3]).each(function (Item3) {
                            if (Item3.Level3 == Item2.UnitId) {
                                $scope.StoreList.push({
                                    'Id': Item3.UnitId,
                                    'Text': Item3.Unit + '[' + Item3.UnitId + ']',
                                    'isSelected': false,
                                    'Level1': Item1.UnitId,
                                    'Level2': Item2.UnitId,
                                    'UnitLevel': 100
                                });
                            }
                        });
                    }
                });
                $scope.StoreList.push(Item1);
                $scope.Select2Data01.push(Item1);
                $scope.Select2Data.push(Item1);
            });
        }).error(function () {
            alert("ERROR");
        });
    };
    //$scope.GetStore();
    //取得维修商資料
    $scope.GetProvider = function () {
        //alert(JSON.stringify($scope.DelaySelectInfo));
        $http({
            url: ApiMapper.sApi + '/s/rez/misc/spCategory',
            method: 'POST',
            cache: false,
            contentType: 'application/json',
            headers: {
                'Passport': $cookies.Passport
            },
            data: {
                'UnitIds': [$scope.DelaySelectInfo.UnitId],
                'RequisitionStatus': [1, 2]
            }
        }).success(function (Unitdata) {
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
            $timeout(function () {
                $scope.Select2Data = [];
                $scope.Select2Data.push(ParentItem);
                // $scope.pcompanyList = Unitdata;
            }, 200);
        });
    };

    $scope.LoadDelayList = function (e, Item) {
        $scope.showDelayTab = e;
        $scope.DelaySelectInfo = Item;
        if ($scope.Delayer == "Maintainer" || $scope.Delayer == "MaintainerByAccept" || $scope.Delayer == "MaintainerByCheckIn" || $scope.Delayer == "MaintainerByFinish") {
            $scope.SearhParams.UnitIds = [];
            $scope.SearhParams.MaintainerIds = [Item.MaintainerId];
            $scope.GetStore();
        } else {
            $scope.SearhParams.UnitIds = [Item.UnitId];
            $scope.SearhParams.MaintainerIds = [];
            $scope.GetProvider();
        }
        $scope.SearchRepair(1);
    };

    $scope.changeDelayTab = function (e) {
        if ($scope.Delayer == "Store" && $scope.DelayList.length == 1) {
            location.replace("Delay_list.html");
        } else {
            $scope.showDelayTab = e;
        }
    };
    var Func_Timeouter_Lock;
    $scope.Repair_Time = function (Tag) {
        if ($scope.TimesForLock == 100) {
            $timeout.cancel(Func_Timeouter_Lock);
            $scope.TimesForLock = 0;
            $scope.SearchRepair(1);
            $scope.GetProvider();
        } else {
            $scope.TimesForLock = $scope.TimesForLock + 1;
            Func_Timeouter_Lock = $timeout(function () {
                $scope.Repair_Time(Tag);
            }, 1);
        }
    };

    //禁用按钮
    $scope.isShowButton = function (Tag, n) {
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
    $scope.AddToSelect2 = function () {
        if (!$scope.isShowButton('ADD', Index)) {
            $timeout(function () {
                $scope.Select2List.push({
                    'Id': '',
                    'text': ''
                });
            }, 200);
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

    //列表查询
    $scope.SearchRepair = function (currentPage) {
        //alert(JSON.stringify($scope.SearhParams));
        $scope.currentPage = currentPage;
        if (currentPage == 1) {
            $scope.isLoading = true;
        }
        //设备报修时限
        $scope.SearhParams.Emergency = $scope.EmergencyIds;
        $scope.SearhParams.IsInspection = $scope.IsInspection;
        $scope.EmergencyId = $scope.EmergencyIds[0];

        if ($scope.EmergencyIds[0] == 2)
            $scope.EmergencyId = 1;
        else if ($scope.EmergencyIds.length == 3)
            $scope.EmergencyId = 9;
        //排序
        $scope.SearhParams.Orders = $scope.OrderbyParames;

        var MyUrl = ApiMapper.sApi + '/s/rez/f/' + currentPage;
        var SearchParam = $scope.SearhParams;
        $scope.ListStyle = {};

        if ($scope.Delayer == "MaintainerByAccept" || $scope.Delayer == "MaintainerByCheckIn" || $scope.Delayer == "MaintainerByFinish") {
            $scope.ListStyle = {'top':'100px'};
            var Param = {
                "Type": 1,
                "AcceptOrdersHours": 2,
                "ToBeConfirmHours": 24,
                "MaintainerId":$scope.SearhParams.MaintainerIds[0]
            };
            switch ($scope.Delayer) {
                case 'MaintainerByAccept':
                    Param.Type = 1;
                    break;
                case 'MaintainerByCheckIn':
                    Param.Type = 2;
                    break;
                case 'MaintainerByFinish':
                    Param.Type = 3;
                    break;
                default:
                    break;
            };
            MyUrl = ApiMapper.sApi + '/s/rez/misc/ot/ongoing/' + currentPage;
            SearchParam = Param;
        };


        $http({
            url: MyUrl,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Passport': $cookies.Passport
            },
            data: JSON.stringify(SearchParam)
        }).success(function (data) {
            //alert(JSON.stringify(data));
            if (currentPage == 1) {
                $scope.RepairList = [];
            }
            if (data[1].length > 0) {
                $scope.isShowDetail = true;
                $scope.RepairCounts = parseInt(data[0]);
                $scope.isShowMore = $scope.RepairCounts > 1 ? true : false;
                if ($scope.currentPage == $scope.RepairCounts) {
                    $scope.isShowMore = false;
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
        }).error(function () {
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
    //回调函数
    $scope.ForCallback = function () {
        $timeout(function () {
            $scope.SearchRepair($scope.currentPage);
        }, 300);
    };
    //加载案件详情
    $scope.GetDetail = function (RepairItem, Tag) {
        $scope.$broadcast("RepairList2Detail", RepairItem.RequisitionId);
        $mdSidenav('RepairDetail').toggle();
        //  location.href = "Case_Detail.html?requisitionId=" + RepairItem.RequisitionId;
    };

    //逾时列表查询
    $scope.SearchDelayList = function () {
        $scope.UrlStr = ApiMapper.sApi + '/s/rez/misc/ot/store';
        if ($scope.Delayer == "Maintainer") {
            $scope.UrlStr = ApiMapper.sApi + '/s/rez/misc/ot/provider';
        } else if ($scope.Delayer == "MaintainerByAccept" || $scope.Delayer == "MaintainerByCheckIn" || $scope.Delayer == "MaintainerByFinish") {
            $scope.UrlStr = ApiMapper.sApi + '/s/rez/misc/ot/ongoing';
            var Param = {
                "Type": 1,
                "AcceptOrdersHours": 2,
                "ToBeConfirmHours": 24
            };
            switch ($scope.Delayer) {
                case 'MaintainerByAccept':
                    Param.Type = 1;
                    break;
                case 'MaintainerByCheckIn':
                    Param.Type = 2;
                    break;
                case 'MaintainerByFinish':
                    Param.Type = 3;
                    break;
                default:
                    break;
            };
            $scope.DelayParams = Param;
        };

        $http({
            url: $scope.UrlStr,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Passport': $cookies.Passport
            },
            data: $scope.DelayParams
        }).success(function (data) {
            if ($scope.Delayer == "Store" && data.length == 1 && $scope.showDelayTab != "Detail") {
                $scope.LoadDelayList("Detail", data[0]);
            }
            if ($scope.currentPage == 1) {
                $scope.DelayList = [];
            }
            if (data.length > 0) {
                $scope.isShowDetail = true;
                $scope.RepairCounts = parseInt(data.length);
                $scope.isShowMore = $scope.RepairCounts > 1 ? true : false;
                if ($scope.currentPage == $scope.RepairCounts) {
                    $scope.isShowMore = false;
                }
                _(data).each(function (Item) {
                    if ($scope.Delayer == "Maintainer" || $scope.Delayer == "MaintainerByAccept" || $scope.Delayer == "MaintainerByCheckIn" || $scope.Delayer == "MaintainerByFinish") {
                        Item.UnitId = Item.MaintainerId;
                        Item.Unit = Item.MaintainerName;
                    }
                    if ($scope.DelaySelectInfo != null && $scope.DelaySelectInfo != "null") {
                        if ($scope.DelaySelectInfo.UnitId == Item.UnitId) {
                            $scope.DelaySelectInfo = Item;
                        }
                    }
                });
                Array.prototype.push.apply($scope.DelayList, data);
            } else {
                $scope.isShowDetail = false;
                $scope.isShowMore = false;
            }
            $scope.isLoading = false;
        }).error(function (data) {
            alert("ERROR");
        });
    };
    $scope.SearchDelayList();
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
        $mdSidenav(navID).close();
    };

    //加载进阶选择页签于资料
    $scope.LoadMnti = function () {
        if ($scope.Delayer == "Store") {
            if ($scope.StoreSelectedList.length > 0) {
                $scope.Select2List = $scope.StoreSelectedList;
            } else {
                $scope.Select2List = [{
                    "Id": "",
                    "Text": ""
                }];
            }
        } else {
            if ($scope.MaintainerSelectedList.length > 0) {
                $scope.Select2List = $scope.MaintainerSelectedList;
            } else {
                $scope.Select2List = [{
                    "Id": "",
                    "Text": ""
                }];
            }
        }

        $timeout(function () {
            _($scope.Select2List).each(function (Item, n) {
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
        $scope.toggleDenav('Multi');
    };
    //设定Select2选中值
    $scope.SetSelect2Values = function (Item, n) {
        Item.isSelected = !Item.isSelected;
        Item.isSelected = !Item.isSelected;
        var ItemText = $scope.Select2Data[n].Text;
        ItemText = ItemText.replace("　", "");
        ItemText = ItemText.replace("　", "");
        ItemText = ItemText.replace("<span style='color:red;'>", "");
        ItemText = ItemText.replace("</span>", "");
        Item.Text = ItemText;
        Item.Id = $scope.Select2Data[n].Id;
        //_($scope.Select2Data).each(function (ListItem) {
        //    $scope.Unit = ListItem.Text;
        //    if (ListItem.Id == Item.Id) {
        //        $scope.Select2List[n].Text = ListItem.Text;
        //    }
        //});

        $scope.DelayParams = [];
        $timeout(function () {
            if ($scope.Delayer == 'Store') {
                $scope.StoreList = $scope.Select2Data;
                $scope.StoreSelectedList = _.uniq($scope.Select2List);
                $scope.SearhParams.UnitIds = [$scope.DelaySelectInfo.UnitId];
                $scope.SearhParams.MaintainerIds = [];
                //alert(JSON.stringify($scope.StoreSelectedList));
                _($scope.StoreSelectedList).each(function (Item) {
                    $scope.SearhParams.MaintainerIds.push(Item.Id);
                    $scope.DelayParams.push(Item.Id);
                });
            } else {
                $scope.pcompanyList = $scope.Select2Data;
                $scope.MaintainerSelectedList = $scope.Select2List;
                $scope.SearhParams.UnitIds = [];
                _($scope.MaintainerSelectedList).each(function (Item) {
                    $scope.SearhParams.UnitIds.push(Item.Id);
                    $scope.DelayParams.push(Item.Id);
                });
            };

            $scope.SearchDelayList();
            $scope.SearchRepair($scope.currentPage);
            $scope.closeDenav('Multi');
        }, 300);
    };
    //清除所有选择
    $scope.clearSelect2Values = function () {
        $scope.DelayParams = [];
        _($scope.Select2List).each(function (Item, n) {
            Item.Id = "";
            Item.Text = "";

            var $example = $("[name=single]:eq(" + n + ")").select2({
                placeholder: "请输入关键字!"
            });
            $example.val('').trigger("change");
        });
        _($scope.Select2Data).each(function (Item) {
            Item.isSelected = false;
        });
        if ($scope.Delayer == "Store") {
            $scope.StoreSelectedList = [];
            $scope.MaintainerSelectedList = [];
            $scope.EquipmentSelectedList = [];
            //$scope.SearhParams.UnitIds = [];
            $scope.SearhParams.MaintainerIds = [];
            $scope.SearhParams.EquipmentIds = [];
            $scope.StoreList = $scope.Select2Data;
        } else if ($scope.Delayer == "Maintainer") {
            $scope.MaintainerSelectedList = [];
            $scope.EquipmentSelectedList = [];
            $scope.SearhParams.UnitIds = [];
            $scope.SearhParams.EquipmentIds = [];
            $scope.pcompanyList = $scope.Select2Data;
        }

        $("[name=single]").select2({
            placeholder: "请输入关键字!",
            val: ''
        });
        $scope.Unit = "";
        $scope.SearchDelayList();
        $scope.SearchRepair($scope.currentPage);
        $scope.closeDenav('Multi');
    };
    //获取下层资料
    $scope.loadSelect2Data = function () {
        $scope.toggleDenav('Multi');
        $scope.SearchRepair($scope.currentPage);
        //$mdSidenav('Multi').close();
    };
});