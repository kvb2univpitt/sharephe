i2b2.Sharephe.event = {};

i2b2.Sharephe.event.settings = {};
i2b2.Sharephe.event.settings.onclick = function () {
    jQuery('#Sharephe-ApiKey').val(i2b2.Sharephe.user.params.apikey.getValue());
    i2b2.Sharephe.modal.settings.show();
};
i2b2.Sharephe.event.settings.apikey = {};
i2b2.Sharephe.event.settings.apikey.onclickShowHideApiKey = function () {
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
i2b2.Sharephe.event.settings.apikey.onclickSetApiKey = function () {
    i2b2.Sharephe.settings.apikey.add();
};
i2b2.Sharephe.event.settings.apikey.onkeyupInput = function () {
    const content = jQuery('#Sharephe-ApiKey').val().trim();
    jQuery('#Sharephe-SetApiKey').prop('disabled', content.length === 0);
};

i2b2.Sharephe.event.phenotypes = {};
i2b2.Sharephe.event.phenotypes.onclickSyncFromCloud = function () {
    const successHandler = function (data) {
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

            i2b2.Sharephe.workbook.form.createNew();
            i2b2.Sharephe.tab.enableDisableBasedOnAuthentication();

            i2b2.Sharephe.modal.progress.hide();
        }, 500);
    };
    const errorHandler = function () {
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
i2b2.Sharephe.event.phenotypes.onclickTableRow = function () {
    const phenotypeId = this.cells[0].innerHTML;

    const fetchWorkbook = function () {
        const successHandler = function (workbook) {
            setTimeout(function () {
                // clear session cache when viewing a different workbook
                sessionStorage.clear();

                if (workbook) {
                    i2b2.Sharephe.workbook.form.populateReadOnly(workbook);

                    // show workbook tab
                    i2b2.Sharephe.tab.enable('Sharephe-TAB1');
                    jQuery('#Sharephe-TAB1').click();
                } else {
                    i2b2.Sharephe.modal.message.show('Fetching Workbook Failed', 'Workbook is neither exist nor public.');
                }

                i2b2.Sharephe.modal.progress.hide();
            }, 500);
        };
        const errorHandler = function (err) {
            setTimeout(function () {
                i2b2.Sharephe.modal.progress.hide();

                let msg = err.statusText;
                if (err.status === 404) {
                    msg = "No such phenotype workbook with ID '" + phenotypeId + "' found.";
                } else if (err.status === 500) {
                    msg = 'Server error.  Unable to retrieve workbook at this time.';
                }
                i2b2.Sharephe.modal.message.show('Fetching Workbook Failed', msg);
            }, 500);
        };

        i2b2.Sharephe.rest.workbook.fetch(phenotypeId, successHandler, errorHandler);
    };

    i2b2.Sharephe.workbook.selectedPhenotypeId = phenotypeId;
    i2b2.Sharephe.rest.apikey.verify(fetchWorkbook);
};
i2b2.Sharephe.event.phenotypes.onclickTab = function (evt) {
    if (evt.newValue.get('id') === 'Sharephe-TAB2') {
        i2b2.Sharephe.queryDetail.show();
    }
};

i2b2.Sharephe.event.workbook = {};
i2b2.Sharephe.event.workbook.onclickCreateNew = function () {
    i2b2.Sharephe.workbook.form.createNew();
};
i2b2.Sharephe.event.workbook.onclickEdit = function () {
    i2b2.Sharephe.workbook.form.enableEdit();
};
i2b2.Sharephe.event.workbook.onclickCancel = function () {
    i2b2.Sharephe.workbook.form.cancelEdit();
};
i2b2.Sharephe.event.workbook.onclickSubmmit = function (event) {
    event.preventDefault();

    const submit = function () {
        if (i2b2.Sharephe.user.isAuthenticated) {
            i2b2.Sharephe.workbook.form.save();
        } else {
            i2b2.Sharephe.modal.message.show('Unauthorized', 'Insufficient permission to save workbook.');
        }
    };

    i2b2.Sharephe.rest.apikey.verify(submit);

    return false;
};
i2b2.Sharephe.event.workbook.onchangeAttachmentFiles = function () {
    i2b2.Sharephe.workbook.form.updateAttachementSelections(this.files);
    this.files = i2b2.Sharephe.workbook.tempAttachments.files;
};

i2b2.Sharephe.event.queryDetail = {};
i2b2.Sharephe.event.queryDetail.onclickCopyToClipboard = function () {
    i2b2.Sharephe.queryDetail.copyToClipboard();
};
i2b2.Sharephe.event.queryDetail.onclickExportToFile = function () {
    i2b2.Sharephe.queryDetail.exportToFile();
};

i2b2.Sharephe.event.queryXml = {};
i2b2.Sharephe.event.queryXml.onclickCopyToClipboard = function () {
    let queryXml = document.getElementById('Sharephe-QueryModalMessage').textContent;
    if (queryXml) {
        navigator.clipboard.writeText(queryXml.trim());
    }
};