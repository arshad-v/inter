import React, { useState, useCallback, useEffect } from 'react';
import { AppPhase, InterviewEntry } from './types';
import { APP_TITLE, DEFAULT_NUM_QUESTIONS, NUM_QUESTIONS_OPTIONS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { InterviewScreen } from './components/InterviewScreen';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { generateQuestions, generateFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>(AppPhase.JOB_INPUT);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [interviewEntries, setInterviewEntries] = useState<InterviewEntry[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedNumQuestions, setSelectedNumQuestions] = useState<number>(DEFAULT_NUM_QUESTIONS);

  const resetToJobInput = useCallback(() => {
    setAppPhase(AppPhase.JOB_INPUT);
    setJobDescription('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setInterviewEntries([]);
    setFeedback('');
    setError(null);
    setSelectedNumQuestions(DEFAULT_NUM_QUESTIONS);
  }, []);

  const handleStartInterview = useCallback(async (jd: string, numQs: number) => {
    setJobDescription(jd);
    setSelectedNumQuestions(numQs);
    setAppPhase(AppPhase.GENERATING_QUESTIONS);
    setError(null);
    try {
      const generatedQuestions = await generateQuestions(jd, numQs);
      setQuestions(generatedQuestions);
      setInterviewEntries([]);
      setCurrentQuestionIndex(0);
      setAppPhase(AppPhase.INTERVIEWING);
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(err instanceof Error ? err.message : "Failed to generate interview questions. Please check your API key and try again.");
      setAppPhase(AppPhase.ERROR);
    }
  }, []);

  const handleAnswerSubmit = useCallback(async (answer: string, videoDataUrl?: string) => {
    const newEntry: InterviewEntry = { 
      question: questions[currentQuestionIndex], 
      answer,
      videoDataUrl 
    };
    const updatedEntries = [...interviewEntries, newEntry];
    setInterviewEntries(updatedEntries);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setAppPhase(AppPhase.GENERATING_FEEDBACK);
      setError(null);
      try {
        const generatedFeedback = await generateFeedback(jobDescription, updatedEntries);
        setFeedback(generatedFeedback);
        setAppPhase(AppPhase.FEEDBACK_READY);
      } catch (err) {
        console.error("Error generating feedback:", err);
        setError(err instanceof Error ? err.message : "Failed to generate feedback. Please try again.");
        setAppPhase(AppPhase.ERROR);
      }
    }
  }, [questions, currentQuestionIndex, interviewEntries, jobDescription]);
  
  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("API_KEY environment variable is not set. This application requires a valid Gemini API key to function.");
      setAppPhase(AppPhase.ERROR);
    }
  }, []);

  const renderContent = () => {
    switch (appPhase) {
      case AppPhase.JOB_INPUT:
        return (
          <JobDescriptionInput
            onStartInterview={handleStartInterview}
            selectedNumQuestions={selectedNumQuestions}
            onNumQuestionsChange={setSelectedNumQuestions}
            numQuestionsOptions={NUM_QUESTIONS_OPTIONS}
          />
        );
      case AppPhase.GENERATING_QUESTIONS:
        return <LoadingSpinner message={`Generating ${selectedNumQuestions} interview questions...`} />;
      case AppPhase.INTERVIEWING:
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
          return (
            <InterviewScreen
              question={questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              onSubmitAnswer={handleAnswerSubmit}
            />
          );
        }
        setError("An issue occurred during the interview phase. Please restart.");
        setAppPhase(AppPhase.ERROR);
        return null;
      case AppPhase.GENERATING_FEEDBACK:
        return <LoadingSpinner message="Analyzing your answers and video, then generating feedback..." />;
      case AppPhase.FEEDBACK_READY:
        return <FeedbackDisplay feedback={feedback} onStartNewInterview={resetToJobInput} />;
      case AppPhase.ERROR:
        return <ErrorDisplay message={error || "An unknown error occurred."} onTryAgain={resetToJobInput} />;
      default:
        return <p>Welcome! Setting things up...</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-sky-400/5 to-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <Header title={APP_TITLE} />
      
      <main className="container mx-auto flex-grow flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12 relative z-10">
        <div className="w-full transform transition-all duration-700 ease-out">
          {renderContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;