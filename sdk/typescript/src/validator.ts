/** Category gates, then the registered profile validator. SPEC §9. */

import type { Pack } from "./pack.ts";

export type Validator = {
  name: string;
  run: (pack: Pack) => string[];
  profile?: string | null;
};

const registry = new Map<string, Validator>();

export function createValidator(validator: Validator): Validator {
  return Object.freeze({
    name: validator.name,
    run: validator.run,
    profile: validator.profile ?? null,
  });
}

export function registerValidator(validator: Validator): void {
  registry.set(validator.name, validator);
}

export function validators(): Validator[] {
  return [...registry.values()];
}

export function validate(pack: Pack): string[] {
  const problems = [...pack.validateBase()];
  if (pack.profile) {
    for (const item of registry.values()) {
      if (item.profile === pack.profile) problems.push(...item.run(pack));
    }
  }
  return problems;
}
