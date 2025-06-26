import { Component, inject, OnInit } from "@angular/core";
import { BotaoComponent } from "../../../components/botao/botao.component";
import { SimpleCardComponent } from "../../../components/simple-card/simple-card.component";
import { UsuarioService } from "../../../services/usuario.service";
import { Evento } from "../../../models/evento.model";
import { AulaService } from "../../../services/aula.service";
import { AdminService, AlunoResponse } from "../../../services/admin.service";
import { AulaOcorrenciaFilter } from "../../../models/AulaOcorrencia.model";
import { switchMap } from "rxjs";
import { AulaExtraFilter } from "../../../models/AulaExtra.model";
import {
	CalendarioItemComponent,
	ItemDeCalendario,
} from "../../../components/calendario-item/calendario-item.component";
import { UsuarioTipos } from "../../../models/usuario.model";

@Component({
	selector: "app-main-aluno-page",
	imports: [BotaoComponent, SimpleCardComponent, CalendarioItemComponent],
	templateUrl: "./main-aluno-page.component.html",
	styleUrl: "./main-aluno-page.component.css",
})
export class MainAlunoPageComponent implements OnInit {
	aulaService = inject(AulaService);
	adminService = inject(AdminService);
	usuarioService = inject(UsuarioService);

	aulasDoDia: ItemDeCalendario[] = [];
	proximosEventos: Evento[] = [];

	aulaNaTelaIndex: number = 0;

	ngOnInit(): void {
		let aulaArr: any[] = [];
		const d = new Date();
		// d.setDate(d.getDate() - 1);
		this.adminService
			.fetchAulasOcorrentes({
				alunos: [(this.usuarioService.usuario() as AlunoResponse).id],
				dataInicio: d,
				dataFim: d,
				orderBy: "idAula.horarioInicio",
				order: "desc",
			} as AulaOcorrenciaFilter)
			.pipe(
				switchMap((val: any) => {
					aulaArr = [
						...aulaArr,
						...val.conteudo.map((val: any) => {
							const dataIni = new Date(
								new Date(val.data).getFullYear(),
								new Date(val.data).getMonth(),
								new Date(val.data).getDate() + 1,
								val.idAula.horarioInicio.split(":")[0],
								val.idAula.horarioInicio.split(":")[1],
							);
							const dataFim = new Date(
								new Date(val.data).getFullYear(),
								new Date(val.data).getMonth(),
								new Date(val.data).getDate() + 1,
								val.idAula.horarioFim.split(":")[0],
								val.idAula.horarioFim.split(":")[1],
							);
							return {
								title: `Aula de ${val.idAula.idModalidade.nome}`,
								subtitle: `Professor: ${val.idAula.idProfessor.idUsuario.nome}`,
								tipoUsuario: UsuarioTipos.ALUNO,
								dataHorario: dataIni,
								dataHorarioFim: dataFim,
								isHomeProp: true,
							};
						}),
					];
					return this.aulaService.filterAulaExtra({
						idAluno: this.usuarioService.usuario()!.id,
						dataInicio: d,
						dataFim: d,
						status: [2],
					} as AulaExtraFilter);
				}),
			)
			.subscribe({
				next: (val: any) => {
					aulaArr = [
						...aulaArr,
						...val.conteudo.map((value: any) => {
							return {
								title: "Aula Extra ",
								subtitle: `Professor: ${value.idProfessor.idUsuario.nome}`,
								dataHorario: new Date(value.horarioInicio),
								dataHorarioFim: new Date(value.horarioFim),
								tipoUsuario: UsuarioTipos.ALUNO,
								isHomeProp: true,
							} as ItemDeCalendario;
						}),
					];
					this.aulasDoDia = [...aulaArr];
					this.aulasDoDia.sort((a, b) =>
						a.dataHorario > b.dataHorario ? 1 : -1,
					);
				},
				error: (err) => {
				},
			});

		this.adminService
			.fetchEventos({
				nome: "",
				local: "",
				data: null,
				dataInicio: d,
				alunos: null,
				pagina: 0,
				tamanho: 4,
				orderBy: "dataHoraInicio",
				order: "asc",
			})
			.subscribe({
				next: (val) => {
					this.proximosEventos = [...val.conteudo];
				},
				error: (err) => {
				},
			});
	}

	proximaAula() {
		if (this.aulaNaTelaIndex === this.aulasDoDia.length - 1) {
			this.aulaNaTelaIndex = 0;
			return;
		}
		this.aulaNaTelaIndex++;
	}

	aulaAnterior() {
		if (this.aulaNaTelaIndex === 0) {
			this.aulaNaTelaIndex = this.aulasDoDia.length - 1;
			return;
		}
		this.aulaNaTelaIndex--;
	}

	getDataTexto(evento: Evento): string {
		const data = new Date(evento.dataHoraInicio);
		const dia = data.getDate();
		const mes = data.getMonth();
		return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}`;
	}

	getHorarioTexto(evento: Evento): string {
		const dataIni = new Date(evento.dataHoraInicio);
		const dataFim = new Date(evento.dataHoraFim);
		const horarioInicio = `${dataIni.getHours().toString().padStart(2, "0")}:${dataIni.getMinutes().toString().padStart(2, "0")}`;
		const horarioFinal = `${dataFim.getHours().toString().padStart(2, "0")}:${dataFim.getMinutes().toString().padStart(2, "0")}`;
		return `${horarioInicio} às ${horarioFinal}`;
	}
}
