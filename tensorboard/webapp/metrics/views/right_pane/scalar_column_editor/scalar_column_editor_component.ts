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
  OnDestroy,
  Output,
} from '@angular/core';
import {
  ColumnHeader,
  ColumnHeaderType,
  FobState,
} from '../../card_renderer/scalar_card_types';

const preventDefault = function (e: MouseEvent) {
  e.preventDefault();
};

enum Edge {
  TOP,
  BOTTOM,
}

const isHeaderOfType = function (type: ColumnHeaderType, header: ColumnHeader) {
  return header.type === type;
};

@Component({
  selector: 'metrics-scalar-column-editor-component',
  templateUrl: 'scalar_column_editor_component.ng.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [`scalar_column_editor_component.css`],
})
export class ScalarColumnEditorComponent implements OnDestroy {
  FobState = FobState;
  selectedTab: FobState = FobState.SINGLE;
  draggingHeaderType: ColumnHeaderType | undefined;
  highlightedHeaderType: ColumnHeaderType | undefined;
  highlightEdge: Edge = Edge.TOP;
  @Input() rangeHeaders!: ColumnHeader[];
  @Input() singleHeaders!: ColumnHeader[];

  @Output() onScalarTableColumnEdit = new EventEmitter<{
    fobState: FobState;
    newHeaders: ColumnHeader[];
  }>();
  @Output() onScalarTableColumnToggled = new EventEmitter<{
    fobState: FobState;
    headerType: ColumnHeaderType;
  }>();

  ngOnDestroy() {
    document.removeEventListener('dragover', preventDefault);
  }

  onTabChange(tabIndex: number) {
    console.log('tabIndex', tabIndex);
    switch (tabIndex) {
      case 0:
        this.selectedTab = FobState.SINGLE;
        break;
      case 1:
        this.selectedTab = FobState.RANGE;
        break;
    }
  }

  dragStart(header: ColumnHeader) {
    this.draggingHeaderType = header.type;
    document.addEventListener('dragover', preventDefault);
  }

  dragEnd() {
    if (!this.draggingHeaderType || !this.highlightedHeaderType) {
      return;
    }
    const headers = this.getCurrentHeaders();

    this.onScalarTableColumnEdit.emit({
      fobState: this.selectedTab,
      newHeaders: this.moveHeader(
        headers.findIndex((element) =>
          isHeaderOfType(this.draggingHeaderType!, element)
        ),
        headers.findIndex((element) =>
          isHeaderOfType(this.highlightedHeaderType!, element)
        ),
        headers
      ),
    });
    this.draggingHeaderType = undefined;
    this.highlightedHeaderType = undefined;
    document.removeEventListener('dragover', preventDefault);
  }

  dragEnter(header: ColumnHeader) {
    if (!this.draggingHeaderType) {
      return;
    }

    const headers = this.getCurrentHeaders();
    if (
      headers.findIndex((element) => isHeaderOfType(header.type, element)) <
      headers.findIndex((element) =>
        isHeaderOfType(this.draggingHeaderType!, element)
      )
    ) {
      this.highlightEdge = Edge.TOP;
    } else {
      this.highlightEdge = Edge.BOTTOM;
    }
    this.highlightedHeaderType = header.type;
  }

  toggleHeader(header: ColumnHeader) {
    this.onScalarTableColumnToggled.emit({
      fobState: this.selectedTab,
      headerType: header.type,
    });
  }

  getHighlightClasses(header: ColumnHeader) {
    if (header.type !== this.highlightedHeaderType) {
      return {};
    }

    return {
      highlighted: true,
      'highlight-top': this.highlightEdge === Edge.TOP,
      'highlight-bottom': this.highlightEdge === Edge.BOTTOM,
    };
  }

  // Move the item at sourceIndex to destinationIndex
  moveHeader(
    sourceIndex: number,
    destinationIndex: number,
    headers: ColumnHeader[]
  ) {
    const newHeaders = [...headers];
    // Delete from original location
    newHeaders.splice(sourceIndex, 1);
    // Insert at destinationIndex.
    newHeaders.splice(destinationIndex, 0, headers[sourceIndex]);
    return newHeaders;
  }

  getCurrentHeaders() {
    return this.selectedTab === FobState.SINGLE
      ? this.singleHeaders
      : this.rangeHeaders;
  }
}
