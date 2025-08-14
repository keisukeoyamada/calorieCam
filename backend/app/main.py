from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import os

from .api.v1.api import api_router
from .core.config import settings
from .database import Base, engine

# アプリケーション起動時に、定義したモデルに基づいてDBテーブルを作成する
# 本番環境ではAlembicなどのマイグレーションツールを使うのが一般的
Base.metadata.create_all(bind=engine)

# FastAPIアプリケーションインスタンスを作成
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS (Cross-Origin Resource Sharing) の設定
# フロントエンドからのアクセスを許可するために必要
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境ではフロントエンドのドメインに限定する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーターをアプリケーションに登録
app.include_router(api_router, prefix=settings.API_V1_STR)

# アップロードされた画像ファイルを配信するための静的ファイルルート
# /uploads というパスでアクセスされた場合に、UPLOADS_DIR ディレクトリの内容を返す
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
app.mount(f"/{os.path.basename(settings.UPLOADS_DIR)}", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")


@app.get("/", tags=["Root"])
def read_root():
    """
    ルートエンドポイント。APIの生存確認に利用できる。
    """
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
