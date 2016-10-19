/**
* {$name} - {$description}.
* @author   {$author}
* @see      {@link {$src_url}}
* @build    {$build}
* @date     {$date}
* @version  {$version}
* @license  {$license}
* @namespace
*/
var sh = sh || {};

(function () {
    'use strict';

    /**
    * @property {String} - API version.
    * @default
    * @readonly
    */
    sh.version = '{$version}';

    /**
    * @property {String} - API build hash.
    * @default
    * @readonly
    */
    sh.build = '{$build}';

    /**
    * @property {String} - API id.
    * @default
    * @readonly
    */
    sh.id = '{$id}';

    /**
    * @property {String} - API name.
    * @default
    * @readonly
    */
    sh.name = '{$name}';

    /**
    * @property {String} - API description.
    * @default
    * @readonly
    */
    sh.description = '{$description}';

    /**
    * @property {String} - API repository url.
    * @default
    * @readonly
    */
    sh.gitURL = '{$git_url}';

    // [modules placeholder]

})();
