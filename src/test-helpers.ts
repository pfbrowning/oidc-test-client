import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Utils } from './app/utils/utils';

export class TestHelpers {
  public static getElementBySelector<ComponentType>(fixture: ComponentFixture<ComponentType>, selector: string): any {
    const debugElement = fixture.debugElement.query(By.css(selector));
    return debugElement != null ? debugElement.nativeElement : null;
  }

  public static getElementTextBySelector<ComponentType>(fixture: ComponentFixture<ComponentType>, selector: string): string {
    const nativeElement = TestHelpers.getElementBySelector<ComponentType>(fixture, selector);
    return nativeElement != null ? nativeElement.innerText : null;
  }

  public static expectStringsToMatchIgnoringSpaceAndLineBreaks(a: string, b: string) {
      expect(Utils.RemoveWhitespaceAndLineBreak(a)).toBe(Utils.RemoveWhitespaceAndLineBreak(b));
  }
}
