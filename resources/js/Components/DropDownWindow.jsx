import '../../css/tournaments.css';
import { tournaments_game_descriptions } from '../../js/data';

export const DropDownWindow = ({ type, isOpen }) => {
  const name = tournaments_game_descriptions.find(
    (item) => item.gameType === type
  )?.name;
  const description = tournaments_game_descriptions.find(
    (item) => item.gameType === type
  )?.description;

  return (
    <div className={`dropDownWindow-component ${isOpen ? 'open' : ''}`}>
      <div className="dropDownWindow-component-description">
        {name ? <h1 style={{fontWeight: '900', fontSize: '1.4rem'}}>{name}</h1> : null}
        {description ? <p>{description}</p> : <p>No description available!</p>}
      </div>
      {/* <div>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae dui a leo laoreet gravida. Donec accumsan erat et mi lobortis finibus. Fusce vehicula quis lectus in placerat. Phasellus tortor dolor, molestie tincidunt ex nec, imperdiet maximus tortor.
      </div> */}
    </div>
  );
};
