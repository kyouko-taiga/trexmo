(function(trexmo, $, undefined) {
    // Trexmo API object
    (function(api) {
        // API settings
        api.version  = '1.0'
        api.location = '/'

        api.get = function(endpoint, settings) {
            return _ajax(endpoint, 'GET', settings)
        }

        api.post = function(endpoint, settings) {
            return _ajax(endpoint, 'POST', settings)
        }

        api.delete = function(endpoint, settings) {
            return _ajax(endpoint, 'DELETE', settings)
        }

        // Call the API synchronously with method GET on the given endpoint.
        api.get_sync = function(endpoint, params) {
            var response = null
            $.ajax({
                url: api.location + endpoint,
                data: params || '',
                async: false,
                success: function(data) {
                    response = data
                }
            })
            return response
        }

        // Calls the API with the given method, at the given enpoint.
        //
        // Unless `error` is specified in the optional settings, api errors
        // will be reported as an application alert. Please refer to the
        // documentation of jQuery.ajax for an exhaustive documentation of
        // optional settings.
        function _ajax(endpoint, method, settings) {
            settings.url = api.location + endpoint
            settings.method = method
            settings.error = settings.error || function(xhr) {
                var error = xhr.responseJSON
                trexmo.alert(error.status + ' (' + error.code + ')')
            }

            return $.ajax(settings)
        }
    }(trexmo.api = trexmo.api || {}));

    // Loading indicator
    (function(loading) {
        var _enabled = false

        loading.show = function() {
            _enabled = true
            $('.la-anim-10').addClass('la-animate')
            // classie.add(document.querySelector('.la-anim-10'), 'la-animate')
        }

        loading.hide = function() {
            _enabled = true
            $('.la-anim-10').removeClass('la-animate')
        }
    }(trexmo.loading = trexmo.loading || {}))

    // Notifies an alert on the user interface
    trexmo.alert = function(message, level) {
        var notification = new NotificationFx({
        	message : '<p>' + message + '</p>',
        	layout : 'growl',
        	effect : 'scale',
        	type : level || 'error'
        })
        notification.show()
    }
}(window.trexmo = window.trexmo || {}, jQuery));
