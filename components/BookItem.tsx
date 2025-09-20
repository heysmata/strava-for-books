
import React from 'react';
import { Book } from '../types';

interface BookItemProps {
  book: Book;
  onSelectBook: (id: string) => void;
}

const BookItem: React.FC<BookItemProps> = ({ book, onSelectBook }) => {
  const progressPercentage = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
  const isFinished = book.currentPage === book.totalPages;

  return (
    <div
      className="group cursor-pointer flex flex-col"
      onClick={() => onSelectBook(book.id)}
    >
      <div className="relative rounded-lg overflow-hidden shadow-lg transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300">
        <img src={book.coverImage} alt={book.title} className="w-full h-auto aspect-[2/3] object-cover" />
        {isFinished && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Finished</span>
            </div>
        )}
      </div>
      <div className="mt-3 text-left">
        <h3 className="text-md font-bold text-text-primary truncate">{book.title}</h3>
        <p className="text-sm text-text-secondary truncate">{book.author}</p>
        <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
          <div
            className={`h-1.5 rounded-full ${isFinished ? 'bg-highlight' : 'bg-accent'}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BookItem;
