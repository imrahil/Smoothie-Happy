// smoothie-happy alias
var sh = smoothieHappy;
var ip = '192.168.1.101';

//------------------------------------------------------------------------------

sh.network.command(ip, 'version', {
    onload: function() {
        console.info('version:', this.responseText);
    }
});

function cat(file, limit) {
    limit = limit ? (' ' + limit) : '';
    console.log('cat sd/' + file + limit);
    sh.network.command(ip, 'cat sd/' + file + limit, {
        onload: function() {
            console.log('cat:', file, this.responseText);
        }
    });
}

// get the files list on the sd card
sh.command.ls(ip, 'sd/', {
    onfiles: function(files) {
        console.log('files list', files);
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
