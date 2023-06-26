i2b2.Sharephe.rest = {};
i2b2.Sharephe.rest.url = 'http://localhost/sharephe/api';

i2b2.Sharephe.rest.workbook = {};
i2b2.Sharephe.rest.workbook.fetchList = function (successHandler, errorHandler) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        type: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/workbook',
        headers: {'x-api-key': apikey},
        success: successHandler,
        error: errorHandler
    });
};
i2b2.Sharephe.rest.workbook.fetch = function (encodedPhenotypeId, successHandler, errorHandler) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        type: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/workbook/' + encodedPhenotypeId,
        headers: {'x-api-key': apikey},
        success: successHandler,
        error: errorHandler
    });
};
i2b2.Sharephe.rest.workbook.save = function (formData, successHandler, errorHandler) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        url: i2b2.Sharephe.rest.url + '/workbook',
        headers: {'x-api-key': apikey},
        data: formData,
        enctype: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        type: 'POST', // For jQuery < 1.9
        success: successHandler,
        error: errorHandler
    });
};

i2b2.Sharephe.rest.apikey = {};
i2b2.Sharephe.rest.apikey.verify = function (callback) {
    const apikey = i2b2.Sharephe.user.params.apikey.getValue();
    jQuery.ajax({
        type: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/verify',
        headers: {'x-api-key': apikey},
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