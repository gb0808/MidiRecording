class MidiTrack {

    #startTime;
    #endTime;
    #midiLog;

    constructor() {
        this.#midiLog = new Map();
        this.#startTime = 0;
        this.#endTime = 0;
    }

    getTrackDuration() {
        return this.#endTime - this.#startTime;
    }

    getMidiLog() {
        return this.#midiLog;
    }

    addNote(midiMessage, time) {
        this.#midiLog.set((time - this.#startTime), midiMessage);
    }

    startRecord(startTime) {
        this.#startTime = startTime;
    }

    stopRecord(endTime) {
        this.#endTime = endTime;
    }

    async playTrack() {
        let notes = {};

        for (let [key, value] of this.#midiLog) {
            if (value.getCommand() == 144) {
                setTimeout(async function () {
                    notes[value.getNote()] =
                        await window.audioAPI.startNote('defaultTrack', value.getNote());
                        console.log("note on");
                }, (key) * 1000);
            } else {
                setTimeout(async function () {
                    await window.audioAPI.stopNote('defaultTrack', notes[value.getNote()]);
                    console.log("note off");
                }, (key) * 1000);
            }
        }
    }

    clearTrack() {
        for (let [key, value] of this.#midiLog) {
            this.#midiLog.delete(key);
        }
        this.#startTime = 0;
        this.#endTime = 0;
    }
}