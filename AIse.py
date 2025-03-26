from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional
import uvicorn
import requests
import os

from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Mount the static files directory so that CSS/JS/images are served
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates from the "templates" folder
templates = Jinja2Templates(directory="templates")

# Enable CORS (adjust allowed origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or list your allowed domains, e.g. ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str
    modality: Optional[str] = "text"

openai_llm = OpenAI(temperature=0.7, max_tokens=150)

# Prompt template for AI answer
prompt_template = PromptTemplate(
    input_variables=["query"],
    template="You are a search assistant. Answer the following query in a concise and helpful manner:\n\n{query}"
)
llm_chain = LLMChain(llm=openai_llm, prompt=prompt_template)

def query_sanity(query: str):
    """Query the Sanity CMS using GROQ."""
    sanity_project_id = os.getenv("SANITY_PROJECT_ID", "your_project_id")
    sanity_dataset = os.getenv("SANITY_DATASET", "production")
    groq_query = f'*[_type == "article" && title match "{query}*"]{{title, body}}'
    sanity_url = f"https://{sanity_project_id}.api.sanity.io/v2021-06-07/data/query/{sanity_dataset}?query={groq_query}"
    response = requests.get(sanity_url)
    if response.status_code == 200:
        return response.json().get("result", [])
    else:
        return []

def query_google(query: str):
    """
    Use the Google Custom Search API to get web search results.
    Ensure you have valid credentials in your environment variables:
      - GOOGLE_API_KEY: Your Google API key.
      - GOOGLE_CSE_ID: Your Custom Search Engine ID.
    """
    google_api_key = os.getenv("GOOGLE_API_KEY")
    google_cse_id = os.getenv("GOOGLE_CSE_ID")
    if not google_api_key or not google_cse_id:
        return []
    
    google_url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": google_api_key,
        "cx": google_cse_id,
        "q": query,
        "num": 10,
    }
    try:
        response = requests.get(google_url, params=params)
        if response.status_code == 200:
            results = response.json()
            items = results.get("items", [])
            formatted_results = []
            for item in items:
                formatted_results.append({
                    "title": item.get("title", "No title"),
                    "snippet": item.get("snippet", "No snippet"),
                    "link": item.get("link", "")
                })
            return formatted_results
        else:
            return []
    except Exception as e:
        return []

@app.post("/search")
async def search(query_data: SearchQuery):
    query = query_data.query
    modality = query_data.modality

    if modality == "text":
        ai_answer = llm_chain.run(query=query)
        sanity_results = query_sanity(query)
        google_results = query_google(query)
        return {
            "ai_answer": ai_answer,
            "sanity_results": sanity_results,
            "google_results": google_results
        }
    else:
        raise HTTPException(status_code=400, detail="Modality not supported yet.")

# New GET endpoint to serve the search page
@app.get("/search-page", response_class=HTMLResponse)
async def get_search_page(request: Request):
    return templates.TemplateResponse("search-page.html", {"request": request})

if __name__ == "__main__":
    # Make sure to use "AIse:app" to match the filename and app variable
    uvicorn.run("AIse:app", host="0.0.0.0", port=10000, reload=True)
