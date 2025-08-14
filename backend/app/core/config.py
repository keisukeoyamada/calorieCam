import os

# 本番環境では.envファイルではなく、Dockerの環境変数から直接読み込むことが推奨される
# from dotenv import load_dotenv
# load_dotenv()

class Settings:
    PROJECT_NAME: str = "CalorieCam API"
    API_V1_STR: str = "/api/v1"

    # JWT Settings
    # この値は非常に重要。強力な秘密鍵を環境変数から読み込むこと。
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_super_secret_key_that_should_be_changed")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@db/app_db")

    # Uploads
    # コンテナ内のアップロードディレクトリのパス
    UPLOADS_DIR: str = "/app/uploads"

settings = Settings()
