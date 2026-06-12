from fastapi import APIRouter
from app.services.h1b import get_h1b_info, get_top_sponsors, search_sponsors

router = APIRouter(prefix="/h1b", tags=["H1B"])


@router.get("/company/{company_name}")
def company_h1b(company_name: str):
    info = get_h1b_info(company_name)
    if not info:
        return {"company": company_name, "sponsors": None, "message": "No H1B data found"}
    return {"company": company_name, **info}


@router.get("/top")
def top_sponsors(limit: int = 50):
    return {"sponsors": get_top_sponsors(limit), "count": limit}


@router.get("/search")
def search(q: str):
    return {"results": search_sponsors(q)}
