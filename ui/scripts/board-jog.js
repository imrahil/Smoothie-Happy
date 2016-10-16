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
