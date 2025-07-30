export const ellipsize = (text, maxLength) => {
  if (!text || !maxLength) return text;

  return text.length > maxLength
  ? text.substring(0, maxLength) + "...": text;
};

export const formatOver = (ballsBowled)=> {
  const overs = Math.floor(ballsBowled / 6);
  const remainingBalls = ballsBowled % 6;
  return `${overs}.${remainingBalls}`;
}

export const formatOverTimeline = timeLine => {
  if (timeLine.isWicket) {
    if (timeLine.outMethod === "retired hurt") {
      return "REH";
    }
    return "W";
  } else if (timeLine.isFour) {
    return "4";
  } else if (timeLine.isSix) {
    return "6";
  } else if (timeLine.isWide) {
    return "WD" + (timeLine.runs > 0 ? timeLine.runs: "");
  } else if (timeLine.isNoball) {
    return "NB" + (timeLine.runs > 0 ? timeLine.runs: "");
  } else if (timeLine.isLegBye) {
    return "LB" + (timeLine.runs > 0 ? timeLine.runs: "");
  } else if (timeLine.isBye) {
    return "BY" + (timeLine.runs > 0 ? timeLine.runs: "");
  } else {
    return timeLine.runs;
  }
};