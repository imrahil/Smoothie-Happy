<div id="board-files-remove-modal" class="modal fade" tabindex="-1" role="dialog">
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
                <ul data-bind="foreach: selectedFiles" class="list-group">
                    <li class="list-group-item">
                        <div class="clearfix">
                            <i data-bind="css: icon"></i>
                            <span class="filename truncate">
                                <span data-bind="text: root"></span>/<strong data-bind="text: name"></strong>
                            </span>
                            <button data-bind="click: $parent.removeFile" type="button" class="pull-right btn btn-xs btn-danger">
                                <i class="fa fa-close"></i>
                            </button>
                            <span data-bind="text: size" class="pull-right label label-info"></span>
                        </div>
                    </li>
                </ul>
                <!-- /ko -->
            </div>
            <!-- ko if: selectedFiles().length -->
            <div class="modal-footer">
                <button data-bind="click: removeFiles" type="button" class="btn btn-danger">
                    <i class="fa fa-trash"></i> Remove
                </button>
            </div>
            <!-- /ko -->
        </div>
    </div>
</div><!-- #board-files-remove-modal -->
