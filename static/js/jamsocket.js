$(function(){
    jss = new io.Socket(window.location.hostname,
                      {port : 8888, 
                       rememberTransport : false,
                       resource: 'JamSessionSocket/' + score + '-' + user_name});
    jss.connect();
    
    jss.addEvent('connect', function(data) {
        return;
        // console.log(data)
    });
    
    jss.addEvent('message', jss_recievePackage);
});  

function jss_recievePackage(package) {
    // console.log("Received Socket Data: " + package);
    var pack = JSON.parse(package);
    var method = pack['method'];
    if (method == 'clearScore') return;
    else if (method == 'getScore') return;
    else if (method == 'addNote') return;
    else if (method == 'removeNote') return;
    else if (method == 'addMeasureBlock') return;
    else if (method == 'removeMeasureBlock') return;
    else return;
}

function jss_sendPackage(package) {
    var package = JSON.stringify(package);
    console.log("Sending Socket Request: " + package);
    s.send(package);
}

function jss_addNote(note) {
    jss_sendPackage({'method': 'addNote', 
                     'note': {note}});
}

function jss_removeNote(note) {
    jss_sendPackage({'method': 'removeNote', 
                     'note': {note}});
}

function jss_addMeasure(measure) {
    jss_sendPackage({'method': 'addMeasureBlock', 
                     'measure': {measure}});
}

function jss_removeMeasure(measure) {
    jss_sendPackage({'method': 'removeMeasureBlock', 
                     'measure': {measure}});
}

function jss_getScore() {
    jss_sendPackage({'method': 'getScore'});
}

function jss_clearScore() {
    jss_sendPackage({'method': 'clearScore'});
}

