import { Request, Response } from 'express';
import { UsuarioLojaService } from '../services/UsuarioLojaService';

export class UsuarioLojaController {
    static async getAll(req: Request, res: Response) {
        try {
            const usuarioLojas = UsuarioLojaService.findAll();
            res.json(usuarioLojas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch usuario-loja assignments' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const usuarioLoja = UsuarioLojaService.findById(id);

            if (!usuarioLoja) {
                return res.status(404).json({ error: 'Usuario-loja assignment not found' });
            }

            res.json(usuarioLoja);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch usuario-loja assignment' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const usuarioLoja = UsuarioLojaService.create(req.body);
            res.status(201).json(usuarioLoja);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create usuario-loja assignment' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const usuarioLoja = UsuarioLojaService.update(id, req.body);

            if (!usuarioLoja) {
                return res.status(404).json({ error: 'Usuario-loja assignment not found' });
            }

            res.json(usuarioLoja);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update usuario-loja assignment' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = UsuarioLojaService.delete(id);

            if (!success) {
                return res.status(404).json({ error: 'Usuario-loja assignment not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete usuario-loja assignment' });
        }
    }
}
