<!-- ko ifnot: waitConfig -->
<div class="btn-group" role="group">
    <button data-bind="click: refreshConfig" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
</div>

<hr />
<!-- /ko -->

<!-- ko if: waitConfig -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong> Loading the configuration. Thanks to be patient, this can take some time.
</div>
<!-- /ko -->

<!-- ko ifnot: waitConfig -->
<!-- ko ifnot: configList().length -->
<div class="alert alert-warning" role="alert">
    <strong>No configuration loaded!</strong> Please click on the <button data-bind="click: refreshConfig" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button> button to load configuration.
</div>
<!-- /ko -->
<!-- ko if: configList().length -->
<table class="table table-bordered">
    <thead>
        <tr>
            <th>Name</th>
            <th style="width:200px">Value</th>
            <th>Comments</th>
        </tr>
    </thead>
    <tbody data-bind="foreach: configList">
        <!-- ko if: isValue -->
        <tr data-bind="css: disabled() ? 'warning' : (modified() ? 'info' : 'default')">
            <td>
                <span data-bind="text: name()"></span>
            </td>
            <td style="min-width:200px">
                <span class="input-group input-group-sm">
                    <input data-bind="value: value(), event: { input: $parent.configItemChange }, disable: disabled()" type="text" class="form-control" />
                    <span class="input-group-btn">
                        <!-- ko if: modified -->
                        <button data-bind="click: $parent.configItemReset, attr: { title: 'Reset value to : ' + value().getFirstValue() }" type="button" class="btn btn-default">
                            <i class="fa fa-undo"></i>
                        </button>
                        <!-- /ko -->
                        <button data-bind="click: $parent.configItemToggle, css: disabled() ? 'btn-warning' : 'btn-default', text: disabled() ? 'off' : 'on'" type="button" class="btn"></button>
                    </span>
                </span>
            </td>
            <td>
                <span data-bind="text: comments()"></span>
            </td>
        </tr>
        <!-- /ko -->
        <!-- ko ifnot: isValue -->
        <tr>
            <th colspan="3" class="active">
                <span data-bind="text: comments()"></span>
            </th>
        </tr>
        <!-- /ko -->
    </tbody>
</table>
<!-- /ko -->
<!-- /ko -->
