import React from 'react';
import { Card } from './Card';

export const Cards = ({ cards }) => {
    return (
        <div className="cards">
            <ul className="cards-container">
                {cards.map((card) => (
                    <li key={card.id}>
                        <Card
                            cardText={card.cardText}
                            cardImage={card.cardImage}
                            route={card.route}
                            onClick={card.onClick} // Pass onClick to the Card component
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};



