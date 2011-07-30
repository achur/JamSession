var VirtualKeyboard;
var nonce = "" + Math.random();
console.log(nonce);  
  
(function()
{ 
  var BASE_TABLE = {"65": "C", "87": "Db", "83": "D", "69": "Eb", "68": "E",
                    "70": "F", "84": "Gb", "71": "G", "89": "Ab", "72": "A",
                    "85": "Bb", "74": "B", "75": "C", "79": "Db", "76": "D",
                    "80": "Eb", "186":"E", "222": "F"};

  var KeyboardState = Class.$extend({
    __init__: function() {
      this._octave = 4;
      this._keyTable = { };
      var prohibited = [90,88,67,86,66,78,77,81,82,73];
      
      for (var i = 49; i < 91; ++i) {
        if (i > 57 && i < 65) {
          continue;
        } else if ($.inArray(parseInt(i),prohibited) != -1) {
          continue;
        }

        this._keyTable[""+i] = 0;
      }

      this._keyTable["186"] = 0;
      this._keyTable["222"] = 0;
    },

    isAffectedKey: function(key) {
      return key in this._keyTable;
    },

    isOctaveKey: function(key) {
      return this.isAffectedKey(key) && (parseInt(key) <= 57);
    },

    press: function(key,callback) {
      this._keyTable[key] = callback;

      var keyValue = parseInt(key);
      if (keyValue >= 49 && keyValue <= 57) {
        this._octave = keyValue - 49;
      }
    },

    release: function(key) {
      var callback = this._keyTable[key];
      this._keyTable[key] = 0;
      return callback;
    },

    isPressed: function(key) {
      return this._keyTable[key];
    },

    getNoteForKey: function(key) {
      if (this.isOctaveKey(key)) {
        return null;
      }

      var octave = this._octave;
      if ($.inArray(parseInt(key),[75,76,186,222,79,80]) != -1) {
        octave += 1;
      }

      var base = BASE_TABLE[key];
      return base + octave;
    }
  });

  var createSynthKeydownHandler = function(k)
  {
    return function(e)
    {
      var kc = e.keyCode;
      if (!k.keyboardState.isAffectedKey(kc)) return;

      if (k.keyboardState.isOctaveKey(kc)) {
        k.keyboardState.press(kc);
        return;
      }

      var note = k.keyboardState.getNoteForKey(kc);
      if (!k.keyboardState.isPressed(kc)) {
        console.log(kc + " " + note);
        
        
        
        console.log(k._socket.emit('noteDown', note) );
        
        
        
        var callback = k.synth.playNote(note,-1);
        callback.startTime = (new Date()).getTime();
        callback.note = note;
        k.keyboardState.press(kc,callback);
      }
    };
  };

  var createSynthKeyupHandler = function(k)
  {
    return function(e)
    {
      var kc = e.keyCode;
      if (!k.keyboardState.isAffectedKey(kc)) return;
      var callback = k.keyboardState.release(kc);
      if (callback) {
        var noteEntry = { 'startTime': callback.startTime,
                          'endTime': (new Date()).getTime(),
                          'note': callback.note };
        k.noteLog.push(noteEntry);
        callback.stop();
      }
    };
  };

  Keyboard = Class.$extend(
  {
    __init__: function(window_,synth,recorder)
    {
    	
	  this._socket = io.connect('http://localhost:1234');
	  this._socket.on('playNote', function (note) {
	  	console.log("yeah girl");
	    synth.playNote(note, 0.2);
	  });
  
      this.synth = synth;
      this._recorder = recorder;
      this._window = window_;
      this.keyboardState = new KeyboardState();
      this.noteLog = Array();
    },

    register: function(domObject)
    {
      var keyboard = this;
      var keydownHandler = createSynthKeydownHandler(this);
      var keyupHandler = createSynthKeyupHandler(this);
      $(domObject).focusin(function () {
        $(keyboard._window).bind('keydown', keydownHandler);
        $(keyboard._window).bind('keyup', keyupHandler);
      });

      $(domObject).focusout(function () {
        $(keyboard._window).unbind('keydown', keydownHandler);
        $(keyboard._window).unbind('keyup', keyupHandler);
      });
    }

  });

  VirtualKeyboard = Keyboard;
})();

