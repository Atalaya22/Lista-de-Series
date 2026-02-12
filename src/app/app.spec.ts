import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  // Prepara modulo de pruebas con el componente raiz.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  // Verifica que el componente se pueda instanciar.
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Prueba de ejemplo de render de titulo.
  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, lista-series');
  });
});
