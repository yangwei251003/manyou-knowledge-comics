import {mathStories} from './math.js';
import {physicsStories} from './physics.js';
import {chemistryStories} from './chemistry.js';
import {biologyStories} from './biology.js';
import {geographyStories} from './geography.js';
import {buildStory} from './authoring.js';

const scripts = {...mathStories, ...physicsStories, ...chemistryStories, ...biologyStories, ...geographyStories};

export function storyFor(chapter) {
  const script = scripts[chapter.id];
  return script ? buildStory(chapter, script) : null;
}
