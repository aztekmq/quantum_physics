@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"

if not exist "commit_messages.txt" (
  echo Missing commit_messages.txt in this folder.
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This folder is not a git repository.
  exit /b 1
)

for /f %%A in ('find /c /v "" ^< commit_messages.txt') do set total=%%A
if not defined total (
  echo Could not read commit_messages.txt
  exit /b 1
)

set /a pick=(%RANDOM% %% %total%) + 1
set "msg="

for /f "tokens=1,* delims=:" %%A in ('findstr /n "^" commit_messages.txt') do (
  if %%A==!pick! set "msg=%%B"
)

if "%~1" neq "" set "msg=%*"
if not defined msg set "msg=update project files"

echo Using commit message: !msg!

git add -A

git diff --cached --quiet
if not errorlevel 1 (
  git commit -m "!msg!"
  if errorlevel 1 exit /b 1

  git push
  if errorlevel 1 exit /b 1

  echo Push complete.
  exit /b 0
)

echo No staged changes to commit.
exit /b 0
