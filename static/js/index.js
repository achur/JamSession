var id = 1;
var user_name = "crazy_dan";
var score = "crazy";
var scoreObj = new JamScore(score);
var player = new JamScorePlayer(scoreObj, function() { console.log("loaded"); });
var piano_roll_template = '<tbody>\
			{{#keys}}\
				<tr class="piano-roll-row {{note}}" onclick="addNote(event)">\
					<td class="piano-roll-row-key {{note}}">\
						<img class="piano-key-image {{note}}" src="/static/img/key{{key}}.png">\
					</td>\
					<td class="piano-roll-row-roll {{note}}">\
					</td>\
				</tr>\
			{{/keys}}\
<div class="piano-roll-play-cursor"></div>\
</tbody>';

var piano_note_template = '<div class = "piano-note {{id}}" style = "top: {{top}}px; left: {{left}}px; width: {{width}}px; background-color: {{color}}"\
 ondblclick="removeNote(event)"></div>'

var noteNames = ["C9" , "B8" , "Bb8" , "A8" , "Ab8" ,
"G8" , "Gb8" , "F8" , "E8" , "Eb8" , "D8" , "Db8" ,
"C8" , "B7" , "Bb7" , "A7" , "Ab7" , "G7" , "Gb7" ,
"F7" , "E7" , "Eb7" , "D7" , "Db7" , "C7" , "B6" ,
"Bb6" , "A6" , "Ab6" , "G6" , "Gb6" , "F6" , "E6" ,
"Eb6" , "D6" , "Db6" , "C6" , "B5" , "Bb5" , "A5" ,
"Ab5" , "G5" , "Gb5" , "F5" , "E5" , "Eb5" , "D5" ,
"Db5" , "C5" , "B4" , "Bb4" , "A4" , "Ab4" , "G4" ,
"Gb4" , "F4" , "E4" , "Eb4" , "D4" , "Db4" , "C4" ,
"B3" , "Bb3" , "A3" , "Ab3" , "G3" , "Gb3" , "F3" ,
"E3" , "Eb3" , "D3" , "Db3" , "C3" , "B2" , "Bb2" ,
"A2" , "Ab2" , "G2" , "Gb2" , "F2" , "E2" , "Eb2" ,
"D2" , "Db2" , "C2" , "B1" , "Bb1" , "A1" , "Ab1" ,
"G1" , "Gb1" , "F1" , "E1" , "Eb1" , "D1" , "Db1" ,
"C1" , "B0" , "Bb0" , "A0" , "Ab0" , "G0" , "Gb0" ,
"F0" , "E0" , "Eb0" , "D0" , "Db0" , "C0" ];

$(function() {
	setupPianoRoll();
	
	
	/*addNote({width: 50, color: "red", id: id});
	addNote({width: 90, color: "blue", id: id});
	addNote({width: 90, color: "green", id: id});
	addNote({width: 90, color: "yellow", id: id});
	addNote({width: 90, color: "pink", id: id});
	addNote({width: 90, color: "orange", id: id});*/
	
});

function addNote(event)
{
	console.log(event);
	var element = event.srcElement;
	var element = element.classList.contains("piano-roll-row") ? element.children[0] : element;
	console.log(event.srcElement.classList[1]);
	//console.log(noteNames[parseInt(element.classList[1])]);
	var note = scoreObj.getNoteForTime(element.classList[1], parseFloat(event.pageX - 104 > 0 ? event.pageX - 104 : 0)/100, 0.5, "synth");
	console.log(note);
	console.log(note);
	scoreObj.appendNote(note);
	drawNote(note, element);
	return true;
}

function removeNote(event)
{
	var note = event.srcElement._$note;
	scoreObj.removeNote(note);
}

function setupPianoRoll()
{
	var keys = [1,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,4];
	for (var i = 0; i < keys.length; i++)
	{
		keys[i] = 
		{
			key: keys[i],
			note: noteNames[i]
		};
	}
	var counter = 0;
	var count = function () {
	            return function (text, render) {
	                // note that counter is in the enclosing scope
	                return counter++;
	            }
	        }  
	var html = Mustache.to_html(piano_roll_template, {keys: keys, count: count});
	$("#piano-roll").append(html);
	console.log(keys.length);
}

function animateCursor()
{
	/*$(".piano-roll-play-cursor").animate({ left: '+=10'}, 500, 'linear', function()
	{
				animateCursor();
	});*/
}

function drawNote(note, element)
{
	var draggableOptions = 
	{ 
		containment: "#piano-roll tbody", 
		snap: ".piano-roll-row-roll", 
		snapMode: "inner",
		snapTolerance: 6,
		cursor: 'move',
		drag: updateNotePosition
	};
	var resizableOptions =
	{
		minHeight: 10,
		maxHeight: 10,
		handles: 'e,w',
		containment: "#piano-roll tbody",
		resize: updateNotePosition
	}	
	console.log(draggableOptions);
  var html = Mustache.to_html(piano_note_template, 
	{
		id: id, 
		top: element.offsetTop, 
		left: 96 + scoreObj.getTimeForBeat(note.start())*100, 
		width: scoreObj.getTimeForBeat(note.length())*100,
		color: "red"
	});
console.log(html);
  $("#piano-roll tbody").append(html);
	$(".piano-note." + id).draggable(draggableOptions);
	$(".piano-note." + id).resizable(resizableOptions);
	$(".piano-note." + id)._$note = note;
	id++;
}

function togglePlaying(event)
{
	var playing = event.srcElement.src.match("img/pausebutton.png");
	event.srcElement.src = (playing ? "/static/img/playbutton.png" : "/static/img/pausebutton.png");
	if (!playing) //weren't playing -> now playing
	{
		player.startPlaying(0);
	}
}

function updateNotePosition(event, ui)
{
	resizePianoRoll(event);	
}

function resizePianoRoll(event)
{
	var maxX = event.srcElement.offsetLeft + event.srcElement.clientWidth;
	if (maxX > parseInt($("#piano-roll").css("width")))
	{
		$(".piano-roll-row, #piano-roll").css("width", maxX);
		$(".piano-roll-row-roll").css("width", maxX - 90);
	}
}



