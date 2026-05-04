pipeline {
    agent any // We run the first steps on the EC2 server itself
    
    stages {
        // CHANGE 1: Explicitly checkout the Application code first
        stage('Checkout Application Code') {
            steps {
                checkout scm
            }
        }

        stage('Bring Deployment Up') {
            steps {
                echo 'Starting MERN Application via Docker Compose...'
                // Stops any old versions running
                sh 'docker compose down'
                // Starts the DB, Backend, and Frontend in the background
                sh 'docker compose up -d --build'
                
                // Wait for React and Node to fully boot up
                sleep time: 20, unit: 'SECONDS'
            }
        }
        
        stage('Clone Test Code') {
            steps {
                echo 'Downloading Selenium Test Cases...'
                sh 'rm -rf multimart-tests'
                // CHANGE 2: Added .git to the end of the URL
                sh 'git clone https://github.com/usmanbinamjad555/multimart-tests.git'
            }
        }
        
        stage('Execute Selenium Tests') {
            agent {
                docker {
                    image 'markhobson/maven-chrome:jdk-17'
                    // --network host allows the container to see localhost:5173 
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock --shm-size=2g --network host'
                }
            }
            steps {
                echo 'Running automated tests...'
                dir('multimart-tests') {
                    sh 'mvn clean test'
                }
            }
            // CHANGE 3: Generate visual test reports for your assignment screenshots!
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
                // Extracts the email of the person who pushed the current commit
                def COMMITTER_EMAIL = sh(script: "git --no-pager show -s --format='%ae' HEAD", returnStdout: true).trim()
                
                echo "Sending test results to the committer: ${COMMITTER_EMAIL}"
                
                emailext(
                    to: "${COMMITTER_EMAIL}",
                    subject: "MultiMart Pipeline Results: ${currentBuild.currentResult}",
                    body: """
                        <h2>Build Status: ${currentBuild.currentResult}</h2>
                        <p>Project: MultiMart Application Deployment & Testing</p>
                        <p>Check the attached logs or view the Jenkins build here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    attachLog: true,
                    mimeType: 'text/html'
                )
            }
        }
    }
}
