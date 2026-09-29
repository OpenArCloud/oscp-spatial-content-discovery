import dotenv from "dotenv";
dotenv.config();

import { assertAuthEnvIfRequired } from "./assertAuthEnv";
assertAuthEnvIfRequired();

import app from "./app";

const DEFAULT_PORT = 8032;
const portRaw = process.env.PORT?.trim();
const port = portRaw ? parseInt(portRaw, 10) : DEFAULT_PORT;
if (Number.isNaN(port)) {
  console.error("PORT must be a valid number.");
  process.exit(1);
}

const server = new app()
  .Start(port)
  .then((port) => console.log(`Server running on port ${port}`))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

export default server;
