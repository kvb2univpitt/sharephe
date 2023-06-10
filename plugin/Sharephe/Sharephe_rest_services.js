i2b2.Sharephe.rest = {};
i2b2.Sharephe.rest.url = 'http://localhost/sharephe/api';

i2b2.Sharephe.rest.workbook = {};
i2b2.Sharephe.rest.workbook.fetchList = function (successHandler, errorHandler) {
    const apikey = (i2b2.Sharephe.user.params.apikey.param) ? i2b2.Sharephe.user.params.apikey.param.value : '';
    jQuery.ajax({
        type: 'GET',
        dataType: 'json',
        url: i2b2.Sharephe.rest.url + '/workbook',
        headers: {'x-api-key': apikey},
        success: successHandler,
        error: errorHandler
    });
};

i2b2.Sharephe.rest.apikey = {};
i2b2.Sharephe.rest.apikey.verify = function (callback) {
    const apikey = (i2b2.Sharephe.user.params.apikey.param) ? i2b2.Sharephe.user.params.apikey.param.value : '';
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