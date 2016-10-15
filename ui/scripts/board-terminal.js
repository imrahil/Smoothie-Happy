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
