import { Component, Input, Signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BeagleBoard } from '../../models/beagleBoard';
import { BeagleBoardService } from '../../services/beagleBoard.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-beagle-boards',
  standalone: true,        // standalone komponenta
  imports: [CommonModule, FormsModule],
  templateUrl: './beagle-boards.component.html',
  styleUrls: ['./beagle-boards.component.scss']
})
export class BeagleBoardsComponent {
  // Sprejema signal iz App komponente
  @Input() boards!: Signal<BeagleBoard[]>;

  constructor(private beagleService: BeagleBoardService, private cdr: ChangeDetectorRef) {}

  boardNameMap: { [id: string]: string } = {};
  boardJobMap: { [id: string]: string } = {};

  // Pomožna metoda za preverjanje, ali je kartica soda (za zeleno barvo)
  isEvenIndex(index: number): boolean {
    return index % 2 === 1;
  }

  // Metoda za določanje barve lučke glede na stanje
  getStatusLightColor(board: BeagleBoard): string {
    // 1. Preveri, če je čas zadnje aktivnosti več kot 4 sekunde stare
    if (this.isTimeOlderThan4Seconds(board.time)) {
      return 'gray';
    }
    
    // 2. Preveri, če je job enak "None"
    if (board.currentJob === 'None') {
      return 'orange';
    }
    
    // 3. Če ni nobenega od zgornjih pogojev, je stanje normalno (zelena)
    return 'green';
  }

  // Metoda za preverjanje, če je čas starejši od 4 sekund
  private isTimeOlderThan4Seconds(timeString: string): boolean {
    try {
      // Odstrani morebitne presežne presledke
      const cleaned = timeString.trim();

      // Razdeli datum in čas
      const [datePart, timePart] = cleaned.split(',').map(s => s.trim());

      // Razdeli dan, mesec, leto
      const [day, month, year] = datePart.split('.').map(s => Number(s.trim()));
      const [hours, minutes, seconds] = timePart.split(':').map(Number);

      const boardTime = new Date(year, month - 1, day, hours, minutes, seconds);
      const currentTime = new Date();

      const timeDifference = currentTime.getTime() - boardTime.getTime();

      return timeDifference > 6000; // več kot 4 sekunde
    } catch (error) {
      console.error('Napaka pri parsanju časa:', error);
      return true; // V primeru napake obravnavaj kot stare podatke
    }
  }


  trackByBoard(index: number, board: BeagleBoard) {
    return board.id; // uporabiti unikaten ID vsakega boarda
  }

  onChangeDeviceName(event: KeyboardEvent, boardId: string) {
    event.preventDefault();
    const newName = this.boardNameMap[boardId];
    this.beagleService.setName(boardId, newName).subscribe(() => {
      console.log('Ime naprave posodobljeno:', newName);
      this.boardNameMap[boardId] = ''; // izbriše textarea
    });
  }

  onNewJob(event: KeyboardEvent, boardId: string) {
    event.preventDefault();
    const newJob = this.boardJobMap[boardId];
    this.beagleService.setJob(boardId, newJob).subscribe(() => {
      console.log('Job posodobljen:', newJob);
      this.boardJobMap[boardId] = ''; // izbriše textarea
    });
  }
}
