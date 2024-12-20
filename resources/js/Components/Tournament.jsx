import React, { useState } from 'react';
import { DropDownWindow } from './DropDownWindow';
import axios from 'axios';

export const Tournament = ({ tournament }) => {
  const { id, name, type, novus_type, user, isAdmin } = tournament;  // Destructure isAdmin here
  const typeOfTheGame = type.slice(0, 1).toUpperCase() + type.slice(1);

  const [dropDown, setDropDown] = useState(false);

  const toggleDropDown = () => {
    setDropDown(!dropDown);
  };

  const handleDeleteTournament = async () => {
    try {
      if (isAdmin) {
        // Send DELETE request to the backend
        const response = await axios.delete(`/tournament/${id}`);

        // Handle success (you can redirect or update the UI)
        console.log('Tournament deleted:', response.data);
        alert('Tournament deleted successfully!');

        // Optionally, you can remove this tournament from the local state if you have a parent component managing the list of tournaments.
        // For example, if you have a parent component that renders a list of tournaments, you can trigger a re-fetch or update state here.
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('An error occurred while deleting the tournament.');
    }
  };

  return (
    <div className="tournament-component-dropDownWindow-component">
      <div className="tournament-component">
        <div id="left">
          <div className="tournament-component-title">
            <h2>{name.toUpperCase()}</h2>
          </div>
          <div className="tournament-component-typeOfTheGame">
            <h3>
              <span className="bold">Type of the game: </span>
              {typeOfTheGame}
            </h3>
          </div>
          {novus_type && (
            <p>
              <span className="bold">Novus tournament type:</span> {novus_type}
            </p>
          )}
        </div>
        <div id="right">
          <div className="tournament-component-creator">
            <h4>
              <span className="bold">Created by<br /></span> {user}
            </h4>
          </div>
          <button
            onClick={toggleDropDown}
            type="button"
            className="tournament-component-dropDownButton"
          >
            {dropDown ? <span>&#9650;</span> : <span>&#9660;</span>}
          </button>
        </div>
      </div>
      {/* Conditional rendering based on isAdmin */}
      {isAdmin && (
        <div className="admin-actions">
          <button>Edit Tournament</button>
          <button onClick={handleDeleteTournament}>Delete Tournament</button>
        </div>
      )}
      <DropDownWindow type={type} isOpen={dropDown} />
    </div>
  );
};
