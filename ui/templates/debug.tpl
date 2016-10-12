<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{$name} - v{$version}</title>
        <meta name="keywords" content="{$keywords}">
        <meta name="description" content="{$description}">
        <link rel="stylesheet" type="text/css" href="vendor/font-awesome/css/font-awesome.min.css?v=4.6.3" />
        <link rel="stylesheet" type="text/css" href="vendor/bootstrap/css/bootstrap.min.css?v=3.3.5" />
        <link rel="stylesheet" type="text/css" href="style.css?v={$version}&amp;b={$build}" />
    </head>
    <body id="{$id}">
        <script src="vendor/es6-promise.auto.min.js?v=4.0.3"></script>
        <script src="dist/smoothie-happy.js?v={$version}&amp;b={$build}"></script>
        <script src="examples.js?v={$version}&amp;b={$build}"></script>
    </body>
</html>
