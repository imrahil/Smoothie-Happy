// -----------------------------------------------------------------------------
// board: upload model
// -----------------------------------------------------------------------------

var UploadModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent = parent;
    self.queue  = ko.observableArray();

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
    this.queue.push({
        icon   : TreeNodeModel.getIconFromName(file.name),
        size   : filesize(file.size),
        name   : file.name,
        data   : file,
        path   : this.parent.selectedFolder(),
        percent: ko.observable()
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

    // all files uploaded
    if (! self.queue().length) {
        return;
    }

    // get first file in the queue
    var file = self.queue()[0];

    // move file after upload
    var move = file.path != '/sd';

    // file name
    var name = move ? '___sh_tmp___.' + file.name : file.name;

    // upload the file to sd card
    self.parent.board.upload(file.data, name, 0).onUploadProgress(function(event) {
        //console.info(self.parent.board.address, '>> progress >>',  event.percent, '%');
        file.percent(event.percent + '%');
    })
    .then(function(event) {
        // move the file to target path
        if (move) {
            return self.parent.board.mv('/sd/' + name, file.path + '/' + file.name);
        }

        // resolve the promise
        return Promise.resolve(event);
    })
    .catch(function(event) {
        return event;
    })
    .then(function(event) {
        // in any case...
        self.queue.shift();
        self._processQueue();
    });
};

UploadModel.prototype.start = function() {
    // self alias
    var self = this;

    // uploaded files
    self._processQueue();
};
