# oscp-spatial-content-discovery
OSCP Spatial Content Discovery


## Purpose


Baseline implementation of the OSCP Spatial Content Discovery APIs. These APIs allow an OSCP client to discover nearby spatial content (ex. 2D/3D virtual assets, spatial experiences). Spatial content records are synchronized in real-time across multiple GeoZone (ex. city-level) providers in a peer-to-peer manner through the [kappa-osm](https://github.com/digidem/kappa-osm) database for decentralized OpenStreetMap. Discovery is managed via [hyperswarm](https://github.com/hyperswarm/hyperswarm).

The P2P stack is based on components from the [Hypercore protocol](https://hypercore-protocol.org/). [kappa-osm](https://github.com/digidem/kappa-osm) builds on [kappa-core](https://github.com/kappa-db/kappa-core), which combines multiple append-only logs, [hypercores](https://github.com/mafintosh/hypercore), via [multifeed](https://github.com/kappa-db/multifeed), and adds materialized views. Spatial queries rely on a Bkd tree materialized view, [unordered-materialized-bkd](https://github.com/digidem/unordered-materialized-bkd).

Authentication/authorization is based on JSON Web Tokens (JWTs) via the [OpenID Connect](https://openid.net/connect/) standard. A sample integration with [Auth0](https://auth0.com/) is provided.

## Usage


Tested on Node 12.18.3

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


## Search Logic

The query API expects a client to provide a hexagonal coverage area by using an [H3 index](https://eng.uber.com/h3/) ex. precision level 8. This avoids exposing the client's specific location.

![Search image](images/search.png?raw=true)


## Spatial Content Record (SCR)

Current version: 1.0

GeoPose will be formalized through the [OGC GeoPose Working Group](https://www.ogc.org/projects/groups/geoposeswg). Base version of a Spatial Content Record (expected to evolve):

```js
export interface GeoPose {
  north: number;
  east: number;
  vertical: number;
  qNorth: number;
  qEast: number;
  qVertical: number;
  qW: number;
}

export interface Content {
  id: string;
  type: string;
  title?: string;
  description?: string;
  keywords?: string[];
  url: URL;
  geopose: GeoPose;
  size?: number;
  bbox?: string;
}

export interface Scr {
  id: string;
  type: string;
  content: Content;
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

