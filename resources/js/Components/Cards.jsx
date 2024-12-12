import React from 'react';
import { Card } from './Card';
import '../../css/Cards.css'

const cards = [
  { id: 1, cardImage: '/images/golden trophy.webp', cardText: 'Tournaments', route: '/tournaments' },
  { id: 2, cardImage: '/images/recent.jpg', cardText: 'Recent', route: '/recent' },
  { id: 3, cardImage: '/images/quiz.jpg', cardText: 'Quiz', route: '/quiz' },
  { id: 5, cardImage: '/images/plus.jpg', cardText: 'Create', route: '/create' },
];

export const Cards = () => {
  return (
  <div className='cards'>
    <ul className="cards-container">
      {cards.map((card) => (
        <li key={card.id}>
          <Card cardText={card.cardText} cardImage={card.cardImage} route={card.route} />
        </li>
      ))}
    </ul>
  </div>
  );
};


