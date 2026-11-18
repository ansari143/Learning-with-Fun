@echo off
REM Refreshes the video list from YouTube and publishes it to Firebase.
REM Double-click it, or schedule it daily in Windows Task Scheduler.
cd /d "%~dp0"
set NODE_OPTIONS=--use-system-ca
node update-videos.js || exit /b 1
firebase deploy --only hosting --account learningwithfunkid@gmail.com --non-interactive
