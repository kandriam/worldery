import { Component, Input, inject } from '@angular/core';
import { WorldStoryInfo } from '../../../../worldstory';
import { RouterLink } from '@angular/router';
import { WorldCharacterService } from '../../../../services/world-character.service';
import { WorldLocationService } from '../../../../services/world-location.service';

@Component({
  selector: 'app-substory-thumbnail',
  templateUrl: './substory-thumbnail.component.html',
  styleUrls: ['./substory-thumbnail.component.css', '../../thumbnail.css', '../../../../../styles.css'],
  imports: [RouterLink],
})
export class SubstoryThumbnailComponent {
  @Input() substory!: WorldStoryInfo;

  characterNames: string[] = [];
  locationNames: string[] = [];
  characterService = inject(WorldCharacterService);
  locationService = inject(WorldLocationService);

  async ngOnInit() {
    // Resolve character IDs to names
    const allCharacters = await this.characterService.getAllWorldCharacters();
    this.characterNames = (this.substory.characters || []).map(id => {
      const c = allCharacters.find((ch: any) => ch.id === id);
      return c ? `${c.firstName} ${c.lastName}` : id;
    });
    // Resolve location IDs to names
    const allLocations = await this.locationService.getAllWorldLocations();
    this.locationNames = (this.substory.locations || []).map(id => {
      const l = allLocations.find((loc: any) => loc.id === id);
      return l ? l.name : id;
    });
  }
}
