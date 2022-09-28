# ![sharephe log](img/Sharephe_icon_32x32.png) Sharephe Plug-in

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-blue.svg)](https://opensource.org/licenses/MPL-2.0)
[![v1.0.0](https://img.shields.io/badge/version-v0.2.0-green)](https://github.com/kvb2univpitt/sharephe/releases/tag/v0.1.0)

An i2b2 webclient plug-in that improves sharing and translating computable phenotypes for clinical and translational research.

## What can Sharephe Plug-in do?

- provide user friendly data creation and query tool
- structure clinical data into standard query format
- use standardized terminologies and facilitate reuse of value sets
- shareable, executable and reusable for cross-sites research
- support translation among variety of data model(in progress)
- both human readable and computer readable version of phenotypes

## Installation

### Installing Sharephe REST API

#### Prerequisites

###### Development Tools

- [OpenJDK 17](https://docs.microsoft.com/en-us/java/openjdk/download)
- [Apache Maven 3.x.x](https://maven.apache.org/download.cgi)

###### AWS Accounts

- Amazon S3.
- Amazon DynamoDB.

###### Servers

- Wildfly 17.0.1
- i2b2 Core Server 1.7.13 Release 

#### Setting AWS Credentials

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

#### Building the WAR File

1. Download and extract the latest code [https://github.com/kvb2univpitt/sharephe/releases](https://github.com/kvb2univpitt/sharephe/releases).
2. Go to the project directory **sharephe/sharephe-api** and open up a terminal.
3. Execute the following command to compile and build the WAR file:
    ```
    mvn clean package
    ```

The WAR file ***sharephe.war*** is located in the directory **sharephe/sharephe-api/target**.

#### Deploying the WAR File

1. Stop Wildfly service.
2. Copy the WAR file ***sharephe.war*** to the Wildfly's **deployments** directory.
3. Start Wildfly

To test if the deployment is successful, open up a terminal and execute the following command:

```
curl -Is http://localhost:9090/sharephe/api/workbook
```

You should see an output similar to the output below:

```
HTTP/1.1 200 OK
Connection: keep-alive
Transfer-Encoding: chunked
Content-Type: application/json
Date: Tue, 27 Sep 2022 22:25:31 GMT
```

> The above command assumes the domain of your Wildfly server is localhost and is running on port 9090.

#### Proxying Sharephe Request

The REST endpoint for Sharephe is **http://localhost:9090/sharephe/api**.  By default, the Sharephe plug-in assumes the REST endpoint is **http://&lt;webclient-domain&gt;/sharephe/api**, where **&lt;webclient-domain&gt;** is the domain name where the webclient is hosted.

To proxy all Sharephe REST request to localhost:9090, create a file called ***sharephe.conf*** in the directory **/etc/httpd/conf.d/** with the following content:

```
ProxyPass /sharephe/api http://localhost:9090/sharephe/api
ProxyPassReverse /sharephe/api http://localhost:9090/sharephe/api
ProxyTimeout 3000
```

### Installing Sharephe Plug-in

#### Prerequisites

- i2b2 Web Client Release 1.7.13

#### Installing the Plug-in

##### Copying the Plug-in

1. Download and extract the latest code [https://github.com/kvb2univpitt/sharephe/releases](https://github.com/kvb2univpitt/sharephe/releases).

2. Copy the folder ***Sharephe*** from the project directory **sharephe-api** to the webclient plug-in folder **webclient/js-i2b2/cells/plugin/standard**

##### Registering the Plug-in

Registering the plug-in with the web client framework by adding an entry to the module loader configuration file **i2b2_loader.js** located in the folder ***webclient/js-i2b2***.  Add the following code to the **i2b2.hive.tempCellsList**:

```js
{code: "Sharephe",
    forceLoading: true,
    forceConfigMsg: {params: []},
    forceDir: "cells/plugins/standard"
}
```

The **i2b2_loader.js**  should look similar to this:

```js
i2b2.hive.tempCellsList = [
    {code: "PM",
        forceLoading: true 			// <----- this must be set to true for the PM cell!
    },
    {code: "ONT"},
    {code: "CRC"},
    {code: "WORK"},
    ...
    {code: "Sharephe",
        forceLoading: true,
        forceConfigMsg: {params: []},
        forceDir: "cells/plugins/standard"
    }
];
```

For more information on installing the plug-in, please visit [Web Client Plug-in Developers Guide](https://community.i2b2.org/wiki/display/webclient/Web+Client+Plug-in+Developers+Guide).