'use client';

import React from 'react';
import { Modal } from './Modal';

interface Sport {
  id: string;
  name: string;
  icon?: React.ReactNode;
  iconPath?: string;
}

interface SportSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sports: Sport[];
  selectedSportId: string;
  onSelect: (id: string) => void;
}

export const SportSelectorModal: React.FC<SportSelectorModalProps> = ({
  isOpen,
  onClose,
  sports,
  selectedSportId,
  onSelect,
}) => {
  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" noPadding>
      <div className="flex flex-col max-h-[80vh]">
        <div className="p-6 pb-2 border-b border-[var(--play-border)]">
          <h2 className="text-xl font-bold text-[var(--play-text)]">Select Sport</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 mb-4">
          <div className="space-y-2 mt-2">
            {sports.map((sport) => {
              const isSelected = selectedSportId === sport.id;
              
              return (
                <button
                  key={sport.id}
                  onClick={() => handleSelect(sport.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    isSelected ? 'bg-[var(--play-brand-light)] border border-[var(--play-brand)] text-[var(--play-brand-dark)]' : 'bg-[var(--play-surface-alt)] border border-transparent hover:bg-[var(--play-surface-alt)]/80 text-[var(--play-text)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {sport.iconPath ? (
                      <img src={sport.iconPath} alt={sport.name} className="w-5 h-5 object-contain" />
                    ) : sport.icon ? (
                      <div className="text-[var(--play-brand)]">
                        {sport.icon}
                      </div>
                    ) : null}
                    <span className="text-lg font-medium capitalize">
                      {sport.name.toLowerCase()}
                    </span>
                  </div>
                  
                  {/* Radio button circle */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[var(--play-brand)]' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--play-brand)] text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
