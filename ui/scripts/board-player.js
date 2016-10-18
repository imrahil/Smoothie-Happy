// -----------------------------------------------------------------------------
// board (file) player model
// -----------------------------------------------------------------------------

var PlayerModel = function(parent) {
    // set initial state
    this.parent    = parent;
    this.terminal  = parent.terminal;
    this.file      = ko.observable(null);
    this.state     = ko.observable('None');
    this.ready     = ko.observable(false);
    this.playing   = ko.observable(false);
    this.paused    = ko.observable(false);
    this.aborted   = ko.observable(false);
    this.waiting   = ko.observable(false);
    this.sending   = ko.observable(false);
    this.progress  = ko.observable(null);
    this.interval  = ko.observable(5000);
    this.startTime = ko.observable(null);
};

PlayerModel.prototype.setFile = function(file) {
    this.file(file);
};

PlayerModel.prototype.openPlayModal = function() {
    $('#board-player-play-modal').modal('show');
};

PlayerModel.prototype.closePlayModal = function() {
    $('#board-player-play-modal').modal('hide');
};

PlayerModel.prototype.watchProgression = function() {
    // this alias
    var self = this;

    // not playing file...
    if (! self.playing()) {
        return;
    }

    function hhmmss(i) {
        var d = Number(i);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        return (
            (h > 0 ? h + "h" +
            (m < 10 ? "0" : "") : "") + m + "m" +
            (s < 10 ? "0" : "") + s
        );
    }

    // push progress command
    self.terminal.pushCommand(['progress'], {
        done: function(event) {
            // get current progress data
            var data = self.progress() || {};

            // extend progress data
            data = $.extend({}, data, event.data);

            // update progress
            if (data.file) {
                self.progress({
                    percent  : data.percent + '%',
                    elapsed  : hhmmss(data.elapsed),
                    estimated: hhmmss(data.estimated)
                });

                if (! self.startTime() && data.percent < 1) {
                    self.startTime(new Date().toLocaleTimeString());
                }

                console.log('progress:', self.progress());
            }

            // debug...
            console.log('data:', data);

            // update state
            self.paused(data.paused);
            self.playing(data.playing);
            self.waiting(data.waiting);

            if (data.paused) {
                self.state('Paused');
            }
            else if (data.waiting) {
                self.state('Waiting');
            }
            else if (data.playing) {
                self.state('Playing');
            }

            self.sending(false);
        }
    });

    // timeout for next watch
    setTimeout(function() {
        self.watchProgression();
    }, self.interval());
};

PlayerModel.prototype.play = function() {
    // this alias
    var self = this;

    // reset state...
    this.sending(true);
    self.state('Play...');
    self.progress(null);
    self.playing(true);
    self.paused(false);
    self.aborted(false);
    self.ready(true);
    self.closePlayModal();
    self.startTime(null);

    // push play command in the queue
    self.terminal.pushCommand('play ' + self.file().path, {
        done: function(event) {
            self.watchProgression();
        },
        error: function(event) {
            self.playing(false);
        }
    });
};

PlayerModel.prototype.pause = function() {
    // reset state...
    this.sending(true);
    this.state('Pause...');

    // push suspend command in the queue
    this.terminal.pushCommand('suspend');
};

PlayerModel.prototype.resume = function() {
    // reset state...
    this.sending(true);
    this.state('Resume...');

    // push resume command in the queue
    this.terminal.pushCommand('resume');
};

PlayerModel.prototype.stop = function() {
    // this alias
    var self = this;

    // reset state...
    self.sending(true);
    self.state('Stop...');

    // push abort command in the queue
    self.terminal.pushCommand('abort', {
        done: function(event) {
            self.state('Stoped');
            self.playing(false);
            self.aborted(true);
            self.sending(false);
        }
    });
};

PlayerModel.prototype.close = function() {
    this.ready(false);
    this.file(null);
};
