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

FilesUploadModel.prototype.addFile = function(file) {
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
        node.visible(self.parent.selectedFolder() == file.root);

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
