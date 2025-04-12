import React, { useState } from 'react';
import { Language } from '../../types';
import { ChatWindow } from './ChatWindow';

interface ChatProps {
  roomId: string;
  businessName: string;
  language: Language;
}

export function Chat({ roomId, businessName, language }: ChatProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <ChatWindow
      roomId={roomId}
      businessName={businessName}
      language={language}
      onClose={() => setOpen(false)}
    />
  );
}
