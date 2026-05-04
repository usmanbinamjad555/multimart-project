pipeline {
    agent any

    stages {
        stage('Checkout & Deploy') {
            steps {
                checkout scm
                echo 'Starting MERN Application...'
                sh 'docker compose -p multimart down -v'
                sh 'docker compose -p multimart up -d --build'
                
                echo 'Waiting for MongoDB healthcheck...'
                sh '''
                    for i in $(seq 1 24); do
                        STATUS=$(docker inspect --format="{{.State.Health.Status}}" mongodb-server 2>/dev/null || echo "not_found")
                        echo "Attempt $i — MongoDB: $STATUS"
                        if [ "$STATUS" = "healthy" ]; then
                            echo "MongoDB ready."
                            break
                        fi
                        sleep 5
                    done
                '''

                echo 'Waiting for backend to initialize...'
                sleep time: 15, unit: 'SECONDS'

                echo 'Verifying containers are running...'
                sh 'docker ps'

                echo 'Seeding Database...'
                sh 'docker exec mongodb-server mongosh multimart --eval "db.dropDatabase()"'
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
                    sh 'mvn clean test'
                }
            }
            post {
                always {
                    junit 'multimart-tests/target/surefire-reports/*.xml'
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
                        <p>View full logs: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    attachLog: true,
                    mimeType: 'text/html'
                )
            }
        }
    }
}
