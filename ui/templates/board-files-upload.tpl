<div data-bind="with: upload" id="board-files-upload-modal" class="modal fade" tabindex="-1" role="dialog">
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
</div><!-- #board-files-upload-modal -->
