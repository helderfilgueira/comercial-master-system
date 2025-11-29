import { Router } from 'express';
import { UsuarioLojaController } from '../controllers/UsuarioLojaController';

const router = Router();

router.get('/', UsuarioLojaController.getAll);
router.get('/:id', UsuarioLojaController.getById);
router.post('/', UsuarioLojaController.create);
router.put('/:id', UsuarioLojaController.update);
router.delete('/:id', UsuarioLojaController.delete);

export default router;
