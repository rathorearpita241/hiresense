import { useEffect, useState } from 'react';

import { apiGet } from '../api.js';

const LABELS = { up: 'Up', down: 'Down', unconfigured: 'Not configured' };

function Dependency({ name, info }) {
  return (
    <li>
      <span>{name}</span>
      <span className={`pill pill-${info.status}`}>{LABELS[info.status] ?? info.status}</span>
      {info.detail ? <span className="muted"> ({info.detail})</span> : null}
    </li>
  );
}

export default function Overview() {
  const [state, setState] = useState({ phase: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    apiGet('/api/health', { signal: controller.signal })
      .then((data) => setState({ phase: 'ready', data }))
      .catch((err) => {
        if (err?.name !== 'AbortError') setState({ phase: 'error', message: err.message });
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="card">
        <h1>HireSense</h1>
        <p>
          Explainable job-market analytics and job matching. No dataset has been loaded yet, so
          this dashboard shows system status only. Market figures will appear here once the data
          pipeline is built.
        </p>
      </section>

      <section className="card" aria-live="polite">
        <h2>System status</h2>
        {state.phase === 'loading' && <p className="muted">Checking services…</p>}
        {state.phase === 'error' && (
          <p role="alert" className="error">
            {state.message}
          </p>
        )}
        {state.phase === 'ready' && (
          <>
            <p>
              API: <span className={`pill pill-${state.data.status}`}>{state.data.status}</span>{' '}
              <span className="muted">v{state.data.version}</span>
            </p>
            <ul className="deps">
              <Dependency name="MongoDB" info={state.data.dependencies.database} />
              <Dependency name="ML service" info={state.data.dependencies.mlService} />
            </ul>
          </>
        )}
      </section>
    </>
  );
}
