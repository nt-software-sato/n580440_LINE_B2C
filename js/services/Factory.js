n580440
.factory('RepairObj',function($http,$q){
    var service = {};
    service.getLists = function(Passport,Parameters,currentPage){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/rez/f/' + currentPage,
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Passport':Passport },
            data: Parameters
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    }

    service.getDetail = function(Passport,rId,isInspect){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/rez/' + rId +'/'+isInspect,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport':Passport }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    }
    return service;
})
;