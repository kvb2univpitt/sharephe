i2b2.Sharephe.workbook = {
    selectedPhenotypeId: null,
    currentWorkbook: null,
    showBckBtn: false,
    queryXmls: [],
    detailData: [],
    tempAttachments: new DataTransfer()
};
i2b2.Sharephe.workbook.refreshList = function () {
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
        }, 500);
    };
    const errorHandler = function () {};

    i2b2.Sharephe.rest.workbook.fetchList(successHandler, errorHandler);
};

i2b2.Sharephe.workbook.form = {
    isReadOnly: false
};
i2b2.Sharephe.workbook.form.queryXml = function () {};
i2b2.Sharephe.workbook.form.queryXml.beautify = function (queryXML) {
    let queryXmlStr = i2b2.Sharephe.utils.xmlSerializer.serializeToString(queryXML).trim();
    queryXmlStr = queryXmlStr.replace(/[\r\n]+/g, '');
    queryXmlStr = i2b2.Sharephe.utils.xmlBeautify.beautify(queryXmlStr, {indent: '    ', useSelfClosingElement: true});

    return hljs.highlight(queryXmlStr, {language: 'xml'}).value;
};
i2b2.Sharephe.workbook.form.queryXml.clearDDFields = function () {
    // remove all the dropped queries
    let table = document.getElementById("Sharephe-QueryDropArea");
    while (table.rows.length > 0) {
        table.deleteRow(-1);
    }
};
i2b2.Sharephe.workbook.form.queryXml.parse = function (strQueryXml) {
    let queryXmlList = [];

    if (strQueryXml) {
        let queryXmlData = strQueryXml.split('>,');
        if (queryXmlData.length > 1) {
            for (let i = 0; i < queryXmlData.length; i++) {
                let qXml = queryXmlData[i];
                if (qXml.endsWith('>')) {
                    queryXmlList.push(jQuery.parseXML(qXml));
                } else {
                    queryXmlList.push(jQuery.parseXML(qXml + '>'));
                }
            }
        } else {
            queryXmlList.push(jQuery.parseXML(strQueryXml));
        }
    }

    return queryXmlList;
};
i2b2.Sharephe.workbook.form.queryXml.getName = function (queryXml) {
    return i2b2.h.getXNodeVal(queryXml, 'query_name');
};
i2b2.Sharephe.workbook.form.queryXml.createNewBtn = function (index) {
    let queryRunBtnElement = document.createElement("button");
    queryRunBtnElement.id = `SharepheBtn-viewRun-${index}`;
    queryRunBtnElement.className = 'viewRun SDX shp-btn shp-btn-info shp-btn-sm shp-mr-2';
    queryRunBtnElement.type = 'button';
    queryRunBtnElement.innerHTML = '<i class="bi bi-play-fill"></i> Run Query'
    queryRunBtnElement.addEventListener("click", function () {
        i2b2.Sharephe.workbook.form.queryXml.masterView(index);
    }, false);

    let viewQueryBtnElement = document.createElement("button");
    viewQueryBtnElement.className = 'shp-btn shp-btn-secondary shp-btn-sm';
    viewQueryBtnElement.type = 'button';
    viewQueryBtnElement.innerHTML = '<i class="bi bi-info-circle"></i> View Query';
    viewQueryBtnElement.addEventListener("click", function () {
        i2b2.Sharephe.workbook.form.queryXml.viewXmlCode(index);
    }, false);

    let buttonGroup = document.createElement("div");
    buttonGroup.className = 'shp-btn-group shp-btn-group-sm';
    buttonGroup.role = 'group';
    buttonGroup.appendChild(queryRunBtnElement);
    buttonGroup.appendChild(viewQueryBtnElement);

    let table = document.getElementById("Sharephe-QueryDropArea");
    let rowIndex = table.rows.length - 1;
    let row = table.rows[rowIndex];
    row.cells[1].appendChild(buttonGroup);
};
i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField = function (index) {
    let queryDropElementId = 'Sharephe-QMDROP-' + index;

    let queryDropElement = document.createElement("div");
    queryDropElement.id = queryDropElementId;
    queryDropElement.className = "droptrgt SDX-QM";
    queryDropElement.innerHTML = 'Query ' + (index + 1);

    let table = document.getElementById("Sharephe-QueryDropArea");
    let row = table.insertRow(-1);

    let dropQueryCell = row.insertCell(0);
    dropQueryCell.appendChild(queryDropElement);

    let queryBtnCell = row.insertCell(1);
    queryBtnCell.className = "Sharephe-QueryButtonCell";

    // register as drag&drop target
    i2b2.sdx.Master._sysData[queryDropElementId] = {}; // hack to get an old dd field unregistered as there's no function for it...
    let op_trgt = {dropTarget: true};
    i2b2.sdx.Master.AttachType(queryDropElementId, "QM", op_trgt);
    i2b2.sdx.Master.setHandlerCustom(queryDropElementId, "QM", "DropHandler", i2b2.Sharephe.workbook.form.queryXml.qmDropped);
};

i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText = function (text, index) {
    return i2b2.Sharephe.workbook.form.isReadOnly
            ? text
            : text + '<a class="shp shp-text-danger shp-float-right" title="Delete Query" onclick="i2b2.Sharephe.workbook.form.deleteQueryXml(this, ' + index + ');"><i class="bi bi-trash3"></i></a>';
};
i2b2.Sharephe.workbook.form.queryXml.qmDropped = function (sdxData, droppedOnID) {
    if (i2b2.Sharephe.workbook.form.isReadOnly) {
        return;
    }

    // Check if something was dropped on the lowest field (=field with highest id). If yes create a new field under it
    let index = parseInt(droppedOnID.slice(droppedOnID.lastIndexOf('-') + 1, droppedOnID.length));
    i2b2.Sharephe.workbook.form.queryXml.createNewBtn(index);
    i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField(index + 1);

    // Save the info to our local data model
    sdxData = sdxData[0];
    //collect all the qm_id for the queries
    //upload query XML to cloud
    i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("CRC:QueryTool", {qm_key_value: sdxData.sdxInfo.sdxKeyValue}, function (result) {
        let requestXml = result.refXML.documentElement.getElementsByTagName('request_xml')[0];
        i2b2.Sharephe.workbook.queryXmls.push(jQuery.parseXML(requestXml.innerHTML));
        i2b2.Sharephe.tab.enableDisableOnQueryXml();
    });

    // Change appearance of the drop field
    jQuery('#Sharephe-QMDROP-' + index).html(i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText(i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName), index));
};
i2b2.Sharephe.workbook.form.queryXml.masterView = function (index) {
    i2b2.Sharephe.workbook.showBckBtn = true;
    jQuery('#Sharephe-bckBtn').show();
    i2b2.hive.MasterView.setViewMode('Patients');

    let queryXML = i2b2.Sharephe.workbook.queryXmls[index];

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


    let queryName = i2b2.Sharephe.workbook.form.queryXml.getName(queryXML);
    let params = {
        result_wait_time: i2b2.CRC.view.QT.params.queryTimeout,
        psm_query_definition: queryDef,
        psm_result_output: '<result_output_list><result_output priority_index="9" name="patient_count_xml"/></result_output_list>'
    };
    $('runBoxText').innerHTML = "Cancel Query";
    i2b2.CRC.ctrlr.currentQueryStatus = new i2b2.CRC.ctrlr.QueryStatus($('infoQueryStatusText'));
    i2b2.CRC.ctrlr.currentQueryStatus.startQuery(queryName, params);
};
i2b2.Sharephe.workbook.form.queryXml.viewXmlCode = function (index) {
    let queryXML = i2b2.Sharephe.workbook.queryXmls[index];
    if (queryXML) {
        let queryName = i2b2.Sharephe.workbook.form.queryXml.getName(queryXML);
        let queryXmlStr = i2b2.Sharephe.workbook.form.queryXml.beautify(queryXML);

        i2b2.Sharephe.modal.query.show(queryName, queryXmlStr);
    }
};

i2b2.Sharephe.workbook.form.clear = function () {
    i2b2.Sharephe.workbook.selectedPhenotypeId = null;
    i2b2.Sharephe.workbook.currentWorkbook = null;
    i2b2.Sharephe.workbook.showBckBtn = false;
    i2b2.Sharephe.workbook.queryXmls = [];
    i2b2.Sharephe.workbook.detailData = [];
    i2b2.Sharephe.workbook.tempAttachments.items.clear();
    i2b2.Sharephe.workbook.form.queryXml.clearDDFields();
    i2b2.Sharephe.queryDetail.details = [];

    jQuery('#Sharephe-WorkbookForm :input').val('');
    jQuery('#Sharephe-WorkbookCreatedOn').text('');
    jQuery('#Sharephe-WorkbookUpdatedOn').text('');

    jQuery('#Sharephe-SelectedFilesTable tbody').empty();
    jQuery('#Sharephe-CurrentAttachementTable tbody').empty();
    jQuery('#Sharephe-AttachedFileListTable tbody').empty();

    // cancel edit
    jQuery('#Sharephe-WorkbookCancelBtn').hide();
    jQuery('#Sharephe-WorkbookEditBtn').show();
    jQuery('#Sharephe-SubmitButton').hide();
};
i2b2.Sharephe.workbook.form.setReadOnly = function (isReadOnly) {
    i2b2.Sharephe.workbook.form.isReadOnly = isReadOnly;

    jQuery('#workbook_is_public').prop("readonly", isReadOnly);
    jQuery('#workbook_is_public').prop("disabled", isReadOnly);

    jQuery('#workbook_id').prop("readonly", true);
    jQuery('#workbook_id').prop("disabled", true);

    jQuery('#workbook_type').prop("disabled", isReadOnly);

    jQuery('#workbook_title').prop("readonly", isReadOnly);
    jQuery('#workbook_title').prop("disabled", isReadOnly);

    jQuery('#workbook_authors').prop("readonly", isReadOnly);
    jQuery('#workbook_authors').prop("disabled", isReadOnly);

    jQuery('#workbook_institution').prop("readonly", isReadOnly);
    jQuery('#workbook_institution').prop("disabled", isReadOnly);

    jQuery('#workbook_files').prop("readonly", isReadOnly);

    jQuery('#workbook_is_validated').prop("readonly", isReadOnly);
    jQuery('#workbook_is_validated').prop("disabled", isReadOnly);

    jQuery('#workbook_validated_by').prop("readonly", isReadOnly);
    jQuery('#workbook_validated_by').prop("disabled", isReadOnly);

    jQuery('#workbook_time_validated').prop("readonly", isReadOnly);
    jQuery('#workbook_time_validated').prop("disabled", isReadOnly);
};
i2b2.Sharephe.workbook.form.addToFileAttachementList = function (files, fileURL) {
    let attachedFileListTable = document.getElementById("Sharephe-AttachedFileListTable");
    let tBody = (attachedFileListTable.tBodies.length > 0)
            ? attachedFileListTable.tBodies[0]
            : attachedFileListTable.createTBody();
    for (let i = 0; i < files.length; i++) {
        let ahref = fileURL + '/' + files[i];
        let url = '<a class="shp" href="' + ahref + '" target="_blank">' + files[i] + '</a>';

        let row = tBody.insertRow(-1);
        row.insertCell(0).innerHTML = url;
    }
};
i2b2.Sharephe.workbook.form.addToFileAttachementTable = function (files, fileURL) {
    let attachedFileTable = document.getElementById("Sharephe-CurrentAttachementTable");
    let tBody = (attachedFileTable.tBodies.length > 0)
            ? attachedFileTable.tBodies[0]
            : attachedFileTable.createTBody();
    for (let i = 0; i < files.length; i++) {
        let ahref = fileURL + '/' + files[i];
        let url = '<a class="shp" href="' + ahref + '" target="_blank">' + files[i] + '</a>';

        let row = tBody.insertRow(-1);
        row.insertCell(0).innerHTML = url;

        let lastColumn = row.insertCell(1);
        lastColumn.setAttribute('style', 'width: 10px;');
        lastColumn.innerHTML = '<a class="shp shp-text-danger" title="Delete" onclick="i2b2.Sharephe.workbook.form.deleteAttachement(this);"><i class="bi bi-trash3"></i></a>';
    }
};
i2b2.Sharephe.workbook.form.addToQueryXmlList = function (queryXmlList) {
    if (queryXmlList) {
        for (let i = 0; i < queryXmlList.length; i++) {
            // parse the query xml string to XML object
            let queryXml = jQuery.parseXML(queryXmlList[i]);

            // save the query XML object
            i2b2.Sharephe.workbook.queryXmls.push(queryXml);

            i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField(i);
            i2b2.Sharephe.workbook.form.queryXml.createNewBtn(i);

            // render the query XML object
            let queryName = i2b2.Sharephe.workbook.form.queryXml.getName(queryXml);
            let queryText = i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText(queryName, i);
            jQuery('#Sharephe-QMDROP-' + i).html(queryText);
        }
    }

    if (!i2b2.Sharephe.workbook.form.isReadOnly) {
        i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField(queryXmlList.length);
    }
};
i2b2.Sharephe.workbook.form.deleteQueryXml = function (obj, index) {
    i2b2.Sharephe.workbook.queryXmls[index] = null;
    $(obj).closest('tr').remove();

    i2b2.Sharephe.tab.enableDisableOnQueryXml();
};
i2b2.Sharephe.workbook.form.deleteAttachement = function (obj) {
    $(obj).closest('tr').remove();
};
i2b2.Sharephe.workbook.form.removeSelectedAttachment = function (obj, fileName) {
    $(obj).closest('tr').remove();

    for (let i = 0; i < i2b2.Sharephe.workbook.tempAttachments.items.length; i++) {
        if (fileName === i2b2.Sharephe.workbook.tempAttachments.items[i].getAsFile().name) {
            i2b2.Sharephe.workbook.tempAttachments.items.remove(i);
            break;
        }
    }
    document.getElementById("workbook_files").files = i2b2.Sharephe.workbook.tempAttachments.files;
};
i2b2.Sharephe.workbook.form.updateAttachementSelections = function (files) {
    let selectedFileTable = document.getElementById('Sharephe-SelectedFilesTable');
    let tBody = (selectedFileTable.tBodies.length > 0) ? selectedFileTable.tBodies[0] : selectedFileTable.createTBody();
    for (let file of files) {
        let row = tBody.insertRow(-1);
        row.insertCell(0).innerHTML = file.name;

        let lastColumn = row.insertCell(1);
        lastColumn.setAttribute('style', 'width: 10px;');
        lastColumn.innerHTML = '<a class="shp shp-text-danger" title="Delete" onclick="i2b2.Sharephe.workbook.form.removeSelectedAttachment(this, \'' + file.name + '\');"><i class="bi bi-trash3"></i></a>';

        i2b2.Sharephe.workbook.tempAttachments.items.add(file);
    }
};
i2b2.Sharephe.workbook.form.populate = function (workbook) {
    i2b2.Sharephe.workbook.form.clear();

    i2b2.Sharephe.workbook.currentWorkbook = workbook;
    if (workbook) {
        jQuery('#workbook_is_public').prop("checked", workbook.isPublic);
        jQuery('#workbook_id').val(workbook.phenotypeId);
        jQuery('#workbook_type').val(workbook.type);
        jQuery('#workbook_title').val(workbook.title);
        jQuery('#workbook_authors').val(workbook.authors.join(', '));
        jQuery('#workbook_institution').val(workbook.institution);

        i2b2.Sharephe.workbook.form.addToFileAttachementList(workbook.files, workbook.fileUrl);
        i2b2.Sharephe.workbook.form.addToFileAttachementTable(workbook.files, workbook.fileUrl);
        i2b2.Sharephe.workbook.form.addToQueryXmlList(workbook.queryXML);

        if (i2b2.Sharephe.user.isAuthenticated) {
            jQuery('#Sharephe-AddEditWorkbook').show();
        } else {
            jQuery('#Sharephe-AddEditWorkbook').hide();
        }

        if (workbook.title) {
            jQuery('.Sharephe-PhenoName').text(workbook.title);
        } else {
            jQuery('.Sharephe-PhenoName').text('New Workbook');
        }

        // workbook validation
        jQuery('#workbook_is_validated').prop("checked", workbook.isValidated);
        if (workbook.validatedBy) {
            jQuery('#workbook_validated_by').val(workbook.validatedBy.join(', '));
            jQuery('#workbook_validated_by').prop('required', true);
        }
        if (workbook.timeValidated) {
            let date = new Date(workbook.timeValidated);
            jQuery('#workbook_time_validated').val(date.toISOString().substring(0, 10));
            jQuery('#workbook_time_validated').prop('required', true);
        }
        i2b2.Sharephe.event.workbook.validation.checkbox.onchange();

        if (workbook.timeCreated) {
            jQuery('#Sharephe-WorkbookCreatedOn').text(workbook.timeCreated);
        }
        if (workbook.timeUpdated) {
            jQuery('#Sharephe-WorkbookUpdatedOn').text(workbook.timeUpdated);
        }
    }

    i2b2.Sharephe.tab.enableDisableOnQueryXml();
};
i2b2.Sharephe.workbook.form.populateReadOnly = function (workbook) {
    i2b2.Sharephe.workbook.form.setReadOnly(true);
    i2b2.Sharephe.workbook.form.populate(workbook);

    jQuery('#Sharephe-WorkbookNewBtn').show();
    if (i2b2.Sharephe.workbook.currentWorkbook.isOwner) {
        jQuery('#Sharephe-WorkbookCancelBtn').hide();
        jQuery('#Sharephe-WorkbookEditBtn').show();
    } else {
        jQuery('#Sharephe-WorkbookCancelBtn').hide();
        jQuery('#Sharephe-WorkbookEditBtn').hide();
    }

    jQuery("#workbook_files").hide();
    jQuery("#Sharephe-AttachedFileList").show();
    jQuery("#Sharephe-SelectedFiles").hide();
    jQuery("#Sharephe-CurrentAttachementView").hide();
    jQuery('#Sharephe-SubmitButton').hide();
    jQuery('#Sharephe-WorkbookFooter').show();
};
i2b2.Sharephe.workbook.form.createNew = function () {
    i2b2.Sharephe.workbook.form.setReadOnly(false);
    i2b2.Sharephe.workbook.form.populate({
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

    jQuery('#Sharephe-WorkbookNewBtn').hide();
    jQuery('#Sharephe-WorkbookEditBtn').hide();
    jQuery('#Sharephe-WorkbookCancelBtn').hide();
    jQuery('#Sharephe-AddEditWorkbook').hide();

    jQuery('#workbook_files').show();
    jQuery('#Sharephe-AttachedFileList').hide();
    jQuery('#Sharephe-SelectedFiles').show();
    jQuery('#Sharephe-CurrentAttachementView').hide();
    jQuery('#Sharephe-SubmitButton').show();
    jQuery('#Sharephe-WorkbookFooter').hide();
};
i2b2.Sharephe.workbook.form.enableEdit = function () {
    i2b2.Sharephe.workbook.form.setReadOnly(false);
    i2b2.Sharephe.workbook.form.populate(i2b2.Sharephe.workbook.currentWorkbook);

    jQuery('#Sharephe-WorkbookNewBtn').hide();
    jQuery('#Sharephe-WorkbookEditBtn').hide();
    jQuery('#Sharephe-WorkbookCancelBtn').show();

    jQuery("#workbook_files").show();
    jQuery("#Sharephe-AttachedFileList").hide();
    jQuery("#Sharephe-SelectedFiles").show();
    jQuery("#Sharephe-CurrentAttachementView").show();
    jQuery('#Sharephe-SubmitButton').show();
    jQuery('#Sharephe-WorkbookFooter').show();
};
i2b2.Sharephe.workbook.form.cancelEdit = function () {
    i2b2.Sharephe.workbook.form.populateReadOnly(i2b2.Sharephe.workbook.currentWorkbook);
    i2b2.Sharephe.tab.enableDisableOnQueryXml();
};
i2b2.Sharephe.workbook.form.save = function () {
    i2b2.Sharephe.modal.progress.show('Saving Phenotype');

    // save author
    let workbook_authors = jQuery('#workbook_authors').val();
    const authors = workbook_authors
            .replace(/[\r\n\t\s]+/g, ' ')
            .trim()
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    jQuery('#workbook_authors').val(JSON.stringify(authors));

    // save current attachement files
    let saveFiles = [];
    let attachmentTable = document.getElementById('Sharephe-CurrentAttachementTable');
    for (let i = 0; i < attachmentTable.rows.length; i++) {
        let anchorTag = attachmentTable.rows.item(i).cells.item(0).getElementsByTagName("a")[0];
        if (anchorTag) {
            saveFiles.push(anchorTag.innerHTML.trim());
        }
    }
    jQuery('#workbook_attachments').val(JSON.stringify(saveFiles));

    // save query-xml data
    const queryXmlData = [];
    const xmlSerializer = i2b2.Sharephe.utils.xmlSerializer;
    const queryXmls = i2b2.Sharephe.workbook.queryXmls;
    for (let i = 0; i < queryXmls.length; i++) {
        if (queryXmls[i]) {
            let strXML = xmlSerializer.serializeToString(queryXmls[i]);
            let data = strXML.trim().split('\n').map(line => line.trim()).filter(line => line);
            queryXmlData.push(data.join('\n'));
        }
    }
    jQuery('#workbook_query_xml').val(JSON.stringify(queryXmlData));

    // save validated-by
    let workbook_validated_by = jQuery('#workbook_validated_by').val();
    const validated_by = workbook_validated_by
            .replace(/[\r\n\t\s]+/g, ' ')
            .trim()
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    if (jQuery("#workbook_is_validated").is(':checked')) {
        jQuery('#workbook_validated_by').val(JSON.stringify(validated_by));
    }

    jQuery('#workbook_id').prop("disabled", false);

    const formData = new FormData(document.getElementById("Sharephe-WorkbookForm"));
    const successHandler = function (workbook) {
        setTimeout(function () {
            i2b2.Sharephe.workbook.form.populateReadOnly(workbook);
            i2b2.Sharephe.workbook.refreshList();
            i2b2.Sharephe.tab.enableDisableOnQueryXml();

            i2b2.Sharephe.modal.progress.hide();
            i2b2.Sharephe.modal.message.show(
                    'Phenotype Saved',
                    'Your phenotype is saved to cloud sucessfully!');
        }, 500);
    };
    const errorHandler = function (err) {
        setTimeout(function () {
            i2b2.Sharephe.modal.progress.hide();
            if (err.statusText && err.responseJSON) {
                i2b2.Sharephe.modal.message.show(err.statusText, err.responseJSON.message);
            } else {
                i2b2.Sharephe.modal.message.show(
                        'Save Phenotype Failed',
                        'Unable to save phenotype workbook at this time.');
            }
        }, 500);
    };

    i2b2.Sharephe.rest.workbook.save(formData, successHandler, errorHandler);
    jQuery('#workbook_id').prop("disabled", true);
    jQuery('#workbook_authors').val(authors.join(', '));
    jQuery('#workbook_validated_by').val(validated_by.join(', '));
};
i2b2.Sharephe.workbook.form.backToPlugInWrapper = function () {
    jQuery('#Sharephe-bckBtn').hide();
    i2b2.hive.MasterView.setViewMode('Analysis');
};
i2b2.Sharephe.workbook.form.buildBackToPlugInButton = function () {
    if (!jQuery('#Sharephe-bckBtn').length) {
        jQuery('body').prepend('<button class="Sharephe-BackToSharephe" id="Sharephe-bckBtn" onclick="i2b2.Sharephe.workbook.form.backToPlugInWrapper();"><i class="bi bi-arrow-left-square-fill"></i> Back to Sharephe</button>');
    }
};

i2b2.Sharephe.workbook.sync = function () {
    let successHandler = function (data) {
        setTimeout(function () {
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
        }, 500);
    };
    let errorHandler = function () {};

    i2b2.Sharephe.rest.workbook.fetchList(successHandler, errorHandler);
};