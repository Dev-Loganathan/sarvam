import { Router } from 'express';
import { getCountries, getStates, getCities, getDistricts } from '../controllers/master-controller';

const router = Router();

router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/districts', getDistricts);

export default router;
