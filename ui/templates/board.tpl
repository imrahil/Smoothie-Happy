<!-- ko with: boards -->
<div id="board" class="panel panel-default">
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
                <ul data-bind="foreach: { data: knownBoards }" class="dropdown-menu" aria-labelledby="drop1">
                    <li>
                        <a data-bind="click: $parent.selectBoard" href="#">
                            <i data-bind="css: online() ? (connected() ? 'text-success' : 'text-danger') : ''" class="fa fa-fw fa-rocket"></i>
                            <span data-bind="text: name"></span>
                        </a>
                    </li>
                    <li role="separator" class="divider"></li>
                </ul>
            </span>
            <a class="pull-right" role="button" data-toggle="modal" data-target="#board-help">
                <i class="text-primary fa fa-fw fa-question-circle-o"></i>
            </a>
            <a data-bind="click: toggleFullScreen" class="pull-right" role="button">
                <i class="text-primary fa fa-fw fa-arrows-alt"></i>
            </a>
        </h3>
    </div>
    <!-- ko ifnot: knownBoards().length -->
    <div class="panel-body">
        {$boards-loading.tpl}
    </div>
    <!-- /ko -->

    <!-- ko if: knownBoards().length -->
    <div class="panel-body">
        <!-- ko ifnot: selectedBoard -->
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

        <!-- ko if: player.ready() -->
        {$board-player.tpl}
        <!-- /ko -->

        <!-- ko ifnot: player.ready() -->
        {$board-tabs.tpl}
        <!-- /ko -->

        {$board-player-play.tpl}
        <!-- /ko -->

        <!-- /ko -->
        <!-- /ko -->
    </div>
    <!-- /ko -->

</div>
<!-- #board -->

{$board-help.tpl}

<!-- /ko -->
