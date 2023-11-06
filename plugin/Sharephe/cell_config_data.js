{
    files: [
        "Sharephe_ctrlr.js",
        "Sharephe_modals.js",
        "Sharephe_rest_services.js",
        "Sharephe_event_handling.js",
        "Sharephe_workbook.js",
        "Sharephe_settings.js",
        "Sharephe_queryDetail.js",
        "datatables.min.js"
    ],
    css: [
        "Sharephe.css",
        "Sharephe_bootstrap.css",
        "bootstrap-icons.css",
        "datatables.min.css"
    ],
    config: {
        short_name: "Sharephe",
        name: "Sharephe",
        description: "This plugin enables users to create computable phenotypes using i2b2 ontologies, link supporting metadata, export to and import from the cloud-based",
        icons: {size32x32: "Sharephe_icon_32x32.png"},
        category: ["celless", "plugin", "standard"],
        plugin: {
            isolateHtml: false, // do not use iframe
            isolateComm: true, // plugin provides its own ajax communication
            standardTabs: true, // use standard tabs at top
            html: {
                source: 'injected_screens.html',
                mainDivId: 'Sharephe-mainDiv'
            }
        }
    }
}