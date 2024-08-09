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

            i2b2.sharephe.workbook.form.createNew();
            i2b2.sharephe.tab.enableDisableOnAuthentication();

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
i2b2.sharephe.event.phenotypes.onclickTableRow = function () {
    i2b2.sharephe.modal.progress.show('Fetching Phenotype Workbook');

    const successHandler = function (workbook) {
        setTimeout(function () {
            if (workbook) {
                i2b2.sharephe.workbook.form.populateReadOnly(workbook);

                // show workbook tab
                i2b2.sharephe.tab.enable('#nav-workbook-tab');
                $('#nav-workbook-tab').click();
            } else {
                i2b2.sharephe.modal.message.show('Fetching Workbook Failed', 'Workbook is neither exist nor public.');
            }

            i2b2.sharephe.modal.progress.hide();
        }, 500);
    };
    const errorHandler = function (err) {
        setTimeout(function () {
            i2b2.sharephe.modal.progress.hide();
            i2b2.sharephe.modal.message.show('Fetching Workbook Failed', err.responseJSON.message);
        }, 500);
    };

    const phenotypeId = this.cells[0].innerHTML;
    i2b2.sharephe.rest.workbook.fetch(phenotypeId, successHandler, errorHandler);
};

i2b2.sharephe.event.workbook = {};
i2b2.sharephe.event.workbook.form = {};
i2b2.sharephe.event.workbook.form.onchangeAddAttachments = function () {
    i2b2.sharephe.workbook.form.addSelectedAttachments(this.files);
};
i2b2.sharephe.event.workbook.form.onclickCreate = function () {
    i2b2.sharephe.workbook.form.create();
};
i2b2.sharephe.event.workbook.form.onclickEdit = function () {
    i2b2.sharephe.workbook.form.edit(i2b2.sharephe.workbook.form.currentWorkbook);
};
i2b2.sharephe.event.workbook.form.onclickCancelEdit = function () {
    i2b2.sharephe.workbook.form.cancelEdit(i2b2.sharephe.workbook.form.currentWorkbook);
};

i2b2.sharephe.event.workbook.form.validation = {};
i2b2.sharephe.event.workbook.form.validation.onchangeCheckbox = function () {
    if (!i2b2.sharephe.workbook.form.isReadOnly) {
        if ($("#workbook_is_validated").is(':checked')) {
            $('#workbook_validated_by').prop("readonly", false).prop("disabled", false).prop('required', true);
            $('#workbook_time_validated').prop("readonly", false).prop("disabled", false).prop('required', true);
        } else {
            $('#workbook_validated_by').val('');
            $('#workbook_time_validated').val('');

            $('#workbook_validated_by').prop("readonly", true).prop("disabled", true).prop('required', false);
            $('#workbook_time_validated').prop("readonly", true).prop("disabled", true).prop('required', false);

            $('#workbook_validated_by').removeClass('is-valid is-invalid');
            $('#workbook_time_validated').removeClass('is-valid is-invalid');
        }
    }
};

i2b2.sharephe.event.queryXml = {};
i2b2.sharephe.event.queryXml.onclickCopyAndPaste = function () {
    i2b2.sharephe.utils.clipboard.copyQueryXml(document.getElementById('sharephe-query-view-modal-message').textContent);

    const tooltip = bootstrap.Tooltip.getInstance('#sharephe-query-copy-clipboard');
    tooltip.setContent({'.tooltip-inner': 'Copied!'});
    setTimeout(() => {
        tooltip.setContent({'.tooltip-inner': 'Copy to clipboard'});
    }, 2000);
};


i2b2.sharephe.event.queryXml.details = {};
i2b2.sharephe.event.queryXml.details.onclickCopy = function () {
    i2b2.sharephe.queryXml.details.copy();
};
i2b2.sharephe.event.queryXml.details.onclickExport = function () {
    i2b2.sharephe.queryXml.details.export();
};

i2b2.sharephe.event.tab = {};
i2b2.sharephe.event.tab.details = {};
i2b2.sharephe.event.tab.details.onShow = function () {
    let mainElement = document.getElementById("sharephe-details");
    mainElement.innerHTML = '';
    i2b2.sharephe.queryXml.details.extractAndDisplay(mainElement);
};