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
                The following files will be removed :
                <!-- ko ifnot: selectedFiles().length -->
                <div class="alert alert-info" role="alert">
                    <strong>Empty queue!</strong>
                </div>
                <!-- /ko -->
                <!-- ko if: selectedFiles().length -->
                <ul data-bind="foreach: selectedFiles" class="list-group">
                    <li data-bind="css: enabled() ? '' : 'disabled'" class="list-group-item">
                        <div class="clearfix">
                            <i data-bind="css: icon"></i>
                            <span class="filename truncate">
                                <span data-bind="text: root"></span>/<strong data-bind="text: name"></strong>
                            </span>
                            <span class="pull-right">
                                <span data-bind="text: size" class="label label-info"></span>
                                <!-- ko if: enabled -->
                                <button data-bind="click: $parent.unselectedFile" type="button" class="btn btn-xs btn-danger">
                                    <i class="fa fa-close"></i>
                                </button>
                                <!-- /ko -->
                            </span>
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
