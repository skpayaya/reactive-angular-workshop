import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_PAGE, Hero, HeroService } from '../../services/hero.service';

@Component({
    selector: 'rx-hero-table',
    templateUrl: './hero-table.component.html',
    styleUrls: ['./hero-table.component.scss'],
})
export class HeroTableComponent implements OnInit {
    // heroes$: Observable<Hero[]> = this.hero.heroes$;
    // search$ = this.hero.searchBS;
    // page$ = this.hero.userPage$;
    // limit$ = this.hero.limitBS;
    // totalResults$ = this.hero.totalResults$;
    // totalPages$ = this.hero.totalPages$;

    // viewmodel
    vm$ = combineLatest([
        this.hero.heroes$,
        this.hero.searchBS,
        this.hero.userPage$,
        this.hero.limitBS,
        this.hero.totalResults$,
        this.hero.totalPages$,
    ]).pipe(
        map(([heroes, search, userPage, limit, totalResults, totalPages]) => {
            return {
                heroes,
                search,
                userPage,
                limit,
                totalResults,
                totalPages,
                disableNextButton: totalPages === userPage,
                disablePrevButton: userPage === 1,
            };
        }),
    );

    constructor(public hero: HeroService) {}

    ngOnInit() {}
    doSearch(event: any) {
        this.hero.searchBS.next(event.target.value);
        this.hero.pageBS.next(DEFAULT_PAGE);
    }

    movePageBy(moveBy: number) {
        const currentPage = this.hero.pageBS.getValue();
        this.hero.pageBS.next(currentPage + moveBy);
    }

    setlimit(limit) {
        this.hero.limitBS.next(limit);
        this.hero.pageBS.next(DEFAULT_PAGE);
    }
}
