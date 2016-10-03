<div class="btn-group" role="group">
    <button data-bind="disable: waitFilesTree, click: refreshFilesTree" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <button type="button" class="btn btn-default">
        <i class="fa fa-upload"></i> Upload
    </button>
</div>

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
        <h3>Files : <span data-bind="text: selectedDirectory"></span></h3>
        <div id="board-files-tree"></div>
    </div>
</div>
<!-- /ko -->
<!-- /ko -->
