/**
* Smoothie-Happy (UI) - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    516d9795bfcfe438c67579f376b4143b
* @date     Mon, 03 Oct 2016 11:22:20 +0000
* @version  0.2.0-dev
* @license  MIT
*/
(function () { 'use strict';
// -----------------------------------------------------------------------------
// store (localStorage wrapper)
// -----------------------------------------------------------------------------

var store = {
    keyPrefix: 'sh.ui.',

    prefixKey: function(key) {
        return store.keyPrefix + key;
    },

    has: function(key) {
        return !! localStorage.getItem(store.prefixKey(key));
    },

    set: function(key, value) {
        localStorage.setItem(store.prefixKey(key), JSON.stringify(value));
    },

    merge: function(key, value) {
        // get old value
        var oldValue = store.get(key, {});

        // merge and store value
        $.extend(oldValue, value);
        store.set(key, oldValue);
    },

    push: function(key, value) {
        // get old value
        var oldValue = store.get(key, []);

        // push and store value
        oldValue.push(value);
        store.set(key, oldValue);
    },

    concat: function(key, value) {
        // get old value
        var oldValue = store.get(key, []);

        // concat and store value
        store.set(key, oldValue.concat(value));
    },

    get: function(key, defaultValue) {
        // get the stored value (JSON string)
        var value = localStorage.getItem(store.prefixKey(key));

        // return parsed JSON string as object
        return value ? JSON.parse(value) : defaultValue;
    },

    remove: function(key) {
        localStorage.removeItem(store.prefixKey(key));
    },

    clear: function() {
        localStorage.clear();
    }
};

// -----------------------------------------------------------------------------
// Knockout model
// -----------------------------------------------------------------------------

var model = {};

// -----------------------------------------------------------------------------
// scanner
// -----------------------------------------------------------------------------

// create the scanner instance
var scanner = sh.network.Scanner();

// register events callbacks
scanner.on('start', function(scan) {
    model.scanner.scanning(true);
    model.scanner.progression.found(scan.found);
    model.scanner.progression.total(scan.total);
    model.scanner.progression.scanned(scan.scanned);
});

scanner.on('pause', function(scan) {
    model.scanner.paused(true);
});

scanner.on('resume', function(scan) {
    model.scanner.paused(false);
});

scanner.on('stop', function(scan) {
    model.scanner.scanning(false);
    model.scanner.paused(false);
});

scanner.on('progress', function(scan) {
    model.scanner.progression.scanned(scan.scanned);
});

scanner.on('board', function(scan, board) {
    model.scanner.progression.found(scan.found);
    model.boards.addBoard(board);
});

scanner.on('end', function(scan) {
    model.scanner.scanning(false);
    model.scanner.paused(false);
});

// -----------------------------------------------------------------------------
// scanner model
// -----------------------------------------------------------------------------

model.scanner = {
    input   : ko.observable(store.get('scanner.input')),
    scanning: ko.observable(false),
    paused  : ko.observable(false),

    progression: {
        found  : ko.observable(0),
        total  : ko.observable(0),
        scanned: ko.observable(0),
        percent: ko.pureComputed(function() {
            var p = model.scanner.progression;

            if (p.scanned() > 0) {
                return parseInt(p.scanned() / p.total() * 100);
            }

            return 0;
        })
    },

    start: function() {
        scanner.start(model.scanner.input());
        model.scanner.input(scanner.input);
        store.set('scanner.input', scanner.input);
    },

    pause: function() {
        scanner.pause();
    },

    resume: function() {
        scanner.resume();
    },

    stop: function() {
        scanner.stop();
    }
};

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

    // set initial board info
    self.name = ko.observable(name);
    self.info = ko.observable(board.info);

    // set initial board state
    self.online      = ko.observable(board.online);
    self.connected   = ko.observable(board.connected);
    self.waitConnect = ko.observable(false);
    self.waitLookup  = ko.observable(false);

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

// -----------------------------------------------------------------------------
// boards model
// -----------------------------------------------------------------------------

model.boards = {
    knownBoards      : ko.observableArray(),
    knownAddresses   : ko.observableArray(),
    autoloadAddresses: ko.observableArray(),
    selectedBoard    : ko.observable(),

    autoloadProgression: ko.pureComputed(function() {
        return model.boards.knownAddresses().length
             - model.boards.autoloadAddresses().length;
    }),

    afterRender: function(nodes) {
        $(nodes).find('input[data-toggle="tooltip"]').tooltip({
            trigger: 'focus', html: true
        });
    },

    getBoardByAdrress: function(address) {
        // get all known boards
        var boards = model.boards.knownBoards();

        // for each board
        for (var i = 0; i < boards.length; i++) {
            // board with same address found
            if (boards[i].board.address == address) {
                return boards[i];
            }
        }

        // no board found
        return null;
    },

    getBoard: function(board) {
        return model.boards.getBoardByAdrress(
            typeof board == 'string' ? board : board.address
        );
    },

    addBoard: function(board) {
        // skip already added board
        if (model.boards.getBoard(board)) {
            return null;
        }

        // add the board to the list
        model.boards.knownBoards.push(new BoardModel(board));

        // store board address for auto loading at startup
        var addresses = store.get('boards.addresses', []);

        // skip if already known
        if (addresses.indexOf(board.address) == -1) {
            store.push('boards.addresses', board.address);
        }
    },

    selectBoard: function(boardModel, event) {
        model.boards.selectedBoard(boardModel);
        store.set('boards.selected', boardModel.board.address);
    }
};

// -----------------------------------------------------------------------------
// bind Knockout model to DOM element
// -----------------------------------------------------------------------------
ko.applyBindings(model);

// -----------------------------------------------------------------------------
// autoload known boards at startup
// -----------------------------------------------------------------------------

// get the last selected board
var boardsSelected = store.get('boards.selected', null);

// get known boards addresses
var boardsAddresses = store.get('boards.addresses', []);
var boardAddress    = null;

// set the addresses autoload collection
model.boards.knownAddresses(boardsAddresses.concat([]));
model.boards.autoloadAddresses(boardsAddresses.concat([]));

// for each known address
for (var i = 0; i < boardsAddresses.length; i++) {
    // current board address
    boardAddress = boardsAddresses[i];

    // skip already added board
    if (model.boards.getBoard(boardAddress)) {
        // remove address from autoload collection
        model.boards.autoloadAddresses.remove(boardAddress);
        // go to next address
        continue;
    }

    // create the board instance
    var board = sh.Board(boardAddress);

    // try to get the board version (info)
    board.version().then(function(event) {
        return event; // online
    }).catch(function(event) {
        return event; // offline
    }).then(function(event) {
        // add the board in any case
        model.boards.addBoard(event.board);
        // remove address from autoload collection
        model.boards.autoloadAddresses.remove(event.board.address);
        // if it is the last selected board
        if (event.board.address == boardsSelected) {
            model.boards.selectedBoard(model.boards.getBoard(boardsSelected));
        }
    });
}

})();
