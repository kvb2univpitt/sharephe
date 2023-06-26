i2b2.Sharephe.user = {
    isAuthenticated: false,
    params: {
        apikey: {
            param: null,
            getValue: function () {
                return (i2b2.Sharephe.user.params.apikey.param)
                        ? i2b2.Sharephe.user.params.apikey.param.value
                        : '';
            }
        }
    },
    clear: function () {
        i2b2.Sharephe.user.isAuthenticated = false;
        i2b2.Sharephe.user.params.apikey.param = null;
    }
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
i2b2.Sharephe.tab.enableDisableOnQueryXml = function () {
    let hasQuery = false;
    const queryXmls = i2b2.Sharephe.workbook.queryXmls;
    if (queryXmls.length > 0) {
        for (let i = 0; i < queryXmls.length; i++) {
            if (queryXmls[i]) {
                hasQuery = true;
                break;
            }
        }
    }

    if (hasQuery) {
        i2b2.Sharephe.tab.enable('Sharephe-TAB2');
    } else {
        i2b2.Sharephe.tab.disable('Sharephe-TAB2');
    }
};

i2b2.Sharephe.Init = function (loadedDiv) {
    // tabs event handler
    this.yuiTabs = new YAHOO.widget.TabView("Sharephe-TABS", {activeIndex: 0});
    this.yuiTabs.on('activeTabChange', i2b2.Sharephe.event.phenotypes.onclickTab);

    // settings events
    jQuery('#Sharephe-Settings').click(i2b2.Sharephe.event.settings.onclick);
    jQuery('#Sharephe-ShowHideApiKey').click(i2b2.Sharephe.event.settings.apikey.onclickShowHideApiKey);
    jQuery('#Sharephe-SetApiKey').click(i2b2.Sharephe.event.settings.apikey.onclickSetApiKey);
    jQuery('#Sharephe-ApiKey').keyup(i2b2.Sharephe.event.settings.apikey.onkeyupInput);

    // phenotypes events
    jQuery('#Sharephe-SyncFromCloud').click(i2b2.Sharephe.event.phenotypes.onclickSyncFromCloud);
    jQuery(document).on('click', '#Sharephe-WorkbookTable tr', i2b2.Sharephe.event.phenotypes.onclickTableRow);

    // workbook events
    jQuery('#Sharephe-WorkbookNewBtn').click(i2b2.Sharephe.event.workbook.onclickCreateNew);
    jQuery('#Sharephe-WorkbookEditBtn').click(i2b2.Sharephe.event.workbook.onclickEdit);
    jQuery('#Sharephe-WorkbookCancelBtn').click(i2b2.Sharephe.event.workbook.onclickCancel);
    jQuery('#Sharephe-SubmitButton').click(i2b2.Sharephe.event.workbook.onclickSubmmit);
    jQuery('#workbook_files').change(i2b2.Sharephe.event.workbook.onchangeAttachmentFiles);
    
    // query details events
    jQuery('#Sharephe-CopyClipboard').click(i2b2.Sharephe.event.queryDetail.onclickCopyToClipboard);
    jQuery('#Sharephe-ExportFile').click(i2b2.Sharephe.event.queryDetail.onclickExportToFile);

    i2b2.Sharephe.datatable = jQuery('#Sharephe-WorkbookTable').DataTable({
        "columnDefs": [{
                "targets": [0, 5],
                "orderable": false
            }]
    });

    i2b2.Sharephe.settings.apikey.fetch();
    i2b2.Sharephe.rest.apikey.verify(i2b2.Sharephe.tab.enableDisableBasedOnAuthentication);

    i2b2.Sharephe.workbook.form.buildBackToPlugInButton();

    jQuery('#Sharephe-SyncFromCloud').click();
};

i2b2.Sharephe.Unload = function () {
    i2b2.Sharephe.user.clear();
    i2b2.Sharephe.workbook.form.clear();
    i2b2.Sharephe.workbook.form.isReadOnly = false;

    return true;
};