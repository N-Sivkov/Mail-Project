import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterItemComponent } from './letter-item.component';

describe('LetterItemComponent', () => {
  let component: LetterItemComponent;
  let fixture: ComponentFixture<LetterItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
