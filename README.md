# Learning with Fun — website

Kids learning site for the YouTube channel **@LearningwithFunkid**.

## Files
- `index.html`, `styles.css`, `app.js` — the website. Open `index.html` to view it.
- `config.js` — settings you can change: start date, minimum length for a "long" video, how many views a Short needs to reach **Loved by Parents**, and the topic keywords.
- `data/videos.js` — the video list. Created by `update-videos.js`, so don't edit it by hand.
- `update-videos.js` — reads your channel's public Videos and Shorts pages (no API key needed) and rewrites `data/videos.js`.

## Daily update
- **On your PC:** double-click `update-videos.bat` (needs Node.js), or add it to Windows Task Scheduler to run daily.
- **On GitHub Pages:** push this folder to a GitHub repo and turn on Pages. The workflow in `.github/workflows/update-videos.yml` refreshes the list every 6 hours.

## Rules the site follows
- **Long videos:** only uploads from `startDate` (17 Nov 2026) that are at least 3 minutes long. Newest is shown as **Today's New Video**.
- **Loved by Parents:** Shorts with 1,000+ views, top 8, highest first.
- **Topics:** a video goes to the first topic whose keywords appear in its title (Alphabets, Numbers, Tables, Shapes, Animals, Days & Months, Rhymes, Stories).
