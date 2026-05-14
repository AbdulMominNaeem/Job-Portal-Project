# Run as Administrator. Configures the SQLEXPRESS instance for the JobPortal:
#   * Enables TCP/IP on static port 1433
#   * Enables Mixed Mode auth
#   * Restarts the SQL Server service
# Then this script:
#   * Enables and password-sets the 'sa' login
#   * Creates the 'jobportal' database
#   * Creates a 'jobportal' SQL login + db user with db_owner
$ErrorActionPreference = 'Stop'
$logFile = "$PSScriptRoot\setup.log"
Start-Transcript -Path $logFile -Force | Out-Null

try {
    # Find the instance registry key dynamically (handles MSSQL16/17 etc.)
    $base = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server"
    $instances = Get-ChildItem $base | Where-Object {
        $_.PSChildName -match "^MSSQL\d+\.SQLEXPRESS$"
    }
    if (-not $instances) { throw "No SQLEXPRESS instance found under $base" }
    $instKey = $instances[0].PSPath
    $instName = $instances[0].PSChildName
    Write-Host "Found instance: $instName"

    # Enable Mixed Mode auth (LoginMode=2)
    Set-ItemProperty -Path "$instKey\MSSQLServer" -Name "LoginMode" -Value 2 -Type DWord
    Write-Host "Mixed Mode enabled"

    # Enable TCP/IP
    $tcpKey = "$instKey\MSSQLServer\SuperSocketNetLib\Tcp"
    Set-ItemProperty -Path $tcpKey -Name "Enabled" -Value 1 -Type DWord
    Write-Host "TCP enabled"

    # Configure IPAll: static port 1433, clear dynamic
    $ipAll = "$tcpKey\IPAll"
    Set-ItemProperty -Path $ipAll -Name "TcpPort" -Value "1433" -Type String
    Set-ItemProperty -Path $ipAll -Name "TcpDynamicPorts" -Value "" -Type String
    Write-Host "Static port 1433 configured for IPAll"

    # Also enable each per-IP listener so 127.0.0.1 works
    Get-ChildItem $tcpKey | Where-Object { $_.PSChildName -match "^IP\d+" } | ForEach-Object {
        Set-ItemProperty -Path $_.PSPath -Name "Enabled" -Value 1 -Type DWord -ErrorAction SilentlyContinue
    }

    # Restart the SQL service
    $svc = Get-Service "MSSQL`$SQLEXPRESS"
    Write-Host "Restarting service $($svc.Name)..."
    Restart-Service -Name "MSSQL`$SQLEXPRESS" -Force
    Start-Sleep 3
    Write-Host "Service status: $((Get-Service 'MSSQL$SQLEXPRESS').Status)"

    # Run T-SQL via sqlcmd (Windows auth, then switch to SQL auth for verification)
    $sqlcmd = Get-ChildItem "C:\Program Files\Microsoft SQL Server" -Recurse -Filter "sqlcmd.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $sqlcmd) { throw "sqlcmd not found" }
    Write-Host "Using $($sqlcmd.FullName)"

    $tsql = @"
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = 'JobPortal!Secure123';
IF DB_ID('jobportal') IS NULL CREATE DATABASE jobportal;
GO
USE jobportal;
GO
IF SUSER_ID('jobportal') IS NULL
    CREATE LOGIN jobportal WITH PASSWORD = 'jobportal', CHECK_POLICY = OFF;
GO
USE jobportal;
IF USER_ID('jobportal') IS NULL CREATE USER jobportal FOR LOGIN jobportal;
ALTER ROLE db_owner ADD MEMBER jobportal;
GO
"@
    $tsqlFile = "$PSScriptRoot\setup.sql"
    $tsql | Set-Content -Path $tsqlFile -Encoding UTF8
    & $sqlcmd.FullName -S ".\SQLEXPRESS" -E -i $tsqlFile

    # Verify TCP is actually listening
    $listener = Get-NetTCPConnection -State Listen -LocalPort 1433 -ErrorAction SilentlyContinue
    Write-Host "TCP 1433 listener: $($listener | Out-String)"

    # Test login as sa via TCP
    & $sqlcmd.FullName -S "tcp:localhost,1433" -U sa -P "JobPortal!Secure123" -Q "SELECT name FROM sys.databases WHERE name='jobportal'"

    Write-Host "DONE"
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace
} finally {
    Stop-Transcript | Out-Null
}
