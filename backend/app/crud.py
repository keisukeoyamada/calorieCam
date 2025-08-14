from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas
from .core.security import get_password_hash
from pathlib import Path

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

def get_all_meals_by_user(db: Session, user_id: int):
    return db.query(models.Meal).filter(models.Meal.user_id == user_id).order_by(models.Meal.created_at.desc()).all()

def delete_meal(db: Session, meal_id: int, user_id: int) -> models.Meal | None:
    """
    Deletes a meal from the database and its associated image file.
    Ensures that a user can only delete their own meals.
    """
    # First, get the meal to ensure it exists and belongs to the user
    db_meal = db.query(models.Meal).filter(
        models.Meal.id == meal_id,
        models.Meal.user_id == user_id
    ).first()

    if not db_meal:
        return None

    # Get the image path before deleting the DB record
    image_path_str = db_meal.image_path
    
    # Delete the meal record from the database
    db.delete(db_meal)
    db.commit()

    # Delete the associated image file
    if image_path_str:
        try:
            # The image_path is stored as an absolute path within the container
            file_path = Path(image_path_str)
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            # Log the error, but don't block the operation.
            # The DB record is already deleted.
            print(f"Error deleting file {image_path_str}: {e}")

    return db_meal