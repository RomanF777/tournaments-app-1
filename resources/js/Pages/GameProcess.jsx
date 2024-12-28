export const GameProcess = ({ tournament }) => {
  return (
    <div>
      <h1>Game Process for {tournament.name}</h1>
      <p>Type: {tournament.type}</p>
      {/* Add more game-related logic here */}
    </div>
  );
};
