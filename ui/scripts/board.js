// -----------------------------------------------------------------------------
// board model
// -----------------------------------------------------------------------------

var BoardModel = function(board) {
    // self alias
    var self = this;

    // sh.Board instance
    self.board = board;

    // get boards names (ip alias)
    var names = store.get('boards.names', {});
    var name  = names[board.address] || board.address;

    // set initial board state
    self.name      = ko.observable(name);
    self.info      = ko.observable(board.info);
    self.online    = ko.observable(board.online);
    self.connected = ko.observable(board.connected);

    self.waitConnect = ko.observable(false);
    self.waitLookup  = ko.observable(false);

    self.terminal = new TerminalModel(self);
    self.jog      = new JogModel(self);
    self.files    = new FilesModel(self);
    self.config   = new ConfigModel(self);

    // get board tooltip text
    self.tooltip = ko.pureComputed(function() {
        return self.name() == self.board.address
            ? '- You can change this label as you want.<br />- Leave blank to restore default value.'
            : 'Address: ' + self.board.address
    });

    // register some events callbacks
    board.on('connect', function(event) {
        self.updateInfo();
        self.updateState();
    })
    .on('disconnect', function(event) {
        if (self.connected()) {
            $.notify({
                icon: 'fa fa-warning',
                message: 'Loosed connection with ' + self.board.address + '. Reconnection in progress...'
            }, { type: 'danger' });
        }
        self.updateState();
    })
    .on('reconnectAttempt', function(event) {
        // attempts limit
        var limit = 5;

        // notify user
        $.notify({
            icon: 'fa fa-warning',
            message: 'Try to reconnect with ' + self.board.address + '. Attempts: ' + self.board.reconnectAttempts + '/' + limit
        }, { type: 'info' });

        // disconnect the board after x attempts
        if (self.board.reconnectAttempts == limit) {
            self.disconnect();
        }
    })
    .on('error', function(event) {
        //console.error('on.error:', event);
        self.updateState();
    });
};

BoardModel.prototype.changeName = function(board, event) {
    // make the names object
    var names = {};

    // get new name
    var newName = this.name().trim();
        newName = newName.length ? newName : this.board.address;

    // assign new name
    names[this.board.address] = newName;

    // merge in names list
    store.merge('boards.names', names);

    // update name (if empty)
    this.name(newName);

    // fix tooltip title
    $(event.target).attr({ 'data-original-title': this.tooltip() });
};

BoardModel.prototype.updateState = function() {
    this.connected(this.board.connected);
    this.online(this.board.online);
};

BoardModel.prototype.updateInfo = function() {
    this.info(this.board.info);
};

BoardModel.prototype.lookup = function() {
    // self alias
    var self = this;

    // set we wait for lookup
    self.waitLookup(true);

    // try to get board version
    self.board.version().then(function(event) {
        self.updateInfo();
        return event;
    })
    .catch(function(event) {
        $.notify({
            icon: 'fa fa-warning',
            message: 'Unable to reach the board at ' + self.board.address
        }, { type: 'warning' });
        return event;
    })
    .then(function(event) {
        self.updateState();
        self.waitLookup(false);
    });
};

BoardModel.prototype.connect = function() {
    // self alias
    var self = this;

    // set we wait for connection
    self.waitConnect(true);

    // try to connect to the board
    self.board.connect().then(function(event) {
        self.updateInfo();
        return event;
    })
    .catch(function(event) {
        $.notify({
            icon: 'fa fa-warning',
            message: 'Unable to connect the board at ' + self.board.address
        }, { type: 'danger' });
        return event;
    })
    .then(function(event) {
        self.updateState();
        self.waitConnect(false);
    });
};

BoardModel.prototype.disconnect = function() {
    this.connected(false);
    this.board.disconnect();
};
