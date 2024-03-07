i2b2.Sharephe.modal = {};

i2b2.Sharephe.modal.progress = {};
i2b2.Sharephe.modal.progress.show = function (title) {
    jQuery('#Sharephe-ProgressModalTitle').text(title);
    if (!i2b2.Sharephe.modal.progress.panel) {
        let panel = new YAHOO.widget.Panel('Sharephe-ProgressModal', {
            width: "200px",
            fixedcenter: true,
            close: false,
            draggable: false,
            zindex: 100,
            modal: true,
            visible: false
        });
        panel.render(document.body);
        i2b2.Sharephe.modal.progress.panel = panel;
    }

    i2b2.Sharephe.modal.progress.panel.show();
};
i2b2.Sharephe.modal.progress.hide = function () {
    if (i2b2.Sharephe.modal.progress.panel) {
        i2b2.Sharephe.modal.progress.panel.hide();
    }
};

i2b2.Sharephe.modal.message = {};
i2b2.Sharephe.modal.message.show = function (title, message) {
    jQuery('#Sharephe-MessageModalTitle').text(title);
    jQuery('#Sharephe-MessageModalMessage').text(message);

    if (!i2b2.Sharephe.modal.message.panel) {
        let panel = new YAHOO.widget.Panel('Sharephe-MessageModal', {
            width: "400px",
            fixedcenter: true,
            close: false,
            draggable: true,
            zindex: 100,
            modal: true,
            visible: false
        });
        panel.render(document.body);
        i2b2.Sharephe.modal.message.panel = panel;
    }

    i2b2.Sharephe.modal.message.panel.show();
};
i2b2.Sharephe.modal.message.hide = function () {
    if (i2b2.Sharephe.modal.message.panel) {
        i2b2.Sharephe.modal.message.panel.hide();
    }
};

i2b2.Sharephe.modal.settings = {};
i2b2.Sharephe.modal.settings.show = function () {
    if (!i2b2.Sharephe.modal.settings.panel) {
        let panel = new YAHOO.widget.Panel('Sharephe-SettingsModal', {
            width: "600px",
            fixedcenter: true,
            close: false,
            draggable: true,
            zindex: 100,
            modal: true,
            visible: false
        });
        panel.render(document.body);
        i2b2.Sharephe.modal.settings.panel = panel;
    }

    i2b2.Sharephe.modal.settings.panel.show();
};
i2b2.Sharephe.modal.settings.hide = function () {
    if (i2b2.Sharephe.modal.settings.panel) {
        i2b2.Sharephe.modal.settings.panel.hide();
    }
};

i2b2.Sharephe.modal.query = {};
i2b2.Sharephe.modal.query.show = function (title, message) {
    if (!i2b2.Sharephe.modal.query.panel) {
        let panel = new YAHOO.widget.Panel('Sharephe-QueryModal', {
            width: '800px',
            fixedcenter: true,
            close: true,
            draggable: true,
            zindex: 100,
            modal: true,
            visible: false
        });
        panel.render(document.body);
        i2b2.Sharephe.modal.query.panel = panel;
    }

    jQuery('#Sharephe-QueryModalTitle').text(title);
    jQuery('#Sharephe-QueryModalMessage').html(message);

    i2b2.Sharephe.modal.query.panel.show();
};
i2b2.Sharephe.modal.query.hide = function () {
    if (i2b2.Sharephe.modal.query.panel) {
        i2b2.Sharephe.modal.query.panel.hide();
    }
};
