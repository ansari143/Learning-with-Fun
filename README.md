# Learning with Fun — website

Kids learning site for the YouTube channel **@LearningwithFunkid**.

## Files
- `index.html`, `styles.css`, `app.js` — the website. Open `index.html` to view it.
- `config.js` — settings you can change: start date, minimum length for a "long" video, how many views a Short needs to reach **Loved by Parents**, and the topic keywords.
- `data/videos.js` — the video list. Created by `update-videos.js`, so don't edit it by hand.
- `update-videos.js` — reads your channel's public Videos and Shorts pages (no API key needed) and rewrites `data/videos.js`.

## Daily update
- **On your PC:** double-click `update-videos.bat` (needs Node.js and the Firebase CLI signed in with an account that can access the learningwithfun-kids project). It refreshes the list and publishes to https://learningwithfun-kids.web.app. Add it to Windows Task Scheduler to run daily.
- **On GitHub Pages:** push this folder to a GitHub repo and turn on Pages. The workflow in `.github/workflows/update-videos.yml` refreshes the list every 6 hours.

## Rules the site follows
- **Long videos:** only uploads from `startDate` (17 Nov 2026) that are at least 3 minutes long. Newest is shown as **Today's New Video**.
- **Loved by Parents:** Shorts with 1,000+ views, top 8, highest first.
- **Learn by Topic:** shows the whole channel (videos and Shorts) in three separate groups: Learning (Alphabets & Phonics, Numbers, Tables, Shapes & Colours, Days & Months, Animals & Nature, World & Words), Rhymes & Songs, and Stories. A title goes to the first topic in `config.js` whose words it contains. Songs that teach a subject (like "ABC Phonics Song") stay under Learning.
