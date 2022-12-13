// create the communicator Object
i2b2.SHAREPHE.ajax = i2b2.hive.communicatorFactory("SHAREPHE");
i2b2.SHAREPHE.cfg.parsers = {};
i2b2.SHAREPHE.cfg.parsers.ExtractWorkbookResults = function () {
    this.model = [];

    if (this.error) {
        console.error("[ExtractProducts] Could not parse() data!");
    } else {
        var sharepheWorkbooks = this.refXML.getElementsByTagName('sharephe_workbook');
        for (var i = 0; i < sharepheWorkbooks.length; i++) {
            var sharepheWorkbook = sharepheWorkbooks[i];

            var obj = new Object;
            obj.workbook = {};
            obj.files = [];
            obj.fileURL = i2b2.h.getXNodeVal(sharepheWorkbook, 'file_URL');

            var workbook = sharepheWorkbook.getElementsByTagName('workbook')[0];
            obj.workbook.phenotypeId = i2b2.h.getXNodeVal(workbook, 'phenotype_id');
            obj.workbook.institution = i2b2.h.getXNodeVal(workbook, 'institution');
            obj.workbook.s3_address = i2b2.h.getXNodeVal(workbook, 's3_address');
            obj.workbook.title = i2b2.h.getXNodeVal(workbook, 'title');
            obj.workbook.type = i2b2.h.getXNodeVal(workbook, 'type');
            obj.workbook.authors = [];
            obj.workbook.queryXML = i2b2.h.getXNodeVal(workbook, 'query_XML');

            var authors = i2b2.h.XPath(workbook, "descendant-or-self::author/node()");
            for (var j = 0; j < authors.length; j++) {
                obj.workbook.authors.push(authors[j].nodeValue);
            }

            // get files
            var files = i2b2.h.XPath(sharepheWorkbook, "descendant-or-self::file/node()");
            for (var j = 0; j < files.length; j++) {
                obj.files.push(files[j].nodeValue);
            }

            this.model.push(obj);
        }
    }

    return this.model;
};

i2b2.SHAREPHE.cfg.msgs = {};
i2b2.SHAREPHE.cfg.msgs.GetSharepheWorkbooks = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<ns3:request xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/"\n' +
        '             xmlns:ns4="http://www.i2b2.org/xsd/cell/sharephe/1.1/">\n' +
        '    <message_header>\n' +
        '        {{{proxy_info}}}' +
        '        <sending_application>\n' +
        '            <application_name>i2b2 Sharephe</application_name>\n' +
        '            <application_version>{{{version}}}</application_version>\n' +
        '        </sending_application>\n' +
        '        <sending_facility>\n' +
        '            <facility_name>i2b2 Hive</facility_name>\n' +
        '        </sending_facility>\n' +
        '        <security>\n' +
        '            <domain>{{{sec_domain}}}</domain>\n' +
        '            <username>{{{sec_user}}}</username>\n' +
        '            {{{sec_pass_node}}}\n' +
        '        </security>\n' +
        '        <project_id>{{{sec_project}}}</project_id>\n' +
        '    </message_header>\n' +
        '    <request_header>\n' +
        '        <result_waittime_ms>{{{result_wait_time}}}000</result_waittime_ms>\n' +
        '    </request_header>\n' +
        '    <message_body>\n' +
        '        <ns4:getWorkbooks></ns4:getWorkbooks>\n' +
        '    </message_body>\n' +
        '</ns3:request>\n';
i2b2.SHAREPHE.ajax._addFunctionCall("GetSharepheWorkbooks", "{{{URL}}}getWorkbooks", i2b2.SHAREPHE.cfg.msgs.GetSharepheWorkbooks, null, i2b2.SHAREPHE.cfg.parsers.ExtractWorkbookResults);
