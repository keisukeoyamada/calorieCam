from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .models import MealType

# --- Base Schemas ---
class MealBase(BaseModel):
    meal_type: MealType
    description: Optional[str] = None
    calories: int

class UserBase(BaseModel):
    username: str

# --- Schemas for Creating Data (Request) ---
class MealCreate(MealBase):
    pass

class UserCreate(UserBase):
    password: str
    daily_calorie_limit: Optional[int] = 2000

# --- Schemas for Reading Data (Response) ---
class Meal(MealBase):
    id: int
    user_id: int
    image_path: str
    created_at: datetime

    class Config:
        orm_mode = True

class User(UserBase):
    id: int
    daily_calorie_limit: int
    created_at: datetime
    meals: List[Meal] = []

    class Config:
        orm_mode = True

class UserInfo(UserBase):
    id: int
    daily_calorie_limit: int
    created_at: datetime

    class Config:
        orm_mode = True


# --- Schemas for Updating Data ---
class UserUpdate(BaseModel):
    daily_calorie_limit: Optional[int] = None


# --- Schemas for Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
