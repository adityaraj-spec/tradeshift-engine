from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User
from .database import get_db
from .schemas import UserCreate, UserLogin, Token, User as UserSchema, PinVerifyRequest, PinIdentityRequest, PinResetRequest
import bcrypt
from datetime import datetime, timedelta
import jwt
import os
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- AUTH LOGIC ---

def verify_password(plain_password, hashed_password):
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_password_hash(password):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

from typing import Optional

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=UserSchema)
async def register(
    user: UserCreate, 
    response: Response, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # 1. Check if user exists
    result = await db.execute(select(User).filter(User.email == user.email))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Create User
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email, 
        hashed_password=hashed_password, 
        full_name=user.full_name,
        dob=user.dob,
        experience_level=user.experience_level,
        investment_goals=user.investment_goals,
        preferred_instruments=user.preferred_instruments,
        risk_tolerance=user.risk_tolerance,
        occupation=user.occupation,
        city=user.city,
        security_pin=user.security_pin
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 3. Auto-Login (Set Cookies)
    access_token = create_access_token(data={"sub": new_user.email})
    refresh_token = create_refresh_token(data={"sub": new_user.email})
    
    # Store refresh token in DB
    new_user.refresh_token = refresh_token
    await db.commit()

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    # 4. Trigger Inngest Workflow
    import inngest
    from app.inngest.client import inngest_client
    
    try:
        await inngest_client.send(
            inngest.Event(
                name="app/user.created",
                data={
                    "email": new_user.email,
                    "firstName": new_user.full_name.split()[0] if new_user.full_name else "Trader",
                    "fullname": new_user.full_name,
                    "dob": new_user.dob,
                    "experience_level": new_user.experience_level,
                    "investment_goals": new_user.investment_goals,
                    "preferred_instruments": new_user.preferred_instruments,
                    "risk_tolerance": new_user.risk_tolerance,
                    "occupation": new_user.occupation,
                    "city": new_user.city
                }
            )
        )
        print(f"✅ Inngest event sent for {new_user.email}")
    except Exception as e:
        print(f"❌ Failed to send Inngest event: {e}")

    return new_user

@router.post("/login", response_model=UserSchema) # Return User schema, not just Token
async def login(
    user: UserLogin, 
    response: Response, 
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.email == user.email))
    db_user = result.scalars().first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    
    # Store refresh token in DB
    db_user.refresh_token = refresh_token
    await db.commit()
    
    # Set HttpOnly Cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    # Trigger New Login Alert here
    from app.services.email_service import send_login_alert_email
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    ip_address = request.client.host if request.client else "Unknown"
    background_tasks.add_task(
        send_login_alert_email,
        email=db_user.email,
        name=db_user.full_name,
        login_time=current_time,
        ip_address=ip_address
    )

    # Return User Profile for LocalStorage (Hybrid Approach)
    return db_user

@router.post("/logout")
async def logout(response: Response, db: AsyncSession = Depends(get_db)):
    # Optional: If you had current_user dependency here, you'd clear their specific token
    # For now, we clear the cookies and rely on the next login to overwrite the DB token
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.post("/refresh")
async def refresh(
    response: Response, 
    db: AsyncSession = Depends(get_db), 
    refresh_token: Optional[str] = None
):
    # If refresh_token is not in body, it might be in cookies
    # Note: refresh_token: Optional[str] = Cookie(None) is better but let's be flexible
    return await handle_refresh(response, db, refresh_token)

async def handle_refresh(response: Response, db: AsyncSession, token: Optional[str]):
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
             raise HTTPException(status_code=401, detail="Invalid token type")
        email: str = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    
    if not user or user.refresh_token != token:
        raise HTTPException(status_code=401, detail="Refresh token used or invalid")
    
    # Issue new access token
    new_access_token = create_access_token(data={"sub": user.email})
    
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {"message": "Token refreshed"}

@router.post("/verify-pin")
async def verify_pin(
    request: PinVerifyRequest, 
    http_request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.email == request.email))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.security_pin != request.pin:
        raise HTTPException(status_code=400, detail="Please enter correct security pin")
        
    from app.services.email_service import send_pin_verified_email
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Send Login Successful / PIN Verified confirmation
    background_tasks.add_task(
        send_pin_verified_email,
        email=db_user.email,
        name=db_user.full_name,
        verified_at=current_time
    )
        
    return {"message": "PIN verified successfully"}

@router.post("/verify-identity")
async def verify_identity(request: PinIdentityRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == request.email))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.dob != request.dob:
        raise HTTPException(status_code=400, detail="Invalid Date of Birth")
        
    return {"message": "Identity verified"}

@router.post("/reset-pin")
async def reset_pin(
    request: PinResetRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.email == request.email))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.dob != request.dob:
        raise HTTPException(status_code=400, detail="Invalid Date of Birth")
        
    db_user.security_pin = request.new_pin
    await db.commit()
    
    from app.services.email_service import send_pin_reset_email
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    background_tasks.add_task(
        send_pin_reset_email,
        email=db_user.email,
        name=db_user.full_name,
        reset_at=current_time
    )
    
    return {"message": "PIN reset successfully"}

# Import dependencies inside function/module to avoid circular import issues if placed at top
from .dependencies import get_current_user

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
