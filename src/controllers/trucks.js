import { Router } from 'express';
import { logger } from '../helpers/winston/log';
import { socketData, getStatusResponse } from '../helpers/socket/socket-helper';
import { Truck } from '../models/truck';
import * as dbHelper from '../helpers/mongo/dbHelper';

export const trucksRoute = Router();

trucksRoute.route('/')
  .get(async (req, res) => {
    try {
      const { err: findErr, doc: trucks } =
        await dbHelper.find(Truck, {});

      if (findErr) {
        logger.error('database error', findErr);
        return;
      }
      res.status(200).send(trucks);
    } catch (error) {
      return res.status(500).send(error);
    }
  });

trucksRoute.route('/connected')
  .get(async (req, res) => {
    try {
      const connectedTrucks = Object.values(socketData.trucks).filter(trck => trck.socket);
      res.status(200).send(connectedTrucks.map(trck => trck.data));
    } catch (error) {
      return res.status(500).send(error);
    }
  });

trucksRoute.route('/status')
  .get(async (req, res) => {
    try {
      const promises = Object.values(socketData.trucks)
        .map(async (trck) => {
          const payload =
            await getStatusResponse(trck.socket);

          if (!payload || !payload.driverId) {
            return;
          }
          const filter = { driverId: payload.driverId };
          const { err: findErr, doc } =
            await dbHelper.findOne(Truck, filter);

          if (findErr) {
            logger.error('database error', findErr);
            return;
          }

          let truck;
          if (doc) {
            truck = doc;
            truck.geolocation = trck.data.geolocation || truck.geolocation;
            if (payload.status) {
              truck.status = payload.status;
              trck.data.status = payload.status;
            }
          } else {
            truck = new Truck({
              ...{ geolocation: { type: 'Point', coordinates: [ 90, 0 ] } },
              ...trck.data,
              ...payload,
            });
          }
          const err = await dbHelper.save(truck);
          if (err) {
            logger.error('database error ', err);
          }
          return truck;
        });

      const result =
        await Promise.all(promises);

      res.status(200).send(result.filter(rs => rs !== undefined));
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
