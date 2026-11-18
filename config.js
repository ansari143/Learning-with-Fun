// Learning with Fun — site settings. Change these numbers any time.
window.LWF_CONFIG = {
  channelUrl: 'https://www.youtube.com/@LearningwithFunkid',

  // Long videos: show only uploads from this date onward...
  startDate: '2026-11-17',
  // ...that are at least this long (in seconds). 180 = 3 minutes.
  longVideoMinSeconds: 180,

  // "Popular Shorts": Shorts with at least this many views, best first.
  topShortsMinViews: 500000,
  topShortsMax: 10,

  // "Popular Videos": videos from the channel's Videos tab (any length), most viewed first.
  popularVideosMinViews: 3000,
  popularVideosMax: 8,

  // "Learn by Topic" shows the whole channel (videos + Shorts), in three separate groups.
  groups: [
    { id: 'learning', name: 'Learning',       icon: '📚', blurb: 'ABC, numbers, tables and more — one topic at a time.' },
    { id: 'rhymes',   name: 'Rhymes & Songs', icon: '🎵', blurb: 'Nursery rhymes and sing-along songs for fun time.' },
    { id: 'stories',  name: 'Stories',        icon: '📖', blurb: 'Short stories with a happy lesson inside.' },
  ],
  topicsPageSize: 12,

  // Topics. Titles are checked top to bottom; a video goes to the FIRST topic whose words appear in its title.
  // `fallbackWords` are checked only after every topic's `words` found nothing.
  categories: [
    { id: 'rhymes',  group: 'rhymes',   name: 'Rhymes & Songs',     icon: '🎵',
      words: ['nursery rhyme', 'baby shark', 'shark', 'wheels on the bus', 'wheels go round', 'bus song', 'adventure bus',
              'baa baa', 'five little monkeys', 'clap your hands', 'action song', 'halloween', 'dance', 'good morning',
              'morning time', 'hello sun', 'bedtime music', 'relaxing', 'banana song', 'meow', 'baby elephant', 'duck says',
              'animated nursery'],
      fallbackWords: ['song', 'rhyme', 'sing', 'music'] },
    { id: 'stories', group: 'stories',  name: 'Stories',            icon: '📖',
      words: ['story', 'stories', 'tale', 'wonderland', 'harry potter', 'butterfly'] },
    { id: 'tables',  group: 'learning', name: 'Times Tables',       icon: '✖️', words: ['table', 'multiplication'] },
    { id: 'abc',     group: 'learning', name: 'Alphabets & Phonics', icon: '🔤',
      words: ['abc', 'alphabet', 'a to z', 'a-z', 'phonics', 'letter', 'a for apple', 'b for ball', 'w and x', 'y and z', 'u & v', 's and t'] },
    { id: 'numbers', group: 'learning', name: 'Numbers & Counting', icon: '🔢', words: ['count', 'number', '1 to', 'one to', '1-10'] },
    { id: 'shapes',  group: 'learning', name: 'Shapes & Colours',   icon: '🔷', words: ['shape', 'colour', 'color', 'triangle', 'square'] },
    { id: 'days',    group: 'learning', name: 'Days & Months',      icon: '📅', words: ['days', 'week', 'month', 'sunday'] },
    { id: 'nature',  group: 'learning', name: 'Animals & Nature',   icon: '🐘', words: ['animal', 'bird', 'fruit', 'vegetable', 'flower', 'produce', 'zoo'] },
    { id: 'world',   group: 'learning', name: 'World & Words',      icon: '🌍', words: ['countr', 'flag', 'solar', 'planet', 'transport', 'kitchen', 'game'] },
  ],
  // Anything that matches nothing goes here.
  otherTopic: { id: 'more', group: 'learning', name: 'More Learning', icon: '🎈' },
};
