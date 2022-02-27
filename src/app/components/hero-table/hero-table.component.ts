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
    // viewmodel
    vm$ = combineLatest([
        this.hero.heroes$,
        this.hero.search$,
        this.hero.userPage$,
        this.hero.limit$,
        this.hero.totalResults$,
        this.hero.totalPages$,
        this.hero.loading$,
    ]).pipe(
        map(
            ([
                heroes,
                search,
                userPage,
                limit,
                totalResults,
                totalPages,
                loading,
            ]) => {
                return {
                    heroes,
                    search,
                    userPage,
                    limit,
                    totalResults,
                    totalPages,
                    loading,
                    disableNextButton: totalPages === userPage,
                    disablePrevButton: userPage === 1,
                };
            },
        ),
    );

    constructor(public hero: HeroService) {}

    ngOnInit() {}
    doSearch(event: any) {
        this.hero.doSearch(event.target.value);
    }

    movePageBy(moveBy: number) {
        this.hero.movePageBy(moveBy);
    }

    setlimit(limit) {
        this.hero.setLimit(limit);
    }
}
