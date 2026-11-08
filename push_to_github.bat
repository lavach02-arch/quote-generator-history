@echo off
title Push Quote Generator to GitHub
color 0b
echo ========================================================
echo   Pushing Quote Generator with History to GitHub
echo   Repository: https://github.com/lavach02-arch/quote-generator-history.git
echo ========================================================
echo.

cd /d "c:\Users\HP\OneDrive\Desktop\smart-agriculture\quote-generator-history"

git add .
git commit -m "feat: complete Quote Generator with Favorites History for Workora submission"
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/lavach02-arch/quote-generator-history.git
git push -u origin main

echo.
echo ========================================================
echo   Successfully pushed to GitHub!
echo   Deploy now on Vercel: https://vercel.com/new
echo ========================================================
pause
