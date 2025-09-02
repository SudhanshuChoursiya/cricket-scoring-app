export const getCurrentInning = match => {
  if (!match) return null;

  if (!match.isSuperOver) {
    return match.currentInning === 1 ? match.inning1: match.inning2;
  } else {
    return match.superOver.currentInning === 1
    ? match.superOver.inning1: match.superOver.inning2;
  }
};

export const checkAndNavigateToPendingAction = (matchDetails, navigation, matchId) => {
  if (matchDetails?.isSelectNewBatsmanPending) {
    navigation.push("select-new-batsman", {
      matchId
    });
    return true;
  }

  if (matchDetails?.isOverChangePending) {
    navigation.push("select-new-bowler", {
      matchId
    });
    return true;
  }
  return false;
};