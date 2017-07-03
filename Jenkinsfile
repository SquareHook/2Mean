node('2Mean') {
  stage('Checkout') {
    checkout scm
  }
  stage('Build') {
    sh '''sudo docker build -t 2mean .'''
  }
  stage('Test') {
    sh '''sudo docker run -v $WORKSPACE/build:/usr/src/app/build -v $WORKSPACE/coverage:/usr/src/app/coverage 2mean npm run test || true'''
    junit 'build/reports/server/test-results.xml'
    step([$class: 'CoberturaPublisher', autoUpdateHealth: false, autoUpdateStability: false, coberturaReportFile: 'coverage/cobertura-coverage.xml', failUnhealthy: false, failUnstable: false, maxNumberOfBuilds: 0, onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false])
  }
  stage('Deploy') {
    if (env.BRANCH_NAME == 'master') {

    }
  }
}
