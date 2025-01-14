import React, { useState } from 'react';

export const ReadMore = ({ children, limit }) => {
  // State to track whether the content is expanded or not
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle button click to toggle expansion
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if the content exceeds the specified limit
  const content = children;
  const isLongContent = content.length > limit;

  return (
    <div>
      <p>
        {isExpanded || !isLongContent ? content + ' ' : `${content.slice(0, limit)}...`}
        {isLongContent && (
        <button style={{padding: '0', margin: '0', textDecoration: 'underline', color: '#036ffc', fontWeight: '500'}} onClick={toggleReadMore}>
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
      </p>
    </div>
  );
};

