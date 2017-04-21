import React, { Component } from 'react';
import {
  StyleSheet, Dimensions, Image, TouchableHighlight, ScrollView, Text,
  View, Platform, Modal, ActivityIndicator
} from 'react-native';
import { Messages } from './data/data';
import * as UI from './ui';

const PlaceHolderImage = require('./../img/loading.png');
export class ImageLazyLoad extends Component {
  constructor() {
    super();
    this.state = {
      imageSmall: PlaceHolderImage,
      imageUrlLarge: null,
      imageLarge: null,
      modalVisible: false,
      loading: false,
      loadProgress: 0
    }
  }

  componentWillMount() {
    Messages.getAttachments(this.props.sys_id).then(urls => {
      if (urls) {
        const imgUrl = urls.get('mobile.jpg');
        if (imgUrl) Messages.loadAttachmentwithUrl(imgUrl, this.props.sys_id).then(img => {
          this.setState({ imageSmall: { uri: img } });
        })
      }
    })
  }

  _showFullScreen() {
    this.setState({ modalVisible: true });

  }

  _modalClose() {
    this.setState({ modalVisible: false });
  }


  _renderImageFullScreen() {
    const { height, width } = Dimensions.get('window');
    const loadMsg = (this.state.loading) ? <ActivityIndicator style={styles.aLoading} animating={true} size={'large'} /> : null;
    return (
      <View style={{ flex: 1 }}>
        <UI.Header text={'Image Viewer'} onClose={() => this._modalClose()} />
        <ScrollView bounces={true} contentContainerStyle={{ justifyContent: 'center' }} bouncesZoom={true} minimumZoomScale={1.0} centerContent={true} maximumZoomScale={5.0} >
          {loadMsg}
          <Image resizeMode={'contain'} style={{ height, width }} source={this.state.imageSmall} />
        </ScrollView>
      </View>
    )
  }

  render() {
    return (
      <View>
        <Modal animationType={'slide'} visible={this.state.modalVisible} onRequestClose={() => this._modalClose()}>
          {this._renderImageFullScreen()}
        </Modal>
        <View style={styles.container} >
          <TouchableHighlight onPress={() => this._showFullScreen()}>
            <Image style={styles.image} source={this.state.imageSmall} />
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, minWidth: 310, minHeight: 310, flexDirection: 'row', justifyContent: 'center', flexGrow: 1 },
  image: {
    width: 300,
    height: 300,
  },
  aLoading: { marginTop: 20 },
})

