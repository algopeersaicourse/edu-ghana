
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Atom, 
  Calculator, 
  MessageCircle, 
  Star, 
  User, 
  ChevronRight, 
  Volume2, 
  BrainCircuit,
  Lightbulb,
  Sparkles,
  Send,
  Loader2,
  FlaskConical,
  Beaker,
  Microscope
} from 'lucide-react';
import { Subject, UserProfile, ChatMessage, QuizQuestion } from './types';
import { 
  getGeminiExplanation, 
  generateEducationalImage, 
  generateQuiz, 
  textToSpeech 
} from './services/gemini';
import { decode, decodeAudioData } from './utils/audio';

// --- Sub-components ---

const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(10);
  const [grade, setGrade] = useState('Grade 5');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-yellow-500 w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to EduGemini!</h1>
          <p className="text-gray-600">Let's set up your learning profile</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What's your name?</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">How old are you?</label>
              <input 
                type="number" 
                min="7" 
                max="15"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Grade Level</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {[...Array(9)].map((_, i) => (
                  <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={() => name && onComplete({ name, age, grade })}
          disabled={!name}
          className="w-full mt-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Let's Start Learning!
        </button>
      </div>
    </div>
  );
};

const QuizCard: React.FC<{ quiz: QuizQuestion[], onFinish: () => void }> = ({ quiz, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCheck = (idx: number) => {
    setSelected(idx);
    const correct = idx === quiz[currentIdx].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      onFinish();
    }
  };

  const q = quiz[currentIdx];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-yellow-200">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Quiz: {currentIdx + 1} of {quiz.length}
        </span>
        <span className="text-sm font-bold text-gray-500">Score: {score}</span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-6">{q.question}</h3>
      
      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !showExplanation && handleCheck(i)}
            disabled={showExplanation}
            className={`w-full text-left p-4 rounded-xl border-2 transition transform active:scale-[0.98] ${
              selected === i 
                ? (isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500')
                : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50'
            } ${showExplanation && i === q.correctAnswer ? 'bg-green-50 border-green-500' : ''}`}
          >
            <div className="flex items-center">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                  selected === i 
                    ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                    : 'bg-gray-100 text-gray-500'
               } ${showExplanation && i === q.correctAnswer ? 'bg-green-500 text-white' : ''}`}>
                 {String.fromCharCode(65 + i)}
               </div>
               <span className="font-medium text-gray-700">{opt}</span>
            </div>
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className="animate-in slide-in-from-top duration-300">
          <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-bold mb-1">{isCorrect ? '🌟 Spot on!' : 'Oops! Not quite.'}</p>
            <p className="text-sm opacity-90">{q.explanation}</p>
          </div>
          <button 
            onClick={nextQuestion}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition"
          >
            {currentIdx === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

const GalaxyBackground: React.FC<{ onSelectSuggestion?: (s: string) => void, showContent?: boolean }> = ({ onSelectSuggestion, showContent = true }) => {
  const numbers = [7, 42, 101, 3.14, 8, 99, 0, 12];
  const stars = Array.from({ length: 100 });

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden flex flex-col items-center justify-center text-white z-0">
      {/* Stars */}
      {stars.map((_, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: (Math.random() * 2 + 1) + 'px',
            height: (Math.random() * 2 + 1) + 'px',
            top: (Math.random() * 100) + '%',
            left: (Math.random() * 100) + '%',
            opacity: Math.random() * 0.7 + 0.3,
            animationDuration: (Math.random() * 3 + 2) + 's',
            animationDelay: (Math.random() * 5) + 's'
          }}
        />
      ))}

      {/* Floating Numbers */}
      {numbers.map((num, i) => (
        <div 
          key={i}
          className="absolute text-blue-400/10 font-mono text-6xl select-none pointer-events-none animate-float"
          style={{
            top: (Math.random() * 80 + 10) + '%',
            left: (Math.random() * 80 + 10) + '%',
            transform: `rotate(${Math.random() * 40 - 20}deg)`,
            animationDelay: (Math.random() * 5) + 's',
            animationDuration: (Math.random() * 10 + 10) + 's'
          }}
        >
          {num}
        </div>
      ))}

      {/* Nebula Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />

      {showContent && (
        <div className="relative z-10 text-center space-y-8 max-w-lg animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-14 h-14 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-sm">
              Reach for the stars!
            </h2>
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-blue-200/90 italic text-lg">
                "Reach for the stars" means to aim high and try to achieve something great.
              </p>
            </div>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed">
            Welcome to your personal learning galaxy. Ask me anything about the universe, life, or just say hello!
          </p>

          {onSelectSuggestion && (
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {['Tell me a space fact', 'What is a black hole?', 'How far is the moon?'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-blue-300 hover:bg-white/10 hover:border-blue-400/50 transition-all active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const MathBackground: React.FC<{ onSelectSuggestion?: (s: string) => void, showContent?: boolean }> = ({ onSelectSuggestion, showContent = true }) => {
  const mathSymbols = ['Σ', 'π', '∞', '√', '∫', '∆', '≈', '≠', '±', '÷', '×'];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 1000];
  const elements = [...mathSymbols, ...numbers];
  const floatingElements = Array.from({ length: 80 });

  return (
    <div className="fixed inset-0 bg-[#001a33] overflow-hidden flex flex-col items-center justify-center text-white z-0">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Floating Math Elements */}
      {floatingElements.map((_, i) => {
        const char = elements[Math.floor(Math.random() * elements.length)];
        return (
          <div 
            key={i}
            className="absolute text-blue-300/10 font-mono text-4xl select-none pointer-events-none animate-float"
            style={{
              top: (Math.random() * 100) + '%',
              left: (Math.random() * 100) + '%',
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: (Math.random() * 10) + 's',
              animationDuration: (Math.random() * 15 + 10) + 's',
              fontSize: (Math.random() * 2 + 1) + 'rem'
            }}
          >
            {char}
          </div>
        );
      })}

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,204,0.1),transparent_80%)] pointer-events-none" />

      {showContent && (
        <div className="relative z-10 text-center space-y-8 max-w-lg animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
            <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_50px_rgba(0,102,204,0.3)]">
              <Calculator className="w-14 h-14 text-green-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-white to-blue-300 drop-shadow-sm">
              Math is a language!
            </h2>
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-green-200/90 italic text-lg">
                "Math is the language in which God has written the universe." - Galileo
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">
            Welcome to the Math Adventure! From simple addition to the mysteries of algebra, let's solve it together.
          </p>

          {onSelectSuggestion && (
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {['What are fractions?', 'How do I multiply?', 'Tell me a math joke'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-green-300 hover:bg-white/10 hover:border-green-400/50 transition-all active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ScienceBackground: React.FC<{ onSelectSuggestion?: (s: string) => void, showContent?: boolean }> = ({ onSelectSuggestion, showContent = true }) => {
  const scienceElements = [
    { icon: <FlaskConical className="w-12 h-12" />, color: 'text-emerald-400' },
    { icon: <Beaker className="w-10 h-10" />, color: 'text-blue-400' },
    { icon: <Atom className="w-14 h-14" />, color: 'text-purple-400' },
    { icon: <Microscope className="w-12 h-12" />, color: 'text-indigo-400' },
  ];
  const floatingElements = Array.from({ length: 15 });
  const stars = Array.from({ length: 50 });

  return (
    <div className="fixed inset-0 bg-[#0a0a1a] overflow-hidden flex flex-col items-center justify-center text-white z-0">
      {/* Universe Background */}
      {stars.map((_, i) => (
        <div 
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: (Math.random() * 2 + 1) + 'px',
            height: (Math.random() * 2 + 1) + 'px',
            top: (Math.random() * 100) + '%',
            left: (Math.random() * 100) + '%',
            opacity: Math.random() * 0.5 + 0.2,
            animationDuration: (Math.random() * 4 + 2) + 's'
          }}
        />
      ))}

      {/* Nebula Swirls */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.05),transparent_50%)]" />

      {/* Floating Science Elements */}
      {floatingElements.map((_, i) => {
        const element = scienceElements[i % scienceElements.length];
        return (
          <div 
            key={i}
            className={`absolute ${element.color} opacity-20 select-none pointer-events-none animate-float`}
            style={{
              top: (Math.random() * 100) + '%',
              left: (Math.random() * 100) + '%',
              animationDelay: (Math.random() * 10) + 's',
              animationDuration: (Math.random() * 15 + 10) + 's',
            }}
          >
            {element.icon}
          </div>
        );
      })}

      {/* Abstract Digestive System Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-pink-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-24 border-4 border-orange-500/10 rounded-full blur-xl animate-pulse" style={{ transform: 'rotate(30deg)' }} />

      {showContent && (
        <div className="relative z-10 text-center space-y-8 max-w-lg animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <Atom className="w-14 h-14 text-emerald-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-purple-300 drop-shadow-sm">
              The Lab is Open!
            </h2>
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-emerald-200/90 italic text-lg">
                "Science is a way of thinking much more than it is a body of knowledge." - Carl Sagan
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">
            Welcome to the Science Lab! From chemical reactions to the wonders of biology, let's discover the world together.
          </p>

          {onSelectSuggestion && (
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {['How does digestion work?', 'What is an atom?', 'Mixing chemicals safely'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-emerald-300 hover:bg-white/10 hover:border-emerald-400/50 transition-all active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EnglishBackground: React.FC<{ onSelectSuggestion?: (s: string) => void, showContent?: boolean }> = ({ onSelectSuggestion, showContent = true }) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const floatingElements = Array.from({ length: 40 });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-red-900 to-green-950 overflow-hidden flex flex-col items-center justify-center text-white z-0">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />
      
      {/* Floating Letters */}
      {floatingElements.map((_, i) => {
        const char = letters[Math.floor(Math.random() * letters.length)];
        return (
          <div 
            key={i}
            className="absolute text-white/5 font-serif select-none pointer-events-none animate-float"
            style={{
              top: (Math.random() * 100) + '%',
              left: (Math.random() * 100) + '%',
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: (Math.random() * 10) + 's',
              animationDuration: (Math.random() * 15 + 10) + 's',
              fontSize: (Math.random() * 3 + 1) + 'rem'
            }}
          >
            {char}
          </div>
        );
      })}

      {/* Book Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      {showContent && (
        <div className="relative z-10 text-center space-y-8 max-w-lg animate-in fade-in zoom-in duration-1000">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
            <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <BookOpen className="w-14 h-14 text-red-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-white to-red-300 drop-shadow-sm font-serif">
              Once upon a time...
            </h2>
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-green-200/90 italic text-lg font-serif">
                "A piece of cake!" (Something very easy to do)
              </p>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed font-serif">
            Welcome to the English Story! Let's explore the magic of words, stories, and expressions together.
          </p>

          {onSelectSuggestion && (
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {['Tell me a story', 'What is an idiom?', 'Help me write a poem'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-red-300 hover:bg-white/10 hover:border-red-400/50 transition-all active:scale-95 font-serif"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject>('General');
  const [messagesBySubject, setMessagesBySubject] = useState<Record<Subject, ChatMessage[]>>({
    General: [],
    Math: [],
    Science: [],
    English: [],
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuizBySubject, setActiveQuizBySubject] = useState<Record<Subject, QuizQuestion[] | null>>({
    General: null,
    Math: null,
    Science: null,
    English: null,
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = messagesBySubject[activeSubject];
  const activeQuiz = activeQuizBySubject[activeSubject];

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !profile || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessagesBySubject(prev => ({
      ...prev,
      [activeSubject]: [...prev[activeSubject], userMessage]
    }));
    setInput('');
    setIsLoading(true);

    try {
      const explanation = await getGeminiExplanation(input, profile, activeSubject);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: explanation || "I'm having a little trouble thinking right now. Let's try again!",
      };

      setMessagesBySubject(prev => ({
        ...prev,
        [activeSubject]: [...prev[activeSubject], assistantMessage]
      }));

      // Automatically generate a visual aid for complex topics or if requested
      if (input.length > 10 || explanation?.length > 500) {
        const imageUrl = await generateEducationalImage(input);
        if (imageUrl) {
          setMessagesBySubject(prev => ({
            ...prev,
            [activeSubject]: prev[activeSubject].map(m => m.id === assistantMessage.id ? { ...m, imageUrl } : m)
          }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (topic: string) => {
    if (!profile || isLoading) return;
    setIsLoading(true);
    try {
      const quiz = await generateQuiz(topic, profile);
      setActiveQuizBySubject(prev => ({
        ...prev,
        [activeSubject]: quiz
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    try {
      const audioBase64 = await textToSpeech(text.substring(0, 500)); // Limit length for speed
      if (audioBase64) {
        const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
        source.start(startTime);
        nextStartTimeRef.current = startTime + buffer.duration;
      }
    } catch (err) {
      console.error("TTS failed", err);
    }
  };

  const isGeneral = activeSubject === 'General';
  const isMath = activeSubject === 'Math';
  const isScience = activeSubject === 'Science';
  const isEnglish = activeSubject === 'English';
  const isThemed = isGeneral || isMath || isScience || isEnglish;

  if (!profile) {
    return <Onboarding onComplete={setProfile} />;
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-700 ${isGeneral ? 'bg-[#050505] text-white' : isMath ? 'bg-[#001a33] text-white' : isScience ? 'bg-[#0a0a1a] text-white' : isEnglish ? 'bg-[#1a2e1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {isGeneral && <GalaxyBackground showContent={messages.length === 0 && !activeQuiz} onSelectSuggestion={setInput} />}
      {isMath && <MathBackground showContent={messages.length === 0 && !activeQuiz} onSelectSuggestion={setInput} />}
      {isScience && <ScienceBackground showContent={messages.length === 0 && !activeQuiz} onSelectSuggestion={setInput} />}
      {isEnglish && <EnglishBackground showContent={messages.length === 0 && !activeQuiz} onSelectSuggestion={setInput} />}
      
      {/* Header */}
      <header className={`px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-all duration-500 ${isThemed ? 'bg-black/40 backdrop-blur-md border-b border-white/10' : 'bg-white border-b border-gray-200 shadow-sm'}`}>
        <div className="flex items-center space-x-3">
          <div className={`${isThemed ? 'bg-blue-500' : 'bg-blue-600'} p-2 rounded-xl shadow-lg`}>
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isThemed ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'}`}>EduGemini</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`hidden md:flex items-center px-3 py-1 rounded-full text-sm font-bold border transition-colors ${isThemed ? 'bg-white/10 text-blue-200 border-white/20' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
            <Star className={`w-4 h-4 mr-1 ${isThemed ? 'fill-blue-400 text-blue-400' : 'fill-yellow-500 text-yellow-500'}`} />
            Hello, {profile.name}!
          </div>
          <button className={`p-2 rounded-full transition-colors ${isThemed ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
            <User className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Sidebar / Subject Selection */}
        <aside className={`w-full md:w-64 p-4 space-y-2 flex-shrink-0 transition-all duration-500 ${isThemed ? 'bg-black/20 backdrop-blur-sm border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-widest px-2 mb-4 ${isThemed ? 'text-gray-500' : 'text-gray-400'}`}>Pick a Subject</p>
          <button 
            onClick={() => setActiveSubject('General')}
            className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 ${activeSubject === 'General' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : isThemed ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            <span className="font-bold">General Chat</span>
          </button>
          <button 
            onClick={() => setActiveSubject('Math')}
            className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 ${activeSubject === 'Math' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : isThemed ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <Calculator className="w-5 h-5 mr-3" />
            <span className="font-bold">Math Adventure</span>
          </button>
          <button 
            onClick={() => setActiveSubject('Science')}
            className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 ${activeSubject === 'Science' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : isThemed ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <Atom className="w-5 h-5 mr-3" />
            <span className="font-bold">Science Lab</span>
          </button>
          <button 
            onClick={() => setActiveSubject('English')}
            className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 ${activeSubject === 'English' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : isThemed ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            <span className="font-bold">English Story</span>
          </button>
          
          <div className={`mt-8 p-4 rounded-2xl border transition-all duration-500 ${isThemed ? 'bg-white/5 border-white/10 text-blue-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
             <div className="flex items-center mb-2">
                <Lightbulb className="w-4 h-4 mr-2" />
                <span className="text-sm font-bold">Pro Tip</span>
             </div>
             <p className={`text-xs leading-relaxed ${isThemed ? 'text-gray-400' : 'text-indigo-600'}`}>
               Ask me to "Explain like I'm 5" or "Show me a picture" for extra fun!
             </p>
          </div>
        </aside>

        {/* Chat / Content Area */}
        <section className={`flex-1 flex flex-col min-h-0 relative transition-all duration-500 ${isThemed ? 'bg-transparent' : 'bg-gray-50'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.length === 0 && !activeQuiz && !isThemed && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  {activeSubject === 'Math' ? <Calculator className="w-16 h-16 text-green-500" /> :
                    activeSubject === 'Science' ? <Atom className="w-16 h-16 text-purple-500" /> :
                    activeSubject === 'English' ? <BookOpen className="w-16 h-16 text-orange-500" /> :
                    <Sparkles className="w-16 h-16 text-blue-500" />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Let's explore {activeSubject}!</h2>
                  <p className="text-lg text-gray-600">What do you want to learn about today? I can explain gravity, fractions, or even how to write a poem!</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Why is the sky blue?', 'How do decimals work?', 'What is a metaphor?', 'Teach me about photosynthesis'].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeQuiz && (
              <div className="max-w-3xl mx-auto py-12">
                <QuizCard quiz={activeQuiz} onFinish={() => setActiveQuizBySubject(prev => ({ ...prev, [activeSubject]: null }))} />
              </div>
            )}

            {!activeQuiz && messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-blue-600 ml-3' : isThemed ? 'bg-white/10 border border-white/10 mr-3' : 'bg-white border border-gray-200 mr-3'}`}>
                    {msg.role === 'user' ? <User className="text-white w-6 h-6" /> : <BrainCircuit className={`${isThemed ? 'text-blue-400' : 'text-blue-600'} w-6 h-6`} />}
                  </div>
                  <div className={`rounded-3xl p-4 shadow-sm relative ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : isThemed ? 'bg-white/10 backdrop-blur-md border border-white/10 rounded-tl-none text-white' : 'bg-white border border-gray-200 rounded-tl-none text-gray-800'}`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
                       {msg.content}
                    </div>
                    {msg.imageUrl && (
                      <div className={`mt-4 rounded-2xl overflow-hidden border shadow-lg ${isThemed ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <img src={msg.imageUrl} alt="AI Generated Aid" className="w-full h-auto object-cover max-h-96" />
                        <div className={`p-3 text-xs font-bold uppercase ${isThemed ? 'bg-black/20 text-gray-400' : 'bg-white text-gray-400'}`}>Visual Learning Aid</div>
                      </div>
                    )}
                    {msg.role === 'assistant' && (
                      <div className={`flex items-center space-x-2 mt-4 pt-4 border-t ${isThemed ? 'border-white/10' : 'border-gray-100'}`}>
                        <button 
                          onClick={() => playTTS(msg.content)}
                          className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full transition ${isThemed ? 'text-blue-400 hover:bg-white/5' : 'text-blue-600 hover:bg-blue-50'}`}
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Read Aloud</span>
                        </button>
                        <button 
                          onClick={() => startQuiz(msg.content.substring(0, 50))}
                          className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full transition ${isThemed ? 'text-purple-400 hover:bg-white/5' : 'text-purple-600 hover:bg-purple-50'}`}
                        >
                          <Star className="w-4 h-4" />
                          <span>Quick Quiz</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="flex flex-row items-center">
                  <div className={`w-10 h-10 rounded-2xl mr-3 flex items-center justify-center ${isThemed ? 'bg-white/10 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <Loader2 className={`w-5 h-5 animate-spin ${isThemed ? 'text-blue-400' : 'text-blue-500'}`} />
                  </div>
                  <div className={`rounded-3xl px-4 py-2 text-sm font-bold ${isThemed ? 'bg-white/10 text-gray-400' : 'bg-white border border-gray-200 text-gray-400'}`}>
                    Gemini is thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          {!activeQuiz && (
            <div className={`p-4 transition-all duration-500 ${isThemed ? 'bg-black/40 backdrop-blur-md border-t border-white/10' : 'bg-white border-t border-gray-200'}`}>
              <form 
                onSubmit={handleSendMessage}
                className="max-w-4xl mx-auto flex items-center space-x-2"
              >
                <div className="flex-1 relative group">
                  <input 
                    type="text" 
                    placeholder={`Ask your ${activeSubject} question...`}
                    className={`w-full pl-6 pr-12 py-4 rounded-2xl focus:ring-2 outline-none transition shadow-inner ${isThemed ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50 focus:bg-white/10' : 'bg-gray-50 border-gray-200 focus:ring-blue-500 focus:bg-white'}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <button 
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={`p-2 rounded-xl transition transform active:scale-95 disabled:opacity-50 shadow-md ${isThemed ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </form>
              <p className={`text-center text-[10px] mt-2 ${isThemed ? 'text-gray-600' : 'text-gray-400'}`}>
                EduGemini makes learning fun. Always double-check facts with your teachers!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
