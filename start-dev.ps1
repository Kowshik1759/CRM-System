# Windows PowerShell Quick-Start Script for Enterprise CRM
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       ENTERPRISE CRM SYSTEM FOR SMALL BUSINESSES" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Default Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:            admin@crmpro.com    / Admin@123" -ForegroundColor White
Write-Host "  Sales Manager:    manager@crmpro.com  / Manager@123" -ForegroundColor White
Write-Host "  Sales Executive:  executive@crmpro.com/ Executive@123" -ForegroundColor White
Write-Host "  Customer Support: support@crmpro.com  / Support@123" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan

node start-dev.js
