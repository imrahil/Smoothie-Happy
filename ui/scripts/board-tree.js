// -----------------------------------------------------------------------------
// board tree model
// -----------------------------------------------------------------------------

var TreeNodeModel = function(node, parent) {
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

    // node state
    self.active  = ko.observable(node.active == undefined ? false : true);
    self.visible = ko.observable(node.visible == undefined ? true : false);

    // node text
    self.text = ko.pureComputed(function() {
        var text = self.path;

        if (self.type == 'file' && self.parent.selectedFolder() != '/') {
            text = self.name;
        }

        return text.replace(/^\/sd(\/)?/, '/sd$1');
    });
};

TreeNodeModel.prototype._setIconFromName = function() {
    // default icon
    var icon = 'folder-o';

    // if file type...
    if (this.type == 'file') {
        // default icon
        icon = 'file-o';

        // get file extension
        var ext = this.name.split('.').pop();

        // get icon by extension
        if (ext == 'gcode' || ext == 'nc') {
            icon = 'file-code-o';
        }
        else if (['svg', 'dxf'].indexOf(ext) != -1) {
            icon = 'object-group';
        }
        else if (['png', 'jpeg', 'jpg', 'gif'].indexOf(ext) != -1) {
            icon = 'file-image-o';
        }
        else if (name == 'config' || name == 'config.txt') {
            icon = 'cogs';
        }
        else if (name == 'firmware.cur') {
            icon = 'leaf';
        }
    }

    // set node icon
    this.icon = 'fa fa-fw fa-' + icon;
};

TreeNodeModel.prototype.onSelect = function(selectedNode, event) {
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
    else {
        // new state
        var state = ! this.active();

        // toggle state
        this.active(state);

        // update selected
        if (state) {
            this.parent.selectedFiles.push(this);
        } else {
            this.parent.selectedFiles.remove(this);
        }
    }
};
