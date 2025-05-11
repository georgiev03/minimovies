import React from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  visible: boolean;
  content: string;
  x: number;
  y: number;
  dark?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ visible, content, x, y, dark }) => {
  if (!visible) return null;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: 'none',
        maxWidth: 320,
        background: dark ? 'rgba(30, 41, 59, 0.98)' : 'white',
        color: dark ? 'white' : '#1e293b',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '0.875rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        border: dark ? '1px solid #6366f1' : '1px solid #cbd5e1',
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
      }}
    >
      {content}
    </div>,
    document.body
  );
};

export default Tooltip; 