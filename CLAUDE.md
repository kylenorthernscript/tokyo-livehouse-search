## 通知ルール
**必須**: あらゆるタスク完了時は必ず通知を送信してください。例外はありません。通知内容は実行したタスクに応じて適切に記述すること。

### 通知テンプレート（タスク別サウンド）
#### 1. ファイル編集完了
- コマンド: osascript -e 'display notification "📝 ファイル編集完了" with title "Claude Code" sound name "Tink"'

#### 2. テスト実行完了
- コマンド: osascript -e 'display notification "✅ テスト実行完了" with title "Claude Code" sound name "Submarine"'

#### 3. その他のタスク
- コマンド: osascript -e 'display notification "🚀 タスク完了" with title "Claude Code" sound name "Glass"'