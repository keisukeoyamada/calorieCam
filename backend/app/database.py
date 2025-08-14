import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# docker-compose.ymlで設定する環境変数を参照するのが望ましい
# DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://user:password@db/app_db")
# 現段階では直接記述しておく
DATABASE_URL = "mysql+pymysql://user:password@db/app_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
