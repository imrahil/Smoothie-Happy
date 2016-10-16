<!-- ko with: files -->

<!-- ko ifnot: waitTree -->
<!-- ko if: files().length -->
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
<!-- /ko -->

<!-- ko if: waitTree -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong> Loading the file tree. Thanks to be patient, this can take some time (2-30 sec.).
</div>
<!-- /ko -->

<!-- ko ifnot: waitTree -->
<!-- ko ifnot: files().length -->
<div class="alert alert-warning" role="alert">
    Click on the
    <button data-bind="click: refreshTree" type="button" class="btn btn-xs btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    button to <strong>list all files</strong> on your board.
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
            <a data-bind="click: onSelect, css: (active() ? 'active' : null) + ' ' + (enabled() ? '' : 'disabled') " href="#" class="list-group-item">
                <i data-bind="css: icon"></i>
                <span data-bind="text: text"></span>
                <span class="pull-right">
                    <span data-bind="text: size" class="label label-info"></span>
                    <button data-bind="click: onEdit" type="button" class="btn btn-xs btn-default">
                        <i class="fa fa-edit fa-fw"></i>
                    </button>
                    <button data-bind="click: onDownload" type="button" class="btn btn-xs btn-default">
                        <!-- ko if: downloading -->
                        <i class="fa fa-spinner fa-pulse fa-fw"></i>
                        <!-- /ko -->
                        <!-- ko ifnot: downloading -->
                        <i class="fa fa-download fa-fw"></i>
                        <!-- /ko -->
                    </button>
                </span>
            </a>
            <!-- /ko -->
        </div>
    </div>
</div>
<!-- /ko -->
<!-- /ko -->

{$board-files-upload.tpl}
{$board-files-remove.tpl}
{$board-files-edit.tpl}

<!-- /ko -->
