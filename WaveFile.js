class WaveFile {

    #name;
    #midiTrack;
 
    constructor(name, midiTrack) {
        this.#name = name;
        this.#midiTrack = midiTrack;
    }

    getName() {
        return this.#name;
    }

    async #writeBin(instrument, offlineCtx) {
        for (let [key, value] of this.#midiTrack.getMidiLog()) {
            if (value.getCommand() == 144) {
                const osc = instrument.getNote(value.getNote());
                oscillators.set(value.getNote(), osc);
                osc.connect(offlineCtx.destination);
                osc.start(key);
            } else {
                const osc = oscillators.get(value.getNote());
                osc.stop(key);
            }
        }
    }

    async writeFile() {
        const offlineCtx = new OfflineAudioContext(
            1, 44100 * this.#midiTrack.getTrackDuration(), 44100
        );
        const instrument = await window.audioAPI.getInstrument(window.instrumentName, offlineCtx);

        await this.#writeBin(instrument, offlineCtx);

        const renderedBuffer = await offlineCtx.startRendering();

        return bufferToWave(renderedBuffer, renderedBuffer.length);

        // Convert an AudioBuffer to a Blob using WAVE representation
        // Code taken from https://russellgood.com/how-to-convert-audiobuffer-to-audio-file/
        function bufferToWave(abuffer, len) {
            var numOfChan = abuffer.numberOfChannels,
                length = len * numOfChan * 2 + 44,
                buffer = new ArrayBuffer(length),
                view = new DataView(buffer),
                channels = [], i, sample,
                offset = 0,
                pos = 0;

            // write WAVE header
            setUint32(0x46464952);                         // "RIFF"
            setUint32(length - 8);                         // file length - 8
            setUint32(0x45564157);                         // "WAVE"

            setUint32(0x20746d66);                         // "fmt " chunk
            setUint32(16);                                 // length = 16
            setUint16(1);                                  // PCM (uncompressed)
            setUint16(numOfChan);
            setUint32(abuffer.sampleRate);
            setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
            setUint16(numOfChan * 2);                      // block-align
            setUint16(16);                                 // 16-bit (hardcoded in this demo)

            setUint32(0x61746164);                         // "data" - chunk
            setUint32(length - pos - 4);                   // chunk length

            // write interleaved data
            for (i = 0; i < abuffer.numberOfChannels; i++)
                channels.push(abuffer.getChannelData(i));

            while (pos < length) {
                for (i = 0; i < numOfChan; i++) {             // interleave channels
                    sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                    sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                    view.setInt16(pos, sample, true);          // write 16-bit sample
                    pos += 2;
                }
                offset++                                     // next source sample
            }

            console.log(view.buffer);

            // create Blob
            return new Blob([buffer], { type: "audio/wav" });

            function setUint16(data) {
                view.setUint16(pos, data, true);
                pos += 2;
            }

            function setUint32(data) {
                view.setUint32(pos, data, true);
                pos += 4;
            }
        }
    }

}
