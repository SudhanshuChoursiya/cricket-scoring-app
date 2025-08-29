export const socketHandlers = (io) => {
  io.on("connection", (socket) => {
    // Join a match room
    socket.on("joinMatch", (matchId) => {
      socket.join(matchId);
    });

    // Leave a match room
    socket.on("leaveMatch", (matchId) => {
      socket.leave(matchId);
    });

    // Clean up when disconnected
    socket.on("disconnect", () => {
      // socket automatically leaves all rooms
    });
  });
};