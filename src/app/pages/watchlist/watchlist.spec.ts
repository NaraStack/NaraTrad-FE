import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Watchlist } from '../watchlist/watchlist';
import { WatchlistService } from 'app/features/watchlist/services/watchlist.service';
import { of } from 'rxjs';

class MockWatchlistService {
  getAllWatchlist() {
    return of([]);
  }
}

describe('Watchlist', () => {
  let component: Watchlist;
  let fixture: ComponentFixture<Watchlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Watchlist, HttpClientTestingModule, NoopAnimationsModule],
      providers: [{ provide: WatchlistService, useClass: MockWatchlistService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Watchlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
