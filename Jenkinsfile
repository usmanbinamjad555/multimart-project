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
                // Get the committer's email
                def COMMITTER_EMAIL = sh(
                    script: "git --no-pager show -s --format='%ae' HEAD",
                    returnStdout: true
                ).trim()

                // Define your EC2 Public IP (Update this if your IP changes)
                def SERVER_IP = "3.26.148.149"
                def FRONTEND_URL = "http://${SERVER_IP}:5173"

                // Create a fancy status message based on the build result
                def statusColor = currentBuild.currentResult == 'SUCCESS' ? '#28a745' : '#dc3545'
                def statusIcon = currentBuild.currentResult == 'SUCCESS' ? '✅' : '❌'
                def statusMessage = currentBuild.currentResult == 'SUCCESS' ? 
                    "All 15 test cases executed successfully! The deployment is now live." : 
                    "The build failed during execution. Please check the attached logs."

                echo "Sending results to: ${COMMITTER_EMAIL}"
                
                emailext(
                    to: "${COMMITTER_EMAIL}, qasimalik@gmail.com", // Emails you AND your professor
                    subject: "${statusIcon} MultiMart Build #${env.BUILD_NUMBER} [SP23-BCS-115]: ${currentBuild.currentResult}",
                    body: """
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
                                <h1 style="margin: 0;">MultiMart Deployment</h1>
                                <h3 style="margin: 5px 0 0 0;">Build #${env.BUILD_NUMBER} - ${currentBuild.currentResult}</h3>
                            </div>
                            
                            <div style="padding: 20px; background-color: #f9f9f9;">
                                <p style="font-size: 16px; font-weight: bold; color: #333;">${statusMessage}</p>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Student ID:</b></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">SP23-BCS-115</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Triggered By:</b></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${COMMITTER_EMAIL} (GitHub Push)</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><b>Live Deployment:</b></td>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="${FRONTEND_URL}" style="color: #0066cc; text-decoration: none;">${FRONTEND_URL}</a></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px;"><b>Jenkins Logs:</b></td>
                                        <td style="padding: 10px;"><a href="${env.BUILD_URL}" style="color: #0066cc; text-decoration: none;">View Console Output</a></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd;">
                                Automated Email via Jenkins CI/CD Pipeline
                            </div>
                        </div>
                    """,
                    attachLog: true,
                    mimeType: 'text/html'
                )
            }
        }
    }
