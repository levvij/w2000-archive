/// ID3v2 tag reader
/// C 2019 levvij
/// based on https://github.com/aadsm/jsmediatags

const log = globalConsole.createUnit("tagzil/id3v2");

async function readTag(blob, head) {
	log.action("read");
	
	// operators
	const byteAt = (data, index) => data.charCodeAt(index);
	const bitSet = (data, index, b) => (byteAt(data, index) & (1 << b)) != 0;
	const syncSafeIntAt = (data, offset) => byteAt(data, offset + 3) & 0x7f |
		((byteAt(data, offset + 2) & 0x7f) << 7) |
		((byteAt(data, offset + 1) & 0x7f) << 14) |
		((byteAt(data, offset) & 0x7f) << 21);
	const longAt = (data, offset, bendian) => {
		const byte1 = byteAt(data, offset);
		const byte2 = byteAt(data, offset + 1);
		const byte3 = byteAt(data, offset + 2);
		const byte4 = byteAt(data, offset + 3);

		const long = bendian ?
			(((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4 :
			(((((byte4 << 8) + byte3) << 8) + byte2) << 8) + byte1;

		if (long < 0) {
			return long + 4294967296;
		}

		return long;
	};
	const stringAt = (data, start, end) => data.substr(start, end);
	
	// check for version support
	if (byteAt(head, 3) > 4) {
		throw new Error("ID3V2 Tag Reading failed: Minor Version > 3");
	}

	// public interface
	const tag = {
		id3v2: {
			version: byteAt(head, 3),
			revision: byteAt(head, 4),
			unsynch: bitSet(head, 5, 7),
			xheader: bitSet(head, 5, 6),
			xindication: bitSet(head, 5, 5),
			size: syncSafeIntAt(head, 6),
			frames: {}
		}
	};

	// start at offset 10
	let offset = 10;

	// add offset if xheader is enabled
	if (tag.id3v2.xheader) {
		tag.id3v2.xheaderSize = longAt(offset, true);
		
		offset += tag.id3v2.xheaderSize + 4;
	}
	
	// id3v2 reader only supports unsync data
	if (!tag.id3v2.unsynch) {
		// read in full tag data
		const end = tag.id3v2.size - offset;
		const data = await TagZil.read(blob, 0, end);
		
		// read all data
		while (offset < end) {
			// create frame 
			let frame = {
				offset
			};
			
			switch (tag.id3v2.version) {
				case 2: {
					// read in tag info for version 3v2.2
					frame.id = stringAt(data, offset, 3);
					frame.size = integer24At(data, offset + 3);
					frame.headerSize = 6;
					
					break;
				}
					
				case 3: {
					// read in tag info for version 3v2.3
					frame.id = stringAt(data, offset, 4);
					frame.size = longAt(data, offset + 4, true);
					frame.headerSize = 10;
					
					break;
				}
					
				case 4: {
					// read in tag info for version 3v2.4
					frame.id = stringAt(data, offset, 4);
					frame.size = syncSafeIntAt(data, offset + 4);
					frame.headerSize = 10;
					
					break;
				}
			}
			
			log.action("readframe", frame.id);
			
			// read data
			frame.data = stringAt(data, frame.offset + frame.headerSize, frame.size);
			tag.id3v2.frames[frame.id] = frame;
			
			// advance offset, yeah, i'ma put the drip on the plate (drip, drip)
			offset += frame.headerSize + frame.size;
		}
	}
	
	// remove all weird chars from frames
	const clean = frame => {
		if (frame) {
			let cleanString = "";
			
			for (let i = 0; i < frame.data.length; i++) {
				const code = frame.data.charCodeAt(i);
				
				if (code > 10 && code != 65533) {
					cleanString += frame.data[i];
				}
			}
			
			return cleanString;
		}
		
		return "";
	};
	
	// set important/common tags 
	tag.artist = clean(tag.id3v2.frames.TPE2 || tag.id3v2.frames.TCM);
	tag.title = clean(tag.id3v2.frames.TIT2 || tag.id3v2.frames.TT2);
	tag.album = clean(tag.id3v2.frames.TALB || tag.id3v2.frames.TAL);

	return tag;
}

TagZil.ID3v2 = readTag;