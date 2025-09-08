export interface ParsedChapter {
	content: string;
	order: number;
}

export const parseChaptersFromText = (text: string): ParsedChapter[] => {
	const chapters: ParsedChapter[] = [];

	const chapterPatterns = [
		/\b(Chapter\s+\d+[^\r\n]*)/gi,
		/\b(CHAPTER\s+\d+[^\r\n]*)/gi,
		/\b(Chương\s+\d+[^\r\n]*)/gi,
		/\b(第\s*\d+[^\r\n]*?章)/gi,
	];

	const currentText = text.trim();
	const allMatches: Array<{ match: string; index: number; pattern: RegExp }> = [];

	for (const pattern of chapterPatterns) {
		const matches = Array.from(currentText.matchAll(pattern));
		for (const match of matches) {
			if (match.index !== undefined) {
				allMatches.push({
					match: match[1],
					index: match.index,
					pattern: pattern,
				});
			}
		}
	}

	if (allMatches.length === 0) {
		return [
			{
				content: currentText,
				order: 0,
			},
		];
	}

	allMatches.sort((a, b) => a.index - b.index);

	for (let i = 0; i < allMatches.length; i++) {
		const currentMatch = allMatches[i];
		const nextMatch = allMatches[i + 1];

		let chapterStart = currentMatch.index;

		const textBeforeMatch = currentText.substring(0, currentMatch.index);
		const lastNewlineBeforeMatch = textBeforeMatch.lastIndexOf('\n');

		const lineStart = lastNewlineBeforeMatch + 1;
		const textFromLineStart = currentText.substring(
			lineStart,
			currentMatch.index,
		);

		if (textFromLineStart.trim().length > 0 && i > 0) {
			chapterStart = currentMatch.index;
		} else {
			chapterStart = lineStart;
		}

		let chapterEnd: number;
		if (nextMatch) {
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
			chapterEnd = currentText.length;
		}

		const chapterContent = currentText.substring(chapterStart, chapterEnd).trim();

		if (chapterContent) {
			chapters.push({
				content: chapterContent,
				order: i,
			});
		}
	}

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
