$(document).ready(function() {
  $('#calendar').fullCalendar({
  	header: {
    	left: 'title',
    	center: '',
    	right: 'month,agendaDay today prev,next'
		},
  	lang: 'ko',
		dayClick: function(date, jsEvent, view) {
		$('#calendar').fullCalendar('changeView', 'agendaDay');
		$('#calendar').fullCalendar('gotoDate', date);
   }
	});
});