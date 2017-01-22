$(function() {
    console.log('ready');
    $('#btn-go').on('click', function() {
            refreshName(10)
        })
        // refreshName(3);
    function refreshName(num) {
        var jsonFilename = $('select').val();
        $.ajax({
            url: jsonFilename,
            dataType: 'json',
            success: function(dataArr) {
                var html = '';
                var cnt = 0;
                while (cnt < num) {
                    var nameObj = genName(dataArr);
                    if (!hasBanWord(nameObj.name)) {
                        html += name2html(nameObj);
                        cnt++;
                    }
                }
                $('ul').html(html);
            }
        })
    }

    function name2html(nameObj) {
        var familyName = $('input[type=text]').val();
        nameObj['familyName'] = familyName;
        var template = "<li class='name-box'><h3>{{familyName}}{{name}}</h3><p class='sentence'><span>「</span>{{sentence}}<span>」</span></p><p class = 'book'>{{book}}•{{title}}</p><p class = 'author'>[{{dynasty}}]{{author}}</p></li>";
        return getHtmlFromTemplate(template, nameObj);
    }

    function getHtmlFromTemplate(template, dataJson) {
        var html = template;
        for (var key in dataJson) {
            var reg = new RegExp('{{' + key + '}}', 'g');
            html = html.replace(reg, dataJson[key]);
        }
        return html;
    }

    function genRandPoem(dataArr) {
        var index = randBetween(0, dataArr.length);
        while (!dataArr[index].content) {
            index = randBetween(0, dataArr.length);
        }
        return dataArr[index];
    }

    function randBetween(min, max) {
        //[min,max)  max is not included
        return min + Math.floor(Math.random() * (max - min));
    }

    function splitSentence(str) {
        str = cleanStr(str);
        str = str.replace(/！|。|？|；/g, function(str) {
            return str + '|';
        })
        str = str.replace(/\|$/g, '');
        var arr = str.split('|');
        arr = arr.filter(function(item) {
            return item.length >= 2;
        })
        return arr;
    }

    function cleanStr(str) {
        str = str.replace(/\s|<br>|<p>|<\/p>|　|”|“/g, '');
        str = str.replace(/\(.+\)/g, '');
        return str
    }

    function randCharFromStr(str, num, ordered) {
        if (typeof ordered === 'undefined') {
            ordered = true;
        }
        var randNumArr = genRandNumArr(str.length, num);
        if (ordered) {
            randNumArr = randNumArr.sort(function(a, b) {
                return a - b;
            });
        }
        var res = '';
        for (var i = 0; i < randNumArr.length; i++) {
            res += str.charAt(randNumArr[i]);
        }
        return res;
    }

    function genRandNumArr(max, num) {
        if (num > max) {
            num = max;
            console.log('max=' + max + ' num = ' + num);
            // throw new Error('too large num');
        }
        var orderedNum = [];
        for (var i = 0; i < max; i++) {
            orderedNum.push(i);
        }
        var res = [];
        for (var i = 0; i < num; i++) {
            var randIndex = randBetween(0, orderedNum.length);
            var randNum = orderedNum[randIndex];
            res.push(randNum);
            orderedNum.splice(randIndex, 1);
            // console.log('i=' + i + 'rand=' + rand, orderedNum);
        }
        return res;
    }

    function genName(dataArr) {
        var randPoem = genRandPoem(dataArr);
        var sentences = splitSentence(randPoem.content);
        var randSentence = sentences[randBetween(0, sentences.length)];
        var name = {};
        name.title = randPoem.title;
        name.book = randPoem.book;
        name.sentence = randSentence;
        name.content = randPoem.content;
        name.author = randPoem.author ? randPoem.author : '佚名';
        name.dynasty = randPoem.dynasty;
        var cleanSentence = cleanPunctuation(randSentence);
        name.name = randCharFromStr(cleanSentence, 2);
        return name
    }
    //清除标点符号
    function cleanPunctuation(str) {
        var puncReg = /[<>《》！*\(\^\)\$%~!@#…&%￥—\+=、。，？；‘’“”：·`]/g;
        return str.replace(puncReg, '');
    }

    function hasBanWord(str) {
        var banStr = '鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸡鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱';
        var banArr = banStr.split('');
        // console.log(banArr);
        for (var i = 0; i < banArr.length; i++) {
            if (str.indexOf(banArr[i]) !== -1) {
                // console.log(str, banArr[i]);
                return true;
            }
        }
        return false;
    }
});
