(function(yaffel, undefined) {
    // define the regular expressions used to tokenize yaffel expressions
    yaffel.lexer = {
        rules: {
            space:    /[ \t\r\n]+/,
            number:   /-?(0|([1-9][0-9]*))(\.[0-9]+)?([Ee][+-][0-9]+)?/g,
            string:   /"[^"]*"/g,
            operator: /(\*\*)|([><=!]=)|( and )|( or )|( not )|( in )|[{}\[\]\(\)\-\+\*/=><\.,:]/g,
            id:       /[A-Za-z_][A-Za-z_0-9]*/g
        }
    };

    yaffel.yaffelize = function(val, type) {
        switch(type) {
            case 'str': return '"' + val + '"';
            default: return val;
        }
    }

    yaffel.eval = function(expression) {
        var response = null
        trexmo.api.post('yaffel/eval', {
            async: false,
            data: expression,
            contentType: 'application/x-yaffel',
            success: function(data) { response = data.value; }
        });
        return response;
    };
}(window.yaffel = window.yaffel || {}));
