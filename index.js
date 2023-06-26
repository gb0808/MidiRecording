window.onload = () => {
    window.audioAPI = new WebAudioAPI();
    window.audioAPI.createTrack('defaultTrack');
    const deviceSelector = document.getElementById('device');
    deviceSelector.add(new Option('Choose a MIDI device'));
    window.audioAPI.getAvailableMidiDevices().then(devices => devices.forEach(device => 
        deviceSelector.add(new Option(device))
    ));
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