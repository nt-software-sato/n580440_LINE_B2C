n580440
.factory('Equipment',function($http,$q){
    var service = {};
    //报价列表
    service.getLists = function(Passport,Parameters,qStatus,currentPage){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/quote/filter/'+qStatus+'/' + currentPage,
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
    };
    return service;
})
;