WeChat
.filter('i18n', ['$translate', function ($translate) {
	return function(key) {
		if (key) {
			return $translate.instant(key);
		}
	}
}])
.factory('i18n', ['$translate', function($translate) {
	var t = {
		t: function(key) {
			if (key) {
				return $translate.instant(key);
			}
			return key;
		}
	}
	return t;
}]);
