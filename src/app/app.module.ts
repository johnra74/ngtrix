import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { PreviewComponent } from './preview/preview.component';
import { TopScoreComponent } from './top-score/top-score.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PreviewComponent,
    TopScoreComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    ModalModule.forRoot(),
    TabsModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
