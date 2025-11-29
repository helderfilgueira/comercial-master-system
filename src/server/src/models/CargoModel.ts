export interface Cargo {
    id?: number;
    nome: string;
    permissoes: string;
}

export class CargoModel implements Cargo {
    id?: number;
    nome: string;
    permissoes: string;

    constructor(data: Cargo) {
        this.id = data.id;
        this.nome = data.nome;
        this.permissoes = data.permissoes;
    }

    static fromRow(row: any): CargoModel {
        return new CargoModel({
            id: row.id,
            nome: row.nome,
            permissoes: row.permissoes,
        });
    }
}
