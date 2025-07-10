from roadmap_generator import generate_learning_roadmap
from lesson_chatbot import start_lesson
from quiz_generator import generate_quiz, run_quiz

def main():
    print("Merhaba! Hedefini söyle, sana yol haritası çıkarayım.")
    user_goal = input("Hedefin nedir?")

    roadmap = generate_learning_roadmap(user_goal)

    if not roadmap:
        print("Üzgünüm, bir şeyler ters gitti.")
        return

    print("\n Öğrenme Yol Haritan:\n")
    for i, konu in enumerate(roadmap, 1):
        print(f"{i}. {konu['baslik']}")
        print(f"   Açıklama: {konu['aciklama']}")
        if konu["on_kosullar"]:
            print(f"   Ön Koşullar: {', '.join(konu['on_kosullar'])}")
        else:
            print("   Ön Koşullar: Yok")
        print()

    # Kullanıcının konu seçmesini iste
    try:
        secim = int(input("Hangi konudan başlamak istersin? (1 - {}): ".format(len(roadmap))))
        if 1 <= secim <= len(roadmap):
            secilen_konu = roadmap[secim - 1]["baslik"]
            start_lesson(secilen_konu)
        else:
            print("Geçersiz seçim. Program sonlandırıldı.")
    except ValueError:
        print("Lütfen geçerli bir sayı gir.")
    # Kullanıcıdan konu al, test başlat
    konu = input("Quiz için bir konu gir: ")
    quiz = generate_quiz(konu)

    if quiz:
        run_quiz(quiz)
    else:
        print("Quiz oluşturulamadı.")

   
if __name__ == "__main__":
    main()
