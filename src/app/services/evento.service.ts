import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { FigurinoAluno, FigurinoAlunoFilter } from "../models/FigurinoAluno.model";
import { environment } from "../../environment/environment";
import { Figurino, FigurinoFilter } from "../models/Figurino.model";
import { Ingresso } from "../models/Ingresso.model";

@Injectable({
	providedIn: "root",
})
export class EventoService {
	http = inject(HttpClient);

    url: string = `${environment.API_URL}evento/`

	public filterFigurinoAluno(filtro: FigurinoAlunoFilter){
		return this.http.post(`${this.url}figurino/aluno/buscar`, {
            ...filtro,
        });
	}

    public filterfigurno(filtro: FigurinoFilter){
        return this.http.post(`${this.url}figurino/buscar`, {
            ...filtro,
        });
    }

    public salvarFigurinoAluno(item: FigurinoAluno){
        return this.http.post(`${this.url}figurino/aluno`, {
            ...item,
        });
    }

    public excluirFigurinoAluno(id: number){
        return this.http.delete(`${this.url}figurino/aluno/excluir/${id}`)
    }

    public toogleStatusFigurinoAluno(id: number){
        return this.http.get(`${this.url}figurino/aluno/status/${id}`);
    }

    public filterFigurino(filtro: FigurinoFilter){
        return this.http.post(`${this.url}figurino/buscar`, { ...filtro })
    }

    public salvarFigurino(item: Figurino){
        return this.http.post(`${this.url}figurino`, { ...item })
    }

    public excluirFigurino(id: number){
        return this.http.delete(`${this.url}figurino/excluir/${id}`)
    }

    public gerarIngresso(item: Ingresso){
        return this.http.post(`${this.url}ingresso`, { ...item })
    }
}