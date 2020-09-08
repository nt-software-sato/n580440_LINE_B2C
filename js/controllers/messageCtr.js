'use strict';

WeChat.controller('MsnRepairCtrl', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil) {
    $scope.RepairList = [];
    $scope.RepairInfo = {};
    $scope.RequisitionIds = [];
    $scope.currentPage = 1;
    $scope.isLoading = false;
    $scope.isShowMore = false;
    $scope.isShowList = false;
    $scope.RepairCounts = 0;
    //控制删除触发事件
    $scope.openDiv = false;
    $scope.deletFN = function (event) {
        $scope.openDiv = true;
    };
    $scope.CancelDeletFN = function (event) {
        $scope.openDiv = false;
    };
    //通知列表查询
    $scope.SearchRepair = function (currentPage) {
        $scope.currentPage = currentPage;
        if (currentPage == 1) {
            $scope.isLoading = true;
        }
        $http({
            url: ApiMapper.wxApi + '/wx/message/' + $scope.currentPage,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport }
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
				}
                Array.prototype.push.apply($scope.RepairList, data[1]);
            } else {
                $scope.isShowMore = false;
                $scope.isShowDetail = false;
            }
            $scope.isLoading = false;
        }).error(function () {
            $scope.isLoading = false;
        });
    };
    $scope.SearchRepair(1);
    //加载更多
    $scope.LoadMore = function () {
        $scope.currentPage = $scope.currentPage + 1;
        $scope.SearchRepair($scope.currentPage);
        if ($scope.currentPage == $scope.RepairCounts) {
            $scope.isShowMore = false;
        }
    };
    //加载案件详情
    $scope.GetDetail = function (Id, Tag) {
		//location.href = ApiMapper.PathStr +'Detail.html?requisitionId='+Id;
        if (!$scope.openDiv) {
            $mdSidenav('RepairDetail').toggle();
        }
        $scope.RepairInfo = {};
        $scope.CheckedIds = [];
        $http({
            url: ApiMapper.sApi + '/s/rez/' + Id,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport }
        }).success(function (data) {
            $scope.RepairInfo = data;
			if($scope.RepairInfo.EstArrivalTime!=null&&$scope.RepairInfo.EstArrivalTime!="")
				$scope.RepairInfo.EstArrivalTime = $filter('date')(new Date($scope.RepairInfo.EstArrivalTime), 'yyyy/MM/dd HH:mm:ss');
			
			if($scope.RepairInfo.DateA!=null&&$scope.RepairInfo.DateA!="")
				$scope.RepairInfo.DateA = $filter('date')(new Date($scope.RepairInfo.DateA), 'yyyy/MM/dd HH:mm:ss');
            $scope.RepairInfo.IntervalAB = $scope.M2H($scope.RepairInfo.IntervalAB);
            $scope.RepairInfo.IntervalBC = $scope.M2H($scope.RepairInfo.IntervalBC);
            $scope.RepairInfo.IntervalCD = $scope.M2H($scope.RepairInfo.IntervalCD);
            $scope.RepairInfo.IntervalAD = $scope.M2H($scope.RepairInfo.IntervalAD);
            $scope.GetEquipmentpos();
            $scope.GetUnitInfo();
            $scope.getHistory();
        });
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
    //获取门店信息
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
    //删除微信通知
    $scope.DeleteMsn = function (Id) {
        $scope.isLoading = true;
        $http({
            url: ApiMapper.wxApi + '/wx/message/' + Id,
            method: 'DELETE',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport }
        }).success(function (data) {
            if (data.StatusCode == 1) {
                $scope.SearchRepair(1);
                alert('删除成功！');
            }
            $scope.isLoading = false;
        }).error(function () {
            $scope.isLoading = false;
        });
    };
})
;
