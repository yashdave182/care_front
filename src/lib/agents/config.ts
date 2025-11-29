/**
 * CareFlow Nexus - Agent Configuration
 *
 * Centralized configuration for all backend agents.
 * Update these URLs after deploying each agent to Hugging Face.
 */

export const AGENT_URLS = {
  // Pharmacy Agent - Medication management and dispensing
  PHARMACY: "https://omgy-pharma.hf.space",

  // Diagnostic Agent - Lab tests and radiology (to be deployed)
  DIAGNOSTIC: "https://your-diagnostic-agent.hf.space",

  // Surgery Agent - Surgical scheduling and OR management (to be deployed)
  SURGERY: "https://your-surgery-agent.hf.space",

  // Cleaning Agent - Facility maintenance and sanitation (to be deployed)
  CLEANING: "https://your-cleaning-agent.hf.space",

  // Workflow Orchestrator - Master coordinator (to be deployed)
  ORCHESTRATOR: "https://your-orchestrator-agent.hf.space",
} as const;

/**
 * Agent endpoints configuration
 */
export const AGENT_ENDPOINTS = {
  PHARMACY: {
    BASE: AGENT_URLS.PHARMACY,
    HEALTH: `${AGENT_URLS.PHARMACY}/health`,
    PRESCRIPTIONS: `${AGENT_URLS.PHARMACY}/api/pharmacy/prescriptions`,
    INVENTORY: `${AGENT_URLS.PHARMACY}/api/pharmacy/inventory`,
    STATS: `${AGENT_URLS.PHARMACY}/api/pharmacy/stats`,
    AI_ANALYZE: `${AGENT_URLS.PHARMACY}/api/pharmacy/ai/analyze`,
    STREAM: (id: string) => `${AGENT_URLS.PHARMACY}/api/pharmacy/stream/${id}`,
  },
  DIAGNOSTIC: {
    BASE: AGENT_URLS.DIAGNOSTIC,
    HEALTH: `${AGENT_URLS.DIAGNOSTIC}/health`,
    // Add diagnostic endpoints when agent is deployed
  },
  SURGERY: {
    BASE: AGENT_URLS.SURGERY,
    HEALTH: `${AGENT_URLS.SURGERY}/health`,
    // Add surgery endpoints when agent is deployed
  },
  CLEANING: {
    BASE: AGENT_URLS.CLEANING,
    HEALTH: `${AGENT_URLS.CLEANING}/health`,
    // Add cleaning endpoints when agent is deployed
  },
  ORCHESTRATOR: {
    BASE: AGENT_URLS.ORCHESTRATOR,
    HEALTH: `${AGENT_URLS.ORCHESTRATOR}/health`,
    // Add orchestrator endpoints when agent is deployed
  },
} as const;

/**
 * Check if an agent is configured (URL is not placeholder)
 */
export const isAgentConfigured = (agentUrl: string): boolean => {
  return !agentUrl.includes("your-") && agentUrl.includes(".hf.space");
};

/**
 * Get list of configured agents
 */
export const getConfiguredAgents = () => {
  return Object.entries(AGENT_URLS)
    .filter(([_, url]) => isAgentConfigured(url))
    .map(([name]) => name);
};
