import { Router } from 'express';
import { logger } from '../helpers/winston/log';
import { socketData } from '../helpers/socket/socket-helper';
import { Truck } from '../models/truck';
import * as dbHelper from '../helpers/mongo/dbHelper';

export const trucksRoute = Router();

trucksRoute.use((req, res, next) => {
  logger.debug('trucks request');
  next();
});

trucksRoute.route('/')
  .get(async (req, res) => {
    try {
      res.status(200).send(socketData.trucks.map(trck => trck.data));
    } catch (error) {
      return res.status(500).send(error);
    }
  });

trucksRoute.route('/status')
  .get(async (req, res) => {
    try {
      for (const trck of socketData.trucks) {
        trck.socket.on('DRIVER_STATUS_RESPONSE', async (info) => {
          logger.info('DRIVER_STATUS_RESPONSE', info);
          const { err: findErr, doc } =
            await dbHelper.findOne(Truck, { driverId: info.payload.driverId });

          if (findErr) {
            logger.error('database error', findErr);
            return;
          }
          let truck;
          if (doc) {
            truck = doc;
            truck.geolocation = trck.data.geolocation || truck.geolocation;
            truck.status = info.payload.status || truck.status;
          } else {
            truck = new Truck({
              ...{ geolocation: { type: 'Point', coordinates: [ 0, 0 ] } },
              ...trck.data,
              ...info.payload,
            });
          }
          const err = await dbHelper.save(truck);
          if (err) {
            logger.error('database error ', err);
          }
        });
        trck.socket.emit('DRIVER_STATUS_REQUEST');
      }
      res.status(200).send('trucks information saved in db:' + socketData.trucks.length);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

trucksRoute.route('/near')
  .post(async (req, res) => {
    try {
      logger.info(JSON.stringify(req.body));
      const { lat, lng } = req.body;
      const { err: findErr, doc: trucks } =
        await dbHelper.find(Truck, {
          geolocation: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lat, lng],
              },
            },
          },
        }, { limitSize: 1 });
      if (findErr) {
        logger.error('database error', findErr);
        return res.status(500).send(findErr);
      } else if (!trucks || !trucks.length) {
        res.status(404);
      }
      res.status(200).send(trucks);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

// trucksRoute.route('/')
//   .get(async (req, res) => {
//     const trucks;
//     res.status(200).send(trucks);
//   });
