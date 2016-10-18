<!-- ko with: openedFile -->
<div id="board-files-edit-modal" class="modal fade full-screen" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="pull-right btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title">
                    <i class="fa fa-edit"></i> Edit : <span data-bind="text: path"></span>
                </h4>
            </div>
            <div class="modal-body">
                <pre id="openedFileContent" data-bind="text: raw" contenteditable="true"></pre>
            </div>
            <div class="modal-footer">
                <button data-bind="click: onSave" type="button" class="btn btn-primary">
                    <i class="fa fa-save"></i> Save
                </button>
            </div>
        </div>
    </div>
</div><!-- #board-files-edit-modal -->
<!-- /ko -->
