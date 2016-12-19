// API shortcut
var sh = SmoothieHappy;

// Single request
new sh.Request({
    url: 'hello.html'
})
.onProgress(function(event) {
    // notify progression
    console.info('on:progress', event);
})
.then(function(event) {
    // hello.html is loaded
    console.info('on:load', event);

    // return result for final then
    return { event: event, error: false };
})
.catch(function(event) {
    // error loading hello.html
    console.warn('on:error', event);

    // return error for final then
    return { event: event, error: true };
})
.then(function(result) {
    // finally ...
    var event = result.event;
    var type  = result.error ? 'error' : 'info';

    console[type]('finally:', event);
});
