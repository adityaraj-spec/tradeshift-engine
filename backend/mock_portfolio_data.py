import sys
import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Add backend dir to python path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import connect_to_database, get_session, Base
from app.models import PortfolioHolding, TradeLog

def create_mock_portfolio():
    print("Initialize database tables...")
    engine = connect_to_database()
    Base.metadata.create_all(bind=engine)
    
    db: Session = get_session()
    
    print("Clearing existing portfolio data...")
    db.query(PortfolioHolding).delete()
    
    # Pre-defined list of Indian stocks we might hold
    stocks = [
        {"symbol": "RELIANCE.NS", "avg_cost": 2100.50, "qty": 50},
        {"symbol": "TCS.NS", "avg_cost": 3100.00, "qty": 20},
        {"symbol": "HDFCBANK.NS", "avg_cost": 1550.75, "qty": 100},
        {"symbol": "INFY.NS", "avg_cost": 1400.20, "qty": 45},
        {"symbol": "ITC.NS", "avg_cost": 210.30, "qty": 500},
        {"symbol": "ZOMATO.NS", "avg_cost": 65.40, "qty": 1000},
        {"symbol": "TATAMOTORS.NS", "avg_cost": 450.00, "qty": 150},
    ]
    
    now = datetime.utcnow()
    
    print("Seeding PortfolioHoldings...")
    for idx, s in enumerate(stocks):
        holding = PortfolioHolding(
            user_id=1,
            symbol=s["symbol"],
            quantity=s["qty"],
            average_cost=s["avg_cost"],
            first_purchase_date=now - timedelta(days=random.randint(30, 700))
        )
        db.add(holding)
        
    db.commit()
    print("✅ Mock portfolio inserted successfully!")
    db.close()

if __name__ == "__main__":
    create_mock_portfolio()
