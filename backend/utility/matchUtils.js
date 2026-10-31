import { PlayerModel } from "../models/player.js";
import mongoose from "mongoose";

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

export const updatePlayerStats = async (
    playersStats,
    tournamentId = null,
    matchId = null
) => {
    if (!Array.isArray(playersStats) || playersStats.length === 0) {
        return null;
    }

    if (
        tournamentId &&
        !mongoose.Types.ObjectId.isValid(tournamentId)
    ) {
        throw new Error("Invalid tournamentId");
    }

    if (matchId && !mongoose.Types.ObjectId.isValid(matchId)) {
        throw new Error("Invalid matchId");
    }

    const tournamentObjectId = tournamentId
        ? new mongoose.Types.ObjectId(tournamentId)
        : null;

    const matchObjectId = matchId
        ? new mongoose.Types.ObjectId(matchId)
        : null;

    const toNumber = value => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    };

    const playersMap = new Map();

    // 1. Aggregate contributions by player.
    for (const p of playersStats) {
        if (!p?.playerId) continue;

        if (!mongoose.Types.ObjectId.isValid(p.playerId)) {
            throw new Error(`Invalid playerId: ${p.playerId}`);
        }

        const playerId = new mongoose.Types.ObjectId(p.playerId);
        const id = playerId.toString();

        if (!playersMap.has(id)) {
            playersMap.set(id, {
                playerId,
                name: p.name || "",
                matchPlayed: false,

                runs: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                dismissals: 0,

                wickets: 0,
                ballsBowled: 0,
                runsConceded: 0,

                battingInnings: [],
                bowlingInnings: []
            });
        }

        const stats = playersMap.get(id);

        stats.name = p.name || stats.name;
        stats.matchPlayed ||= p.matchPlayed === true;

        stats.runs += toNumber(p.runs);
        stats.ballsFaced += toNumber(p.ballsFaced ?? p.balls);
        stats.fours += toNumber(p.fours);
        stats.sixes += toNumber(p.sixes);
        stats.dismissals += toNumber(p.dismissals);

        stats.wickets += toNumber(p.wickets);
        stats.ballsBowled += toNumber(p.ballsBowled);
        stats.runsConceded += toNumber(p.runsConceded);

        if (Array.isArray(p.battingInnings)) {
            stats.battingInnings.push(...p.battingInnings);
        }

        if (Array.isArray(p.bowlingInnings)) {
            stats.bowlingInnings.push(...p.bowlingInnings);
        }
    }

    const defaultStats = {
        matches: 0,
        inningsBatted: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        highestRuns: 0,
        battingAverage: null,
        strikeRate: null,
        fifties: 0,
        hundreds: 0,
        dismissals: 0,
        wickets: 0,
        ballsBowled: 0,
        runsConceded: 0,
        inningsBowled: 0,
        bestBowlingWickets: 0,
        bestBowlingRuns: 0,
        threeWicketHauls: 0,
        fiveWicketHauls: 0,
        economy: null,
        bowlingAverage: null
    };

    // 2. Calculate cumulative stats in JavaScript.
    const calculateUpdatedStats = (oldStats, p) => {
        const old = {};

        for (const [key, defaultValue] of Object.entries(defaultStats)) {
            const value = oldStats?.[key];

            old[key] =
                value === null && defaultValue === null
                    ? null
                    : Number.isFinite(Number(value)) && value !== null
                      ? Number(value)
                      : defaultValue;
        }

        const battingInnings = p.battingInnings.filter(
            inn => inn?.batted === true
        );

        const bowlingInnings = p.bowlingInnings.filter(
            inn => toNumber(inn?.ballsBowled) > 0
        );

        const inningsRuns = battingInnings.map(
            inn => toNumber(inn.runs)
        );

        const highestRunsThisMatch = inningsRuns.length
            ? Math.max(...inningsRuns)
            : 0;

        const fifties = inningsRuns.filter(
            runs => runs >= 50 && runs < 100
        ).length;

        const hundreds = inningsRuns.filter(
            runs => runs >= 100
        ).length;

        let bestWickets = 0;
        let bestRuns = 0;
        let threeWicketHauls = 0;
        let fiveWicketHauls = 0;

        for (const inn of bowlingInnings) {
            const wickets = toNumber(inn.wickets);
            const runsConceded = toNumber(inn.runsConceded);

            if (
                wickets > bestWickets ||
                (
                    wickets === bestWickets &&
                    wickets > 0 &&
                    (bestWickets === 0 || runsConceded < bestRuns)
                )
            ) {
                bestWickets = wickets;
                bestRuns = runsConceded;
            }

            if (wickets >= 3) threeWicketHauls++;
            if (wickets >= 5) fiveWicketHauls++;
        }

        const totalRuns = old.runs + p.runs;
        const totalBallsFaced = old.ballsFaced + p.ballsFaced;
        const totalDismissals = old.dismissals + p.dismissals;

        const totalWickets = old.wickets + p.wickets;
        const totalBallsBowled = old.ballsBowled + p.ballsBowled;
        const totalRunsConceded = old.runsConceded + p.runsConceded;

        const newBestIsBetter =
            bestWickets > old.bestBowlingWickets ||
            (
                bestWickets > 0 &&
                bestWickets === old.bestBowlingWickets &&
                (
                    old.bestBowlingWickets === 0 ||
                    bestRuns < old.bestBowlingRuns
                )
            );

        return {
            matches: old.matches + (p.matchPlayed ? 1 : 0),

            inningsBatted: old.inningsBatted + battingInnings.length,
            runs: totalRuns,
            ballsFaced: totalBallsFaced,
            fours: old.fours + p.fours,
            sixes: old.sixes + p.sixes,

            highestRuns: Math.max(
                old.highestRuns,
                highestRunsThisMatch
            ),

            battingAverage:
                totalDismissals > 0
                    ? totalRuns / totalDismissals
                    : null,

            strikeRate:
                totalBallsFaced > 0
                    ? Number(
                          ((totalRuns / totalBallsFaced) * 100).toFixed(2)
                      )
                    : null,

            fifties: old.fifties + fifties,
            hundreds: old.hundreds + hundreds,
            dismissals: totalDismissals,

            wickets: totalWickets,
            ballsBowled: totalBallsBowled,
            runsConceded: totalRunsConceded,
            inningsBowled: old.inningsBowled + bowlingInnings.length,

            bestBowlingWickets: newBestIsBetter
                ? bestWickets
                : old.bestBowlingWickets,

            bestBowlingRuns: newBestIsBetter
                ? bestRuns
                : old.bestBowlingRuns,

            threeWicketHauls: old.threeWicketHauls + threeWicketHauls,
            fiveWicketHauls: old.fiveWicketHauls + fiveWicketHauls,

            economy:
                totalBallsBowled > 0
                    ? Number(
                          (
                              (totalRunsConceded * 6) /
                              totalBallsBowled
                          ).toFixed(2)
                      )
                    : null,

            bowlingAverage:
                totalWickets > 0
                    ? totalRunsConceded / totalWickets
                    : null
        };
    };

    // 3. Read existing player documents.
    const playerIds = [...playersMap.values()].map(p => p.playerId);

    const existingPlayers = await PlayerModel.find({
        playerId: { $in: playerIds }
    }).lean();

    const existingById = new Map(
        existingPlayers.map(player => [
            String(player.playerId),
            player
        ])
    );

    const operations = [];

    for (const p of playersMap.values()) {
        const existing = existingById.get(String(p.playerId));

        // 4. Prevent duplicate processing when matchId is supplied.
        if (
            matchObjectId &&
            existing?.processedMatchIds?.some(
                id => String(id) === String(matchObjectId)
            )
        ) {
            continue;
        }

        const careerStats = calculateUpdatedStats(
            existing?.careerStats,
            p
        );

        const update = {
            $set: {
                name: p.name,
                careerStats
            }
        };

        if (tournamentObjectId) {
            const tournamentEntries = existing?.tournamentStats || [];

            const existingTournament = tournamentEntries.find(
                entry =>
                    String(entry.tournamentId) ===
                    String(tournamentObjectId)
            );

            const tournamentStats = calculateUpdatedStats(
                existingTournament,
                p
            );

            // Update existing tournament entry or append a new one.
            if (existingTournament) {
                update.$set["tournamentStats.$[t]"] = {
                    ...existingTournament,
                    ...tournamentStats
                };
            } else {
                update.$push = {
                    tournamentStats: {
                        tournamentId: tournamentObjectId,
                        ...defaultStats,
                        ...tournamentStats
                    }
                };
            }
        }

        if (matchObjectId) {
            update.$addToSet = {
                processedMatchIds: matchObjectId
            };
        }

        operations.push({
            updateOne: {
                filter: { playerId: p.playerId },
                update,
                ...(update.$set?.["tournamentStats.$[t]"]
                    ? {
                          arrayFilters: [
                              {
                                  "t.tournamentId": tournamentObjectId
                              }
                          ]
                      }
                    : {}),
                upsert: true
            }
        });
    }

    if (operations.length === 0) {
        return null;
    }

    return PlayerModel.bulkWrite(operations, {
        ordered: true
    });
};


