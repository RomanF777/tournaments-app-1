import React, { useState } from 'react';
import { DropDownWindow } from './DropDownWindow';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";

export const Tournament = ({ tournament, onDelete }) => {
  const { id, user_name, user_id, name, type, novus_type, isAdmin, description, participants } = tournament;
  const typeOfTheGame = type.slice(0, 1).toUpperCase() + type.slice(1);

  const creatorName = user_id;

  const [follow, setFollow] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(participants.length);
  const [dropDown, setDropDown] = useState(false);
  const [participantsList, setParticipantsList] = useState(participants);  // Use initial participants

  const toggleDropDown = () => {
    setDropDown(!dropDown);
  };

  const handleDeleteTournament = async () => {
    try {
      if (isAdmin) {
        // Send DELETE request to the backend
        const response = await axios.delete(`/tournament/${id}`);

        // If successful, call onDelete to update the parent state
        onDelete(id);

        alert('Tournament deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('An error occurred while deleting the tournament.');
    }
  };

  const handleFollow = async () => {
    try {
        const response = await axios.post(`/tournament/${id}/follow`);

        // Use the returned list of participants
        const updatedParticipants = response.data.participants;
        setFollow(true);
        // Update participants list with the full list of participants
        setParticipantsList(updatedParticipants);

        // Optionally update participant count
        setParticipantsCount(response.data.participant_count);

        alert(response.data.message);

    } catch (error) {
        console.error('Error following tournament:', error);
        alert('An error occurred while following the tournament.');
    }
};


  return (
    <div className="tournament-component-dropDownWindow-component">
      <div className="tournament-component">
        <div id="left">
          <p>Participants: {participantsCount}</p>
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
            {/* Conditional rendering based on isAdmin */}
            <div className="button-container">
              {isAdmin && (<button onClick={handleDeleteTournament} style={{display: 'block'}}>Delete Tournament</button>)}
              <button onClick={handleFollow} style={{display: 'block'}}>{follow ? 'Leave' : 'Follow the Tournament'}</button>
            </div>
            <h4>
              <span className="bold">Created by<br /></span>{user_name}
            </h4>
          </div>
          <button
            onClick={toggleDropDown}
            type="button"
            className="tournament-component-dropDownButton"
          >
            {dropDown ? <IoMdArrowDropupCircle style={{fontSize: '2rem'}} /> : <IoMdArrowDropdownCircle style={{fontSize: '2rem'}} />}
          </button>
        </div>
      </div>
      <DropDownWindow
        name={name}
        description={description}
        type={type}
        isOpen={dropDown}
        participants={participantsList}  // Pass updated participants list
    />
    </div>
  );
};
