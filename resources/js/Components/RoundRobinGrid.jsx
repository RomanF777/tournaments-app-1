// import { motion, AnimatePresence } from 'framer-motion';
// import { useState } from 'react';

// export const RoundRobinGrid = ({ matches, onMatchWin, stats }) => {
//   const [expandedGroup, setExpandedGroup] = useState(null);

//   return (
//     <div className="round-robin-grid">

//       <div className="groups-container">
//         {Array.from({ length: Math.ceil(matches.length / 10) }).map((_, groupIdx) => (
//           <motion.div
//             key={groupIdx}
//             className="group-card"
//             layout
//             onClick={() => setExpandedGroup(expandedGroup === groupIdx ? null : groupIdx)}
//           >
//             <h3>Группа {groupIdx + 1}</h3>

//             <AnimatePresence>
//               {expandedGroup === groupIdx && (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="matches-list"
//                 >
//                   {matches.slice(groupIdx * 10, (groupIdx + 1) * 10).map((match) => (
//                     <div key={match.id} className="match-line">
//                       <div className="player-cell">
//                         {match.player1.name}
//                         <span className="score-badge">
//                           {stats[match.player1.id].wins}
//                         </span>
//                       </div>
//                       <div className="vs-separator">vs</div>
//                       <div className="player-cell">
//                         {match.player2.name}
//                         <span className="score-badge">
//                           {stats[match.player2.id].wins}
//                         </span>
//                       </div>

//                       {!match.winner && (
//                         <div className="match-controls">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onMatchWin(match.id, match.player1.id);
//                             }}
//                           >
//                             Победа {match.player1.name}
//                           </button>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onMatchWin(match.id, match.player2.id);
//                             }}
//                           >
//                             Победа {match.player2.name}
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         ))}
//       </div>

//       <ProgressBar
//         total={matches.length}
//         completed={matches.filter(m => m.winner).length}
//       />
//     </div>
//   );
// };

// const ProgressBar = ({ total, completed }) => (
//   <div className="progress-container">
//     <div className="progress-label">
//       Прогресс: {completed}/{total} матчей
//     </div>
//     <div className="progress-bar">
//       <motion.div
//         className="progress-fill"
//         initial={{ width: 0 }}
//         animate={{ width: `${(completed / total) * 100}%` }}
//         transition={{ duration: 0.5 }}
//       />
//     </div>
//   </div>
// );