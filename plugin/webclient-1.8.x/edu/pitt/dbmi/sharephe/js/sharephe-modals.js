if (typeof i2b2.sharephe === 'undefined') {
    i2b2.sharephe = {};
}

/**
 * Modals.
 */
i2b2.sharephe.modal = {};

// settings modal
i2b2.sharephe.modal.settings = {};
i2b2.sharephe.modal.settings.show = function (apiKey) {
    $('#apiKey').val(apiKey);
    $('#sharephe-settings-modal').modal('show');
};

// progress modals
i2b2.sharephe.modal.progress = {};
i2b2.sharephe.modal.progress.show = function (title) {
    $('#sharephe-progress-modal-title').text(title);
    $('#sharephe-progress-modal').modal('show');
};
i2b2.sharephe.modal.progress.hide = function () {
    $('#sharephe-progress-modal').modal('hide');
};
// message modals
i2b2.sharephe.modal.message = {};
i2b2.sharephe.modal.message.show = function (title, message) {
    $('#sharephe-message-modal-title').text(title);
    $('#sharephe-message-modal-message').text(message);
    $('#sharephe-message-modal').modal('show');
};
// query XML modals
i2b2.sharephe.modal.queryXml = {};
i2b2.sharephe.modal.queryXml.view = {};
i2b2.sharephe.modal.queryXml.view.show = function (title, message) {
    $('#sharephe-query-view-modal-title').text(title);
    $('#sharephe-query-view-modal-message').html(message);

    $('#sharephe-query-view-modal').modal('show');
};
i2b2.sharephe.modal.queryXml.add = {};
i2b2.sharephe.modal.queryXml.add.show = function () {
    $('#sharephe-query-add-modal').modal('show');
};
i2b2.sharephe.modal.queryXml.add.hide = function () {
    $('#sharephe-query-add-modal').modal('hide');
};