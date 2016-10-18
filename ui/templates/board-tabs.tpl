<ul data-bind="foreach: tabs.children" class="nav nav-tabs" role="tablist">
    <li data-bind="css: active() ? 'active' : null" role="presentation">
        <a data-bind="click: select, attr: { href: id }" role="tab" data-toggle="tab">
            <i data-bind="css: icon" class="text-primary fa"></i>
            <span data-bind="text: title"></span>
        </a>
    </li>
</ul><!-- .nav-tabs -->

<!-- Tab panes -->
<div class="tab-content">
    <div data-bind="css: tabs.selected().id == '#board-jog-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-jog-pane">
        {$board-jog.tpl}
    </div>
    <div data-bind="css: tabs.selected().id == '#board-files-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-files-pane">
        {$board-files.tpl}
    </div>
    <div data-bind="css: tabs.selected().id == '#board-terminal-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-terminal-pane">
        {$board-terminal.tpl}
    </div>
    <div data-bind="css: tabs.selected().id == '#board-config-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-config-pane">
        {$board-config.tpl}
    </div>
    <div data-bind="css: tabs.selected().id == '#board-info-pane' ? 'active' : null" role="tabpanel" class="tab-pane" id="board-info-pane">
        {$board-info.tpl}
    </div>
</div><!-- .tab-content -->
