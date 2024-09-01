if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

i2b2.sharephe.params = {};
i2b2.sharephe.params.resultWaitTime = 180;

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
            const params = Array.from(data.getElementsByTagName('param'));
            params.forEach(param => {
                const id = param.attributes['id'];
                const datatype = param.attributes['datatype'];
                const name = param.attributes['name'];
                if (id && datatype && name) {
                    if (name.value === 'shp_api_key') {
                        const value = param.firstChild;

                        i2b2.sharephe.user.apiKey.id = id.value;
                        i2b2.sharephe.user.apiKey.value = (value && value !== null) ? param.firstChild.nodeValue : '';
                    }
                }
            });

            i2b2.sharephe.rest.apikey.verify(i2b2.sharephe.event.phenotypes.syncFromCloud);
        });
    });
};
i2b2.sharephe.settings.apikey.set = function (newApiKey) {
    i2b2.authorizedTunnel.function["i2b2.h.getUser"]().then(username => {
        const apiKeyId = i2b2.sharephe.user.apiKey.id;
        let payload = {
            table: "user_param",
            msg_attrib: "",
            msg_xml: apiKeyId
                    ? `<user_name>${username}</user_name><param id="${apiKeyId}" datatype="T" name="shp_api_key">${newApiKey}</param>`
                    : `<user_name>${username}</user_name><param datatype="T" name="shp_api_key">${newApiKey}</param>`
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
i2b2.sharephe.tab.enableDisableDetailTab = function () {
    let hasQuery = false;
    for (let i = 0; i < i2b2.sharephe.workbook.form.queryXmls.length; i++) {
        if (i2b2.sharephe.workbook.form.queryXmls[i]) {
            hasQuery = true;
            break;
        }
    }

    if (hasQuery) {
        i2b2.sharephe.tab.enable('#nav-query-details-tab');
    } else {
        i2b2.sharephe.tab.disable('#nav-query-details-tab');
    }
};

/**
 * Phenotypes (workbook list).
 */
i2b2.sharephe.phenotypes = {};
i2b2.sharephe.phenotypes.refresh = function () {
    const successHandler = function (workbooks) {
        setTimeout(function () {
            i2b2.sharephe.datatable.clear();
            workbooks.forEach(function (workbook) {
                i2b2.sharephe.datatable.row.add([
                    workbook.phenotypeId,
                    workbook.type,
                    workbook.title,
                    workbook.authors.join(', '),
                    workbook.institution,
                    workbook.files.join(', ')
                ]);
            });

            i2b2.sharephe.datatable.draw();
        }, 500);
    };
    const errorHandler = function () { };
    i2b2.sharephe.rest.workbook.fetchList(successHandler, errorHandler);
};

i2b2.sharephe.setActionListeners = function () {
    $(document).on('click', '#sharephe-settings', i2b2.sharephe.event.settings.onclick);

    // api key
    $(document).on('click', '#showhide-apiKey', i2b2.sharephe.event.settings.apiKey.showHide);
    $(document).on('click', '#apiKey-set', i2b2.sharephe.event.settings.apiKey.setApiKey);

    // phenotypes (workbook list)
    $(document).on('click', '#sync-from-cloud-btn', i2b2.sharephe.event.phenotypes.syncFromCloud);
    $(document).on('click', '#sharephe-workbook-table tbody tr', i2b2.sharephe.event.phenotypes.onclickTableRow);

    // workbook form: add, edit and cancel edit
    $(document).on('click', '#sharephe-workbook-create-btn', i2b2.sharephe.event.workbook.form.onclickCreate);
    $(document).on('click', '#sharephe-workbook-edit-btn', i2b2.sharephe.event.workbook.form.onclickEdit);
    $(document).on('click', '#sharephe-workbook-cancel-btn', i2b2.sharephe.event.workbook.form.onclickCancelEdit);

    // workbook from: attachement
    $(document).on('change', '#workbook_files', i2b2.sharephe.event.workbook.form.onchangeAddAttachments);

    // workbook form validation checkbox
    $(document).on('click', '#workbook_is_validated', i2b2.sharephe.event.workbook.form.validation.onchangeCheckbox);

    // query XML view
    $(document).on('click', '#sharephe-query-copy-clipboard', i2b2.sharephe.event.queryXml.onclickCopyAndPaste);

    // detail tab on show
    $(document).on('show.bs.tab', '#nav-query-details-tab', i2b2.sharephe.event.tab.details.onShow);

    // detail tab: copy and export data
    $(document).on('click', '#sharephe-copy-details', i2b2.sharephe.event.queryXml.details.onclickCopy);
    $(document).on('click', '#sharephe-export-details', i2b2.sharephe.event.queryXml.details.onclickExport);

    // alert user when the workbook has been modified.
    $(document).on('change', '#sharephe-workbook-form :input', i2b2.sharephe.event.workbook.form.onchangeInputs);
};

// *********************** i2b2 plugin configurations **************************
// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", () => {
    $(document).ready(() => {
        hljs.highlightAll();

        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltips].map(tooltip => new bootstrap.Tooltip(tooltip));

        i2b2.sharephe.datatable = $('#sharephe-workbook-table').DataTable();

        i2b2.sharephe.setActionListeners();
        i2b2.sharephe.settings.apikey.fetch();

        i2b2.sharephe.workbook.form.createBackToPlugInButton();

        i2b2.authorizedTunnel.variable["i2b2.CRC.view.QT.params.queryTimeout"].then((queryTimeout) => {
            i2b2.sharephe.params.resultWaitTime = queryTimeout;
        });
    });
});
