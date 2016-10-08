<!-- ko ifnot: waitTree -->
<div class="btn-group" role="group">
    <button data-bind="click: refreshTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <!-- ko if: uploadEnabled -->
    <button data-bind="click: openUploadModal" type="button" class="btn btn-default">
        <i class="fa fa-upload"></i> Upload
        <!-- ko if: upload.queue().length -->
        (<span data-bind="text: upload.queue().length"></span>)
        <!-- /ko -->
    </button>
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
    <strong>No files or directories found!</strong> Please click on the <button data-bind="click: refreshTree" type="button" class="btn btn-default">
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
                <span data-bind="text: size" class="pull-right label label-info"></span>
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
                <span data-bind="text: size" class="pull-right label label-info"></span>
            </a>
            <!-- /ko -->
        </div>
    </div>
</div>
<!-- /ko -->
<!-- /ko -->

<div data-bind="with: upload" id="board-upload-files-modal" class="modal fade" tabindex="-1" role="dialog">
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
                <!-- ko ifnot: queue().length -->
                <div class="alert alert-info" role="alert">
                    <strong>Upload queue empty!</strong>
                    <p>
                        Please click on the
                        <span class="btn btn-xs btn-default btn-file">
                            <i class="fa fa-plus"></i> Add files <input data-bind="event: { change: onAddFiles }" type="file" multiple />
                        </span> button ton select some files to upload.
                    </p>
                </div>
                <!-- /ko -->
                <!-- ko if: queue().length -->
                The following files will be uploaded :
                <!-- /ko -->
                <ul data-bind="foreach: queue" class="list-group">
                    <li class="list-group-item">
                        <div class="clearfix">
                            <i data-bind="css: icon"></i>
                            <span class="filename truncate">
                                <span data-bind="text: root"></span>/<strong data-bind="text: name"></strong>
                            </span>
                            <!-- ko ifnot: percent -->
                            <button data-bind="click: $parent.removeFile" type="button" class="pull-right btn btn-xs btn-danger">
                                <i class="fa fa-close"></i>
                            </button>
                            <!-- /ko -->
                            <span data-bind="text: size" class="pull-right label label-info"></span>
                        </div>
                        <!-- ko if: percent -->
                        <div class="progress">
                            <div data-bind="style: { width: percent }" class="progress-bar progress-bar-success progress-bar-striped" role="progressbar">
                                <span data-bind="text: percent">0%</span>
                            </div>
                        </div>
                        <!-- /ko -->
                    </li>
                </ul>
            </div>
            <div class="modal-footer">
                <span class="dropup">
                    <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
                        <i class="fa fa-folder-o"></i> Target
                    </button>
                    <ul data-bind="foreach: parent.folders()" class="dropdown-menu">
                        <!-- ko ifnot: path == '/' -->
                        <li data-bind="click: onSelect, css: active() ? 'active' : null">
                            <a data-bind="css: active() ? 'active' : null" href="#">
                                <!-- ko if: parents.length -->
                                <span data-bind="foreach: parents">
                                    <span class="indent"></span>
                                </span>
                                <!-- /ko -->
                                <i data-bind="css: icon"></i>
                                <span data-bind="text: name"></span>
                            </a>
                        </li>
                        <!-- /ko -->
                    </ul>
                </span>
                <span class="btn btn-default btn-file">
                    <i class="fa fa-plus"></i>
                    Add files <input data-bind="event: { change: onAddFiles }" type="file" multiple />
                </span>
                <!-- ko if: queue().length -->
                <!-- ko ifnot: uploading -->
                <button data-bind="click: start" type="button" class="btn btn-success">
                    <i class="fa fa-upload"></i> Upload
                </button>
                <!-- /ko -->
                <!-- ko if: uploading -->
                <button data-bind="click: abort" type="button" class="btn btn-warning">
                    <i class="fa fa-stop"></i> Stop
                </button>
                <!-- /ko -->
                <!-- /ko -->
            </div>
        </div>
    </div>
</div><!-- #board-upload-modal -->
