'use strict';

WeChat.controller('ConstructionCtrl', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter, $sce) {
    $scope.SearhParams = { 'UnitIds': [], 
                            'MaintainerIds': [], 
                            'EquipmentIds': [], 
                            'FuzzyCaseCode': null, 
                            'RezConditions': [3],
                            'Emergency':[0,1,2],
                            'IsInspection' :2
                        };
    $scope.OrderbyParames = [
                { "name": "DateM", "OrderBy": 1 },
                { "name": "OverTimeInterval", "OrderBy": 0 }
    ];
    $scope.pcompanyList = [];
    $scope.StoreList = [];

    $scope.Select2List = [{ "Id": "", "Text": "" }];
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

    $scope.RepairList = [];
    $scope.RepairInfo = {};
    $scope.RequisitionIds = [];
    $scope.AreasSelected = [];
    $scope.itemsAreaStr = []; 
    $scope.CheckedIds = [];
    $scope.currentPage = 1;
    $scope.isLoading = false;
    $scope.isAllSelected = false;
    $scope.isShowMore = false;
    $scope.isShowList = false;
    $scope.isShowDetail = false;
    $scope.Overtime = false;
    $scope.Search4No = false;
    $scope.RepairCounts = 0;
    $scope.pcompanyName = '';
    $scope.EquipmentName = '';
    $scope.Unit = '请选择单位';
    $scope.Survey = 5;
    $scope.Survey1 = 5;
    //左邊功能選單
    $scope.SearchTitle;
    $scope.SidenavList = [
        { "name": "综合查询", "Event": "Muti" },
        { "name": "单号查询", "Event": "No" }
    ];
    $scope.RequisitionStatus = { 
        "Filing":false,
        "Assignment":true,
        "InStore":false,
        'Acceptance': false, 
        'Revocation': false, 
        'Overtime':false
    };
    $scope.EquipmentList = [];
    $scope.$watchCollection('RequisitionStatus', function () {
        if (!$scope.RequisitionStatus.Filing&&!$scope.RequisitionStatus.Assignment&&!$scope.RequisitionStatus.InStore&&!$scope.RequisitionStatus.Draft && !$scope.RequisitionStatus.OnTheRoad && !$scope.RequisitionStatus.Acceptance && !$scope.RequisitionStatus.Revocation) {
            if ($scope.SearhParams.RezConditions[0] == 2) $scope.RequisitionStatus.Filing = true;
            else if($scope.SearhParams.RezConditions[0]==3)$scope.RequisitionStatus.Assignment = true;
            else if($scope.SearhParams.RezConditions[0]==8)$scope.RequisitionStatus.InStore = true;
            else if($scope.SearhParams.RezConditions[0]==4)$scope.RequisitionStatus.Acceptance = true;
            else if ($scope.SearhParams.RezConditions[0] == 5) $scope.RequisitionStatus.Revocation = true;
            else if ($scope.SearhParams.RezConditions[0] == 6) $scope.RequisitionStatus.Draft = true;
        } else {
            $scope.SearhParams.RezConditions = [];
            $scope.RequisitionStatus.Draft ? $scope.SearhParams.RezConditions.push(6) : '';
            $scope.RequisitionStatus.Filing ? $scope.SearhParams.RezConditions.push(2) : '';
            $scope.RequisitionStatus.Assignment ? $scope.SearhParams.RezConditions.push(3) : '';
            $scope.RequisitionStatus.InStore ? $scope.SearhParams.RezConditions.push(8) : '';
            $scope.RequisitionStatus.Acceptance ? $scope.SearhParams.RezConditions.push(4) : '';
            $scope.RequisitionStatus.Revocation ? $scope.SearhParams.RezConditions.push(5) : '';
            $scope.RequisitionStatus.Overtime ? $scope.SearhParams.RezConditions.push(2) : '';
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
    $scope.Repair_Time = function (Tag) {
        if ($scope.TimesForLock == 200) {
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
            Func_Timeouter_Lock = $timeout(function () { $scope.Repair_Time(Tag); }, 1);
        }
    };
    //报修时限
    $scope.EmergencyName = "全部";
    $scope.EmergencyIds = [0,1,2];
    $scope.InspectionName = "全部";
    $scope.IsInspection = 2;
    //取得門店資料
    $scope.GetStore = function () {
        $http({
            url: ApiMapper.sApi + '/s/unit/maps',
            method: 'GET',
            cache: false,
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport }
        }).success(function (Unitdata) {
            $scope.StoreList = [];
            $scope.Unitdata = Unitdata;
            _($scope.Unitdata[1]).each(function (Item1) {// + '[' + Item1.UnitId + ']'
                $scope.StoreList.push({ 'Id': Item1.UnitId, 'Text': Item1.Unit, 'isSelected': false, 'Level1': '', 'Level2': '', 'UnitLevel': 10 });
                _($scope.Unitdata[2]).each(function (Item2) {
                    if (Item2.Level2 == Item1.UnitId) {//+ '[' + Item2.UnitId + ']'
                        $scope.StoreList.push({ 'Id': Item2.UnitId, 'Text': '　'+Item2.Unit , 'isSelected': false, 'Level1': '', 'Level2': '', 'UnitLevel': 20 });
                        _($scope.Unitdata[3]).each(function (Item3) {
                            if (Item3.Level3 == Item2.UnitId) {//+ '[' + Item3.UnitId + ']'
                                $scope.StoreList.push({ 'Id': Item3.UnitId, 'Text': '　　'+Item3.Unit , 'isSelected': false, 'Level1': Item1.UnitId, 'Level2': Item2.UnitId, 'UnitLevel': 100 });
                            }
                            if (Item3.UnitId == $cookies.UnitId) {
                                $scope.SearhParams.UnitIds.push(Item3.UnitId);
                                $scope.UnitIds.push(Item3.UnitId);
                                $scope.Unit = Item3.Unit;
                                $scope.Select2List = [{ "Id": Item3.UnitId, "Text": Item3.Unit }];
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
    $scope.GetStore();
    //取得维修商資料
    $scope.GetProvider = function () {
        if ($scope.UnitIds.length > 0) {
            $http({
                url: ApiMapper.sApi + '/s/rez/misc/spCategory',
                method: 'POST',
                cache: false,
                contentType: 'application/json',
                headers: { 'Passport': $cookies.Passport },
                data: { 'UnitIds': $scope.UnitIds, 'RequisitionStatus': [1, 2, 4, 5, 6] }
            }).success(function (Unitdata) {
                $scope.pcompanyName = ''; $scope.pcompanyList = [];
                _(Unitdata).each(function (Item) {
                    $scope.pcompanyList.push({ 'Id': Item.MaintainerId, 'Text': Item.MaintainerName, 'isSelected': false });
                    $scope.Select2Data02.push({ 'Id': Item.MaintainerId, 'Text': Item.MaintainerName, 'isSelected': false });
                });
                
            });
        } 
    };
    //获取设备类别和设备
    $scope.GetEquipment4Areas = function () {
        //$scope.SearhParams.positionIds = $scope.AreasSelected;
        $scope.EquipmentList = [];
        $http({
            url: ApiMapper.sApi + '/s/rez/misc/etCategory',
            cache: false,
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            data: JSON.stringify({ 'UnitIds': $scope.UnitIds, 'RequisitionStatus': [1, 2, 4, 5, 6]})
        }).success(function (data) {
            _(data).each(function (Lists) {//+ '[' + Lists.EquipmentCode + ']'
                $scope.EquipmentList.push({ 'Id': Lists.EquipmentId, 'Text': Lists.EquipmentName , 'isSelected': false });
                $scope.Select2Data03.push({ 'Id': Lists.EquipmentId, 'Text': Lists.EquipmentName , 'isSelected': false });                
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
            $scope.Select2List.push({ 'Id': '', 'text': '' });
        }
    };
    //删除报修项目
    $scope.RemoveForSelect2 = function (Index) {
        if (!$scope.isShowButton('Delete', Index)) {
            if ($scope.Select2List.length > 1) {
                $scope.Select2List.splice(Index, 1);
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
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
            $scope.tabName = "单位";
            $scope.tabId = "Store";
            $scope.Select2Data = $scope.StoreList;
            if ($scope.SelectedList01.length > 0) {
                $scope.Select2List = $scope.SelectedList01;
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
            }

        } else if (parseInt(n) == 1) {
            $scope.tabName = "维修商";
            $scope.tabId = "Maintainer";
            $scope.Select2Data = $scope.pcompanyList;
            if ($scope.SelectedList02.length > 0) {
                $scope.Select2List = $scope.SelectedList02;
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
            }
        } else {
            $scope.tabName = "设施 / 设备";
            $scope.tabId = "Equipment";
            $scope.Select2Data = $scope.EquipmentList;
            if ($scope.SelectedList03.length > 0) {
                $scope.Select2List = $scope.SelectedList03;
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
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
                if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text)>=0) {
                    var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
                    ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
                    $scope.Select2Data.push({ 'Id': Item.Id, 'Text': ItemText.replace(Select2Item.Text, nTextStr) });

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
                    $scope.Select2Data.push({ 'Id': Item.Id, 'Text': ItemText.replace(Select2Item.Text, nTextStr) });

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
                    $scope.Select2Data.push({ 'Id': Item.Id, 'Text': ItemText.replace(Select2Item.Text, nTextStr) });

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
    //清除所有选择
    $scope.clearSelect2Values = function () {
        $scope.Select2Data01 = $scope.StoreList;
        $scope.Select2Data02 = $scope.pcompanyList;
        $scope.Select2Data03 = $scope.EquipmentList;

        $scope.StoreSelectedList = [];
        $scope.MaintainerSelectedList = [];
        $scope.EquipmentSelectedList = [];
        _($scope.Select2List).each(function (Item,n) {
            Item.Id = "";
            Item.Text = "";
        }); 
        _($scope.Select2Data01).each(function (Item) { Item.isSelected = false; });
        _($scope.SelectedList01).each(function (Item) { Item.isSelected = false; });
        _($scope.SelectedList02).each(function (Item) { Item.isSelected = false; });
        _($scope.SelectedList03).each(function (Item) { Item.isSelected = false; });

        $scope.Unit = "";
        $scope.closeDenav('Multi');
        //$scope.SearchRepair($scope.currentPage);
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
                if (Areas.Id == Item.Id||Item.Id==Areas.Level1||Item.Id==Areas.Level2) {
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
    //清除所有选择
    $scope.clearSelect2Values4Item = function () {
        //$(".NT_side_footer").removeClass('unfixed');
        _($scope.Select2List).each(function (Item, n) {
            Item.Id = "";
            Item.Text = "";
        });
        _($scope.Select2Data).each(function (Item) { Item.isSelected = false; });
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
                    if (Areas.Id == Item.Id || Item.Id==Areas.Level1 || Item.Id==Areas.Level2) {
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

    //列表查询
    $scope.SearchRepair = function (currentPage) {
        $scope.isShowMore = false;
        if ($scope.SearhParams.Orders == $scope.OrderbyParames) {
            $scope.currentPage = currentPage;
        } else {
            $scope.currentPage = 1;
        }
        if ($scope.currentPage == 1) {
            $scope.isLoading = true;
        }
        if ($scope.Search4No) {
            $scope.SearhParams.UnitIds = [];
            $scope.SearhParams.MaintainerIds = [];
            $scope.SearhParams.EquipmentIds = [];
        } 
        //排序
        $scope.SearhParams.Orders = $scope.OrderbyParames;
        //设备报修时限
        $scope.SearhParams.Emergency = $scope.EmergencyIds; //alert(JSON.stringify($scope.SearhParams));
        $scope.SearhParams.IsInspection = $scope.IsInspection; 
        $http({
            url: ApiMapper.sApi + '/s/journal/search/' + $scope.currentPage,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            data: JSON.stringify($scope.SearhParams)
        }).success(function (data) {
            if ($scope.currentPage == 1) {
                $scope.RepairList = [];
            }
            if (data[1].length > 0) {
                $scope.isShowDetail = true;
                $scope.RepairCounts = parseInt(data[0]);
                $scope.isShowMore = $scope.RepairCounts > 1 ? true : false;
                if ($scope.currentPage == $scope.RepairCounts) {
                    $scope.isShowMore = false;
                }else{                    
                    $scope.isShowMore = true;
                }
                _(data[1]).each(function (Item) { 
                    Item.Selected = false; 
                    Item.swipeState = false; 
                    
                    if(Item.EstStartTime!=null&&Item.EstStartTime!=""){
                        Item.EstStartTime =FormatDate(Item.EstStartTime);
                    }
                    if(Item.EstEndTime!=null&&Item.EstEndTime!=""){
                        Item.EstEndTime = FormatDate(Item.EstEndTime);
                    }
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
    
    //关闭 Sidenav
    $scope.CloseSidenav = function (navID) {
        $mdSidenav(navID).close()
            .then(function () {
                //$log.debug("close RIGHT is done");
            });
    };
    //加载案件详情
    $scope.GetDetail = function (RepairItem, Tag) {
        window.localStorage.setItem("DetailId", RepairItem.JournalId);
        // $scope.$broadcast("RepairList2Detail",RepairItem.JournalId);
        // $mdSidenav('RepairDetail').toggle();
        window.location.href = "Construction_Detail.html?JournalId="+RepairItem.JournalId;
        $scope.RepairInfo = {};
        $scope.CheckedIds = [];
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
                    headers: { 'Passport': $cookies.Passport },
                    cache: false
                }).success(function (data) {
                    $scope.Equipmentpos = _(data).filter(function (Item) { return IPositionIds.indexOf(Item.PositionId) >= 0; });
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
            headers: { 'Passport': $cookies.Passport }
        }).success(function (data) {
            if (data.length > 0) {
                data = data.reverse();
                $scope._TableData = data;                         
				_($scope._TableData).each(function(Item){					
					Item.ResponseTime = $filter('date')(new Date(Item.ResponseTime), 'yyyy/MM/dd HH:mm:ss');
				});
                if ($scope._TableData.length > 0) { $scope.isTimeline = true; }
            } 
        });
    };
    //获取单位信息
    $scope.GetUnitInfo = function () {
        //获取部门信息
        $http({
            url: ApiMapper.sApi + '/s/unit/' + $scope.RepairInfo.UnitId,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            cache: false
        }).success(function (data) {
            $scope.DeptInfo = data;
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
                    $scope.SearhParams = { 'UnitIds': [], 'RequisitionStatus': $scope.SearhParams.RezConditions };
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
                $scope.SearhParams = { 'UnitIds': $scope.SearhParams.UnitIds, 'RequisitionStatus': $scope.SearhParams.RezConditions, 'MaintainerIds': [] };
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
            $scope.SearhParams = { 'UnitIds': $scope.SearhParams.UnitIds, 'EquipmentIds': [], 'RequisitionStatus': $scope.SearhParams.RezConditions };
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
        Item.Selected=!Item.Selected;
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
    $scope.toggleDenav = function (navID) {
        $mdSidenav(navID).toggle();
    };
    function buildToggler(navID) {
        var debounceFn = $mdUtil.debounce(function () {
            $mdSidenav(navID)
                .then(function () {
                });
        }, 300);
        return debounceFn;
    };
    //關閉頁面
    $scope.closeDenav = function (navID) {
        $scope.swipeState=false;
        $mdSidenav(navID)
           .close()
           .then(function () {
            
           });
    };
    $scope.onHammer  = function onHammer (event) {
      $scope.eventType = event.type;
        console.log($scope.toggleDenavFN);
        //長按則將$scope.longPressSta 設為 false;
        if(event.type=='press'){
          $scope.longPressSta = false;
          $scope.toggleDenavFN='';
             console.log($scope.eventType);
        }
      };    
    //控制icon變化
    $scope.change_openicon = function () {
       if($scope.CollapseState == false){
        $scope.CollapseState = true;
       }
        else{
          $scope.CollapseState = false;
        }
    }    
})
;
