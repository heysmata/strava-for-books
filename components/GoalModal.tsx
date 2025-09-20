import React, { useState } from 'react';
import { ReadingGoal } from '../types';
import { XIcon } from './Icons';

interface GoalModalProps {
  onClose: () => void;
  onUpdateGoal: (newTarget: number) => void;
  currentGoal: ReadingGoal;
}

const GoalModal: React.FC<GoalModalProps> = ({ onClose, onUpdateGoal, currentGoal }) => {
  const [target, setTarget] = useState(currentGoal.target.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(target, 10);
    if (!isNaN(targetNum) && targetNum > 0) {
      onUpdateGoal(targetNum);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-sm relative animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Set Your Reading Goal</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-text-secondary mb-2">How many books do you want to read this year?</label>
            <input 
              type="number" 
              id="goal" 
              value={target} 
              onChange={(e) => setTarget(e.target.value)} 
              required 
              min="1"
              className="w-full bg-primary border border-border-color rounded-md px-3 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-accent" 
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-accent text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-500 transition-colors duration-200">
              Set Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
