
WeChat.controller('CancelListCtrl', function ($scope, $http, $timeout, $mdSidenav, $mdUtil, $cookies, $window) {
    $scope.SearhParams = { 'RequisitionStatus': [1], 'Orders': [{ 'name': 'DateM', 'OrderBy': 1 }], 'UnitIds': [$cookies.UnitId] };
    $scope.currentPage = 1;
    $scope.selected = [];
    $scope.equipment_list = [];
    $scope.RepairInfo = {};
    $scope.Unit = $cookies.Unit;

    //左邊功能選單
    $scope.SidenavList = [
        { name: '門店查询', url: "cancel.html" },
        { name: '设备查询', url: "cancel_equipment.html" },
        { name: '维修商查询', url: "cancel_maintainer.html" },
        { name: '报修单查询', url: "cancel_sno.html" }
    ];
    var Func_Timeouter_Lock;
    $scope.Repair_Time = function () {
        if ($scope.TimesForLock == 500) {
            $timeout.cancel(Func_Timeouter_Lock);
            $scope.TimesForLock = 0;
            $scope.FuzzySearch();
        } else {
            $scope.TimesForLock = $scope.TimesForLock + 1;
            Func_Timeouter_Lock = $timeout(function () { $scope.Repair_Time(); }, 1);
        }
    };
    //列表查询
    $scope.SearchRepair = function () {
        $http({
            url: ApiMapper.sApi + '/s/rez/f/' + $scope.currentPage,
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            data: JSON.stringify($scope.SearhParams)
        }).success(function (data) {
            if (data[1].length > 0) {
                $scope.RepairList = data[1];
                _($scope.RepairList).each(function (Item) { Item.Selected = false; });
            }
        }).error(function () {
        });
    };
    $scope.SearchRepair();
    //依报修单号查询
    $scope.FuzzySearch = function () {
        $http({
            url: ApiMapper.sApi + '/s/rez/fuzzy/d/' + $scope.currentPage,
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            data: JSON.stringify($scope.FuzzyParames.RequisitionId)//JSON.stringify($scope.FuzzyParames)
        }).success(function (data) {
            if (data[1].length > 0) {
                $scope.RepairList = data[1];
                _($scope.RepairList).each(function (Item) { Item.Selected = false; });
            }
        }).error(function () { });
    };
    //设定查询参数
    $scope.SetParams = function () {
        $timeout.cancel(Func_Timeouter_Lock);
        $scope.AcceptanceParameters = {};
        $timeout(function () {
            $scope.TimesForLock = 0;
            $scope.Repair_Time();
        }, 100);
    };
    //获取报修原因
    $scope.GetCause = function () {
        var CauseList = [];
        if ($scope.RepairInfo.ICauseIds != null) {
            if ($scope.RepairInfo.ICauseIds.length > 0) {
                if($scope.RepairParameters.MaintainerId==null||$scope.RepairParameters.MaintainerId==""){$scope.RepairParameters.MaintainerId='None';}
                $http({
                    url: ApiMapper.sApi + '/s/equipmentcause/' + $scope.RepairInfo.EquipmentId+'/'+$scope.RepairInfo.MaintainerId,
                    method: 'GET',
                    contentType: 'application/json',
                    headers: { 'Passport': $cookies.Passport },
                    data: JSON.stringify({ 'EquipmentTypeId': $scope.RepairInfo.EquipmentTypeId, 'EquipmentName': $scope.RepairInfo.EquipmentName })
                }).success(function (List, status) {
                    var Description = $scope.RepairInfo.ICauseIds;
                    //_(List).each(function (Item) {
                        _(List.children).each(function (Item01) {
                            if (Description.indexOf(Item01.CauseId) >= 0) {
                                CauseList.push(Item01.Cause);
                            }
                        });
                    //});
                    if ($scope.RepairInfo.Description != '') {
                        CauseList.push($scope.RepairInfo.Description);
                    }
                    $scope.CauseList = CauseList.toString();
                }).error(function (List, status) { });
            }
        } else if ($scope.RepairInfo.Description != '') {
            CauseList.push($scope.RepairInfo.Description);
            $scope.CauseList = CauseList.toString();
        }
    };
    //加载案件详情
    $scope.GetDetail = function (Id) {
        $scope.RepairInfo = {};
        $http({
            url: ApiMapper.sApi + '/s/rez/' + Id,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport }
        }).success(function (data) {
            $scope.RepairInfo = data;
            if ($scope.RepairInfo.StageId != 100 && $scope.RepairInfo.StageId != -100) {
                if ($scope.RepairInfo.DateB != '' && $scope.RepairInfo.DateB != null) {
                    $scope.isAcceptance = true;
                }
            }
            if (parseInt($scope.RepairInfo.IsLocked) == 1) {
                if ($scope.RepairInfo.PreservedUserId != $cookies.UserId) {
                    alert($scope.RepairInfo.PreservedUserName + '正在编辑此案件,编辑完成后才可新增案件记录！');
                    return false;
                } else if ($scope.RepairInfo.PreservedUserId == $cookies.UserId) {
                }
            }
            //获取报修原因与备注
            $scope.GetCause();
            //$scope.AcceptanceParameters.History.RequisitionId = data.RequisitionId;
            //$scope.AcceptanceParameters.Surveies = [
            //    { 'RequisitionId': data.RequisitionId, 'CompanyId': data.CompanyId, 'Score5': 1, 'Score4': 0, 'Score3': 0, 'Score2': 0, 'Score1': 0, 'Status': 1, 'Remark': '' },
            //    { 'RequisitionId': data.RequisitionId, 'CompanyId': data.CompanyId, 'Score5': 1, 'Score4': 0, 'Score3': 0, 'Score2': 0, 'Score1': 0, 'Status': 1 }
            //];
        });
    };
    //介面控制
    $scope.toggleRight = function (navID) {
        $mdSidenav(navID).toggle();
    };
    //切換頁面   
    function buildToggler(navID) {
        var debounceFn = $mdUtil.debounce(function () {
            $mdSidenav(navID)
              .toggle()
              .then(function () {
              });
        }, 300);
        return debounceFn;
    };
    //關閉頁面
    $scope.closeSidenav = function (navID) {
        $mdSidenav(navID)
           .close()
           .then(function () {
           });
    };
    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else {
            list.push(item.Equipments);
            $scope.equipment_list = list;
        };
    };
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };
    //左邊功能清單
    $scope.ListLeft_close = function () {
        $mdSidenav('left-List').close()
          .then(function () {
          });
    };
    //转向其他查询条件页面
    $scope.goToPerson = function (e, a) {
        var newUrl = 'http://uat.590440.com/WeChat/WeChatWeb/' + e;
        $window.location.href = newUrl;
    };
    
    //rating 評分
    $scope.rating = 0;
    $scope.ratings = [{
        current: 5,
        max: 10
    }, {
        current: 3,
        max: 5
    }];
    $scope.getSelectedRating = function (rating) {
        //console.log(rating);
    };
    $scope.setMinrate = function () {
        $scope.ratings = [{
            current: 1,
            max: 10
        }, {
            current: 1,
            max: 5
        }];
    };
    $scope.setMaxrate = function () {
        $scope.ratings = [{
            current: 10,
            max: 10
        }, {
            current: 5,
            max: 5
        }];
    };
    $scope.sendRate = function () {
        alert("Thanks for your rates!\n\nFirst Rate: " + $scope.ratings[0].current + "/" + $scope.ratings[0].max
        + "\n" + "Second rate: " + $scope.ratings[1].current + "/" + $scope.ratings[0].max)
    };
})
;