// @example sh.network.Request - Single request
new sh.network.Request({
    url: 'index.html'
})
.onProgress(function(event) {
    // notify progression
    console.info(event.request._url, '>> progress >>',  event.percent, '%');
})
.then(function(event) {
    // index.html is loaded
    console.info(event.request._url, '>> loaded >>', event.response);

    // return result for final then
    return { event: event, error: false };
})
.catch(function(event) {
    // error loading index.html
    console.warn(event.request._url, '>> error >>', event.response);

    // return error for final then
    return { event: event, error: true };
})
.then(function(result) {
    // finaly ...
    var event    = result.event;
    var logType  = result.error ? 'error' : 'info';
    var logLabel = result.error ? 'error' : 'loaded';

    console[logType](event.request._url, '>>', logLabel, '>>', event.response);
});

// -----------------------------------------------------------------------------

// @example sh.network.Request - Chaining requests
new sh.network.Request({
    url: 'index.html'
})
.onProgress(function(event) {
    // notify progression
    console.info(event.request._url, '>> progress >>',  event.percent, '%');
})
.then(function(event) {
    // index.html is loaded
    console.info(event.request._url, '>> loaded >>', event.response);

    // return another request
    return new sh.network.Request({
        url: 'not_found.html'
    })
    .onProgress(function(event) {
        // notify progression
        console.info(event.request._url, '>> progress >>',  event.percent, '%');
    });
})
.then(function(event) {
    // not_found.html is loaded
    console.info(event.request._url, '>> loaded >>', event.response);

    // return result for final then
    return { event: event, error: false };
})
.catch(function(event) {
    // error loading index.html or not_found.html
    console.warn(event.request._url, '>> error >>', event.response);

    // return error for final then
    return { event: event, error: true };
})
.then(function(result) {
    // finaly ...
    var event    = result.event;
    var logType  = result.error ? 'error' : 'info';
    var logLabel = result.error ? 'error' : 'loaded';

    console[logType](event.request._url, '>>', logLabel, '>>', event.response);
});

// -----------------------------------------------------------------------------

// @example sh.network.Request - Multiple requests (all)
var requests = [
    new sh.network.Request({ url: 'index.html?request=1'}),
    new sh.network.Request({ url: 'index.html?request=2'}),
    new sh.network.Request({ url: 'index.html?request=3'})
];

// The Promise.all(iterable) method returns a promise that resolves
// when all of the promises in the iterable argument have resolved,
// or rejects with the event of the first passed promise that rejects
Promise.all(requests).then(function(events) {
    // All requests are resloved
    for (var i = 0; i < events.length; i++) {
        console.info(events[i].request._url, '>> loaded >>', events[i].response);
    }
})
.catch(function(event) {
    // First passed promise that rejects
    console.warn(event.request._url, '>> error >>', event.response);
});

// @example sh.network.Request - Multiple requests (race)
var requests = [
    new sh.network.Request({ url: 'index.html?request=1'}),
    new sh.network.Request({ url: 'index.html?request=2'}),
    new sh.network.Request({ url: 'index.html?request=3'})
];

// The Promise.race(iterable) method returns a promise that resolves or rejects
// as soon as one of the promises in the iterable resolves or rejects,
// with the event from that promise.
Promise.race(requests).then(function(event) {
    // First passed promise that resolves
    console.info(event.request._url, '>> loaded >>', event.response);
})
.catch(function(event) {
    // First passed promise that rejects
    console.warn(event.request._url, '>> error >>', event.response);
});
