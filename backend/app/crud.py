from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas
from .core.security import get_password_hash

# --- User CRUD ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        password_hash=hashed_password,
        daily_calorie_limit=user.daily_calorie_limit
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: models.User, user_in: schemas.UserUpdate) -> models.User:
    if user_in.daily_calorie_limit is not None:
        db_user.daily_calorie_limit = user_in.daily_calorie_limit
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Meal CRUD ---

def create_meal(db: Session, meal: schemas.MealCreate, user_id: int, image_path: str) -> models.Meal:
    db_meal = models.Meal(
        calories=meal.calories,
        description=meal.description,
        meal_type=meal.meal_type,
        user_id=user_id,
        image_path=image_path
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

def get_meals_by_user_and_date(db: Session, user_id: int, start_date: datetime, end_date: datetime):
    return db.query(models.Meal).filter(
        models.Meal.user_id == user_id,
        models.Meal.created_at >= start_date,
        models.Meal.created_at < end_date
    ).order_by(models.Meal.created_at.desc()).all()
