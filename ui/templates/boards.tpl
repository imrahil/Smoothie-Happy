<div id="boards" data-bind="with: boards" class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">
            <a class="pull-right" role="button" data-toggle="modal" data-target="#boards-help">
                <i class="text-primary fa fa-question-circle-o"></i>
            </a>
            <i class="fa fa-rocket"></i> Boards
        </h3>
    </div>
    <div class="panel-body">
        <!-- ko if: !knownBoards().length && !autoloadAddresses().length -->
        <div class="alert alert-warning" role="alert">
            <strong>No boards!</strong> Please scan the network to find some boards to play with.
        </div>
        <!-- /ko -->
        <!-- ko if: autoloadAddresses().length -->
        <div class="alert alert-info" role="alert">
            <i class="fa fa-spinner fa-pulse fa-fw"></i>
            <strong>Please wait...</strong>
            Lookup for known boards
            (
            <span data-bind="text: autoloadProgression"></span> /
            <span data-bind="text: knownAddresses().length"></span>
            ).
        </div>
        <!-- /ko -->
        <!-- ko if: knownBoards().length -->
        <div data-bind="foreach: { data: knownBoards, afterRender: afterRender }">
            <div data-bind="attr: { id: 'board-' + board.id }" class="board form-group">
                <div class="input-group input-group-sm">
                    <input
                    data-bind="value: name, event: { focusout: changeName }, attr: { title: tooltip }"
                    data-toggle="tooltip"
                    data-placement="top"
                    type="text"
                    class="form-control truncate" />
                    <!-- ko if: online -->
                    <!-- ko ifnot: connected -->
                    <span class="input-group-btn">
                        <button data-bind="disable: waitConnect, click: connect" type="button" class="btn btn-danger w100">
                            <i class="fa fa-plug"></i> Connect
                        </button>
                    </span>
                    <!-- /ko -->
                    <!-- ko if: connected -->
                    <span class="input-group-btn">
                        <button data-bind="click: disconnect" type="button" class="btn btn-success w100">
                            <i class="fa fa-plug"></i> Disconnect
                        </button>
                    </span>
                    <!-- /ko -->
                    <!-- /ko -->
                    <!-- ko ifnot: online -->
                    <span class="input-group-btn">
                        <button data-bind="disable: waitLookup, click: lookup" type="button" class="btn btn-warning w100">
                            <i class="fa fa-search"></i> Lookup
                        </button>
                    </span>
                    <!-- /ko -->
                    <span class="input-group-btn">
                        <button data-bind="attr: { 'data-target': '#board-' + board.id + '-info' }" type="button" class="btn btn-info" data-toggle="modal">
                            <i class="fa fa-info-circle"></i>
                        </button>
                    </span>
                </div>
            </div>
            <!-- .board -->
            <div data-bind="attr: { id: 'board-' + board.id + '-info' }" class="board-info modal fade" tabindex="-1" role="dialog">
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
                        {$board-offline.tpl}
                        {$board-info.tpl}
                        </div>
                    </div>
                </div>
            </div>
            <!-- .board-info -->
        </div>
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
