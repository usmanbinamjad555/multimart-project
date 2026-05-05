pipeline {
    agent any

    stages {
        stage('Checkout & Deploy') {
    steps {
        checkout scm
        echo 'Stopping existing containers...'
        sh 'docker compose -p multimart down -v --remove-orphans || true'

        echo 'Starting MERN Application...'
        sh 'docker compose -p multimart build --no-cache'
        sh 'docker compose -p multimart up -d'

        echo 'Waiting for MongoDB to become healthy...'
        sh '''
            for i in $(seq 1 18); do
                STATUS=$(docker inspect --format="{{.State.Health.Status}}" mongodb-server 2>/dev/null)
                echo "Attempt $i/18 — MongoDB health: [$STATUS]"
                if [ "$STATUS" = "healthy" ]; then
                    echo "MongoDB is ready!"
                    break
                fi
                if [ $i -eq 18 ]; then
                    echo "Timed out. Printing logs:"
                    docker logs mongodb-server --tail 30
                    docker ps -a
                    exit 1
                fi
                sleep 10
            done
        '''

        echo 'Waiting 15s for backend to connect...'
        sleep time: 15, unit: 'SECONDS'

        echo 'Container status:'
        sh 'docker ps'

        echo 'Seeding Database...'
        sh 'docker exec mongodb-server mongosh multimart --eval "db.dropDatabase()" || true'
        sh 'docker exec backend-api node utils/seeder.js'
    }
}

        stage('Execute Selenium Tests') {
            agent {
                docker {
                    image 'markhobson/maven-chrome:jdk-17'
                    args '-u root --entrypoint="" -v /var/run/docker.sock:/var/run/docker.sock --shm-size=2g --network host'
                }
            }
            steps {
                echo 'Cloning Selenium test repository...'
                sh 'rm -rf multimart-tests'
                sh 'git clone https://github.com/usmanbinamjad555/multimart-tests.git'

                echo 'Running automated tests...'
                dir('multimart-tests') {
                    sh 'mvn clean test -Dtest=MultiMartTest'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'multimart-tests/target/surefire-reports/*.xml'
                }
            }
        }
    }

    post {
        always {
            script {
                def COMMITTER_EMAIL = sh(
                    script: "git --no-pager show -s --format='%ae' HEAD",
                    returnStdout: true
                ).trim()
                echo "Sending results to: ${COMMITTER_EMAIL}"
                emailext(
                    to: "${COMMITTER_EMAIL}",
                    subject: "MultiMart SP23-BCS-115 Build #${env.BUILD_NUMBER}: ${currentBuild.currentResult}",
                    body: """
                        <h2>Build ${env.BUILD_NUMBER} — ${currentBuild.currentResult}</h2>
                        <p><b>Project:</b> MultiMart E-Commerce</p>
                        <p><b>Triggered by:</b> ${COMMITTER_EMAIL}</p>
                        <p><a href="${env.BUILD_URL}">View Full Build Logs</a></p>
                    """,
                    attachLog: true,
                    mimeType: 'text/html'
                )
            }
        }
    }
}
