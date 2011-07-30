var JamScore;

(function()
{	
	var Note = Class.$extend(
	{
		__init__: function(json)
		{
			if(json) this.fromJSON(json);
			else throw new Error("You can't create a note with no properties!");
		},
		
		__instancevars__: ["value", "start", "length", "instrument"]
	});
	
	var Block = Class.$extend(
	{
		__init__: function(json)
		{
			if(json) this.fromJSON(json);
			else throw new Error("You can't create a block with no properties!");
		},
		
		__instancevars__: ["keysig", "onsetTime", "tempo"]
	});
	
	var Score = Class.$extend(
	{
		__init__: function(json)
		{
			if(json) this.fromJSON(json);
			if(!this.notes()) this.notes([]);
			if(!this.blocks()) this.blocks([
				new Block( {keysig : "4", onsetTime : "0", tempo: 120} );
			]);
		},
		
		__instancevars__: ["notes", "blocks"],
		
		getNoteForTime(val, secsStartTime, secsLength, inst)
		{
			var totalTime = 0;
			var totalBeats = 0;
			var blk;
			for(blk = 1; blk < this.blocks().length; ++blk)
			{
				var numBeats = this.blocks()[blk].onsetTime - this.blocks()[blk - 1].onsetTime;
				totalBeats += numBeats;
				var numSecs = (60/this.blocks()[blk-1].tempo) * numBeats;
				totalTime += numSecs;
				if(totalTime > secsStartTime) {
					break;
					totalTime -= numSecs;
					totalBeats -= numBeats;
				}
			}
			var block = this.blocks()[blk - 1];
			var st = (secsStartTime - totalTime) * (block.tempo/60) + totalBeats;
			var len = secsLength * (block.tempo/60);
			return new Note( { value: val, start: st, length: len, instrument: inst } );
		},
		
		appendNote: function(note)
		{
			if(!note || !(note instanceof Note)) throw new Error("You tried to add a note that wasn't a note!");
			notes.push(note);
			this.sortNotes();
		},
		
		appendNotes: function(noteList)
		{
			this.notes().concat(noteList);
			this.sortNotes();
		},
		
		sortNotes: function()
		{
			// Re-sort
			this.notes().sort( function(a,b) { return (a.start - b.start); } );
		},
		
		changeNote: function(originalNote, newNote)
		{
			this.removeNote(originalNote);
			this.appendNote(note);
		},
		
		removeNote: function(note)
		{
			var index = this._getNoteIndex(note);
			if(index >= 0)
			{
				this.notes().splice(index, 1);
			}
		},
		
		_getNoteIndex(note)
		{
			var start = note.start();
			for(var i = 0; i < this.notes().length; ++i)
			{
				var curStart = this.notes()[i].start();
				if(curStart >= start)
				{
					if(curStart > start) return -1;
					return this.notes()[i].value() === note.value() && this.notes()[i].length() === note.length() && this.notes()[i].instrument() === note.instrument() && curStart === start;
				}
			}
			return -1;
		}
	});
	
	JamScore = Score;
	
})();

