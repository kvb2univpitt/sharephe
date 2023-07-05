i2b2.Sharephe.queryDetail = {
    details: []
};
i2b2.Sharephe.queryDetail.extract = function (queryXml) {
    let queryDetail = {};

    queryDetail.name = queryXml.getElementsByTagName('name')[0].innerHTML.trim();
    queryDetail.groups = [];

    let panels = queryXml.getElementsByTagName('panel');
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
            term.hlevel = i2b2.h.getXNodeVal(item, "hlevel").trim();
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
                term.constraints.push(constraint);
                if (dateFrom) {
                    constraint.from = dateFrom.trim();
                }
                if (dateTo) {
                    constraint.to = dateTo.trim();
                }
            }
        }
    }

    return queryDetail;
};
i2b2.Sharephe.queryDetail.createTermLabel = function (term) {
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

                label += ` <span class="indent" style="color: blue;">value: ${operator} ${constraint.value} ${constraint.unit}</span>`;
            } else {
                label += ` <span class="indent" style="color: blue;">value: ${constraint.value}</span>`;
            }
        } else if (constraint.by === 'date') {
            if (constraint.from) {
                let dateFrom = (new Date(constraint.from)).toLocaleDateString();

                if (constraint.to) {
                    let dateTo = (new Date(constraint.to)).toLocaleDateString();

                    label += ` <span class="indent" style="color: blue;">date: ${dateFrom} - ${dateTo}</span>`;
                } else {
                    label += ` <span class="indent" style="color: blue;">date: ${dateFrom}</span>`;
                }
            }
        }
    }

    return label;
};
i2b2.Sharephe.queryDetail.extractConcepts = function (results) {
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
i2b2.Sharephe.queryDetail.filterUniqueConcepts = function (concepts) {
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
i2b2.Sharephe.queryDetail.showMoreLess = function (btn) {
    jQuery('#list-secondary-' + btn.id).slideToggle();
    jQuery('#list-' + btn.id).slideToggle();

    btn.innerHTML = btn.textContent.includes('Show More')
            ? '<i class="bi bi-arrow-up"></i> Show Less'
            : '<i class="bi bi-arrow-down"></i> Show More';
};
i2b2.Sharephe.queryDetail.sortConcepts = function (concepts) {
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
i2b2.Sharephe.queryDetail.fetchConcepts = function (term, conceptsElement, termLabelElement, ithQuery, ithGroup, ithTerm) {
    const successHandler = function (concepts) {
        let uniuqeConcepts = i2b2.Sharephe.queryDetail.filterUniqueConcepts(i2b2.Sharephe.queryDetail.sortConcepts(concepts));
        if (uniuqeConcepts.length > 5) {
            let table = document.createElement('table');
            table.id = `list-${ithQuery}-${ithGroup}-${ithTerm}`;
            table.className = 'table-concepts';
            table.style.display = "none";
            uniuqeConcepts.forEach(function (concept) {
                let tr = table.insertRow();
                tr.insertCell().appendChild(document.createTextNode(concept.basecode));

                let span = document.createElement('span');
                span.className = 'shp-ml-4';
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
                span.className = 'shp-ml-4';
                span.appendChild(document.createTextNode(concept.name));
                tr.insertCell().appendChild(span);
            }
            conceptsElement.appendChild(table);


            let showHideButton = document.createElement('button');
            showHideButton.id = `${ithQuery}-${ithGroup}-${ithTerm}`;
            showHideButton.className = 'shp-btn shp-btn-primary shp-btn-sm shp-float-right';
            showHideButton.innerHTML = '<i class="bi bi-arrow-down"></i> Show More';
            showHideButton.addEventListener("click", function () {
                i2b2.Sharephe.queryDetail.showMoreLess(showHideButton);
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
                span.className = 'shp-ml-4';
                span.appendChild(document.createTextNode(concept.name));
                tr.insertCell().appendChild(span);
            });
            conceptsElement.removeChild(conceptsElement.firstChild);
            conceptsElement.appendChild(table);
        }

        term.concepts = uniuqeConcepts;
    };
    const errorHandler = function () {
        console.error("Fetching concepts failed!");
    };

    i2b2.Sharephe.rest.queryDetail.fetchConcepts(term, successHandler, errorHandler);
};
i2b2.Sharephe.queryDetail.show = function () {
    let mainElement = document.getElementById('Sharephe-Details');
    mainElement.innerHTML = '';

    i2b2.Sharephe.queryDetail.details = [];
    for (let ithQuery = 0; ithQuery < i2b2.Sharephe.workbook.queryXmls.length; ithQuery++) {
        // skip query that has been deleted
        if (!i2b2.Sharephe.workbook.queryXmls[ithQuery]) {
            continue;
        }

        let queryDetail = i2b2.Sharephe.queryDetail.extract(i2b2.Sharephe.workbook.queryXmls[ithQuery]);
        i2b2.Sharephe.queryDetail.details.push(queryDetail);

        /**
         * <div id="query-${ithQuery}" class="query"></div>
         */
        let queryElement = document.createElement("div");
        queryElement.id = `query-${ithQuery}`;
        queryElement.className = 'query shp-pb-4';
        mainElement.appendChild(queryElement);

        /**
         * <div id="query-${ithQuery}" class="query">
         *     <div class="query-name bold">Query Name: ${queryDetail.name}</div>
         * </div>
         */
        let queryNameElement = document.createElement('div');
        queryNameElement.className = 'query-name shp-fw-bolder';
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
                termElement.className = 'term shp-ml-4';
                termsElement.appendChild(termElement);

                /**
                 * <div class="terms indent">
                 *     <div id="term-${j}" class="term">
                 *         <div class="term-label">${createTermLabel(term)}</div>
                 *     </div>
                 * </div>
                 */
                let termLabelElement = document.createElement('div');
                termLabelElement.className = 'term-label shp-font-weight-bold';
                termLabelElement.innerHTML = i2b2.Sharephe.queryDetail.createTermLabel(term);
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
                conceptsElement.className = 'concepts shp-ml-4';
                conceptsElement.innerHTML = '<div class="shp-spinner-border shp-spinner-border-sm shp-text-primary" role="status"><span class="shp-sr-only">Loading...</span></div>';
                termElement.appendChild(conceptsElement);

                i2b2.Sharephe.queryDetail.fetchConcepts(term, conceptsElement, termLabelElement, ithQuery, i, j);
            }
        }
    }
};
i2b2.Sharephe.queryDetail.exportAsCSV = function (data) {
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
};
i2b2.Sharephe.queryDetail.exportAsJSON = function (data) {
    return JSON.stringify(data, null, 4);
};
i2b2.Sharephe.queryDetail.copyToClipboard = function () {
    let select = document.getElementById('Sharephe-DataFormat');
    let fileType = select.options[select.selectedIndex].value;
    if (fileType === 'csv') {
        navigator.clipboard.writeText(i2b2.Sharephe.queryDetail.exportAsCSV(i2b2.Sharephe.queryDetail.details));
    } else {
        navigator.clipboard.writeText(i2b2.Sharephe.queryDetail.exportAsJSON(i2b2.Sharephe.queryDetail.details));
    }
};
i2b2.Sharephe.queryDetail.exportToFile = function () {
    let select = document.getElementById('Sharephe-DataFormat');
    let fileType = select.options[select.selectedIndex].value;
    if (fileType === 'csv') {
        const strData = i2b2.Sharephe.queryDetail.exportAsCSV(i2b2.Sharephe.queryDetail.details);
        let blob = new Blob([strData], {type: 'text/csv;charset=utf-8;'});

        const downloadLink = document.createElement("a");
        downloadLink.download = 'sharephe_export.csv';
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
    } else {
        const downloadLink = document.createElement('a');
        downloadLink.download = 'sharephe_export.json';
        downloadLink.href = 'data:application/json,' + i2b2.Sharephe.queryDetail.exportAsJSON(i2b2.Sharephe.queryDetail.details);
        downloadLink.click();
    }
};