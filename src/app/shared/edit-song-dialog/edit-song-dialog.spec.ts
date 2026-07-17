import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSongDialog } from './edit-song-dialog';

describe('EditSongDialog', () => {
  let component: EditSongDialog;
  let fixture: ComponentFixture<EditSongDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSongDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSongDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
