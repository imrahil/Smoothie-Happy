<div id="board-config-save-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="pull-right btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title">
                    <i class="fa fa-upload"></i> Save configuration
                </h4>
            </div>
            <div class="modal-body">
                <!-- ko ifnot: modified -->
                <div class="alert alert-info" role="alert">
                    <strong>Configuration up-to-date!</strong>
                </div>
                <!-- /ko -->
                <!-- ko if: uploading -->
                <div class="alert alert-info" role="alert">
                    <p><strong><i class="fa fa-spinner fa-pulse fa-fw"></i> Uploading <code data-bind="text: filename"></code> file to the board...</strong></p>
                    <div class="progress">
                        <div data-bind="style: { width: uploadPercent }" class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" style="min-width: 2em;">
                            <span data-bind="text: uploadPercent"></span>
                        </div>
                    </div>
                </div>
                <!-- /ko -->
                <!-- ko if: modified -->
                <!-- ko ifnot: uploading -->
                The following settings have been modified and will be written on your board :
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th style="width:200px">Value</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody data-bind="foreach: modified">
                        <tr data-bind="css: modified() ? 'info' : (disabled() ? 'warning' : 'default')">
                            <td>
                                <span data-bind="text: name"></span>
                            </td>
                            <td style="min-width:200px">
                                <span class="input-group input-group-sm">
                                    <input data-bind="value: value, event: { input: onChange }, disable: disabled" type="text" class="form-control" />
                                    <span class="input-group-btn">
                                        <button data-bind="click: onReset, attr: { title: 'Reset value to : ' + firstValue }" type="button" class="btn btn-default">
                                            <i class="fa fa-undo"></i>
                                        </button>
                                        <button data-bind="click: onToggle, css: disabled() ? 'btn-warning' : 'btn-default', text: disabled() ? 'off' : 'on'" type="button" class="btn"></button>
                                    </span>
                                </span>
                            </td>
                            <td>
                                <span data-bind="text: comments"></span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- /ko -->
                <!-- /ko -->
            </div>
            <!-- ko if: modified -->
            <!-- ko ifnot: uploading -->
            <div class="modal-footer">
                <button data-bind="click: upload" type="button" class="btn btn-success">
                    <i class="fa fa-upload"></i> Upload
                </button>
            </div>
            <!-- /ko -->
            <!-- /ko -->
        </div>
    </div>
</div><!-- #board-config-save-modal -->
