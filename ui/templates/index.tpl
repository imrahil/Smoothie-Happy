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
        <nav id="navbar" class="navbar navbar-inverse navbar-fixed-top">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="#">{$name} <sup>(v{$version})</sup></a>
                </div>
                <ul class="nav navbar-nav navbar-right">
                    <li><a href="docs/smoothie-happy/{$version}/" target="_blank">Docs</a></li>
                    <li><a href="https://github.com/lautr3k/Smoothie-Happy" target="_blank">GitHub</a></li>
                </ul>
            </div>
        </nav>
        <div id="body" class="container-fluid">
            <div class="row">
                <div class="col-xs-12 col-sm-6 col-md-4">
                    {$scanner.tpl}
                    {$boards.tpl}
                </div>
                <div class="col-xs-12 col-sm-6 col-md-8">
                    {$board.tpl}
                </div>
            </div>
        </div>
        <script src="vendor/jquery.min.js?v=2.2.3"></script>
        <script src="vendor/knockout.min.js?v=3.4.0"></script>
        <script src="vendor/bootstrap/js/bootstrap.min.js?v=3.3.5"></script>
        <script src="vendor/bootstrap-notify.min.js?v=3.1.3"></script>
        <script src="vendor/es6-promise.auto.min.js?v=4.0.3"></script>
        <script src="vendor/filesize.min.js?v=3.3.0"></script>
        <script src="dist/smoothie-happy.js?v={$version}&amp;b={$build}"></script>
        <script src="main.js?v={$version}&amp;b={$build}"></script>
    </body>
</html>
