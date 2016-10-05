/**
* Smoothie-Happy (UI) - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    5fbbc8f340c94a7a3ff1f87530735d75
* @date     Wed, 05 Oct 2016 13:00:09 +0000
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

    // set initial board state
    self.name                  = ko.observable(name);
    self.info                  = ko.observable(board.info);
    self.online                = ko.observable(board.online);
    self.connected             = ko.observable(board.connected);
    self.waitConnect           = ko.observable(false);
    self.waitLookup            = ko.observable(false);
    self.waitFilesTree         = ko.observable(false);
    self.filesTree             = ko.observableArray();
    self.dirsTree              = ko.observableArray();
    self.selectedDirectoryText = ko.observable();
    self.selectedDirectory     = ko.observable();
    self.uploadFileData        = ko.observable();
    self.uploadFileName        = ko.observable();
    self.uploadFileSize        = ko.observable();
    self.selectedFiles         = ko.observableArray();

    // set default directory
    self.setSelectedDirectory('/');

    // get board tooltip text
    self.uploadEnabled = ko.pureComputed(function() {
        return self.dirsTree().length && self.selectedDirectory() != '/';
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

BoardModel.prototype._makeFileNode = function(node) {
    node = {
        text: node.name || '/',
        node: node
    };

    node.tags = [
        filesize(node.node.size)
    ];

    if (node.node.type == 'file') {
        var icon = 'file-o';
        var ext  = node.text.split('.').pop();

        if (ext == 'gcode' || ext == 'nc') {
            icon = 'file-code-o';
            //node.tags.push('P'); // printable file
        }
        else if (['svg', 'dxf'].indexOf(ext) != -1) {
            icon = 'object-group';
        }
        else if (['png', 'jpeg', 'jpg', 'gif'].indexOf(ext) != -1) {
            icon = 'file-image-o';
        }
        else if (node.text == 'config' || node.text == 'config.txt') {
            icon = 'cogs';
            node.tags.push('S'); // system file
        }
        else if (node.text == 'firmware.cur') {
            icon = 'leaf';
            node.tags.push('S'); // system file
        }

        node.icon = 'fa fa-fw fa-' + icon;
    }

    node.state = { selected: !node.node.root };

    return node;
};

BoardModel.prototype._makeFilesTree = function(nodes) {
    // some variables
    var node  = null;
    var tree  = [];
    var dirs  = [];
    var files = [];

    // find a parent node...
    var findParentNode = function(s, n) {
        for (var o, i = 0, il = s.length; i < il; i++) {
            o = s[i];

            if (o.node.path == n.node.root) {
                if (! o.nodes) {
                    o.nodes = [];
                }
                return o;
            }
        }
        return null;
    }

    // first pass, normalize nodes
    for (var i = 0, il = nodes.length; i < il; i++) {
        node = nodes[i];

        tree.push(this._makeFileNode(node));

        if (node.type == 'file') {
            files.push(this._makeFileNode(node));
        }
        else {
            dirs.push(this._makeFileNode(node));
        }
    }

    // second pass, push childs into parents nodes
    function makeTree(s) {
        for (var i = s.length - 1; i >= 0; i--) {
            // current node
            node = s[i];

            // find parent node
            var parentNode = findParentNode(s, node);

            if (parentNode) {
                // extract node from tree
                node = s.splice(i, 1)[0];

                // move node to parent nodes list
                parentNode.nodes.push(node);
            }
        }

        return s;
    }

    tree = makeTree(tree);
    dirs = makeTree(dirs);

    return {
        tree : tree,
        dirs : dirs,
        files: files
    };
};

BoardModel.prototype.setSelectedDirectory = function(path) {
    this.selectedDirectory(path);

    if (path == '/') {
        path += ' (All files on the board)';
    }

    this.selectedDirectoryText(path);
};

BoardModel.prototype.sortFilesTree = function(tree) {
    return tree.sort(function(a, b) {
        return (a.text < b.text) ? -1 : ((a.text > b.text) ? 1 : 0);
    });
};

BoardModel.prototype._populateFilesTree = function(filesTree) {
    // self alias
    var self = this;

    var $tree = $('#board-files-tree');

    var updateSelectedNode = function(event, node) {
        var selectedFiles    = $tree.treeview('getSelected');
        var newFilesTree     = self.filesTree();
        var $fileTreeListist = $(event.target).find('ul');

        var scrollTop = $fileTreeListist.scrollTop();

        // update nodes state
        for (var i = 0, il = selectedFiles.length; i < il; i++) {
            for (var j = 0; j < newFilesTree.length; j++) {
                if (newFilesTree[j].node.path == selectedFiles[i].node.path) {
                    newFilesTree[j].state.selected = event.type == 'nodeSelected';
                }
            }
        }

        self.filesTree(newFilesTree);
        self.selectedFiles(selectedFiles);

        setTimeout(function() {
            $fileTreeListist.scrollTop(scrollTop);
        }, 0);
    };

    // init files tree
    $('#board-files-tree').treeview({
        data            : self.sortFilesTree(filesTree),
        showTags        : true,
        multiSelect     : true,
        onNodeSelected  : updateSelectedNode,
        onNodeUnselected: updateSelectedNode
    });
};

BoardModel.prototype.populateFilesTree = function() {
    // self alias
    var self = this;

    // get trees
    var dirsTree  = this.dirsTree();
    var filesTree = this.filesTree();

    // init dirs tree
    $('#board-dirs-tree').treeview({
        data             : dirsTree,
        levels           : 10,
        showTags         : true,
        expandIcon       : 'fa fa-chevron-right',
        collapseIcon     : 'fa fa-chevron-down',
        selectedColor    : 'inherit',
        selectedBackColor: 'inherit',
        onNodeSelected: function(event, node) {
            // update selected directory path
            self.setSelectedDirectory(node.node.path);

            // filter the files tree
            var newFilesTree = filesTree;

            if (node.node.path != '/') {
                newFilesTree = filesTree.filter(function(fileNode) {
                    return fileNode.node.root == node.node.path;
                });
            }

            // init files tree
            self._populateFilesTree(newFilesTree);
        }
    });

    // init files tree
    self._populateFilesTree(filesTree);
};

BoardModel.prototype.refreshFilesTree = function(board, event) {
    // self alias
    var self = this;

    // set we wait for files list
    self.waitFilesTree(true);

    var filesTree = null;
    var dirsTree  = null;

    // get all files or directories
    self.board.lsAll('/').then(function(event) {
        //console.info('lsAll:', event.name, event.data);
        var ft = self._makeFilesTree(event.data);
        filesTree = ft.files;
        dirsTree  = ft.dirs;
    })
    .catch(function(event) {
        //console.error('lsAll:', event.name, event);
    })
    .then(function(event) {
        self.updateState();
        self.dirsTree(dirsTree);
        self.filesTree(filesTree);
        self.waitFilesTree(false);
        self.populateFilesTree();
    });
};

BoardModel.prototype.uploadFile = function(board, event) {
    var file = event.target.files[0];

    this.uploadFileData(file);
    this.uploadFileName(file.name);
    this.uploadFileSize(filesize(file.size));
    $('#board-upload-modal').modal('show');

    event.target.value = null; // allow re-uploading same filename
};

BoardModel.prototype.sendFile = function(board, event) {
    // self alias
    var self = this;

    // close modal
    $('#board-upload-modal').modal('hide');

    // file path and data
    var file = self.uploadFileData();
    var name = self.uploadFileName();
    var path = self.selectedDirectory();

    // upload timeout
    var timeout = 0;

    // move file after upload
    var moveFileAfterUpload = path != '/sd';

    // temp name
    var tempName = moveFileAfterUpload ? '___sh_upload___.' + name : name;

    // upload the file to sd card
    self.board.upload(file, tempName, timeout).onUploadProgress(function(event) {
        console.info(self.board.address, '>> progress >>',  event.percent, '%');
    })
    .then(function(event) {
        // move the file to target path
        if (moveFileAfterUpload) {
            return self.board.mv('/sd/' + tempName, path + '/' + name, timeout);
        }

        // resolve the promise
        return Promise.resolve(event);
    });
};

BoardModel.prototype.removeFiles = function(board, event) {
    $('#board-remove-files-modal').modal('show');
};

BoardModel.prototype.deleteFiles = function() {
    // self alias
    var self = this;

    // close modal
    $('#board-remove-files-modal').modal('hide');

    // get selected files
    var selectedFiles = this.selectedFiles();

    // get files paths
    var paths = [];
    var tree  = self.filesTree();
    var $tree = $('#board-files-tree');

    for (var i = 0, il = selectedFiles.length; i < il; i++) {
        // add path to delete collection
        paths.push(selectedFiles[i].node.path);

        // disable/unselect file node
        $tree.treeview('disableNode', [ selectedFiles[i] ]);
        $tree.treeview('unselectNode', [ selectedFiles[i] ]);

        // update nodes state
        for (var j = 0, jl = tree.length; j < jl; j++) {
            if (tree[j].node.path == selectedFiles[i].node.path) {
                tree[j].state.selected = false;
                tree[j].state.disabled = true;
            }
        }
    }

    // update file tree
    self.filesTree(tree);

    // remove selected files
    self.board.rm(paths).then(function(event) {
        // remove node
        for (var i = 0, il = paths.length; i < il; i++) {
            for (var j = 0; j < tree.length; j++) {
                if (paths[i] == tree[j].node.path) {
                    tree.splice(j, 1); // remove node
                }
            }
        }

        // update file tree
        self.filesTree(tree);

        var selectedDirectory = self.selectedDirectory();

        if (selectedDirectory != '/') {
            tree = tree.filter(function(file) {
                return file.node.root == selectedDirectory;
            });
        }

        self._populateFilesTree(tree);
    })
    .catch(function(event) {
        $.notify({
            icon: 'fa fa-warning',
            message: 'An error occurred when deleting the following files : ' + paths.join(', ')
        }, { type: 'danger' });
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
        boardModel.populateFilesTree();
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
            var board = model.boards.getBoard(boardsSelected);
            model.boards.selectedBoard(board);
            board.refreshFilesTree();
        }
    });
}

})();
