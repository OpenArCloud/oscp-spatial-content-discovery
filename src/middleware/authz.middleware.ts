import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import * as dotenv from "dotenv";
import { ProxyAgent } from "proxy-agent";
import { auth0JwksUri, normalizeAuth0Issuer } from "../assertAuthEnv";

dotenv.config();

const auth0Issuer = process.env.AUTH0_ISSUER
  ? normalizeAuth0Issuer(process.env.AUTH0_ISSUER)
  : undefined;

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    requestAgent: new ProxyAgent(),
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: auth0Issuer ? auth0JwksUri(auth0Issuer) : "",
  }),

  audience: process.env.AUTH0_AUDIENCE,
  issuer: auth0Issuer,
  algorithms: ["RS256"],
});
