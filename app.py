from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("theNVpreview.html", {"request": request})

@app.get("/search-page", response_class=HTMLResponse)
def search_page(request: Request):
    return templates.TemplateResponse("search-page.html", {"request": request})