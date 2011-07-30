var id = 1;
var user_name = "crazy_dan";
var score = "crazy";

$(function() {
	setupPianoRoll();
	setupJamSession();
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
	$("#piano-roll").jqotepre('#piano-roll-template', {numKeys: 88, keys: keys, fake: "3"});
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
	$("#piano-roll tbody").jqotepre('#piano-note-template', {id: config.id, width: config.width, color: config.color})
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

function setupJamSession()
{
	/*var s = new io.Socket(window.location.hostname,
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
		console.log(data);
    });*/
}

