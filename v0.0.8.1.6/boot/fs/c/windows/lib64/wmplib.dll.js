/// windows media player library
/// C 2019 levvij

await DLL.load("c/windows/lib64/tagzil.dll");

function WMPLib() {
	const public = {
		// load file
		loadAudio(file) {
			return new Promise(async done => {
				const blob = await fs.readBlob(file);
				const audio = new Audio();

				// wait for metadata (duration, ...) to load
				audio.onloadedmetadata = async () => {
					const song = {
						onend: Event("Song played to end"),

						// read tag
						tag: await TagZil.getTag(blob, file),
						duration: audio.duration,
						get playing() {
							return !audio.paused;
						},
						play() {
							audio.play();
						},
						pause() {
							audio.pause()
						},

						// seek to second and wait for seekend
						seek(second) {
							return new Promise(done => {
								audio.currentTime = second;

								audio.onseeked = () => done();
							});
						},
						get currentPosition() {
							return audio.currentTime;
						}
					};

					audio.onended = () => {
						song.onend();
					}

					done(song);
				};
				
				audio.src = URL.createObjectURL(blob);
			});
		},
		loadVideo(path) {
			return new Promise(async done => {
				const video = document.createElement("video");

				// wait for metadata (duration, ...) to load
				video.onloadedmetadata = async () => {
					const v = {
						player: video,
						onend: Event("Video played to end"),
						duration: video.duration,
						get playing() {
							return !video.paused;
						},
						play() {
							video.play();
						},
						pause() {
							video.pause();
						},

						// seek to second and wait for seekend
						seek(second) {
							return new Promise(done => {
								video.currentTime = second;
								video.onseeked = () => done();
							});
						},
						get currentPosition() {
							return video.currentTime;
						},
						get height() {
							return video.videoHeight;
						},
						get width() {
							return video.videoWidth;
						}
					};

					video.onended = () => {
						v.onend();
					}

					done(v);
				};
				
				video.src = await fs.readURI(path);
			}); 
		}
	};

	return public;
}

DLL.export("WMPLib", WMPLib);