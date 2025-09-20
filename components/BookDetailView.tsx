import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Book } from '../types';
import AiCompanion from './AiCompanion';
import BookReaderView from './BookReaderView';
import { useAdvancedTextToSpeech } from '../hooks/useTextToSpeech';
import { generateImageForText, generateImagePromptFromText } from '../services/geminiService';
import { ArrowLeftIcon, TrashIcon, BookTextIcon, XIcon, SpeakerIcon, PlayIcon, PauseIcon, StopIcon, SparklesIcon } from './Icons';

const CHARS_PER_PAGE = 1800;

// Utility to split text into pages without splitting words
const paginateText = (text: string, charsPerPage: number): string[] => {
    if (!text) return [];
    const pages = [];
    let currentPos = 0;
    while (currentPos < text.length) {
        let endPos = currentPos + charsPerPage;
        if (endPos >= text.length) {
            endPos = text.length;
        } else {
            // Find the last space before the cutoff to avoid splitting words
            const lastSpace = text.lastIndexOf(' ', endPos);
            if (lastSpace > currentPos) {
                endPos = lastSpace;
            }
        }
        pages.push(text.substring(currentPos, endPos).trim());
        currentPos = endPos;
    }
    return pages;
};


// Multimodal Reader Component defined within the same file
const MultimodalReader: React.FC<{ book: Book; onClose: () => void; onUpdateBook: (book: Book) => void }> = ({ book, onClose, onUpdateBook }) => {
    const [pages, setPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(() => {
      try {
        const savedPage = localStorage.getItem(`reader-page-${book.id}`);
        return savedPage ? parseInt(savedPage, 10) : 0;
      } catch {
        return 0;
      }
    });

    const [highlight, setHighlight] = useState({ start: 0, end: 0 });
    const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
    const [rate, setRate] = useState(1);
    
    const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
    const [playingParagraphIndex, setPlayingParagraphIndex] = useState<number | null>(null);

    // State for AI Illustrations
    const [aiIllustrationsEnabled, setAiIllustrationsEnabled] = useState(true);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageCache, setImageCache] = useState<Record<number, string>>({});

    const highlightedRef = useRef<HTMLSpanElement>(null);
    
    const currentParagraphs = useMemo(() => {
        return pages[currentPage]?.split('\n').filter(p => p.trim() !== '') || [];
    }, [pages, currentPage]);

    const onBoundary = useCallback((e: SpeechSynthesisEvent) => {
        if (e.name === 'word') {
            const charLength = (e as any).charLength;
            if (typeof e.charIndex === 'number' && typeof charLength === 'number' && charLength > 0) {
                setHighlight({ start: e.charIndex, end: e.charIndex + charLength });
            }
        } else if (e.charIndex === 0) { // Custom reset event
            setHighlight({ start: 0, end: 0 });
        }
    }, []);

    const { isSpeaking, voices, speak, pause, resume, cancel } = useAdvancedTextToSpeech({
        onBoundary,
        onEnd: () => {
            if (playbackState === 'playing') {
                const currentIndex = playingParagraphIndex ?? -1;
                const nextIndex = currentIndex + 1;
                if (nextIndex < currentParagraphs.length) {
                    setPlayingParagraphIndex(nextIndex);
                } else {
                    setPlaybackState('stopped');
                    setPlayingParagraphIndex(null);
                    setHighlight({ start: 0, end: 0 });
                }
            }
        }
    });
    
    useEffect(() => {
        const paginatedContent = paginateText(book.content || '', CHARS_PER_PAGE);
        setPages(paginatedContent);
    }, [book.content]);

    useEffect(() => {
        if (voices.length > 0 && !selectedVoice) {
            const defaultVoice = voices.find(v => v.default) || voices[0];
            if (defaultVoice) {
                setSelectedVoice(defaultVoice.voiceURI);
            }
        }
    }, [voices, selectedVoice]);

    useEffect(() => {
        if (highlightedRef.current) {
            highlightedRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }, [highlight]);

    useEffect(() => {
        if (playbackState === 'playing' && !isSpeaking && playingParagraphIndex !== null && currentParagraphs[playingParagraphIndex]) {
            speak(currentParagraphs[playingParagraphIndex], selectedVoice, rate);
        }
    }, [playbackState, isSpeaking, playingParagraphIndex, currentParagraphs, selectedVoice, rate, speak]);

    // Effect for generating images
    useEffect(() => {
        const generateImage = async () => {
            if (!aiIllustrationsEnabled || !pages[currentPage]) return;
            if (imageCache[currentPage]) return;

            setIsGeneratingImage(true);
            try {
                const pageText = pages[currentPage];
                const imagePrompt = await generateImagePromptFromText(pageText);
                const imageBase64 = await generateImageForText(imagePrompt);
                
                setImageCache(prevCache => ({ ...prevCache, [currentPage]: imageBase64 }));
            } catch (error) {
                console.error("Failed to generate page illustration:", error);
            } finally {
                setIsGeneratingImage(false);
            }
        };

        generateImage();
    }, [currentPage, pages, aiIllustrationsEnabled, imageCache]);

    const handlePlayPause = () => {
        if (playbackState === 'playing') {
            pause();
            setPlaybackState('paused');
        } else if (playbackState === 'paused') {
            resume();
            setPlaybackState('playing');
        } else { // is 'stopped'
            if (currentParagraphs.length > 0) {
                cancel();
                const startIndex = playingParagraphIndex ?? 0;
                setPlayingParagraphIndex(startIndex);
                setPlaybackState('playing');
            }
        }
    };

    const handleStop = () => {
        cancel();
        setPlaybackState('stopped');
        setPlayingParagraphIndex(null);
        setHighlight({ start: 0, end: 0 });
    };

    const handleParagraphClick = (index: number) => {
        cancel();
        setHighlight({ start: 0, end: 0 });
        setPlayingParagraphIndex(index);
        setPlaybackState('playing');
    };
    
    const changePage = (newPage: number) => {
        if (newPage >= 0 && newPage < pages.length) {
            handleStop();
            setCurrentPage(newPage);
            
            try {
                localStorage.setItem(`reader-page-${book.id}`, newPage.toString());
            } catch (e) {
                console.error("Failed to save reader page to localStorage", e);
            }

            const newBookPageProgress = Math.round(((newPage + 1) / pages.length) * book.totalPages);
            const newStatus = newBookPageProgress >= book.totalPages ? 'finished' : (newBookPageProgress > 0 ? 'reading' : 'to-read');
            onUpdateBook({ ...book, currentPage: newBookPageProgress, status: newStatus });
        }
    }

    return (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col animate-fade-in">
            <header className="bg-secondary border-b border-border-color p-4 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-text-primary truncate">{book.title}</h2>
                    <p className="text-text-secondary text-sm">{book.author}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-border-color">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Image Panel */}
                {aiIllustrationsEnabled && (
                    <aside className="w-full md:w-2/5 lg:w-1/3 h-64 md:h-auto bg-secondary overflow-hidden flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center relative">
                            {isGeneratingImage && (
                                <div className="w-full h-full bg-primary flex flex-col items-center justify-center space-y-3 text-text-secondary animate-fade-in">
                                    <BookTextIcon className="w-12 h-12 animate-pulse" />
                                    <p>Generating illustration...</p>
                                </div>
                            )}
                            {!isGeneratingImage && imageCache[currentPage] && (
                                <img 
                                    src={`data:image/jpeg;base64,${imageCache[currentPage]}`} 
                                    alt={`AI generated illustration for page ${currentPage + 1}`}
                                    className="w-full h-full object-cover animate-fade-in"
                                />
                            )}
                            {!isGeneratingImage && !imageCache[currentPage] && (
                                <div className="w-full h-full bg-primary flex flex-col items-center justify-center space-y-3 text-text-secondary">
                                    <SparklesIcon className="w-12 h-12" />
                                    <p>Illustration will appear here</p>
                                </div>
                            )}
                        </div>
                    </aside>
                )}

                {/* Text Panel */}
                <main className={`flex-1 overflow-y-auto p-8 md:p-12 text-lg leading-relaxed selection:bg-accent selection:text-white ${!aiIllustrationsEnabled ? 'mx-auto max-w-4xl' : ''}`}>
                    {currentParagraphs.map((p, index) => (
                        <p 
                            key={index}
                            onClick={() => handleParagraphClick(index)}
                            className={`mb-4 transition-colors duration-200 p-1 rounded cursor-pointer ${playingParagraphIndex === index && playbackState !== 'stopped' ? 'bg-secondary' : ''}`}
                        >
                            {playingParagraphIndex === index && playbackState !== 'stopped' ? (
                                <>
                                    {p.substring(0, highlight.start)}
                                    {highlight.end > highlight.start && <span ref={highlightedRef} className="bg-accent text-white rounded">{p.substring(highlight.start, highlight.end)}</span>}
                                    {p.substring(highlight.end)}
                                </>
                            ) : p }
                        </p>
                    ))}
                </main>
            </div>

            <footer className="bg-secondary border-t border-border-color p-4 flex flex-col lg:flex-row items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                        <SpeakerIcon className="w-5 h-5 text-text-secondary"/>
                        <select 
                            value={selectedVoice || ''}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="bg-primary border border-border-color rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-accent w-32"
                        >
                            {voices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                            ))}
                        </select>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary">Speed</span>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            className="w-24"
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-accent"/>
                        <span className="text-sm text-text-secondary">Illustrations</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={aiIllustrationsEnabled}
                                onChange={() => setAiIllustrationsEnabled(prev => !prev)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-border-color rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    disabled={currentParagraphs.length === 0}
                    className="p-3 rounded-full bg-border-color text-text-primary hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    aria-label={playbackState === 'playing' ? "Pause" : "Play"}
                  >
                    {playbackState === 'playing' ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={playbackState === 'stopped'}
                    className="p-3 rounded-full bg-border-color text-text-primary hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    aria-label="Stop"
                  >
                    <StopIcon className="w-5 h-5" />
                  </button>
                </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 0} className="px-4 py-2 text-sm rounded-md bg-border-color hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <span className="text-sm text-text-secondary font-mono">
                       Page {currentPage + 1} of {pages.length || 1}
                    </span>
                    <button onClick={() => changePage(currentPage + 1)} disabled={currentPage >= pages.length - 1} className="px-4 py-2 text-sm rounded-md bg-border-color hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </footer>
        </div>
    )
}


interface BookDetailViewProps {
  book: Book;
  onBack: () => void;
  onUpdateBook: (updatedBook: Book) => void;
  onDeleteBook: (id: string) => void;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book, onBack, onUpdateBook, onDeleteBook }) => {
  const [view, setView] = React.useState<'details' | 'reader'>('details');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  
  if (view === 'reader') {
      return <BookReaderView book={book} onUpdateBook={onUpdateBook} onBack={() => setView('details')} />
  }

  const progressPercentage = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
  
  const handleMarkAsFinished = () => {
      onUpdateBook({ ...book, currentPage: book.totalPages, status: 'finished' });
  }

  return (
    <>
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Panel - Book Details */}
        <div className="w-full md:w-1/3 bg-secondary border-r border-border-color p-8 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <button onClick={onBack} className="flex items-center text-sm text-accent hover:underline mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Library
            </button>
          </div>
          <img src={book.coverImage} alt={book.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg mb-6" />
          <h2 className="text-3xl font-bold text-text-primary">{book.title}</h2>
          <p className="text-lg text-text-secondary mb-4">{book.author}</p>
          
          <div className="my-4">
            <div className="flex justify-between text-sm text-text-secondary mb-1">
              <span>Progress</span>
              <span>{book.currentPage} / {book.totalPages} pages</span>
            </div>
            <div className="w-full bg-primary rounded-full h-2.5">
              <div className="bg-accent h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          
          <div className="space-y-4 my-4">
               {book.content && (
                  <button
                    onClick={() => setIsReaderOpen(true)}
                    className="w-full bg-accent text-white py-3 rounded-md font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookTextIcon className="w-5 h-5"/>
                    Read Book
                  </button>
               )}
               <button
                  onClick={() => setView('reader')}
                  className="w-full bg-border-color text-text-primary py-3 rounded-md font-semibold hover:bg-opacity-80 transition-colors"
              >
                  Update Progress
              </button>
              {book.status !== 'finished' && (
                  <button
                      onClick={handleMarkAsFinished}
                      className="w-full bg-highlight text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-colors"
                  >
                      Mark as Finished
                  </button>
              )}
          </div>
          
          <h3 className="text-lg font-semibold text-text-primary mt-6 mb-2 border-b border-border-color pb-2">Summary</h3>
          <p className="text-text-secondary text-sm leading-relaxed">{book.summary}</p>

           <div className="mt-auto pt-6">
            <button 
              onClick={() => {
                if(window.confirm(`Are you sure you want to delete "${book.title}"? This cannot be undone.`)){
                  onDeleteBook(book.id)
                }
              }}
              className="w-full flex items-center justify-center text-red-500 py-2 px-4 rounded-md hover:bg-red-500 hover:text-white transition-colors"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              Delete Book
            </button>
          </div>
        </div>
        
        {/* Right Panel - AI Companion */}
        <div className="w-2/3 hidden md:block">
          <AiCompanion book={book} />
        </div>
      </div>
      {isReaderOpen && <MultimodalReader book={book} onClose={() => setIsReaderOpen(false)} onUpdateBook={onUpdateBook} />}
    </>
  );
};

export default BookDetailView;
