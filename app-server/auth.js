function auth() {
  function login(req, res) {
    res.status(200).send({message: 'Nothing to see here'});
  }

  return {
    login: login
  }
}

module.exports = new auth();
