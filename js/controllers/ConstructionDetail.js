
WeChat.controller('ConstructionDetailCtrl', ['$scope', '$http', '$timeout', '$location', '$window', '$cookies', '$mdSidenav', '$mdUtil', '$filter', function ($scope, $http, $timeout, $location, $window, $cookies, $mdSidenav, $mdUtil, $filter) {
    $scope.JournalId = getQueryString('JournalId');
    $scope.HistoryId = getQueryString('HistoryId');
    $scope.AppId = ApiMapper.AppId;
    $scope.UrlStr = $(location).attr('search') || "Unknown";
    
    $scope.Load_WX = function () {
        wx.config({
            debug: false,
            appId: $scope.AppId,
            timestamp: 1437377735,
            nonceStr: 'n580440',
            signature: window.localStorage.getItem($scope.AppId + "_signature"),
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
        wx.error(function (res) {
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

	// $scope.JournalId = $scope.UrlStr.split('?JournalId=')[1]; 
    // if($scope.JournalId !=undefined&&$scope.JournalId !="undefined"){
	//     $scope.JournalId = $scope.JournalId.split('&')[0];
    // }
    
    //$scope.JournalId = Request.QueryString('JournalId').toString();
	$scope.pcompanyList = [];
	$scope.ImgList = [];
	$scope.ThumbList = [];
    $scope.StoreList = [];
    $scope.RepairInfo = {};
    $scope.JournalIds = [];
    $scope.AreasSelected = [];
    $scope.itemsAreaStr = []; 
    $scope.isLoading = false;
    $scope.isShowDetail = false;
    $scope.IsThumbs = false;
    $scope.IsThumbs_Request = false;
    $scope.IsThumbs_Response = false;
    $scope.CollapseState = false;
    $scope.Voice = {};
    $scope.playing = false;
    $scope._Patch;
    $scope.audio;
    $scope.historyInfo={};
    $scope.Passport =window.localStorage.getItem('Passport');
    //关闭 Sidenav
    $scope.CloseSidenav = function (navID) {
        $mdSidenav(navID).close()
            .then(function () {
                //$log.debug("close RIGHT is done");
            });
    };
    //格式化案件详情内容
    $scope.FormatDetailInfo=function(RepairDetails){
        $scope.RepairInfo = RepairDetails.Journal;//报修单详细信息     
		
		if($scope.RepairInfo.CreatedTime!=null&&$scope.RepairInfo.CreatedTime!="")
			$scope.RepairInfo.CreatedTime = $filter('date')($scope.RepairInfo.CreatedTime, 'yyyy/MM/dd HH:mm:ss');
		            
        if($scope.RepairInfo.EstStartTime!=null&&$scope.RepairInfo.EstStartTime!="")
            $scope.RepairInfo.EstStartTime = FormatDate($scope.RepairInfo.EstStartTime);
        if($scope.RepairInfo.EstEndTime!=null&&$scope.RepairInfo.EstEndTime!="")
            $scope.RepairInfo.EstEndTime = FormatDate($scope.RepairInfo.EstEndTime);
        //施工日志列表
        if (RepairDetails.JournalHistory.length > 0) {
            $scope._TableData = _(RepairDetails.JournalHistory).map(function (Item) {
                if(Item.SelectDay!=null&&Item.SelectDay!="")
                    Item.SelectDay = FormatDate(Item.SelectDay);
                //Item.ResponseTime = $filter('date')(new Date(Item.ResponseTime), 'yyyy/MM/dd HH:mm:ss');
				_(Item.Thumbnail).each(function (ThumbItem, i) {
					//ThumbItem.FilePath = ThumbItem.FilePath.replace('~', '');
					ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
					ThumbItem.Src = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;

					ThumbItem.thumb = ThumbItem.FilePath;
					ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
				});
                return Item;
            });
            $scope._TableData=RepairDetails.JournalHistory;
            $scope.isTimeline = true;
        }
    };
    //加载案件详情
    $scope.GetDetail = function (Id) {
        $scope.RepairInfo = {};
        $scope.CheckedIds = [];
        $http({
            url: ApiMapper.sApi + '/s/journal/detail/' + Id,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $scope.Passport }
        }).success(function (data) {//alert(JSON.stringify(data));
            $scope.FormatDetailInfo(data);
            $scope.isShow = true;
            if($scope.HistoryId!=undefined&&$scope.HistoryId!=""){
                $scope.GetHistoryDetail( $scope.JournalId,$scope.HistoryId);
            }
        }).error(function(data){alert(JSON.stringify(data));});
    };
    
    $scope.GetDetail($scope.JournalId);
    //接收父控制器广播，刷新案件详情
    $scope.$on("RepairList2Detail", function (event,data) {
        $scope.JournalId=data;
        $scope.GetDetail($scope.JournalId);
    });
    if($scope.JournalId==""||$scope.JournalId==null||$scope.JournalId=="null"){
        $scope.JournalId = $scope.UrlStr.split('?requisitionId=')[1]; 
        if($scope.JournalId !=undefined&&$scope.JournalId !="undefined"){
            $scope.JournalId = $scope.JournalId.split('&')[0];
            $scope.GetDetail($scope.JournalId);
        }
    }
    $scope.ShowImg = function (Id) {
        $('#ShowImg').attr({ 'src':  ApiMapper.ccApi + '/cc/image/' + Id });
    };
    //加载报修进度图片
    $scope.ListShowImg = function (n, i) {
        var imgStr = ApiMapper.ccApi + '/' + $scope._TableData[n].Thumbnail[i].FilePath;
        $('#List_'+n+'_'+i).attr({ 'src': imgStr });
    };
    $scope.toggleDenav = function (navID) {
        if ((navID == 'right-Area' || navID == 'Maintainer') && $scope.SearhParams.UnitIds.length == 0) {
            alert('请先选择单位！');
            return false;
        }

         //swipe事件class的判断条件
        if(navID == 'right_cancel_sign'){
         $scope.swipeState=true;
        }
        else{$scope.swipeState=false;}
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
    //控制icon變化
    $scope.change_openicon = function () {
        $scope.CollapseState = !$scope.CollapseState;
    };
    //加载
    $scope.FormathistoryInfo = function () {
        //日志图片
        if ($scope.historyInfo.Thumnails.length > 0) {
            $scope.IsThumbs_Request = true;
            $scope.ThumbList = [];
            _($scope.historyInfo.Thumnails).each(function (ThumbItem) {
                if(ThumbItem.Type==1){                    
                    //ThumbItem.FilePath = ThumbItem.FilePath.replace('~', '');
                    ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
					ThumbItem.thumb = ThumbItem.FilePath;
					ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
                    $scope.ThumbList.push(ThumbItem);
                }
            });
        }
    };
    //加载日志详情
    $scope.GetHistoryDetail = function (JournalId, historyId) {
        $scope.historyInfo={};
        $http({
            url: ApiMapper.sApi + '/s/journal/d/' + JournalId +'/'+historyId,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $scope.Passport }
        }).success(function (data) {//alert(JSON.stringify(data));
            $scope.historyInfo=data;
            $scope.FormathistoryInfo(data);
            $scope.isShow = true;
            
            if($scope.historyInfo.SelectDay!=null&&$scope.historyInfo.SelectDay!="")
                $scope.historyInfo.SelectDay = FormatDate($scope.historyInfo.SelectDay);
    
            $mdSidenav('HistoryDetail').toggle();
        }).error(function(data){alert(JSON.stringify(data));});
        // window.localStorage.setItem("JournalId", JournalId);
        // $scope.$broadcast("HistoryDetail",historyId);console.log('HistoryDetail');
    };

    $scope.previewImage = function (page, imgList) {
        var MyCurrent = imgList[page].img;
        var MyUrls = [];
        _(imgList).each(function (item) {
            MyUrls.push(item.img)
        });
        wx.previewImage({
            current: MyCurrent, // 当前显示图片的http链接
            urls: MyUrls // 需要预览的图片http链接列表
        });
    };

}]);
WeChat.controller('ConstructionHistoryCtrl', ['$scope', '$http', '$timeout', '$location', '$window', '$cookies', '$mdSidenav', '$mdUtil', '$filter', function ($scope, $http, $timeout, $location, $window, $cookies, $mdSidenav, $mdUtil, $filter) {
    //var Id = Request.QueryString('requisitionId').toString();
    $scope.AppId = ApiMapper.AppId;
	$scope.UrlStr = $(location).attr('search') || "Unknown";
    $scope.JournalId = window.localStorage.getItem("JournalId");
    $scope.HistoryId = "";
	$scope.pcompanyList = [];
	$scope.ImgList = [];
	$scope.ThumbList = [];
    $scope.StoreList = [];
    $scope.RepairInfo = {};
    $scope.JournalIds = [];
    $scope.AreasSelected = [];
    $scope.itemsAreaStr = []; 
    $scope.isLoading = false;
    $scope.isShowDetail = false;
    $scope.IsThumbs = false;
    $scope.IsThumbs_Request = false;
    $scope.IsThumbs_Response = false;
    $scope.CollapseState = false;
    $scope.Voice = {};
    $scope.playing = false;
    $scope._Patch;
    $scope.audio;
    $scope.Survey = 5;
    $scope.Survey1 = 5;
    $scope.Passport =window.localStorage.getItem('Passport');
    //关闭 Sidenav
    $scope.CloseSidenav = function (navID) {
        $mdSidenav(navID).close()
            .then(function () {
                //$log.debug("close RIGHT is done");
            });
    };
    //格式化案件详情内容
    $scope.FormatDetailInfo=function(RepairDetails){
        $scope.RepairInfo = RepairDetails.Journal;//报修单详细信息   
		
		if($scope.RepairInfo.CreatedTime!=null&&$scope.RepairInfo.CreatedTime!="")
			$scope.RepairInfo.CreatedTime = $filter('date')($scope.RepairInfo.CreatedTime, 'yyyy/MM/dd HH:mm:ss');
		
        // //报修图片
        // if ($scope.historyInfo.Thumnails.length > 0) {
        //     $scope.IsThumbs_Request = true;
        //     $scope.ThumbList = [];
        //     _($scope.RepairInfo.RequestFiles).each(function (ThumbItem) {
        //         if(ThumbItem.Type==1){                    
        //             //ThumbItem.FilePath = ThumbItem.FilePath.replace('~', '');
        //             ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
		// 			ThumbItem.thumb = ThumbItem.FilePath;
		// 			ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
        //             $scope.ThumbList.push(ThumbItem);
        //         }else{
        //             $scope.isShowVoice = true;
        //             $scope.Voice = {"Thumbnail": ApiMapper.ccApi + '/' + ThumbItem.FilePath};
        //             $scope.audioLoading();//加载录音档
        //         }
        //     });
        // }
        // //维修后图片
        // if ($scope.RepairInfo.ResponseFiles.length > 0) {
        //     $scope.IsThumbs_Response = true;
        //     $scope.ThumbList_Response = [];
        //     _($scope.RepairInfo.ResponseFiles).each(function (ThumbItem) {
        //         if(ThumbItem.Type==1){                    
        //             //ThumbItem.FilePath = ThumbItem.FilePath.replace('~', '');
        //             ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
		// 			ThumbItem.thumb = ThumbItem.FilePath;
		// 			ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
        //             $scope.ThumbList_Response.push(ThumbItem);
        //         }
        //     });
        // }
        //施工日志列表
        if (RepairDetails.JournalHistory.length > 0) {
            $scope._TableData = _(RepairDetails.JournalHistory).map(function (Item) {
                //Item.ResponseTime = $filter('date')(new Date(Item.ResponseTime), 'yyyy/MM/dd HH:mm:ss');
				_(Item.Thumbnail).each(function (ThumbItem, i) {
					//ThumbItem.FilePath = ThumbItem.FilePath.replace('~', '');
					ThumbItem.FilePath = ApiMapper.FileApi + '/' + ThumbItem.FilePath;
					ThumbItem.Src = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;

					ThumbItem.thumb = ThumbItem.FilePath;
					ThumbItem.img = ApiMapper.ccApi + '/cc/image/' + ThumbItem.Id;
				});
                return Item;
            });
            $scope._TableData=RepairDetails.JournalHistory;
            $scope.isTimeline = true;
        }
        
    };
    //加载案件详情
    $scope.GetDetail = function (Id) {
        $scope.RepairInfo = {};
        $scope.CheckedIds = [];
        $http({
            url: ApiMapper.sApi + '/s/journal/d/' + $scope.JournalId +'/'+Id,
            method: 'GET',
            contentType: 'application/json',
            headers: { 'Passport': $scope.Passport }
        }).success(function (data) {//alert(JSON.stringify(data));
            $scope.FormatDetailInfo(data);
			$scope.isShow = true;
        }).error(function(data){alert(JSON.stringify(data));});
    };
    
    //接收父控制器广播，刷新案件详情
    $scope.$on("HistoryDetail", function (event,data) {
        $scope.HistoryId=data;
        $scope.GetDetail($scope.HistoryId);
    });
    
    $scope.ShowImg = function (Id) {
        $('#ShowImg').attr({ 'src':  ApiMapper.ccApi + '/cc/image/' + Id });
    };
    //加载报修进度图片
    $scope.ListShowImg = function (n, i) {
        var imgStr = ApiMapper.ccApi + '/' + $scope._TableData[n].Thumbnail[i].FilePath;
        $('#List_'+n+'_'+i).attr({ 'src': imgStr });
    };
    $scope.toggleDenav = function (navID) {
        if ((navID == 'right-Area' || navID == 'Maintainer') && $scope.SearhParams.UnitIds.length == 0) {
            alert('请先选择单位！');
            return false;
        }
         //swipe事件class的判断条件
        if(navID == 'right_cancel_sign'){
         $scope.swipeState=true;
        }
        else{$scope.swipeState=false;}
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
    //控制icon變化
    $scope.change_openicon = function () {
        $scope.CollapseState = !$scope.CollapseState;
    };

}])
;