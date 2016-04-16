// smoothie-happy alias
var sh = smoothieHappy;

// update edge firmware commits list from the git (86400000 = 24h)
if ((Date.now() - sh.firmware.edge.update) > 86400000) {
    sh.firmware.updateEdgeFirmwareCommits();
}

// scan known ip's
sh.network.scanner.scanKnownIps();

//------------------------------------------------------------------------------

// UI elements
var $ipInput        = $('#ipInput');
var $timeoutInput   = $('#timeoutInput');
var $stopButton     = $('#stopButton');
var $scanButton     = $('#scanButton');
var $scanButtonIcon = $scanButton.find('.icon');
var $scanButtonText = $scanButton.find('.text');
var $scannedLabel   = $('#scannedLabel');
var $totalLabel     = $('#totalLabel');
var $foundLabel     = $('#foundLabel');
var $noBoards       = $('#noBoards');
var $boards         = $('#boards');
var $boardTemplate  = $('#boardTemplate');

//------------------------------------------------------------------------------

// toggle scan button state
function setScanButtonMode(mode) {
    $scanButtonText.text(mode);

    if (mode === 'scan' || mode === 'resume') {
        if (mode === 'scan') {
            $stopButton.toggleClass('hidden', true);
        }
        $scanButton.toggleClass('btn-primary', true);
        $scanButton.toggleClass('btn-warning', false);
        $scanButtonIcon.toggleClass('glyphicon-play', true);
        $scanButtonIcon.toggleClass('glyphicon-pause', false);
    }
    else if (mode === 'pause') {
        $stopButton.toggleClass('hidden', false);
        $scanButton.toggleClass('btn-warning', true);
        $scanButton.toggleClass('btn-primary', false);
        $scanButtonIcon.toggleClass('glyphicon-pause', true);
        $scanButtonIcon.toggleClass('glyphicon-play', false);
    }
}

// update progression labels
function setProgression(scanned, total, found) {
    $scannedLabel.text(scanned);
    $totalLabel.text(total);
    $foundLabel.text(found);
}

// add a new board
var boards = {};

function addBoard(board) {
    if (boards[board.ip]) {
        return;
    }

    boards[board.ip] = board;

    var boardId  = board.ip.replace(/\./g, '-');
    var template = $boardTemplate.html().toString();

    template = template.replace(/{{ip}}/g, board.ip);
    template = template.replace(/{{branch}}/g, board.branch);
    template = template.replace(/{{hash}}/g, board.hash);
    template = template.replace(/{{upToDate}}/g, board.upToDate);
    template = template.replace(/{{date}}/g, board.date);
    template = template.replace(/{{mcu}}/g, board.mcu);
    template = template.replace(/{{clock}}/g, board.clock);
    template = template.replace(/{{id}}/g, boardId);

    if (board.upToDate < 0) {
        template = template.replace(/{{outdated}}/g, '> 30 commits');
    }
    else {
        template = template.replace(/{{outdated}}/g, board.upToDate + ' commits');
    }

    $boards.append(template);

    if (board.upToDate !== 0) {
        var $hash          = $('#' + boardId + '-hash');
        var $upToDate      = $('#' + boardId + '-upToDate');
        var $updateMessage = $('#' + boardId + '-updateMessage');
        $hash.toggleClass('label-warning', true);
        $hash.toggleClass('label-info', false);
        $upToDate.toggleClass('label-warning', true);
        $upToDate.toggleClass('label-info', false);
        $updateMessage.toggleClass('hidden', false);
    }
}

//------------------------------------------------------------------------------

// on scan button click
$scanButton.on('click', function() {
    // start scann
    if (! sh.network.scanner.scanning) {
        // if scan is aborted
        if (sh.network.scanner.aborted) {
            // resume scan
            sh.network.scanner.resume($timeoutInput.val());
        }
        else {
            // start scan
            sh.network.scanner.scan($ipInput.val(), $timeoutInput.val());
        }
    }
    else {
        // abort scanning
        sh.network.scanner.abort();
    }
    return false;
});

// on stop button click
$stopButton.on('click', function() {
    // stop scan
    sh.network.scanner.stop();
});

//------------------------------------------------------------------------------

// defaults inputs values
$ipInput.val(sh.network.scanner.input);
$timeoutInput.val(sh.network.scanner.timeout);

// show/hide boards panel
$noBoards.show();
$boards.hide();

// // on ip input change
// $ipInput.on('change', function() {
//     sh.network.scanner.setInput($ipInput.val());
// });

//
// // on timeout input change
// $timeoutInput.on('change', function() {
//     sh.network.scanner.setTimeout($timeoutInput.val());
// });

//------------------------------------------------------------------------------

// on scan start
sh.network.scanner.onStart = function(queue) {
    // reset progression
    setProgression(0, 0, 0);

    // set scan button mode
    setScanButtonMode('pause');
};

// on scan progress (called after an ip was scanned)
sh.network.scanner.onProgress = function(ip, board, scanner) {
    // update progression
    setProgression(scanner.scanned, scanner.total, scanner.found);

    // set found label color
    if (scanner.found) {
        $foundLabel.toggleClass('label-success', true);
        $foundLabel.toggleClass('label-danger', false);
    }
    else {
        $foundLabel.toggleClass('label-danger', true);
        $foundLabel.toggleClass('label-success', false);
    }

    // board found
    // if (board) {
    //     console.log('smoothie:', ip, board);
    // }
};

// on board found
sh.network.scanner.onBoard = function(board) {
    addBoard(board);
    $noBoards.hide();
    $boards.show();
};

// on scan aborted
sh.network.scanner.onAbort = function(scanner) {
    // set scan button mode
    setScanButtonMode('resume');
};

// on resume scan
sh.network.scanner.onResume = function(scanner) {
    // set scan button mode
    setScanButtonMode('pause');
};

// on scan stoped
sh.network.scanner.onStop = function(scanner) {
    // set scan button mode
    setScanButtonMode('scan');
};

// on scan end
sh.network.scanner.onEnd = function(found) {
    // set scan button mode
    setScanButtonMode('scan');
};

//------------------------------------------------------------------------------

// debug...
console.log('sh:', sh);
