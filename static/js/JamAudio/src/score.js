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
			if(!this.blocks()) this.blocks([]);
		},
		
		__instancevars__: ["notes", "blocks"],
		
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

