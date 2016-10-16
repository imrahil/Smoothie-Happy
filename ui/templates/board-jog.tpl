<!-- ko with: jog -->

<!-- ko if: locked -->
<div class="alert alert-warning" role="alert">
    Click on the
    <button data-bind="click: refreshPosition" type="button" class="btn btn-xs btn-default">
        <i class="fa fa-unlock-alt"></i> Unlock
    </button>
    button to <strong>start playing</strong> with your board.
</div>
<!-- /ko -->

<!-- ko ifnot: locked -->
{$board-jog-position.tpl}
<!-- /ko -->

<!-- /ko -->
