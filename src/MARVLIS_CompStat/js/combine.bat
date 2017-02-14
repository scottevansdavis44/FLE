@REM File Path
SET FilePath=C:\Projects\FLE\Repository\src\MARVLIS_CompStat\js

@REM File to be deleted
SET FileToDelete=%FilePath%\sys.js

ECHO %FileToDelete%
 
@REM Try to delete the file only if it exists
IF EXIST %FileToDelete% del /F %FileToDelete%
 
@REM If the file wasn't deleted for some reason, stop and error
IF EXIST %FileToDelete% exit 1

TYPE %FilePath%\system_*.js %FilePath%\objType.js > %FileToDelete%
PAUSE
 