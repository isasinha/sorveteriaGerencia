import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * Auto-fills :00 minutes on input[type=time] when the user finishes typing the hour.
 * Uses keydown (not InputEvent.data, which is null for time inputs in Chrome/Edge).
 */
@Directive({
  selector: 'input[type=time]',
  standalone: true
})
export class TimeAutoMinutesDirective {
  private el = inject(ElementRef<HTMLInputElement>);
  private digits: string[] = [];

  @HostListener('focus')
  onFocus(): void {
    this.digits = [];
  }

  @HostListener('blur')
  onBlur(): void {
    this.digits = [];
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Reset tracking on navigation or delete
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      this.digits = [];
      return;
    }

    if (!/^\d$/.test(event.key)) return;

    this.digits.push(event.key);
    const d0 = parseInt(this.digits[0], 10);

    if (this.digits.length === 1 && d0 >= 3) {
      // Single digit 3-9: can only be 03-09, browser will auto-advance after this keypress
      this.scheduleAutoFill(this.digits[0].padStart(2, '0'));
    } else if (this.digits.length === 2) {
      const hour = this.digits.join('');
      const num = parseInt(hour, 10);
      if (num >= 0 && num <= 23) {
        this.scheduleAutoFill(hour);
      } else {
        this.digits = [];
      }
    }
  }

  private scheduleAutoFill(hour: string): void {
    this.digits = [];
    // Small delay so the browser finishes processing the keydown (segment advance) first
    setTimeout(() => {
      const el = this.el.nativeElement as HTMLInputElement;
      // Only auto-fill when value is still empty (minutes not typed yet)
      if (el.value === '') {
        el.value = `${hour}:00`;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 30);
  }
}
