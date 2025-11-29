import { Request, Response } from 'express';
import { UsuarioService } from '../services/UsuarioService';

export class UsuarioController {
    static async getAll(req: Request, res: Response) {
        try {
            const usuarios = UsuarioService.findAll();
            res.json(usuarios);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch usuarios' });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const usuario = UsuarioService.findById(id);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario not found' });
            }

            res.json(usuario);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch usuario' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const usuario = UsuarioService.create(req.body);
            res.status(201).json(usuario);
        } catch (error) {
            res.status(400).json({ error: 'Failed to create usuario' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const usuario = UsuarioService.update(id, req.body);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario not found' });
            }

            res.json(usuario);
        } catch (error) {
            res.status(400).json({ error: 'Failed to update usuario' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = UsuarioService.delete(id);

            if (!success) {
                return res.status(404).json({ error: 'Usuario not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete usuario' });
        }
    }
}
