'use strict';

WeChat.controller('QuotationDetailCtrl', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter, $sce,Quotation) {
    $scope.AppId = window.localStorage.getItem('b2c_appId');
    $scope.Passport=$cookies.Passport;
    $scope.UnitId=$cookies.UnitId;
    $scope.uId=$cookies.uID; 
	// $scope.UrlStr = $(location).attr('search') || "Unknown";
	// $scope.quoteId = $scope.UrlStr.split('?quoteId=')[1]; 
    // if($scope.quoteId !=undefined&&$scope.quoteId !="undefined"){
	//     $scope.quoteId = $scope.quoteId.split('&')[0];
    // }     
    // $scope.QuotationId = $scope.quoteId;
    $scope.QuotationId ="";
    $scope.QuotationNo = '';
    $scope.sUnit = [];
    $scope.pUnit = [];
    $scope.Main = [];
    $scope.Details = [];
    $scope.Approve = [];
    $scope.MaintenanceStr = "";
    $scope.ModalParameters={"editIdx":0,"itemTag":"Main","TitleName":"同意","OtherSubtotal":0,"MainSubtotal":0,"Total":0,"Tax":0,"isSend":false,"isEdit":true};
    
    $scope.dynamicPopover = {'title': '修改历程','templateUrl': 'MyPopover.html'};
    
    $scope.imagesList = { 'localIds': [], 'serverIds': [] };
    $scope.MediasParamenter = {
        'Key': '',
        'FileSoure': 40,
        'Medias': {
            'image': [],
            'voice': []
        }
    };
        
    //设定微信调用
    $scope.Load_WX = function(){
        wx.config({
            debug: false,
            appId: $scope.AppId,
            timestamp: 1437377735,
            nonceStr: 'n580440',
            signature: window.localStorage.getItem($scope.AppId+"_signature"),
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onRecordEnd',
                'playVoice',
                'pauseVoice',
                'stopVoice',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView',
                'addCard',
                'chooseCard',
                'openCard'
            ]
        });
        wx.error(function(res){
            $http({
                url: ApiMapper.wxApi + '/wx/r/ticket/' + $scope.AppId,
                method: 'GET',
                cache: false,
                contentType: 'application/json'
            }).success(function (data) {
                var ticket = data; 
                window.localStorage.setItem($scope.AppId + "_ticket", ticket); 
                var String1 = "jsapi_ticket=" + ticket + "&noncestr=n580440&timestamp=1437377735&url=" + window.location.href;
                window.localStorage.setItem($scope.AppId + "_signature", hex_sha1(String1)); //alert(String1);
                $scope.Load_WX();
            });
        });
    };
    $scope.Load_WX();
    //照片
    $scope.chooseImage = function () {
        wx.chooseImage({
            sourceType: ['album', 'camera'],
            success: function (res) {
                if ($scope.imagesList.localIds.length > 0) {
                    //$scope.imagesList.localIds = $scope.imagesList.localIds.concat(res.localIds);
                    Array.prototype.push.apply($scope.imagesList.localIds, res.localIds);
                } else {
                    $scope.imagesList.localIds = res.localIds;
                }
                $scope.imagesList.serverIds = [];
                $scope.$apply();
                $timeout(function () {
                    _($scope.imagesList.localIds).each(function (Item, i) {
                        $('#advPic' + i).attr({'src': Item,'width':'72px','height':'72px'});
                    });
                }, 500);               
            }
        });
    };
    //删除照片
    $scope.RemoveImg = function (idx) {
        $scope.imagesList.localIds.splice(idx, 1);
    };
    $scope.onLoad01 = true;
    var i = 0;
    var length = $scope.imagesList.localIds.length; 
    $scope.upload = function () {
        wx.uploadImage({
            localId: $scope.imagesList.localIds[i],
            isShowProgressTips:1,
            success: function (res) {
                i++;//alert(i);
                $scope.imagesList.serverIds.push(res.serverId);
                $scope.RepairParameters.ImageMediaIds.push(res.serverId);
                $scope.MediasParamenter.Medias.image.push(res.serverId);
                if (i < length) {
                    $scope.upload();
                } else {
                    $scope.onLoad01 = false;
                    $scope.ModalParameters.Quoted2Sign();
                }
            }
        });
    };
    //上传图片
    $scope.uploadimages = function () {
        if ($scope.onLoad01) {
            $scope.imagesList.serverIds = []; 
            $scope.MediasParamenter.Medias.image = []; 
            $scope.RepairParameters.ImageMediaIds = [];
            i = 0;
            length = $scope.imagesList.localIds.length;                
                $scope.upload();
        } 
    };
    //获取维修品项资料
    $scope.getComponentList = function(EquipmentId) {
        //取得零件资料后,在初始化维修报价明细的select2 getCompts
         Quotation.getCompts($scope.Passport,EquipmentId)
        .then(function(data){    
            $scope.ComponentList = data;  
            //$scope.initialMainSelect2();
        },function(data){
            alert(data);
        });
    };
    // 讀取資料
    $scope.loadData = function() {
        Quotation.getDetail($scope.Passport,$scope.QuotationId)
        .then(function(data){            
            //console.log(data);
            $scope.sUnit = data.sUnit;
            $scope.pUnit = data.pUnit;
            $scope.Main = data.Main;
            $scope.Details = data.Details;
            $scope.Approves = data.Approve;
            
            $scope.ModalParameters.isEdit=$scope.Main.Status!=1?false:true;
            // 區分 報價明細 和 其他報價
            $scope.ModalParameters.MainDifferenceId = 0;
            $scope.ModalParameters.OtherDifferenceId = 0;
            $scope.DetailsOther=[];$scope.DetailsMain=[];
            _($scope.Details).each(function(item){
                if (item.IsDbData == 1) {
                    item.SelectId = $scope.MainDifferenceId;
                    item.selectitem = '';
                    item.isPopover=false;
                    _($scope.Modifyhistory).each(function(ItemObj) {
                        _(ItemObj).each(function(item_value) {
                            if (item_value.Guide == item.Guide) {
                                item.isPopover=true;
                            }
                        });
                    });
                    $scope.DetailsMain.push(item);
                    $scope.ModalParameters.MainSubtotal = $scope.ModalParameters.MainSubtotal + parseFloat(item.Price);
                    $scope.MainDifferenceId = $scope.MainDifferenceId + 1;
                } else {
                    item.SelectId = $scope.OtherDifferenceId;
                    item.selectitem = '';
                    item.isPopover=false;
                    _($scope.Modifyhistory).each(function(Item) {
                        _(Item).each(function(item_value) {
                            if (item_value.Guide == item.Guide) {
                                item.isPopover=true;
                            }
                        });
                    });
                    $scope.DetailsOther.push(item);
                    $scope.initialOtherSelect2();
                    $scope.ModalParameters.OtherSubtotal = $scope.ModalParameters.OtherSubtotal + parseFloat(item.Price);
                    $scope.OtherDifferenceId = $scope.OtherDifferenceId + 1;
                }
            });
            $scope.Modifyhistory=[$scope.Details];

            $scope.ModalParameters.MainSubtotal=parseFloat($scope.ModalParameters.MainSubtotal).toFixed(2);
            $scope.ModalParameters.OtherSubtotal=parseFloat($scope.ModalParameters.OtherSubtotal).toFixed(2);
            // 计算 小计 税额 总计
            $scope.ModalParameters.Total = parseFloat($scope.ModalParameters.MainSubtotal) + parseFloat($scope.ModalParameters.OtherSubtotal);
            $scope.ModalParameters.Tax = parseFloat($scope.ModalParameters.MainSubtotal + $scope.ModalParameters.OtherSubtotal) * $scope.TaxIncluded;
            //$scope.ModalParameters.isSend = $scope.ModalParameters.isSend * (1 - $scope.TaxIncluded);
            //$scope.ModalParameters.OtherSubtotal = parseFloat($scope.ModalParameters.OtherSubtotal) * (1 - $scope.TaxIncluded);
            
            $scope.ModalParameters.Total=parseFloat($scope.ModalParameters.Total).toFixed(2);
            //原先 小计 税额 总计
            $scope.originalPrice= $scope.ModalParameters.MainSubtotal + $scope.ModalParameters.OtherSubtotal;
            $scope.originalTax = $scope.ModalParameters.Tax;
            $scope.originalTotalPrice = $scope.ModalParameters.Total;
            
            //维修工单
            if(data.WorkerOrders.length>0){
                $scope.WorkerOrders_Imgs=[];
                 _(data.WorkerOrders).each(function (Item) {
                     if(Item.Type==1){                         
                        //Item.FilePath = Item.FilePath.replace('~', '');
                        Item.FilePath = ApiMapper.FileApi + '/' + Item.FilePath;
                        $scope.WorkerOrders_Imgs.push(Item);
                     }
                });
            }
            //報價單號
            $scope.QuotationNo = $scope.Main.QuotationNo;
            // 取得報修零件api
            $scope.getComponentList($scope.Main.EquipmentId);
            //获取修改、签核历程
            //$scope.getModifyhistory($scope.QuotationId);
        },function(data){
            alert(data);
        });        
    };
    // 初始化-维修报价明细 - select2
    $scope.initialMainSelect2 = function() { 
        $timeout(function () {
            $("#ComponentList").val($scope.DetailsMain[$scope.ModalParameters.editIdx].ComponentId).select2({ placeholder: "请选择设备"}).trigger("change"); 
            console.log($scope.DetailsMain[$scope.ModalParameters.editIdx].ComponentId);  
            // if($scope.DetailsMain[$scope.ModalParameters.editIdx].ComponentId!=""){
            //     $("#ComponentList").select2().val($scope.DetailsMain[$scope.ModalParameters.editIdx].ComponentId).trigger("change");  
            // }     
        }, 200);
    };
    //修改维修报价明细--select on change
    $scope.MainSelect4Change = function(Item,idx){console.log(JSON.stringify(Item));
        if (Item != 'undefined') {
            $scope.DetailsMain[n].ComponentCode = '';
            $scope.DetailsMain[n].ComponentName = '';
            $scope.DetailsMain[n].ComponentManufacturer = '';
            $scope.DetailsMain[n].ComponentModel = '';
            $scope.DetailsMain[n].ComponentSpec = '';
            $scope.DetailsMain[n].ComponentUnit = '';
            $scope.DetailsMain[n].ComponentUnitPrice = '';
            $scope.DetailsMain[n].Price = '';
            if (Item.ComponentId == '') {                
                Item.ComponentCode='';
                Item.ComponentName='';
                Item.ComponentManufacturer='';
                Item.ComponentModel='';
                Item.ComponentSpec='';
                Item.ComponentUnit='';
                Item.ComponentUnitPrice='';
                Item.Price='';
            } else {
                _.each($scope.ComponentList).each(function (ListItem) {
                    if (ListItem.ComponentId == Item.ComponentId) {
                        Item.ComponentCode=ListItem.ComponentCode;
                        Item.ComponentName=ListItem.ComponentName;
                        Item.ComponentManufacturer=ListItem.Manufacturer;
                        Item.ComponentModel=ListItem.Model;
                        Item.ComponentSpec=ListItem.Specifation;
                        Item.ComponentUnit=ListItem.Unit;
                        Item.ComponentUnitPrice=ListItem.UnitPrice;
                        Item.Price=ListItem.UnitPrice;
                    }
                });
            }
        }
    };
    $scope.openEditModal = function(ModalId,Idx){
        $scope.ModalParameters.editIdx = Idx;console.log(ModalId);
        if(ModalId=="itemEdit"){            
            $scope.ModalParameters.itemTag="Main";
            $scope.initialMainSelect2();
        }else{            
            $scope.ModalParameters.itemTag="Other";
        }
        $('#'+ModalId).modal('show');
    };

    // 新增-维修报价明细
    $scope.addDetailsMainItem = function() {
        $scope.ModalParameters.editIdx=$scope.DetailsMain.length;
        $scope.ModalParameters.itemTag="Main";
        $scope.MainDifferenceId = $scope.MainDifferenceId + 1;
        $scope.DetailsMain.push({
            "SelectId": $scope.MainDifferenceId,
            "selectitem": '',
            "isTax": true,
            "taxrate": 0.5,
            "ComponentUnitPrice": 0,
            "EquipmentId": $scope.EquipmentId,
            "ComponentCode": '',
            "ComponentName": null,
            "ComponentId": null,
            "ComponentManufacturer": '',
            "ComponentModel": '',
            "ComponentSpec": '',
            "ComponentUnit": '',
            "ComponentUnitPrice": 0,
            "Count": 1,
            "Price": 0,
            "IsTax": 1,
            "Remark": ''
        });
        $scope.initialMainSelect2();
        $scope.checkField('Main');
    };
    //刪除-维修报价明细
    $scope.removeMainItem = function(e) {
        $scope.DetailsMain.splice(e, 1);
        $scope.checkField('Main');
        $scope.calculateAll();
    };
    // 初始化-其他报价明细 - select2
    $scope.initialOtherSelect2 = function() {               
        $timeout(function () {
            $('[name=ComponentListOther]').select2({
                placeholder: "请选择设备...",
                createSearchChoice: function (term, data) { if ($(data).filter(function () { return this.text.localeCompare(term) === 0; }).length === 0) { return { id: term, text: term }; } },
                matcher: function (term, text, opt) {
                    return text.toUpperCase().indexOf(term.toUpperCase()) >= 0
                        || opt.attr("value").toUpperCase().indexOf(term.toUpperCase()) >= 0;
                }
            });
        }, 200);
    };
    // 新增 其他报价明细
    $scope.addDetailsOtherItem = function() {
        $scope.ModalParameters.editIdx=$scope.DetailsOther.length;
        $scope.ModalParameters.itemTag="Other";
        $scope.OtherDifferenceId = $scope.OtherDifferenceId + 1;
        $scope.DetailsOther.push({
            "SelectId": $scope.OtherDifferenceId,
            "selectitem": '',
            "isTax": true,
            "taxrate": 0.5,
            "ComponentUnitPrice": 0,
            "EquipmentId": $scope.EquipmentId,
            "ComponentCode": '',
            "ComponentName": null,
            "ComponentId": null,
            "ComponentManufacturer": '',
            "ComponentModel": '',
            "ComponentSpec": '',
            "ComponentUnit": '',
            "ComponentUnitPrice": 0,
            "Count": 1,
            "Price": 0,
            "IsTax": 1,
            "Remark": ''
        });
        //$scope.initialOtherSelect2();
        $scope.checkField('Other');
    };
    //刪除 其他报价明细-項目
    $scope.removeOtherItem = function(e) {
        $scope.DetailsOther.splice(e, 1);
        $scope.checkField('Other');
        $scope.calculateAll();
    };
    //計算列的金額
    $scope.ModalParameters.calculateRow = function() {
        if ($scope.ModalParameters.itemTag == 'Main') {
            var Total = $scope.DetailsMain[$scope.ModalParameters.editIdx].ComponentUnitPrice * $scope.DetailsMain[$scope.ModalParameters.editIdx].Count;
            $scope.DetailsMain[$scope.ModalParameters.editIdx].Price = Total;
       } else {
            var Total = $scope.DetailsOther[$scope.ModalParameters.editIdx].ComponentUnitPrice * $scope.DetailsOther[$scope.ModalParameters.editIdx].Count;
            $scope.DetailsOther[$scope.ModalParameters.editIdx].Price = Total;
        }
        $scope.calculateAll();
    };
    //計 算 小 記 , 稅 金, 總 計
    $scope.calculateAll = function() {
        $scope.ModalParameters.Total = 0;
        $scope.ModalParameters.Tax = 0;
        $scope.ModalParameters.MainSubtotal = 0;
        $scope.ModalParameters.OtherSubtotal = 0;
        _($scope.DetailsMain).each(function(value, key) {
            $scope.ModalParameters.MainSubtotal = $scope.ModalParameters.MainSubtotal + value.Price;
        });
        _($scope.DetailsOther).each(function(value, key) {
            $scope.ModalParameters.OtherSubtotal = $scope.ModalParameters.OtherSubtotal + value.Price;
        });
        $scope.ModalParameters.Total =parseFloat(parseFloat($scope.ModalParameters.MainSubtotal)+parseFloat($scope.ModalParameters.OtherSubtotal)).toFixed(2);
        $timeout(function () {
            $scope.ModalParameters.Total =parseFloat(parseFloat($scope.ModalParameters.MainSubtotal) + parseFloat($scope.ModalParameters.OtherSubtotal)).toFixed(2);
			$scope.ModalParameters.Tax = parseFloat((parseFloat($scope.ModalParameters.MainSubtotal)+parseFloat($scope.ModalParameters.OtherSubtotal))*parseFloat($scope.TaxIncluded)).toFixed(2);
           
			$scope.ModalParameters.MainSubtotal=parseFloat($scope.ModalParameters.MainSubtotal).toFixed(2);
            $scope.ModalParameters.OtherSubtotal=parseFloat($scope.ModalParameters.OtherSubtotal).toFixed(2);
        }, 200);
        // $scope.ModalParameters.MainSubtotal = parseFloat(parseFloat($scope.ModalParameters.MainSubtotal) * (1 - $scope.TaxIncluded)).toFixed(2);
        // $scope.ModalParameters.OtherSubtotal = parseFloat(parseFloat($scope.ModalParameters.OtherSubtotal) * (1 - $scope.TaxIncluded)).toFixed(2);
    };
    // 判斷欄位是否Null,NaN
    $scope.checkField = function(listName) {
        $scope.isNull = false;
        $scope.isNaN = false;
        // 檢查每列
        if (listName == 'Main') {
            _($scope.DetailsMain).each(function(value, key) {
                // 品項名稱
                if ($scope.DetailsMain[key].ComponentName === null) {
                    $scope.isNull = true;
                }
                // 單價,數量,金額
                if (isNaN($scope.DetailsMain[key].Price) == true || isNaN($scope.DetailsMain[key].ComponentUnitPrice) == true || isNaN($scope.DetailsMain[key].Count) == true) {
                    $scope.isNaN = true;
                }
            });
        } else {
            _($scope.DetailsOther).each(function(value, key) {
                // 品項名稱
                if ($scope.DetailsOther[key].ComponentName === null) {
                    $scope.isNull = true;
                    console.log('true');
                }
                // 單價,數量,金額
                if (isNaN($scope.DetailsOther[key].Price) == true || isNaN($scope.DetailsOther[key].ComponentUnitPrice) == true || isNaN($scope.DetailsOther[key].Count) == true) {
                    $scope.isNaN = true;
                }
            });
        }
        // 檢查 小計,稅,總計
        if (isNaN($scope.ModalParameters.isSend) || isNaN($scope.ModalParameters.OtherSubtotal) || isNaN($scope.ModalParameters.Tax) || isNaN($scope.ModalParameters.Total)) {
            $scope.isNaN = true;
        }
    };
    // $scope.loadData();
    
    //接收父控制器广播，刷新案件详情
    $scope.$on("QuoteList2Detail", function (event,data) {
        $scope.DetailsMain = [];
        $scope.DetailsOther = [];
        $scope.ModalParameters.editIdx=0;
        $scope.ModalParameters.OtherSubtotal=0;
        $scope.ModalParameters.MainSubtotal=0;
        $scope.ModalParameters.Total=0;
        $scope.ModalParameters.Tax=0;
        //零件稅率計算 17%
        $scope.TaxIncluded = 0.17;
        $scope.isNaN = false;
        $scope.isNull = false;
        //原本小計 稅 總計
        $scope.originalPrice= 0;
        $scope.originalTax = 0;
        $scope.originalTotalPrice = 0;        
        $scope.ModalParameters.isEdit=window.localStorage.getItem("QuoteStatusId")==1?false:true;

        $scope.QuotationId=data;
        $scope.loadData();
    });
    //打开签核Modal
    $scope.OpenSign=function(StatusId){
        $scope.ParametersStr = {
            "Result": StatusId,
            "Quote":{
                "QuotationId": $scope.QuotationId,
                "QuotationNo": $scope.QuotationNo,
                "Price":$scope.ModalParameters.Total,
                "Tax":$scope.ModalParameters.Tax,
                "TotalPrice":$scope.ModalParameters.Total,
                "UserName":$scope.UserFullName
            },
            "Details":[],
            "Remark":""
        };     
        if(StatusId==2){
            $scope.ModalParameters.TitleName = "同意";
        }else{
            $scope.ModalParameters.TitleName = "退回";
        }    
        $('#quoted-sign-modal').modal('show');
    };
    
    //取消
    $scope.ModalParameters.Cancel2Sign = function(){
        $scope.ParametersStr = {
            "TitleName": "",
            "Result": 2,
            "Quote":{ },
            "Details":[],
            "Remark":""
        }; 
        $('#quoted-sign-modal').modal('hide');
    };
    //修改报价单详情并签核
    $scope.ModalParameters.Quoted2Sign = function() {
        $scope.ModalParameters.isSend = true;
        if($scope.ParametersStr.Result==3){//取消报修，审批意见必填
            if($scope.ParametersStr.Remark==""){
                $scope.ModalParameters.isSend = false;
                $scope.$toastlast = toastr['error']("请输入审批意见", "");
                return false;
            }
        }
        if ($scope.imagesList.localIds.length > 0 && $scope.onLoad01) {
            // $scope.uploadimages();
        }
        var ResendDetails = [];
        _($scope.DetailsMain).each(function(item_value) {
            ResendDetails.push(item_value);
        });
        _($scope.DetailsOther).each(function(item_value) {
            ResendDetails.push(item_value);
        });
        $scope.ParametersStr.Details=ResendDetails;

        Quotation.getQuoteUpdate($scope.Passport,$scope.ParametersStr)
        .then(function(data){
            if(data.StatusCode>1){
                $scope.ModalParameters.isSend = false;     
                alert(data.Messages);
            }else{
                // $scope.uploadimages();
                //$scope.loadData();                
                $('#quoted-sign-modal').modal('hide');
                location.replace(ApiMapper.PathStr+ "quotation.html");
            }
        },function(data){       
            $scope.ModalParameters.isSend = false;     
            alert(data.Messages);   
        });  
    };
    $scope.toggleDenav = function (navID) {
        $mdSidenav(navID).toggle();
    };
    //關閉頁面
    $scope.closeDenav = function (navID) {
        $scope.swipeState=false;
        $mdSidenav(navID)
           .close()
           .then(function () {
            
           });
    };
})
;
