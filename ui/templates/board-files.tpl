<div class="btn-group" role="group">
    <button data-bind="disable: waitFilesTree, click: refreshFilesTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <span data-bind="css: uploadEnabled() ? '' : 'disabled'" class="btn btn-default btn-file">
        <i class="fa fa-upload"></i> Upload <input data-bind="enable: uploadEnabled, event: { change: uploadFile }" type="file" name="file" />
    </span>
</div>

<div id="board-upload-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">
                    <i class="fa fa-upload"></i> File upload
                </h4>
            </div>
            <div class="modal-body">
                Upload <strong data-bind="text: uploadFileName"></strong> <small>(<span data-bind="text: uploadFileSize"></span>)</small> file
                in to <strong data-bind="text: selectedDirectory"></strong> directory ?
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal">
                    <i class="fa fa-close"></i> Dismiss
                </button>
                <button data-bind="click: sendFile" type="button" class="btn btn-success" data-dismiss="modal">
                    <i class="fa fa-upload"></i> Upload
                </button>
            </div>
        </div>
    </div>
</div><!-- #board-upload-modal -->

<hr />

<!-- ko if: waitFilesTree -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong> Loading the file list. Thanks to be patient, this can take some time.
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
