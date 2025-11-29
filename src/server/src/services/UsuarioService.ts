import { getDb } from '../database/sqlite';
import { Usuario, UsuarioModel } from '../models/UsuarioModel';

export class UsuarioService {
    private static addToSyncQueue(tabela: string, registro_id: number, operacao: string) {
        const db = getDb();
        db.prepare(`
      INSERT INTO sync_queue (tabela, registro_id, operacao, enviado)
      VALUES (?, ?, ?, 0)
    `).run(tabela, registro_id, operacao);
    }

    static create(data: Usuario): UsuarioModel {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO usuario (empresa_id, cargo_id, nome, email, senha_hash, ativo)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.empresa_id, data.cargo_id, data.nome, data.email, data.senha_hash, data.ativo ?? 1);

        const id = result.lastInsertRowid as number;
        this.addToSyncQueue('usuario', id, 'insert');

        return new UsuarioModel({ ...data, id });
    }

    static findById(id: number): UsuarioModel | null {
        const db = getDb();
        const row = db.prepare('SELECT * FROM usuario WHERE id = ?').get(id);
        return row ? UsuarioModel.fromRow(row) : null;
    }

    static findAll(): UsuarioModel[] {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM usuario').all();
        return rows.map(row => UsuarioModel.fromRow(row));
    }

    static update(id: number, data: Partial<Usuario>): UsuarioModel | null {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.empresa_id !== undefined) {
            fields.push('empresa_id = ?');
            values.push(data.empresa_id);
        }
        if (data.cargo_id !== undefined) {
            fields.push('cargo_id = ?');
            values.push(data.cargo_id);
        }
        if (data.nome !== undefined) {
            fields.push('nome = ?');
            values.push(data.nome);
        }
        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.senha_hash !== undefined) {
            fields.push('senha_hash = ?');
            values.push(data.senha_hash);
        }
        if (data.ativo !== undefined) {
            fields.push('ativo = ?');
            values.push(data.ativo);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        db.prepare(`UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`).run(...values);

        this.addToSyncQueue('usuario', id, 'update');
        return this.findById(id);
    }

    static delete(id: number): boolean {
        const db = getDb();
        const result = db.prepare('DELETE FROM usuario WHERE id = ?').run(id);

        if (result.changes > 0) {
            this.addToSyncQueue('usuario', id, 'delete');
            return true;
        }
        return false;
    }
}
