var app = angular.module('registerValidation', []);

app.controller('registerController', ['$scope', function($scope) {
	$scope.user = {};
}]);

app.directive('username', function($q, $timeout) {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$asyncValidators.username = function(modelValue, viewValue) {
				if (ctrl.$isEmpty(modelValue)) {
					return $q.when();
				}
				var def = $q.defer();
				$timeout(function() {
					$.ajax({
						type: 'POST',
						url: '/user/is_exist',
						data: $('form').serialize(),
						success: function(data) {
							if (!data.exist) {
								def.resolve();
							} else {
								def.reject();
							};
						}
					});
				}, 2000);
				return def.promise;
			};
		}
	};
});

$('#register-form').submit(function() {
	$.ajax({
		type: 'POST',
		url: '/user/register',
		data: $('form').serialize(),
		success: function(data) {
			if (data.status == 'success') {
				window.location.replace('/user/login');
			} else {
				if (data.err == 'invalid_captcha') {
					$('.alert-invalid-captcha').removeClass('hidden');
				};
			};
		}
	});
	return false;
});

$('#checkPW').click(function() {
	if ($(this).is(':checked')) {
		$('#pwShow').removeClass('hidden');
	} else {
		$('#pwShow').addClass('hidden');
	};
});