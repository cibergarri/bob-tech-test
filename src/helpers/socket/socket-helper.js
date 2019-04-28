import socketIo from 'socket.io';
import { logger } from '../winston/log';

export const socketData = {
  trucks: [],
};

export const initializeSocket = (server) => {
  const io = socketIo(server);
  io.on('connection', (socket) => {
    const truck = { data: {}, socket };
    logger.info('Client connected');
    socket.on('PING', (info) => {
      io.emit('PONG', info);
    });

    socket.on('DRIVER_GEOLOCATION', (info) => {
      logger.info('DRIVER_GEOLOCATION', info);
      const geolocation = { type: 'Point', coordinates: [ info.payload.lat, info.payload.lng ] };
      const truckInfo = socketData.trucks.find((trck) => trck.socket === socket);
      if (truckInfo) {
        truckInfo.data = { driverId: info.payload.driverId, geolocation };
      } else {
        socketData.trucks.push({
          socket,
          data: { driverId: info.payload.driverId, geolocation },
        });
      }
    });

    socket.on('disconnect', () => {
      socketData.trucks = socketData.trucks.filter(trck => trck.socket !== socket);
      logger.info('client disconnected');
      logger.info(`connected clients ${socketData.trucks.length}`);
    });
    socketData.trucks.push(truck);
    logger.info(`connected clients ${socketData.trucks.length}`);
  });
  return io;
};
