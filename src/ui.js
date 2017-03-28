
import React, { Component } from 'react';
import {
  StyleSheet, Dimensions,
  Text, TextInput, Image,
  View, Platform,
  TouchableOpacity
} from 'react-native';

export const bgBlue = '#2196F3';
export const GREY400 = '#BDBDBD';
export const GREY300 = '#e0e0e0';
const INPUT_DISABLED = 'rgba(0,0,0,0.38)';
const BUTTON_DISABLED = 'rgba(0,0,0,0.12)';
const BUTTONTEXT_DISABLED = 'rgba(0,0,0,0.26)';
const ICONS = {'close':require('./../img/ic_close_white_48pt.png'),
              'add':require('./../img/add.png')};
const {OS} = Platform;              

export const dynFontSize = () => {
    const {height,width} = Dimensions.get('window');
    const maxD = (height > width) ? height:width;
    let addFactor = 0;
    if (maxD > 700) {addFactor = 1;}
    else if (maxD > 1025) {addFactor = 3;}
    return ({ 'sb':13+addFactor,
              'b':15+addFactor,
              'ts':18+addFactor,
              'tm':20+addFactor,
              'bIc':24+(addFactor * 4)});
  }
const FS=dynFontSize();              

export const keyBoardHeight = () => {
   const {height,width} = Dimensions.get('window');
   const maxD = (height > width) ? height:width;
   let kbHeight = 0;
   if (OS === 'android') {return 0;}

   if (maxD < 700) { kbHeight = 251}
   else if (maxD < 750) {kbHeight = 271}
   else if (maxD < 1025) {kbHeight = 398}
   else (kbHeight = 471);
   return kbHeight;
}

export const Button = (props) => {
  let buttonStyle = (props.disabled) ? [styles.button,styles.buttonDisabled,props.style] : [styles.button,props.style];
  let buttonTextStyle = (props.disabled) ? [styles.buttonText,styles.buttonTextDisabled,props.buttonTextStyle] : [styles.buttonText,props.buttonTextStyle];
  return (
   <TouchableOpacity disabled={props.disabled} style={buttonStyle} onPress={()=>props.onPress()}>
  <Text style={buttonTextStyle}>{props.text}</Text>
  </TouchableOpacity>)};

export const IconButton = (props) => {
  return (
  <TouchableOpacity disabled={props.disabled} style={[styles.iconButton,props.style]} onPress={()=>props.onPress()}>
  <Image style={[{height:24,width:24},props.imageStyle]} source={ICONS[props.iconName]}></Image>
  </TouchableOpacity>)};

 
export const Header = (props) => {
  let button = (props.onClose) ? <IconButton style={{position:'absolute',right:5,top:10}} iconName={'close'} onPress={props.onClose}/> : null;
  let marginTop = (OS === 'ios') ? 24:0;
  return (
  <View style={{height:56,marginTop:marginTop,backgroundColor:bgBlue}}>
    <Text style={{fontSize:FS.b,fontWeight:'500',color:'white',marginTop:20,textAlign:'center'}}>{props.text}</Text>
    {button}
    </View>);}

export const InputWithLabel = (props) => {
  let inputProps = props.input;
  let labelProps = props.label;
  let viewStyle = (OS === 'android') ? {marginHorizontal:20}:{borderBottomColor:'grey',borderBottomWidth:1,marginHorizontal:20,paddingTop:16,marginBottom:8};
  let inputStyle = !inputProps.editable ? [styles.input,styles.disabled] : [styles.input];
  if (!inputProps.editable) styles.input;
  
  if  (OS === 'ios'){
  return (
     <View style= {[viewStyle,props.viewStyle]}>
          <Text style={styles.label} {...labelProps}>{props.name}</Text>          
          <TextInput style={inputStyle} {...inputProps}/>
      </View>
  );}
  else {
     inputStyle = {};
     return (
          <View style={{marginHorizontal:20,marginTop:16}}>
          <Text style={styles.label} {...labelProps}>{props.name}</Text>          
          <TextInput style={inputStyle} {...inputProps}/> 
          </View>);
  }
 }



const styles = StyleSheet.create({
  button: {
    backgroundColor:bgBlue,
    paddingHorizontal:4,
    borderRadius:3,
    minHeight:36,
    minWidth:88,
     ...Platform.select({
     ios: {
        minHeight:36,
        paddingVertical:6,
     }, 
     android:{
       minHeight:50
   }})
  },
  buttonDisabled: {
    backgroundColor:BUTTON_DISABLED
  },
  buttonText: {
    paddingHorizontal:16,
    color:'white',
    lineHeight:36,
    fontWeight:'500',
    fontSize:FS.b,
    textAlign:'center',
    textAlignVertical:'center'
  },
  buttonTextDisabled: {
    color:BUTTON_DISABLED
  },
  iconButton: {
    backgroundColor:bgBlue,
    paddingHorizontal:16,
    paddingVertical:6,
    borderRadius:3,
    minHeight:36,
    minWidth:56
  },
  label: {fontSize:FS.sb,textAlign:'left',color:'grey'},
  input: {fontSize:FS.b,marginTop:8,marginBottom:8,height:16}, //16
  disabled: {color:INPUT_DISABLED},
});
