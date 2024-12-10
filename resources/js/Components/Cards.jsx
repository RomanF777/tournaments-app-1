import React from 'react';
import { Card } from './Card';

const cards = [
  { id: 1, cardImage: '../../../public/images/golden trophy.webp', cardText: 'Tournaments', route: '/tournaments' },
  { id: 2, cardImage: '../../../public/images/recent.jpg', cardText: 'Recent', route: '/recent' },
  { id: 3, cardImage: '../../../public/images/quiz.jpg', cardText: 'Quiz', route: '/quiz' },
  { id: 5, cardImage: '../../../public/images/plus.jpg', cardText: 'Create', route: '/create' },
];

export const Cards = () => {
  return (
    <ul className="cards-container">
      {cards.map((card) => (
        <li key={card.id}>
          <Card cardText={card.cardText} cardImage={card.cardImage} route={card.route} />
        </li>
      ))}
    </ul>
  );
};


