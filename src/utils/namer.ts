import { choose, between } from './random';

export interface Book {
  content: string;
  title: string;
  author: string;
  book: string;
  dynasty: string;
}

export interface GeneratedName {
  name: string;
  sentence: string;
  content: string;
  title: string;
  author: string;
  book: string;
  dynasty: string;
}

export class Namer {
  bookData: Book[] | null = null;
  loading: boolean = false;

  async loadBook(bookName: string): Promise<void> {
    this.loading = true;
    try {
      const response = await fetch(`./json/${bookName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${bookName}`);
      }
      const data = await response.json();
      this.bookData = data;
      console.log(`${bookName} loaded`);
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  formatStr(str: string): string {
    let res = str.replace(/(\s|　|”|“){1,}|<br>|<p>|<\/p>/g, '');
    res = res.replace(/\(.+\)/g, '');
    return res;
  }

  splitSentence(content: string): string[] {
    if (!content) {
      return [];
    }
    let str = this.formatStr(content);
    str = str.replace(/！|。|？|；/g, (s) => `${s}|`);
    str = str.replace(/\|$/g, '');
    let arr = str.split('|');
    arr = arr.filter((item) => item.length >= 2);
    return arr;
  }

  cleanPunctuation(str: string): string {
    const puncReg = /[<>《》！*\(\^\)\$%~!@#…&%￥—\+=、。，？；‘’“”：·`]/g;
    return str.replace(puncReg, '');
  }

  cleanBadChar(str: string): string {
    const badChars =
      '胸鬼懒禽鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸡鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱'.split(
        ''
      );
    return str
      .split('')
      .filter((char) => badChars.indexOf(char) === -1)
      .join('');
  }

  getTwoChar(arr: string[]): string {
    const len = arr.length;
    const first = between(0, len);
    let second = between(0, len);
    let cnt = 0;
    const MAX_RETRY = 1000;
    while (second === first) {
      second = between(0, len);
      cnt++;
      if (cnt > MAX_RETRY) {
        break;
      }
    }
    return first <= second
      ? `${arr[first]}${arr[second]}`
      : `${arr[second]}${arr[first]}`;
  }

  genName(): GeneratedName | null {
    if (!this.bookData || this.bookData.length === 0) {
      return null;
    }

    try {
      const passage = choose(this.bookData);
      const { content, title, author, book, dynasty } = passage;

      if (!content) {
        return null;
      }

      const sentenceArr = this.splitSentence(content);

      if (!(Array.isArray(sentenceArr) && sentenceArr.length > 0)) {
        return null;
      }

      const sentence = choose(sentenceArr);
      const cleanSentence = this.cleanBadChar(this.cleanPunctuation(sentence));

      if (cleanSentence.length < 2) {
        return null;
      }

      const name = this.getTwoChar(cleanSentence.split(''));

      return {
        name,
        sentence,
        content,
        title,
        author,
        book,
        dynasty,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
