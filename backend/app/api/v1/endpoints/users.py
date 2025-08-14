from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserInfo)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    現在のログインユーザーの情報を取得する
    """
    return current_user

@router.put("/me", response_model=schemas.UserInfo)
def update_user_me(
    user_in: schemas.UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """
    現在のログインユーザーの情報（カロリー上限）を更新する
    """
    user = crud.update_user(db, db_user=current_user, user_in=user_in)
    return user
