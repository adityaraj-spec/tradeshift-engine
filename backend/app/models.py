from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base  # Import Base from database.py

# Removed: engine, SessionLocal, Base definition (now in database.py)

class TradeLog(Base):
    """
    Model representing a record of a completed trade.
    """
    __tablename__ = "trade_logs"

    id = Column(Integer, primary_key=True, index=True)

    symbol = Column(String, index=True)
    direction = Column(String)

    entry_price = Column(Float)
    exit_price = Column(Float)
    quantity = Column(Integer)
    pnl = Column(Float)

    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, default=datetime.utcnow)

    # 🔥 NEW BEHAVIOR FIELDS (INSIDE CLASS)

    session_id = Column(String, index=True)

    holding_time = Column(Float)
    trade_number = Column(Integer)

    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)

    exit_reason = Column(String, nullable=True)

    time_since_last_trade = Column(Float, nullable=True)

class PortfolioHolding(Base):
    """
    Model representing an actively held position in the user's portfolio.
    """
    __tablename__ = "portfolio_holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True) # Linking to User if needed
    symbol = Column(String, index=True)
    quantity = Column(Integer)
    average_cost = Column(Float)
    first_purchase_date = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    country = Column(String, nullable=True)
    investment_goals = Column(String, nullable=True)  # e.g., "Growth", "Value", "Day Trading"
    risk_tolerance = Column(String, nullable=True)    # e.g., "Low", "Medium", "High"
    preferred_industries = Column(String, nullable=True) # e.g., "Technology", "Healthcare"
    created_at = Column(DateTime, default=datetime.utcnow)


class StockFundamental(Base):
    """
    Model for key stock ratios and fundamental metrics.
    """
    __tablename__ = "stock_fundamentals"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    
    # Valuation & Efficiency
    pe_ratio = Column(Float, nullable=True)
    pb_ratio = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)
    roce = Column(Float, nullable=True)
    
    # Growth & Solvency
    market_cap = Column(Float, nullable=True)
    revenue_growth_5y = Column(Float, nullable=True)
    profit_growth_5y = Column(Float, nullable=True)
    debt_to_equity = Column(Float, nullable=True)
    current_ratio = Column(Float, nullable=True)
    
    # Qualitative / Health
    ebitda_margin = Column(Float, nullable=True)
    free_cash_flow = Column(Float, nullable=True)
    promoter_holding = Column(Float, nullable=True)
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StockFinancial(Base):
    """
    Model for yearly financial snapshots (Revenue, Profit, etc.)
    Used for 5-Y CAGR visualizations.
    """
    __tablename__ = "stock_financials"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    year = Column(Integer)
    
    revenue = Column(Float, nullable=True)
    net_profit = Column(Float, nullable=True)
    operating_profit = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)
    
    last_updated = Column(DateTime, default=datetime.utcnow)
