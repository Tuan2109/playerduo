import React, { Component } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { StyleSheet, Image, Text, TouchableOpacity, AsyncStorage, ActivityIndicator, Alert } from 'react-native';
import { Container, Header, Content, Title, Body, Card, CardItem, Button } from 'native-base';
import { getDefine } from '../components/ManageAction/ThTConfig';
import { storeData } from '../components/ManageAction/ExternalHelper';
import WaitScreen from './WaitScreen';

export default class ImageScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dev: false,
            image: null,
            first: false,
            loading: true,
            data: {},
            token: null,
        }
    }

    componentDidMount() {
        let first = this.props.navigation.getParam('first', false);
        let data = this.props.navigation.getParam('data', {});
        let token = this.props.navigation.getParam('token', null);
        let image = data['Image'] && data['Image'] != "" ? data['Image'] : null;
        this.setState({ first, data, image, token, loading: false });
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            return status;
        }
    }

    _pickImage = async () => {
        let status = await this.getPermissionAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        } else {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                base64: false
            });
            if (!result.cancelled) {
                this.setState({ image: result.uri });
            }
        }
    }

    _renderImagePicker = () => {
        return (
            <Card full>
                <CardItem style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={this._pickImage}>
                        {
                            !this.state.image &&
                            <Image source={require('../assets/images/anonymous.png')} style={{ width: 300, height: 300 }}></Image>
                        }
                        {this.state.image &&
                            <Image source={{ uri: this.state.image }} style={{ width: 300, height: 300 }} />}
                    </TouchableOpacity>
                    <Text>Nhấn vào ảnh để chọn ảnh khác</Text>
                </CardItem>
            </Card>
        )
    }

    _renderButton = () => {
        return (
            <CardItem footer bordered style={{}} >
                <Button style={{ flex: 1, justifyContent: 'center', backgroundColor: getDefine().MAIN_COLOR }} onPress={() => this._onPress()}>
                    <Text style={{ color: 'black' }}>Cập nhật</Text>
                </Button>
            </CardItem>
        );
    }

    _uploadImage = async () => {
        let body = new FormData();
        body.append('image', { uri: this.state.image, name: 'photo.png', filename: 'imageName.png', type: 'image/png' });
        body.append('Content-Type', 'image/png');
        body.append('key', 'ffc63ad5d7edc7cc14789c2151f9be25');
        let upload = await fetch('https://api.imgbb.com/1/upload', {
            body: body,
            method: 'POST',
        })
        let parseData = await upload.json();
        return parseData.data.url;
    }

    _onPress = async () => {
        let { dev, image, data, first, token } = this.state;
        if (!dev) {
            if (image && image != data['Image']) {
                this.setState({ loading: true });
                let imageUrl = await this._uploadImage();
                imageUrl = imageUrl.replace(' ', '');
                console.log(imageUrl)
                let temp = {};
                if (first) {
                    temp = data;
                    temp["Image"] = imageUrl;
                } else {
                    temp["Email"] = data["Email"];
                    temp["Image"] = imageUrl;
                }
                let body = {
                    "data": temp
                };
                let linkAPI = this._getLinkAPI();
                console.log("THT", linkAPI, body)
                fetch(linkAPI, {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(body),
                })
                    .then(async res => {
                        if (res.status == 200) {
                            Alert.alert("Thông báo thành công", "Bạn đã cập nhật thành công ảnh đại diện");
                            data["Image"] = imageUrl;
                            if (first) {
                                await storeData(data);
                                await storeData(token);
                                this.props.navigation.navigate('App');
                            } else {
                                let goBackData = this.props.navigation.getParam('goBackData', null);
                                if (goBackData)
                                    goBackData(data);
                                this.props.navigation.pop();
                            }
                        } else {
                            Alert.alert("Thông báo lỗi", "Đã có lỗi trong qua trình cập nhật ảnh mới. Bạn vui lòng chọn lại ảnh mới.");
                            this.setState({ loading: false, image: null });
                        }
                    })
            } else {
                Alert.alert("Thông tin cảnh báo", "Bạn chưa có thay đổi hình.");
            }
        } else {
            let image = "https://image.shutterstock.com/image-photo/beautiful-water-drop-on-dandelion-260nw-789676552.jpg";
            let data = this.state.data;
            data["Image"] = image;
            if (this.state.first) {
                console.log("data image: ", data)
                this.props.navigation.navigate('Details', {
                    data: data,
                    token: "ththtsfsafsdfsdfsa",
                });
            } else {
                let goBackData = this.props.navigation.getParam('goBackData', null);
                if (goBackData)
                    goBackData(data);
                this.props.navigation.pop();
            }
        }
    }

    _getLinkAPI = () => {
        let protocol = getDefine().PROTOCOL;
        let hostIP = getDefine().HOST_IP;
        let port = getDefine().MAIN_PORT;
        let email = this.state.data["Email"];
        let method = getDefine().UPDATE_ACCOUNT_API + email;
        return protocol + hostIP + port + method;
    }

    render() {
        if (this.state.loading) {
            return <WaitScreen></WaitScreen>;
        } else {
            return (
                <Container>
                    {
                        this.state.first == true ?
                            <Header style={{ backgroundColor: getDefine().MAIN_COLOR }}>
                                <Body>
                                    <Title>Cập nhật hình đại diện</Title>
                                </Body>
                            </Header> : null
                    }
                    <Content>
                        <Body>
                            <Image
                                style={styles.logo}
                                source={require('../assets/images/logo.png')}
                            />
                            <Text style={styles.title}>
                                'WE' are the best
                            </Text>
                        </Body>
                        {this._renderImagePicker()}
                        {this._renderButton()}
                    </Content>
                </Container>
            );
        }
    }
}


ImageScreen.navigationOptions = {
    title: 'Cập nhật hình đại diện',
    headerStyle: {
        backgroundColor: getDefine().MAIN_COLOR,
    },
};

const styles = StyleSheet.create({
    logo: {
        width: 120,
        height: 120
    },
    title: {
        marginTop: 10,
        color: '#ff4405',
        fontSize: 20,
        textAlign: 'center',
        opacity: 0.9
    },
    fontStyle: {
        fontSize: 21
    }
})