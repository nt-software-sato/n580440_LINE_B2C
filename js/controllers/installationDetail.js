WeChat.controller('InstallationDetailCtrl', ['$scope', '$http', '$timeout', '$location', '$window', '$cookies', '$mdSidenav', '$mdUtil', '$filter', '$mdDialog',
    function ($scope, $http, $timeout, $location, $window, $cookies, $mdSidenav, $mdUtil, $filter, $mdDialog) {

        $scope.Passport = window.localStorage.getItem('Passport');
        $scope.AppId = ApiMapper.AppId;
        $scope.RequisitionId = getQueryString('RequisitionId');
        $scope.HistoryId = getQueryString('HistoryId');



        $scope.Data = {};
        $scope.CollapseState = true;
        $scope.tab = {
            status: 'note'
        }; // case , note


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

        // 獲取詳情
        $scope.getPlan = function () {
            $http({
                    url: ApiMapper.sApi + '/s/journal/new/detail/' + $scope.RequisitionId,
                    method: 'GET',
                    contentType: 'application/json',
                    headers: {
                        'Passport': $cookies.Passport
                    }
                })
                .success(function (data) {
                    console.log(data);
                    $scope.Data = data;
                    $scope.Data.Journal.EstStartTime = FormatDate($scope.Data.Journal.EstStartTime);
                    $scope.Data.Journal.EstEndTime = FormatDate($scope.Data.Journal.EstEndTime);
                    $scope.Data.RequisitionsJournals.forEach(function (item) {
                        item.SelectDate = FormatDate(item.SelectDate);
                    });
                })
                .error(function (msg) {
                    alert(JSON.stringify(msg));
                });
        };
        $scope.getPlan();

        // 看相片
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


        $scope.openNote = function (rId, Id) {
            $mdDialog.show({
                    controller: NoteDetailController,
                    templateUrl: 'app/Dialog/installNote.templ.html',
                    locals: {
                        params: {
                            'Passport': window.localStorage.getItem('Passport'),
                            'PageTitle': $(document).find("title").text(),
                            'rId': rId,
                            'Id': Id
                        }
                    }
                })
                .then(function (result) {}, function () {});
        };

        // 從訊息打開日誌
        if ($scope.HistoryId !== '' && $scope.HistoryId !== null) {
            $scope.openNote($scope.RequisitionId, $scope.HistoryId);
        };

    }
]);


function NoteDetailController($scope, $mdDialog, params, $http, $timeout, $q, $sce, $filter) {
    $scope.Passport = window.localStorage.getItem('Passport');
    $scope.AppId = ApiMapper.AppId;
    $scope.rId = params.rId;
    $scope.Id = params.Id;
    $scope.Note = {};
    $scope.imgList = [];

    $scope.getNote = function () {
        $http({
                url: ApiMapper.sApi + '/s/journal/new/d/' + $scope.rId + '/' + $scope.Id,
                method: 'Get',
                contentType: 'application/json',
                headers: {
                    'Passport': $scope.Passport
                }
            }).success(function (data) {
                $scope.Note = data;
                $scope.Note.SelectDay = $filter('date')(new Date($scope.Note.SelectDay), 'yyyy/MM/dd');
                if ($scope.Note.Thumnails.length > 0) {
                    $scope.Note.Thumnails.forEach(function (item) {
                        item.FilePath = ApiMapper.FileApi + '/' + item.FilePath;
                        item.img = ApiMapper.ccApi + '/cc/image/' + item.Id;
                    });
                };
            })
            .error(function (error) {
                alert(error.Messages);
            })
    };
    $scope.getNote();

    $scope.change_title = function (title) {
        var $body = $('body');
        document.title = title;
        var $iframe = $('<iframe src="/favicon.ico"></iframe>');
        $iframe
            .on('load',
                function () {
                    setTimeout(function () {
                        $iframe.off('load').remove();
                    }, 0);
                })
            .appendTo($body);
    };

    // 看相片
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

    //轉換sql換行符號
    $scope.deliberatelyTrustDangerousSnippet = function (snippet) {
        var return_data = '';
        if (snippet != null) {
            return_data = snippet.replace(/\n/g, "<br/>");
        } else {
            return_data = '';
        }
        return $sce.trustAsHtml(return_data);
    };

    $scope.cancel = function () {
        $scope.change_title(params.PageTitle);
        $mdDialog.cancel();
    };

};