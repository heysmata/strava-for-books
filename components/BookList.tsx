
import React from 'react';
import { Book } from '../types';
import BookItem from './BookItem';

interface BookListProps {
  books: Book[];
  onSelectBook: (id: string) => void;
}

const BookList: React.FC<BookListProps> = ({ books, onSelectBook }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {books.map(book => (
        <BookItem key={book.id} book={book} onSelectBook={onSelectBook} />
      ))}
    </div>
  );
};

export default BookList;
