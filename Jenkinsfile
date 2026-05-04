pipeline {
    agent any

    stages {
        stage('Checkout & Deploy') {
            steps {
                checkout scm
                echo 'Stopping any existing containers...'
                sh 'docker compose -p multimart down -v --remove-orphans || true'
                
                echo 'Starting MERN Application...'
                sh 'docker compose -p multimart up -d --build'

                echo 'Waiting for MongoDB to become healthy...'
                sh '''
                    echo "Checking MongoDB status every 10s (max 2 minutes)..."
                    for i in $(seq 1 12); do
                        STATUS=$(docker inspect --format="{{.State.Health.Status}}" mongodb-server 2>/dev/null || echo "missing")
                        echo "Attempt $i/12 — MongoDB health: $STATUS"
                        
                        if [ "$STATUS" = "healthy" ]; then
                            echo "MongoDB is healthy and ready!"
                            break
                        fi
                        
                        if [ "$STATUS" = "missing" ] || [ "$STATUS" = "unhealthy" ]; then
                            echo "--- MongoDB container logs ---"
                            docker logs mongodb-server --tail 20 || true
                        fi
                        
                        if [ "$i" = "12" ]; then
                            echo "ERROR: MongoDB never became healthy after 2 minutes"
                            docker ps -a
                            exit 1
                        fi
                        
                        sleep 10
                    done
                '''

                echo 'Waiting 20s for backend to fully connect to MongoDB...'
                sleep time: 20, unit: 'SECONDS'

                echo 'All containers status:'
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
