import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WorkspacePage } from '../workspace/workspace-page';
import { PageStateComponent } from '../../shared/ui/page-state/page-state.component';
import { RecordFormComponent } from '../../shared/ui/record-form/record-form.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [
    PageStateComponent,
    RecordFormComponent,
    ButtonComponent,
    EmptyStateComponent,
    FormsModule,
  ],
  templateUrl: './clientes.page.html',
  styleUrl: './clientes.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesPage extends WorkspacePage {}
