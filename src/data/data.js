
import * as config from '../config/config';

import ImageResizer from 'react-native-image-resizer';
import SimpleTimer from './simpletimer'
import CacheNewest from './cache'

const BASE64 = require('base-64');
const BASE64js = require('base64-js');
let auth_sn = config.auth;
const URL_MESSAGES = config.urlMessages;
const COLORS = ["#3ca9f4", "#185174", "#4dc1f6", "#245c74", "#f8ab0f"];

const _getColor = (cp) => {
  const procArr = ['E2E Prozesse', 'Kernprozesse', 'Managementprozesse', 'Unterstützungsprozesse'];
  return COLORS[procArr.indexOf(cp)];
};

export const login = (username, password) => {
  auth_sn = 'Basic ' + BASE64.encode(username + ':' + password);
}
let _imgStore = new CacheNewest(50);

const _loadAttachment = (url, msg_sys_id) => {
  const sys_id = url.match(/attachment\/(.*)\/file/)[1];
  const loadTimer = new SimpleTimer(`${sys_id} Attachment Start Loading`);

  const _ImgB64FromReq = (req) => {
    const buf = req.response;
    const byteArray = new Uint8Array(buf);
    return 'data:image/jpeg;base64,' + BASE64js.fromByteArray(byteArray);
  }
  const _creationDateFromReq = (req) => {
    const imgCreationDateSN = JSON.parse(req.getResponseHeader('x-attachment-metadata')).sys_created_on;
    return new Date(imgCreationDateSN.replace(' ', 'T'));
  } 

  return new Promise((resolve, reject) => {
    const imgStored = _imgStore.get(url);
    if (imgStored) {
      loadTimer.stop(`${sys_id} Attachment loaded from cache`);
      resolve(imgStored);
      return;
    }
    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.setRequestHeader('Authorization', auth_sn);
    req.onreadystatechange = (e) => {
      if (req.readyState !== 4) {
        return;
      }
      if (req.status === 200) {
        //console.log('Image loaded!');
        loadTimer.log(`${sys_id} Attachment loaded`);
        const imgB64 = _ImgB64FromReq(req);
        const imgCreationDate = _creationDateFromReq(req);
        loadTimer.stop(`${sys_id} Size: ${imgB64.length}`);
        _imgStore.set(url, imgB64, imgCreationDate);
        resolve(imgB64);
      }
      else {
        throw new Error('Image Loading Error');
      }
    }
    req.send();
  });

}


const _getAttachment = (sys_id) => {
  const url = config.urlAttachment + '?table_name=live_message&table_sys_id=' + sys_id;
  const fobj = { method: 'GET', headers: { 'Authorization': auth_sn } };
  let urls = new Map();

  return fetch(url, fobj)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      else {
        throw new Error('no Image MetaData');
      }
    })
    .then(response => {
      if (response.result.length === 0) { throw new Error('no Image MetaData'); }
      response.result.forEach(elem => urls.set(elem.file_name, config.urlAttachment + '/' + elem.sys_id + '/file'));
      //return urls.get('mobileSmall.jpg');
      return urls;
    })
    .catch(err => { console.log(err) });
}



const _saveAttachment = (sys_id, attachment) => {

  const _postAttachment = (sys_id, attachmentName, attachment) => {
    const url = config.urlAttachment + '/file' + '?table_name=live_message&table_sys_id=' + sys_id + '&file_name=' + attachmentName;
    const attachmentFobj = {
      method: 'POST',
      headers: { 'Authorization': auth_sn, 'Accept': 'application/json', 'Content-Type': 'image/jpeg' },
      body: BASE64js.toByteArray(attachment)
    };
    return fetch(url, attachmentFobj);
  }

  const _resizeImage = (image) => {
    const imgB64 = 'data:image/jpeg;base64,' + image;
    return ImageResizer.createResizedImage(imgB64, 600, 600, 'JPEG', 1.0, 0, "")
  }

  console.log('SaveAttachment');
  return _postAttachment(sys_id, 'mobile.jpg', attachment)
    .then(res => {
      console.log('Attachment Saved Code: ' + res.status);
      if (res.status !== 201) {
        throw new Error(JSON.stringify({ 'APIAttachmentErrorCode': res.status }));
      }
      else {
        return res.json();
      }
    })

}


export class Messages {

  constructor() {
    this._data = [];
    this._nextUrl = '';
  }

  _set_next_url(link) {
    const regex = /(<.*?>);rel=\".*?\"/g;
    let relNext = link.match(regex).filter(elem => elem.search('rel="next"') != -1);
    if (relNext.length > 0) {
      relNext = relNext[0].split(';rel')[0];
      relNext = relNext.substr(1, relNext.length - 2);
      //console.log(relNext);
      this._nextUrl = relNext;
      console.log(this._nextUrl);
    }
  }

  static saveOne(message, attachment) {
    console.log('saveOne');
    const url = URL_MESSAGES;
    if (attachment) { message.has_attachments = true; }
    const fobj = {
      method: 'POST',
      headers: { 'Authorization': auth_sn, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    };

    return fetch(url, fobj)
      .then(res => {
        if (res.status !== 201) {
          throw new Error('API Table Error Code: ' + res.status);
        }
        else if (res.headers.get('content-type').indexOf('application/json') !== 0) {
          throw new Error('No Json');
        }
        else {
          return res.json()
        }
      })
      .then(res => {
        console.log(res);
        if (!attachment) {
          return res;
        }
        else {
          return _saveAttachment(res.result.sys_id, attachment);
        }
      })

  }

  load(nextUrl) {
    console.log('ENTER load');
    const url = (nextUrl) ? this._nextUrl : URL_MESSAGES + config.messageQueryParams;
    const fobj = { method: 'GET', headers: { 'Authorization': auth_sn } };
    this._nextUrl = '';

    return (url === '') ? Promise.resolve([]) : fetch(url, fobj).then(res => {

      if (res.status !== 200) {
        throw new Error(JSON.stringify({ api_error_code: res.status }));
      }
      else if (res.headers.get('content-type').indexOf('application/json') !== 0) {
        throw new Error('No JSON');
      }
      else {
        if (res.headers.get('link')) {
          this._set_next_url(res.headers.get('link'));
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
          catch (e) {
            m.groupShort = m.group.display_value.slice(1);
            m.topLevelName = m.groupShort;
            m.color = _getColor(m.groupShort);
            // m.avatarSvg = getHierIcon(m.groupShort);
          }
          if (m.has_attachments) {

          }
        })
        return data.result;
      })

  }

  static getAttachments(sys_id) {
    return _getAttachment(sys_id);
  }


  static loadAttachmentwithUrl(url, sys_id) {
    return _loadAttachment(url, sys_id);
  }

}

