/**
* Smoothie-Happy (UI) - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    428b6b01efb72b86655470c8cc17ebad
* @date     Sun, 09 Oct 2016 10:30:20 +0000
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
// board tree model
// -----------------------------------------------------------------------------

var FileModel = function(node, parent) {
    // self alias
    var self = this;

    // copy node properties
    for (var prop in node) {
        self[prop] = node[prop];
    }

    // set parent model
    self.parent = parent;

    // set parents paths
    self.parents = self.root ? self.root.split('/') : [];
    self.parents = self.parents.filter(function(p) { return p.length; });

    // set node icon
    self._setIconFromName();

    // human readable file size
    self.size = filesize(node.size);

    // node state
    self.active  = ko.observable(node.active == undefined ? false : true);
    self.visible = ko.observable(node.visible == undefined ? true : false);
    self.enabled = ko.observable(node.enabled == undefined ? true : false);

    // node text
    self.text = ko.pureComputed(function() {
        var text = self.path;

        if (self.type == 'file' && self.parent.selectedFolder() != '/') {
            text = self.name;
        }

        return text.replace(/^\/sd(\/)?/, '/sd$1');
    });
};

FileModel.getIconFromName = function(name) {
    // default icon
    var icon = 'file-o';

    // get file extension
    var ext = name.split('.').pop().toLowerCase();

    // get icon by extension
    if (ext == 'gcode' || ext == 'nc') {
        icon = 'file-code-o';
    }
    else if (ext == 'pdf') {
        icon = 'file-pdf-o';
    }
    else if (['svg', 'dxf'].indexOf(ext) != -1) {
        icon = 'object-group';
    }
    else if (['png', 'jpeg', 'jpg', 'gif'].indexOf(ext) != -1) {
        icon = 'file-image-o';
    }
    else if (['zip', 'tar', 'gz', 'tar.gz', '7z'].indexOf(ext) != -1) {
        icon = 'file-archive-o';
    }
    else if (name == 'config' || name == 'config.txt' || ext == 'ini') {
        icon = 'cogs';
    }
    else if (name == 'firmware.cur') {
        icon = 'leaf';
    }

    // return icon class
    return 'fa fa-fw fa-' + icon;
};

FileModel.prototype._setIconFromName = function() {
    this.icon = this.type == 'file'
        ? FileModel.getIconFromName(this.name)
        : 'fa fa-fw fa-folder-o';
};

FileModel.prototype.select = function(selected) {
    // update selected nodes
    if (this.type != 'file') {
        // current selected folder
        var selectedFolder = this.parent.selectedFolder();

        // already selected
        if (selectedFolder == this.path) {
            return;
        }

        // set new selected folder
        this.parent.selectedFolder(this.path);

        // unselect all
        var folders = this.parent.folders();

        for (var j = 0, jl = folders.length; j < jl; j++) {
            folders[j].active(false);
        }

        // set selected active
        this.active(true);

        // filter files tree
        var lsAll = this.path == '/';
        var files = this.parent.files();

        for (var j = 0, jl = files.length; j < jl; j++) {
            files[j].visible(lsAll || files[j].root == this.path);
        }
    }
    else if (! this.enabled()) {
        return;
    }
    else {
        // new state
        this.active(selected);

        // update selected
        if (selected) {
            this.parent.selectedFiles.push(this);
        } else {
            this.parent.selectedFiles.remove(this);
        }
    }
};

FileModel.prototype.onSelect = function(selectedNode, event) {
    // toggle state
    this.select(! this.active());
};

// -----------------------------------------------------------------------------
// board: upload model
// -----------------------------------------------------------------------------

var UploadModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent    = parent;
    self.queue     = ko.observableArray();
    self.uploading = ko.observable(false);

    // remove item
    self.removeFile = function(file) {
        self.queue.remove(file);
    };

    // remove item
    self.onAddFiles = function(self, event) {
        self.addFiles(event.target.files);
    };
};

UploadModel.prototype.addFile = function(file) {
    var root = this.parent.selectedFolder();
    var path = root + '/' + file.name;

    // test if file exists
    var exists = false;
    var files  = this.parent.files();

    for (var i = 0, il = files.length; i < il; i++) {
        if (files[i].path == path) {
            exists = true;
            break;
        }
    }

    this.queue.push({
        icon   : FileModel.getIconFromName(file.name),
        size   : filesize(file.size),
        name   : file.name,
        data   : file,
        root   : root,
        path   : path,
        percent: ko.observable(),
        type   : 'file',
        exists : exists
    });
};

UploadModel.prototype.addFiles = function(files) {
    for (var i = 0; i < files.length; i++) {
        this.addFile(files[i]);
    };
};

UploadModel.prototype._processQueue = function() {
    // self alias
    var self = this;

    // upload aborted or files queue empty
    if (! self.uploading() || ! self.queue().length) {
        self.uploading(false);
        return;
    }

    // get first file in the queue
    var file = self.queue()[0];

    // move file after upload
    var move = file.root != '/sd';

    // file name
    var name = move ? '___sh_tmp___.' + file.name : file.name;

    // upload the file to sd card
    self.parent.board.upload(file.data, name, 0).onUploadProgress(function(event) {
        //console.info(self.parent.board.address, '>> progress >>',  event.percent, '%');
        file.percent(event.percent + '%');
    })
    .then(function(event) {
        // create node
        file.size = file.data.size;
        var node  = new FileModel(file, self.parent);

        // replace old file if exists
        var files    = self.parent.files();
        var replaced = false;

        for (var i = 0; i < files.length; i++) {
            if (files[i].path == file.path) {
                if (files[i].active()) {
                    self.parent.selectedFiles.remove(files[i]);
                    self.parent.selectedFiles.push(node);
                    node.active(true);
                }

                self.parent.files.splice(i, 1, node);
                replaced = true;
                break;
            }
        }

        // add node to files list
        if (! replaced) {
            self.parent.files.push(node);
            self.parent.files.sort(function(a, b) {
                return a.path < b.path ? -1 : (a.path > b.path ? 1 : 0);
            });
        }

        // set node visibility
        node.visible(self.parent.selectedFolder() == file.root);

        // move the file ?
        if (move) {
            // overwrite ?
            if (node.exists) {
                // remove target file
                return self.parent.board.rm(file.path).then(function(event) {
                    // then move the file to target
                    return self.parent.board.mv('/sd/' + name, file.path);
                });
            }

            // move the file to target root
            return self.parent.board.mv('/sd/' + name, file.path);
        }

        // resolve the promise
        return Promise.resolve(event);
    })
    .catch(function(event) {
        console.error(event);
        return event;
    })
    .then(function(event) {
        // in any case...
        self.queue.shift();
        self._processQueue();
    });
};

UploadModel.prototype.start = function() {
    // set uploading flag
    this.uploading(true);

    // uploaded files
    this._processQueue();
};

UploadModel.prototype.abort = function() {
    // unset uploading flag
    this.uploading(false);
};

// -----------------------------------------------------------------------------
// board config model
// -----------------------------------------------------------------------------

var ConfigModel = function(parent) {
    // self alias
    var self = this;

    // set parent model
    self.parent = parent;
};

ConfigModel.get = function(key) {

};

ConfigModel.set = function(key, value) {

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

    // set initial board state
    self.name      = ko.observable(name);
    self.info      = ko.observable(board.info);
    self.online    = ko.observable(board.online);
    self.connected = ko.observable(board.connected);

    self.waitConnect = ko.observable(false);
    self.waitLookup  = ko.observable(false);
    self.waitTree    = ko.observable(false);
    self.waitRemove  = ko.observable(false);

    self.files   = ko.observableArray();
    self.folders = ko.observableArray();

    self.selectedFolder = ko.observable();
    self.selectedFiles  = ko.observableArray();

    self.upload = new UploadModel(self);
    self.config = new ConfigModel(self);

    // get board tooltip text
    self.uploadEnabled = ko.pureComputed(function() {
        return self.folders().length && self.selectedFolder() != '/';
    });

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

    // reset tree
    self.resetTree();
};

// -----------------------------------------------------------------------------

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

BoardModel.prototype.sortTree = function(tree) {
    return tree.sort(function(a, b) {
        var la = a.path.split('/').length;
        var lb = b.path.split('/').length;
        return (la < lb) ? -1 : ((la > lb) ? 1 :
            (a.path < b.path) ? -1 : ((a.path > b.path) ? 1 : 0));
    });
};

BoardModel.prototype._makeTree = function(nodes) {
    // self alias
    var self = this;

    // empty tree
    var tree = { files  : [], folders: [] };

    // sort nodes
    nodes = self.sortTree(nodes);

    // first pass, normalize nodes
    for (var node, i = 0, il = nodes.length; i < il; i++) {
        // current node
        node = new FileModel(nodes[i], self);

        // node state
        node.active(self.selectedFolder() == node.path);

        // add node in file/folder collection
        if (node.type == 'file') {
            tree.files.push(node);
        }
        else {
            tree.folders.push(node);
        }
    }

    // return the tree
    return tree;
};

BoardModel.prototype.resetTree = function(tree) {
    this.selectedFiles([]);
    this.selectedFolder('/');
    tree = this._makeTree(tree || []);
    this.folders(tree.folders || []);
    this.files(tree.files || []);
    this.waitTree(false);
};

BoardModel.prototype.refreshTree = function(board, event) {
    // self alias
    var self = this;

    // set wait tree flag
    self.waitTree(true);

    // empty tree
    var tree = [];

    // get all files or folders
    self.board.lsAll('/').then(function(event) {
        tree = event.data;
    })
    .catch(function(event) {
        console.error('refreshTree:', event.name, event);
    })
    .then(function(event) {
        self.resetTree(tree);
        self.updateState();
    });
};

// -----------------------------------------------------------------------------

BoardModel.prototype.openUploadModal = function(board, event) {
    $('#board-files-upload-modal').modal('show');
};

BoardModel.prototype.openRemoveFilesModal = function(board, event) {
    $('#board-files-remove-modal').modal('show');
};

// -----------------------------------------------------------------------------

BoardModel.prototype.unselectedFile = function(node, event) {
    node.select(false);
};

BoardModel.prototype.removeFiles = function(board, event) {
    // self alias
    var self = this;

    // skip if already in remove
    if (self.waitRemove()) {
        return;
    }

    // set wait remove flag
    self.waitRemove(true);

    // get selected files
    var files = [].concat(self.selectedFiles());

    // get files paths
    var paths = [];

    for (var file, i = 0, il = files.length; i < il; i++) {
        // current file
        file = files[i];

        // disable node
        file.enabled(false);

        // add path to delete collection
        paths.push(file.path);
    }

    // remove selected files
    self.board.rm(paths).then(function(event) {
        // get all files
        var files = self.files();

        // remove file nodes
        for (var i = 0, il = paths.length; i < il; i++) {
            for (var file, j = 0; j < files.length; j++) {
                file = files[j];

                if (paths[i] == file.path) {
                    self.files.remove(file);
                    self.selectedFiles.remove(file);
                }
            }
        }
    })
    .catch(function(event) {
        $.notify({
            icon: 'fa fa-warning',
            message: 'An error occurred when deleting the following files : ' + paths.join(', ')
        }, { type: 'danger' });

        return event;
    })
    .then(function(event) {
        // set wait remove flag
        self.waitRemove(false);
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
        store.set('boards.selected', boardModel.board.address);
        model.boards.selectedBoard(boardModel);
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
            var board = model.boards.getBoard(boardsSelected);
            model.boards.selectedBoard(board);
            board.refreshTree();
        }
    });
}

})();
