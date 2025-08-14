from fastapi import APIRouter

from .endpoints import login, users, meals

api_router = APIRouter()

# 各エンドポイントのルーターを登録
# prefixでURLのパスを、tagsでドキュメントのグループ分けを指定
api_router.include_router(login.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(meals.router, prefix="/meals", tags=["Meals"])
