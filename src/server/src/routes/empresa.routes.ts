import { Router } from 'express';
import { EmpresaController } from '../controllers/EmpresaController';

const router = Router();

router.get('/', EmpresaController.getAll);
router.get('/:id', EmpresaController.getById);
router.post('/', EmpresaController.create);
router.put('/:id', EmpresaController.update);
router.delete('/:id', EmpresaController.delete);

export default router;
