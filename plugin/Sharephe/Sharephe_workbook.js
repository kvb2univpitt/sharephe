i2b2.Sharephe.workbook = {};

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