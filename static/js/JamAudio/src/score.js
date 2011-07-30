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
		}
	});
	
	JamScore = Score;
	
})();

