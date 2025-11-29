import { Router } from 'express';
import { LojaController } from '../controllers/LojaController';

const router = Router();

router.get('/', LojaController.getAll);
router.get('/:id', LojaController.getById);
router.post('/', LojaController.create);
router.put('/:id', LojaController.update);
router.delete('/:id', LojaController.delete);

export default router;
