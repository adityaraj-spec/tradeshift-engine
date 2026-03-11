import sys
import os

# Add the current directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from app.nlp_engine import is_market_relevant

def test_filtering():
    test_cases = [
        ("HDFC Bank Q4 Profit Surges 20% on Strong Loan Growth", "HDFC Bank reported a significant increase in net profit for the fourth quarter.", "HDFCBANK", True),
        ("Local Cricket Match Ends in Draw", "The local tournament saw a thrilling finish but no winner emerged.", "HDFCBANK", False),
        ("Global Markets Rally as Inflation Cools", "Investors welcomed the latest CPI data which showed a slower-than-expected rise in prices.", "NIFTY", True),
        ("Bollywood Star Launches New App", "The actor shared insights about their latest tech venture at a press conference.", "RELIANCE", False),
        ("RELIANCE to Expand Green Energy Portfolio", "The conglomerate plans to invest billions in sustainable energy projects over the next decade.", "RELIANCE", True),
        ("New Recipe for Paneer Tikka", "Learn how to make the perfect restaurant-style paneer tikka at home.", "NIFTY", False),
    ]
    
    print("=== Testing News Categorization Logic ===")
    passed = 0
    for title, desc, symbol, expected in test_cases:
        result = is_market_relevant(title, desc, symbol)
        status = "PASSED" if result == expected else "FAILED"
        print(f"[{status}] Title: {title[:40]}... | Expected: {expected} | Got: {result}")
        if result == expected:
            passed += 1
            
    print(f"\nResult: {passed}/{len(test_cases)} tests passed.")

if __name__ == "__main__":
    test_filtering()
