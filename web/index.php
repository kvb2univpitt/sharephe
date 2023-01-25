<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sharephe Tools</title>
        <link rel="icon" type="image/x-icon" href="images/favicon.ico" />
        <link rel="stylesheet" href="vendor/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="vendor/bootstrap-icons/bootstrap-icons.css" />
        <link rel="stylesheet" href="vendor/datatables/datatables.min.css" />
        <link rel="stylesheet" href="sharephe.css" />
    </head>
    <body>
        <header>
            <div class="navbar bg-light shadow-sm">
                <div class="container">
                    <a href="#" class="navbar-brand d-flex align-items-center">
                        <img src="images/Sharephe_icon_32x32.png" width="20" height="20" alt="Sharephe Logo" />
                        <strong class="px-2">Sharephe Tools</strong>
                    </a>
                </div>
            </div>
        </header>
        <main>
            <div class="container py-5">
                <button id="syncFromCloudBtn" class="btn btn-primary mb-4">
                    <i class="bi bi-cloud-download-fill"></i> Sync From Cloud
                </button>
                <div class="card mt-2 mb-4" id="Sharephe-WorkbookList">
                    <div class="card-body">
                        <div class="table-responsive py-4">
                            <table id="Sharephe-WorkbookTable" class="table table-sm" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>Workbook ID</th>
                                        <th>Type</th>
                                        <th>Title</th>
                                        <th>Authors</th>
                                        <th>Institution</th>
                                        <th>Files</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <div class="modal fade" id="Sharephe-ProgressModal" data-bs-backdrop="static" tabindex="-1" aria-labelledby="Sharephe-ProgressModalTitle" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="Sharephe-ProgressModalTitle">Progress</h5>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="Sharephe-MessageModal" tabindex="-1" aria-labelledby="Sharephe-MessageModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="Sharephe-MessageModalLabel">Message Title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="Sharephe-MessageModalMessage">Message</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <script src="vendor/jquery/jquery-3.6.3.min.js"></script>
        <script src="vendor/bootstrap/js/bootstrap.min.js"></script>
        <script src="vendor/datatables/datatables.min.js"></script>
        <script src="sharephe.js"></script>
    </body>
</html>