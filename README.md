# oscp-spatial-content-discovery
OSCP Spatial Content Discovery

See [ISSUES](https://github.com/OpenArCloud/oscp-spatial-content-discovery/issues) for development items.


## Purpose

Baseline implementation of the OSCP Spatial Content Discovery APIs built on the [kappa-osm](https://github.com/digidem/kappa-osm) database for decentralized OpenStreetMap and synchronizing in real-time via [hyperswarm](https://github.com/hyperswarm/hyperswarm).

The P2P stack is based on components from the [Hypercore protocol](https://hypercore-protocol.org/). The [kappa-osm](https://github.com/digidem/kappa-osm) database builds on [kappa-core](https://github.com/kappa-db/kappa-core), which combines multi-writer append-only logs, [hypercores](https://github.com/mafintosh/hypercore) via [multifeed](https://github.com/kappa-db/multifeed), with materialized views. Spatial queries rely on a Bkd tree materialized view, [unordered-materialized-bkd](https://github.com/digidem/unordered-materialized-bkd).

Authentication/authorization is based on JSON Web Tokens (JWTs) via [OpenID Connect](https://openid.net/connect/). A sample integration with [Auth0](https://auth0.com/) is provided.


## Usage


Tested on Node 12.18.3

```
git clone https://github.com/OpenArCloud/oscp-spatial-content-discovery
cd oscp-spatial-content-discovery
npm install
```

Create .env file with required params ex.

```
KAPPA_CORE_DIR="data/"
AUTH0_ISSUER=https://dev-r3x4eu9z.us.auth0.com/
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


## Spatial Content Record

GeoPose will be formalized through the [OGC GeoPose Working Group](https://www.ogc.org/projects/groups/geoposeswg). Base version of a Spatial Content Record (expected to evolve):

```js
GeoPose {
  north: number;
  east: number;
  vertical: number;
  qNorth: number;
  qEast: number;
  qVertical: number;
  qW: number;
}

Scr {
  id: string;
  type: string;
  geopose: GeoPose;
  url: URL;
  tenant: string;
  timestamp: Date;
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


## Release 0 Status

- [x] Read specific spatial content record via REST API 
- [x] REST API authentication
- [x] Read (bbox search) spatial content records via REST API
- [x] Delete spatial content record via REST API (single)
- [x] Create spatial content record via REST API (single)
- [x] Define base spatial content record (JSON)
- [x] Multiple topics/themes via separate kappa core instances
- [x] Re-integrate Hyperswarm synchronization
- [x] REST API authentication multi-tenancy
- [x] Update spatial content record via REST API (single)