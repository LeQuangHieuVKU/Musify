import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandedPlayer } from './expanded-player';

describe('ExpandedPlayer', () => {
  let component: ExpandedPlayer;
  let fixture: ComponentFixture<ExpandedPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpandedPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandedPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
