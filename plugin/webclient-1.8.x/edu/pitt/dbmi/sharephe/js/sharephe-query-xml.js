if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

/**
 * Query XML functions.
 */
i2b2.sharephe.queryXml = {};

i2b2.sharephe.queryXml.xmlSerializer = new XMLSerializer();
i2b2.sharephe.queryXml.xmlBeautify = new XmlBeautify();

i2b2.sharephe.queryXml.beautify = function (queryXml) {
    queryXml = queryXml.replace(/\n/g, '');
    queryXml = i2b2.sharephe.queryXml.xmlBeautify.beautify(queryXml, {indent: '    ', useSelfClosingElement: true});

    return  hljs.highlight(queryXml, {language: 'xml'}).value;
};
i2b2.sharephe.queryXml.parse = function (strQueryXml) {
    let queryXmlList = [];

    if (strQueryXml) {
        let queryXmlData = strQueryXml.split('>,');
        if (queryXmlData.length > 1) {
            for (let i = 0; i < queryXmlData.length; i++) {
                let qXml = queryXmlData[i];
                if (qXml.endsWith('>')) {
                    queryXmlList.push($.parseXML(qXml));
                } else {
                    queryXmlList.push($.parseXML(qXml + '>'));
                }
            }
        } else {
            queryXmlList.push($.parseXML(strQueryXml));
        }
    }

    return queryXmlList;
};
i2b2.sharephe.queryXml.getName = function (queryXml) {
    return i2b2.sharephe.h.getXNodeVal(queryXml, 'query_name', false);
};
