/// Tag reader (router)
/// C 2019 levvij

const log = globalConsole.createUnit("tagzil");

function TagZilLib() {
	const cache = {};
	
	return {
		// get tag
		async getTag(blob, path) {
			if (cache[path]) {
				return cache[path];
			}
			
			log.action("header");
			
			const start = await TagZil.read(blob, 0, 128);
			let tag;
			
			// check for tag type
			if (start.substr(0, 3) == "ID3") {
				tag = await TagZil.ID3v2(blob, start, log);
			}
			
			if (tag) {
				cache[path] = tag;
				return tag;
			} else {
				throw new Error("Cannot read tag information of '" + path + "'");
			}
		},
		// read data from blob 
		read(blob, from, to) {
			return new Promise(done => {
				const reader = new FileReader();
				
				reader.onload = () => {
					done(reader.result);
				};
				
				reader.readAsText(blob.slice(from, to));
			});
		}
	};
}

DLL.export("TagZil", new TagZilLib());