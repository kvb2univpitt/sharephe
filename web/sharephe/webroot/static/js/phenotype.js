let queryXmls = [];
let detailData = [];

const beautifyQueryXml = (queryXml) => {
    queryXml = queryXml.replace(/\n/g, '');
    queryXml = '<query_definition>' + queryXml + '</query_definition>';
    queryXml = new XmlBeautify().beautify(queryXml, {indent: '    ', useSelfClosingElement: true});

    return queryXml;
};

const workbookForm = {
    clearDDFields: function () {
        // remove all the dropped queries
        let table = document.getElementById("Sharephe-QueryDropArea");
        while (table.rows.length > 0) {
            table.deleteRow(-1);
        }
    },
    clear: function () {
        queryXmls = [];
        detailData = [];

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
                let name = queryXmlUtils.getName(queryXmls[i]);
                this.createNewPSDDField(name);
                this.createNewBtn(i, name, queryXmls[i]);
            }
            let name = queryXmlUtils.getName(queryXmls[lastIndex]);
            this.createNewPSDDField(name);
            this.createNewBtn(lastIndex, name, queryXmls[lastIndex]);
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
    createNewBtn: function (id, name, queryXML) {
        let queryRunBtnElement = document.createElement("button");
        queryRunBtnElement.id = 'detail-query-' + id;
        queryRunBtnElement.className = 'btn btn-secondary btn-sm';
        queryRunBtnElement.type = 'button';
        queryRunBtnElement.innerHTML = '<i class="bi bi-info-circle"></i> View Query';
        queryRunBtnElement.addEventListener("click", function () {
            let query;
            if (queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition').length === 0
                    && queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns4:query_definition').length === 0) {
                query = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns5:query_definition')[0].innerHTML;
            } else if (queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition').length === 0) {
                query = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns4:query_definition')[0].innerHTML;
            } else {
                query = queryXML.getElementsByTagName('request_xml')[0].getElementsByTagName('ns3:query_definition')[0].innerHTML;
            }
            sharepheModal.queryView.show(name, beautifyQueryXml(query));
        }, false);

        let table = document.getElementById("Sharephe-QueryDropArea");
        let rowIndex = table.rows.length - 1;
        let row = table.rows[rowIndex];
        row.cells[1].appendChild(queryRunBtnElement);
    }
};

const extractAndShowQueryDetails = (mainElement) => {
    for (let ithQuery = 0; ithQuery < queryXmls.length; ithQuery++) {
        let queryDetail = queryXmlUtils.extractQueryDetails(queryXmls[ithQuery]);
        detailData.push(queryDetail);

        /**
         * <div id="query-${ithQuery}" class="query"></div>
         */
        let queryElement = document.createElement("div");
        queryElement.id = `query-${ithQuery}`;
        queryElement.className = 'query pb-4';
        mainElement.appendChild(queryElement);

        /**
         * <div id="query-${ithQuery}" class="query">
         *     <div class="query-name bold">Query Name: ${queryDetail.name}</div>
         * </div>
         */
        let queryNameElement = document.createElement('div');
        queryNameElement.className = 'query-name fw-bolder';
        queryNameElement.innerHTML = `Query Name: ${queryDetail.name}`;
        queryElement.appendChild(queryNameElement);

        /**
         * <div id="query-${ithQuery}" class="query">
         *     <div class="query-name bold">Query Name: ${queryDetail.name}</div>
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
             *     <div class="group" id="group-${i}"></div>
             * </div>
             */
            let groupElement = document.createElement('div');
            groupElement.className = 'group';
            groupElement.id = `group-${i}`;
            groupsElement.appendChild(groupElement);

            /**
             * <div id="group-${i}" class="group"></div>
             */
            let invertElement = document.createElement('div');
            invertElement.className = 'invert';
            if (group.invert === 0) {
                /**
                 * <div id="group-${i}" class="group">
                 *     <div class="invert">Include</div>
                 * </div>
                 */
                invertElement.innerHTML = 'Include';
            } else {
                /**
                 * <div id="group-${i}" class="group">
                 *     <div class="invert" style="color: red;">Exclude</div>
                 * </div>
                 */
                invertElement.style = 'color: red;';
                invertElement.innerHTML = 'Exclude';
            }
            groupElement.appendChild(invertElement);

            /**
             * <div id="group-${i}" class="group">
             *     <div class="invert">Include</div>
             *     <div class="occurrence" style="color: green;">Occurs > ${group.occurrence - 1}</div>
             * </div>
             */
            let occurrenceElement = document.createElement('div');
            occurrenceElement.className = 'occurrence';
            occurrenceElement.style = 'color: green;';
            occurrenceElement.innerHTML = `Occurs > ${group.occurrence - 1}`;
            groupElement.appendChild(occurrenceElement);

            /**
             * <div id="group-${i}" class="group">
             *     <div class="occurrence" style="color: green;">Occurs > ${group.occurrence - 1}</div>
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
                 *     <div id="term-${j}" class="term"></div>
                 * </div>
                 */
                let termElement = document.createElement('div');
                termElement.id = `term-${j}`;
                termElement.className = 'term ms-4';
                termsElement.appendChild(termElement);

                /**
                 * <div class="terms indent">
                 *     <div id="term-${j}" class="term">
                 *         <div class="term-label">${createTermLabel(term)}</div>
                 *     </div>
                 * </div>
                 */
                let termLabelElement = document.createElement('div');
                termLabelElement.className = 'term-label fw-bold';
                termLabelElement.innerHTML = createTermLabel(term);
                termElement.appendChild(termLabelElement);

                /**
                 * <div class="terms indent">
                 *     <div id="term-${j}" class="term">
                 *         <div class="term-label">${createTermLabel(term)}</div>
                 *         <div class="concepts indent">
                 *             <img src="assets/images/spin.gif" width="20" height="20" />
                 *         </div>
                 *     </div>
                 * </div>
                 */
                let conceptsElement = document.createElement('div');
                conceptsElement.className = 'concepts ms-4';
                conceptsElement.innerHTML = '<img src="' + spinGifUrl + '" width="20" height="20" />';
                termElement.appendChild(conceptsElement);

                fetchConcepts(term, conceptsElement, termLabelElement, ithQuery, i, j);
            }
        }
    }
};

const showQueryDetails = () => {
    detailData = [];

    let mainElement = document.getElementById("Sharephe-Details");
    mainElement.innerHTML = '';
    extractAndShowQueryDetails(mainElement);
};

const fetchConcepts = (term, conceptsElement, termLabelElement, ithQuery, ithGroup, ithTerm) => {
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'api/term',
        data: {
            hlevel: term.hlevel,
            parent: term.key
        },
        success: (concepts) => {
            let uniuqeConcepts = filterUniqueConcepts(sortConcepts(concepts));
            if (uniuqeConcepts.length > 5) {
                let table = document.createElement('table');
                table.id = `list-${ithQuery}-${ithGroup}-${ithTerm}`;
                table.className = 'table-concepts';
                table.style.display = "none";
                uniuqeConcepts.forEach(function (concept) {
                    let tr = table.insertRow();
                    tr.insertCell().appendChild(document.createTextNode(concept.basecode));

                    let span = document.createElement('span');
                    span.className = 'ms-4';
                    span.appendChild(document.createTextNode(concept.name));
                    tr.insertCell().appendChild(span);
                });
                conceptsElement.removeChild(conceptsElement.firstChild);
                conceptsElement.appendChild(table);

                table = document.createElement('table');
                table.id = `list-secondary-${ithQuery}-${ithGroup}-${ithTerm}`;
                table.className = 'table-concepts';
                for (let i = 0; i < 5; i++) {
                    let concept = uniuqeConcepts[i];

                    let tr = table.insertRow();
                    tr.insertCell().appendChild(document.createTextNode(concept.basecode));

                    let span = document.createElement('span');
                    span.className = 'ms-4';
                    span.appendChild(document.createTextNode(concept.name));
                    tr.insertCell().appendChild(span);
                }
                conceptsElement.appendChild(table);


                let showHideButton = document.createElement('button');
                showHideButton.id = `${ithQuery}-${ithGroup}-${ithTerm}`;
                showHideButton.className = 'btn btn-primary btn-sm ms-4';
                showHideButton.innerHTML = '<i class="bi bi-arrow-down"></i> Show More';
                showHideButton.addEventListener("click", function () {
                    showMoreLess(showHideButton);
                });
                termLabelElement.appendChild(showHideButton);
            } else {
                let table = document.createElement('table');
                table.id = `list-${ithQuery}-${ithGroup}-${ithTerm}`;
                table.className = 'table-concepts';
                uniuqeConcepts.forEach(function (concept) {
                    let tr = table.insertRow();
                    tr.insertCell().appendChild(document.createTextNode(concept.basecode));

                    let span = document.createElement('span');
                    span.className = 'ms-4';
                    span.appendChild(document.createTextNode(concept.name));
                    tr.insertCell().appendChild(span);
                });
                conceptsElement.removeChild(conceptsElement.firstChild);
                conceptsElement.appendChild(table);
            }

            term.concepts = uniuqeConcepts;
        },
        error: () => {
            console.error("You made a mistake");
        }
    });
};

const showMoreLess = (btn) => {
    jQuery('#list-secondary-' + btn.id).slideToggle();
    jQuery('#list-' + btn.id).slideToggle();

    btn.innerHTML = (btn.textContent.includes('Show More')) ? '<i class="bi bi-arrow-up"></i> Show Less' : '<i class="bi bi-arrow-down"></i> Show More';
};

const sortConcepts = function (concepts) {
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

const filterUniqueConcepts = function (concepts) {
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

const createTermLabel = function (term) {
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

const syncFromCloud = (datatable) => {
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

const fetchWorkbook = (phenotypeId) => {
    sharepheModal.progress.show('Fetching phenotype: ' + phenotypeId);
    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'api/workbook/' + phenotypeId,
        success: (workbook) => {
            setTimeout(function () {
                if (workbook) {
                    $('.Sharephe-PhenoName').text(workbook.title);

                    workbookForm.populate(workbook);

                    $('#workbook-tab').removeClass('disabled');
                    if (workbook.queryXML) {
                        $('#detail-tab').removeClass('disabled');
                    } else {
                        $('#detail-tab').addClass('disabled');
                    }
                    $('#workbook-tab').click();
                }
                sharepheModal.progress.hide();
            }, 500);
        },
        error: () => {
        }
    });
};

const handleTabEventListener = (event) => {
    switch (event.target.id) {
        case 'detail-tab':
            showQueryDetails();
            break;
    }
};

const copyDetailsToClipboard = () => {
    let select = document.getElementById("Sharephe-DataFormat");
    let fileType = select.options[select.selectedIndex].value;
    if (fileType === 'csv') {
        navigator.clipboard.writeText(detailDataExport.asTabular(detailData));
    } else {
        navigator.clipboard.writeText(detailDataExport.asJSON(detailData));
    }
};

const detailDataExport = {
    asJSON: function (data) {
        return JSON.stringify(data, null, 4);
    },
    asTabular: function (data) {
        let rowData = [];
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

                        if (concepts.length > 0) {
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
    }
};
