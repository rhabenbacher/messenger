import React, { Component } from 'react';
import {
  StyleSheet, Modal, ListView, RefreshControl,
  Text, TextInput, ActivityIndicator,ScrollView,
  View,KeyboardAvoidingView,Keyboard 
} from 'react-native';


import * as UI from './ui';
import { Messages } from './data';
const LGRAY = '#EEEEEE';
const LISTVIEW = () => new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const FS = UI.dynFontSize(); 

export class AddComment extends Component {
  constructor() {
    super();
    this.state = {
      newMessage: '',
      minLength: false,
      errorSaving: false,
      saving:false,
      height:UI.keyBoardHeight(),
      inputHeight:40
    };
   
  }

  componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  componentDidMount() {
    
  }

  _keyboardDidShow (e) {
    console.log('Keyboard Shown');
    //console.log(e);
    this._scrollView.scrollToEnd();
  }

  _keyboardDidHide () {
   // console.log('Keyboard Hidden');
  }
  _renderMessage(row) {

    return (
      <View style={styles.vCard}>
        <Text style={styles.groupShort} >{row.groupShort}</Text>
        <Text style={styles.created_by} >{row.sys_created_by.display_value} @{row.sys_created_on.display_value.substr(0, 16)}</Text>
        <Text style={styles.message} >{row.message.display_value}</Text>
      </View>);
  }

  _setMessage(message) {
    this.setState({ newMessage: message, minLength: (message.length > 3) });
  }

  _saveMessage() {
    console.log(`Will Save Message ${this.state.newMessage}`);
    
    this.setState({saving:true});
    Messages.saveOne({ message: this.state.newMessage, group: this.props.row.group.value })
      .then(() => {
        // reload function
        this.setState({ newMessage: '', minLength: false, errorSaving: false,saving:false });
        this.props.modalClose(true);        
      }).catch((err) => {
        // could not save
        console.log('Error saving');
        console.log(err);

        this.setState({ saving:false,errorSaving: true });
        this.props.modalOpen();
      })
  }

  _updateSize(inputHeight) {
    this.setState({inputHeight});
    this._scrollView.scrollToEnd();
   // console.log('newInputHeight:'+inputHeight);
  }

  render() {
    const styleBSave = {color: (this.state.minLength && !this.state.saving) ? UI.bgBlue : LGRAY };
    const errorSave = (this.state.errorSaving) ? <Text style={styles.tError}>Error saving! Please try later</Text> : null;
    const furtherInfo = (this.state.saving) ? 
        <ActivityIndicator 
        animating={true} 
        style={styles.aLoadMore} 
        size='large' /> 
    : this._renderMessage(this.props.row);
   const {inputHeight} = this.state;
   let inputStyle = {height:inputHeight};

    return (
      <View style={{flex:1}}>
        <UI.Header text={this.props.headerText} onClose={() => this.props.modalClose()} />     
         <ScrollView style={{flex:1}} ref={(scrollView) => { this._scrollView = scrollView; }} keyboardShouldPersistTaps={'always'}>
          {errorSave}
          {furtherInfo}  
          <UI.InputWithLabel
            name="new Message"
            input={{
              editable:!this.state.saving,
              value: this.state.newMessage,
              style: [styles.messageInput,inputStyle],
              multiline: true,
              numberOfLines: 6,
              autoFocus: true,
              onChangeText: this._setMessage.bind(this),
              onContentSizeChange: (e) => this._updateSize(e.nativeEvent.contentSize.height)
            }} />
        <View style={styles.vbSave}>
          <UI.Button
            disabled={!this.state.minLength || this.state.saving}
            style={{ backgroundColor: 'transparent' }}
            buttonTextStyle={styleBSave}
            text={'Add'}
            onPress={() => this._saveMessage()} />
        </View>
        <View style={{height:this.state.height}}/>
       </ScrollView>
        
      </View>
    );
  }


}

const styles = StyleSheet.create({
  aLoadMore: {
    alignSelf: 'center',
    top: 40,
    zIndex:9
  },
  vbSave: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height:40,
    marginBottom:30
  },
  bSave: {
    color:UI.bgBlue
  },
  tError: {
    color: 'red',
    padding: 10
  },
  aLoading: {
    alignSelf: 'center',
    marginTop: 20
  },
  vCard: {
    marginHorizontal: 20,
    padding: 5,
    marginTop: 5,
    backgroundColor: LGRAY
  },
  vTopLevelName: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3
  },
  topLevelName: {
    paddingLeft: 3,
    paddingRight: 3,
    marginRight: 5,
    fontSize: 12,
    color: 'white',
    textAlignVertical: 'center'
  },
  groupShort: {
    marginLeft: 3,
    fontSize: FS.ts
  },
  created_by: {
    marginLeft: 3,
    marginTop: 3,
    marginBottom: 5,
    fontSize: FS.sb,
    color: 'grey'
  },
  message: {
    marginLeft: 3,
    fontSize: FS.b,
    marginTop: 10
  },
  messageInput: {
    fontSize:FS.b,
//    height:150
  }

});
