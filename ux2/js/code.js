function abrirPDF() {
    var urlPDF = 'others/IvanCV.pdf'; // Reemplaza 'ruta/del/archivo.pdf' con la URL del archivo PDF
    window.open(urlPDF, '_blank');
}



document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
  
    function highlightNavLink() {
      let scrollPosition = window.scrollY;
      let windowHeight = window.innerHeight;
  
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const center = top + height / 2;
  
        // Verificar si el centro de la sección está dentro del área visible de la ventana
        if (center >= scrollPosition && center <= scrollPosition + windowHeight) {
          let targetId = section.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${targetId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }
  
    window.addEventListener('scroll', highlightNavLink);
  });










  document.getElementById("miboton").addEventListener("click", function() {
    if(document.readyState === "complete" || document.readyState === "interactive") {
        Init();
    } else {
        document.addEventListener("DOMContentLoaded", Init);
    }
});

document.getElementById("reiniciarBoton").addEventListener("click", function() {
    score = 0;
    ReiniciarJuego();
});

document.addEventListener("keydown", HandleKeyDown);
document.addEventListener("touchstart", HandleTouchStart);

function HandleTouchStart(ev) {
    Saltar();
}

var contadorReinicios = 0;

//****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;

function Init() {
    if (!contenedor) {
        gameOver = document.querySelector(".game-over");
        suelo = document.querySelector(".suelo");
        contenedor = document.querySelector(".contenedor");
        textoScore = document.querySelector(".score");
        dino = document.querySelector(".dino");
    }
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY; 

var sueloX = 0;
var velEscenario = 1280/3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if(parado) return;
    
    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){
        Saltar();
    }
}

function Saltar(){
    if(dinoPosY === sueloY){
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
    }
}

function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if(dinoPosY < sueloY){
        TocarSuelo();
    }
    dino.style.bottom = dinoPosY + "px";
}

function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if(saltando){
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if(tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if(Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}

function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";
        }
    }
}

function MoverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if(nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    } else if(score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if(score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3 / gameVel) + "s";
}

function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            break;
        } else {
            if(IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

function ReiniciarJuego() {
    time = new Date();
    velY = 0;
    dinoPosX = 42;
    dinoPosY = sueloY;
    sueloX = 0;
    gameVel = 1;
    score = 0;
    parado = false;
    saltando = false;
    tiempoHastaObstaculo = 2;
    tiempoHastaNube = 0.5;

    for (var i = 0; i < obstaculos.length; i++) {
        contenedor.removeChild(obstaculos[i]);
    }
    obstaculos = [];
    for (var i = 0; i < nubes.length; i++) {
        contenedor.removeChild(nubes[i]);
    }
    nubes = [];

    gameOver.style.display = "none";
    suelo.style.left = "0px";
    suelo.style.animationDuration = "3s";
    contenedor.classList.remove("mediodia", "tarde", "noche");

    Init();
}


//Proyectos
function changeImage(src) {
  document.getElementById('mainImage').src = src;
}




const rasaButton = document.querySelector('.rasa-button');
const chatWidget = document.getElementById('rasa-chat-widget');
const closeChat = document.querySelector('.close-chat');
const sendMessage = document.getElementById('send-message');
const userInput = document.getElementById('user-message');
const chatMessages = document.querySelector('.chat-messages');

// Toggle chat widget
rasaButton.addEventListener('click', (e) => {
    e.preventDefault();
    chatWidget.style.display = chatWidget.style.display === 'none' ? 'flex' : 'none';
    
    // Test connection when chat opens
    if (chatWidget.style.display === 'flex') {
        appendMessage('bot', 'Hello! I am Ivan\'s assistant. How can I help you today?');
    }
});

// Close chat widget
closeChat.addEventListener('click', () => {
    chatWidget.style.display = 'none';
});

// Modify the sendMessage event handler
sendMessage.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message) {
        // Display user message
        appendMessage('user', message);
        userInput.value = '';

        try {
            // Send message to Rasa server
            const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    sender: "user",
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const botResponses = await response.json();
            
            if (botResponses.length === 0) {
                appendMessage('bot', "I'm sorry, I didn't understand that.");
                return;
            }
            
            // Display bot response(s)
            botResponses.forEach(resp => {
                appendMessage('bot', resp.text);
                if (resp.image) {
                    appendImage('bot', resp.image);
                }
            });

        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, I am having trouble connecting to the server. Please make sure the Rasa server is running.');
        }
    }
});

// Handle enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage.click();
    }
});

// Add these emoji constants at the top
const BOT_EMOJI = '🤖';
const USER_EMOJI = '👤';

// Modify the appendMessage function to include emojis
const appendMessage = (sender, message) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    const emoji = sender === 'bot' ? BOT_EMOJI : USER_EMOJI;
    messageDiv.innerHTML = `
        <span class="message-emoji">${emoji}</span>
        <span class="message-text">${message}</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

// Add this function to handle images in responses
function appendImage(sender, imageUrl) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const image = document.createElement('img');
    image.src = imageUrl;
    image.style.maxWidth = '200px';
    
    messageDiv.appendChild(image);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

