/*
* Client side representation of user role
*/
export class Role {
	public _id: string = null;
	public parent: string = null;
	/*an array of direct descendants if this role if
   being inserted above other roles*/
	public parentForDescendants: Array<String> = new Array<String>();
}

