export const getCurrentInning = match => {
  if (!match) return null;

  if (!match.isSuperOver) {
    return match.currentInning === 1 ? match.inning1: match.inning2;
  } else {
    return match.superOver.currentInning === 1
    ? match.superOver.inning1: match.superOver.inning2;
  }
};

//create new innings
export const createInning = (
  battingTeam,
  bowlingTeam,
  batsmanStats,
  bowlerStats,
  totalOvers
) => {
  return {
    battingTeam: {
      ...battingTeam,
      playing11: battingTeam.playing11.map(player => ({
        playerId: player.playerId,
        name: player.name,
        ...batsmanStats
      }))
    },
    bowlingTeam: {
      ...bowlingTeam,
      playing11: bowlingTeam.playing11.map(player => ({
        playerId: player.playerId,
        name: player.name,
        ...bowlerStats
      }))
    },
    totalOvers: totalOvers,
  };
};