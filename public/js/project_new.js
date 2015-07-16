var app = angular.module('projectValidation', []);

app.controller('projectController', ['$scope', function($scope) {
	$scope.project = {};
}]);

app.directive('addr', function($q, $timeout) {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$asyncValidators.addr = function(modelValue, viewValue) {
				if (ctrl.$isEmpty(modelValue)) {
					return $q.when();
				}
				var def = $q.defer();
				$timeout(function() {
					$.ajax({
						type: 'POST',
						url: '/project/is_exist',
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

$('#project-form').submit(function() {
	$.ajax({
		type: 'POST',
		url: '/project/new',
		data: $('form').serialize(),
		success: function(data) {
			if (data.status == 'success') {
				window.location.replace('/dashboard');
			} else {
				if (data.err == 'invalid_captcha') {
					$('.alert-invalid-captcha').removeClass('hidden');
				};
			};
		}
	});
	return false;
});