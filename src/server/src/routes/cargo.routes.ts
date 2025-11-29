import { Router } from 'express';
import { CargoController } from '../controllers/CargoController';

const router = Router();

router.get('/', CargoController.getAll);
router.get('/:id', CargoController.getById);
router.post('/', CargoController.create);
router.put('/:id', CargoController.update);
router.delete('/:id', CargoController.delete);

export default router;
