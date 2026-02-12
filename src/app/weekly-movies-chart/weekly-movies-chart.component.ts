import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DiaryEntry } from '../entries/entry-card/entry-card.component';
import {
  APPLE_CHART_CONFIG,
  createAppleBarTrace,
  createAppleChartLayout,
} from '../shared/apple-chart-theme';

// Punto temporal para cada dia de la semana en la grafica.
interface WeeklyPoint {
  label: string;
  dateKey: string;
}

// Tipado minimo de Plotly usado por este componente.
interface PlotlyModule {
  newPlot(
    root: HTMLElement,
    data: ReadonlyArray<unknown>,
    layout?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ): Promise<unknown>;
  purge(root: HTMLElement): void;
  Plots: {
    resize(root: HTMLElement): void;
  };
}

declare global {
  interface Window {
    Plotly?: PlotlyModule;
  }
}

@Component({
  selector: 'app-weekly-movies-chart',
  standalone: true,
  templateUrl: './weekly-movies-chart.component.html',
  styleUrl: './weekly-movies-chart.component.css',
})
export class WeeklyMoviesChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Promise estatica para cargar Plotly solo una vez durante toda la sesion.
  private static plotlyLoadPromise: Promise<PlotlyModule> | null = null;

  // Entradas del diario desde el componente padre.
  @Input({ required: true }) entries: DiaryEntry[] = [];
  // Referencia al div donde Plotly renderiza el grafico.
  @ViewChild('chartContainer') private chartContainer?: ElementRef<HTMLDivElement>;

  // Flag para evitar render antes de que exista el elemento en el DOM.
  private isViewReady = false;

  // Suma de peliculas vistas en los ultimos 7 dias.
  get weeklyMoviesCount(): number {
    return this.getLastWeekMovieCounts().reduce((sum, count) => sum + count, 0);
  }

  // Hook despues del primer render: ya se puede dibujar la grafica.
  ngAfterViewInit(): void {
    this.isViewReady = true;
    void this.renderChart();
  }

  // Si cambian entradas, vuelve a pintar grafica (solo si la vista ya existe).
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['entries'] || !this.isViewReady) {
      return;
    }
    void this.renderChart();
  }

  // Limpia recursos de Plotly al destruir componente.
  ngOnDestroy(): void {
    if (this.chartContainer?.nativeElement && window.Plotly) {
      window.Plotly.purge(this.chartContainer.nativeElement);
    }
  }

  // Reajusta el grafico cuando cambia el tamano de ventana.
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.chartContainer?.nativeElement && window.Plotly) {
      window.Plotly.Plots.resize(this.chartContainer.nativeElement);
    }
  }

  // Construye data/layout y renderiza la barra semanal.
  private async renderChart(): Promise<void> {
    const chartElement = this.chartContainer?.nativeElement;
    if (!chartElement) {
      return;
    }
    const plotly = await this.loadPlotly();

    const weekDays = this.getLastWeekDays();
    const weekMovieCounts = this.getLastWeekMovieCounts();
    const trace = createAppleBarTrace(
      weekDays.map((day) => day.label),
      weekMovieCounts,
      'pelicula(s)',
    );
    const layout = createAppleChartLayout({
      title: 'Vistas',
      xTickAngle: -30,
    });

    await plotly.newPlot(chartElement, [trace], layout, APPLE_CHART_CONFIG);
  }

  // Cuenta cuantas peliculas se registraron por cada dia de los ultimos 7 dias.
  private getLastWeekMovieCounts(): number[] {
    const weekDays = this.getLastWeekDays();
    const movieEntries = this.entries.filter((entry) => entry.type === 'Pelicula');
    const countsByDate = new Map<string, number>();

    for (const entry of movieEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const dateKey = this.toDateKey(entryDate);
      countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
    }

    return weekDays.map((day) => countsByDate.get(day.dateKey) ?? 0);
  }

  // Devuelve los 7 dias recientes (incluyendo hoy) con etiqueta y clave normalizada.
  private getLastWeekDays(): WeeklyPoint[] {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: '2-digit',
    });
    const days: WeeklyPoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      days.push({
        label: formatter.format(day),
        dateKey: this.toDateKey(day),
      });
    }

    return days;
  }

  // Convierte una fecha a formato YYYY-MM-DD para usarla como llave de mapa.
  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Carga Plotly desde CDN y reutiliza la misma instancia global.
  private async loadPlotly(): Promise<PlotlyModule> {
    if (window.Plotly) {
      return window.Plotly;
    }

    if (!WeeklyMoviesChartComponent.plotlyLoadPromise) {
      WeeklyMoviesChartComponent.plotlyLoadPromise = new Promise<PlotlyModule>((resolve, reject) => {
        const existingScript = document.getElementById('plotly-cdn-script') as HTMLScriptElement | null;
        if (existingScript) {
          existingScript.addEventListener('load', () => {
            if (!window.Plotly) {
              reject(new Error('Plotly no se cargo correctamente.'));
              return;
            }
            resolve(window.Plotly);
          });
          existingScript.addEventListener('error', () => {
            reject(new Error('No se pudo cargar Plotly desde CDN.'));
          });
          return;
        }

        const script = document.createElement('script');
        script.id = 'plotly-cdn-script';
        script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
        script.async = true;
        script.onload = () => {
          if (!window.Plotly) {
            reject(new Error('Plotly no se cargo correctamente.'));
            return;
          }
          resolve(window.Plotly);
        };
        script.onerror = () => {
          reject(new Error('No se pudo cargar Plotly desde CDN.'));
        };
        document.head.appendChild(script);
      });
    }

    return WeeklyMoviesChartComponent.plotlyLoadPromise;
  }
}
