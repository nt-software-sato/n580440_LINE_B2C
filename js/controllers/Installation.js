'use strict';

WeChat.controller('InstallationCtrl', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter, $sce) {
    $scope.RepairList = [];
    $scope.isShowDetail = false;
    $scope.isLoading = false;
    $scope.isShowMore = false;
    $scope.RepairCounts = 0;
    $scope.currentPage = 1;

    //列表查询
    $scope.SearchRepair = function () {
        $scope.isLoading = true;
        $http({
                url: ApiMapper.sApi + '/s/journal/new/search/' + $scope.currentPage,
                method: 'Get',
                contentType: 'application/json',
                headers: {
                    'Passport': $cookies.Passport
                },
            })
            .success(function (data) {
                console.log(data);
                $scope.isLoading = false;
                if (data[1].length > 0) {
                    _(data[1]).each(function (Item) {
                        Item.EstStartTime = FormatDate(Item.EstStartTime);
                        Item.EstEndTime = FormatDate(Item.EstEndTime);
                        $scope.RepairList.push(Item);
                    });
                    $scope.isShowMore = data[0] > $scope.currentPage ? true : false;
                    if ($scope.isShowMore == true) {
                        $scope.currentPage = $scope.currentPage + 1;
                    };
                    $scope.isShowDetail = true;
                } else {
                    $scope.isShowDetail = false;
                };
            })
            .error(function (error) {
                $scope.isLoading = false;
                alert(error.Messages);
            });

    };
    $scope.SearchRepair(1);


    //加载更多
    $scope.LoadMore = function () {
        $scope.SearchRepair();
    };

    $scope.GetDetail = function (RepairItem, Tag) {
        window.location.href = "Installation_Detail.html?RequisitionId=" + RepairItem.RequisitionId;
        $scope.RepairInfo = {};
        $scope.CheckedIds = [];
    };

});