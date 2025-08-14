import json
import shutil
from datetime import date, datetime
from pathlib import Path

import google.generativeai as genai
from app import crud, models, schemas
from app.core.config import settings
from app.database import get_db
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..dependencies import get_current_user

router = APIRouter()

# --- Gemini API Configuration ---
try:
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    # サーバー起動時にAPIキーがなくてもエラーにならないようにする
    print(f"Could not configure Gemini API: {e}")


def get_gemini_model():
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key is not configured on the server.")
    try:
        return genai.GenerativeModel("gemini-2.5-flash")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not initialize Gemini model: {e}")


# --- API Endpoints ---


@router.post("", response_model=schemas.Meal)
def create_meal_and_analyze(
    meal_type: models.MealType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    model: genai.GenerativeModel = Depends(get_gemini_model),
):
    """
    食事の写真をアップロードし、カロリーを分析して記録する
    """
    # 1. Save the uploaded file
    upload_dir = Path(settings.UPLOADS_DIR) / str(current_user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Sanitize filename to prevent security issues
    safe_filename = Path(file.filename).name
    file_path = upload_dir / f"{timestamp}_{safe_filename}"

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # 2. Analyze with Gemini
    try:
        image_parts = [{"mime_type": file.content_type, "data": file_path.read_bytes()}]
        prompt = """
        Analyze the food item in the image and estimate its total calories.
        Respond in JSON format with two keys: 'description' (a brief, one-sentence description of the food) and 'calories' (an integer representing the estimated total calories).
        Example: {"description": "A bowl of ramen and three gyoza dumplings.", "calories": 850}
        """
        response = model.generate_content([prompt, *image_parts])

        # GeminiのレスポンスからJSONを抽出する
        # レスポンスが ```json\n...\n``` のようなマークダウン形式で返ってくることがあるため
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(cleaned_response)
        description = result.get("description", "No description provided.")
        calories = int(result.get("calories", 0))

    except Exception as e:
        file_path.unlink(missing_ok=True)  # Clean up failed analysis file
        raise HTTPException(status_code=500, detail=f"Failed to analyze image with Gemini: {e}")

    # 3. Create Meal in DB
    meal_data = schemas.MealCreate(meal_type=meal_type, description=description, calories=calories)
    db_meal = crud.create_meal(db=db, meal=meal_data, user_id=current_user.id, image_path=str(file_path))  # Store relative path from inside the container

    return db_meal


@router.get("/today", response_model=list[schemas.Meal])
def get_today_meals(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    今日の食事記録をすべて取得する
    """
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    return crud.get_meals_by_user_and_date(db=db, user_id=current_user.id, start_date=start_of_day, end_date=end_of_day)
