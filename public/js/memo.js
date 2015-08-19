var selected = 'blue';
$('body').ready(function () {$('#inputMemo').focus();$('body').keydown(function () {$('#inputMemo').focus();}); $('.blue').css('border', '3px solid'); $('#memojang').submit(function (event) {
    event.preventDefault();
    if($('#inputMemo').val() !== "") {
        $.post("./memo", { project:$('#project').val(), color: selected, content: $('#inputMemo').val() })
            .done(function(data) {
                $('#inputMemo').val('');
                alert(data);
            });
    }
});});
function s(v) {
    $('.darkblue').css('border', 'none');
    $('.green').css('border', 'none');
    $('.yellow').css('border', 'none');
    $('.red').css('border', 'none');
    $('.blue').css('border', 'none');
    $('.' +  v).css('border', '3px solid');
    selected = v;
}
