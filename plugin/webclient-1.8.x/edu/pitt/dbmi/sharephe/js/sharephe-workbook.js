if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

i2b2.sharephe.workbook = {};

i2b2.sharephe.workbook.form = {};
i2b2.sharephe.workbook.form.isReadOnly = false;
i2b2.sharephe.workbook.form.isBackButtonShown = false;
i2b2.sharephe.workbook.form.queryXmls = [];
i2b2.sharephe.workbook.form.detailData = [];
i2b2.sharephe.workbook.form.tempAttachments = new DataTransfer();
i2b2.sharephe.workbook.form.currentWorkbook = null;
i2b2.sharephe.workbook.form.modifiedFields = new Set();

i2b2.sharephe.workbook.form.stringify = {};
i2b2.sharephe.workbook.form.stringify.authors = function () {
    const workbook_authors = $('#workbook_authors').val();
    const authors = workbook_authors
            .replace(/[\r\n\t\s]+/g, ' ')
            .trim()
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

    return JSON.stringify(authors);
};
i2b2.sharephe.workbook.form.stringify.currentAttachments = function () {
    const saveFiles = [];
    const attachmentTable = document.getElementById('sharephe-current-attachement-table');
    for (let i = 0; i < attachmentTable.rows.length; i++) {
        let anchorTag = attachmentTable.rows.item(i).cells.item(0).getElementsByTagName("a")[0];
        if (anchorTag) {
            saveFiles.push(anchorTag.innerHTML.trim());
        }
    }

    return JSON.stringify(saveFiles);
};
i2b2.sharephe.workbook.form.stringify.queryXml = function () {
    const queryXmlData = [];
    const xmlSerializer = new window.XMLSerializer();
    const queryXmls = i2b2.sharephe.workbook.form.queryXmls;
    for (let i = 0; i < queryXmls.length; i++) {
        if (queryXmls[i]) {
            let strXML = xmlSerializer.serializeToString(queryXmls[i]);
            let data = strXML.trim().split('\n').map(line => line.trim()).filter(line => line);
            queryXmlData.push(data.join('\n'));
        }
    }

    return JSON.stringify(queryXmlData);
};
i2b2.sharephe.workbook.form.stringify.validatedBy = function () {
    let workbook_validated_by = $('#workbook_validated_by').val();
    const validated_by = workbook_validated_by
            .replace(/[\r\n\t\s]+/g, ' ')
            .trim()
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

    return JSON.stringify(validated_by);
};

i2b2.sharephe.workbook.form.alertModification = function (id) {
    const currentWorkbook = i2b2.sharephe.workbook.form.currentWorkbook;
    const modifiedFields = i2b2.sharephe.workbook.form.modifiedFields;

    let sanitizedFormValue = '';
    let currentValue = '';
    if (id === 'workbook_type') {
        sanitizedFormValue = $('#workbook_type').val().trim();
        currentValue = currentWorkbook.type;

        $('#workbook_type').val(sanitizedFormValue);
    } else if (id === 'workbook_title') {
        sanitizedFormValue = $('#workbook_title').val().trim();
        currentValue = currentWorkbook.title;

        $('#workbook_title').val(sanitizedFormValue);
    } else if (id === 'workbook_authors') {
        sanitizedFormValue = i2b2.sharephe.workbook.form.stringify.authors();
        currentValue = JSON.stringify(currentWorkbook.authors);

        // update author form field with sanitized input
        if (sanitizedFormValue) {
            $('#workbook_authors').val(JSON.parse(sanitizedFormValue).join(', '));
        }
    } else if (id === 'workbook_institution') {
        sanitizedFormValue = $('#workbook_institution').val().trim();
        currentValue = currentWorkbook.institution;

        if (sanitizedFormValue) {
            $('#workbook_institution').val(sanitizedFormValue);
        }
    } else if (id === 'workbook_files') {
        if (document.getElementById("workbook_files").files.length > 0) {
            sanitizedFormValue = id;
        }
    } else if (id === 'workbook_query_xml') {
        sanitizedFormValue = i2b2.sharephe.workbook.form.stringify.queryXml();
        currentValue = JSON.stringify(currentWorkbook.queryXML);
    } else if (id === 'workbook_is_validated') {
        sanitizedFormValue = $("#workbook_is_validated").is(':checked');

        // If form is checked modification alert is raised regardless if the
        // current workbook is validated or not.  However, if the form is not
        // checked, make sure the current workbook is checked for validation.
        if (!sanitizedFormValue) {
            currentValue = currentWorkbook.isValidated;

            // clear previous modifications
            modifiedFields.delete('workbook_validated_by');
            modifiedFields.delete('workbook_time_validated');
        }
    } else if (id === 'workbook_validated_by') {
        // remove workbook_is_validated alert if workbook_time_validated field is not empty
        if ($("#workbook_is_validated").is(':checked') && currentWorkbook.isValidated && ($('#workbook_time_validated').val() !== '')) {
            modifiedFields.delete('workbook_is_validated');
        }

        sanitizedFormValue = i2b2.sharephe.workbook.form.stringify.validatedBy();
        currentValue = JSON.stringify(currentWorkbook.validatedBy);

        if (sanitizedFormValue) {
            $('#workbook_validated_by').val(JSON.parse(sanitizedFormValue).join(', '));
        }
    } else if (id === 'workbook_time_validated') {
        // remove workbook_is_validated alert if workbook_is_validated field is not empty
        if ($("#workbook_is_validated").is(':checked') && currentWorkbook.isValidated && ($('#workbook_validated_by').val() !== '')) {
            modifiedFields.delete('workbook_is_validated');
        }

        sanitizedFormValue = $('#workbook_time_validated').val();
        if (sanitizedFormValue) {
            sanitizedFormValue = new Date(sanitizedFormValue).getTime() / 86400000;
        }
        currentValue = currentWorkbook.timeValidated;
        if (currentValue === null) {
            currentValue = '';
        } else {
            currentValue = parseInt(new Date(currentValue).getTime() / 86400000);
        }
    } else {
        // modification has to be cancelled to reset workbook
        sanitizedFormValue = id;
    }

    if (sanitizedFormValue === currentValue) {
        // remove input ID to the modification list if the form value is the
        // SAME as the value in the current workbook
        modifiedFields.delete(id);
    } else {
        // add input ID to the modification list if the form value is DIFFERENT
        // from the value in the current workbook
        modifiedFields.add(id);
    }

    // determine to hide or show workbook modified notification
    if (modifiedFields.size > 0) {
        $('#modification_alert').show();
    } else {
        $('#modification_alert').hide();
    }
};

i2b2.sharephe.workbook.form.clear = function () {
    // clear all temporary variables
    i2b2.sharephe.workbook.form.queryXmls = [];
    i2b2.sharephe.workbook.form.detailData = [];
    i2b2.sharephe.workbook.form.tempAttachments.items.clear();
    i2b2.sharephe.workbook.form.currentWorkbook = null;
    i2b2.sharephe.workbook.form.modifiedFields.clear();

    $('#modification_alert').hide();

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

    // raise modification alert
    i2b2.sharephe.workbook.form.alertModification('workbook_attachments');
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
        lastColumn.innerHTML = '<a class="text-danger" title="Delete" onclick="i2b2.sharephe.workbook.form.deleteAttachement(this);"><i class="bi bi-trash3"></i></a>';
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

    // raise modification alert
    i2b2.sharephe.workbook.form.alertModification('workbook_files');
};

i2b2.sharephe.workbook.form.queryXml = function () {};
i2b2.sharephe.workbook.form.queryXml.delete = function (index, obj) {
    i2b2.sharephe.workbook.form.queryXmls[index] = null;
    $(obj).closest('tr').remove();

    i2b2.sharephe.tab.enableDisableDetailTab();

    // raise modification alert
    i2b2.sharephe.workbook.form.alertModification('workbook_query_xml');
};
i2b2.sharephe.workbook.form.queryXml.createQueryXmlText = function (text, index) {
    return i2b2.sharephe.workbook.form.isReadOnly
            ? text
            : `${text} <a class="text-danger float-end" title="Delete Query" onclick="i2b2.sharephe.workbook.form.queryXml.delete(${index}, this);"><i class="bi bi-trash3"></i></a>`;
};
i2b2.sharephe.workbook.form.queryXml.createPSDDField = function (row, index, text) {
    let queryDropElement = document.createElement('div');
    queryDropElement.className = 'droptrgt SDX-QM p-1 text-bg-light';
    queryDropElement.innerHTML = i2b2.sharephe.workbook.form.queryXml.createQueryXmlText(text, index);

    row.insertCell(0).appendChild(queryDropElement);
};
i2b2.sharephe.workbook.form.queryXml.createNewPSDDField = function (id) {
    let queryDropElement = document.createElement("div");
    queryDropElement.id = `Sharephe-QMDROP-${id}`;
    queryDropElement.className = "droptrgt SDX-QM p-1 text-bg-light";
    queryDropElement.innerHTML = `Query ${id + 1}`;

    i2b2.sdx.AttachType(queryDropElement, "QM");
    i2b2.sdx.setHandlerCustom(queryDropElement, "QM", "DropHandler", i2b2.sharephe.workbook.form.queryXml.qmDropHandler);

    const table = document.getElementById('sharephe-xml-query-table');
    table.insertRow(-1).insertCell(0).appendChild(queryDropElement);
};
i2b2.sharephe.workbook.form.queryXml.qmDropHandler = function (sdxData, droppedOn) {
    if (i2b2.sharephe.workbook.form.isReadOnly) {
        return;
    }

    const title = sdxData.renderData.title;
    const droppedOnID = droppedOn.target.id;
    const droppedIndex = parseInt(droppedOnID.slice(droppedOnID.lastIndexOf('-') + 1, droppedOnID.length));
    const sdxDisplayName = i2b2.sharephe.h.Escape(sdxData.sdxInfo.sdxDisplayName);

    // change drop query field name
    const text = i2b2.sharephe.workbook.form.queryXml.createQueryXmlText(sdxDisplayName, droppedIndex);
    $(`#${droppedOnID}`).html(text);

    i2b2.ajax.CRC.getRequestXml_fromQueryMasterId({qm_key_value: sdxData.sdxInfo.sdxKeyValue}).then(data => {
        // add query XMl to query list
        const requestXml = $.parseXML(data).getElementsByTagName("request_xml")[0];
        const queryXml = $.parseXML(requestXml.innerHTML);
        i2b2.sharephe.workbook.form.queryXmls.push(queryXml);

        // add run-query and view-query buttons
        const queryName = i2b2.sharephe.queryXml.getName(queryXml);
        const table = document.getElementById('sharephe-xml-query-table');
        const row = table.rows[table.rows.length - 1];
        i2b2.sharephe.workbook.form.queryXml.createButtons(row, droppedIndex, queryName, queryXml);

        // enable detail tabs since there's at least one xml query
        i2b2.sharephe.tab.enableDisableDetailTab();

        // create new drop query field
        i2b2.sharephe.workbook.form.queryXml.createNewPSDDField(droppedIndex + 1);

        // raise modification alert
        i2b2.sharephe.workbook.form.alertModification('workbook_query_xml');
    });
};
i2b2.sharephe.workbook.form.queryXml.run = function (index, queryName, queryXML) {
    i2b2.sharephe.modal.progress.runQuery.show(queryName);

    let queryDef = '<query_definition>';
    if (queryXML.getElementsByTagName('query_definition').length > 0) {
        queryDef += queryXML.getElementsByTagName('query_definition')[0].innerHTML;
    } else if (queryXML.getElementsByTagName('ns3:query_definition').length > 0) {
        queryDef += queryXML.getElementsByTagName('ns3:query_definition')[0].innerHTML;
    } else if (queryXML.getElementsByTagName('ns4:query_definition').length > 0) {
        queryDef += queryXML.getElementsByTagName('ns4:query_definition')[0].innerHTML;
    } else if (queryXML.getElementsByTagName('ns5:query_definition').length > 0) {
        queryDef += queryXML.getElementsByTagName('ns5:query_definition')[0].innerHTML;
    }
    queryDef += '</query_definition>';

    const params = {
        result_wait_time: i2b2.sharephe.params.resultWaitTime,
        psm_query_definition: queryDef,
        psm_result_output: '<result_output_list><result_output priority_index="9" name="patient_count_xml"/></result_output_list>',
        shrine_topic: '',
        query_run_method: ''
    };
    i2b2.ajax.CRC.runQueryInstance_fromQueryDefinition(params).then(data => {
        const resultXml = i2b2.sharephe.h.parseXml(data);
        const queryResultInstance = resultXml.getElementsByTagName('query_result_instance')[0];
        const statusType_id = parseInt(i2b2.sharephe.h.getXNodeVal(queryResultInstance, 'status_type_id').trim());

        setTimeout(i2b2.authorizedTunnel.function["i2b2.CRC.view.history.doRefreshAll"], 500);

        setTimeout(function () {
            i2b2.sharephe.modal.progress.runQuery.hide();

            if (statusType_id === 3) {
                const numOfPatients = parseInt(i2b2.sharephe.h.getXNodeVal(queryResultInstance, 'set_size').trim());
                i2b2.sharephe.modal.progress.runQuery.result.show(queryName, `Number of patients: ${numOfPatients}.`, true);
            } else {
                i2b2.sharephe.modal.progress.runQuery.result.show(queryName, 'ERROR', false);
            }
        }, 500);
    });
};
i2b2.sharephe.workbook.form.queryXml.createButtons = function (row, index, name, queryXML) {
    const queryRunBtnElement = i2b2.sharephe.workbook.form.queryXml.createRunQueryButton(index, name, queryXML);
    const viewQueryBtnElement = i2b2.sharephe.workbook.form.queryXml.createViewQueryButton(index, name, queryXML);

    const buttonGroup = document.createElement("div");
    buttonGroup.className = 'btn-group btn-group-sm';
    buttonGroup.role = 'group';
    buttonGroup.appendChild(queryRunBtnElement);
    buttonGroup.appendChild(viewQueryBtnElement);

    const queryBtnCell = row.insertCell(1);
    queryBtnCell.className = "sharephe-xml-query-btn";
    queryBtnCell.appendChild(buttonGroup);
};
i2b2.sharephe.workbook.form.queryXml.createViewQueryButton = function (index, name, queryXML) {
    const queryViewBtnElement = document.createElement("button");
    queryViewBtnElement.id = 'detail-query-' + index;
    queryViewBtnElement.className = 'btn btn-secondary btn-sm';
    queryViewBtnElement.type = 'button';
    queryViewBtnElement.innerHTML = '<i class="bi bi-info-circle"></i> View Query';
    queryViewBtnElement.addEventListener("click", function () {
        const queryXmlStr = i2b2.sharephe.queryXml.xmlSerializer.serializeToString(queryXML);
        i2b2.sharephe.modal.queryXml.view.show(name, i2b2.sharephe.queryXml.beautify(queryXmlStr));
    }, false);

    return queryViewBtnElement;
};
i2b2.sharephe.workbook.form.queryXml.createRunQueryButton = function (index, name, queryXML) {
    let queryRunBtnElement = document.createElement("button");
    queryRunBtnElement.id = `SharepheBtn-viewRun-${index}`;
    queryRunBtnElement.className = 'viewRun SDX btn btn-sea-green btn-sm mr-2';
    queryRunBtnElement.type = 'button';
    queryRunBtnElement.innerHTML = '<i class="bi bi-play-fill"></i> Run Query';
    queryRunBtnElement.addEventListener("click", function () {
        i2b2.sharephe.workbook.form.queryXml.run(index, name, queryXML);
    }, false);

    return queryRunBtnElement;
};
i2b2.sharephe.workbook.form.addToQueryXmlList = function (queryXmlList) {
    if (queryXmlList) {
        const table = document.getElementById('sharephe-xml-query-table');
        for (let i = 0; i < queryXmlList.length; i++) {
            // parse the query xml string to XML object
            const queryXml = $.parseXML(queryXmlList[i]);

            // save the query XML object
            i2b2.sharephe.workbook.form.queryXmls.push(queryXml);

            const row = table.insertRow(-1);

            // render the query XML object
            let queryName = i2b2.sharephe.queryXml.getName(queryXml);
            i2b2.sharephe.workbook.form.queryXml.createPSDDField(row, i, queryName);
            i2b2.sharephe.workbook.form.queryXml.createButtons(row, i, queryName, queryXml);
        }
    }

    if (!i2b2.sharephe.workbook.form.isReadOnly) {
        i2b2.sharephe.workbook.form.queryXml.createNewPSDDField(queryXmlList.length);
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
i2b2.sharephe.workbook.form.backToPlugIn = function () {
    $('#sharephe-back-btn').hide();
    i2b2.hive.MasterView.setViewMode('Analysis');
};
i2b2.sharephe.workbook.form.createBackToPlugInButton = function () {
    if (!$('#sharephe-back-btn').length) {
        $('body').prepend('<button id="sharephe-back-btn" onclick="i2b2.sharephe.workbook.form.backToPlugIn();"><i class="bi bi-arrow-left-square-fill"></i> Back to Sharephe</button>');
    }
};
i2b2.sharephe.workbook.form.submit = function (form) {
    i2b2.sharephe.modal.progress.show('Saving Phenotype');

    // save author
    $('#workbook_authors').val(i2b2.sharephe.workbook.form.stringify.authors());

    // save current attachement files
    $('#workbook_attachments').val(i2b2.sharephe.workbook.form.stringify.currentAttachments());

    // save query-xml data
    $('#workbook_query_xml').val(i2b2.sharephe.workbook.form.stringify.queryXml());

    // save validated-by
    if ($("#workbook_is_validated").is(':checked')) {
        $('#workbook_validated_by').val(i2b2.sharephe.workbook.form.stringify.validatedBy());
    }

    $('#workbook_id').prop("disabled", false);

    const formData = new FormData(form);
    const successHandler = function (workbook) {
        setTimeout(function () {
            i2b2.sharephe.workbook.form.populateReadOnly(workbook);
            i2b2.sharephe.phenotypes.refresh();

            i2b2.sharephe.modal.progress.hide();
            i2b2.sharephe.modal.message.show(
                    'Phenotype Saved',
                    'Your phenotype is saved to cloud sucessfully!');
        }, 500);
    };
    const errorHandler = function (err) {
        setTimeout(function () {
            i2b2.sharephe.modal.progress.hide();
            if (err.statusText && err.responseJSON) {
                i2b2.sharephe.modal.message.show(err.statusText, err.responseJSON.message);
            } else {
                i2b2.sharephe.modal.message.show(
                        'Save Phenotype Failed',
                        'Unable to save phenotype workbook at this time.');
            }
        }, 500);
    };

    i2b2.sharephe.rest.workbook.save(formData, successHandler, errorHandler);
    $('#workbook_id').prop("disabled", true);

    let value = $('#workbook_authors').val();
    if (value) {
        $('#workbook_authors').val(JSON.parse(value).join(', '));
    }
    if ($("#workbook_is_validated").is(':checked')) {
        let value = $('#workbook_validated_by').val();
        if (value) {
            $('#workbook_validated_by').val(JSON.parse(value).join(', '));
        }
    }
};
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