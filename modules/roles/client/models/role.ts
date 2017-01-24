/* this is the class we'll use to generate role forms with */
export class Role {
	constructor(
		public _id: string,
		public parent: string,

		/* this array is used to set direct descendants of a role
		/* all descendants set here must have had the same parent beforehand
		*/
		public parentForDescendants : Array<string>
	) { }
}



