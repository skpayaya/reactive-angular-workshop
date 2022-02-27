import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Hero {
    id: number;
    name: string;
    description: string;
    thumbnail: HeroThumbnail;
    resourceURI: string;
    comics: HeroSubItems;
    events: HeroSubItems;
    series: HeroSubItems;
    stories: HeroSubItems;
}

export interface HeroThumbnail {
    path: string;
    extendion: string;
}

export interface HeroSubItems {
    available: number;
    returned: number;
    collectionURI: string;
    items: HeroSubItem[];
}

export interface HeroSubItem {
    resourceURI: string;
    name: string;
}

// The URL to the Marvel API
const HERO_API = `${environment.MARVEL_API.URL}/v1/public/characters`;

// Our Limits for Search
const LIMIT_LOW = 10;
const LIMIT_MID = 25;
const LIMIT_HIGH = 100;
const LIMITS = [LIMIT_LOW, LIMIT_MID, LIMIT_HIGH];

export const DEFAULT_LIMIT = LIMIT_LOW;
export const DEFAULT_SEARCH = '';
export const DEFAULT_PAGE = 0;

@Injectable({
    providedIn: 'root',
})
export class HeroService {
    constructor(private http: HttpClient) {}

    limits = LIMITS;

    // 3 observables for fields
    private searchBS = new BehaviorSubject(DEFAULT_SEARCH);
    private limitBS = new BehaviorSubject(DEFAULT_LIMIT);
    private pageBS = new BehaviorSubject(DEFAULT_PAGE);
    private loadingBS = new BehaviorSubject(false);

    search$ = this.searchBS.asObservable();
    limit$ = this.limitBS.asObservable();
    page$ = this.pageBS.asObservable();
    loading$ = this.searchBS.asObservable();

    userPage$ = this.pageBS.pipe(map(page => page + 1));

    //combine the 3
    private params$ = combineLatest([
        this.searchBS,
        this.limitBS,
        this.pageBS,
    ]).pipe(
        map(([searchTerm, limit, page]) => {
            const params: any = {
                apikey: environment.MARVEL_API.PUBLIC_KEY,
                limit: `${limit}`,
                offset: `${page * limit}`, // page * limit
            };
            if (searchTerm.length) {
                params.nameStartsWith = searchTerm;
            }

            return params;
        }),
    );

    private heroesResponse$ = this.params$.pipe(
        debounceTime(1000),
        tap(() => this.loadingBS.next(true)),
        switchMap(_params => this.http.get(HERO_API, { params: _params })),
        shareReplay(1),
        tap(() => this.loadingBS.next(false)),
    );

    totalResults$ = this.heroesResponse$.pipe(
        map((res: any) => res.data.total),
    );

    totalPages$ = combineLatest([this.totalResults$, this.limitBS]).pipe(
        map(([totalResults, limit]) => Math.ceil(totalResults / limit)),
    );

    heroes$ = this.heroesResponse$.pipe(map((res: any) => res.data.results));

    doSearch(term: string) {
        this.searchBS.next(term);
        this.pageBS.next(DEFAULT_PAGE);
    }

    movePageBy(moveBy: number) {
        const currentPage = this.pageBS.getValue();
        this.pageBS.next(currentPage + moveBy);
    }

    setLimit(newLimit: number) {
        this.limitBS.next(newLimit);
        this.pageBS.next(DEFAULT_PAGE);
    }
}
