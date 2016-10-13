<!-- ko with: position -->
<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">
            <span class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <i class="fa fa-chevron-down"></i> <span data-bind="text: selected().command"></span> :
                </a>
                <span data-bind="text: selected().description" class="name truncate"></span>
                <ul data-bind="foreach: values" class="dropdown-menu">
                    <li>
                        <a data-bind="click: select, css: $parent.selected() == $data ? 'active' : null" href="#">
                            <span data-bind="text: command"></span>
                        </a>
                    </li>
                    <li role="separator" class="divider"></li>
                </ul>
            </span>
            <button data-bind="click: refreshPosition" type="button" class="btn btn-xs btn-default pull-right">
                <i class="fa fa-refresh"></i> refresh
            </button>
        </h3>
    </div>
    <div class="panel-body">
        <div data-bind="foreach: values">
            <!-- ko if: $parent.selected() == $data -->
            <div data-bind="foreach: axis">
                <div class="form-group">
                    <div class="input-group">
                        <span data-bind="text: name" class="input-group-addon" style="font-family:monospace;font-weight:bold"></span>
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button">
                                <i class="fa fa-home"></i>
                            </button>
                        </span>
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button">
                                <i class="fa fa-minus"></i>
                            </button>
                        </span>
                        <input data-bind="value: value" type="text" class="form-control">
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button">
                                <i class="fa fa-plus"></i>
                            </button>
                        </span>
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button">SET</button>
                        </span>
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button">ZERO</button>
                        </span>
                    </div>
                </div>
            </div>
            <!-- /ko -->
        </div>
        <div class="form-group">
            <div class="btn-group">
                <span class="btn-group-addon"><i class="fa fa-arrows-h"></i></span>
                <!-- ko foreach: steps -->
                <button data-bind="text: $data, css: $data == $parent.step() ? 'active' : null" class="btn btn-default" type="button"></button>
                <!-- /ko -->
            </div>
        </div>
    </div>
</div>
<!-- /ko -->
