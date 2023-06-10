i2b2.Sharephe.user = {
    isAuthenticated: false,
    params: {
        apikey: {
            param: null
        }
    },
    clear: function () {
        i2b2.Sharephe.user.isAuthenticated = false;
        i2b2.Sharephe.user.params.apikey.param = null;
    }
};

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

i2b2.Sharephe.tab = {};
i2b2.Sharephe.tab.enable = function (id) {
    document.getElementById(id).style.pointerEvents = "auto";
    document.getElementById(id).style.cursor = "pointer";
};
i2b2.Sharephe.tab.disable = function (id) {
    document.getElementById(id).style.pointerEvents = "none";
    document.getElementById(id).style.cursor = "default";
};
i2b2.Sharephe.tab.enableDisableBasedOnAuthentication = function () {
    if (i2b2.Sharephe.user.isAuthenticated) {
        i2b2.Sharephe.tab.enable('Sharephe-TAB1');
    } else {
        i2b2.Sharephe.tab.disable('Sharephe-TAB1');
    }
    i2b2.Sharephe.tab.disable('Sharephe-TAB2');
};

i2b2.Sharephe.Init = function (loadedDiv) {
    // tabs event handler
    this.yuiTabs = new YAHOO.widget.TabView("Sharephe-TABS", {activeIndex: 0});
    this.yuiTabs.on('activeTabChange', function (evt) {
        switch (evt.newValue.get('id')) {
            case "Sharephe-TAB0":
                break;
            case "Sharephe-TAB1":
                break;
            case "Sharephe-TAB2":
                break;
        }
    });

    // event handlings
    jQuery('#Sharephe-Settings').click(i2b2.Sharephe.event.settings.actionHandler);
    jQuery('#Sharephe-ShowHideApiKey').click(i2b2.Sharephe.event.settings.apikey.showHideApiKeyHandler);
    jQuery('#Sharephe-SetApiKey').click(i2b2.Sharephe.event.settings.apikey.setApiKeyHandler);
    jQuery('#Sharephe-SyncFromCloud').click(i2b2.Sharephe.event.syncFromCloud.actionHandler);
    jQuery('#Sharephe-ApiKey').keyup(i2b2.Sharephe.event.settings.apikey.keyupHandler);

    i2b2.Sharephe.datatable = jQuery('#Sharephe-WorkbookTable').DataTable({
        "columnDefs": [{
                "targets": [0, 5],
                "orderable": false
            }]
    });

    i2b2.Sharephe.settings.apikey.fetch();
    i2b2.Sharephe.rest.apikey.verify(i2b2.Sharephe.tab.enableDisableBasedOnAuthentication);

    jQuery('#Sharephe-SyncFromCloud').click();
};

i2b2.Sharephe.Unload = function () {
    i2b2.Sharephe.user.clear();

    return true;
};