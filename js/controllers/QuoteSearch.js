WeChat.controller('SearchQuotationCtrl', ['$scope', '$http', '$timeout', '$cookies', '$mdSidenav', '$mdUtil', '$filter', '$sce','Quotation', function ($scope, $http, $timeout, $cookies, $mdSidenav, $mdUtil, $filter, $sce,Quotation) {
    $scope.Passport=$cookies.Passport;
    $scope.UnitId=$cookies.UnitId;
    $scope.uId=$cookies.uID; 
    
// $scope.UnitId='85cafe' ;
// $scope.Passport="AVrMcz0VSLY3C9Yc557A2xu2fFJJkW%2FHy8uZcGysaBfRIS%2F7rbeR8YKkMVjnqikIIaARPnumF7IoXCtAwNnjtj2hjbioTXnnxiZgAiCfS%2BVlrJtqpmSv7W%2F77A%2BJ0amFJrzzrliczf8y5bzVPjP3cE6MRuFNvD7aiWo7hgfjjfNITXGTRW7DQ1Ru9wdILTXeizptsyVW8E3%2BIxEh6qOfW%2F2PW1pJ6nMw%2BhnNRpC%2BESf%2BC5O3lhvHs23ktzXtytGZZmQQZX2CrQG0KfI4K%2FH1XPwrKOFJC3V5chTH8XV14SepgS5f8ozOOvQit1cBQXoGLkh84XG%2FcSSzM8awR5tBpG09iH3ujZQOVFhj8iEwxkrBiK1JP9YCZA8r0twYLR7aPwZ5FKGG%2BvFlbeo7zSPifQ%3D%3D"
    $scope.totalItems;
    $scope.maxSize = 10;
    $scope.currentPage = 1;
    $scope.PaginationisShow = false;
    //ps: 排序参数 5/19
    // 99:無 , 上 0:升冪 小到大 , 下 1:降冪 大到小
    $scope.OrderByStore = 99;
    $scope.OrderByNo = 99;
    $scope.OrderByPrice = 99;
    $scope.OrderByStronghold = 99;
    $scope.OrderByTime = 1;
    //門店關鍵字
    $scope.StoreListSearch = '';
    //篩選模式
    $scope.SearchType = 0; //0預設　１篩選單號　２篩選日期+狀態
    //篩選條件
    $scope.SearhParams ={
        "Orders": [{"Name": "CreatedTime","OrderBy": 1}],
        "UnitIds":[],
        "StrongholdIds":[],
        "FuzzyCaseCode": ""
    };
    $scope.isPagination=false;
    $scope.companyName="";
    $scope.maintainer="";
    $scope.UnitIds = [];
    $scope.Units = [];
    $scope.Strongholds = [];
    $scope.inspectList=[];
    $scope.pageObj = {'statusName':'待审批','statusId':1,'OrderByPrice':0,'OrderByTime':1};
    $scope.isShowMulti=true;
   
    $scope.pcompanyList = [];
    $scope.StoreList = [];

    $scope.Select2List = [{ "Id": "", "Text": "" }];
    $scope.SelectedList01 = [];
    $scope.SelectedList02 = [];
    $scope.SelectedList03 = [];
    $scope.Select2Data = [];
    $scope.Select2Data01 = [];
    $scope.Select2Data02 = [];
    $scope.Select2Data03 = [];
    $scope.StoreSelectedList = [];
    $scope.MaintainerSelectedList = [];
    $scope.EquipmentSelectedList = [];
    $scope.Select2SelectedList = [];
    
    $scope.MaintainerIds = [];
    $scope.StrongholdIds = [];
    $scope.Equipments = [];
    $scope.tabName = "门店";
    $scope.tabId = "Store";
    
    window.localStorage.setItem("QuoteStatusId", 1);
    $scope.deliberatelyTrustDangerousSnippet = function (snippet) {
        return $sce.trustAsHtml(snippet);
    };
    // $http({
    //     url: ApiMapper.sApi+'/s/unit/maps',
    //     method: 'GET',
    //     contentType: 'application/json',
    //     headers: { 'Passport':  $scope.Passport }
    // }).success(function (Unitdata) {
    //     $scope.SearhParams.UnitIds=[];
    //     var LevelForUnit = _(Unitdata[3]).find(function (Item) { return Item.UnitId ==  $scope.UnitId && Item.UnitLevel == 100; });
    //     if (LevelForUnit == undefined) {
    //         LevelForUnit = _(Unitdata[3]).pluck(function (Item) { return Item.UnitLevel == 100; });
    //         _(Unitdata[3]).each(function (Item) {
    //             if (Item.UnitLevel == 100) {
    //                 if (Item.Level1 ==  $scope.UnitId || Item.Level2 ==  $scope.UnitId || Item.Level3 ==  $scope.UnitId) {
    //                     $scope.UnitIds.push(Item.UnitId);
    //                     $scope.SearhParams.UnitIds.push(Item.UnitId);
    //                 }
    //             }
    //         });
    //     } else {
    //         $scope.UnitIds.push( $scope.UnitId);
    //         $scope.SearhParams.UnitIds=[ $scope.UnitId];
    //     }
    //     $scope.SearchRepair();
    // });
    /**进阶查询相关js */
    //取得門店資料
    $scope.GetStore = function () {
        $http({
            url: ApiMapper.sApi + '/s/unit/maps',
            method: 'GET',
            cache: false,
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport }
        }).success(function (Unitdata) {
            $scope.StoreList = [];
            $scope.Unitdata = Unitdata;
            _($scope.Unitdata[1]).each(function (Item1) {// + '[' + Item1.UnitId + ']'
                $scope.StoreList.push({ 'Id': Item1.UnitId, 'Text': Item1.Unit, 'isSelected': false, 'Level1': '', 'Level2': '', 'UnitLevel': 10 });
                _($scope.Unitdata[2]).each(function (Item2) {
                    if (Item2.Level2 == Item1.UnitId) {//+ '[' + Item2.UnitId + ']'
                        $scope.StoreList.push({ 'Id': Item2.UnitId, 'Text': '　'+Item2.Unit , 'isSelected': false, 'Level1': '', 'Level2': '', 'UnitLevel': 20 });
                        _($scope.Unitdata[3]).each(function (Item3) {
                            if (Item3.Level3 == Item2.UnitId) {//+ '[' + Item3.UnitId + ']'
                                $scope.StoreList.push({ 'Id': Item3.UnitId, 'Text': '　　'+Item3.Unit , 'isSelected': false, 'Level1': Item1.UnitId, 'Level2': Item2.UnitId, 'UnitLevel': 100 });
                            }
                            if (Item3.UnitId == $scope.UnitId) {
                                $scope.SearhParams.UnitIds.push(Item3.UnitId);
                                $scope.UnitIds.push(Item3.UnitId);
                                $scope.Unit = Item3.Unit;
                                $scope.Select2List = [{ "Id": Item3.UnitId, "Text": Item3.Unit }];
                                $scope.StoreSelectedList = $scope.Select2List;
                                $scope.SelectedList01 = $scope.Select2List;
                                $scope.GetEquipment4Areas();
                                $scope.GetProvider();
                            }
                        });
                    }                    
                });
                //$scope.StoreList.push(ParentItem); 
            });
            $scope.Select2Data01 = $scope.StoreList;
            $scope.SearchRepair();
        });
    };
    $scope.GetStore();
    //取得维修商資料
    $scope.GetProvider = function () {
        if ($scope.UnitIds.length > 0) {
            $http({
                url: ApiMapper.sApi + '/s/rez/misc/spCategory',
                method: 'POST',
                cache: false,
                contentType: 'application/json',
                headers: { 'Passport': $cookies.Passport },
                data: { 'UnitIds': $scope.UnitIds, 'RequisitionStatus': [1, 2, 4, 5, 6] }
            }).success(function (Unitdata) {
                $scope.pcompanyName = ''; $scope.pcompanyList = [];
                _(Unitdata).each(function (Item) {
                    $scope.pcompanyList.push({ 'Id': Item.MaintainerId, 'Text': Item.MaintainerName, 'isSelected': false });
                    $scope.Select2Data02.push({ 'Id': Item.MaintainerId, 'Text': Item.MaintainerName, 'isSelected': false });
                });
                
            });
        } 
    };
    //获取设备类别和设备
    $scope.GetEquipment4Areas = function () {
        //$scope.SearhParams.positionIds = $scope.AreasSelected;
        $scope.EquipmentList = [];
        $http({
            url: ApiMapper.sApi + '/s/rez/misc/etCategory',
            cache: false,
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Passport': $cookies.Passport },
            data: JSON.stringify({ 'UnitIds': $scope.UnitIds, 'RequisitionStatus': [1, 2, 4, 5, 6]})
        }).success(function (data) {
            _(data).each(function (Lists) {//+ '[' + Lists.EquipmentCode + ']'
                $scope.EquipmentList.push({ 'Id': Lists.EquipmentId, 'Text': Lists.EquipmentName , 'isSelected': false });
                $scope.Select2Data03.push({ 'Id': Lists.EquipmentId, 'Text': Lists.EquipmentName , 'isSelected': false });                
            });
        }).error(function (data) {
            $scope.isShowList = true;
        });
    };
    //禁用按钮
    $scope.isShowButton = function (Tag, n) {
        var ItemId = $scope.Select2List[n].Id;
        if (Tag == "ADD") {
            if (ItemId == "") {
                return true;
            } else if (n == 0 && $scope.Select2List.length > 1) {
                return true;
            } else {
                return false;
            }
        } else {
            if (n == 0 && $scope.Select2List.length == 1 && (ItemId == "" || ItemId == null)) {
                return true;
            } else {
                return false;
            }
        }
    };
    //新增报修项目
    $scope.AddToSelect2 = function (Index) {
        if (!$scope.isShowButton('ADD', Index)) {
            $scope.Select2List.push({ 'Id': '', 'text': '' });
        }
    };
    //删除报修项目
    $scope.RemoveForSelect2 = function (Index) {
        if (!$scope.isShowButton('Delete', Index)) {
            if ($scope.Select2List.length > 1) {
                $scope.Select2List.splice(Index, 1);
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
                if ($scope.tabId == "Store") {
                    $scope.Select2Data01 = [];
                    $scope.SelectedList01 = [];
                } else if ($scope.tabId == "Maintainer") {
                    $scope.Select2Data02 = [];
                    $scope.SelectedList02 = [];
                } else {
                    $scope.Select2Data03 = [];
                    $scope.SelectedList03 = [];
                }
            }
        }
    };    
    //加载进阶选择页签于资料
    $scope.LoadMnti = function (n) {
        if (parseInt(n) == 0) {
            $scope.tabName = "门店";
            $scope.tabId = "Store";
            $scope.Select2Data = $scope.StoreList;
            if ($scope.SelectedList01.length > 0) {
                $scope.Select2List = $scope.SelectedList01;
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
            }

        } else if (parseInt(n) == 1) {
            $scope.tabName = "维修商";
            $scope.tabId = "Maintainer";
            $scope.Select2Data = $scope.pcompanyList;
            if ($scope.SelectedList02.length > 0) {
                $scope.Select2List = $scope.SelectedList02;
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
            }
        } else {
            $scope.tabName = "设施 / 设备";
            $scope.tabId = "Equipment";
            $scope.Select2Data = $scope.EquipmentList;
            if ($scope.SelectedList03.length > 0) {
                $scope.Select2List = $scope.SelectedList03;
            } else {
                $scope.Select2List = [{ "Id": "", "Text": "" }];
            }
        }
    };
    //文本框获取焦点
    $scope.rSetSelect2Values = function (Item) {
        Item.isSelected = false;
        Item.Text = "";
        Item.Id = "";
    };
    //文本关键字查询--高亮
    $scope.SetFiterHighlight = function (Select2Item) {
        $scope.Select2Data = [];
        if ($scope.tabId == "Store") {
            _($scope.StoreList).each(function (Item) {
                var ItemObject = Item;
                var ItemText = Item.Text;
                ItemText = ItemText.replace("<span style='color:red;'>", "");
                Item.Text = ItemText.replace("</span>", "");
                if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text)>=0) {
                    var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
                    ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
                    $scope.Select2Data.push({ 'Id': Item.Id, 'Text': ItemText.replace(Select2Item.Text, nTextStr) });

                    ItemText = ItemText.replace("<span style='color:red;'>", "");
                    Item.Text = ItemText.replace("</span>", "");
                }
            });
        } else if ($scope.tabId == "Maintainer") {
            _($scope.pcompanyList).each(function (Item) {
                var ItemObject = Item.Text;
                var ItemText = Item.Text;
                ItemText = ItemText.replace("<span style='color:red;'>", "");
                Item.Text = ItemText.replace("</span>", "");
                if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text) >= 0) {
                    var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
                    ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
                    $scope.Select2Data.push({ 'Id': Item.Id, 'Text': ItemText.replace(Select2Item.Text, nTextStr) });

                    ItemText = ItemText.replace("<span style='color:red;'>", "");
                    Item.Text = ItemText.replace("</span>", "");
                }
            });
        } else {
            _($scope.EquipmentList).each(function (Item) {
                var ItemObject = Item.Text;
                var ItemText = Item.Text;
                ItemText = ItemText.replace("<span style='color:red;'>", "");
                Item.Text = ItemText.replace("</span>", "");
                if (Select2Item.Text != "" && ItemText.indexOf(Select2Item.Text) >= 0) {
                    var nTextStr = "<span style='color:red;'>" + Select2Item.Text + "</span>";
                    ItemObject.Text = ItemText.replace(Select2Item.Text, nTextStr);
                    $scope.Select2Data.push({ 'Id': Item.Id, 'Text': ItemText.replace(Select2Item.Text, nTextStr) });

                    ItemText = ItemText.replace("<span style='color:red;'>", "");
                    Item.Text = ItemText.replace("</span>", "");
                }
            });
        }
    };
    //设定Select2选中值
    $scope.SetSelect2Values = function (Item, n) {
        $(".NT_side_footer").removeClass('unfixed');
        Item.isSelected = !Item.isSelected;
        var ItemText = $scope.Select2Data[n].Text;
        ItemText = ItemText.replace("　", "");
        ItemText = ItemText.replace("　", "");
        ItemText = ItemText.replace("<span style='color:red;'>", "");
        ItemText = ItemText.replace("</span>", "");
        Item.Text = ItemText;
        Item.Id = $scope.Select2Data[n].Id;

        $timeout(function () {
            if ($scope.tabId == "Store") {
                $scope.Select2Data01 = $scope.Select2Data;
                $scope.SelectedList01 = _.uniq($scope.Select2List); 
            } else if ($scope.tabId == "Maintainer") {
                $scope.Select2Data02 = $scope.Select2Data;
                $scope.SelectedList02 = $scope.Select2List;
            } else {
                $scope.Select2Data03 = $scope.Select2Data;
                $scope.SelectedList03 = $scope.Select2List;
            }
        }, 300);        
    };
    //清除所有选择
    $scope.clearSelect2Values = function () {
        $scope.Select2Data01 = $scope.StoreList;
        $scope.Select2Data02 = $scope.pcompanyList;
        $scope.Select2Data03 = $scope.EquipmentList;

        $scope.StoreSelectedList = [];
        $scope.MaintainerSelectedList = [];
        $scope.EquipmentSelectedList = [];
        _($scope.Select2List).each(function (Item,n) {
            Item.Id = "";
            Item.Text = "";
        }); 
        _($scope.Select2Data01).each(function (Item) { Item.isSelected = false; });
        _($scope.SelectedList01).each(function (Item) { Item.isSelected = false; });
        _($scope.SelectedList02).each(function (Item) { Item.isSelected = false; });
        _($scope.SelectedList03).each(function (Item) { Item.isSelected = false; });

        $scope.Unit = "";
        $scope.closeDenav('Multi');
        //$scope.SearchRepair($scope.currentPage);
    };
    //确认查询
    $scope.gotoSearch = function () {
        //$scope.StoreList = $scope.Select2Data01;
        //$scope.pcompanyList = $scope.Select2Data02;
        //$scope.EquipmentList = $scope.Select2Data03;
        $scope.SearhParams.UnitIds = [];
        $scope.SearhParams.MaintainerIds = [];
        $scope.SearhParams.EquipmentIds = [];
        var UnitName = [];
        _($scope.StoreSelectedList).each(function (Item) {
            UnitName.push(Item.Text);
            _($scope.StoreList).each(function (Areas) {
                if (Areas.Id == Item.Id||Item.Id==Areas.Level1||Item.Id==Areas.Level2) {
                    $scope.SearhParams.UnitIds.push(Areas.Id);
                }
            });
            $scope.SearhParams.UnitIds.push(Item.Id);
        });
        $scope.Unit = UnitName.toString();
        _($scope.MaintainerSelectedList).each(function (Item) {
            if (Item.Id != "" && Item.Id != null) {
                $scope.SearhParams.MaintainerIds.push(Item.Id);
            }
        });
        _($scope.EquipmentSelectedList).each(function (Item) {
            if (Item.Id != "" && Item.Id != null) {
                $scope.SearhParams.EquipmentIds.push(Item.Id);
            }
        });
        $scope.closeDenav('Multi');
        $scope.SearchRepair($scope.currentPage);
    };
    //清除所有选择
    $scope.clearSelect2Values4Item = function () {
        //$(".NT_side_footer").removeClass('unfixed');
        _($scope.Select2List).each(function (Item, n) {
            Item.Id = "";
            Item.Text = "";
        });
        _($scope.Select2Data).each(function (Item) { Item.isSelected = false; });
        if ($scope.tabId == "Store") {
            $scope.StoreList = $scope.Select2Data;
        } else if ($scope.tabId == "Maintainer") {
            $scope.pcompanyList = $scope.Select2Data;
        } else {
            $scope.EquipmentList = $scope.Select2Data;
        }
    };
    //获取下层资料
    $scope.loadSelect2Data4Item = function () {
        if ($scope.tabId == "Store") {
            $scope.StoreSelectedList = _.uniq($scope.SelectedList01);
            $scope.UnitIds = [];
            var UnitName = []; 
            _($scope.StoreSelectedList).each(function (Item) {
                UnitName.push(Item.Text);
                _($scope.Select2Data01).each(function (Areas) {
                    if (Areas.Id == Item.Id || Item.Id==Areas.Level1 || Item.Id==Areas.Level2) {
                        $scope.UnitIds.push(Areas.Id);
                    }
                });
                $scope.UnitIds.push(Item.Id);
            }); 
            $scope.GetProvider();
            $scope.GetEquipment4Areas();

            $scope.Unit = UnitName.toString();
            $scope.MaintainerSelectedList = [];
            $scope.EquipmentSelectedList = [];
        } else if ($scope.tabId == "Maintainer") {
            $scope.MaintainerSelectedList = $scope.SelectedList02;
        } else {
            $scope.EquipmentSelectedList = $scope.SelectedList03;
        }
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
 //-------------------- API使用 載入列表資料--------------------
    //載入案件處理列表資料Api
    //判斷是不是要顯示篩選條件
    $scope.SearchRepair = function() {
        $scope.isLoading = true;
        Quotation.getLists($scope.Passport,JSON.stringify($scope.SearhParams),$scope.pageObj.statusId,$scope.currentPage)
        .then(function(data){  
            if ($scope.currentPage == 1) {
                $scope.RepairList = [];
            }
            if (data[1].length > 0) {
                $scope.isShowDetail = true;
                $scope.RepairCounts = parseInt(data[0]);
                $scope.isShowMore = $scope.RepairCounts > 1 ? true : false;
                if ($scope.currentPage == $scope.RepairCounts) {
                    $scope.isShowMore = false;
                }
                _(data[1]).each(function (Item) { Item.Selected = false; Item.swipeState = false; });
                Array.prototype.push.apply($scope.RepairList, data[1]);
            } else {
                $scope.isShowDetail = false;
                $scope.isShowMore = false;
            }
            $scope.isLoading = false;
        },function(data){
            $scope.isLoading = false;
        });
    };
    //$scope.SearchRepair();
    /*排序*/
    $scope.pageObj.OrderBy = function(OrderbyElement) {
        $scope.OrderbyParames = [];
        if (OrderbyElement == 'Price') {
              if ($scope.OrderByPrice == 0) {
                  $scope.OrderByPrice = 1;
              } else if ($scope.OrderByPrice == 1) {
                  $scope.OrderByPrice = 99;
              } else {
                  $scope.OrderByPrice = 0;
              }
        }
        if (OrderbyElement == 'Time') {
              if ($scope.OrderByTime == 0) {
                  $scope.OrderByTime = 1;
              } else if ($scope.OrderByTime == 1) {
                  $scope.OrderByTime = 99;
              } else {
                  $scope.OrderByTime = 0;
              }
        }

        if($scope.OrderByPrice!=99){
          $scope.OrderbyParames.push({
            "Name": "TotalPrice",
            "OrderBy": $scope.OrderByPrice
          })
        }
        if($scope.OrderByTime!=99){
          $scope.OrderbyParames.push({
            "Name": "CreatedTime",
            "OrderBy": $scope.OrderByTime
          })
        }
        $scope.SearhParams.Orders = $scope.OrderbyParames;
        $scope.currentPage=1;
        $scope.SearchRepair();
    };
    $scope.pageObj.SetStatus = function (StatusId, StatusName) {
        $scope.pageObj.statusName = StatusName;
        $scope.pageObj.statusId = StatusId;
        window.localStorage.setItem("QuoteStatusId", StatusId);
        $scope.SearchRepair();
    };
    //转页至详情页面
    $scope.pageObj.toDetail = function(quoteItem) {
        // location.href = "quotation_detail.html?quoteId=" + quoteItem.QuotationId;
        $scope.$broadcast("QuoteList2Detail",quoteItem.QuotationId);
        $mdSidenav('QuoteDetailModal').toggle();
    };
    //换页
    $scope.pageChanged = function () {
        ngProgress.start();
        $timeout(function () {
            $scope.SearchRepair();
        }, 200);
    };
    
    //加载更多
    $scope.LoadMore = function () {
        $scope.currentPage = $scope.currentPage + 1;
        $scope.SearchRepair();
        if ($scope.currentPage == $scope.RepairCounts) {
            $scope.isShowMore = false;
        }
    };
}])
;