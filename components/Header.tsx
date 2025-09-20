import React from 'react';
import { BookOpenIcon, PlusIcon, CogIcon } from './Icons';
import { ReadingGoal } from '../types';

interface HeaderProps {
  onAddBookClick: () => void;
  onGoalClick: () => void;
  goal: ReadingGoal;
  finishedBooksCount: number;
}

const Header: React.FC<HeaderProps> = ({ onAddBookClick, onGoalClick, goal, finishedBooksCount }) => {
  return (
    <header className="bg-secondary border-b border-border-color sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpenIcon className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">BookWyrm AI</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-text-secondary">Yearly Goal</div>
            <div className="font-bold text-text-primary text-lg">{finishedBooksCount} / {goal.target}</div>
          </div>
          <button
            onClick={onGoalClick}
            className="p-2 rounded-full hover:bg-border-color transition-colors"
            aria-label="Set reading goal"
          >
            <CogIcon className="w-6 h-6 text-text-secondary" />
          </button>
          <button
            onClick={onAddBookClick}
            className="bg-highlight text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-green-600 transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Book</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
