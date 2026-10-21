
import numpy as np
from PIL import Image


def normalize_mri(image):
    """Apply the intensity normalization used during model training."""
    image = np.asarray(image, dtype=np.float32)

    if image.ndim != 2:
        raise ValueError("Expected a two-dimensional grayscale MRI image.")

    if not np.isfinite(image).all():
        raise ValueError("MRI image contains NaN or infinite values.")

    nonzero = image != 0

    if not nonzero.any():
        raise ValueError("MRI image contains no nonzero pixels.")

    p1, p99 = np.percentile(image[nonzero], [1, 99])

    if p99 <= p1:
        raise ValueError("MRI image has insufficient intensity variation.")

    normalized = (np.clip(image, p1, p99) - p1) / (p99 - p1)
    normalized[~nonzero] = 0.0

    return normalized.astype(np.float32)


def resize_mri(image):
    """Resize a normalized MRI image to the model's 224x224 input size."""
    return np.asarray(
        Image.fromarray(image).resize(
            (224, 224),
            resample=Image.Resampling.BILINEAR,
        ),
        dtype=np.float32,
    )


def preprocess_mri_array(image):
    """Preprocess a raw, two-dimensional MRI array."""
    return resize_mri(normalize_mri(image))


def preprocess_uploaded_image(image):
    """Preprocess an ordinary image already converted to grayscale."""
    grayscale = image.convert("L")
    image_array = np.asarray(grayscale, dtype=np.float32)

    return preprocess_mri_array(image_array)


def preprocess_mat_image(image):
    """Preprocess the raw MRI image extracted from a MATLAB file."""
    return preprocess_mri_array(image)
