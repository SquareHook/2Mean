/* this is the class we'll use to generate Article forms with */
export class Article {
	id: string
	constructor(
		public title: string,
		public content: string,
		public created: Date
	) { }
}
