$baseUrl = "http://localhost:3001/api";
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (Get-Content "temp_login.json" -Raw) -ContentType "application/json";
$token = $login.token;
$headers = @{Authorization = "Bearer $token"};

Write-Output "--- Initial Stats ---";
$stats1 = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Headers $headers;
Write-Output $stats1;

Write-Output "--- Creating Employee ---";
$newEmp = @{
    name = "API Test User";
    email = "api.test@example.com";
    phone = "9999999999";
    department = "Engineering";
    designation = "Tester";
    salary = 60000;
    status = "active";
    location = "Remote";
    dateOfJoining = "2026-02-08"
} | ConvertTo-Json;

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/employees" -Method Post -Body $newEmp -Headers $headers -ContentType "application/json";
    Write-Output "Created: $($created.name)";
} catch {
    Write-Output "Error creating employee: $_";
}

Write-Output "--- New Stats ---";
$stats2 = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Headers $headers;
Write-Output $stats2;

Write-Output "--- Employee List Check ---";
$employees = Invoke-RestMethod -Uri "$baseUrl/employees" -Headers $headers;
$found = $employees | Where-Object { $_.email -eq "api.test@example.com" };
if ($found) { Write-Output "Found in list: YES" } else { Write-Output "Found in list: NO" };
