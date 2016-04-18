// smoothie-happy alias
var sh = smoothieHappy;
var ip = '192.168.1.101';

//------------------------------------------------------------------------------

// // send an command
// sh.network.command(ip, 'version', {
//     onload: function() {
//         console.info('version:', this.responseText);
//     }
// });

//------------------------------------------------------------------------------

// get the board version
sh.command.version(ip, {
    onresponse: function(response) {
        console.log('version:', response);
    }
});

// // get files list on the sd card
// sh.command.ls(ip, 'sd/', {
//     onresponse: function(response) {
//         console.log('files:', response.data.files);
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
