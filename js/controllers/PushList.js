'use strict';

WeChat.controller('PushListCtrl', ['$scope', '$http', '$timeout', '$cookies', '$mdSidenav', '$mdUtil', '$filter', '$sce', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter, $sce) {
    $scope.isLoading = true;
    $scope.isShowGoing = false;
    $scope.AppId = ApiMapper.AppId;
  $scope.OpenId = window.localStorage.getItem($scope.AppId);
  
  // 获取案件分类-数字(進行中)
  $scope.GetCaseCount = function () {
    $http({
      // 查詢: 0
      url: ApiMapper.sApi + '/s/rez/misc/statistic/0',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $cookies.Passport
      },
    }).success(function (data) {
      $scope.CaseCountList = data;
      var EmergencySum = $scope.CaseCountList.Emergency.New + $scope.CaseCountList.Emergency.Acceptance +$scope.CaseCountList.Emergency.Revocation;
      var NormalSum = $scope.CaseCountList.Normal.New + $scope.CaseCountList.Normal.Acceptance +$scope.CaseCountList.Normal.Revocation;
      
      if(EmergencySum === 0 && NormalSum === 0){
        $scope.isShowGoing = true;console.log(EmergencySum,NormalSum,$scope.isShowGoing);
      }
      $scope.isLoading = false;
    }).error(function(res) {
        $scope.isLoading = false;
    });
  };
  $scope.GetCaseCount();

  $scope.goToSearch = function(){
    location.href = ApiMapper.PathStr + 'search_muti.html';;
  };
}]);