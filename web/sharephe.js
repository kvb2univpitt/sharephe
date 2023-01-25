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

let syncFromCloudAction = (successHandler, errorHandler) => {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'api/workbook/',
        success: successHandler,
        error: errorHandler
    });
};


$(document).ready(function () {
    let datatable = $('#Sharephe-WorkbookTable').DataTable();

    let syncFromCloudHandler = {
        successHandler: (data) => {
            setTimeout(function () {
                datatable.clear();
                data.forEach(function (workbook) {
                    datatable.row.add([
                        workbook.phenotypeId,
                        workbook.type,
                        workbook.title,
                        workbook.authors,
                        workbook.institution,
                        workbook.files
                    ]);
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

});