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
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {State} from '../../../../app_state';
import {dataTableColumnEdited, dataTableColumnToggled} from '../../../actions';
import {
  getRangeSelectionHeaders,
  getSingleSelectionHeaders,
} from '../../../store/metrics_selectors';
import {
  ColumnHeader,
  ColumnHeaderType,
  FobState,
} from '../../card_renderer/scalar_card_types';

@Component({
  selector: 'metrics-scalar-column-editor',
  template: `
    <metrics-scalar-column-editor-component
      [singleHeaders]="singleHeaders$ | async"
      [rangeHeaders]="rangeHeaders$ | async"
      (onScalarTableColumnEdit)="onScalarTableColumnEdit($event)"
      (onScalarTableColumnToggled)="onScalarTableColumnToggled($event)"
    >
    </metrics-scalar-column-editor-component>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScalarColumnEditorContainer {
  constructor(private readonly store: Store<State>) {}

  readonly singleHeaders$: Observable<ColumnHeader[]> = this.store.select(
    getSingleSelectionHeaders
  );
  readonly rangeHeaders$: Observable<ColumnHeader[]> = this.store.select(
    getRangeSelectionHeaders
  );

  onScalarTableColumnEdit({
    fobState,
    newHeaders,
  }: {
    fobState: FobState;
    newHeaders: ColumnHeader[];
  }) {
    this.store.dispatch(dataTableColumnEdited({fobState, newHeaders}));
  }

  onScalarTableColumnToggled({
    fobState,
    headerType,
  }: {
    fobState: FobState;
    headerType: ColumnHeaderType;
  }) {
    this.store.dispatch(dataTableColumnToggled({fobState, headerType}));
  }
}
