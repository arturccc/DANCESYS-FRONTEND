import { Component, inject, ViewChild } from "@angular/core";
import { Aula, AulaFilter } from "../../../../../models/Aula.model";
import { ModalComponent } from "../../../../../components/modal/modal.component";
import { SimpleTableComponent } from "../../../../../components/simple-table/simple-table.component";
import { SearchBoxMultiComponent } from "../../../../../components/search-box-multi/search-box-multi.component";
import { MultiSelectInputComponent } from "../../../../../components/multi-select-input/multi-select-input.component";
import {
	Form,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from "@angular/forms";
import {
	AdminService,
	ProfessorResponse,
} from "../../../../../services/admin.service";
import { Modalidade } from "../../../../../models/modalidade.model";
import { ModalidadesService } from "../../../../../services/modalidades.service";
import { BotaoComponent } from "../../../../../components/botao/botao.component";
import { CommonModule } from "@angular/common";
import { UsuarioFiltro } from "../../../../../models/usuario.model";
import { SalaService } from "../../../../../services/sala.service";
import { Sala } from "../../../../../models/Sala.model";
import { AlertService } from "../../../../../services/Alert.service";
import { AlunoFilter } from "../../../../../models/aluno.model";
import { ProfessorFiltro } from "../../../../../models/professor.model";
import { SearchBoxSingleComponent } from "../../../../../components/search-box-single/search-box-single.component";

enum ToggleModal {
	NEW = "Criar Aula",
	EDIT = "Editar Aula",
}

@Component({
	selector: "app-aulas-fixas-admin-page",
	standalone: true,
	imports: [
		ModalComponent,
		SimpleTableComponent,
		SearchBoxMultiComponent,
		MultiSelectInputComponent,
		ReactiveFormsModule,
		BotaoComponent,
		CommonModule,
		SearchBoxSingleComponent
	],
	templateUrl: "./aulas-fixas-admin-page.component.html",
	styleUrl: "./aulas-fixas-admin-page.component.css",
})
export class AulasFixasAdminPageComponent {
	@ViewChild(SimpleTableComponent) tabela!: SimpleTableComponent;

	filterForm: FormGroup;
	aulaForm: FormGroup;

	adminService = inject(AdminService);
	modalidadeService = inject(ModalidadesService);
	salaService = inject(SalaService);
	alertService = inject(AlertService);

	ToggleModal = ToggleModal;
	paginaAtual: number = 0;
	itensPage: number = 10;
	orderByValue: string = '';
	orderValue: string = '';
	isModalOpen: boolean = false;
	isModalConfirm: boolean = false;
	isEdit: boolean = false;
	isLoading: boolean = false

	statusId!: number;

	diaSemanaMap: Record<number, string> = {
		1: "Segunda",
		2: "Terça",
		3: "Quarta",
		4: "Quinta",
		5: "Sexta",
		6: "Sábado",
		7: "Domingo",
	};

	statusMap: Record<number, string> = {
		0: "Desativa",
		1: "Ativa",
	};

	colunas = [
		{ chave: "idProfessor.idUsuario.nome", titulo: "Professor" },
		{ chave: "horarioInicio", titulo: "Inicio" },
		{ chave: "horarioFim", titulo: "Fim" },
		{
			chave: "diaSemana",
			titulo: "Dia",
			width: "10%",
			formatar: (valor: number) =>
				this.diaSemanaMap[valor] ?? String(valor),
		},
		{ chave: "idModalidade.nome", titulo: "Modalidade" },
		{
			chave: "status",
			titulo: "Status",
			width: "10%",
			formatar: (valor: number) => this.statusMap[valor] ?? String(valor),
		},
	];

	acoes = [
		{
			icon: "edit",
			title: "Editar",
			cor: "black_blue",
			callback: (item: any) => this.editar(item),
		},
		{
			text: "Mudar status",
			title: "Status",
			cor: "dark",
			callback: (item: any) => this.status(item),
		},
	];

	constructor(private fb: FormBuilder) {
		this.filterForm = this.fb.group({
			dias: [],
			professores: [],
			modalidades: [],
			tamanho: [],
			pagina: [],
			orderBy: [],
			order: []
		});

		this.aulaForm = this.fb.group({
			id: [],
			diaSemana: [],
			horarioInicio: [],
			horarioFim: [],
			maxAlunos: [[Validators.required, Validators.min(1)]],
			nivel: [],
			status: [],
			idSala: [],
			idModalidade: [],
			idProfessor: [],
			alunos: [[]],
		});
	}

	diasObj = [
		{ dia: 1, nome: "Segunda" },
		{ dia: 2, nome: "Terça" },
		{ dia: 3, nome: "Quarta" },
		{ dia: 4, nome: "Quinta" },
		{ dia: 5, nome: "Sexta" },
		{ dia: 6, nome: "Sabado" },
		{ dia: 7, nome: "Domingo" },
	];

	diasFilter: number[] = [];
	modalidadesFilter: number[] = [];
	professorFilter: number[] = [];
	modalidadesObj: Modalidade[] = [];
	professoresObj: ProfessorResponse[] = [];
	salasObj: Sala[] = [];
	alunosFilterLs: any = [];
	aulaObj: any = [];
	selectAlunos: number[] = [];

	ngOnInit() {
		this.carregarModalidade();
		this.carregarSalas();
		this.buscar();
	}

	carregarModalidade() {
		this.modalidadeService.fetchModalidades().subscribe({
			next: (response) => {
				this.modalidadesObj = response;
			},
			error: (err: any) => {},
		});
	}

	buscarProfessores(termo: any) {
		const filtro: ProfessorFiltro = {
			nome: termo,
			email: "",
			cpf: "",
			status: 1,
		};
	
		this.adminService.filterProfessores(filtro).subscribe({
			next: (response) => {
				this.professoresObj = response.conteudo;
			},
		});
	}

	carregarSalas() {
		this.salaService.fetchSalas().subscribe({
			next: (response) => {
				this.salasObj = response;
			},
		});
	}

	getFormValue() {
		const item = this.aulaForm.value;
		const aulaItem: Aula = item;

		return aulaItem;
	}

	preencherFormValue(item: any) {
		this.alunosFilterLs = this.getAlunos(item.alunos);
		this.professoresObj = [item.idProfessor]

		this.aulaForm = this.fb.group({
			id: [item.id],
			diaSemana: [item.diaSemana],
			horarioInicio: [item.horarioInicio],
			horarioFim: [item.horarioFim],
			maxAlunos: [item.maxAlunos],
			nivel: [item.nivel],
			status: [item.status],
			idSala: [item.idSala.id],
			idModalidade: [item.idModalidade.id],
			idProfessor: [item.idProfessor.id],
			alunos: [this.getAlunosIds(item.alunos)],
		});
	}

	resertFormValue() {
		this.aulaForm = this.fb.group({
			id: [],
			diaSemana: [],
			horarioInicio: [],
			horarioFim: [],
			maxAlunos: [[Validators.required, Validators.min(1)]],
			nivel: [],
			status: [],
			idSala: [],
			idModalidade: [],
			idProfessor: [],
			alunos: [[]],
		});
	}

	getfilter() {
		this.filterForm.get("tamanho")?.setValue(this.itensPage);
		this.filterForm.get("pagina")?.setValue(this.paginaAtual);
		this.filterForm.get("orderBy")?.setValue(this.orderByValue);
		this.filterForm.get("order")?.setValue(this.orderValue);

		return this.filterForm.value;
	}

	resetFilter(){
		this.filterForm = this.fb.group({
			dias: [],
			professores: [],
			modalidades: [],
			tamanho: [],
			pagina: [],
			orderBy: [],
			order: []
		});
	}

	onFilter() {
		this.tabela.isLoad(true);
		this.paginaAtual = 0;
		this.tabela.resetPage();
		this.buscar();
	}

	buscar() {
		this.adminService.filterAulas(this.getfilter()).subscribe({
			next: (response: any) => {
				if (response.total == 0) {
					this.alertService.info("Nenhum registro encontrado!");
				} else {
					this.aulaObj = response;
				}
				this.tabela.isLoad(false);
			},
			error: (err: any) => {},
		});
	}

	salvar() {
		const formValue: Aula = this.getFormValue();
		if (formValue.maxAlunos < formValue.alunos.length) {
			this.alertService.info("Maximo de alunos ultrapassado!");
			return;
		}

		this.isLoading = true
		this.adminService.addAula(formValue).subscribe({
			next: (response) => {
				this.buscar();
				this.resertFormValue();
				this.closeModal();
				this.alertService.sucesso(
					this.isEdit
						? "Aula editada com sucesso"
						: "Aula criada com sucesso",
				);
				this.isLoading = false
			},
		});
	}

	editar(item: any) {
		this.preencherFormValue(item);
		this.openModal();
	}

	status(item: any) {
		this.statusId = item.id;
		this.isModalConfirm = true;
	}

	onConfirmStatus(choice: boolean | void) {
		if (choice) {
			this.isLoading = true
			this.adminService.alterarStatusAula(this.statusId).subscribe({
				next: () => {
					this.isLoading = false
					this.buscar();
					this.alertService.info("Status da aula alterado!");
				},
				error: (err) => {},
			});
		}
		this.statusId = 0;
		this.isModalConfirm = false;
	}

	getAlunosIds(item: any) {
		const ids: any[] = [];
		item.forEach((i: any) => {
			ids.push(i.idAluno.id);
		});

		return ids;
	}

	getAlunos(item: any) {
		const alunos: any = [];
		item.forEach((i: any) => {
			alunos.push(i.idAluno);
		});

		return alunos;
	}

	closeModal() {
		this.isModalOpen = false;
		this.professoresObj = []
	}

	openModal() {
		this.isModalOpen = true;
		this.professoresObj = []
	}

	isFormValido(): boolean {
		return this.aulaForm.valid;
	}

	buscarAluno(termo: any) {
		const filtro: AlunoFilter = {
			nome: termo,
			email: "",
			cpf: "",
			tipo: 1,
			status: 1,
		};
		this.adminService.filterAlunos(filtro).subscribe({
			next: (response) => {
				this.alunosFilterLs = response.conteudo;
			},
		});
	}

	onPaginacaoChange(event: { paginaSelecionada: number; itensPage: number }) {
		this.tabela.isLoad(true);
		this.paginaAtual = --event.paginaSelecionada;
		this.itensPage = event.itensPage;
		this.buscar();
	}

	onAlunoChange(alunos: any[]) {
		this.selectAlunos = alunos;
	}

	onDiasChange(selected: number[]) {
		this.diasFilter = selected;
	}

	onModalidadeChange(selected: number[]) {
		this.modalidadesFilter = selected;
	}

	onProfessoresChange(selected: number[]) {
		this.professorFilter = selected;
	}

	orderBy(event: { chave: string; direcao: "asc" | "desc" }) {
		this.tabela.isLoad(true);
		this.orderByValue = event.chave;
		this.orderValue = event.direcao;
		this.buscar();
	}
}
