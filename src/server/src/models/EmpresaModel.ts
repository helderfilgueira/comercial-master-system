export interface Empresa {
    id?: number;
    nome: string;
    cnpj: string;
}

export class EmpresaModel implements Empresa {
    id?: number;
    nome: string;
    cnpj: string;

    constructor(data: Empresa) {
        this.id = data.id;
        this.nome = data.nome;
        this.cnpj = data.cnpj;
    }

    static fromRow(row: any): EmpresaModel {
        return new EmpresaModel({
            id: row.id,
            nome: row.nome,
            cnpj: row.cnpj,
        });
    }
}
