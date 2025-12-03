import {Component, inject} from '@angular/core';
import {CharacterThumbnail} from '../../thumbnail/character-thumbnail/character-thumbnail';
import {WorldCharacterInfo} from '../../worldcharacter';
import {WorldCharacterService} from '../../services/world-character.service';

@Component({
  selector: 'app-character-home',
  imports: [CharacterThumbnail],
  templateUrl: 'character-home.html',
  styleUrls: ['../pages.css', 'character-home.css', '../../../styles.css'],
})

export class CharacterHome {
  characterService: WorldCharacterService = inject(WorldCharacterService);
  filteredCharacterList: WorldCharacterInfo[] = [];
  worldCharacterList: WorldCharacterInfo[] = [];

  constructor() {
    this.characterService
      .getAllWorldCharacters()
      .then((worldCharacterList: WorldCharacterInfo[]) => {
        this.worldCharacterList = worldCharacterList;
        this.filteredCharacterList = worldCharacterList;
      });
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredCharacterList = this.worldCharacterList;
      return;
    }
    
    this.filteredCharacterList = this.worldCharacterList.filter((worldCharacter) =>
      worldCharacter?.tags.join(' ').toLowerCase().includes(text.toLowerCase()) ||
      worldCharacter?.firstName.toLowerCase().includes(text.toLowerCase()) ||
      worldCharacter?.lastName.toLowerCase().includes(text.toLowerCase()) ||
      worldCharacter?.altNames.join(' ').toLowerCase().includes(text.toLowerCase())
    );
  }

  addWorldCharacter() {
    console.log('Adding new character');
    this.characterService.createWorldCharacter('New Character', '', [], '', '', [], [], [], '', '', [], []);
  }
}