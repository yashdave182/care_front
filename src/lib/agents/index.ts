/**
 * CareFlow Nexus - Agents Barrel
 *
 * Exposes the typed agent client and all shared agent types from a single import.
 *
 * Usage:
 *  import agentClient, { AGENT_URLS, type PatientRecord } from "@/lib/agents";
 */

export * from "./types";
export * from "./config";
import { agentClient, createAgentClient, isApiError } from "./client";
export { agentClient, createAgentClient, isApiError };

// Default export: singleton client configured from config.ts (no env variables needed)
export default agentClient;
