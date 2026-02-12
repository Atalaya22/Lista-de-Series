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

interface WeeklyPoint {
  label: string;
  dateKey: string;
}

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
  private static plotlyLoadPromise: Promise<PlotlyModule> | null = null;

  @Input({ required: true }) entries: DiaryEntry[] = [];
  @ViewChild('chartContainer') private chartContainer?: ElementRef<HTMLDivElement>;

  private isViewReady = false;

  get weeklyMoviesCount(): number {
    return this.getLastWeekMovieCounts().reduce((sum, count) => sum + count, 0);
  }

  ngAfterViewInit(): void {
    this.isViewReady = true;
    void this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['entries'] || !this.isViewReady) {
      return;
    }
    void this.renderChart();
  }

  ngOnDestroy(): void {
    if (this.chartContainer?.nativeElement && window.Plotly) {
      window.Plotly.purge(this.chartContainer.nativeElement);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.chartContainer?.nativeElement && window.Plotly) {
      window.Plotly.Plots.resize(this.chartContainer.nativeElement);
    }
  }

  private async renderChart(): Promise<void> {
    const chartElement = this.chartContainer?.nativeElement;
    if (!chartElement) {
      return;
    }
    const plotly = await this.loadPlotly();

    const weekDays = this.getLastWeekDays();
    const weekMovieCounts = this.getLastWeekMovieCounts();
    const trace = {
      type: 'bar',
      x: weekDays.map((day) => day.label),
      y: weekMovieCounts,
      marker: {
        color: '#fd7e14',
        line: {
          color: '#dc5f00',
          width: 1.2,
        },
      },
      hovertemplate: '%{x}<br>%{y} pelicula(s)<extra></extra>',
    };
    const layout = {
      margin: { t: 12, r: 12, b: 36, l: 36 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      yaxis: {
        title: 'Vistas',
        tick0: 0,
        dtick: 1,
        rangemode: 'tozero',
        gridcolor: 'rgba(17, 18, 26, 0.12)',
      },
      xaxis: {
        tickangle: -30,
      },
      font: {
        family: 'Manrope, sans-serif',
        color: '#2f334b',
      },
    };
    const config = {
      displayModeBar: false,
      responsive: true,
    };

    await plotly.newPlot(chartElement, [trace], layout, config);
  }

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

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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
