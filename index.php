<?php
// -----------------------------------------------------------------------------
// Smoothie-Happy : Source compiler - v0.01-alpha
// -----------------------------------------------------------------------------
// library modules
$modules = ['network', 'board', 'board.commands', 'network.scanner'];

// library settings
$settings = [
    'version'     => '0.2.0-dev',
    'build'       => 'auto',
    'date'        => date(DATE_RSS),
    'id'          => 'smoothie-happy',
    'name'        => 'Smoothie-Happy',
    'description' => 'A SmoothieBoard network communication API',
    'author'      => 'Sébastien Mischler (skarab) <sebastien@onlfait.ch>',
    'keywords'    => 'SmoothieBoard, SmoothieWare, Smoothie Firmware, Network, API, js, JavaScript',
    'demo_url'    => 'http://lautr3k.github.io/Smoothie-Happy/',
    'src_url'     => 'https://github.com/lautr3k/Smoothie-Happy',
    'bugs_url'    => 'https://github.com/lautr3k/Smoothie-Happy/issues',
    'git_url'     => 'git://github.com/lautr3k/Smoothie-Happy.git',
    'license'     => 'MIT'
];

// library template
$library_template = './src/smoothie-happy.js';
$library_file     = './dist/smoothie-happy.js';

// UI templates/scripts path
$scripts_path   = './ui/scripts';
$templates_path = './ui/templates';

// index template
$main_js_template = 'main.js';
$index_template   = 'index.tpl';
$index_file       = './index.html';
$main_js_file     = './main.js';

// examples file
$example_file = './examples.js';

// docs directory
$docs_directory = './docs';

// cache directory
$cache_directory = './cache';

// =============================================================================
//    !!!    DO NOT EDIT BELOW IF YOU DO NOT KNOW WHAT YOU ARE DOING.    !!!
// =============================================================================

// -----------------------------------------------------------------------------
// Auto set build version based on current time
// -----------------------------------------------------------------------------
if ($settings['build'] === 'auto') {
    $settings['build'] = md5(time());
}

// -----------------------------------------------------------------------------
// User build options
// -----------------------------------------------------------------------------
$noCache = isset($_GET['noCache']);
$noDocs  = isset($_GET['noDocs']);

// -----------------------------------------------------------------------------
// check paths
// -----------------------------------------------------------------------------
// library paths
$library_directory = dirname($library_file);

if (! is_file($library_template)) {
    throw new Exception('$library_template [ ' . $library_template . ' ] is not a file');
}

if (! is_dir($library_directory)) {
    throw new Exception('$library_directory [ ' . $library_directory . ' ] is not a directory.');
}

// scripts paths
if (! is_dir($scripts_path)) {
    throw new Exception('$scripts_path [ ' . $scripts_path . ' ] is not a directory.');
}

$main_js_template = $scripts_path . '/' . $main_js_template;

// template paths
if (! is_dir($templates_path)) {
    throw new Exception('$templates_path [ ' . $templates_path . ' ] is not a directory.');
}

$index_template = $templates_path . '/' . $index_template;

if (! is_file($index_template)) {
    throw new Exception('$index_template [ ' . $index_template . ' ] is not a file');
}

// index paths
$index_directory = dirname($index_file);

if (! is_dir($index_directory)) {
    throw new Exception('$index_directory [ ' . $index_directory . ' ] is not a directory.');
}

// docs path
if (! is_dir($docs_directory)) {
    throw new Exception('$docs_directory [ ' . $docs_directory . ' ] is not a directory.');
}

// cache path
if (! is_dir($cache_directory)) {
    throw new Exception('$cache_directory [ ' . $cache_directory . ' ] is not a directory.');
}

// examples file
if (! is_file($example_file)) {
    throw new Exception('$example_file [ ' . $example_file . ' ] is not a file');
}

// -----------------------------------------------------------------------------
// replace all tags in input string
// -----------------------------------------------------------------------------
function tags_replace($tags, $str) {
    foreach ($tags as $tag => $value) {
        $str = str_replace('{$' . $tag . '}', $value, $str);
    }
    return $str;
}

// -----------------------------------------------------------------------------
// get cache
// -----------------------------------------------------------------------------
function cache($file, $value = null) {
    global $noCache, $cache_directory;

    if ($noCache) {
        return null;
    }

    $cache_file = $cache_directory . '/' . md5($file);

    if (func_num_args() > 1) {
        file_put_contents($cache_file, json_encode($value));
        is_file($file) and touch($cache_file, filemtime($file));
        return true;
    }

    if (! is_file($cache_file) or filemtime($cache_file) != filemtime($file)) {
        return null;
    }

    return json_decode(file_get_contents($cache_file), true);
}

// -----------------------------------------------------------------------------
// extract examples
// -----------------------------------------------------------------------------
// get cached examples
$examples = cache($example_file);

// rebuild modules
$examples_modules = [];

// no cache or modified
if (! $examples) {
    // examples collection
    $examples  = [];
    $example   = null;
    $path      = null;
    $lastPath  = null;
    $commented = false;

    // get the file contents
    $examples_contents = file_get_contents($example_file);
    $example_lines     = preg_split("/\r\n|\n|\r/", $examples_contents);

    foreach ($example_lines as $line) {
        // skip examples spacers "//---"
        if (preg_match('/\/\/ ?\-{3,}/', $line)) {
            continue;
        }

        // catch @example tag
        if (preg_match('/^\/\/ *(\/\/)? +\@example +([^ ]+) +\- +([^\n]+)/', $line, $matches)) {
            // is commented
            $commented = $matches[1] == '//';

            // get the last path
            $lastPath = $path or trim($matches[2]);

            // get the section path and title
            $path  = trim($matches[2]);
            $title = trim($matches[3]);

            // get the namespace from path
            $namespace = explode('.', $path)[1];

            // set module to be rebuilded
            $examples_modules[$namespace] = true;

            // create example collection for this path
            if (! isset($examples[$path])) {
                $examples[$path] = [];
            }

            // we hare in section...
            if (is_array($example)) {
                // add the last example found
                $example[1] = trim($example[1]);
                $examples[$lastPath][] = $example;
            }

            // set example title
            $example = [$title, ''];

            // go to next line
            continue;
        }

        // we hare in section...
        if (is_array($example)) {
            if ($commented) {
                // remove comments
                $line = preg_replace('/^\/\/ ?/', '', $line);
            }

            // set example contents
            $example[1] .= $line . "\n";
        }
    }

    // add the last example found
    if (is_array($example)) {
        $example[1] = trim($example[1]);
        $examples[$path][] = $example;
    }

    // update cache
    cache($example_file, $examples);
}

// -----------------------------------------------------------------------------
// compile library files
// -----------------------------------------------------------------------------
// modules buffer
$modules_buffer = '';

// for each modules
foreach ($modules as $module) {
    // module file path
    $module_template = dirname($library_template) . '/' . $module . '.js';

    // if file not found
    if (! is_file($module_template)) {
        throw new Exception('$module_template [ ' . $module_template . ' ] is not a file.');
    }

    // get cached module
    $module_buffer = isset($examples_modules[$module]) ? null : cache($module_template);

    // no cache or modified
    if (! $module_buffer) {
        // get and parse the input buffer
        $module_buffer = file_get_contents($module_template);
        $module_buffer = tags_replace($settings, $module_buffer);
        $module_buffer = preg_split("/\r\n|\n|\r/", $module_buffer);
        $module_buffer = implode("\n", array_slice($module_buffer, 2, -2));

        // parse example tags
        $module_buffer = preg_replace_callback('/ +\* +\{\$examples +([^\}]+)\}/', function($matches) {
            global $examples;
            $buffer  = '';
            $section = $matches[1];
            if (isset($examples[$section])) {
                foreach ($examples[$section] as $example) {
                    $buffer .= "\n\n@example\n";
                    $buffer .= '### ' . $example[0] . "\n";
                    $buffer .= "```\n" . $example[1] . "\n```";
                }
            }
            return preg_replace('/^([^\n]*)$/m', '    * $1', trim($buffer));
        }, $module_buffer);

        // update cache
        cache($module_template, $module_buffer);
    }

    // append to modules buffer
    $modules_buffer .= "\n    " . trim($module_buffer) . "\n";
}

// modules placeholder regex pattern
$modules_placeholder_pattern = "/\n *\/\/ \[modules placeholder\].*\n/";

// get and parse the input buffer
$library_buffer = file_get_contents($library_template);
$library_buffer = tags_replace($settings, $library_buffer);
$library_buffer = preg_replace($modules_placeholder_pattern, $modules_buffer, $library_buffer);

// write the buffer to output file
file_put_contents($library_file, trim($library_buffer) . "\n");

// -----------------------------------------------------------------------------
// compile templates file
// -----------------------------------------------------------------------------
$update_main_js_template = false;

foreach (glob($scripts_path . '/*.js') as $script_path) {
    // skip main template
    if ($script_path != $main_js_template) {
        // create template tag name
        $script_name = basename($script_path);

        // get cached template
        $script_buffer = cache($script_path);

        // compile template buffer
        if (! $script_buffer) {
            // force main js update
            $update_main_js_template = true;

            // get and parse template contents
            $script_buffer = file_get_contents($script_path);
            $script_buffer = tags_replace($settings, $script_buffer);
            $script_buffer = trim($script_buffer) . "\n";

            // update cache
            cache($script_path, $script_buffer);
        }

        // add/update tag to settings
        $settings[$script_name] = $script_buffer;
    }
}

// -----------------------------------------------------------------------------
// compile index JS file
// -----------------------------------------------------------------------------
if (! cache($main_js_template) || $update_main_js_template) {
    // get and parse the input buffer
    $main_js_template_buffer = file_get_contents($main_js_template);
    $main_js_template_buffer = tags_replace($settings, $main_js_template_buffer);
    $main_js_template_buffer = trim($main_js_template_buffer) . "\n";

    // write the buffer to output file
    file_put_contents($main_js_file, $main_js_template_buffer);

    // update cache
    cache($main_js_template, $main_js_template_buffer);
}

// -----------------------------------------------------------------------------
// compile templates file
// -----------------------------------------------------------------------------
$update_index_template = false;
$templates_buffers     = [];

foreach (glob($templates_path . '/*.tpl') as $template_path) {
    // skip main template
    if ($template_path != $index_template) {
        // get cached template
        $template_buffer = cache($template_path);

        // create template tag name
        $template_name = basename($template_path);

        // compile template buffer
        if (! $template_buffer) {
            // force to rebuild main template
            $update_index_template = true;

            // get template contents
            $template_buffer = file_get_contents($template_path);
            //$template_buffer = tags_replace($settings, $template_buffer);
            $template_buffer = trim($template_buffer) . "\n";
        }

        // add/update tag to templates buffers list
        $templates_buffers[$template_name] = $template_buffer;
    }
}

foreach ($templates_buffers as $template_name => $template_buffer) {
    // parse template buffer tags
    $template_buffer = tags_replace($templates_buffers, $template_buffer);

    // save parsed template buffer in settings
    $settings[$template_name]          = $template_buffer;
    $templates_buffers[$template_name] = $template_buffer;

    // update cache
    cache($templates_path . '/' . $template_name, $template_buffer);
}

// -----------------------------------------------------------------------------
// compile index file
// -----------------------------------------------------------------------------
if (! cache($index_template) || $update_index_template) {
    // get and parse the input buffer
    $index_buffer = file_get_contents($index_template);
    $index_buffer = tags_replace($settings, $index_buffer);
    $index_buffer = trim($index_buffer) . "\n";

    // write the buffer to output file
    file_put_contents($index_file, $index_buffer);

    // update cache
    cache($index_template, $index_buffer);
}

// -----------------------------------------------------------------------------
// print index file
// -----------------------------------------------------------------------------
ob_start();
require $index_file;
ob_flush();
flush();
ob_end_flush();

// -----------------------------------------------------------------------------
// compile docs
// -----------------------------------------------------------------------------
if ($noDocs) {
    exit();
}

if (! cache($docs_directory . '/jsdoc.tpl.json')) {
    // get and parse the input buffer
    $jsdoc_buffer = file_get_contents($docs_directory . '/jsdoc.tpl.json');
    $jsdoc_buffer = tags_replace($settings, $jsdoc_buffer);
    $jsdoc_buffer = trim($jsdoc_buffer) . "\n";

    // write the buffer to output file
    file_put_contents($docs_directory . '/jsdoc.json', $jsdoc_buffer);

    // update cache
    cache($docs_directory . '/jsdoc.tpl.json', $jsdoc_buffer);
}

if (! cache($docs_directory . '/package.tpl.json')) {
    // get and parse the input buffer
    $package_buffer = file_get_contents($docs_directory . '/package.tpl.json');
    $package_buffer = tags_replace($settings, $package_buffer);
    $package_buffer = trim($package_buffer) . "\n";

    // write the buffer to output file
    file_put_contents($docs_directory . '/package.json', $package_buffer);

    // update cache
    cache($docs_directory . '/package.tpl.json', $package_buffer);
}

// -----------------------------------------------------------------------------
// run jsdoc
// -----------------------------------------------------------------------------
$command = 'node ./node_modules/jsdoc/jsdoc.js -c ./jsdoc.json';
$command.=' -P ./package.json -R ../README.md';
$command.=' -r ../dist/smoothie-happy.js -d .';
$command.=' -t ./node_modules/jaguarjs-jsdoc';
$command.=' --verbose';

$cwd = getcwd();
chdir($docs_directory);
exec($command, $output, $error);
chdir($cwd);

//var_dump($output, $error);
//echo(implode($output, '\n'));

$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator(
        $docs_directory, RecursiveDirectoryIterator::SKIP_DOTS
    ),
    RecursiveIteratorIterator::SELF_FIRST,
    RecursiveIteratorIterator::CATCH_GET_CHILD
);

$src = realpath($library_directory) . '/';
$src = str_replace('\\', '/', $src);

$href = str_replace('C:/', 'C__', $src);
$href = str_replace('/', '_', $href);

foreach ($iter as $path => $dir) {
    if ($dir->isDir()) continue;
    if ($dir->getExtension() !== 'html') continue;

    $html = file_get_contents($path);
    $html = str_replace($src, '', $html);
    $html = str_replace($href, '', $html);

    file_put_contents($path, $html);

    if (preg_match("/$href/", $path)) {
        rename($path, str_replace($href, '', $path));
    }
}
