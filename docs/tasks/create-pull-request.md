# GitHub PR作成タスク

## 概要
`docs/templates/pull-request-template.md`に基づいてGitHub Pull Requestを作成するタスク

## 実行手順
1. **issue情報の取得** (issue番号が渡された場合):
   - `gh issue view [issue-number]` でissue情報を取得
   - issueタイトル、本文、ラベルなどを解析
   - PR作成時の参考情報として活用

2. **ブランチ差分の確認**: ブランチ作成時点からの変更内容を把握する
   - `git merge-base main HEAD` でブランチの分岐点を特定
   - `git diff [分岐点]...HEAD` でブランチ作成以降のファイル変更を確認
   - `git log [分岐点]..HEAD` でブランチのコミット履歴を確認
   - 追加・修正・削除されたファイルの調査
   - 機能変更の影響範囲特定

3. **ユーザー要望の分析**: スラッシュコマンド後のPR内容を解析
   - 変更の目的・背景の理解（issue情報も参考）
   - 実装内容の具体化
   - レビューポイントの特定

4. **テンプレート読み込み**: `docs/templates/pull-request-template.md`を基に構造化

5. **PR内容の自動生成**:
   - issue情報とブランチ差分を基にPR本文を生成
   - テンプレート形式に沿って各セクションを記述

6. **GitHub CLI でPR作成** (main向け):
   ```bash
   gh pr create --base main --title "生成されたタイトル" --body "完成したPR本文"
   ```

## 成功条件
- GitHub Pull Request が正常作成される
- PR URLが返却される
- テンプレート形式が維持される
- ブランチ作成以降の差分が適切に反映される
- issue番号が渡された場合、issue情報がPRに反映される