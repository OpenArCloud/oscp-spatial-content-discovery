from typing import Optional

from fastapi import APIRouter, status
from pyle38.responses import ObjectsResponse

from app.db.db import tile38
from app.models.scr import Scr, ScrsResponse

router = APIRouter()


@router.get(
    "/search/within",
    response_model=ScrsResponse,
    response_model_exclude_none=True,
    tags=["geo-search"],
    status_code=status.HTTP_200_OK,
)
async def get_within(lat: float, lon: float, radius: float) -> ScrsResponse:
    scrs: ObjectsResponse[Scr] = (
        await tile38.within("geozone").circle(lat, lon, radius).asObjects()
    )
    return ScrsResponse(data=scrs.dict()["objects"])


@router.get(
    "/search/nearby",
    response_model=ScrsResponse,
    response_model_exclude_none=True,
    tags=["geo-search"],
    status_code=status.HTTP_200_OK,
)
async def get_nearby(
    lat: float, lon: float, radius: Optional[int] = None
) -> ScrsResponse:
    if radius:
        scrs_in_radius: ObjectsResponse[Scr] = (
            await tile38.nearby("geozone")
            .point(lat, lon, radius)
            .distance()
            .nofields()
            .asObjects()
        )

        return ScrsResponse(data=scrs_in_radius.model_dump()["objects"])

    scrs: ObjectsResponse[Scr] = (
        await tile38.nearby("geozone").point(lat, lon).distance().nofields().asObjects()
    )

    return ScrsResponse(data=scrs.dict()["objects"])
