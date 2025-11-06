import { baseApi } from "./baseApi";

export const teamApi = baseApi.injectEndpoints({
    endpoints: builder => ({
        // List of all teams
        getAllTeams: builder.query({
            query: () => "get-all-teams",
            providesTags: result =>
                result
                    ? [
                          ...result.data.map(team => ({
                              type: "Team",
                              id: team._id
                          })),
                          { type: "Teams", id: "LIST" }
                      ]
                    : [{ type: "Teams", id: "LIST" }]
        }),

        // Single team details
        getTeamDetails: builder.query({
            query: teamId => `get-single-team/${teamId}`,
            providesTags: (result, error, teamId) => [
                { type: "Team", id: teamId }
            ]
        }),

        // Add a new team
        addNewTeam: builder.mutation({
            query: payload => ({
                url: "add-new-team",
                method: "POST",
                body: payload
            }),
            invalidatesTags: [{ type: "Teams", id: "LIST" }]
        }),

        // Add new players to an existing team
        addNewPlayers: builder.mutation({
            query: ({ teamId, players }) => ({
                url: `add-new-players/${teamId}`,
                method: "POST",
                body: { players }
            }),
            invalidatesTags: (result, error, { teamId }) => [
                { type: "Team", id: teamId }
            ]
        }),

        // Update team details
        updateTeam: builder.mutation({
            query: ({ teamId, payload }) => ({
                url: `update-team/${teamId}`,
                method: "POST",
                body: payload
            }),
            invalidatesTags: (result, error, { teamId }) => [
                { type: "Team", id: teamId }
            ]
        })
    }),
    overrideExisting: false
});

export const {
    useGetAllTeamsQuery,
    useGetTeamDetailsQuery,
    useAddNewTeamMutation,
    useAddNewPlayersMutation,
    useUpdateTeamMutation
} = teamApi;

