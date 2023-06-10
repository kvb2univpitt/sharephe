i2b2.Sharephe.event = {};

i2b2.Sharephe.event.settings = {};
i2b2.Sharephe.event.settings.actionHandler = function () {
    i2b2.Sharephe.modal.settings.show();
};
i2b2.Sharephe.event.settings.apikey = {};
i2b2.Sharephe.event.settings.apikey.showHideApiKeyHandler = function () {
    const x = document.getElementById("Sharephe-ApiKey");
    const hide_api_key = document.getElementById("hide-api-key");
    const show_api_key = document.getElementById("show-api-key");
    show_api_key.classList.remove("shp-d-none");
    if (x.type === "password") {
        x.type = "text";
        hide_api_key.style.display = "none";
        show_api_key.style.display = "block";
    } else {
        x.type = "password";
        hide_api_key.style.display = "block";
        show_api_key.style.display = "none";
    }
};
i2b2.Sharephe.event.settings.apikey.setApiKeyHandler = function () {
    i2b2.Sharephe.settings.apikey.add();
};
i2b2.Sharephe.event.settings.apikey.keyupHandler = function () {
    const content = jQuery('#Sharephe-ApiKey').val().trim();
    jQuery('#Sharephe-SetApiKey').prop('disabled', content.length === 0);
};

i2b2.Sharephe.event.syncFromCloud = {};
i2b2.Sharephe.event.syncFromCloud.actionHandler = function () {
    let successHandler = function (data) {
        setTimeout(function () {
            // populate datatables
            i2b2.Sharephe.datatable.clear();
            data.forEach(function (workbook) {
                i2b2.Sharephe.datatable.row.add([
                    workbook.phenotypeId,
                    workbook.type,
                    workbook.title,
                    workbook.authors.join(', '),
                    workbook.institution,
                    workbook.files.join(', ')
                ]);
            });
            i2b2.Sharephe.datatable.draw();

            i2b2.Sharephe.modal.progress.hide();
        }, 500);
    };
    let errorHandler = function () {
        setTimeout(function () {
            i2b2.Sharephe.datatable.clear();

            i2b2.Sharephe.modal.progress.hide();
            i2b2.Sharephe.modal.message.show(
                    'Sync From Cloud Failed',
                    'Unable to retrieve phenotypes from cloud.');
        }, 500);
    };

    i2b2.Sharephe.modal.progress.show('Sync From Cloud');
    i2b2.Sharephe.rest.workbook.fetchList(successHandler, errorHandler);
};