export interface ParsedChapter {
	content: string;
	order: number;
}

export const parseChaptersFromText = (text: string): ParsedChapter[] => {
	const chapters: ParsedChapter[] = [];

	// Improved regex patterns to match chapter markers anywhere in the text
	// Using word boundaries (\b) to ensure they're separate words, not part of other words
	const chapterPatterns = [
		/\b(Chapter\s+\d+[^\r\n]*)/gi,
		/\b(CHAPTER\s+\d+[^\r\n]*)/gi,
		/\b(Chương\s+\d+[^\r\n]*)/gi,
		/\b(第\s*\d+[^\r\n]*?章)/gi,
	];

	let currentText = text.trim();
	let allMatches: Array<{ match: string; index: number; pattern: RegExp }> = [];

	// Find all chapter matches with their positions
	for (const pattern of chapterPatterns) {
		const matches = Array.from(currentText.matchAll(pattern));
		for (const match of matches) {
			if (match.index !== undefined) {
				allMatches.push({
					match: match[1], // The captured group
					index: match.index,
					pattern: pattern,
				});
			}
		}
	}

	// If no chapter markers found, treat entire text as one chapter
	if (allMatches.length === 0) {
		return [
			{
				content: currentText,
				order: 0,
			},
		];
	}

	// Sort matches by their position in the text
	allMatches.sort((a, b) => a.index - b.index);

	// Extract chapters based on match positions
	for (let i = 0; i < allMatches.length; i++) {
		const currentMatch = allMatches[i];
		const nextMatch = allMatches[i + 1];

		// Determine the start position for this chapter
		let chapterStart = currentMatch.index;

		// Find the actual start of the chapter title (in case there's text before it on the same line)
		const textBeforeMatch = currentText.substring(0, currentMatch.index);
		const lastNewlineBeforeMatch = textBeforeMatch.lastIndexOf('\n');

		// If the chapter title is not at the start of its line, we need to handle this carefully
		const lineStart = lastNewlineBeforeMatch + 1;
		const textFromLineStart = currentText.substring(
			lineStart,
			currentMatch.index,
		);

		// If there's significant text before the chapter marker on the same line,
		// we might want to include it with the previous chapter instead
		if (textFromLineStart.trim().length > 0 && i > 0) {
			chapterStart = currentMatch.index;
		} else {
			chapterStart = lineStart;
		}

		// Determine the end position for this chapter
		let chapterEnd: number;
		if (nextMatch) {
			// Find where the next chapter starts
			const nextTextBeforeMatch = currentText.substring(0, nextMatch.index);
			const nextLastNewlineBeforeMatch = nextTextBeforeMatch.lastIndexOf('\n');
			const nextLineStart = nextLastNewlineBeforeMatch + 1;
			const nextTextFromLineStart = currentText.substring(
				nextLineStart,
				nextMatch.index,
			);

			if (nextTextFromLineStart.trim().length > 0) {
				chapterEnd = nextMatch.index;
			} else {
				chapterEnd = nextLineStart;
			}
		} else {
			// This is the last chapter, include everything to the end
			chapterEnd = currentText.length;
		}

		// Extract the chapter content
		let chapterContent = currentText.substring(chapterStart, chapterEnd).trim();

		// Clean up the chapter content
		if (chapterContent) {
			chapters.push({
				content: chapterContent,
				order: i,
			});
		}
	}

	// If we found matches but no valid chapters were extracted, fallback to original text
	if (chapters.length === 0) {
		return [
			{
				content: currentText,
				order: 0,
			},
		];
	}

	return chapters;
};

export const exportChaptersToText = (
	chapters: {
		rawContent?: string;
		vietnameseContent?: string;
		order: number;
	}[],
	useTranslation = false,
): string => {
	return chapters
		.sort((a, b) => a.order - b.order)
		.map((chapter, index) => {
			const content = useTranslation
				? chapter.vietnameseContent || chapter.rawContent || ''
				: chapter.rawContent || '';
			return `Chapter ${index + 1}\n\n${content}`;
		})
		.join('\n\n---\n\n');
};
