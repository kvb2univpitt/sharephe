# Sharephe Plug-in Quick Installation Guide

A guide for installing the Sharephe plug-in in i2b2 webclient 1.8.x.

### Prerequisites

- i2b2 Webclient 1.8.x Release.

## Installing the Sharephe Plug-in

The following instructions assume that the i2b2 webclient directory is ```/var/www/html/webclient```.

### 1. Add the Plugin to the i2b2 Webclient

- Click on the link to download [sharephe_plugin_1.8.x.zip](https://pitt-dbmi.s3.amazonaws.com/sharephe/sharephe_plugin_1.8.x.zip).

- Extract file ***sharephe_plugin_1.8.x.zip*** to the following i2b2 webclient plugin directory:

    ```
    /var/www/html/webclient/plugins/edu/pitt/dbmi
    ```

    Note that the path **edu/pitt/dbmi** may not exist in the directory path **/var/www/html/webclient/plugins**.  You can create it by execute the command ```mkdir -p edu/pitt/dbmi``` in the directory **/var/www/html/webclient/plugins**.

- Add the following content to the file ***plugins.json*** located in the directory ```/var/www/html/webclient/plugins```:

    ```
    "edu.pitt.dbmi.sharephe"
    ```

### 1. Configure the Plugin

- Change the default REST API URL to the following production URL by modifying the value for the variable **i2b2.sharephe.rest.url** in the file ***sharephe-rest.js*** located in the directory ```/var/www/html/webclient/plugins/edu/pitt/dbmi/sharephe/js```

    ```
    https://sharephe.dbmi.pitt.edu/api
    ```

    For an example;

    ```
    i2b2.sharephe.rest.url = 'https://sharephe.dbmi.pitt.edu/api';
    ```
