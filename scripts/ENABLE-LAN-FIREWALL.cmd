@echo off
netsh advfirewall firewall delete rule name="Smart Wiki LAN" >nul 2>&1
netsh advfirewall firewall add rule name="Smart Wiki LAN" dir=in action=allow protocol=TCP localport=3000 profile=private
echo Smart Wiki LAN firewall rule is enabled for private networks.
pause
