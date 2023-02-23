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