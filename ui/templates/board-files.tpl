<!-- ko ifnot: waitFilesTree -->
<div class="btn-group" role="group">
    <button data-bind="click: refreshFilesTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <!-- ko if: uploadEnabled -->
    <span class="btn btn-default btn-file">
        <i class="fa fa-upload"></i> Upload <input data-bind="event: { change: uploadFile }" type="file" name="file" />
    </span>
    <!-- /ko -->
    <!-- ko if: selectedFiles().length -->
    <button data-bind="click: removeFiles" type="button" class="btn btn-default">
        <i class="fa fa-trash"></i> Remove
    </button>
    <!-- /ko -->
</div>

<hr />
<!-- /ko -->

<!-- ko if: waitFilesTree -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong> Loading the file tree. Thanks to be patient, this can take some time.
</div>
<!-- /ko -->

<!-- ko ifnot: waitFilesTree -->
<!-- ko ifnot: filesTree().length -->
<div class="alert alert-warning" role="alert">
    <strong>No files or directories found!</strong> Please click ont the <button data-bind="click: refreshFilesTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button> button to list all files on your board.
</div>
<!-- /ko -->
<!-- ko if: filesTree().length -->
<div class="row">
    <div class="col-xs-12 col-md-4">
        <h3>Directories</h3>
        <div id="board-dirs-tree"></div>
    </div>
    <div class="col-xs-12 col-md-8">
        <h3>Files : <span data-bind="text: selectedDirectoryText"></span></h3>
        <div id="board-files-tree"></div>
    </div>
</div>
<!-- /ko -->
<!-- /ko -->

<div id="board-upload-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="pull-right btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title">
                    <i class="fa fa-upload"></i> File upload
                </h4>
            </div>
            <div class="modal-body">
                Upload <strong data-bind="text: uploadFileName"></strong> <small>(<span data-bind="text: uploadFileSize"></span>)</small> file
                in to <strong data-bind="text: selectedDirectory"></strong> directory ?
            </div>
            <div class="modal-footer">
                <button data-bind="click: sendFile" type="button" class="btn btn-success">
                    <i class="fa fa-upload"></i> Upload
                </button>
            </div>
        </div>
    </div>
</div><!-- #board-upload-modal -->

<div id="board-remove-files-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="pull-right btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title">
                    <i class="fa fa-trash"></i> Remove files
                </h4>
            </div>
            <div class="modal-body">
                <!-- ko ifnot: selectedFiles().length -->
                <div class="alert alert-warning" role="alert">
                    <strong>No files selected!</strong> Please select one or more files before clicking the delete button.
                </div>
                <!-- /ko -->
                <!-- ko if: selectedFiles().length -->
                The following files will be removed :
                <ul data-bind="foreach: selectedFiles">
                    <li data-bind="text: node.path"></li>
                </ul>
                <!-- /ko -->
            </div>
            <!-- ko if: selectedFiles().length -->
            <div class="modal-footer">
                <button data-bind="click: deleteFiles" type="button" class="btn btn-danger">
                    <i class="fa fa-trash"></i> Remove
                </button>
            </div>
            <!-- /ko -->
        </div>
    </div>
</div><!-- #board-remove-files-modal -->
