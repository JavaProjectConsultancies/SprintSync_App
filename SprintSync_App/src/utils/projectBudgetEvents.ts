export const PROJECT_BUDGET_UPDATED_EVENT = "project-budget-updated";

export interface ProjectBudgetUpdateDetail {
  projectId?: string;
  reason?: string;
  timestamp: number;
}

/**
 * Emit a global browser event signalling that a project's budget figures changed.
 */
export const emitProjectBudgetUpdated = (
  projectId?: string,
  reason?: string,
) => {
  if (typeof window === "undefined") {
    return;
  }

  const detail: ProjectBudgetUpdateDetail = {
    projectId,
    reason,
    timestamp: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent<ProjectBudgetUpdateDetail>(PROJECT_BUDGET_UPDATED_EVENT, {
      detail,
    }),
  );
};

/**
 * Subscribe to global budget update events. Returns a cleanup function.
 */
export const subscribeToProjectBudgetUpdates = (
  handler: (detail: ProjectBudgetUpdateDetail) => void,
) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event: Event) => {
    const custom = event as CustomEvent<ProjectBudgetUpdateDetail>;
    if (custom?.detail) {
      handler(custom.detail);
    }
  };

  window.addEventListener(PROJECT_BUDGET_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(PROJECT_BUDGET_UPDATED_EVENT, listener);
  };
};

