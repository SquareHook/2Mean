module.exports = [
{
  route: '/roles',
  type: 'POST',
  method: 'create',
  secure: false
},
{
  route: '/roles',
  type: 'PUT',
  method: 'update',
  secure: false
},
{
  route: '/roles/:id',
  type: 'DELETE',
  method: 'delete',
  secure: false
},
{
  route: '/roles/tree/:id?',
  type: 'GET',
  method: 'tree',
  secure: false
},
{
  route: '/roles/subroles/:id',
  type: 'GET',
  method: 'subroles',
  secure: false
}
];
