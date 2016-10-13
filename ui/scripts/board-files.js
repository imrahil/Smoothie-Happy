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


var FilesModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent         = parent;
    self.files          = ko.observableArray();
    self.folders        = ko.observableArray();
    self.selectedFolder = ko.observable();
    self.selectedFiles  = ko.observableArray();
    self.waitTree       = ko.observable(false);
    self.waitRemove     = ko.observable(false);

    self.upload = new FilesUploadModel(self);

    self.uploadEnabled = ko.pureComputed(function() {
        return self.folders().length && self.selectedFolder() != '/';
    });

    // reset tree
    self.resetTree();
};

FilesModel.prototype.resetTree = function(tree) {
    this.selectedFiles([]);
    this.selectedFolder('/');
    tree = this._makeTree(tree || []);
    this.folders(tree.folders || []);
    this.files(tree.files || []);
    this.waitTree(false);
};

FilesModel.prototype.openUploadModal = function(board, event) {
    $('#board-files-upload-modal').modal('show');
};

FilesModel.prototype.openRemoveFilesModal = function(board, event) {
    $('#board-files-remove-modal').modal('show');
};

FilesModel.prototype.sortTree = function(tree) {
    return tree.sort(function(a, b) {
        var la = a.path.split('/').length;
        var lb = b.path.split('/').length;
        return (la < lb) ? -1 : ((la > lb) ? 1 :
            (a.path < b.path) ? -1 : ((a.path > b.path) ? 1 : 0));
    });
};

FilesModel.prototype._makeTree = function(nodes) {
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

FilesModel.prototype.refreshTree = function(board, event) {
    // self alias
    var self = this;

    // set wait tree flag
    self.waitTree(true);

    // empty tree
    var tree = [];

    // get all files or folders
    self.parent.board.lsAll('/').then(function(event) {
        tree = event.data;
    })
    .catch(function(event) {
        console.error('refreshTree:', event.name, event);
    })
    .then(function(event) {
        self.resetTree(tree);
        self.parent.updateState();
    });
};

FilesModel.prototype.unselectedFile = function(node, event) {
    node.select(false);
};

FilesModel.prototype.removeFiles = function(board, event) {
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
    self.parent.board.rm(paths).then(function(event) {
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
        self.parent.updateState();
    });
};
