import { Component, Input } from '@angular/core';
import { WorldStoryInfo } from '../../../../worldstory';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-substory-thumbnail',
  templateUrl: './substory-thumbnail.component.html',
  styleUrls: ['./substory-thumbnail.component.css', '../../thumbnail.css', '../../../../../styles.css'],
  imports: [RouterLink],
})
export class SubstoryThumbnailComponent {
  @Input() substory!: WorldStoryInfo;
}
