/**
 * Shared TASK list options for the project board and overview stats cards.
 * Keeping depth/limit identical means React Query shares one cache key, so
 * status/date updates on the board refresh Tasks Completed / Next Deadline
 * immediately.
 */
export const PROJECT_BOARD_TASK_OPTIONS = { depth: 1, limit: 200 } as const;
