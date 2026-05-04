pipeline {
    agent any

    stages {
        stage('Checkout & Deploy') {
            steps {
                checkout scm
                
                echo 'Starting MERN Application via Docker Compose...'
                sh 'docker compose down' 
                sh 'docker compose up -d --build'
                
                echo 'Waiting 90s for MongoDB and Backend to handshake...'
                sleep time: 90, unit: 'SECONDS'
                
                echo 'Seeding Database with test data...'
                // Using a subshell to find the backend container ID dynamically
                sh 'docker exec $(docker ps -q -f name=backend) npm run seed'
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
                echo 'Downloading Selenium Test Cases...'
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
                def COMMITTER_EMAIL = sh(script: "git --no-pager show -s --format='%ae' HEAD", returnStdout: true).trim()
                echo "Sending results to: ${COMMITTER_EMAIL}"
                emailext(
                    to: "${COMMITTER_EMAIL}",
                    subject: "MultiMart SP23-BCS-115 Build: ${currentBuild.currentResult}",
                    body: "Build ${env.BUILD_NUMBER} finished with status ${currentBuild.currentResult}. View logs: ${env.BUILD_URL}",
                    attachLog: true,
                    mimeType: 'text/html'
                )
            }
        }
    }
}
