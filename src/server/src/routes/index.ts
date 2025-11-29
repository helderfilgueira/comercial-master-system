import { Router } from 'express';
import userRoutes from './user.routes';
import empresaRoutes from './empresa.routes';
import lojaRoutes from './loja.routes';
import cargoRoutes from './cargo.routes';
import usuarioRoutes from './usuario.routes';
import usuarioLojaRoutes from './usuarioLoja.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/empresa', empresaRoutes);
router.use('/loja', lojaRoutes);
router.use('/cargo', cargoRoutes);
router.use('/usuario', usuarioRoutes);
router.use('/usuario-loja', usuarioLojaRoutes);

export default router;
