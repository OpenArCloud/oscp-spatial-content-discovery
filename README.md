# oscp-spatial-content-discovery
OSCP Spatial Content Discovery

See [ISSUES](https://github.com/OpenArCloud/oscp-spatial-content-discovery/issues) for development items.


## Purpose

TODO



## Usage


Node 10 (newer version may present issues with Dat framework)

Create .env file with KAPPA_CORE_FILE and an existing CHANGESET ex.

```
KAPPA_CORE_FILE="geo3_sds1"
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