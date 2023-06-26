i2b2.Sharephe.workbook = {
    selectedPhenotypeId: null,
    currentWorkbook: null,
    highestPSDDIndex: -1,
    btnIndex: -1,
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

            i2b2.Sharephe.tab.enableDisableBasedOnAuthentication();
        }, 500);
    };
    const errorHandler = function () {};

    i2b2.Sharephe.rest.workbook.fetchList(successHandler, errorHandler);
};

i2b2.Sharephe.workbook.form = {
    isReadOnly: false
};

i2b2.Sharephe.workbook.form.queryXml = function () {};
i2b2.Sharephe.workbook.form.queryXml.clearDDFields = function () {
    // remove all the dropped queries
    let table = document.getElementById("Sharephe-QueryDropArea");
    while (table.rows.length > 0) {
        table.deleteRow(-1);
    }

    i2b2.Sharephe.workbook.btnIndex = -1;
    i2b2.Sharephe.workbook.highestPSDDIndex = -1;
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
i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField = function () {
    let index = ++i2b2.Sharephe.workbook.highestPSDDIndex;  // increment highest field counter
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
i2b2.Sharephe.workbook.form.queryXml.createNewBtn = function () {
    let index = ++i2b2.Sharephe.workbook.btnIndex;  // increment highest field counter

    let queryRunBtnElement = document.createElement("button");
    queryRunBtnElement.id = `SharepheBtn-viewRun-${index}`;
    queryRunBtnElement.className = 'viewRun SDX shp-btn shp-btn-secondary shp-btn-sm';
    queryRunBtnElement.type = 'button';
    queryRunBtnElement.innerHTML = '<i class="bi bi-play-fill"></i> Run Query ' + (index + 1);
    queryRunBtnElement.addEventListener("click", function () {
        i2b2.Sharephe.workbook.form.queryXml.masterView(this.id);
    }, false);

    let table = document.getElementById("Sharephe-QueryDropArea");
    let rowIndex = table.rows.length - 1;
    let row = table.rows[rowIndex];
    row.cells[1].appendChild(queryRunBtnElement);
};
i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText = function (text, index) {
    return i2b2.Sharephe.workbook.form.isReadOnly
            ? text
            : text + '<a class="shp-text-danger shp-float-right" title="Delete Query" onclick="i2b2.Sharephe.workbook.form.deleteQueryXml(this, ' + index + ');"><i class="bi bi-trash3"></i></a>';
};
i2b2.Sharephe.workbook.form.queryXml.qmDropped = function (sdxData, droppedOnID) {
    if (i2b2.Sharephe.workbook.form.isReadOnly) {
        return;
    }

    // Check if something was dropped on the lowest field (=field with highest id). If yes create a new field under it
    let fieldIndex = parseInt(droppedOnID.slice(droppedOnID.lastIndexOf('-') + 1, droppedOnID.length));
    if (i2b2.Sharephe.workbook.highestPSDDIndex === fieldIndex && fieldIndex < 9) {
        i2b2.Sharephe.workbook.form.queryXml.createNewBtn();
        i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField();
    }

    // Save the info to our local data model
    sdxData = sdxData[0];
    //collect all the qm_id for the queries
    //upload query XML to cloud
    i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("CRC:QueryTool", {qm_key_value: sdxData.sdxInfo.sdxKeyValue}, function (result) {
        let query = new XMLSerializer().serializeToString(result.refXML.documentElement);
        i2b2.Sharephe.workbook.queryXmls.push(jQuery.parseXML(query));
        i2b2.Sharephe.tab.enableDisableOnQueryXml();
    });
    // Change appearance of the drop field
    jQuery('#Sharephe-QMDROP-' + fieldIndex).html(i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText(i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName), fieldIndex));
};
i2b2.Sharephe.workbook.form.queryXml.masterView = function (q_id) {
    i2b2.Sharephe.workbook.showBckBtn = true;
    jQuery('#Sharephe-bckBtn').show();
    i2b2.hive.MasterView.setViewMode('Patients');

    let q_num = q_id.substring(q_id.lastIndexOf('-') + 1);
    let queryXML = i2b2.Sharephe.workbook.queryXmls[q_num];

    //use queryXML to file AJAX
    let qL = '';
    if (queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition').length === 0
            && queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns4:query_definition').length === 0) {
        qL = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns5:query_definition')[0].innerHTML;
    } else if (queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition').length === 0) {
        qL = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns4:query_definition')[0].innerHTML;
    } else {
        qL = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition')[0].innerHTML;
    }
    qL = '<query_definition>' + qL + '</query_definition>';

    let inQueryName = queryXML.getElementsByTagName('query_name')[0].innerHTML;
    let params = {
        result_wait_time: i2b2.CRC.view.QT.params.queryTimeout,
        psm_query_definition: qL
    };
    let name = "chk_PATIENT_COUNT_XML";
    let i = 9;
    let result_output = '<result_output priority_index= "' + i + '" name="' + name.substring(4).toLowerCase() + '"/>\n';

    params.psm_result_output = '<result_output_list>' + result_output + '</result_output_list>\n';
    $('runBoxText').innerHTML = "Cancel Query";
    i2b2.CRC.ctrlr.currentQueryStatus = new i2b2.CRC.ctrlr.QueryStatus($('infoQueryStatusText'));
    i2b2.CRC.ctrlr.currentQueryStatus.startQuery(inQueryName, params);
};

i2b2.Sharephe.workbook.form.clear = function () {
    i2b2.Sharephe.workbook.selectedPhenotypeId = null;
    i2b2.Sharephe.workbook.currentWorkbook = null;
    i2b2.Sharephe.workbook.highestPSDDIndex = -1;
    i2b2.Sharephe.workbook.btnIndex = -1;
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
};
i2b2.Sharephe.workbook.form.addToFileAttachementList = function (files, fileURL) {
    let attachedFileListTable = document.getElementById("Sharephe-AttachedFileListTable");
    let tBody = (attachedFileListTable.tBodies.length > 0)
            ? attachedFileListTable.tBodies[0]
            : attachedFileListTable.createTBody();
    for (let i = 0; i < files.length; i++) {
        let ahref = fileURL + '/' + files[i];
        let url = '<a class="shp-a" href="' + ahref + '" target="_blank">' + files[i] + '</a>';

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
        let url = '<a class="shp-a" href="' + ahref + '" target="_blank">' + files[i] + '</a>';

        let row = tBody.insertRow(-1);
        row.insertCell(0).innerHTML = url;

        let lastColumn = row.insertCell(1);
        lastColumn.setAttribute('style', 'width: 10px;');
        lastColumn.innerHTML = '<a class="shp-a shp-text-danger" title="Delete" onclick="i2b2.Sharephe.workbook.form.deleteAttachement(this);"><i class="bi bi-trash3"></i></a>';
    }
};
i2b2.Sharephe.workbook.form.addToQueryXmlList = function (strQueryXml) {
    let queryXmlList = i2b2.Sharephe.workbook.form.queryXml.parse(strQueryXml);
    if (queryXmlList.length > 0) {
        let lastIndex = queryXmlList.length - 1;
        for (let i = 0; i < lastIndex; i++) {
            i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField();
            i2b2.Sharephe.workbook.form.queryXml.createNewBtn();
            jQuery('#Sharephe-QMDROP-' + i).html(i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText(i2b2.Sharephe.workbook.form.queryXml.getName(queryXmlList[i]), i));
            i2b2.Sharephe.workbook.queryXmls.push(queryXmlList[i]);
        }
        i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField();
        i2b2.Sharephe.workbook.form.queryXml.createNewBtn();
        jQuery('#Sharephe-QMDROP-' + lastIndex).html(i2b2.Sharephe.workbook.form.queryXml.createQueryXmlText(i2b2.Sharephe.workbook.form.queryXml.getName(queryXmlList[lastIndex]), lastIndex));
        i2b2.Sharephe.workbook.queryXmls.push(queryXmlList[lastIndex]);
    }

    if (!i2b2.Sharephe.workbook.form.isReadOnly) {
        i2b2.Sharephe.workbook.form.queryXml.createNewPSDDField();
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
        lastColumn.innerHTML = '<a class="shp-a shp-text-danger" title="Delete" onclick="i2b2.Sharephe.workbook.form.removeSelectedAttachment(this, \'' + file.name + '\');"><i class="bi bi-trash3"></i></a>';

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

        jQuery('.Sharephe-PhenoName').text(workbook.title);

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
        type: '',
        title: '',
        authors: [],
        institution: '',
        isOwner: true,
        timeCreated: null,
        timeUpdated: null,
        files: [],
        fileUrl: null,
        queryXML: null
    });

    jQuery('#Sharephe-WorkbookCancelBtn').hide();
    jQuery('#Sharephe-WorkbookEditBtn').hide();
    jQuery('#Sharephe-WorkbookNewBtn').show();

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

    jQuery('#Sharephe-WorkbookCancelBtn').show();
    jQuery('#Sharephe-WorkbookEditBtn').hide();

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
    i2b2.Sharephe.modal.progress.show();

    // save current attachement files
    let saveFiles = [];
    let attachmentTable = document.getElementById('Sharephe-CurrentAttachementTable');
    for (let i = 0; i < attachmentTable.rows.length; i++) {
        let anchorTag = attachmentTable.rows.item(i).cells.item(0).getElementsByTagName("a")[0];
        if (anchorTag) {
            saveFiles.push(anchorTag.innerHTML);
        }
    }
    jQuery('#workbook_attachments').val(JSON.stringify(saveFiles));

    // save XML queries
    let queryXmlData = [];
    let xmlSerializer = new window.XMLSerializer();
    jQuery.each(i2b2.Sharephe.workbook.queryXmls, function (index, element) {
        // get valid (non-null) queries
        if (element) {
            queryXmlData.push(xmlSerializer.serializeToString(element));
        }
    });
    jQuery('#workbook_query_xml').val(queryXmlData.toString());

    jQuery('#workbook_id').prop("disabled", false);

    const formData = new FormData(document.getElementById("Sharephe-WorkbookForm"));
    const successHandler = function (workbook) {
        setTimeout(function () {
            i2b2.Sharephe.workbook.form.populateReadOnly(workbook);
            i2b2.Sharephe.workbook.refreshList();

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