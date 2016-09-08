/**
* {$name} - {$description}.
* @author   {$author}
* @see      {@link {$src_url}}
* @build    {$build}
* @version  {$version}
* @license  {$license}
* @namespace
*/
var sh = sh || {};

(function () {
    'use strict';

    /**
    * @default
    * @readonly
    * @property {String} version API version.
    */
    sh.version = '{$version}';

    /**
    * @default
    * @readonly
    * @property {String} build API build hash.
    */
    sh.build = '{$build}';

    /**
    * @default
    * @readonly
    * @property {String} id API id.
    */
    sh.id = '{$id}';

    /**
    * @default
    * @readonly
    * @property {String} name API name.
    */
    sh.name = '{$name}';

    /**
    * @default
    * @readonly
    * @property {String} description API description.
    */
    sh.description = '{$description}';

    /**
    * @default
    * @readonly
    * @property {String} gitURL API repository url.
    */
    sh.gitURL = '{$git_url}';

    // [modules placeholder]

})();
