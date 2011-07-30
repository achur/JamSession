$(function(){
    jss = new io.Socket(window.location.hostname,
                      {port : 8888, 
                       rememberTransport : false,
                       resource: 'JamSessionSocket/' + score + '-' + user_name});
    jss.connect();
    
    jss.addEvent('connect', function(data) {
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
    // console.log("Sending Socket Request: " + package);
    s.send(package);
}

function jss_addNote(value, start, length, instrument) {
    // value (str), start (float), length (float), instrument (str)
    jss_sendPackage({'method': 'addNote', 
                     'note': {'value': value, 'start': start, 
                              'length': length, 'instrument': instrument}});
}

function jss_removeNote(value, start, length, instrument) {
    // value (str), start (float), length (float), instrument (str)
    jss_sendPackage({'method': 'removeNote', 
                     'note': {'value': value, 'start': start, 
                              'length': length, 'instrument': instrument}});
}

function jss_addMeasure(keysig, onsetTime, tempo) {
    // keysig (str), onsetTime (float), tempo (int)
    jss_sendPackage({'method': 'addMeasureBlock', 
                     'measure': {'keysig': keysig, 'onsetTime': onsetTime, 'tempo': tempo}});
}

function jss_removeMeasure(keysig, onsetTime, tempo) {
    // keysig (str), onsetTime (float), tempo (int)
    jss_sendPackage({'method': 'removeMeasureBlock', 
                     'measure': {'keysig': keysig, 'onsetTime': onsetTime, 'tempo': tempo}});
}

function jss_getScore() {
    jss_sendPackage({'method': 'getScore'});
}

function jss_clearScore() {
    jss_sendPackage({'method': 'clearScore'});
}
	
	<!-- <script type="text/x-jqote-template" id="piano-roll-template"> -->
	<!--     <![CDATA[ -->
	<!--     	<% for (key in this.keys) {%> -->
	<!-- 			<tr class="piano-roll-row"> -->
	<!-- 				<td class="piano-roll-row-key"> -->
	<!-- 					<img src = '<%= "img/key" + this.keys[key] + ".png" %>'> -->
	<!-- 				</td> -->
	<!-- 				<td class="piano-roll-row-roll"> -->
	<!-- 				</td> -->
	<!-- 			</tr> -->
	<!-- 		<% } %> -->
	<!-- 		<div class="piano-roll-play-cursor"></div> -->
	<!--     ]]> -->
	<!-- </script> -->
	
	
	<!-- <script type="text/x-jqote-template" id="piano-note-template"> -->
	<!--     <![CDATA[ -->
	<!--     	<div class = "piano-note <%= this.id %>" style = '<%= "width: " + this.width + "px; background-color: " + this.color %>'></div> -->
	<!--     ]]> 
	<!-- </script> -->
  
