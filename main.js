// smoothie-happy alias
var sh = smoothieHappy;
var ip = '192.168.1.101';

//------------------------------------------------------------------------------

// sh.network.command(ip, 'version', {
//     onload: function() {
//         console.info('version:', this.responseText);
//     }
// });

// get the board version
sh.command.version(ip, {
    onversion: function(version) {
        console.log('version:', version);
    }
});

// get files list on the sd card
sh.command.ls(ip, 'sd/', {
    onfiles: function(files) {
        console.log('files list:', files);
    }
});

// read the 10 first lines from the config file
sh.command.cat(ip, 'sd/config.txt', {
    limit : 10,
    ontext: function(text) {
        console.log('config.txt:', text);
    },
    onlines: function(lines) {
        console.log('config.txt:', lines);
    }
});

//------------------------------------------------------------------------------
$('#file').on('change', function(e) {
    var file = e.target.files[0];

    sh.network.upload(ip, file, {
        upload: {
            onloadstart: function(event) {
                console.log('start:', event);
            },
            onprogress: function(event) {
                console.log('progress:', event);
            },
            onerror: function(event) {
                console.log('error:', event);
            },
            onloadend: function(event) {
                console.log('end:', event);
                ls();
                cat(file.name, 10);
            }
        }
    });
});


//------------------------------------------------------------------------------

// debug...
//console.log('sh:', sh);
