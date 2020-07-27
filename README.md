# oscp-spatial-content-discovery
OSCP Spatial Content Discovery

See [ISSUES](https://github.com/OpenArCloud/oscp-spatial-content-discovery/issues) for development items.


## Purpose

Baseline implementation of the OSCP Spatial Content Discovery APIs built on the [kappa-osm](https://github.com/digidem/kappa-osm) database for decentralized OpenStreetMap and synchronizing in real-time via [hyperswarm](https://github.com/hyperswarm/hyperswarm).

The P2P stack is based on components from the [Dat protocol](https://www.datprotocol.com/). The [kappa-osm](https://github.com/digidem/kappa-osm) database builds on [kappa-core](https://github.com/kappa-db/kappa-core), which combines multi-writer append-only logs, [hypercores](https://github.com/mafintosh/hypercore) via [multifeed](https://github.com/kappa-db/multifeed), with materialized views. Spatial queries rely on a Bkd tree materialized view, [unordered-materialized-bkd](https://github.com/digidem/unordered-materialized-bkd).

Initial authentication/authorization is provided by [Auth0](https://auth0.com/). Users are scoped to specific tenants and API actions.


## Usage


Node 10 (newer version may present issues with Dat framework)

Create .env file with required params ex.

```
KAPPA_CORE_DIR="data/"
AUTH0_ISSUER=https://dev-r3x4eu9z.us.auth0.com/
AUTH0_AUDIENCE=https://scd.oscp.cloudpose.io
GEOZONE="geo3"
TOPICS="transit,history,entertainment"
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


## Spatial Content Record (base version - expected to evolve)

```js
GeoPose {
  north: Number;
  east: Number;
  vertical: Number;
  qNorth: Number;
  qEast: Number;
  qVertical: Number;
  qW: Number;
}

Scr {
  id: String;
  type: String;
  geopose: GeoPose;
  url: URL;
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
- [ ] Re-integrate Hyperswarm synchronization