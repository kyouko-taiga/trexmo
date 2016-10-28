@Echo Off

:: Check whether Trexmo is already installed.
if exist "%UserProfile%\trexmo" (
    cd "%UserProfile%\trexmo"
    goto :run
) else (
    echo Installing trexmo in %UserProfile%\trexmo
)

:: Check whether prerequisites are installed.
python --version >nul 2>&1 && (
    pip --version >null 2>&1 && (
      goto :install
    ) || (
      echo pip is not installed.
      goto :eof
    )
) || (
    echo python is not installed.
    goto :eof
)

:install
pip install -r requirements.txt

mkdir "%UserProfile%\trexmo"
xcopy trexmo "%UserProfile%\trexmo" \E

:run
cd "%UserProfile%\trexmo"
python manage.py server run
