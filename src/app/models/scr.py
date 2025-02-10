from typing import List, Optional, Dict
from enum import Enum

from pydantic import BaseModel, Field
from pyle38.responses import Object

from typing_extensions import Annotated

Coordinates = Annotated[List[float], Field(min_length=2, max_length=2)]

LinearRing = Annotated[List[Coordinates], Field(min_length=3)]
PolygonCoordinates = Annotated[List[LinearRing], Field(min_length=1)]

class Geometry(BaseModel):
    type: str = "Point"
    coordinates: Coordinates

class MetaTypeEnum(str, Enum):
    model3D = 'model3D'
    # add more content types

class Position(BaseModel):
    lat: float
    lon: float
    h: float

class Quaternion(BaseModel):
    x: float
    y: float
    z: float
    w: float

class GeoPose(BaseModel):
    position: Position
    quaternion: Quaternion

class Content(BaseModel):
    geopose: GeoPose
    metatype: MetaTypeEnum
    contenttype: str
    description: Optional[str] = None
    url: str
    tags: Optional[Dict[str, str]] = None

class Properties(BaseModel):
    id: str
    content: List[Content]

class Scr(BaseModel):
    type: str = "Feature"
    geometry: Geometry
    properties: Properties

class ScrRequestBody(BaseModel):
    data: Scr

class ScrResponse(BaseModel):
    data: Scr

class ScrsResponse(BaseModel):
    data: List[Object[Scr]]
