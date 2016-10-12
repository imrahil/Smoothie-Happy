// -----------------------------------------------------------------------------
// board: config model
// -----------------------------------------------------------------------------

var ConfigItemModel = function(item, parent) {
    // self alias
    var self = this;

    // set initial state
    self.item     = item;
    self.parent   = parent;
    self.isValue  = (item instanceof sh.BoardConfigItem);
    self.comments = ko.observable(item.comments().join('\n'));

    // value model
    if (self.isValue) {
        self.name       = ko.observable(item.name());
        self.value      = ko.observable(item.value());
        self.firstValue = item.value().getFirstValue();
        self.disabled   = ko.observable(item.disabled());
        self.modified   = ko.observable(item.isModified());
    }
};

ConfigItemModel.prototype.updateState = function() {
    this.modified(this.item.isModified());
};

ConfigItemModel.prototype.disable = function(toggle) {
    this.item.disabled(toggle);
    this.disabled(toggle);
    this.updateState();
};

ConfigItemModel.prototype.resetDisabled = function() {
    this.disabled(this.item.resetDisabled());
    this.updateState();
};

ConfigItemModel.prototype.setValue = function(value) {
    this.item.value().set(value);
    this.value(this.item.value());
    this.updateState();
};

ConfigItemModel.prototype.resetValue = function() {
    this.setValue(this.item.value().getFirstValue());
};

ConfigItemModel.prototype.reset = function() {
    this.resetDisabled();
    this.resetValue();
};

ConfigItemModel.prototype.onToggle = function(item, event) {
    this.disable(! this.disabled());
};

ConfigItemModel.prototype.onChange = function(item, event) {
    this.setValue(event.target.value);
};

ConfigItemModel.prototype.onReset = function(item, event) {
    this.reset();
};

var ConfigModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent = parent;
    self.config = ko.observable();
    self.items  = ko.observableArray();

    self.loading = ko.observable(false);
    self.loaded  = ko.pureComputed(function() {
        return self.items().length;
    })

    self.modified = ko.pureComputed(function() {
        return self.getModified();
    })
};

ConfigModel.prototype.load = function(config) {
    // set config object
    this.config(config);

    // make observable items
    var configItems = config.getItems();
    var observables = [];

    for (var i = 0, il = configItems.length; i < il; i++) {
        observables.push(new ConfigItemModel(configItems[i], this));
    }

    // set new items collection
    this.items(observables);
};

ConfigModel.prototype.reset = function() {
    var items = this.items();

    for (var item, i = 0, il = items.length; i < il; i++) {
        item = items[i];
        item.isValue && item.reset();
    }
};

ConfigModel.prototype.getModified = function() {
    var item, modified = [], items = this.items();

    for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        if (item.isValue && item.modified()) {
            modified.push(item);
        }
    }

    return modified.length ? modified : null;
};

ConfigModel.prototype.refresh = function(config, event) {
    // self alias
    var self = this;

    // set loading flag
    self.loading(true);

    // get board config
    self.parent.board.config().then(function(event) {
        self.load(event.data);
    })
    .catch(function(event) {
        console.error('refresh:', event.name, event);
    })
    .then(function(event) {
        self.loading(false);
        self.parent.updateState();
    });
};

ConfigModel.prototype.openSaveModal = function(config, event) {
    $('#board-config-save-modal').modal('show');
};

ConfigModel.prototype.upload = function(config, event) {

};

/*
var ConfigModel = function(parent) {
    // set initial state
    this.parent    = parent;
    this.config    = null;
    this.filename  = ko.observable();
    this.loading   = ko.observable(false);
    this.items     = ko.observableArray();
    this.modified  = ko.observableArray();
    this.uploading = ko.observable(false);
    this.percent   = ko.observable();
    this.editMode  = ko.observable('form');

    this.source         = ko.observable();
    this.sourceBuffer   = ko.observable();
    this.sourceModified = ko.pureComputed(function() {
        return this.source() !== this.sourceBuffer();
    }, this);
};

ConfigModel.prototype.refreshSource = function(source) {
    source = source || this.config.toString();
    this.sourceBuffer(source);
    this.source(source);
};

ConfigModel.prototype.applySourceChange = function(config, event) {
    this.config.parse(this.sourceBuffer());
    this.load(this.config);
};

ConfigModel.prototype.discardSourceChange = function(config, event) {
    var source = this.source();
    this.source('');
    this.refreshSource(source);
};

ConfigModel.prototype.sourceChange = function(config, event) {
    this.sourceBuffer(event.target.innerHTML);
};

ConfigModel.prototype.load = function(config) {
    // set config object
    this.config = config;

    // set filename
    this.filename(config.filename());

    // update source
    this.refreshSource();

    // remove all items
    this.items.removeAll();

    // make observable items
    var items = config.getItems();

    for (var i = 0, il = items.length; i < il; i++) {
        this.items.push(new ConfigItemModel(items[i], this));
    }

    // reset modified
    this.modified.removeAll();
};

ConfigModel.prototype.refresh = function(config, event) {
    // self alias
    var self = this;

    // set loading flag
    self.loading(true);

    // get board config
    self.parent.board.config().then(function(event) {
        self.load(event.data);
    })
    .catch(function(event) {
        console.error('refresh:', event.name, event);
    })
    .then(function(event) {
        self.loading(false);
        self.parent.updateState();
    });
};

ConfigModel.prototype.toggleEditMode = function(config, event) {
    var form = this.editMode() == 'form';
    form && this.refreshSource();
    this.editMode(form ? 'raw' : 'form');
};

ConfigModel.prototype.upload = function(config, event) {
    // self alias
    var self = this;

    // set uploading flag
    self.uploading(true);
    self.percent('0%');

    // refresh source
    self.refreshSource();

    // reload configuration
    self.load(self.config);

    // get config as string
    var source   = self.source();
    var filename = self.filename();

    // upload the file to sd card
    self.parent.board.upload(source, filename, 0).onUploadProgress(function(event) {
        self.percent(event.percent + '%');
    })
    .catch(function(event) {
        console.error(event);
        return event;
    })
    .then(function(event) {
        // in any case...
        self.uploading(false);
    });
};

ConfigModel.prototype.openSaveModal = function(config, event) {
    $('#board-config-save-modal').modal('show');
};
*/
