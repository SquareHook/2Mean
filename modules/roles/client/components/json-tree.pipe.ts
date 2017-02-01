import { Pipe, PipeTransform } from '@angular/core';
/*
 * Removes brackets and quotation marks from a json object
 * for a nicer looking user display
 * Usage:
 *   jsonString | jsonTree
 *
*/
@Pipe({name: 'jsonTree'})
export class JsonTreePipe implements PipeTransform {

  transform(json: string): string {
    let part1 = json.replace(/{|}|\[|\]|\"|\,|_id|children|:/gm, "");
    let formatted = part1.replace(/^\s*\n|/gm, "");
    return formatted.replace(/^\s*admin/, "admin\n ---------------------------");
  }
}