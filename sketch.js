let bola;
let jogadorY, computadorY;
let larguraRaquete = 15, alturaRaquete = 150;
let velocidadeBolaX, velocidadeBolaY;
let velocidadeComputador = 4;
let alturaBarra = 5; // Espessura das barras superior e inferior
let anguloRotacao = 0;
let velocidadeRotacao = 3; // Para controla a velocidade de rotacao

const incrementoVelocidade = 1.05; // Aumento da velocidade a cada colisão
const velocidadeMaxima = 15; // Velocidade máxima da bola

let imagemFundo, imagemBola, imagemBarraJogador, imagemBarraComputador;
let somColisao;// Som de colisão
let somPerdeu;// Som de derrota
let tamanhoBola = 20; // Tamanho inicial da bola
let placarJogador = 0, placarComputador = 0;

let audioHabilitado = false; // Controle para verificar se o áudio já foi ativado


let esmagada = false; // Indica se a bola está "esmagada"
let tempoEsmagamento = 0; // Controla quanto tempo a bola fica menor

function preload() {
  imagemFundo = loadImage('imagens/fundo2.png'); 
  imagemBola = loadImage('imagens/bola.png'); 
  imagemBarraJogador = loadImage('imagens/barra01.png'); 
  imagemBarraComputador = loadImage('imagens/barra02.png'); 

  // Carrega o som e exibe mensagens no console sobre o status
  somColisao = loadSound('teste4.mp3', 
    () => console.log('Som carregado com sucesso'), 
    () => console.error('Erro ao carregar o som')
  );

  // Configurando o formato e carregando o som
  soundFormats('wav'); 
  somPerdeu = loadSound('perdeu.wav'); // Caminho para o arquivo de som
}

function setup() {
  createCanvas(800, 400);
  bola = createVector(width / 2, height / 2);
  velocidadeBolaX = random([-4, 4]);
  velocidadeBolaY = random(-3, 3); 
  jogadorY = height / 2 - alturaRaquete / 2;
  computadorY = height / 2 - alturaRaquete / 2;
  // Força a ativação do áudio após interação do usuário
  userStartAudio();
  
}



function draw() {
  // Desenha o fundo
  image(imagemFundo, 0, 0, width, height);

  //Para o placar
  textSize(32);
  fill(255);
  textAlign(CENTER);
  text(`${placarJogador} : ${placarComputador}`, width / 2, 50);

  // Desenha as raquetes
  image(imagemBarraJogador, 20, jogadorY, larguraRaquete, alturaRaquete);
  image(imagemBarraComputador, width - 30, computadorY, larguraRaquete, alturaRaquete);

  // Controla o efeito de esmagamento
  if (esmagada && millis() - tempoEsmagamento > 100) {
    // Se passaram 100ms, volta ao tamanho original
    tamanhoBola = 20;
    esmagada = false;
  }

  // Desenha a bola com o tamanho ajustado
  push();
  translate(bola.x, bola.y);
  rotate(anguloRotacao);
  imageMode(CENTER); // Define o ponto de referência da imagem como o centro
  image(imagemBola, 0, 0, tamanhoBola, tamanhoBola);
  pop();

  anguloRotacao += velocidadeRotacao;

  // Movimenta a bola
  bola.x += velocidadeBolaX;
  bola.y += velocidadeBolaY;

  // Colisões com as bordas superior e inferior
  if (bola.y - tamanhoBola / 2 < alturaBarra) {
    bola.y = alturaBarra + tamanhoBola / 2;
    velocidadeBolaY *= -1;
  }

  if (bola.y + tamanhoBola / 2 > height - alturaBarra) {
    bola.y = height - alturaBarra - tamanhoBola / 2;
    velocidadeBolaY *= -1;
  }

  // Colisão com a raquete do jogador
  if (bola.x - tamanhoBola / 2 < 30 && bola.y > jogadorY && bola.y < jogadorY + alturaRaquete) {
    tocarSomColisao(); // Toca o som da colisão
    aplicarEsmagamento(); 
    let posicaoRelativa = (bola.y - (jogadorY + alturaRaquete / 2)) / (alturaRaquete / 2);
    let velocidadeAtual = sqrt(velocidadeBolaX ** 2 + velocidadeBolaY ** 2) * incrementoVelocidade;
    let novaVelocidade = calcularNovaVelocidade(posicaoRelativa, velocidadeAtual);

    // Aumenta a velocidade da bola
    novaVelocidade.x *= 1.1; // Aumenta em 10%
    novaVelocidade.y *= 1.1; // Aumenta em 10%

    velocidadeBolaX = novaVelocidade.x;
    velocidadeBolaY = novaVelocidade.y;
    bola.y += 1;
  }

  // Colisão com a raquete do computador
  if (bola.x + tamanhoBola / 2 > width - 30 && bola.y > computadorY && bola.y < computadorY + alturaRaquete) {
    tocarSomColisao(); // Toca o som da colisão
    aplicarEsmagamento();
    let posicaoRelativa = (bola.y - (computadorY + alturaRaquete / 2)) / (alturaRaquete / 2);
    let velocidadeAtual = sqrt(velocidadeBolaX ** 2 + velocidadeBolaY ** 2) * incrementoVelocidade;
    let novaVelocidade = calcularNovaVelocidade(posicaoRelativa, velocidadeAtual, true);

    // Aumenta a velocidade da bola
    novaVelocidade.x *= 1.1; // Aumenta em 10%
    novaVelocidade.y *= 1.1; // Aumenta em 10%

    velocidadeBolaX = novaVelocidade.x;
    velocidadeBolaY = novaVelocidade.y;
    bola.y += 1;
  }

  function tocarSomColisao() {
    // Verifica se o som está carregado e não está sendo reproduzido
    if (somColisao.isLoaded() && !somColisao.isPlaying()) {
      somColisao.play();
    } else {
      console.error("Som não carregado ou já está sendo reproduzido.");
    }
  }

  // Gol: reinicia a bola e atualiza o placar
if (bola.x < 0) {
  // Jogador 2 pontuou
  placarComputador++;
  console.log("Jogador 2 marcou!"); // Para debug
  resetarJogo();
  tocarSomPerdeu(); // Toca o som ao perder
  narrarPlacar();
} else if (bola.x > width) {
  // Jogador 1 pontuou
  placarJogador++;
  console.log("Jogador 1 marcou!"); // Para debug
  resetarJogo();
  tocarSomPerdeu(); // Toca o som ao perder
  narrarPlacar();
}

function narrarPlacar() {
  let mensagem;
  if (placarJogador > placarComputador) {
    mensagem = ` ${placarJogador} a ${placarComputador}!`;
  } else if (placarComputador > placarJogador) {
    mensagem = ` ${placarComputador} a ${placarJogador}!`;
  } else {
    mensagem = ` ${placarJogador} a ${placarComputador}!`;
  }
  
  const utterance = new SpeechSynthesisUtterance(mensagem);
  utterance.lang = 'pt-BR';
  speechSynthesis.speak(utterance);
}


function resetarJogo() {
  bola.set(width / 2, height / 2);
  velocidadeBolaX = random([-4, 4]);
  velocidadeBolaY = random(-3, 3);
}




  // Controle da raquete do jogador
  jogadorY = constrain(mouseY - alturaRaquete / 2, alturaBarra, height - alturaRaquete - alturaBarra);

  // Movimento simples do computador
  computadorY = constrain(
    computadorY + velocidadeComputador * Math.sign(bola.y - (computadorY + alturaRaquete / 2)),
    alturaBarra, height - alturaRaquete - alturaBarra
  );
}

// Aplica o efeito de esmagamento
function aplicarEsmagamento() {
  if (!esmagada) {
    tamanhoBola = 10; // Diminui temporariamente o tamanho da bola
    esmagada = true;
    tempoEsmagamento = millis(); // Marca o momento do esmagamento
  }
}

// Função para tocar o som de derrota
function tocarSomPerdeu() {
  if (somPerdeu.isPlaying()) {
    somPerdeu.stop(); // Garante que o som não sobreponha
  }
  somPerdeu.play(); // Toca o som
}


// Calcula a nova velocidade da bola após colisão
function calcularNovaVelocidade(posicaoRelativa, velocidadeAtual, inverterDirecao = false) {
  let anguloRetorno = map(posicaoRelativa, -1, 1, -PI / 4, PI / 4);
  let novaVelocidadeX = cos(anguloRetorno) * velocidadeAtual;
  let novaVelocidadeY = sin(anguloRetorno) * velocidadeAtual;

  if (inverterDirecao) novaVelocidadeX *= -1;

  return {
    x: constrain(novaVelocidadeX, -velocidadeMaxima, velocidadeMaxima),
    y: constrain(novaVelocidadeY, -velocidadeMaxima, velocidadeMaxima)
  };
}