<!-- ko with: config -->

<!-- ko ifnot: loading -->
<div class="btn-group" role="group">
    <button data-bind="click: refresh" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button>
    <!-- ko if: modified -->
    <button data-bind="click: reset" type="button" class="btn btn-default">
        <i class="fa fa-undo"></i> Reset (<span data-bind="text: modified().length"></span>)
    </button>
    <button data-bind="click: openSaveModal" type="button" class="btn btn-default">
        <i class="fa fa-upload"></i> Save
    </button>
    <!-- /ko -->
</div>

<hr />
<!-- /ko -->

<!-- ko if: loading -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong> Loading the configuration. Thanks to be patient, this can take some time.
</div>
<!-- /ko -->

<!-- ko ifnot: loading && loaded -->
<div class="alert alert-warning" role="alert">
    <strong>No configuration loaded!</strong> Please click on the <button data-bind="click: refresh" type="button" class="btn btn-default">
        <i class="fa fa-refresh"></i> Refresh
    </button> button to load configuration.
</div>
<!-- /ko -->


<!-- ko if: loaded -->
<table class="table table-bordered">
    <thead>
        <tr>
            <th>Name</th>
            <th style="width:200px">Value</th>
            <th>Comments</th>
        </tr>
    </thead>
    <tbody data-bind="foreach: items">
        <!-- ko if: isValue -->
        <tr data-bind="css: modified() ? 'info' : (disabled() ? 'warning' : 'default')">
            <td>
                <span data-bind="text: name"></span>
            </td>
            <td style="min-width:200px">
                <span class="input-group input-group-sm">
                    <input data-bind="value: value, event: { input: onChange }, disable: disabled" type="text" class="form-control" />
                    <span class="input-group-btn">
                        <!-- ko if: modified -->
                        <button data-bind="click: onReset, attr: { title: 'Reset value to : ' + firstValue }" type="button" class="btn btn-default">
                            <i class="fa fa-undo"></i>
                        </button>
                        <!-- /ko -->
                        <button data-bind="click: onToggle, css: disabled() ? 'btn-warning' : 'btn-default', text: disabled() ? 'off' : 'on'" type="button" class="btn"></button>
                    </span>
                </span>
            </td>
            <td>
                <span data-bind="text: comments"></span>
            </td>
        </tr>
        <!-- /ko -->
        <!-- ko ifnot: isValue -->
        <tr>
            <th colspan="3" class="active">
                <span data-bind="text: comments"></span>
            </th>
        </tr>
        <!-- /ko -->
    </tbody>
</table>
<!-- /ko -->

{$board-config-save.tpl}

<!-- /ko -->
