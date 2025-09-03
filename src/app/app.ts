import { Component, signal, effect, OnDestroy } from '@angular/core';
import { StickyNoteComponent } from './component/sticky-note/sticky-note.component';
import { PieChart } from './component/pie-chart/pie-chart.component';
import { BeagleBoardsComponent } from './component/beagleBoards/beagle-boards.component';
import { BeagleBoard } from './models/beagleBoard';
import { BeagleBoardService } from './services/beagleBoard.service';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [StickyNoteComponent, PieChart, BeagleBoardsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true
})
export class App implements OnDestroy {
  protected readonly title = signal('dfp-frontend');

  boards = signal<BeagleBoard[]>([]);

  private pollingSubscription?: Subscription;

  constructor(private beagleService: BeagleBoardService) {
    this.startPolling();
  }

  private startPolling() {
    this.pollingSubscription = timer(0, 1000).pipe(
      switchMap(() => this.beagleService.getAllBeagleBoards())
    ).subscribe({
      next: (data) => this.boards.update(oldBoards => {
        data.forEach(newBoard => {
          const index = oldBoards.findIndex(b => b.id === newBoard.id);
          if (index !== -1) {
            oldBoards[index] = newBoard;
          } else {
            oldBoards.push(newBoard);
          }
        });
        return [...oldBoards]; // signal še vedno potrebuje nov reference
      }),
      error: (err) => console.error('Napaka pri pridobivanju BeagleBoard:', err)
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}
