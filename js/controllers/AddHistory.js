/*
    2018/04/26 add
    AddHistoryController 增加歷程Ctrl
*/
function AddHistoryController($scope, $mdDialog, $mdSidenav, params, $http, $timeout, $q, $modal) {
  var Passport = window.localStorage.getItem('Passport');
  var CompamyId = window.localStorage.getItem('CompamyId');
  $scope.StoreUser = window.localStorage.getItem('StoreUser');
  $scope.AppId = ApiMapper.AppId;
  $scope.RepairInfo = params.RepairInfo;
  $scope.CauseList = params.CauseList;
  $scope.Equipmentpos = params.Equipmentpos;
  $scope.CaseType = params.CaseType;
  $scope.EstArrival = {
    Date: '',
    Time: ''
  };
  $scope.StoreList = [];
  $scope.AddHistoryResponse = {};
  $scope.EquipmentList = [{
    'EquipmentTypeClass': 0,
    'ClassName': '设备',
    'children': []
  }, {
    'EquipmentTypeClass': 1,
    'ClassName': '设施',
    'children': []
  }, {
    'EquipmentTypeClass': 2,
    'ClassName': '资讯',
    'children': []
  }, {
    'EquipmentTypeClass': 99,
    'ClassName': '其它',
    'children': []
  }];
  $scope.Parameters = {
    'RequisitionId': $scope.RepairInfo.RequisitionId,
    'StageId': $scope.CaseType.stageId,
    'CallInOrOut': 1, //0:来电 , 1:去电   9:B2B/数据交换
    'IsConnect': 1,
    'EstArrivalTime': '',
    'Remark': '',
    'Mail2Store': 0,
    'Mail2Maintainer': 0,
    'Sms2Maintainer': 0,
    'MailList': '',
    'SmsList': '',
    'MaintainerId': '',
    'MaintainerName': '',
    'StrongholdId': '',
    'StrongholdName': '',
    'StrongholdInfo': ''
  };
  $scope.MoveParameters = {
    "RequisitionId": $scope.RepairInfo.RequisitionId,
    "MoveType": 1,
    "IsMove": false,
    "IsClose": false,
    "SourceId": "",
    "Source": "",
    "TargetId": "",
    "Target": "",
    "Remark": "",
    "EquipmentName": "点击选择调拨设备",
    "EquipmentId": ""
  };
  // 王品 5/23
  $scope.isShowArea = false;
  $scope.isWPStoreUser = false;
  $scope.IsShowToScanQRCode = false;
  $scope.IsShowAddCause = false;
  $scope.IsWPStylePriorityList = false;
  // 王品 5/23
  $scope.isWPStoreUser = true;
  $scope.IsUItoWP = true;
  var Client_Permissions = ["f96f98e2-38f9-456a-9813-82d899536a82", "eb296708-6fc6-43f0-b506-0ca0fa91e1cd", "6c690014-2571-48db-ac5a-c6ba2572a3bb", "c1a24352-46a1-4301-9b96-a67c92691336", "C4B0E179-8121-487E-AA63-59635ACF2447"];
  if (Client_Permissions.indexOf($scope.RepairInfo.CompanyId) > -1) {
    $scope.IsAutoSetPosition = true;
  };
  //获取单位资料
  $scope.GetStore = function() {
    $http({
      url: ApiMapper.sApi + '/s/unit/maps',
      method: 'GET',
      cache: true,
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      }
    }).success(function(Unitdata) {
      $scope.Unitdata = Unitdata;
      // alert(JSON.stringify($scope.Unitdata));
      _.forEach(Unitdata[1], function(Item1) {
        $scope.UnitLeve4data = [];
        Item1.isSelected = false;
        _.forEach(Unitdata[3], function(Item2) {
          $scope.UnitLeve4data.push(Item2);
          if (Item2.Level2 == Item1.UnitId) {
            Item2.Level2Name = Item1.Unit;
            Item2.isSelected = false;
          }
        });
        $scope.StoreList.push(Item1);
      });
    }).error(function(status) {
      alert("获取部门信息错误！");
    });
  };
  $scope.GetStore();
  //获取设备/设施
  $scope.GetEquipment = function(UnitId) {
    var parameterStr = {
      'UnitId': UnitId,
      'TopicType': 1,
      'Maintenance': 0
    };
    if ($scope.RepairInfo.CompanyId == "eb296708-6fc6-43f0-b506-0ca0fa91e1cd" || $scope.RepairInfo.CompanyId == "6c690014-2571-48db-ac5a-c6ba2572a3bb" || $scope.RepairInfo.CompanyId == "c1a24352-46a1-4301-9b96-a67c92691336") {
      parameterStr.TopicType = 3;
      $scope.EquipmentList[0] = {
        'EquipmentTypeClass': 0,
        'ClassName': '设备',
        'children': []
      };
      $scope.EquipmentList[1] = {
        'EquipmentTypeClass': 1,
        'ClassName': '设施',
        'children': []
      };
      $scope.GetFacilities(UnitId); //获取设施列表
    };
    $http({
      url: ApiMapper.sApi + '/s/equipment/classification',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      },
      data: JSON.stringify(parameterStr)
    }).success(function(data) {
      if ($scope.RepairInfo.CompanyId == "eb296708-6fc6-43f0-b506-0ca0fa91e1cd" || $scope.RepairInfo.CompanyId == "6c690014-2571-48db-ac5a-c6ba2572a3bb" || $scope.RepairInfo.CompanyId == "c1a24352-46a1-4301-9b96-a67c92691336") {
        $scope.EquipmentList[0].children = data;
        // _($scope.EquipmentList[0].children).each(function (Item) {
        //     Item.ClassName = Item.EquipmentTypeName;
        // });
      } else {
        $scope.EquipmentList = [{
          'EquipmentTypeClass': 0,
          'ClassName': '设备',
          'children': []
        }, {
          'EquipmentTypeClass': 1,
          'ClassName': '设施',
          'children': []
        }, {
          'EquipmentTypeClass': 2,
          'ClassName': '资讯',
          'children': []
        }, {
          'EquipmentTypeClass': 99,
          'ClassName': '其它',
          'children': []
        }];
        _.each(data, function(Items) {
          var EquipmentList = Items.children;
          _.each(EquipmentList, function(Lists) {
            Lists.EquipmentTypeName = Items.EquipmentTypeName;
            var EquipmentCode = Lists.EquipmentCode.split('-');
            Lists.SortNo = parseInt(EquipmentCode[1]);
            $scope.EquipmentList.forEach(function(equipmentType, index) {
              if (equipmentType.EquipmentTypeClass == Lists.EquipmentTypeClass) {
                $scope.EquipmentList[index].children.push(Lists);
              };
            });
          });
        });
        _.each($scope.EquipmentList, function(Item) {
          Item.children = _.sortBy(Item.children, 'SortNo');
        });
      }
      console.log($scope.EquipmentList);
    });
  };
  //获取王品设施列表
  $scope.GetFacilities = function(UnitId) {
    var parameterStr = {
      'UnitId': UnitId,
      'TopicType': 4,
      'Maintenance': 0
    };
    $http({
      url: ApiMapper.sApi + '/s/equipment/classification',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      },
      data: JSON.stringify(parameterStr)
    }).success(function(res) {
      _.each(res, function(Items) {
        var EquipmentList = Items.children;
        _.each(EquipmentList, function(Lists) {
          Lists.EquipmentTypeName = Items.EquipmentTypeName;
          var EquipmentCode = Lists.EquipmentCode.split('-');
          Lists.SortNo = parseInt(EquipmentCode[1]);
          $scope.EquipmentList[1].children.push(Lists);
        });
      });
    });
  };
  //选择设备帶入地區資料
  $scope.ShowArea = function(Equipment, PositionByTypeEquipmentTypeName) {
    $scope.MoveParameters.EquipmentId = Equipment.EquipmentId;
    $scope.MoveParameters.EquipmentName = Equipment.EquipmentName;
    $scope.closeDenav('Area');
  };
  $scope.isSelectLeve2 = function(UnitItem) {
    _($scope.Unitdata[1]).each(function(Item) {
      Item.isSelected = false;
      if (Item.UnitId == UnitItem.UnitId) {
        UnitItem.isSelected = !UnitItem.isSelected;
      }
    });
    if (UnitItem.isSelected) {
      $scope.AreaIds = [UnitItem.UnitId];
      $scope.ProvinceIds = [];
    }
    $scope.UnitLeve3data = _($scope.Unitdata[2]).filter(function(Item) {
      return Item.Level2 == UnitItem.UnitId;
    });
  };
  $scope.isSelectLeve3 = function(UnitItem) {
    _($scope.Unitdata[2]).each(function(Item) {
      Item.isSelected = false;
      if (Item.UnitId == UnitItem.UnitId) {
        UnitItem.isSelected = !UnitItem.isSelected;
      }
    });
    if (UnitItem.isSelected) {
      $scope.ProvinceIds = [UnitItem.UnitId];
    }
  };
  $scope.reLoadLeve4 = function() {
    $scope.UnitLeve4data = _($scope.Unitdata[3]).filter(function(Item) {
      if ($scope.ProvinceIds.length > 0) {
        return Item.Level3 == $scope.ProvinceIds[0];
      } else {
        return Item.Level2 == $scope.AreaIds[0];
      }
    });
  };
  $scope.isSelectLeve4 = function(UnitItem) {
    _.each($scope.UnitLeve4data, function(Item) {
      Item.isSelected = false;
      if (Item.UnitId == UnitItem.UnitId) {
        UnitItem.isSelected = !UnitItem.isSelected;
      }
    });
    if (UnitItem.isSelected) { //將門店資料帶回
      if ($scope.denavTag == "Target") {
        $scope.MoveParameters.TargetId = UnitItem.UnitId;
        $scope.MoveParameters.Target = UnitItem.Unit;
      } else {
        $scope.MoveParameters.SourceId = UnitItem.UnitId;
        $scope.MoveParameters.Source = UnitItem.Unit;
        $scope.GetEquipment($scope.MoveParameters.SourceId);
      }
    }
  };
  //上传照片相关
  $scope.imagesList = {
    'localIds': [],
    'serverIds': []
  };
  $scope.MediasParamenter = {
    'Key': '',
    'FileSoure': 40,
    'Medias': {
      'image': [],
      'voice': []
    }
  };
  // 修改标题
  $scope.change_title = function(title) {
    var $body = $('body');
    document.title = title;
    var $iframe = $('<iframe src="/favicon.ico"></iframe>');
    $iframe.on('load', function() {
      setTimeout(function() {
        $iframe.off('load').remove();
      }, 0);
    }).appendTo($body);
  };
  $scope.chooseImage = function() {
    wx.chooseImage({
      sourceType: ['album', 'camera'],
      success: function(res) {
        if ($scope.imagesList.localIds.length > 0) {
          Array.prototype.push.apply($scope.imagesList.localIds, res.localIds);
        } else {
          $scope.imagesList.localIds = res.localIds;
        }
        $scope.imagesList.serverIds = [];
        $scope.$apply();
        $timeout(function() {
          _($scope.imagesList.localIds).each(function(Item, i) {
            $('#advPic' + i).attr({
              'src': Item,
              'width': '72px',
              'height': '72px'
            });
          });
        }, 500);
      }
    });
  };
  $scope.RemoveImg = function(idx) {
    $scope.imagesList.localIds.splice(idx, 1);
  };
  $scope.SetCallinOrOut = function(StageId, StageName) {
    $scope.change_title(StageName + '进度');
    $scope.Parameters.StageId = StageId;
    $scope.Parameters.CallInOrOut = 1; // 去电
    $scope.Parameters.IsConnect = 1; // 接通
    $scope.EstArrival = {
      Date: '',
      Time: ''
    };
    $scope.Parameters.Mail2Store = 0; //通知门店mail
    $scope.Parameters.Mail2Maintainer = 0; //通知厂商mail
    $scope.Parameters.Sms2Maintainer = 0; //通知sms 1/2
    $scope.Parameters.MailList = "";
    $scope.Parameters.SmsList = "";
    // 30,'联系厂商(B)'  31,'追踪厂商'  34,'取消派工'
    if ($scope.Parameters.StageId == 30) {
      $scope.isExchange = true;
      if ($scope.Parameters.StrongholdId != null && $scope.Parameters.StrongholdId != "") {
        $scope.GetMaintainerInfo();
      };
    } else {
      $scope.isExchange = false;
      $scope.Parameters.IsB2bStaff = 0;
      $scope.Parameters.IsEdiStaff = 0;
    };
    console.log($scope.RepairInfo)
    if ($scope.RepairInfo.CompanyId == 'c1a24352-46a1-4301-9b96-a67c92691336') {
      $scope.Parameters.IsB2bStaff = 1;
    }
  };
  //设定mail和sms  select2
  $scope.SetInputStyle = function() {
    $scope.Parameters.SmsList = '';
    $scope.Parameters.MailList = '';
    $scope.MailLists = _($scope.MailLists).map(function(Items) {
      return {
        'id': Items.Id,
        'text': Items.Text
      };
    });
    $scope.SmsLists = _($scope.SmsLists).map(function(Items) {
      return {
        'id': Items.Id,
        'text': Items.Text
      };
    });
    setTimeout(function() {
      $("[name=MailLists]").select2({
        tags: true,
        placeholder: 'Mail地址',
        data: $scope.MailLists
      });
      $("[name=SmsLists]").select2({
        tags: true,
        placeholder: 'SMS通知号码',
        data: $scope.SmsLists
      });
    }, 0);
  };
  // 獲取廠商聯絡資訊
  $scope.GetMaintainerInfo = function() {
    $http({
      url: ApiMapper.sApi + '/s/punit/' + $scope.Parameters.MaintainerId + '/' + $scope.Parameters.StrongholdId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      }
    }).success(function(data) {
      var StrongholdInfo = $scope.Parameters.MaintainerName + '-' + $scope.Parameters.StrongholdName + "\n 联系人：";
      if (data.Liaison !== null) {
        if (data.Liaison.length > 0) {
          _(data.Liaison).each(function(Item) {
            if (Item.Name != null && Item.Name != "") {
              StrongholdInfo += Item.Name.toString();
            };
            if (Item.PhoneNo != null && Item.PhoneNo != "") {
              StrongholdInfo += "  联系电话：" + Item.PhoneNo.toString() + "\n";
            };
          });
        };
      };
      $scope.Parameters.StrongholdInfo = StrongholdInfo;
      $scope.Parameters.Remark = StrongholdInfo;
    }).error(function(data) {
      console.log(data);
    });
    $scope.GetStrongholdInfo($scope.Parameters.MaintainerId, $scope.Parameters.StrongholdId);
  };
  // 獲取據點資訊
  $scope.GetStrongholdInfo = function(MaintainerId, StrongholdId) {
    $http({
      url: ApiMapper.sApi + '/s/punit/cr/' + MaintainerId + '/' + StrongholdId,
      method: 'GET',
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      },
      cache: false
    }).success(function(data) {
      $scope.Maintainer = data[0];
      $scope.Stronghold = data[1];
      $scope.SmsLists = [];
      $scope.MailLists = [];
      if ($scope.Maintainer != undefined && $scope.Maintainer != "undefined") {
        if ($scope.Maintainer.Liaison != null && $scope.Maintainer.Liaison != "null") {
          if ($scope.Maintainer.Liaison.length > 0) {
            _($scope.Maintainer.Liaison).each(function(item) {
              if (item.PhoneNo != null && item.PhoneNo != "") {
                if (!_($scope.SmsLists).some(function(Item) {
                    return Item.Id == item.PhoneNo;
                  })) {
                  $scope.SmsLists.push({
                    'Id': item.PhoneNo,
                    'Text': item.Name + '<' + item.PhoneNo + '>'
                  });
                }
              }
              if (item.Email != null && item.Email != "" && item.Email != " ") {
                if (!_($scope.MailLists).some(function(Item) {
                    return Item.Id == item.Email;
                  })) {
                  $scope.MailLists.push({
                    'Id': item.Email,
                    'Text': $scope.Maintainer.Unit + '<' + item.Email + '>'
                  });
                }
              }
            });
          }
        };
        if ($scope.Maintainer.Users != null && $scope.Maintainer.Users != "null") {
          _($scope.Maintainer.Users).each(function(UserInfo) {
            var ContactInfo = UserInfo.ContactInfo;
            var tempForPhoneNo = '';
            var tempForEmail = '';
            _(ContactInfo).each(function(ContactItem) {
              if (ContactItem.Type == 1) {
                tempForPhoneNo = ContactItem.Info;
                if (!_($scope.SmsLists).some(function(Item) {
                    return Item.Id == tempForPhoneNo;
                  })) {
                  $scope.SmsLists.push({
                    'Id': tempForPhoneNo,
                    'Text': UserInfo.UserName + '<' + tempForPhoneNo + '>'
                  });
                }
              } else if (ContactItem.Type == 0) {
                tempForEmail = ContactItem.Info;
                if (!_($scope.MailLists).some(function(Item) {
                    return Item.Id == tempForEmail;
                  })) {
                  $scope.MailLists.push({
                    'Id': tempForEmail,
                    'Text': UserInfo.UserName + '<' + tempForEmail + '>'
                  });
                }
              }
            });
          });
        };
      };
      if ($scope.Stronghold != undefined && $scope.Stronghold != "undefined") {
        if ($scope.Stronghold.Liaison != null && $scope.Stronghold.Liaison != "null") {
          if ($scope.Stronghold.Liaison.length > 0) {
            _($scope.Stronghold.Liaison).each(function(item) {
              if (item.PhoneNo != null && item.PhoneNo != "") {
                if (!_($scope.SmsLists).some(function(Item) {
                    return Item.Id == item.PhoneNo;
                  })) {
                  $scope.SmsLists.push({
                    'Id': item.PhoneNo,
                    'Text': item.Name + '<' + item.PhoneNo + '>'
                  });
                }
              }
              if (item.Email != null && item.Email != "" && item.Email != " ") {
                if (!_($scope.MailLists).some(function(Item) {
                    return Item.Id == item.Email;
                  })) {
                  $scope.MailLists.push({
                    'Id': item.Email,
                    'Text': $scope.Stronghold.Unit + '<' + item.Email + '>'
                  });
                }
              }
            });
          }
        }
        if ($scope.Stronghold.Users != null && $scope.Stronghold.Users != "null") {
          _($scope.Stronghold.Users).each(function(UserInfo) {
            var ContactInfo = UserInfo.ContactInfo;
            var tempForPhoneNo = "";
            var tempForEmail = "";
            _(ContactInfo).each(function(ContactItem) {
              if (ContactItem.Type == 1) {
                tempForPhoneNo = ContactItem.Info;
                if (!_($scope.SmsLists).some(function(Item) {
                    return Item.Id == tempForPhoneNo;
                  })) {
                  $scope.SmsLists.push({
                    'Id': tempForPhoneNo,
                    'Text': UserInfo.UserName + '<' + tempForPhoneNo + '>'
                  });
                }
              } else if (ContactItem.Type == 0) {
                tempForEmail = ContactItem.Info;
                if (!_($scope.MailLists).some(function(Item) {
                    return Item.Id == tempForEmail;
                  })) {
                  $scope.MailLists.push({
                    'Id': tempForEmail,
                    'Text': UserInfo.UserName + '<' + tempForEmail + '>'
                  });
                }
              }
            });
          });
        }
      };
      $scope.SetInputStyle();
    });
  };
  // 初始化
  $scope.init = function() {
    setTimeout(function() {
      $('.md-dialog-container').css('z-index', 1000);
      $("md-dialog").eq(0).removeAttr("tabindex");
      $('input[name="EstArrivalDate"]').daterangepicker({
        singleDatePicker: true,
        showDropdowns: false,
        format: 'YYYY/MM/DD'
      });
    }, 0);
    if ($scope.RepairInfo.MaintainerInfo.MaintainerId != null && $scope.RepairInfo.MaintainerInfo.MaintainerId != "" && $scope.RepairInfo.MaintainerInfo.MaintainerId != "None") {
      $scope.Parameters.MaintainerId = $scope.RepairInfo.MaintainerInfo.MaintainerId;
      $scope.Parameters.MaintainerName = $scope.RepairInfo.MaintainerInfo.MaintainerName;
      $scope.Parameters.StrongholdId = $scope.RepairInfo.MaintainerInfo.StrongholderId;
      $scope.Parameters.StrongholdName = $scope.RepairInfo.MaintainerInfo.StrongholderName;
      $scope.Parameters.StrongholdInfo = $scope.RepairInfo.MaintainerInfo.StrongholdInfo;
    };
    $scope.SetCallinOrOut($scope.Parameters.StageId, $scope.CaseType.name);
    $scope.GetStrongholdInfo($scope.Parameters.MaintainerId, $scope.Parameters.StrongholdId);
  };
  $scope.init();
  $scope.SetSendflag = function(FLAG) {
    switch (FLAG) {
      case 'Mail2Store':
        // 通知门店
        $scope.Parameters.Mail2Store = $scope.Parameters.Mail2Store == 0 ? 1 : 0;
        break;
      case 'Mail2Maintainer':
        // 通知厂商-邮件
        $scope.Parameters.Mail2Maintainer = $scope.Parameters.Mail2Maintainer == 0 ? 1 : 0;
        break;
      case 'Sms2MaintainerA':
        // 通知厂商-短信A
        $scope.Parameters.Sms2Maintainer = $scope.Parameters.Sms2Maintainer == 1 ? 0 : 1;
        break;
      case 'Sms2MaintainerB':
        // 通知厂商-短信B
        $scope.Parameters.Sms2Maintainer = $scope.Parameters.Sms2Maintainer == 2 ? 0 : 2;
        break;
    }
  };
  $scope.openMaintainer = function() {
    var MaintainerModalInstance = $modal.open({
      animation: true,
      templateUrl: 'app/CaseList/SearchGroup/Search_maintainer.html',
      controller: SelectMaintainerCtl,
      windowClass: 'SelectMaintainer',
      size: 'md'
    });
    MaintainerModalInstance.result.then(function(result) {
      $scope.Parameters.MaintainerId = result.CompanyId;
      $scope.Parameters.MaintainerName = result.CompanyName;
      $scope.Parameters.StrongholdId = result.UnitId;
      $scope.Parameters.StrongholdName = result.Unit;
      $scope.GetMaintainerInfo();
    }, function() {});
  };
  //2.上传照片到微信
  $scope.createUploadImagePromise = function() {
    var UploadImageDefer = $q.defer();
    var UploadImagePromise = UploadImageDefer.promise;
    var i = 0;
    var length = $scope.imagesList.localIds.length;
    $scope.upload = function() {
      // 有照片就上傳
      if (length != 0) {
        setTimeout(function() {
          wx.uploadImage({
            localId: $scope.imagesList.localIds[i],
            isShowProgressTips: 1,
            success: function(res) {
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
        setTimeout(function() {
          UploadImageDefer.resolve('Success');
        }, 10);
      };
    };
    $scope.upload();
    return UploadImagePromise;
  };
  //3.写历程
  $scope.createAddHistoryPromise = function() {
    var AddHistoryDefer = $q.defer();
    var AddHistoryPromise = AddHistoryDefer.promise;
    $http({
      url: ApiMapper.sApi + '/s/rez/history',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      },
      data: $scope.Parameters
    }).success(function(data) {
      $scope.AddHistoryResponse = data;
      AddHistoryDefer.resolve('Success');
    }).error(function(data) {
      alert(data.Messages);
    });
    return AddHistoryPromise;
  }
  //4.照片id与历程id写回自己伺服器
  $scope.createLoadMediasPromise = function(RequisitionId) {
    var LoadMediasPromiseDefer = $q.defer();
    var LoadMediasPromisePromise = LoadMediasPromiseDefer.promise;
    if ($scope.imagesList.serverIds.length > 0) {
      $scope.MediasParamenter.Key = $scope.AddHistoryResponse.Messages;
      $http({
        url: ApiMapper.wxApi + '/wx/files/' + $scope.AppId,
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'Passport': Passport
        },
        data: $scope.MediasParamenter
      }).success(function(data) {
        if (data != "Saved") {
          $scope.isSubmit = false;
          alert('上传照片失败！\n\r请联系580-440报修中心！');
          return false;
        } else {
          LoadMediasPromiseDefer.resolve('Success');
        }
      }).error(function(List, status) {
        $scope.isSubmit = false;
        alert('上传照片失败！\n\r请联系580-440报修中心！');
      });
    } else {
      LoadMediasPromiseDefer.resolve('Success');
    };
    return LoadMediasPromisePromise;
  };
  $scope.denavTag = "Source";
  $scope.toggleRight = function(navID) {
    $mdSidenav(navID).toggle();
  };
  //调拨来源部门选择
  $scope.openDenav = function(navID) {
    $scope.denavTag = navID;
    $mdSidenav("Store").toggle();
  };

  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function() {
      $mdSidenav(navID).then(function() {});
    }, 300);
    return debounceFn;
  };
  //關閉頁面
  $scope.closeDenav = function(navID) {
    $scope.swipeState = false;
    $mdSidenav(navID).close().then(function(e) {
      if (navID == "Store") {
        _.each($scope.UnitLeve4data, function(Item) {
          Item.isSelected = false;
        });
      }
    });
  };
  //新增调拨单
  $scope.addAllot = function(tag) {
    var msg = "调拨单";
    var allotParameters = {
      "RequisitionId": $scope.MoveParameters.RequisitionId,
      "MoveType": 1,
      "IsClose": $scope.MoveParameters.IsClose,
      "SourceId": $scope.MoveParameters.SourceId,
      "Source": $scope.MoveParameters.Source,
      "TargetId": $scope.MoveParameters.TargetId,
      "Target": $scope.MoveParameters.Target,
      "EquipmentId": $scope.MoveParameters.EquipmentId,
      "EquipmentName": $scope.MoveParameters.EquipmentName,
      "Remark": $scope.MoveParameters.Remark
    };
    if (tag === "allot") { //调拨
      allotParameters.TargetId = $scope.RepairInfo.UnitId; //设定目的地为当前报修门店
      allotParameters.Target = $scope.RepairInfo.Unit;
      if ($scope.MoveParameters.IsClose && !$scope.MoveParameters.IsMove) {
        allotParameters.IsClose = true;
      }
    } else {
      //转移调拨单，变更来源门店为当前 报修门店，设备为当前报修设备
      allotParameters.SourceId = $scope.RepairInfo.UnitId;
      allotParameters.Source = $scope.RepairInfo.Unit;
      allotParameters.EquipmentId = $scope.RepairInfo.EquipmentId;
      allotParameters.EquipmentName = $scope.RepairInfo.EquipmentName;
      if ($scope.MoveParameters.isClosed) {
        allotParameters.IsClose = true;
      }
    }
    if (allotParameters.TargetId == "") {
      $scope.isSubmit = false;
      alert("请选择调拨目的地!");
    } else if (allotParameters.TargetId == allotParameters.SourceId) {
      $scope.isSubmit = false;
      alert("调拨目的地和来源门店不能相同!");
    } else {
      //格式化备注:添加设备和调拨来源,目的地
      var remark = $scope.MoveParameters.Remark;
      remark += "<br>调拨设备:" + allotParameters.EquipmentName;
      remark += "<br>来源门店:" + allotParameters.Source;
      remark += "<br>目的地:" + allotParameters.Target;
      allotParameters.Remark = remark;
      $http({
        url: ApiMapper.sApi + '/s/moveOder/create',
        method: 'POST',
        contentType: 'application/json',
        headers: {
          'Passport': Passport
        },
        data: allotParameters
      }).success(function(data) {
        if ($scope.MoveParameters.IsMove && tag === "allot") {
          $scope.addAllot("Move");
        } else {
          $scope.IsSubmit = false;
          setTimeout(function() {
            $scope.change_title(params.PageTitle);
            $mdDialog.hide({
              RequisitionId: $scope.RepairInfo.RequisitionId
            });
          }, 0);
        };
        $scope.isSubmit = false;
        alert("调拨成功！详情请至调拨列表查看。");
        console.log('LoadMediasPromise Sucess');
      }).error(function(data) {
        $scope.isSubmit = false;
        alert(data.Messages);
      });
    }
  };
  $scope.ok = function() {
    $scope.isSubmit = true;
    //设备调拨
    // if ($scope.Parameters.StageId == 60) {
    //   if ($scope.MoveParameters.TargetId == "") {
    //     $scope.isSubmit = false;
    //     alert("请选择调拨目的地!");
    //   } else if ($scope.MoveParameters.TargetId == $scope.MoveParameters.SourceId) {
    //     $scope.isSubmit = false;
    //     alert("调拨目的地和来源门店不能相同!");
    //   } else {
    //     $http({
    //       url: ApiMapper.sApi + '/s/moveOder/create',
    //       method: 'POST',
    //       contentType: 'application/json',
    //       headers: {
    //         'Passport': Passport
    //       },
    //       data: $scope.MoveParameters
    //     }).success(function (data) {
    //       $scope.isSubmit = false;
    //       alert("调拨成功！详情请至调拨列表查看。");
    //       console.log('LoadMediasPromise Sucess');
    //       setTimeout(function () {
    //         $scope.change_title(params.PageTitle);
    //         $mdDialog.hide({
    //           RequisitionId: $scope.RepairInfo.RequisitionId
    //         });
    //       }, 0);
    //     }).error(function (data) {
    //       $scope.isSubmit = false;
    //       alert(data.Messages);
    //     });
    //   }
    // }
    if ($scope.Parameters.StageId == 60) {
      $scope.addAllot("allot");
    } else {
      $scope.EstArrival.Date = $('input[name="EstArrivalDate"]').val();
      //预计到店
      var myDate = new Date($scope.EstArrival.Date);
      var _YY = myDate.getFullYear();
      var _MM = myDate.getMonth() + 1;
      var _DD = myDate.getDate();
      var myTime = new Date($scope.EstArrival.Time);
      var _hh = myTime.getHours();
      var _mm = myTime.getMinutes();
      var _ss = myTime.getSeconds();
      if ($scope.EstArrival.Time == null || $scope.EstArrival.Time == '') {
        _hh = '00';
        _mm = '00';
        _ss = '00';
      };
      _EstArrival = '' + _YY + '/' + _MM + '/' + _DD + ' ' + _hh + ':' + _mm + ':' + _ss;
      // 有填寫預計時間就要檢查
      if ($scope.EstArrival.Date !== null && $scope.EstArrival.Date !== '') {
        if (ValidtorTime(_EstArrival, GetNow()) && $scope.Parameters.StageId != 34) {
          alert('预计到店时间必须晚于当前时间！');
          $scope.isSubmit = false;
          return false;
        } else if (!ValidtorTime($scope.RepairInfo.DateB, _EstArrival) && $scope.Parameters.StageId != 34 && $scope.Parameters.StageId != 30) {
          alert('预计到店时间必须晚于派工时间！');
          $scope.isSubmit = false;
          return false;
        } else {
          $scope.Parameters.EstArrivalTime = _EstArrival;
        };
      };
      //判断进度说明
      if ($scope.Parameters.Remark == "" || $scope.Parameters.Remark == null) {
        if ($scope.Parameters.StageId == -97 || $scope.Parameters.StageId == -98) {
          alert('请输入申诉内容！');
        } else {
          alert('请输入进度说明！');
        };
        $scope.isSubmit = false;
        return false;
      };
      //追踪厂商31、取消派工34判断是否联系厂商
      if ($scope.Parameters.StageId == 31 || $scope.Parameters.StageId == 34) {
        if ($scope.RepairInfo.DateB == "null" || $scope.RepairInfo.DateB == null || $scope.RepairInfo.DateB == '') {
          alert('没有联系厂商，不能新增追踪厂商和取消派工的记录！');
          $scope.isSubmit = false;
          return false;
        };
      };
      //联系厂商B 30 廠商必選
      if ($scope.Parameters.StageId == 30) {
        if ($scope.Parameters.MaintainerId == null || $scope.Parameters.MaintainerId == "" || $scope.Parameters.StrongholdId == null || $scope.Parameters.StrongholdId == "") {
          alert("请选择维修厂商和据点！");
          $scope.isSubmit = false;
          return false;
        };
      };
      //判断通知发送对象
      if ($scope.Parameters.Mail2Maintainer == 1 && $scope.Parameters.MailList == "") {
        alert("请输入Mail发送邮箱对象！");
        $scope.isSubmit = false;
        return false;
      } else { };
      if ($scope.Parameters.Sms2Maintainer != 0 && $scope.Parameters.SmsList == "") {
        alert("请输入短信发送对象手机号码！");
        $scope.isSubmit = false;
        return false;
      };
      //通知门店Email
      if ($scope.Parameters.Mail2Store == 1 && $scope.Parameters.StageId != 89 && $scope.Parameters.StageId != -100 && $scope.Parameters.StageId != 100 && $scope.Parameters.StageId != 34 && $scope.Parameters.StageId != 92) {
        if ($scope.Parameters.EstArrivalTime == null || $scope.Parameters.EstArrivalTime == "") {
          alert("请选择预计到店时间！");
          $scope.isSubmit = false;
          return false;
        };
      };
      //判断是否为数据交换
      if ($scope.Parameters.CallInOrOut == 10) {
        $scope.Parameters.IsConnect = 1;
      };
      $scope.Parameters.SmsList = $scope.Parameters.SmsList.toString();
      $scope.Parameters.MailList = $scope.Parameters.MailList.toString();
      // 1.上传照片 Promise >> 2.写历程 Promise>> 3.照片id回传自己的伺服器 Promise
      var UploadImagePromise = $scope.createUploadImagePromise();
      UploadImagePromise.then(function (data) {
        if (data == 'Success') {
          console.log('UploadImagePromise Sucess');
          var AddHistoryPromise = $scope.createAddHistoryPromise();
          return AddHistoryPromise;
        };
      }).then(function (data) {
        if (data == 'Success') {
          console.log('AddHistoryPromise Sucess');
          var LoadMediasPromise = $scope.createLoadMediasPromise();
          return LoadMediasPromise;
        };
      }).then(function (data) {
        if (data == 'Success') {
          $scope.isSubmit = false;
          console.log('LoadMediasPromise Sucess');
          setTimeout(function () {
            $scope.change_title(params.PageTitle);
            $mdDialog.hide({
              RequisitionId: $scope.RepairInfo.RequisitionId
            });
          }, 0);
        };
      });
    }
  };
  $scope.cancel = function() {
    $scope.change_title(params.PageTitle);
    $mdDialog.cancel();
  };
};
/*
    2018/04/26 add
    SelectMaintainerCtl 選擇維修商＆據點Ctrl
*/
function SelectMaintainerCtl($scope, $http, $modalInstance, $modal, $cookies, $timeout) {
  $scope.CompanyFilter = {
    value: ''
  };
  var Passport = window.localStorage.getItem('Passport');
  $scope.CompanyId = $cookies.CompanyId;
  $scope.StoreUser = $cookies.StoreUser;
  $scope.hasAddStrongholdPermissions = false;
  if ($scope.CompanyId == 'eb296708-6fc6-43f0-b506-0ca0fa91e1cd' && $scope.StoreUser == 0 || $scope.CompanyId == '6c690014-2571-48db-ac5a-c6ba2572a3bb' && $scope.StoreUser == 0) {
    $scope.hasAddStrongholdPermissions = true;
  };
  $scope.getMaintainerTree = function() {
    $http({
      url: ApiMapper.sApi + '/s/punit/maps',
      method: 'GET',
      cache: false,
      contentType: 'application/json',
      headers: {
        'Passport': Passport
      }
    }).success(function(data) {
      // 10 40 60
      $scope.CompanyList = data[0].filter(function(item) {
        return item.Status == 1 && item.UnitLevel == 10;
      });
      $scope.StrongholdList = data[1].filter(function(item) {
        return item.Status == 1 && item.UnitLevel == 40;
      });
      $scope.MaintainerTree = JSON.parse(JSON.stringify($scope.CompanyList));
      $scope.MaintainerTree.forEach(function(item) {
        item.isCollapsed = true;
        item.children = [];
        item.children = $scope.StrongholdList.filter(function(stronghold) {
          return item.UnitId == stronghold.Level1
        });
      });
    });
  };
  $scope.getMaintainerTree();
  $scope.setMain = function(item) {
    var result = {
      CompanyId: '',
      CompanyName: '',
      Unit: '',
      UnitId: '',
    };
    if (item.UnitLevel == 10) {
      result.CompanyId = item.CompanyId;
      result.CompanyName = item.Unit;
      result.UnitId = item.UnitId;
      result.Unit = item.Unit;
    } else {
      result.CompanyId = item.CompanyId;
      result.CompanyName = ($scope.CompanyList.filter(function(v) {
        return v.CompanyId == item.CompanyId
      }))[0].Unit;
      result.UnitId = item.UnitId;
      result.Unit = item.Unit;
    }
    $modalInstance.close(result);
  }
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  //新增维修厂商--王品用
  $scope.AddStrongholdOpen = function() {
    var AddStrongholdmodalInstance = $modal.open({
      templateUrl: 'app/Modal/Stronghold-add.html',
      controller: AddStrongholdCtrl,
      windowClass: 'AddMaintainerModal',
      backdrop: 'static',
      resolve: {
        TypeClass: function() {
          return '0';
        }
      }
    });
    AddStrongholdmodalInstance.result.then(function(result) {
      $timeout(function() {
        $scope.getMaintainerTree();
      }, 500);
    });
  };
};
/*
    2018/04/26 add
    SelectMaintainerCtl 選擇維修商＆據點Ctrl
*/
function AddStrongholdCtrl($scope, $http, $modalInstance, $timeout, TypeClass) {
  $scope.Passport = window.localStorage.getItem('Passport');
  $scope.Maintainer = {
    "EquipmentTypeClass": TypeClass,
    "MaintainerName": "",
    "MaintainerNickname": "",
    "StrongholdName": "",
    "Liaison": [{
      "Name": "",
      "PhoneNo": "",
      "Email": ""
    }]
  };
  $scope.btnDisabled = false;
  $scope.AddLiaisons = function() {
    $scope.Maintainer.Liaison.push({
      "Name": "",
      "PhoneNo": "",
      "Email": ""
    });
  };
  $scope.RemoveLiaisons = function(i) {
    $scope.Maintainer.Liaison.splice(i, 1);
  };
  $scope.toAdd = function() {
    $scope.btnDisabled = true;
    $http({
      url: ApiMapper.sApi + '/s/pcompany',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Passport': $scope.Passport
      },
      data: $scope.Maintainer
    }).success(function(data) {
      if (data.Success == true) {
        $scope.btnDisabled = true;
        $modalInstance.close('');
      } else {
        alert(data.Messages);
        $scope.btnDisabled = true;
      };
    }).error(function(error) {
      $scope.btnDisabled = true;
      alert(error.Messages);
    });
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
};