$(() => {
  console.log('ready');
  $('#btn-go').on('click', () => {
    refreshName(10);
  });
  // refreshName(3);
  function refreshName(num) {
    const jsonFilename = $('select').val();
    $.ajax({
      url: jsonFilename,
      dataType: 'json',
      success(dataArr) {
        let html = '';
        let cnt = 0;
        while (cnt < num) {
          const nameObj = genName(dataArr);
          if (!hasBanWord(nameObj.name)) {
            html += name2html(nameObj);
            cnt++;
          }
        }
        $('ul').html(html);
      },
    });
  }

  function name2html(nameObj) {
    const familyName = $('input[type=text]').val();
    nameObj.familyName = familyName;
    const template = "<li class='name-box'><h3>{{familyName}}{{name}}</h3><p class='sentence'><span>「</span>{{sentence}}<span>」</span></p><p class = 'book'>{{book}}•{{title}}</p><p class = 'author'>[{{dynasty}}]{{author}}</p></li>";
    return getHtmlFromTemplate(template, nameObj);
  }

  function getHtmlFromTemplate(template, dataJson) {
    let html = template;
    for (const key in dataJson) {
      const reg = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(reg, dataJson[key]);
    }
    return html;
  }

  function genRandPoem(dataArr) {
    let index = randBetween(0, dataArr.length);
    while (!dataArr[index].content) {
      index = randBetween(0, dataArr.length);
    }
    return dataArr[index];
  }

  function randBetween(min, max) {
    // [min,max)  max is not included
    return min + Math.floor(Math.random() * (max - min));
  }

  function splitSentence(str) {
    str = cleanStr(str);
    str = str.replace(/！|。|？|；/g, str => `${str}|`);
    str = str.replace(/\|$/g, '');
    let arr = str.split('|');
    arr = arr.filter(item => item.length >= 2);
    return arr;
  }

  function cleanStr(str) {
    str = str.replace(/\s|<br>|<p>|<\/p>|　|”|“/g, '');
    str = str.replace(/\(.+\)/g, '');
    return str;
  }

  function randCharFromStr(str, num, ordered) {
    if (typeof ordered === 'undefined') {
      ordered = true;
    }
    let randNumArr = genRandNumArr(str.length, num);
    if (ordered) {
      randNumArr = randNumArr.sort((a, b) => a - b);
    }
    let res = '';
    for (let i = 0; i < randNumArr.length; i++) {
      res += str.charAt(randNumArr[i]);
    }
    return res;
  }

  function genRandNumArr(max, num) {
    if (num > max) {
      num = max;
      console.log(`max=${max} num = ${num}`);
      // throw new Error('too large num');
    }
    const orderedNum = [];
    for (var i = 0; i < max; i++) {
      orderedNum.push(i);
    }
    const res = [];
    for (var i = 0; i < num; i++) {
      const randIndex = randBetween(0, orderedNum.length);
      const randNum = orderedNum[randIndex];
      res.push(randNum);
      orderedNum.splice(randIndex, 1);
      // console.log('i=' + i + 'rand=' + rand, orderedNum);
    }
    return res;
  }

  function genName(dataArr) {
    const randPoem = genRandPoem(dataArr);
    const sentences = splitSentence(randPoem.content);
    const randSentence = sentences[randBetween(0, sentences.length)];
    const name = {};
    name.title = randPoem.title;
    name.book = randPoem.book;
    name.sentence = randSentence;
    name.content = randPoem.content;
    name.author = randPoem.author ? randPoem.author : '佚名';
    name.dynasty = randPoem.dynasty;
    const cleanSentence = cleanPunctuation(randSentence);
    name.name = randCharFromStr(cleanSentence, 2);
    return name;
  }
  // 清除标点符号
  function cleanPunctuation(str) {
    const puncReg = /[<>《》！*\(\^\)\$%~!@#…&%￥—\+=、。，？；‘’“”：·`]/g;
    return str.replace(puncReg, '');
  }

  function hasBanWord(str) {
    const banStr = '鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸡鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱';
    const banArr = banStr.split('');
    // console.log(banArr);
    for (let i = 0; i < banArr.length; i++) {
      if (str.indexOf(banArr[i]) !== -1) {
        // console.log(str, banArr[i]);
        return true;
      }
    }
    return false;
  }
});
