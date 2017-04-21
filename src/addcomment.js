import React, { Component } from 'react';
import {
  StyleSheet, Modal, ListView, RefreshControl,TouchableHighlight,
  Text, TextInput, ActivityIndicator,ScrollView, Dimensions,
  View,KeyboardAvoidingView,Keyboard, Image
} from 'react-native';


import * as UI from './ui';
import { Messages } from './data/data';
import { ImageList } from './imagelist';
import './imagepicker';
const LGRAY = '#EEEEEE';
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
      inputHeight:40,
      modalVisible:false,
      imageUri:undefined,
      imageData:undefined,
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
      <View style={{flexDirection:'row',justifyContent:'center'}}>
      <View style={styles.vCard}>
        <Text style={styles.groupShort} >{row.groupShort}</Text>
        <Text style={styles.created_by} >{row.sys_created_by.display_value} @{row.sys_created_on.display_value.substr(0, 16)}</Text>
        <Text style={styles.message} >{row.message.display_value}</Text>
      </View>
      </View>);
  }

  _setMessage(message) {
    this.setState({ newMessage: message, minLength: (message.length > 3) });
  }

  _saveMessage() {
    console.log(`Will Save Message ${this.state.newMessage}`);
    
    this.setState({saving:true});
    Messages.saveOne({ message: this.state.newMessage, group: this.props.row.group.value },this.state.imageData)
      .then((res) => {
        // reload function
        //console.log(res);
        this.setState({ newMessage: '', minLength: false, errorSaving: false,saving:false,imageUri:undefined,imageData:undefined });
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

  _showCameraRoll(){
    //this.setState({modalVisible:true});
    getImage().then((image)=>{
      if (!image.error) {  
      this.setState({imageUri:'data:image/jpeg;base64, '+image.data,imageData:image.data});}
    })
  }

  _modalClose(){
    this.setState({modalVisible:false});
  }
  
  _showImageFullScreen() {
    this.setState({modalVisible:true});
  }

  _renderImageFullScreen() {
    const {height,width} = Dimensions.get('window');
    return (
    <View style={{flex:1}}>
      <UI.Header text={'Image Viewer'} onClose={() => this._modalClose()} />
        <ScrollView bounces={true} bouncesZoom={true} minimumZoomScale={1.0} centerContent={true} maximumZoomScale={5.0} >
          <Image resizeMode={'contain'} style={{height,width}} source={{uri:this.state.imageUri}} />
         </ScrollView>
     </View>    
    )
  }

  _renderImage() {
    const {height,width} = Dimensions.get('window');
    const imgSize = (height > width) ? width - 100:height - 100;
    const imgSizeNorm = (imgSize > 500) ? 500:imgSize;
    const imgSizeB = imgSizeNorm + 5;

    if (!this.state.imageUri) {return null}
    return (
      <TouchableHighlight style={{height:imgSizeB,width:imgSizeB}} onPress={()=>this._showImageFullScreen()}>
        <Image style={{height:imgSizeNorm,width:imgSizeNorm}}  source={{ uri: this.state.imageUri }} />
      </TouchableHighlight>
    );
  }

  render() {
    const styleBSave = {color: (this.state.minLength && !this.state.saving) ? UI.bgBlue : LGRAY };
    const errorSave = (this.state.errorSaving) ? <Text style={styles.tError}>Error saving! Please try later</Text> : null;
    const furtherInfo = (this.state.saving) ? 
        <ActivityIndicator animating={true} style={styles.aLoadMore} size='large' /> 
    : this._renderMessage(this.props.row);
    const {inputHeight} = this.state;
    let inputStyle = {height:inputHeight};

    return (
      <View style={{flex:1}}>
        <Modal animationType={'slide'} visible={this.state.modalVisible} onRequestClose={()=>this._modalClose()}>
          {this._renderImageFullScreen()}
        </Modal>  
        <UI.Header text={this.props.headerText} onClose={() => this.props.modalClose()} />     
         <ScrollView style={{flex:1}} ref={(scrollView) => { this._scrollView = scrollView; }} keyboardShouldPersistTaps={'always'}>
          {errorSave}
          {furtherInfo} 
          <View style = {styles.vbCamera}>
            <View style = {styles.cCamera}>
            {this._renderImage()}
            <UI.IconButton style={styles.bCamera} disabled={this.state.saving} iconName='camera' onPress={()=>this._showCameraRoll()} />     
          </View> 
          </View>
          <View style={{flexDirection:'row',justifyContent:'center'}}>  
          <UI.InputWithLabel
            noLabel={true}
            viewStyle={styles.vMessage}
            input={{
              placeholder:'Your message (min 3 chars)',
              placeholderTextColor:UI.GREY400,
              editable:!this.state.saving,
              value: this.state.newMessage,
              style: [styles.messageInput,inputStyle],
              multiline: true,
              numberOfLines: 6,
              autoFocus: true,
              onChangeText: this._setMessage.bind(this),
              onContentSizeChange: (e) => this._updateSize(e.nativeEvent.contentSize.height)
            }} />
         </View>   
        <View style={styles.vbSave}>
          <View style={styles.bcSave}>
          <UI.Button
            disabled={!this.state.minLength || this.state.saving}
            style={{ backgroundColor: 'transparent' }}
            buttonTextStyle={styleBSave}
            text={'Add'}
            onPress={() => this._saveMessage()} />
          </View>  
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
  bImage: {  
    width:305,
    height:305,
 
  },
  imageSmall: {
    width:300,
    height:300,
   // marginRight:20,
  },
  bCamera: {
    // marginRight:20,
    backgroundColor:'transparent'
  },
  cCamera: {
    flexGrow:1,
    maxWidth:600,
    paddingVertical:20,
    marginHorizontal:20,
    backgroundColor:UI.GREY300,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  vbCamera: {
    //flex:1,
    marginTop:20,
    flexDirection: 'row',
    justifyContent: 'center',
    
    //maxWidth:600
  },
  vbSave: {
    flexDirection: 'row',
    justifyContent: 'center',
    height:40,
    marginBottom:30,
  },
  bcSave: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    maxWidth:600,
    flexGrow:1,
    marginLeft:20,
  },
  bSave: {
    color:UI.bgBlue,
    
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
    flexGrow:1,
   // minWidth:300,
    padding: 5,
    marginTop: 5,
    backgroundColor: LGRAY,
    maxWidth:600
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
  vMessage: {
    paddingTop:0,
    minWidth:300,
    maxWidth:600,
    flexGrow:1, 
    backgroundColor:UI.GREY300,
    paddingHorizontal:10,
  },
  message: {
    marginLeft: 3,
    fontSize: FS.b,
    marginTop: 10,

  },
  messageInput: {
    fontSize:FS.b,
    marginBottom:5
//    height:150
  }

});
