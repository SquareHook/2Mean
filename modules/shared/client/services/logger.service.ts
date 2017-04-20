import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class LoggerService {
  const apiEndpoint = '/api/logger';
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
  };

  constructor(
    private http: Http
  ) {

  }

  private sendToLog(level: string, args: any) {
    this.http.post(apiEndpoint, { level: level, args: args })
      .map((res) => {
        return res.json();
      });
  }

  silly(args: any) {
    sendToLog('silly', args);
  }

  debug(args: any) {
    sendToLog('debug', args);
  }

  verbose(args: any) {
    sendToLog('verbose', args);
  }

  info(args: any) {
    sendToLog('info', args);
  }

  warn(args: any) {
    sendToLog('warn', args);
  }

  error(args: any) {
    sendToLog('error', args);
  }
}
