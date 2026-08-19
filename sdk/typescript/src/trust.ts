/** OKF trust ladder. SPEC §9 / §3.2: human: > job: > agent: */

export const TRUST_ORDER = Object.freeze(["human", "job", "agent"] as const);

export type TrustTier = (typeof TRUST_ORDER)[number];

export function trustTier(mark: string | null | undefined): TrustTier | null {
  if (!mark) return null;
  const head = String(mark).split(":")[0].trim().toLowerCase();
  return (TRUST_ORDER as readonly string[]).includes(head) ? (head as TrustTier) : null;
}
