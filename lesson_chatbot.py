import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")

def start_lesson(topic: str):
    print(f"\n Ders Başlığı: {topic}")
    print("Gemini ile bu konu hakkında sohbet edebilirsin. 'çık' yazarak dersi bitirebilirsin.\n")

    convo = model.start_chat(history=[
        {"role": "user", "parts": [f"{topic} konusunu öğretmeye başla. Basit ve açık bir şekilde anlat."]},
    ])

    # İlk açıklamayı gönder
    response = convo.send_message("Derse başla.")
    print("Gemini: ", response.text)

    while True:
        user_input = input("\nSen: ")
        if user_input.lower() in ["çık", "q", "quit", "exit"]:
            print("👋 Ders sona erdi.")
            break

        response = convo.send_message(user_input)
        print("Gemini:", response.text)
