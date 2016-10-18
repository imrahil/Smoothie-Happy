<!-- ko if: !knownBoards().length && !autoloadAddresses().length -->
<div class="alert alert-warning" role="alert">
    <strong>No boards!</strong> Please scan the network to find some boards to play with.
</div>
<!-- /ko -->
<!-- ko if: autoloadAddresses().length -->
<div class="alert alert-info" role="alert">
    <i class="fa fa-spinner fa-pulse fa-fw"></i>
    <strong>Please wait...</strong>
    Lookup for known boards
    (
    <span data-bind="text: autoloadProgression"></span> /
    <span data-bind="text: knownAddresses().length"></span>
    ).
</div>
<!-- /ko -->
