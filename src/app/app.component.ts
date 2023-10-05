import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'my_app';

  constructor (public auth: AuthService){}

  ngOnInit(): void {
      
  }
}
