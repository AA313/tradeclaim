import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TUTORIAL_HIDDEN_KEY, tutorialState } from '@/lib/tutorial';

// Reads just enough to know which of the four steps is next, so the guided
// start can follow the user onto every screen inside the app.
export default function useGuidedStart() {
  const [jobs, setJobs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(
    () => sessionStorage.getItem(TUTORIAL_HIDDEN_KEY) === '1',
  );

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Job.filter({}, 'created_date', 50),
      base44.entities.Claim.filter({}, '-created_date', 200),
      base44.entities.Evidence.filter({}, '-created_date', 1),
    ])
      .then(([jobPage, claimPage, evidencePage]) => {
        if (!alive) return;
        setJobs(jobPage || []);
        setClaims(claimPage || []);
        setHasEvidence(Boolean(evidencePage && evidencePage.length));
        setLoaded(true);
      })
      .catch(() => setLoaded(false));
    return () => {
      alive = false;
    };
  }, []);

  const hide = useCallback(() => {
    sessionStorage.setItem(TUTORIAL_HIDDEN_KEY, '1');
    setHidden(true);
  }, []);

  const show = useCallback(() => {
    sessionStorage.removeItem(TUTORIAL_HIDDEN_KEY);
    setHidden(false);
  }, []);

  return { ...tutorialState({ jobs, hasEvidence, claims }), loaded, hidden, hide, show };
}