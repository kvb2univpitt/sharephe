/**
 * @projectDescription	Various helper functions used by the i2b2 framework and cells.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 09-15-08: RC4 launch [Nick Benik] 
 * updated 11-09-15: added .HideBreak() & .getXNodeValNoKids() [Wayne Chan]
 */
if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

/**
 * Utility functions.
 */
i2b2.sharephe.h = {};

i2b2.sharephe.h.parseXml = function (xmlString) {
    var xmlDocRet = false;
    var isActiveXSupported = false;

    try {
        new ActiveXObject("MSXML2.DOMDocument.6.0");
        isActiveXSupported = true;
    } catch (e) {
        isActiveXSupported = false;
    }

    if (isActiveXSupported) {
        //Internet Explorer
        xmlDocRet = new ActiveXObject("Microsoft.XMLDOM");
        xmlDocRet.async = "false";
        xmlDocRet.loadXML(xmlString);
        xmlDocRet.setProperty("SelectionLanguage", "XPath");
    } else {
        //Firefox, Mozilla, Opera, etc.
        parser = new DOMParser();
        xmlDocRet = parser.parseFromString(xmlString, "text/xml");
    }

    return xmlDocRet;
};


i2b2.sharephe.h.XPath = function (xmlDoc, xPath) {
    var retArray = [];
    if (!xmlDoc) {
        console.warn("An invalid XMLDoc was passed to i2b2.h.XPath");
        return retArray;
    }
    try {
        if (window.ActiveXObject || "ActiveXObject" in window) {
            if ((!!navigator.userAgent.match(/Trident.*rv\:11\./)) && (typeof xmlDoc.selectNodes === "undefined")) { // IE11 handling
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.loadXML(new XMLSerializer().serializeToString(xmlDoc));
                xmlDoc = doc;
            }

            // Microsoft's XPath implementation
            // HACK: setProperty attempts execution when placed in IF statements' test condition, forced to use try-catch
            try {
                xmlDoc.setProperty("SelectionLanguage", "XPath");
            } catch (e) {
                try {
                    xmlDoc.ownerDocument.setProperty("SelectionLanguage", "XPath");
                } catch (e) {
                }
            }
            retArray = xmlDoc.selectNodes(xPath);

        } else if (document.implementation && document.implementation.createDocument) {
            // W3C XPath implementation (Internet standard)
            var ownerDoc = xmlDoc.ownerDocument;
            if (!ownerDoc) {
                ownerDoc = xmlDoc;
            }
            var nodes = ownerDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
            var rec = nodes.iterateNext();
            while (rec) {
                retArray.push(rec);
                rec = nodes.iterateNext();
            }
        }
    } catch (e) {
        console.error("An error occurred while trying to perform XPath query.");
        console.dir(e);
    }
    return retArray;
};

i2b2.sharephe.h.getXNodeVal = function (xmlElement, nodeName, includeChildren) {
    var gotten = i2b2.sharephe.h.XPath(xmlElement, "descendant-or-self::" + nodeName + "/text()");
    var final = "";
    if (gotten.length > 0) {
        if (includeChildren === true || includeChildren === true) {
            for (var i = 0; i < gotten.length; i++) {
                final += gotten[i].nodeValue;
            }
        } else {
            for (var i = 0; i < gotten.length; i++) {
                final += gotten[i].nodeValue;
            }
        }
    } else {
        final = undefined;
    }
    return final;
};

i2b2.sharephe.h.Escape = function (inStrValue) {
    if (typeof inStrValue === "number") {
        var t = inStrValue.toString();
    } else {
        var t = new String(inStrValue);
    }
    t = t.replace(/&/g, "&amp;");
    t = t.replace(/</g, "&lt;");
    t = t.replace(/>/g, "&gt;");
    return t;
};