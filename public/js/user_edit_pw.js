var app = angular.module('pwValidation', []);

app.controller('pwController', ['$scope', function($scope) {
	$scope.user = {};
}]);

$('#pw-form').submit(function() {
	$.ajax({
		type: 'POST',
		url: '/user/edit/pw',
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

$('#checkPW').click(function() {
	if ($(this).is(':checked')) {
		$('#pwShow').removeClass('hidden');
	} else {
		$('#pwShow').addClass('hidden');
	};
});