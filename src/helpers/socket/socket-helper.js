import socketIo from 'socket.io';
import { logger } from '../winston/log';

const STATUS_RESPONSE_TIMEOUT = 10000;
export const socketData = {
  trucks: [],
};

export const initializeSocket = (server) => {
  const io = socketIo(server);
  io.on('connection', (socket) => {
    const truck = { data: {}, socket };
    logger.info('Client connected');
    socket.on('PING', (info) => {
      truck.data.driverId = info.payload;
      socketData.trucks.push(truck);
      logger.info(`ping info: ${JSON.stringify(info)}`);
      io.emit('PONG', info);
    });

    socket.on('DRIVER_GEOLOCATION', (info) => {
      logger.info('DRIVER_GEOLOCATION', info);
      logger.info(`DRIVER_GEOLOCATION info: ${JSON.stringify(info)}`);
      const geolocation = { type: 'Point', coordinates: [ info.payload.lat, info.payload.lng ] };
      const truckInfo = socketData.trucks.find((trck) => trck.data.driverId === info.payload.driverId);
      if (truckInfo) {
        truckInfo.data = { driverId: info.payload.driverId, geolocation };
      } else {
        socketData.trucks.push({
          socket,
          data: { driverId: info.payload.driverId, geolocation },
        });
      }
    });

    socket.on('disconnect', (info) => {
      logger.info(`disconnect info: ${JSON.stringify(info)}`);
      socketData.trucks = socketData.trucks.filter(trck => trck.socket !== socket);
      logger.info('client disconnected');
      logger.info(`connected clients ${socketData.trucks.length}`);
    });
    logger.info(`connected clients ${socketData.trucks.length}`);
  });
  return io;
};

export const getStatusResponse = (socket) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, STATUS_RESPONSE_TIMEOUT);
      socket.once('DRIVER_STATUS_RESPONSE', (info) => {
        logger.info('DRIVER_STATUS_RESPONSE', info);
        resolve((info || {}).payload);
      });
      socket.emit('DRIVER_STATUS_REQUEST');
    } catch (err) {
      reject(err);
    }
  });
};
