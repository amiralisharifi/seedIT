// Re-export the deployment config so app code can `import { brand } from '@/config'`.
// The actual values live at <repo>/config/, which is wired up as a workspace
// package (@seed-panel/deployment-config) so its own imports resolve correctly.
export * from '@seed-panel/deployment-config';
