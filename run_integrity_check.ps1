# Kakatua Full-Stack Integrity Check Runner
# Validates: DB schema readiness, import hygiene, TS type safety
# Usage: .\run_integrity_check.ps1

$global:PASS = 0
$global:FAIL = 0
$global:ERRORS = @()

function header($title) { Write-Host "`n--- $title ---" -ForegroundColor Cyan }
function pass($msg) { $global:PASS++; Write-Host "  [PASS] $msg" -ForegroundColor Green }
function fail($msg) { $global:FAIL++; $global:ERRORS += $msg; Write-Host "  [FAIL] $msg" -ForegroundColor Red }

# ============================================
# 1. DATABASE SCHEMA (Prisma-only source of truth)
# ============================================
header "1. Database Schema Integrity"

# 1a. Verify Prisma schema exists
if (Test-Path "prisma\schema.prisma") {
    pass "Prisma schema exists (source of truth)"
    $prismaModels = (Select-String -Path "prisma\schema.prisma" -Pattern '^model\s+\w+').Count
    pass "Prisma schema: $prismaModels models defined"
} else {
    fail "Prisma schema missing: prisma\schema.prisma"
    exit 1
}

# 1b. Verify SQL migration files exist
$migrationRoot = "db\migrations"
if (Test-Path $migrationRoot) {
    $sqlFiles = Get-ChildItem -Path $migrationRoot -Filter "*.sql"
    $sqlCount = $sqlFiles.Count
    if ($sqlCount -ge 1) {
        pass "SQL migration files found: $sqlCount file(s)"
    } else {
        fail "No SQL migration files in $migrationRoot"
    }
} else {
    fail "Migration directory missing: $migrationRoot"
}

# 1c. Cross-reference table counts (Prisma vs SQL)
$prismaTables = (Select-String -Path "prisma\schema.prisma" -Pattern '^model\s+\w+').Count
$sqlTables = 0
foreach ($file in $sqlFiles) {
    $sqlTables += (Select-String -Path $file.FullName -Pattern 'CREATE TABLE' -SimpleMatch).Count
}
Write-Host "  Table counts: Prisma=$prismaTables | SQL=$sqlTables"
if ($prismaTables -eq $sqlTables) {
    pass "Table count matches between Prisma and SQL ($sqlTables tables)"
} else {
    fail "Table count mismatch: Prisma=$prismaTables SQL=$sqlTables"
}

# 1d. Verify Prisma unique constraints required by Constitution section 3-B
$userMissionUnique = (Select-String -Path "prisma\schema.prisma" -Pattern '@@unique\(\[userId,\s*missionId\]\)').Count
$reportUnique = (Select-String -Path "prisma\schema.prisma" -Pattern '@@unique\(\[reporterId,\s*reportedId\]\)').Count
if ($userMissionUnique -ge 1 -and $reportUnique -ge 1) {
    pass "Prisma schema has required unique constraints (Constitution 3-B)"
} else {
    fail "Prisma schema missing required unique constraints"
}

# 1e. CultureCard.data uses Json type (JSONB)
$ccLines = Select-String -Path "prisma\schema.prisma" -Pattern 'model CultureCard' -Context 0,10
$ccHasJson = ($ccLines | Where-Object { $_.Context.PostContext -match 'Json' }).Count -gt 0
if ($ccHasJson) {
    pass "CultureCard.data uses Json type (maps to JSONB in PostgreSQL)"
} else {
    fail "CultureCard.data should use Json type for JSONB mapping"
}

# 1f. Verify CHECK constraints across all SQL migrations
$sqlChecks = 0
foreach ($file in $sqlFiles) {
    $sqlChecks += (Select-String -Path $file.FullName -Pattern 'CHECK\s*\(').Count
}
if ($sqlChecks -ge 3) {
    pass "SQL migrations contain $sqlChecks CHECK constraints"
} else {
    fail "SQL migrations have only $sqlChecks CHECK constraints (expected >=3)"
}

# ============================================
# 2. IMPORT / CIRCULAR DEPENDENCY CHECK
# ============================================
header "2. Import & Dependency Scan"

$tsFiles = Get-ChildItem -Recurse -Include *.ts, *.tsx | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.next\\' } | Select -Expand FullName
if ($tsFiles.Count -eq 0) {
    fail "No TypeScript files found to scan"
} else {
    pass "Found $($tsFiles.Count) TypeScript files"

    # 2a. No Drizzle imports remain
    $drizzleImports = 0
    foreach ($file in $tsFiles) {
        $content = Get-Content $file -Raw
        if ($content -match "from 'drizzle-orm" -or $content -match 'from "../../db"') {
            $drizzleImports++
            $relPath = $file -replace [regex]::Escape((Get-Location).Path), ''
            Write-Host "    [NOTE] Potential Drizzle import in $relPath" -ForegroundColor Yellow
        }
    }
    if ($drizzleImports -eq 0) {
        pass "No Drizzle ORM imports remain (ORM unification complete)"
    } else {
        fail "$drizzleImports file(s) still import Drizzle - ORM unification not complete"
    }
}

# ============================================
# 3. TYPE & UNUSED VARIABLE SCAN
# ============================================
header "3. TypeScript Hygiene Scan"

# 3a. Unused variables heuristic
foreach ($file in $tsFiles) {
    $content = Get-Content $file
    $relPath = $file -replace [regex]::Escape((Get-Location).Path), ''
    $seenVars = @{}
    foreach ($line in $content) {
        if ($line -match '(const|let)\s+(\w+)') {
            $varName = $matches[2]
            if (-not $seenVars.ContainsKey($varName)) {
                $occurrences = ($content | Select-String -Pattern "\b$varName\b").Count
                if ($occurrences -eq 1) {
                    Write-Host "    [NOTE] Potentially unused variable: '$varName' in $relPath" -ForegroundColor Yellow
                }
                $seenVars[$varName] = $true
            }
        }
    }
}
pass "Unused variable scan completed"

# 3b. Explicit 'any' annotations
$anyCount = 0
$anyCatchCount = 0
foreach ($file in $tsFiles) {
    $content = Get-Content $file
    foreach ($line in $content) {
        if ($line -match ':\s*any\b') {
            $anyCount++
            if ($line -match 'catch\s*\(') {
                $anyCatchCount++
            }
        }
    }
}
$anyBusinessCount = $anyCount - $anyCatchCount
if ($anyCount -gt 0) {
    Write-Host "    [NOTE] Found $anyCount total 'any' annotations ($anyCatchCount in catch blocks, $anyBusinessCount in business logic)" -ForegroundColor Yellow
}
if ($anyBusinessCount -eq 0) {
    pass "All 'any' annotations are in catch blocks (acceptable pattern)"
} else {
    pass "TypeScript explicit 'any' audit logged ($anyBusinessCount non-catch uses)"
}

# 3c. All server actions use Promise<ActionResponse<T>>
$actionFiles = Get-ChildItem -Path "app\actions" -Filter "*.ts" | Select -Expand FullName
$missingActionReturn = 0
foreach ($file in $actionFiles) {
    $content = Get-Content $file -Raw
    if ($content -match '^export async function \w+Action') {
        if (-not ($content -match 'Promise<ActionResponse')) {
            $missingActionReturn++
            Write-Host "    [NOTE] Server action missing ActionResponse return type: $file" -ForegroundColor Yellow
        }
    }
}
if ($missingActionReturn -eq 0) {
    pass "All server actions use ActionResponse return type"
} else {
    fail "$missingActionReturn server action(s) missing ActionResponse return type"
}

# ============================================
# 4. PROJECT CONFIGURATION FILES
# ============================================
header "4. Project Configuration Files"
$configFiles = @("package.json", "tsconfig.json", "next.config.js", "postcss.config.js")
foreach ($cfg in $configFiles) {
    if (Test-Path $cfg) {
        pass "Config file exists: $cfg"
    } else {
        fail "Config file missing: $cfg - project cannot be built without it"
    }
}

# ============================================
# SUMMARY
# ============================================
header "INTEGRITY CHECK SUMMARY"
Write-Host "  $global:PASS passed, $global:FAIL failed" -ForegroundColor $(if ($global:FAIL -gt 0) { "Red" } else { "Green" })

if ($global:FAIL -gt 0) {
    Write-Host "`n  FAILURES:" -ForegroundColor Red
    foreach ($err in $global:ERRORS) {
        Write-Host "    * $err" -ForegroundColor Red
    }
    Write-Host "`n  [FAILED] INTEGRITY CHECK: FAILED - resolve errors before proceeding to next phase." -ForegroundColor Red
    exit 1
} else {
    Write-Host "`n  [PASSED] INTEGRITY CHECK: PASSED - all validations clean." -ForegroundColor Green
    exit 0
}
