import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

import Overview from './pages/Overview.jsx';
import Placeholder from './pages/Placeholder.jsx';

const pages = [
  { path: '/', label: 'Overview', element: <Overview />, end: true },
  {
    path: '/market',
    label: 'Market Explorer',
    element: (
      <Placeholder
        title="Market Explorer"
        milestone={6}
        blurb="Skill demand, role and location breakdowns, with denominators shown."
      />
    ),
  },
  {
    path: '/matcher',
    label: 'Job Matcher',
    element: (
      <Placeholder
        title="Job Matcher"
        milestone={6}
        blurb="Enter your skills and see ranked jobs with an explanation of every score."
      />
    ),
  },
  {
    path: '/salary',
    label: 'Salary Insights',
    element: (
      <Placeholder
        title="Salary Insights"
        milestone={8}
        blurb="Descriptive salary statistics first; a model only if the data supports one."
      />
    ),
  },
  {
    path: '/methodology',
    label: 'Methodology',
    element: (
      <Placeholder
        title="Methodology"
        milestone={9}
        blurb="Data source, cleaning steps, matching method, evaluation results and limitations."
      />
    ),
  },
];

export default function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">HireSense</span>
        <nav aria-label="Primary">
          {pages.map((page) => (
            <NavLink key={page.path} to={page.path} end={page.end}>
              {page.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          {pages.map((page) => (
            <Route key={page.path} path={page.path} element={page.element} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
