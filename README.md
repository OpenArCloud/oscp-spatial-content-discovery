# oscp-spatial-content-discovery
OSCP Spatial Content Discovery


## Purpose


Baseline implementation of the OSCP Spatial Content Discovery APIs. These APIs allow an OSCP client to discover nearby spatial content (ex. 2D/3D virtual assets, spatial experiences). Spatial content records are synchronized in real-time across multiple GeoZone (ex. city-level) providers in a peer-to-peer manner through the [kappa-osm](https://github.com/digidem/kappa-osm) database for decentralized OpenStreetMap. Discovery is managed via [hyperswarm](https://github.com/hyperswarm/hyperswarm).

The P2P stack is based on components from the [Hypercore protocol](https://hypercore-protocol.org/). [kappa-osm](https://github.com/digidem/kappa-osm) builds on [kappa-core](https://github.com/kappa-db/kappa-core), which combines multiple append-only logs, [hypercores](https://github.com/mafintosh/hypercore), via [multifeed](https://github.com/kappa-db/multifeed), and adds materialized views. Spatial queries rely on a Bkd tree materialized view, [unordered-materialized-bkd](https://github.com/digidem/unordered-materialized-bkd).

Authentication/authorization is based on JSON Web Tokens (JWTs) via the [OpenID Connect](https://openid.net/connect/) standard. A sample integration with [Auth0](https://auth0.com/) is provided.

## Usage


Tested on Node 14-24

```
git clone https://github.com/OpenArCloud/oscp-spatial-content-discovery
cd oscp-spatial-content-discovery
npm install
```

Create .env file with required params ex.

```
KAPPA_CORE_DIR=data
AUTH_REQUIRED=true
AUTH0_ISSUER=https://scd-oscp.us.auth0.com/
AUTH0_AUDIENCE=https://scd.oscp.cloudpose.io
GEOZONE=geo3
TOPICS=transit,history,entertainment
PORT=8032
```

The service listens on port **8032** when `PORT` is unset. Set `PORT` to use a different port.

Start the Spatial Content Discovery service (development)

```
npm run dev
```

Start the Spatial Content Discovery service (production)

```
npm start
```

## Testing via Swagger


```
http://localhost:8032/swagger/
```

![Swagger image](images/swagger.png?raw=true)

## Running the project via Docker

Copy `.env.example` to `.env` and edit it first. The runtime image does not contain that file (the final stage only has `dist` and production dependencies). The process reads `process.env`, so the variables have to be injected when the container starts.

Write values **without** surrounding quotes, as in `.env.example`. A quoted `TOPICS="transit,history"` can keep the quote characters when Docker passes the file through, and the service would then reject the topic list.

`PORT` in `.env` is both the port Node listens on and the port to publish. `KAPPA_CORE_DIR` is a path relative to the project directory; the same relative path is mounted at `/app/<KAPPA_CORE_DIR>` inside the container. The entrypoint creates that directory and makes it writable.

`APP_PORT` is only a build argument. It becomes the image's default `PORT` (and the `EXPOSE` value). A `PORT` value passed at run time overrides it. Use the same number in all three places.

### docker compose

From the project directory (the folder that contains `docker-compose.yaml` and `.env`):

```
docker compose up --build -d
```

That build is tagged `oscp/oscp-spatial-content-discovery:latest`.

Compose reads `.env` twice:

- It substitutes `${PORT}` and `${KAPPA_CORE_DIR}` in `docker-compose.yaml` (published port, `APP_PORT` build arg, and the data volume).
- `env_file: .env` injects every variable from that file into the container, including `GEOZONE`, `TOPICS`, `AUTH_REQUIRED`, `AUTH0_ISSUER`, and `AUTH0_AUDIENCE`.

Rebuild after source or Dockerfile changes, then recreate the container so it picks up `.env` edits:

```
docker compose down
docker compose up --build --force-recreate --no-deps -d
```

`docker compose down` stops the container and does not delete the host data directory.

### docker run

Build with the same port you will publish, then pass `.env` and mount the data directory. This example matches the defaults (`PORT=8032`, `KAPPA_CORE_DIR=data`):

```
docker build --build-arg APP_PORT=8032 -t oscp/oscp-spatial-content-discovery:latest .
docker run -d --name oscp-spatial-content-discovery --env-file .env -p 8032:8032 -v "./data:/app/data" oscp/oscp-spatial-content-discovery:latest
```

`--env-file .env` is what supplies the runtime configuration. `-e NAME=value` overrides a single variable from that file. If `PORT` or `KAPPA_CORE_DIR` in `.env` is not the default, change `--build-arg`, `-p`, and `-v` to match. For `PORT=9000` and `KAPPA_CORE_DIR=data`:

```
docker build --build-arg APP_PORT=9000 -t oscp/oscp-spatial-content-discovery:latest .
docker run -d --name oscp-spatial-content-discovery --env-file .env -p 9000:9000 -v "./data:/app/data" oscp/oscp-spatial-content-discovery:latest
```

Stop and remove the container with `docker rm -f oscp-spatial-content-discovery`. The host `data` directory remains.

### Environment Configuration

The project uses a `.env` file to configure both runtime and Docker build settings. Create or update `.env` in the project root with the following variables:

```
# Data storage directory (relative path, will be mounted into container)
KAPPA_CORE_DIR=data

# Authentication (default: true; set false only for local/dev without Auth0)
AUTH_REQUIRED=true
AUTH0_ISSUER=https://<your_tenant>.auth0.com/
AUTH0_AUDIENCE=https://<your_domain>:<your_port>

# GeoZone identifier used for topic namespacing. No surrounding quotes.
GEOZONE=geo3

# Comma-separated content topics handled by this node. No surrounding quotes.
TOPICS=transit,history,entertainment

# Service port (default: 8032). Docker publishes the same port on the host.
PORT=8032
```

**Variable Reference:**
- `KAPPA_CORE_DIR`: Local directory for persistent kappa-core database files. This folder is bind-mounted into the container at `/app/${KAPPA_CORE_DIR}` and is not copied into the image. On startup, the container makes that directory readable by every user, so a host account can back it up.
- `AUTH_REQUIRED`: When `true` (the default), mutating and tenant routes require a JWT. Set to `false` only for local/dev; writes then use tenant `noauthtest`.
- `AUTH0_ISSUER`: Auth0 OAuth provider issuer URL.
- `AUTH0_AUDIENCE`: Auth0 audience identifier (typically your service URL).
- `GEOZONE`: GeoZone namespace prepended to each swarm topic.
- `TOPICS`: Comma-separated list of content topics managed by this service instance. `GET /topics` returns this list as lowercase JSON, so each client asks the server it is using.
- `PORT`: The port the Node.js service listens on. Default: `8032` when unset. Docker publishes that same port on the host.

## Search Logic

The query API expects a client to provide a hexagonal coverage area by using an [H3 index](https://eng.uber.com/h3/) ex. precision level 8. This avoids exposing the client's specific location.

![Search image](images/search.png?raw=true)


## API Versioning

Current version: 1.0

The API version can be specified by the HTTP Accept header using a vendor-specific media type as per [RFC4288](https://tools.ietf.org/html/rfc4288):

```
application/vnd.oscp+json; version=1.0;
```


## Spatial Content Record (SCR)

GeoPose is standardized in the [OGC GeoPose Working Group](https://www.ogc.org/projects/groups/geoposeswg).

The Spatial Content Record (SCR) schema also allows a [SpatialDDS](https://spatialdds.org/) `FramedPose` (`framedPose`) field. This Spatial Content Discovery service is geographic (kappa-osm nodes need lon/lat), so **`geopose` is required** for all contents. An optional `framedPose` field may be stored as-is and is not validated yet (SpatialDDS is still evolving). FramedPose-only records should be stored in a different content service.

```js
export interface Position {
  lon: number;
  lat: number;
  h: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface GeoPose {
  position: Position;
  quaternion: Quaternion;
}

export interface Ref {
  contentType: string; //ex. "model/gltf+json"
  url: URL;
}

export interface Def {
  type: string;
  value: string;
}

export interface Content {
  id: string; //tenant supplied reference ID
  type: string; //high-level OSCP type
  title: string;
  description?: string;
  keywords?: string[];
  placekey?: string;
  refs?: Ref[];
  geopose: GeoPose; // required here: OSM spatial index is geodetic
  framedPose?: any; // optional opaque SpatialDDS payload; not interpreted here
  size?: number; 
  bbox?: string;
  definitions?: Def[]; 
}

export interface Scr {
  id: string; //platform generated SCR ID
  type: string; //record type, "scr" is currently the only valid type
  content: Content;
  tenant: string; //tenant or content owner, populated by platform based on auth
  timestamp: number; //platform generated timestamp
}
```


## OSM Document

Documents (OSM elements, observations, etc) have a common format within [kappa-osm](https://github.com/digidem/kappa-osm):

```js
  {
    id: String,
    type: String,
    lat: String,
    lon: String,
    tags: Object,
    changeset: String,
    links: Array<String>,
    version: String,
    deviceId: String
  }
```

## Configuring a Reference Auth Service

To configure Auth0 as a reference auth service please see [Auth0 for SSD](auth0_scd.md).
