<div class="btn-group" role="group">
    <button data-bind="click: toggleLock" type="button" class="btn btn-default">
        <i class="fa fa-lock"></i> Lock
    </button>
    <button data-bind="click: refreshPosition" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <div class="btn-group" role="group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa fa-chevron-down"></i> <span data-bind="text: selectedPosition"></span>
        </button>
        <ul data-bind="foreach: positions" class="dropdown-menu">
            <li data-bind="css: $parent.selectedPosition() == command ? 'active' : null">
                <a data-bind="click: $parent.selectPosition" href="#">
                    <span data-bind="text: command"></span>
                </a>
            </li>
            <li role="separator" class="divider"></li>
        </ul>
    </div>
    <!-- ko with: terminal -->
    <!-- ko ifnot: emptyQueue -->
    <button data-bind="click: clearQueue" class="btn btn-default" type="button">
        <i class="fa fa-fw fa-eraser"></i> Clear queue (<span data-bind="text: commands().length"></span>)
    </button>
    <!-- /ko -->
    <!-- /ko -->
</div>

<hr />

<div data-bind="foreach: positions">
    <!-- ko if: $parent.selectedPosition() == $data.command -->
    <h3 data-bind="text: description"></h3>
    <div data-bind="foreach: axis">
        <div class="form-group">
            <div class="input-group">
                <span data-bind="text: name" class="input-group-addon" style="width:39px;font-family:monospace;font-weight:bold"></span>
                <span class="input-group-btn">
                    <button data-bind="click: home" class="btn btn-default" type="button" title="Go to home">
                        <i class="fa fa-home"></i>
                    </button>
                </span>
                <div class="input-group-btn">
                    <button data-bind="click: origin" class="btn btn-default" type="button" title="Go to origin">
                        <i class="fa fa-bullseye" aria-hidden="true"></i>
                    </button>
                </div>
                <span class="input-group-btn">
                    <button data-bind="click: decrement" class="btn btn-default" type="button">
                        <i class="fa fa-minus"></i>
                    </button>
                </span>
                <input data-bind="enable: terminal.emptyQueue, value: strValue" type="text" class="form-control">
                <span class="input-group-btn">
                    <button data-bind="click: increment" class="btn btn-default" type="button">
                        <i class="fa fa-plus"></i>
                    </button>
                </span>
                <span class="input-group-btn">
                    <button data-bind="enable: terminal.emptyQueue, click: set" class="btn btn-default" type="button" title="Set origin">SET ORIGIN</button>
                </span>
                <span class="input-group-btn">
                    <button data-bind="click: zero" class="btn btn-default" type="button" title="Set zero">SET ZERO</button>
                </span>
            </div>
        </div>
    </div>
    <!-- /ko -->
</div>

<div class="form-group pull-left" style="margin-right:15px;">
    <div class="btn-group">
        <span class="btn-group-addon">X/Y/Z</span>
        <div class="btn-group">
            <button data-bind="click: home" class="btn btn-default" type="button" title="Go to home">
                <i class="fa fa-home"></i>
            </button>
        </div>
        <div class="btn-group">
            <button data-bind="click: origin" class="btn btn-default" type="button" title="Go to origin">
                <i class="fa fa-bullseye" aria-hidden="true"></i>
            </button>
        </div>
        <div class="btn-group">
            <button data-bind="click: zero" class="btn btn-default" type="button" title="Set zero">SET ZERO</button>
        </div>
    </div>
</div>

<div class="form-group pull-left">
    <div class="btn-group">
        <span class="btn-group-addon"><i class="fa fa-arrows-h"></i></span>
        <!-- ko foreach: steps -->
        <button data-bind="click: $parent.resolution, text: $data, css: $data == $parent.step() ? 'active' : null" class="btn btn-default" type="button"></button>
        <!-- /ko -->
    </div>
</div>
