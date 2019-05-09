import socketIo from 'socket.io';
import { logger } from '../winston/log';

const STATUS_RESPONSE_TIMEOUT = 10000;
export const socketData = {
  trucks: {},
};

export const initializeSocket = (server) => {
  const io = socketIo(server);
  io.on('connection', (socket) => {
    logger.info('Client connected');
    for (const [ key, event ] of Object.entries(eventActions)) {
      socket.on(key, event(socket));
    }
  });
  return io;
};

export const getStatusResponse = (socket) => {
  return new Promise((resolve, reject) => {
    try {
      const timeout = setTimeout(() => {
        logger.warn('status response timeout');
        resolve();
      }, STATUS_RESPONSE_TIMEOUT);

      socket.once('DRIVER_STATUS_RESPONSE', (info) => {
        clearTimeout(timeout);
        logger.info('DRIVER_STATUS_RESPONSE', info);
        resolve((info || {}).payload);
      });
      socket.emit('DRIVER_STATUS_REQUEST');
    } catch (err) {
      reject(err);
    }
  });
};

const handlePing = (socket) => (info) => {
  const driverId = info.payload;
  socketData.trucks[driverId] =
    socketData.trucks[driverId] || { data: { driverId } };

  socketData.trucks[driverId].socket = socket;
  logger.info(`ping info: ${JSON.stringify(info)}`);
  logCurrentConnections();
  socket.emit('PONG', info);
};

const addGeolocalization = (socket) => (info) => {
  logger.info(`DRIVER_GEOLOCATION info: ${JSON.stringify(info)}`);
  const driverId = info.payload.driverId;
  const geolocation = {
    type: 'Point',
    coordinates: [ info.payload.lat, info.payload.lng ],
  };
  const truckInfo = socketData.trucks[driverId];
  if (truckInfo) {
    truckInfo.data.geolocation = geolocation;
  } else {
    socketData.trucks[driverId] = {
      data: { driverId, geolocation },
      socket,
    };
  }
};

const disconnect = (socket) => (info) => {
  logger.info(`disconnect info: ${JSON.stringify(info)}`);
  const truck = Object.values(socketData.trucks)
    .find((trck) => trck.socket === socket);

  if (truck) {
    delete truck.socket;
  }
  logger.info('client disconnected');
  logCurrentConnections();
};

const logCurrentConnections = () => {
  logger.info(`connected clients ${Object.values(socketData.trucks).filter(trck => trck.socket).length}`);
};

const eventActions = {
  PING: handlePing,
  DRIVER_GEOLOCATION: addGeolocalization,
  DISCONNECT: disconnect,
};
