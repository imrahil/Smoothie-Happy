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

    self.files   = ko.observableArray();
    self.folders = ko.observableArray();

    self.selectedFiles  = ko.observableArray();
    self.selectedFolder = ko.observable('/');

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

BoardModel._getIconFromFilename = function(filename) {
    // default icon
    var icon = 'file-o';

    // file extenssion
    var ext = filename.split('.').pop();

    // get icon by extenssion
    if (ext == 'gcode' || ext == 'nc') {
        icon = 'file-code-o';
    }
    else if (['svg', 'dxf'].indexOf(ext) != -1) {
        icon = 'object-group';
    }
    else if (['png', 'jpeg', 'jpg', 'gif'].indexOf(ext) != -1) {
        icon = 'file-image-o';
    }
    else if (filename == 'config' || filename == 'config.txt') {
        icon = 'cogs';
    }
    else if (filename == 'firmware.cur') {
        icon = 'leaf';
    }

    return 'fa fa-fw fa-' + icon;
};

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
        node = nodes[i];

        // node state
        node.active = ko.observable(false);

        // on node selected
        node.onSelect = function(selectedNode, event) {
            //console.log(selectedNode, event);

            // get all parent children nodes
            var $parent   = $(event.target).parent();
            var $children = $parent.children('a');

            // update selected nodes
            if (selectedNode.type != 'file') {
                // unselect all
                var folders = self.folders();

                for (var j = 0, jl = folders.length; j < jl; j++) {
                    folders[j].active(false);
                }

                // set selected active
                selectedNode.active(true);
            }
            else {
                // toggle selected active
                selectedNode.active(! selectedNode.active());
            }
        };

        // add node in file/folder collection
        if (node.type == 'file') {
            node.icon = BoardModel._getIconFromFilename(node.name);
            tree.files.push(node);
        }
        else {
            node.icon = 'folder-o';
            tree.folders.push(node);
        }
    }

    // ...
    console.log(tree);

    // return the tree
    return tree;
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
        tree = self._makeTree(tree);
        self.folders(tree.folders);
        self.files(tree.files);
        self.waitTree(false);
        self.updateState();
    });
};

// -----------------------------------------------------------------------------

BoardModel.prototype.openUploadModal = function(board, event) {
    // self alias
    var self = this;
};

// -----------------------------------------------------------------------------

BoardModel.prototype.openRemoveFilesModal = function(board, event) {
    // self alias
    var self = this;
};
