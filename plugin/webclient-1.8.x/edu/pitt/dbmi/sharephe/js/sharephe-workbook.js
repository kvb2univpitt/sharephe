if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

i2b2.sharephe.workbook = {};

i2b2.sharephe.workbook.form = {};
i2b2.sharephe.workbook.form.isReadOnly = false;
i2b2.sharephe.workbook.form.queryXmls = [];
i2b2.sharephe.workbook.form.detailData = [];
i2b2.sharephe.workbook.form.tempAttachments = new DataTransfer();
i2b2.sharephe.workbook.form.currentWorkbook = null;

i2b2.sharephe.workbook.form.clear = function () {
    // clear all temporary variables
    i2b2.sharephe.workbook.form.queryXmls = [];
    i2b2.sharephe.workbook.form.detailData = [];
    i2b2.sharephe.workbook.form.tempAttachments.items.clear();
    i2b2.sharephe.workbook.form.currentWorkbook = null;

    // clean all form inputs
    $('#sharephe-workbook-form :input').val('');

    // clean all form data display tables
    $('#sharephe-selected-file-table tbody').empty();
    $('#sharephe-current-attachement-table tbody').empty();
    $('#sharephe-attachment-list').html('');

    // clear footer
    $('#workbook-created-on').text('');
    $('#workbook-updated-on').text('');

    // clear query XML inputs
    i2b2.sharephe.workbook.form.clearDDFields();

    // determine whether to enable query XML concept code view
    i2b2.sharephe.tab.enableDisableDetailTab();

    // reset form validation messages
    i2b2.sharephe.workbook.form.resetValidation();
};
i2b2.sharephe.workbook.form.setInputFieldsReadOnly = function (isReadOnly) {
    $('#workbook_is_public').prop("readonly", isReadOnly).prop("disabled", isReadOnly);
    $('#workbook_id').prop("readonly", true).prop("disabled", true);
    $('#workbook_type').prop("disabled", isReadOnly);
    $('#workbook_title').prop("readonly", isReadOnly).prop("disabled", isReadOnly);
    $('#workbook_authors').prop("readonly", isReadOnly).prop("disabled", isReadOnly);
    $('#workbook_institution').prop("readonly", isReadOnly).prop("disabled", isReadOnly);

    $('#workbook_files').prop("readonly", isReadOnly);

    $('#workbook_is_validated').prop("readonly", isReadOnly).prop("disabled", isReadOnly);
    $('#workbook_validated_by').prop("readonly", isReadOnly).prop("disabled", isReadOnly);
    $('#workbook_time_validated').prop("readonly", isReadOnly).prop("disabled", isReadOnly);

    i2b2.sharephe.workbook.form.isReadOnly = isReadOnly;
};
i2b2.sharephe.workbook.form.populate = function (workbook) {
    i2b2.sharephe.workbook.form.clear();

    i2b2.sharephe.workbook.form.currentWorkbook = workbook;
    if (workbook) {
        // determine if workbook modification is allowed
        if (i2b2.sharephe.user.isAuthenticated) {
            $('#sharephe-workbook-options').show();
        } else {
            $('#sharephe-workbook-options').hide();
        }

        // set workbook title
        $('.sharephe-panel-title').text(workbook.title ? workbook.title : 'New Workbook');

        // fill out the form with data
        $('#workbook_is_public').prop("checked", workbook.isPublic);
        $('#workbook_id').val(workbook.phenotypeId);
        $('#workbook_type').val(workbook.type);
        $('.sharephe-workbook-title').text((workbook.title) ? workbook.title : 'Untitled Workbook');
        $('#workbook_title').val(workbook.title);
        $('#workbook_authors').val(workbook.authors.join(', '));
        $('#workbook_institution').val(workbook.institution);

        // add attachements
        i2b2.sharephe.workbook.form.addToFileAttachementList(workbook.files, workbook.fileUrl);
        i2b2.sharephe.workbook.form.addToFileAttachementTable(workbook.files, workbook.fileUrl);

        // add query XML
        i2b2.sharephe.workbook.form.addToQueryXmlList(workbook.queryXML);

        // add validation info
        $('#workbook_is_validated').prop("checked", workbook.isValidated);
        if (workbook.validatedBy) {
            $('#workbook_validated_by').val(workbook.validatedBy.join(', '));
            $('#workbook_validated_by').prop('required', true);
        }
        if (workbook.timeValidated) {
            let date = new Date(workbook.timeValidated);
            $('#workbook_time_validated').val(date.toISOString().substring(0, 10));
            $('#workbook_time_validated').prop('required', true);
        }
        i2b2.sharephe.event.workbook.form.validation.onchangeCheckbox();

        // form footer
        if (workbook.timeCreated) {
            $('#workbook-created-on').text(workbook.timeCreated);
        }
        if (workbook.timeUpdated) {
            $('#workbook-updated-on').text(workbook.timeUpdated);
        }
    }

    i2b2.sharephe.tab.enableDisableDetailTab();
};
i2b2.sharephe.workbook.form.populateReadOnly = function (workbook) {
    i2b2.sharephe.workbook.form.validator.resetForm();
    i2b2.sharephe.workbook.form.setInputFieldsReadOnly(true);
    i2b2.sharephe.workbook.form.populate(workbook);

    // determine which workbook modification function to show
    $('#sharephe-workbook-create-btn').show();
    if (i2b2.sharephe.workbook.form.currentWorkbook.isOwner) {
        $('#sharephe-workbook-edit-btn').show();
    } else {
        $('#sharephe-workbook-edit-btn').hide();
    }
    $('#sharephe-workbook-cancel-btn').hide();

    // hide submitt button
    $('#sharephe-workbook-submit-btn').hide();

    // hide all attachment upload related inputs
    $('#workbook-files-area').hide();
    $('#sharephe-current-attachement-area').hide();
    // show attachment file list
    $('#sharephe-attachment-list-area').show();

    // show form footer
    $('#sharephe-workbook-footer').show();

};
i2b2.sharephe.workbook.form.clearDDFields = function () {
    // remove all the dropped queries
    let table = document.getElementById("sharephe-xml-query-table");
    while (table.rows.length > 0) {
        table.deleteRow(-1);
    }
};
i2b2.sharephe.workbook.form.cancelEdit = function (workbook) {
    i2b2.sharephe.workbook.form.populateReadOnly(workbook);
    i2b2.sharephe.tab.enableDisableDetailTab();
};
i2b2.sharephe.workbook.form.edit = function (workbook) {
    i2b2.sharephe.workbook.form.setInputFieldsReadOnly(false);
    i2b2.sharephe.workbook.form.populate(workbook);

    $('#sharephe-workbook-create-btn').hide();
    $('#sharephe-workbook-edit-btn').hide();
    $('#sharephe-workbook-cancel-btn').show();

    $('#sharephe-workbook-submit-btn').show();

    $('#sharephe-attachment-list-area').hide();
    $('#workbook-files-area').show();

    $('#sharephe-current-attachement-area').show();
};
i2b2.sharephe.workbook.form.createNew = function () {
    i2b2.sharephe.workbook.form.setInputFieldsReadOnly(false);
    i2b2.sharephe.workbook.form.populate({
        isPublic: false,
        phenotypeId: (new Date).getTime(),
        authors: [],
        institution: '',
        title: '',
        type: '',
        files: [],
        fileUrl: '',
        queryXML: [],
        isValidated: false,
        validatedBy: [],
        timeValidated: null,
        isOwner: true,
        timeCreated: null,
        timeUpdated: null
    });

    // hide all workbook modification buttons
    $('#sharephe-workbook-create-btn').hide();
    $('#sharephe-workbook-edit-btn').hide();
    $('#sharephe-workbook-cancel-btn').hide();

    $('#workbook_files').show();

    $('#sharephe-attachment-list-area').hide();
    $('#workbook-files-area').show();
    $('#sharephe-current-attachement-area').hide();

    $('#sharephe-workbook-submit-btn').show();

    $('#sharephe-workbook-footer').hide();
};
i2b2.sharephe.workbook.form.deleteAttachement = function (obj) {
    $(obj).closest('tr').remove();
};
i2b2.sharephe.workbook.form.addToFileAttachementTable = function (files, fileURL) {
    let attachedFileTable = document.getElementById('sharephe-current-attachement-table');
    let tBody = (attachedFileTable.tBodies.length > 0) ? attachedFileTable.tBodies[0] : attachedFileTable.createTBody();
    for (let i = 0; i < files.length; i++) {
        let ahref = fileURL + '/' + files[i];
        let url = '<a class="text-decoration-none" href="' + ahref + '" target="_blank">' + files[i] + '</a>';

        let row = tBody.insertRow(-1);
        row.insertCell(0).innerHTML = url;

        let lastColumn = row.insertCell(1);
        lastColumn.setAttribute('style', 'width: 10px;');
        lastColumn.innerHTML = '<a class="text-danger" title="Delete" onclick="sharephe.workbook.form.deleteAttachement(this);"><i class="bi bi-trash3"></i></a>';
    }

};
i2b2.sharephe.workbook.form.addToFileAttachementList = function (files, fileURL) {
    let anchorTags = [];
    for (let i = 0; i < files.length; i++) {
        let ahref = fileURL + '/' + files[i];
        anchorTags.push('<a class="text-decoration-none" href="' + ahref + '" target="_blank">' + files[i] + '</a>');
    }

    document.getElementById('sharephe-attachment-list').innerHTML = anchorTags.join('<br />');
};
i2b2.sharephe.workbook.form.removeSelectedAttachment = function (obj, fileName) {
    // remove row from attachment display table
    $(obj).closest('tr').remove();

    // remove file from temp attachement storage
    for (let i = 0; i < i2b2.sharephe.workbook.form.tempAttachments.items.length; i++) {
        if (fileName === i2b2.sharephe.workbook.form.tempAttachments.items[i].getAsFile().name) {
            i2b2.sharephe.workbook.form.tempAttachments.items.remove(i);
            break;
        }
    }

    // update the actual attachment storage
    document.getElementById("workbook_files").files = i2b2.sharephe.workbook.form.tempAttachments.files;
};

i2b2.sharephe.workbook.form.queryXml = function () {};
i2b2.sharephe.workbook.form.queryXml.delete = function (obj, index) {
    i2b2.sharephe.workbook.form.queryXmls[index] = null;
    $(obj).closest('tr').remove();

    i2b2.sharephe.tab.enableDisableDetailTab();
};
i2b2.sharephe.workbook.form.queryXml.createPSDDField = function (row, id, text) {
    let queryDropElement = document.createElement('div');
    queryDropElement.className = 'droptrgt SDX-QM p-1 text-bg-light';
    queryDropElement.innerHTML = i2b2.sharephe.workbook.form.isReadOnly
            ? text
            : `${text} <a class="text-danger float-end" title="Delete Query" onclick="i2b2.sharephe.workbook.form.queryXml.delete(${id}, this);"><i class="bi bi-trash3"></i></a>`;

    row.insertCell(0).appendChild(queryDropElement);
};
i2b2.sharephe.workbook.form.queryXml.createButtons = function (row, id, name, queryXML) {
    const queryRunBtnElement = i2b2.sharephe.workbook.form.queryXml.createRunQueryButton(id, name, queryXML);
    const viewQueryBtnElement = i2b2.sharephe.workbook.form.queryXml.createViewQueryButton(id, name, queryXML);

    const buttonGroup = document.createElement("div");
    buttonGroup.className = 'btn-group btn-group-sm';
    buttonGroup.role = 'group';
    buttonGroup.appendChild(queryRunBtnElement);
    buttonGroup.appendChild(viewQueryBtnElement);

    const queryBtnCell = row.insertCell(1);
    queryBtnCell.className = "sharephe-xml-query-btn";
    queryBtnCell.appendChild(buttonGroup);
};
i2b2.sharephe.workbook.form.queryXml.createViewQueryButton = function (id, name, queryXML) {
    const queryViewBtnElement = document.createElement("button");
    queryViewBtnElement.id = 'detail-query-' + id;
    queryViewBtnElement.className = 'btn btn-secondary btn-sm';
    queryViewBtnElement.type = 'button';
    queryViewBtnElement.innerHTML = '<i class="bi bi-info-circle"></i> View Query';
    queryViewBtnElement.addEventListener("click", function () {
        const queryXmlStr = i2b2.sharephe.queryXml.xmlSerializer.serializeToString(queryXML);
        i2b2.sharephe.modal.queryXml.view.show(name, i2b2.sharephe.queryXml.beautify(queryXmlStr));
    }, false);

    return queryViewBtnElement;
};
i2b2.sharephe.workbook.form.queryXml.createRunQueryButton = function (id, name, queryXML) {
    let queryRunBtnElement = document.createElement("button");
    queryRunBtnElement.id = `SharepheBtn-viewRun-${id}`;
    queryRunBtnElement.className = 'viewRun SDX btn btn-info btn-sm mr-2';
    queryRunBtnElement.type = 'button';
    queryRunBtnElement.innerHTML = '<i class="bi bi-play-fill"></i> Run Query';
    queryRunBtnElement.addEventListener("click", function () {
//        i2b2.sharephe.workbook.form.queryXml.masterView(index);
    }, false);

    return queryRunBtnElement;
};
i2b2.sharephe.workbook.form.addToQueryXmlList = function (queryXmlList) {
    if (queryXmlList) {
        for (let i = 0; i < queryXmlList.length; i++) {
            // parse the query xml string to XML object
            const queryXml = $.parseXML(queryXmlList[i]);

            // save the query XML object
            i2b2.sharephe.workbook.form.queryXmls.push(queryXml);

            const table = document.getElementById('sharephe-xml-query-table');
            const row = table.insertRow(-1);

            // render the query XML object
            let queryName = i2b2.sharephe.queryXml.getName(queryXml);
            i2b2.sharephe.workbook.form.queryXml.createPSDDField(row, i, queryName);
            i2b2.sharephe.workbook.form.queryXml.createButtons(row, i, queryName, queryXml);
        }

        if (!i2b2.sharephe.workbook.form.isReadOnly) {
//            i2b2.sharephe.workbook.form.addQueryAddButton();
        }
    }
};
i2b2.sharephe.workbook.form.addSelectedAttachments = function (files) {
    let selectedFileTable = document.getElementById('sharephe-selected-file-table');
    let tBody = (selectedFileTable.tBodies.length > 0) ? selectedFileTable.tBodies[0] : selectedFileTable.createTBody();
    for (let file of files) {
        // add a row to the attachment display table
        let row = tBody.insertRow(-1);
        row.insertCell(0).innerHTML = file.name;

        // add a trash bin icon to delete selected attachments
        let lastColumn = row.insertCell(1);
        lastColumn.setAttribute("style", "width: 10px;");
        lastColumn.innerHTML = `<a class="text-danger" title="Delete" onclick="i2b2.sharephe.workbook.form.removeSelectedAttachment(this, '${file.name}');"><i class="bi bi-trash3"></i></a>`;

        // add file to the temp attachement storage
        i2b2.sharephe.workbook.form.tempAttachments.items.add(file);
    }

    // update the actual attachment storage
    document.getElementById("workbook_files").files = i2b2.sharephe.workbook.form.tempAttachments.files;
};
i2b2.sharephe.workbook.form.submit = function (form) {};
i2b2.sharephe.workbook.form.resetValidation = function () {
    i2b2.sharephe.workbook.form.validator.resetForm();

    $('#sharephe-workbook-form :input.is-valid').removeClass('is-valid');
    $('#sharephe-workbook-form :input.is-invalid').removeClass('is-invalid');
};
i2b2.sharephe.workbook.form.validator = $('#sharephe-workbook-form').validate({
    rules: {
        workbook_id: {
            required: true,
            minlength: 10
        },
        workbook_type: 'required',
        workbook_title: {
            required: true,
            minlength: 4
        },
        workbook_authors: 'required',
        workbook_institution: 'required'
    },
    messages: {
        workbook_id: {
            required: "Please provide a workbook ID.",
            minlength: "Phenotype ID must consist of at least 10 characters"
        },
        workbook_type: "Please select a workbook type.",
        workbook_title: {
            required: "Please provide a title for your workbook.",
            minlength: "Title must be at least 4 characters"
        },
        workbook_authors: "Please provide the the author's name(s) for your workbook.",
        workbook_institution: "Please provide the name of the institution you are associated with.",
        workbook_validated_by: "Please provide the name(s) of the reviewers.",
        workbook_time_validated: "Please provide a date for validation."
    },
    errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");

        if (element.prop("type") === "checkbox") {
            error.insertAfter(element.parent("label"));
        } else {
            error.insertAfter(element);
        }
    },
    highlight: function (element, errorClass, validClass) {
        jQuery(element).addClass("is-invalid").removeClass("is-valid");
    },
    unhighlight: function (element, errorClass, validClass) {
        jQuery(element).addClass("is-valid").removeClass("is-invalid");
    },
    submitHandler: function () {
        i2b2.sharephe.workbook.form.submit(document.getElementById('sharephe-workbook-form'));
    }
});