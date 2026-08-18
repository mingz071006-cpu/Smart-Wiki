param([switch]$NoAutoStart)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

$projectDirectory = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$serviceScript = Join-Path $projectDirectory 'scripts\smart-wiki-service.ps1'
$port = 3000
$localUrl = "http://127.0.0.1:$port/"

function Get-ServerProcess {
    $line = netstat -ano -p TCP | Select-String "^\s*TCP\s+\S+:$port\s+\S+\s+LISTENING\s+(\d+)\s*$" | Select-Object -First 1
    if ($line -and $line.Matches.Count) {
        $processId = [int]$line.Matches[0].Groups[1].Value
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process -and $process.ProcessName -eq 'node') { return $process }
    }
    return $null
}

function Get-LanAddress {
    $address = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' -and $_.PrefixOrigin -ne 'WellKnown' } |
        Sort-Object { if ($_.InterfaceAlias -match 'Wi-Fi|WLAN|以太网|Ethernet') { 0 } else { 1 } } |
        Select-Object -First 1 -ExpandProperty IPAddress
    if ($address) { return "http://${address}:$port/" }
    return $localUrl
}

function Invoke-ServiceAction([string]$Action) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = 'powershell.exe'
    $info.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$serviceScript`" -Action $Action"
    $info.WorkingDirectory = $projectDirectory
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardError = $true
    $process = [System.Diagnostics.Process]::Start($info)
    $process.WaitForExit(12000)
    if (-not $process.HasExited) { $process.Kill(); throw '服务器操作超时' }
    $errorText = $process.StandardError.ReadToEnd().Trim()
    if ($process.ExitCode -ne 0) { throw $(if ($errorText) { $errorText } else { '服务器操作失败' }) }
}

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Smart Wiki 服务端管理器'
$form.Size = New-Object System.Drawing.Size(820, 720)
$form.MinimumSize = New-Object System.Drawing.Size(760, 650)
$form.StartPosition = 'CenterScreen'
$form.BackColor = [System.Drawing.Color]::FromArgb(245, 247, 252)
$form.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 10)
$form.Icon = [System.Drawing.SystemIcons]::Application

$header = New-Object System.Windows.Forms.Panel
$header.Dock = 'Top'; $header.Height = 104; $header.BackColor = [System.Drawing.Color]::FromArgb(76, 64, 230)
$form.Controls.Add($header)

$logo = New-Object System.Windows.Forms.Label
$logo.Text = 'S'; $logo.ForeColor = [System.Drawing.Color]::White; $logo.BackColor = [System.Drawing.Color]::FromArgb(104, 91, 244)
$logo.Font = New-Object System.Drawing.Font('Segoe UI', 25, [System.Drawing.FontStyle]::Bold)
$logo.TextAlign = 'MiddleCenter'; $logo.SetBounds(24, 20, 62, 62)
$header.Controls.Add($logo)

$title = New-Object System.Windows.Forms.Label
$title.Text = 'Smart Wiki'; $title.ForeColor = [System.Drawing.Color]::White
$title.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 19, [System.Drawing.FontStyle]::Bold)
$title.SetBounds(104, 20, 260, 34); $header.Controls.Add($title)
$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = '本机服务与局域网访问控制中心'; $subtitle.ForeColor = [System.Drawing.Color]::FromArgb(220, 218, 255)
$subtitle.SetBounds(106, 58, 320, 24); $header.Controls.Add($subtitle)

$statusCard = New-Object System.Windows.Forms.Panel
$statusCard.SetBounds(24, 126, 756, 106); $statusCard.Anchor = 'Top,Left,Right'; $statusCard.BackColor = [System.Drawing.Color]::White
$statusCard.BorderStyle = 'FixedSingle'; $form.Controls.Add($statusCard)
$statusDot = New-Object System.Windows.Forms.Label
$statusDot.Text = '●'; $statusDot.Font = New-Object System.Drawing.Font('Segoe UI', 16); $statusDot.SetBounds(20, 19, 30, 30); $statusCard.Controls.Add($statusDot)
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 14, [System.Drawing.FontStyle]::Bold); $statusLabel.SetBounds(54, 18, 250, 32); $statusCard.Controls.Add($statusLabel)
$detailLabel = New-Object System.Windows.Forms.Label
$detailLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 112, 135); $detailLabel.SetBounds(22, 58, 700, 28); $statusCard.Controls.Add($detailLabel)

function New-ManagerButton([string]$Text, [int]$X, [int]$Y, [int]$Width = 154, [bool]$Primary = $false) {
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $Text; $button.SetBounds($X, $Y, $Width, 44); $button.FlatStyle = 'Flat'; $button.Cursor = 'Hand'
    if ($Primary) { $button.BackColor = [System.Drawing.Color]::FromArgb(76, 64, 230); $button.ForeColor = [System.Drawing.Color]::White; $button.FlatAppearance.BorderSize = 0 }
    else { $button.BackColor = [System.Drawing.Color]::White; $button.ForeColor = [System.Drawing.Color]::FromArgb(35, 43, 62); $button.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(218, 223, 235) }
    $form.Controls.Add($button); return $button
}

$startButton = New-ManagerButton '启动服务器' 24 252 154 $true
$restartButton = New-ManagerButton '重新启动' 190 252
$stopButton = New-ManagerButton '停止服务器' 356 252
$refreshButton = New-ManagerButton '刷新状态' 522 252
$homeButton = New-ManagerButton '打开 Smart Wiki' 24 310 210 $true
$qrButton = New-ManagerButton '打开 QR CODE' 246 310 154
$adminButton = New-ManagerButton '打开管理后台' 412 310 154
$dataButton = New-ManagerButton '数据文件夹' 578 310 142
$copyButton = New-ManagerButton '复制手机访问地址' 24 368 210

$lanLabel = New-Object System.Windows.Forms.Label
$lanLabel.SetBounds(250, 372, 530, 34); $lanLabel.ForeColor = [System.Drawing.Color]::FromArgb(76, 64, 230)
$lanLabel.TextAlign = 'MiddleLeft'; $form.Controls.Add($lanLabel)

$onlineTitle = New-Object System.Windows.Forms.Label
$onlineTitle.Text = '在线设备（最近 5 分钟）'; $onlineTitle.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 11, [System.Drawing.FontStyle]::Bold)
$onlineTitle.SetBounds(24, 420, 260, 25); $form.Controls.Add($onlineTitle)
$onlineCount = New-Object System.Windows.Forms.Label
$onlineCount.Text = '0 台在线'; $onlineCount.ForeColor = [System.Drawing.Color]::FromArgb(32, 171, 112); $onlineCount.TextAlign = 'MiddleRight'
$onlineCount.SetBounds(620, 420, 160, 25); $onlineCount.Anchor = 'Top,Right'; $form.Controls.Add($onlineCount)
$deviceList = New-Object System.Windows.Forms.ListView
$deviceList.View = 'Details'; $deviceList.FullRowSelect = $true; $deviceList.GridLines = $false; $deviceList.HideSelection = $false
$deviceList.SetBounds(24, 450, 756, 108); $deviceList.Anchor = 'Top,Left,Right'; $deviceList.BackColor = [System.Drawing.Color]::White
[void]$deviceList.Columns.Add('设备', 210); [void]$deviceList.Columns.Add('类型', 90); [void]$deviceList.Columns.Add('浏览器', 110); [void]$deviceList.Columns.Add('IP 地址', 170); [void]$deviceList.Columns.Add('最后活动', 130)
$form.Controls.Add($deviceList)

$logTitle = New-Object System.Windows.Forms.Label
$logTitle.Text = '运行记录'; $logTitle.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 11, [System.Drawing.FontStyle]::Bold)
$logTitle.SetBounds(24, 574, 120, 25); $form.Controls.Add($logTitle)
$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true; $logBox.ReadOnly = $true; $logBox.ScrollBars = 'Vertical'; $logBox.BackColor = [System.Drawing.Color]::White
$logBox.SetBounds(24, 603, 756, 72); $logBox.Anchor = 'Top,Bottom,Left,Right'; $form.Controls.Add($logBox)

function Add-ManagerLog([string]$Text) {
    $logBox.AppendText("[$(Get-Date -Format 'HH:mm:ss')] $Text`r`n")
}

function Update-ServerStatus {
    $process = Get-ServerProcess
    $lan = Get-LanAddress; $lanLabel.Text = $lan
    if ($process) {
        $statusDot.ForeColor = [System.Drawing.Color]::FromArgb(32, 171, 112)
        $statusLabel.Text = '服务器正在运行'
        $detailLabel.Text = "进程 PID $($process.Id)  ·  本机端口 $port  ·  手机与电脑需连接同一网络"
        $startButton.Enabled = $false; $restartButton.Enabled = $true; $stopButton.Enabled = $true
        $homeButton.Enabled = $true; $qrButton.Enabled = $true; $adminButton.Enabled = $true
        try {
            $online = Invoke-RestMethod -Uri ($localUrl + 'api/online-devices') -TimeoutSec 2
            $deviceList.BeginUpdate(); $deviceList.Items.Clear()
            foreach ($device in $online.items) {
                $row = New-Object System.Windows.Forms.ListViewItem([string]$device.model)
                [void]$row.SubItems.Add([string]$device.type); [void]$row.SubItems.Add([string]$device.browser); [void]$row.SubItems.Add([string]$device.ip)
                [void]$row.SubItems.Add(([datetime]$device.lastSeenAt).ToLocalTime().ToString('HH:mm:ss')); [void]$deviceList.Items.Add($row)
            }
            $deviceList.EndUpdate(); $onlineCount.Text = "$($online.count) 台在线"
        } catch { $onlineCount.Text = '读取失败' }
    } else {
        $statusDot.ForeColor = [System.Drawing.Color]::FromArgb(220, 70, 82)
        $statusLabel.Text = '服务器已停止'
        $detailLabel.Text = '点击“启动服务器”开始运行 Smart Wiki'
        $startButton.Enabled = $true; $restartButton.Enabled = $false; $stopButton.Enabled = $false
        $homeButton.Enabled = $false; $qrButton.Enabled = $false; $adminButton.Enabled = $false
        $deviceList.Items.Clear(); $onlineCount.Text = '0 台在线'
    }
}

$startButton.Add_Click({ try { Invoke-ServiceAction 'start'; Add-ManagerLog '服务器已启动' } catch { Add-ManagerLog "启动失败：$($_.Exception.Message)" }; Update-ServerStatus })
$restartButton.Add_Click({ try { Invoke-ServiceAction 'restart'; Add-ManagerLog '服务器已重新启动' } catch { Add-ManagerLog "重启失败：$($_.Exception.Message)" }; Update-ServerStatus })
$stopButton.Add_Click({ try { Invoke-ServiceAction 'stop'; Add-ManagerLog '服务器已停止' } catch { Add-ManagerLog "停止失败：$($_.Exception.Message)" }; Update-ServerStatus })
$refreshButton.Add_Click({ Update-ServerStatus; Add-ManagerLog '状态已刷新' })
$homeButton.Add_Click({ Start-Process $localUrl })
$qrButton.Add_Click({ Start-Process ($localUrl + 'lan.html') })
$adminButton.Add_Click({ Start-Process ($localUrl + 'admin.html') })
$dataButton.Add_Click({ Start-Process explorer.exe -ArgumentList (Join-Path $projectDirectory 'data') })
$copyButton.Add_Click({ [System.Windows.Forms.Clipboard]::SetText((Get-LanAddress)); Add-ManagerLog '手机访问地址已复制' })

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 2500; $timer.Add_Tick({ Update-ServerStatus }); $timer.Start()

$script:allowClose = $false
$form.Add_FormClosing({
    param($sender, $eventArgs)
    if ($script:allowClose) { return }
    $running = Get-ServerProcess
    if ($running) {
        $choice = [System.Windows.Forms.MessageBox]::Show('关闭管理器时同时停止 Smart Wiki 服务器吗？', '关闭 Smart Wiki', 'YesNoCancel', 'Question')
        if ($choice -eq 'Cancel') { $eventArgs.Cancel = $true; return }
        if ($choice -eq 'Yes') { try { Invoke-ServiceAction 'stop' } catch {} }
    }
    $script:allowClose = $true
})

if (-not $NoAutoStart -and -not (Get-ServerProcess)) {
    try { Invoke-ServiceAction 'start'; Add-ManagerLog '管理器已自动启动服务器' } catch { Add-ManagerLog "自动启动失败：$($_.Exception.Message)" }
} else { Add-ManagerLog '服务端管理器已打开' }
Update-ServerStatus
[void]$form.ShowDialog()
