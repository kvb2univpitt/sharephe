i2b2.Sharephe.modal = {
    progress: {
        show: function (title) {
            jQuery('#Sharephe-ProgressModalTitle').text(title);
            if (!i2b2.Sharephe.modal.progress.panel) {
                let panel = new YAHOO.widget.Panel('Sharephe-ProgressModal', {
                    width: "200px",
                    fixedcenter: true,
                    close: false,
                    draggable: false,
                    zindex: 4,
                    modal: true,
                    visible: false
                });
                panel.render(document.body);
                i2b2.Sharephe.modal.progress.panel = panel;
            }

            i2b2.Sharephe.modal.progress.panel.show();
        },
        hide: function () {
            if (i2b2.Sharephe.modal.progress.panel) {
                i2b2.Sharephe.modal.progress.panel.hide();
            }
        }
    },
    message: {
        show: function (title, message) {
            if (!i2b2.Sharephe.modal.message.panel) {
                jQuery('#Sharephe-MessageModalTitle').text(title);
                jQuery('#Sharephe-MessageModalMessage').text(message);
                let panel = new YAHOO.widget.Panel('Sharephe-MessageModal', {
                    width: "400px",
                    fixedcenter: true,
                    close: true,
                    draggable: true,
                    zindex: 4,
                    modal: true,
                    visible: false
                });
                panel.render(document.body);
                i2b2.Sharephe.modal.message.panel = panel;
            }

            i2b2.Sharephe.modal.message.panel.show();
        },
        hide: function () {
            if (i2b2.Sharephe.modal.message.panel) {
                i2b2.Sharephe.modal.message.panel.hide();
            }
        }
    }
};

i2b2.Sharephe.syncFromCloud = function () {
    i2b2.Sharephe.modal.progress.show('Sync From Clould');
    jQuery.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'http://' + location.host + '/sharephe/api/workbook'
    }).done(function (data) {
        let datatable = i2b2.Sharephe.workbookTable;
        datatable.clear();
        jQuery.each(data, function (index, element) {
            let workbook = element.workbook;
            i2b2.Sharephe.workbooks[workbook.phenotypeId] = element;

            datatable.row.add([
                workbook.phenotypeId,
                workbook.type,
                workbook.title,
                workbook.authors,
                workbook.institution,
                element.files.join(', ')
            ]);
        });
        datatable.draw();

        i2b2.Sharephe.modal.progress.hide();
        jQuery('#Sharephe-WorkbookList').show();
    }).fail(function () {
        i2b2.Sharephe.modal.progress.hide();
        i2b2.Sharephe.modal.message.show('Sync From Cloud Failed', 'Unable to retrieve list from server.');
        console.log('fail');
    });
};

i2b2.Sharephe.workbook = {
    form: {
        isReadOnly: false,
        clear: function () {
            i2b2.Sharephe.model.details = [];
            i2b2.Sharephe.model.QMRecord = false;
            i2b2.Sharephe.model.highestPSDDIndex = 0;
            i2b2.Sharephe.queryXmls = [];

            jQuery("#Sharephe-UploadForm  :input").val('');
            jQuery("#Sharephe-SelectedFileList").empty();
            document.getElementById("Sharephe-AttachedFileList").innerHTML = '';

            i2b2.Sharephe.clearDDFields();
        },
        generateAndSetId: function () {
            document.getElementById("Sharephe-PhenotypeId").value = (new Date).getTime();
        },
        addToFileAttachementList: function (files, fileURL) {
            let anchorTags = [];
            for (let i = 0; i < files.length; i++) {
                let ahref = fileURL + '/' + files[i];
                anchorTags.push('<a class="sharephe-a" href="' + ahref + '" target="_blank">' + files[i] + '</a>');
            }

            document.getElementById("Sharephe-AttachedFileList").innerHTML = anchorTags.join('<br />');
        },
        addToQueryXmlList: function (workbook) {
            let queryXML = i2b2.Sharephe.queryXmlUtils.parse(workbook.queryXML);
            if (queryXML.length > 0) {
                let lastIndex = queryXML.length - 1;
                for (let i = 0; i < lastIndex; i++) {
                    i2b2.Sharephe.createNewPSDDField();
                    i2b2.Sharephe.createNewBtn();
                    jQuery('#Sharephe-QMDROP-' + i).text(i2b2.Sharephe.queryXmlUtils.getName(queryXML[i]));
                    i2b2.Sharephe.queryXmls.push(queryXML[i]);
                }

                i2b2.Sharephe.createNewPSDDField();
                i2b2.Sharephe.createNewBtn();
                jQuery('#Sharephe-QMDROP-' + lastIndex).text(i2b2.Sharephe.queryXmlUtils.getName(queryXML[lastIndex]));
                i2b2.Sharephe.queryXmls.push(queryXML[lastIndex]);
            }
        },
        readOnly: function (isReadOnly) {
            document.getElementById("Sharephe-PhenotypeId").readOnly = true;
            document.getElementById("Sharephe-PhenotypeId").disabled = true;

            document.getElementById("Sharephe-Type").disabled = isReadOnly;
            document.getElementById("Sharephe-Title").readOnly = isReadOnly;
            document.getElementById("Sharephe-Authors").readOnly = isReadOnly;
            document.getElementById("Sharephe-Institution").readOnly = isReadOnly;
            document.getElementById("Sharephe-AttachedFiles").readOnly = isReadOnly;

            this.isReadOnly = isReadOnly;
        },
        populate: function (data) {
            this.clear();

            let workbook = data.workbook;
            jQuery('#Sharephe-PhenotypeId').val(workbook.phenotypeId);
            jQuery('#Sharephe-Type').val(workbook.type);
            jQuery('#Sharephe-Title').val(workbook.title);
            jQuery('#Sharephe-Authors').val(workbook.authors);
            jQuery('#Sharephe-Institution').val(workbook.institution);

            this.addToFileAttachementList(data.files, data.fileURL);
            this.addToQueryXmlList(workbook);
        },
        populateReadOnly: function (data) {
            this.populate(data);
            this.readOnly(true);

            document.getElementById("Sharephe-CancelButton").hide();
            document.getElementById("Sharephe-EditButton").show();
            document.getElementById("Sharephe-NewButton").show();

            document.getElementById("Sharephe-AttachedFiles").hide();
            document.getElementById("Sharephe-AttachedFileList").show();
            document.getElementById("Sharephe-SelectedFileList").hide();
            document.getElementById("Sharephe-SubmitButton").hide();
        },
        createNew: function () {
            this.clear();
            this.generateAndSetId();
            this.readOnly(false);

            i2b2.Sharephe.selectedPheotypeId = '';

            document.getElementById("Sharephe-CancelButton").hide();
            document.getElementById("Sharephe-EditButton").hide();
            document.getElementById("Sharephe-NewButton").show();

            document.getElementById("Sharephe-AttachedFiles").show();
            document.getElementById("Sharephe-AttachedFileList").hide();
            document.getElementById("Sharephe-SelectedFileList").show();
            document.getElementById("Sharephe-SubmitButton").show();
        },
        enableEdit: function () {
            this.readOnly(false);

            document.getElementById("Sharephe-CancelButton").show();
            document.getElementById("Sharephe-EditButton").hide();
            document.getElementById("Sharephe-NewButton").hide();

            document.getElementById("Sharephe-AttachedFiles").show();
            document.getElementById("Sharephe-AttachedFileList").hide();
            document.getElementById("Sharephe-SelectedFileList").show();
            document.getElementById("Sharephe-SubmitButton").show();
        },
        cancelEdit: function () {
            let element = i2b2.Sharephe.workbooks[i2b2.Sharephe.selectedPheotypeId];
            i2b2.Sharephe.workbook.form.populateReadOnly(element);
        }
    }
};

i2b2.Sharephe.queryXmlUtils = {
    parse: function (strQueryXml) {
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
    },
    getName: function (queryXml) {
        return i2b2.h.getXNodeVal(queryXml, 'query_name');
    }
};

i2b2.Sharephe.backToPlugInWrapper = function () {
    jQuery('#Sharephe-bckBtn').hide();
    i2b2.hive.MasterView.setViewMode('Analysis');
};

i2b2.Sharephe.buildBackToPlugInButton = function () {
    if (!jQuery('#Sharephe-bckBtn').length) {
        jQuery('body').prepend('<button class="Sharephe-BackToSharephe" id="Sharephe-bckBtn" onclick="i2b2.Sharephe.backToPlugInWrapper();"><i class="bi bi-arrow-left-square-fill"></i> Back to Sharephe</button>');
    }
};

//View and Run Query
i2b2.Sharephe.masterView = function (q_id) {
    i2b2.Sharephe.showBckBtn = true;
    jQuery('#Sharephe-bckBtn').show();
    i2b2.hive.MasterView.setViewMode('Patients');
    q_num = q_id.substring(q_id.lastIndexOf('-') + 1);

    let queryXML = i2b2.Sharephe.queryXmls[q_num];

    //use queryXML to file AJAX
    a = '<query_definition>';
    b = '</query_definition>';
    if (queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition').length === 0 && queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns4:query_definition').length === 0) {
        qL = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns5:query_definition')[0].innerHTML;
    } else if (queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition').length === 0) {
        qL = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns4:query_definition')[0].innerHTML;
    } else {
        qL = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition')[0].innerHTML;
    }

    qL = a + qL + b;
    var inQueryName = queryXML.getElementsByTagName('query_name')[0].innerHTML;
    var params = {
        result_wait_time: i2b2.CRC.view.QT.params.queryTimeout,
        psm_query_definition: qL
    };
    var name = "chk_PATIENT_COUNT_XML";
    var i = 9;
    var result_output = '<result_output priority_index= "' + i + '" name="' + name.substring(4).toLowerCase() + '"/>\n';

    params.psm_result_output = '<result_output_list>' + result_output + '</result_output_list>\n';
    $('runBoxText').innerHTML = "Cancel Query";
    i2b2.CRC.ctrlr.currentQueryStatus = new i2b2.CRC.ctrlr.QueryStatus($('infoQueryStatusText'));
    i2b2.CRC.ctrlr.currentQueryStatus.startQuery(inQueryName, params);
};

i2b2.Sharephe.createNewPSDDField = function () {
    let index = ++i2b2.Sharephe.model.highestPSDDIndex;  // increment highest field counter
    let queryDropElementId = 'Sharephe-QMDROP-' + index;

    let queryDropElement = document.createElement("div");
    queryDropElement.id = queryDropElementId;
    queryDropElement.className = "droptrgt SDX-QM";
    queryDropElement.innerHTML = 'Query ' + (index + 1);

    let table = document.getElementById("Sharephe-QueryDropArea");
    let row = table.insertRow(-1);

    let dropQueryCell = row.insertCell(0);
//    dropQueryCell.width = '75%';
    dropQueryCell.appendChild(queryDropElement);

    let queryBtnCell = row.insertCell(1);
    queryBtnCell.className = "Sharephe-QueryButtonCell";

    // register as drag&drop target
    i2b2.sdx.Master._sysData[queryDropElementId] = {}; // hack to get an old dd field unregistered as there's no function for it...
    let op_trgt = {dropTarget: true};
    i2b2.sdx.Master.AttachType(queryDropElementId, "QM", op_trgt);
    i2b2.sdx.Master.setHandlerCustom(queryDropElementId, "QM", "DropHandler", i2b2.Sharephe.QMDropped);
};

i2b2.Sharephe.createNewBtn = function () {
    let index = ++i2b2.Sharephe.model.BtnIndex;  // increment highest field counter

    let queryRunBtnElement = document.createElement("button");
    queryRunBtnElement.id = `SharepheBtn-viewRun-${index}`;
    queryRunBtnElement.className = 'viewRun SDX sharephe-btn sharephe-btn-secondary sharephe-btn-sm';
    queryRunBtnElement.type = 'button';
    queryRunBtnElement.innerHTML = '<i class="bi bi-play-fill"></i> Run Query ' + (index + 1);
    queryRunBtnElement.addEventListener("click", function () {
        i2b2.Sharephe.masterView(this.id);
    }, false);

    let table = document.getElementById("Sharephe-QueryDropArea");
    let row = table.rows[table.rows.length - 2];
    row.cells[1].appendChild(queryRunBtnElement);
};

i2b2.Sharephe.QMDropped = function (sdxData, droppedOnID) {
    if (i2b2.Sharephe.workbook.form.isReadOnly) {
        return;
    }

    // Check if something was dropped on the lowest field (=field with highest id). If yes create a new field under it
    let fieldIndex = parseInt(droppedOnID.slice(droppedOnID.lastIndexOf('-') + 1, droppedOnID.length));
    if (i2b2.Sharephe.model.highestPSDDIndex === fieldIndex && fieldIndex < 9) {
        i2b2.Sharephe.createNewPSDDField();
        i2b2.Sharephe.createNewBtn();
    }

    // Save the info to our local data model
    sdxData = sdxData[0];
    //collect all the qm_id for the queries
    //upload query XML to cloud
    i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("CRC:QueryTool", {qm_key_value: sdxData.sdxInfo.sdxKeyValue}, function (result) {
        query = new XMLSerializer().serializeToString(result.refXML.documentElement);
        i2b2.Sharephe.queryXmls.push(jQuery.parseXML(query));
    });
    // Change appearance of the drop field
    $("Sharephe-QMDROP-" + fieldIndex).innerHTML = i2b2.h.Escape(sdxData.sdxInfo.sdxDisplayName);
};

i2b2.Sharephe.clearDDFields = function () {
    // remove all the dropped queries
    let table = document.getElementById("Sharephe-QueryDropArea");
    while (table.rows.length > 0) {
        table.deleteRow(-1);
    }

    i2b2.Sharephe.model.BtnIndex = -1;
    i2b2.Sharephe.model.highestPSDDIndex = -1;

    // Create one patient set field
    i2b2.Sharephe.createNewPSDDField();
};

i2b2.Sharephe.Init = function (loadedDiv) {
    // tabs event handler
    this.yuiTabs = new YAHOO.widget.TabView("Sharephe-TABS", {activeIndex: 0});
    this.yuiTabs.on('activeTabChange', function (evt) {
        switch (evt.newValue.get('id')) {
            case "Sharephe-TAB0":
                jQuery('#phenotypeName').empty();
                break;
            case "Sharephe-TAB1":
                break;
            case "Sharephe-TAB2":
                i2b2.Sharephe.showQueryDetails();
                break;
        }
    });

    jQuery(document).on('click', '#Sharephe-WorkbookTable tr', function (evt) {
        let phenotypeId = this.cells[0].innerHTML;
        let element = i2b2.Sharephe.workbooks[phenotypeId];
        let workbook = element.workbook;

        // save the selected phenotype ID
        i2b2.Sharephe.selectedPheotypeId = phenotypeId;
        i2b2.Sharephe.queryXmls = [];

        jQuery('#Sharephe-PhenoName').text(workbook.title);

        // set up tab 1 (workbook tab)
        i2b2.Sharephe.workbook.form.populateReadOnly(element);

        $('Sharephe-TAB1').click();
    });

    // add selected files (attachements) to list
    jQuery('#Sharephe-AttachedFiles').on('change', function () {
        jQuery('#Sharephe-SelectedFileList').empty();

        let selectedFileList = document.getElementById("Sharephe-SelectedFileList");
        jQuery.each(document.getElementById('Sharephe-AttachedFiles').files, function (index, element) {
            let option = document.createElement("option");
            option.text = element.name;
            selectedFileList.add(option);
        });
    });

    jQuery('#Sharephe-UploadForm').submit(function (evt) {
        evt.preventDefault();

        // save XML queries
        let xmlSerializer = new window.XMLSerializer();
        let queryXmlData = [];
        jQuery.each(i2b2.Sharephe.queryXmls, function (index, element) {
            queryXmlData.push(xmlSerializer.serializeToString(element));
        });
        jQuery('#Sharephe-QueryXml').val(queryXmlData.toString());

        jQuery('#Sharephe-PhenotypeId').removeAttr('disabled');

        var formData = new FormData(this);

        i2b2.Sharephe.modal.progress.show('Saving Phenotype');
        jQuery.ajax({
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            url: 'http://' + location.host + '/sharephe/api/workbook/upload'
        }).success(function (data) {
            let workbook = data.workbook;
            i2b2.Sharephe.workbooks[workbook.phenotypeId] = data;
            i2b2.Sharephe.workbook.form.populateReadOnly(data);

            i2b2.Sharephe.modal.progress.hide();
            i2b2.Sharephe.modal.message.show('Phenotype Saved', 'Your phenotype is saved to cloud sucessfully!');
        }).error(function () {
            i2b2.Sharephe.modal.progress.hide();
            i2b2.Sharephe.modal.message.show('Save Phenotype Failed', 'Unable to save phenotype workbook at this time.');
        });
    });

    i2b2.Sharephe.workbooks = [];
    i2b2.Sharephe.selectedPheotypeId = '';
    i2b2.Sharephe.queryXmls = [];
    i2b2.Sharephe.model.details = []; // query details for downloading
    i2b2.Sharephe.model.highestPSDDIndex = 0;

    i2b2.Sharephe.buildBackToPlugInButton();
    i2b2.Sharephe.showBckBtn = false;

    i2b2.Sharephe.workbook.form.createNew();

    i2b2.Sharephe.workbookTable = jQuery('#Sharephe-WorkbookTable').DataTable({
        "columnDefs": [{
                "targets": [0, 5],
                "orderable": false
            }]
    });
};

i2b2.Sharephe.Unload = function () {
    // purge old data
    i2b2.Sharephe.workbooks = [];
    i2b2.Sharephe.selectedPheotypeId = '';
    i2b2.Sharephe.queryXmls = [];
    i2b2.Sharephe.model.details = []; // query details for downloading
    i2b2.Sharephe.model.highestPSDDIndex = 0;

    i2b2.Sharephe.model.BtnIndex = -1;
    i2b2.Sharephe.model.highestPSDDIndex = -1;

    return true;
};

i2b2.Sharephe.showQueryDetails = function () {
    // clear the query detail objects since we are creating new ones here
    i2b2.Sharephe.model.details = [];

    // get the detail panel and clear its contents
    let mainElement = document.getElementById("Sharephe-Details");
    mainElement.innerHTML = '';

    if (i2b2.Sharephe.queryXmls.length > 0) {
        i2b2.Sharephe.addDownloadDetailButton(mainElement);
        jQuery.each(i2b2.Sharephe.queryXmls, function (index, element) {
            i2b2.Sharephe.extractAndShowQueryDetails(element, index, mainElement);
        });
    }
};

i2b2.Sharephe.toTabular = function (jsonDetail) {
    let str = 'Query Name,Invert,Occurrence,Term Name,Concept Name,Concept Basecode,Key\r\n';

    for (let i = 0; i < jsonDetail.length; i++) {
        let detail = jsonDetail[i];
        let name = detail.name;
        let groups = detail.groups;

        for (let j = 0; j < groups.length; j++) {
            let group = groups[j];
            let invert = group.invert;
            let occurrence = group.occurrence;
            let terms = group.terms;

            if (terms.length > 0) {
                for (let k = 0; k < terms.length; k++) {
                    let term = terms[k];
                    let termName = term.name;
                    let concepts = term.concepts;

                    if (concepts.length > 0) {
                        for (let l = 0; l < concepts.length; l++) {
                            let concept = concepts[l];
                            let conceptName = concept.name;
                            let conceptBasecode = concept.basecode;
                            let conceptKey = concept.key;

                            str += `"${name}",${invert},${occurrence},"${termName}","${conceptName}","${conceptBasecode}","${conceptKey}"\r\n`;
                        }
                    } else {
                        str += `"${name}",${invert},${occurrence},"${termName}",,,\r\n`;
                    }
                }
            } else {
                str += `"${name}",${invert},${occurrence},,,,\r\n`;
            }
        }
    }

    return str;
}

i2b2.Sharephe.showMoreLess = function (btn) {
    jQuery(`#list-${btn.id}`).find('tr:gt(4)').slideToggle();
    jQuery(btn).text(jQuery(btn).text() === 'Show More' ? 'Show Less' : 'Show More');
}

i2b2.Sharephe.downloadDetails = function () {
    let select = document.getElementById("Sharephe-FileType");
    let fileType = select.options[select.selectedIndex].value;
    if (fileType === 'csv') {
        let strData = i2b2.Sharephe.toTabular(i2b2.Sharephe.model.details);
        let blob = new Blob([strData], {type: 'text/csv;charset=utf-8;'});

        const downloadLink = document.createElement("a");
        downloadLink.download = 'data.csv';
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        const downloadLink = document.createElement("a");
        downloadLink.download = 'data.json';
        downloadLink.href = 'data:plain/text,' + JSON.stringify(i2b2.Sharephe.model.details);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
};

i2b2.Sharephe.addDownloadDetailButton = function (mainElement) {
    let downloadDetailElement = document.createElement("div");
    downloadDetailElement.style = 'position: absolute; right: 20px;';
    downloadDetailElement.id = 'download-detail';
    downloadDetailElement.innerHTML = `
    <div class="card">
        <div class="card-body">
            <div id="filetype-selection" style="padding-bottom: 4px">
                <div class="form-group">
                    <label for="Sharephe-FileType">File type:</label>
                    <select id="Sharephe-FileType">Sh
                        <option value="json">JSON</option>
                        <option value="csv" selected="selected">CSV</option>
                    </select>
                </div>
            </div>
            <div id="file-data-download">
                <button class="sharephe-btn sharephe-btn-sm sharephe-btn-secondary" onclick="i2b2.Sharephe.downloadDetails()" style="padding-left: 15px; padding-right: 15px;">
                    <i class="bi bi-download"></i> Export Data
                </button>
            </div>
        </div>
    </div>
`;
    mainElement.appendChild(downloadDetailElement);
};

i2b2.Sharephe.extractQueryDetails = function (qx) {
    let queryDetail = {};
    queryDetail.name = qx.getElementsByTagName('name')[0].innerHTML.trim();
    queryDetail.groups = [];

    let panels = qx.getElementsByTagName('panel');
    for (let i = 0; i < panels.length; i++) {
        let panel = panels[i];

        let group = {};
        group.invert = parseInt(panel.getElementsByTagName('invert')[0].innerHTML.trim());
        group.occurrence = parseInt(panel.getElementsByTagName('total_item_occurrences')[0].innerHTML.trim());
        group.terms = [];
        queryDetail.groups.push(group);

        let items = panel.getElementsByTagName('item');
        for (let j = 0; j < items.length; j++) {
            let item = items[j];

            let term = {};
            term.name = i2b2.h.getXNodeVal(item, "item_name").trim();
            term.key = i2b2.h.getXNodeVal(item, 'item_key').trim();
            term.constraints = [];
            group.terms.push(term);

            // extract value constraint, if any
            let valueConstraints = item.getElementsByTagName("constrain_by_value");
            for (let k = 0; k < valueConstraints.length; k++) {
                let valueConstraint = valueConstraints[k];

                let value = i2b2.h.getXNodeVal(valueConstraint, "value_constraint");
                let valueOperator = i2b2.h.getXNodeVal(valueConstraint, "value_operator");
                let valueType = i2b2.h.getXNodeVal(valueConstraint, "value_type");
                let valueUnit = i2b2.h.getXNodeVal(valueConstraint, "value_unit_of_measure");

                let constraint = {};
                constraint.by = 'value';
                constraint.type = valueType.trim();
                constraint.value = value.trim();
                if (valueUnit) {
                    constraint.operator = valueOperator.trim();
                    constraint.unit = valueUnit.trim();
                }
                term.constraints.push(constraint);
            }

            // extract date constraint
            let dateConstraints = item.getElementsByTagName("constrain_by_date");
            for (let k = 0; k < dateConstraints.length; k++) {
                let dateConstraint = dateConstraints[k];

                let dateFrom = i2b2.h.getXNodeVal(dateConstraint, "date_from");
                let dateTo = i2b2.h.getXNodeVal(dateConstraint, "date_to");

                let constraint = {};
                constraint.by = 'date';
                constraint.from = dateFrom.trim();
                constraint.to = dateTo.trim();
                term.constraints.push(constraint);
            }
        }
    }

    return queryDetail;
};

i2b2.Sharephe.extractAndShowQueryDetails = function (qx, ithQuery, mainElement) {
    let queryDetail = i2b2.Sharephe.extractQueryDetails(qx);
    i2b2.Sharephe.model.details.push(queryDetail);

    /**
     * <div class="query" id="query-i"></div>
     */
    let queryElement = document.createElement("div");
    queryElement.id = `query-${ithQuery}`;
    queryElement.className = 'query';
    mainElement.appendChild(queryElement);

    /**
     * <div class="query" id="query-i">
     *     <div class="query-name bold">My Query</div>
     * </div>
     */
    let queryNameElement = document.createElement('div');
    queryNameElement.className = 'query-name bold';
    queryNameElement.innerHTML = `Query Name: ${queryDetail.name}`;
    queryElement.appendChild(queryNameElement);

    /**
     * <div class="query" id="query-i">
     *     <div class="groups"></div>
     * </div>
     */
    let groupsElement = document.createElement('div');
    groupsElement.className = 'groups';
    queryElement.appendChild(groupsElement);

    let groups = queryDetail.groups;
    for (let i = 0; i < groups.length; i++) {
        let group = groups[i];

        /**
         * <div class="groups">
         *     <div id="group-i">
         *     </div>
         * </div>
         */
        let groupElement = document.createElement('div');
        groupElement.id = `group-${i}`;
        groupsElement.appendChild(groupElement);

        /**
         * <div id="group-i">
         *     <div class="invert" style="color: red;">Exclude</div>
         * </div>
         */
        let invertElement = document.createElement('div');
        invertElement.className = 'invert';
        if (group.invert === 0) {
            invertElement.innerHTML = 'Include';
        } else {
            invertElement.style = 'color: red;';
            invertElement.innerHTML = 'Exclude';
        }
        groupElement.appendChild(invertElement);

        /**
         * <div id="group-i">
         *     <div class="occurrence" style="color: green;">Occurs > 0</div>
         * </div>
         */
        let occurrenceElement = document.createElement('div');
        occurrenceElement.className = 'occurrence';
        occurrenceElement.style = 'color: green;';
        occurrenceElement.innerHTML = `Occurs > ${group.occurrence - 1}`;
        groupElement.appendChild(occurrenceElement);

        /**
         * <div id="group-i">
         *     <div class="terms indent"></div>
         * </div>
         */
        let termsElement = document.createElement('div');
        termsElement.className = 'terms indent';
        groupElement.appendChild(termsElement);

        let terms = group.terms;
        for (let j = 0; j < terms.length; j++) {
            let term = terms[j];

            /**
             * <div class="terms indent">
             *     <div class="term" id="term-j"></div>
             * </div>
             */
            let termElement = document.createElement('div');
            termElement.id = `term-${j}`;
            termElement.className = 'term';
            termsElement.appendChild(termElement);

            /**
             * <div class="term" id="term-j">
             *     <div class="term-label">LDH 1 (Group:LDH1)value: < 35 %date: 1/1/1980 - 12/31/1999</div>
             * </div>
             */
            let termLabelElement = document.createElement('div');
            termLabelElement.className = 'term-label';
            termLabelElement.innerHTML = i2b2.Sharephe.createTermLabel(term);
            termElement.appendChild(termLabelElement);

            let conceptsElement = document.createElement('div');
            conceptsElement.className = 'concepts indent';
            conceptsElement.innerHTML = '<img src="assets/images/spin.gif" height="20" width="20" />';
            termElement.appendChild(conceptsElement);

            i2b2.Sharephe.fetchConcepts(term, conceptsElement, termLabelElement, ithQuery, i, j);
        }
    }
};

i2b2.Sharephe.createTermLabel = function (term) {
    let label = `${term.name}`;

    let constraints = term.constraints;
    for (let i = 0; i < constraints.length; i++) {
        let constraint = constraints[i];

        if (constraint.by === 'value') {
            if (constraint.unit) {
                let operator;
                if (constraint.operator === 'LT') {
                    operator = '<';
                } else if (constraint.operator === 'GT') {
                    operator = '>';
                } else {
                    operator = '=';
                }

                label += `<span class="indent" style="color: blue;">value: ${operator} ${constraint.value} ${constraint.unit}</span>`;
            } else {
                label += `<span class="indent" style="color: blue;">value: ${constraint.value}</span>`;
            }
        } else if (constraint.by === 'date') {
            let dateFrom = (new Date(constraint.from)).toLocaleDateString();
            let dateTo = (new Date(constraint.to)).toLocaleDateString();

            label += `<span class="indent" style="color: blue;">date: ${dateFrom} - ${dateTo}</span>`;
        }
    }

    return label;
};

i2b2.Sharephe.fetchConcepts = function (term, conceptsElement, termLabelElement, ithQuery, ithGroup, ithTerm) {
    let options = {};
    options.version = i2b2.ClientVersion;
    options.ont_hidden_records = false;
    options.ont_max_records = 'max="10000"';
    options.ont_synonym_records = false;
    options.ont_level_records = -1;
    options.concept_key_value = `${term.key}`;

    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.callback = function (results) {
        term.concepts = i2b2.Sharephe.extractConcepts(results);
        let uniuqeConcepts = i2b2.Sharephe.filterUniqueConcepts(term.concepts);

        let conceptTable = [];
        conceptTable.push(`<table class="tbl-concepts" id="list-${ithQuery}-${ithGroup}-${ithTerm}">`);
        for (let i = 0; i < uniuqeConcepts.length; i++) {
            let concept = uniuqeConcepts[i];
            conceptTable.push(`<tr><td>${concept.basecode}</td><td><span class="spacing">${concept.name}</span></td></tr>`);
        }
        conceptTable.push('</table>');
        conceptsElement.innerHTML = conceptTable.join('\n');

        if (uniuqeConcepts.length > 5) {
            let button = `<span class="indent"><button class="sharephe-btn sharephe-btn-sm sharephe-btn-info" id="${ithQuery}-${ithGroup}-${ithTerm}" onclick="i2b2.Sharephe.showMoreLess(this);">Show More</button></span>`;
            termLabelElement.innerHTML = `${termLabelElement.innerHTML}${button}`;

            jQuery(`#list-${ithQuery}-${ithGroup}-${ithTerm}`).find('tr:gt(4)').slideToggle();
        }
    };

    i2b2.ONT.ajax.GetAllChildrenConcepts("Sharephe Plugin", options, scopedCallback);
};

i2b2.Sharephe.extractConcepts = function (results) {
    let concepts = [];

    // extract concepts
    let conceptObjs = results.refXML.getElementsByTagName("concept");
    for (let i = 0; i < conceptObjs.length; i++) {
        let conceptObj = conceptObjs[i];
        let name = i2b2.h.getXNodeVal(conceptObj, "name");
        let basecode = i2b2.h.getXNodeVal(conceptObj, "basecode");
        let key = i2b2.h.getXNodeVal(conceptObj, "key");

        // add concept only if it has name and basecode
        if (name && basecode) {
            let concept = {};
            concept.name = name.trim();
            concept.basecode = basecode.trim();
            concept.key = key.trim();

            concepts.push(concept);
        }
    }

    // sort concepts by basecode
    concepts.sort(function (c1, c2) {
        if (c1.basecode > c2.basecode) {
            return 1;
        } else if (c1.basecode < c2.basecode) {
            return -1;
        } else {
            return 0;
        }
    });

    return concepts;
};

i2b2.Sharephe.filterUniqueConcepts = function (concepts) {
    let uniuqeConcepts = [];

    let uniqueNames = new Set();
    for (let i = 0; i < concepts.length; i++) {
        let concept = concepts[i];

        if (!uniqueNames.has(concept.name)) {
            uniqueNames.add(concept.name);
            uniuqeConcepts.push(concept);
        }
    }

    return uniuqeConcepts;
};
