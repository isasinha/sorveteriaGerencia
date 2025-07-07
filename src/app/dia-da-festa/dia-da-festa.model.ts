export interface DiaDaFestaModel{
    firebaseId?: string,
    idDia?: number,
    dia?: string,
    hora_inicio?: Date,
    hora_fim?: Date,
    dia_semana?: string
}

export function newDiaDaFesta(): DiaDaFestaModel{
    const dia_da_festa: DiaDaFestaModel = {
        idDia: 0,
        dia: "",
        hora_inicio: new Date(),
        hora_fim: new Date(),
        dia_semana: ""
    }

    return dia_da_festa;
}
