# GitHub Issue作成タスク

## 概要
`docs/templates/issue-template.md`に基づいてGitHub Issueを作成するタスク

## 実行手順
1. **コードベース確認**: 現在のアプリ構造・実装状況を把握する
   - 既存機能の確認
   - 関連するファイル・API・DB構造の調査
   - 影響範囲の特定

2. **ユーザー要望の分析**: スラッシュコマンド後のやりたいことを解析
   - 機能の具体化
   - 実現可能性の判断
   - 実装方針の検討

3. **テンプレート読み込み**: `docs/templates/issue-template.md`を基に構造化

4. **Issue内容の自動生成**:

5. **GitHub CLI でissue作成**:
   ```bash
   gh issue create --title "生成されたタイトル" --body "完成したIssue本文"
   ```

## 成功条件
- GitHub Issue が正常作成される
- Issue URLが返却される
- テンプレート形式が維持される