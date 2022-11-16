import yanJson from './yan.json';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const yanJson = require('./yan.json');

const [tags, map] = yanJson.list.reduce<[string[], Map<string, string[]>]>(([allTags, map], { tag, yan }) => {
	if (tag) {
		const emoticonNames = tag.split(' ');
		allTags.push(...emoticonNames);
		// tag to emoticon reflect
		emoticonNames.forEach(name => map.set(name, yan));
	}

	return [allTags, map];
}, [[], new Map()]);

const searchTagReg = new RegExp(tags.join('|'), 'g');

export const searchMatchedTextLocs = (text: string) => {
	const matchIterator = text.matchAll(searchTagReg);
	const matches = [...matchIterator];
	
	return matches.map(m => ({
		word: m[0],
		loc: m.index || 0
	}));
};

export const tagEmoticonMap = map;


