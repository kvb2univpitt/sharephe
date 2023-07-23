# ![sharephe log](img/Sharephe_icon_32x32.png) Sharephe Plug-in

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-blue.svg)](https://opensource.org/licenses/MPL-2.0)
[![v1.0.0](https://img.shields.io/badge/version-v0.4.0-green)](https://github.com/kvb2univpitt/sharephe/releases/tag/v0.1.0)

An i2b2 webclient plug-in that improves sharing and translating computable phenotypes for clinical and translational research.

## What can Sharephe Plug-in do?

- provide user friendly data creation and query tool
- structure clinical data into standard query format
- use standardized terminologies and facilitate reuse of value sets
- shareable, executable and reusable for cross-sites research
- support translation among variety of data model(in progress)
- both human readable and computer readable version of phenotypes

## Installing the Plugin

Assume that the i2b2 webclient is located in the following directory on the server:

```text
/var/www/html/webclient
```

### Copying the Plugin to the i2b2 Web Client

Copy the folder named ***Sharephe***, located in the project folder ```sharephe/plugin```, to the i2b2 webclient directory ```/var/www/html/webclient/js-i2b2/cells/plugins/standard```.

For an example, the Sharephe plugin directory should be:

```text
/var/www/html/webclient/js-i2b2/cells/plugins/standard/Sharephe
```

### Registering the Plugin with the i2b2 Webclient

To register the plug-in with the i2b2 webclient, add the following Sharephe plugin configuration to the array ***i2b2.hive.tempCellsList*** in the module loader configuration file **i2b2_loader.js** located in the i2b2 webclient directory ```/var/www/html/webclient/js-i2b2```:

```js
{code: "Sharephe",
    forceLoading: true,
    forceConfigMsg: {params: []},
    forceDir: "cells/plugins/standard"
}
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
    {code: "Sharephe",
        forceLoading: true,
        forceConfigMsg: {params: []},
        forceDir: "cells/plugins/standard"
    },
    ...
];
```

For more information on installing the plug-in, please visit [Web Client Plug-in Developers Guide](https://community.i2b2.org/wiki/display/webclient/Web+Client+Plug-in+Developers+Guide).

### Configuring the Plugin

#### Setting the REST API URL

Set the value for ***i2b2.Sharephe.rest.url*** in the file **Sharephe_rest_services.js** located in the directory ```/var/www/html/webclient/js-i2b2/cells/plugins/standard/Sharephe/Sharephe_rest_services.js``` to the following URL:

```text
https://dev.sharephe.dbmi.pitt.edu/api
```

For an example:

```js
i2b2.Sharephe.rest.url = 'https://dev.sharephe.dbmi.pitt.edu/api';
```

> Note that the URL above is for development and is subject to change.

## Using the Plugin

### Loading the Plugin

1. Log on into the i2b2 web client.

    ![Login](img/login_i2b2.png)

2. Click on the ***Analysis Tools*** drop-down.

    ![Select Analysis Tools](img/select_analysis_tool.png)

3. Select the **Sharephe** plugin

    ![Select Sharephe Plugin](img/select_sharephe_plugin.png)

4. You should see a list of phenotypes fetched from the cloud.

    ![Phenotype List](img/workbook_list.png)

### Viewing Phenotype

1. Move the mouse pointer over to a row in the phenotype table and click on it.  The row will be highlighted (light gray) when the mouse pointer is hover over it.

    ![Hover Over Row](img/row_hover.png)

2. You should see the phenotype workbook in the ***Workbook*** tab.

    ![Open phenotype workbook](img/phenotype_workbook_opened.png)

3. Click on the ***Details*** tab to see the concepts for the queries.

    ![Select Workbook Tab](img/view_query_concepts.png)

> Note that the ***Details*** tab is only viewable if there are queries saved in the phenotype workbook.

### Create New Workbook

1. Log on to the i2b2 web client.

2. Click on the ***Analysis Tools*** drop-down.

    ![Select Analysis Tools](img/select_analysis_tool.png)

3. You should see a list of workbooks fetched from the cloud.

    ![Select Workbook Tab](img/workbook_list.png)

4. Select **Workbook** tab.

    ![Select Workbook Tab](img/select_workbook.png)

5. Populate the form and Click on ***Save and Publish** button to create a new workbook.

    ![Select Workbook Tab](img/save_workbook.png)

6. You should see a confirmation message pop-up.

    ![Select Workbook Tab](img/save_success.png)
