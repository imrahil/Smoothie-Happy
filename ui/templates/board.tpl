<div id="board" data-bind="with: boards" class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">
            <span class="dropdown">
                <a href="#" class="dropdown-toggle" id="drop1" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-chevron-down"></i> Boards
                </a>
                <!-- ko if: selectedBoard -->
                <!-- ko with: selectedBoard -->
                : <i data-bind="css: online() ? (connected() ? 'text-success' : 'text-danger') : ''" class="fa fa-fw fa-rocket"></i>
                <span data-bind="text: name" class="name truncate"></span>
                <!-- /ko -->
                <!-- /ko -->
                <!-- ko if: knownBoards().length -->
                <ul data-bind="foreach: { data: knownBoards }" class="dropdown-menu" aria-labelledby="drop1">
                    <li>
                        <a data-bind="click: $parent.selectBoard" href="#">
                            <i data-bind="css: online() ? (connected() ? 'text-success' : 'text-danger') : ''" class="fa fa-fw fa-rocket"></i>
                            <span data-bind="text: name"></span>
                        </a>
                    </li>
                    <li role="separator" class="divider"></li>
                </ul>
                <!-- /ko -->
            </span>
            <a class="pull-right" role="button" data-toggle="modal" data-target="#board-help">
                <i class="text-primary fa fa-question-circle-o"></i>
            </a>
        </h3>
    </div>
    <div class="panel-body">
        <!-- ko if: knownBoards().length && !selectedBoard() -->
        <div class="alert alert-warning" role="alert">
            <strong>No board selected!</strong> Please select a board to play with.
        </div>
        <!-- /ko -->
        <!-- ko if: selectedBoard -->
        <!-- ko with: selectedBoard -->
        <!-- ko ifnot: online -->
        {$board-offline.tpl}
        <!-- /ko -->
        <!-- ko if: online -->
        <div>
            <!-- Nav tabs -->
            <!-- ko with: tabs -->
            <ul data-bind="foreach: children" class="nav nav-tabs" role="tablist">
                <li data-bind="css: active() ? 'active' : null" role="presentation">
                    <a data-bind="click: select, attr: { href: id }" role="tab" data-toggle="tab">
                        <i data-bind="css: icon" class="text-primary fa"></i>
                        <span data-bind="text: title"></span>
                    </a>
                </li>
            </ul>
            <!-- /ko -->
            <!-- Tab panes -->
            <div class="tab-content">
                <div data-bind="css: tabs.selected().id == '#board-jog-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-jog-pane">
                    {$board-jog.tpl}
                </div>
                <div data-bind="css: tabs.selected().id == '#board-files-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-files-pane">
                    {$board-files.tpl}
                </div>
                <div data-bind="css: tabs.selected().id == '#board-terminal-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-terminal-pane">
                    {$board-terminal.tpl}
                </div>
                <div data-bind="css: tabs.selected().id == '#board-config-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-config-pane">
                    {$board-config.tpl}
                </div>
                <div data-bind="css: tabs.selected().id == '#board-info-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-info-pane">
                    {$board-info.tpl}
                </div>
            </div>
        </div>
        <!-- /ko -->
        <!-- /ko -->
        <!-- /ko -->
    </div>
</div>
<!-- #board -->

<div id="board-help" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="board-help-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header modal-header-primary">
                <button type="button" class="pull-right btn btn-sm btn-primary" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title" id="board-help-title">
                    <i class="fa fa-question-circle-o"></i> Board
                </h4>
            </div>
            <div class="modal-body">
                <p>Sorry, no help for this section.</p>
            </div>
        </div>
    </div>
</div>
<!-- #board-help -->
