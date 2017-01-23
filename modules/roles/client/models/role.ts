/* this is the class we'll use to generate role forms with */
export class Role {
	constructor(
		public _id: string,
		public parent: string,
		public parentForDescendants : Array<string>
	) { }
}



