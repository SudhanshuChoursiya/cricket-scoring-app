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

export const formatOverTimelineText = timeLine => {
  if (timeLine.isWicket) {
    return timeLine.outMethod === "retired hurt" ? "REH": "W";
  } else if (timeLine.isFour) {
    return "4";
  } else if (timeLine.isSix) {
    return "6";
  } else if (timeLine.isWide || timeLine.isNoball) {
    return String(timeLine.runs > 0 ? timeLine.runs+1: 1);
  } else {
    return String(timeLine.runs);
  }
};

export const getOverTimelineExtrasLabel = timeLine => {
  if (timeLine.isWide) return "WD";
  if (timeLine.isNoball) return "NB";
  if (timeLine.isLegBye) return "LB";
  if (timeLine.isBye) return "BY";
  return null;
};