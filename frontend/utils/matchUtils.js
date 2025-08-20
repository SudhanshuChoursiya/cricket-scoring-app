//get currentInning details
export const getCurrentInning = (match) => {
  if (!match) return null;

  if (match.isSuperOver) {
    // Handle Super Over
    if (!match.isSecondInningStarted && match.superOver.currentInning === 2) {
      return match.superOver.inning1;
    }
    return match.superOver.currentInning === 1
    ? match.superOver.inning1: match.superOver.inning2;
  }

  // Handle Normal Match
  if (!match.isSecondInningStarted && match.currentInning === 2) {
    return match.inning1;
  }

  return match.currentInning === 1 ? match.inning1: match.inning2;
};

