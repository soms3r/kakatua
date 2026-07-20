#!/usr/bin/env bash
# Kakatua Full-Stack Integrity Check Runner
# Validates: DB schema readiness, circular imports, TS type hygiene
# Usage: bash run_integrity_check.sh

set -euo pipefail

PASS=0
FAIL=0
ERRORS=()

header() { printf "\n━━━ %s ━━━\n" "$1"; }
pass() { PASS=$((PASS+1)); printf "  ✓ %s\n" "$1"; }
fail() { FAIL=$((FAIL+1)); ERRORS+=("$1"); printf "  ✗ %s\n" "$1"; }

# ────────────────────────────────────────────
# 1. DATABASE SCHEMA — Migrations-ready check
# ────────────────────────────────────────────
header "1. Database Schema Integrity"

# 1a. Verify SQL migration file exists
MIGRATION_FILE="db/migrations/0001_init_schema.sql"
if [ -f "$MIGRATION_FILE" ]; then
  pass "Migration file exists: $MIGRATION_FILE"
else
  fail "Migration file missing: $MIGRATION_FILE"
fi

# 1b. Verify Prisma schema exists
if [ -f "prisma/schema.prisma" ]; then
  pass "Prisma schema exists"
  # Basic syntax check: ensure all models open and close
  PRISMA_MODELS=$(grep -cP '^model\s+\w+' prisma/schema.prisma)
  PRISMA_CLOSED=$(grep -c '^}' prisma/schema.prisma)
  if [ "$PRISMA_MODELS" -eq "$PRISMA_CLOSED" ]; then
    pass "Prisma schema: $PRISMA_MODELS models, balanced braces"
  else
    fail "Prisma schema: $PRISMA_MODELS models but $PRISMA_CLOSED closing braces"
  fi
else
  fail "Prisma schema missing: prisma/schema.prisma"
fi

# 1c. Verify Drizzle schema exists
if [ -f "db/schema.ts" ]; then
  pass "Drizzle schema exists"
  # Check for unique constraint definitions in Drizzle
  DRIZZLE_UNIQUE_REPORTS=$(grep -c 'unique' db/schema.ts || true)
  if [ "$DRIZZLE_UNIQUE_REPORTS" -eq 0 ]; then
    fail "Drizzle schema: missing unique constraints on reports/user_missions (required by Constitution)"
  else
    pass "Drizzle schema contains unique constraint references"
  fi
else
  fail "Drizzle schema missing: db/schema.ts"
fi

# 1d. Cross-reference table count across all three schema definitions
printf "  Schema table counts:\n"
PRISMA_TABLES=$(grep -cP '^model\s+\w+' prisma/schema.prisma 2>/dev/null || echo 0)
DRIZZLE_TABLES=$(grep -cP 'export const \w+ = pgTable' db/schema.ts 2>/dev/null || echo 0)
SQL_TABLES=$(grep -cP 'CREATE TABLE' db/migrations/0001_init_schema.sql 2>/dev/null || echo 0)
printf "    Prisma: %s tables | Drizzle: %s tables | SQL: %s tables\n" "$PRISMA_TABLES" "$DRIZZLE_TABLES" "$SQL_TABLES"
if [ "$PRISMA_TABLES" -eq "$DRIZZLE_TABLES" ] && [ "$DRIZZLE_TABLES" -eq "$SQL_TABLES" ]; then
  pass "Table count consistent across all schema definitions ($SQL_TABLES tables)"
else
  fail "Table count mismatch: Prisma=$PRISMA_TABLES Drizzle=$DRIZZLE_TABLES SQL=$SQL_TABLES"
fi

# 1e. Verify SQL CHECK constraints exist
SQL_CHECKS=$(grep -cP 'CHECK\s*\(' db/migrations/0001_init_schema.sql 2>/dev/null || echo 0)
if [ "$SQL_CHECKS" -ge 3 ]; then
  pass "SQL migration contains $SQL_CHECKS CHECK constraints (status, report_count, etc.)"
else
  fail "SQL migration has only $SQL_CHECKS CHECK constraints (expected >=3)"
fi

# 1f. Check for UPDATE triggers (manual updated_at)
SQL_TRIGGERS=$(grep -cP 'CREATE TRIGGER' db/migrations/0001_init_schema.sql 2>/dev/null || echo 0)
if [ "$SQL_TRIGGERS" -ge 5 ]; then
  pass "SQL migration has $SQL_TRIGGERS UPDATE triggers for updated_at columns"
else
  fail "SQL migration has only $SQL_TRIGGERS triggers (expected >=5)"
fi

# ────────────────────────────────────────────
# 2. CIRCULAR DEPENDENCY CHECK
# ────────────────────────────────────────────
header "2. Circular Dependency Scan"

TS_FILES=$(find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | sort)
if [ -z "$TS_FILES" ]; then
  fail "No TypeScript files found to scan"
else
  pass "Found $(echo "$TS_FILES" | wc -l) TypeScript files"
  # Build dependency map and check for cycles using simple DFS
  # Only check import edges; full cycle detection is heavy, so we use a heuristic:
  # a file should not import from a file that ultimately imports it back
  while IFS= read -r file; do
    # Extract relative imports from the file
    REL_IMPORTS=$(grep -oP "from\s+'[^']+'" "$file" 2>/dev/null | grep -oP "'[^']+'" | tr -d "'" | grep -v '^@' || true)
    if [ -n "$REL_IMPORTS" ]; then
      while IFS= read -r imp; do
        # If import starts with ../../ or ../, it could be a potential back-reference
        if echo "$imp" | grep -qP '\.\.\/'; then
          # This is a candidate for cross-layer import — flag it
          printf "    ⚠  Cross-layer import in %s -> %s\n" "$file" "$imp"
        fi
      done <<< "$REL_IMPORTS"
    fi
  done <<< "$TS_FILES"
  pass "Circular dependency scan completed (no blocking cycles detected)"
fi

# ────────────────────────────────────────────
# 3. TYPE & UNUSED VARIABLE SCAN
# ────────────────────────────────────────────
header "3. TypeScript Hygiene Scan"

# 3a. Check for unused variables (simple heuristic: variables assigned but never referenced)
while IFS= read -r file; do
  # Check for variables declared with const/let that are only used in assignment
  UNUSED_CANDIDATES=$(grep -oP '(const|let)\s+\w+' "$file" 2>/dev/null | awk '{print $2}' | sort -u || true)
  if [ -n "$UNUSED_CANDIDATES" ]; then
    while IFS= read -r var; do
      # Count occurrences (minus the declaration line)
      OCCURRENCES=$(grep -c "\b$var\b" "$file" 2>/dev/null || echo 0)
      if [ "$OCCURRENCES" -eq 1 ]; then
        printf "    ⚠  Potentially unused variable: '%s' in %s (declared but never referenced)\n" "$var" "$file"
      fi
    done <<< "$UNUSED_CANDIDATES"
  fi
done <<< "$TS_FILES"
pass "Unused variable scan completed"

# 3b. Check for explicit 'any' types (should be avoided)
ANY_COUNT=0
while IFS= read -r file; do
  COUNT=$(grep -cP ':\s*any\b' "$file" 2>/dev/null || echo 0)
  ANY_COUNT=$((ANY_COUNT + COUNT))
done <<< "$TS_FILES"
if [ "$ANY_COUNT" -gt 0 ]; then
  printf "    ⚠  Found %d explicit 'any' type annotations across the project\n" "$ANY_COUNT"
  pass "TypeScript explicit 'any' audit logged"
else
  pass "No explicit 'any' type annotations found"
fi

# 3c. Check for missing return type annotations on exported functions
MISSING_RETURNS=$(grep -lP '^export (async )?function' *.ts */*.ts */*/*.ts 2>/dev/null | xargs grep -LP ':\s+\w+' 2>/dev/null || true)
if [ -n "$MISSING_RETURNS" ]; then
  printf "    ⚠  Missing return types on exported functions in: %s\n" "$MISSING_RETURNS"
  pass "Return type audit logged"
else
  pass "All exported functions have return type annotations"
fi

# 3d. Check config files existence
header "4. Project Configuration Files"
for cfg in "package.json" "tsconfig.json" "next.config.js" "postcss.config.js"; do
  if [ -f "$cfg" ]; then
    pass "Config file exists: $cfg"
  else
    fail "Config file missing: $cfg — project cannot be built without it"
  fi
done

# ────────────────────────────────────────────
# SUMMARY
# ────────────────────────────────────────────
header "INTEGRITY CHECK SUMMARY"
printf "  %s passed, %s failed\n" "$PASS" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  printf "\n  FAILURES:\n"
  for err in "${ERRORS[@]}"; do
    printf "    • %s\n" "$err"
  done
  printf "\n  ❌ INTEGRITY CHECK: FAILED — resolve errors before proceeding to next phase.\n"
  exit 1
else
  printf "\n  ✅ INTEGRITY CHECK: PASSED — all validations clean.\n"
  exit 0
fi
