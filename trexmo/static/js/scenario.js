(function(scenario, $, undefined) {
    var _changed = false

    scenario.id = $('.trexmo-scenario').attr('data-id')
    scenario.name = $('.trexmo-scenario').attr('data-name')

    // Initialize the form view for determinants
    scenario.form_view = new FormView($('#determinants > form'))

    // Set the save flag whenever the scenario is modified
    $('form').change(function() {
        _changed = true
        $('.scenario-name').html(scenario.name + ' (modified)')
        $('.scenario-reset').removeAttr('disabled')
        $('.scenario-save').removeAttr('disabled')
    })

    // Bind the scenario save button
    $('.scenario-save').click(function(e) {
        e.preventDefault()

        // Remove any error previously displayed
        $('.has-error .help-block').remove()
        $('.has-error.form-group').removeClass('has-error')

        // Check if the form view is valid
        if (!scenario.form_view.validate()) {
            return false
        }

        // Gather the data from the all forms (scenario + determinants)
        var formdata = []
        $('form').each(function(index) {
            $.merge(formdata, $(this).serializeArray())
        })

        // Update the scenario
        trexmo.loading.show()
        trexmo.api.post('scenario/' + scenario.id, {
            data: formdata,
            success: function(data) {
                _changed = false
                $('.scenario-name').html(scenario.name)
                $('.scenario-reset').attr('disabled', 'disabled')
                $('.scenario-save').attr('disabled', 'disabled')
                trexmo.alert('Changes successfull saved.', 'notice')
            },
            error: function(xhr, status, data) {
                var errors = xhr.responseJSON.payload
                for(var field_name in errors) {
                    var field = $('.form-control[name=' + field_name + ']')
                    field.parents('.form-group').addClass('has-error')
                    field.parent().append($('<span class="help-block">').html(errors[field_name]))
                }
            },
            complete: function() {
                trexmo.loading.hide()
            }
        })
    })

    // Bind the scenario save-as button
    $('.scenario-save-as').click(function(e) {
        e.preventDefault()

        // Check if the form view is valid
        if (!scenario.form_view.validate()) {
            return false
        }

        // Prompt the user for a scenario name
        var name = prompt('Name of the new scenario', scenario.name + ' (copy)')
        if (name === null) {
            return false
        }

        // Create a new scenario
        trexmo.loading.show()
        trexmo.api.post('scenario/', {
            data: $('#scenario-form').serialize() + '&name=' + name,
            success: function(resp) {
                // Update the new scenario with the date of the current one
                var formdata = []
                $('form').each(function(index) {
                    $.merge(formdata, $(this).serializeArray())
                })

                trexmo.api.post('scenario/' + resp.id, {
                    data: formdata,
                    success: function() {
                        window.location = '/scenario/' + resp.id
                    },
                    error: function(xhr, status, data) {
                        var errors = xhr.responseJSON.payload
                        for(var field_name in errors) {
                            var field = $('.form-control[name=' + field_name + ']')
                            field.parents('.form-group').addClass('has-error')
                            field.parent().append($('<span class="help-block">').html(errors[field_name]))
                        }
                    },
                    complete: function() {
                        trexmo.loading.hide()
                    }
                })
            },
            error: function() {
                trexmo.loading.hide()
            }
        })
    })

    // Bind the scenario run button
    $('.scenario-run').click(function(e) {
        e.preventDefault()

        if(_changed) {
            trexmo.alert(
                '<strong>The scenario was not executed.</strong>' +
                '<p>Please, save your changes before executing the scenario.</p>'
            )
            return false
        }

        // Run the scenario
        trexmo.loading.show()
        trexmo.api.get('run/' + scenario.id, {
            success: function(data) {
                // display response information
                var report = $('#report').html('<h4>Exposure situation report</h4>')

                report.append(
                    $('<div class="panel panel-info">').append(
                        $('<div class="panel-heading">General information</div>'),
                        $('<div class="panel-body">').append(
                            $('<dl>').append(
                                $('<dt>Name of the exposure situation</dt>'),
                                $('<dd>').html(data.scenario),
                                $('<dt>Model of exposure modelling</dt>'),
                                $('<dd>').html(data.model)
                            )
                        )
                    )
                )

                var detlst = $('<dl>')
                for(var det in data.determinants) {
                    // This is a trick to hide determinants that were not part
                    // of the model computation. However, this is not a viable
                    // solution, as it should be the job of the server.
                    var group = $('.form-control[name=' + det + ']').parents('.form-group')
                    if (!group.is(':visible')) {
                        continue
                    }

                    detlst.append(
                        $('<dt>').html(scenario.form_view.data.fields[det].label),
                        $('<dd>').html(data.determinants[det]))
                }

                report.append(
                    $('<div class="panel panel-info">').append(
                        $('<div class="panel-heading">Determinants</div>'),
                        $('<div class="panel-body">').append(detlst)
                    )
                )

                report.append(
                    $('<div class="panel panel-info">').append(
                        $('<div class="panel-heading">Results</div>'),
                        $('<div class="panel-body">').append(data.result)
                    )
                )

                report.parent().append(
                    $('<div>').append(
                        $('<button class="btn btn-default">')
                            .text('Save as PDF')
                            .click(function(e) {
                                e.preventDefault()

                                var pdf = new jsPDF('p', 'pt', 'a4')
                                pdf.fromHTML(report.get(0), 15, 15, {
                                })
                                pdf.save('report.pdf')
                            })
                    )
                )

                // Show the report tab
                $('.scenario-model-data .scenario-model-report').tab('show')
            },
            complete: function() {
                trexmo.loading.hide()
            }
        })
    })

    // Bind the scenario reset button
    $('.scenario-reset').click(function(e) {
        e.preventDefault()

        _changed = false
        location.reload()
    })

    // Prevent the model from being translated if there are pending changes
    var model_control = $('#model')
    model_control.data('last', model_control.val())

    // Bind the scenario translation
    model_control.change(function() {
        if(_changed) {
            trexmo.alert(
                '<strong>The scenario was not executed.</strong>' +
                '<p>Please, save your changes before executing the scenario.</p>'
            )

            model_control.val(model_control.data('last'))
            return false
         }

         // Translate the scenario.
         trexmo.loading.show();
         trexmo.api.get('translate/' + scenario.id + '/' + model_control.val(), {
             success: function(data) {
                 // Change the "last" value to handle next change
                 model_control.data('last', model_control.val())

                 // Update the form view
                 $('#determinants').html(data)
                 scenario.form_view = new FormView($('#determinants > form'))

                 $('.scenario-model-data .scenario-model-determinants').tab('show')
             },
             error: function(xhr) {
                 var error = xhr.responseJSON
                 trexmo.alert(
                     '<strong>The translation failed.</strong>' +
                     '<p>' + error.status + ' (' + error.code + ')' + '</p>'
                 )
                 model_control.val(model_control.data('last'))
             },
             complete: function() {
                 trexmo.loading.hide()
             }
         })
    })

    // Ask for user confirmation if there are unsaved changes
    window.onbeforeunload = function() {
        if(_changed) {
            return "Changes will be lost if you don't save your scenario."
        }
    }
}(window.scenario = window.scenario || {}, jQuery));
