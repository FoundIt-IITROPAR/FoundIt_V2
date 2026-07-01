from transformers import AutoImageProcessor
from transformers import AutoModel

from config import *

processor = AutoImageProcessor.from_pretrained(MODEL_NAME)

model = AutoModel.from_pretrained(MODEL_NAME)

model.to(DEVICE)

model.eval()