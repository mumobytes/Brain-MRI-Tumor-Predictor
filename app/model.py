
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torchvision.models import densenet121


CLASS_NAMES = ["meningioma", "glioma", "pituitary"]

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CHECKPOINT_PATH = (
    PROJECT_ROOT / "models" / "densenet121_mri_macro_f1_best.pt"
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_brain_tumor_model():
    """Load the trained grayscale DenseNet-121 model."""
    if not CHECKPOINT_PATH.is_file():
        raise FileNotFoundError(
            f"Model checkpoint not found: {CHECKPOINT_PATH}"
        )

    model = densenet121(weights=None)

    original_conv = model.features.conv0
    model.features.conv0 = nn.Conv2d(
        in_channels=1,
        out_channels=original_conv.out_channels,
        kernel_size=original_conv.kernel_size,
        stride=original_conv.stride,
        padding=original_conv.padding,
        bias=False,
    )

    model.classifier = nn.Linear(
        model.classifier.in_features,
        len(CLASS_NAMES),
    )

    checkpoint = torch.load(
        CHECKPOINT_PATH,
        map_location=DEVICE,
        weights_only=True,
    )

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()

    return model


def predict_brain_tumor(model, image):
    """
    Predict one preprocessed MRI image.

    Args:
        model: Loaded DenseNet-121 model.
        image: NumPy array of shape (224, 224), normalized to [0, 1].

    Returns:
        Dictionary containing the predicted class, confidence score
        and scores for all three classes.
    """
    image = np.asarray(image, dtype=np.float32)

    if image.shape != (224, 224):
        raise ValueError(
            f"Expected image shape (224, 224), got {image.shape}."
        )

    if not np.isfinite(image).all():
        raise ValueError("Image contains NaN or infinite values.")

    if image.min() < 0 or image.max() > 1:
        raise ValueError("Image values must be in the range [0, 1].")

    image_tensor = torch.from_numpy(image).unsqueeze(0).unsqueeze(0)
    image_tensor = image_tensor.to(DEVICE)

    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.softmax(logits, dim=1)[0]

    scores = probabilities.cpu().tolist()
    predicted_index = int(np.argmax(scores))

    return {
        "predicted_class": CLASS_NAMES[predicted_index],
        "confidence": float(scores[predicted_index]),
        "class_probabilities": {
            name: float(score)
            for name, score in zip(CLASS_NAMES, scores)
        },
    }
