$('#modal-new-scenario .form-submit').on('click', function(e) {
    e.preventDefault()

    trexmo.api.post('scenario/', {
        data: $('#form-new-scenario').serialize(),
        success: function(data) {
            location.reload()
        },
        error: function(xhr, status, data) {
            $('#modal-new-scenario .help-block').remove()
            $('#modal-new-scenario .form-group').removeClass('has-error')

            var error = xhr.responseJSON
            for(var field in error.payload) {
                $('#input-' + field).parents('.form-group').addClass('has-error')
                $('#input-' + field).parent().append('<span class="help-block">' + error.payload[field] +'</span>')
            }
        }
    })
})


$('.scenario .scenario-delete').on('click', function(e) {
    var sid = $(e.target).parents('.scenario').attr('id')
    sid = sid.substr(sid.indexOf('-') + 1);

    trexmo.api.delete('scenario/' + sid, {
        success: function(data) {
            location.reload()
        },
        error: function(xhr, status, data) {
            // chemitool.ui.notify_error(xhr.responseText);
            trexmo.alert('<p>An error occured (' + xhr.status + ')</p>')
        }
    })
})


$('.scenario .scenario-edit').on('click', function(e) {
    var sid = $(e.target).parents('.scenario').attr('id')
    sid = sid.substr(sid.indexOf('-') + 1)
    window.location.href = '/scenario/' + sid
})
