i2b2.Sharephe.rest = {};
i2b2.Sharephe.rest.url = 'http://localhost/sharephe/api';

i2b2.Sharephe.rest.workbook = {};
i2b2.Sharephe.rest.workbook.fetchList = function (successHandler, errorHandler) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        url: i2b2.Sharephe.rest.url + '/workbooks',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        success: successHandler,
        error: errorHandler
    });
};
i2b2.Sharephe.rest.workbook.fetch = function (encodedPhenotypeId, successHandler, errorHandler) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/workbooks/' + encodedPhenotypeId,
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        success: successHandler,
        error: errorHandler
    });
};
i2b2.Sharephe.rest.workbook.save = function (formData, successHandler, errorHandler) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        method: 'POST',
        type: 'POST', // For jQuery < 1.9
        url: i2b2.Sharephe.rest.url + '/workbooks',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        data: formData,
        enctype: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        success: successHandler,
        error: errorHandler
    });
};

i2b2.Sharephe.rest.apikey = {};
i2b2.Sharephe.rest.apikey.verify = function (callback) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/key/verify',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + btoa(apikey + ':')
        },
        success: function (data) {
            if (data && data.isValid) {
                i2b2.Sharephe.user.isAuthenticated = true;
            } else {
                i2b2.Sharephe.user.isAuthenticated = false;
            }
        },
        error: function () {
            i2b2.Sharephe.user.isAuthenticated = false;
        },
        complete: function () {
            if (callback) {
                callback();
            }
        }
    });
};

i2b2.Sharephe.rest.queryDetail = {};
i2b2.Sharephe.rest.queryDetail.fetchConcepts = function (term, successHandler, errorHandler) {
    jQuery.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/terms',
        headers: {
            'Accept': 'application/json'
        },
        data: {
            hlevel: term.hlevel,
            parent: term.key
        },
        success: successHandler,
        error: errorHandler
    });
};