if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

/**
 * REST API.
 */
i2b2.sharephe.rest = {};

i2b2.sharephe.rest.url = `http://localhost/sharephe/api`;

i2b2.sharephe.rest.apikey = {};
i2b2.sharephe.rest.apikey.verify = function (onCompleteCallback) {
    const apikey = i2b2.sharephe.user.apiKey.value;
    $.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        cache: false,
        dataType: 'json',
        url: i2b2.sharephe.rest.url + '/key/verify',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        success: function (data) {
            i2b2.sharephe.user.isAuthenticated = (data && data.isValid);
        },
        error: function () {
            i2b2.sharephe.user.isAuthenticated = false;
        },
        complete: function () {
            if (!i2b2.sharephe.user.isAuthenticated) {
                i2b2.sharephe.workbook.form.createNew();
                i2b2.sharephe.workbook.form.setInputFieldsReadOnly(true);
                $('#sharephe-workbook-submit-btn').hide();
            }
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }
    });
};

// workbook REST API
i2b2.sharephe.rest.workbook = {};
i2b2.sharephe.rest.workbook.fetchList = function (successHandler, errorHandler) {
    const apikey = i2b2.sharephe.user.apiKey.value;
    $.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        cache: false,
        url: i2b2.sharephe.rest.url + '/workbooks?source=web',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        success: successHandler,
        error: errorHandler
    });
};
i2b2.sharephe.rest.workbook.fetch = function (phenotypeId, successHandler, errorHandler) {
    phenotypeId = encodeURIComponent(encodeURIComponent(phenotypeId));
    const apikey = i2b2.sharephe.user.apiKey.value;
    jQuery.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        cache: false,
        dataType: 'json',
        url: i2b2.sharephe.rest.url + '/workbooks/' + phenotypeId + '?source=web',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        success: successHandler,
        error: errorHandler
    });
};
