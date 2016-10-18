<!-- ko with: player -->
<h3>
    <i class="fa fa-play"></i>
    <span data-bind="text: state"></span> :
    <!-- ko with: file -->
    <span data-bind="text: path"></span>
    <small>(<span data-bind="text: size"></span>)</small>
    <!-- /ko -->

    <div class="btn-group" style="margin-top:5px">
        <!-- ko ifnot: playing -->
        <div class="btn-group">
            <button data-bind="disable: sending, click: play" class="btn btn-success" type="button">
                <i class="fa fa-play"></i> Play
            </button>
        </div>
        <div class="btn-group">
            <button data-bind="disable: sending, click: close" class="btn btn-default" type="button">
                <i class="fa fa-close"></i> Close
            </button>
        </div>
        <!-- /ko -->

        <!-- ko if: playing -->

        <!-- ko ifnot: paused -->
        <div class="btn-group">
            <button data-bind="disable: sending, click: pause" class="btn btn-warning" type="button">
                <i class="fa fa-pause"></i> Pause
            </button>
        </div>
        <!-- /ko -->

        <!-- ko if: paused -->
        <div class="btn-group">
            <button data-bind="disable: sending, click: resume" class="btn btn-success" type="button">
                <i class="fa fa-play"></i> Resume
            </button>
        </div>
        <!-- /ko -->

        <div class="btn-group">
            <button data-bind="disable: sending, click: stop" class="btn btn-danger" type="button">
                <i class="fa fa-stop"></i> Stop
            </button>
        </div>

        <!-- /ko -->
    </div>
</h3>

<!-- ko with: progress -->
<div class="progress" style="margin-top:15px">
    <div data-bind="style: { width: percent }" class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" style="min-width:2em">
        <span data-bind="text: percent">0%</span>
    </div>
</div>
<h3 style="margin-top:15px">
    <!-- ko if: $parent.startTime -->
    <i class="fa fa-clock-o"></i>
    Start : <span data-bind="text: $parent.startTime()"></span> -
    <!-- /ko -->
    <i class="fa fa-hourglass-half"></i>
    Elapsed : <span data-bind="text: elapsed"></span> -
    <i class="fa fa-hourglass-end"></i>
    Estimated : <span data-bind="text: estimated"></span>
</h3>
<!-- /ko -->

<!-- /ko -->
