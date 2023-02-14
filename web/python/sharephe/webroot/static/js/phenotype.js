let sharepheModal = {
    progress: {
        show: (title) => {
            $('#Sharephe-ProgressModalTitle').text(title);
            $('#Sharephe-ProgressModal').modal('show');
        },
        hide: () => {
            $('#Sharephe-ProgressModal').modal('hide');
        }
    },
    message: {
        show: (title, message) => {
            $('#Sharephe-MessageModalLabel').text(title);
            $('#Sharephe-MessageModalMessage').text(message);
            $('#Sharephe-MessageModal').modal('show');
        }
    }
};

let queryXmlUtils = {
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

let workbook = {
    form: {
        clear: function () {
            $("#Sharephe-UploadForm  :input").val('');
            $("table#Sharephe-SelectedFileTable tbody").empty();

            document.getElementById("Sharephe-AttachedFileList").innerHTML = '';
        },
        addToFileAttachementList: function (files, fileURL) {
            let anchorTags = [];
            for (let i = 0; i < files.length; i++) {
                let ahref = fileURL + '/' + files[i];
                anchorTags.push('<a class="sharephe-a" href="' + ahref + '" target="_blank">' + files[i] + '</a>');
            }

            document.getElementById("Sharephe-AttachedFileList").innerHTML = anchorTags.join('<br />');
        },
        createNewPSDDField: function (text) {
            let queryDropElement = document.createElement("div");
            queryDropElement.className = "droptrgt SDX-QM";
            queryDropElement.innerHTML = text;

            let table = document.getElementById("Sharephe-QueryDropArea");
            let row = table.insertRow(-1);

            let dropQueryCell = row.insertCell(0);
            dropQueryCell.appendChild(queryDropElement);
        },
        addToQueryXmlList: function (workbook) {
            let queryXML = queryXmlUtils.parse(workbook.queryXML);
            if (queryXML.length > 0) {
                let lastIndex = queryXML.length - 1;
                for (let i = 0; i < lastIndex; i++) {
                    this.createNewPSDDField(queryXmlUtils.getName(queryXML[i]));
                }
                this.createNewPSDDField(queryXmlUtils.getName(queryXML[lastIndex]));
            }
        },
        populate: function (sharepheWorkbook) {
            this.clear();

            let workbook = sharepheWorkbook.workbook;
            $('#workbookId').val(workbook.phenotypeId);
            $('#workbookType').val(workbook.type);
            $('#workbookTitle').val(workbook.title);
            $('#workbookAuthors').val(workbook.authors.join(', '));
            $('#institution').val(workbook.institution);

            this.addToFileAttachementList(sharepheWorkbook.files, sharepheWorkbook.fileUrl);
            this.addToQueryXmlList(workbook);
        }
    }
};

let syncFromCloudAction = (successHandler, errorHandler) => {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'api/workbook',
        success: successHandler,
        error: errorHandler
    });
};

$(document).ready(function () {
    let sharepheWorkbooks = [];
    let sharepheQueryXmls = [];
    let selectedPheotypeId;

    let datatable = $('#Sharephe-WorkbookTable').DataTable();

    let syncFromCloudHandler = {
        successHandler: (data) => {
            setTimeout(function () {
                datatable.clear();
                data.forEach(function (sharepheWorkbook) {
                    let workbook = sharepheWorkbook.workbook;
                    datatable.row.add([
                        workbook.phenotypeId,
                        workbook.type,
                        workbook.title,
                        workbook.authors.join(', '),
                        workbook.institution,
                        sharepheWorkbook.files.join(', ')
                    ]);

                    sharepheWorkbooks[workbook.phenotypeId] = sharepheWorkbook;
                });

                datatable.draw();

                sharepheModal.progress.hide();
            }, 500);
        },
        errorHandler: () => {
            setTimeout(function () {
                datatable.clear();

                sharepheModal.progress.hide();
                sharepheModal.message.show(
                        'Sync From Cloud Failed',
                        'Unable to retrieve phenotypes from cloud.');
            }, 500);
        }
    };

    $("#syncFromCloudBtn").click(function () {
        sharepheModal.progress.show('Sync From Cloud');

        syncFromCloudAction(
                syncFromCloudHandler.successHandler,
                syncFromCloudHandler.errorHandler);
    });

    $(document).on('click', '#Sharephe-WorkbookTable tr', function () {
        let phenotypeId = this.cells[0].innerHTML;
        let sharepheWorkbook = sharepheWorkbooks[phenotypeId];

        // save the selected phenotype ID
        selectedPheotypeId = phenotypeId;
        sharepheQueryXmls = [];

        $('#Sharephe-PhenoName').text(sharepheWorkbook.workbook.title);

        $('#workbook-tab').removeClass('disabled');
        $('#detail-tab').removeClass('disabled');

        workbook.form.populate(sharepheWorkbook);

        $('#workbook-tab').click();
    });

    $("#syncFromCloudBtn").click();
});