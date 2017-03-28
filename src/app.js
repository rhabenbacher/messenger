import React, { Component } from 'react';
import {
  AppRegistry, Dimensions,
  StyleSheet, Modal, ListView, RefreshControl,
  Text, TextInput, ActivityIndicator,
  View,ScrollView,Platform
} from 'react-native';

import * as UI from './ui';
import { Messages,login } from './data';
import { MainScreen } from './mainscreen';
const LGRAY = '#EEEEEE';
const MESSAGE_REF = new Messages();
const {OS} = Platform;

export class App extends Component {
  constructor() {
    super();

    this.state = {
      username: '',
      password: '',
      loggedIn: false,
      messagesDs: [],
      messages: [],
      errorText: '',
      loading: false,
      loadMore: false,
      containerStyle:this._getMargin(),
      kbHeight: UI.keyBoardHeight()
    }
     this._width = 0;
  }



  _getMargin() {
    const {width,height} = Dimensions.get('window');
    if (width > 640 ) {
      const minD = (width > height) ? height : width;
      return  {marginHorizontal:Math.floor((minD-350)/2),minWidth:300};
    } else {  
      return {marginHorizontal:40};  
    }
  }
  
  _close() {
    console.log('close now!!');
  }
  _setPassword(pw) {
    this.setState({ password: pw });
  }
  _setUsername(login) {
    this.setState({ username: login });
  }
  _login() {

    console.log(`Login for ${this.state.username}`)
    login(this.state.username,this.state.password);
    this._loadMessages();
    // this.setState({loggedIn:true});
  }
  _logout() {
    this.setState({ loggedIn: false });
  }



  _loadMessages(loadMore) {
    console.log('_LoadMessages');
    this.setState({ loading: (loadMore) ? false : true, loadMore: (loadMore) ? true : false });
    MESSAGE_REF.load(loadMore).then(messages => {
      console.log("MessageLoad OK");
      if (messages.length === 0) { console.log('no more messages'); }
      this.setState({
        errorText: '',
        loggedIn: true,
        loading: false,
        loadMore: false
      });
      this.setState({ messages: (loadMore) ? this.state.messages.concat(messages) : messages });

    })
      .catch(err => {
        console.log('MessageLoad Error');
        console.log(err.message);
        
        new Promise((resolve,reject) => {
          try {
            resolve(JSON.parse(err.message));
          }
          catch(e) {
            reject(e);
          }
        }).then(errObj => {if (errObj.api_error_code === 401) {return 'Login Error! Please check username/password ...';}})
        .catch(err => 'Maybe your SN instance is down ...' )
        .finally(err => {
          const errText = (err) ? err : 'Network Error! Please try again later..';
          this.setState({ loading: false, loadMore: false, errorText: errText });
        });
     });
  }

  _loadMoreMessages() {
    console.log('_loadMoreMessages ');
    this._loadMessages(true); 
  }

  _stateGetter(stateProp) {
    return this.state[stateProp];
  }
  _onLayout(event) {
    console.log('Layout changed!');
    console.log(event.nativeEvent.layout);
    const {width,height} = event.nativeEvent.layout;
    if (this._width === width) {return}
    this._width = width;
    if (width > 640 ) {
      this.setState({containerStyle:{marginHorizontal: Math.floor((width-400)/2) }});
    } else {  
      this.setState({containerStyle:{marginHorizontal:40}});  
    }
  }
 
 _onSubmitUserName() {
   console.log('_onSubmitUserName');
 }

 _onEndEditing() {
  console.log('_onEndEditing');
 }

  render() {
    console.log('render Appmessenger');
   
    let errorText = (this.state.errorText !== '') ? <Text style={styles.tError}>{this.state.errorText}</Text> : null;
    let mainScreen = <MainScreen stateGetter={this._stateGetter.bind(this)} onClose={this._logout.bind(this)} onReload={() => this._loadMessages()} onLoadMore={() => this._loadMoreMessages()} />;
    let loadSpinner = (this.state.loading) ?  <ActivityIndicator animating={this.state.loading} style={styles.aLoading} size='large' />:null;
    let keyboardSpacer = (OS === 'ios') ? <View style={{height:this.state.kbHeight}} />:null;
    return (
      <View style={{flex:1}} >
        <Modal animationType={'slide'} visible={!this.state.loggedIn} onRequestClose={()=>this._logout()}>
          <UI.Header text={'Login'} />
          <ScrollView contentContainerStyle={[styles.container,this.state.containerStyle]} keyboardShouldPersistTaps={'always'}>
            {errorText}
            <UI.InputWithLabel name="Username" 
              input={{ 
                editable: !this.state.loading, 
                autoFocus: true, 
                autoCapitalize:'none',
                onSubmitEditing:() => this._Password.focus(),
                autoCorrect:false,
                value: this.state.username,
                onChangeText: this._setUsername.bind(this) }}/>
            <UI.InputWithLabel name="Password"    
              input={{  
                ref: (input)=>this._Password =input, 
                editable: !this.state.loading, 
                secureTextEntry: true, 
                autoCapitalize:'none',
                autoCorrect:false,
                onSubmitEditing:() => this._loadMessages(),
                value: this.state.password, 
                onChangeText: this._setPassword.bind(this),
                onEndEditing:() => this._onEndEditing() }}/>
            <View >
            <UI.Button style={styles.bLogin} disabled={this.state.loading} text={'Login'} onPress={() => this._login()}/>
              </View>
             {loadSpinner} 
             {keyboardSpacer}
          </ScrollView>
        </Modal>
        {mainScreen}
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  //  marginHorizontal:60,
    flexDirection: 'column',
    justifyContent: 'center',
  //  alignItems: 'stretch',
  //  backgroundColor: '#F5FCFF',
  },
  bLogin: {
   ...Platform.select({
     ios: {
        marginTop:60
     }, 
     android:{
       marginTop:20
   }}),
   marginHorizontal:20,
    },
  aLoading: { 
    alignSelf: 'center', 
    marginTop: 20 } ,
  tError: { 
    color: 'red', 
    fontWeight: '500', 
    textAlign: 'center', 
    textAlignVertical: 'center' }   

});