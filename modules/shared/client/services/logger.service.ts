import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

const apiEndpoint = '/api/logger';
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
};

@Injectable()
export class LoggerService {
  constructor(
    private http: Http
  ) {

  }

  private sendToLog(level: string, args: any) {
    this.http.post(apiEndpoint, { level: level, args: args })
      .map((res) => {
        return res.json();
      }).subscribe((data) => {},
        (error) => {
          console.log(error);
        });
  }

  silly(args: any) {
    this.sendToLog('silly', args);
  }

  debug(args: any) {
    this.sendToLog('debug', args);
  }

  verbose(args: any) {
    this.sendToLog('verbose', args);
  }

  info(args: any) {
    this.sendToLog('info', args);
  }

  warn(args: any) {
    this.sendToLog('warn', args);
  }

  error(args: any) {
    this.sendToLog('error', args);
  }
}
