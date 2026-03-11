import os
import aiohttp
import asyncio
from datetime import datetime, date, time, timedelta
from .nlp_engine import is_market_relevant

# Temporary cache to avoid spamming the API
_NEWS_CACHE = {}

NEWS_DATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "demo")

MARKET_OPEN  = time(9, 15)
MARKET_CLOSE = time(15, 30)

def _map_pubdate_to_trading_session(pub_dt: datetime, target_dt: date, pre_market_index: int) -> datetime:
    """
    Maps the actual publication time into the trading session for replay.
    Ensures that news appears at the same relative offset from Market Open (9:15 AM).
    """
    pub_time = pub_dt.time()
    market_open_dt = datetime.combine(target_dt, MARKET_OPEN)
    
    if MARKET_OPEN <= pub_time <= MARKET_CLOSE:
        # During market hours — calculate offset from real market open (assuming real market opens at 9:15)
        # However, for simplicity and user requirement of "exactly at 3 hr [from start]",
        # we map the real-world time of day to the target date's time of day.
        return datetime.combine(target_dt, pub_time)
    else:
        # Pre-market — space them out starting from 9:16 AM
        offset_minutes = 1 + (pre_market_index * 5)
        return market_open_dt + timedelta(minutes=offset_minutes)

async def fetch_news_for_date(symbol: str, target_date: str) -> list[dict]:
    """
    Fetches news, filters for market relevance, and maps timestamps to the trading session.
    """
    cache_key = f"{symbol}_{target_date}"
    if cache_key in _NEWS_CACHE:
        return _NEWS_CACHE[cache_key]

    base_url = "https://newsdata.io/api/1/news"
    query = symbol.split('-')[0]

    params = {
        "apikey": NEWS_DATA_API_KEY,
        "q": query,
        "language": "en"
    }

    target_dt = datetime.strptime(target_date, "%Y-%m-%d").date()
    news_items = []
    pre_market_counter = 0

    try:
        print(f"📰 Fetching real news from NewsData.io for {query}...")
        async with aiohttp.ClientSession() as session:
            async with session.get(base_url, params=params) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    results = data.get("results", [])

                    for article in results:
                        title = article.get("title", "")
                        description = article.get("description", "")
                        
                        # 1. Strictly filter for market relevance
                        if not is_market_relevant(title, description, symbol):
                            continue

                        pub_date_str = article.get("pubDate", "")
                        try:
                            pub_dt = datetime.strptime(pub_date_str, "%Y-%m-%d %H:%M:%S")
                        except (ValueError, TypeError):
                            pub_dt = datetime.combine(target_dt, time(8, 0))

                        pub_time = pub_dt.time()

                        # Skip post-market news for the active simulation day
                        if pub_time > MARKET_CLOSE:
                            continue

                        # 2. Map to the correct relative time within the trading session
                        is_pre_market = pub_time < MARKET_OPEN
                        injection_time = _map_pubdate_to_trading_session(
                            pub_dt, target_dt,
                            pre_market_counter if is_pre_market else 0
                        )
                        
                        if is_pre_market:
                            pre_market_counter += 1

                        news_items.append({
                            "title": title,
                            "description": description or "",
                            "source": article.get("source_id", "News"),
                            "url": article.get("link", "#"),
                            "timestamp": injection_time,
                            "time_str": injection_time.strftime("%I:%M %p"),
                            "original_pubDate": pub_date_str,
                            "analyzed": False
                        })

                        if len(news_items) >= 5: # Limit to 5 high-quality items
                            break

                    news_items.sort(key=lambda x: x["timestamp"])
                else:
                    print(f"⚠️ NewsData API error: {resp.status}")
    except Exception as e:
        print(f"❌ News Service Error: {e}")

    # High-quality Fallback (Simulation specific)
    if not news_items:
        print("⚠️ Using high-quality mock market news fallback.")
        fallback_time = datetime.combine(target_dt, MARKET_OPEN) + timedelta(hours=3) # Example: 3 hrs after start
        news_items = [
            {
                "title": f"Market Analysis: {query} shows strong technical support at current levels.",
                "description": f"Institutional buying observed in {query} as it test key resistance. Volume expansion confirms bullish bias.",
                "source": "FinGPT-Auto",
                "url": "#",
                "timestamp": fallback_time,
                "time_str": fallback_time.strftime("%I:%M %p"),
                "original_pubDate": "generated",
                "analyzed": False
            }
        ]

    _NEWS_CACHE[cache_key] = news_items
    return news_items


