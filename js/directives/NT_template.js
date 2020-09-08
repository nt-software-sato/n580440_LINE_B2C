// import { prototype } from "node-notifier/notifiers/notifysend";
var lastTime = "20190516";
WeChat.directive('caseContent', function() {
    return {
      restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
      scope: true,
      //template: '<div>{{ myVal }}</div>',
      templateUrl: '../Case_Detail_model.html?v=' + lastTime,
      //controller: controllerFunction, //Embed a custom controller in the directive
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  }).directive('caseGallery', function() { //案件詳情相冊
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: 'Case_Detail_gallery.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('casePhoto', function() { //案件詳情相冊相片 
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: 'Case_Detail_photo.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('sortDateTime', function() { //案件列表日期篩選
    return {
      restrict: 'EA',
      scope: {
        showtag: '@',
        emergencyName: '@',
        emergencyIds: '=',
        isInspection: '=',
        inspectionName: '@',
        orderbyParams: '=',
        callback: '&'
      },
      templateUrl: '../app/CaseList/SortGroup/Case_sort_dateTime.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.dateSort1 = true;
        scope.dateSort2 = false;
        scope.OrderbyDateM = true;
        if (scope.showtag == 1) {
          scope.OrderbyDateM = false;
          scope.orderbyParams = [{
            "name": "OverTimeInterval",
            "OrderBy": scope.dateSort1 ? 0 : 1
          }];
        } else if (scope.showtag == 2) {
          scope.orderbyParams = [{
            "name": "DateM",
            "OrderBy": scope.dateSort2 ? 0 : 1
          }];
        } else {
          scope.orderbyParams = [{
            "name": "DateM",
            "OrderBy": scope.dateSort2 ? 0 : 1
          }];
        }
        scope.reload4Time = function(n) {
          if (parseInt(n) == 0) {
            if (scope.OrderbyDateM) {
              scope.OrderbyDateM = false;
              scope.dateSort1 = true;
              scope.orderbyParams = [{
                "name": "OverTimeInterval",
                "OrderBy": 0
              }];
            } else {
              scope.dateSort1 = !scope.dateSort1;
              scope.orderbyParams = [{
                "name": "OverTimeInterval",
                "OrderBy": scope.dateSort1 ? 0 : 1
              }];
            }
          } else {
            if (!scope.OrderbyDateM) {
              scope.OrderbyDateM = true;
              scope.dateSort2 = true;
              scope.orderbyParams = [{
                "name": "DateM",
                "OrderBy": 0
              }];
            } else {
              scope.dateSort2 = !scope.dateSort2;
              scope.orderbyParams = [{
                "name": "DateM",
                "OrderBy": scope.dateSort2 ? 0 : 1
              }];
            }
          }
          setTimeout(scope.callback(), 200);
        }
        scope.SetEmergency = function(EmergencyId, EmergencyName) {
          scope.emergencyName = EmergencyName;
          scope.emergencyIds = [];
          if (parseInt(EmergencyId) == "9") {
            scope.emergencyIds = [0, 1, 2];
          } else {
            scope.emergencyIds.push(EmergencyId);
          }
          setTimeout(scope.callback(), 300);
        };
        scope.SetInspection = function(Inspection, InspectionName) {
          scope.isInspection = Inspection;
          scope.inspectionName = InspectionName;
          setTimeout(scope.callback(), 300);
        };
      }
    }
  }).directive('loading', function() { //頁面載入中畫面
    return {
      restrict: 'EA',
      scope: true,
      template: '<div ng-show="isLoading" class="alert isLoading NT_blue_word_wh nomargin"><p class="text-center nomargin"><span class="loader loader-quart"></span></p></div>',
      link: function(scope, element, attrs) {} //DOM manipulation
    }
  }).directive('loadMore', function() { //載入更多按鈕
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Case_loadMore.html?v=' + lastTime,
      link: function(scope, element, attrs) {} //DOM manipulation
    }
  }).directive('withoutCase', function() { //沒有案件時提示區塊
    return {
      restrict: 'EA',
      scope: true,
      template: '<p class="text-center nomargin"><i class="fa fa-frown-o"></i>&nbsp;&nbsp;未找到符合条件的报修单&nbsp;!</p>',
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  }).directive('caseSearch', function() { //門店 維修商 設施設備篩 上方藍色輸入欄位
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_Search_top.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('caseSearchShow', function() { //門店 維修商 設施設備篩 上方藍色輸入欄位
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_Search_Show.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('caseSearchGroupRight', function() { //門店 維修商 設施設備篩 上方藍色輸入欄位
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Repair_search_group_right.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.setIsInspection = function(region) {
          var isExist = false;
          var _key = region.RegionId;
          var _val = region.Region;
          for (item in scope.GroupParames) {
            if (item === _key) {
              scope.GroupParames[_key] = !scope.GroupParames[_key];
              isExist = true;
            }
          }
          if (!isExist) {
            scope.GroupParames[_key] = true;
          }
          if (scope.GroupParames[_key]) {
            scope.SearhParams.UnitRegionIds.push(_key);
            scope.GroupParames.Regions.push(_val);
          } else {
            var idx = scope.SearhParams.UnitRegionIds.indexOf(_key);
            scope.SearhParams.UnitRegionIds.splice(idx, 1);
            scope.GroupParames.Regions.splice(idx, 1);
          }
        };
        scope.setEmergency = function(v) {
          if (v === "Yes") {
            scope.Emergency.DontCare = false;
            scope.Emergency.Yes = !scope.Emergency.Yes;
          } else if (v === "Normal") {
            scope.Emergency.DontCare = false;
            scope.Emergency.Normal = !scope.Emergency.Normal;
          } else if (v === "DontCare") {
            scope.Emergency.Yes = false;
            scope.Emergency.Normal = false;
            scope.Emergency.DontCare = !scope.Emergency.DontCare;
          }
          scope.SearhParams.EquipmentTypeClass = [];
          scope.GroupParames.Emergencys = [];
          if (scope.Emergency.Yes) {
            scope.SearhParams.EquipmentTypeClass.push(0);
            scope.GroupParames.Emergencys.push("设备案件");
          }
          if (scope.Emergency.Normal) {
            scope.SearhParams.EquipmentTypeClass.push(1);
            scope.GroupParames.Emergencys.push("设施案件");
          }
          if (scope.Emergency.DontCare) {
            scope.SubTypeSelected = [];
            scope.GroupParames.TypeName = [];
            scope.SearhParams.EquipmentSubTypeId = [];
            // scope.SearhParams.Emergency.push(2);
            scope.SearhParams.IsInspection = 1;
            scope.GroupParames.Emergencys.push("保养案件");
          } else {
            scope.SearhParams.IsInspection = 4;
          }
        };
      }
    }
  }).directive('caseSearchRight', function() { //綜合查詢備篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Repair_search_right.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.setIsInspection = function(v) {
          scope.SearhParams.IsInspection = v;
        };
        scope.setEmergency = function(v) {
          if (v === "Yes") {
            scope.Emergency.Yes = !scope.Emergency.Yes;
          } else if (v === "Normal") {
            scope.Emergency.Normal = !scope.Emergency.Normal;
          } else if (v === "DontCare") {
            scope.Emergency.DontCare = !scope.Emergency.DontCare;
          }
          scope.SearhParams.Emergency = [];
          scope.Emergency.Yes ? scope.SearhParams.Emergency.push(0) : '';
          scope.Emergency.Normal ? scope.SearhParams.Emergency.push(1) : '';
          scope.Emergency.DontCare ? scope.SearhParams.Emergency.push(2) : '';
        };
        scope.SetParams = function(v) {
          scope.SearhParams.RezConditions = [];
          scope.RequisitionStatus[v] = !scope.RequisitionStatus[v];
          scope.RequisitionStatus.Filing ? scope.SearhParams.RezConditions.push(2) : '';
          scope.RequisitionStatus.Assignment ? scope.SearhParams.RezConditions.push(3) : '';
          scope.RequisitionStatus.InStore ? scope.SearhParams.RezConditions.push(8) : '';
          scope.RequisitionStatus.Acceptance ? scope.SearhParams.RezConditions.push(4) : '';
          scope.RequisitionStatus.Revocation ? scope.SearhParams.RezConditions.push(5) : '';
          scope.RequisitionStatus.OnConfirm ? scope.SearhParams.RezConditions.push(32) : '';
          scope.RequisitionStatus.OnProcess ? scope.SearhParams.RezConditions.push(6) : '';
          scope.RequisitionStatus.RawMaterialPending ? scope.SearhParams.RezConditions.push(91) : '';
          scope.RequisitionStatus.ReFactory ? scope.SearhParams.RezConditions.push(61) : '';
        };
        scope.gotoTransfer = function() {
          location.replace(PathStr + "QRcode.html");
        };
        jQuery(document).ready(function() {
          var CompletedateMinDate = null;
          $('#date_begin').daterangepicker({
            singleDatePicker: true,
            showDropdowns: false,
            format: 'YYYY/MM/DD'
          });
          $('#date_end').daterangepicker({
            singleDatePicker: true,
            showDropdowns: false,
            format: 'YYYY/MM/DD'
          });
          // 到场时间若有变动就改变完修的 minDate
          $('#date_begin').on('apply.daterangepicker', function(ev, picker) {
            var minDate = picker.startDate;
            scope.RequestTime.StartDate = new Date(minDate).Format("yyyy/MM/dd");
            $('#date_end').data('daterangepicker').minDate = minDate;
            $('#date_end').data('daterangepicker').updateCalendars();
          });
          $('#date_end').on('apply.daterangepicker', function(ev, picker) {
            scope.RequestTime.EndDate = new Date(picker.startDate).Format("yyyy/MM/dd");
          });
        });
      }
    }
  }).directive('caseSortToolbar', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Repair_sort_toolbar.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.isOvertime = false;
        scope.OrderByTime1 = {
          "ASC": false,
          "DESC": true
        };
        scope.OrderByTime2 = {
          "ASC": false,
          "DESC": false
        };
        //scope.OrderbyParames = [{ 'name': 'DateM', 'OrderBy': 1 }];
        scope.OrderbyTime = function(sortItem, sortValue) {
          scope.OrderbyParames = [];
          scope.SearhParams.Orders = [];
          if (sortItem === 'DateM') {
            scope.OrderByTime2 = {
              "ASC": false,
              "DESC": false
            };
            scope.OrderByTime1[sortValue] = !scope.OrderByTime1[sortValue];
            if (sortValue === "ASC") {
              scope.OrderByTime1.DESC = false;
            } else {
              scope.OrderByTime1.ASC = false;
            }
          } else {
            scope.OrderByTime1 = {
              "ASC": false,
              "DESC": false
            };
            scope.OrderByTime2[sortValue] = !scope.OrderByTime2[sortValue];
            if (sortValue === "ASC") {
              scope.OrderByTime2.DESC = false;
            } else {
              scope.OrderByTime2.ASC = false;
            }
          }
          if (scope.OrderByTime1.ASC) {
            scope.OrderbyParames.push({
              "name": "DateM",
              "OrderBy": 0
            });
            scope.SearhParams.Orders.push({
              "name": "DateM",
              "OrderBy": 0
            });
          } else if (scope.OrderByTime1.DESC) {
            scope.OrderbyParames.push({
              "name": "DateM",
              "OrderBy": 1
            });
            scope.SearhParams.Orders.push({
              "name": "DateM",
              "OrderBy": 1
            });
          }
          if (scope.OrderByTime2.ASC) {
            scope.OrderbyParames.push({
              "name": "OverTimeInterval",
              "OrderBy": 0
            });
            scope.SearhParams.Orders.push({
              "name": "OverTimeInterval",
              "OrderBy": 0
            });
          } else if (scope.OrderByTime2.DESC) {
            scope.OrderbyParames.push({
              "name": "OverTimeInterval",
              "OrderBy": 1
            });
            scope.SearhParams.Orders.push({
              "name": "OverTimeInterval",
              "OrderBy": 1
            });
          }
          //scope.SearhParams.Orders = scope.OrderbyParames;                
          scope.SearchRepair(0);
        };
        scope.setOvertime = function() {
          scope.isOvertime = !scope.isOvertime;
          if (scope.isOvertime) {
            scope.SearhParams.Overtime = 1;
          } else {
            scope.SearhParams.Overtime = 0;
          }
          scope.SearchRepair(1);
        };
      }
    }
  }).directive('caseSearchMulti', function() { //綜合查詢備篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_muti.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.gotoTransfer = function() {
          location.replace(PathStr + "QRcode.html");
        };
      }
    }
  }).directive('caseSearchStore', function() { //門店篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_store.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.gotoTransfer = function() {
          location.replace(PathStr + "QRcode.html");
        };
      }
    }
  }).directive('caseSearchMaintainer', function() { //綜合查詢 維修商篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_maintainer.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchEquipment', function() { //綜合查詢 設施設備篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_equipment.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchStoreAdvence', function() { //門店 進階篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_store_advence.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchStoreTop', function() { //門店 篩選上方藍色bar
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_store_top.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchEquipmentAdd', function() { //新增报修设备
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_equipment_add.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchEquipmentAdvence', function() { //綜合查詢 設施設備篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_equipment_advence.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchMutitAdvence', function() { //綜合查詢用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_muti_advence.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseEquipmentSetting', function() { //新增报修设备
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Case_equipment_setting.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchMutiHead', function() { //查詢頁上方藍色bar
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_muti_head.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchMutiModelHead', function() { //查詢頁上方藍色bar(Model)
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_muti_modelhead.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchMutiModelBody', function() { //查詢頁body(Model)
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_muti_modelBody.html?v=1.0.1',
      link: function($scope, element, attrs) {}
    }
  }).directive('caseSearchMutiModelFooter', function() { //查詢頁footer(Model)
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/SearchGroup/Case_search_muti_modelFooter.html?v=' + lastTime,
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  }).directive('caseList', function() { //案件清單
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Case_list.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('caseDetailTop', function() { //案件詳情上方藍色區塊內容
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Case_Detail_top.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseGoBack', function() { //案件詳情回上一頁
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Case_goBack.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('cancelCaseDetail', function() { //撤銷案件詳情
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CancelList/Cancel_Detail.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('acceptanceCaseDetail', function() { //銷案案件詳情
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/AcceptanceList/Acceptance_Detail.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('caseFooter', function() { //案件footer
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/CaseList/Case_footer.html?v=' + lastTime,
      link: function($scope, element, attrs) {}
    }
  }).directive('delayCase', function() { //逾時排行榜維修商清單
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/DelayList/Delay_Case.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('delayCaseMatainer', function() { //逾時排行榜維修商清單
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/DelayList/Delay_Case_matainer.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('delayCaseStore', function() { //逾時排行榜門店清單
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: 'appDelayListDelay_Case_store.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('sortCaseType', function() { //逾時排行篩選
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/DelayList/SortGroup/Delay_sort_caseNo.html?v=' + lastTime,
      link: function(scope, element, attrs) {} //DOM manipulation
    }
  })
  //报价请款
  .directive('quoteList', function() { //案件清單
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/Quote_list.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('quoteSearchMulti', function() { //綜合查詢備篩選用
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/Quote_search_top.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.gotoTransfer = function() {
          location.replace(PathStr + "QRcode.html");
        };
      }
    }
  }).directive('quoteSortSearch', function() { //案件列表日期篩選
    return {
      restrict: 'EA',
      scope: true
        // {
        //     statusName: '@',
        //     statusId: '=',
        //     orderbyParams:'=',
        //     callback:'&'
        // }
        ,
      templateUrl: '../app/Quotation/Quote_sort_search.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.dateSort1 = true;
        scope.dateSort2 = false;
        scope.OrderbyPrice = false;
        scope.orderbyParams = [{
          "name": "TotalPrice",
          "OrderBy": scope.dateSort1 ? 0 : 1
        }, {
          "name": "CreatedTime",
          "OrderBy": scope.dateSort2 ? 0 : 1
        }];
        scope.reload4Time = function(n) {
          if (parseInt(n) == 0) {
            scope.dateSort1 = !scope.dateSort1;
          } else {
            scope.dateSort2 = !scope.dateSort2;
          }
          scope.orderbyParams = [{
            "name": "TotalPrice",
            "OrderBy": scope.dateSort1 ? 0 : 1
          }, {
            "name": "CreatedTime",
            "OrderBy": scope.dateSort2 ? 0 : 1
          }];
          setTimeout(scope.callback(), 200);
        }
        scope.SetStatus = function(StatusId, StatusName) {
          scope.statusName = StatusName;
          scope.statusId = StatusId;
          setTimeout(scope.callback(), 300);
        };
      }
    }
  }).directive('quoteContent', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/Quote_detail.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('quoteDetailModal', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/Quote_detail_modal.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  }).directive('quoteItemEdit', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/Quote_item_edit.html?v=' + lastTime,
      replace: true,
      link: function(scope, element, attrs) {
        $("#ComponentList").select2({
          placeholder: "请选择设备"
        });
      }
    }
  }).directive('quoteItemOtherEdit', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/Quote_item_other_edit.html?v=' + lastTime,
      replace: true,
      link: function(scope, element, attrs) {}
    }
  }).directive('quoteSignModal', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Quotation/quote_sign_modal.html?v=' + lastTime,
      replace: true,
      link: function(scope, element, attrs) {}
    }
  }).directive('constructionDetail', function() {
    return {
      restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
      scope: true,
      //template: '<div>{{ myVal }}</div>',
      templateUrl: 'Construction_Detail_model.html?v=' + lastTime,
      //controller: controllerFunction, //Embed a custom controller in the directive
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  }).directive('constructionHistory', function() {
    return {
      restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
      scope: true,
      //template: '<div>{{ myVal }}</div>',
      templateUrl: 'Construction_History_model.html?v=' + lastTime,
      //controller: controllerFunction, //Embed a custom controller in the directive
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  }).directive('quoteDetail', function() {
    return {
      restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
      scope: true,
      //template: '<div>{{ myVal }}</div>',
      templateUrl: '../app/AcceptanceList/Quote_Detail.html?v=' + lastTime,
      //controller: controllerFunction, //Embed a custom controller in the directive
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  }).directive('allotCaseSearch', function() {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Allot/Allot_search_top.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  })
  .directive('allotFilterRight', function () {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Allot/Allot_filter_right.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        jQuery(document).ready(function() {
          var CompletedateMinDate = null;
          $('#date_begin').daterangepicker({
            singleDatePicker: true,
            showDropdowns: false,
            format: 'YYYY/MM/DD'
          });
          $('#date_end').daterangepicker({
            singleDatePicker: true,
            showDropdowns: false,
            format: 'YYYY/MM/DD'
          });
          // 到场时间若有变动就改变完修的 minDate
          $('#date_begin').on('apply.daterangepicker', function(ev, picker) {
            var minDate = picker.startDate;
            scope.RequestTime.StartDate = new Date(minDate).Format("yyyy/MM/dd");
            $('#date_end').data('daterangepicker').minDate = minDate;
            $('#date_end').data('daterangepicker').updateCalendars();
          });
          $('#date_end').on('apply.daterangepicker', function(ev, picker) {
            scope.RequestTime.EndDate = new Date(picker.startDate).Format("yyyy/MM/dd");
          });
        });
      }
    }
  })
  .directive('allotSubToolbar', function () {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Allot/Allot_sub_toolbar.html?v=' + lastTime,
      link: function(scope, element, attrs) {
        scope.SetParams = function(v) {
          console.log(v);
          scope.SearhParams.StageId = [];
          if (parseInt(v) === 99) {
            scope.SearhParams.StageId = [0, 1, 2, 3, 4];
          } else {
            scope.SearhParams.StageId.push(v);
          }
          scope.SearchList(1);
        };
      }
    }
  })
  .directive('allotList', function () {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Allot/Allot_list.html?v=' + lastTime,
      link: function(scope, element, attrs) {}
    }
  })
  .directive('allotDetail', function () {
    return {
      restrict: 'EA',
      scope: true,
      templateUrl: '../app/Allot/Allot_detail.html?v=' + lastTime,
      link: function (scope, element, attrs) {}
    }
  })
  .directive('withoutAllot', function () { //沒有案件時提示區塊
    return {
      restrict: 'EA',
      scope: true,
      template: '<p class="text-center nomargin" style="padding:8px 0 5px 0;"><i class="fa fa-frown-o"></i>&nbsp;&nbsp;未找到符合条件的调拨单&nbsp;!</p>',
      link: function($scope, element, attrs) {} //DOM manipulation
    }
  })
  .directive('myBackgroundImage', function () {
    return function(scope, element, attrs) {
      element.css({
        'background-image': 'url(' + attrs.myBackgroundImage + ')',
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-position': 'center center'
      });
    };
  }).directive('ngGallery', ['$document', '$timeout', '$q', '$templateCache', function($document, $timeout, $q, $templateCache) {
    'use strict';
    var defaults = {
      baseClass: 'ng-gallery',
      thumbClass: 'ng-thumb',
      templateUrl: 'ng-gallery.html?v=' + lastTime
    };
    var keys_codes = {
      enter: 13,
      esc: 27,
      left: 37,
      right: 39
    };

    function setScopeValues(scope, attrs) {
      scope.baseClass = scope.class || defaults.baseClass;
      scope.thumbClass = scope.thumbClass || defaults.thumbClass;
      scope.thumbsNum = scope.thumbsNum || 3; // should be odd
    }
    var template_url = defaults.templateUrl;
    // Set the default template
    $templateCache.put(template_url, '<div class="{{ baseClass }}">' + '<div class="row nomargin">' + '<div ng-repeat="i in images" class="wide col-xs-4 col-md-4 col-lg-4 {{ thumbClass }}" my-background-image="{{ i.thumb }}" ng-click="openGallery($index)" alt="Image {{ $index + 1 }}">' +
      //  '  <div ng-repeat="i in images">' +
      //  '    <img name="thumbList" ng-src="{{ i.thumb }}" class="{{ thumbClass }}" ng-click="openGallery($index)" alt="Image {{ $index + 1 }}" />' +
      '  </div>' + ' </div>' + '</div>' + '<div class="ng-overlay" ng-show="opened">' + '</div>' + '<div class="ng-gallery-content" ng-show="opened">' + '  <div class="uil-ring-css" ng-show="loading"><div></div></div>' + '  <a class="close-popup" ng-click="closeGallery()"><i class="fa fa-close" style="color:red;"></i></a>' + '  <a class="nav-left" ng-click="prevImage()" ng-show="thumbsNum>1"><i class="fa fa-angle-left"></i></a>' + '  <div algin="center" text-algin="center"><img name="ShowImg" width="100%" ng-src="{{ img }}" ng-click="nextImage()" ng-show="!loading" class="effect" ng-swipe-left="prevImage()" ng-swipe-right="nextImage()" />' + '  </div><a class="nav-right" ng-click="nextImage()"><i class="fa fa-angle-right"></i></a>' +
      //  '  <span class="info-text">{{ index + 1 }}/{{ images.length }} - {{ description }}</span>' +
      '  <div class="ng-thumbnails-wrapper">' + '    <div class="ng-thumbnails slide-left">' + '      <div ng-repeat="i in images">' + '        <img name="thumb_{{$index}}" ng-src="{{ i.thumb }}" ng-class="{\'active\': index === $index}" ng-click="changeImage($index)" />' + '      </div>' + '    </div>' + '  </div>' + '</div>');
    return {
      restrict: 'EA',
      scope: {
        images: '=',
        thumbsNum: '@'
      },
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || defaults.templateUrl;
      },
      link: function(scope, element, attrs) {
        //$('[name=thumbList]').attr({ 'src': $(this).attr('src') });
        setScopeValues(scope, attrs); //alert($('[name=thumbList]').attr('src'));
        if (scope.thumbsNum >= 11) {
          scope.thumbsNum = 11;
        }
        var $body = $document.find('body');
        var $thumbwrapper = angular.element(document.querySelectorAll('.ng-thumbnails-wrapper'));
        var $thumbnails = angular.element(document.querySelectorAll('.ng-thumbnails'));
        scope.index = 0;
        scope.opened = false;
        scope.thumb_wrapper_width = 0;
        scope.thumbs_width = 0;
        var loadImage = function(i) {
          var deferred = $q.defer();
          var image = new Image();
          image.onload = function() {
            scope.loading = false;
            if (typeof this.complete === false || this.naturalWidth === 0) {
              deferred.reject();
            }
            deferred.resolve(image);
          };
          image.onerror = function() {
            deferred.reject();
          };
          image.src = scope.images[i].img;
          scope.loading = true;
          return deferred.promise;
        };
        var showImage = function(i) {
          loadImage(scope.index).then(function(resp) {
            scope.img = resp.src;
            $('[name=ShowImg]').attr({
              'src': resp.src
            });
            smartScroll(scope.index);
          });
          scope.description = scope.images[i].description || '';
        };
        scope.changeImage = function(i) {
          scope.index = i;
          loadImage(scope.index).then(function(resp) {
            scope.img = resp.src;
            $('[name=ShowImg]').attr({
              'src': resp.src
            });
            smartScroll(scope.index);
          });
        };
        scope.nextImage = function() {
          scope.index += 1;
          if (scope.index === scope.images.length) {
            scope.index = 0;
          }
          showImage(scope.index);
        };
        scope.prevImage = function() {
          scope.index -= 1;
          if (scope.index < 0) {
            scope.index = scope.images.length - 1;
          }
          showImage(scope.index);
        };
        scope.openGallery = function(i) {
          if (typeof i !== undefined) {
            scope.index = i;
            showImage(scope.index);
          }
          scope.opened = true;
          $timeout(function() {
            var calculatedWidth = calculateThumbsWidth();
            scope.thumbs_width = calculatedWidth.width;
            $thumbnails.css({
              width: calculatedWidth.width + 'px'
            });
            $thumbwrapper.css({
              width: calculatedWidth.visible_width + 'px'
            });
            smartScroll(scope.index);
          });
        };
        scope.closeGallery = function() {
          scope.opened = false;
        };
        $body.bind('keydown', function(event) {
          if (!scope.opened) {
            return;
          }
          var which = event.which;
          if (which === keys_codes.esc) {
            scope.closeGallery();
          } else if (which === keys_codes.right || which === keys_codes.enter) {
            scope.nextImage();
          } else if (which === keys_codes.left) {
            scope.prevImage();
          }
          scope.$apply();
        });
        var calculateThumbsWidth = function() {
          var width = 0,
            visible_width = 0;
          angular.forEach($thumbnails.find('img'), function(thumb) {
            width += thumb.clientWidth;
            width += 10; // margin-right
            visible_width = thumb.clientWidth + 65;
          });
          return {
            width: width,
            visible_width: visible_width * scope.thumbsNum
          };
        };
        var smartScroll = function(index) {
          $timeout(function() {
            var len = scope.images.length,
              width = scope.thumbs_width,
              current_scroll = $thumbwrapper[0].scrollLeft,
              item_scroll = parseInt(width / len, 10),
              i = index + 1,
              s = Math.ceil(len / i);
            $thumbwrapper[0].scrollLeft = 0;
            $thumbwrapper[0].scrollLeft = i * item_scroll - (s * item_scroll);
          }, 100);
        };
      }
    };
  }]);