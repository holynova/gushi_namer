import $ from 'jquery';
import { log } from './debugTools';
import rand from './rand';
import { debugMode } from './config'
  ;

class Namer {
  constructor(badChars, avoidChars) {
    this.loading = false;
    this.book = null;
    this.badChars = badChars.split('');
    this.avoidChars = avoidChars.split('');
    this.activeBook = null;
  }

  // TODO
  formatStr(str) {
    // const res = str.replace(/[\s　 ]/g, '');
    let res = str.replace(/(\s|　|”|“){1,}|<br>|<p>|<\/p>/g, '');
    res = res.replace(/\(.+\)/g, '');
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
    return str.split('').filter(char => this.badChars.indexOf(char) === -1).join('');
  }

  cleanAvoidChar(str) {
    return str.split('').filter(char => this.avoidChars.indexOf(char) === -1).join('');
  }

  genName(fixed) {

    if (!this.activeBook) {
      return null;
    }
    // const len = this.book.length;
    try {
      const passage = rand.choose(this.activeBook);
      const { content, title, author, book, dynasty } = passage;
      if (!content) {
        return null;
      }

      const sentenceArr = this.splitSentence(content);

      if (!(Array.isArray(sentenceArr) && sentenceArr.length > 0)) {
        return null;
      }


      // if (Array.isArray(sentenceArr) && sentenceArr.length <= 0) {
      //   log({ passage, sentenceArr });
      // }

      const sentence = rand.choose(sentenceArr.filter(sent=>{
        return sent.includes(fixed);
      }));


      const cleanSentence = this.cleanAvoidChar(this.cleanBadChar(this.cleanPunctuation(sentence)));
      debugger;
      if (cleanSentence.length <= 2) {
        return null;
      }


      // log({ content, sentence });
      // const charList = this.cleanBadChar(cleanSentence);
      let name = this.getTwoChar(cleanSentence.split(''));
      if (fixed!=""){
        if (cleanSentence.includes(fixed)){
          name = this.getTwoCharWithFixed(cleanSentence.split(''), fixed)
        }
        else{
          return null;
        }
      }
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
    } catch (err) {
      log(err);
    }
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
  }

  getTwoCharWithFixed(arr, fixed) {
    const len = arr.length;

    const fixedIndexes = [];
    for(let i=0; i<len;i++) {
        if (arr[i] === fixed ) fixedIndexes.push(i);
    }
    const first = rand.choose(fixedIndexes);
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
  }

  updateActiveBook(fixed, cb){
    this.activeBook = this.book.filter(obj=>{
      return obj.content && obj.content.includes(fixed);
    });
    if (typeof cb === 'function') {
      cb(this.activeBook);
    }
    log(`active book updated with fixed="${fixed}", number of records = ${this.activeBook.length}`)
  }

  updateAvoidChars(avoidChars, cb){
    this.avoidChars = avoidChars.split('');
    if (typeof cb === 'function') {
      cb(this.activeBook);
    }
    log(`avoidChars got updated to "${this.avoidChars}"`);

  }


  loadBooks(books, cb) {
    log(books);
    const $this = this;
    $this.book = [];
    let bookRequests = [];
    for (let i = 0; i<books.length; i++){
      const url = `./json/${books[i]}.json`;
      bookRequests.push($.ajax(url))
    }
    $this.loading = true;
    $.when.apply(null, bookRequests).then(function(){
      let responses = arguments
      if(bookRequests.length==1){
        responses = [responses];
      }
      $.each(responses, function(i, row){
        const status = row[1];
        const data = row[0];
        log(`${books[i]} loaded`);
        $.each(data, function(i, record){
          $this.book.push(record);
        });
      });
      $this.loading = false;
      if (typeof cb === 'function') {
        cb();
      }

    },
    err => log(err))
  }
}
export default Namer;
