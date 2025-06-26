import { Component } from "@angular/core";
import {
	InternalSidebarComponent,
	InternalSidebarRoute,
} from "../../../../components/internal-sidebar/internal-sidebar.component";
import { RouterOutlet } from "@angular/router";

@Component({
	selector: "app-aulas-admin-page",
	imports: [InternalSidebarComponent, RouterOutlet],
	templateUrl: "./aulas-admin-page.component.html",
	styleUrl: "./aulas-admin-page.component.css",
})
export class AulasAdminPageComponent {
	sidebarRoutes: InternalSidebarRoute[] = [
		{ label: "Aulas Fixas", route: "fixas" },
		{ label: "Aulas Recorrentes", route: "recorrentes" },
		{ label: "Aulas Extras", route: "extras" },
		{ label: "Aulas Experimentais", route: "experimentais"}
	];
}
