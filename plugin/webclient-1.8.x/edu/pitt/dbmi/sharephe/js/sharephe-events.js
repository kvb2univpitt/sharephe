if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

/**
 * Event handlers.
 */
i2b2.sharephe.event = {};

i2b2.sharephe.event.settings = {};
i2b2.sharephe.event.settings.onclick = function () {
    const apiKey = i2b2.sharephe.user.apiKey.value;
    i2b2.sharephe.modal.settings.show(apiKey);
};

// API key settings
i2b2.sharephe.event.settings.apiKey = {};
i2b2.sharephe.event.settings.apiKey.showHide = function () {
    const apiKeyInput = document.getElementById("apiKey");
    const hideApiKey = document.getElementById("hide-apiKey");
    const showApiKey = document.getElementById("show-apiKey");
    if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
        showApiKey.classList.add("d-none");
        hideApiKey.classList.remove("d-none");
    } else {
        apiKeyInput.type = "password";
        showApiKey.classList.remove("d-none");
        hideApiKey.classList.add("d-none");
    }
};
i2b2.sharephe.event.settings.apiKey.setApiKey = function () {
    const currentApiKey = i2b2.sharephe.user.apiKey.value;
    const newApiKey = $('#apiKey').val().trim();
    if (currentApiKey === newApiKey) {
        // no change to the API key
        return;
    }
    
    i2b2.sharephe.settings.apikey.set(newApiKey);
};

// phenotype list
i2b2.sharephe.event.phenotypes = {};
i2b2.sharephe.event.phenotypes.syncFromCloud = function () {
    const successHandler = function (workbooks) {
        setTimeout(function () {
            // populate i2b2.sharephe.datatables
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

//            i2b2.sharephe.workbook.form.create();
//            i2b2.sharephe.tab.enableDisableOnAuthentication();

            i2b2.sharephe.modal.progress.hide();
        }, 500);
    };
    const errorHandler = function () {
        setTimeout(function () {
            i2b2.sharephe.datatable.clear();

            i2b2.sharephe.modal.progress.hide();
            i2b2.sharephe.modal.message.show(
                    'Sync From Cloud Failed',
                    'Unable to retrieve phenotypes from cloud.');
        }, 500);
    };
    i2b2.sharephe.modal.progress.show('Sync From Cloud');
    i2b2.sharephe.rest.workbook.fetchList(successHandler, errorHandler);
};