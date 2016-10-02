// -----------------------------------------------------------------------------
// store (localStorage wrapper)
// -----------------------------------------------------------------------------

var store = {
    has: function(key) {
        return !! localStorage.getItem(key);
    },

    set: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
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
        var value = localStorage.getItem(key);

        // return parsed JSON string as object
        return value ? JSON.parse(value) : defaultValue;
    },

    remove: function(key) {
        localStorage.removeItem(key);
    },

    clear: function() {
        localStorage.clear();
    }
};


// -----------------------------------------------------------------------------
// scanner
// -----------------------------------------------------------------------------

// create the scanner instance
var scanner = sh.network.Scanner();

// register events callbacks
scanner.on('start', function(scan) {
    scannerModel.scanning(true);
    scannerModel.progression.found(scan.found);
    scannerModel.progression.total(scan.total);
    scannerModel.progression.scanned(scan.scanned);
});

scanner.on('pause', function(scan) {
    scannerModel.in_pause(true);
});

scanner.on('resume', function(scan) {
    scannerModel.in_pause(false);
});

scanner.on('stop', function(scan) {
    scannerModel.scanning(false);
    scannerModel.in_pause(false);
});

scanner.on('progress', function(scan) {
    scannerModel.progression.scanned(scan.scanned);
});

scanner.on('board', function(scan, board) {
    scannerModel.progression.found(scan.found);
    boardsModel.addBoard(board);
});

scanner.on('end', function(scan) {
    scannerModel.scanning(false);
    scannerModel.in_pause(false);
});

// Knockout model
var scannerModel = {
    input: ko.observable(store.get('scanner.input')),

    scanning: ko.observable(false),

    in_pause: ko.observable(false),

    start: function() {
        scanner.start(scannerModel.input());
        scannerModel.input(scanner.input);
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
    },

    progression: {
        found  : ko.observable(0),
        total  : ko.observable(0),
        scanned: ko.observable(0),
        percent: ko.pureComputed(function() {
            var p = scannerModel.progression;

            if (p.scanned() > 0) {
                return parseInt(p.scanned() / p.total() * 100);
            }

            return 0;
        })
    }
};

// jQuery object
var $scanner = $('#scanner');

// bind Knockout model to DOM element
ko.applyBindings(scannerModel, $scanner[0]);


// -----------------------------------------------------------------------------
// boards
// -----------------------------------------------------------------------------

// Knockout model
var boardsModel = {
    boards: ko.observableArray(),

    known_addresses: ko.observableArray(),

    autoload_addresses: ko.observableArray(),

    autoload_progression: ko.pureComputed(function() {
        return boardsModel.known_addresses().length
             - boardsModel.autoload_addresses().length;
    }),

    hasBoardAdrress: function(address) {
        // get all boards
        var boards = boardsModel.boards();

        // for each board
        for (var i = 0; i < boards.length; i++) {
            // board with same address found
            if (boards[i].address == address) {
                return true;
            }
        }

        // no board found
        return false;
    },

    hasBoard: function(board) {
        return boardsModel.hasBoardAdrress(board.address);
    },

    afterRender: function(nodes, model) {
        $(nodes).find('input[data-toggle="tooltip"]').tooltip({
            trigger: 'focus', html: true
        });
    },

    addBoard: function(board) {
        // skip already added board
        if (boardsModel.hasBoard(board)) {
            return null;
        }

        // get boards names (ip alias)
        var names = store.get('boards.names', {});
        var name = names[board.address] || board.address;

        // augment the board
        board.ko = {
            name: ko.observable(name),

            tooltip: ko.pureComputed(function() {
                return board.ko.name() == board.address
                    ? '- You can change this label as you want.<br />- Leave blank to restore default value.'
                    : 'Address: ' + board.address
            }),

            changeName: function(b, e) {
                // make the names object
                var names = {};

                // get new name
                var newName = board.ko.name().trim();
                    newName = newName.length ? newName : board.address;

                // assign new name
                names[board.address] = newName;

                // merge in names list
                store.merge('boards.names', names);

                // update name (if empty)
                board.ko.name(newName);

                // fix tooltip title
                $(e.target).attr({ 'data-original-title': board.ko.tooltip() });
            },

            online: ko.pureComputed(function() {
                return board.online;
            })
        };

        // add the board to the list
        boardsModel.boards.push(board);

        // store board address for auto loading at startup
        var addresses = store.get('boards.addresses', []);

        // skip if already known
        if (addresses.indexOf(board.address) == -1) {
            store.push('boards.addresses', board.address);
        }
    }
};

// jQuery object
var $boards = $('#boards');

// bind Knockout model to DOM element
ko.applyBindings(boardsModel, $boards[0]);


// -----------------------------------------------------------------------------
// autoload known boards at startup
// -----------------------------------------------------------------------------

// get known boards addresses
var boards_addresses = store.get('boards.addresses', []);
var board_address    = null;

// set the addresses autoload collection
boardsModel.known_addresses(boards_addresses.concat([]));
boardsModel.autoload_addresses(boards_addresses.concat([]));

// for each known address
for (var i = 0; i < boards_addresses.length; i++) {
    // current board address
    board_address = boards_addresses[i];

    // skip already added board
    if (boardsModel.hasBoardAdrress(board_address)) {
        // remove address from autoload collection
        boardsModel.autoload_addresses.remove(board_address);
        // go to next address
        continue;
    }

    // create the board instance
    var board = sh.Board(board_address);

    // try to get the board version (info)
    board.version().then(function(event) {
        return event; // online
    }).catch(function(event) {
        return event; // offline
    }).then(function(event) {
        // add the new board even if offline
        boardsModel.addBoard(event.board);
        // remove address from autoload collection
        boardsModel.autoload_addresses.remove(event.board.address);
    });
}
