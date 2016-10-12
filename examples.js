// // @example sh.network.Request - Single request
// sh.network.Request({
//     url: 'index.html'
// })
// .onProgress(function(event) {
//     // notify progression
//     console.info(event.request._url, '>> progress >>',  event.percent, '%');
// })
// .then(function(event) {
//     // index.html is loaded
//     console.info(event.request._url, '>> loaded >>', event.response);
//
//     // return result for final then
//     return { event: event, error: false };
// })
// .catch(function(event) {
//     // error loading index.html
//     console.warn(event.request._url, '>> error >>', event.response);
//
//     // return error for final then
//     return { event: event, error: true };
// })
// .then(function(result) {
//     // finaly ...
//     var event    = result.event;
//     var logType  = result.error ? 'error' : 'info';
//     var logLabel = result.error ? 'error' : 'loaded';
//
//     console[logType](event.request._url, '>>', logLabel, '>>', event.response);
// });

// -----------------------------------------------------------------------------

// // @example sh.network.Request - Chaining requests
// sh.network.Request({
//     url: 'index.html'
// })
// .onProgress(function(event) {
//     // notify progression
//     console.info(event.request._url, '>> progress >>',  event.percent, '%');
// })
// .then(function(event) {
//     // index.html is loaded
//     console.info(event.request._url, '>> loaded >>', event.response);
//
//     // return another request
//     return sh.network.Request({
//         url: 'not_found.html'
//     })
//     .onProgress(function(event) {
//         // notify progression
//         console.info(event.request._url, '>> progress >>',  event.percent, '%');
//     });
// })
// .then(function(event) {
//     // not_found.html is loaded
//     console.info(event.request._url, '>> loaded >>', event.response);
//
//     // return result for final then
//     return { event: event, error: false };
// })
// .catch(function(event) {
//     // error loading index.html or not_found.html
//     console.warn(event.request._url, '>> error >>', event.response);
//
//     // return error for final then
//     return { event: event, error: true };
// })
// .then(function(result) {
//     // finaly ...
//     var event    = result.event;
//     var logType  = result.error ? 'error' : 'info';
//     var logLabel = result.error ? 'error' : 'loaded';
//
//     console[logType](event.request._url, '>>', logLabel, '>>', event.response);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board - Board class usage
// // create the board instance
// var board = sh.Board('192.168.1.102');

// // @example sh.Board.command - Send arbitrary command(s)
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // get board version (raw)
// board.command('version').then(function(event) {
//     console.info('board:', event.board);                        // Board instance
//     console.info('version:', event.originalEvent.response.raw); // Raw response text
// })
// .catch(function(event) {
//     console.error('version:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.ping - Ping the board
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// board.ping().then(function(event) {
//     console.info('ping:', event.name, event);
// })
// .catch(function(event) {
//     console.error('ping:', event.name, event);
// });

// -----------------------------------------------------------------------------

// @example sh.Board.mv - Move file
// create the board instance
// var board = sh.Board('192.168.1.102');
//
// board.mv('/sd/source.gcode', '/sd/target/source.gcode').then(function(event) {
//     console.info('mv:', event.name, event);
// })
// .catch(function(event) {
//     console.error('mv:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.rm - Remove file(s)
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // remove one file
// board.rm('/sd/target/source.gcode').then(function(event) {
//     console.info('rm:', event.name, event);
// })
// .catch(function(event) {
//     console.error('rm:', event.name, event);
// });
//
// // remove several files
// var paths = ['/sd/file1.gcode', '/sd/file2.gcode'];
//
// board.rm(paths).then(function(event) {
//     console.info('rm:', event.name, event);
// })
// .catch(function(event) {
//     console.error('rm:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.version - Get the board version
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // get board version (parsed)
// board.version().then(function(event) {
//     console.info('board:', event.board); // Board instance
//     console.info('info:', event.data);   // {branch, hash, date, mcu, clock}
// })
// .catch(function(event) {
//     console.error('version:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.connect - Board connection
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // register some events callbacks
// board.on('connect', function(event) {
//     console.info('on.connect:', event.board);
// })
// .on('disconnect', function(event) {
//     console.info('on.disconnect:', event.board);
// })
// .on('reconnect', function(event) {
//     console.info('on.reconnect:', event.board);
// })
// .on('redisconnect', function(event) {
//     console.info('on.redisconnect:', event.board);
// })
// .on('reconnectAttempt', function(event) {
//     console.info('on.reconnectAttempt:', event.data.attempts, event.board);
//     // disconnect the board after 5 attempts
//     if (this.reconnectAttempts == 2) {
//         this.disconnect().then(function(event) {
//             console.info('disconnect:', event.board);
//         })
//         .catch(function(event) {
//             console.error('disconnect:', event.name, event);
//         });
//     }
// })
// .on('watch', function(event) {
//     console.info('on.watch:', event.board);
// })
// .on('response', function(event) {
//     console.info('on.response:', event.board);
// })
// .on('error', function(event) {
//     console.error('on.error:', event.board);
// });
//
// // connect the board
// board.connect().then(function(event) {
//     console.info('connect:', event.board);
// })
// .catch(function(event) {
//     console.error('connect:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.disconnect - Board disconnection
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // connect the board
// board.connect().then(function(event) {
//     console.info('connect:', event.board);
// })
// .catch(function(event) {
//     console.error('connect:', event.name, event);
// });
//
// // disconnect the board after 15 seconds
// setTimeout(function() {
//
//     board.disconnect().then(function(event) {
//         console.info('disconnect:', event.board);
//     })
//     .catch(function(event) {
//         console.error('disconnect:', event.name, event);
//     });
//
// }, 15000); // 15 sec.

// -----------------------------------------------------------------------------

// // @example sh.Board.ls - List files
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // get all files or directories on sd/gcode
// board.ls('sd/gcode/').then(function(event) {
//     console.info('ls:', event.name, event.data);
// })
// .catch(function(event) {
//     console.error('ls:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.cat - Get file contents
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // get the first 10 lines of config.txt
// board.cat('/sd/config.txt', 10).then(function(event) {
//     console.info('cat:', event.name, event);
// })
// .catch(function(event) {
//     console.error('cat:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.lsAll - List all files (recursive)
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // get all files or directories on sd/gcode (recursive)
// board.lsAll('/sd/gcode/').then(function(event) {
//     console.info('lsAll:', event.name, event.data);
// })
// .catch(function(event) {
//     console.error('lsAll:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.upload - Upload a file
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // upload from string
// var name1 = 'file1.gcode';
// var file1 = 'File1 contents...';
//
// board.upload(file1, name1).onUploadProgress(function(event) {
//     console.info(board.address, '>> upload >>',  event.percent, '%');
// })
// .then(function(event) {
//     console.info('upload:', event.name, event);
//
//     // get the first 10 lines
//     board.cat('/sd/' + name1, 10).then(function(event) {
//         console.info('cat:', event.name, event);
//     })
//     .catch(function(event) {
//         console.error('cat:', event.name, event);
//     });
// })
// .catch(function(event) {
//     console.error('upload:', event.name, event);
// });
//
// // upload from Blob object (do not forget the EOF '\n')
// var name2 = 'file2.gcode';
// var file2 = new Blob(['File2 contents...\n'], { type: 'text/plain' });
//
// board.upload(file2, name2).onUploadProgress(function(event) {
//     console.info(board.address, '>> upload >>',  event.percent, '%');
// })
// .then(function(event) {
//     console.info('upload:', event.name, event);
//
//     // get the first 10 lines
//     board.cat('/sd/' + name2, 10).then(function(event) {
//         console.info('cat:', event.name, event);
//     })
//     .catch(function(event) {
//         console.error('cat:', event.name, event);
//     });
// })
// .catch(function(event) {
//     console.error('upload:', event.name, event);
// });
//
// // upload from File object
// // create input element
// var input  = document.createElement('input');
// input.type = 'file';
// document.body.appendChild(input);
//
// input.addEventListener('change', function(event) {
//     var file3 = event.target.files[0];
//
//     board.upload(file3).onUploadProgress(function(event) {
//         console.info(board.address, '>> upload >>',  event.percent, '%');
//     })
//     .then(function(event) {
//         console.info('upload:', event.name, event);
//
//         // get the first 10 lines
//         board.cat('/sd/' + file3.name, 10).then(function(event) {
//             console.info('cat:', event.name, event);
//         })
//         .catch(function(event) {
//             console.error('cat:', event.name, event);
//         });
//     })
//     .catch(function(event) {
//         console.error('upload:', event.name, event);
//     });
// });

// -----------------------------------------------------------------------------

// // @example sh.Board.config - Get the configuration
// // create the board instance
// var board = sh.Board('192.168.1.102');
//
// // get the configuration
// board.config(true).then(function(event) {
//     var config = event.data;
//
//     console.info('config:', event.name, event);
//
//     // from item value
//     console.log('extruder.hotend2.en_pin: ' + config.getItem('extruder.hotend2.en_pin').value());
//     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toString());
//     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toInteger());
//     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toFloat());
//     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toFloat(1));
//
//     // set new value
//     console.log('extruder.hotend2.en_pin: ' + config.getItem('extruder.hotend2.en_pin').value('4.28'));
//     console.log('extruder.hotend2.en_pin: ' + config.setValue('extruder.hotend2.en_pin', '4.28'));
//
//     // from item method
//     console.log('extruder.hotend2.en_pin: ' + config.getValue('extruder.hotend2.en_pin'));
//     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toString());
//     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toInteger());
//     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toFloat());
//     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toFloat(1));
//
//     // create item
//     config.createItem({
//         disabled: false,
//         name    : 'custom.setting',
//         value   : '5.5',
//         comments: 'My setting usages...'
//     });
//
//     console.log('custom.setting: ' + config.getValue('custom.setting'));
//
//     // replace item
//     config.createItem({
//         disabled: true,
//         name    : 'custom.setting',
//         value   : '8.2',
//         comments: 'My new setting usages...'
//     },
//     {
//         replace: true
//     });
//
//     console.log('custom.setting: ' + config.getValue('custom.setting'));
//
//     // create and insert new item before another
//     config.createItem({
//         disabled: true,
//         name    : 'custom.setting2',
//         value   : '3.2',
//         comments: 'My new setting usages...'
//     },
//     {
//         position: 'before:custom.setting'
//     });
//
//     console.log('custom.setting: ' + config.getValue('custom.setting'));
// })
// .catch(function(event) {
//     console.error('config:', event.name, event);
// });

// -----------------------------------------------------------------------------

// // @example sh.network.Scanner - Scanne the network
// // create the scanner instance
// var scanner = sh.network.Scanner();
//
// // register events callbacks
// scanner.on('start', function(scan) {
//     console.log('scan:', 'start:', scan.total);
// });
//
// scanner.on('pause', function(scan) {
//     console.log('scan:', 'pause:', scan.scanned, '/', scan.total);
// });
//
// scanner.on('resume', function(scan) {
//     console.log('scan:', 'resume:', scan.scanned, '/', scan.total);
// });
//
// scanner.on('stop', function(scan) {
//     console.log('scan:', 'stop:', scan.scanned, '/', scan.total);
// });
//
// scanner.on('progress', function(scan) {
//     console.log('scan:', 'progress:', scan.scanned, '/', scan.total);
// });
//
// scanner.on('board', function(scan, board) {
//     console.log('scan:', 'board:', board);
// });
//
// scanner.on('end', function(scan) {
//     console.log('scan:', 'end:', scan.scanned, '/', scan.total);
//     console.log('scan:', 'found:', scan.found, '/', scan.total);
// });
//
// // start scan
// scanner.start('192.168.1.100-115');
