<div id="boards" class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">
            <i class="fa fa-rocket"></i> Boards
            <a class="pull-right" role="button" data-toggle="modal" data-target="#boards-help">
                <i class="text-primary fa fa-question-circle-o"></i>
            </a>
        </h3>
    </div>
    <div class="panel-body">
        <!-- ko ifnot: boards().length -->
        <div class="alert alert-warning" role="alert">
            <strong>No boards found!</strong> Please scan the network to find some boards to play with.
        </div>
        <!-- /ko -->
        <!-- ko if: boards().length -->
        <ul data-bind="foreach: boards" class="list-group">
            <li data-bind="attr: { id: 'board-' + id }" class="list-group-item clearfix">
                <strong data-bind="text: address"></strong>

                <div class="pull-right btn-group-sm">
                    <!-- ko if: ko.online -->
                    <button type="button" class="btn btn-success" data-dismiss="modal">
                        <i class="fa fa-plug"></i> connect
                    </button>
                    <!-- /ko -->
                    <!-- ko ifnot: ko.online -->
                    <button type="button" class="btn btn-warning" data-dismiss="modal">
                        <i class="fa fa-search"></i> lookup
                    </button>
                    <!-- /ko -->
                    <button data-bind="attr: { 'data-target': '#board-' + id + '-info' }" type="button" class="btn btn-info" data-toggle="modal">
                        <i class="fa fa-info-circle"></i>
                    </button>
                </div>

                <div data-bind="attr: { id: 'board-' + id + '-info' }" class="modal fade" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header modal-header-info">
                                <button type="button" class="pull-right btn btn-sm btn-info" data-dismiss="modal">
                                    <i class="fa fa-close"></i> Close
                                </button>
                                <h4 class="modal-title">
                                    <i class="fa fa-info-circle"></i> Board info
                                </h4>
                            </div>
                            <div class="modal-body">
                                <!-- ko ifnot: info -->
                                <div class="alert alert-warning" role="alert">
                                    <strong>Oups!</strong> This board seems to be offline.
                                </div>
                                <!-- /ko -->
                                <!-- ko if: info -->
                                <table class="table table-bordered">
                                    <tbody data-bind="with: info">
                                        <tr><th>Address</th><td><span data-bind="text: $parent.address"></span></td></tr>
                                        <tr><th>Branch</th><td><span data-bind="text: branch"></span> (#<span data-bind="text: hash"></span>)</td></tr>
                                        <tr><th>Date</th><td><span data-bind="text: date"></span></td></tr>
                                        <tr><th>MCU</th><td><span data-bind="text: mcu"></span> at <span data-bind="text: clock"></span></td></tr>
                                    </tbody>
                                </table>
                                <!-- /ko -->
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
        <!-- /ko -->
    </div>
</div>
<!-- #boards -->

<div id="boards-help" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="boards-help-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header modal-header-primary">
                <button type="button" class="pull-right btn btn-sm btn-primary" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title" id="boards-help-title">
                    <i class="fa fa-question-circle-o"></i> Boards
                </h4>
            </div>
            <div class="modal-body">
                <p>Sorry, no help for this section.</p>
            </div>
        </div>
    </div>
</div>
<!-- #boards-help -->
