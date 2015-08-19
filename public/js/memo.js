var selected = 'blue';
$('body').ready(function () {$('#inputMemo').focus();$('body').keydown(function () {$('#inputMemo').focus();}); $('.blue').css('border', '3px solid');});
function s(v) {
    $('.darkblue').css('border', 'none');
    $('.green').css('border', 'none');
    $('.yellow').css('border', 'none');
    $('.red').css('border', 'none');
    $('.blue').css('border', 'none');
    $('.' +  v).css('border', '3px solid');
    selected = v;
}