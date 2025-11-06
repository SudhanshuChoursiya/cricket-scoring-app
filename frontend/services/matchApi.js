import { baseApi } from "./baseApi.js";

export const matchApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        // List of all matches
        getAllMatches: builder.query({
            query: () => "get-all-matches",
            providesTags: result =>
                result
                    ? [
                          ...result.data.map(match => ({
                              type: "Match",
                              id: match._id
                          })),
                          { type: "Matches", id: "LIST" }
                      ]
                    : [{ type: "Matches", id: "LIST" }]
        }),

        // Single match details
        getMatchDetails: builder.query({
            query: matchId => `get-match-details/${matchId}`,
            providesTags: (result, error, matchId) => [
                { type: "Match", id: matchId }
            ]
        }),
        searchMatches: builder.query({
            query: searchQuery => ({
                url: "/search-matches",
                method: "GET",
                params: { searched: searchQuery }
            })
        }),
        // Mutations
        createMatch: builder.mutation({
            query: payload => ({
                url: "create-new-match",
                method: "POST",
                body: payload
            }),
            invalidatesTags: (result, error, payload) => [
                { type: "Matches", id: "LIST" },
                ...(payload.tournamentId
                    ? [{ type: "Tournament", id: payload.tournamentId }]
                    : [])
            ]
        }),

        updateTossDetails: builder.mutation({
            query: ({ matchId, tossWinner, tossDecision }) => ({
                url: `/update-toss-details/${matchId}`,
                method: "POST",
                body: { tossWinner, tossDecision }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        updateInitialPlayers: builder.mutation({
            query: ({
                matchId,
                strikeBatsmanId,
                nonStrikeBatsmanId,
                currentBowlerId
            }) => ({
                url: `update-initial-players/${matchId}`,
                method: "POST",
                body: { strikeBatsmanId, nonStrikeBatsmanId, currentBowlerId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        updateScore: builder.mutation({
            query: ({ matchId, payload }) => ({
                url: `update-score/${matchId}`,
                method: "POST",
                body: payload
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        undoScore: builder.mutation({
            query: ({ matchId, lastAction, previousOverTimeline }) => ({
                url: `/undo-score/${matchId}`,
                method: "POST",
                body: { lastAction, previousOverTimeline }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        changeStrike: builder.mutation({
            query: ({ matchId }) => ({
                url: `/change-strike/${matchId}`,
                method: "POST"
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        changeOutBatsman: builder.mutation({
            query: ({ matchId, newBatsmanId }) => ({
                url: `/update-out-batsman/${matchId}`,
                method: "POST",
                body: { newBatsmanId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        changeBatsman: builder.mutation({
            query: ({ matchId, replacedBatsmanId, newBatsmanId }) => ({
                url: `/change-batsman/${matchId}`,
                method: "POST",
                body: { replacedBatsmanId, newBatsmanId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        changeBowler: builder.mutation({
            query: ({ matchId, newBowlerId }) => ({
                url: `/change-bowler/${matchId}`,
                method: "POST",
                body: { newBowlerId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        addSubstitute: builder.mutation({
            query: ({ matchId, teamId, playerId }) => ({
                url: `/add-substitutes/${matchId}`,
                method: "POST",
                body: { teamId, playerId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        removeSubstitute: builder.mutation({
            query: ({ matchId, teamId, playerId }) => ({
                url: `/remove-substitutes/${matchId}`,
                method: "POST",
                body: { teamId, playerId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        replacePlayer: builder.mutation({
            query: ({ matchId, teamId, replacedPlayerId, newPlayerId }) => ({
                url: `replace-player/${matchId}`,
                method: "POST",
                body: { teamId, replacedPlayerId, newPlayerId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        changeCaptain: builder.mutation({
            query: ({ matchId, teamId, captainId }) => ({
                url: `change-captain/${matchId}`,
                method: "POST",
                body: { teamId, captainId }
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        startSuperOver: builder.mutation({
            query: ({ matchId }) => ({
                url: `/start-super-over/${matchId}`,
                method: "POST"
            }),
            invalidatesTags: (result, error, { matchId }) => [
                { type: "Match", id: matchId }
            ]
        }),

        endInning: builder.mutation({
            query: matchId => ({
                url: `end-inning/${matchId}`,
                method: "POST"
            }),
            invalidatesTags: (result, error, matchId) => [
                { type: "Match", id: matchId }
            ]
        }),

        endMatch: builder.mutation({
            query: payload => ({
                url: `/end-match/${payload.matchId}`,
                method: "POST",
                body: payload
            }),
            invalidatesTags: (result, error, payload) => [
                { type: "Match", id: payload.matchId },
                { type: "Matches", id: "LIST" },
                ...(payload.tournamentId
                    ? [{ type: "Tournament", id: payload.tournamentId }]
                    : [])
            ]
        })
    }),
    overrideExisting: false
});

export const {
    useGetAllMatchesQuery,
    useGetMatchDetailsQuery,
    useLazySearchMatchesQuery,
    useCreateMatchMutation,
    useUpdateTossDetailsMutation,
    useUpdateInitialPlayersMutation,
    useUpdateScoreMutation,
    useUndoScoreMutation,
    useChangeStrikeMutation,
    useChangeOutBatsmanMutation,
    useChangeBatsmanMutation,
    useChangeBowlerMutation,
    useAddSubstituteMutation,
    useRemoveSubstituteMutation,
    useReplacePlayerMutation,
    useChangeCaptainMutation,
    useStartSuperOverMutation,
    useEndInningMutation,
    useEndMatchMutation
} = matchApi;
