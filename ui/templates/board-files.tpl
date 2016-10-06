<!-- ko ifnot: waitTree -->
<div class="btn-group" role="group">
    <button data-bind="click: refreshTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <!-- ko if: uploadEnabled -->
    <span class="btn btn-default btn-file">
        <i class="fa fa-upload"></i> Upload <input data-bind="event: { change: openUploadModal }" type="file" name="file" />
    </span>
    <!-- /ko -->
    <!-- ko if: selectedFiles().length -->
    <button data-bind="click: openRemoveFilesModal" type="button" class="btn btn-default">
        <i class="fa fa-trash"></i> Remove (<span data-bind="text: selectedFiles().length"></span>)
    </button>
    <!-- /ko -->
</div>

<hr />
<!-- /ko -->

<!-- ko if: waitTree -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong> Loading the file tree. Thanks to be patient, this can take some time.
</div>
<!-- /ko -->

<!-- ko ifnot: waitTree -->
<!-- ko ifnot: files().length -->
<div class="alert alert-warning" role="alert">
    <strong>No files or directories found!</strong> Please click ont the <button data-bind="click: refreshTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button> button to list all files on your board.
</div>
<!-- /ko -->
<!-- ko if: files().length -->
<div class="row">
    <div class="col-xs-12 col-md-4">
        <h3>Folders</h3>
        <div id="board-folders" data-bind="foreach: folders" class="files-tree list-group">
            <a data-bind="click: onSelect, css: active() ? 'active' : null" href="#" class="list-group-item">
                <!-- ko if: path == '/' -->
                <i class="fa fa-eye"></i> <span>View all files</span>
                <!-- /ko -->
                <!-- ko ifnot: path == '/' -->
                <!-- ko if: parents.length -->
                <span data-bind="foreach: parents">
                    <span class="indent"></span>
                </span>
                <!-- /ko -->
                <i data-bind="css: icon"></i> <span data-bind="text: name"></span>
                <!-- /ko -->
            </a>
        </div>
    </div>
    <div class="col-xs-12 col-md-8">
        <h3>
            <!-- ko if: selectedFolder() == '/' -->
            <i class="fa fa-eye"></i> <span>All files on the board</span>
            <!-- /ko -->
            <!-- ko ifnot: selectedFolder() == '/' -->
            <i class="fa fa-folder-open-o"></i> <span data-bind="text: selectedFolder"></span>
            <!-- /ko -->
        </h3>
        <div id="board-files" data-bind="foreach: files" class="files-tree list-group">
            <!-- ko if: visible -->
            <a data-bind="click: onSelect, css: active() ? 'active' : null" href="#" class="list-group-item">
                <i data-bind="css: icon"></i>
                <span data-bind="text: text"></span>
            </a>
            <!-- /ko -->
        </div>
    </div>
</div>
<!-- /ko -->
<!-- /ko -->
