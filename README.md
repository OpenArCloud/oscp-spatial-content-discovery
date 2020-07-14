# oscp-spatial-content-discovery
OSCP Spatial Content Discovery

See [ISSUES](https://github.com/OpenArCloud/oscp-spatial-content-discovery/issues) for development items.


## Purpose

TODO



## Usage


Node 10 (newer version may present issues with Dat framework)


Install and run an instance of the [Spatial Discovery Core](https://github.com/OpenArCloud/oscp-spatial-discovery-core). Populate some test records.

Install the Spatial Content Discovery service

```
git clone https://github.com/OpenArCloud/oscp-spatial-content-discovery
cd oscp-spatial-content-discovery
npm install
```

Create .env file with BASE_URL and an existing CHANGESET for Spatial Discovery Core ex.

```
BASE_URL="http://localhost:5000"
CHANGESET=2895089894295851115
```

Start the Spatial Content Discovery service

```
npm run dev
```

Test the API via Swagger

```
http://localhost:3000/swagger/
```

## Release 0 Status

- [x] Read specific spatial content record via REST API 
- [ ] REST API authentication
- [x] Read (bbox search) spatial content records via REST API
- [x] Delete spatial content record via REST API (single)
- [x] Create spatial content record via REST API (single)
- [x] Define base spatial content record (JSON)