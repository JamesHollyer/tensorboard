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
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {HeaderEditInfo} from '../../../metrics/types';
import {
  ColumnHeader,
  ColumnHeaderType,
  DataTableMode,
  TableData,
  SortingInfo,
  SortingOrder,
} from '../../../widgets/data_table/types';

@Component({
  selector: 'runs-data-table',
  templateUrl: 'runs_data_table.ng.html',
  styleUrls: ['runs_data_table.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunsDataTable {
  @Input() columnHeaders!: ColumnHeader[];
  @Input() data!: TableData[];
  @Input() sortingInfo!: SortingInfo;
  @Input() columnCustomizationEnabled!: boolean;
  @Input() smoothingEnabled!: boolean;
  ColumnHeaderType = ColumnHeaderType;

  @Output() sortDataBy = new EventEmitter<SortingInfo>();
  @Output() editColumnHeaders = new EventEmitter<HeaderEditInfo>();
  @Output() onRunSelectionToggle = new EventEmitter<string>();

  orderColumns(headers: ColumnHeader[]) {
    this.editColumnHeaders.emit({
      headers: headers,
      dataTableMode: DataTableMode.RUN,
    });
  }
}
