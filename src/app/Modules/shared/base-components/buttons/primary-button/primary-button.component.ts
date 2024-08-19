import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PreventMultipleClicksDirective} from "../../../directives/prevent-multiple-clicks.directive";
import {MaterialModule} from "../../../material-module";

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule, PreventMultipleClicksDirective, MaterialModule],
  templateUrl: './primary-button.component.html',
  styleUrls: ['../styles.css', './primary-button.component.css']
})
export class PrimaryButtonComponent {
  @Input() throttleTime: number = 1000;
  @Input() isDisabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() buttonId: string = '';
  @Output() handleClick = new EventEmitter();
}
