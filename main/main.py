from modules.roadmap_generator import generate_learning_roadmap
from modules.lesson_chatbot import start_lesson
from modules.quiz_generator import generate_quiz, run_quiz
from modules.code_challenge import kodlama_pratigi_baslat
from modules.interview_simulator import run_final_interview

def main():
    print(" Merhaba! Hedefini söyle, sana öğrenme yol haritası çıkarayım.")
    user_goal = input("Hedefin nedir? ")

    roadmap = generate_learning_roadmap(user_goal)

    if not roadmap:
        print(" Üzgünüm, bir şeyler ters gitti.")
        return

    print("\n📘 Öğrenme Yol Haritan:\n")
    for i, konu in enumerate(roadmap, 1):
        print(f"{i}. {konu['baslik']}")
        print(f"   Açıklama: {konu['aciklama']}")
        if konu["on_kosullar"]:
            print(f"   Ön Koşullar: {', '.join(konu['on_kosullar'])}")
        else:
            print("   Ön Koşullar: Yok")
        print()

    try:
        secim = int(input("Hangi konudan başlamak istersin? (1 - {}): ".format(len(roadmap))))
        if 1 <= secim <= len(roadmap):
            secilen_konu = roadmap[secim - 1]["baslik"]
        else:
            print("Geçersiz seçim. Program sonlandırıldı.")
            return
    except ValueError:
        print("Lütfen geçerli bir sayı gir.")
        return

    # 1️ Seçilen konuyla ders başlasın
    start_lesson(secilen_konu)

    # 2️ Quiz başlasın – başka konu sorulmaz
    print(f"\n '{secilen_konu}' hakkında quiz başlıyor!")
    quiz = generate_quiz(secilen_konu)
    if quiz:
        run_quiz(quiz)
    else:
        print(" Quiz oluşturulamadı.")

    # 3️ Kodlama pratiği
    print(f"\n Şimdi '{secilen_konu}' hakkında kodlama pratiği zamanı!")
    kodlama_pratigi_baslat(secilen_konu)

    # 4️ Final Teknik Mülakat
    print("\n Artık final mülakat zamanı!")
    run_final_interview(user_goal)
if __name__ == "__main__":
    main()
