#!/usr/bin/env node

/**
 * 危険な操作の前に通知音を鳴らすヘルパースクリプト
 * Claude Codeが確認プロンプトを出す前に実行することで、
 * ユーザーに注意を促します。
 */

function playWarningNotification() {
  try {
    const { execSync } = require('child_process');
    execSync('osascript -e "say \\"危険な操作です。確認してください\\""');
  } catch (error) {
    console.log('⚠️  危険な操作です。確認してください');
  }
}

// このスクリプトが直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  playWarningNotification();
}

export { playWarningNotification };