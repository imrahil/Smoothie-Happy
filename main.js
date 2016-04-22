// smoothie-happy alias
var ip = '192.168.1.101';

//------------------------------------------------------------------------------

// // send command(s)
// sh.network.command(ip, 'version\nmem\nversion', {
//     onload: function() {
//         console.info('version', this);
//     }
// });

//------------------------------------------------------------------------------

// // get files list on the sd card
// sh.command.ls(ip, 'sd/', {
//     onresponse: function(response) {
//         console.log('ls sd/', response);
//     }
// });

// // change the current folder
// sh.command.cd(ip, 'sd/', {
//     onresponse: function(response) {
//         console.log('cd sd/', response);
//     }
// });

// // get the first 10 lines from the config file
// sh.command.pwd(ip, {
//     onresponse: function(response) {
//         console.log('pwd', response);
//     }
// });

// // get the first 10 lines from the config file
// sh.command.cat(ip, 'sd/config.txt', {
//     limit     : 10,
//     onresponse: function(response) {
//         console.log('cat sd/config.txt', response);
//     }
// });

// // remove a file
// sh.command.rm(ip, '/sd/test.txt', {
//     onresponse: function(response) {
//         console.log('rm gcode/test.txt', response);
//     }
// });

// // move a file
// sh.command.mv(ip, '/sd/gcode/test.txt', '/sd/test.txt', {
//     onresponse: function(response) {
//         console.log('rm gcode/test.txt', response);
//     }
// });

// // get the help
// sh.command.help(ip, {
//     onresponse: function(response) {
//         console.log('help', response);
//     }
// });

// // get the board version
// sh.command.version(ip, {
//     onresponse: function(response) {
//         console.log('version', response);
//     }
// });

// // get memory usage
// sh.command.mem(ip, {
//     onresponse: function(response) {
//         console.log('mem', response);
//     }
// });

// // wait until the board is online
// sh.network.waitUntilOnline(ip, {
//     ontry: function(trials) {
//         console.log('ontry', trials);
//     },
//     online: function(version) {
//         console.log('online', version);
//     },
//     ontimeout: function() {
//         console.log('ontimeout', this);
//     }
// });

// reset the system
sh.command.reset(ip, {
    onresponse: function(response) {
        console.log('reset:onresponse', response);
    },
    onerror: function() {
        console.log('reset:onerror', this);
    },
    waitUntilOnline: {
        ontry: function(trials) {
            console.log('waitUntilOnline:ontry', trials);
        },
        online: function(version) {
            console.log('waitUntilOnline:online', version);
        },
        ontimeout: function() {
            console.log('waitUntilOnline:offline', this);
        }
    }
});

// // get config value
// sh.command.configGet(ip, 'alpha_steps_per_mm', {
//     location: 'sd',
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // set config value
// sh.command.configSet(ip, 'alpha_steps_per_mm', '90', {
//     location: 'sd',
//     onresponse: function(response) {
//         console.log('response', response);
//     },
//     ontimeout: function() {
//         console.log('timeout', this);
//     },
//     onend: function() {
//         console.log('end', this);
//     }
// });

// // get raw [temp|pos|wcs|state|status|fk|ik]
// sh.command.get(ip, 'temp', {
//     onresponse: function(response) {
//         console.log('response', response);
//     },
//     ontimeout: function() {
//         console.log('timeout', this);
//     },
//     onend: function() {
//         console.log('end', this);
//     }
// });

// // set temperatures
// sh.command.setTemp(ip, 'bed', 50, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get temperatures
// sh.command.getTemp(ip, {
//     device: 'bed',
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get work coordinate system
// sh.command.getWCS(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get state
// sh.command.getState(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get status
// sh.command.getStatus(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

//------------------------------------------------------------------------------

// on file selected
$('#file').on('change', function(e) {
    var file = e.target.files[0];

    // upload the file
    sh.command.upload(ip, file, {
        upload: {
            onloadend: function(event) {
                sh.command.ls(ip, 'sd/', {
                    onresponse: function(response) {
                        console.log('files', response.data.files);
                    }
                });
            }
        }
    });
});

//------------------------------------------------------------------------------

// debug...
//console.log('sh', sh);
