import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

def extract_json_list(text):
    match = re.search(r"```json(.*?)```", text, re.DOTALL)
    if match:
        json_text = match.group(1).strip()
    else:
        json_text = text.strip()
    try:
        return json.loads(json_text)
    except:
        return [line.strip("-• ") for line in json_text.strip().splitlines() if line.strip()]

def is_valid_answer(answer: str) -> bool:
    bad_inputs = ["bilmiyorum", "boş", "asdf", "123", "yok", "hiç"]
    return answer.strip().lower() not in bad_inputs and len(answer.strip()) > 20

def extract_score(text):
    matches = re.findall(r"\b(?:puan|puanı|score|not):?\s*(\d{1,2})\b", text.lower())
    for m in matches:
        try:
            s = int(m)
            if 0 <= s <= 10:
                return s
        except:
            continue
    return next((int(w) for w in text.split() if w.isdigit() and 0 <= int(w) <= 10), None)

# Ana fonksiyon
def run_final_interview(user_goal: str):
    print("\n🎓 Final Teknik Mülakat Başlıyor!\n")
    total_score = 0
    total_questions = 0

    # --- Sözel Sorular ---
    print(" Sözel Bölüm\n------------------------")
    prompt_speaking = f"""
    "{user_goal}" hedefiyle ilgili 10 adet açık uçlu teknik mülakat sorusu üret.
    Lütfen sadece sorulardan oluşan geçerli bir JSON listesi olarak ver:
    [
      "Soru 1",
      "Soru 2",
      ...
    ]
    """
    response = model.generate_content(prompt_speaking).text.strip()
    questions = extract_json_list(response)

    for i, question in enumerate(questions[:10], 1):
        print(f"\nSoru {i}: {question}")
        user_answer = input("Cevabınız: ").strip()

        if not is_valid_answer(user_answer):
            print(" Geçerli bir cevap verilmedi. Bu soru atlandı.\n")
            continue

        eval_prompt = f"""
        Soru: {question}
        Cevap: {user_answer}

        Bu cevabı değerlendir. Doğruysa neden doğru, eksikse neler eksik?
        10 üzerinden puanla ve kısaca yorum yap.
        """
        evaluation = model.generate_content(eval_prompt).text.strip()
        print("\n Gemini'nin Yorumu:\n", evaluation)

        score = extract_score(evaluation)
        if score is not None:
            total_score += score
            total_questions += 1

    # --- Kodlama Soruları ---
    print("\n Kodlama Bölümü\n------------------------")
    prompt_coding = f"""
    "{user_goal}" hedefi doğrultusunda 10 adet orta seviyeli kodlama mülakat sorusu üret.
    Her biri yalnızca kısa açıklama olarak gelsin.
    Lütfen geçerli bir JSON listesi olarak ver:
    [
      "Kodlama Sorusu 1",
      "Kodlama Sorusu 2",
      ...
    ]
    """
    response = model.generate_content(prompt_coding).text.strip()
    coding_questions = extract_json_list(response)

    for i, question in enumerate(coding_questions[:10], 1):
        print(f"\nKodlama Sorusu {i}: {question}")
        language = input("Bu soruyu hangi dilde çözmek istersin? (Python / C# / Java): ").strip()
        code = input("Kodunuz: ").strip()

        if code.lower() in ["çık", "exit", "q"]:
            print("Kodlama bölümü sonlandırıldı.")
            break

        if len(code) < 10:
            print("⚠️ Geçerli bir kod girilmedi. Bu soru atlandı.\n")
            continue

        eval_prompt = f"""
        Soru: {question}
        Kullanıcının {language} dilindeki çözümü:
        ```{language.lower()}
        {code}
        ```

        Bu kodu değerlendir. Hataları, doğruluk düzeyi ve iyileştirme önerileriyle birlikte açıklayıp 10 üzerinden puan ver.
        """
        feedback = model.generate_content(eval_prompt).text.strip()
        print("\n Gemini'nin Değerlendirmesi:\n", feedback)

        score = extract_score(feedback)
        if score is not None:
            total_score += score
            total_questions += 1

    # --- Sonuç ---
    if total_questions > 0:
        avg_score = round(total_score / total_questions, 2)
        print(f"\n Mülakat tamamlandı! Ortalama Puanınız: {avg_score} / 10")
    else:
        print("\n Hiç geçerli cevap verilmedi. Sonuç hesaplanamadı.")
