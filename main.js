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

    addBoard: function(board) {
        // skip already added board
        if (boardsModel.hasBoard(board)) {
            return null;
        }

        // augment the board
        board.ko = {
            online: ko.pureComputed(function() {
                return board.online;
            })
        };

        // add the board to the list
        boardsModel.boards.push(board);

        // store board address for auto loading at startup
        var addresses = store.get('board.addresses', []);

        // skip if already known
        if (addresses.indexOf(board.address) == -1) {
            store.push('board.addresses', board.address);
        }
    }
};

// jQuery object
var $boards = $('#boards');

// bind Knockout model to DOM element
ko.applyBindings(boardsModel, $boards[0]);


// -----------------------------------------------------------------------------
// autoload boards
// -----------------------------------------------------------------------------

// get known boards addresses
var boards_addresses = store.get('board.addresses', []);

for (var i = 0; i < boards_addresses.length; i++) {
    // skip already added board
    if (boardsModel.hasBoardAdrress(boards_addresses[i])) {
        continue;
    }

    // create the board instance
    var board = sh.Board(boards_addresses[i]);

    board.version().then(function(event) {
        return event;
    }).catch(function(event) {
        return event;
    }).then(function(event) {
        // add the new board
        boardsModel.addBoard(event.board);
    });
}
