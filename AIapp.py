from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <-- import this
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

# Enable CORS (adjust allow_origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or list your allowed domains e.g. ["http://127.0.0.1:5501"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str
    modality: Optional[str] = "text"

openai_llm = OpenAI(temperature=0.7, max_tokens=150)
...


# Simple prompt template for the AI search answer
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
        # Generate AI answer using Langchain
        ai_answer = llm_chain.run(query=query)
        # Get results from Sanity
        sanity_results = query_sanity(query)
        # Get additional web search results using Google Custom Search API
        google_results = query_google(query)

        return {
            "ai_answer": ai_answer,
            "sanity_results": sanity_results,
            "google_results": google_results
        }
    else:
        raise HTTPException(status_code=400, detail="Modality not supported yet.")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
