export function authRequiredFromEnv(): boolean {
  return ["1", "true", "yes", "on"].includes(
    (process.env.AUTH_REQUIRED || "true").toLowerCase()
  );
}

/** Auth0 issuer URLs must end with `/` (matches JWT `iss` and JWKS path). */
export function normalizeAuth0Issuer(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

export function auth0JwksUri(issuer: string): string {
  return `${normalizeAuth0Issuer(issuer)}.well-known/jwks.json`;
}

export function assertAuthEnvIfRequired(): void {
  if (!authRequiredFromEnv()) {
    return;
  }

  const missing: string[] = [];
  for (const name of ["AUTH0_ISSUER", "AUTH0_AUDIENCE"]) {
    const value = process.env[name];
    if (value === undefined || value.trim() === "") {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error(
      `AUTH_REQUIRED is enabled but required Auth0 environment variable(s) are missing: ${missing.join(
        ", "
      )}. Set them in .env or set AUTH_REQUIRED=false for local/dev only.`
    );
    process.exit(1);
  }

  process.env.AUTH0_ISSUER = normalizeAuth0Issuer(process.env.AUTH0_ISSUER!);
}
