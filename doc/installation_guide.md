# ![sharephe log](img/Sharephe_icon_32x32.png) Sharephe Plug-in Installation Guide

A guide for installing the Sharephe plug-in for the i2b2  Web Client.

### Table of Contents

- [Installing the Plug-in](#installing-the-plug-in)
  * [Prerequisites](#prerequisites)
  * [Copying the Plug-in to the i2b2 Web Client](#copying-the-plug-in-to-the-i2b2-web-client)
  * [Registering the Plug-in with the i2b2 Webclient](#registering-the-plug-in-with-the-i2b2-webclient)
  * [Configuring the Plug-in](#configuring-the-plug-in)
    + [Setting the REST API URL](#setting-the-rest-api-url)

## Installing the Plug-in

### Prerequisites

- i2b2 Web Client version 1.7.12a or 1.7.13

Asume that the i2b2 Web Client is located in the following directory on the server:

```text
/var/www/html/webclient
```

### Copying the Plug-in to the i2b2 Web Client

Copy the folder named ***Sharephe***, located in the project folder ```sharephe/plugin```, to the i2b2 webclient directory ```/var/www/html/webclient/js-i2b2/cells/plugins/standard```.

For an example, the Sharephe plug-in directory should be:

```text
/var/www/html/webclient/js-i2b2/cells/plugins/standard/Sharephe
```

### Registering the Plug-in with the i2b2 Webclient

To register the plug-in with the i2b2 webclient, add the following Sharephe plug-in configuration to the array ***i2b2.hive.tempCellsList*** in the module loader configuration file **i2b2_loader.js** located in the i2b2 webclient directory ```/var/www/html/webclient/js-i2b2```:

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

### Configuring the Plug-in

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
