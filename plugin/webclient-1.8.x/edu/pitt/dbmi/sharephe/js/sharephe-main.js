if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

i2b2.sharephe.user = {};
i2b2.sharephe.user.isAuthenticated = false;
i2b2.sharephe.user.apiKey = {
    id: null,
    value: ''
};

i2b2.sharephe.settings = {};
i2b2.sharephe.settings.apikey = {};
i2b2.sharephe.settings.apikey.fetch = function () {
    i2b2.authorizedTunnel.function["i2b2.h.getUser"]().then(username => {
        const params = {
            table: "user_param",
            param_xml: "",
            id_xml: `<user_name>${username}</user_name>`
        };
        i2b2.ajax.PM.getAllParam(params).then(xmlString => {
            const data = $.parseXML(xmlString);
            const params = data.getElementsByTagName('param');
            for (const param of params) {
                let name = param.attributes['name'].value;
                if (name === 'shp_api_key') {
                    i2b2.sharephe.user.apiKey.id = param.attributes['id'].value;
                    i2b2.sharephe.user.apiKey.value = param.firstChild.nodeValue;
                }
            }

            i2b2.sharephe.rest.apikey.verify(i2b2.sharephe.event.phenotypes.syncFromCloud);
        });
    });
};
i2b2.sharephe.settings.apikey.set = function (apiKey) {
    i2b2.authorizedTunnel.function["i2b2.h.getUser"]().then(username => {
        const apiKeyId = i2b2.sharephe.user.apiKey.id;
        let payload = {
            table: "user_param",
            msg_attrib: "",
            msg_xml: apiKeyId
                    ? `<user_name>${username}</user_name><param id="${apiKeyId}" datatype="T" name="shp_api_key">${apiKey}</param>`
                    : `<user_name>${username}</user_name><param datatype="T" name="shp_api_key">${apiKey}</param>`
        };
        i2b2.ajax.PM.setParam(payload)
                .then(xmlString => i2b2.sharephe.settings.apikey.fetch())
                .catch(err => console.error(err));
    });
};

/**
 * Tabs
 */
i2b2.sharephe.tab = {};
i2b2.sharephe.tab.enable = function (id) {
    $(id).removeClass('disabled');
};
i2b2.sharephe.tab.disable = function (id) {
    $(id).addClass('disabled');
};
i2b2.sharephe.tab.enableDisableOnAuthentication = function () {
    const isAuthenticated = i2b2.sharephe.user.isAuthenticated;
    if (typeof isAuthenticated === 'undefined' || isAuthenticated === null || isAuthenticated === false) {
        i2b2.sharephe.tab.disable('#nav-workbook-tab');
    } else {
        i2b2.sharephe.tab.enable('#nav-workbook-tab');
    }
    i2b2.sharephe.tab.disable('#nav-query-details-tab');
};

const setActionListeners = function () {
    $('#sharephe-settings').click(i2b2.sharephe.event.settings.onclick);

    // api key
    $('#showhide-apiKey').click(i2b2.sharephe.event.settings.apiKey.showHide);
    $('#apiKey-set').click(i2b2.sharephe.event.settings.apiKey.setApiKey);

    // phenotypes (workbook list)
    $('#sync-from-cloud-btn').click(i2b2.sharephe.event.phenotypes.syncFromCloud);
//    $(document).on('click', '#sharephe-workbook-table tbody tr', sharephe.event.phenotypes.onclickTableRow);
};

// *********************** i2b2 plugin configurations **************************
// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", () => {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltips].map(tooltip => new bootstrap.Tooltip(tooltip));

    i2b2.sharephe.datatable = $('#sharephe-workbook-table').DataTable();

    setActionListeners();

    i2b2.sharephe.settings.apikey.fetch();
});