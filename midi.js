/*

MIDI API: http://webaudio.github.io/web-midi-api/

Usage:
//define some functions to recieve input like so:
function note_on(data){
  console.log( 'on', note );
}
function note_off(data){
  console.log( 'off', note );
}
function controller(data){
  console.log( 'controller', data );
}

//wait for document to load, and start listening
$(document).ready(function(){
  MIDI.start(note_on, note_off, controller);
});

//now play something.
*/


MIDI = {
    midi_access   : null,  // the MIDIAccess object.
    active_notes  : [], // the stack of actively-pressed keys

    //callbacks for messages
    note_on       :function(){},
    note_off      :function(){},
    controller    :function(){},

    start:function(note_on, note_off, controller){
      //set the callbacks
      this.note_on = note_on;
      this.note_off = note_off;
      this.controller = controller;

      //test and connect
      if (navigator.requestMIDIAccess){
          navigator.requestMIDIAccess().then( this.midi_init, this.midi_reject );
      } else {
        console.log("No MIDI support present in your browser.")
      }

    },

    midi_init:function(midi){
      //were in the window scope, the kword this is not in scope
      MIDI.midi_access = midi;
      if (MIDI.midi_access.inputs().length === 0){
        console.log("No MIDI input devices present.")
      } else {
        // Hook the message handler for all MIDI inputs
        var inputs = MIDI.midi_access.inputs();
        for (var input in inputs ){
          inputs[input].onmidimessage = MIDI.midi_message_event_handler;
        }
      }

    },

    midi_reject:function(){
      console.log("The MIDI system failed to start.");
    },

    midi_message_event_handler:function(event){
      switch (event.data[0] & 0xf0) {
        case 0x90:
          if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
            MIDI.note_on(event.data);
            return;
          }
          // if velocity == 0, fall thru: it's a note-off.
        case 0x80:
          MIDI.note_off(event.data);
        return;
        default:
         MIDI.controller(event.data);
        return;
      }

    }
};

