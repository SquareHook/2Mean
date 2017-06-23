module.exports = [
{
  route: '/roles',
  type: 'GET',
  method: 'list',
  secure: true
},
{
  route: '/roles',
  type: 'POST',
  method: 'create',
  secure: true
},
{
  route: '/roles',
  type: 'PUT',
  method: 'update',
  secure: true
},
{
  route: '/roles/updateUserRole',
  type: 'PUT',
  method: 'updateUserRole',
  secure: true
},
{
  route: '/roles/:id',
  type: 'DELETE',
  method: 'delete',
  secure: true
},
{
  route: '/roles/tree/:id?',
  type: 'GET',
  method: 'tree',
  secure: true
},
{
  route: '/roles/roleCache/:id?',
  type: 'GET',
  method: 'roleCache',
  secure: true
}
];
