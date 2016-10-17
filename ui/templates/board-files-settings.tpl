<!-- ko with: settings -->
<div id="board-files-settings-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="pull-right btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title">
                    <i class="fa fa-cogs"></i> Files settings
                </h4>
            </div>
            <div class="modal-body">
                <h3>Ignore list</h3>
                <textarea data-bind="value: ignoreText, event: { input: onIgnoreTextChange }" class="well" rows="5"></textarea>
            </div>
            <!-- ko if: ignoreTextModified -->
            <div class="modal-footer">
                <button data-bind="click: updateIgnoreText" type="button" class="btn btn-success">
                    <i class="fa fa-save"></i> Save
                </button>
            </div>
            <!-- /ko -->
        </div>
    </div>
</div><!-- #board-files-settings-modal -->
<!-- /ko -->
