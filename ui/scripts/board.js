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

    // console.log(nodes);
    // console.log(tree);
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

BoardModel.prototype.populateFilesTree = function() {
    // self alias
    var self = this;

    // get trees
    var dirsTree  = this.dirsTree();
    var filesTree = this.filesTree();

    // init dirs tree
    $('#board-dirs-tree').treeview({
        data          : dirsTree,
        levels        : 10,
        showTags      : true,
        expandIcon    : 'fa fa-chevron-right',
        collapseIcon  : 'fa fa-chevron-down',
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
            $('#board-files-tree').treeview({
                data    : newFilesTree,
                showTags: true
            });
        }
    });

    // init files tree
    $('#board-files-tree').treeview({
        data    : filesTree,
        showTags: true
    });
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
