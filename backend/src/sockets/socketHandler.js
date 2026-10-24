let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join owner notification room
    socket.on('join_owner_room', (data) => {
      socket.join('owner_room');
      // console.log(`[Socket.io] Socket ${socket.id} joined owner_room`);
    });

    // Join customer room for personalized real-time order updates
    socket.on('join_customer_room', (customerId) => {
      if (customerId) {
        socket.join(`customer_${customerId}`);
        // console.log(`[Socket.io] Socket ${socket.id} joined customer_${customerId}`);
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocket,
  getIO
};
