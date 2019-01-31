// import $ from 'jquery';
import { log } from './debugTools';
import rand from './rand';

class Namer {
  constructor() {
    this.loading = false;
    this.book = null;
  }
  // TODO
  formatStr(str) {
    let res = str.replace(/(\s|　|”|“){1,}||<br>|<p>|<\/p>/g, '');
    res = str.replace(/\(.+\)/g, '');
    return res;
  }

  splitSentence(content) {
    if (!content) {
      return [];
    }
    let str = this.formatStr(content);
    str = str.replace(/！|。|？|；/g, s => `${s}|`);
    str = str.replace(/\|$/g, '');
    let arr = str.split('|');
    arr = arr.filter(item => item.length >= 2);
    return arr;
  }

  // 清除标点符号
  cleanPunctuation(str) {
    const puncReg = /[<>《》！*\(\^\)\$%~!@#…&%￥—\+=、。，？；‘’“”：·`]/g;
    return str.replace(puncReg, '');
  }

  cleanBadChar(str) {
    const badChars = '鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸡鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱'.split('');
    return str.split('').filter(char => badChars.indexOf(char) === -1);
  }

  genName() {
    if (!this.book) {
      return null;
    }
    // const len = this.book.length;
    const passage = rand.choose(this.book);
    const { content, title, author, book, dynasty } = passage;
    const sentence = rand.choose(this.splitSentence(content));
    const cleanSentence = this.cleanPunctuation(sentence);
    // log({ content, sentence });
    const charList = this.cleanBadChar(cleanSentence);
    const name = this.getTwoChar(charList);
    const res = {
      name,
      sentence,
      content,
      title,
      author,
      book,
      dynasty,
    };
    return res;
    // log(res);
    // log('passage', passage);
  }

  getTwoChar(arr) {
    const len = arr.length;
    const first = rand.between(0, len);
    let second = rand.between(0, len);
    let cnt = 0;
    while (second === first) {
      second = rand.between(0, len);
      cnt++;
      if (cnt > 100) {
        break;
      }
    }
    return first <= second ? `${arr[first]}${arr[second]}` : `${arr[second]}${arr[first]}`;
    // let clone = [...arr]
    // let first = rand.between(0, len)
    // clone.
    // let second =
  }

  loadBook(book, cb) {
    const url = `./json/${book}.json`;
    this.loading = true;
    $.ajax({
      url,
      success: (data) => {
        log(`${book} loaded`);
        this.loading = false;
        this.book = data;
        if (typeof cb === 'function') {
          cb(data);
        }
      },
      fail: err => log(err),
    });
  }
}
export default Namer;

// function getNameHtml() {
//   const book = getCurBook();
//   log('book', book);
//   // loading book file
//   const passage = getPassage(book);
//   // let {
//   //   author, dynasty, content, title, book: bookname
//   // } = passage

//   const name = getName(passage.content);
//   // const res = Object.assign({}, passage, { name });
//   const {
//     author, dynasty, content, title, book: bookname,
//   } = passage;

//   return `
//   <div class='name-item' >

//   </div>
//   `;
//   // return {
//   //   ...passage,
//   //   name,
//   // }
// }


// function getCurBook() {
//   return document.querySelector("input[name='book']:checked").value;
// }

// function getPassage() {

// }
// function getName() {

// }

// function getSentence() {

// }

// function main() {
//   const books = [
//     { value: 'shijing', name: '诗经' },
//     { value: 'chuci', name: '楚辞' },
//     { value: 'tangshi', name: '唐诗' },
//     { value: 'songci', name: '宋词' },
//     { value: 'yuefu', name: '乐府诗集' },
//     { value: 'gushi', name: '古诗三百首' },
//     { value: 'cifu', name: '辞赋' },
//   ];
//   sel('.book-selector').innerHTML = genRadio(books);
//   sel('.btn-go').addEventListener('click', () => {

//   }, false);
// }

// $(document).ready(main);
// main();
