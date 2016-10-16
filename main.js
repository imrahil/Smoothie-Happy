/**
* Smoothie-Happy (UI) - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    b11d19cafdbd65105f75be20bee8f532
* @date     Sun, 16 Oct 2016 16:56:26 +0000
* @version  0.2.0-dev
* @license  MIT
*/
(function () { 'use strict';
// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

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

var BoardTabModel = function(parent, tabs) {
    // set initial state
    this.parent = parent;
    this.title  = tabs.title;
    this.icon   = 'fa-' + tabs.icon;
    this.active = ko.observable(tabs.active);
    this.id     = '#board-' + tabs.title.toLowerCase() + '-pane';
};

BoardTabModel.prototype.select = function(tabModel, event) {
    this.parent.select(tabModel);
};

var BoardTabsModel = function(parent, tabs, defaultTab) {
    // set initial state
    this.parent   = parent;
    this.selected = ko.observable();
    this.children = ko.observableArray();

    // default tab
    var selectedTab = defaultTab || tabs[0].title;

    // init tabs children
    for (var child, i = 0; i < tabs.length; i++) {
        child = new BoardTabModel(this, tabs[i]);

        if (child.active()) {
            selectedTab = child.title;
        }

        this.children.push(child);
    }

    // select last selected or default
    selectedTab = store.get('board.' + this.parent.board.address, {
        selectedTab: selectedTab
    }).selectedTab;

    this.select(selectedTab);
};

BoardTabsModel.prototype.select = function(title) {
    var children = this.children();

    for (var child, i = 0; i < children.length; i++) {
        child = children[i];

        if (typeof title !== 'string') {
            title = title.title;
        }

        child.active(child.title === title);

        if (child.active()) {
            this.selected(child);
            store.merge('board.' + this.parent.board.address, {
                selectedTab: title
            });
        }
    }
};

// -----------------------------------------------------------------------------
// board jog model
// -----------------------------------------------------------------------------

var JogPositionAxisModel = function(parent, axis) {
    // set initial state
    this.parent   = parent;
    this.jogModel = parent.parent;
    this.terminal = parent.terminal;
    this.name     = axis.name;
    this.value    = ko.observable();
    this.strValue = ko.observable();

    this.setValue(axis.value);
};

JogPositionAxisModel.prototype.setValue = function(value) {
    var position = parseFloat(value);

    if (isNaN(position)) {
        $.notify({
            icon: 'fa fa-warning',
            message: 'Invalid' + this.name + ' axis position : ' + value
        }, { type: 'danger' });
        return false;
    }

    this.value(position);
    this.strValue((position >= 0 ? '+' : '') + position.toFixed(4));

    return true;
};

JogPositionAxisModel.prototype.send = function(command) {
    this.jogModel.send(command);
};

JogPositionAxisModel.prototype.setPosition = function(value) {
    if (this.setValue(value)) {
        this.send('G92 ' + this.name + this.value());
    }
};

JogPositionAxisModel.prototype.home = function(self, event) {
    self.send('G28 ' + self.name);
};

JogPositionAxisModel.prototype.origin = function(self, event) {
    self.send('G90 G0 ' + self.name + '0');
};

JogPositionAxisModel.prototype.increment = function(self, event) {
    self.send('G91 G0 ' + self.name + self.parent.parent.step());
};

JogPositionAxisModel.prototype.decrement = function(self, event) {
    self.send('G91 G0 ' + self.name + '-' + self.parent.parent.step());
};

JogPositionAxisModel.prototype.set = function(self, event) {
    self.setPosition($(event.target).parent().parent().children('input').val());
};

JogPositionAxisModel.prototype.zero = function(self, event) {
    self.setPosition(0);
};

var JogPositionModel = function(parent, position) {
    // self alias
    var self = this;

    // clone values
    for (var prop in position) {
        self[prop] = position[prop];
    }

    // set initial state
    self.parent   = parent;
    self.terminal = parent.terminal;
    self.axis     = [
        new JogPositionAxisModel(self, { name: 'X', value: self.X }),
        new JogPositionAxisModel(self, { name: 'Y', value: self.Y }),
        new JogPositionAxisModel(self, { name: 'Z', value: self.Z })
    ];
};

var JogModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent   = parent;
    self.board    = parent.board;
    self.terminal = parent.terminal;
    self.locked   = ko.observable(true);

    self.positions        = ko.observableArray();
    self.selectedPosition = ko.observable('M114');

    // select last selected or default
    var storeValue = store.get('board.' + self.board.address);

    if (storeValue && storeValue.selectedPosition) {
        self.selectedPosition(storeValue.selectedPosition);
    }

    // resolution
    self.steps = ko.observableArray([0.01, 0.1, 1, 10, 100]);
    self.step  = ko.observable(1);

    self.resolution = function(step, event) {
        self.step(parseFloat(event.target.innerHTML));
    };

    // register board events
    self.board.on('pos', function(event) {
        self.onPosition(event.data.values);
    });
};

JogModel.prototype.onPosition = function(positions) {
    for (var i = 0; i < positions.length; i++) {
        positions[i] = new JogPositionModel(this, positions[i]);
    }

    this.positions(positions);
    this.locked(false);
};

JogModel.prototype.selectPosition = function(positionModel, event) {
    positionModel.parent.selectedPosition(positionModel.command);
    store.merge('board.' + positionModel.parent.board.address, {
        selectedPosition: positionModel.command
    });
};

JogModel.prototype.refreshPosition = function(self, event) {
    this.terminal.pushCommand(['pos', 0]);
};

JogModel.prototype.toggleLock = function(self, event) {
    this.locked(!this.locked());
};

JogModel.prototype.send = function(command) {
    var self = this;
    self.terminal.pushCommand(command, {
        allways: function(event) {
            self.refreshPosition();
        }
    });
};

JogModel.prototype.home = function(self, event) {
    self.send('G28 X Y Z');
};

JogModel.prototype.zero = function(self, event) {
    self.send('G92 X0 Y0 Z0');
};

JogModel.prototype.origin = function(self, event) {
    self.send('G90 G0 X0 Y0 Z0');
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
    self.board  = parent.parent.board;

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

    self.raw         = ko.observable();
    self.blob        = ko.observable();
    self.uploading   = ko.observable(false);
    self.downloading = ko.observable(false);

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

FileModel.prototype.download = function() {
    // self alias
    var self = this;

    if (self.downloading()) {
        return;
    }

    // command
    var settings = {
        url    : 'http://' + self.board.address + self.path,
        xhr    : { responseType: 'blob' },
        timeout: 0
    };

    // set downloading flag
    self.downloading(true);
    self.blob(null);

    // send the command (promise)
    return sh.network.get(settings).then(function(event) {
        // file as Blob object
        self.blob(event.response.raw);

        // forward event
        return event;
    })
    .catch(function(event) {
        // notify user
        $.notify({
            icon: 'fa fa-warning',
            message: 'An error occurred when downloading : ' + self.name
        }, { type: 'danger' });

        // forward event
        return event;
    })
    .then(function(event) {
        // in any case...
        self.downloading(false);

        // forward event
        return event;
    });
};

FileModel.prototype.onSelect = function(selectedNode, event) {
    // toggle state
    this.select(! this.active());
};

FileModel.prototype.onEdit = function(selectedNode, event) {
    // self alias
    var self = this;

    // stop event propagation
    event.stopPropagation();

    // download file
    selectedNode.download().then(function(event) {
        var blob = selectedNode.blob();

        if (blob) {
            var reader = new FileReader();

            reader.addEventListener("loadend", function(event) {
                selectedNode.raw(reader.result);
                self.parent.openedFile(selectedNode);
                $('#board-files-edit-modal').modal('show');
            });

            reader.readAsText(blob);
        }
    });
};

FileModel.prototype.onDownload = function(selectedNode, event) {
    // stop event propagation
    event.stopPropagation();

    // download file
    selectedNode.download().then(function(event) {
        var blob = selectedNode.blob();

        if (blob) {
            saveAs(blob, selectedNode.name);
        }
    });
};

FileModel.prototype.onSave = function(selectedNode, event) {
    var blob = new Blob([$('#openedFileContent')[0].innerText]);
    this.parent.upload.addFile(blob, selectedNode.path);
    $('#board-files-edit-modal').modal('hide');
    this.parent.openUploadModal();
};

var FilesModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent         = parent;
    self.board          = parent.board;
    self.terminal       = parent.terminal;
    self.files          = ko.observableArray();
    self.folders        = ko.observableArray();
    self.selectedFolder = ko.observable();
    self.selectedFiles  = ko.observableArray();
    self.waitTree       = ko.observable(false);
    self.waitRemove     = ko.observable(false);
    self.openedFile     = ko.observable();

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

    this.terminal.pushCommand(['lsAll', '/', 0], {
        done: function(event) {
            tree = event.data;
        },
        error: function(event) {
            console.error('refreshTree:', event.name, event);
        },
        allways: function(event) {
            self.resetTree(tree);
            self.parent.updateState();
        }
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

// -----------------------------------------------------------------------------
// board: upload model
// -----------------------------------------------------------------------------

var FilesUploadModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent    = parent;
    self.board     = parent.parent.board;
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

FilesUploadModel.prototype.addFile = function(file, path) {
    var root = '/sd';

    if (path) {
        root      = path.split('/');
        file.name = root.pop();
        root      = root.join('/');
    }
    else {
        root = this.parent.selectedFolder();
    }

    path = root + '/' + file.name;

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

FilesUploadModel.prototype.addFiles = function(files) {
    for (var i = 0; i < files.length; i++) {
        this.addFile(files[i]);
    };
};

FilesUploadModel.prototype._processQueue = function() {
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
    self.board.upload(file.data, name, 0).onUploadProgress(function(event) {
        //console.info(self.board.address, '>> progress >>',  event.percent, '%');
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
        var cwd = self.parent.selectedFolder();
        node.visible(cwd == '/' || cwd == file.root);

        // move the file ?
        if (move) {
            // overwrite ?
            if (node.exists) {
                // remove target file
                return self.board.rm(file.path).then(function(event) {
                    // then move the file to target
                    return self.board.mv('/sd/' + name, file.path);
                });
            }

            // move the file to target root
            return self.board.mv('/sd/' + name, file.path);
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
        self.parent.parent.updateState();
    });
};

FilesUploadModel.prototype.start = function() {
    // set uploading flag
    this.uploading(true);

    // uploaded files
    this._processQueue();
};

FilesUploadModel.prototype.abort = function() {
    // unset uploading flag
    this.uploading(false);
};

// -----------------------------------------------------------------------------
// board terminal model
// -----------------------------------------------------------------------------

var TerminalMessageModel = function(type, message) {
    this.type    = type;
    this.message = message;
    this.style   = 'default';
    this.icon    = 'comment-o';

    // icon/style from type
    if (type == 'input') {
        this.icon = 'sign-in';
    }
    else if (type == 'output') {
        this.style = 'highlight';
        this.icon  = 'sign-out fa-rotate-180';
    }
    else if (type == 'info') {
        this.style = 'info';
        this.icon  = 'info-circle';
    }
    else if (type == 'warning') {
        this.style = 'warning';
        this.icon  = 'exclamation-circle';
    }
    else if (type == 'error') {
        this.style = 'danger';
        this.icon  = 'exclamation-triangle';
    }
    else if (type == 'success') {
        this.style = 'success';
        this.icon  = 'thumbs-o-up';
    }

    this.style = 'list-group-item-' + this.style;
    this.icon  = 'fa fa-fw fa-' + this.icon;
};

var TerminalModel = function(parent) {
    // self alias
    var self = this;

    // set parent model
    self.parent       = parent;
    self.board        = parent.board;
    self.autoscroll   = ko.observable(true);
    self.messages     = ko.observableArray();
    self.commands     = ko.observableArray();
    self.waitResponse = ko.observable(false);

    self.emptyQueue = ko.computed(function() {
        return ! self.commands().length;
    });

    self.board.on('command', function(event) {
        self.pushMessage('output', event.data);
    })
    .on('response', function(event) {
        var message = event.originalEvent.response.raw.replace(/\n/g, '<br />');
        self.pushMessage('input', message);
    })
    .on('error', function(event) {
        self.pushMessage('error', event.data);
    });
};

TerminalModel.prototype.pushMessage = function(type, message) {
    this.messages.push(new TerminalMessageModel(type, message));

    if (this.autoscroll()) {
        var messages = $('#terminal-messages')[0];
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }
};

TerminalModel.prototype._processCommands = function() {
    // self alias
    var self = this;

    // waiting response...
    if (self.waitResponse()) {
        return;
    }

    // commands queue empty
    if (! self.commands().length) {
        self.waitResponse(false);
        return;
    }

    // set waiting response flag
    self.waitResponse(true);

    // get oldest command
    var options = self.commands()[0];
    var command = options.command;

    if (typeof command !== 'string') {
        var name = command.shift();
        command = self.board[name].apply(self.board, command);
    }
    else {
        command = self.board.command(command, 0);
    }

    // send the command
    command.then(function(event) {
        if (options.done) {
            options.done(event);
        }
        return event;
    })
    .catch(function(event) {
        if (options.error) {
            options.error(event);
        }
        else {
            console.error(event);
        }
        return event;
    })
    .then(function(event) {
        // in any case...
        if (options.allways) {
            options.allways(event);
        }
        self.commands.shift();
        self.waitResponse(false);
        self._processCommands();
        self.parent.updateState();
    });
};

TerminalModel.prototype.pushCommand = function(command, options) {
    options = options || {};
    options.command = command;
    this.commands.push(options);
    this._processCommands();
};

TerminalModel.prototype.send = function(terminal, event) {
    // get command
    var $input  = $('#terminal-command-input');
    var command = $input.val().trim();

    if (! command.length) {
        return;
    }

    // reset input value
    $input.val('');

    // add command
    this.pushCommand(command);
};

TerminalModel.prototype.clear = function(terminal, event) {
    this.messages.removeAll();
};

TerminalModel.prototype.toggleAutoscroll = function(terminal, event) {
    this.autoscroll(! this.autoscroll());
};

TerminalModel.prototype.clearQueue = function(terminal, event) {
    this.commands.removeAll();
};

// -----------------------------------------------------------------------------
// board: config model
// -----------------------------------------------------------------------------

var ConfigItemModel = function(item, parent) {
    // self alias
    var self = this;

    // set initial state
    self.item     = item;
    self.parent   = parent;
    self.isValue  = (item instanceof sh.BoardConfigItem);
    self.comments = ko.observable(item.comments().join('\n'));

    // value model
    if (self.isValue) {
        self.name       = ko.observable(item.name());
        self.value      = ko.observable(item.value());
        self.firstValue = item.value().getFirstValue();
        self.disabled   = ko.observable(item.disabled());
        self.modified   = ko.observable(item.isModified());
    }
};

ConfigItemModel.prototype.updateState = function() {
    this.modified(this.item.isModified());
};

ConfigItemModel.prototype.disable = function(toggle) {
    this.item.disabled(toggle);
    this.disabled(toggle);
    this.updateState();
};

ConfigItemModel.prototype.resetDisabled = function() {
    this.disabled(this.item.resetDisabled());
    this.updateState();
};

ConfigItemModel.prototype.setValue = function(value) {
    this.item.value().set(value);
    this.value(this.item.value());
    this.updateState();
};

ConfigItemModel.prototype.resetValue = function() {
    this.setValue(this.item.value().getFirstValue());
};

ConfigItemModel.prototype.reset = function() {
    this.resetDisabled();
    this.resetValue();
};

ConfigItemModel.prototype.onToggle = function(item, event) {
    this.disable(! this.disabled());
};

ConfigItemModel.prototype.onChange = function(item, event) {
    this.setValue(event.target.value);
};

ConfigItemModel.prototype.onReset = function(item, event) {
    this.reset();
};

var ConfigModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent   = parent;
    self.config   = ko.observable();
    self.filename = ko.observable();
    self.items    = ko.observableArray();
    self.editMode = ko.observable('form');

    self.loading = ko.observable(false);
    self.loaded  = ko.pureComputed(function() {
        return self.items().length;
    });

    self.modified = ko.pureComputed(function() {
        return self.getModified();
    });

    self.uploading     = ko.observable(false);
    self.uploadPercent = ko.observable();

    self.source         = ko.observable();
    self.editedSource   = ko.observable();
    self.editableSource = ko.observable();

    self.editableSourceModified = ko.pureComputed(function() {
        return self.source() !== self.editedSource();
    });

    // ...
    self.txtFirst = false;

    var storeValue = store.get('board.' + self.parent.board.address, {
        config: { txtFirst: self.txtFirst }
    });

    if (storeValue && storeValue.config) {
        self.txtFirst = storeValue.config.txtFirst;
    }
};

ConfigModel.prototype.setSource = function(source) {
    this.editableSource(source);
    this.editedSource(source);
    this.source(source);
};

ConfigModel.prototype.resetEditableSource = function() {
    var source = this.config().format();
    this.editableSource('');
    this.editedSource(source);
    this.editableSource(source);
};

ConfigModel.prototype.resetSource = function() {
    this.setSource(this.config().format());
};

ConfigModel.prototype.load = function(config) {
    // set config object
    this.config(config);

    // set source
    this.setSource(config.format());

    // set filename
    this.filename(config.filename());

    // make observable items
    var configItems = config.getItems();
    var observables = [];

    for (var i = 0, il = configItems.length; i < il; i++) {
        observables.push(new ConfigItemModel(configItems[i], this));
    }

    // set new items collection
    this.items(observables);
};

ConfigModel.prototype.reset = function() {
    var items = this.items();

    for (var item, i = 0, il = items.length; i < il; i++) {
        item = items[i];
        item.isValue && item.reset();
    }

    this.resetSource();
};

ConfigModel.prototype.getModified = function() {
    var item, modified = [], items = this.items();

    for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        if (item.isValue && item.modified()) {
            modified.push(item);
        }
    }

    return modified.length ? modified : null;
};

ConfigModel.prototype.refresh = function(config, event) {
    // self alias
    var self = this;

    // set loading flag
    self.loading(true);

    // get board config
    self.parent.board.config(self.txtFirst).then(function(event) {
        self.txtFirst = event.data.filename() === 'config.txt';
        store.merge('board.' + event.board.address, {
            config: { txtFirst: self.txtFirst }
        });
        self.load(event.data);
    })
    .catch(function(event) {
        console.error('refresh:', event.name, event);
        $.notify({
            icon: 'fa fa-warning',
            message: 'Unable to upload to the board at ' + self.parent.board.address + '. Please retry later.'
        }, { type: 'danger' });
    })
    .then(function(event) {
        self.loading(false);
        self.parent.updateState();
    });
};

ConfigModel.prototype.openSaveModal = function(config, event) {
    $('#board-config-save-modal').modal('show');
};

ConfigModel.prototype.upload = function(config, event) {
    // self alias
    var self = this;

    // set upload flags
    self.uploading(true);
    self.uploadPercent('0%');

    // new config instance from formated source
    var filename  = self.filename();
    var source    = self.config().format();
    var newConfig = sh.BoardConfig(filename, source);

    // upload the file to sd card
    self.parent.board.upload(source, filename, 0).onUploadProgress(function(event) {
        self.uploadPercent(event.percent + '%');
    })
    .then(function(event) {
        self.load(newConfig);
        return event;
    })
    .catch(function(event) {
        console.error(event);
        return event;
    })
    .then(function(event) {
        // in any case...
        self.uploading(false);
        self.parent.updateState();
    });
};

ConfigModel.prototype.toggleEditMode = function(config, event) {
    var editMode = this.editMode();

    if (editMode === 'form') {
        this.resetSource();
    }

    this.editMode(editMode === 'raw' ? 'form' : 'raw');
};

ConfigModel.prototype.onEditableSourceChange = function(config, event) {
    this.editedSource(event.target.value);
};

ConfigModel.prototype.applySourceChange = function(config, event) {
    // create new config from source
    var filename  = this.filename();
    var source    = this.editedSource();
    var newConfig = sh.BoardConfig(filename, source);

    // find changes
    var _items, items = newConfig.getItems();

    var item, name, oldItems, newItems, oldItem, newItem;

    for (var i = 0; i < items.length; i++) {
        // current item
        item = items[i];

        // skip comments
        if (item instanceof sh.BoardConfigComments) {
            continue;
        }

        // item name
        name = item.name();

        // has old items
        oldItems = this.config().hasItems(name);

        if (! oldItems) {
            continue;
        }

        newItems = newConfig.hasItems(name);

        for (var j = 0, jl = oldItems.length; j < jl; j++) {
            newItem = newItems[j] || null;

            if (newItem) {
                oldItem                     = oldItems[j];
                newItem._initiallyDisabled  = oldItem._initiallyDisabled;
                newItem.value()._firstValue = oldItem.value()._firstValue;
            }
        }
    }

    this.load(newConfig);
    this.editMode('form');
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

    self.tabs = new BoardTabsModel(self, [
        { title: 'Jog'     , icon: 'arrows-alt' , active: true  },
        { title: 'Files'   , icon: 'folder-open', active: false },
        { title: 'Terminal', icon: 'terminal'   , active: false },
        { title: 'Config'  , icon: 'config'     , active: false },
        { title: 'Info'    , icon: 'info'       , active: false }
    ], 'Jog');

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

// -----------------------------------------------------------------------------
// boards model
// -----------------------------------------------------------------------------

model.boards = {
    knownBoards      : ko.observableArray(),
    knownAddresses   : ko.observableArray(),
    autoloadAddresses: ko.observableArray(),
    selectedBoard    : ko.observable(),
    fullScreen       : ko.observable(store.get('fullScreen', false)),

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
    },

    toggleFullScreen: function(boardModel, event) {
        var fullScreen = ! boardModel.fullScreen();
        store.set('fullScreen', fullScreen);
        boardModel.fullScreen(fullScreen);
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
            //board.refreshTree();
        }
    });
}

})();
