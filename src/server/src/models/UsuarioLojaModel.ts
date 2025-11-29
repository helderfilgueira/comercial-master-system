export interface UsuarioLoja {
    id?: number;
    usuario_id: number;
    loja_id: number;
}

export class UsuarioLojaModel implements UsuarioLoja {
    id?: number;
    usuario_id: number;
    loja_id: number;

    constructor(data: UsuarioLoja) {
        this.id = data.id;
        this.usuario_id = data.usuario_id;
        this.loja_id = data.loja_id;
    }

    static fromRow(row: any): UsuarioLojaModel {
        return new UsuarioLojaModel({
            id: row.id,
            usuario_id: row.usuario_id,
            loja_id: row.loja_id,
        });
    }
}
