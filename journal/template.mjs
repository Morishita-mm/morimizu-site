import { newArticleId, today } from './manuscript.mjs';
// Downloaded on demand; no private manuscript or upload state is bundled.
export function manuscriptTemplate({ id = newArticleId() } = {}) {
  const date = today();
  return `---
id: ${id}
title: 記録のタイトル
createdAt: '${date}'
updatedAt: '${date}'
kind: log
summary: この記録で考えたこと・試したことを短く書きます。
language: ja
authorship: unknown
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
