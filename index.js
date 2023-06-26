window.onload = () => {
    window.audioAPI = new WebAudioAPI();
    window.audioAPI.createTrack('defaultTrack');
    const deviceSelector = document.getElementById('device');
    deviceSelector.add(new Option('Choose a MIDI device'));
    const instrumentSelector = document.getElementById('instrument');
    instrumentSelector.add(new Option('Choose an instrument'));
    window.audioAPI.getAvailableInstruments('/webAudioAPI-instruments').then(instruments => 
        instruments.forEach(instrument => instrumentSelector.add(new Option(instrument)))
    );
    window.audioAPI.getAvailableMidiDevices().then(devices => devices.forEach(device => 
        deviceSelector.add(new Option(device))
    ));
    window.midiTrack = new MidiTrack();
    console.log('done set up');
};

window.changeMidiDevice = function () {
    const deviceSelector = document.getElementById('device');
    const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
    if (deviceSelector.selectedIndex > 0) {
        window.audioAPI.connectMidiDeviceToTrack('defaultTrack', deviceSelection).then(() => {
            document.getElementById("status").textContent = 'Connected';
            console.log('Connected to MIDI device!');
        });
    }
}



window.changeInstrument = function () {
    const instrumentSelector = document.getElementById('instrument');
    const instrumentSelection = instrumentSelector.options[instrumentSelector.selectedIndex].value;
    if (instrumentSelector.selectedIndex > 0) {
        window.audioAPI.start();
        document.getElementById("status").textContent = 'Loading...';
        window.audioAPI.updateInstrument('defaultTrack', instrumentSelection).then(() => {
            document.getElementById("status").textContent = 'Ready';
            console.log('Instrument loading complete!');
        });
    }
}

window.startRecord = function () {
    console.log("Recording Started");
    window.midiTrack.addNote(new MIDIMessage(144, 60, 30), 1);
    window.midiTrack.addNote(new MIDIMessage(128, 60, 30), 2);
    window.midiTrack.addNote(new MIDIMessage(144, 65, 30), 3);
    window.midiTrack.addNote(new MIDIMessage(128, 65, 30), 4);
}

window.playTrack = function () {
    console.log("Playing");
    window.midiTrack.playTrack().then(() => console.log("EOF"));
}

window.clear = function() {
    console.log("Track Cleared")
    window.midiTrack.clearTrack();
}