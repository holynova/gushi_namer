import $ from 'jquery';
import '../styles/normalize.scss';
import '../styles/radio.scss';
import '../styles/style.scss';
import Namer from './namer';
import { log } from './debugTools';
import { debugMode } from './config'
  ;

const sel = str => document.querySelector(str);

function genRadio(books) {
  const arr = books.map(b => `
    <div class="inputGroup">
        <input id="${b.value}" name="book" type="radio" value="${b.value}" ${b.checked ? 'checked' : ''}  />
        <label for="${b.value}">${b.name}</label>
      </div>`);
  const html = arr.join('');
  return html;
}

function genNameHtml(obj) {
  const {
    name,
    sentence,
    title,
    author,
    book,
    dynasty } = obj;
  const familyName = $('input[name="family-name"]').val();
  return `
    <li class='name-box'>
        <h3>${familyName}${name}</h3>
        <p class='sentence'>
          <span>「</span>${sentence}<span>」</span>
        </p>
        <p class='book'>${book}•${title}</p>
        <p class='author'>[${dynasty}]${author || '佚名'}</p>
      </li>`;

  // const {

  // }
}

function setLoading() {
  $('.loader').css({
    display: 'block',
  });
}
function clearLoading() {
  // $('.loader').html('');
}

function createRadioGroup() {
  const books = [
    { value: 'shijing', name: '诗经', checked: true },
    { value: 'chuci', name: '楚辞' },
    { value: 'tangshi', name: '唐诗' },
    { value: 'songci', name: '宋词' },
    { value: 'yuefu', name: '乐府诗集' },
    { value: 'gushi', name: '古诗三百首' },
    { value: 'cifu', name: '辞赋' },
  ];
  sel('.book-selector').innerHTML = genRadio(books);
}

function loadBook(namer) {
  const book = $("input[name='book']:checked").val();
  setLoading();
  namer.loadBook(book, () => {
    clearLoading();
  });
}


function initEvents(namer) {
  $('input[name=\'book\']').change((e) => {
    loadBook(namer);
  });


  sel('.btn-go').addEventListener('click', () => {
    const n = 10;
    const html = [];
    for (let i = 0; i < n; i++) {
      const nameObj = namer.genName();
      html.push(genNameHtml(nameObj));
    }
    $('.result-container').html(html.join(''));
  }, false);
}

function initFirstBook(namer) {

}
function main() {
  const namer = new Namer();
  // namer.loadBook('shijing');
  createRadioGroup();
  loadBook(namer);
  // initFirstBook();
  initEvents(namer);
  setLoading();
}


function test() {
  const logStr = (str) => {
    log(`'${str}'`);
  };
  const n = new Namer();
  const inputs = [
    '<p>习习谷风，以阴以雨。黾勉同心，不宜有怒。采葑采菲，无以下体？德音莫违，及尔同死。</p>',
    ' 记得年时临上马看人眼泪汪汪',
    '惜诵　　惜诵以致愍兮，发愤以抒情。　　所作忠而言之兮，指苍天以为正。　　令五帝使折中兮，戒六神与向服…望大河之洲渚兮，悲申徒之抗迹。　　骤谏君而不听兮，重任石之何益？　　心絓结而不解兮，思蹇产而不释。  ',
  ];
  logStr(n.splitSentence(inputs[0]));
  logStr(n.formatStr(inputs[0]));
  logStr(n.formatStr(inputs[1]));
}

$(document).ready(main);

if (debugMode) {
  test();
}

