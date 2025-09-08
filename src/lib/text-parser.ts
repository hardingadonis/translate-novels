export interface ParsedChapter {
	content: string;
	order: number;
}

export const parseChaptersFromText = (text: string): ParsedChapter[] => {
	const chapters: ParsedChapter[] = [];

	// Regex patterns to match chapter markers
	const chapterPatterns = [
		/^(Chapter\s+\d+.*?)$/gim,
		/^(CHAPTER\s+\d+.*?)$/gim,
		/^(Chương\s+\d+.*?)$/gim,
		/^(第\s*\d+.*?章)$/gim,
	];

	let currentText = text.trim();

	// Try each pattern
	for (const pattern of chapterPatterns) {
		const matches = Array.from(currentText.matchAll(pattern));

		if (matches.length > 0) {
			// Split by chapter markers
			const splits = currentText.split(pattern).filter((part) => part.trim());

			let chapterIndex = 0;

			for (let i = 0; i < splits.length; i++) {
				const part = splits[i].trim();

				if (!part) continue;

				// Check if this part is a chapter marker
				if (chapterPatterns.some((p) => p.test(part))) {
					// This is a chapter title, combine with next part if it exists
					const nextPart = splits[i + 1]?.trim();
					if (nextPart && !chapterPatterns.some((p) => p.test(nextPart))) {
						chapters.push({
							content: `${part}\n\n${nextPart}`,
							order: chapterIndex++,
						});
						i++; // Skip the next part as we've already used it
					} else {
						chapters.push({
							content: part,
							order: chapterIndex++,
						});
					}
				} else if (chapterIndex === 0) {
					// If no chapter marker found yet, this might be content before first chapter
					chapters.push({
						content: part,
						order: chapterIndex++,
					});
				}
			}

			if (chapters.length > 0) {
				return chapters;
			}
		}
	}

	// If no chapter markers found, treat entire text as one chapter
	return [
		{
			content: currentText,
			order: 0,
		},
	];
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
