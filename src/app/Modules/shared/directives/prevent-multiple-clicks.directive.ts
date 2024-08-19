import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {throttleTime} from 'rxjs/operators';

@Directive({
  selector: '[preventMultipleClick]',
  standalone: true
})
export class PreventMultipleClicksDirective {
  @Input()
  throttleTime = 500;

  @Output()
  throttledClick = new EventEmitter();

  private clicks = new Subject();
  private subscription: Subscription | undefined;

  constructor() {
  }

  ngOnInit() {
    this.subscription = this.clicks.pipe(
      throttleTime(this.throttleTime)
    ).subscribe(e => this.emitThrottledClick(e));
  }

  emitThrottledClick(e: any) {
    this.throttledClick.emit(e);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: Event) {
    event.preventDefault();
    // event.stopPropagation();
    this.clicks.next(event);
  }
}
