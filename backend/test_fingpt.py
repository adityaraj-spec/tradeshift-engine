import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.news_service import fetch_news_for_date
from app.nlp_engine import analyze_news_impact

async def run_tests():
    print("=== Testing News Service ===")
    news = await fetch_news_for_date("HDFCBANK", "2026-03-06")
    print(f"Fetched {len(news)} news items.")
    for n in news:
        print(f"[{n['time_str']}] {n['title']} (Source: {n['source']})")
        print(f"Desc: {n['description'][:100]}...\n")
        
    print("\n=== Testing NLP Engine (FinGPT) ===")
    if not news:
        print("No news to test. Using mock text.")
        title = "HDFC Bank announces unprecedented Q4 profit margins"
        desc = "HDFC Bank shares surged by 4% in early trading following a surprisingly strong Q4 report beating all estimates."
    else:
        title = news[0]['title']
        desc = news[0]['description']
        
    result = await analyze_news_impact(title, desc, "HDFCBANK")
    print(f"Analysis: {result['analysis']}")
    print(f"Sentiment: {result['sentiment']}")

if __name__ == "__main__":
    asyncio.run(run_tests())
