import hyperswarm from "hyperswarm";
import pump from "pump";
import crypto from "crypto";

export const swarm = (kappaCore: any, syncTopic: string): any => {
  const discoveryKey = crypto.createHash("sha256").update(syncTopic).digest();

  const swarm = hyperswarm();

  swarm.join(discoveryKey, {
    lookup: true,
    announce: true,
  });

  swarm.on("connection", function (socket, info) {
    const r = kappaCore.replicate(info.client, { live: true });
    pump(socket, r, socket);
  });

  return swarm;
};
