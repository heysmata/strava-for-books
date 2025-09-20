import React, { useState, useEffect } from 'react';
import { Book, ReadingGoal } from './types';
import Header from './components/Header';
import BookList from './components/BookList';
import BookDetailView from './components/BookDetailView';
import AddBookModal from './components/AddBookModal';
import GoalModal from './components/GoalModal';

const App: React.FC = () => {
  // Lazy initialization for state from localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const savedBooks = localStorage.getItem('books');
      return savedBooks ? JSON.parse(savedBooks) : [];
    } catch (error) {
      console.error("Error reading books from localStorage", error);
      return [];
    }
  });

  const [readingGoal, setReadingGoal] = useState<ReadingGoal>(() => {
    try {
      const savedGoal = localStorage.getItem('readingGoal');
      return savedGoal ? JSON.parse(savedGoal) : { target: 24, year: new Date().getFullYear() };
    } catch (error) {
      console.error("Error reading goal from localStorage", error);
      return { target: 24, year: new Date().getFullYear() };
    }
  });

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('books', JSON.stringify(books));
    } catch (error) {
      console.error("Error saving books to localStorage", error);
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('readingGoal', JSON.stringify(readingGoal));
    } catch (error) {
      console.error("Error saving goal to localStorage", error);
    }
  }, [readingGoal]);

  const handleAddBook = (newBookData: Omit<Book, 'id' | 'currentPage' | 'status' | 'quotes'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `book-${Date.now()}`,
      currentPage: 0,
      status: 'to-read',
      quotes: [],
    };
    setBooks(prev => [newBook, ...prev]);
    setIsAddBookModalOpen(false);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
  };
  
  const handleDeleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    setSelectedBookId(null);
  };
  
  const handleUpdateGoal = (newTarget: number) => {
      setReadingGoal(prev => ({ ...prev, target: newTarget }));
      setIsGoalModalOpen(false);
  }

  const selectedBook = books.find(book => book.id === selectedBookId);
  const finishedBooks = books.filter(book => book.status === 'finished');

  return (
    <div className="bg-primary min-h-screen text-text-primary">
      <Header 
        onAddBookClick={() => setIsAddBookModalOpen(true)}
        onGoalClick={() => setIsGoalModalOpen(true)}
        goal={readingGoal}
        finishedBooksCount={finishedBooks.length}
      />
      <main className="container mx-auto p-4 md:p-8">
        {selectedBook ? (
          <BookDetailView
            book={selectedBook}
            onBack={() => setSelectedBookId(null)}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
          />
        ) : (
          <BookList books={books} onSelectBook={setSelectedBookId} />
        )}
      </main>
      
      {isAddBookModalOpen && (
        <AddBookModal 
          onClose={() => setIsAddBookModalOpen(false)} 
          onAddBook={handleAddBook} 
        />
      )}

      {isGoalModalOpen && (
        <GoalModal
            onClose={() => setIsGoalModalOpen(false)}
            onUpdateGoal={handleUpdateGoal}
            currentGoal={readingGoal}
        />
      )}
    </div>
  );
};

export default App;