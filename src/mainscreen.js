
import React, { Component } from 'react';
import {
  StyleSheet, Modal, ListView, RefreshControl,
  Text, TextInput, ActivityIndicator, Dimensions,
  View,Platform,ProgressBarAndroid
} from 'react-native';

import * as UI from './ui';
import { Messages } from './data';
import { AddComment } from './addcomment';

const LGRAY = '#EEEEEE';
const LLGRAY = '#F5F5F5';
const spinnerColor = '#212121';
const LISTVIEW = () => new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const FS = UI.dynFontSize();

const getLinesCount = (str,width,columns) => {
  const charPerLine = width / (10.5 * columns);
  let linesCount = 0;
      str.split(/\n|\r|\r\n/).forEach((line) => {
        linesCount++;
        linesCount+=Math.floor(line.length / charPerLine) ;
      });
    return linesCount;  
}

export class MainScreen extends Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      row: {},
      filteredMessages: undefined,
      newMessage: '',
      minLength: false,
      errorSaving: false,
      columns:1,
      stylesvCard:{},
      stylesView:{},
      stylesSpinner:{},
    };
    this._width = 0;
  
  }

  _addComment(row) {
    console.log('AddComment');
    this.setState({
      row: row,
      modalVisible: true,
      filteredMessages: LISTVIEW().cloneWithRows(this.props.stateGetter('messages').filter((line) => line.groupShort === row.groupShort))
    });
  }

  _modalClose() {
    this.setState({ modalVisible: false, errorSaving: false });
  }


  _renderRow(row) {
    const styleTopLevelName = {backgroundColor:row.color};
    let stylesvCard = {...this.state.stylesvCard};
    if (this.state.columns > 1) {  
      //console.log(getLinesCount(row.message.display_value,this._width));
      stylesvCard.height = getLinesCount(row.message.display_value,this._width,this.state.columns) * 20 + 100;
    }

    return (
      <View style={[styles.vCard,stylesvCard]}>
        <View style={styles.vTopLevelName}>
          <Text style={[styles.topLevelName,styleTopLevelName]} >{row.topLevelName}</Text>
        </View>
        <Text style={ styles.groupShort } >{row.groupShort}</Text>
        <UI.IconButton
          disabled={this.props.stateGetter('loading') || this.props.stateGetter('loadMore')}
          style={styles.bAdd}
          imageStyle={styles.bAddImage} iconName={'add'}
          onPress={() => this._addComment(row)} />
        <Text style={styles.created_by} >{row.sys_created_by.display_value} @{row.sys_created_on.display_value.substr(0, 16)}</Text>
        <Text style={styles.message} >{row.message.display_value}</Text>
      </View>);
  }

 
  _onRefresh() {
    console.log('_onRefresh');
    this.props.onReload();
  }

  _onEndReached() {
    console.log('_onEndReached');
    this.props.onLoadMore();
  }

  _addCommentClose(saved) {
    if (saved) {this.props.onReload();}
    this.setState({modalVisible:false});
  }

  _addCommentOpen() {
    this.setState({modalVisible:true});
  }
 
  _onLayout(event) {
    //console.log('Layout changed!');
   // console.log(event.nativeEvent.layout);
    const {width,height} = event.nativeEvent.layout;
    const {OS} = Platform;
    if (this._width === width) {return}
    this._width = width;
    
    if (width > 1200) {
      this.setState({
        stylesvCard:{width:(width/3) - 10,marginBottom:5},
        stylesView:{flexDirection: 'row',flexWrap: 'wrap',
        //justifyContent:'center' 
      },
        stylesSpinner:(OS == 'ios') ? {left:width/2}:{},
        columns:3});
    }
    
    else if (width > 640 ) {
      this.setState({
        stylesvCard:{width:(width/2) - 10,marginBottom:5},
        stylesView:{flexDirection: 'row',flexWrap: 'wrap',
         //justifyContent:'center' 
      },
        stylesSpinner:(OS == 'ios') ? {left:width/2}:{},
        columns:2});
    } else {  
      this.setState({
        stylesvCard:{},
        stylesView:{},
        stylesSpinner:(OS == 'ios') ? {left:width/2}:{},
        columns:1});
    }
   
   }

  _renderFooter() {
    //if (OS === 'ios') {return null;}
    if (!this.props.stateGetter('loadMore')) {return null;}
    return (
      <ActivityIndicator 
        color={spinnerColor}
        animating={true} 
        style={[styles.aLoadMore,this.state.stylesSpinner]} 
        size='large' /> 
    );
  }

  render() {
    console.log('render MAinScreen');
    
    if (!this.props.stateGetter('loggedIn')) { return null };

    const messages = LISTVIEW().cloneWithRows(this.props.stateGetter('messages'));
    // const filteredMessages = (this.state.filteredMessages) ? this.state.filteredMessages : messages;
    
    const messageList = (this.props.stateGetter('loading')) 
                        ? <ActivityIndicator animating={true} style={styles.aLoading} size='large' />
                        : <ListView 
                        contentContainerStyle={this.state.stylesView}
                        enableEmptySections={true} 
                        dataSource={messages} 
                        refreshControl={<RefreshControl refreshing={false} onRefresh={this._onRefresh.bind(this)} />}
                        renderRow={this._renderRow.bind(this)} 
                        renderFooter={() => this._renderFooter()}
                        onEndReachedThreshold={200} 
                        onEndReached={this._onEndReached.bind(this)} />;
  
    return (
      <View style={{ flex: 1 }} onLayout={(event) => this._onLayout(event)}>
        <Modal animationType={'slide'} visible={this.state.modalVisible} onRequestClose={()=>this._modalClose()}>
          <AddComment 
            headerText = {this.state.row.groupShort}
            row = {this.state.row}
            modalClose = {(saved)=>this._addCommentClose(saved)}
            modalOpen = {()=>this._addCommentOpen()}/>
        </Modal>
        <UI.Header text={'Logged In As '+this.props.stateGetter('username')} onClose={() => this.props.onClose()} />
        {messageList}
      </View>  
    )
  }
}

const styles = StyleSheet.create({
  cList:  {
   // flexDirection: 'row',
   // flexWrap: 'wrap',
   // justifyContent:'space-around' 
},
  aLoadMore: {   
    ...Platform.select({
      ios:
      {  alignSelf: 'center', 
        position: 'absolute', 
        bottom: '30%',
    },
    android:{height:80}})
    },
  tError: { 
    color: 'red', 
    padding: 10 },
  aLoading: { 
    alignSelf: 'center', 
    marginTop: 20 },
  vCard: { 
    flexDirection:'column',
    marginHorizontal: 5, 
    paddingHorizontal: 10, 
    marginTop: 5, 
    paddingVertical: 10,
    backgroundColor: 'white',
    shadowColor:'black',
    shadowOffset:{width:0,height:1},
    shadowOpacity:0.25,
    shadowRadius:1,
   },
  vTopLevelName: { 
    //flex: 1, 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 3 },
  topLevelName: {  
      paddingLeft: 3, 
      paddingRight: 3, 
      marginRight: 5, 
      fontSize: FS.sb, 
      color: 'white', 
      textAlignVertical: 'center' },
   groupShort: { 
     marginLeft: 3,
    fontSize: FS.ts } , 
   bAdd : { 
     position: 'absolute', 
     right: 2, 
     top: 10, 
     zIndex: 98, 
     backgroundColor: 'transparent' },
   bAddImage: { 
     borderRadius: (FS.bIc / 2),
     height:FS.bIc,
     width:FS.bIc,
     position: 'relative' } ,
   created_by: { 
     marginLeft: 3, 
     marginTop: 3, 
     marginBottom: 5, 
     fontSize: FS.sb, 
     color: 'grey' },
    message: { 
      flex:1,
      marginLeft: 3, 
      fontSize: FS.b, 
      marginTop: 10 }    

});
        