function AddEquipmentCtr($scope, $cookies, UnitId, Unit, $modalInstance, $http, $timeout, $q) {
    $scope.AppId = ApiMapper.AppId;
    $scope.Equipmentpos = [];
    $scope.TypeList = [];
    $scope.Passport = window.localStorage.getItem('Passport');
    $scope.CompanyId = $cookies.CompanyId;
    $scope.equipment = {
        "CompanyId": $scope.CompanyId,
        "UnitId": UnitId,
        "Unit": Unit,
        "EquipmentName": "", //设备名称
        "EquipmentCode": "",
        "EquipmentTypeClass": 0, //大类
        "EquipmentTypeId": "", //中类
        "EquipmentTypeName": "",
        "EquipmentSubTypeId": "", //小类
        "EquipmentSubTypeName": "",
        "IPositionIds": []
    };
    $scope.EquipmentTypeList = {
        'EquipmentTypeClass': [],
        'EquipmentTypeName': [],
        'EquipmentSubTypeName': []
    };

    //上传照片相关
    $scope.imagesList = {
        'localIds': [],
        'serverIds': []
    };
    $scope.MediasParamenter = {
        'Key': '',
        'FileSoure': 41,
        'Medias': {
            'image': [],
            'voice': []
        }
    };

    $scope.AddEquipmentResponse = {};
    $scope.isSubmit = false;

    function removeBlankOption() {
        setTimeout(function () {
            var Select2ResultLabels = document.querySelectorAll('.select2-result-label');
            for (var i = 0; i < Select2ResultLabels.length; i++) {
                if (Select2ResultLabels[i].textContent == '') {
                    Select2ResultLabels[i].remove();
                }
            }
        }, 0);
    }

    //获取设施全部分类
    $scope.GetEquipmentType = function () {
        $http({
            url: ApiMapper.sApi + '/s/equipmenttypes/company/' + $scope.equipment.UnitId,
            method: 'GET',
            contentType: 'application/json',
            headers: {
                'Passport': $scope.Passport
            }
        }).success(function (data) {
            $scope.EquipmentTypeList = data;
            console.log($scope.EquipmentTypeList);
        }).error(function () {});
    };
    $scope.GetEquipmentType();

    $scope.init = function () {
        setTimeout(function () {
            // 中类
            $('[name=TypeName]').select2({
                placeholder: "请选择中类"
            }).on("select2-opening", function () {
                removeBlankOption();
            }).on("select2-loaded", function () {
                removeBlankOption();
            });
            // 小类
            $('[name=SubTypeName]').select2({
                placeholder: "请选择小类"
            }).on("select2-opening", function () {
                removeBlankOption();
            }).on("select2-loaded", function () {
                removeBlankOption();
            });
            $('.select2-container').css('z-index', 999);

            $('[name=TypeName]').on("select2:select", function (e) {
                $scope.equipment.EquipmentTypeName = e.params.data.text;
                // 清除 小類
                $scope.equipment.EquipmentSubTypeId = '';
                $scope.equipment.EquipmentSubTypeName = '';
                $('[name=SubTypeName]').select2("val", $scope.equipment.EquipmentSubTypeId);
                $scope.$apply();
            });
            $('[name=SubTypeName]').on("select2:select", function (e) {
                $scope.equipment.EquipmentSubTypeName = e.params.data.text;
            });
        }, 0);

    };
    $scope.init();


    //获取区域
    $http({
        url: ApiMapper.sApi + '/s/equipmentpos',
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Passport': $scope.Passport
        },
        cache: false
    }).success(function (data) {
        $scope.Equipmentpos = eval(data);
        $timeout(function () {
            $("[name=Position]").select2({
                'placeholder': '设备区域'
            });
        }, 200);
    });

    $scope.setEquipmentTypeClass = function (item) {
        $scope.equipment.EquipmentTypeClass = item.EquipmentTypeClass;
        $scope.equipment.EquipmentTypeId = '';
        $scope.equipment.EquipmentSubTypeId = '';
        $scope.equipment.EquipmentTypeName = '';
        $scope.equipment.EquipmentSubTypeName = '';
        setTimeout(function(){
            $('[name=TypeName]').select2("val", $scope.equipment.EquipmentTypeId);
            $('[name=SubTypeName]').select2("val", $scope.equipment.EquipmentSubTypeId);
        }, 0);
    };

    $scope.chooseImage = function () {
        wx.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'],
            success: function (res) {
                $scope.imagesList.localIds = res.localIds;
                $scope.imagesList.serverIds = [];
                $scope.$apply();
                $timeout(function () {
                    $('#advPic01').attr({
                        'src': $scope.imagesList.localIds[0],
                        'width': '100px',
                        'height': '100px'
                    });
                }, 500);
            }
        });
    };
    $scope.RemoveImg = function (idx) {
        $scope.imagesList.localIds.splice(idx, 1);
    };

    //2.上传照片到微信
    $scope.createUploadImagePromise = function () {
        var UploadImageDefer = $q.defer();
        var UploadImagePromise = UploadImageDefer.promise;
        var i = 0;
        var length = $scope.imagesList.localIds.length;
        $scope.upload = function () {
            // 有照片就上傳
            if (length != 0) {
                setTimeout(function () {
                    wx.uploadImage({
                        localId: $scope.imagesList.localIds[i],
                        isShowProgressTips: 1,
                        success: function (res) {
                            i++;
                            $scope.imagesList.serverIds.push(res.serverId);
                            $scope.MediasParamenter.Medias.image.push(res.serverId);
                            if (i < length) {
                                // 继续上传
                                $scope.upload();
                            } else {
                                // 已全部上传完成
                                UploadImageDefer.resolve('Success');
                            }
                        }
                    });
                }, 100);
            } else {
                //没照片 
                setTimeout(function () {
                    UploadImageDefer.resolve('Success');
                }, 10);
            };
        };
        $scope.upload();
        return UploadImagePromise;
    };

    //3.新增
    $scope.createAddEquipmentPromise = function () {
        $scope.RegionId = [];
        if ($scope.Position.length > 0) {
            _($scope.Equipmentpos).each(function (Item) {
                if ($scope.Position.indexOf(Item.PositionId) >= 0) {
                    $scope.RegionId.push(Item.RegionId);
                    $scope.RegionId.push(Item.PositionId);
                }
            });
            $scope.equipment.IPositionIds = $scope.RegionId;
        };
        var params = {
            "CompanyId": $scope.equipment.CompanyId,
            "UnitId": $scope.equipment.UnitId,
            "Unit": $scope.equipment.Unit,
            "EquipmentName": $scope.equipment.EquipmentName, //设备名称
            "EquipmentCode": "",
            "EquipmentTypeClass": $scope.equipment.EquipmentTypeClass, //大类
            "EquipmentTypeId": $scope.equipment.EquipmentTypeId, //中类
            "EquipmentSubTypeId": $scope.equipment.EquipmentSubTypeId, //小类
            "IPositionIds": $scope.equipment.IPositionIds
        };

        var AddEquipmentDefer = $q.defer();
        var AddEquipmentPromise = AddEquipmentDefer.promise;

        $http({
                url: ApiMapper.sApi + '/s/equipment',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    'Passport': $scope.Passport
                },
                data: JSON.stringify(params),
            }).success(function (data) {
                if(data.Success){
                    $scope.AddEquipmentResponse = data;
                    AddEquipmentDefer.resolve('Success');
                }else{
                    alert(data.Messages);
                }
            })
            .error(function (data) {
                alert(data.Messages);
            });
        return AddEquipmentPromise;
    }

    //4.照片id与历程id写回自己伺服器
    $scope.createLoadMediasPromise = function (RequisitionId) {
        var LoadMediasPromiseDefer = $q.defer();
        var LoadMediasPromisePromise = LoadMediasPromiseDefer.promise;
        if ($scope.imagesList.serverIds.length > 0) {
            $scope.MediasParamenter.Key = $scope.AddEquipmentResponse.Messages;
            $http({
                url: ApiMapper.wxApi + '/wx/files/' + $scope.AppId,
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    'Passport': $scope.Passport
                },
                data: $scope.MediasParamenter
            }).success(function (data) {
                if (data != "Saved") {
                    $scope.isSubmit = false;
                    alert('上传照片失败！\n\r请联系580-440报修中心！');
                    return false;
                } else {
                    LoadMediasPromiseDefer.resolve('Success');
                }
            }).error(function (List, status) {
                $scope.isSubmit = false;
                alert('上传照片失败！\n\r请联系580-440报修中心！');
            });
        } else {
            LoadMediasPromiseDefer.resolve('Success');
        };
        return LoadMediasPromisePromise;
    };


    $scope.btnOk = function () {
        $scope.isSubmit = true;
        // 1.上传照片 Promise >> 2.新增设备 Promise>> 3.照片id回传自己的伺服器 Promise
        var UploadImagePromise = $scope.createUploadImagePromise();
        UploadImagePromise
            .then(function (data) {
                if (data == 'Success') {
                    console.log('AddEquipmentPromise Sucess');
                    var AddEquipmentPromise = $scope.createAddEquipmentPromise();
                    return AddEquipmentPromise;
                };
            })
            .then(function (data) {
                if (data == 'Success') {
                    console.log('AddHistoryPromise Sucess');
                    var LoadMediasPromise = $scope.createLoadMediasPromise();
                    return LoadMediasPromise;
                };
            })
            .then(function (data) {
                if (data == 'Success') {
                    $scope.isSubmit = false;
                    console.log('LoadMediasPromise Sucess');
                    $modalInstance.close('ok');
                };
            });
    };


    $scope.btnCancel = function () {
        $modalInstance.dismiss('cancel');
    };
};