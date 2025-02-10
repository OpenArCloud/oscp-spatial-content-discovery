<br />
<p align="center">
  <h3 align="center">SCD-FastAPI-Tile38</h3>

  <p align="center">
    OSCP Spatial Content Discovery using FastAPI and Tile38.
    <br />
  </p>
</p>


<!-- ABOUT THE PROJECT -->

## About The Project

Update of [OSCP Spatial Service Discovery](https://github.com/OpenArCloud/oscp-spatial-content-discovery) to support prototype development in the [MSF Real/Virtual World Inte
gration Working Group](https://github.com/MetaverseStandards/Virtual-Real-Integration). Adapted from [FastAPI-Tile38](https://github.com/iwpnd/fastapi-tile38).


<!-- GETTING STARTED -->

## Getting Started

### Installation

1. Clone and install
    ```sh
    git clone https://github.com/OpenArCloud/SCD-FastAPI-Tile38.git
    cd SCD-FastAPI-Tile38
    poetry install
    ```
2. Setup environment
    ```sh
    cp .env.dist .env
    ```
3. Start your local stack
    ```python
    docker-compose up
    ```

## Usage

Once the application is started you can checkout and interact with it via on [localhost:8002/docs](http://localhost:8002/docs).

Or you can use it with [http](https://httpie.io/)/[curl](https://curl.se/):

```sh
echo '{ "data": { "type": "Feature", "geometry": {"type": "Point", "coordinates": [-1.472761207099694,50.93965177660982]}, "properties": {"id": "uuid1", "content":[{"geopose": {"position": {"lat": 50.93965177660982, "lon": -1.472761207099694, "h": 1000}, "quaternion": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 0.0}},
 "metatype": "model3D", "contenttype": "model/gltf+json", "description": "test model","url": "http://path_to_model", "tags": {"name1": "value1", "name2": "value2"}}]}}}' \
      | http post http://localhost:8002/scr x-api-key:test
HTTP/1.1 201 Created
content-length: 34
content-type: application/json
date: Mon, 03 Feb 2025 03:00:50 GMT
server: uvicorn

{
    "elapsed": "3.054657ms",
    "ok": true
}


http get http://localhost:8002/search/nearby lat==50.937876 lon==-1.471582 radius==1000   x-api-key:test
HTTP/1.1 200 OK
content-length: 490
content-type: application/json
date: Mon, 03 Feb 2025 03:02:45 GMT
server: uvicorn

{
    "data": [
        {
            "distance": 214.04799872062975,
            "id": "uuid1",
            "object": {
                "geometry": {
                    "coordinates": [
                        -1.472761207099694,
                        50.93965177660982
                    ],
                    "type": "Point"
                },
                "properties": {
                    "content": [
                        {
                            "contenttype": "model/gltf+json",
                            "description": "test model",
                            "geopose": {
                                "position": {
                                    "h": 1000.0,
                                    "lat": 50.93965177660982,
                                    "lon": -1.472761207099694
                                },
                                "quaternion": {
                                    "w": 0.0,
                                    "x": 0.0,
                                    "y": 0.0,
                                    "z": 0.0
                                }
                            },
                            "metatype": "model3D",
                            "tags": {
                                "name1": "value1",
                                "name2": "value2"
                            },
                            "url": "http://path_to_model"
                        }
                    ],
                    "id": "uuid1"
                },
                "type": "Feature"
            }
        }
    ]
}
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
