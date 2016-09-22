function AudioSynthView() {

	var isMobile = !!navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
	if(isMobile) { var evtListener = ['touchstart', 'touchend']; } else { var evtListener = ['mousedown', 'mouseup']; }

	var __audioSynth = new AudioSynth();
	__audioSynth.setVolume(0.5);
	var __octave = 4;

	var myTextField = document.getElementById('sargams');
	
	// Change octave
	var fnChangeOctave = function(x) {

		x |= 0;
	
		__octave += x;
	
		__octave = Math.min(5, Math.max(3, __octave));
	
		var octaveName = document.getElementsByName('OCTAVE_LABEL');
		var i = octaveName.length;
		while(i--) {
			var val = parseInt(octaveName[i].getAttribute('value'));
			octaveName[i].innerHTML = (val + __octave);
		}
	
		document.getElementById('OCTAVE_LOWER').innerHTML = __octave-1;
		document.getElementById('OCTAVE_UPPER').innerHTML = __octave+1;
	
	};

	// Key bindings, notes to keyCodes.
	var keyboard = {

			49: 'F#,-1',
			/* 2 */
			50: 'G#,-1',
			
			/* 3 */
			51: 'A#,-1',
			
			/* 5 */
			53: 'C#,0',
			
			/* 6 */
			54: 'D#,0',
			
			/* 7 */
			/*55: 'F#,0',*/

			/*8 */
			56: 'F#,0',
			
			/* 9 */
			57: 'G#,0',
			
			/* 0 */
			48: 'A#,0',
			
			/* - */
			189: 'C#,1',
			/* + */
			187: 'D#,1',
			61: 'D#,1',

			220: 'E,1',
			
			/* Q */
			81: 'G,-1',
			
			/* W */
			87: 'A,-1',
			
			/* E */
			69: 'B,-1',
			
			/* R */
			82: 'C,0',
			
			/* T */
			84: 'D,0',
			
			/* Y */
			89: 'E,0',
			
			/* U */
			85: 'F,0',
			
			/* I */
			73: 'G,0',
			
			/* O */
			79: 'A,0',
			
			/* P */
			80: 'B,0',
			
			/* [ */
			219: 'C,1',
			
			/* ] */
			221: 'D,1'
		
		};

		var keyboard_indian = {

			49: '.d',
			/* 2 */
			50: '.n',
			
			/* 3 */
			51: 'S',
			
			/* 5 */
			53: 'g',
			
			/* 6 */
			54: 'M',
			
			/* 7 */
			/*55: 'F#,0',*/

			/*8 */
			56: 'd',
			
			/* 9 */
			57: 'n',
			
			/* 0 */
			48: 'S.',
			
			/* - */
			189: 'r.',
			/* + */
			187: 'M.',
			61: 'M.',

			220: 'm.',
			
			/* Q */
			81: '.D,',
			
			/* W */
			87: '.N',
			
			/* E */
			69: 'r',
			
			/* R */
			82: 'R',
			
			/* T */
			84: 'G',
			
			/* Y */
			89: 'm',
			
			/* U */
			85: 'P',
			
			/* I */
			73: 'D',
			
			/* O */
			79: 'N',
			
			/* P */
			80: 'r.',
			
			/* [ */
			219: 'R.',
			
			/* ] */
			221: 'G.'
			
		};
	
	var reverseLookupText = {};
	var reverseLookup = {};

	// Create a reverse lookup table.
	for(var i in keyboard) {
	
		var val;

		switch(i|0) {
		
			case 187:
				val = 61;
				break;
			
			case 219:
				val = 91;
				break;
			
			case 221:
				val = 93;
				break;
			
			case 188:
				val = 44;
				break;
			
			case 190:
				val = 46;
				break;
			
			default:
				val = i;
				break;
			
		}
	
		reverseLookupText[keyboard[i]] = val;
		reverseLookup[keyboard[i]] = i;
	
	}

	// Keys you have pressed down.
	var keysPressed = [];
	var visualKeyboard = null;
	var selectSound = null;

	var fnCreateKeyboard = function(keyboardElement) {
		// Generate keyboard
		// This is our main keyboard element! It's populated dynamically based on what you've set above.
		visualKeyboard = document.getElementById('keyboard');
		selectSound = document.getElementById('sound');

		var iKeys = 0;
		var iWhite = 0;
		var notes = __audioSynth._notes;

		for(var i=-1;i<=1;i++) {
			for(var n in notes) {
				if(n[2]!='b') {
					var thisKey = document.createElement('div');
					if(n.length>1) {
						thisKey.className = 'black key';
						thisKey.style.width = '30px';
						thisKey.style.height = '120px';
						thisKey.style.left = (40 * (iWhite - 1)) + 25 + 'px';
					} else {
						thisKey.className = 'white key';
						thisKey.style.width = '40px';
						thisKey.style.height = '200px';
						thisKey.style.left = 40 * iWhite + 'px';
						iWhite++;
					}
					var label = document.createElement('div');
					label.className = 'label';
					label.innerHTML = '<b>' + String.fromCharCode(reverseLookupText[n + ',' + i]) + '</b>' + '<br /><br />' + n.substr(0,1) +
						'<span name="OCTAVE_LABEL" value="' + i + '">' + (__octave + parseInt(i)) + '</span>' + (n.substr(1,1)?n.substr(1,1):'');
					thisKey.appendChild(label);
					thisKey.setAttribute('ID', 'KEY_' + n + ',' + i);
					thisKey.addEventListener(evtListener[0], (function(_temp) { return function() { fnPlayKeyboard({keyCode:_temp}); } })(reverseLookup[n + ',' + i]));
					visualKeyboard[n + ',' + i] = thisKey;
					visualKeyboard.appendChild(thisKey);
					iKeys++;
				}
			}
		}

		visualKeyboard.style.width = iWhite * 40 + 'px';

		window.addEventListener(evtListener[1], function() { n = keysPressed.length; while(n--) { fnRemoveKeyBinding({keyCode:keysPressed[n]}); } });
	
	};

	// Creates our audio player
	var fnPlayNote = function(note, octave) {

		src = __audioSynth.generate(selectSound.value, note, octave, 2);
		container = new Audio(src);
		container.addEventListener('ended', function() { container = null; });
		container.addEventListener('loadeddata', function(e) { e.target.play(); });
		container.autoplay = false;
		container.setAttribute('type', 'audio/wav');
		/*document.body.appendChild(container);*/
		container.load();
		return container;
	
	};

	// Detect keypresses, play notes.

	var fnPlayKeyboard = function(e) {
	
		var i = keysPressed.length;
		while(i--) {
			if(keysPressed[i]==e.keyCode) {
				return false;	
			}
		}
		keysPressed.push(e.keyCode);
		if (!(e.keyCode in keyboard_indian)){
			if (e.keyCode == 13)
				myTextField.insertAdjacentHTML('beforeend','</br>');
			if (e.keyCode == 32)
				myTextField.insertAdjacentHTML('beforeend',' ');
			if (e.keyCode == 8){
				var text = myTextField.innerHTML;
				var newtext = text.substring(0,text.length - 1);
				myTextField.innerHTML = newtext;
			}
			return;
		}

		
		//myTextField.innerHTML = myTextField.innerHTML + keyboard_indian[e.keyCode];
		if (spaces){
			myTextField.insertAdjacentHTML('beforeend', keyboard_indian[e.keyCode] + ' ');
		}
		else {
			myTextField.insertAdjacentHTML('beforeend', keyboard_indian[e.keyCode]);
		}
		

		switch(e.keyCode) {
			// left
			case 37:
				fnChangeOctave(-1);
				break;
		
			// right
			case 39:
				fnChangeOctave(1);
				break;
		
			// space
			case 16:
				break;
				fnPlaySong([
					['E,0', 8],
					['D,0', 8],
					['C,0', 2],
					['C,0', 8],
					['D,0', 8],
					['C,0', 8],
					['E,0', 8],
					['D,0', 1],
					['C,0', 8],
					['D,0', 8],
					['E,0', 2],
					['A,0', 8],
					['G,0', 8],
					['E,0', 8],
					['C,0', 8],
					['D,0', 1],
					['A,0', 8],
					['B,0', 8],
					['C,1', 2],
					['B,0', 8],
					['C,1', 8],
					['D,1', 8],
					['C,1', 8],
					['A,0', 1],
					['G,0', 8],
					['A,0', 8],
					['B,0', 2],
					['C,1', 8],
					['B,0', 8],
					['A,0', 8],
					['G,0', 8],
					['A,0', 1]
				]);
				break;
		
		}
	
		if(keyboard[e.keyCode]) {
			if(visualKeyboard[keyboard[e.keyCode]]) {
				visualKeyboard[keyboard[e.keyCode]].style.backgroundColor = '#ff0000';
				visualKeyboard[keyboard[e.keyCode]].style.marginTop = '5px';
				visualKeyboard[keyboard[e.keyCode]].style.boxShadow = 'none';
			}
			var arrPlayNote = keyboard[e.keyCode].split(',');
			var note = arrPlayNote[0];
			var octaveModifier = arrPlayNote[1]|0;
			fnPlayNote(note, __octave + octaveModifier);
		} else {
			return false;	
		}
	
	}

	// Remove key bindings once note is done.

	var fnRemoveKeyBinding = function(e) {
	
		var i = keysPressed.length;
		while(i--) {
			if(keysPressed[i]==e.keyCode) {
				if(visualKeyboard[keyboard[e.keyCode]]) {
					visualKeyboard[keyboard[e.keyCode]].style.backgroundColor = '';
					visualKeyboard[keyboard[e.keyCode]].style.marginTop = '';
					visualKeyboard[keyboard[e.keyCode]].style.boxShadow = '';
				}
				keysPressed.splice(i, 1);
			}
		}
	
	}

	var fnPlaySong = function(arr) {
	
		if(arr.length>0) {
		
			var noteLen = 1000*(1/parseInt(arr[0][1]));
			if(!(arr[0][0] instanceof Array)) {
				arr[0][0] = [arr[0][0]];	
			}
			var i = arr[0][0].length;
			var keys = [];
			while(i--) {
				keys.unshift(reverseLookup[arr[0][0][i]]);
				fnPlayKeyboard({keyCode:keys[0]});
			}
			arr.shift();
			setTimeout(function(array, val){ return function() { var i = val.length; while(i--) { fnRemoveKeyBinding({keyCode:val[i]}); } fnPlaySong(array); } }(arr, keys), noteLen);
		
		}
	
	};

	// Set up global event listeners

	window.addEventListener('keydown', fnPlayKeyboard);
	window.addEventListener('keyup', fnRemoveKeyBinding);
	document.getElementById('-_OCTAVE').addEventListener('click', function() { fnChangeOctave(-1); });
	document.getElementById('+_OCTAVE').addEventListener('click', function() { fnChangeOctave(1); });
	
	Object.defineProperty(this, 'draw', {
		value: fnCreateKeyboard
	});

}