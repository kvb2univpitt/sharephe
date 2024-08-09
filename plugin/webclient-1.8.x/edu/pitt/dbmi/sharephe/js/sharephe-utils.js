if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

/**
 * Utility functions.
 */
i2b2.sharephe.utils = {};

/**
 * Copy-&-Paste Utilities.
 */
i2b2.sharephe.utils.clipboard = {};

i2b2.sharephe.utils.clipboard.copyQueryXml = function (queryXml) {
    navigator.clipboard.writeText(queryXml.trim());
};
i2b2.sharephe.utils.clipboard.copyConceptDetails = function (detailData) {
    let select = document.getElementById('sharephe-data-format');
    let fileType = select.options[select.selectedIndex].value;
    if (fileType === 'csv') {
        navigator.clipboard.writeText(i2b2.sharephe.utils.export.conceptDetails.exportToFileAsCsv(detailData));
    } else {
        navigator.clipboard.writeText(i2b2.sharephe.utils.export.conceptDetails.exportToFileAsJson(detailData));
    }
};


i2b2.sharephe.utils.export = {};
i2b2.sharephe.utils.export.conceptDetails = {};
i2b2.sharephe.utils.export.conceptDetails.exportToFile = function (detailData) {
    const select = document.getElementById('sharephe-data-format');
    const fileType = select.options[select.selectedIndex].value;
    if (fileType === 'csv') {
        const strData = i2b2.sharephe.utils.export.conceptDetails.exportToFileAsCsv(detailData);
        let blob = new Blob([strData], {type: 'text/csv;charset=utf-8;'});

        const downloadLink = document.createElement("a");
        downloadLink.download = 'sharephe_export.csv';
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
    } else {
        const downloadLink = document.createElement('a');
        downloadLink.download = 'sharephe_export.json';
        downloadLink.href = 'data:application/json,' + i2b2.sharephe.utils.export.conceptDetails.exportToFileAsJson(detailData);
        downloadLink.click();
    }
};
i2b2.sharephe.utils.export.conceptDetails.exportToFileAsJson = function (data) {
    return JSON.stringify(data, null, 4);
};
i2b2.sharephe.utils.export.conceptDetails.exportToFileAsCsv = function (data) {
    const rowData = [];
    rowData.push('Query Name,Invert,Occurrence,Term Name,Concept Name,Concept Basecode,Key');
    for (let i = 0; i < data.length; i++) {
        let detail = data[i];
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
                    if (concepts && concepts.length > 0) {
                        for (let l = 0; l < concepts.length; l++) {
                            let concept = concepts[l];
                            let conceptName = concept.name;
                            let conceptBasecode = concept.basecode;
                            let conceptKey = concept.key;

                            rowData.push(`"${name}",${invert},${occurrence},"${termName}","${conceptName}","${conceptBasecode}","${conceptKey}"`);
                        }
                    } else {
                        rowData.push(`"${name}",${invert},${occurrence},"${termName}",,,`);
                    }
                }
            } else {
                rowData.push(`"${name}",${invert},${occurrence},,,,`);
            }
        }
    }

    return rowData.join('\r\n');
};
