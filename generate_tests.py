import json
import random

# Список з 30 європейських мов
EUROPEAN_LANGUAGES = [
    "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", 
    "Polish", "Ukrainian", "Romanian", "Czech", "Swedish", "Greek", 
    "Hungarian", "Belarusian", "Serbian", "Bulgarian", "Danish", 
    "Slovak", "Finnish", "Norwegian", "Croatian", "Lithuanian", 
    "Slovenian", "Latvian", "Estonian", "Macedonian", "Albanian", 
    "Maltese", "Icelandic", "Irish"
]

def generate_english_test(index):
    """
    Генерує базовий (симуляційний) тест з англійської мови.
    В реальному проекті тут варто підключити Gemini API для генерації осмислених питань.
    """
    templates = [
        {"q": "Choose the correct verb: 'She ___ to the store yesterday.'", "options": ["go", "goes", "went", "gone"], "a": "went"},
        {"q": "Translate to English: 'Привіт, як справи?'", "options": ["Hello, how are you?", "Bye, see you!", "Good morning", "What is your name?"], "a": "Hello, how are you?"},
        {"q": "Which word is a noun?", "options": ["Quickly", "Beautiful", "House", "Run"], "a": "House"},
        {"q": "Fill in the blank: 'I have been living here ___ 2010.'", "options": ["for", "since", "in", "at"], "a": "since"},
        {"q": "What is the synonym of 'Happy'?", "options": ["Sad", "Angry", "Joyful", "Tired"], "a": "Joyful"}
    ]
    test = random.choice(templates).copy()
    test['id'] = f"eng_test_{index}"
    return test

def generate_european_language_metadata():
    """
    Генерує метадані для 30 європейських мов.
    """
    languages_data = {}
    for lang in EUROPEAN_LANGUAGES:
        languages_data[lang] = {
            "name": lang,
            "description": f"Learn {lang} with AI.",
            "total_tests_available": 100 # Можна збільшити
        }
    return languages_data

def main():
    print("Генеруємо 10,000 тестів з англійської мови...")
    english_tests = [generate_english_test(i) for i in range(1, 10001)]
    
    print("Генеруємо конфігурацію для 30 європейських мов...")
    euro_languages = generate_european_language_metadata()
    
    data = {
        "english_tests": english_tests,
        "european_languages": euro_languages
    }
    
    output_file = 'language_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Успішно згенеровано! Файл збережено як {output_file}")
    print(f"Згенеровано {len(english_tests)} тестів для англійської та додано {len(EUROPEAN_LANGUAGES)} європейських мов.")

if __name__ == "__main__":
    main()
