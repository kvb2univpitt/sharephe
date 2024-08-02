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
            if (data && data.isValid) {
                i2b2.sharephe.user.isAuthenticated = true;
            } else {
                i2b2.sharephe.user.isAuthenticated = false;
            }
        },
        error: function () {
            i2b2.sharephe.user.isAuthenticated = false;
        },
        complete: function () {
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }
    });
};

// workbook REST API
i2b2.sharephe.rest.workbook = {};
i2b2.sharephe.rest.workbook.fetchList = function (successHandler, errorHandler) {
    let api_key = '';
    const apikey = (api_key) ? api_key : '';
    $.ajax({
        type: 'GET', // For jQuery < 1.9
        method: 'GET',
        cache: false,
        url: i2b2.sharephe.rest.url + '/workbooks?source=web',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + apikey
        },
        success: successHandler,
        error: errorHandler
    });
};