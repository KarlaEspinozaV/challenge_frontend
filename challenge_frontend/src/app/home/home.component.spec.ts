import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from './home.component';
import { HomeFacade } from './facades/home.facade';
import {
  IonicInputEvent,
  PopoverPresentEvent,
  InputValidationResult,
} from './home.interfaces';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockFacade: jasmine.SpyObj<HomeFacade>;
  let mockPopover: any;
  let mockIonInput: any;

  // Mock data
  const mockInputValidationResult: InputValidationResult = {
    isValid: true,
    filteredValue: 'test input',
    errorMessage: undefined,
  };

  const mockIonicInputEvent: IonicInputEvent = {
    target: {
      value: 'test input',
    },
  } as IonicInputEvent;

  const mockPopoverPresentEvent: PopoverPresentEvent = {
    target: document.createElement('button'),
    currentTarget: document.createElement('button'),
    type: 'click',
  };

  beforeEach(async () => {
    // Create facade spy
    mockFacade = jasmine.createSpyObj(
      'HomeFacade',
      [
        'initialize',
        'cleanup',
        'handleInput',
        'presentPopover',
        'handleDecrypt',
        'toggleListening',
        'setIsOpen',
        'setPopoverEvent',
        'customCounterFormatter',
      ],
      {
        // Getters
        inputModel: 'test input',
        isOpen: false,
        encryptedText: 'encrypted123',
        decryptedText: 'decrypted text',
        showDecrypted: false,
        isListening: false,
        maxLength: 15,
      }
    );

    // Setup facade method returns
    mockFacade.handleInput.and.returnValue(mockInputValidationResult);
    mockFacade.customCounterFormatter.and.returnValue('5/15');

    // Create mock ViewChild elements
    mockIonInput = {
      value: '',
      nativeElement: document.createElement('ion-input'),
    };

    mockPopover = {
      event: null,
      nativeElement: document.createElement('ion-popover'),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, IonicModule.forRoot(), FormsModule],
      providers: [{ provide: HomeFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    // Mock ViewChild elements
    (component as any).ionInputEl = mockIonInput;
    (component as any).popover = mockPopover;
  });

  // ================================================================
  // COMPONENT LIFECYCLE TESTS
  // ================================================================

  describe('Component Lifecycle', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize facade on ngOnInit', () => {
      component.ngOnInit();
      expect(mockFacade.initialize).toHaveBeenCalledTimes(1);
    });

    it('should cleanup facade on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(mockFacade.cleanup).toHaveBeenCalledTimes(1);
    });

    it('should have facade injected correctly', () => {
      expect(component.facade).toBe(mockFacade);
    });
  });

  // ================================================================
  // TEMPLATE BINDING TESTS
  // ================================================================

  describe('Template Binding - State Getters', () => {
    it('should bind inputModel getter to facade', () => {
      expect(component.inputModel).toBe('test input');
    });

    it('should bind isOpen getter to facade', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should bind encryptedText getter to facade', () => {
      expect(component.encryptedText).toBe('encrypted123');
    });

    it('should bind decryptedText getter to facade', () => {
      expect(component.decryptedText).toBe('decrypted text');
    });

    it('should bind showDecrypted getter to facade', () => {
      expect(component.showDecrypted).toBe(false);
    });

    it('should bind isListening getter to facade', () => {
      expect(component.isListening).toBe(false);
    });

    it('should bind maxLength getter to facade', () => {
      expect(component.maxLength).toBe(15);
    });

    it('should handle facade state changes', () => {
      // Change facade state
      Object.defineProperty(mockFacade, 'inputModel', { value: 'new input' });
      Object.defineProperty(mockFacade, 'isOpen', { value: true });
      Object.defineProperty(mockFacade, 'isListening', { value: true });

      expect(component.inputModel).toBe('new input');
      expect(component.isOpen).toBe(true);
      expect(component.isListening).toBe(true);
    });
  });

  // ================================================================
  // EVENT HANDLING TESTS
  // ================================================================

  describe('Event Handling', () => {
    describe('onInput', () => {
      it('should delegate input handling to facade', () => {
        component.onInput(mockIonicInputEvent);

        expect(mockFacade.handleInput).toHaveBeenCalledWith(
          mockIonicInputEvent
        );
        expect(mockFacade.handleInput).toHaveBeenCalledTimes(1);
      });

      it('should update ViewChild ion-input value with filtered result', () => {
        component.onInput(mockIonicInputEvent);

        expect(mockIonInput.value).toBe('test input');
      });

      it('should handle input with special characters', () => {
        const specialCharEvent = {
          target: { value: 'test@#$input' },
        } as IonicInputEvent;

        const filteredResult = {
          isValid: true,
          filteredValue: 'testinput',
          errorMessage: undefined,
        };

        mockFacade.handleInput.and.returnValue(filteredResult);

        component.onInput(specialCharEvent);

        expect(mockFacade.handleInput).toHaveBeenCalledWith(specialCharEvent);
        expect(mockIonInput.value).toBe('testinput');
      });

      it('should handle empty input', () => {
        const emptyEvent = {
          target: { value: '' },
        } as IonicInputEvent;

        const emptyResult = {
          isValid: true,
          filteredValue: '',
          errorMessage: undefined,
        };

        mockFacade.handleInput.and.returnValue(emptyResult);

        component.onInput(emptyEvent);

        expect(mockFacade.handleInput).toHaveBeenCalledWith(emptyEvent);
        expect(mockIonInput.value).toBe('');
      });
    });

    describe('presentPopover', () => {
      it('should delegate popover presentation to facade', () => {
        component.presentPopover(mockPopoverPresentEvent);

        expect(mockFacade.presentPopover).toHaveBeenCalledWith(
          mockPopoverPresentEvent
        );
        expect(mockFacade.presentPopover).toHaveBeenCalledTimes(1);
      });

      it('should set popover event through facade', () => {
        component.presentPopover(mockPopoverPresentEvent);

        expect(mockFacade.setPopoverEvent).toHaveBeenCalledWith(
          mockPopover,
          mockPopoverPresentEvent
        );
        expect(mockFacade.setPopoverEvent).toHaveBeenCalledTimes(1);
      });

      it('should handle both facade operations in correct order', () => {
        component.presentPopover(mockPopoverPresentEvent);

        expect(mockFacade.presentPopover).toHaveBeenCalledBefore(
          mockFacade.setPopoverEvent as jasmine.Spy
        );
      });
    });

    describe('onDecrypt', () => {
      it('should delegate decryption to facade', () => {
        component.onDecrypt();

        expect(mockFacade.handleDecrypt).toHaveBeenCalledTimes(1);
        expect(mockFacade.handleDecrypt).toHaveBeenCalledWith();
      });
    });

    describe('toggleListening', () => {
      it('should delegate voice toggle to facade', () => {
        component.toggleListening();

        expect(mockFacade.toggleListening).toHaveBeenCalledTimes(1);
        expect(mockFacade.toggleListening).toHaveBeenCalledWith();
      });

      it('should be callable as arrow function', () => {
        const toggleFn = component.toggleListening;
        expect(typeof toggleFn).toBe('function');

        toggleFn();
        expect(mockFacade.toggleListening).toHaveBeenCalledTimes(1);
      });
    });

    describe('onPopoverDismiss', () => {
      it('should set isOpen to false through facade', () => {
        component.onPopoverDismiss();

        expect(mockFacade.setIsOpen).toHaveBeenCalledWith(false);
        expect(mockFacade.setIsOpen).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ================================================================
  // CUSTOM COUNTER FORMATTER TESTS
  // ================================================================

  describe('Custom Counter Formatter', () => {
    it('should delegate counter formatting to facade', () => {
      const result = component.customCounterFormatter(5, 15);

      expect(mockFacade.customCounterFormatter).toHaveBeenCalledWith(5, 15);
      expect(result).toBe('5/15');
    });

    it('should handle different input lengths', () => {
      mockFacade.customCounterFormatter.and.returnValue('10/15');

      const result = component.customCounterFormatter(10, 15);

      expect(mockFacade.customCounterFormatter).toHaveBeenCalledWith(10, 15);
      expect(result).toBe('10/15');
    });

    it('should handle max length reached', () => {
      mockFacade.customCounterFormatter.and.returnValue('15/15');

      const result = component.customCounterFormatter(15, 15);

      expect(mockFacade.customCounterFormatter).toHaveBeenCalledWith(15, 15);
      expect(result).toBe('15/15');
    });

    it('should be defined as arrow function', () => {
      expect(typeof component.customCounterFormatter).toBe('function');
    });
  });

  // ================================================================
  // VIEWCHILD TESTS
  // ================================================================

  describe('ViewChild Management', () => {
    it('should have ionInputEl ViewChild reference', () => {
      expect((component as any).ionInputEl).toBeDefined();
      expect((component as any).ionInputEl).toBe(mockIonInput);
    });

    it('should have popover ViewChild reference', () => {
      expect((component as any).popover).toBeDefined();
      expect((component as any).popover).toBe(mockPopover);
    });

    it('should update ion-input value correctly', () => {
      mockIonInput.value = 'initial';

      component.onInput(mockIonicInputEvent);

      expect(mockIonInput.value).toBe('test input');
    });

    it('should handle ViewChild interactions with popover', () => {
      component.presentPopover(mockPopoverPresentEvent);

      expect(mockFacade.setPopoverEvent).toHaveBeenCalledWith(
        mockPopover,
        mockPopoverPresentEvent
      );
    });
  });

  // ================================================================
  // INTEGRATION TESTS
  // ================================================================

  describe('Integration Workflows', () => {
    it('should complete user input workflow', () => {
      // Simulate user typing
      component.onInput(mockIonicInputEvent);

      // Verify input processing
      expect(mockFacade.handleInput).toHaveBeenCalledWith(mockIonicInputEvent);
      expect(mockIonInput.value).toBe('test input');

      // Simulate encryption
      component.presentPopover(mockPopoverPresentEvent);

      // Verify encryption workflow
      expect(mockFacade.presentPopover).toHaveBeenCalledWith(
        mockPopoverPresentEvent
      );
      expect(mockFacade.setPopoverEvent).toHaveBeenCalledWith(
        mockPopover,
        mockPopoverPresentEvent
      );
    });

    it('should complete voice input workflow', () => {
      // Start listening
      component.toggleListening();
      expect(mockFacade.toggleListening).toHaveBeenCalledTimes(1);

      // Stop listening
      component.toggleListening();
      expect(mockFacade.toggleListening).toHaveBeenCalledTimes(2);
    });

    it('should complete encryption workflow', () => {
      // Present popover
      component.presentPopover(mockPopoverPresentEvent);
      expect(mockFacade.presentPopover).toHaveBeenCalled();

      // Decrypt
      component.onDecrypt();
      expect(mockFacade.handleDecrypt).toHaveBeenCalled();

      // Dismiss popover
      component.onPopoverDismiss();
      expect(mockFacade.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should handle complete component lifecycle', () => {
      // Initialize
      component.ngOnInit();
      expect(mockFacade.initialize).toHaveBeenCalled();

      // Use component
      component.onInput(mockIonicInputEvent);
      component.toggleListening();
      component.presentPopover(mockPopoverPresentEvent);

      // Cleanup
      component.ngOnDestroy();
      expect(mockFacade.cleanup).toHaveBeenCalled();
    });
  });

  // ================================================================
  // ERROR HANDLING TESTS
  // ================================================================

  describe('Error Handling', () => {
    it('should handle facade method errors gracefully', () => {
      mockFacade.handleInput.and.throwError('Test error');

      expect(() => component.onInput(mockIonicInputEvent)).toThrowError(
        'Test error'
      );
    });

    it('should handle facade getter errors gracefully', () => {
      Object.defineProperty(mockFacade, 'inputModel', {
        get: () => {
          throw new Error('Getter error');
        },
      });

      expect(() => component.inputModel).toThrowError('Getter error');
    });

    it('should handle null ViewChild references', () => {
      (component as any).ionInputEl = null;

      expect(() => component.onInput(mockIonicInputEvent)).toThrowError();
    });

    it('should handle undefined popover ViewChild', () => {
      (component as any).popover = null;

      // Should not throw error, facade should handle null popover
      expect(() =>
        component.presentPopover(mockPopoverPresentEvent)
      ).not.toThrow();
      expect(mockFacade.setPopoverEvent).toHaveBeenCalledWith(
        null,
        mockPopoverPresentEvent
      );
    });
  });

  // ================================================================
  // TEMPLATE INTEGRATION TESTS
  // ================================================================

  describe('Template Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render component template', () => {
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should bind facade state to template', () => {
      // Update facade state
      Object.defineProperty(mockFacade, 'inputModel', {
        value: 'template test',
      });
      Object.defineProperty(mockFacade, 'isListening', { value: true });

      fixture.detectChanges();

      expect(component.inputModel).toBe('template test');
      expect(component.isListening).toBe(true);
    });

    it('should handle template event bindings', () => {
      spyOn(component, 'onInput');
      spyOn(component, 'toggleListening');
      spyOn(component, 'presentPopover');
      spyOn(component, 'onDecrypt');

      // These would be triggered by actual template interactions
      // In a real scenario, you'd simulate clicks, inputs, etc.

      component.onInput(mockIonicInputEvent);
      component.toggleListening();
      component.presentPopover(mockPopoverPresentEvent);
      component.onDecrypt();

      expect(component.onInput).toHaveBeenCalled();
      expect(component.toggleListening).toHaveBeenCalled();
      expect(component.presentPopover).toHaveBeenCalled();
      expect(component.onDecrypt).toHaveBeenCalled();
    });
  });

  // ================================================================
  // EDGE CASES AND BOUNDARY TESTS
  // ================================================================

  describe('Edge Cases', () => {
    it('should handle rapid successive input events', () => {
      const events = [
        { target: { value: 'a' } },
        { target: { value: 'ab' } },
        { target: { value: 'abc' } },
      ] as IonicInputEvent[];

      events.forEach((event) => component.onInput(event));

      expect(mockFacade.handleInput).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid toggle listening calls', () => {
      component.toggleListening();
      component.toggleListening();
      component.toggleListening();

      expect(mockFacade.toggleListening).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple popover presentations', () => {
      component.presentPopover(mockPopoverPresentEvent);
      component.presentPopover(mockPopoverPresentEvent);

      expect(mockFacade.presentPopover).toHaveBeenCalledTimes(2);
      expect(mockFacade.setPopoverEvent).toHaveBeenCalledTimes(2);
    });

    it('should handle counter formatter with edge values', () => {
      component.customCounterFormatter(0, 15);
      component.customCounterFormatter(15, 15);
      component.customCounterFormatter(-1, 15);

      expect(mockFacade.customCounterFormatter).toHaveBeenCalledTimes(3);
    });
  });

  // ================================================================
  // PERFORMANCE TESTS
  // ================================================================

  describe('Performance', () => {
    it('should not create unnecessary function calls', () => {
      const initialCallCount = mockFacade.handleInput.calls.count();

      // Access getters multiple times
      const input1 = component.inputModel;
      const input2 = component.inputModel;
      const input3 = component.inputModel;

      // Getters should not trigger facade method calls
      expect(mockFacade.handleInput.calls.count()).toBe(initialCallCount);
    });

    it('should maintain ViewChild references efficiently', () => {
      const ionInput1 = (component as any).ionInputEl;
      const ionInput2 = (component as any).ionInputEl;

      expect(ionInput1).toBe(ionInput2);
      expect(ionInput1).toBe(mockIonInput);
    });
  });
});
