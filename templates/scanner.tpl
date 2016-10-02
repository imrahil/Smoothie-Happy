<div id="scanner" class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">
            <i class="fa fa-search"></i> Scanner
            <a class="pull-right" role="button" data-toggle="modal" data-target="#scanner-help">
                <i class="text-primary fa fa-question-circle-o"></i>
            </a>
        </h3>
    </div>
    <div class="panel-body">
        <div class="form-group">
            <div class="input-group input-group-sm">
                <input data-bind="value: input" type="text" class="form-control" placeholder="192.168.1.*" />
                <!-- ko ifnot: scanning -->
                <span class="input-group-btn">
                    <button data-bind="click: start" class="btn btn-sm btn-success w70" type="button">
                        Start
                    </button>
                </span>
                <!-- /ko -->
                <!-- ko if: scanning -->
                <!-- ko ifnot: in_pause -->
                <span class="input-group-btn">
                    <button data-bind="click: pause" class="btn btn-sm btn-warning w70" type="button">
                        Pause
                    </button>
                </span>
                <!-- /ko -->
                <!-- ko if: in_pause -->
                <span class="input-group-btn">
                    <button data-bind="click: resume" class="btn btn-sm btn-success w70" type="button">
                        Resume
                    </button>
                </span>
                <!-- /ko -->
                <span class="input-group-btn">
                    <button data-bind="click: stop" class="btn btn-sm btn-danger w70" type="button">
                        Stop
                    </button>
                </span>
                <!-- /ko -->
            </div>
        </div>
        <!-- ko if: scanning -->
        <div class="progress" data-bind="with: progression">
            <div data-bind="style: { width: percent() + '%' }" class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;">
                <span data-bind="text: percent() + '%'">0%</span>
            </div>
        </div>
        <!-- /ko -->
        <div class="form-group" data-bind="with: progression">
            <span class="label label-default">Total : <span data-bind="text: total">0</span></span>
            <span class="label label-info">Scanned : <span data-bind="text: scanned">0</span></span>
            <span class="label" data-bind="css: found() === 0 ? 'label-danger' : 'label-success'">Found : <span data-bind="text: found">0</span></span>
        </div>
    </div>
</div>
<!-- #scanner -->

<div id="scanner-help" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="scanner-help-title">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header modal-header-primary">
                <button type="button" class="pull-right btn btn-sm btn-primary" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <h4 class="modal-title" id="scanner-help-title">
                    <i class="fa fa-question-circle-o"></i> Scanner
                </h4>
            </div>
            <div class="modal-body">
                <h4>Alowed inputs</h4>
                <table class="table table-bordered">
                    <tbody>
                        <tr><th>Wildcard</th><td><code>192.168.1.*</code></td></tr>
                        <tr><th>Single IP</th><td><code>192.168.1.100</code></td></tr>
                        <tr><th>IP Range</th><td><code>192.168.1.100-120</code></td></tr>
                        <tr><th>Hostname</th><td><code>my.smoothie.net</code></td></tr>
                        <tr><th>Mixed</th><td><code>192.168.1.100, my.smoothie.net</code></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<!-- #scanner-help -->
