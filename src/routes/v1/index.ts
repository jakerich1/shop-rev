import { Router } from 'express';
import { partnersController } from '../../controllers/partnersController';
import { appController } from '../../controllers/appController';

const router: Router = Router();

router.get('/partners', partnersController);

router.get('/app', appController)

export const v1Routes: Router = router;