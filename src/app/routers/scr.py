from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pyle38.errors import Tile38IdNotFoundError, Tile38KeyNotFoundError
from pyle38.responses import JSONResponse, ObjectResponse, ObjectsResponse

from app.db.db import tile38
from app.models.scr import (
    Scr,
    ScrRequestBody,
    ScrResponse,
    ScrsResponse,
)

router = APIRouter()


@router.get(
    "/scr/{id}",
    tags=["scr"],
    response_model=ScrResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def get_scr(id: str) -> Optional[ScrResponse]:
    try:
        scr: ObjectResponse[Scr] = await tile38.get("geozone", id).asObject()

        response = {"data": scr.object}
        return ScrResponse(**response)

    except (Tile38KeyNotFoundError, Tile38IdNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"scr with id '{id}' not found",
        )


@router.get(
    "/scr",
    tags=["scr"],
    response_model=ScrsResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def get_all_scrs() -> ScrsResponse:
    scrs: ObjectsResponse[Scr] = await tile38.scan("geozone").asObjects()

    response = {"data": scrs.objects}

    return ScrsResponse(**response)


@router.post(
    "/scr",
    response_model=JSONResponse,
    response_model_exclude_none=True,
    tags=["scr"],
    status_code=status.HTTP_201_CREATED,
)
async def set_scr(body: ScrRequestBody) -> JSONResponse:
    scr = body.data
    response = (
        await tile38.set("geozone", scr.properties.id)
        .object(scr.model_dump())
        .exec()
    )

    return JSONResponse(**response.dict())
