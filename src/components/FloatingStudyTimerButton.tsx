import { useState } from 'react';
import { Clock } from 'lucide-react';
import StudyTimer from './StudyTimer';

const FloatingStudyTimerButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        aria-label="Open Study Timer"
      >
        <Clock className="h-6 w-6" />
      </button>

      {/* Study Timer Modal */}
      <StudyTimer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FloatingStudyTimerButton;
