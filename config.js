// Learning with Fun — site settings. Change these numbers any time.
window.LWF_CONFIG = {
  channelUrl: 'https://www.youtube.com/@LearningwithFunkid',

  // Long videos: show only uploads from this date onward...
  startDate: '2026-11-17',
  // ...that are at least this long (in seconds). 180 = 3 minutes.
  longVideoMinSeconds: 180,

  // "Loved by Parents": Shorts with at least this many views, best first.
  topShortsMinViews: 1000,
  topShortsMax: 8,

  // Topics. A video goes to the first topic whose words appear in its title.
  categories: [
    { id: 'abc',     name: 'Alphabets',         icon: '🔤', words: ['abc', 'alphabet', 'a to z', 'phonics', 'letter'] },
    { id: 'numbers', name: 'Numbers & Counting', icon: '🔢', words: ['counting', 'number', '1 to', 'one to', '123', 'count'] },
    { id: 'tables',  name: 'Times Tables',       icon: '✖️', words: ['table', 'multiplication'] },
    { id: 'shapes',  name: 'Shapes & Colours',   icon: '🔷', words: ['shape', 'colour', 'color'] },
    { id: 'nature',  name: 'Animals & Nature',   icon: '🐘', words: ['animal', 'bird', 'fruit', 'vegetable', 'flower'] },
    { id: 'world',   name: 'Days, Months & More', icon: '📅', words: ['day', 'week', 'month', 'transport', 'kitchen', 'game'] },
    { id: 'rhymes',  name: 'Rhymes & Songs',     icon: '🎵', words: ['rhyme', 'song', 'sing'] },
    { id: 'stories', name: 'Stories',            icon: '📖', words: ['story', 'stories', 'bedtime'] },
  ],
};
