<div id="scanner">

    <h4>
        HTTP scanner
        <a class="pull-right" role="button" data-toggle="collapse" href="#com-http-scanner-info" aria-expanded="false" aria-controls="com-http-scanner-info">
            <i class="fa fa-question-circle-o"></i>
        </a>
    </h4>

    <div class="info well bg-info collapse" id="com-http-scanner-info">
        <strong>Alowed inputs :</strong><br />
        Wildcard <code>192.168.1.*</code><br />
        Single IP <code>192.168.1.100</code><br />
        IP Range <code>192.168.1.100-120</code><br />
        Hostname <code>my.smoothie.net</code><br />
        Mixed <code>192.168.1.100, my.smoothie.net</code>
    </div>

    <div class="form-group">
        <div class="input-group input-group-sm">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input data-bind="value: http_scan_address" type="text" class="form-control" placeholder="192.168.1.*" />
            <span class="input-group-btn">
                <button data-bind="visible: !http_scan_run() && !http_scan_aborted(), click: http_start_scan" class="btn btn-sm btn-success" type="button">
                    Start
                </button>
            </span>
            <span class="input-group-btn">
                <button data-bind="visible: http_scan_run(), click: http_pause_scan" class="btn btn-sm btn-warning" type="button">
                    Pause
                </button>
            </span>
            <span class="input-group-btn">
                <button data-bind="visible: http_scan_aborted(), click: http_resume_scan" class="btn btn-sm btn-success" type="button">
                    Resume
                </button>
            </span>
            <span class="input-group-btn">
                <button data-bind="visible: http_scan_run() || http_scan_aborted(), click: http_stop_scan" class="btn btn-sm btn-danger" type="button">
                    Stop
                </button>
            </span>
            <span class="input-group-btn"></span>
        </div>
    </div>

    <div class="form-group" data-bind="with: http_scann_progression">
        <span class="label label-default">Total : <span data-bind="text: total">0</span></span>
        <span class="label label-info">Scanned : <span data-bind="text: scanned">0</span></span>
        <span class="label" data-bind="css: found === 0 ? 'label-danger' : 'label-success'">Found : <span data-bind="text: found">0</span></span>
    </div>

    <div class="progress">
        <div data-bind="style: { width: http_scann_percent() + '%' }" class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;">
            <span data-bind="text: http_scann_percent() + '%'">0%</span>
        </div>
    </div>
    
</div><!-- #scanner -->
