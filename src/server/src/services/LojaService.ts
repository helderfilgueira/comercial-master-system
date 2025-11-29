import { getDb } from '../database/sqlite';
import { Loja, LojaModel } from '../models/LojaModel';

export class LojaService {
    private static addToSyncQueue(tabela: string, registro_id: number, operacao: string) {
        const db = getDb();
        db.prepare(`
      INSERT INTO sync_queue (tabela, registro_id, operacao, enviado)
      VALUES (?, ?, ?, 0)
    `).run(tabela, registro_id, operacao);
    }

    static create(data: Loja): LojaModel {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO loja (empresa_id, nome, endereco, cidade, uf)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.empresa_id, data.nome, data.endereco, data.cidade, data.uf);

        const id = result.lastInsertRowid as number;
        this.addToSyncQueue('loja', id, 'insert');

        return new LojaModel({ ...data, id });
    }

    static findById(id: number): LojaModel | null {
        const db = getDb();
        const row = db.prepare('SELECT * FROM loja WHERE id = ?').get(id);
        return row ? LojaModel.fromRow(row) : null;
    }

    static findAll(): LojaModel[] {
        const db = getDb();
        const rows = db.prepare('SELECT * FROM loja').all();
        return rows.map(row => LojaModel.fromRow(row));
    }

    static update(id: number, data: Partial<Loja>): LojaModel | null {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.empresa_id !== undefined) {
            fields.push('empresa_id = ?');
            values.push(data.empresa_id);
        }
        if (data.nome !== undefined) {
            fields.push('nome = ?');
            values.push(data.nome);
        }
        if (data.endereco !== undefined) {
            fields.push('endereco = ?');
            values.push(data.endereco);
        }
        if (data.cidade !== undefined) {
            fields.push('cidade = ?');
            values.push(data.cidade);
        }
        if (data.uf !== undefined) {
            fields.push('uf = ?');
            values.push(data.uf);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        db.prepare(`UPDATE loja SET ${fields.join(', ')} WHERE id = ?`).run(...values);

        this.addToSyncQueue('loja', id, 'update');
        return this.findById(id);
    }

    static delete(id: number): boolean {
        const db = getDb();
        const result = db.prepare('DELETE FROM loja WHERE id = ?').run(id);

        if (result.changes > 0) {
            this.addToSyncQueue('loja', id, 'delete');
            return true;
        }
        return false;
    }
}
