import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

const DEFAULT_LIMIT = LIMIT_HIGH;
const DEFAULT_SEARCH = '';
const DEFAULT_PAGE = 0;

@Injectable({
    providedIn: 'root',
})
export class HeroService {
    limits = LIMITS;

    // 3 observables for fields
    searchBS = new BehaviorSubject(DEFAULT_SEARCH);
    limitBS = new BehaviorSubject(DEFAULT_LIMIT);
    pageBS = new BehaviorSubject(DEFAULT_PAGE);

    //combine the 3
    params$ = combineLatest([this.searchBS,this.limitBS,this.pageBS]).pipe(
        map(([searchTerm, limit, page])=> {
            const params: any= {
                apikey: environment.MARVEL_API.PUBLIC_KEY,
                limit: `${limit}`,
                offset: `${page * limit}`, // page * limit
            }
            if(searchTerm.length){
                params.nameStartsWith = searchTerm
            }

            return params;
        })
    );


    heroes$: Observable<Hero[]> = this.params$.pipe(
        switchMap( _params => this.http.get(HERO_API, {params: _params}))
        ,map((res:any)=> res.data.results)
    );

    constructor(private http: HttpClient) {}
}
