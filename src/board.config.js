(function () {
    'use strict';

    /**
    * Handle an configuration value.
    *
    * @class
    *
    * @param {String} value The value as string.
    */
    sh.BoardConfigValue = function(value) {
        // instance factory
        if (! (this instanceof sh.BoardConfigValue)) {
            return new sh.BoardConfigValue(value);
        }

        /**
        * @property {String}
        * @protected
        */
        this._lastValue = null;

        /**
        * @property {String}
        * @protected
        */
        this._currentValue = null;

        this.set(value);

        /**
        * @property {String}
        * @protected
        */
        this._firstValue = this._currentValue;
    };

    /**
    * Set new value.
    *
    * @method
    *
    * @param {String} value The new value.
    *
    * @return {String} The old value.
    */
    sh.BoardConfigValue.prototype.set = function(value) {
        if (typeof value != 'string') {
            throw new Error('The value must be a string.');
        }

        value = value.trim();

        this._lastValue    = this._currentValue || value;
        this._currentValue = value;

        return this._lastValue;
    };

    /**
    * Set value from first value.
    *
    * @method
    * @return {String} The old value.
    */
    sh.BoardConfigValue.prototype.setFromFirstValue = function() {
        return this.set(this._firstValue);
    };

    /**
    * Set value from last value.
    *
    * @method
    * @return {String} The old value.
    */
    sh.BoardConfigValue.prototype.setFromLastValue = function() {
        return this.set(this._lastValue);
    };

    /**
    * Get current value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.get = function() {
        return this._currentValue;
    };

    /**
    * Get first value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.getFirstValue = function() {
        return this._firstValue;
    };

    /**
    * Get last value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.getLastValue = function() {
        return this._lastValue;
    };

    /**
    * Get current value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.toString = function() {
        return this.get();
    };

    /**
    * Get current value as integer.
    *
    * @method
    * @return {Integer}
    */
    sh.BoardConfigValue.prototype.toInteger = function() {
        return parseInt(this._currentValue);
    };

    /**
    * Get current value as float.
    *
    * @method
    * @return {Float}
    */
    sh.BoardConfigValue.prototype.toFloat = function(decimals) {
        var floatValue = parseFloat(this._currentValue);

        if (decimals === undefined) {
            return floatValue;
        }

        return Number(floatValue.toFixed(decimals));
    };

    /**
    * Handle an configuration item.
    *
    * @class
    *
    * @param {String} [comments] Comments as string.
    */
    sh.BoardConfigComments = function(comments) {
        // instance factory
        if (! (this instanceof sh.BoardConfigComments)) {
            return new sh.BoardConfigComments(comments);
        }

        /**
        * @property {Array[String]}
        * @protected
        */
        this._comments = [];

        this.comments(comments || '');
    };

    /**
    * Get/Set/Append comments.
    *
    * @method
    *
    * @param {String}  [comments]     Comments as string.
    * @param {Boolean} [append=false] If true append the comments.
    *
    * @return {Array}
    */
    sh.BoardConfigComments.prototype.comments = function(comments, append) {
        if (comments === undefined) {
            return this._comments;
        }

        if (typeof comments != 'string') {
            throw new Error('The comments must be a string.');
        }

        if (! append) {
            this._comments = [];
        }

        var lines = comments.trim().split('\n');

        return this._comments = this._comments.concat(lines);
    };

    /**
    * Handle an configuration item.
    *
    * @class
    *
    * @param {Object}  settings                  Item settings.
    * @param {String}  settings.name             Item name.
    * @param {String}  settings.value            Item value.
    * @param {String}  [settings.comments]       Item comments.
    * @param {Boolean} [settings.disabled=false] Item state.
    */
    sh.BoardConfigItem = function(settings) {
        // instance factory
        if (! (this instanceof sh.BoardConfigItem)) {
            return new sh.BoardConfigItem(settings);
        }

        /**
        * @property {String}
        * @protected
        */
        this._name = '';

        this.name(settings.name);

        /**
        * @property {sh.BoardConfigValue}
        * @protected
        */
        this._value = null;

        this.value(settings.value);

        /**
        * @property {sh.BoardConfigComments}
        * @protected
        */
        this._comments = sh.BoardConfigComments(settings.comments);

        /**
        * @property {Boolean}
        * @protected
        */
        this._disabled = false;

        this.disabled(settings.disabled);
    };

    /**
    * Get/Set the item name.
    *
    * @method
    *
    * @param {Boolean} [name] If provided set new name.
    *
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.name = function(name) {
        if (name === undefined) {
            return this._name;
        }

        if (typeof name != 'string') {
            throw new Error('The name must be a string.');
        }

        return this._name = name.trim();
    };

    /**
    * Get/Set the item value.
    *
    * This method reload the item object when a new value is set,
    * if you want to keep the value state, use `value().set(newValue)`.
    *
    * @method
    *
    * @param {String} [value] If provided reload item value.
    *
    * @return {sh.BoardConfigValue}
    */
    sh.BoardConfigItem.prototype.value = function(value) {
        if (value === undefined) {
            return this._value;
        }

        return this._value = sh.BoardConfigValue(value);
    };

    /**
    * Get/Set/Append comments.
    *
    * @method
    *
    * @param {String}  [comments]     Comments as string.
    * @param {Boolean} [append=false] If true append the comments.
    *
    * @return {Array}
    */
    sh.BoardConfigItem.prototype.comments = function(comments, append) {
        return this._comments.comments(comments, append);
    };

    /**
    * Enable/Disable item.
    *
    * @method
    *
    * @param {Boolean} [state] If provided set new state.
    *
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.disabled = function(state) {
        if (state === undefined) {
            return this._disabled;
        }

        return this._disabled = !!state;
    };

    /**
    * Handle the board configuration.
    *
    * @class
    *
    * @param {String} [filename='config'] Configuration filename.
    * @param {String} [source]            Raw configuration as string.
    */
    sh.BoardConfig = function(filename, source) {
        // instance factory
        if (! (this instanceof sh.BoardConfig)) {
            return new sh.BoardConfig(filename, source);
        }

        /**
        * @property {String}
        * @readonly
        */
        this._filename = filename || 'config';

        /**
        * @property {String}
        * @readonly
        */
        this._source = source || null;

        /**
        * @property {Array}
        * @readonly
        */
        this._items = null;

        /**
        * @property {Boolean}
        * @readonly
        */
        this._loaded = false;

        // parse the source
        if (source) {
            this.parse(source);
        }
    };

    /**
    * Get the filename.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfig.prototype.filename = function() {
        return this._filename;
    };

    /**
    * Get all items as array (with sections comments).
    *
    * @method
    * @return {Array|null}
    * @throws {Error}
    */
    sh.BoardConfig.prototype.getItems = function() {
        if (! this._loaded) {
            throw new Error('No configuration loaded.');
        }

        return this._items;
    };

    /**
    * Return an config item if exists.
    *
    * @method
    *
    * @param {String|sh.BoardConfigItem} key            Configuration key.
    * @param {Mixed}                     [defaultValue] Default value to return if not defined.
    *
    * @return {null|sh.BoardConfigItem[]}
    */
    sh.BoardConfig.prototype.hasItem = function(key, defaultValue) {
        var items = this.getItems();

        if (typeof key !== 'string') {
            key = items.indexOf(key);

            return key >= 0 ? [items[key]] : defaultValue;
        }

        var item, found = [];

        for (var i = 0, il = items.length; i < il; i++) {
            item = items[i];

            if (item instanceof sh.BoardConfigComments) {
                continue;
            }

            if (item.name() === key) {
                found.push(item);
            }
        }

        return found.length ? found : defaultValue;
    };

    /**
    * Get an config item.
    *
    * @method
    *
    * @param {String|sh.BoardConfigItem} key            Configuration key.
    * @param {Mixed}                     [defaultValue] Default value to return if not defined.
    *
    * @return {null|sh.BoardConfigItem|sh.BoardConfigItem[]}
    * @throws {Error} If not defined and no default value provided.
    */
    sh.BoardConfig.prototype.getItem = function(key, defaultValue) {
        var item = this.hasItem(key);

        if (item) {
            return item;
        }

        if (defaultValue === undefined) {
            throw new Error('Undefined item [' + key + ']');
        }

        return new sh.BoardConfigValue(defaultValue);
    };

    /**
    * Get an config item value.
    *
    * @method
    *
    * @param {String} key                 Configuration key.
    * @param {String} [defaultValue=null] Default value to return.
    *
    * @return {sh.BoardConfigValue|null}
    */
    sh.BoardConfig.prototype.getValue = function(key, defaultValue) {
        return this.getItem(key, defaultValue).value();
    };

    /**
    * Set an config item value.
    *
    * @method
    *
    * @param {String} key   Configuration key.
    * @param {String} value The new value.
    *
    * @return {String} The old value.
    */
    sh.BoardConfig.prototype.setValue = function(key, value) {
        return this.getItem(key).value(value);
    };

    /**
    * Create an config item.
    *
    * @method
    *
    * @param {Object}         settings                  Item settings.
    * @param {String}         settings.name             Item name.
    * @param {String}         settings.value            Item value.
    * @param {String}         [settings.comments]       Item comments.
    * @param {Boolean}        [settings.disabled=false] Item state.
    * @param {Object}         options                   Item settings.
    * @param {Boolean}        [options.replace]         Replace item if already defined.
    * @param {Integer|String} [options.position]        Insert position.
    *
    * @return {sh.BoardConfigItem}
    * @throws {Error} If already defined.
    */
    sh.BoardConfig.prototype.createItem = function(settings, options) {
        var newItem = sh.BoardConfigItem(settings);
        var itemKey = newItem.name();

        options = options || {};

        if (this.hasItem(itemKey)) {
            if (! options.replace) {
                throw new Error('Item key [' + itemKey + '] already defined.');
            }

            for (var i = 0, il = this._items.length; i < il; i++) {
                if (this._items[i]._name == itemKey) {
                    this._items[i] = newItem;
                }
            }
        }
        else {
            if (options.position !== undefined) {
                var pos = options.position;

                if (typeof pos === 'string') {
                    var opt = pos.split(':');

                    if (opt.length !== 2) {
                        throw new Error('Invalid position option.');
                    }

                    var where = opt[0];

                    if (['before', 'after'].indexOf(where) === -1) {
                        throw new Error('Invalid position option.');
                    }

                    // find item position
                    var key = opt[1];
                        pos = null;

                    for (var i = 0, il = this._items.length; i < il; i++) {
                        if (this._items[i]._name == key) {
                            pos = where === 'after' ? (i + 1) : i;
                            break;
                        }
                    }

                    if (pos === null) {
                        throw new Error('Undefined target item [' + key + '].');
                    }
                }

                this._items.splice(parseInt(pos), 0, newItem);
            }
            else {
                // at end of items
                this._items.push(newItem);
            }
        }

        return newItem;
    };

    /**
    * Parse a configuration file.
    *
    * @method
    *
    * @param {String} [source] Raw configuration as string.
    *
    * @return {this}
    */
    sh.BoardConfig.prototype.parse = function(source) {
        // default source
        source = source || this._source;

        // no source provided
        if (! source) {
            throw new Error('No source provided to parse.');
        }

        // no source provided
        if (typeof source != 'string') {
            throw new Error('The source must be a string.');
        }

        // split text on new lines
        var lines = source.trim().split('\n');

        // no source provided
        if (! lines.length) {
            throw new Error('The source is empty.');
        }

        // reset config
        this._loaded = false;
        this._source = source;
        this._items   = [];

        // skip first line (# NOTE Lines must not exceed 132 characters)
        if (lines[0].trim().indexOf('# NOTE Lines must') == 0) {
            lines.shift();
        }

        var line, matches, disabled, name, value, comments, lastMatch, lastItem, lastComments;

        for (var i = 0, il = lines.length; i < il; i++) {
            // current line
            line = lines[i];

            // skip empty line
            if (! line.trim().length) {
                // reset last comment
                lastComments = null;
                lastMatch    = null;

                // next item
                continue;
            }

            // extract: item (name, value, comment, disabled)
            matches = line.match(/^(#+)?([a-z0-9\.\_\-]+) ([^#]+)(.*)$/);

            if (matches) {
                // add new items
                lastMatch = lastItem = sh.BoardConfigItem({
                    disabled: matches[1],
                    name    : matches[2],
                    value   : matches[3],
                    comments: matches[4].substr(1)
                });

                name = lastItem.name();

                // add to items
                this._items.push(lastItem);

                // next item
                continue;
            }

            // extract: item comments (on next lines)
            matches = line.match(/^\s{10,}#(.*)/);

            if (matches) {
                // add comments to last item comments items
                lastItem.comments(matches[1], true);

                // next item
                continue;
            }

            // extract: section comments
            comments = line.substr(1).trim();

            if (lastComments && lastMatch instanceof sh.BoardConfigComments) {
                lastComments.comments(comments, true);
            } else {
                lastMatch = lastComments = sh.BoardConfigComments(comments);
                this._items.push(lastComments);
            }
        }

        // loaded ?
        this._loaded = !!this._items.length;

        // chainable
        return this;
    }

    /**
    * Wordwrap...
    *
    * @method
    *
    * @return {String}
    */
    sh.wordwrap = function(str, int_width, str_break, cut) {
        //  discuss at: http://phpjs.org/functions/wordwrap/
        // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // improved by: Nick Callen
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Sakimori
        //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // bugfixed by: Michael Grier
        // bugfixed by: Feras ALHAEK
        //   example 1: wordwrap('Kevin van Zonneveld', 6, '|', true);
        //   returns 1: 'Kevin |van |Zonnev|eld'
        //   example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n');
        //   returns 2: 'The quick brown fox <br />\njumped over the lazy<br />\n dog.'
        //   example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
        //   returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod \ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \ncommodo consequat.'

        var m = ((arguments.length >= 2) ? arguments[1] : 75)
        var b = ((arguments.length >= 3) ? arguments[2] : '\n')
        var c = ((arguments.length >= 4) ? arguments[3] : false)

        var i, j, l, s, r

        str += ''

        if (m < 1) {
            return str
        }

        for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
            for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : '')) {
                j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/))[0].length
            }
        }

        return r.join('\n')
    }

    /**
    * Return the configuration as string.
    *
    * @method
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.toString = function() {
        // Get the items
        var items = this.getItems();

        // first pass: find name/value max lengths
        var lengths  = { name: 0, value: 0 };
        var nameLength, valueLength;

        for (var item, i = 0; i < items.length; i++) {
            // current item
            item = items[i];

            // value item
            if (item instanceof sh.BoardConfigItem) {
                nameLength  = item.name().length;
                valueLength = item.value().toString().length;

                if (item.disabled()) {
                    nameLength++;
                }

                lengths.name  = Math.max(lengths.name, nameLength);
                lengths.value = Math.max(lengths.value, valueLength);
            }
        }

        // second pass: find min paddins
        var paddings = { name: 5, value: 5, offset: 120, items: [] };
        var padding;

        for (var item, i = 0; i < items.length; i++) {
            // current item
            item = items[i];

            // value item
            if (item instanceof sh.BoardConfigItem) {
                nameLength  = item.name().length;
                valueLength = item.value().toString().length;

                if (item.disabled()) {
                    nameLength++;
                }

                padding = (lengths.name - nameLength + paddings.name);
                padding+= (lengths.value - valueLength);

                paddings.offset = Math.min(paddings.offset, padding);

                paddings.items.push(padding);
            }
            else {
                paddings.items.push(null);
            }
        }

        if (paddings.offset > paddings.name) {
            paddings.offset -= paddings.name;
        }

        // lines
        var lines = [];

        // ...
        var item, line, pads, comments;

        for (var i = 0; i < items.length; i++) {
            // current item
            item = items[i];

            // comments item
            if (item instanceof sh.BoardConfigComments) {
                i && lines.push('\n');
                line = item.comments().join(' ');
                line = sh.wordwrap(line, 120, '\n# ', true);
                line = (line[0] == '#' ? '#' : '# ') + line;
                lines.push(line);
                continue;
            }

            // current line
            line = '';

            // disabled item
            if (item.disabled()) {
                // append comments char to buffer
                line += '#';
            }

            // start with the name
            line += item.name();

            // [name <--> value] padding
            pads = paddings.items[i] - paddings.offset;

            // append padding spaces
            line += Array(pads + 1).join(' ');

            // append value
            line += item.value();

            // append padding spaces
            line += Array(paddings.value + 1).join(' ');

            // comments
            comments = item.comments().join(' ');
            pads     = lengths.name + paddings.name + lengths.value + paddings.value - paddings.offset;
            comments = sh.wordwrap(comments, 120 - pads, '\n' + Array(pads + 1).join(' ') + '# ', true);

            // append item comments to buffer
            line += '# ' + comments;

            // append line
            lines.push(line);
        }

        // return the lines as string
        return lines.join('\n');
    };

    /**
    * Get the board configuration.
    *
    * @method
    *
    * @param {Boolean} [txtFirst=false] Test `config.txt` first.
    * @param {Integer} [timeout=0]      Connection timeout.
    *
    * @return {Promise}
    *
    * {$examples sh.Board.config}
    */
    sh.Board.prototype.config = function(txtFirst, timeout) {
        // self alias
        var self = this;

        // debug ---------------------------------------------------------------
        // var config = new sh.BoardConfig('config.test.txt', sampleConfig);
        // return Promise.resolve(sh.BoardEvent('config', self, null, config));
        // ---------------------------------------------------------------------

        // default timeout
        timeout = timeout === undefined ? 0 : timeout;

        // default filename
        var filenames = txtFirst
            ? ['config.txt', 'config']
            : ['config', 'config.txt'];

        // set current filename
        var filename = filenames[0];

        // no limit
        var limit = undefined;

        // get config file
        return self.cat('/sd/' + filename, limit, timeout).catch(function(event) {
            // set current filename
            filename = filenames[1];

            // try second name
            return self.cat('/sd/' + filename, limit, timeout).then(function(event) {
                // resolve the promise
                return Promise.resolve(event);
            });
        })
        .then(function(event) {
            // parse config file contents
            var config = new sh.BoardConfig(filename, event.data);

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('config', self, event, config));
        });
    };

var sampleConfig = `
# NOTE Lines must not exceed 132 characters
## Robot module configurations : general handling of movement G-codes and slicing into moves
default_feed_rate                            4000             # Default rate ( mm/minute ) for G1/G2/G3 moves
default_seek_rate                            4000             # Default rate ( mm/minute ) for G0 moves
mm_per_arc_segment                           0.0              # Fixed length for line segments that divide arcs 0 to disable
mm_max_arc_error                             0.01             # The maximum error for line segments that divide arcs 0 to disable
                                                              # note it is invalid for both the above be 0
                                                              # if both are used, will use largest segment length based on radius
#mm_per_line_segment                          5                # Lines can be cut into segments ( not usefull with cartesian
                                                              # coordinates robots ).

# Arm solution configuration : Cartesian robot. Translates mm positions into stepper positions
alpha_steps_per_mm                           80               # Steps per mm for alpha stepper
beta_steps_per_mm                            80               # Steps per mm for beta stepper
gamma_steps_per_mm                           1600             # Steps per mm for gamma stepper

# Planner module configuration : Look-ahead and acceleration configuration
planner_queue_size                           32               # DO NOT CHANGE THIS UNLESS YOU KNOW EXACTLY WHAT YOU ARE DOING
acceleration                                 3000             # Acceleration in mm/second/second.
#z_acceleration                              500              # Acceleration for Z only moves in mm/s^2, 0 uses acceleration which is the default. DO NOT SET ON A DELTA
junction_deviation                           0.05             # Similar to the old "max_jerk", in millimeters,
                                                              # see https://github.com/grbl/grbl/blob/master/planner.c
                                                              # and https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8
                                                              # Lower values mean being more careful, higher values means being
                                                              # faster and have more jerk
#z_junction_deviation                        0.0              # for Z only moves, -1 uses junction_deviation, zero disables junction_deviation on z moves DO NOT SET ON A DELTA
#minimum_planner_speed                       0.0              # sets the minimum planner speed in mm/sec

# Stepper module configuration
microseconds_per_step_pulse                  1                # Duration of step pulses to stepper drivers, in microseconds
base_stepping_frequency                      100000           # Base frequency for stepping

# Cartesian axis speed limits
x_axis_max_speed                             30000            # mm/min
y_axis_max_speed                             30000            # mm/min
z_axis_max_speed                             300              # mm/min

# Stepper module pins ( ports, and pin numbers, appending "!" to the number will invert a pin )
alpha_step_pin                               2.0              # Pin for alpha stepper step signal
alpha_dir_pin                                0.5              # Pin for alpha stepper direction
alpha_en_pin                                 0.4              # Pin for alpha enable pin
alpha_current                                1.5              # X stepper motor current
alpha_max_rate                               30000.0          # mm/min

beta_step_pin                                2.1              # Pin for beta stepper step signal
beta_dir_pin                                 0.11             # Pin for beta stepper direction
beta_en_pin                                  0.10             # Pin for beta enable
beta_current                                 1.5              # Y stepper motor current
beta_max_rate                                30000.0          # mm/min

gamma_step_pin                               2.2              # Pin for gamma stepper step signal
gamma_dir_pin                                0.20             # Pin for gamma stepper direction
gamma_en_pin                                 0.19             # Pin for gamma enable
gamma_current                                1.5              # Z stepper motor current
gamma_max_rate                               300.0            # mm/min

## System configuration
# Serial communications configuration ( baud rate defaults to 9600 if undefined )
uart0.baud_rate                              115200           # Baud rate for the default hardware serial port
second_usb_serial_enable                     false            # This enables a second usb serial port (to have both pronterface
                                                              # and a terminal connected)
#leds_disable                                true             # disable using leds after config loaded
#play_led_disable                            true             # disable the play led

# Kill button (used to be called pause) maybe assigned to a different pin, set to the onboard pin by default
kill_button_enable                           true             # set to true to enable a kill button
kill_button_pin                              2.12             # kill button pin. default is same as pause button 2.12 (2.11 is another good choice)

#msd_disable                                 false            # disable the MSD (USB SDCARD) when set to true (needs special binary)
#dfu_enable                                  false            # for linux developers, set to true to enable DFU
#watchdog_timeout                            10               # watchdog timeout in seconds, default is 10, set to 0 to disable the watchdog

# Only needed on a smoothieboard
currentcontrol_module_enable                 true             #

## Extruder module configuration
extruder.hotend.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false
extruder.hotend.steps_per_mm                    140              # Steps per mm for extruder stepper
extruder.hotend.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves
extruder.hotend.acceleration                    500              # Acceleration for the stepper motor mm/sec²
extruder.hotend.max_speed                       50               # mm/s

extruder.hotend.step_pin                        2.3              # Pin for extruder step signal
extruder.hotend.dir_pin                         0.22             # Pin for extruder dir signal
extruder.hotend.en_pin                          0.21             # Pin for extruder enable signal

# extruder offset
#extruder.hotend.x_offset                        0                # x offset from origin in mm
#extruder.hotend.y_offset                        0                # y offset from origin in mm
#extruder.hotend.z_offset                        0                # z offset from origin in mm

# firmware retract settings when using G10/G11, these are the defaults if not defined, must be defined for each extruder if not using the defaults
#extruder.hotend.retract_length                  3               # retract length in mm
#extruder.hotend.retract_feedrate                45              # retract feedrate in mm/sec
#extruder.hotend.retract_recover_length          0               # additional length for recover
#extruder.hotend.retract_recover_feedrate        8               # recover feedrate in mm/sec (should be less than retract feedrate)
#extruder.hotend.retract_zlift_length            0               # zlift on retract in mm, 0 disables
#extruder.hotend.retract_zlift_feedrate          6000            # zlift feedrate in mm/min (Note mm/min NOT mm/sec)

delta_current                                1.5              # First extruder stepper motor current

# Second extruder module configuration
#extruder.hotend2.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false
#extruder.hotend2.steps_per_mm                    140              # Steps per mm for extruder stepper
#extruder.hotend2.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves
#extruder.hotend2.acceleration                    500              # Acceleration for the stepper motor, as of 0.6, arbitrary ratio
#extruder.hotend2.max_speed                       50               # mm/s

#extruder.hotend2.step_pin                        2.8              # Pin for extruder step signal
#extruder.hotend2.dir_pin                         2.13             # Pin for extruder dir signal
#extruder.hotend2.en_pin                          4.29             # Pin for extruder enable signal

#extruder.hotend2.x_offset                        0                # x offset from origin in mm
#extruder.hotend2.y_offset                        25.0             # y offset from origin in mm
#extruder.hotend2.z_offset                        0                # z offset from origin in mm
#epsilon_current                              1.5              # Second extruder stepper motor current


## Laser module configuration
laser_module_enable                          false            # Whether to activate the laser module at all. All configuration is
                                                              # ignored if false.
#laser_module_pin                             2.5             # this pin will be PWMed to control the laser. Only P2.0 - P2.5, P1.18, P1.20, P1.21, P1.23, P1.24, P1.26, P3.25, P3.26
                                                              # can be used since laser requires hardware PWM
#laser_module_maximum_power                   1.0             # this is the maximum duty cycle that will be applied to the laser
#laser_module_minimum_power                   0.0             # This is a value just below the minimum duty cycle that keeps the laser
                                                              # active without actually burning.
#laser_module_default_power                   0.8             # This is the default laser power that will be used for cuts if a power has not been specified.  The value is a scale between
                                                              # the maximum and minimum power levels specified above
#laser_module_pwm_period                      20              # this sets the pwm frequency as the period in microseconds

## Temperature control configuration
# First hotend configuration
temperature_control.hotend.enable            true             # Whether to activate this ( "hotend" ) module at all.
                                                              # All configuration is ignored if false.
temperature_control.hotend.thermistor_pin    0.23             # Pin for the thermistor to read
temperature_control.hotend.heater_pin        2.7              # Pin that controls the heater, set to nc if a readonly thermistor is being defined
temperature_control.hotend.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5
#temperature_control.hotend.beta             4066             # or set the beta value
temperature_control.hotend.set_m_code        104              #
temperature_control.hotend.set_and_wait_m_code 109            #
temperature_control.hotend.designator        T                #
#temperature_control.hotend.max_temp         300              # Set maximum temperature - Will prevent heating above 300 by default
#temperature_control.hotend.min_temp         0                # Set minimum temperature - Will prevent heating below if set

#temperature_control.hotend.p_factor         13.7             # permanently set the PID values after an auto pid
#temperature_control.hotend.i_factor         0.097            #
#temperature_control.hotend.d_factor         24               #

#temperature_control.hotend.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.

# Second hotend configuration
#temperature_control.hotend2.enable            true             # Whether to activate this ( "hotend" ) module at all.
                                                              # All configuration is ignored if false.

#temperature_control.hotend2.thermistor_pin    0.25             # Pin for the thermistor to read
#temperature_control.hotend2.heater_pin        1.23             # Pin that controls the heater
#temperature_control.hotend2.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5
##temperature_control.hotend2.beta             4066             # or set the beta value
#temperature_control.hotend2.set_m_code        104              #
#temperature_control.hotend2.set_and_wait_m_code 109            #
#temperature_control.hotend2.designator        T1               #

#temperature_control.hotend2.p_factor          13.7           # permanently set the PID values after an auto pid
#temperature_control.hotend2.i_factor          0.097          #
#temperature_control.hotend2.d_factor          24             #

#temperature_control.hotend2.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.

temperature_control.bed.enable               true             #
temperature_control.bed.thermistor_pin       0.24             #
temperature_control.bed.heater_pin           2.5              #
temperature_control.bed.thermistor           Honeywell100K    # see http://smoothieware.org/temperaturecontrol#toc5
#temperature_control.bed.beta                3974             # or set the beta value

temperature_control.bed.set_m_code           140              #
temperature_control.bed.set_and_wait_m_code  190              #
temperature_control.bed.designator           B                #

#temperature_control.bed.bang_bang            false           # set to true to use bang bang control rather than PID
#temperature_control.bed.hysteresis           2.0             # set to the temperature in degrees C to use as hysteresis
                                                              # when using bang bang

## Switch module for fan control
switch.fan.enable                            true             #
switch.fan.input_on_command                  M106             #
switch.fan.input_off_command                 M107             #
switch.fan.output_pin                        2.6              #
switch.fan.output_type                       pwm              # pwm output settable with S parameter in the input_on_comand
#switch.fan.max_pwm                           255              # set max pwm for the pin default is 255

#switch.misc.enable                           true             #
#switch.misc.input_on_command                 M42              #
#switch.misc.input_off_command                M43              #
#switch.misc.output_pin                       2.4              #
#switch.misc.output_type                      digital          # just an on or off pin

# Switch module for spindle control
#switch.spindle.enable                        false            #

## Temperatureswitch :
# automatically toggle a switch at a specified temperature. Different ones of these may be defined to monitor different temperatures and switch different swithxes
# useful to turn on a fan or water pump to cool the hotend
#temperatureswitch.hotend.enable              true             #
#temperatureswitch.hotend.designator          T                # first character of the temperature control designator to use as the temperature sensor to monitor
#temperatureswitch.hotend.switch              misc             # select which switch to use, matches the name of the defined switch
#temperatureswitch.hotend.threshold_temp      60.0             # temperature to turn on (if rising) or off the switch
#temperatureswitch.hotend.heatup_poll         15               # poll heatup at 15 sec intervals
#temperatureswitch.hotend.cooldown_poll       60               # poll cooldown at 60 sec intervals


## Endstops
endstops_enable                              true             # the endstop module is enabled by default and can be disabled here
#corexy_homing                               false            # set to true if homing on a hbot or corexy
alpha_min_endstop                            1.24^            # add a ! to invert if endstop is NO connected to ground
alpha_max_endstop                            1.25^            # NOTE set to nc if this is not installed
alpha_homing_direction                       home_to_min      # or set to home_to_max and set alpha_max
alpha_min                                    0                # this gets loaded after homing when home_to_min is set
alpha_max                                    200              # this gets loaded after homing when home_to_max is set
beta_min_endstop                             1.26^            #
beta_max_endstop                             1.27^            #
beta_homing_direction                        home_to_min      #
beta_min                                     0                #
beta_max                                     200              #
gamma_min_endstop                            1.28^            #
gamma_max_endstop                            1.29^            #
gamma_homing_direction                       home_to_min      #
gamma_min                                    0                #
gamma_max                                    200              #

alpha_max_travel                             500              # max travel in mm for alpha/X axis when homing
beta_max_travel                              500              # max travel in mm for beta/Y axis when homing
gamma_max_travel                             500              # max travel in mm for gamma/Z axis when homing

# optional order in which axis will home, default is they all home at the same time,
# if this is set it will force each axis to home one at a time in the specified order
#homing_order                                 XYZ              # x axis followed by y then z last
#move_to_origin_after_home                    false            # move XY to 0,0 after homing

# optional enable limit switches, actions will stop if any enabled limit switch is triggered
#alpha_limit_enable                          false            # set to true to enable X min and max limit switches
#beta_limit_enable                           false            # set to true to enable Y min and max limit switches
#gamma_limit_enable                          false            # set to true to enable Z min and max limit switches

alpha_fast_homing_rate_mm_s                  50               # feedrates in mm/second
beta_fast_homing_rate_mm_s                   50               # "
gamma_fast_homing_rate_mm_s                  4                # "
alpha_slow_homing_rate_mm_s                  25               # "
beta_slow_homing_rate_mm_s                   25               # "
gamma_slow_homing_rate_mm_s                  2                # "

alpha_homing_retract_mm                      5                # distance in mm
beta_homing_retract_mm                       5                # "
gamma_homing_retract_mm                      1                # "

#endstop_debounce_count                       100              # uncomment if you get noise on your endstops, default is 100

## Z-probe
zprobe.enable                                false           # set to true to enable a zprobe
zprobe.probe_pin                             1.28!^          # pin probe is attached to if NC remove the !
zprobe.slow_feedrate                         5               # mm/sec probe feed rate
#zprobe.debounce_count                       100             # set if noisy
zprobe.fast_feedrate                         100             # move feedrate mm/sec
zprobe.probe_height                          5               # how much above bed to start probe
#gamma_min_endstop                           nc              # normally 1.28. Change to nc to prevent conflict,

# associated with zprobe the leveling strategy to use
#leveling-strategy.three-point-leveling.enable         true        # a leveling strategy that probes three points to define a plane and keeps the Z parallel to that plane
#leveling-strategy.three-point-leveling.point1         100.0,0.0   # the first probe point (x,y) optional may be defined with M557
#leveling-strategy.three-point-leveling.point2         200.0,200.0 # the second probe point (x,y)
#leveling-strategy.three-point-leveling.point3         0.0,200.0   # the third probe point (x,y)
#leveling-strategy.three-point-leveling.home_first     true        # home the XY axis before probing
#leveling-strategy.three-point-leveling.tolerance      0.03        # the probe tolerance in mm, anything less that this will be ignored, default is 0.03mm
#leveling-strategy.three-point-leveling.probe_offsets  0,0,0       # the probe offsets from nozzle, must be x,y,z, default is no offset
#leveling-strategy.three-point-leveling.save_plane     false       # set to true to allow the bed plane to be saved with M500 default is false

## Panel
panel.enable                                 false             # set to true to enable the panel code

# Example for reprap discount GLCD
# on glcd EXP1 is to left and EXP2 is to right, pin 1 is bottom left, pin 2 is top left etc.
# +5v is EXP1 pin 10, Gnd is EXP1 pin 9
#panel.lcd                                   reprap_discount_glcd     #
#panel.spi_channel                           0                 # spi channel to use  ; GLCD EXP1 Pins 3,5 (MOSI, SCLK)
#panel.spi_cs_pin                            0.16              # spi chip select     ; GLCD EXP1 Pin 4
#panel.encoder_a_pin                         3.25!^            # encoder pin         ; GLCD EXP2 Pin 3
#panel.encoder_b_pin                         3.26!^            # encoder pin         ; GLCD EXP2 Pin 5
#panel.click_button_pin                      1.30!^            # click button        ; GLCD EXP1 Pin 2
#panel.buzz_pin                              1.31              # pin for buzzer      ; GLCD EXP1 Pin 1
#panel.back_button_pin                       2.11!^            # back button         ; GLCD EXP2 Pin 8

# pins used with other panels
#panel.up_button_pin                         0.1!              # up button if used
#panel.down_button_pin                       0.0!              # down button if used
#panel.click_button_pin                      0.18!             # click button if used

panel.menu_offset                            0                 # some panels will need 1 here

panel.alpha_jog_feedrate                     6000              # x jogging feedrate in mm/min
panel.beta_jog_feedrate                      6000              # y jogging feedrate in mm/min
panel.gamma_jog_feedrate                     200               # z jogging feedrate in mm/min

panel.hotend_temperature                     185               # temp to set hotend when preheat is selected
panel.bed_temperature                        60                # temp to set bed when preheat is selected

## Custom menus : Example of a custom menu entry, which will show up in the Custom entry.
# NOTE _ gets converted to space in the menu and commands, | is used to separate multiple commands
custom_menu.power_on.enable                true              #
custom_menu.power_on.name                  Power_on          #
custom_menu.power_on.command               M80               #

custom_menu.power_off.enable               true              #
custom_menu.power_off.name                 Power_off         #
custom_menu.power_off.command              M81               #


## Network settings
network.enable                               true            # enable the ethernet network services
network.webserver.enable                     true             # enable the webserver
network.telnet.enable                        true             # enable the telnet server
network.ip_address                           auto             # use dhcp to get ip address
# uncomment the 3 below to manually setup ip address
#network.ip_address                           192.168.3.222    # the IP address
#network.ip_mask                              255.255.255.0    # the ip mask
#network.ip_gateway                           192.168.3.1      # the gateway address
#network.mac_override                         xx.xx.xx.xx.xx.xx  # override the mac address, only do this if you have a conflict
`;

})();
