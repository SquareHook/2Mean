module.exports = [
{
  name: 'List of role permissions',
  description: 'Retreives a list of all API endpoints and relevant information for each of them.',
  route: '/roles/permissions',
  type: 'GET',
  method: 'reportEndpointPermissions',
  secure: false
},
{
  name: 'List of roles.',
  description: 'Retreives a list of all roles for the application.',
  route: '/roles',
  type: 'GET',
  method: 'list',
  secure: true
},
{
  name: 'Create a new role.',
  description: 'Creates a new role for the application.',
  route: '/roles',
  type: 'POST',
  method: 'create',
  secure: true
},
{
  name: 'Modify a role.',
  description: 'Modifies an existing role.',
  route: '/roles',
  type: 'PUT',
  method: 'update',
  secure: true
},
{
  name: 'Update User Role (?)',
  description: 'Not sure, update specifically the user role?',
  route: '/roles/updateUserRole',
  type: 'PUT',
  method: 'updateUserRole',
  secure: true
},
{
  name: 'Delete a role',
  description: 'Deletes a role from the application.',
  route: '/roles/:id',
  type: 'DELETE',
  method: 'delete',
  secure: true
},
{
  name: 'View the role tree.',
  description: 'Retreives the role tree for a given ID.',
  route: '/roles/tree/:id?',
  type: 'GET',
  method: 'tree',
  secure: true
},
{
  name: 'View sub roles.',
  description: 'View the subroles for a given role Id.',
  route: '/roles/subroles/:id?',
  type: 'GET',
  method: 'subroles',
  secure: true
},
{
  name: 'Update a single role',
  description: 'Updates a single role. This method is used by the role manager',
  route: '/roles/:roleId',
  type: 'PUT',
  method: 'updateSingleRole',
  secure: true
}
];
