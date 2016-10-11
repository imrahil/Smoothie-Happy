// -----------------------------------------------------------------------------
// board: config model
// -----------------------------------------------------------------------------

var ConfigItemModel = function(item, parent) {
    // self alias
    var self = this;

    // set initial state
    self.data     = item;
    self.parent   = parent;
    self.isValue  = (item instanceof sh.BoardConfigItem);
    self.comments = ko.observable(item.comments().join('\n'));

    // value model
    if (self.isValue) {
        self.name      = ko.observable(item.name());
        self.value     = ko.observable(item.value());
        self._disabled = item.disabled();
        self.disabled  = ko.observable(self._disabled);

        self.modified = ko.pureComputed(function() {
            var isModified     = self.value().get() !== self.value().getFirstValue();
            var inModifiedItems = self.parent.modified.indexOf(self) !== -1;

            isModified = isModified || (self._disabled !== self.disabled());

            if (isModified && ! inModifiedItems) {
                self.parent.modified.push(self);
            }
            else if (! isModified && inModifiedItems) {
                self.parent.modified.remove(self);
            }

            return isModified;
        });
    }
};

ConfigItemModel.prototype.disable = function(toggle) {
    this.data.disabled(toggle);
    this.disabled(toggle);
};

ConfigItemModel.prototype.reset = function(item, event) {
    item.data.value().set(item.data.value().getFirstValue());
    item.value(item.data.value());
    item.disable(item._disabled);
};

ConfigItemModel.prototype.change = function(item, event) {
    item.data.value().set(event.target.value);
    item.value(item.data.value());
};

ConfigItemModel.prototype.toggle = function(item, event) {
    item.disable(! item.disabled());
};

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
