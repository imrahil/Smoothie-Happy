<!-- ko with: player -->
<div id="board-player-play-modal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="pull-right btn btn-sm btn-default" data-dismiss="modal" aria-label="Close">
                    <i class="fa fa-close"></i> Close
                </button>
                <!-- ko with: file -->
                <h4 class="modal-title">
                    <i class="fa fa-play"></i> Play :
                    <span data-bind="text: path"></span>
                    <small>(<span data-bind="text: size"></span>)</small>
                </h4>
                <!-- /ko -->
            </div>
            <div class="modal-body">
                <!-- ko ifnot: playing -->
                <button data-bind="click: play" type="button" class="btn btn-block btn-success">
                    <i class="fa fa-play"></i> Start play !
                </button>
                <!-- /ko -->
                <!-- ko if: playing -->
                <i class="fa fa-spinner fa-pulse fa-fw"></i>
                <strong>Please wait...</strong> Loading the file player.
                <!-- /ko -->
            </div>
        </div>
    </div>
</div><!-- #board-player-play-modal -->
<!-- /ko -->
