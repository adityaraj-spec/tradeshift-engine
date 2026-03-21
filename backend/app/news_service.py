import os
import re
import html
import asyncio
import aiohttp
import xml.etree.ElementTree as ET
from datetime import datetime, date, time, timedelta
from .nlp_engine import is_market_relevant

# Temporary cache to avoid spamming APIs
_NEWS_CACHE = {}

NEWS_DATA_API_KEY = os.getenv("NEWSDATA_API_KEY", "demo")

MARKET_OPEN  = time(9, 15)
MARKET_CLOSE = time(15, 30)

# ── Professional RSS Feed Sources ─────────────────────────────────────────
# Free, no API key required — professional quality
RSS_SOURCES = [
    {
        "name": "Google News",
        "url_template": "https://news.google.com/rss/search?q={query}+stock+market&hl=en-IN&gl=IN&ceid=IN:en",
        "source_label": "Google News",
    },
    {
        "name": "MoneyControl",
        "url_template": "https://www.moneycontrol.com/rss/MCtopnews.xml",
        "source_label": "MoneyControl",
        "static": True,  # URL does not take a query parameter
    },
    {
        "name": "Economic Times Markets",
        "url_template": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "source_label": "Economic Times",
        "static": True,
    },
    {
        "name": "LiveMint Markets",
        "url_template": "https://www.livemint.com/rss/markets",
        "source_label": "LiveMint",
        "static": True,
    },
]


def _clean_html(raw_html: str) -> str:
    """Strip HTML tags and decode entities from RSS descriptions."""
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', '', raw_html)
    clean = html.unescape(clean)
    return clean.strip()[:500]  # Limit length


def _is_similar_title(title1: str, title2: str, threshold: float = 0.6) -> bool:
    """Simple word-overlap similarity check for deduplication."""
    if not title1 or not title2:
        return False
    words1 = set(title1.lower().split())
    words2 = set(title2.lower().split())
    if not words1 or not words2:
        return False
    overlap = len(words1 & words2)
    return overlap / min(len(words1), len(words2)) > threshold


def _map_pubdate_to_trading_session(pub_dt: datetime, target_dt: date, pre_market_index: int) -> datetime:
    """
    Maps the actual publication time into the trading session for replay.
    Ensures that news appears at the correct relative offset from Market Open (9:15 AM).
    """
    pub_time = pub_dt.time()
    market_open_dt = datetime.combine(target_dt, MARKET_OPEN)
    
    if MARKET_OPEN <= pub_time <= MARKET_CLOSE:
        return datetime.combine(target_dt, pub_time)
    else:
        # Pre-market — space them out starting from 9:16 AM
        offset_minutes = 1 + (pre_market_index * 5)
        return market_open_dt + timedelta(minutes=offset_minutes)


def _parse_rss_date(date_str: str) -> datetime | None:
    """Try multiple date formats commonly found in RSS feeds."""
    formats = [
        "%a, %d %b %Y %H:%M:%S %Z",      # RFC 822: Mon, 21 Mar 2026 10:30:00 GMT
        "%a, %d %b %Y %H:%M:%S %z",       # with timezone offset
        "%Y-%m-%dT%H:%M:%S%z",             # ISO 8601
        "%Y-%m-%dT%H:%M:%SZ",              # ISO 8601 UTC
        "%Y-%m-%d %H:%M:%S",               # Simple datetime
        "%d %b %Y %H:%M:%S %Z",            # Without day name
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except (ValueError, TypeError):
            continue
    return None


async def _fetch_rss_news(session: aiohttp.ClientSession, source: dict, query: str, symbol: str) -> list[dict]:
    """Fetch and parse news items from a single RSS feed source."""
    items = []
    try:
        if source.get("static"):
            url = source["url_template"]
        else:
            url = source["url_template"].format(query=query)
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml",
        }
        
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=8)) as resp:
            if resp.status != 200:
                print(f"⚠️ RSS {source['name']} returned {resp.status}")
                return []
            
            text = await resp.text()
            
        # Parse XML
        root = ET.fromstring(text)
        
        # Handle both RSS 2.0 (<channel><item>) and Atom (<entry>) formats
        rss_items = root.findall('.//item') or root.findall('.//{http://www.w3.org/2005/Atom}entry')
        
        for item_elem in rss_items[:15]:  # Process at most 15 items per source
            # RSS 2.0 format
            title = item_elem.findtext('title', '')
            description = _clean_html(item_elem.findtext('description', ''))
            link = item_elem.findtext('link', '#')
            pub_date_str = item_elem.findtext('pubDate', '') or item_elem.findtext('published', '')
            
            # Atom format fallback
            if not title:
                title_elem = item_elem.find('{http://www.w3.org/2005/Atom}title')
                title = title_elem.text if title_elem is not None else ''
            if not link:
                link_elem = item_elem.find('{http://www.w3.org/2005/Atom}link')
                link = link_elem.get('href', '#') if link_elem is not None else '#'
            
            title = _clean_html(title)
            if not title:
                continue
            
            # For non-static sources, the query is already in the RSS URL.
            # For static (general market) sources, filter for relevance to the symbol.
            if source.get("static"):
                if not is_market_relevant(title, description, symbol):
                    continue
            
            pub_dt = _parse_rss_date(pub_date_str) if pub_date_str else None
            
            items.append({
                "title": title,
                "description": description or title,
                "source": source["source_label"],
                "url": link,
                "pub_dt": pub_dt,
                "original_pubDate": pub_date_str,
            })
        
        if items:
            print(f"✅ {source['name']}: Found {len(items)} relevant items")
    except ET.ParseError as e:
        print(f"⚠️ RSS Parse Error ({source['name']}): {e}")
    except asyncio.TimeoutError:
        print(f"⚠️ RSS Timeout ({source['name']})")
    except Exception as e:
        print(f"⚠️ RSS Error ({source['name']}): {e}")
    
    return items


async def _fetch_newsdata_api(session: aiohttp.ClientSession, query: str, symbol: str) -> list[dict]:
    """Fetch news from NewsData.io API (existing source, kept as fallback)."""
    if NEWS_DATA_API_KEY == "demo":
        return []
    
    items = []
    base_url = "https://newsdata.io/api/1/news"
    params = {
        "apikey": NEWS_DATA_API_KEY,
        "q": query,
        "language": "en"
    }
    
    try:
        async with session.get(base_url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
            if resp.status == 200:
                data = await resp.json()
                results = data.get("results", [])
                
                for article in results:
                    title = article.get("title", "")
                    description = article.get("description", "")
                    
                    if not is_market_relevant(title, description, symbol):
                        continue
                    
                    pub_date_str = article.get("pubDate", "")
                    try:
                        pub_dt = datetime.strptime(pub_date_str, "%Y-%m-%d %H:%M:%S")
                    except (ValueError, TypeError):
                        pub_dt = None
                    
                    items.append({
                        "title": title,
                        "description": description or "",
                        "source": article.get("source_id", "NewsData"),
                        "url": article.get("link", "#"),
                        "pub_dt": pub_dt,
                        "original_pubDate": pub_date_str,
                    })
                    
                    if len(items) >= 5:
                        break
                
                if items:
                    print(f"✅ NewsData.io: Found {len(items)} items")
            else:
                print(f"⚠️ NewsData API error: {resp.status}")
    except Exception as e:
        print(f"⚠️ NewsData API Error: {e}")
    
    return items


def _generate_quality_fallback(query: str, target_dt: date) -> list[dict]:
    """Generate high-quality mock news as a last resort fallback."""
    market_open_dt = datetime.combine(target_dt, MARKET_OPEN)
    
    templates = [
        {
            "title": f"Market Watch: {query} shows strong institutional buying patterns ahead of quarterly results",
            "description": f"Technical analysts observe significant accumulation in {query} shares with rising delivery volumes, suggesting institutional interest ahead of upcoming quarterly earnings.",
            "time_offset": timedelta(hours=1),
            "source": "Market Analysis",
        },
        {
            "title": f"Sector Update: {query}'s industry peers rally on positive macro outlook",
            "description": f"Broader sector analysis shows {query} and its peers benefiting from favorable economic indicators and policy tailwinds. FII flows remain positive.",
            "time_offset": timedelta(hours=2, minutes=30),
            "source": "Sector Watch",
        },
        {
            "title": f"Technical Breakout: {query} tests key resistance with volume expansion",
            "description": f"Chart patterns for {query} indicate a potential breakout above critical resistance levels. Volume has expanded 40% above the 20-day average, confirming bullish momentum.",
            "time_offset": timedelta(hours=3, minutes=45),
            "source": "Technical Desk",
        },
    ]
    
    return [
        {
            "title": t["title"],
            "description": t["description"],
            "source": t["source"],
            "url": "#",
            "timestamp": market_open_dt + t["time_offset"],
            "time_str": (market_open_dt + t["time_offset"]).strftime("%I:%M %p"),
            "original_pubDate": "generated",
            "analyzed": False,
        }
        for t in templates
    ]


async def fetch_news_for_date(symbol: str, target_date: str) -> list[dict]:
    """
    Professional multi-source news pipeline:
    1. Google News RSS (free, aggregates Bloomberg/Reuters/CNBC)
    2. MoneyControl RSS (Indian market-specific)
    3. Economic Times RSS (Indian market coverage)
    4. LiveMint RSS (additional coverage)
    5. NewsData.io API (if API key is available)
    6. Quality fallback (mock articles for simulation)
    
    Includes deduplication, relevance filtering, and timestamp mapping.
    """
    cache_key = f"{symbol}_{target_date}"
    if cache_key in _NEWS_CACHE:
        return _NEWS_CACHE[cache_key]

    query = symbol.split('-')[0]
    target_dt = datetime.strptime(target_date, "%Y-%m-%d").date()
    
    all_raw_items = []
    
    print(f"📰 Fetching professional news for {query} from multiple sources...")

    async with aiohttp.ClientSession() as session:
        # 1. Fetch from all RSS sources in parallel
        rss_tasks = [
            _fetch_rss_news(session, source, query, symbol)
            for source in RSS_SOURCES
        ]
        rss_results = await asyncio.gather(*rss_tasks, return_exceptions=True)
        
        for result in rss_results:
            if isinstance(result, list):
                all_raw_items.extend(result)
        
        # 2. Fallback to NewsData.io API if RSS didn't yield enough
        if len(all_raw_items) < 3:
            newsdata_items = await _fetch_newsdata_api(session, query, symbol)
            all_raw_items.extend(newsdata_items)
    
    # 3. Deduplicate by title similarity
    deduplicated = []
    for item in all_raw_items:
        is_dup = any(_is_similar_title(item["title"], existing["title"]) for existing in deduplicated)
        if not is_dup:
            deduplicated.append(item)
    
    print(f"📊 After deduplication: {len(deduplicated)} unique items from {len(all_raw_items)} total")
    
    # 4. Map timestamps to trading session and format final items
    news_items = []
    pre_market_counter = 0
    
    for item in deduplicated[:8]:  # Cap at 8 high-quality items
        pub_dt = item.get("pub_dt")
        
        if pub_dt:
            pub_time = pub_dt.time()
            if pub_time > MARKET_CLOSE:
                continue  # Skip post-market news
            
            is_pre_market = pub_time < MARKET_OPEN
            injection_time = _map_pubdate_to_trading_session(
                pub_dt, target_dt,
                pre_market_counter if is_pre_market else 0
            )
            if is_pre_market:
                pre_market_counter += 1
        else:
            # No valid date — space them out from market open
            offset = timedelta(minutes=10 + (pre_market_counter * 15))
            injection_time = datetime.combine(target_dt, MARKET_OPEN) + offset
            pre_market_counter += 1
        
        news_items.append({
            "title": item["title"],
            "description": item.get("description", ""),
            "source": item.get("source", "News"),
            "url": item.get("url", "#"),
            "timestamp": injection_time,
            "time_str": injection_time.strftime("%I:%M %p"),
            "original_pubDate": item.get("original_pubDate", ""),
            "analyzed": False,
        })
    
    # Sort by injection timestamp (earliest first)
    news_items.sort(key=lambda x: x["timestamp"])
    
    # 5. Quality fallback if no items found
    if not news_items:
        print("⚠️ No news from any source. Using quality simulation fallback.")
        news_items = _generate_quality_fallback(query, target_dt)
    else:
        print(f"✅ News pipeline: Delivering {len(news_items)} items | Sources: {', '.join(set(i['source'] for i in news_items))}")
    
    _NEWS_CACHE[cache_key] = news_items
    return news_items
