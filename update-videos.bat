@echo off
REM Double-click (or schedule in Windows Task Scheduler) to refresh the video list.
cd /d "%~dp0"
node update-videos.js
