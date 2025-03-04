//get currentInning details
export const getCurrentInning = match => {
    if (!match) return null;

    if (match.isSuperOver) {
        return match.superOver.currentInning === 1
            ? match.superOver.inning1
            : match.superOver.inning2;
    }

    return match.currentInning === 1 ? match.inning1 : match.inning2;
};

