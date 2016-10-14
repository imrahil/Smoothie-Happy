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
    * Test if the value is modified.
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfigValue.prototype.isModified = function() {
        return this._currentValue !== this._firstValue;
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

        /**
        * @property {Boolean}
        * @protected
        */
        this._initiallyDisabled = this._disabled;
    };

    /**
    * Test if the item is modified.
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.isModified = function() {
        return this.value().isModified() || (this.disabled() !== this._initiallyDisabled);
    };

    /**
    * Reset state (enabled/disabled)
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.resetDisabled = function() {
        return this.disabled(this._initiallyDisabled);
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
        this._filename = 'config';

        /**
        * @property {String}
        * @readonly
        */
        this._source = null;

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

        // init values
        filename && this.filename(filename);
        source && this.parse(source);
    };

    /**
    * Get/Set the filename.
    *
    * @method
    *
    * @param {String} [filename] Configuration filename.
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.filename = function(filename) {
        if (filename === undefined) {
            return this._filename;
        }

        if (typeof filename != 'string') {
            throw new Error('The filename must be a string.');
        }

        return this._filename = filename;
    };

    /**
    * Get the source (as provided).
    * Set and parse the source (reload).
    *
    * @method
    *
    * @param {String} [source] Raw configuration as string.
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.source = function(source) {
        if (source === undefined) {
            return this._source;
        }

        this.parse(source);

        return this._source;
    };

    /**
    * Is loaded.
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfig.prototype.isLoaded = function() {
        return this._loaded;
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
    sh.BoardConfig.prototype.hasItems = function(key, defaultValue) {
        if (! this.isLoaded()) {
            throw new Error('No configuration loaded.');
        }

        var items = this._items;

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
    * Get config item(s).
    *
    * @method
    *
    * @param {String} [key]          Configuration key.
    * @param {Mixed}  [defaultValue] Default value to return if not defined.
    *
    * @return {null|sh.BoardConfigItem[]}
    * @throws {Error} If not defined and no default value provided.
    */
    sh.BoardConfig.prototype.getItems = function(key, defaultValue) {
        if (! this.isLoaded()) {
            throw new Error('No configuration loaded.');
        }

        if (key === undefined) {
            return this._items;
        }

        var items = this.hasItems(key);

        if (items) {
            return items;
        }

        if (defaultValue === undefined) {
            throw new Error('Undefined item [' + key + ']');
        }

        return defaultValue;
    };

    /**
    * Parse a configuration file.
    *
    * @method
    *
    * @param {String} source Raw configuration as string.
    *
    * @return {this}
    */
    sh.BoardConfig.prototype.parse = function(source) {
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
        this._items  = [];
        this._loaded = false;
        this._source = source;

        // skip first line (# NOTE Lines must not exceed 132 characters)
        if (lines[0].trim().indexOf('# NOTE Lines must') == 0) {
            lines.shift();
        }

        var line, matches, disabled, name, value, comments,
            lastMatch, lastItem, lastComments;

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
    sh.BoardConfig.prototype.format = function() {
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
    * Return the configuration as string.
    *
    * @method
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.toString = function() {
        return this.format();
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
            return Promise.resolve(self._trigger('config', event, config));
        });
    };

})();
