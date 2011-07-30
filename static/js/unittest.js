
user_name = "crazy_dan";
score = "crazy";

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};


$(function(){
    s = new io.Socket(window.location.hostname,
                      {port : 8888, 
                       rememberTransport : false,
                       resource: 'JamSessionSocket/' + score + '-' + user_name});
    s.connect();
    
    s.addEvent('connect', function(data) {
        // console.log(data)
    });
    
    s.addEvent('message', function(data) {
        console.log("Received Socket Data: " + data);
        var data = JSON.parse(data);
    });
    addTestClickHandler();
});    
    
function submitPack(package) {
    var package = JSON.stringify(package);
    console.log("Submitting JamSessionSocket Request: " + package);
    s.send(package);
}

function addTestClickHandler() {
    function removeNote(note) {
        submitPack({'method': 'removeNote',
                    'note': note});
    }
    function addNote(note) {
        submitPack({'method': 'addNote',
                    'note': note});
    }
    function addMeasure(measure) {
        submitPack({'method': 'addMeasureBlock',
                    'measureBlock': measure});
    }
    function removeMeasure(measure) {
        submitPack({'method': 'removeMeasureBlock',
                    'measureBlock': measure});
    }
    function getScore() {
        submitPack({'method': 'getScore'});
    }
    function clearScore(){
        submitPack({'method': 'clearScore'});
    }

    $('#unittest').click(function (event) {
        clearScore();
        var note1 = { 'value': 'Bb6', 'start': 30,
                      'length': 2, 'instrument': 'piano'};
        
        var note2 = { 'value': 'A4', 'start': 30,
                      'length': 2, 'instrument': 'piano'};

        var measure1 =  {'keysig': 4, 'onsetTime': 2,
                         'tempo': 120};
        
        var measure2 =  {'keysig': 4, 'onsetTime': 2,
                         'tempo': 120};
        addNote(note1); addNote(note2); removeNote(note1);
        addMeasure(measure1); addMeasure(measure2); removeMeasure(measure2);
        getScore();
        return false;   
    });
}
