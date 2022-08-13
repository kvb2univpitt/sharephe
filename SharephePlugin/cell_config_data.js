{
    files: ["SharephePlugin_ctrlr.js", "datatables.min.js"],
    css: ["SharephePlugin.css", "bootstrap-icons.css", "datatables.min.css"],
    config: {
        short_name: "SharephePlugin",
        name: "SharephePlugin",
        description: "This plugin enables users to create computable phenotypes using i2b2 ontologies, link supporting metadata, export to and import from the cloud-based",
        icons: {size32x32: "Sharephe_icon_32x32.png"},
        category: ["celless", "plugin", "standard"],
        plugin: {
            isolateHtml: false, // do not use iframe
            isolateComm: true, // plugin provides its own ajax communication
            standardTabs: true, // use standard tabs at top
            html: {
                source: 'injected_screens.html',
                mainDivId: 'SharephePlugin-mainDiv'
            }
        }
    }
}