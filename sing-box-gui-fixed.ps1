Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configuration
$script:SettingsFile = "vpn-settings.json"
$SingBoxExe = ".\sing-box.exe"
$ConfigFile = "config.json"

# Load or create settings
$script:FirstRun = $false
if (Test-Path $script:SettingsFile) {
    $settings = Get-Content $script:SettingsFile | ConvertFrom-Json
    $script:ConfigUrl = $settings.ConfigUrl
} else {
    $script:ConfigUrl = ""
    $script:FirstRun = $true
}

# Global variables
$script:Process = $null
$script:Running = $false
$script:LastUpdate = "Never"

# Create form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Sing-box VPN Control"
$form.Size = New-Object System.Drawing.Size(400,295)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.ShowInTaskbar = $false

# Status label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Location = New-Object System.Drawing.Point(10,20)
$statusLabel.Size = New-Object System.Drawing.Size(320,20)
$statusLabel.Text = "Status: Disconnected"
$statusLabel.Font = New-Object System.Drawing.Font("Arial",10,[System.Drawing.FontStyle]::Bold)
$statusLabel.ForeColor = "Red"
$form.Controls.Add($statusLabel)

# Last update label
$updateLabel = New-Object System.Windows.Forms.Label
$updateLabel.Location = New-Object System.Drawing.Point(10,45)
$updateLabel.Size = New-Object System.Drawing.Size(320,15)
$updateLabel.Text = "Last update: Never"
$updateLabel.Font = New-Object System.Drawing.Font("Arial",8)
$form.Controls.Add($updateLabel)

# Connect button
$connectBtn = New-Object System.Windows.Forms.Button
$connectBtn.Location = New-Object System.Drawing.Point(50,75)
$connectBtn.Size = New-Object System.Drawing.Size(100,40)
$connectBtn.Text = "Connect"
$connectBtn.BackColor = "LightGreen"
$form.Controls.Add($connectBtn)

# Disconnect button
$disconnectBtn = New-Object System.Windows.Forms.Button
$disconnectBtn.Location = New-Object System.Drawing.Point(180,75)
$disconnectBtn.Size = New-Object System.Drawing.Size(100,40)
$disconnectBtn.Text = "Disconnect"
$disconnectBtn.BackColor = "LightCoral"
$disconnectBtn.Enabled = $false
$form.Controls.Add($disconnectBtn)

# URL label
$urlLabel = New-Object System.Windows.Forms.Label
$urlLabel.Location = New-Object System.Drawing.Point(10,135)
$urlLabel.Size = New-Object System.Drawing.Size(80,20)
$urlLabel.Text = "Config URL:"
$form.Controls.Add($urlLabel)

# URL textbox
$urlTextBox = New-Object System.Windows.Forms.TextBox
$urlTextBox.Location = New-Object System.Drawing.Point(10,160)
$urlTextBox.Size = New-Object System.Drawing.Size(300,20)
$urlTextBox.Text = $script:ConfigUrl
$form.Controls.Add($urlTextBox)

# Save URL button
$saveUrlBtn = New-Object System.Windows.Forms.Button
$saveUrlBtn.Location = New-Object System.Drawing.Point(320,158)
$saveUrlBtn.Size = New-Object System.Drawing.Size(60,24)
$saveUrlBtn.Text = "Save"
$form.Controls.Add($saveUrlBtn)

# Update config button
$updateBtn = New-Object System.Windows.Forms.Button
$updateBtn.Location = New-Object System.Drawing.Point(140,205)
$updateBtn.Size = New-Object System.Drawing.Size(100,30)
$updateBtn.Text = "Update Config"
$form.Controls.Add($updateBtn)

# System tray icon
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Text = "Sing-box VPN"
$notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
$notifyIcon.Visible = $true

# Context menu for tray icon
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip
$showItem = $contextMenu.Items.Add("Show")
$connectItem = $contextMenu.Items.Add("Connect")
$disconnectItem = $contextMenu.Items.Add("Disconnect")
$contextMenu.Items.Add("-")
$exitItem = $contextMenu.Items.Add("Exit")
$notifyIcon.ContextMenuStrip = $contextMenu

# Functions
function Reset-SystemProxy {
    Write-Host "Resetting system proxy..."
    
    # Reset WinHTTP proxy
    Start-Process -FilePath "netsh" -ArgumentList "winhttp reset proxy" -WindowStyle Hidden -Wait
    
    # Clear IE/System proxy settings
    $regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
    Set-ItemProperty -Path $regKey -Name ProxyEnable -Value 0
    Set-ItemProperty -Path $regKey -Name ProxyServer -Value ""
    Set-ItemProperty -Path $regKey -Name ProxyOverride -Value ""
    
    # Notify applications about proxy change
    Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        public class ProxyHelper {
            [DllImport("wininet.dll", SetLastError = true, CharSet = CharSet.Auto)]
            public static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lpBuffer, int dwBufferLength);
            
            public static void RefreshProxySettings() {
                InternetSetOption(IntPtr.Zero, 39, IntPtr.Zero, 0);
                InternetSetOption(IntPtr.Zero, 37, IntPtr.Zero, 0);
            }
        }
"@ -ErrorAction SilentlyContinue
    
    [ProxyHelper]::RefreshProxySettings()
}

function Download-Config {
    try {
        Write-Host "Downloading config from $script:ConfigUrl..."
        Invoke-WebRequest -Uri $script:ConfigUrl -OutFile $ConfigFile -UseBasicParsing
        $script:LastUpdate = (Get-Date).ToString("HH:mm:ss dd.MM.yyyy")
        $updateLabel.Text = "Last update: $script:LastUpdate"
        Write-Host "Config downloaded successfully at $script:LastUpdate"
        return $true
    } catch {
        [System.Windows.Forms.MessageBox]::Show("Failed to download config: $_", "Error", "OK", "Error")
        return $false
    }
}

function Save-Settings {
    @{ ConfigUrl = $script:ConfigUrl } | ConvertTo-Json | Out-File $script:SettingsFile
    $script:FirstRun = $false
}

function Start-VPN {
    if ($script:Running) { return }
    
    if ([string]::IsNullOrEmpty($script:ConfigUrl)) {
        [System.Windows.Forms.MessageBox]::Show("Please enter and save a config URL first", "Configuration Required", "OK", "Warning")
        return
    }
    
    # Always download fresh config before connecting
    Write-Host "Updating config before connection..."
    if (-not (Download-Config)) { 
        return 
    }
    
    try {
        Write-Host "Starting VPN..."
        $script:Process = Start-Process -FilePath $SingBoxExe -ArgumentList "run -c $ConfigFile" -WindowStyle Hidden -PassThru
        $script:Running = $true
        
        $statusLabel.Text = "Status: Connected"
        $statusLabel.ForeColor = "Green"
        $connectBtn.Enabled = $false
        $disconnectBtn.Enabled = $true
        $connectItem.Enabled = $false
        $disconnectItem.Enabled = $true
        
        $notifyIcon.Icon = [System.Drawing.SystemIcons]::Shield
        $notifyIcon.ShowBalloonTip(3000, "VPN Connected", "Sing-box VPN is now connected", "Info")
    } catch {
        [System.Windows.Forms.MessageBox]::Show("Failed to start VPN: $_", "Error", "OK", "Error")
    }
}

function Stop-VPN {
    if (-not $script:Running) { return }
    
    try {
        Write-Host "Stopping VPN..."
        
        # Kill sing-box process
        if ($script:Process -and -not $script:Process.HasExited) {
            $script:Process.Kill()
            Start-Sleep -Milliseconds 500
        }
        
        # Kill any orphaned sing-box processes
        Get-Process -Name "sing-box" -ErrorAction SilentlyContinue | Stop-Process -Force
        
        # Reset proxy settings
        Reset-SystemProxy
        
        $script:Running = $false
        $script:Process = $null
        
        $statusLabel.Text = "Status: Disconnected"
        $statusLabel.ForeColor = "Red"
        $connectBtn.Enabled = $true
        $disconnectBtn.Enabled = $false
        $connectItem.Enabled = $true
        $disconnectItem.Enabled = $false
        
        $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
        $notifyIcon.ShowBalloonTip(3000, "VPN Disconnected", "Sing-box VPN is now disconnected", "Info")
    } catch {
        [System.Windows.Forms.MessageBox]::Show("Failed to stop VPN: $_", "Error", "OK", "Error")
    }
}

# Event handlers
$connectBtn.Add_Click({ Start-VPN })
$disconnectBtn.Add_Click({ Stop-VPN })
$updateBtn.Add_Click({ 
    $wasRunning = $script:Running
    if ($wasRunning) { Stop-VPN }
    if (Download-Config) {
        if ($wasRunning) { Start-VPN }
    }
})

$saveUrlBtn.Add_Click({
    $newUrl = $urlTextBox.Text.Trim()
    if ([string]::IsNullOrEmpty($newUrl)) {
        [System.Windows.Forms.MessageBox]::Show("Please enter a valid URL", "Error", "OK", "Warning")
        return
    }
    
    $script:ConfigUrl = $newUrl
    Save-Settings
    [System.Windows.Forms.MessageBox]::Show("Config URL saved successfully!", "Success", "OK", "Information")
})

$showItem.Add_Click({ 
    $form.Show()
    $form.WindowState = "Normal"
    $form.Activate()
})
$connectItem.Add_Click({ Start-VPN })
$disconnectItem.Add_Click({ Stop-VPN })
$exitItem.Add_Click({ 
    if ($script:Running) {
        Stop-VPN
    }
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    [System.Windows.Forms.Application]::Exit()
})

$notifyIcon.Add_DoubleClick({
    $form.Show()
    $form.WindowState = "Normal"
    $form.Activate()
})

$form.Add_FormClosing({
    if ($_.CloseReason -eq "UserClosing") {
        $_.Cancel = $true
        $form.Hide()
        $notifyIcon.ShowBalloonTip(2000, "Sing-box VPN", "Minimized to system tray. Right-click tray icon to exit.", "Info")
    }
})

# Check if sing-box.exe exists
if (-not (Test-Path $SingBoxExe)) {
    [System.Windows.Forms.MessageBox]::Show("sing-box.exe not found in current directory!", "Error", "OK", "Error")
    exit
}

# Download config if URL is set and config doesn't exist
if (-not [string]::IsNullOrEmpty($script:ConfigUrl) -and -not (Test-Path $ConfigFile)) {
    Download-Config
}

# Reset proxy on script start (cleanup from previous sessions)
Write-Host "Checking proxy settings on startup..."
$regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
$proxyEnabled = Get-ItemProperty -Path $regKey -Name ProxyEnable -ErrorAction SilentlyContinue
if ($proxyEnabled.ProxyEnable -eq 1) {
    Write-Host "Found enabled proxy from previous session, resetting..."
    Reset-SystemProxy
}

# Show form on first run, otherwise start minimized
if ($script:FirstRun) {
    $form.Show()
    [System.Windows.Forms.MessageBox]::Show("Please enter your VPN config URL and save it", "Welcome", "OK", "Information")
} else {
    $form.WindowState = "Minimized"
    $form.Hide()
    $notifyIcon.ShowBalloonTip(3000, "Sing-box VPN", "Running in system tray", "Info")
}

# Run application
[System.Windows.Forms.Application]::Run($form)

# Cleanup on exit
if ($script:Running) {
    Stop-VPN
}