"""
Seed script — inserts ~50 sample TradeLog entries spanning 6 months
for demo/testing of the Trade History page.

Usage:  python seed_trades.py
"""
import sys, os, random
from datetime import datetime, timedelta

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import connect_to_database, get_session, Base
from app.models import TradeLog

# Ensure DB connection and create tables
engine = connect_to_database()
Base.metadata.create_all(bind=engine)

SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "ITC.NS", "TATAMOTORS.NS", "SBIN.NS", "BAJFINANCE.NS", "WIPRO.NS",
    "ZOMATO.NS", "TITAN.NS", "SUNPHARMA.NS", "MARUTI.NS", "BHARTIARTL.NS",
]

DIRECTIONS = ["BUY", "SELL"]
EXIT_REASONS = ["Stop Loss", "Take Profit", "Manual Exit", "Trailing Stop", "Target Hit", "Time-based Exit"]

PRICE_RANGES = {
    "RELIANCE.NS": (2200, 2800), "TCS.NS": (3200, 4000), "HDFCBANK.NS": (1400, 1700),
    "INFY.NS": (1300, 1700), "ICICIBANK.NS": (900, 1200), "ITC.NS": (350, 480),
    "TATAMOTORS.NS": (600, 900), "SBIN.NS": (550, 750), "BAJFINANCE.NS": (6000, 7500),
    "WIPRO.NS": (400, 550), "ZOMATO.NS": (150, 280), "TITAN.NS": (2800, 3500),
    "SUNPHARMA.NS": (1200, 1700), "MARUTI.NS": (10000, 13000), "BHARTIARTL.NS": (1100, 1500),
}


def seed():
    db = get_session()
    # Check existing count
    existing = db.query(TradeLog).count()
    if existing >= 40:
        print(f"Already {existing} trades in DB. Skipping seed.")
        db.close()
        return

    now = datetime.utcnow()
    trades = []

    for i in range(55):
        symbol = random.choice(SYMBOLS)
        direction = random.choice(DIRECTIONS)
        low, high = PRICE_RANGES[symbol]
        entry_price = round(random.uniform(low, high), 2)

        # Determine outcome: ~55% winners
        is_win = random.random() < 0.55
        if direction == "BUY":
            pct_move = random.uniform(0.5, 5.0) if is_win else random.uniform(-5.0, -0.3)
        else:
            pct_move = random.uniform(-5.0, -0.5) if is_win else random.uniform(0.3, 5.0)

        exit_price = round(entry_price * (1 + pct_move / 100), 2)
        quantity = random.choice([5, 10, 15, 20, 25, 50, 100])

        if direction == "BUY":
            pnl = round((exit_price - entry_price) * quantity, 2)
        else:
            pnl = round((entry_price - exit_price) * quantity, 2)

        # Spread trades over last 6 months
        days_ago = random.randint(1, 180)
        entry_time = now - timedelta(days=days_ago, hours=random.randint(9, 15), minutes=random.randint(0, 59))
        holding_mins = random.uniform(5, 240)
        exit_time = entry_time + timedelta(minutes=holding_mins)

        trade = TradeLog(
            symbol=symbol,
            direction=direction,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            pnl=pnl,
            entry_time=entry_time,
            exit_time=exit_time,
            session_id=f"seed-session-{i // 5}",
            holding_time=round(holding_mins, 1),
            trade_number=i + 1,
            stop_loss=round(entry_price * (0.97 if direction == "BUY" else 1.03), 2),
            take_profit=round(entry_price * (1.04 if direction == "BUY" else 0.96), 2),
            exit_reason=random.choice(EXIT_REASONS),
            time_since_last_trade=round(random.uniform(0, 60), 1),
        )
        trades.append(trade)

    db.add_all(trades)
    db.commit()
    print(f"✅ Seeded {len(trades)} sample trades into trade_logs table.")
    db.close()


if __name__ == "__main__":
    seed()
