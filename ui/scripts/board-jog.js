// -----------------------------------------------------------------------------
// board jog model
// -----------------------------------------------------------------------------

var JogPositionValuesModel = function(parent, values) {
    // self alias
    var self = this;

    // clone values
    for (var prop in values) {
        self[prop] = values[prop];
    }

    // set initial state
    self.parent = parent;
    self.axis   = [
        { name: 'X', value: values.X },
        { name: 'Y', value: values.Y },
        { name: 'Z', value: values.Z }
    ];
};

JogPositionValuesModel.prototype.select = function(values, event) {
    this.parent.selected(values);
};

var JogPositionModel = function(parent) {
    // self alias
    var self = this;

    // set initial state
    self.parent   = parent;
    self.board    = parent.parent.board;
    self.terminal = parent.parent.terminal;
    self.selected = ko.observable();
    self.values   = ko.observableArray();
    self.steps    = ko.observableArray([0.01, 0.1, 1, 10, 100]);
    self.step     = ko.observable(1);

    self.board.on('pos', function(event) {
        var values = event.data.values;

        for (var i = 0; i < values.length; i++) {
            values[i] = new JogPositionValuesModel(self, values[i]);
        }

        self.values(values);
        self.selected(values[0]);
        self.parent.locked(false);
    });
};

JogPositionModel.prototype.refreshPosition = function(jog, event) {
    // get positions
    this.terminal.pushCommand(['pos', 0]);
    // self.board.pos().then(function(event) {
    //     var values = event.data.values;
    //
    //     for (var i = 0; i < values.length; i++) {
    //         values[i] = new JogPositionValuesModel(self, values[i]);
    //     }
    //
    //     self.values(values);
    //     self.selected(values[0]);
    //     self.parent.locked(false);
    // })
    // .catch(function(event) {
    //     console.error('refreshPosition:', event.name, event);
    // })
    // .then(function(event) {
    //     self.parent.parent.updateState();
    // });
};

var JogModel = function(parent) {
    // set initial state
    this.parent   = parent;
    this.locked   = ko.observable(true);
    this.position = new JogPositionModel(this);
};

JogModel.prototype.unlock = function(jog, event) {
    this.position.refreshPosition();
};
