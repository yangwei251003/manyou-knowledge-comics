export function buildStory(chapter, script) {
  const [title, premise, scenes, closingLine] = script;
  if (scenes.length !== chapter.sections.length) {
    throw new Error(`Story ${chapter.id} has ${scenes.length} scenes for ${chapter.sections.length} sections`);
  }

  const panels = scenes.map(([visual, question, discovery], index) => ({
    visual,
    question,
    discovery,
    section: chapter.sections[index]
  }));

  if (panels.length === 2) {
    panels.unshift({
      visual: `开场，画清故事的起因和主角遇到的困难。\n${premise}`,
      discovery: premise
    });
  }
  if (panels.length > 3 && panels.length % 2 === 1) {
    panels.push({
      visual: '结尾的远景或特写。沿用本章开场的地点、道具和人物，让角色完成任务或改变做法，以可见的动作回应开场的困难。',
      discovery: closingLine ?? chapter.connection,
      recap: true
    });
  }

  const columns = panels.length === 3 ? 1 : 2;
  return {chapterId: chapter.id, title, premise, panels, columns, rows: panels.length / columns};
}

export function storyPrompt(chapter, story) {
  const scienceLimits = {
    math: 'Use concrete manipulatives or clear qualitative shapes. Only draw a graph when the panel specifically asks for it. Keep geometric relationships faithful.',
    physics: 'Use a clear schematic scene or an observable experiment. Do not invent measurement values, extra force arrows, field lines or wiring. Keep the described qualitative direction and object motion exact.',
    chemistry: 'Show the described materials, outcomes and apparatus qualitatively. Avoid atom counts, structural formulae, handwritten element symbols, made-up bonds or apparatus details not requested. Use appropriate safety gear in a lab.',
    biology: 'Show the relevant visible structure or analogy. Keep the cell compartments and sequence of events faithful. Do not imply scale or invent labeled molecular diagrams.',
    geography: 'Use a fictional landscape or schematic cross-section, with no real borders or unlabeled world map. Respect relative positions and the stated causal direction. Do not invent legends, compass labels or numeric data.'
  };
  const locations = story.columns === 1
    ? ['TOP', 'MIDDLE', 'BOTTOM']
    : story.panels.map((_, i) => `ROW ${Math.floor(i / 2) + 1} ${i % 2 ? 'RIGHT' : 'LEFT'}`);
  const scenes = story.panels.map((panel, index) =>
    `PANEL ${index + 1} (${locations[index]}): ${panel.visual}`
  ).join('\n');

  return `Use case: illustration-story.
Asset: one complete silent comic page for Chinese senior high school revision.
Chapter: ${chapter.title}. Story: ${story.title}.
Situation: ${story.premise}
Style: a polished inked graphic novel on warm ivory, with subtle print grain, varied camera angles and expressive hands and faces. Same thoughtful Chinese teen girl with dark short bob, cream tee and teal jacket, and her small expressive orange fox partner in a teal scarf. Use environment-specific props and colors. The setting should convey the particular story, not a row of generic classroom portraits.
Layout: portrait 2:3. Exactly ${story.panels.length} equal rectangular frames. ${story.columns} column(s) by ${story.rows} row(s), rigid regular grid, thin ivory gutters at equal fractions of the canvas. Read left to right, top to bottom. Fill each frame completely. No title region, extra subpanel, decorative border, speech balloon or watermark.
${scenes}
Scientific constraints: ${scienceLimits[chapter.subject]}
Render art only. No letters, words, numbers or formulas anywhere. All dialogue and precise notation are supplied in HTML. Clearly distinguish the scene of every panel. Keep important subjects away from the gutters.`;
}
