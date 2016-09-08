//// @example sh.network.Request - Single request
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

//// @example sh.network.Request - Chaining requests
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

// // @example sh.Board - Board class usage :
// // create the board instance
// var board = sh.Board('192.168.1.102', function(result) {
//     if (! result.error) {
//         // log board info
//         console.log(board.info);
//     }
//     else {
//         // log error message
//         console.error('Not a smoothieboard!');
//     }
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
// scanner.on('progress', function(scan) {
//     console.log('scan:', 'progress:', scan.scanned);
// });
//
// scanner.on('board', function(scan, board) {
//     console.log('scan:', 'board:', board);
// });
//
// scanner.on('end', function(scan) {
//     console.log('scan:', 'end:', scan.found);
// });
//
// // start scan
// scanner.start('192.168.1.100-105');
