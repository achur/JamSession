var JamSynth;
var JamKit;
var JamKitBox;

(function()
{
	function constructStandardKitList(folder)
	{
		var toReturn = [];
		toReturn.push("samples/" + folder + "/hihat.wav");
		toReturn.push("samples/" + folder + "/kick.wav");
		toReturn.push("samples/" + folder + "/snare.wav");
		toReturn.push("samples/" + folder + "/tom1.wav");
		toReturn.push("samples/" + folder + "/tom2.wav");
		toReturn.push("samples/" + folder + "/tom3.wav");
		return toReturn;
	}
	
	var kitLoops = 	{
		"acoustic": constructStandardKitList("acoustic"),
		"techno": constructStandardKitList("Techno"),
		"R8": constructStandardKitList("R8"),
		"bongos": constructStandardKitList("Bongos")
	};
	
	var Synth = Class.$extend(
	{
		__init__: function(context, sampleRate, numChannels)
		{
			sampleRate || (sampleRate = 44100);
			numChannels || (numChannels = 2);
			this.sample_rate(sampleRate);
			this.num_channels(numChannels);
			this._dsp = new signalProcessor();
			context ? this._context = context : this._context = new webkitAudioContext();
			this._masterGainNode = this._context.createGainNode();
			this._masterGainNode.gain.value = 0.7;
			this._masterGainNode.connect(this._context.destination);
			this._compressor = this._context.createDynamicsCompressor();
			this._compressor.connect(this._masterGainNode);
			this._convolver = this._context.createConvolver();
			this._convolver.connect(this._masterGainNode);
		},
		
		playNote: function(noteName, numSecs, gain, convolutions)
		{
			return this.playHertz(this._getHertz(noteName), numSecs, gain, convolutions);
		},
		
		playHertz: function(hertz, numSecs, gain, convolutions)
		{
			numSecs || (numSecs = 1);
			gain || (gain = 1);
			
			var source = this._context.createBufferSource();
			framelen = numSecs > 0 ? numSecs: 1;
			source.buffer = this._context.createBuffer(this.num_channels(), framelen * this.sample_rate(), this.sample_rate());
			var osc = new this._dsp.Oscillator(this._dsp.SINE, hertz, gain, framelen * this.sample_rate(), this.sample_rate());
			osc.generate();
			for(var i = 0; i < this.num_channels(); ++i)
			{
				source.buffer.getChannelData(i).set(osc.signal);
			}
			
			var filter = this._context.createBiquadFilter();
			filter.frequency.value = 22050;
			filter.Q.value = 5;
			source.connect(filter);
			
			var dryGainNode = this._context.createGainNode();
			dryGainNode.gain.value = gain;
			filter.connect(dryGainNode);
			dryGainNode.connect(this._compressor);
			
			var wetGainNode = this._context.createGainNode();
			wetGainNode.gain.value = gain;
			filter.connect(wetGainNode);
			wetGainNode.connect(this._convolver);
			
			if(numSecs < 0) source.looping = true;
			source.noteOn(0);
			var obj = {};
			obj._source = source;
			obj.stop = function() { this._source.noteOff(0); };
			return obj;
		},
		
		_getHertz: function(noteName)
		{
			var noteTable = { "G9": 0x7F, "Gb9": 0x7E, "F9": 0x7D, "E9": 0x7C, "Eb9": 0x7B,
			"D9": 0x7A, "Db9": 0x79, "C9": 0x78, "B8": 0x77, "Bb8": 0x76, "A8": 0x75, "Ab8": 0x74,
			"G8": 0x73, "Gb8": 0x72, "F8": 0x71, "E8": 0x70, "Eb8": 0x6F, "D8": 0x6E, "Db8": 0x6D,
			"C8": 0x6C, "B7": 0x6B, "Bb7": 0x6A, "A7": 0x69, "Ab7": 0x68, "G7": 0x67, "Gb7": 0x66,
			"F7": 0x65, "E7": 0x64, "Eb7": 0x63, "D7": 0x62, "Db7": 0x61, "C7": 0x60, "B6": 0x5F,
			"Bb6": 0x5E, "A6": 0x5D, "Ab6": 0x5C, "G6": 0x5B, "Gb6": 0x5A, "F6": 0x59, "E6": 0x58,
			"Eb6": 0x57, "D6": 0x56, "Db6": 0x55, "C6": 0x54, "B5": 0x53, "Bb5": 0x52, "A5": 0x51,
			"Ab5": 0x50, "G5": 0x4F, "Gb5": 0x4E, "F5": 0x4D, "E5": 0x4C, "Eb5": 0x4B, "D5": 0x4A,
			"Db5": 0x49, "C5": 0x48, "B4": 0x47, "Bb4": 0x46, "A4": 0x45, "Ab4": 0x44, "G4": 0x43,
			"Gb4": 0x42, "F4": 0x41, "E4": 0x40, "Eb4": 0x3F, "D4": 0x3E, "Db4": 0x3D, "C4": 0x3C,
			"B3": 0x3B, "Bb3": 0x3A, "A3": 0x39, "Ab3": 0x38, "G3": 0x37, "Gb3": 0x36, "F3": 0x35,
			"E3": 0x34, "Eb3": 0x33, "D3": 0x32, "Db3": 0x31, "C3": 0x30, "B2": 0x2F, "Bb2": 0x2E,
			"A2": 0x2D, "Ab2": 0x2C, "G2": 0x2B, "Gb2": 0x2A, "F2": 0x29, "E2": 0x28, "Eb2": 0x27,
			"D2": 0x26, "Db2": 0x25, "C2": 0x24, "B1": 0x23, "Bb1": 0x22, "A1": 0x21, "Ab1": 0x20,
			"G1": 0x1F, "Gb1": 0x1E, "F1": 0x1D, "E1": 0x1C, "Eb1": 0x1B, "D1": 0x1A, "Db1": 0x19,
			"C1": 0x18, "B0": 0x17, "Bb0": 0x16, "A0": 0x15, "Ab0": 0x14, "G0": 0x13, "Gb0": 0x12,
			"F0": 0x11, "E0": 0x10, "Eb0": 0x0F, "D0": 0x0E, "Db0": 0x0D, "C0": 0x0C };
			var a4 = noteTable["A4"];
			var note = noteTable[noteName];
			if(!note) throw new Error("You entered a note that does not exist!");
			return 440 * Math.pow(2, (note - a4)/12);
		},
		
		__instancevars__: ["sample_rate", "num_channels"]
	});
	
	var Kit = Class.$extend(
	{
		__init__: function(kitPaths, loadCallback, context, sampleRate, numChannels)
		{
			sampleRate || (sampleRate = 44100);
			numChannels || (numChannels = 2);
			this.sample_rate(sampleRate);
			this.num_channels(numChannels);
			if(!loadCallback) throw new Error("You have to hand me a callback function!");
			this._loadCallback = loadCallback;
			if(!kitPaths || !kitPaths.length || kitPaths.length < 1) throw new Error("You didn't enter anything for my kit!");
			this.kit_paths(kitPaths);
			context ? this._context = context : this._context = new webkitAudioContext();
			this._masterGainNode = this._context.createGainNode();
			this._masterGainNode.gain.value = 0.7;
			this._masterGainNode.connect(this._context.destination);
			this._compressor = this._context.createDynamicsCompressor();
			this._compressor.connect(this._masterGainNode);
			this._convolver = this._context.createConvolver();
			this._convolver.connect(this._masterGainNode);
			
			var buffers = [];
			for(var i = 0 ; i < this.kit_paths().length; ++i) buffers.push(0);
			this.buffers(buffers);
			
			this._loadCount = 0;
			for(var j = 0; j < this.kit_paths().length; ++j)
			{
				this.loadSample(j);
			}
			
			this._hasEffect = false;
		},
		
		loadSample: function(sampleId)
		{
			var request = new XMLHttpRequest();
			request.open("GET", this.kit_paths()[sampleId], true);
			request.responseType = "arraybuffer";
			var self = this;
			request.onload = function()
			{
				var buffer = self._context.createBuffer(request.response, false);
				self.buffers()[sampleId] = buffer;
				self._loadCount++;
				if(self._loadCount == self.kit_paths().length) self._loadCallback();
			};
			
			request.send();
		},
		
		playIndex: function(index, sendGain, mainGain, cutoff, resonance)
		{
			var source = this._context.createBufferSource();
			source.buffer = this.buffers()[index];
			
			var filter = this._context.createBiquadFilter();
			filter.frequency.value = cutoff;
			filter.Q.value = resonance;
			
			source.connect(filter);
			
			var dryGainNode = this._context.createGainNode();
			dryGainNode.gain.value = mainGain;
			filter.connect(dryGainNode);
			dryGainNode.connect(this._compressor);
			
			if(this._hasEffect) {
				var wetGainNode = this._context.createGainNode();
				wetGainNode.gain.value = sendGain;
				filter.connect(wetGainNode);
				wetGainNode.connect(this._convolver);
			}
			
			source.noteOn(0);
		},
		
		playNote: function(noteName, sendGain, mainGain, cutoff, resonance)
		{
			var index = this._getNoteIndex(noteName);
			console.log(index);
			this.playIndex(index, sendGain, mainGain, cutoff, resonance);
		},
		
		_getNoteIndex: function(noteName)
		{
			var noteTable = { "G9": 0x7F, "Gb9": 0x7E, "F9": 0x7D, "E9": 0x7C, "Eb9": 0x7B,
			"D9": 0x7A, "Db9": 0x79, "C9": 0x78, "B8": 0x77, "Bb8": 0x76, "A8": 0x75, "Ab8": 0x74,
			"G8": 0x73, "Gb8": 0x72, "F8": 0x71, "E8": 0x70, "Eb8": 0x6F, "D8": 0x6E, "Db8": 0x6D,
			"C8": 0x6C, "B7": 0x6B, "Bb7": 0x6A, "A7": 0x69, "Ab7": 0x68, "G7": 0x67, "Gb7": 0x66,
			"F7": 0x65, "E7": 0x64, "Eb7": 0x63, "D7": 0x62, "Db7": 0x61, "C7": 0x60, "B6": 0x5F,
			"Bb6": 0x5E, "A6": 0x5D, "Ab6": 0x5C, "G6": 0x5B, "Gb6": 0x5A, "F6": 0x59, "E6": 0x58,
			"Eb6": 0x57, "D6": 0x56, "Db6": 0x55, "C6": 0x54, "B5": 0x53, "Bb5": 0x52, "A5": 0x51,
			"Ab5": 0x50, "G5": 0x4F, "Gb5": 0x4E, "F5": 0x4D, "E5": 0x4C, "Eb5": 0x4B, "D5": 0x4A,
			"Db5": 0x49, "C5": 0x48, "B4": 0x47, "Bb4": 0x46, "A4": 0x45, "Ab4": 0x44, "G4": 0x43,
			"Gb4": 0x42, "F4": 0x41, "E4": 0x40, "Eb4": 0x3F, "D4": 0x3E, "Db4": 0x3D, "C4": 0x3C,
			"B3": 0x3B, "Bb3": 0x3A, "A3": 0x39, "Ab3": 0x38, "G3": 0x37, "Gb3": 0x36, "F3": 0x35,
			"E3": 0x34, "Eb3": 0x33, "D3": 0x32, "Db3": 0x31, "C3": 0x30, "B2": 0x2F, "Bb2": 0x2E,
			"A2": 0x2D, "Ab2": 0x2C, "G2": 0x2B, "Gb2": 0x2A, "F2": 0x29, "E2": 0x28, "Eb2": 0x27,
			"D2": 0x26, "Db2": 0x25, "C2": 0x24, "B1": 0x23, "Bb1": 0x22, "A1": 0x21, "Ab1": 0x20,
			"G1": 0x1F, "Gb1": 0x1E, "F1": 0x1D, "E1": 0x1C, "Eb1": 0x1B, "D1": 0x1A, "Db1": 0x19,
			"C1": 0x18, "B0": 0x17, "Bb0": 0x16, "A0": 0x15, "Ab0": 0x14, "G0": 0x13, "Gb0": 0x12,
			"F0": 0x11, "E0": 0x10, "Eb0": 0x0F, "D0": 0x0E, "Db0": 0x0D, "C0": 0x0C };
			var c0 = noteTable["C0"];
			var note = noteTable[noteName];
			console.log(c0);
			console.log(note);
			return (note - c0) % this.kit_paths().length;
		},
		
		__instancevars__: ["sample_rate", "num_channels", "kit_paths", "buffers"]
	});
	
	/*
	 *  Library for a bunch of kits to share an audiocontext.
	 *  Also convenient for playing notes.
	 */
	var KitBox = Class.$extend(
	{
		__init__: function()
		{
			this._kits = {};
			this._context = new webkitAudioContext();
		},
		
		loadKit: function(kitName, kitList, callbackFn)
		{
			console.log(kitList);
			this._kits[kitName] = new Kit(kitList, callbackFn, this._context);
		},
		
		loadKitByName: function(kitName, callbackFn)
		{
			console.log(kitLoops);
			this.loadKit(kitName, kitLoops[kitName], callbackFn);
		},
		
		loadKitsByNames: function(kitNames, callbackFn)
		{
			var curCount = 0;
			var total = kitNames.length;
			var fn = function()
			{
				curCount++;
				if(curCount === total) callbackFn();
			};
			for(var i = 0; i < kitNames.length; ++i)
			{
				this.loadKitByName(kitNames[i], fn);
			}
		},
		
		playNote: function(kitName, noteName)
		{
			this._kits[kitName].playNote(noteName);
		}
	});
	
	JamSynth = Synth;
	JamKit = Kit;
	JamKitBox = KitBox;
	
})();

