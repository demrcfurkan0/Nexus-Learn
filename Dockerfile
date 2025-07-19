# Temel Python imajını kullan
FROM python:3.10-slim

# Çalışma dizinini ayarla
WORKDIR /app_root

# requirements.txt dosyasını kopyala
COPY ./requirements.txt /app_root/requirements.txt

# Gerekli kütüphaneleri kur
RUN pip install --no-cache-dir --upgrade -r /app_root/requirements.txt

COPY ./seed_db.py /app_root/seed_db.py

COPY ./app /app_root/app

# Uygulama bu port üzerinden çalışacak
EXPOSE 8000

# Uygulamayı başlatacak komut
CMD ["sh", "-c", "PYTHONPATH=$PYTHONPATH:. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir app"]