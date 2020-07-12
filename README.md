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

Create .env file with BASE_URL for Spatial Discovery Core ex.

```
BASE_URL="http://localhost:5000"
```

Start the Spatial Content Discovery service

```
npm run dev
```

Test the API via Swagger

```
http://localhost:3000/swagger/
```