WeChat
.factory('Quotation',function($http,$q){
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
            _(data[1]).each(function(item){
                if(item.Process==1){item.ResultStr="区工程主管";}
                else if(item.Process==2){item.ResultStr="总部工程处主管";}
                else if(item.Process==3){item.ResultStr="签呈";}
                else if(item.Process==4){item.ResultStr="食安副理";}
                else if(item.Process==5){item.ResultStr="维修专员";}
                else if(item.Process==6){item.ResultStr="经理";}
                else if(item.Process==7){item.ResultStr="副理";}
            });
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //报价详情
    service.getDetail = function(Passport,QuotationId){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/quote/s/' + QuotationId,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport':Passport }
        }).success(function (data) {
            switch (parseInt(data.Main.EquipmentTypeClass)){
                case 0:
                    data.Main.EquipmentType = "设备";
                    break;
                case 1:
                    data.Main.EquipmentType = "设施";
                    break;
                default:
                    data.Main.EquipmentType = "资讯";
                    break;
            }
            //維修商-收費狀態
            switch (parseInt(data.pUnit.Maintenance)) {
                case 0:
                    data.pUnit.MaintenanceStr = "一般";
                    break;
                case 1:
                    data.pUnit.MaintenanceStr = "巡檢";
                    break;
                case 2:
                    data.pUnit.MaintenanceStr = "統包";
                    break;
                default:
                    data.pUnit.MaintenanceStr = "一般";
                    break;
            }
            if(data.Approve.length>0){
                _(data.Approve).each(function(item_value) {
                    switch (parseInt(item_value.Result)) {
                        case 0:
                            item_value.ResultName = "停用";
                            break;
                        case 1:
                            item_value.ResultName = "修改";
                            break;
                        case 2:
                            item_value.ResultName = "同意";
                            break;
                        case 3:
                            item_value.ResultName = "驳回";
                            break;
                        default:
                            item_value.ResultName = "完成";
                            break;
                    }
                });
            }
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //报价详情--email无Passport
    service.getDetail4mail = function(encryptCode){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/f/quote/s?encryptCode=' + encryptCode,
            method: 'GET',
            contentType: 'application/json'
        }).success(function (data) {
            switch (parseInt(data.Main.EquipmentTypeClass)){
                case 0:
                    data.Main.EquipmentType = "设备";
                    break;
                case 1:
                    data.Main.EquipmentType = "设施";
                    break;
                default:
                    data.Main.EquipmentType = "资讯";
                    break;
            }
            //維修商-收費狀態
            switch (parseInt(data.pUnit.Maintenance)) {
                case 0:
                    data.pUnit.MaintenanceStr = "一般";
                    break;
                case 1:
                    data.pUnit.MaintenanceStr = "巡檢";
                    break;
                case 2:
                    data.pUnit.MaintenanceStr = "統包";
                    break;
                default:
                    data.pUnit.MaintenanceStr = "一般";
                    break;
            }
            if(data.Approve.length>0){
                _(data.Approve).each(function(item_value) {
                    switch (parseInt(item_value.Result)) {
                        case 0:
                            item_value.ResultName = "停用";
                            break;
                        case 1:
                            item_value.ResultName = "修改";
                            break;
                        case 2:
                            item_value.ResultName = "同意";
                            break;
                        case 3:
                            item_value.ResultName = "驳回";
                            break;
                        default:
                            item_value.ResultName = "完成";
                            break;
                    }
                });
            }
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //零部件
    service.getCompts = function(Passport,equipmentId){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/compts/' + equipmentId,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport':Passport }
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //零部件--email无Passport
    service.getCompts4mail = function(equipmentId){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/compts/' + equipmentId,
            method: 'GET',
            contentType: 'application/json'
        }).success(function (data) {
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //报价签核历程
    service.getApproves = function(Passport,QuotationId){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/quote/approve/r/' + QuotationId,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport':Passport }
        }).success(function (data) {
            if(data.length>0){
                angular.forEach(data, function(item) {
                    switch(parseInt(item.Process))
                    {
                        case 1:
                            item.ProcessStr="区维修专员";
                            break;
                        case 2:
                            item.ProcessStr="区维修专员副理";
                            break;
                        case 3:
                            item.ProcessStr="区工程主管";
                            break;
                        case 4:
                            item.ProcessStr="总部工程部主管";
                            break;
                        case 5:
                            item.ProcessStr="总部工程处主管";
                            break;
                        case 6:
                            item.ProcessStr="营运经理";
                            break;
                        case 11:
                            item.ProcessStr="品保主管";
                            break;
                        case 12:
                            item.ProcessStr="店长";
                            break;
                        case 21:
                            item.ProcessStr="区工程主管";
                            break;
                        case 100:
                            item.ProcessStr="完成";
                            break;
                        default:
                            item.ProcessStr="";
                            break;
                    } 
                    switch(parseInt(item.Result))
                    {
                        case 1:
                            item.ResultName="尚未签核";
                            break;
                        case 2:
                            item.ResultName="同意";
                            break;
                        case 3:
                            item.ResultName="退回";
                            break;
                        default:
                            item.ResultName=" ";
                            break;
                    } 
                });                
            }
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //报价签核历程--email无Passport
    service.getApproves4mail = function(encryptCode){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/f/quote/approve/r?encryptCode=' + encryptCode,
            method: 'GET',
            contentType: 'application/json'
        }).success(function (data) {
            if(data.length>0){
                angular.forEach(data, function(item) {
                    switch(parseInt(item.Process))
                    {
                        case 1:
                            item.ProcessStr="区维修专员";
                            break;
                        case 2:
                            item.ProcessStr="区维修专员副理";
                            break;
                        case 3:
                            item.ProcessStr="区工程主管";
                            break;
                        case 4:
                            item.ProcessStr="总部工程部主管";
                            break;
                        case 5:
                            item.ProcessStr="总部工程处主管";
                            break;
                        case 6:
                            item.ProcessStr="营运经理";
                            break;
                        case 11:
                            item.ProcessStr="品保主管";
                            break;
                        case 12:
                            item.ProcessStr="店长";
                            break;
                        case 21:
                            item.ProcessStr="区工程主管";
                            break;
                        case 100:
                            item.ProcessStr="完成";
                            break;
                        default:
                            item.ProcessStr="";
                            break;
                    } 
                    switch(parseInt(item.Result))
                    {
                        case 1:
                            item.ResultName="尚未签核";
                            break;
                        case 2:
                            item.ResultName="同意";
                            break;
                        case 3:
                            item.ResultName="退回";
                            break;
                        default:
                            item.ResultName=" ";
                            break;
                    } 
                });                
            }
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //报价单修改历程
    service.getDetails = function(Passport,QuotationId){
        //makeUrl();
        var deferred = $q.defer();
        $http({
            url: ApiMapper.ApiUrl + '/quote/details/' + QuotationId,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport':Passport }
        }).success(function (data) {            
            angular.forEach(data, function(item_value, key) {
                switch(parseInt(item_value.Crud))
                {
                    case 1:
                        item_value.CrudStr = "新增";
                        break;
                    case 2:
                        item_value.CrudStr = "修改";
                        break;
                    case 3:
                        item_value.CrudStr = "删除";
                        break;
                }
                if(key==0){
                    item_value.beforeModify = 0.00;
                }else {
                    item_value.beforeModify = item_value.Price;
                }
            });
            deferred.resolve(data);
        }).error(function (data) {
            deferred.reject(data.Message);
        });
        return deferred.promise;
    };
    //修改-签核报价单
    service.getQuoteUpdate = function(Passport,AcceptParameters){
        //makeUrl();
        var deferred = $q.defer();
        $http({
              url: ApiMapper.ApiUrl + '/quote/update',
              method: 'PATCH',
              contentType: 'application/json',
              headers: {'Passport': Passport},
              data: JSON.stringify(AcceptParameters)
          }).success(function(data) {              
            deferred.resolve(data);
          }).error(function(data) {
            deferred.reject(data.Message);
          });
        return deferred.promise;
    };
    //修改-签核报价单--email无Passport
    service.getQuoteUpdate4mail = function(encryptCode,AcceptParameters,noPassport){
        //makeUrl();
        var deferred = $q.defer();
        $http({
              url: ApiMapper.ApiUrl + '/f/quote/update?encryptCode='+encryptCode,
              method: 'PATCH',
              contentType: 'application/json',
              data: JSON.stringify(AcceptParameters)
          }).success(function(data) {              
            deferred.resolve(data);
          }).error(function(data) {
            deferred.reject(data.Message);
          });
        return deferred.promise;
    };
    return service;
})
;