# File: backend/app/routers/learn.py
# Learning Progress API Router

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime, date, timedelta
from typing import Optional, List

from app.database import get_db
from app.models import LearningProgress, UserStreak, UserBadge

router = APIRouter(prefix="/api/learn", tags=["learn"])


# ═══════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════

class CompleteLessonRequest(BaseModel):
    lesson_id: str
    track_id: str
    xp_earned: int = 15

class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[str]

class StatsResponse(BaseModel):
    total_xp: int
    level: int
    current_streak: int
    longest_streak: int
    completed_lessons: List[str]
    badges: List[dict]

class BadgeAwardRequest(BaseModel):
    badge_id: str
    badge_title: str


# ═══════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════

@router.get("/stats")
async def get_learning_stats(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Get comprehensive learning stats for a user.
    Returns XP, streak, completed lessons, and badges.
    """
    try:
        # Get all completed lessons
        result = await db.execute(
            select(LearningProgress).where(LearningProgress.user_id == user_id)
        )
        progress_records = result.scalars().all()
        completed_lessons = [p.lesson_id for p in progress_records]
        total_xp = sum(p.xp_earned for p in progress_records)

        # Get streak
        streak_result = await db.execute(
            select(UserStreak).where(UserStreak.user_id == user_id)
        )
        streak = streak_result.scalar_one_or_none()

        # Get badges
        badge_result = await db.execute(
            select(UserBadge).where(UserBadge.user_id == user_id)
        )
        badges = badge_result.scalars().all()

        # Calculate level
        level = calculate_level(total_xp)

        return {
            "total_xp": total_xp,
            "level": level,
            "current_streak": streak.current_streak if streak else 0,
            "longest_streak": streak.longest_streak if streak else 0,
            "last_active_date": streak.last_active_date.isoformat() if streak and streak.last_active_date else None,
            "completed_lessons": completed_lessons,
            "badges": [
                {
                    "badge_id": b.badge_id,
                    "badge_title": b.badge_title,
                    "earned_at": b.earned_at.isoformat() if b.earned_at else None,
                }
                for b in badges
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.post("/progress")
async def complete_lesson(request: CompleteLessonRequest, user_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Mark a lesson as completed and award XP.
    """
    try:
        # Check if already completed
        existing = await db.execute(
            select(LearningProgress).where(
                LearningProgress.user_id == user_id,
                LearningProgress.lesson_id == request.lesson_id,
            )
        )
        if existing.scalar_one_or_none():
            return {"status": "already_completed", "xp_earned": 0}

        # Create progress record
        progress = LearningProgress(
            user_id=user_id,
            lesson_id=request.lesson_id,
            track_id=request.track_id,
            xp_earned=request.xp_earned,
            completed_at=datetime.utcnow(),
        )
        db.add(progress)

        # Update streak
        await update_streak(db, user_id)

        await db.commit()

        return {"status": "completed", "xp_earned": request.xp_earned}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to complete lesson: {str(e)}")


@router.post("/streak")
async def update_user_streak(user_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Update the user's daily learning streak.
    """
    try:
        streak = await update_streak(db, user_id)
        await db.commit()
        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_active_date": streak.last_active_date.isoformat() if streak.last_active_date else None,
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update streak: {str(e)}")


@router.post("/badge")
async def award_badge(request: BadgeAwardRequest, user_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Award a badge to the user.
    """
    try:
        # Check if already awarded
        existing = await db.execute(
            select(UserBadge).where(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == request.badge_id,
            )
        )
        if existing.scalar_one_or_none():
            return {"status": "already_awarded"}

        badge = UserBadge(
            user_id=user_id,
            badge_id=request.badge_id,
            badge_title=request.badge_title,
            earned_at=datetime.utcnow(),
        )
        db.add(badge)
        await db.commit()

        return {"status": "awarded", "badge_id": request.badge_id}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to award badge: {str(e)}")


@router.get("/tracks")
async def get_tracks():
    """
    Returns the learning track structure.
    In the future, this will be driven by the Admin CMS.
    For now, the structure is managed by the frontend store.
    """
    return {
        "message": "Track data is currently managed client-side. Connect to Admin CMS for dynamic content.",
        "version": "1.0.0",
    }


# ═══════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════

async def update_streak(db: AsyncSession, user_id: int) -> "UserStreak":
    """
    Update the user's learning streak based on the current date.
    """
    result = await db.execute(
        select(UserStreak).where(UserStreak.user_id == user_id)
    )
    streak = result.scalar_one_or_none()

    today = date.today()

    if not streak:
        streak = UserStreak(
            user_id=user_id,
            current_streak=1,
            longest_streak=1,
            last_active_date=today,
        )
        db.add(streak)
        return streak

    if streak.last_active_date == today:
        return streak  # Already active today

    yesterday = today - timedelta(days=1)
    if streak.last_active_date == yesterday:
        streak.current_streak += 1
    else:
        streak.current_streak = 1  # Streak broken, reset

    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_active_date = today

    return streak


def calculate_level(xp: int) -> int:
    """Calculate level from total XP."""
    thresholds = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 3000]
    for i in range(len(thresholds) - 1, -1, -1):
        if xp >= thresholds[i]:
            return i + 1
    return 1
