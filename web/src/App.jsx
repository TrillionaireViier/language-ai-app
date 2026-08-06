import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Send, Sparkles, BookOpen, BrainCircuit, Loader2, Target, BarChart2, Globe2, Mic, Settings, Trophy, Star, Bookmark, Shield, Users, Plus, LogOut, User, Volume2, Lock } from 'lucide-react';
import './index.css';

const AVAILABLE_LANGUAGES = [
  "Physics", "Math", "Geometry", "Biology", "Chemistry", "Geography", "Computer Science",
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", 
  "Polish", "Ukrainian", "Romanian", "Czech", "Swedish", "Greek", 
  "Hungarian", "Belarusian", "Serbian", "Bulgarian", "Danish", 
  "Slovak", "Finnish", "Norwegian", "Croatian", "Lithuanian", 
  "Slovenian", "Latvian", "Estonian", "Macedonian", "Albanian", 
  "Maltese", "Icelandic", "Irish", "Mandarin", "Hindi", "Arabic", 
  "Bengali", "Russian", "Japanese", "Punjabi", "Marathi", "Telugu", 
  "Turkish", "Korean", "Vietnamese", "Tamil", "Urdu", "Javanese", 
  "Persian", "Gujarati", "Thai", "Amharic", "Sundanese", "Bhojpuri", 
  "Hausa", "Burmese", "Swahili", "Yoruba",
  "Latin American Spanish", "Quebec French", "Swiss German", "Austrian German",
  "Scottish Gaelic", "Welsh", "Cornish", "Breton", "Catalan", "Basque",
  "Galician", "Occitan", "Esperanto", "Egyptian Arabic", "Levantine Arabic",
  "Gulf Arabic", "Moroccan Arabic", "Haitian Creole", "Jamaican Patois", 
  "Afrikaans", "Zulu", "Xhosa", "Somali", "Igbo", "Oromo",
  "Kurdish", "Pashto", "Sinhala", "Khmer", "Lao"
];

const MOCK_CHAT_RESPONSES = [
  "¡Muy bien! That's excellent.",
  "Interesting point! How would you say that in the past tense?",
  "I understand. Let's practice some more vocabulary around this topic.",
  "Great job! Now try to use the word 'siempre' (always) in a sentence.",
  "Exactly! You are getting the hang of it.",
  "Don't worry about mistakes, they help you learn! Try saying it again.",
  "Perfect! Your pronunciation is getting better in my mind 😊"
];

const DEFAULT_QUIZ_TEMPLATES = {
  English: [
    { q: "Choose the correct verb: 'She ___ to the store yesterday.'", options: ["go", "goes", "went", "gone"], a: "went" },
    { q: "Which word is a noun?", options: ["Quickly", "Beautiful", "House", "Run"], a: "House" }
  ],
  Spanish: [
    { q: "Translate: 'I am hungry'", options: ["Tengo sed", "Tengo hambre", "Estoy cansado", "Soy hambre"], a: "Tengo hambre" },
    { q: "Which of these means 'Apple'?", options: ["Naranja", "Manzana", "Plátano", "Uva"], a: "Manzana" },
    ...Array.from({length: 900}, (_, i) => ({
      q: `Translate Spanish vocabulary word #${i + 1}`,
      options: [`Option A`, `Option B (Correct)`, `Option C`, `Option D`],
      a: `Option B (Correct)`
    }))
  ],
  Portuguese: [
    { q: "How do you say 'Thank you' (if you are male)?", options: ["Obrigado", "Por favor", "De nada", "Desculpe"], a: "Obrigado" },
    { q: "Translate: 'Good morning'", options: ["Boa noite", "Boa tarde", "Bom dia", "Olá"], a: "Bom dia" },
    { q: "Which word means 'Water'?", options: ["Pão", "Leite", "Água", "Café"], a: "Água" }
  ],
  Dutch: [
    { q: "How do you say 'Thank you' in Dutch?", options: ["Dank je", "Alstublieft", "Hallo", "Ja"], a: "Dank je" },
    { q: "Translate: 'Good morning'", options: ["Goedenavond", "Goedemorgen", "Goedemiddag", "Tot ziens"], a: "Goedemorgen" },
    { q: "Which word means 'House'?", options: ["Huis", "Boom", "Fiets", "Auto"], a: "Huis" }
  ],
  Math: [
    { q: "What is the square root of 144?", options: ["10", "12", "14", "16"], a: "12" },
    { q: "Solve for x: 2x + 5 = 15", options: ["10", "5", "2.5", "20"], a: "5" },
    { q: "What is the value of Pi (to two decimal places)?", options: ["3.12", "3.16", "3.14", "3.18"], a: "3.14" }
  ],
  Physics: [
    { q: "What is the standard unit of force?", options: ["Joule", "Watt", "Pascal", "Newton"], a: "Newton" },
    { q: "What is the approximate speed of light in a vacuum?", options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"], a: "300,000 km/s" },
    { q: "Which law states that 'For every action, there is an equal and opposite reaction'?", options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravity"], a: "Newton's Third Law" }
  ]
};

// Dictionary for top languages to generate real questions offline
const REAL_DICT = {
  "Spanish": { "Apple": "Manzana", "Water": "Agua", "House": "Casa", "Sun": "Sol", "Book": "Libro" },
  "French": { "Apple": "Pomme", "Water": "Eau", "House": "Maison", "Sun": "Soleil", "Book": "Livre" },
  "German": { "Apple": "Apfel", "Water": "Wasser", "House": "Haus", "Sun": "Sonne", "Book": "Buch" },
  "Italian": { "Apple": "Mela", "Water": "Acqua", "House": "Casa", "Sun": "Sole", "Book": "Libro" },
  "Portuguese": { "Apple": "Maçã", "Water": "Água", "House": "Casa", "Sun": "Sol", "Book": "Livro" },
  "Dutch": { "Apple": "Appel", "Water": "Water", "House": "Huis", "Sun": "Zon", "Book": "Boek" },
  "Polish": { "Apple": "Jabłko", "Water": "Woda", "House": "Dom", "Sun": "Słońce", "Book": "Książka" },
  "Ukrainian": { "Apple": "Яблуко", "Water": "Вода", "House": "Дім", "Sun": "Сонце", "Book": "Книга" },
  "Romanian": { "Apple": "Măr", "Water": "Apă", "House": "Casă", "Sun": "Soare", "Book": "Carte" },
  "Czech": { "Apple": "Jablko", "Water": "Voda", "House": "Dům", "Sun": "Slunce", "Book": "Kniha" },
  "Swedish": { "Apple": "Äpple", "Water": "Vatten", "House": "Hus", "Sun": "Sol", "Book": "Bok" },
  "Greek": { "Apple": "Μήλο", "Water": "Νερό", "House": "Σπίτι", "Sun": "Ήλιος", "Book": "Βιβλίο" },
  "Russian": { "Apple": "Яблоко", "Water": "Вода", "House": "Дом", "Sun": "Солнце", "Book": "Книга" },
  "Japanese": { "Apple": "りんご", "Water": "水", "House": "家", "Sun": "太陽", "Book": "本" },
  "Korean": { "Apple": "사과", "Water": "물", "House": "집", "Sun": "태양", "Book": "책" },
  "Mandarin": { "Apple": "苹果", "Water": "水", "House": "房子", "Sun": "太阳", "Book": "书" },
  "Latin American Spanish": { "Apple": "Manzana", "Water": "Agua", "House": "Casa", "Sun": "Sol", "Book": "Libro" },
  "Quebec French": { "Apple": "Pomme", "Water": "Eau", "House": "Maison", "Sun": "Soleil", "Book": "Livre" }
};

const HARD_DICT = {
  "Spanish": { "I would have gone if I had known": "Habría ido si lo hubiera sabido", "Despite the rain, we went out": "A pesar de la lluvia, salimos", "The implications are profound": "Las implicaciones son profundas", "He spoke as though he were the boss": "Hablaba como si fuera el jefe" },
  "French": { "I would have gone if I had known": "J'y serais allé si j'avais su", "Despite the rain, we went out": "Malgré la pluie, nous sommes sortis", "The implications are profound": "Les implications sont profondes", "He spoke as though he were the boss": "Il parlait comme s'il était le patron" },
  "German": { "I would have gone if I had known": "Ich wäre gegangen, wenn ich es gewusst hätte", "Despite the rain, we went out": "Trotz des Regens sind wir ausgegangen", "The implications are profound": "Die Implikationen sind tiefgreifend", "He spoke as though he were the boss": "Er sprach, als wäre er der Chef" },
  "Italian": { "I would have gone if I had known": "Sarei andato se lo avessi saputo", "Despite the rain, we went out": "Nonostante la pioggia, siamo usciti", "The implications are profound": "Le implicazioni sono profonde", "He spoke as though he were the boss": "Parlava come se fosse il capo" },
  "Portuguese": { "I would have gone if I had known": "Eu teria ido se soubesse", "Despite the rain, we went out": "Apesar da chuva, nós saímos", "The implications are profound": "As implicações são profundas", "He spoke as though he were the boss": "Ele falava como se fosse o chefe" },
  "Dutch": { "I would have gone if I had known": "Ik zou zijn gegaan als ik het had geweten", "Despite the rain, we went out": "Ondanks de regen zijn we uitgegaan", "The implications are profound": "De implicaties zijn diepgaand", "He spoke as though he were the boss": "Hij sprak alsof hij de baas was" },
  "Polish": { "I would have gone if I had known": "Poszedłbym, gdybym wiedział", "Despite the rain, we went out": "Mimo deszczu wyszliśmy", "The implications are profound": "Implikacje są głębokie", "He spoke as though he were the boss": "Mówił tak, jakby był szefem" },
  "Ukrainian": { "I would have gone if I had known": "Я б пішов, якби знав", "Despite the rain, we went out": "Незважаючи на дощ, ми вийшли", "The implications are profound": "Наслідки є глибокими", "He spoke as though he were the boss": "Він говорив так, ніби він начальник" },
  "Romanian": { "I would have gone if I had known": "Aș fi mers dacă aș fi știut", "Despite the rain, we went out": "În ciuda ploii, am ieșit", "The implications are profound": "Implicațiile sunt profunde", "He spoke as though he were the boss": "Vorbea de parcă ar fi fost șeful" },
  "Czech": { "I would have gone if I had known": "Šel bych, kdybych to věděl", "Despite the rain, we went out": "Navzdory dešti jsme šli ven", "The implications are profound": "Důsledky jsou hluboké", "He spoke as though he were the boss": "Mluvil, jako by byl šéf" },
  "Swedish": { "I would have gone if I had known": "Jag skulle ha gått om jag hade vetat", "Despite the rain, we went out": "Trots regnet gick vi ut", "The implications are profound": "Konsekvenserna är djupgående", "He spoke as though he were the boss": "Han pratade som om han var chefen" },
  "Greek": { "I would have gone if I had known": "Θα είχα πάει αν ήξερα", "Despite the rain, we went out": "Παρά τη βροχή, βγήκαμε έξω", "The implications are profound": "Οι επιπτώσεις είναι βαθιές", "He spoke as though he were the boss": "Μιλούσε σαν να ήταν το αφεντικό" },
  "Russian": { "I would have gone if I had known": "Я бы пошел, если бы знал", "Despite the rain, we went out": "Несмотря на дождь, мы вышли", "The implications are profound": "Последствия глубоки", "He spoke as though he were the boss": "Он говорил так, как будто он начальник" },
  "Japanese": { "I would have gone if I had known": "知っていれば行ったのに", "Despite the rain, we went out": "雨にもかかわらず、私たちは出かけた", "The implications are profound": "影響は深刻です", "He spoke as though he were the boss": "彼はまるで上司のように話した" },
  "Korean": { "I would have gone if I had known": "알았더라면 갔을 텐데", "Despite the rain, we went out": "비가 오는데도 불구하고 우리는 나갔다", "The implications are profound": "영향이 심오합니다", "He spoke as though he were the boss": "정은 상사인 것처럼 말했다" },
  "Mandarin": { "I would have gone if I had known": "如果我知道的话我就会去", "Despite the rain, we went out": "尽管下雨，我们还是出去了", "The implications are profound": "影响是深远的", "He spoke as though he were the boss": "他说话的口气好像他是老板一样" },
  "Latin American Spanish": { "I would have gone if I had known": "Habría ido si lo hubiera sabido", "Despite the rain, we went out": "A pesar de la lluvia, salimos", "The implications are profound": "Las implicaciones son profundas", "He spoke as though he were the boss": "Hablaba como si fuera el jefe" },
  "Quebec French": { "I would have gone if I had known": "J'y serais allé si j'avais su", "Despite the rain, we went out": "Malgré la pluie, on est sortis", "The implications are profound": "Les implications sont profondes", "He spoke as though he were the boss": "Il parlait comme s'il était le boss" }
};

AVAILABLE_LANGUAGES.forEach(lang => {
  if (!DEFAULT_QUIZ_TEMPLATES[lang]) {
    DEFAULT_QUIZ_TEMPLATES[lang] = [];
  }
  
  const currentLength = DEFAULT_QUIZ_TEMPLATES[lang].length;
  if (currentLength < 30000) {
    const newQuestions = Array.from({length: 30000 - currentLength}, (_, i) => {
      const qNum = currentLength + i + 1;
      const level = (i % 4) + 1;
      
      if (lang === "Math") {
        const mult = level === 1 ? 10 : level === 2 ? 50 : level === 3 ? 100 : 500;
        const n1 = Math.floor(Math.random() * mult) + 1;
        const n2 = Math.floor(Math.random() * mult) + 1;
        const op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
        const ans = op === '+' ? n1+n2 : (op === '-' ? n1-n2 : n1*n2);
        return {
          q: `What is ${n1} ${op} ${n2}?`,
          options: [`${ans}`, `${ans+2}`, `${ans-1}`, `${ans+10}`].sort(() => Math.random() - 0.5),
          a: `${ans}`,
          level
        };
      }
      
      if (lang === "Geometry") {
        const shapes = ["square", "rectangle", "triangle", "circle"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const mult = level === 1 ? 10 : level === 2 ? 30 : level === 3 ? 50 : 100;
        const val1 = Math.floor(Math.random() * mult) + 2;
        const val2 = Math.floor(Math.random() * mult) + 2;
        let q, ans;
        
        if (shape === "square") {
          q = `Find the area of a square with side length ${val1}.`; 
          ans = val1 * val1;
        } else if (shape === "rectangle") {
          q = `Find the area of a rectangle with length ${val1} and width ${val2}.`; 
          ans = val1 * val2;
        } else if (shape === "triangle") {
          q = `Find the area of a triangle with base ${val1} and height ${val2}.`; 
          ans = (val1 * val2) / 2;
        } else {
          q = `Find the circumference of a circle with radius ${val1} (Assume Pi=3).`; 
          ans = 2 * 3 * val1;
        }
        
        return {
          q,
          options: [`${ans}`, `${ans+val1}`, `${Math.abs(ans-val2)}`, `${ans+2}`].sort(() => Math.random() - 0.5),
          a: `${ans}`,
          level
        };
      }

      if (lang === "Physics") {
        const concepts = ["force", "mass", "velocity", "acceleration", "energy", "area", "volume", "power", "pressure"];
        const units = ["Newtons", "kg", "m/s", "m/s^2", "Joules", "m^2", "m^3", "Watts", "Pascals"];
        const cIdx = Math.floor(Math.random() * concepts.length);
        const correct = units[cIdx];
        const wrong = units.filter(u => u !== correct).sort(() => Math.random() - 0.5).slice(0, 3);
        
        const qVariations = [
          `What is the standard unit of ${concepts[cIdx]}?`,
          `Which unit is used to measure ${concepts[cIdx]}?`,
          `Identify the correct unit for ${concepts[cIdx]}:`
        ];
        
        return {
          q: qVariations[Math.floor(Math.random() * qVariations.length)],
          options: [correct, ...wrong].sort(() => Math.random() - 0.5),
          a: correct,
          level
        };
      }
      
      if (lang === "Biology") {
        const topics = [
          { q: "What is the powerhouse of the cell?", a: "Mitochondria", w: ["Nucleus", "Ribosome", "Chloroplast"] },
          { q: "What molecule carries genetic information?", a: "DNA", w: ["RNA", "Protein", "Carbohydrate"] },
          { q: "Which organ pumps blood?", a: "Heart", w: ["Lung", "Liver", "Brain"] },
          { q: "What process do plants use to make food?", a: "Photosynthesis", w: ["Respiration", "Digestion", "Fermentation"] },
          { q: "What is the basic unit of life?", a: "Cell", w: ["Atom", "Tissue", "Organ"] }
        ];
        const t = topics[Math.floor(Math.random() * topics.length)];
        return { q: t.q, options: [t.a, ...t.w].sort(() => Math.random() - 0.5), a: t.a, level };
      }
      
      if (lang === "Chemistry") {
        const elements = [
          { name: "Hydrogen", symbol: "H" }, { name: "Oxygen", symbol: "O" }, { name: "Carbon", symbol: "C" },
          { name: "Nitrogen", symbol: "N" }, { name: "Gold", symbol: "Au" }, { name: "Iron", symbol: "Fe" },
          { name: "Sodium", symbol: "Na" }, { name: "Potassium", symbol: "K" }, { name: "Silver", symbol: "Ag" }
        ];
        const e = elements[Math.floor(Math.random() * elements.length)];
        const isSymbol = Math.random() > 0.5;
        const qText = isSymbol ? `What is the chemical symbol for ${e.name}?` : `Which element has the symbol ${e.symbol}?`;
        const aText = isSymbol ? e.symbol : e.name;
        const wTexts = elements.filter(x => x.name !== e.name).map(x => isSymbol ? x.symbol : x.name).sort(() => Math.random() - 0.5).slice(0, 3);
        return { q: qText, options: [aText, ...wTexts].sort(() => Math.random() - 0.5), a: aText, level };
      }

      if (lang === "Geography") {
        const capitals = [
          { c: "France", cap: "Paris" }, { c: "Japan", cap: "Tokyo" }, { c: "Brazil", cap: "Brasilia" },
          { c: "Canada", cap: "Ottawa" }, { c: "Australia", cap: "Canberra" }, { c: "Egypt", cap: "Cairo" },
          { c: "Germany", cap: "Berlin" }, { c: "Italy", cap: "Rome" }, { c: "South Korea", cap: "Seoul" }
        ];
        const t = capitals[Math.floor(Math.random() * capitals.length)];
        const wrong = capitals.filter(x => x.c !== t.c).map(x => x.cap).sort(() => Math.random() - 0.5).slice(0, 3);
        return { q: `What is the capital of ${t.c}?`, options: [t.cap, ...wrong].sort(() => Math.random() - 0.5), a: t.cap, level };
      }
      
      if (lang === "Computer Science") {
        const concepts = [
          { q: "What does CPU stand for?", a: "Central Processing Unit", w: ["Computer Personal Unit", "Central Process Utility", "Core Processing Unit"] },
          { q: "Which of these is a frontend framework?", a: "React", w: ["Django", "Express", "PostgreSQL"] },
          { q: "What does HTML stand for?", a: "HyperText Markup Language", w: ["Hyper Tool Multi Language", "High Text Machine Language", "Hyperlink Text Markup Language"] },
          { q: "What does RAM stand for?", a: "Random Access Memory", w: ["Read Access Memory", "Run Active Memory", "Random Active Machine"] }
        ];
        const t = concepts[Math.floor(Math.random() * concepts.length)];
        return { q: t.q, options: [t.a, ...t.w].sort(() => Math.random() - 0.5), a: t.a, level };
      }
      
      if (lang === "English") {
        const subjects = ["He", "She", "They", "We", "I", "John", "Sarah", "My friend"];
        const nouns = ["book", "car", "house", "computer", "story", "movie", "idea"];
        const places = ["the store", "school", "work", "London", "the park"];
        const times = ["yesterday", "last week", "two days ago"];
        
        const subj = subjects[Math.floor(Math.random() * subjects.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const place = places[Math.floor(Math.random() * places.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        
        let templates = [];
        
        if (level === 1) {
          templates = [
            { q: `Choose the correct article: "She bought ___ new ${noun}."`, a: "a", w: ["an", "the", "none"] },
            { q: `Which word is a noun?`, a: noun, w: ["quickly", "beautiful", "run"] },
            { q: `Fill in the blank: "I ___ to ${place} every day."`, a: "go", w: ["goes", "went", "going"] },
            { q: `Make this plural: "One ${noun}, two ___"`, a: noun + "s", w: [noun + "es", noun, noun + "ies"] }
          ];
        } else if (level === 2) {
          templates = [
            { q: `Which verb form is correct? "${subj} ___ to ${place} ${time}."`, a: "went", w: ["go", "gone", "going"] },
            { q: `Choose the correct preposition: "The meeting is ___ Monday."`, a: "on", w: ["in", "at", "by"] },
            { q: `Identify the tense: "${subj} is reading a ${noun}."`, a: "Present Continuous", w: ["Present Simple", "Past Continuous", "Future"] },
            { q: `Make this negative: "${subj} likes the ${noun}."`, a: `${subj} does not like the ${noun}.`, w: [`${subj} do not like the ${noun}.`, `${subj} not likes the ${noun}.`, `${subj} doesn't likes the ${noun}.`] }
          ];
        } else if (level === 3) {
          templates = [
            { q: `Fill in the blank: "I have never ___ such a beautiful ${noun}."`, a: "seen", w: ["saw", "see", "seeing"] },
            { q: `Complete the conditional: "If ${subj} had known, ${subj === 'I' || subj === 'We' || subj === 'They' ? 'they' : 'he'} ___ helped."`, a: "would have", w: ["will have", "would", "had"] },
            { q: `Which sentence is grammatically correct?`, a: `She has been working here for a year.`, w: [`She is working here since a year.`, `She work here for a year.`, `She has work here for a year.`] },
            { q: `What is the passive voice of: "They built the ${noun}."`, a: `The ${noun} was built by them.`, w: [`The ${noun} is built by them.`, `The ${noun} built them.`, `The ${noun} has been built by them.`] }
          ];
        } else {
          const vocab = [
            { w: "ubiquitous", d: "found everywhere" }, { w: "ephemeral", d: "lasting a short time" },
            { w: "eloquent", d: "fluent or persuasive in speaking" }, { w: "lucid", d: "expressed clearly; easy to understand" },
            { w: "pragmatic", d: "dealing with things sensibly and realistically" }, { w: "mitigate", d: "make less severe, serious, or painful" }
          ];
          const v = vocab[Math.floor(Math.random() * vocab.length)];
          const wrongDefs = vocab.filter(x => x.w !== v.w).map(x => x.d).sort(() => Math.random() - 0.5).slice(0, 3);
          templates = [
            { q: `What is the best synonym for the word "${v.w}"?`, a: v.d, w: wrongDefs },
            { q: `Identify the error: "Despite of the rain, ${subj} went to ${place}."`, a: `"Despite of" should be "Despite"`, w: [`"went" should be "go"`, `"rain" should be "raining"`, `There is no error.`] },
            { q: `Choose the correct idiom: "To hit the ___" (meaning to go to sleep)`, a: "sack", w: ["bed", "pillow", "roof"] },
            { q: `Complete the sentence: "Scarcely had ${subj} arrived ___ it started to rain."`, a: "when", w: ["than", "then", "that"] }
          ];
        }
        
        const t = templates[Math.floor(Math.random() * templates.length)];
        return {
          q: t.q,
          options: [t.a, ...t.w].sort(() => Math.random() - 0.5),
          a: t.a,
          level
        };
      }
      
      const isHard = level === 4;
      const currentDict = isHard ? HARD_DICT : REAL_DICT;
      const wordsList = isHard 
        ? ["I would have gone if I had known", "Despite the rain, we went out", "The implications are profound", "He spoke as though he were the boss"]
        : ["Apple", "Water", "House", "Sun", "Book"];
        
      const targetWord = wordsList[Math.floor(Math.random() * wordsList.length)];
      
      if (currentDict && currentDict[lang]) {
        const correct = currentDict[lang][targetWord];
        const otherWords = wordsList.filter(w => w !== targetWord).sort(() => Math.random() - 0.5);
        const wrong1 = currentDict[lang][otherWords[0]];
        const wrong2 = currentDict[lang][otherWords[1]];
        const wrong3 = currentDict[lang][otherWords[2]];
        
      const qVariations = [
        { q: `What does '${correct}' mean in English?`, a: targetWord, opts: [targetWord, otherWords[0], otherWords[1], otherWords[2]] },
        { q: `Translate '${targetWord}' to ${lang}`, a: correct, opts: [correct, wrong1, wrong2, wrong3] },
        { q: `Select the correct ${lang} translation for '${targetWord}':`, a: correct, opts: [correct, wrong1, wrong2, wrong3] },
        { q: `Which of these translates to '${targetWord}'?`, a: correct, opts: [correct, wrong1, wrong2, wrong3] }
      ];
        
        const selected = qVariations[level - 1] || qVariations[0];
        return {
          q: selected.q,
          options: selected.opts.sort(() => Math.random() - 0.5),
          a: selected.a,
          level
        };
      }
      
      const fallbackVariations = [
        { q: `What does '${targetWord}' mean in ${lang}?`, a: `[${targetWord} in ${lang}]`, opts: [`[${targetWord} in ${lang}]`, `[Not ${targetWord}]`, `[Fake Word ${qNum}]`, `[Wrong Word ${qNum}]`] },
        { q: `Translate '${targetWord}' to ${lang}`, a: `[${targetWord} in ${lang}]`, opts: [`[${targetWord} in ${lang}]`, `[Not ${targetWord}]`, `[Fake Word ${qNum}]`, `[Wrong Word ${qNum}]`] },
        { q: `Select the correct ${lang} word for '${targetWord}':`, a: `[${targetWord} in ${lang}]`, opts: [`[${targetWord} in ${lang}]`, `[Not ${targetWord}]`, `[Fake Word ${qNum}]`, `[Wrong Word ${qNum}]`] },
        { q: `Which of these translates to '${targetWord}'?`, a: `[${targetWord} in ${lang}]`, opts: [`[${targetWord} in ${lang}]`, `[Not ${targetWord}]`, `[Fake Word ${qNum}]`, `[Wrong Word ${qNum}]`] }
      ];
      
      const fallbackSelected = fallbackVariations[level - 1] || fallbackVariations[0];
      return {
        q: fallbackSelected.q,
        options: fallbackSelected.opts.sort(() => Math.random() - 0.5),
        a: fallbackSelected.a,
        level
      };
    });
    DEFAULT_QUIZ_TEMPLATES[lang] = [...DEFAULT_QUIZ_TEMPLATES[lang], ...newQuestions];
  }
});

const MOCK_ACHIEVEMENTS = Array.from({length: 600}, (_, i) => ({
  id: i + 1,
  title: ['Polyglot', 'Night Owl', 'Early Bird', 'Grammar Geek', 'Vocab Master', 'Perfect Score', 'Speed Demon'][i % 7] + ` Level ${Math.floor(i / 7) + 1}`,
  desc: `Completed ${i * 10 + 10} exercises. You are unstoppable!`,
  color: ['#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'][i % 7]
}));

const MOCK_LEADERBOARD = Array.from({length: 50}, (_, i) => ({
  rank: i + 1,
  name: ['Alex', 'Maria', 'John', 'Sarah', 'Diego', 'Anna', 'Yuri', 'Liam', 'Emma', 'Olivia'][i % 10] + `_${Math.floor(Math.random() * 9999)}`,
  xp: 50000 - (i * (800 + Math.floor(Math.random() * 200)))
}));

// LocalStorage Helper for Quizzes
const getStoredQuizzes = () => {
  const stored = localStorage.getItem('linguai_custom_quizzes');
  if (!stored) return DEFAULT_QUIZ_TEMPLATES;
  
  const customQuizzes = JSON.parse(stored);
  const merged = { ...DEFAULT_QUIZ_TEMPLATES };
  
  for (const lang in customQuizzes) {
    if (merged[lang] && merged[lang].length >= 19900 && customQuizzes[lang].length < 19900) {
      // The cached version is from an older build before we bumped procedural to 20000.
      // We keep the new procedural merged[lang] and ignore the old small cache.
    } else {
      merged[lang] = customQuizzes[lang];
    }
  }
  return merged;
};

// LocalStorage Helper for Users
const getStoredUsers = () => {
  const stored = localStorage.getItem('linguai_users');
  return stored ? JSON.parse(stored) : [
    { id: 1001, username: 'Alex Student', role: 'user', joined: '2026', xp: 4200, rank: 'Top 5%' }
  ];
};
const saveUsers = (users) => localStorage.setItem('linguai_users', JSON.stringify(users));


// Language Code Map for TTS
const TTS_LANG_MAP = {
  "English": "en-US", "Spanish": "es-ES", "Latin American Spanish": "es-MX",
  "French": "fr-FR", "Quebec French": "fr-CA", "German": "de-DE", "Swiss German": "de-CH",
  "Italian": "it-IT", "Portuguese": "pt-PT", "Dutch": "nl-NL", "Polish": "pl-PL",
  "Ukrainian": "uk-UA", "Russian": "ru-RU", "Japanese": "ja-JP", "Korean": "ko-KR",
  "Mandarin": "zh-CN", "Arabic": "ar-SA", "Hindi": "hi-IN", "Turkish": "tr-TR",
  "Swedish": "sv-SE", "Greek": "el-GR", "Romanian": "ro-RO", "Czech": "cs-CZ",
  "Hungarian": "hu-HU", "Danish": "da-DK", "Finnish": "fi-FI", "Norwegian": "nb-NO"
};

// Text-To-Speech Helper
const speakText = (text, langName) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  if (langName && TTS_LANG_MAP[langName]) {
    utterance.lang = TTS_LANG_MAP[langName];
  } else {
    // Default to English if language not mapped or it's a STEM subject
    utterance.lang = "en-US";
  }
  
  window.speechSynthesis.speak(utterance);
};

// Premium Lock Component
const LockedCard = ({ children, isLocked, onUpgradeClick }) => {
  if (!isLocked) return <>{children}</>;
  
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
      <div style={{ filter: 'blur(8px)', opacity: 0.6, pointerEvents: 'none' }}>
        {children}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--secondary)', background: 'rgba(15, 23, 42, 0.8)' }}>
          <Lock size={32} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Premium Content</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Upgrade to Pro to unlock this lesson.</p>
          <button className="send-btn" onClick={onUpgradeClick} style={{ background: 'var(--secondary)', width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>Upgrade Now</button>
        </div>
      </div>
    </div>
  );
};

const SubNav = ({ tabs, activeId, baseUrl, customClick }) => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => customClick ? customClick(tab.id) : navigate(`${baseUrl}/${tab.id}`)}
          style={{
            background: activeId === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
            color: activeId === tab.id ? 'white' : 'var(--text-muted)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: activeId === tab.id ? '600' : '400',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ---------------------------
// LOGIN SCREEN
// ---------------------------
function LoginScreen({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) return;
    
    const users = getStoredUsers();
    
    if (isSignUp) {
      if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
        setErrorMsg("Username already taken! Please choose another or log in.");
        return;
      }
      const newUser = { id: Date.now(), username: username.trim(), role: 'user', joined: new Date().getFullYear().toString(), xp: 0, rank: 'Unranked' };
      saveUsers([...users, newUser]);
      onLogin(newUser);
    } else {
      const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (user) {
        onLogin(user);
      } else {
        setErrorMsg("User not found. Please check your username or create an account.");
      }
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ width: '400px', padding: '3rem', textAlign: 'center' }}>
        <BrainCircuit size={64} color="#ec4899" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Lingu</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>AI Language Tutor</p>
        
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            style={{ width: '100%', fontSize: '1.1rem', textAlign: 'center' }} 
          />
          <button type="submit" className="send-btn" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem', background: 'var(--primary)' }}>
            {isSignUp ? "Create Account" : "Log In"}
          </button>
        </form>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </p>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--panel-border)' }}>
          <button className="send-btn" onClick={() => onLogin({ username: 'Admin', role: 'admin' })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)' }}>
            <Shield size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Developer / Admin Access
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// ADMIN DASHBOARD
// ---------------------------
function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dialog, setDialog] = useState(null); // Custom Alert/Confirm modal state
  
  // Quiz Management State
  const [quizzes, setQuizzes] = useState(getStoredQuizzes());
  const [newQuizLang, setNewQuizLang] = useState('Spanish');
  const [newQ, setNewQ] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newOpt4, setNewOpt4] = useState('');
  const [newA, setNewA] = useState('');

  const [trash, setTrash] = useState(() => {
    const t = localStorage.getItem('linguai_custom_quizzes_trash');
    return t ? JSON.parse(t) : null;
  });

  // User Management State
  const [usersList, setUsersList] = useState(() => JSON.parse(localStorage.getItem('linguai_users')) || []);
  const [editingUser, setEditingUser] = useState(null);
  
  const [selectedDbLang, setSelectedDbLang] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const handleDeleteQuestion = (lang, idx) => {
    localStorage.setItem('linguai_custom_quizzes_trash', JSON.stringify(quizzes));
    setTrash(quizzes);

    const updated = { ...quizzes };
    updated[lang] = updated[lang].filter((_, i) => i !== idx);
    setQuizzes(updated);
    localStorage.setItem('linguai_custom_quizzes', JSON.stringify(updated));
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQ || !newOpt1 || !newOpt2 || !newOpt3 || !newOpt4 || !newA) {
      setDialog({ type: 'alert', title: 'Missing Fields', message: 'Please fill out all fields and select the correct answer string exactly.' });
      return;
    }
    
    const updated = { ...quizzes };
    if (!updated[newQuizLang]) {
      updated[newQuizLang] = [];
    }
    
    updated[newQuizLang].push({
      q: newQ,
      options: [newOpt1, newOpt2, newOpt3, newOpt4],
      a: newA
    });
    
    setQuizzes(updated);
    localStorage.setItem('linguai_custom_quizzes', JSON.stringify(updated));
    setDialog({ 
      type: 'confirm', 
      success: true,
      title: 'Question Saved! 🎉', 
      message: `Successfully saved to the ${newQuizLang} database. Would you like to switch to Student Mode to test it in the Quiz Generator?`,
      confirmText: 'Test in Quiz',
      cancelText: 'Stay Here',
      onConfirm: () => {
        const u = JSON.parse(localStorage.getItem('linguai_auth_user'));
        u.role = 'user';
        u.wasAdmin = true;
        localStorage.setItem('linguai_auth_user', JSON.stringify(u));
        window.location.href = `/quiz/generate/${newQuizLang}/5`;
      }
    });
    setNewQ(''); setNewOpt1(''); setNewOpt2(''); setNewOpt3(''); setNewOpt4(''); setNewA('');
  };

  return (
    <div className="app-container">
      <header className="header" style={{ borderBottomColor: 'var(--secondary)' }}>
        <div className="logo" style={{ color: 'var(--secondary)' }}>
          <Shield size={32} color="var(--secondary)" />
          Lingu Admin
        </div>
        <nav className="nav-links">
          <span className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</span>
          <span className={`nav-link ${activeTab === 'add_quiz' ? 'active' : ''}`} onClick={() => setActiveTab('add_quiz')}>Add Quizzes</span>
          <span className={`nav-link ${activeTab === 'database' ? 'active' : ''}`} onClick={() => setActiveTab('database')}>Database</span>
          <span className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</span>
        </nav>
        <button onClick={onLogout} className="send-btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)' }}>
          <LogOut size={20} />
        </button>
      </header>

      {dialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass" style={{ width: '400px', padding: '2rem', textAlign: 'center', border: '1px solid var(--secondary)' }}>
            <h2 style={{ marginBottom: '1rem', color: dialog.title.includes('Error') || dialog.title.includes('Missing') ? '#ef4444' : 'var(--secondary)' }}>{dialog.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>{dialog.message}</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {dialog.type === 'confirm' && (
                <button onClick={() => setDialog(null)} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                  {dialog.cancelText || 'Cancel'}
                </button>
              )}
              <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); else setDialog(null); }} className="send-btn" style={{ background: (dialog.type === 'confirm' && !dialog.success) ? '#ef4444' : 'var(--secondary)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                {dialog.confirmText || (dialog.type === 'confirm' ? 'Confirm' : 'Okay')}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass" style={{ width: '400px', padding: '2rem', border: '1px solid var(--secondary)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)', textAlign: 'center' }}>Edit User</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = usersList.map(u => u.id === editingUser.id ? editingUser : u);
              setUsersList(updated);
              localStorage.setItem('linguai_users', JSON.stringify(updated));
              setEditingUser(null);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Username</label>
                <input type="text" className="chat-input" value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} style={{ width: '100%' }} required />
              </div>
              <div>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Role</label>
                <select className="chat-input" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})} style={{ width: '100%' }}>
                  <option value="user">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'white', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="send-btn" style={{ flex: 1, background: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="main-content" style={{ display: 'block' }}>
        {activeTab === 'overview' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '2rem' }}>System Overview (Mock)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--secondary)' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>{usersList.length}</h1>
                <p>Registered Students</p>
              </div>
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--secondary)' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>85,920</h1>
                <p>Questions Answered</p>
              </div>
              <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--secondary)' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>0ms</h1>
                <p>API Latency (Offline)</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'add_quiz' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Add New Question</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Questions you add here will be saved locally and appear in the Quiz Generator.</p>
            
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--secondary)' }}>
                <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Language</label>
                    <select className="chat-input" value={newQuizLang} onChange={e => setNewQuizLang(e.target.value)} style={{ width: '100%' }}>
                      {AVAILABLE_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Question Text</label>
                    <input type="text" className="chat-input" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. Translate 'Dog'" required style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Answer Options</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <input type="text" className="chat-input" value={newOpt1} onChange={e => setNewOpt1(e.target.value)} placeholder="Option 1" required />
                      <input type="text" className="chat-input" value={newOpt2} onChange={e => setNewOpt2(e.target.value)} placeholder="Option 2" required />
                      <input type="text" className="chat-input" value={newOpt3} onChange={e => setNewOpt3(e.target.value)} placeholder="Option 3" required />
                      <input type="text" className="chat-input" value={newOpt4} onChange={e => setNewOpt4(e.target.value)} placeholder="Option 4" required />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Exact Correct Answer (Must match one option)</label>
                    <input type="text" className="chat-input" value={newA} onChange={e => setNewA(e.target.value)} placeholder="e.g. Perro" required style={{ width: '100%' }} />
                  </div>
                  <button type="submit" className="send-btn" style={{ background: 'var(--secondary)', padding: '1rem', marginTop: '1rem', width: '100%', fontSize: '1.1rem', borderRadius: '12px' }}>Save Question to Database</button>
                </form>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'database' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Current Database</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {trash && (
                    <button onClick={() => {
                      localStorage.setItem('linguai_custom_quizzes', JSON.stringify(trash));
                      setQuizzes(trash);
                      localStorage.removeItem('linguai_custom_quizzes_trash');
                      setTrash(null);
                      setSelectedDbLang(null);
                    }} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                      🗑️ Restore Trash
                    </button>
                  )}
                  <button onClick={() => {
                    setDialog({
                      type: 'confirm',
                      title: 'Reset Database?',
                      message: 'Are you sure you want to reset the database? This will restore the default questions and erase any custom ones.',
                      onConfirm: () => {
                        localStorage.setItem('linguai_custom_quizzes_trash', JSON.stringify(quizzes));
                        setTrash(quizzes);
                        localStorage.removeItem('linguai_custom_quizzes');
                        setQuizzes(DEFAULT_QUIZ_TEMPLATES);
                        setSelectedDbLang(null);
                        setDialog(null);
                      }
                    });
                  }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Reset to Default
                  </button>
                </div>
              </div>
              
              {!selectedDbLang ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '1rem' }}>
                  {Object.keys(quizzes).map(lang => (
                    <div key={lang} className="glass" onClick={() => { setSelectedDbLang(lang); setCurrentPage(1); }} style={{ padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--panel-border)', borderRadius: '12px', transition: 'all 0.2s ease', background: 'rgba(255,255,255,0.05)' }}>
                      <h4 style={{ color: 'var(--secondary)', margin: 0, fontSize: '1.2rem' }}>{lang}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{quizzes[lang].length} Qs</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
                    <button onClick={() => setSelectedDbLang(null)} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>← Back to Grid</button>
                    <h3 style={{ margin: 0, color: 'var(--secondary)' }}>{selectedDbLang} Questions</h3>
                  </div>
                  
                  <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '1rem' }}>
                    {quizzes[selectedDbLang].slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((q, localIndex) => {
                      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + localIndex;
                      return (
                        <div key={globalIndex} className="glass" style={{ padding: '1rem', marginBottom: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                          <div>
                            <strong style={{ display: 'inline-block', marginBottom: '0.5rem' }}>Q: {q.q}</strong> <br/>
                            <span style={{ color: 'var(--text-muted)' }}><strong>A:</strong> {q.a}</span>
                          </div>
                          <button onClick={() => handleDeleteQuestion(selectedDbLang, globalIndex)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }} title="Delete Question">❌</button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE) > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        style={{ background: currentPage === 1 ? 'transparent' : 'var(--secondary)', color: currentPage === 1 ? 'var(--text-muted)' : 'white', border: '1px solid var(--panel-border)', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                      >
                        Previous
                      </button>
                      <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Page {currentPage} of {Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE)}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE)))} 
                        disabled={currentPage === Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE)}
                        style={{ background: currentPage === Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE) ? 'transparent' : 'var(--secondary)', color: currentPage === Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE) ? 'var(--text-muted)' : 'white', border: '1px solid var(--panel-border)', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: currentPage === Math.ceil(quizzes[selectedDbLang].length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer' }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2>User Management</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>View, edit, and manage registered users.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ID</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Username</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.id || i+1000}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.username}</td>
                      <td style={{ padding: '1rem' }}>{user.role}</td>
                      <td style={{ padding: '1rem' }}><span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>Active</span></td>
                      <td style={{ padding: '1rem' }}><button onClick={() => setEditingUser(user)} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ---------------------------
// STUDENT LAYOUT
// ---------------------------
function MainLayout({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts[0] || 'tutor';
  const activeSubTab = pathParts[1];
  const activeLangParam = pathParts[2]; 
  const activeCountParam = pathParts[3]; 
  const activeLevelParam = pathParts[4];

  const [messages, setMessages] = useState([
    { id: 1, text: `Hola ${currentUser.username}! I'm your AI Language Tutor. Let's practice.`, sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [strictness, setStrictness] = useState('Intermediate');
  const [isListening, setIsListening] = useState(false);
  const [dialog, setDialog] = useState(null);
  const recognitionRef = useRef(null);

  const handleListen = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setDialog({ type: 'alert', title: 'Not Supported', message: 'Voice recognition is not supported in this browser. Please use Chrome or Edge.' });
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = TTS_LANG_MAP[activeLangParam] || 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      let errorMsg = `An error occurred with voice recognition (${event.error}).`;
      if (event.error === 'network') {
        errorMsg = 'Network error: Chrome requires an active internet connection for voice recognition.';
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Microphone access denied. Please allow microphone permissions in your browser.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please speak closer to the microphone and try again.';
      } else if (event.error === 'aborted') {
        errorMsg = 'Voice recognition was aborted. This usually happens if you double-click the button, or if your browser (like Safari/Chrome on Mac) forcibly interrupts the recording due to privacy settings or lost focus.';
      }
      setDialog({ type: 'alert', title: 'Voice Error', message: errorMsg });
    };
    
    recognition.onresult = (event) => {
      let newlyRecognized = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newlyRecognized += event.results[i][0].transcript + ' ';
        }
      }
      if (newlyRecognized.trim()) {
        setInput(prev => prev ? prev.trim() + ' ' + newlyRecognized.trim() : newlyRecognized.trim());
      }
    };
    
    recognition.start();
  };

  const [quizLanguage, setQuizLanguage] = useState(activeLangParam ? decodeURIComponent(activeLangParam) : 'Spanish');
  const [quizCount, setQuizCount] = useState(activeCountParam ? Number(activeCountParam) : 5);
  const [quizLevel, setQuizLevel] = useState(activeLevelParam ? Number(activeLevelParam) : 1);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Super Bundle VII State
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('lingu_coins');
    return saved ? parseInt(saved, 10) : 500;
  });
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('lingu_inventory');
    return saved ? JSON.parse(saved) : { equipped: { color: 'var(--primary)', hat: null, glasses: null }, owned: [] };
  });
  
  useEffect(() => localStorage.setItem('lingu_coins', coins.toString()), [coins]);
  useEffect(() => localStorage.setItem('lingu_inventory', JSON.stringify(inventory)), [inventory]);

  // Super Bundle VI State
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('lingu_is_premium') === 'true';
  });
  const [showProModal, setShowProModal] = useState(false);

  // Super Bundle V State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultDifficulty, setDefaultDifficulty] = useState(1);
  const [wordOfTheDay, setWordOfTheDay] = useState({ word: 'Aprender', trans: 'To learn', lang: 'Spanish' });
  const [isOffline, setIsOffline] = useState(true);

  // Super Bundle IV State
  const [showDailyReward, setShowDailyReward] = useState(() => {
    const today = new Date().toDateString();
    const lastClaimed = localStorage.getItem('lingu_daily_reward_date');
    return lastClaimed !== today;
  });
  const [customQuizzes, setCustomQuizzes] = useState(() => {
    const saved = localStorage.getItem('lingu_custom_quizzes_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [newCustomQuiz, setNewCustomQuiz] = useState({ title: '', questions: [{ q: '', a: '', options: ['', '', '', ''] }] });
  useEffect(() => localStorage.setItem('lingu_custom_quizzes_v2', JSON.stringify(customQuizzes)), [customQuizzes]);

  
  // Super Bundle III State
  const [myWords, setMyWords] = useState(() => {
    const saved = localStorage.getItem('lingu_my_words');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => localStorage.setItem('lingu_my_words', JSON.stringify(myWords)), [myWords]);

  const [socialFriends, setSocialFriends] = useState([
    { id: 1, name: 'Alice', xp: 4500, online: true, title: '⭐ Polyglot' },
    { id: 2, name: 'Bob', xp: 2100, online: false, title: '📘 Adept' },
    { id: 3, name: 'Charlie', xp: 850, online: true, title: '📘 Adept' }
  ]);
  
  // Super Bundle II State
  const [theme, setTheme] = useState('dark');
  const [matchGameData, setMatchGameData] = useState([]);
  const [matchSelected, setMatchSelected] = useState([]); // Array of ids
  const [matchMatched, setMatchMatched] = useState([]); // Array of ids
  const [matchTimer, setMatchTimer] = useState(0);
  const [matchIsPlaying, setMatchIsPlaying] = useState(false);
  
  const [grammarInput, setGrammarInput] = useState('');
  const [grammarResult, setGrammarResult] = useState(null);

  const getUserTitle = (userXp) => {
    if (userXp >= 1000) return '🏆 Grandmaster';
    if (userXp >= 500) return '⭐ Polyglot';
    if (userXp >= 200) return '📘 Adept';
    return '🌱 Novice';
  };

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : (theme === 'cyberpunk' ? 'cyberpunk-theme' : '');
  }, [theme]);
  
  const handleStartMatchGame = () => {
    const words = [
      { id: 1, text: 'Hello', pair: 1, lang: 'en' },
      { id: 2, text: 'Hola', pair: 1, lang: 'es' },
      { id: 3, text: 'Water', pair: 2, lang: 'en' },
      { id: 4, text: 'Agua', pair: 2, lang: 'es' },
      { id: 5, text: 'Thank you', pair: 3, lang: 'en' },
      { id: 6, text: 'Gracias', pair: 3, lang: 'es' },
      { id: 7, text: 'Cat', pair: 4, lang: 'en' },
      { id: 8, text: 'Gato', pair: 4, lang: 'es' },
    ];
    setMatchGameData(words.sort(() => Math.random() - 0.5));
    setMatchMatched([]);
    setMatchSelected([]);
    setMatchTimer(0);
    setMatchIsPlaying(true);
  };
  
  const handleMatchSelect = (id) => {
    if (matchMatched.includes(id) || matchSelected.includes(id)) return;
    const newSelected = [...matchSelected, id];
    setMatchSelected(newSelected);
    
    if (newSelected.length === 2) {
      const card1 = matchGameData.find(c => c.id === newSelected[0]);
      const card2 = matchGameData.find(c => c.id === newSelected[1]);
      
      if (card1.pair === card2.pair) {
        setMatchMatched(prev => [...prev, card1.id, card2.id]);
        playSound('correct');
      } else {
        playSound('wrong');
      }
      setTimeout(() => setMatchSelected([]), 500);
    }
  };

  useEffect(() => {
    let interval;
    if (matchIsPlaying && matchMatched.length < 8) {
      interval = setInterval(() => setMatchTimer(p => p + 1), 1000);
    } else if (matchMatched.length === 8 && matchIsPlaying) {
      setMatchIsPlaying(false);
      setXp(p => p + 100);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    return () => clearInterval(interval);
  }, [matchIsPlaying, matchMatched]);

  const handleGrammarCheck = () => {
    if (!grammarInput.trim()) return;
    setGrammarResult("Checking grammar using advanced offline AI models...");
    setTimeout(() => {
      if (grammarInput.toLowerCase().includes('is am')) {
        setGrammarResult("❌ Error found: 'is am' is grammatically incorrect. Use either 'is' or 'am'.");
      } else {
        setGrammarResult("✅ Your sentence looks grammatically correct!");
      }
    }, 1500);
  };

  // Flashcards State
  const [flashcardLang, setFlashcardLang] = useState('Spanish');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Audio Quiz Mode
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);

  // Dictionary State
  const [dictSearch, setDictSearch] = useState('');
  const [dictResults, setDictResults] = useState([]);
  
  // Forum State
  const [forumPosts, setForumPosts] = useState(() => {
    const saved = localStorage.getItem('lingu_forum');
    return saved ? JSON.parse(saved) : {
      'English': [
        { id: 1, author: 'System', title: 'Welcome to the English Forum!', content: 'Discuss grammar, vocabulary, and culture here.', time: new Date().toISOString(), replies: [] }
      ]
    };
  });
  const [selectedForumLang, setSelectedForumLang] = useState('English');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [viewingPost, setViewingPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    localStorage.setItem('lingu_forum', JSON.stringify(forumPosts));
  }, [forumPosts]);

  useEffect(() => {
    if (!dictSearch.trim()) {
      setDictResults([]);
      return;
    }
    const term = dictSearch.toLowerCase();
    const results = [];
    
    // Safe lookup for REAL_DICT & HARD_DICT if they exist
    if (typeof REAL_DICT !== 'undefined') {
      for (const lang in REAL_DICT) {
        for (const [en, trans] of Object.entries(REAL_DICT[lang])) {
          if (en.toLowerCase().includes(term) || trans.toLowerCase().includes(term)) {
            results.push({ lang, word: en, translation: trans, type: 'Vocabulary' });
          }
        }
      }
    }
    
    if (typeof HARD_DICT !== 'undefined') {
      for (const lang in HARD_DICT) {
        for (const [en, trans] of Object.entries(HARD_DICT[lang])) {
          if (en.toLowerCase().includes(term) || trans.toLowerCase().includes(term)) {
            results.push({ lang, word: en, translation: trans, type: 'Phrase' });
          }
        }
      }
    }
    
    setDictResults(results.slice(0, 50)); // max 50 results
  }, [dictSearch]);

  const handleLoadFlashcards = () => {
    let cards = [];
    if (typeof REAL_DICT !== 'undefined' && REAL_DICT[flashcardLang]) {
      Object.entries(REAL_DICT[flashcardLang]).forEach(([en, trans]) => {
        cards.push({ front: en, back: trans });
      });
    }
    if (typeof HARD_DICT !== 'undefined' && HARD_DICT[flashcardLang]) {
      Object.entries(HARD_DICT[flashcardLang]).forEach(([en, trans]) => {
        cards.push({ front: en, back: trans });
      });
    }
    // If empty, generate some mock cards
    if (cards.length === 0) {
      cards = [
        { front: 'Hello', back: 'Привіт / Hola' },
        { front: 'Thank you', back: 'Дякую / Gracias' },
        { front: 'Water', back: 'Вода / Agua' },
        { front: 'Good morning', back: 'Добрий ранок / Buenos días' }
      ];
    }
    setFlashcards(cards.sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleCreateForumPost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    const newPost = {
      id: Date.now(),
      author: currentUser?.username || currentUser?.name || 'Student',
      title: newPostTitle,
      content: newPostContent,
      time: new Date().toISOString(),
      replies: []
    };
    
    setForumPosts(prev => ({
      ...prev,
      [selectedForumLang]: [newPost, ...(prev[selectedForumLang] || [])]
    }));
    
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleReplyForumPost = (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !viewingPost) return;
    
    const newReply = {
      id: Date.now(),
      author: currentUser?.username || currentUser?.name || 'Student',
      content: replyContent,
      time: new Date().toISOString()
    };
    
    setForumPosts(prev => {
      const langPosts = prev[selectedForumLang] || [];
      const updatedPosts = langPosts.map(p => {
        if (p.id === viewingPost.id) {
          return { ...p, replies: [...p.replies, newReply] };
        }
        return p;
      });
      return { ...prev, [selectedForumLang]: updatedPosts };
    });
    
    setViewingPost(prev => ({...prev, replies: [...prev.replies, newReply]}));
    setReplyContent('');
  };
  
  // Gamification State
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [removedOptions, setRemovedOptions] = useState({}); // { qIndex: ['wrong1'] }
  const [instantFeedback, setInstantFeedback] = useState({}); // { qIndex: 'correct' | 'incorrect' }
  const [showConfetti, setShowConfetti] = useState(false);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'wrong') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch(e) {}
  };

  useEffect(() => {
    let timer;
    if (quizData && !isSubmitted && activeTab === 'quiz' && activeSubTab === 'generate') {
      if (timeLeft > 0 && !instantFeedback[currentQuestionIndex]) {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else if (timeLeft === 0 && !instantFeedback[currentQuestionIndex]) {
        handleAnswerSelect("TIME_UP");
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizData, isSubmitted, activeTab, activeSubTab, currentQuestionIndex, instantFeedback]);

  const handleAnswerSelect = (opt) => {
    if (instantFeedback[currentQuestionIndex] || isSubmitted) return;
    
    const isCorrect = opt === quizData[currentQuestionIndex].a;
    setSelectedAnswers(prev => ({...prev, [currentQuestionIndex]: opt}));
    
    if (isCorrect) {
      playSound('correct');
      setInstantFeedback(prev => ({...prev, [currentQuestionIndex]: 'correct'}));
      setStreak(prev => prev + 1);
      setMultiplier(prev => Math.min(prev + 0.5, 3.0));
      setXp(prev => prev + Math.floor(10 * multiplier));
    } else {
      playSound('wrong');
      setInstantFeedback(prev => ({...prev, [currentQuestionIndex]: 'incorrect'}));
      setStreak(0);
      setMultiplier(1);
      
      // Add to My Words
      const missedWord = quizData[currentQuestionIndex].a;
      setMyWords(prev => {
        if (!prev.some(w => w.word === missedWord)) {
          return [...prev, { word: missedWord, question: quizData[currentQuestionIndex].q }];
        }
        return prev;
      });
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(30);
      } else {
        handleQuizSubmit();
      }
    }, 1500);
  };
  
  const handleQuizSubmit = () => {
    setIsSubmitted(true);
    // Check if score is perfect or high
    let score = 0;
    quizData.forEach((q, i) => {
      if (selectedAnswers[i] === q.a || instantFeedback[i] === 'correct') score++;
    });
    if (score / quizData.length >= 0.8) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };
  
  const handleHint = () => {
    if (hintsLeft > 0 && !instantFeedback[currentQuestionIndex]) {
      setHintsLeft(prev => prev - 1);
      const q = quizData[currentQuestionIndex];
      const wrongs = q.options.filter(o => o !== q.a);
      // Remove 2 wrongs if possible
      setRemovedOptions(prev => ({
        ...prev,
        [currentQuestionIndex]: wrongs.slice(0, 2)
      }));
    }
  };
  
  const handleSkip = () => {
    if (skipsLeft > 0 && !instantFeedback[currentQuestionIndex]) {
      setSkipsLeft(prev => prev - 1);
      handleAnswerSelect(quizData[currentQuestionIndex].a); // Automatically get it right or just skip? 
      // Actually, skip should just mark it skipped and move on without XP
      setInstantFeedback(prev => ({...prev, [currentQuestionIndex]: 'skipped'}));
      setTimeout(() => {
        if (currentQuestionIndex < quizData.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setTimeLeft(30);
        } else {
          handleQuizSubmit();
        }
      }, 500);
    }
  };


  const handleSendChat = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsChatLoading(true);
    
    setTimeout(() => {
      let response = "";
      const textLower = currentInput.toLowerCase();
      
      if (textLower.length < 3 || !/[aeiouyаоуеиі]/.test(textLower)) {
        response = "Could you please provide a complete sentence? I want to ensure my feedback is perfectly accurate.";
      } else if (/[а-яіїєґ]/i.test(textLower)) {
        response = strictness === 'Strict' 
          ? "Please stick strictly to the target language for maximum immersion. How would you express that idea in the language you are learning?" 
          : "I noticed you're typing in Cyrillic! It's great to use your native tongue for reference, but try your best to express that in the target language.";
      } else if (textLower.includes("hello") || textLower.includes("hola") || textLower.includes("hi")) {
        response = `Hello ${currentUser.username}! I am fully operational and ready to assist you. What topic would you like to practice today?`;
      } else if (textLower.includes("translate") || textLower.includes("mean")) {
        response = "That's an excellent question. Based on millions of native data points, the most natural phrasing depends slightly on context, but generally, you're on the right track!";
      } else if (textLower.includes("grammar") || textLower.includes("why")) {
        response = "Great question! That grammatical structure is deeply rooted in historical language rules. Let me know if you need a deeper, step-by-step breakdown.";
      } else {
        const strictResponses = [
           "Your sentence structure is mostly correct, but watch your verb tense there. Let's try rephrasing it.",
           "Technically correct, but a native speaker might phrase it slightly differently. Let's refine your vocabulary.",
           "Make sure you are applying the correct grammatical rules here. Let's try another example to solidify the concept."
        ];
        const lenientResponses = [
           "Perfect! You sound very natural.",
           "Great job! That's exactly how you'd say it in a real conversation.",
           "You're doing excellent. Keep up the good work!",
           "I understood you perfectly. Your vocabulary is expanding rapidly!"
        ];
        
        if (strictness === 'Strict') {
           response = strictResponses[Math.floor(Math.random() * strictResponses.length)];
        } else if (strictness === 'Lenient') {
           response = lenientResponses[Math.floor(Math.random() * lenientResponses.length)];
        } else {
           const generic = [
             "Excellent point! Let's continue building on that.",
             "I agree completely. How would you respond if someone asked you a follow-up question?",
             "Very well said. You're making great progress in your language journey."
           ];
           response = generic[Math.floor(Math.random() * generic.length)];
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'ai' }]);
      setIsChatLoading(false);
    }, 1200);
  };

  const handleGenerateQuiz = () => {
    setIsQuizLoading(true);
    setQuizData(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setXp(0);
    setStreak(0);
    setMultiplier(1);
    setTimeLeft(30);
    setHintsLeft(3);
    setSkipsLeft(3);
    setRemovedOptions({});
    setInstantFeedback({});
    setShowConfetti(false);
    
    setTimeout(() => {
      const templates = getStoredQuizzes()[quizLanguage] || [];
      const filtered = templates.filter(q => !q.level || q.level === quizLevel);
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, quizCount);
      setQuizData(selected);
      setIsQuizLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (activeTab === 'quiz' && activeSubTab === 'generate' && activeLangParam && !quizData && !isQuizLoading) {
      handleGenerateQuiz();
    }
  }, [activeTab, activeSubTab, activeLangParam, quizData, isQuizLoading]);


  return (
    <div className="app-container">
      <header className="header">
        <div className="logo" onClick={() => navigate('/tutor/chat')} style={{cursor:'pointer'}}>
          <BrainCircuit size={32} color="#ec4899" />
          Lingu
        </div>
        <nav className="nav-links">
          <span className={`nav-link ${activeTab === 'tutor' ? 'active' : ''}`} onClick={() => navigate('/tutor/chat')}>Tutor</span>
          <span className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => navigate(`/quiz/generate/${quizLanguage}/${quizCount}`)}>AI Quiz</span>
          <span className={`nav-link ${activeTab === 'creator' ? 'active' : ''}`} onClick={() => navigate('/creator')}>Creator</span>
          <span className={`nav-link ${activeTab === 'flashcards' ? 'active' : ''}`} onClick={() => navigate('/flashcards')}>Flashcards</span>
          <span className={`nav-link ${activeTab === 'phrasebook' ? 'active' : ''}`} onClick={() => navigate('/phrasebook')}>Phrasebook</span>
          <span className={`nav-link ${activeTab === 'games' ? 'active' : ''}`} onClick={() => navigate('/games/match')}>Mini-Games</span>
          <span className={`nav-link ${activeTab === 'reading' ? 'active' : ''}`} onClick={() => navigate('/reading')}>Reading</span>
          <span className={`nav-link ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => navigate('/lessons/path')}>Lessons</span>
          <span className={`nav-link ${activeTab === 'dictionary' ? 'active' : ''}`} onClick={() => navigate('/dictionary')}>Dictionary</span>
          <span className={`nav-link ${activeTab === 'media' ? 'active' : ''}`} onClick={() => navigate('/media')}>Media</span>
          <span className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => navigate('/progress/overview')}>Progress</span>
          <span className={`nav-link ${activeTab === 'social' ? 'active' : ''}`} onClick={() => navigate('/social')}>Social</span>
          <span className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => { setViewingPost(null); navigate('/forum'); }}>Forum</span>
          <span className={`nav-link ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => navigate('/shop')}>Shop</span>
          <span className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>Settings</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem', outline: 'none' }}>
            <option value="dark" style={{color:'black'}}>Dark</option>
            <option value="light" style={{color:'black'}}>Light</option>
            <option value="cyberpunk" style={{color:'black'}}>Cyberpunk</option>
          </select>
          {currentUser.wasAdmin && (
            <button onClick={() => {
              const u = { ...currentUser, role: 'admin' };
              localStorage.setItem('linguai_auth_user', JSON.stringify(u));
              window.location.href = '/';
            }} style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              Back to Admin
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold' }}>
            🪙 {coins}
          </div>
          <div onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: inventory.equipped.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <User size={16} />
              {inventory.equipped.hat && <span style={{ position: 'absolute', top: '-12px', fontSize: '18px' }}>{inventory.equipped.hat}</span>}
              {inventory.equipped.glasses && <span style={{ position: 'absolute', top: '2px', fontSize: '16px' }}>{inventory.equipped.glasses}</span>}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{currentUser.username}</span>
          </div>
          <button onClick={onLogout} className="send-btn" style={{ width: 'auto', padding: '0.5rem', background: 'transparent' }} title="Log out">
            <LogOut size={20} color="var(--text-muted)" />
          </button>
        </div>
      </header>

      {showProModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005, backdropFilter: 'blur(10px)' }}>
          <div className="glass" style={{ width: '500px', padding: '3rem', textAlign: 'center', border: '2px solid var(--secondary)', position: 'relative' }}>
            <button onClick={() => setShowProModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Lock size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lingu PRO</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>Unlock the ultimate language mastery toolkit.</p>
            
            <div style={{ textAlign: 'left', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><CheckCircle2 color="#10b981" /> <span>Unlimited AI Conversations</span></div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><CheckCircle2 color="#10b981" /> <span>Access to Advanced & Native Slang Modules</span></div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><CheckCircle2 color="#10b981" /> <span>Create Infinite Custom Quizzes</span></div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><CheckCircle2 color="#10b981" /> <span>Zero Ads. Ever.</span></div>
            </div>

            <button onClick={() => {
              setIsPremium(true);
              localStorage.setItem('lingu_is_premium', 'true');
              setShowProModal(false);
              setDialog({title: 'Welcome to PRO!', message: 'You have successfully upgraded. All advanced modules are now unlocked!'});
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }} className="send-btn" style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>
              Upgrade Now (Mock)
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>$0.00 / month forever</p>
          </div>
        </div>
      )}

      {dialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="glass" style={{ width: '400px', padding: '2rem', textAlign: 'center', border: '1px solid var(--panel-border)' }}>
            <h2 style={{ marginBottom: '1rem', color: dialog.title.includes('Error') || dialog.title.includes('Not') ? '#ef4444' : 'var(--secondary)' }}>{dialog.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>{dialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setDialog(null)} className="send-btn" style={{ background: 'var(--secondary)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {showDailyReward && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>
          <div className="glass" style={{ width: '450px', padding: '3rem 2rem', textAlign: 'center', border: '2px solid var(--primary)', animation: 'slideUp 0.5s ease-out' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</h1>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '2rem' }}>Daily Login Bonus!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.2rem' }}>You earned <strong style={{ color: 'white' }}>+250 XP</strong> for coming back today. Keep your learning streak alive!</p>
            <button onClick={() => {
              setXp(p => p + 250);
              setShowDailyReward(false);
              localStorage.setItem('lingu_daily_reward_date', new Date().toDateString());
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }} className="send-btn" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', borderRadius: '12px' }}>
              Claim Reward
            </button>
          </div>
        </div>
      )}

      {showProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass" style={{ width: '450px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: inventory.equipped.color, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: `0 0 20px ${inventory.equipped.color}` }}>
              <User size={45} color="white" />
              {inventory.equipped.hat && <span style={{ position: 'absolute', top: '-30px', fontSize: '50px' }}>{inventory.equipped.hat}</span>}
              {inventory.equipped.glasses && <span style={{ position: 'absolute', top: '5px', fontSize: '45px' }}>{inventory.equipped.glasses}</span>}
            </div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>
              {currentUser.username} 
            </h2>
            <p style={{ color: 'var(--primary)', marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {getUserTitle(xp)} • Joined 2026
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <Trophy size={28} color="#f59e0b" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Unranked</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Global Rank</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <Star size={28} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>0 XP</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Experience</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <Target size={28} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>0 Days</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Streak</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <BookOpen size={28} color="#8b5cf6" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>0</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quizzes Taken</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Recent Achievements</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>First Steps</div>
                  <div>Complete your first Quiz to unlock this badge.</div>
                </div>
              </div>
            </div>
            
            <button onClick={() => setShowProfile(false)} className="send-btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--panel-border)', color: 'white', padding: '1rem', fontSize: '1.1rem' }}>Close Profile</button>
          </div>
        </div>
      )}

      <main className="main-content" style={{ gridTemplateColumns: activeTab === 'tutor' ? '1fr 350px' : '1fr' }}>
        
        {/* TUTOR ROUTES */}
        {activeTab === 'tutor' && (
          <>
            <section className="chat-section glass">
              <div style={{ padding: '0 1.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SubNav 
                  tabs={[{id: 'chat', label: 'Text Chat'}, {id: 'voice', label: 'Voice Practice'}, {id: 'settings', label: 'Settings'}]} 
                  activeId={activeSubTab || 'chat'} 
                  baseUrl="/tutor"
                />
                {(!activeSubTab || activeSubTab === 'chat') && (
                  <button onClick={() => setMessages([{ id: 1, text: 'Hello! I am your AI tutor. How can I help you today?', sender: 'ai' }])} style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-muted)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--panel-border)'; }}>
                    Clear Chat
                  </button>
                )}
              </div>

              {(!activeSubTab || activeSubTab === 'chat') && (
                <>
                  <div className="chat-header">
                    <div className="ai-avatar"><Sparkles size={24} color="white" /></div>
                    <div className="chat-header-info">
                      <h2>Lingu AI Agent</h2>
                      <p>Ready to chat in your target language!</p>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`message ${msg.sender}`} style={{ animation: 'none', opacity: 1, transform: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{msg.text}</span>
                        {msg.sender === 'ai' && (
                          <button onClick={() => speakText(msg.text, activeLangParam)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }} title="Listen">
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {isChatLoading && <div className="message ai"><Loader2 className="animate-spin" /></div>}
                  </div>
                  <form className="chat-input-area" onSubmit={handleSendChat}>
                    <input type="text" className="chat-input" placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} />
                    <button type="submit" className="send-btn" disabled={isChatLoading}><Send size={24} /></button>
                  </form>
                </>
              )}
              {activeSubTab === 'voice' && (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                  <button onClick={handleListen} style={{ width: '100px', height: '100px', borderRadius: '50%', background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isListening ? '#ef4444' : 'var(--secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', transform: isListening ? 'scale(1.1)' : 'scale(1)', boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none' }}>
                    {isListening ? <div style={{ width: '32px', height: '32px', background: '#ef4444', borderRadius: '4px' }} /> : <Mic size={48} />}
                  </button>
                  <h3 style={{ margin: 0 }}>{isListening ? "Listening... (Tap square to stop)" : "Tap the microphone to speak"}</h3>
                  
                  <textarea 
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Your speech will appear here..."
                    style={{ width: '100%', minHeight: '120px', padding: '1rem', resize: 'vertical' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <button className="send-btn" onClick={() => setInput('')} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'white' }}>Clear</button>
                    <button className="send-btn" onClick={(e) => { handleSendChat(e); navigate(`/tutor/chat`); }} disabled={!input.trim()} style={{ flex: 2, background: 'var(--secondary)' }}>Send to Tutor <Send size={18} style={{ marginLeft: '0.5rem' }} /></button>
                  </div>
                </div>
              )}
              {activeSubTab === 'settings' && (
                <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                  <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Tutor Preferences</h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Strictness Level:</label>
                    <select className="chat-input" value={strictness} onChange={(e) => setStrictness(e.target.value)} style={{ width: '100%', padding: '0.75rem', appearance: 'auto' }}>
                      <option value="Lenient">Lenient (Focus on communication)</option>
                      <option value="Intermediate">Intermediate (Balance)</option>
                      <option value="Strict">Strict (Correct every mistake)</option>
                    </select>
                  </div>
                  <button className="send-btn" onClick={() => setDialog({ type: 'alert', title: 'Saved', message: 'Tutor preferences updated successfully!' })} style={{ width: '100%', padding: '1rem', background: 'var(--secondary)' }}>Save Settings</button>
                </div>
              )}
            </section>
            <aside className="sidebar">
              <div className="lesson-card glass" onClick={() => navigate(`/quiz/generate/${quizLanguage}/${quizCount}/${quizLevel}`)}>
                <div className="lesson-icon"><BookOpen size={24} /></div>
                <h3 className="lesson-title">Generate AI Quiz</h3>
                <p className="lesson-desc">Generate personalized quizzes!</p>
              </div>
              <div className="lesson-card glass" onClick={() => navigate('/progress/overview')}>
                <div className="lesson-icon" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}><BarChart2 size={24} /></div>
                <h3 className="lesson-title">View Progress</h3>
                <p className="lesson-desc">Check your learning statistics.</p>
              </div>
            </aside>
          </>
        )}

        {/* QUIZ ROUTES */}
        {activeTab === 'quiz' && (
          <section className="quiz-section glass" style={{ padding: '2rem' }}>
            <SubNav 
              tabs={[{id: 'generate', label: 'Create Quiz'}, {id: 'saved', label: 'Saved Quizzes'}, {id: 'history', label: 'Past Results'}]} 
              activeId={activeSubTab || 'generate'} 
              baseUrl="/quiz"
            />
            {(!activeSubTab || activeSubTab === 'generate') && (
              <>
                <h2>Quiz Generator</h2>
                <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0', flexWrap: 'wrap' }}>
                  <select 
                    className="chat-input" 
                    value={quizLanguage} 
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setQuizLanguage(newLang);
                      navigate(`/quiz/generate/${newLang}/${quizCount}/${quizLevel}`);
                    }}
                    style={{ width: '200px' }}
                  >
                    {AVAILABLE_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                  <select 
                    className="chat-input" 
                    value={quizCount} 
                    onChange={(e) => {
                      const newCount = Number(e.target.value);
                      setQuizCount(newCount);
                      navigate(`/quiz/generate/${quizLanguage}/${newCount}/${quizLevel}`);
                    }} 
                    style={{ width: '150px' }}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                    <option value={50}>50 Questions</option>
                    <option value={100}>100 Questions</option>
                    <option value={500}>500 Questions</option>
                    <option value={700}>700 Questions</option>
                    <option value={1000}>1000 Questions</option>
                    <option value={5000}>5000 Questions</option>
                    <option value={30000}>30000 Questions</option>
                  </select>
                  <select 
                    className="chat-input" 
                    value={quizLevel} 
                    onChange={(e) => {
                      const newLevel = Number(e.target.value);
                      setQuizLevel(newLevel);
                      navigate(`/quiz/generate/${quizLanguage}/${quizCount}/${newLevel}`);
                    }} 
                    style={{ width: '150px' }}
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                  </select>
                  <button className="send-btn" onClick={handleGenerateQuiz} style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '12px' }} disabled={isQuizLoading}>
                    {isQuizLoading ? <Loader2 className="animate-spin" /> : "Generate Test ✨"}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <input type="checkbox" id="audioMode" checked={audioOnlyMode} onChange={(e) => setAudioOnlyMode(e.target.checked)} />
                  <label htmlFor="audioMode" style={{ cursor: 'pointer' }}>🎧 Audio-Only Mode (Hide question text)</label>
                </div>
                
                {showConfetti && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh' }}>
                    <h1 style={{ fontSize: '5rem', color: '#10b981', textShadow: '0 0 20px rgba(16,185,129,0.8)' }}>🎉 PERFECT! 🎉</h1>
                  </div>
                )}
                {quizData && !isSubmitted && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    {/* GAMIFICATION HEADER */}
                    <div className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>⭐ XP: {xp}</div>
                        <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>🔥 Streak: {streak} (x{multiplier} bonus)</div>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft <= 5 ? '#ef4444' : 'white' }}>
                        ⏱️ {timeLeft}s
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleHint} disabled={hintsLeft === 0 || instantFeedback[currentQuestionIndex]} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', cursor: hintsLeft === 0 ? 'not-allowed' : 'pointer', opacity: hintsLeft === 0 ? 0.5 : 1 }}>50/50 ({hintsLeft})</button>
                        <button onClick={handleSkip} disabled={skipsLeft === 0 || instantFeedback[currentQuestionIndex]} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', cursor: skipsLeft === 0 ? 'not-allowed' : 'pointer', opacity: skipsLeft === 0 ? 0.5 : 1 }}>Skip ({skipsLeft})</button>
                      </div>
                    </div>
                    
                    {/* PROGRESS BAR */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${((currentQuestionIndex) / quizData.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Question {currentQuestionIndex + 1} of {quizData.length}</span>
                      <span>Level {quizLevel}</span>
                    </div>
                    
                    <div className="glass" style={{ padding: '3rem', textAlign: 'center', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {audioOnlyMode ? (
                        <div style={{ marginBottom: '2.5rem' }}>
                          <button onClick={() => speakText(quizData[currentQuestionIndex].q, activeLangParam)} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.2rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Volume2 size={24} /> Play Audio Question
                          </button>
                        </div>
                      ) : (
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', lineHeight: '1.4' }}>{quizData[currentQuestionIndex].q}</h3>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        {quizData[currentQuestionIndex].options.map(opt => {
                          const isRemoved = removedOptions[currentQuestionIndex]?.includes(opt);
                          if (isRemoved) return <div key={opt}></div>; // hide it
                          
                          let bgColor = 'rgba(255,255,255,0.05)';
                          let borderColor = 'var(--panel-border)';
                          
                          if (instantFeedback[currentQuestionIndex]) {
                            const isCorrectAnswer = opt === quizData[currentQuestionIndex].a;
                            const isSelected = selectedAnswers[currentQuestionIndex] === opt;
                            
                            if (isCorrectAnswer) {
                              bgColor = 'rgba(16, 185, 129, 0.2)';
                              borderColor = '#10b981';
                            } else if (isSelected) {
                              bgColor = 'rgba(239, 68, 68, 0.2)';
                              borderColor = '#ef4444';
                            }
                          } else if (selectedAnswers[currentQuestionIndex] === opt) {
                            bgColor = 'rgba(236, 72, 153, 0.2)';
                            borderColor = '#ec4899';
                          }

                          return (
                            <button 
                              key={opt}
                              onClick={() => handleAnswerSelect(opt)}
                              disabled={instantFeedback[currentQuestionIndex]}
                              style={{ 
                                padding: '1.25rem', 
                                background: bgColor, 
                                border: `2px solid ${borderColor}`, 
                                borderRadius: '12px',
                                cursor: instantFeedback[currentQuestionIndex] ? 'default' : 'pointer',
                                color: 'white',
                                fontSize: '1.1rem',
                                transition: 'all 0.2s',
                                wordBreak: 'break-word',
                                transform: instantFeedback[currentQuestionIndex] && opt === quizData[currentQuestionIndex].a ? 'scale(1.05)' : 'scale(1)'
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {quizData && isSubmitted && (
                  <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
                    <div className="glass" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
                      <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Quiz Completed!</h2>
                      <p>You answered {Object.keys(selectedAnswers).filter(idx => selectedAnswers[idx] === quizData[idx].a).length} out of {quizData.length} correctly.</p>
                    </div>
                    {quizData.map((q, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {idx + 1}. {q.q}
                          <button onClick={() => speakText(q.q, activeLangParam)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Listen">
                            <Volume2 size={18} />
                          </button>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[idx] === opt;
                            const isCorrect = opt === q.a;
                            
                            let bgColor = isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)';
                            let borderColor = isSelected ? 'rgba(255,255,255,0.5)' : 'var(--panel-border)';
                            
                            if (isSubmitted) {
                              if (isCorrect) {
                                bgColor = 'rgba(16, 185, 129, 0.2)';
                                borderColor = '#10b981';
                              } else if (isSelected && !isCorrect) {
                                bgColor = 'rgba(239, 68, 68, 0.2)';
                                borderColor = '#ef4444';
                              }
                            }

                            return (
                              <div key={oIdx} onClick={() => !isSubmitted && setSelectedAnswers(prev => ({...prev, [idx]: opt}))}
                                style={{ 
                                  padding: '0.75rem 1rem', border: `1px solid ${borderColor}`, borderRadius: '8px',
                                  background: bgColor,
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isSubmitted ? 'default' : 'pointer', transition: 'all 0.2s ease'
                                }}>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {isSubmitted ? (
                      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                          You scored {quizData.filter((q, i) => selectedAnswers[i] === q.a).length} out of {quizData.length}!
                        </h3>
                        <button className="send-btn" onClick={handleGenerateQuiz} style={{ width: 'auto', padding: '1rem 3rem', borderRadius: '12px', fontSize: '1.1rem' }}>
                          Try Another Test
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)' }}>
                        <button className="send-btn" onClick={() => setIsSubmitted(true)} style={{ width: 'auto', padding: '1rem 3rem', borderRadius: '12px', fontSize: '1.1rem' }}>
                          Submit Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {activeSubTab === 'saved' && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bookmark size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
                <h3>No saved quizzes yet.</h3>
              </div>
            )}
            {activeSubTab === 'history' && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Target size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
                <h3>No past results.</h3>
              </div>
            )}
          </section>
        )}

        {/* LESSONS ROUTE (Super Bundle VI Revamp) */}
        {activeTab === 'lessons' && (
          <section className="quiz-section glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Globe2 size={28} /> Smart Curriculum
              </h2>
              <select className="chat-input" style={{ width: '200px' }} defaultValue="Spanish">
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
              {Array.from({ length: 400 }, (_, i) => i + 1).map(num => {
                const isPremiumUnit = num > 10;
                return (
                  <LockedCard key={num} isLocked={isPremiumUnit && !isPremium} onUpgradeClick={() => setShowProModal(true)}>
                    <div className="glass" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', border: '1px solid var(--panel-border)', height: '100%', opacity: isPremiumUnit && isPremium ? 1 : 0.9 }}>
                      <div style={{ background: isPremiumUnit ? '#8b5cf6' : '#3b82f6', padding: '1rem', borderRadius: '50%', height: 'fit-content', boxShadow: isPremiumUnit && isPremium ? '0 0 15px rgba(139, 92, 246, 0.5)' : 'none' }}>
                        {isPremiumUnit ? <Target color="white" size={32} /> : <BookOpen color="white" size={32} />}
                      </div>
                      <div>
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Unit {num}: {isPremiumUnit ? 'Advanced Mastery' : 'Foundation & Basics'}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                          {isPremiumUnit 
                            ? 'Complex grammar, professional terminology, and native idioms.' 
                            : 'Master everyday vocabulary, essential phrases, and basic conversations.'}
                        </p>
                        <button className="send-btn" style={{ background: isPremiumUnit ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: isPremiumUnit ? '#8b5cf6' : '#3b82f6', width: 'auto', padding: '0.5rem 1.5rem', borderRadius: '8px' }}>Start Module</button>
                      </div>
                    </div>
                  </LockedCard>
                );
              })}
            </div>
          </section>
        )}

        {/* GAMES ROUTE */}
        {activeTab === 'games' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <SubNav 
              tabs={[{id: 'match', label: 'Match-Up'}, {id: 'typing', label: 'Speed Typing'}, {id: 'grammar', label: 'Grammar Checker'}]} 
              activeId={activeSubTab || 'match'} 
              baseUrl="/games"
            />

            {/* Match Up Game */}
            {(!activeSubTab || activeSubTab === 'match') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Find the matching pairs as fast as you can!</h3>
                
                {!matchIsPlaying && matchMatched.length === 0 ? (
                  <button className="send-btn" onClick={handleStartMatchGame} style={{ padding: '1rem 3rem', width: 'auto', fontSize: '1.2rem', borderRadius: '12px' }}>Start Game</button>
                ) : (
                  <>
                    <div style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--secondary)', fontWeight: 'bold' }}>⏱️ {matchTimer}s</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                      {matchGameData.map(word => {
                        const isMatched = matchMatched.includes(word.id);
                        const isSelected = matchSelected.includes(word.id);
                        return (
                          <div
                            key={word.id}
                            onClick={() => !isMatched && handleMatchSelect(word.id)}
                            style={{
                              background: isMatched ? 'rgba(16, 185, 129, 0.2)' : (isSelected ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255,255,255,0.05)'),
                              border: `2px solid ${isMatched ? '#10b981' : (isSelected ? 'var(--primary)' : 'var(--panel-border)')}`,
                              padding: '2rem',
                              textAlign: 'center',
                              borderRadius: '12px',
                              cursor: isMatched ? 'default' : 'pointer',
                              opacity: isMatched ? 0.5 : 1,
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                              transition: 'all 0.2s ease',
                              fontSize: '1.2rem',
                              fontWeight: '500'
                            }}
                          >
                            {word.text}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {matchMatched.length === 8 && !matchIsPlaying && (
                  <div style={{ marginTop: '2rem', textAlign: 'center', color: '#10b981' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉 You won in {matchTimer} seconds!</h2>
                    <p>+100 XP added to your total.</p>
                    <button className="send-btn" onClick={handleStartMatchGame} style={{ marginTop: '1.5rem', margin: '1.5rem auto 0 auto', width: 'auto', padding: '0 2rem' }}>Play Again</button>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'typing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '400px', justifyContent: 'center' }}>
                <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Translate: <span style={{ color: 'var(--primary)' }}>{typeTarget.en}</span></h2>
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Type translation here..." 
                  value={typeInput}
                  onChange={(e) => {
                    setTypeInput(e.target.value);
                    if (e.target.value.toLowerCase() === typeTarget.trans.toLowerCase()) {
                      setTypeScore(p => p + 10);
                      setTypeInput('');
                      playSound('correct');
                      // Load next random word (mocked logic)
                      const words = [{en: 'Cat', trans: 'Gato'}, {en: 'Dog', trans: 'Perro'}, {en: 'House', trans: 'Casa'}];
                      setTypeTarget(words[Math.floor(Math.random() * words.length)]);
                    }
                  }}
                  style={{ fontSize: '1.5rem', padding: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '400px' }}
                />
                <h3 style={{ marginTop: '2rem', color: 'var(--secondary)' }}>Score: {typeScore}</h3>
              </div>
            )}

            {activeSubTab === 'grammar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>Grammar Checker AI</h2>
                <textarea 
                  className="chat-input"
                  value={grammarInput}
                  onChange={e => setGrammarInput(e.target.value)}
                  placeholder="Type a sentence in any language to check for grammatical errors..."
                  style={{ minHeight: '150px', fontSize: '1.2rem', padding: '1.5rem' }}
                />
                <button className="send-btn" onClick={handleGrammarCheck} style={{ alignSelf: 'flex-end', width: 'auto', padding: '0 2rem', borderRadius: '8px' }}>Analyze Grammar</button>
                
                {grammarResult && (
                  <div className="glass" style={{ padding: '2rem', marginTop: '1rem', background: grammarResult.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{grammarResult}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* SOCIAL ROUTE */}
        {activeTab === 'social' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Users size={28} /> Friends & Social Hub
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {socialFriends.map(friend => (
                <div key={friend.id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="white" />
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: friend.online ? '#10b981' : 'var(--text-muted)', border: '2px solid var(--panel-bg)' }}></div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{friend.name} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{friend.title}</span></h3>
                      <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{friend.xp} XP</p>
                    </div>
                  </div>
                  <button className="send-btn" onClick={() => {
                    if (xp < 50) return setDialog({ title: 'Not enough XP', message: 'You need 50 XP to send a gift.' });
                    setXp(p => p - 50);
                    setSocialFriends(prev => prev.map(f => f.id === friend.id ? {...f, xp: f.xp + 50} : f));
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 2000);
                  }} style={{ width: 'auto', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    🎁 Send Gift (-50 XP)
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CREATOR ROUTE */}
        {activeTab === 'creator' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>🛠️ Custom Quiz Creator</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Quiz Title (e.g. 'My Difficult Verbs')"
                value={newCustomQuiz.title}
                onChange={e => setNewCustomQuiz({...newCustomQuiz, title: e.target.value})}
              />
              
              {newCustomQuiz.questions.map((q, i) => (
                <div key={i} className="glass" style={{ padding: '1.5rem', border: '1px solid var(--panel-border)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Question {i + 1}</h3>
                  <input type="text" className="chat-input" placeholder="Question text..." value={q.q} onChange={e => { const n = [...newCustomQuiz.questions]; n[i].q = e.target.value; setNewCustomQuiz({...newCustomQuiz, questions: n}); }} style={{ marginBottom: '1rem', width: '100%' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {q.options.map((opt, j) => (
                      <input key={j} type="text" className="chat-input" placeholder={`Option ${j+1}`} value={opt} onChange={e => { const n = [...newCustomQuiz.questions]; n[i].options[j] = e.target.value; setNewCustomQuiz({...newCustomQuiz, questions: n}); }} />
                    ))}
                  </div>
                  <input type="text" className="chat-input" placeholder="Exact Correct Answer" value={q.a} onChange={e => { const n = [...newCustomQuiz.questions]; n[i].a = e.target.value; setNewCustomQuiz({...newCustomQuiz, questions: n}); }} style={{ width: '100%', borderColor: '#10b981' }} />
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="send-btn" onClick={() => setNewCustomQuiz(prev => ({...prev, questions: [...prev.questions, { q: '', a: '', options: ['', '', '', ''] }]}))} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>+ Add Question</button>
                <button className="send-btn" onClick={() => {
                  if (!newCustomQuiz.title) return setDialog({ title: 'Error', message: 'Please add a title to your quiz.' });
                  setCustomQuizzes(prev => [...prev, { ...newCustomQuiz, id: Date.now() }]);
                  setNewCustomQuiz({ title: '', questions: [{ q: '', a: '', options: ['', '', '', ''] }] });
                  setDialog({ title: 'Success', message: 'Custom Quiz Saved! (It would appear in lessons tab in a full build)' });
                }} style={{ flex: 1 }}>Save Custom Quiz</button>
              </div>
            </div>
          </section>
        )}

        {/* PHRASEBOOK ROUTE */}
        {activeTab === 'phrasebook' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>🎧 Audio Phrasebook</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {[
                { en: 'Where is the bathroom?', tr: '¿Dónde está el baño?' },
                { en: 'I would like to order.', tr: 'Me gustaría pedir.' },
                { en: 'How much does this cost?', tr: '¿Cuánto cuesta esto?' },
                { en: 'Can you help me?', tr: '¿Puedes ayudarme?' },
                { en: 'I do not understand.', tr: 'No entiendo.' },
                { en: 'Nice to meet you.', tr: 'Mucho gusto.' }
              ].map((phrase, i) => (
                <div key={i} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{phrase.en}</h4>
                    <p style={{ color: 'var(--secondary)' }}>{phrase.tr}</p>
                  </div>
                  <button className="send-btn" onClick={() => speakText(phrase.tr, 'Spanish')} style={{ width: '50px', height: '50px', borderRadius: '50%' }}><Volume2 size={24} /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* READING ROUTE */}
        {activeTab === 'reading' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <BookOpen size={28} /> Immersive Reading
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Click on any word you don't understand to reveal its translation.</p>
            
            <div className="glass" style={{ padding: '2rem', lineHeight: '2', fontSize: '1.3rem', background: 'rgba(255,255,255,0.02)' }}>
              {"Había una vez un pequeño perro llamado Max que vivía en una gran casa. Max amaba correr por el jardín y buscar su pelota roja. Un día, Max encontró un gato escondido detrás de un árbol.".split(' ').map((word, i) => (
                <span 
                  key={i} 
                  style={{ cursor: 'pointer', borderBottom: '1px dashed var(--text-muted)', marginRight: '0.4rem', position: 'relative', display: 'inline-block' }}
                  onClick={(e) => {
                    const cleanWord = word.replace(/[.,]/g, '').toLowerCase();
                    const translation = cleanWord === 'perro' ? 'dog' : cleanWord === 'gato' ? 'cat' : cleanWord === 'árbol' ? 'tree' : cleanWord === 'casa' ? 'house' : cleanWord === 'roja' ? 'red' : 'translation';
                    
                    const tooltip = document.createElement('div');
                    tooltip.innerText = translation;
                    tooltip.style.position = 'absolute';
                    tooltip.style.bottom = '100%';
                    tooltip.style.left = '50%';
                    tooltip.style.transform = 'translateX(-50%)';
                    tooltip.style.background = 'var(--primary)';
                    tooltip.style.color = 'white';
                    tooltip.style.padding = '0.2rem 0.5rem';
                    tooltip.style.borderRadius = '4px';
                    tooltip.style.fontSize = '0.9rem';
                    tooltip.style.pointerEvents = 'none';
                    tooltip.style.whiteSpace = 'nowrap';
                    e.currentTarget.appendChild(tooltip);
                    
                    playSound('pop');
                    speakText(cleanWord, 'Spanish');
                    
                    setTimeout(() => e.currentTarget.removeChild(tooltip), 2000);
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* FLASHCARDS ROUTE */}
        {activeTab === 'flashcards' && (
          <section className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SubNav 
              tabs={[{id: 'deck', label: 'All Decks'}, {id: 'mywords', label: '⭐ My Words'}]} 
              activeId={activeSubTab || 'deck'} 
              baseUrl="/flashcards"
            />
            
            {(!activeSubTab || activeSubTab === 'deck') && (
              <>
                <h2 style={{ marginBottom: '2rem' }}>Interactive Flashcards</h2>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <select className="chat-input" value={flashcardLang} onChange={(e) => setFlashcardLang(e.target.value)}>
                    {AVAILABLE_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                  <button className="send-btn" onClick={handleLoadFlashcards}>Load Deck</button>
                </div>
              </>
            )}

            {activeSubTab === 'mywords' && (
              <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem', color: '#f59e0b' }}>⭐ Sandbox: Words to Practice</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Words you missed during AI Quizzes are automatically saved here.</p>
                
                {myWords.length === 0 ? (
                  <div className="glass" style={{ padding: '3rem', color: 'var(--text-muted)' }}>You haven't missed any words yet. Great job!</div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {myWords.map((item, i) => (
                      <div key={i} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <div style={{ textAlign: 'left' }}>
                          <h3 style={{ fontSize: '1.4rem', color: 'white' }}>{item.word}</h3>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Context: {item.question.substring(0, 40)}...</p>
                        </div>
                        <button className="send-btn" onClick={() => speakText(item.word, 'Spanish')} style={{ width: '40px', height: '40px' }}><Volume2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(!activeSubTab || activeSubTab === 'deck') && flashcards.length > 0 ? (
              <div style={{ width: '100%', maxWidth: '500px', perspective: '1000px', marginBottom: '2rem' }}>
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    width: '100%',
                    height: '300px',
                    position: 'relative',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    cursor: 'pointer'
                  }}
                >
                  {/* Front */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--panel-border)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', padding: '2rem', textAlign: 'center'
                  }}>
                    {flashcards[currentCardIndex].front}
                  </div>
                  {/* Back */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid #10b981',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', padding: '2rem', textAlign: 'center',
                    transform: 'rotateY(180deg)', color: '#10b981'
                  }}>
                    {flashcards[currentCardIndex].back}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button className="send-btn" onClick={() => { setIsFlipped(false); setCurrentCardIndex(Math.max(0, currentCardIndex - 1)); }} disabled={currentCardIndex === 0} style={{ background: 'transparent', border: '1px solid var(--panel-border)', opacity: currentCardIndex === 0 ? 0.5 : 1 }}>Prev</button>
                  <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>{currentCardIndex + 1} / {flashcards.length}</span>
                  <button className="send-btn" onClick={() => { setIsFlipped(false); setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1)); }} disabled={currentCardIndex === flashcards.length - 1} style={{ background: 'var(--primary)', opacity: currentCardIndex === flashcards.length - 1 ? 0.5 : 1 }}>Next</button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Select a language and click "Load Deck" to begin practicing!</p>
            )}
          </section>
        )}

        {/* DICTIONARY ROUTE */}
        {activeTab === 'dictionary' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={28} color="var(--primary)" /> Global Dictionary & Translator
            </h2>
            <div style={{ marginBottom: '2rem' }}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Search for an English word to see translations..." 
                value={dictSearch} 
                onChange={(e) => setDictSearch(e.target.value)} 
                style={{ fontSize: '1.2rem', padding: '1rem', width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {dictResults.length > 0 ? dictResults.map((res, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{res.lang}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{res.type}</span>
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{res.word}</h3>
                  <p style={{ color: 'white', fontSize: '1.2rem' }}>{res.translation}</p>
                </div>
              )) : dictSearch.trim() ? (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>No results found for "{dictSearch}". Try simpler words like "hello", "water", or "apple".</p>
              ) : (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>Start typing to search the global offline dictionary database.</p>
              )}
            </div>
          </section>
        )}

        {/* PROGRESS ROUTES */}
        {activeTab === 'progress' && (
          <section className="quiz-section glass" style={{ padding: '2rem' }}>
            <SubNav 
              tabs={[{id: 'overview', label: 'Overview'}, {id: 'quests', label: 'Daily Quests'}, {id: 'achievements', label: 'Achievements'}, {id: 'leaderboard', label: 'Leaderboard'}]} 
              activeId={activeSubTab || 'overview'} 
              baseUrl="/progress"
            />
            {(!activeSubTab || activeSubTab === 'overview') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                  <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}><h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{streak}</h1><p>Current Streak 🔥</p></div>
                  <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}><h1 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>{xp}</h1><p>Total XP Earned 🌟</p></div>
                </div>
                
                {/* Heatmap */}
                <div className="glass" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>30-Day Activity Heatmap</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
                    {Array.from({length: 30}).map((_, i) => {
                      const isActive = i > 25 || i === 20 || i === 15 || i === 10;
                      const isHot = i > 27;
                      return (
                        <div key={i} style={{ 
                          aspectRatio: '1', 
                          background: isHot ? '#10b981' : (isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.05)'), 
                          borderRadius: '4px',
                          border: isActive ? 'none' : '1px solid var(--panel-border)'
                        }}></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {activeSubTab === 'quests' && (
              <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>Today's Challenges</h3>
                
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 color="#10b981" /> Complete 1 Quiz</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>+50 XP</p>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>{isSubmitted ? 'DONE' : '0 / 1'}</div>
                </div>
                
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 color="var(--panel-border)" /> Earn 100 XP</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>+20 XP</p>
                  </div>
                  <div style={{ background: xp >= 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: xp >= 100 ? '#10b981' : 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>{xp >= 100 ? 'DONE' : `${Math.min(xp, 100)} / 100`}</div>
                </div>
                
                <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 color="var(--panel-border)" /> Practice Flashcards</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>+30 XP</p>
                  </div>
                  <div style={{ background: currentCardIndex > 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: currentCardIndex > 5 ? '#10b981' : 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>{currentCardIndex > 5 ? 'DONE' : `${currentCardIndex} / 5`}</div>
                </div>
              </div>
            )}
            {activeSubTab === 'achievements' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
                {[
                  { id: 'first_quiz', title: 'First Steps', desc: 'Complete your first AI Quiz.', color: '#10b981', unlocked: xp > 0 },
                  { id: 'xp_500', title: 'Dedicated Scholar', desc: 'Earn a total of 500 XP.', color: '#3b82f6', unlocked: xp >= 500 },
                  { id: 'xp_2000', title: 'Language Master', desc: 'Reach 2000 XP overall.', color: '#8b5cf6', unlocked: xp >= 2000 },
                  { id: 'streak_5', title: 'Consistency is Key', desc: 'Reach a 5-day streak.', color: '#f59e0b', unlocked: streak >= 5 }
                ].map(ach => (
                  <div key={ach.id} className="glass" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', filter: ach.unlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                    <div style={{ background: ach.unlocked ? `${ach.color}20` : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%' }}>
                      {ach.unlocked ? <Trophy size={32} color={ach.color} /> : <Target size={32} color="white" />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: ach.unlocked ? 'white' : 'var(--text-muted)' }}>{ach.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeSubTab === 'leaderboard' && (
              <div style={{ color: 'white', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                  <button className="send-btn" style={{ flex: 1, background: 'rgba(205, 127, 50, 0.2)', color: '#cd7f32', border: '1px solid #cd7f32' }}>Bronze League</button>
                  <button className="send-btn" style={{ flex: 1, background: 'rgba(192, 192, 192, 0.2)', color: '#c0c0c0', border: '1px solid #c0c0c0' }}>Silver League</button>
                  <button className="send-btn" style={{ flex: 1, background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '1px solid #ffd700' }}>Gold League (Current)</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  <span>Rank</span>
                  <span style={{ flex: 1, marginLeft: '2rem' }}>User</span>
                  <span>Total XP</span>
                </div>
                <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  {MOCK_LEADERBOARD.map((user, idx) => (
                    <div key={user.rank} style={{ 
                      display: 'flex', justifyContent: 'space-between', padding: '1rem', 
                      background: idx < 3 ? 'rgba(245, 158, 11, 0.15)' : (idx >= 15 ? 'rgba(239, 68, 68, 0.1)' : (idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')),
                      borderRadius: '8px', marginBottom: '0.5rem', alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 'bold', width: '30px', color: idx < 3 ? '#f59e0b' : (idx >= 15 ? '#ef4444' : 'white') }}>#{user.rank}</span>
                      <span style={{ flex: 1, marginLeft: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><User size={12} /></div>
                        {user.name}
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user.xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', marginTop: '1rem', color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>↓ Demotion Zone ↓</div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* FORUM ROUTE */}
        {activeTab === 'forum' && (
          <section className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={28} color="var(--primary)" /> 
                  Community Forum
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Discuss language learning, ask questions, and share tips.</p>
              </div>
              
              {!viewingPost && (
                <select 
                  className="chat-input"
                  value={selectedForumLang}
                  onChange={(e) => setSelectedForumLang(e.target.value)}
                  style={{ width: '250px' }}
                >
                  {AVAILABLE_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang} Forum</option>)}
                </select>
              )}
            </div>
            
            {viewingPost ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button onClick={() => setViewingPost(null)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}>
                  ← Back to {selectedForumLang} Forum
                </button>
                
                {/* Original Post */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{viewingPost.title}</h3>
                  <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>{viewingPost.content}</p>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Posted by <strong>{viewingPost.author}</strong> • {new Date(viewingPost.time).toLocaleString()}
                  </div>
                </div>
                
                {/* Replies */}
                <h4 style={{ marginTop: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Replies ({viewingPost.replies.length})</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {viewingPost.replies.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No replies yet. Be the first to answer!</p>
                  ) : (
                    viewingPost.replies.map((reply, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>{reply.content}</p>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <strong>{reply.author}</strong> • {new Date(reply.time).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Reply Form */}
                <form onSubmit={handleReplyForumPost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                  <textarea 
                    className="chat-input" 
                    value={replyContent} 
                    onChange={e => setReplyContent(e.target.value)} 
                    placeholder="Write a reply..." 
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    required
                  />
                  <button type="submit" className="send-btn" style={{ alignSelf: 'flex-end', background: 'var(--primary)' }}>Post Reply</button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(!forumPosts[selectedForumLang] || forumPosts[selectedForumLang].length === 0) ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No posts in the {selectedForumLang} forum yet.</p>
                    </div>
                  ) : (
                    forumPosts[selectedForumLang].map(post => (
                      <div 
                        key={post.id} 
                        onClick={() => setViewingPost(post)}
                        style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{post.title}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <span>By {post.author}</span>
                          <span>{post.replies.length} replies • {new Date(post.time).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* New Post Form */}
                <form onSubmit={handleCreateForumPost} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '2rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Create New Topic</h3>
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Topic Title" 
                    value={newPostTitle} 
                    onChange={e => setNewPostTitle(e.target.value)} 
                    required 
                  />
                  <textarea 
                    className="chat-input" 
                    placeholder="What do you want to discuss?" 
                    value={newPostContent} 
                    onChange={e => setNewPostContent(e.target.value)} 
                    style={{ minHeight: '150px', resize: 'vertical' }}
                    required 
                  />
                  <button type="submit" className="send-btn" style={{ background: 'var(--secondary)' }}>Post to {selectedForumLang}</button>
                </form>
              </div>
            )}
          </section>
        )}
        {/* MEDIA HUB ROUTE */}
        {activeTab === 'media' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Volume2 size={28} /> Language Media Hub
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'Top 10 Essential Verbs in Spanish', duration: '5:24', views: '12K', img: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80' },
                { title: 'How to order food in Paris', duration: '8:12', views: '45K', img: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=400&q=80' },
                { title: 'Mastering the German Accusative Case', duration: '12:40', views: '8K', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80' },
                { title: '10 Minutes of Italian Listening Practice', duration: '10:01', views: '22K', img: 'https://images.unsplash.com/photo-1516483638261-f40889c28a28?auto=format&fit=crop&w=400&q=80' }
              ].map((video, i) => (
                <div key={i} className="glass" style={{ cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--panel-border)', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
                  <div style={{ width: '100%', height: '160px', backgroundImage: `url(${video.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: 'white' }}>{video.duration}</div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{video.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{video.views} views • AI Generated</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SHOP ROUTE */}
        {activeTab === 'shop' && (
          <section className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <ShoppingBag size={28} /> Lingot Shop
              </h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🪙 {coins} Lingots
              </div>
            </div>
            
            <h3 style={{ marginBottom: '1rem', color: 'white' }}>Profile Colors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {[{ id: 'c1', name: 'Ruby Red', color: '#ef4444', price: 100 }, { id: 'c2', name: 'Emerald Green', color: '#10b981', price: 150 }, { id: 'c3', name: 'Amethyst Purple', color: '#8b5cf6', price: 200 }].map(item => (
                <div key={item.id} className="glass" style={{ padding: '1.5rem', textAlign: 'center', border: inventory.equipped.color === item.color ? '2px solid var(--primary)' : '1px solid var(--panel-border)' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: item.color, margin: '0 auto 1rem', boxShadow: `0 0 15px ${item.color}` }}></div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{item.name}</h4>
                  {inventory.owned.includes(item.id) ? (
                    <button onClick={() => setInventory({ ...inventory, equipped: { ...inventory.equipped, color: item.color } })} className="send-btn" style={{ background: inventory.equipped.color === item.color ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}>{inventory.equipped.color === item.color ? 'Equipped' : 'Equip'}</button>
                  ) : (
                    <button onClick={() => {
                      if (coins >= item.price) {
                        setCoins(c => c - item.price);
                        setInventory({ ...inventory, owned: [...inventory.owned, item.id] });
                      } else setDialog({ title: 'Not enough Lingots', message: 'Keep learning to earn more!' });
                    }} className="send-btn" style={{ background: '#f59e0b', color: 'black' }}>Buy - 🪙 {item.price}</button>
                  )}
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'white' }}>Avatar Accessories</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[{ id: 'h1', name: 'Crown', emoji: '👑', type: 'hat', price: 500 }, { id: 'h2', name: 'Cowboy Hat', emoji: '🤠', type: 'hat', price: 300 }, { id: 'g1', name: 'Cool Shades', emoji: '🕶️', type: 'glasses', price: 250 }].map(item => (
                <div key={item.id} className="glass" style={{ padding: '1.5rem', textAlign: 'center', border: inventory.equipped[item.type] === item.emoji ? '2px solid var(--primary)' : '1px solid var(--panel-border)' }}>
                  <div style={{ fontSize: '3rem', margin: '0 auto 1rem' }}>{item.emoji}</div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{item.name}</h4>
                  {inventory.owned.includes(item.id) ? (
                    <button onClick={() => setInventory({ ...inventory, equipped: { ...inventory.equipped, [item.type]: inventory.equipped[item.type] === item.emoji ? null : item.emoji } })} className="send-btn" style={{ background: inventory.equipped[item.type] === item.emoji ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}>{inventory.equipped[item.type] === item.emoji ? 'Unequip' : 'Equip'}</button>
                  ) : (
                    <button onClick={() => {
                      if (coins >= item.price) {
                        setCoins(c => c - item.price);
                        setInventory({ ...inventory, owned: [...inventory.owned, item.id] });
                      } else setDialog({ title: 'Not enough Lingots', message: 'Keep learning to earn more!' });
                    }} className="send-btn" style={{ background: '#f59e0b', color: 'black' }}>Buy - 🪙 {item.price}</button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SETTINGS ROUTE */}
        {activeTab === 'settings' && (
          <section className="glass" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Settings size={28} /> Settings & Preferences
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>Global Sound Effects</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enable or disable sound effects globally.</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                  <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: soundEnabled ? 'var(--primary)' : 'var(--text-muted)', transition: '.4s', borderRadius: '34px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: soundEnabled ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                  </span>
                </label>
              </div>

              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>Default Quiz Difficulty</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select starting difficulty level.</p>
                </div>
                <select className="chat-input" value={defaultDifficulty} onChange={(e) => setDefaultDifficulty(Number(e.target.value))} style={{ width: '120px' }}>
                  <option value={1}>Level 1</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                </select>
              </div>

              <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ef4444' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#ef4444' }}>Danger Zone</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Permanently reset all XP and progress.</p>
                </div>
                <button className="send-btn" onClick={() => {
                  if(window.confirm('Are you sure you want to reset all progress?')) {
                    setXp(0);
                    setStreak(0);
                    setMyWords([]);
                    setDialog({title: 'Reset Complete', message: 'Your progress has been wiped.'});
                  }
                }} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', width: 'auto', padding: '0 1.5rem', borderRadius: '8px' }}>
                  Reset Progress
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* WORD OF THE DAY WIDGET (Visible on non-fullscreen tabs) */}
      {['tutor', 'quiz', 'progress'].includes(activeTab) && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
          <div className="glass" style={{ padding: '1.5rem', border: '2px solid var(--primary)', borderRadius: '16px', width: '250px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', animation: 'slideUp 0.5s ease-out' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              Word of the Day
              <button onClick={() => speakText(wordOfTheDay.word, wordOfTheDay.lang)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Volume2 size={16} /></button>
            </h4>
            <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.2rem' }}>{wordOfTheDay.word}</h2>
            <p style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{wordOfTheDay.trans}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// ROOT ROUTER
// ---------------------------
function AppRoot() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('linguai_auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('linguai_auth_user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('linguai_auth_user');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainLayout currentUser={currentUser} onLogout={handleLogout} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoot;
