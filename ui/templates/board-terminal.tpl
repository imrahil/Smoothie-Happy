<!-- ko with: terminal -->
<div class="btn-group">
    <button data-bind="click: clear" class="btn btn-default" type="button">
        <i class="fa fa-fw fa-eraser"></i> Clear logs
    </button>
    <button data-bind="click: toggleAutoscroll" class="btn btn-default" type="button">
        <i class="fa fa-fw fa-sort-amount-asc"></i>
        Autoscroll : <span data-bind="text: autoscroll() ? 'on' : 'off'"></span>
    </button>
    <!-- ko if: commands().length -->
    <button data-bind="click: clearQueue" class="btn btn-default" type="button">
        <i class="fa fa-fw fa-eraser"></i> Clear queue (<span data-bind="text: commands().length"></span>)
    </button>
    <!-- /ko -->
</div>
<hr />
<form data-bind="submit: send">
    <div class="form-group">
        <div class="input-group input-group-sm">
            <input id="terminal-command-input" type="text" class="form-control" placeholder="Type your command here..." />
            <span class="input-group-btn">
                <button data-bind="click: send" class="btn btn-sm btn-default" type="button">
                    <i class="fa fa-fw fa-send"></i> Send
                </button>
            </span>
        </div>
    </div>
</form>
<ul id="terminal-messages" data-bind="foreach: messages" class="terminal files-tree list-group">
    <li data-bind="css: style" class="list-group-item">
        <i data-bind="css: icon"></i> <span data-bind="html: message"></span>
    </li>
</ul>
<!-- /ko -->
