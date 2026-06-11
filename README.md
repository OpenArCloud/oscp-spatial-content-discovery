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
KAPPA_CORE_DIR="data"
AUTH0_ISSUER=https://scd-oscp.us.auth0.com/
AUTH0_AUDIENCE=https://scd.oscp.cloudpose.io
GEOZONE="geo3"
TOPICS="transit,history,entertainment"
PORT=3000
```

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
http://localhost:3000/swagger/
```

![Swagger image](images/swagger.png?raw=true)

## Running the project via Docker

Simply run the following command: `docker compose up -d`. This will build the image based on the present `Dockerfile` and set up the appropriate volumes for the project.
If you have changed something in the source code and need to rebuild the image before running the service run the following command: `docker compose up --build --force-recreate --no-deps -d` this will rebuild the image and launch the service again. You might need to first stop the containers first with `docker compose down`. Note: Compose automatically reads a `.env` file in the same folder as `docker-compose.yaml` for variable substitution like `${PORT}`.

### Environment Configuration

The project uses a `.env` file to configure both runtime and Docker build settings. Create or update `.env` in the project root with the following variables:

```
# Data storage directory (relative path, will be mounted into container)
KAPPA_CORE_DIR=data

# Authentication
AUTH0_ISSUER=https://<your_tenant>.auth0.com/
AUTH0_AUDIENCE=https://<your_domain>:<your_port>

# GeoZone identifier used for topic namespacing
GEOZONE="geo3"

# Comma-separated content topics handled by this node
TOPICS="transit,history,entertainment"

# Service port (used in container and exported to host)
PORT=8032
```

**Variable Reference:**
- `KAPPA_CORE_DIR`: Local directory for persistent kappa-core database files. This folder is mounted as a bind volume into the container at `/app/${KAPPA_CORE_DIR}`.
- `AUTH0_ISSUER`: Auth0 OAuth provider issuer URL.
- `AUTH0_AUDIENCE`: Auth0 audience identifier (typically your service URL).
- `GEOZONE`: GeoZone namespace prepended to each swarm topic.
- `TOPICS`: Comma-separated list of content topics managed by this service instance.
- `PORT`: The port the Node.js service listens on inside the container and exported to the host.

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

GeoPose will be formalized through the [OGC GeoPose Working Group](https://www.ogc.org/projects/groups/geoposeswg). Base version of a Spatial Content Record (expected to evolve):

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
  geopose: GeoPose;
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
