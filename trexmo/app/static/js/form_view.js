var parse_variables = function(expression) {
    // extract the identifiers (variables) from the yaffel expression
    var rules = yaffel.lexer.rules;
    var pexpr = expression.replace(rules.string, ' ').replace(rules.operator, ' ');

    // We'd like to ensure the same variable is not listed twice. We achieve
    // this by the use of an object, as a trick to replace the proper set
    // implementation standard Javascript still lacks of.
    var ids = Object.create(null);
    pexpr.match(rules.id).forEach(function(id) { ids[id] = true; })   

    return ids; 
}

var FieldPrecondition = function(expression, targets) {
    this.expression = expression;
    this.variables  = parse_variables(expression);
    this.targets    = targets || [];
    this.value      = undefined;
}

var FormView = function(selector) {
    this.selector = selector;
    this.name = selector.attr('id');
    this.data = null;

    // We store preconditions as a dictionary indexed by the unparsed string
    // expression of the precondition themselves. One could argue that this
    // unecessery stores the expression twice, as it is also stored in the
    // precondition class.
    // We chose to implement the index this way so it is easy to retrieve a
    // precondition object from its unparsed string.
    this.preconditions = {};

    var self_ = this;
    var dependency_fields = {};

    // hide the selection for dropdown that have no selected value yet
    self_.selector.find('select:not(:has(option[selected]))').prop('selectedIndex', -1);

    function uniq_sel(a) {
        var output = [];

        for (var i = 0; i < a.length; ++i) {
            var duplicate = false;
            for (var j = 0; j < output.length; ++j) {
                if (output[j].is(a[i])) {
                    duplicate = true;
                    break;
                }
            }

            if (!duplicate) { output.push(a[i]); }
        }

        return output;
    }

    function build_context(variables) {
        // do nothing if there are no variables
        if($.isEmptyObject(variables)) { return ''; }

        ctx = ' for ';

        // append the value of each variable to the context
        for(var v in variables) {
            var f = self_.selector.find('.form-control[name="' + v + '"]');
            ctx += v + '=' + yaffel.yaffelize(f.val(), f.attr('data-type')) + ', ';
        }

        // remove the trailing comma
        ctx = ctx.replace(/(,\s*$)/g, '');

        return ctx;
    }

    // Evaluate the constraints of a field, and display an error message if
    // they are not satisfied.
    function check_constraints(form_control) {
        var field_name = form_control.attr('name');
        var satisfied = true;

        $.each(self_.data.fields[field_name].constraints, function(_, cst) {
            // parse the expression variables (if any)
            cst = cst.replace('self', field_name);
            var variables = parse_variables(cst);

            // append the expression context
            cst += build_context(variables);

            // evaluate the constraint
            satisfied &= (yaffel.eval(cst) || false);
        });

        // notify the error if preconditions are not satisfied
        form_control.siblings('.help-block').remove();
        if(satisfied) {
            form_control.parents('.form-group').removeClass('has-error');
        } else {
            form_control.parents('.form-group').addClass('has-error');
            form_control.after(
                $('<p class="help-block">').append(
                    '<em>Some of these constraints are not satisfied: </em>',
                    self_.data.fields[field_name].constraints.join(', ')
                )
            );
        }

        return satisfied;
    }

    // (Re-)evaluate the preconditions associated with the given form control,
    // and update the form view accordingly.
    function update_precondition(form_control) {
        // store the list of elements that might be toggled
        var elements_to_update = [];

        // for each precondition depending on this field
        var plist = dependency_fields[form_control.attr('name')];
        for(var i = 0, len = plist.length; i < len; i++) {
            // get the precondition unparsed expression
            var xpr = plist[i].expression;

            // append the expression context
            xpr += build_context(plist[i].variables);

            // evaluate the precondition and update its value
            var val = yaffel.eval(xpr);
            if(val != plist[i].value) {
                plist[i].value = val;
                elements_to_update = elements_to_update.concat(plist[i].targets);
            }
        }

        // update elements that might be toggled
        $.each(uniq_sel(elements_to_update), function(i, sel) {
            // evaluate the satisfaction of preconditions
            var satisfied = true;
            sel.data('preconditions').forEach(function(pcd) {
                satisfied &= (self_.preconditions[pcd].value || false);
            });

            if (sel.hasClass('form-control')) {
                sel = sel.parents('.form-group');
            }

            // update the element display
            if(satisfied) {
                sel.prop('disabled', false).fadeIn();
            } else {
                sel.prop('disabled', true).fadeOut();
            }
        });
    }

    // API handler that processes the form data recieved asynchronously and
    // complete the initialization of this FormView.
    function init(data, text_status, xhr) {
        self_.data = data;

        function register_precondition(pcd, target) {
            // check if the same precondition hash't been parsed yet
            if(pcd in self_.preconditions) {
                // simply add a target to the already parsed precondition
                self_.preconditions[pcd].targets.push(target);
            } else {
                // create a new precondition object
                var pcd_ = new FieldPrecondition(pcd, [target]);
                self_.preconditions[pcd] = pcd_;

                // for each variable of the precondition, we store the list
                // of preconditions depending on their value
                for(var v in pcd_.variables) {
                    dependency_fields[v] = dependency_fields[v] || [];
                    dependency_fields[v].push(pcd_);
                }
            }
        }

        // build the constraints and preconditions indexes
        for(var field_name in data.fields) {
            var field = data.fields[field_name];
            var target = self_.selector.find('.form-control[name="' + field_name + '"]');
            target.data('preconditions', field.preconditions);

            // register the constraints
            if (field.constraints.length > 0) {
                target.change(function() { check_constraints($(this)); });
            }

            // process the field precontiions
            $.each(field.preconditions, function(_, pcd) {
                register_precondition(pcd, target);
            });

            // process the option preconditions
            option_selectors = target.find('option');
            for (var i = 0; i < option_selectors.length; ++i) {
                var option = field.options[i];
                target = $(option_selectors[i]);
                target.data('preconditions', option.preconditions);

                $.each(option.preconditions, function(_, pcd) {
                    register_precondition(pcd, target);
                });
            }
        } 

        // bind the necessary handlers to update preconditions on field update
        for(var field_name in dependency_fields) {
            var form_control = self_.selector.find('.form-control[name="' + field_name + '"]');
            form_control.change(function() { update_precondition($(this)); });

            // trigger the update once in order to initialize the form view
            update_precondition(form_control);
        }

        // clear the custom input if the user select an pre-defined value
        self_.selector.find('select').change(function(e) {
            $('input[name="' + $(this).attr('name') + '_alt"]').val(null);
        });
        self_.selector.find('input[name$="_alt"]').change(function(e) {
            $('select[name="' + $(this).attr('name').replace('_alt', '') + '"]').val(null);
        });
    }

    this.validate = function() {
        var satisfied = true;
        for(var field_name in self_.data.fields) {
            var target = self_.selector.find('.form-control[name="' + field_name + '"]');

            // skip the validation if the input is not visible
            if (target.is(':visible')) {
                satisfied &= check_constraints(target);
            }
        }
        return satisfied;
    }

    // retrieve the from description data and finishi initalizing the view with
    trexmo.api.get('forms/' + this.name, {
        headers: { 'Accept': 'application/json' },   
        success: function(data, st, xhr) { init(data, st, xhr); }
    });
}
