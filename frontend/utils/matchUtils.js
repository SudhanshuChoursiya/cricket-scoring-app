export const getCurrentInning = match => {
  if (!match) return null;

  if (!match.isSuperOver) {
    return match.currentInning === 1 ? match.inning1: match.inning2;
  } else {
    return match.superOver.currentInning === 1
    ? match.superOver.inning1: match.superOver.inning2;
  }
};