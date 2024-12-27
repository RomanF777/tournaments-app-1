import '../../css/tournaments.css';
import { tournaments_game_descriptions } from '../../js/data';

export const DropDownWindow = ({ name, description, type, isOpen, participants=[] }) => {
  const aboutTitle = tournaments_game_descriptions.find(
    (item) => item.gameType === type
  )?.name;
  const descriptionOfTheGame = tournaments_game_descriptions.find(
    (item) => item.gameType === type
  )?.descriptionOfTheGame;

  return (
    <div className={`dropDownWindow-component ${isOpen ? 'open' : ''}`}>
      <div className="dropDownWindow-component-description">
        {aboutTitle ? <h1 style={{fontWeight: '900', fontSize: '1.4rem'}}>{aboutTitle}</h1> : null}
        {descriptionOfTheGame ? <p>{descriptionOfTheGame}</p> : <p>No description available!</p>}
      </div>
      <div>
        {description &&
          <p className="dropDownWindow-component-description"><span style={{fontWeight: '900', fontSize: '1.1rem'}}>Description: </span>{description}</p>
        }
        </div>
        <div className="dropDownWindow-component-participants">
    <h3>Participants:</h3>
      <ul>
        {participants.length > 0 ? (
            participants.map((participant) => (
                <li key={participant.id}>{participant.name}</li>
            ))
        ) : (
            <li>No participants yet.</li>
        )}
      </ul>
    </div>

    </div>
  );
};
