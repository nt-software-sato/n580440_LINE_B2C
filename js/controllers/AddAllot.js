"use strict";WeChat.controller("AddAllotCtrl",["$scope","$http","$cookies","$timeout","$mdSidenav","$mdUtil","$cacheFactory","$modal","$mdDialog",function(a,n,i,e,t,s,c,o,r){a.StoreUser=i.StoreUser,a.CompanyId=i.CompanyId,a.Unit=i.Unit,a.Maintenance=0,a.StoreUser=1,a.AppId=ApiMapper.AppId,a.OpenId=window.localStorage.getItem(a.AppId),a.EquipmentName="",a.OpenModalTag="Source",a.Parameters={MoveType:1,SourceId:i.UnitId,Source:i.Unit,TargetId:"",Target:"",Remark:"",EquipmentId:"",EquipmentName:""},a.StoreList=[],a.EquipmentList=[],a.isSubmit=!1,a.isWPStoreUser=!1,a.IsUItoWP=!1,a.IsAutoSetPosition=!1,"eb296708-6fc6-43f0-b506-0ca0fa91e1cd"!=a.CompanyId&&"6c690014-2571-48db-ac5a-c6ba2572a3bb"!=a.CompanyId&&"c1a24352-46a1-4301-9b96-a67c92691336"!=a.CompanyId||(a.isWPStoreUser=!0,a.IsUItoWP=!0),a.GetStore=function(){n({url:ApiMapper.sApi+"/s/unit/maps",method:"GET",cache:!0,contentType:"application/json",headers:{Passport:i.Passport}}).success(function(e){a.Unitdata=e,_(e[1]).each(function(t){a.UnitLeve4data=[],t.isSelected=!1,_(e[3]).each(function(e){a.UnitLeve4data.push(e),e.Level2==t.UnitId&&(e.Level2Name=t.Unit,e.isSelected=!1),e.UnitId==i.UnitId&&(a.RepairParameters.SourceId=e.UnitId,a.RepairParameters.Source=e.Unit)}),a.StoreList.push(t)}),a.GetEquipment(i.UnitId)}).error(function(e){alert("获取部门信息错误！")})},a.GetStore(),a.GetEquipment=function(e){var t={UnitId:a.Parameters.SourceId,TopicType:1,Maintenance:a.Maintenance};"eb296708-6fc6-43f0-b506-0ca0fa91e1cd"!=a.CompanyId&&"6c690014-2571-48db-ac5a-c6ba2572a3bb"!=a.CompanyId&&"c1a24352-46a1-4301-9b96-a67c92691336"!=a.CompanyId||(t.TopicType=3,a.EquipmentList[0]={EquipmentTypeClass:0,ClassName:"设备",children:[]},a.EquipmentList[1]={EquipmentTypeClass:1,ClassName:"设施",children:[]},a.GetFacilities()),n({url:ApiMapper.sApi+"/s/equipment/classification",method:"POST",contentType:"application/json",headers:{Passport:i.Passport},data:JSON.stringify(t)}).success(function(e){a.EquipmentList=[{EquipmentTypeClass:0,ClassName:"设备",children:[]},{EquipmentTypeClass:1,ClassName:"设施",children:[]},{EquipmentTypeClass:2,ClassName:"资讯",children:[]},{EquipmentTypeClass:99,ClassName:"其它",children:[]}],"eb296708-6fc6-43f0-b506-0ca0fa91e1cd"==a.CompanyId||"6c690014-2571-48db-ac5a-c6ba2572a3bb"==a.CompanyId||"c1a24352-46a1-4301-9b96-a67c92691336"==a.CompanyId?a.EquipmentList[0].children=e:(_(e).each(function(t){var e=t.children;_(e).each(function(n){n.EquipmentTypeName=t.EquipmentTypeName;var e=n.EquipmentCode.split("-");n.SortNo=parseInt(e[1]),a.EquipmentList.forEach(function(e,t){e.EquipmentTypeClass==n.EquipmentTypeClass&&a.EquipmentList[t].children.push(n)})})}),_(a.EquipmentList).each(function(e){e.children=_.sortBy(e.children,"SortNo")})),console.log(a.EquipmentList)})},a.GetFacilities=function(){var e={UnitId:a.Parameters.SourceId,TopicType:4,Maintenance:a.Maintenance};n({url:ApiMapper.sApi+"/s/equipment/classification",method:"POST",contentType:"application/json",headers:{Passport:i.Passport},data:JSON.stringify(e)}).success(function(e){_(e).each(function(n){var e=n.children;_(e).each(function(e){e.EquipmentTypeName=n.EquipmentTypeName;var t=e.EquipmentCode.split("-");e.SortNo=parseInt(t[1]),a.EquipmentList[1].children.push(e)})})})},a.toggleRight=function(e){a.OpenModalTag=e,console.log("open",e),"EQ"!==e&&"Area"!==e?t("Store").toggle():t("EQ").toggle()},a.closeDenav=function(e){console.log("close",e),"EQ"!==e&&"Area"!==e?(_(a.UnitLeve4data).each(function(e){e.isSelected=!1}),t("Store").close()):t("EQ").close()},a.store_close=function(e){t("Store").close().then(function(){""!=e&&("Source"===a.OpenModalTag?(a.Parameters.SourceId=e.UnitId,a.Parameters.Source=e.Unit,a.GetEquipment(e.UnitId)):"Target"===a.OpenModalTag&&(a.Parameters.TargetId=e.UnitId,a.Parameters.Target=e.Unit))})},a.EQ_close=function(e){t("EQ").close().then(function(){})},a.AreaIds=[],a.ProvinceIds=[],a.isSelectLeve2=function(t){_(a.Unitdata[1]).each(function(e){e.isSelected=!1,e.UnitId==t.UnitId&&(t.isSelected=!t.isSelected)}),t.isSelected&&(a.AreaIds=[t.UnitId],a.ProvinceIds=[]),a.UnitLeve3data=_(a.Unitdata[2]).filter(function(e){return e.Level2==t.UnitId})},a.isSelectLeve3=function(t){_(a.Unitdata[2]).each(function(e){e.isSelected=!1,e.UnitId==t.UnitId&&(t.isSelected=!t.isSelected)}),t.isSelected&&(a.ProvinceIds=[t.UnitId])},a.reLoadLeve4=function(){a.UnitLeve4data=_(a.Unitdata[3]).filter(function(e){return 0<a.ProvinceIds.length?e.Level3==a.ProvinceIds[0]:e.Level2==a.AreaIds[0]})},a.isSelectLeve4=function(t){_(a.UnitLeve4data).each(function(e){e.isSelected=!1,e.UnitId==t.UnitId&&(t.isSelected=!t.isSelected)}),t.isSelected&&("Source"===a.OpenModalTag?(a.Parameters.SourceId=t.UnitId,a.Parameters.Source=t.Unit,a.GetEquipment(t.UnitId)):"Target"===a.OpenModalTag&&(a.Parameters.TargetId=t.UnitId,a.Parameters.Target=t.Unit))},a.ShowArea=function(e,t){a.Parameters.EquipmentId=e.EquipmentId,a.EquipmentName=e.EquipmentName,a.EQ_close("")},a.Submit_Allot=function(){""==a.Parameters.EquipmentId?alert("请选择调拨品项"):n({url:ApiMapper.sApi+"/s/moveOder/create",method:"POST",contentType:"application/json",headers:{Passport:i.Passport},data:a.Parameters}).success(function(e){a.isSubmit=!1,alert("调拨成功！详情请只调拨列表查看。"),a.Parameters={MoveType:1,SourceId:i.UnitId,Source:i.Unit,TargetId:"",Target:"",Remark:"",EquipmentId:""}}).error(function(e){a.isSubmit=!1,alert(e.Messages)})}}]);
//# sourceMappingURL=AddAllot.js.map
