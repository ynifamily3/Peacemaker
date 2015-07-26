var app = angular.module('loginValidation', []);

app.controller('loginController', ['$scope', function($scope) {
	$scope.user = {};
}]);

$('#login-form').submit(function() {
	$.ajax({
		type: 'POST',
		url: '/user/login',
		data: $('form').serialize(),
		success: function(data) {
			if (data.status == 'success') {
				window.location.replace('/dashboard');
			} else {
				$('.alert-invalid-value').removeClass('hidden');
			};
		}
	});
	return false;
});