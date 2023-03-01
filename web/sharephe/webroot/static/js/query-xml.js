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
    },
    extractQueryDetails: function (queryXml) {
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
                    constraint.from = dateFrom.trim();
                    constraint.to = dateTo.trim();
                    term.constraints.push(constraint);
                }
            }
        }

        return queryDetail;
    }
};