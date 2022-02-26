import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Hero, HeroService } from '../../services/hero.service';

@Component({
    selector: 'rx-hero-table',
    templateUrl: './hero-table.component.html',
    styleUrls: ['./hero-table.component.scss'],
})
export class HeroTableComponent implements OnInit {
    heroes$: Observable<Hero[]> = this.hero.heroes$;
    search$ = this.hero.searchBS;
    page$ = this.hero.userPage$;
    limit$ = this.hero.limitBS;
    totalPages$ = this.hero.totalPages$;

    totalResults$ = this.hero.totalResults$;

    constructor(public hero: HeroService) {}

    ngOnInit() {}
    doSearch(event: any) {
        this.hero.searchBS.next(event.target.value);
    }

    movePageBy(moveBy: number) {
        const currentPage = this.hero.pageBS.getValue();
        this.hero.pageBS.next(currentPage + moveBy);
    }
}
