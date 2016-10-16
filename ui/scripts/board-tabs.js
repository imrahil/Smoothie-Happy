// -----------------------------------------------------------------------------
// board model
// -----------------------------------------------------------------------------

var BoardTabModel = function(parent, tabs) {
    // set initial state
    this.parent = parent;
    this.title  = tabs.title;
    this.icon   = 'fa-' + tabs.icon;
    this.active = ko.observable(tabs.active);
    this.id     = '#board-' + tabs.title.toLowerCase() + '-pane';
};

BoardTabModel.prototype.select = function(tabModel, event) {
    this.parent.select(tabModel);
};

var BoardTabsModel = function(parent, tabs, defaultTab) {
    // set initial state
    this.parent   = parent;
    this.selected = ko.observable();
    this.children = ko.observableArray();

    // default tab
    var selectedTab = defaultTab || tabs[0].title;

    // init tabs children
    for (var child, i = 0; i < tabs.length; i++) {
        child = new BoardTabModel(this, tabs[i]);

        if (child.active()) {
            selectedTab = child.title;
        }

        this.children.push(child);
    }

    // select last selected or default
    selectedTab = store.get('board.' + this.parent.board.address, {
        selectedTab: selectedTab
    }).selectedTab;

    this.select(selectedTab);
};

BoardTabsModel.prototype.select = function(title) {
    var children = this.children();

    for (var child, i = 0; i < children.length; i++) {
        child = children[i];

        if (typeof title !== 'string') {
            title = title.title;
        }

        child.active(child.title === title);

        if (child.active()) {
            this.selected(child);
            store.merge('board.' + this.parent.board.address, {
                selectedTab: title
            });
        }
    }
};
