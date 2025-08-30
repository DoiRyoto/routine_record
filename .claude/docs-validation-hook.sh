#!/bin/bash

# Docs Validation Hook for Claude Code
# Prevents editing without reading all docs/rules documentation

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RULES_DIR="$PROJECT_ROOT/docs/rules"
STATUS_FILE="/tmp/.claude_docs_read_status_session"

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

print_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Get all rules documents dynamically
get_all_rules_docs() {
    if [ ! -d "$RULES_DIR" ]; then
        echo ""
        return 1
    fi
    find "$RULES_DIR" -name "*.md" -type f 2>/dev/null | sort
}

# Check if document was read in this session
check_doc_read() {
    local doc_path="$1"
    [ ! -f "$STATUS_FILE" ] && return 1
    grep -q "^$doc_path|" "$STATUS_FILE" && return 0 || return 1
}

# Record document as read
record_doc_read() {
    local doc_path="$1"
    echo "$doc_path|$(date +%s)" >> "$STATUS_FILE"
    chmod 600 "$STATUS_FILE" 2>/dev/null
}

# Get unread documents
get_unread_docs() {
    local all_docs unread_list
    all_docs=$(get_all_rules_docs)
    
    [ -z "$all_docs" ] && return 0
    
    unread_list=""
    while IFS= read -r doc; do
        check_doc_read "$doc" || unread_list="$unread_list$doc"$'\n'
    done <<< "$all_docs"
    
    echo "$unread_list"
    [ -n "$unread_list" ] && return 1 || return 0
}

# Main validation logic
validate_docs_read() {
    local unread_docs
    unread_docs=$(get_unread_docs)
    local unread_result=$?
    
    if [ $unread_result -eq 1 ] && [ -n "$unread_docs" ]; then
        print_error "実装ルールドキュメントが未読です"
        echo ""
        print_warning "📚 以下のドキュメントを確認してから編集を行ってください:"
        echo "$unread_docs" | while IFS= read -r doc; do
            [ -n "$doc" ] && echo "  - $doc"
        done
        echo ""
        print_warning "💡 Readツールでドキュメントを読み込んだ後、編集コマンドを再実行してください。"
        echo ""
        print_error "⚠️  実装品質を保つため、必ずルールを確認してから作業を開始してください。"
        return 1
    fi
    
    return 0
}

# Parse hook input and validate
HOOK_INPUT=$(cat)

# Check if this is a Read tool call to docs/rules
if echo "$HOOK_INPUT" | grep -q '"tool_name":\s*"Read"' && echo "$HOOK_INPUT" | grep -q '"file_path":[^,}]*docs/rules/[^,}]*\.md'; then
    # Extract file path and record as read
    DOC_PATH=$(echo "$HOOK_INPUT" | grep -o '"file_path":[^,}]*' | sed 's/"file_path"://g; s/"//g')
    if [ -n "$DOC_PATH" ]; then
        record_doc_read "$DOC_PATH"
        print_success "ドキュメント読込み記録: $(basename "$DOC_PATH")"
    fi
    exit 0
fi

# Check if this is an editing tool call
if echo "$HOOK_INPUT" | grep -q '"tool_name":\s*"\(Edit\|Write\|MultiEdit\|mcp__serena__replace_symbol_body\|mcp__serena__insert_.*_symbol\)"'; then
    validate_docs_read
    exit $?
fi

# For other tools, allow execution
exit 0