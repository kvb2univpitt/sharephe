let sharepheModal = {
    progress: {
        show: (title) => {
            $('#Sharephe-ProgressModalTitle').text(title);
            $('#Sharephe-ProgressModal').modal('show');
        },
        hide: () => {
            $('#Sharephe-ProgressModal').modal('hide');
        }
    },
    message: {
        show: (title, message) => {
            $('#Sharephe-MessageModalLabel').text(title);
            $('#Sharephe-MessageModalMessage').text(message);
            $('#Sharephe-MessageModal').modal('show');
        }
    },
    queryView: {
        show: (title, message) => {
            $('#Sharephe-QueryViewModalLabel').text(title);
            $('#Sharephe-QueryViewModalMessage').text(message);
            $('#Sharephe-QueryViewModal').modal('show');
        }
    }
};
