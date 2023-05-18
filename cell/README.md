# i2b2-sharephe

An i2b2 cell providing the following functionalities:

- Creating and modifying Sharephe workbook (computable phenotypes).
- File upload (attachements).

## Building the Cell

Below are instructions on how to compile the source code to build the cell.

### Prerequisites

#### Development Tools

- OpenJDK 8 or [Oracle JDK 8](https://www.oracle.com/java/technologies/downloads/#java8)
- [Apache Maven 3.x.x](https://maven.apache.org/download.cgi)

#### Third-party Libraries

- [i2b2-server-common](https://github.com/kvb2univpitt/i2b2-server-common)

### Compiling the Code

1. Install the 3rd-party dependency [i2b2-server-common](https://github.com/kvb2univpitt/i2b2-server-common).

2. Open up a terminal in the project directory ```sharephe/cell/i2b2-sharephe``` and execute the following command:

    ```
    mvn clean package
    ```

The code is compiled into the following files in the project directory ```sharephe/cell/i2b2-sharephe/target```:

- Sharephe.jar
- Sharephe.aar

## Installing the Cell

### Prerequisites

#### AWS Accounts

- Amazon S3.
- Amazon DynamoDB.

#### Servers

- Wildfly 17.0.1
- i2b2 Core Server 1.7.13 Release 

### Setting AWS Credentials

AWS credentials are required to access Amazon S3 and Amazon DynamoDB . The AWS credentials are stored in a local file named ***credentials***, in a folder named **.aws** in your user home directory. This is a common practice for storing AWS credentials. See [configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) for more detail.

The ***credentials*** file:

```text
[default]
aws_access_key_id=
aws_secret_access_key=
```

#### Example

Assume the following:

| Attribute             | Value                                    |
|-----------------------|------------------------------------------|
| User Home Directory   | /home/ckent                            |
| AWS Access Key ID     | AKIAIOSFODNN7EXAMPLE                     |
| AWS Secret Access Key | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |

The ***/home/ckent/.aws/credentials*** file should look like this:
```text
[default]
aws_access_key_id=AKIAIOSFODNN7EXAMPLE
aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Installing into the i2b2 Hive

#### Copying the Files into the i2b2 War File

1. Stop Wildfly.
2. Copy the JAR file **Sharephe.jar** from the directory ```sharephe/cell/i2b2-sharephe/target``` to the folder ```WEB-INF/lib``` inside the WAR file **i2b2.war**.
3. Copy the AAR file **Sharephe.aar** from the directory ```sharephe/cell/i2b2-sharephe/target``` to the folder ```WEB-INF/services``` inside the i2b2 WAR file **i2b2.war**.
4. Copy the AWS SKD libraries from the directory ```sharephe/cell/lib``` to the folder ```WEB-INF/lib``` inside the WAR file **i2b2.war**.
5. Restart Wildfly.

#### Adding to the Cell

The i2b2 webclient needs to know about the OntologyStore cell.  Assume the i2b2 hive is deployed on a Wildfly server with the domain name ***localhost*** on port ***9090***, the following cell information will be added in the i2b2 Administration Module:

| Field        | Description                                                           | Value                                                |
|--------------|-----------------------------------------------------------------------|------------------------------------------------------|
| Cell ID      | A unique identifier for the cell.                                     | SHAREPHE                                             |
| Cell Name    | The name of the cell.                                                 | Sharephe Cell                                        |
| Cell URL     | The url contains the IP or domain name for where the cell is located. | http://localhost:9090/i2b2/services/SharepheService/ |
| Project Path |                                                                       | /                                                    |
| Method       | The method of communication.                                          | REST                                                 |

1. Log into the i2b2 Administration Module.
2. In the Navigation panel, click on ***Manage Cells***.
    ![Manged Cell](img/managed_cell.png)
3. In the Manage Cells page click on Add New Cell.
    ![Add Cell](img/add_cell.png)
4. Enter the above cell information and click on the "Save" button:
    ![Save Cell](img/save_cell.png)
    > Note that the URL must end with a foward slash (**/**).
5. The cell will be added to the list of cells on the Manage Cells page.  In the Navigation panel click on Manage Cells to refresh the hierarchical tree and display the new cell:
    ![Refresh Cell List](img/refresh_managed_cell.png)

### Installing the Cell in the i2b2 Webclient

#### Installing the Javascript API

The communication between the webclient and the i2b2 cells is through the Javascript API.

The folder **SHAREPHE**, located in the project directory ```sharephe/cell/```, contains the Javascript API.  Copy the folder **SHAREPHE** to the webclient directory ```webclient/js-i2b2/cells/```.

#### Registering the Cell

To register the cell with the i2b2 webclient, add the following code to the array ***i2b2.hive.tempCellsList*** in the module loader configuration file **i2b2_loader.js** located in the i2b2 webclient directory ```webclient/js-i2b2```:

```js
{code: "SHAREPHE"}
```

For an example, the **i2b2_loader.js** file should look similar to this:

```js
i2b2.hive.tempCellsList = [
    {code: "PM",
        forceLoading: true 			// <----- this must be set to true for the PM cell!
    },
    {code: "ONT"},
    {code: "CRC"},
    {code: "WORK"},
    {code: "SHAREPHE"},
    ...
];
```

## Making SOAP Calls to the Cell

### Example Setup

Assume the i2b2 hive containing the OntologyStore cell is deployed on a Wildfly server with the following configurations:

| Domain    | Port |
|-----------|------|
| localhost | 9090 |

Assume the i2b2 database contains the following user credentials:

| Username | Password | Role | Domain   | Project ID |
|----------|----------|------|----------|------------|
| demo     | demouser | user | i2b2demo | Demo       |

### SOAP Request Template

Below is the basic template for making a SOAP call to the OntologyStore cell:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ns3:request xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/"
             xmlns:ns4="http://www.i2b2.org/xsd/cell/sharephe/1.1/">
    <message_header>
        <proxy>
            <redirect_url>*** SOAP endpoint goes here ***</redirect_url>
        </proxy>
        <sending_application>
            <application_name>i2b2 Sharephe Service</application_name>
            <application_version>1.7</application_version>
        </sending_application>
        <sending_facility>
            <facility_name>i2b2 Hive</facility_name>
        </sending_facility>
        <security>
            *** User credentials go here. ***
        </security>
        <project_id>*** Project ID goes here ***</project_id>
    </message_header>
    <request_header>
        <result_waittime_ms>180000</result_waittime_ms>
    </request_header>
    <message_body>
        *** Request payload goes here. ***
    </message_body>
</ns3:request>
```

The SOAP endpoint is enclosed in the ```<redirect_url></redirect_url>``` tags.  The user credentials is enclosed in the ```<security></security>``` tags.  The project ID is enclosed in the ```<project_id></project_id>```.  The request payload is enclosed in the ```<message_body></message_body>``` tags.

### Getting a List of Workbooks (Phenotypes)

#### Making the Call Manually

To get a list of ontologies, make the following SOAP call to the endpoint **http://localhost:9090/i2b2/services/OntologyStoreService/getProducts**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ns3:request xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/"
             xmlns:ns4="http://www.i2b2.org/xsd/cell/sharephe/1.1/">
    <message_header>
        <proxy>
            <redirect_url>http://localhost:9090/i2b2/services/SharepheService/getWorkbooks</redirect_url>
        </proxy>
        <sending_application>
            <application_name>i2b2 Sharephe Service</application_name>
            <application_version>1.7</application_version>
        </sending_application>
        <sending_facility>
            <facility_name>i2b2 Hive</facility_name>
        </sending_facility>
        <security>
            <domain>i2b2demo</domain>
            <username>demo</username>
            <password>demouser</password>
        </security>
        <project_id>Demo</project_id>
    </message_header>
    <request_header>
        <result_waittime_ms>180000</result_waittime_ms>
    </request_header>
    <message_body>
        <ns4:getWorkbooks></ns4:getWorkbooks>
    </message_body>
</ns3:request>
```

Below is an example snippet of the SOAP response:

```xml
<ns3:response xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/"
              xmlns:ns5="http://www.i2b2.org/xsd/cell/sharephe/1.1/"
              xmlns:ns2="http://www.w3.org/2005/05/xmlmime"
              xmlns:ns4="http://www.i2b2.org/xsd/cell/pm/1.1/">
    <message_header>
        <i2b2_version_compatible>1.1</i2b2_version_compatible>
        <hl7_version_compatible>2.4</hl7_version_compatible>
        <sending_application>
            <application_name>Sharephe Cell</application_name>
            <application_version>1.700</application_version>
        </sending_application>
        <sending_facility>
            <facility_name>i2b2 Hive</facility_name>
        </sending_facility>
        <receiving_application>
            <application_name>i2b2 Sharephe Service</application_name>
            <application_version>1.7</application_version>
        </receiving_application>
        <receiving_facility>
            <facility_name>i2b2 Hive</facility_name>
        </receiving_facility>
        <datetime_of_message>2023-01-18T13:59:03.160-05:00</datetime_of_message>
        <security>
            <domain>i2b2demo</domain>
            <username>demo</username>
            <password>demouser</password>
        </security>
        <message_control_id>
            <instance_num>1</instance_num>
        </message_control_id>
        <processing_id>
            <processing_id>P</processing_id>
            <processing_mode>I</processing_mode>
        </processing_id>
        <accept_acknowledgement_type>AL</accept_acknowledgement_type>
        <application_acknowledgement_type>AL</application_acknowledgement_type>
        <country_code>US</country_code>
        <project_id>Demo</project_id>
    </message_header>
    <response_header>
        <result_status>
            <status type="DONE">Sharephe processing completed</status>
        </result_status>
    </response_header>
    <message_body>
        <ns5:sharephe_workbooks>
            <sharephe_workbook>
                <workbook>
                    <phenotype_id>123456789</phenotype_id>
                    <authors>
                        <author>Clark Kent</author>
                    </authors>
                    <institution>Pitt</institution>
                    <s3_address>computable-phenotype:[]</s3_address>
                    <title>My Phenotypes</title>
                    <type>Computable Phenotypes</type>
                </workbook>
                <files/>
                <file_URL>https://sharephe.s3.amazonaws.com/upload/123456789</file_URL>
            </sharephe_workbook>
        </ns5:sharephe_workbooks>
    </message_body>
</ns3:response>
```

#### Making the Call Using the Javascript API (Webclient)

Below is the Javascript code to get a list of ontologies using the i2b2 webclient:

```javascript
// creating a callback
let scopedCallback = new i2b2_scopedCallback();
scopedCallback.callback = function (results) {
    if (results.error) {
        // handle error
    } else {
        // handle successful call
    }
};

// making a SOAP call
i2b2.SHAREPHE.ajax.GetSharepheWorkbooks("Sharephe Plugin", {version: i2b2.ClientVersion}, scopedCallback);
```

### Adding/Updating Workbook

The request for adding a new workbook is the same as the request for updating a workbook.  A new workbook will be created if the phenotype ID does not exist.  Otherwise, the workbook information will be updated based on the existing phenotype ID.

Assume we want to create a workbook with the following information:

| Phenotype ID | Author     | Institution | Title         | Type                  |
|--------------|------------|-------------|---------------|-----------------------|
| 123456789    | Clark Kent | Pitt        | My Phenotypes | Computable Phenotypes |

To create a workbook with the above information, make the following SOAP call to the endpoint **http://localhost:9090/i2b2/services/SharepheService/addWorkbook**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ns3:request xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/"
             xmlns:ns4="http://www.i2b2.org/xsd/cell/sharephe/1.1/">
    <message_header>
        <proxy>
            <redirect_url>http://localhost:9090/i2b2/services/SharepheService/addWorkbook</redirect_url>
        </proxy>
        <sending_application>
            <application_name>i2b2 Sharephe Service</application_name>
            <application_version>1.7</application_version>
        </sending_application>
        <sending_facility>
            <facility_name>i2b2 Hive</facility_name>
        </sending_facility>
        <security>
            <domain>i2b2demo</domain>
            <username>demo</username>
            <password>demouser</password>
        </security>
        <project_id>Demo</project_id>
    </message_header>
    <request_header>
        <result_waittime_ms>180000</result_waittime_ms>
    </request_header>
    <message_body>
        <ns4:workbook_form>
            <phenotype_id>123456789</phenotype_id>
            <authors>
                <author>Clark Kent</author>
            </authors>
            <institution>Pitt</institution>
            <title>My Phenotypes</title>
            <type>Computable Phenotypes</type>
        </ns4:workbook_form>
    </message_body>
</ns3:request>
```


Below is an example of the SOAP response for the above call:

```xml
<ns3:response xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/"
              xmlns:ns5="http://www.i2b2.org/xsd/cell/sharephe/1.1/"
              xmlns:ns2="http://www.w3.org/2005/05/xmlmime"
              xmlns:ns4="http://www.i2b2.org/xsd/cell/pm/1.1/">
    <message_header>
        <i2b2_version_compatible>1.1</i2b2_version_compatible>
        <hl7_version_compatible>2.4</hl7_version_compatible>
        <sending_application>
            <application_name>Sharephe Cell</application_name>
            <application_version>1.700</application_version>
        </sending_application>
        <sending_facility>
            <facility_name>i2b2 Hive</facility_name>
        </sending_facility>
        <receiving_application>
            <application_name>i2b2 Sharephe Service</application_name>
            <application_version>1.7</application_version>
        </receiving_application>
        <receiving_facility>
            <facility_name>i2b2 Hive</facility_name>
        </receiving_facility>
        <datetime_of_message>2023-01-18T16:28:18.224-05:00</datetime_of_message>
        <security>
            <domain>i2b2demo</domain>
            <username>demo</username>
            <password>demouser</password>
        </security>
        <message_control_id>
            <instance_num>1</instance_num>
        </message_control_id>
        <processing_id>
            <processing_id>P</processing_id>
            <processing_mode>I</processing_mode>
        </processing_id>
        <accept_acknowledgement_type>AL</accept_acknowledgement_type>
        <application_acknowledgement_type>AL</application_acknowledgement_type>
        <country_code>US</country_code>
        <project_id>Demo</project_id>
    </message_header>
    <response_header>
        <result_status>
            <status type="DONE">Sharephe processing completed</status>
        </result_status>
    </response_header>
    <message_body>
        <ns5:sharephe_workbook>
            <workbook>
                <phenotype_id>123456789</phenotype_id>
                <authors>
                    <author>Clark Kent</author>
                </authors>
                <institution>Pitt</institution>
                <s3_address>computable-phenotype:[]</s3_address>
                <title>My Phenotypes</title>
                <type>Computable Phenotypes</type>
            </workbook>
            <files/>
            <file_URL>https://sharephe.s3.amazonaws.com/upload/123456789</file_URL>
        </ns5:sharephe_workbook>
    </message_body>
</ns3:response>
```

##### Making the Call Using Javascript API (Webclient)

```javascript
// creating the payload
var payload = '<product_action>\n' +
'    <title>ACT Visit Details Ontology</title>\n' +
'    <key>act_visit_details_v4.json</key>\n' +
'    <include_network_package>false</include_network_package>\n' +
'    <download>true</download>\n' +
'    <install>true</install>\n' +
'    <disable_enable>true</disable_enable>\n' +
'</product_action>';

// creating the SOAP options
let options = {
    version: i2b2.ClientVersion,
    phenotype_id: '123456789',
    authors: '<authors><author>Clark Kent</author></authors>',
    title: 'My Phenotypes',
    type: 'Computable Phenotypes',
    institution: 'Pitt'
};

// creating a callback
var scopedCallback = new i2b2_scopedCallback();
scopedCallback.callback = function (results) {
    if (results.error) {
        // handle error
    } else {
        // handle successful call
    }
};

// making a SOAP call
i2b2.SHAREPHE.ajax.PerformAddWorkbook("Sharephe Plugin", options, scopedCallback);
```
