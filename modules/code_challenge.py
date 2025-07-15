import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")


def kodlama_pratigi_baslat(konu: str):
    print(f"\n'{konu}' konusunda kodlama pratiğine başlıyoruz...\n")
    sorular = generate_code_challenges(konu)
    if not sorular:
        print(" Kodlama soruları üretilemedi.")
        return

    for i, soru in enumerate(sorular, 1):
        print(f"\nSoru {i}: {soru['soru']} (Zorluk: {soru['zorluk']})")
        dil = input("Hangi dilde çözmek istersin? (Python / C# / Java): ")
        cevap = input("Kod çözümünü gir (çıkmak için 'çık'): ")
        if cevap.lower() in ['çık', 'exit', 'q']:
            break
        sonuc = evaluate_code_answer(soru['soru'], cevap, dil)
        print("\n Gemini'nin değerlendirmesi:\n", sonuc)


def generate_code_challenges(konu: str):
    prompt = f"""
    "{konu}" konusunda yapılabilecek 3 kısa kodlama alıştırması üret.
    Her biri sadece açıklama cümlesi ve zorluk seviyesi içersin.
    Şu formatta geçerli bir JSON listesi döndür:
    [
        {{
            "soru": "açıklama metni",
            "zorluk": "kolay" | "orta" | "zor"
        }},
        ...
    ]
    """
    yanit = model.generate_content(prompt)
    text = yanit.text.strip()
    json_text = extract_json_block(text)

    try:
        return json.loads(json_text)
    except Exception as e:
        print(" JSON ayrıştırılamadı:", e)
        print("Gelen yanıt:\n", text)
        return []


def extract_json_block(text):
    """
    Eğer yanıt içinde ```json ... ``` kod bloğu varsa onu ayıklar,
    yoksa direkt metni döner.
    """
    match = re.search(r"```json(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


def evaluate_code_answer(soru: str, cevap: str, dil: str):
    prompt = f"""
    Kullanıcının çözümü şu {dil} kodudur:
    ```{dil.lower()}
    {cevap}
    ```

    Soru: "{soru}"

    Bu kodu değerlendir. Doğruysa neden doğru olduğunu açıkla.
    Hatalıysa eksiklerini belirt, varsa iyileştirme önerisi ver ve düzeltilmiş halini göster.
    10 üzerinden bir puan ver.
    """
    yanit = model.generate_content(prompt)
    return yanit.text.strip()
