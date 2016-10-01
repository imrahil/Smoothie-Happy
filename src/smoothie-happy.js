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
    * @property {String} version API version.
    * @default
    * @readonly
    */
    sh.version = '{$version}';

    /**
    * @property {String} build API build hash.
    * @default
    * @readonly
    */
    sh.build = '{$build}';

    /**
    * @property {String} id API id.
    * @default
    * @readonly
    */
    sh.id = '{$id}';

    /**
    * @property {String} name API name.
    * @default
    * @readonly
    */
    sh.name = '{$name}';

    /**
    * @property {String} description API description.
    * @default
    * @readonly
    */
    sh.description = '{$description}';

    /**
    * @property {String} gitURL API repository url.
    * @default
    * @readonly
    */
    sh.gitURL = '{$git_url}';

    // [modules placeholder]

})();
