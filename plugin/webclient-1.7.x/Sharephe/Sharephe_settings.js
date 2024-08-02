i2b2.Sharephe.settings = {};
i2b2.Sharephe.settings.apikey = {};
i2b2.Sharephe.settings.apikey.fetch = function () {
    let usr = i2b2.h.getUser();
    let recList = i2b2.PM.ajax.getAllParam("PM:Admin", {table: "user_param", id_xml: "<user_name>" + usr + "</user_name>"});
    recList.parse(usr);

    let user_params = recList.model;
    if (user_params) {
        for (let i = 0; i < user_params.length; i++) {
            let param = user_params[i];
            if (param.name === 'shp_api_key') {
                i2b2.Sharephe.user.params.apikey.param = param;
                jQuery('#Sharephe-ApiKey').val(param.value);
                break;
            }
        }
    }
};

i2b2.Sharephe.settings.apikey.refresh = function (tvNode, onCompleteCallback) {
    // fetch updated user parameter
    i2b2.Sharephe.settings.apikey.fetch();

    const apiParam = i2b2.Sharephe.user.params.apikey.param;
    if (apiParam) {
        jQuery('#Sharephe-ApiKey').val(apiParam.value);
    }

    i2b2.Sharephe.rest.apikey.verify(i2b2.Sharephe.workbook.sync);

    if (onCompleteCallback) {
        onCompleteCallback();
    }

    jQuery('#Sharephe-SetApiKey').prop('disabled', true);

    alert('API key set!');
};

i2b2.Sharephe.settings.apikey.add = function () {
    const inputApiKey = jQuery('#Sharephe-ApiKey').val().trim();
    if (!inputApiKey || inputApiKey.length === 0) {
        return;
    }

    const apiParam = i2b2.Sharephe.user.params.apikey.param;
    if (apiParam) {
        if (apiParam.value === inputApiKey) {
            jQuery('#Sharephe-SetApiKey').prop('disabled', true);
            jQuery('#Sharephe-ApiKey').val(apiParam.value);
            alert('No change detected.');

            return;
        }
    }

    let userData = {};
    userData.name = 'shp_api_key';
    userData.datatype = 'T';
    userData.value = inputApiKey;
    if (apiParam) {
        userData.id = apiParam.id;
    }

    let t = (userData.id) ? 'id="' + userData.id + '"' : '';
    let userName = '<user_name>' + i2b2.h.getUser() + '</user_name>';
    let mx = userName + '<param ' + t + ' datatype="' + userData.datatype + '" name="' + userData.name + '">' + userData.value + '</param>';
    i2b2.PM.ajax.setParam("PM:Admin", {table: 'user_param', msg_attrib: '', msg_xml: mx}, i2b2.Sharephe.settings.apikey.refresh);
};