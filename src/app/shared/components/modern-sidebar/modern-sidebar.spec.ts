import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModernSidebar } from './modern-sidebar';

describe('ModernSidebar', () => {
  let component: ModernSidebar;
  let fixture: ComponentFixture<ModernSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModernSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModernSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
