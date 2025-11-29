import { getDb } from '../database/sqlite';
import { UsuarioLoja, UsuarioLojaModel } from '../models/UsuarioLojaModel';

export class UsuarioLojaService {
    private static addToSyncQueue(tabela: string, registro_id: number, operacao: string) {
        const db = getDb();
        db.prepare(`
      INSERT INTO sync_queue (tabela, registro_id, operacao, enviado)
      VALUES (?, ?, ?, 0)
    `).run(tabela, registro_id, operacao);
    }

    static create(data: UsuarioLoja): UsuarioLojaModel {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO usuario_loja (usuario_id, loja_id)
      VALUES (?, ?)
    `).run(data.usuario_id, data.loja_id);

        const id = result.lastInsertRowid as number;
        this.addToSyncQueue('usuario_loja', id, 'insert');

        return new UsuarioLojaModel({ ...data, id });
    }

    static findById(id: number): UsuarioLojaModel | null {
        const db = getDb();
        const row = db.prepare('SELECT * FROM usuario_loja WHERE id = ?').get(id);
        return row ? UsuarioLojaModel.fromRow(row) : null;
    }

    static findAll(): UsuarioLojaModel[] {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM usuario_loja').all();
        return rows.map(row => UsuarioLojaModel.fromRow(row));
    }

    static update(id: number, data: Partial<UsuarioLoja>): UsuarioLojaModel | null {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.usuario_id !== undefined) {
            fields.push('usuario_id = ?');
            values.push(data.usuario_id);
        }
        if (data.loja_id !== undefined) {
            fields.push('loja_id = ?');
            values.push(data.loja_id);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        db.prepare(`UPDATE usuario_loja SET ${fields.join(', ')} WHERE id = ?`).run(...values);

        this.addToSyncQueue('usuario_loja', id, 'update');
        return this.findById(id);
    }

    static delete(id: number): boolean {
        const db = getDb();
        const result = db.prepare('DELETE FROM usuario_loja WHERE id = ?').run(id);

        if (result.changes > 0) {
            this.addToSyncQueue('usuario_loja', id, 'delete');
            return true;
        }
        return false;
    }
}
