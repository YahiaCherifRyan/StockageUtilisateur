<# :
@echo off
title MonProjet - Serveur (Tray)

if "%~1"=="invisible" goto :run_ps

set "vbs=%temp%\hide_console.vbs"
echo CreateObject("WScript.Shell").Run """%~f0"" invisible", 0, False > "%vbs%"
wscript "%vbs%"
del "%vbs%"
exit /b

:run_ps
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$env:BASE_DIR='%~dp0'; Invoke-Expression (Get-Content '%~f0' -Raw)"
exit /b
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$baseDir = $env:BASE_DIR
$trayIcon = New-Object System.Windows.Forms.NotifyIcon
$trayIcon.Text = "MonProjet - Serveur (OFF)"
$trayIcon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon("$env:SystemRoot\System32\cmd.exe")
$trayIcon.Visible = $true

$global:serverProcess = $null

function Update-Menu {
    $menu = New-Object System.Windows.Forms.ContextMenu
    
    if ($global:serverProcess -ne $null -and -not $global:serverProcess.HasExited) {
        $itemOff = New-Object System.Windows.Forms.MenuItem("Off (Arreter le serveur)")
        $itemOff.add_Click({ Stop-Server })
        $menu.MenuItems.Add($itemOff) | Out-Null
    } else {
        $itemOn = New-Object System.Windows.Forms.MenuItem("On (Demarrer le serveur)")
        $itemOn.add_Click({ Start-Server })
        $menu.MenuItems.Add($itemOn) | Out-Null
    }
    
    $menu.MenuItems.Add("-") | Out-Null
    $itemExit = New-Object System.Windows.Forms.MenuItem("Quitter")
    $itemExit.add_Click({ Stop-Server; $trayIcon.Visible = $false; [System.Windows.Forms.Application]::Exit() })
    $menu.MenuItems.Add($itemExit) | Out-Null
    
    $trayIcon.ContextMenu = $menu
}

function Start-Server {
    $global:serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $baseDir -WindowStyle Hidden -PassThru
    $trayIcon.Text = "MonProjet - Serveur (ON)"
    $trayIcon.ShowBalloonTip(3000, "Serveur", "Le serveur est maintenant en ligne (ON).", [System.Windows.Forms.ToolTipIcon]::Info)
    Update-Menu
}

function Stop-Server {
    if ($global:serverProcess -ne $null -and -not $global:serverProcess.HasExited) {
        Stop-Process -Id $global:serverProcess.Id -Force
    }
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "server.js" } | Invoke-CimMethod -MethodName Terminate -ErrorAction SilentlyContinue | Out-Null
    $global:serverProcess = $null
    $trayIcon.Text = "MonProjet - Serveur (OFF)"
    $trayIcon.ShowBalloonTip(3000, "Serveur", "Le serveur a ete arrete (OFF).", [System.Windows.Forms.ToolTipIcon]::Warning)
    Update-Menu
}

Update-Menu
[System.Windows.Forms.Application]::Run()