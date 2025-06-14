export class DiaDaFestaModel{
    dia?: string;
    hora_inicio?: string;
    hora_fim?: string;
    dia_semana?: string; 

    static newDiaDaFesta(){
        const dia_da_festa = new DiaDaFestaModel();

        return dia_da_festa;
    }
}