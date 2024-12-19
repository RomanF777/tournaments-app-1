import { useState } from 'react';
import '../../css/tournaments.css';
import { DropDownWindow } from './DropDownWindow';

export const Tournament = ({ tournament }) => {
  const { name, type, novus_type, user } = tournament;
  const typeOfTheGame = type.slice(0, 1).toUpperCase() + type.slice(1);

  const [dropDown, setDropDown] = useState(false);

  const toggleDropDown = () => {
    setDropDown(!dropDown);
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
      <DropDownWindow type={type} isOpen={dropDown} />
    </div>
  );
};
