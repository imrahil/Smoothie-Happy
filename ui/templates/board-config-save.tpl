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
                <!-- ko ifnot: uploading -->
                <!-- ko ifnot: modified().length -->
                <div class="alert alert-info" role="alert">
                    <strong>Configuration up-to-date!</strong>
                </div>
                <!-- /ko -->
                <!-- ko if: modified().length -->
                The following settings have been modified and will be written on your board :
                <!-- /ko -->
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th style="width:200px">Value</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody data-bind="foreach: modified">
                        <!-- ko if: isValue -->
                        <tr data-bind="css: modified() ? 'info' : (disabled() ? 'warning' : 'default')">
                            <td>
                                <span data-bind="text: name()"></span>
                            </td>
                            <td style="min-width:200px">
                                <span class="input-group input-group-sm">
                                    <input data-bind="value: value(), event: { input: change }, disable: disabled()" type="text" class="form-control" />
                                    <span class="input-group-btn">
                                        <!-- ko if: modified -->
                                        <button data-bind="click: reset, attr: { title: 'Reset value to : ' + value().getFirstValue() }" type="button" class="btn btn-default">
                                            <i class="fa fa-undo"></i>
                                        </button>
                                        <!-- /ko -->
                                        <button data-bind="click: toggle, css: disabled() ? 'btn-warning' : 'btn-default', text: disabled() ? 'off' : 'on'" type="button" class="btn"></button>
                                    </span>
                                </span>
                            </td>
                            <td>
                                <span data-bind="text: comments()"></span>
                            </td>
                        </tr>
                        <!-- /ko -->
                    </tbody>
                </table>
                <!-- /ko -->
                <!-- ko if: uploading -->
                <div class="alert alert-info" role="alert">
                    <p><strong><i class="fa fa-spinner fa-pulse fa-fw"></i> Uploading config file...</strong></p>
                    <!-- ko if: percent -->
                    <div class="progress">
                        <div data-bind="style: { width: percent }" class="progress-bar progress-bar-success progress-bar-striped" role="progressbar">
                            <span data-bind="text: percent">0%</span>
                        </div>
                    </div>
                    <!-- /ko -->
                </div>
                <!-- /ko -->
            </div>
            <!-- ko ifnot: uploading -->
            <!-- ko if: modified().length -->
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
