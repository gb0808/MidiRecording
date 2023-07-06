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
    window.recordStatus = false;
    console.log('done set up');
};

function midiCallback(event) {
    const cmd = event.data[0];
    const note = event.data[1];
    const vel = event.data[2];
    const message = new MIDIMessage(cmd, note, vel);

    if (window.recordStatus) {
        window.midiTrack.addNote(message, window.audioAPI.getCurrentTime());
    }
}

window.changeMidiDevice = function () {
    const deviceSelector = document.getElementById('device');
    const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
    if (deviceSelector.selectedIndex > 0) {
        window.audioAPI.connectMidiDeviceToTrack('defaultTrack', deviceSelection).then(() => {
            document.getElementById("status").textContent = 'Connected';
            console.log('Connected to MIDI device!');
        });
        window.audioAPI.registerMidiDeviceCallback(deviceSelection, midiCallback);
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
            window.instrumentName = instrumentSelection;
        });
    }
}

window.startRecord = function () {
    console.log("Recording Started");
    const startTime = window.audioAPI.getCurrentTime();
    window.midiTrack.startRecord(startTime);
    window.recordStatus = true;
}

window.stopRecord = function () {
    console.log("Recording Stoped");
    window.midiTrack.stopRecord(window.audioAPI.getCurrentTime());
}

window.render = function () {
    window.midiTrack.renderTrack();
}

window.playTrack = function () {
    console.log("Playing");
    window.midiTrack.playTrack();
}

window.clear = function () {
    console.log("Track Cleared");
    window.midiTrack.clearTrack();
}

window.writeWAV = async function () {
    console.log("creating .wav");
    const wav = new WaveFile("test", window.midiTrack);
    const wavLink = document.getElementById("wav-link")
    const blob = wav.writeFile();
    wavLink.href = URL.createObjectURL(blob, { type: "audio/wav" });
}