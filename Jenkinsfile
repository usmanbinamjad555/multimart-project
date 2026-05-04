pipeline {
    agent any

    stages {
       stage('Checkout & Deploy') {
            steps {
                checkout scm
                
                echo 'Starting MERN Application...'
                // The '-p multimart' flag ensures both workspaces target the same project name
                sh 'docker compose -p multimart down' 
                sh 'docker compose -p multimart up -d --build'
                
                echo 'Waiting 90s for services to stabilize...'
                sleep time: 90, unit: 'SECONDS'
                
                echo 'Seeding Database...'
                // Updated to target the consistent container name
                sh 'docker exec mongodb-server mongosh multimart --eval "db.dropDatabase()"' // Optional: Clear old data
                sh 'docker exec backend-api npm run seed'
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
