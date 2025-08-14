# 1. ベースとなるPythonイメージを選択
FROM python:3.11-slim

# 2. コンテナ内での作業ディレクトリを設定
WORKDIR /app

# 3. ホストのrequirements.txtをコンテナにコピー
COPY ./requirements.txt /app/requirements.txt

# 4. requirements.txtに記載されたライブラリをインストール
# --no-cache-dir: キャッシュを保存せず、イメージサイズを削減
# --upgrade: pip自体をアップグレード
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# 5. ホストのappディレクトリをコンテナの作業ディレクトリにコピー
COPY ./app /app/app

# 6. アプリケーションがリッスンするポートを8000に設定
EXPOSE 8000

# 7. コンテナ起動時に実行するコマンド
# uvicornを起動し、外部からのアクセスを許可(0.0.0.0)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
