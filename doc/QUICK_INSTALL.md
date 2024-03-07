# Sharephe Plug-in Quick Installation Guide

A guide for installing the Sharephe plug-in in i2b2 webclient.

## Prerequisites

### i2b2 System Requirements

- i2b2 Webclient 1.7.13 Release.

### Required Permissions

- System administrator privileges is needed to install the Sharephe plugin.

## Installing the Sharephe Plug-in

The following instructions assume that the i2b2 webclient directory is ```/var/www/html/webclient```.

### 1. Stop the Current Running Services

- Stop the web server running the i2b2 webclient.

### 2. Add the Plugin to the i2b2 Webclient

- Click on the link to download [sharephe_plugin.zip](https://pitt-dbmi.s3.amazonaws.com/sharephe/sharephe_plugin.zip).

- Extract ***sharephe_plugin.zip*** file.  Once the file has been unzip, there should be a folder called **Sharephe**.

- Copy the folder **Sharephe**, extracted from the ***sharephe_plugin.zip*** file, into the i2b2 webclient plugin directory ```/var/www/html/webclient/js-i2b2/cells/plugins/community```.

### 3. Configure the i2b2 Webclient

- Add the following code to the array i2b2.hive.tempCellsList in the module loader configuration file ***i2b2_loader.js*** located in the directory ```/var/www/html/webclient/js-i2b2```:

```js
{code: "Sharephe",
    forceLoading: true,
    forceConfigMsg: {params: []},
    roles: [ "DATA_LDS", "DATA_DEID", "DATA_PROT" ],
    forceDir: "cells/plugins/community"
}
```

> Remember to make a backup copy of the file before modifying it.

For an example, the ***i2b2_loader.js*** file should look similar to this:

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
        roles: [ "DATA_LDS", "DATA_DEID", "DATA_PROT" ],
        forceDir: "cells/plugins/community"
    },
    ...
];
```

> Note that the roles are set for the plug-in so that only the regular users can access the plug-in.  Administrative users should not have access to this plug-in since it is not an admin tool.

### 5. Restart the Services

- Restart the web server running the i2b2 webcleint.

For more information on installing the plug-in, please visit [Web Client Plug-in Developers Guide](https://community.i2b2.org/wiki/display/webclient/Web+Client+Plug-in+Developers+Guide).

## Configuring the Sharephe Plug-in

### Setting the REST API URL

Set the value for ***i2b2.Sharephe.rest.url*** in the file **Sharephe_rest_services.js** located in the directory ```/var/www/html/webclient/js-i2b2/cells/plugins/standard/Sharephe``` to the following URL:

###### Development:

```text
https://dev.sharephe.dbmi.pitt.edu/api
```

###### Production:

```text
https://sharephe.dbmi.pitt.edu/api
```

For an example:

```js
i2b2.Sharephe.rest.url = 'https://dev.sharephe.dbmi.pitt.edu/api';
```

> Note that the development URL above is for development purposes only and is not publicly accessible.  Production URL is in progress and will be publicly accessible in the near future.
