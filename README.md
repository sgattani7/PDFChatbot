# **SETUP**  

## INSTALLATIONS  
1. Install Docker on your system  
2. Install Ollama on your system  

## OLLAMA SETUP  
3. On your system's terminal, start the Ollama server using:  
   ```sh
   ollama serve

4. Open a new terminal and run:
   ```sh
   ollama list
This shows the models that are up and running. This will be empty initially.

5. Pull the LLaMA3 model using:
	```sh
   ollama pull llama3
6. Pull the nomic-embed-text model using:
	```sh
   ollama pull nomic-embed-text

7. After steps 5 and 6, runing:
   ```sh
   ollama list
  should show these two models as up and running.


## APPLICATION SETUP  
8. Open the repository in your IDE and navigate into it
9. Run the following command to install dependencies and start the server:
    ```sh
   docker-compose up --build

10. Enjoy the application on localhost:3000 in your browser! 🚀




