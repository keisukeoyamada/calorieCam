# CalorieCam アプリケーション

このプロジェクトは、食事の写真をアップロードしてカロリーを推定・記録するダイエットサポートアプリケーションです。

## 🚀 アプリケーションの実行方法

### 1. 環境変数の設定

`docker-compose.yml`と同じディレクトリ（プロジェクトのルートディレクトリ）に、以下の環境変数を設定してください。

-   `GEMINI_API_KEY`: Google Gemini APIのキー。
-   `SECRET_KEY`: JWT認証に使用する強力な秘密鍵（ランダムな文字列）。

`.env`ファイルを作成し、以下のように記述するのが一般的です。

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
SECRET_KEY=YOUR_SUPER_SECRET_JWT_KEY_HERE
```

`YOUR_GEMINI_API_KEY_HERE`と`YOUR_SUPER_SECRET_JWT_KEY_HERE`を実際の値に置き換えてください。

### 2. Dockerコンテナのビルドと起動

プロジェクトのルートディレクトリで、以下のコマンドを実行してください。
これにより、バックエンド、フロントエンド、データベースの各サービスがビルドされ、起動します。

```bash
docker-compose up --build
```

初回ビルドには時間がかかる場合があります。

### 3. アプリケーションへのアクセス

すべてのサービスが正常に起動したら、以下のURLでアプリケーションにアクセスできます。

-   **フロントエンド (Webアプリケーション)**:
    `http://localhost:3000`

-   **バックエンドAPI (Swagger UI)**:
    `http://localhost:8000/api/v1/docs`
    （APIのエンドポイントやスキーマを確認できます）

## 🛠️ 技術スタック

-   **フロントエンド**: React, TypeScript, Vite
-   **バックエンド**: FastAPI, Python
-   **データベース**: MariaDB
-   **コンテナ化**: Docker, Docker Compose
-   **AI**: Google Gemini API
