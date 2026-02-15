Place real plant images here for high-accuracy training.

Folder structure:
- rice/
- wheat/
- maize/
- cotton/
- sugarcane/
- tomato/

Accepted formats: .jpg, .jpeg, .png, .webp, .bmp

Example:
ml-service/data/plant_dataset/tomato/img_001.jpg
ml-service/data/plant_dataset/tomato/img_002.jpg

Retrain command:
cd ml-service
.venv/bin/python scripts/train_models.py
