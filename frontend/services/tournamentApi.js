import { baseApi } from "./baseApi";

export const tournamentApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        // List of all tournaments
        getAllTournaments: builder.query({
            query: () => "get-all-tournaments",
            providesTags: result =>
                result
                    ? [
                          ...result.data.map(tournament => ({
                              type: "Tournament",
                              id: tournament._id
                          })),
                          { type: "Tournaments", id: "LIST" }
                      ]
                    : [{ type: "Tournaments", id: "LIST" }]
        }),

        // Single tournament details
        getTournamentDetails: builder.query({
            query: tournamentId => `get-tournament-details/${tournamentId}`,
            providesTags: (result, error, tournamentId) => [
                { type: "Tournament", id: tournamentId }
            ]
        }),
        // tournamentApi.js
        searchTournaments: builder.query({
            query: searchQuery => ({
                url: "/search-tournaments",
                method: "GET",
                params: { searched: searchQuery }
            })
        }),
        // Create new tournament
        createTournament: builder.mutation({
            query: payload => ({
                url: "create-new-tournament",
                method: "POST",
                body: payload
            }),
            invalidatesTags: [{ type: "Tournaments", id: "LIST" }]
        }),

        // Update tournament
        updateTournament: builder.mutation({
            query: ({ tournamentId, payload }) => ({
                url: `update-tournament-details/${tournamentId}`,
                method: "PUT",
                body: payload
            }),
            invalidatesTags: (result, error, { tournamentId }) => [
                { type: "Tournament", id: tournamentId }
            ]
        })
    }),
    overrideExisting: false
});

export const {
    useGetAllTournamentsQuery,
    useGetTournamentDetailsQuery,
    useLazySearchTournamentsQuery,
    useCreateTournamentMutation,
    useUpdateTournamentMutation
} = tournamentApi;
