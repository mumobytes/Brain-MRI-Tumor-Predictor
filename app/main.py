
from contextlib import asynccontextmanager
from io import BytesIO
from pathlib import Path

import h5py
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from fastapi.middleware.cors import CORSMiddleware

from app.model import DEVICE, load_brain_tumor_model, predict_brain_tumor
from app.preprocessing import (
    preprocess_mat_image,
    preprocess_uploaded_image,
)

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_IMAGE_FORMATS = {"PNG", "JPEG", "BMP"}
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".jfif", ".bmp"}

model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    model = load_brain_tumor_model()
    yield
    model = None


app = FastAPI(
    title="Brain Tumor MRI Classification API",
    description=(
        "Research prototype supporting ordinary image uploads "
        "and MATLAB v7.3 MRI files."
    ),
    version="1.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
	"https://brain-mri-tumor-predictor-tfv0.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Brain Tumor MRI Classification API",
        "status": "running",
        "device": str(DEVICE),
        "supported_inputs": [
            "PNG",
            "JPEG",
            "JFIF",
            "BMP",
            "MATLAB v7.3 (.mat)",
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "healthy" if model is not None else "not_ready",
        "model_loaded": model is not None,
        "device": str(DEVICE),
    }


def preprocess_image_file(contents):
    """Handle ordinary PNG, JPEG or BMP uploads."""
    try:
        with Image.open(BytesIO(contents)) as uploaded_image:
            if uploaded_image.format not in ALLOWED_IMAGE_FORMATS:
                raise HTTPException(
                    status_code=415,
                    detail="Unsupported image format. Use PNG, JPEG or BMP.",
                )

            return preprocess_uploaded_image(uploaded_image)

    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file could not be read as an image.",
        )


def preprocess_mat_file(contents):
    """Handle MATLAB v7.3 files containing cjdata/image."""
    try:
        with h5py.File(BytesIO(contents), "r") as mat_file:
            if "cjdata" not in mat_file:
                raise HTTPException(
                    status_code=422,
                    detail="MAT file is missing the required 'cjdata' group.",
                )

            cjdata = mat_file["cjdata"]

            if "image" not in cjdata:
                raise HTTPException(
                    status_code=422,
                    detail="MAT file is missing the required 'cjdata/image' field.",
                )

            image_array = np.asarray(cjdata["image"], dtype=np.float32)
            image_array = np.squeeze(image_array)

            if image_array.ndim != 2:
                raise HTTPException(
                    status_code=422,
                    detail="The MRI image in the MAT file must be two-dimensional.",
                )

            return preprocess_mat_image(image_array)

    except HTTPException:
        raise
    except (OSError, KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not read the MATLAB file. "
                "A valid MATLAB v7.3 file is required."
            ),
        )


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file must have a filename.",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_IMAGE_EXTENSIONS | {".mat"}:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported file extension. Upload PNG, JPEG, JFIF, "
                "BMP or MATLAB v7.3 (.mat)."
            ),
        )

    contents = await file.read(MAX_UPLOAD_SIZE + 1)
    await file.close()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 10 MB upload limit.",
        )

    if extension == ".mat":
        processed_image = preprocess_mat_file(contents)
        input_type = "mat"
    else:
        processed_image = preprocess_image_file(contents)
        input_type = "image"

    try:
        if model is None:
            raise HTTPException(
                status_code=503,
                detail="The model is not loaded yet.",
            )

        result = predict_brain_tumor(model, processed_image)

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return {
        "filename": file.filename,
        "input_type": input_type,
        "predicted_class": result["predicted_class"],
        "confidence": result["confidence"],
        "class_probabilities": result["class_probabilities"],
        "device": str(DEVICE),
        "disclaimer": (
            "Research use only. This model is not validated for "
            "clinical diagnosis or treatment decisions."
        ),
    }
