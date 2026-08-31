'use client';

import { useEffect, useId, useState } from 'react';

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
          fontFamily: 'sans-serif',
        });
        const result = await mermaid.render(diagramId, chart);

        if (active) {
          setSvg(result.svg);
          setFailed(false);
        }
      } catch {
        if (active) {
          setFailed(true);
        }
      }
    }

    void renderDiagram();
    return () => {
      active = false;
    };
  }, [chart, reactId]);

  if (failed) {
    return (
      <div className="mermaid-fallback">
        <p>図を表示できなかったため、元のMermaid記法を表示しています。</p>
        <pre>
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="mermaid-loading">図を読み込んでいます…</div>;
  }

  return (
    <figure
      aria-label="記事内の図"
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
