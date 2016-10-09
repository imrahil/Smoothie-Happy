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
    * @param {String} [source] Raw configuration as string.
    */
    sh.BoardConfig = function(source) {
        // instance factory
        if (! (this instanceof sh.BoardConfig)) {
            return new sh.BoardConfig(source);
        }

        /**
        * @property {String}
        * @readonly
        */
        this._source = source || null;

        /**
        * @property {Object}
        * @readonly
        */
        this._items = null;

        /**
        * @property {Array}
        * @readonly
        */
        this._list = null;

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
    * Get all items as object (without sections comments).
    *
    * @method
    * @return {Object|null}
    * @throws {Error}
    */
    sh.BoardConfig.prototype.getItems = function() {
        if (! this._loaded) {
            throw new Error('No configuration loaded.');
        }

        return this._items;
    };

    /**
    * Get all items as array (with sections comments).
    *
    * @method
    * @return {Array|null}
    * @throws {Error}
    */
    sh.BoardConfig.prototype.getList = function() {
        if (! this._loaded) {
            throw new Error('No configuration loaded.');
        }

        return this._list;
    };

    /**
    * Return an config item if exists.
    *
    * @method
    *
    * @param {String} key            Configuration key.
    * @param {Mixed}  [defaultValue] Default value to return if not defined.
    *
    * @return {null|sh.BoardConfigItem}
    */
    sh.BoardConfig.prototype.hasItem = function(key, defaultValue) {
        return this.getItems()[key] || defaultValue;
    };

    /**
    * Get an config item.
    *
    * @method
    *
    * @param {String}  [key]          Configuration key, if null return all items.
    * @param {String}  [defaultValue] Default value to return if not defined.
    *
    * @return {sh.BoardConfigValue}
    * @throws {Error} If not defined and no default value provided.
    */
    sh.BoardConfig.prototype.getItem = function(key, defaultValue) {
        if (key === undefined) {
            return this.getItems();
        }

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

            for (var i = 0, il = this._list.length; i < il; i++) {
                if (this._list[i]._name == itemKey) {
                    this._list[i] = newItem;
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

                    for (var i = 0, il = this._list.length; i < il; i++) {
                        if (this._list[i]._name == key) {
                            pos = where === 'after' ? (i + 1) : i;
                            break;
                        }
                    }

                    if (pos === null) {
                        throw new Error('Undefined target item [' + key + '].');
                    }
                }

                this._list.splice(parseInt(pos), 0, newItem);
            }
            else {
                // at end of list
                this._list.push(newItem);
            }
        }

        return this._items[itemKey] = newItem;
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
        this._items  = {};
        this._list   = [];

        // skip first line (# NOTE Lines must not exceed 132 characters)
        if (lines[0].trim().indexOf('# NOTE Lines must') == 0) {
            lines.shift();
        }

        var line, matches, disabled, name, value, comments, lastItem, lastComments;

        for (var i = 0, il = lines.length; i < il; i++) {
            // current line
            line = lines[i];

            // skip empty line
            if (! line.trim().length) {
                // reset last comment
                lastComments = null;

                // next item
                continue;
            }

            // extract: item (name, value, comment, disabled)
            matches = line.match(/^(#+)?([a-z0-9\.\_\-]+) ([^#]+)(.*)$/);

            if (matches) {
                // add new items
                lastItem = sh.BoardConfigItem({
                    disabled: matches[1],
                    name    : matches[2],
                    value   : matches[3],
                    comments: matches[4].substr(1)
                });

                this._items[lastItem.name()] = lastItem;

                // add to list
                this._list.push(lastItem);

                // next item
                continue;
            }

            // extract: item comments (on next lines)
            matches = line.match(/^\s{10,}#(.*)/);

            if (matches) {
                // add comments to last item comments list
                lastItem.comments(matches[1], true);

                // next item
                continue;
            }

            // extract: section comments
            comments = line.substr(1).trim();

            if (lastComments) {
                lastComments.comments(comments, true);
            } else {
                lastComments = sh.BoardConfigComments(comments);
                this._list.push(lastComments);
            }
        }

        // loaded ?
        this._loaded = !!this._list.length;

        // chainable
        return this;
    }

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
        var paths = txtFirst
            ? ['/sd/config.txt', '/sd/config']
            : ['/sd/config', '/sd/config.txt'];

        // no limit
        var limit = undefined;

        // get config file
        return self.cat(paths[0], limit, timeout).catch(function(event) {
            return self.cat(paths[1], limit, timeout).then(function(event) {
                // resolve the promise
                return Promise.resolve(event);
            });
        })
        .then(function(event) {
            // parse config file contents
            var config = new sh.BoardConfig(event.data);

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('config', self, event, config));
        });
    };

})();
