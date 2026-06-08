// src/components/PythonCircleDiagram.tsx
import React, { useState, useEffect } from 'react';

interface PythonCircleDiagramProps {
  template: string;
  data: any;
  fallback: React.ReactNode;
  svgMaxHeight?: number;
}

/**
 * PythonCircleDiagram attempts to render circle diagrams via a Python backend.
 * Falls back to the provided SVG fallback if the backend is unavailable.
 */
const PythonCircleDiagram: React.FC<PythonCircleDiagramProps> = ({
  template,
  data,
  fallback,
  svgMaxHeight = 360,
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Reset state when data changes
    setSvgContent(null);
    setFailed(false);

    // Attempt to fetch from Python diagram service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch('/api/diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, data }),
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error('diagram service unavailable');
        return res.text();
      })
      .then(svg => {
        clearTimeout(timeoutId);
        setSvgContent(svg);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setFailed(true);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [template, JSON.stringify(data)]);

  // Show fallback while loading or if failed
  if (failed || svgContent === null) {
    return <>{fallback}</>;
  }

  return (
    <div
      className="my-6 flex justify-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm"
      dangerouslySetInnerHTML={{ __html: svgContent }}
      style={{ maxHeight: svgMaxHeight }}
    />
  );
};

export default PythonCircleDiagram;
