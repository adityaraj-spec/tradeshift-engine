import os
import asyncio
import aiohttp
import google.generativeai as genai
from dotenv import load_dotenv

# Ensure environment variables are loaded from .env
load_dotenv()

# API Keys
HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY", None)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", None)

# Models
MODEL_ID = "HuggingFaceH4/zephyr-7b-beta" 

# Configure Gemini for high-quality fallback
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-pro')
else:
    gemini_model = None

async def _call_hf_inference(messages: list) -> str:
    """
    Calls the HuggingFace Router via OpenAI-compatible Chat Completion API.
    This is the recommended and most reliable way to call models on the router.
    """
    url = "https://router.huggingface.co/v1/chat/completions"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "max_tokens": 300,
        "temperature": 0.3
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                error_text = await resp.text()
                raise Exception(f"HF Router Error {resp.status}: {error_text}")

def is_market_relevant(title: str, description: str, symbol: str) -> bool:
    """
    Checks if a news article is likely relevant to the stock market or the specific symbol.
    Filters out general news, sports, local politics, or entertainment.
    """
    if not title:
        return False
        
    # Keywords indicating financial/market relevance
    market_keywords = [
        "stock", "market", "trade", "profit", "loss", "revenue", "earnings", 
        "dividend", "ipo", "shares", "invest", "finance", "economy", "bank", 
        "fed", "interest rate", "inflation", "gdp", "quarterly", "acquisition", 
        "merger", "ceo", "guidance", "bull", "bear", "rally", "slump"
    ]
    
    # Generic news categories to exclude
    noise_keywords = [
        "sports", "football", "cricket", "bollywood", "hollywood", "recipe", 
        "entertainment", "lifestyle", "horoscope", "weather report"
    ]
    
    text = (title + " " + (description or "")).lower()
    
    base_symbol = symbol.split('-')[0].lower()
    if base_symbol in text:
        return True
        
    has_market_term = any(kw in text for kw in market_keywords)
    is_noise = any(nk in text for nk in noise_keywords)
    
    return has_market_term and not is_noise

async def analyze_news_impact(news_title: str, news_desc: str, symbol: str) -> dict:
    """
    Sends the news article to an AI engine (Gemini primary, HF fallback) to get a financial impact analysis.
    """
    print(f"🧠 FinGPT (Gemini) analyzing news for {symbol}: '{news_title}'")
    
    analysis_prompt = f"""
    Analyze the potential impact of this news on the asset '{symbol}'.
    
    Headline: {news_title}
    Details: {news_desc}
    
    Provide:
    1. A sharp, 2-sentence market analysis of WHY this matters for the price.
    2. Sentiment: [POSITIVE, NEGATIVE, or NEUTRAL].
    3. Predicted Impact: Follow the format 'Predicted Impact: [X]% in [Time]' (e.g. +0.8% in 15m).
    """

    try:
        if gemini_model:
            # Use run_in_executor to call the synchronous Gemini SDK without blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: gemini_model.generate_content(analysis_prompt))
            output = response.text.strip()
        else:
            # Fallback to HF if Gemini is not configured
            messages = [
                {"role": "system", "content": "You are a professional quantitative financial analyst (FinGPT)."},
                {"role": "user", "content": analysis_prompt}
            ]
            output = await _call_hf_inference(messages)
        
        # Parse output for Sentiment
        sentiment = "NEUTRAL"
        if "POSITIVE" in output.upper():
            sentiment = "POSITIVE"
        elif "NEGATIVE" in output.upper():
            sentiment = "NEGATIVE"
            
        # Parse output for Predicted Impact
        predicted_impact = "Unknown"
        lines = output.split('\n')
        for line in lines:
            if "Predicted Impact:" in line:
                predicted_impact = line.split("Predicted Impact:")[1].strip()
                break
        
        if predicted_impact == "Unknown":
            import re
            match = re.search(r'([+-]?\d+\.?\d*%\s+in\s+\d+[mh])', output)
            if match:
                predicted_impact = match.group(1)

        # Clean analysis text
        analysis_text = output
        for st in ["POSITIVE", "NEGATIVE", "NEUTRAL"]:
            analysis_text = analysis_text.replace(st, "")
        if "Predicted Impact:" in analysis_text:
            analysis_text = analysis_text.split("Predicted Impact:")[0]
        
        analysis_text = analysis_text.replace("[", "").replace("]", "").replace("Sentiment:", "").strip()
        
        return {
            "analysis": analysis_text,
            "sentiment": sentiment,
            "predicted_impact": predicted_impact
        }
        
    except Exception as e:
        print(f"❌ FinGPT Analysis Error: {e}")
        return {
            "analysis": f"FinGPT Error: {str(e)}. Please check your API configuration.",
            "sentiment": "NEUTRAL",
            "predicted_impact": "N/A"
        }

async def ask_news_question(news_title: str, news_desc: str, question: str, symbol: str) -> str:
    """
    Provides a deep, high-quality answer to a user's question about a specific news item.
    """
    print(f"💬 Asking FinGPT (Gemini): '{question}' for news '{news_title}'")
    
    qa_prompt = f"""
    A trader saw this news for '{symbol}':
    Headline: {news_title}
    Details: {news_desc}
    
    Question: {question}
    
    Explain the implications deeply but concisely (Max 4 sentences). Focus on order flow, market psychology, and potential pivot points.
    """

    try:
        if gemini_model:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: gemini_model.generate_content(qa_prompt))
            return response.text.strip()
        else:
            messages = [
                {"role": "system", "content": "You are an expert financial consultant."},
                {"role": "user", "content": qa_prompt}
            ]
            return await _call_hf_inference(messages)
    except Exception as e:
        print(f"❌ FinGPT Q&A Error: {e}")
        return f"FinGPT Error: {str(e)}. Please try again later."

async def analyze_stock_fundamentals(symbol: str, fund_data: dict) -> str:
    """
    Performs a deep institutional-grade fundamental analysis of a stock.
    Persona: Senior Hedge Fund Manager & Strategic Growth Analyst.
    """
    print(f"🧐 FinGPT performing Deep Analysis for {symbol}...")
    
    prompt = f"""
    Perform a professional-grade fundamental analysis for '{symbol}' using these metrics:
    {fund_data}
    
    Structure your analysis into these 4 professional pillars:
    1. **Earning Quality & Sustainability**: Is the growth real or accounting-driven?
    2. **Capital Allocation Efficiency**: Analyze ROCE vs ROE and Debt management.
    3. **Moat & Competitive Advantage**: Scale, brand, or cost leadership.
    4. **Investment Thesis & Risks**: Concise "Bull" vs "Bear" case.
    
    Keep it professional, high-conviction, and insightful (Max 300 words).
    """

    try:
        if gemini_model:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: gemini_model.generate_content(prompt))
            return response.text.strip()
        else:
            messages = [
                {"role": "system", "content": "You are a Senior Portfolio Manager at a Tier-1 Hedge Fund (FinGPT)."},
                {"role": "user", "content": prompt}
            ]
            return await _call_hf_inference(messages)
    except Exception as e:
        print(f"❌ Stock Analysis Error: {e}")
        return f"Error performing stock analysis: {str(e)}"

async def explain_in_layman(symbol: str, complex_info: str) -> str:
    """
    Converts professional financial analysis or jargon into simple layman analogies.
    """
    print(f"🐣 Simplifying concepts for {symbol} (Layman Mode)...")
    
    prompt = f"""
    The following is a professional analysis for '{symbol}':
    {complex_info}
    
    Task: Explain this to a 10-year old or a complete beginner. 
    Avoid ALL financial jargon (no 'EBITDA', 'ROCE', 'Liabilities'). 
    Use a relatable real-world analogy (like a lemonade stand, a sports team, or a grocery store).
    
    Focus on making the user feel confident and understood. (Max 150 words).
    """

    try:
        if gemini_model:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, lambda: gemini_model.generate_content(prompt))
            return response.text.strip()
        else:
            messages = [
                {"role": "system", "content": "You are a world-class financial educator who simplifies complex ideas."},
                {"role": "user", "content": prompt}
            ]
            return await _call_hf_inference(messages)
    except Exception as e:
        print(f"❌ Layman Explanation Error: {e}")
        return f"Error generating layman explanation: {str(e)}"
