import '../../css/tournaments.css';

export const Tournament = ({tournament}) => {
  const {name, type, novus_type, description, user} = tournament;
  const typeOfTheGame = type.slice(0, 1).toUpperCase() + type.slice(1);
  return (
      <div className='tournament-component'>
        <div id='left'>
        <div className='tournament-component-title'>
          <h2>{name.toUpperCase()}</h2>
        </div>

        <div className='tournament-component-typeOfTheGame'>
          <h3><span className='bold'>Type of the game: </span>{typeOfTheGame}</h3>
        </div>
        {novus_type && <p> <span className='bold'>Novus tournament type:</span> {novus_type}</p>}

        {/*  */}
        {/* <p>{description}</p> */}
        {/* <small>Created by: {user}</small> */}
        </div>
        <div id='right'>
          <div className='tournament-component-creator'>
            <h4><span className='bold'>Created by<br/></span> {user}</h4>
          </div>
        </div>
      </div>
  );
}