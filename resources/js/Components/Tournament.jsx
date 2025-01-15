import React, { useState, useEffect } from 'react';
import { DropDownWindow } from './DropDownWindow';
import GamePage from '@/Pages/GamePage';
import axios from 'axios';

import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";


export const Tournament = ({ tournament, onDelete }) => {
  const { id, user_name, user_id, name, type, novus_type, isAdmin, description, participants } = tournament;
  const typeOfTheGame = type.slice(0, 1).toUpperCase() + type.slice(1);

  const [follow, setFollow] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(participants.length);
  const [dropDown, setDropDown] = useState(false);
  const [participantsList, setParticipantsList] = useState(participants);
  const [isRecruiting, setIsRecruiting] = useState(tournament.isRecruiting || true); // Default to true

  useEffect(() => {
    const fetchRecruitingStatus = async () => {
      try {
        const response = await axios.get(`/tournament/${id}/recruiting-status`);
        setIsRecruiting(response.data.isRecruiting);
      } catch (error) {
        console.error('Error fetching recruiting status:', error);
      }
    };
    fetchRecruitingStatus();
  }, [id]);

  const toggleDropDown = () => {
    setDropDown(!dropDown);
  };

  const handleDeleteTournament = async () => {
    try {
      if (isAdmin) {
        await axios.delete(`/tournament/${id}`);
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
      setParticipantsList(response.data.participants);
      setParticipantsCount(response.data.participant_count);
      setFollow(!follow);
      alert(response.data.message);
    } catch (error) {
      console.error('Error following/leaving the tournament:', error);
      alert('An error occurred while following the tournament.');
    }
  };

  const handleStopRecruiting = async () => {
    try {
      const response = await axios.post(`/tournament/${id}/stop-recruiting`);
      setIsRecruiting(false);
      alert(response.data.message);
    } catch (error) {
      console.error('Error stopping recruiting:', error);
      alert('An error occurred while stopping recruiting.');
    }
  };

  const handleStartRecruiting = async () => {
    try {
      const response = await axios.post(`/tournament/${id}/start-recruiting`);
      setIsRecruiting(true);
      alert(response.data.message);
    } catch (error) {
      console.error('Error starting recruiting:', error);
      alert('An error occurred while starting recruiting.');
    }
  };

  const startTheGame = () => {
    // window.location.href = `/start-game`;
    window.location.href = `/game/${tournament.unique_path}`;
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
            <div className="button-container">
              {isAdmin && (
                <>
                  {isRecruiting ? (
                    <button onClick={handleStopRecruiting}>Stop recruiting</button>
                  ) : (
                    <button onClick={handleStartRecruiting}>Start recruiting</button>
                  )}
                  <button onClick={handleDeleteTournament}>Delete Tournament</button>
                </>
              )}
              {isRecruiting ? (
                <button onClick={handleFollow}>
                  {follow ? 'Leave the tournament' : 'Follow the Tournament'}
                </button>
              ) : (
                <p>Recruiting has been stopped.</p>
              )}
              {isAdmin && !isRecruiting && (<button onClick={startTheGame}>Start The Game</button>)}
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
            {dropDown ? <IoMdArrowDropupCircle style={{ fontSize: '2rem' }} /> : <IoMdArrowDropdownCircle style={{ fontSize: '2rem' }} />}
          </button>
        </div>
      </div>
      <DropDownWindow
        name={name}
        description={description}
        type={type}
        isOpen={dropDown}
        participants={participantsList}
      />
    </div>
  );
};


