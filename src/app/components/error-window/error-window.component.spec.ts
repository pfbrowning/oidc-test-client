import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorWindowComponent } from './error-window.component';
import { ModalManagerModule, ModalWindowComponent } from '@browninglogic/ng-modal';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { By } from '@angular/platform-browser';
import { TestHelpers } from 'src/test-helpers';
import { MatIconModule } from '@angular/material';

describe('ErrorWindowComponent', () => {
  let component: ErrorWindowComponent;
  let fixture: ComponentFixture<ErrorWindowComponent>;
  let errorHandlingService: ErrorHandlingService;
  let errorModal: ModalWindowComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalManagerModule,
        MatIconModule
      ],
      declarations: [ ErrorWindowComponent ],
      providers: [ ErrorHandlingService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorWindowComponent);
    component = fixture.componentInstance;
    errorModal = component.errorModal;
    errorHandlingService = fixture.debugElement.injector.get(ErrorHandlingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show modal on error and bind messages to template', () => {
    /* Expect that upon initialization the modal is not visible and that
    no error message has been bound to the template. */
    expect(errorModal.visible).toBe(false);
    expect(TestHelpers.getElementBySelector<ErrorWindowComponent>(fixture, '.errorMessage')).toBeNull();

    simulateCheckError('Test Error', 'Test Comment');
  });

  it('should continue to update the template for subsequent errors', () => {
    const errorSequence = [
      {'message': 'first error', 'comment': 'uh-oh'},
      {'message': 'second error', 'comment': 'oh no'},
      {'message': 'third error', 'comment': 'lots of errors!'}
    ];

    errorSequence.forEach(errorParam => simulateCheckError(errorParam.message, errorParam.comment));
  });

  function simulateCheckError(errorMessage: string, errorComment: string) {
    // Simulate the occurrence of an error
    errorHandlingService.handleError(new Error(errorMessage), errorComment);
    fixture.detectChanges();

    /* Expect that the modal is visible and the message and comment have been assigned
    to the appError model and bound to the template. */
    expect(errorModal.visible).toBe(true);
    expect(component.appError.error['message']).toBe(errorMessage);
    expect(component.appError.comment).toBe(errorComment);
    expect(TestHelpers.getElementTextBySelector<ErrorWindowComponent>(fixture, '.errorMessage')).toBe(errorMessage);
    expect(TestHelpers.getElementTextBySelector<ErrorWindowComponent>(fixture, '.errorComment')).toBe(errorComment);
  }
});
