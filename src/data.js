
import * as config from './config';
const BASE64 = require('base-64');
let auth_sn = config.auth;
const URL_MESSAGES = config.urlMessages;
const COLORS = ["#3ca9f4", "#185174", "#4dc1f6", "#245c74", "#f8ab0f"];

const _getColor = (cp) => {
  const procArr = ['E2E Prozesse','Kernprozesse','Managementprozesse','Unterstützungsprozesse'];
  return COLORS[procArr.indexOf(cp)];
};

export const login = (username,password) => {
  auth_sn = 'Basic ' + BASE64.encode(username+':'+password);
}

export class Messages {

  constructor () {
    this._data = [];
    this._nextUrl = '';
  }

  static saveOne(message) {
    console.log('saveOne');
    console.log(message);
    const url = URL_MESSAGES;
    const fobj = {method:'POST',
                  headers:{'Authorization':auth_sn,'Accept':'application/json','Content-Type':'application/json'},
                  body:JSON.stringify(message)};
    return fetch(url, fobj).then(res => {
      if (res.status !== 201) {
        throw new Error('API Error Code: '+res.status);
      } 
      else if (res.headers.get('content-type').indexOf('application/json') !== 0) {
        throw new Error('No Json');
      }
      else {
        return res;
      }
    })              
  }
  
  load(nextUrl) {
    console.log('ENTER load');
    const regex = /(<.*?>);rel=\".*?\"/g;
    const url = (nextUrl) ? this._nextUrl:URL_MESSAGES + config.messageQueryParams;
    const fobj = {method:'GET',headers:{'Authorization':auth_sn}};
    this._nextUrl = '';


    return (url === '') ? Promise.resolve([]) : fetch(url,fobj).then(res => {

      if (res.status !== 200) {
      
        throw new Error(JSON.stringify({api_error_code:res.status}));
      } 
      else if (res.headers.get('content-type').indexOf('application/json') !== 0) {
        throw new Error('No JSON');
      }
      else {
      
        if (res.headers.get('link')){
          let relNext = res.headers.get('link').match(regex).filter(elem => elem.search('rel="next"') != -1);
          if (relNext.length > 0) {
              relNext = relNext[0].split(';rel')[0];
              relNext = relNext.substr(1,relNext.length-2);
              //console.log(relNext);
              this._nextUrl = relNext; 
              console.log(this._nextUrl);
          }
        }
        return res.json();
      }
    })
    .then(data => {
      //console.log(data);
      data.result.forEach(m => {
        try {
                 const fn = m.group.display_value.split('/')[0].slice(1);
                 // m.avatarSvg = getHierIcon(fn);
                 m.color = _getColor(fn);
                 m.groupShort = m.group.display_value.split('/')[1];
                 m.topLevelName = fn;
               }
               catch(e) {
                 m.groupShort = m.group.display_value.slice(1);
                 m.topLevelName = m.groupShort;
                 m.color = _getColor(m.groupShort);
                 // m.avatarSvg = getHierIcon(m.groupShort);
               }
      })
      return data.result;
    });
  }
  
}

    