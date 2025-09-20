import React, { useState } from 'react';
import { Book } from '../types';
import { ArrowLeftIcon } from './Icons';

interface BookReaderViewProps {
  book: Book;
  onBack: () => void;
  onUpdateBook: (updatedBook: Book) => void;
}

const BookReaderView: React.FC<BookReaderViewProps> = ({ book, onBack, onUpdateBook }) => {
  const [currentPage, setCurrentPage] = useState(book.currentPage);

  const handleUpdateProgress = () => {
    let newStatus = book.status;
    if (currentPage > 0 && currentPage < book.totalPages) {
        newStatus = 'reading';
    } else if (currentPage === book.totalPages) {
        newStatus = 'finished';
    } else if (currentPage === 0) {
        newStatus = 'to-read';
    }
    onUpdateBook({ ...book, currentPage, status: newStatus });
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-primary z-30 flex flex-col animate-fade-in">
        <header className="bg-secondary border-b border-border-color">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <button onClick={onBack} className="flex items-center text-sm text-accent hover:underline">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Back to Details
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-text-primary truncate">{book.title}</h2>
                    <p className="text-text-secondary text-sm">{book.author}</p>
                </div>
                <div className="w-28"></div> {/* Spacer */}
            </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-lg text-center">
                <h3 className="text-2xl font-semibold text-text-primary mb-2">Update Your Progress</h3>
                <p className="text-text-secondary mb-8">What page are you on now?</p>

                <div className="relative mb-6">
                    <input
                        type="range"
                        min="0"
                        max={book.totalPages}
                        value={currentPage}
                        onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                     <div className="flex justify-between text-xs text-text-secondary px-1">
                        <span>0</span>
                        <span>{book.totalPages}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-10">
                    <p className="text-text-secondary">Page</p>
                    <input
                        type="number"
                        min="0"
                        max={book.totalPages}
                        value={currentPage}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (val >= 0 && val <= book.totalPages) {
                                setCurrentPage(val);
                            } else if (e.target.value === '') {
                                setCurrentPage(0);
                            }
                        }}
                        className="w-28 bg-primary border border-border-color text-text-primary text-2xl font-bold text-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                
                <button
                    onClick={handleUpdateProgress}
                    className="bg-accent text-white font-bold py-3 px-10 rounded-full hover:bg-blue-500 transition-colors text-lg"
                >
                    Save Progress
                </button>
            </div>
        </main>
    </div>
  );
};

export default BookReaderView;
