*SETUP*

INSTALLATIONS
1. Install Docker on you system
2. Install Ollama on you system 

OLLAMA SETUP
3. On your systems terminal start the Ollama server using "Ollama serve".
4. On a new terminal use the command 'Ollama list"; this shows the models that are up and running. This will be epty initially.
5. Run the command "ollama pull llama3" to pull the model.
6. Run the command "ollama pull nomic-embed-text" to pull the model
7. After steps 5 and 6 running "ollama list" should show you these two modles as up running.

APPLICATION SETUP
8. Open the repository on your IDE and cd into it 
9. run the command "docker-compose up --build"  this will install all the dependencies and will run the server on localhost:3000
(please note that this can take a few minutes when run for the first time since it installs all the dependencies of you Python and react project)

10. Enjoy the application on localhost:3000 on your browser :)

