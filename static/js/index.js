var id = 1;
var user_name = "crazy_dan";
var score = "crazy";
var piano_roll_template = '{{#keys}}\
				<tr class="piano-roll-row">\
					<td class="piano-roll-row-key">\
						<img src="/static/img/key{{.}}.png">\
					</td>\
					<td class="piano-roll-row-roll">\
					</td>\
				</tr>\
			{{/keys}}\
<div class="piano-roll-play-cursor"></div>';

var piano_note_template = '<div class = "piano-note {{id}}" style = "width: {{width}}px; background-color: {{color}}"></div>'


$(function() {
	setupPianoRoll();
	addNote({width: 50, color: "red", id: id});
	addNote({width: 90, color: "blue", id: id});
	addNote({width: 90, color: "green", id: id});
	addNote({width: 90, color: "yellow", id: id});
	addNote({width: 90, color: "pink", id: id});
	addNote({width: 90, color: "orange", id: id});
	
});

function setupPianoRoll()
{
	var keys = [1,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,2,1,3,2,3,2,3,2,1,3,2,3,4];

  var html = Mustache.to_html(piano_roll_template, {numKeys: 88, keys: keys, fake: "3"});
	$("#piano-roll").append(html);
	animateCursor();
}

function animateCursor()
{
	$(".piano-roll-play-cursor").animate({ left: '+=10'}, 500, 'linear', function()
	{
				animateCursor();
	});
}

function addNote(config)
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
		minHeight: 12,
		maxHeight: 12,
		handles: 'e,w',
		containment: "#piano-roll tbody",
		resize: updateNotePosition
	}	
	console.log(draggableOptions);
  var html = Mustache.to_html(piano_note_template, {id: config.id, width: config.width, color: config.color});
  $("#piano-roll tbody").append(html);
	$(".piano-note." + config.id).draggable(draggableOptions);
	$(".piano-note." + config.id).resizable(resizableOptions);
	id++;
}

function updateNotePosition(event, ui)
{
	resizePianoRoll(event);	
}

function resizePianoRoll(event)
{
	var maxX = event.srcElement.offsetLeft + event.srcElement.clientWidth;
	if (maxX > parseInt($(".piano-roll-row-roll").css("width")))
	{
		$(".piano-roll-row-roll").css("width", maxX);
	}
}



