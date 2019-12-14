import React, { Component } from 'react';
import { View, TouchableOpacity, ActivityIndicator, AsyncStorage, YellowBox, Alert } from 'react-native';
import { Container, Content, CardItem, Left, Thumbnail, Body, Text } from 'native-base';
import io from 'socket.io-client/dist/socket.io.js';

import ThTCardItem from '../components/ThTCardItem';
import { getDefine } from '../components/ManageAction/ThTConfig';
import { englishToVietnamese, formatNumberToMoney, storeData } from '../components/ManageAction/ExternalHelper';

YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
export default class UserScreen extends Component {
    constructor(props) {
        super(props);
        this.socket = io(getDefine().SERVER_IP, { json: false });
        this.socket.on('receive-request', socketData => this._progessReceive(socketData));
        this.socket.on('waiting-response', socketData => this._waitingSocket(socketData));
        this.socket.on('finish-rent', socketData => this._finishRent(socketData));
        this.state = {
            data: null,
            token: this.props.navigation.getParam('token', null),
            loading: true,
        }
    }

    async componentWillMount() {
        await this._retrieveData();
    }

    _finishRent = (data) => {
        if (data['Status'] == "Finish") {
            let g = getDefine();
            let getAPI = g.PROTOCOL + g.HOST_IP + g.MAIN_PORT + g.UPDATE_ACCOUNT_API + this.state.data['Email'];
            let token = this.state.token;
            fetch(getAPI, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            }).then(x => x.json())
                .then(user => {
                    let data = this.state.data;
                    data['TotalAddedMoney'] = user['TotalAddedMoney'];
                    data['Player']['TotalRevenue'] = user['Player']['TotalRevenue'];
                    this.setState({ data });
                    Alert.alert("Hoàn tất thuê", "User " + data['User'] + " đã kết thúc phiên thuê của 2 bạn.\nChúc bạn vui vẻ, và có những trải nghiệm tốt tại Player Duo");
                })
        } else {
            Alert.alert("Thông báo khẩn", "Bạn đã bị user " + data['User'] + " report.\nTài khoản của bạn sẽ không thể thuê/ được thuê cho đến khi Admin giải quyết xong.\nMong bạn bình tĩnh chờ đợi, xin cảm ơn")
        }
    }
    _waitingSocket = (jsonData) => {
        let self = this;
        let playerName = jsonData['playerName'];
        let message = jsonData['message'];
        Alert.alert('Trả lời mời thuê từ player ' + playerName, message + "\nHãy nhấp vào lịch sử rent để quản lý phiên Rent của bạn");
        this.props.navigation.push('History', {
            goBackData: self.goBackData,
            data: self.state.data,
            token: self.state.token
        });
    }
    _responseSocket = (isAccept, user) => {
        let data = {
            'email-receive': this.state.data['Email'],
            'email-response': user['Email'],
            'playerName': this.state.data['DisplayName']
        };
        let statusRent = "";
        if (isAccept) {
            statusRent = "Playing";
            data['message'] = 'Đồng ý, đợi mình tí mình sẽ liên hệ bạn';
        }
        else {
            statusRent = "Cancel";
            data['message'] = 'Xin lỗi, hiện tại mình không thể chơi cùng bạn. Hẹn bạn lần sau';
        }
        let updateRentByID = user['updateRentbyID'];
        let body = {
            'data': {
                'Status': statusRent
            }
        };
        fetch(updateRentByID, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.state.token
            },
            body: JSON.stringify(body),
        })
        this.socket.emit('response-receive', data);
    }
    _progessReceive = (user) => {
        if (user['isLogOut']) {
            Alert.alert('Thông báo lỗi', user['isLogOut']);
        } else {
            Alert.alert(
                'Có người thuê bạn',
                '---Thông tin người thuê---\nTên người thuê: ' + user['DisplayName']
                + '\nSố điện thoại: ' + user['PhoneNumber']
                + '\nMail: ' + user['Email']
                + '\nThời gian thuê: ' + user['TimeToRent'] + " giờ"
                + '\nTổng số tiền: ' + formatNumberToMoney(user['Payment'], 'đ')
                + '\nTin nhắn: ' + user['message'],
                [
                    { text: 'Hủy', onPress: () => this._responseSocket(false, user), style: 'cancel' },
                    { text: 'Đồng ý', onPress: () => this._responseSocket(true, user) }
                ],
                { cancelable: false }
            );
        }
    }

    _retrieveData = async () => {
        try {
            let keys = ['Email', 'DisplayName', 'PhoneNumber', 'Gender', 'TotalAddedMoney', 'TimeRented', 'Image', 'RankTitle', 'CostPerHour', 'FullDetail', 'Achievements', 'Game', 'MaxHourCanRent', 'HasBeenHired', 'Reviews', 'AverageRating', 'TotalRevenue', 'Token'];
            AsyncStorage.multiGet(keys, (err, stores) => {
                let data = {}, player = {}, token = '';
                for (let i in stores) {
                    if (i < 7)
                        data[keys[i]] = stores[i][1];
                    else if (i > 6 && i < 17)
                        player[keys[i]] = stores[i][1];
                    else if (i == 17)
                        token = stores[i][1];
                }
                data['Player'] = player;
                this.socket.emit("connected", data['Email']);
                this._activeRent(data, token);
                this.setState({ data, token, loading: false });
            });
        } catch (error) {
            console.log('loi ham _retrieveData: ', error);
        }
    }

    goBackData = (data) => {
        this.setState({ data });
    }

    _onPress = (screenName) => {
        let self = this;
        self.props.navigation.navigate(screenName, {
            goBackData: self.goBackData,
            data: self.state.data,
            token: self.state.token
        })
    }

    _logOut = () => {
        Alert.alert(
            'Thông báo xác nhận',
            'Bạn có chắc là muốn đăng xuất?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK', onPress: () => {
                        let keys = ['Email', 'DisplayName', 'PhoneNumber', 'Gender', 'TotalAddedMoney', 'TimeRented', 'Image', 'RankTitle', 'CostPerHour', 'FullDetail', 'Achievements', 'Game', 'MaxHourCanRent', 'HasBeenHired', 'Reviews', 'AverageRating', 'TotalRevenue', 'Token'];
                        this.socket.emit("manual-disconnection", this.state.data['Email']);
                        AsyncStorage.multiRemove(keys, (err) => {
                            this.props.navigation.navigate('Login');
                        });
                    }
                },
            ],
            { cancelable: false },
        );
    }

    _activeRent = (data, token) => {
        let linkAPI = getDefine().PROTOCOL + getDefine().HOST_IP + getDefine().MAIN_PORT + "/player/" + data['Email'];
        console.log(linkAPI);
        let body = {
            "data": {
                "Status": "Ready"
            }
        }
        console.log(body);
        fetch(linkAPI, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body),
        })
    }

    render() {
        if (this.state.loading) {
            return (
                <ActivityIndicator size="large" color={getDefine().MAIN_COLOR} animating={this.state.loading} />
            )
        } else {
            let { data } = this.state;
            return (
                <Container>
                    <CardItem header bordered style={{}} >
                        <Left>
                            <Thumbnail style={{ height: 150, width: 150 }} source={{ uri: data['Image'] }} />
                            <Body>
                                <Text style={{ fontSize: 30 }}>{data['DisplayName']}</Text>
                                <Text note>--Giới tính: {englishToVietnamese(data['Gender'])}</Text>
                                <Text note>--{englishToVietnamese("TotalAddedMoney") + ": " + formatNumberToMoney(data['TotalAddedMoney'], 'đ')}</Text>
                                <Text note>--Số điện thoại: {data['PhoneNumber']}</Text>
                            </Body>
                        </Left>
                    </CardItem>
                    <Content style={{ paddingHorizontal: 10 }}>
                        <View>
                            {/* {
                                data['Player']['Game'] != "" && data['Player']['Game'] ?
                                    <TouchableOpacity onPress={() => this._activeRent()}>
                                        <ThTCardItem iconName="logo-game-controller-b" text="Sẵn sàng cho thuê" cardStyle={{ backgroundColor: '#06c988' }}></ThTCardItem>
                                    </TouchableOpacity> : null
                            } */}
                            <TouchableOpacity onPress={() => this._onPress("Upgrade")}>
                                <ThTCardItem iconName="logo-ionitron" text={data && data['Player']['Game'] == "" ? "Trở thành Player" : "Sửa thông tin Player"}></ThTCardItem>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._onPress("Update")}>
                                <ThTCardItem iconName="settings" text="Cập nhật thông tin"></ThTCardItem>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._onPress("UpdateImage")}>
                                <ThTCardItem iconName="image" text="Đổi ảnh đại diện"></ThTCardItem>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._onPress("History")}>
                                <ThTCardItem iconName="stats" text="Lịch sử thuê"></ThTCardItem>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this._logOut()}>
                                <ThTCardItem iconName="power" text="Đăng xuất" cardStyle={{ backgroundColor: 'red' }}></ThTCardItem>
                            </TouchableOpacity>
                        </View>
                    </Content>
                </Container>
            )
        }
    }
}

UserScreen.navigationOptions = {
    title: 'Thông tin bản thân',
    headerStyle: {
        backgroundColor: getDefine().MAIN_COLOR,
    },
};