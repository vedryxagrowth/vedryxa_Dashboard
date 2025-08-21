export const applySavedColumnState = (gridId, columnApi, generatorFn, setColumnDef, setRef) => {
    const stored = localStorage.getItem(`columnState-${gridId}`);
    if (stored && stored !== 'undefined') {
      try {
        const parsed = JSON.parse(stored);
        const orderedDefs = generatorFn(parsed.map(c => c.colId));
        setColumnDef(orderedDefs);
        if (typeof setRef === 'function') {
          setRef(orderedDefs); // optionally update ref like columnDefs4.current
        }
        setTimeout(() => {
          columnApi.applyColumnState({ state: parsed, applyOrder: true });
        }, 50);
      } catch (e) {
        console.error('Invalid column state for', gridId, e);
      }
    }
  };
  