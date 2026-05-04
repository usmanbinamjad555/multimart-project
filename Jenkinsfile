pipeline {
    agent any // Initial steps run on the EC2 base environment

    stages {
        stage('Checkout & Deploy') {
            steps {
                checkout scm
                
                echo 'Starting MERN Application via Docker Compose...'
                // Remove -v if you have it here, to keep things stable
                sh 'docker compose down' 
                sh 'docker compose up -d --build'
                
                echo 'Waiting for services to stabilize...'
                sleep time: 60, unit: 'SECONDS'
                
                // NEW STEP: This is the command that worked in your terminal
                echo 'Seeding Database with test data...'
                sh 'docker exec multimart-test-pipeline-backend-1 npm run seed'
            }
        }
        
        stage('Execute Selenium Tests') {
            agent {
                docker {
                    image 'markhobson/maven-chrome:jdk-17'
                    // Fix: Added --entrypoint="" to allow Jenkins to run commands inside the container
                    // Fix: Maintained --network host so the container sees localhost:5173
                    args '-u root --entrypoint="" -v /var/run/docker.sock:/var/run/docker.sock --shm-size=2g --network host'
                }
            }
            steps {
                // Fix: Cloning INSIDE this stage ensures the test code is in the correct container workspace
                echo 'Downloading Selenium Test Cases...'
                sh 'rm -rf multimart-tests'
                sh 'git clone https://github.com/usmanbinamjad555/multimart-tests.git'
                
                echo 'Running automated tests...'
                dir('multimart-tests') {
                    // Maven will now find the pom.xml in this directory
                    sh 'mvn clean test'
                }
            }
            post {
                always {
                    // Publishes the test results to the Jenkins Dashboard
                    junit 'multimart-tests/target/surefire-reports/*.xml'
                }
            }
        }
    }

    post {
        always {
            script {
                // Extracts the email of the person who pushed the commit
                def COMMITTER_EMAIL = sh(script: "git --no-pager show -s --format='%ae' HEAD", returnStdout: true).trim()
                
                echo "Sending test results to the committer: ${COMMITTER_EMAIL}"
                
                emailext(
                    to: "${COMMITTER_EMAIL}",
                    subject: "MultiMart Pipeline Results: ${currentBuild.currentResult}",
                    body: """
                        <h2>Build Status: ${currentBuild.currentResult}</h2>
                        <p>Project: MultiMart Application Deployment & Testing</p>
                        <p>View the Jenkins build logs here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    attachLog: true,
                    mimeType: 'text/html'
                )
            }
        }
    }
}
