import { Server as SocketIOServer } from 'socket.io';

export const initializeSocketIO = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join', (data: { userId: string; role: string }) => {
      const room = `user_${data.userId}`;
      socket.join(room);
      console.log(`User ${data.userId} (${data.role}) joined room: ${room}`);
    });

    // Join parent room to receive child updates
    socket.on('join-parent', (data: { parentId: string; studentIds: string[] }) => {
      // Join parent's own room
      socket.join(`parent_${data.parentId}`);

      // Join all children's rooms to receive updates
      data.studentIds.forEach((studentId) => {
        socket.join(`student_${studentId}_updates`);
      });
      console.log(`Parent ${data.parentId} joined student update rooms`);
    });

    // Homework progress update
    socket.on('homework-progress', (data) => {
      // Emit to student's parents
      io.to(`student_${data.studentId}_updates`).emit('homework-progress-update', data);
    });

    // AI chat message
    socket.on('ai-chat-message', (data) => {
      // Broadcast to user's own room
      io.to(`user_${data.userId}`).emit('ai-response', data);
    });

    // Typing indicator
    socket.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
      socket.broadcast.emit('user-typing', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
