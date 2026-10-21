# NeuroFrame — Brain MRI Tumor Classification

NeuroFrame is a full-stack machine learning application that classifies brain MRI images into three tumor categories using a fine-tuned DenseNet-121 model.

The project combines a PyTorch image-classification pipeline with a FastAPI backend and a React frontend. Users can upload an MRI image, run inference and inspect the predicted class alongside the model's output scores.

## Classification Classes

- **Glioma**
- **Meningioma**
- **Pituitary tumor**

The model predicts one of these three classes for every accepted image. It does not include a healthy or no-tumor class.

## Technical Stack

| Component | Technology |
|---|---|
| Model | DenseNet-121 |
| Deep learning | PyTorch, TorchVision |
| Image preprocessing | NumPy, Pillow |
| MATLAB image support | h5py |
| Backend API | FastAPI, Uvicorn |
| Frontend | React, Vite |
| Deployment target | Render |

## Application Architecture

1. The user uploads an MRI image through the React interface.
2. The FastAPI backend validates and preprocesses the image.
3. The DenseNet-121 checkpoint performs inference.
4. The API returns the predicted class and model scores.
5. The frontend presents the results and relevant limitations.

## Supported Uploads

- PNG
- JPEG / JPG / JFIF
- BMP
- MATLAB v7.3 `.mat` files

Maximum upload size: 10 MB.

## Model Evaluation

The selected checkpoint achieved the following results in the project's evaluation:

| Metric | Validation | Test |
|---|---:|---:|
| Accuracy | 96.18% | 90.67% |
| Macro F1-score | 0.9534 | 0.8988 |

These results reflect the project's existing evaluation procedure. The test set was examined during model comparisons, so it should not be treated as a pristine, untouched holdout set.

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/mumobytes/Brain-MRI-Tumor-Predictor.git
cd Brain-MRI-Tumor-Predictor
```

### 2. Set up the Python backend

Create and activate a virtual environment, then install the dependencies.

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd neuroframe
npm install
```

Create a file named `.env.local` inside `neuroframe/` containing:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Deployment

The application is designed for separate frontend and backend services on Render. The frontend uses `VITE_API_URL` to identify the backend API, while the backend loads the trained model checkpoint from the `models/` directory.

Production CORS settings must allow the deployed frontend origin.

## Limitations and Responsible Use

NeuroFrame is an educational and research prototype, not a medical diagnostic system.

- The model always selects one of its three trained classes for accepted inputs.
- Output scores are model confidence scores, not calibrated clinical probabilities.
- Performance on external MRI data may differ from the reported evaluation results.
- Predictions must not be used as a substitute for assessment by a qualified medical professional.

## License

A license has not yet been specified. Check the licensing terms of the training data and other included assets before selecting a project license.
