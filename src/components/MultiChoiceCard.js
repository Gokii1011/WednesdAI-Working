import React from 'react';
import './MultiChoiceCard.css';

function MultiChoiceCard({ text, options, onSelect }) {
  return (
    <div className="multi-msg-wrapper">
      <p className="agent-question">{text}</p>
      <div className="multi-choice-list">
        {options.map((opt, idx) => (
          <div key={idx} className="multi-choice-card" onClick={() => onSelect(opt)}>
            {/* Show image if present */}
            {opt.image ? (
              <img src={opt.image} alt={opt.label} className="multi-choice-img" />
            ) : opt.icon ? (
              // If there's an icon/avatar
              <span className="multi-choice-icon">{opt.icon}</span>
            ) : null}
            
            {/* Always show text if present */}
            {opt.label && <span className="multi-choice-label">{opt.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MultiChoiceCard;
