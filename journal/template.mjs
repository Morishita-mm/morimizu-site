// Downloaded on demand; no private manuscript or upload state is bundled.
export function manuscriptTemplate() {
  const date = new Date().toISOString().slice(0, 10);
  return `---
id: journal-${date}-${crypto.randomUUID().slice(0, 8)}
title: 記録のタイトル
createdAt: '${date}'
updatedAt: '${date}'
kind: log
summary: この記録で考えたこと・試したことを短く書きます。
language: ja
tags: []
projects: []
relatedEntries: []
---
## 問い

何が気になったのかを書きます。

## 試したこと

条件や手順を書きます。

## 学んだこと

結果と、次に考えたいことを書きます。
`;
}
