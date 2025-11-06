import { PlayerModel } from "../models/player.js";

export const getCurrentInning = match => {
    if (!match) return null;

    if (!match.isSuperOver) {
        return match.currentInning === 1 ? match.inning1 : match.inning2;
    } else {
        return match.superOver.currentInning === 1
            ? match.superOver.inning1
            : match.superOver.inning2;
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
        totalOvers: totalOvers
    };
};

export const shouldShowSummary = (matchDetails, currentInningDetails) => {
    if (!matchDetails || !currentInningDetails) return false;

    // don't show if match completed
    if (matchDetails.matchStatus === "completed") return false;

    // don't show if inning completed
    if (currentInningDetails.currentOvers === currentInningDetails.totalOvers)
        return false;

    const totalOvers = currentInningDetails.totalOvers;
    const currentOvers = currentInningDetails.currentOvers;
    const currentOverBalls = currentInningDetails.currentOverBalls;

    const interval = getSummaryInterval(totalOvers);

    // show only when overs completed is a multiple of interval
    return (
        currentOvers > 0 &&
        currentOverBalls === 0 &&
        currentOvers % interval === 0
    );
};

const getSummaryInterval = totalOvers => {
    if (totalOvers <= 6) return Math.floor(totalOvers / 2);
    if (totalOvers <= 12) return 3;
    if (totalOvers <= 20) return 5;
    if (totalOvers <= 50) return 10;
    return 15;
};

export const shouldShowHighlightEvent = (isFour, isSix, isWicket) => {
    if (isFour || isSix || isWicket) {
        return true;
    }
    return false;
};

export const updatePlayerStats = async (playersStats, tournamentId) => {
    if (!Array.isArray(playersStats) || playersStats.length === 0) return null;

    const operations = playersStats
        .filter(p => p.playerId) // Skip invalid players
        .map(p => {
            const baseStats = {
                runs: p.runs || 0,
                ballsFaced: p.balls || 0,
                fours: p.fours || 0,
                sixes: p.sixes || 0,
                wickets: p.wickets || 0,
                ballsBowled: p.ballsBowled || 0,
                runsConceded: p.runsConceded || 0
            };

            const update = {
                $set: {
                    // Player basic details
                    playerId: p.playerId,
                    name: p.name
                },
                $inc: {}
            };

            // Career stats
            for (const [key, value] of Object.entries(baseStats)) {
                update.$inc[`careerStats.${key}`] = value;
            }

            if (p.matchPlayed) update.$inc["careerStats.matches"] = 1;

            // Tournament stats (only if tournamentId exists)
            if (tournamentId) {
                const tPath = `tournamentStats.${tournamentId}`;

                // Increment tournament-level stats
                for (const [key, value] of Object.entries(baseStats)) {
                    update.$inc[`${tPath}.${key}`] = value;
                }

                if (p.matchPlayed) update.$inc[`${tPath}.matches`] = 1;

                // Initialize tournament stats structure without affecting match count
                update.$setOnInsert = {
                    [tPath]: {
                        playerId: p.playerId,
                        name: p.name,
                        runs: 0,
                        ballsFaced: 0,
                        fours: 0,
                        sixes: 0,
                        wickets: 0,
                        ballsBowled: 0,
                        runsConceded: 0
                    }
                };
            }

            return {
                updateOne: {
                    filter: { _id: p.playerId },
                    update,
                    upsert: true
                }
            };
        });

    if (operations.length === 0) return null;

    return PlayerModel.bulkWrite(operations);
};

/*export const updatePlayerStats = async (playersStats, tournamentId) => {
  if (!Array.isArray(playersStats) || playersStats.length === 0) return null;

  const operations = playersStats
    .filter(p => p.playerId) // skip invalid players
    .map(p => {
      const baseStats = {
        runs: p.runs || 0,
        ballsFaced: p.balls || 0,
        fours: p.fours || 0,
        sixes: p.sixes || 0,
        wickets: p.wickets || 0,
        ballsBowled: p.ballsBowled || 0,
        runsConceded: p.runsConceded || 0,
        dismissals: p.dismissals || 0
      };

      // --- Base update object ---
      const update = {
        $inc: {},
        $set: { name: p.name } // ✅ ensure name is updated
      };

      // Career stats increment
      for (const [k, v] of Object.entries(baseStats)) {
        update.$inc[`careerStats.${k}`] = v;
      }
      if (p.matchPlayed) update.$inc["careerStats.matches"] = 1;

      const bulkOps = [];

      if (tournamentId) {
        // Push new tournament stats if not exist
        bulkOps.push({
          updateOne: {
            filter: { _id: p.playerId, "tournamentStats.tournamentId": { $ne: tournamentId } },
            update: {
              $push: {
                tournamentStats: {
                  tournamentId,
                  matches: p.matchPlayed ? 1 : 0,
                  ...baseStats
                }
              },
              $set: { name: p.name }
            }
          }
        });

        // Update existing tournament stats
        const tInc = {};
        for (const [k, v] of Object.entries(baseStats)) {
          tInc[`tournamentStats.$[t].${k}`] = v;
        }
        if (p.matchPlayed) tInc[`tournamentStats.$[t].matches`] = 1;

        bulkOps.push({
          updateOne: {
            filter: { _id: p.playerId },
            update: { $inc: tInc, $set: { name: p.name } },
            arrayFilters: [{ "t.tournamentId": tournamentId }]
          }
        });
      } else {
        // Only career stats
        bulkOps.push({
          updateOne: {
            filter: { _id: p.playerId },
            update
          }
        });
      }

      return bulkOps;
    })
    .flat(); // flatten nested arrays

  if (operations.length === 0) return null;

  return PlayerModel.bulkWrite(operations);
};*/

/*export const updatePlayerStats = async (playersStats, tournamentId) => {
    if (!Array.isArray(playersStats) || playersStats.length === 0) return null;

    const operations = playersStats
        .filter(p => p.playerId) // skip invalid players
        .map(p => {
            const baseStats = {
                runs: p.runs || 0,
                ballsFaced: p.balls || 0,
                fours: p.fours || 0,
                sixes: p.sixes || 0,
                wickets: p.wickets || 0,
                ballsBowled: p.ballsBowled || 0,
                runsConceded: p.runsConceded || 0
            };

            const update = { $inc: {} };

            // career updates
            for (const [k, v] of Object.entries(baseStats)) {
                update.$inc[`careerStats.${k}`] = v;
            }
            if (p.matchPlayed) update.$inc["careerStats.matches"] = 1;

            // tournament updates
            if (tournamentId) {
                const tPath = `tournamentStats.${tournamentId}`;
                for (const [k, v] of Object.entries(baseStats)) {
                    update.$inc[`${tPath}.${k}`] = v;
                }
                if (p.matchPlayed) update.$inc[`${tPath}.matches`] = 1;

                // ensure default tournament stats on insert
                update.$setOnInsert = {
                    [tPath]: {
                        matches: 0,
                        runs: 0,
                        ballsFaced: 0,
                        fours: 0,
                        sixes: 0,
                        wickets: 0,
                        ballsBowled: 0,
                        runsConceded: 0
                    }
                };
            }

            return {
                updateOne: {
                    filter: { _id: p.playerId },
                    update,
                    upsert: true
                }
            };
        });

    if (operations.length === 0) return null;

    return PlayerModel.bulkWrite(operations);
};*/

/*export const updatePlayerStats = async (playerStats, tournamentId) => {
    if (!Array.isArray(playerStats) || playerStats.length === 0) return;

    const bulkOps = [];

    for (const player of playerStats) {
        if (!player.playerId) continue;

        // Player didn't bat or bowl at all — skip
        const didPlay =
            (player.runs && player.runs > 0) ||
            (player.ballsFaced && player.ballsFaced > 0) ||
            (player.wickets && player.wickets > 0) ||
            (player.ballsBowled && player.ballsBowled > 0);

        if (!didPlay) continue;

        const stats = {
            runs: player.runs || 0,
            ballsFaced: player.ballsFaced || 0,
            fours: player.fours || 0,
            sixes: player.sixes || 0,
            wickets: player.wickets || 0,
            ballsBowled: player.ballsBowled || 0,
            runsConceded: player.runsConceded || 0,
        };

        const update = { $inc: {}, $setOnInsert: {} };

        // Career stats
        for (const [key, value] of Object.entries(stats)) {
            update.$inc[`careerStats.${key}`] = value;
        }
        update.$inc["careerStats.matches"] = 1;

        // Tournament stats
        if (tournamentId) {
            const tPath = `tournamentStats.${tournamentId}`;

            for (const [key, value] of Object.entries(stats)) {
                update.$inc[`${tPath}.${key}`] = value;
            }
            update.$inc[`${tPath}.matches`] = 1;

            // Initialize default tournament stats on first insert
            update.$setOnInsert[tPath] = {
                matches: 0,
                runs: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                wickets: 0,
                ballsBowled: 0,
                runsConceded: 0,
            };
        }

        bulkOps.push({
            updateOne: {
                filter: { _id: player.playerId },
                update,
                upsert: true,
            },
        });
    }

    if (bulkOps.length > 0) {
        await Player.bulkWrite(bulkOps);
    }
};*/

/*export const updatePlayerStats = async (match) => {
    const allPlayersInMatch = [...match.teamA.playing11, ...match.teamB.playing11];
    const tournamentId = match.tournamentId;

    if (!tournamentId) {
        console.warn("Match does not have a tournamentId. Skipping tournament stats update.");
        return;
    }

    const bulkOps = [];

    for (const playerMatchStats of allPlayersInMatch) {
        if (!playerMatchStats.playerId) continue;

        const {
            playerId,
            runs = 0,
            balls = 0, // ballsFaced
            fours = 0,
            sixes = 0,
            isOut = false,
            wickets = 0,
            ballsBowled = 0,
            runsConceded = 0,
        } = playerMatchStats;

        // Shared career stats update logic
        const careerStatsUpdate = {
            "careerStats.matches": 1,
            "careerStats.runs": runs,
            "careerStats.ballsFaced": balls,
            "careerStats.fours": fours,
            "careerStats.sixes": sixes,
            "careerStats.dismissals": isOut ? 1 : 0,
            "careerStats.wickets": wickets,
            "careerStats.ballsBowled": ballsBowled,
            "careerStats.runsConceded": runsConceded,
        };

        // --- Operation 1: For players who HAVE played in this tournament before ---
        const updateExistingOp = {
            updateOne: {
                filter: { _id: playerId, "tournamentStats.tournamentId": tournamentId },
                update: {
                    $inc: {
                        ...careerStatsUpdate,
                        "tournamentStats.$[t].matches": 1,
                        "tournamentStats.$[t].runs": runs,
                        "tournamentStats.$[t].ballsFaced": balls,
                        "tournamentStats.$[t].fours": fours,
                        "tournamentStats.$[t].sixes": sixes,
                        "tournamentStats.$[t].dismissals": isOut ? 1 : 0,
                        "tournamentStats.$[t].wickets": wickets,
                        "tournamentStats.$[t].ballsBowled": ballsBowled,
                        "tournamentStats.$[t].runsConceded": runsConceded,
                    },
                },
                arrayFilters: [{ "t.tournamentId": tournamentId }],
            },
        };

        // --- Operation 2: For players playing their FIRST match in this tournament ---
        const addNewOp = {
            updateOne: {
                filter: { _id: playerId, "tournamentStats.tournamentId": { $ne: tournamentId } },
                update: {
                    $inc: careerStatsUpdate,
                    $push: {
                        tournamentStats: {
                            tournamentId,
                            matches: 1,
                            runs,
                            ballsFaced: balls,
                            fours,
                            sixes,
                            dismissals: isOut ? 1 : 0,
                            wickets,
                            ballsBowled,
                            runsConceded,
                            highestScore: runs,
                            // Initialize other stats from schema
                            fifties: 0, hundreds: 0, catches: 0, stumpings: 0,
                        },
                    },
                },
            },
        };

        bulkOps.push(updateExistingOp, addNewOp);
    }

    if (bulkOps.length > 0) {
        try {
            console.log(`Executing bulkWrite for ${bulkOps.length / 2} players...`);
            await PlayerModel.bulkWrite(bulkOps);
            console.log("Player stats updated successfully.");
        } catch (error) {
            console.error("Error during player stats bulkWrite operation:", error);
        }
    }
};*/

/*export const updatePlayerStats = async ({
  playerId,
  runs = 0,
  balls = 0,
  fours = 0,
  sixes = 0,
  wickets = 0,
  ballsBowled = 0,
  runsConceded = 0,
  tournamentId,
  matchPlayed = false // control when to increment matches
}) => {
  const careerInc = {
    runs,
    ballsFaced: balls,
    fours,
    sixes,
    wickets,
    ballsBowled,
    runsConceded,
  };

  if (matchPlayed) {
    careerInc.matches = 1;
  }

  const update = {
    $inc: {
      "careerStats.runs": careerInc.runs,
      "careerStats.ballsFaced": careerInc.ballsFaced,
      "careerStats.fours": careerInc.fours,
      "careerStats.sixes": careerInc.sixes,
      "careerStats.wickets": careerInc.wickets,
      "careerStats.ballsBowled": careerInc.ballsBowled,
      "careerStats.runsConceded": careerInc.runsConceded,
      ...(matchPlayed ? { "careerStats.matches": 1 } : {}),
    },
  };

  // Handle tournament stats if provided
  if (tournamentId) {
    const tPath = `tournamentStats.${tournamentId}`;
    update.$inc = {
      ...update.$inc,
      [`${tPath}.runs`]: runs,
      [`${tPath}.ballsFaced`]: balls,
      [`${tPath}.fours`]: fours,
      [`${tPath}.sixes`]: sixes,
      [`${tPath}.wickets`]: wickets,
      [`${tPath}.ballsBowled`]: ballsBowled,
      [`${tPath}.runsConceded`]: runsConceded,
      ...(matchPlayed ? { [`${tPath}.matches`]: 1 } : {}),
    };

    // Ensure tournament stats object exists
    update.$setOnInsert = {
      [tPath]: {
        matches: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        ballsBowled: 0,
        runsConceded: 0,
      },
    };
  }

  await PlayerModel.findByIdAndUpdate(playerId, update, { upsert: true, new: true });
};*/
