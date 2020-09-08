WeChat.controller('ChangePwdCtrl', ['$scope', '$http', '$timeout', '$window', '$cookies', 'md5', function ($scope, $http, $timeout, $window, $cookies, md5) {
	$scope.AppId = window.localStorage.getItem('b2c_appId');
	
	window.localStorage.clear();
    $scope.AppId = ApiMapper.AppId;
    window.localStorage.setItem("b2c_appId", $scope.AppId);
    $scope.user = { 'UserId': $cookies.UserId, 'opassword': '', 'npassword': '','cpassword':'' };
	$scope.ErrorMassage="两次密码输入不一致，请重新输入！";
    $scope.isInuse = false;
    var Func_Timeouter_Lock;
    $scope.Repair_Time = function () {
        if ($scope.TimesForLock == 200) {
            $timeout.cancel(Func_Timeouter_Lock);
            $scope.TimesForLock = 0;
            $scope.CheckUsed();
        } else {
            $scope.TimesForLock = $scope.TimesForLock + 1;
            Func_Timeouter_Lock = $timeout(function () { $scope.Repair_Time(); }, 1);
        }
    };
    //判断电话号码是否已经使用
    $scope.CheckUsed = function () {
		if ($scope.user.npassword != "") {
			$http({
				url: ApiMapper.ccApi + '/cc/check/password/' + $scope.user.npassword,
				method: 'GET',
				contentType: 'application/json',
				headers: { 'Passport': $cookies.Passport}
			}).success(function (data) {
				if (!data) {
					$scope.ErrorMassage="新密格式不正确，请重新输入！";
					$scope.isInuse = true;
				} else {
					$scope.isInuse = false;
				}
			}).error(function(){
				alert("ErrorMassage");
			});
		}
		if ($scope.user.npassword !="" && $scope.user.cpassword !="") {
			if ($scope.user.npassword != $scope.user.cpassword) {
				$scope.ErrorMassage="两次密码输入不一致，请重新输入！";
				$scope.isInuse = true;
			}
		}
    };
    //号码修改
    $scope.ChangePhoneNO = function () {
        $scope.TimesForLock = 0;
        $timeout.cancel(Func_Timeouter_Lock);
        $scope.Repair_Time();
    };
    //修改密码
    $scope.ChangePassword = function () {
		if ($scope.user.npassword != "" && $scope.user.cpassword != "") {
			if ($scope.user.npassword != $scope.user.cpassword) {
				$scope.ErrorMassage="两次密码输入不一致，请重新输入！";
				$scope.isInuse = true;
			}else{
				$http({
					url: ApiMapper.ccApi + '/cc/check/password/' + $scope.user.npassword,
					method: 'GET',
					contentType: 'application/json',
					headers: { 'Passport': $cookies.Passport }
				}).success(function (data) {
					if (!data) {
						$scope.ErrorMassage="新密格式不正确，请重新输入！";
						$scope.isInuse = true;
					}else{
						//执行修改密码
						$http({
							url: ApiMapper.sApi + '/s/user/identity/'+ md5.createHash($scope.user.opassword || ''),
							method: 'PATCH',
							contentType: 'application/json',
							headers: { 'Passport': $cookies.Passport },
							data: { 'id': $scope.user.UserId, 'Password': md5.createHash($scope.user.npassword || '') }
						}).success(function (data) {
							if (data.StatusCode != 1) {
								alert(data.Messages);
							} else {
								alert("密码修改成功！");
								wx.closeWindow();
							}
						}).error(function (data) {
							alert(data.Messages);
						});
					}
				});
			}
		}
    };
    
    //忘记密码
    $scope.ForgetPassword = function () {
		if ($scope.user.npassword != "" && $scope.user.cpassword != "") {
			if ($scope.user.npassword != $scope.user.cpassword) {
				$scope.ErrorMassage="两次密码输入不一致，请重新输入！";
				$scope.isInuse = true;
			}else{
				$http({
					url: ApiMapper.ccApi + '/cc/check/password/' + $scope.user.npassword,
					method: 'GET',
					contentType: 'application/json',
					headers: { 'Passport': $cookies.Passport }
				}).success(function (data) {
					if (!data) {
						$scope.ErrorMassage="新密格式不正确，请重新输入！";
						$scope.isInuse = true;
					}else{
						//执行修改密码
						$http({
							url: ApiMapper.sApi + '/s/user/identity/update/' + $scope.user.UserId+'/'+md5.createHash($scope.user.npassword || ''),
							method: 'PATCH',
							contentType: 'application/json',
							headers: { 'Passport': $cookies.Passport }
						}).success(function (data) {
							if (data.StatusCode != 1) {
								alert(data.Messages);
							} else {
								alert("密码修改成功！");
								wx.closeWindow();
							}
						}).error(function(data){
							alert(data.Messages);
						});
					}
				});
			}
		}
    };
    //设定微信调用
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
                var String1 = "jsapi_ticket=" + ticket + "&noncestr=n580440&timestamp=1437377735&url=" + ApiMapper.PathStr + "apply_repair.html";
                window.localStorage.setItem($scope.AppId + "_signature", hex_sha1(String1)); //alert(String1);
                $scope.Load_WX();
            });
        });
    };
    $scope.Load_WX();
	//转向到忘记密码
	$scope.toForgetPwd = function(){
		$http({
			url: ApiMapper.sApi + '/s/user/identity/forget/' + $scope.user.UserId,
			method: 'GET',
			contentType: 'application/json',
			headers: { 'Passport': $cookies.Passport }
		}).success(function (data) {
			if (data.StatusCode != 1) {
				alert(data.Messages);
			} else {
				wx.closeWindow();
			}
		}).error(function(data){
			alert(data.Messages);
		});		
	};
}])
;