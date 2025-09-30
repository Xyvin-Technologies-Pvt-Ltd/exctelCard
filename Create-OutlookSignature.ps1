
# Connect to Microsoft Graph (interactive login)
Connect-MgGraph -Scopes "User.Read"

# Get user details
$user = Get-MgUser -UserId (Get-MgContext).Account -Property GivenName,Surname,JobTitle,Department,TelephoneNumber,MobilePhone,Mail,CompanyName,StreetAddress

# Signature folder path
$signaturePath = "$env:APPDATA\Microsoft\Signatures"
if (!(Test-Path $signaturePath)) { New-Item -ItemType Directory -Path $signaturePath | Out-Null }

# Custom HTML signature
$signatureHtml = @"
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@font-face{font-family:"AktivGrotesk";src:url("https://cdn-ileaolp.nitrocdn.com/...") format("opentype");font-weight:400;font-style:normal;font-display:swap}
body{margin:0;padding:20px;font-family:"AktivGrotesk",Arial,sans-serif}
</style></head><body><br/>
<table cellpadding="0" cellspacing="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:15px;line-height:1.4;color:#333;width:600px">
<tr>
<td valign="top" style="padding-right:20px;width:180px">
  <div style="font-weight:bold;color:#000;font-size:17px;margin-bottom:2px">$($user.GivenName) $($user.Surname)</div>
  <div style="color:#000;font-size:16px;margin-bottom:15px">$($user.JobTitle)</div>
  <div style="margin-bottom:15px"><img src="https://.../exctel-logo.png" alt="Exctel" width="160" style="display:block"></div>
</td>
<td valign="top" style="padding-left:20px;font-size:14px;color:#333">
  <table cellpadding="3" cellspacing="0" style="font-size:14px">
    <tr><td style="width:20px;padding-right:8px"><img src="https://img.icons8.com/.../email.png" width="14" height="14"></td><td><a href="mailto:$($user.Mail)">$($user.Mail)</a></td></tr>
    <tr><td style="padding-right:8px"><img src="https://img.icons8.com/.../mobile.png" width="14" height="14"></td><td><a href="tel:$($user.MobilePhone)">$($user.MobilePhone)</a></td></tr>
    <tr><td style="padding-right:8px"><img src="https://img.icons8.com/.../landline.png" width="14" height="14"></td><td><a href="tel:$($user.TelephoneNumber)">$($user.TelephoneNumber)</a></td></tr>
    <tr><td style="padding-right:8px;vertical-align:top"><img src="https://img.icons8.com/.../marker.png" width="12" height="14"></td><td>$($user.StreetAddress)</td></tr>
  </table>
</td>
</tr></table>
<table width="600"><tr><td style="border-top:2px solid #ff8331">&nbsp;</td></tr></table>
<br/>
<table cellpadding="0" cellspacing="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:14px;width:500px">
<tr><td style="width:180px"><a href="https://www.exctel.com" target="_blank" style="font-weight:bold">www.exctel.com</a></td>
<td>
  <a href="https://facebook.com/exctel"><img src="https://img.icons8.com/.../facebook.png" width="20"></a>
  <a href="https://linkedin.com/company/exctel"><img src="https://img.icons8.com/.../linkedin.png" width="20"></a>
  <a href="https://instagram.com/exctel"><img src="https://img.icons8.com/.../instagram.png" width="20"></a>
  <a href="https://x.com/exctel"><img src="https://.../twitter-x.png" width="20"></a>
</td></tr></table>
<table style="font-size:9px;color:#555;width:600px">
<tr><td style="padding-top:10px;font-style:italic;text-align:justify;">
This email and any attachments are confidential...
</td></tr></table>
</body></html>
"@

# Save signature
$signatureName = "CompanySignature"
$signatureHtml | Out-File "$signaturePath\$signatureName.htm" -Encoding UTF8
"" | Out-File "$signaturePath\$signatureName.rtf" -Encoding ASCII
"" | Out-File "$signaturePath\$signatureName.txt" -Encoding ASCII

# Set as default
$regPath = "HKCU:\Software\Microsoft\Office\16.0\Common\MailSettings"
New-ItemProperty -Path $regPath -Name "NewSignature" -Value $signatureName -Force
New-ItemProperty -Path $regPath -Name "ReplySignature" -Value $signatureName -Force

