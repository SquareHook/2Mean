module.exports = [
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
  route: '/roles/subroles/:id?',
  type: 'GET',
  method: 'subroles',
  secure: true
}
];
