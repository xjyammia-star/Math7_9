import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  template: string;
  data: any;
  fallback: React.ReactNode;
  svgMaxHeight: number;
};

type State =
  | { status: 'loading' }
  | { status: 'ready'; svg: string }
  | { status: 'error' };

function isCircleTemplate(template: string): boolean {
  return template.startsWith('circle');
}

export default function PythonCircleDiagram({ template, data, fallback, svgMaxHeight }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const payload = useMemo(() => JSON.stringify({ template, ...data }), [template, data]);

  useEffect(() => {
    if (!isCircleTemplate(template)) {
      setState({ status: 'error' });
      return;
    }

    let active = true;
    setState({ status: 'loading' });

    fetch('/api/render-diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.text();
      })
      .then((svg) => {
        if (!active) return;
        if (svg.trim().startsWith('<svg')) {
          setState({ status: 'ready', svg });
        } else {
          setState({ status: 'error' });
        }
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [template, payload]);

  if (state.status !== 'ready') {
    return <>{fallback}</>;
  }

  return (
    <div className="my-6 flex justify-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
      <div
        className="max-w-full h-auto drop-shadow-2xl"
        style={{ maxHeight: svgMaxHeight }}
        dangerouslySetInnerHTML={{ __html: state.svg }}
      />
    </div>
  );
}
