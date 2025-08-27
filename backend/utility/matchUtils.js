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


export const shouldShowSummary = (matchDetails, currentInningDetails)=> {
  if (!matchDetails || !currentInningDetails) return false;

  // don't show if match completed
  if (matchDetails.matchStatus === "completed") return false;


  // don't show if inning completed
  if (currentInningDetails.currentOvers === currentInningDetails.totalOvers) return false;

  const totalOvers = currentInningDetails.totalOvers; // total overs of the match
  const currentOvers = currentInningDetails.currentOvers; // current completed overs
  const interval = getSummaryInterval(totalOvers);

  // show only when overs completed is a multiple of interval
  return currentOvers > 0 && currentOvers % interval === 0;
}

const getSummaryInterval = (totalOvers)=> {
  if (totalOvers <= 6) return Math.floor(totalOvers / 2);
  if (totalOvers <= 12) return 3;
  if (totalOvers <= 20) return 5;
  if (totalOvers <= 50) return 10;
  return 15;
}