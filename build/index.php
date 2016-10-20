<?php
// -----------------------------------------------------------------------------
// Smoothie-Happy : Source compiler - v0.0.2-alpha
// -----------------------------------------------------------------------------

// library settings
$settings = [
    'name'        => 'sh',
    'build'       => 'auto',
    'version'     => '0.3.0-dev',
    'date'        => date(DATE_RSS),
    'title'       => 'Smoothie-Happy',
    'description' => 'A SmoothieBoard network communication API',
    'author'      => 'Sébastien Mischler (skarab) <sebastien@onlfait.ch>',
    'demoUrl'     => 'http://lautr3k.github.io/Smoothie-Happy/',
    'srcUrl'      => 'https://github.com/lautr3k/Smoothie-Happy',
    'bugsUrl'     => 'https://github.com/lautr3k/Smoothie-Happy/issues',
    'gitUrl'      => 'git://github.com/lautr3k/Smoothie-Happy.git',
    'license'     => 'MIT'
];

// paths
$paths = [
    'build'    => './',
    'src'      => '../src',
    'dist'     => '../dist',
    'examples' => '../examples'
];

// scripts
$scripts = [];

// -----------------------------------------------------------------------------
// Auto set build version based on current time
// -----------------------------------------------------------------------------
if ($settings['build'] === 'auto') {
    $settings['build'] = md5(time());
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
// extract examples
// -----------------------------------------------------------------------------

// examples collection
$examples  = [];
$example   = null;
$path      = null;
$lastPath  = null;
$commented = false;

// for each examples file
foreach (glob($paths['examples'] . '/src/sh.*.js') as $path) {

    // get the file contents
    $examples_contents = file_get_contents($path);
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
}

// -----------------------------------------------------------------------------
// write examples index
// -----------------------------------------------------------------------------
$examplesOptions = [];
$examplesScripts = [];

foreach ($examples as $section => $items) {
    $examplesOptions[] = "\t" . '<optgroup label="' . $section . '">';
    $examplesOptions[] = "\t\t" . '<option value="none" selected disabled>Select an example to run...</option>';
    foreach ($items as $index => $item) {
        $examplesOptions[] = "\t\t" . '<option value="example' . $index . '">' . $item[0] . '</option>';
        //$examplesScripts[] = 'function example' . $index . '() {' . "\n" . $item[1] . "\n" . '}';
        $buffer = '';
        $lines  = explode("\n", $item[1]);
        foreach ($lines as $line) {
            $buffer .= "\t\t" . $line . "\n";
        }
        $examplesScripts[] = "\t" . '// Example n°' . $index . ' - ' . $section . ' : ' . $item[0];
        $examplesScripts[] = "\t" . 'function example' . $index . '() {' . "\n" . $buffer . "\t" . '}';
    }
    $examplesOptions[] = "\t" . '</optgroup>';
}

$examplesOptionsBuffer = '<select>' . "\n";
$examplesOptionsBuffer.= implode("\n", $examplesOptions) . "\n";
$examplesOptionsBuffer.= '</select>' . "\n";

$examplesScriptsBuffer = '<script>' . "\n";
$examplesScriptsBuffer.= implode("\n\n", $examplesScripts) . "\n";
$examplesScriptsBuffer.= '</script>' . "\n";

// parse examples index
$buffer = file_get_contents($paths['examples'] . '/src/index.html');
$buffer = tags_replace($settings, $buffer);
$buffer = tags_replace([
    'options' => $examplesOptionsBuffer,
    'scripts' => $examplesScriptsBuffer
], $buffer);

// write examples index
file_put_contents($paths['examples'] . '/index.html', $buffer);

// print the example file
//require($paths['examples'] . '/index.html');
echo('<style>html, body, iframe { width:100%; height: 100%; margin: 0; padding: 0; }</style>');
echo('<iframe src="' . $paths['examples'] . '/index.html" frameborder="0"></iframe>');

// -----------------------------------------------------------------------------
// compile source files
// -----------------------------------------------------------------------------

// for each source file
foreach (glob($paths['src'] . '/sh.*.js') as $path) {
    // get script name
    $name = basename($path);

    // parse script contents
    $buffer = file_get_contents($path);
    $buffer = tags_replace($settings, $buffer);
    $buffer = trim($buffer) . "\n";

    // add to scripts collection
    $scripts[$name] = $buffer;
}

// parse main script contents
$buffer = file_get_contents($paths['src'] . '/sh.js');
$buffer = tags_replace($settings, $buffer);
$buffer = tags_replace($scripts, $buffer);

// parse example tags
$buffer = preg_replace_callback('/ +\* +\{\$examples +([^\}]+)\}/', function($matches) {
    global $examples;
    $buffer  = '';
    $section = $matches[1];
    if (isset($examples[$section])) {
        foreach ($examples[$section] as $example) {
            $buffer .= "\n@example\n";
            $buffer .= '### ' . $example[0] . "\n";
            $buffer .= "```\n" . $example[1] . "\n```";
        }
    }
    return preg_replace('/^([^\n]*)$/m', '    * $1', trim($buffer));
}, $buffer);

// write distribution build
file_put_contents($paths['dist'] . '/' . $settings['name'] . '.js', $buffer);
