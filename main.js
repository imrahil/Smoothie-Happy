// smoothie-happy alias
var ip = '192.168.1.101';

//------------------------------------------------------------------------------

// // send command(s)
// sh.network.command(ip, 'version\nmem\nversion', {
//     onload: function() {
//         console.info('version:', this);
//     }
// });

//------------------------------------------------------------------------------

// // get the board version
// sh.command.version(ip, {
//     onresponse: function(response) {
//         console.log('version:', response);
//     }
// });

// // get the first 10 lines from the config file
// sh.command.cat(ip, 'sd/config.txt', {
//     limit     : 10,
//     onresponse: function(response) {
//         console.log('cat sd/config.txt:', response);
//     }
// });

// // get memory usage.
// sh.command.mem(ip, {
//     onresponse: function(response) {
//         console.log('mem:', response);
//     }
// });

// // get files list on the sd card
// sh.command.ls(ip, 'sd/', {
//     onresponse: function(response) {
//         console.log('files:', response);
//     }
// });

// // Change the current folder.
// sh.command.cd(ip, 'sd', {
//     onresponse: function(response) {
//         console.log('cd:', response);
//     }
// });

// get files list on current dir
sh.command.ls(ip, '', {
    onresponse: function(response) {
        console.log('files:', response.data.files);
    }
});

// // get the first 10 lines from the config file
// sh.command.pwd(ip, {
//     onresponse: function(response) {
//         console.log('pwd:', response);
//     }
// });

// get the first 10 lines from the config file
sh.command.rm(ip, 'gcode/test.txt', {
    onresponse: function(response) {
        console.log('rm:', response);
    }
});

//------------------------------------------------------------------------------

// on file selected
$('#file').on('change', function(e) {
    var file = e.target.files[0];

    // upload the file
    sh.network.upload(ip, file, {
        upload: {
            onloadend: function(event) {
                sh.command.ls(ip, 'sd/', {
                    onresponse: function(response) {
                        console.log('files:', response.data.files);
                    }
                });
            }
        }
    });
});

//------------------------------------------------------------------------------

// debug...
//console.log('sh:', sh);
