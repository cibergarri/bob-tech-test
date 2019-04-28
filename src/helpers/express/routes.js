import { Router } from 'express';
import { trucksRoute } from '../../controllers/trucks';
// import { driversRoute } from '../../controllers/drivers';
// import { docsRoute } from '../swagger/docs';
// import { logRequestsMiddleware } from '../../middlewares/log';

const apiRoutes = Router();
apiRoutes.use('/Trucks', trucksRoute);
// apiRoutes.use('/Drivers', driversRoute);

const rootRoute = (req, res) => {
  res.send('Welcome!');
};

export const routes = Router();
// routes.use(logRequestsMiddleware);
// routes.use('/api-docs', docsRoute);
routes.use('/api', apiRoutes);
routes.get('/', rootRoute);
