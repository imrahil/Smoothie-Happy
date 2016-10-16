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
    self.parent   = parent;
    self.config   = ko.observable();
    self.filename = ko.observable();
    self.items    = ko.observableArray();
    self.editMode = ko.observable('form');

    self.loading = ko.observable(false);
    self.loaded  = ko.pureComputed(function() {
        return self.items().length;
    });

    self.modified = ko.pureComputed(function() {
        return self.getModified();
    });

    self.uploading     = ko.observable(false);
    self.uploadPercent = ko.observable();

    self.source         = ko.observable();
    self.editedSource   = ko.observable();
    self.editableSource = ko.observable();

    self.editableSourceModified = ko.pureComputed(function() {
        return self.source() !== self.editedSource();
    });

    // ...
    self.txtFirst = false;

    var storeValue = store.get('board.' + self.parent.board.address, {
        config: { txtFirst: self.txtFirst }
    });

    if (storeValue && storeValue.config) {
        self.txtFirst = storeValue.config.txtFirst;
    }
};

ConfigModel.prototype.setSource = function(source) {
    this.editableSource(source);
    this.editedSource(source);
    this.source(source);
};

ConfigModel.prototype.resetEditableSource = function() {
    var source = this.config().format();
    this.editableSource('');
    this.editedSource(source);
    this.editableSource(source);
};

ConfigModel.prototype.resetSource = function() {
    this.setSource(this.config().format());
};

ConfigModel.prototype.load = function(config) {
    // set config object
    this.config(config);

    // set source
    this.setSource(config.format());

    // set filename
    this.filename(config.filename());

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

    this.resetSource();
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
    self.parent.board.config(self.txtFirst).then(function(event) {
        self.txtFirst = event.data.filename() === 'config.txt';
        store.merge('board.' + event.board.address, {
            config: { txtFirst: self.txtFirst }
        });
        self.load(event.data);
    })
    .catch(function(event) {
        console.error('refresh:', event.name, event);
        $.notify({
            icon: 'fa fa-warning',
            message: 'Unable to upload to the board at ' + self.parent.board.address + '. Please retry later.'
        }, { type: 'danger' });
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
    // self alias
    var self = this;

    // set upload flags
    self.uploading(true);
    self.uploadPercent('0%');

    // new config instance from formated source
    var filename  = self.filename();
    var source    = self.config().format();
    var newConfig = sh.BoardConfig(filename, source);

    // upload the file to sd card
    self.parent.board.upload(source, filename, 0).onUploadProgress(function(event) {
        self.uploadPercent(event.percent + '%');
    })
    .then(function(event) {
        self.load(newConfig);
        return event;
    })
    .catch(function(event) {
        console.error(event);
        return event;
    })
    .then(function(event) {
        // in any case...
        self.uploading(false);
        self.parent.updateState();
    });
};

ConfigModel.prototype.toggleEditMode = function(config, event) {
    var editMode = this.editMode();

    if (editMode === 'form') {
        this.resetSource();
    }

    this.editMode(editMode === 'raw' ? 'form' : 'raw');
};

ConfigModel.prototype.onEditableSourceChange = function(config, event) {
    this.editedSource(event.target.value);
};

ConfigModel.prototype.applySourceChange = function(config, event) {
    // create new config from source
    var filename  = this.filename();
    var source    = this.editedSource();
    var newConfig = sh.BoardConfig(filename, source);

    // find changes
    var _items, items = newConfig.getItems();

    var item, name, oldItems, newItems, oldItem, newItem;

    for (var i = 0; i < items.length; i++) {
        // current item
        item = items[i];

        // skip comments
        if (item instanceof sh.BoardConfigComments) {
            continue;
        }

        // item name
        name = item.name();

        // has old items
        oldItems = this.config().hasItems(name);

        if (! oldItems) {
            continue;
        }

        newItems = newConfig.hasItems(name);

        for (var j = 0, jl = oldItems.length; j < jl; j++) {
            newItem = newItems[j] || null;

            if (newItem) {
                oldItem                     = oldItems[j];
                newItem._initiallyDisabled  = oldItem._initiallyDisabled;
                newItem.value()._firstValue = oldItem.value()._firstValue;
            }
        }
    }

    this.load(newConfig);
    this.editMode('form');
};
