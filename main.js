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

// // reset the system
// sh.command.reset(ip, {
//     onresponse: function(response) {
//         console.log('reset:onresponse', response);
//     },
//     onerror: function() {
//         console.log('reset:onerror', this);
//     },
//     waitUntilOnline: {
//         ontry: function(trials) {
//             console.log('waitUntilOnline:ontry', trials);
//         },
//         online: function(version) {
//             console.log('waitUntilOnline:online', version);
//         },
//         ontimeout: function() {
//             console.log('waitUntilOnline:offline', this);
//         }
//     }
// });

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
//     }
// });

// // set config value
// sh.command.config(ip, 'alpha_steps_per_mm', '90', {
//     onresponse: function(response) {
//         console.log('response', response);
//         // get config value
//         sh.command.config(ip, 'alpha_steps_per_mm', {
//             onresponse: function(response) {
//                 console.log('response', response);
//             }
//         });
//     }
// });

// // config cache load/unload/dump/checksum
// sh.command.configCache(ip, 'dump', {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// get input value checksum
sh.command.checksum(ip, 'my_config_item', {
    onresponse: function(response) {
        console.log('response', response);
    }
});

// // get entire config
// sh.command.config(ip, {
//     limit: 20,
//     onresponse: function(response) {
//         console.log('response', response);
//         var item = response.result.get('mm_per_arc_segment');
//         console.log('mm_per_arc_segment: ', item);
//     }
// });

// // get raw [temp|pos|wcs|state|status|fk|ik]
// sh.command.get(ip, 'temp', {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // set temperatures
// sh.command.tempSet(ip, 'bed', 50, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get temperatures
// sh.command.tempGet(ip, {
//     device: 'bed',
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // set temperatures
// sh.command.temp(ip, 'bed', 80, {
//     onresponse: function(response) {
//         console.log('response', response);
//         // get temperatures
//         sh.command.temp(ip, {
//             device: 'bed',
//             onresponse: function(response) {
//                 console.log('response', response);
//             }
//         });
//     }
// });

// // get position
// sh.command.position(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get work coordinate system
// sh.command.wcs(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get state
// sh.command.state(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get status
// sh.command.status(ip, {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // do inverse kinematics on the given cartesian position,
// // optionally moves the actuators and finaly display the coordinates.
// sh.command.kinematics(ip, {
//     //inverse: false,
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // switch
// sh.command.switch(ip, 'fan', 'on', {
//     onresponse: function(response) {
//         console.log('response', response);
//     }
// });

// // get network config
// sh.command.net(ip, {
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
