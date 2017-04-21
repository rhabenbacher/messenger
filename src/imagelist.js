import React, { Component } from 'react';
import {
  StyleSheet, RefreshControl, Image,
  Text, TextInput, ActivityIndicator,ScrollView,
  View, CameraRoll,TouchableHighlight 
} from 'react-native';

import * as UI from './ui';

export class ImageList extends Component {

  constructor()
  {
    super();
    this.state = {
      images:[]
    };
  }

  componentDidMount() {
     const cameraParams = {
      first:20,
    }
 
    CameraRoll.getPhotos(cameraParams).then((data)=>{
       const assets = data.edges;
       const images = assets.map(asset => asset.node.image);
       this.setState({images});
       console.log(images);
    },(err)=>console.log(err));
  }

  _selectImage(image) {
    console.log('Image selected: '+image.filename);
    this.props.onSelect(image);
  }

  render() {
    return (
      <View style={{flex:1}}>
      <UI.Header text={'Camera Roll'} onClose={() => this.props.modalClose()} />
        <ScrollView>
           <View style={styles.imageGrid}>
            { this.state.images.map((image,index) => {
              return (
                <TouchableHighlight style={{width:120,height:120}} key={index} onPress={()=>this._selectImage(image)}>
                <Image style={styles.image}  source={{ uri: image.uri }} />
                </TouchableHighlight>
                )}) }
            </View>
        </ScrollView>
      </View>     
    )
  }

}

const styles = StyleSheet.create({
  imageGrid: {
    flex:1,
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent: 'center',
  },
  image:{
    width:100,
    height:100,
    margin:10
  }

})