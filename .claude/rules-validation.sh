#!/bin/bash

# Claude Code Rules Validation Hook
# This script validates implementation changes against docs/rules documentation

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RULES_DIR="$PROJECT_ROOT/docs/rules"

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to validate styling rules
validate_styling_rules() {
    local file="$1"
    
    # Check if file is a React/TypeScript component
    if [[ "$file" =~ \.(tsx?|jsx?)$ ]]; then
        # Check for invalid color patterns
        if grep -q "text-\(black\|white\|gray\|slate\|zinc\|neutral\|stone\)" "$file"; then
            print_error "Invalid color pattern found in $file"
            print_error "Use text-text-* pattern instead of direct color classes"
            grep -n "text-\(black\|white\|gray\|slate\|zinc\|neutral\|stone\)" "$file" | head -5
            return 1
        fi
        
        if grep -q "bg-\(black\|white\|gray\|slate\|zinc\|neutral\|stone\)" "$file"; then
            print_error "Invalid background color pattern found in $file"
            print_error "Use bg-bg-* pattern instead of direct color classes"
            grep -n "bg-\(black\|white\|gray\|slate\|zinc\|neutral\|stone\)" "$file" | head -5
            return 1
        fi
        
        # Check for proper tailwind pattern usage
        if ! grep -q "text-text-\|bg-bg-" "$file" && grep -q "className=" "$file"; then
            print_warning "Consider using standardized color patterns (text-text-*, bg-bg-*) in $file"
        fi
    fi
    
    return 0
}

# Function to validate frontend rules
validate_frontend_rules() {
    local file="$1"
    
    # Check for @ts-ignore usage (forbidden)
    if grep -q "@ts-ignore" "$file"; then
        print_error "@ts-ignore is forbidden in $file"
        print_error "Fix type errors properly instead of suppressing them"
        grep -n "@ts-ignore" "$file"
        return 1
    fi
    
    # Check for direct database queries in page components
    if [[ "$file" =~ page\.tsx?$ ]] && grep -q "from.*@/lib/db/queries" "$file"; then
        print_error "Direct database query import in page component: $file"
        print_error "Use API routes instead of direct database queries"
        grep -n "from.*@/lib/db/queries" "$file"
        return 1
    fi
    
    # Check for type imports from @/types instead of schema
    if grep -q "from.*@/types/" "$file"; then
        print_warning "Consider importing types from @/lib/db/schema instead of @/types/ in $file"
        grep -n "from.*@/types/" "$file" | head -3
    fi
    
    return 0
}

# Function to validate MSW rules
validate_msw_rules() {
    local file="$1"
    
    # Check for mock data usage in production code (not in mocks directory)
    if [[ "$file" != *"/mocks/"* ]] && [[ "$file" =~ \.(tsx?|jsx?)$ ]]; then
        if grep -q "mockData\|mock.*Data" "$file"; then
            print_error "Mock data usage detected in production code: $file"
            print_error "Mock data should only be used in development/testing contexts"
            grep -n "mockData\|mock.*Data" "$file" | head -3
            return 1
        fi
    fi
    
    return 0
}

# Main validation function
validate_file() {
    local file="$1"
    local errors=0
    
    if [[ ! -f "$file" ]]; then
        return 0
    fi
    
    # Run all validation functions
    validate_styling_rules "$file" || ((errors++))
    validate_frontend_rules "$file" || ((errors++))
    validate_msw_rules "$file" || ((errors++))
    
    return $errors
}

# Parse hook input JSON
if [[ -n "$1" ]]; then
    # Input provided as argument (for testing)
    HOOK_INPUT="$1"
else
    # Read from stdin (normal hook execution)
    HOOK_INPUT=$(cat)
fi

# Extract file path from hook input
FILE_PATH=$(echo "$HOOK_INPUT" | grep -o '"file_path":[^,}]*' | sed 's/"file_path"://g; s/"//g')

if [[ -z "$FILE_PATH" ]]; then
    # Try alternative extraction methods for different tool formats
    FILE_PATH=$(echo "$HOOK_INPUT" | grep -o '"path":[^,}]*' | sed 's/"path"://g; s/"//g')
fi

if [[ -z "$FILE_PATH" ]]; then
    print_success "No file path found in hook input, skipping validation"
    exit 0
fi

# Validate the file
total_errors=0
validate_file "$FILE_PATH" || ((total_errors++))

if [[ $total_errors -gt 0 ]]; then
    print_error "Rules validation failed for $FILE_PATH"
    print_error "Please fix the issues above before proceeding"
    print_error "Refer to docs/rules/ for detailed implementation guidelines"
    exit 1
else
    print_success "Rules validation passed for $FILE_PATH"
    exit 0
fi