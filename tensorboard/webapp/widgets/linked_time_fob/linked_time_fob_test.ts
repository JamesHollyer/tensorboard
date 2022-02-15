/* Copyright 2022 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import {Component, NO_ERRORS_SCHEMA, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LinkedTime} from '../../metrics/types';
import {ScaleLinear, ScaleTime} from '../../third_party/d3';
import {LinkedTimeFobComponent} from './linked_time_fob_component';
import {
  AxisDirection,
  Fobs,
  LinkedTimeFobControllerComponent,
} from './linked_time_fob_controller_component';

type TemporalScale = ScaleLinear<number, number> | ScaleTime<number, number>;

@Component({
  selector: 'testable-comp',
  template: `
    <linked-time-fob-controller
      #FobController
      [axisDirection]="axisDirection"
      [linkedTime]="linkedTime"
      [steps]="steps"
      [temporalScale]="temporalScale"
      (onSelectTimeChanged)="onSelectedTimeChangedMock($event)"
    ></linked-time-fob-controller>
  `,
})
class TestableComponent {
  @ViewChild('FobController')
  fobController!: LinkedTimeFobControllerComponent;

  steps!: number[];
  axisDirection!: AxisDirection;
  linkedTime!: LinkedTime;
  temporalScale!: TemporalScale;

  onSelectedTimeChangedMock(newLinkedTime: LinkedTime) {
    this.linkedTime = newLinkedTime;
  }
}

describe('linked_time_fob_controller', () => {
  let newLinkedTimeActionSpy: jasmine.Spy;
  let temporalScaleSpy: jasmine.Spy;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestableComponent,
        LinkedTimeFobControllerComponent,
        LinkedTimeFobComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(input: {
    steps?: number[];
    axisDirection?: AxisDirection;
    linkedTime?: LinkedTime;
  }): ComponentFixture<TestableComponent> {
    const fixture = TestBed.createComponent(TestableComponent);
    fixture.componentInstance.steps = input.steps || [1, 2, 3, 4];

    fixture.componentInstance.axisDirection =
      input.axisDirection || AxisDirection.VERTICAL;

    fixture.componentInstance.linkedTime = input.linkedTime || {
      start: {step: 1},
      end: null,
    };

    temporalScaleSpy = jasmine.createSpy();
    fixture.componentInstance.temporalScale =
      temporalScaleSpy as unknown as ScaleLinear<number, number>;

    temporalScaleSpy.and.callFake((step: number) => {
      return step;
    });

    newLinkedTimeActionSpy = jasmine.createSpy();
    fixture.componentInstance.onSelectedTimeChangedMock =
      newLinkedTimeActionSpy;
    newLinkedTimeActionSpy.and.stub();

    return fixture;
  }

  it('moves the start fob down to mouse when mouse is dragging down and is below fob', () => {
    let fixture = createComponent({});
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(1);
    fobController.startDrag(Fobs.START);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 3, movementY: 1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(3);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledOnceWith({
      start: {step: 3},
      end: null,
    });
  });

  it('moves the start fob above mouse when mouse is dragging up and above the fob', () => {
    let fixture = createComponent({linkedTime: {start: {step: 4}, end: null}});
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(4);
    fobController.startDrag(Fobs.START);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 2, movementY: -1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledOnceWith({
      start: {step: 2},
      end: null,
    });
  });

  it('does not move the start fob when mouse is dragging up but, is below the fob', () => {
    let fixture = createComponent({linkedTime: {start: {step: 2}, end: null}});
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    fobController.startDrag(Fobs.START);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 4, movementY: -1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledTimes(0);
  });

  it('does not move the start fob when mouse is dragging down but, is above the fob', () => {
    let fixture = createComponent({linkedTime: {start: {step: 4}, end: null}});
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(4);
    fobController.startDrag(Fobs.START);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 2, movementY: 1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(4);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledTimes(0);
  });

  it('does not move the start fob when mouse is dragging down but, the fob is already on the final step', () => {
    let fixture = createComponent({linkedTime: {start: {step: 4}, end: null}});
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(4);
    fobController.startDrag(Fobs.START);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 8, movementY: 1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(4);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledTimes(0);
  });

  it('start fob moves does not pass the end fob when being dragged passed it.', () => {
    let fixture = createComponent({
      linkedTime: {start: {step: 2}, end: {step: 3}},
    });
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    fobController.startDrag(Fobs.START);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 4, movementY: 1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.startFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(3);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledOnceWith({
      start: {step: 3},
      end: {step: 3},
    });
  });

  it('end fob moves to the mouse when mouse is dragging up and mouse is above the fob', () => {
    let fixture = createComponent({
      linkedTime: {start: {step: 1}, end: {step: 1}},
    });
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(1);
    fobController.startDrag(Fobs.END);
    newLinkedTimeActionSpy.calls.reset();
    let fakeEvent = new MouseEvent('mousemove', {clientY: 3, movementY: 1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(3);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledOnceWith({
      start: {step: 1},
      end: {step: 3},
    });
  });

  it('end fob moves to the mouse when mouse is dragging down and mouse is below the fob', () => {
    let fixture = createComponent({
      linkedTime: {start: {step: 1}, end: {step: 4}},
    });
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(4);
    fobController.startDrag(Fobs.END);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 2, movementY: -1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledOnceWith({
      start: {step: 1},
      end: {step: 2},
    });
  });

  it('end fob does not move when mouse is dragging down but, mouse is above the fob', () => {
    let fixture = createComponent({
      linkedTime: {start: {step: 1}, end: {step: 2}},
    });
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    fobController.startDrag(Fobs.END);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 3, movementY: -1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledTimes(0);
  });

  it('end fob does not move when mouse is dragging up but, mouse is below the fob', () => {
    let fixture = createComponent({
      linkedTime: {start: {step: 1}, end: {step: 3}},
    });
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(3);
    fobController.startDrag(Fobs.END);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 2, movementY: 1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(3);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledTimes(0);
  });

  it('end fob does not pass the start fob when being dragged passed it.', () => {
    let fixture = createComponent({
      linkedTime: {start: {step: 2}, end: {step: 3}},
    });
    fixture.detectChanges();
    let fobController = fixture.componentInstance.fobController;
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(3);
    fobController.startDrag(Fobs.END);
    let fakeEvent = new MouseEvent('mousemove', {clientY: 1, movementY: -1});
    fobController.mouseMove(fakeEvent);
    fixture.detectChanges();
    expect(
      fobController.endFobWrapper.nativeElement.getBoundingClientRect().top
    ).toEqual(2);
    expect(newLinkedTimeActionSpy).toHaveBeenCalledOnceWith({
      start: {step: 2},
      end: {step: 2},
    });
  });
});