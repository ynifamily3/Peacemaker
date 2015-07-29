var app = angular.module('profileValidation', []);

app.controller('profileController', ['$scope', function($scope) {
	$scope.user = {};
}]);

$('#profile-form').submit(function() {
	$.ajax({
		type: 'POST',
		url: '/user/edit/profile',
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
