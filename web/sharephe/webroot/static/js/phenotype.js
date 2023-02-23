let queryXmls = [];

let workbookForm = {
    clearDDFields: function () {
        // remove all the dropped queries
        let table = document.getElementById("Sharephe-QueryDropArea");
        while (table.rows.length > 0) {
            table.deleteRow(-1);
        }
    },
    clear: function () {
        queryXmls = [];
        
        $("#Sharephe-UploadForm  :input").val('');
        $("table#Sharephe-SelectedFileTable tbody").empty();

        document.getElementById("Sharephe-AttachedFileList").innerHTML = '';

        this.clearDDFields();
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

        let queryBtnCell = row.insertCell(1);
        queryBtnCell.className = "Sharephe-QueryButtonCell";
    },
    addToQueryXmlList: function (workbook) {
        queryXmls = queryXmlUtils.parse(workbook.queryXML);
        if (queryXmls.length > 0) {
            let lastIndex = queryXmls.length - 1;
            for (let i = 0; i < lastIndex; i++) {
                this.createNewPSDDField(queryXmlUtils.getName(queryXmls[i]));
                this.createNewBtn(i);
            }
            this.createNewPSDDField(queryXmlUtils.getName(queryXmls[lastIndex]));
            this.createNewBtn(lastIndex);
        }
    },
    populate: function (workbook) {
        this.clear();

        $('#workbook_id').val(workbook.phenotypeId);
        $('#workbook_type').val(workbook.type);
        $('#workbook_title').val(workbook.title);
        $('#workbook_authors').val(workbook.authors.join(', '));
        $('#workbook_institution').val(workbook.institution);

        this.addToFileAttachementList(workbook.files, workbook.fileUrl);
        this.addToQueryXmlList(workbook);
    },
    createNewBtn: function (id) {
        let queryRunBtnElement = document.createElement("button");
        queryRunBtnElement.id = 'detail-query-' + id;
        queryRunBtnElement.className = 'btn btn-secondary btn-sm';
        queryRunBtnElement.type = 'button';
        queryRunBtnElement.innerHTML = '<i class="bi bi-info-circle"></i> View Details';
        queryRunBtnElement.addEventListener("click", function () {
            alert(id);
        }, false);

        let table = document.getElementById("Sharephe-QueryDropArea");
        let rowIndex = table.rows.length - 1;
        let row = table.rows[rowIndex];
        row.cells[1].appendChild(queryRunBtnElement);
    }
};

let syncFromCloud = (datatable) => {
    sharepheModal.progress.show('Sync From Cloud');
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'api/workbook',
        success: (data) => {
            setTimeout(function () {
                datatable.clear();
                data.forEach(function (workbook) {
                    datatable.row.add([
                        workbook.phenotypeId,
                        workbook.type,
                        workbook.title,
                        workbook.authors.join(', '),
                        workbook.institution,
                        workbook.files.join(', ')
                    ]);
                });

                datatable.draw();

                workbookForm.clear();
                $('#workbook-tab').addClass('disabled');
                $('#detail-tab').addClass('disabled');

                sharepheModal.progress.hide();
            }, 500);
        },
        error: () => {
            setTimeout(function () {
                datatable.clear();

                sharepheModal.progress.hide();
                sharepheModal.message.show(
                        'Sync From Cloud Failed',
                        'Unable to retrieve phenotypes from cloud.');
            }, 500);
        }
    });
};

let fetchWorkbook = (phenotypeId) => {
    sharepheModal.progress.show('Fetching phenotype: ' + phenotypeId);
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'api/workbook/' + phenotypeId,
        success: (workbook) => {
            setTimeout(function () {
                if (workbook) {
                    $('#Sharephe-PhenoName').text(workbook.title);

                    $('#workbook-tab').removeClass('disabled');
                    $('#detail-tab').removeClass('disabled');

                    workbookForm.populate(workbook);

                    $('#workbook-tab').click();
                }
                sharepheModal.progress.hide();
            }, 500);
        },
        error: () => {
        }
    });
};