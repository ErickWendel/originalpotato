window.onload = function() {
  var myId = '';
  var socket = {};
  let obj = document.querySelector('.objeto');
  let label = document.querySelector('.label');

  let skin = document.querySelector('.skin');
  let gemidaoativo = false;
  let botaoAtivo = false;

  let timeout = 0;
  let btnplay = document.querySelector('.btn-play');

  obj.addEventListener('click', function() {
    press();
  });

  function timerSkin() {
    //skin.style.height = heightSkin + 'px';
    if (heightSkin === 0) {
      // playAudio();
    }
  }

  function press() {
    // debugger;
    socket.emit('press', {
      username: myId,
      sendDate: new Date(),
    });
    botaoAtivo = false;
    clearTimeout(timeout);
    obj.classList.add('v-none');
  }
  function fail() {
    // debugger;
    socket.emit('userLoser');
    botaoAtivo = false;
    clearTimeout(timeout);
    obj.classList.add('v-none');
  }

  function register() {
    socket.on(myId, function(data) {
      botaoAtivo = true;
      // timeout = setTimeout(() => {
      //   if (!botaoAtivo) return;
      //   fail();
      // }, 3000);

      if (data === 'HASFAIL' || data === 'ENDGAME') {
        if (gemidaoativo) return;
        gemidaoativo = true;
        botaoAtivo = false;
        playAudio();

        return;
      }
      obj.classList.remove('v-none');
      // var node = document.createElement('li');
      // var textnode = document.createTextNode(data);
      // node.appendChild(textnode);
      // document.getElementById('items').appendChild(node);
    });
  }
  let labels = [
    'Vai logo!',
    'Ta acabando',
    'Aperta essa porra',
    'Seu lerdo',
    'Sua mae chora no banho',
  ];

  let i = 0;
  setInterval(function() {
    label.innerHTML = labels[i];
    i = i + 1;
    if (i == labels.length) {
      i = 0;
    }
  }, 1000);

  changeBg();
  var url = 'http://localhost:3000/';
  if (location.href.indexOf(url) !== -1) socket = io.connect(url);
  else socket = io.connect('https://originalpotato.herokuapp.com/');

  socket.on('expiration-date', function(data) {
    if (!data) return;
    console.log(data);
  });

  let form = document.querySelector('.form');
  let btn = document.querySelector('.btn');
  let nome = document.querySelector('.nome');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let data = nome.value;
    form.classList.add('none');
    myId = data + new Date().getTime();
    socket.emit('add-user', {
      username: myId,
    });
    register();
  });
};

function changeBg() {
  let body = document.querySelector('body');
  let images = ['/img/potato.gif', '/img/potato2.gif'];

  let i = 0;
  setInterval(function() {
    body.style.backgroundImage = 'url(' + images[i] + ')';
    i = i + 1;
    if (i == images.length) {
      i = 0;
    }
  }, 1000);
}

var url = '../audio/gemidao2.mp3';
createjs.Sound.registerSound(url, 'omg');

function playAudio() {
  // var audio = new Audio('../audio/gemidao.mp3');
  // audio.play();
  // if (location.href.indexOf('localhost') !== -1) url = '../audio/gemidao2.mp3';

  createjs.Sound.play('omg');
  let body = document.querySelector('body');
  body.classList.add('fail');
}
