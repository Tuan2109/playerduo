import React, { Component } from 'react';
import { StyleSheet, View, Image, AsyncStorage, ActivityIndicator, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert, YellowBox, Dimensions } from 'react-native';
import { Container, Header, Content, Title, Body, Card, CardItem, Button, Picker, Form, Icon } from 'native-base';
import io from 'socket.io-client/dist/socket.io.js';

import { getDefine } from '../components/ManageAction/ThTConfig'
import { formatNumberToMoney, englishToVietnamese } from '../components/ManageAction/ExternalHelper'

YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
const widthScreen = Dimensions.get('window').width;

export default class RentScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dev: false,
            data: '',
            loading: true,
            email: '',
            displayName: '',
            phoneNumber: '',
            totalMoney: '',
            timeToRent: 0,
            message: '',
            payment: 0,
            isRent: false
        }
    }

    componentDidMount() {
        this._retrieveData();
    }

    _retrieveData = async () => {
        let data = this.props.navigation.getParam('data', null);
        let loading = false;
        AsyncStorage.multiGet(['Email', 'TotalAddedMoney', 'DisplayName', 'PhoneNumber'], (err, stores) => {
            const email = stores[0][1];
            const totalMoney = stores[1][1];
            const displayName = stores[2][1];
            const phoneNumber = stores[3][1];

            this.setState({ totalMoney, email, displayName, phoneNumber, data, loading });
        });
    }

    _renderFooter = () => {
        if (!this.state.footerCallback)
            return (
                <ActivityIndicator size="large" color="#00ff00" animating={this.state.loading} />
            )
        else
            return (
                <ActivityIndicator size="small" color="#00ff00" animating={!this.state.loading} />
            )
    }

    _renderPickerItem = () => {
        let maxHourCanRent = this.state.data.Player.MaxHourCanRent;
        let arr = [];
        for (let i = 1; i <= maxHourCanRent; i++) {
            arr.push(
                <Picker.Item key={i} label={i + " giờ"} value={i} />
            )
        }
        return arr;
    }

    _renderPicker = () => {
        return (
            <View>
                <Form>
                    <Picker
                        mode="dropdown"
                        iosHeader="Số giờ thuê"
                        headerBackButtonText="trở về"
                        iosIcon={<Icon name="arrow-down" />}
                        placeholder="Chọn số giờ"
                        placeholderStyle={{ color: "#bfc6ea" }}
                        placeholderIconColor="#007aff"
                        style={{}}
                        selectedValue={this.state.timeToRent}
                        onValueChange={(itemValue, itemIndex) => this._paymentTemp(itemValue)}
                    >
                        {
                            this._renderPickerItem()
                        }
                    </Picker>
                </Form>
            </View>
        )
    }

    _paymentTemp = (rentHour) => {
        let payment = rentHour * this.state.data.Player.CostPerHour;
        this.setState({ timeToRent: rentHour, payment })
    }

    _renderHeader = (data) => {
        return (
            <Card style={{ flex: 0.3 }}>
                <CardItem>
                    <View style={styles.shadow}>
                        <Image source={{ uri: data.Player.Image }}
                            style={[{ width: 150, height: 150 }]}></Image>
                    </View>
                    <Body style={{ paddingLeft: 10 }}>
                        <Text style={{ fontSize: 25 }}>{data.DisplayName != "" ? data.DisplayName : data.Email}</Text>
                        <Text note>{data.PhoneNumber != "" ? data.PhoneNumber : null}</Text>
                        <Text note>--Giới tính: {data.Gender != "" ? englishToVietnamese(data.Gender) : "Chưa xác định"}</Text>
                        <Text note>--Game: {data.Player.Game != "" ? englishToVietnamese(data.Player.Game) : "Chưa xác định"}</Text>
                        <Text note>--Rank: {data.Player.RankTitle != "" ? englishToVietnamese(data.Player.RankTitle) : "Chưa xác định"}</Text>
                        <Text note>--Giờ thuê tối đa: {data.Player.MaxHourCanRent} giờ/ngày</Text>
                        <Text note>--Tiền thuê mỗi giờ: {formatNumberToMoney(data.Player.CostPerHour, "vnđ")}/giờ</Text>
                    </Body>
                </CardItem>
            </Card>
        )
    }

    _renderBody = (data) => {
        return (
            <Card>
                <CardItem>
                    <View style={{ flex: 0.3 }}>
                        <Text>Số giờ thuê</Text>
                    </View>
                    <View style={[{ flex: 0.7, backgroundColor: 'white' }, styles.shadow]}>
                        {this._renderPicker()}
                    </View>
                </CardItem>

                <CardItem>
                    <View style={{ flex: 0.3 }}>
                        <Text>Tin nhắn</Text>
                    </View>
                    <TouchableOpacity style={[{ flex: 0.7, height: 219, backgroundColor: 'white', padding: 10 }, styles.shadow]}
                        onPress={() => { this.refs.hiddenInput.focus(); }}>
                        <Text style={{ fontSize: 15 }}>
                            {this.state.message}
                        </Text>
                        <TextInput ref="hiddenInput"
                            onChangeText={message => this.setState({ message })}
                            style={{ height: 0 }}
                        >
                        </TextInput>
                    </TouchableOpacity>
                </CardItem>
            </Card>
        )
    }

    _getRentAPI = () => {
        let protocol = getDefine().PROTOCOL;
        let hostIP = getDefine().HOST_IP;
        let port = getDefine().RENT_PORT;
        let method = getDefine().RENT_API;

        return protocol + hostIP + port + method;
    }

    _isWorthy = () => {
        let costPerHour = this.state.data.Player.CostPerHour;
        let payment = costPerHour * this.state.timeToRent;
        if (payment > 0 && payment <= this.state.totalMoney) {
            return true;
        }
        return false;
    }

    _onPress = async () => {
        if (this.state.dev) {
            let data = {
                'ReceiverEmail': this.state.data['Email'],
                'message': {
                    'Email': this.state.email,
                    'DisplayName': this.state.displayName,
                    'TimeToRent': this.state.timeToRent,
                    'Payment': this.state.payment,
                    'message': this.state.message
                }
            };
            this.socket = io(getDefine().SERVER_IP, { json: false });
            this.socket.emit("send-request", data);
        } else {
            if (this._isWorthy()) {
                let rentAPI = this._getRentAPI();
                try {
                    let token = await AsyncStorage.getItem("Token");
                    let data = {
                        'Customer': this.state.email,
                        'Player': this.state.data['Email'],
                        'TimeToRent': parseInt(this.state.timeToRent),
                        'Status': 'Renting',
                        'CostPerHour': parseInt(this.state.data['Player']['CostPerHour']),
                        'Message': this.state.message
                    };
                    let body = {
                        'data': data
                    }
                    fetch(rentAPI, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(body),
                    }).then(getData => {
                        if (getData.status == 200 || getData.status == 201) {
                            getData.json().then(temp => {
                                let rent = temp.data
                                Alert.alert("Thuê thành công", "Bạn đợi trong ít lát để player xác nhận.");
                                let data = {
                                    'ReceiverEmail': this.state.data['Email'],
                                    'message': {
                                        'updateRentbyID': rentAPI + "/" + rent.RentID,
                                        'PlayerName': this.state.data['Email']['DisplayName'],
                                        'Email': this.state.email,
                                        'DisplayName': this.state.displayName,
                                        'TimeToRent': this.state.timeToRent,
                                        'Payment': this.state.payment,
                                        'message': this.state.message
                                    }
                                };
                                this.socket = io(getDefine().SERVER_IP, { json: false });
                                console.log(data);
                                this.socket.emit("send-request", data);
                                this.setState({ 'isRent': true });
                            })
                        } else {
                            Alert.alert("Thông báo lỗi", "Đã xảy ra lỗi trong quá trình thuê. Xin bạn thử lại sau ít phút");
                            this.props.navigation.popToTop();
                        }
                    })
                } catch (e) {
                    Alert.alert("Thông báo", "Không thể truy cập được IP, làm ơn kiểm tra lại?");
                    console.log(e);
                }
            } else {
                Alert.alert("Thông báo lỗi", "Số tiền của bạn không đủ để thuê người chơi. Xin vui lòng nạp thêm.");
            }
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <View>
                    {this._renderFooter()}
                </View>
            )
        } else {
            let ME = this;
            let data = ME.state.data;
            if (ME.state.isRent) {
                return (
                    <Container>
                        <Image style={{ width: widthScreen, height: 219 }} source={require('../assets/images/logo.gif')}></Image>
                        <CardItem>
                            <Text style={{ justifyContent: 'center', color: 'black', fontSize: 15 }}>Lời mời của bạn đã được gửi tới player {data['DisplayName']}. Bạn xin đợi một chút cho player xử lý.</Text>
                        </CardItem>
                        <CardItem style={{ justifyContent: 'center' }}>
                            <Button style={{ flex: 1, justifyContent: 'center', backgroundColor: getDefine().MAIN_COLOR }} onPress={() => ME.props.navigation.popToTop()}>
                                <Text style={{ color: 'black', fontSize: 15 }}>Trở về trang chủ</Text>
                            </Button>
                        </CardItem>
                    </Container>
                )
            } else {
                return (
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
                        <ScrollView style={{ flex: 0.88 }}>
                            {this._renderHeader(data)}
                            {this._renderBody(data)}
                        </ScrollView>
                        <View style={{ flex: 0.12 }}>
                            <CardItem footer bordered style={styles.card} >
                                <Button style={{ flex: 1, justifyContent: 'center', backgroundColor: getDefine().MAIN_COLOR }}
                                    onPress={() => this._onPress()}>
                                    <Text style={{ color: 'black', fontSize: 18 }}>
                                        Thuê ngay {this.state.payment > 0 ? formatNumberToMoney(this.state.payment, "vnđ") + "/" + this.state.timeToRent + " giờ" : null}
                                    </Text>
                                </Button>
                            </CardItem>
                        </View>
                    </KeyboardAvoidingView>
                )
            }
        }
    }
}

RentScreen.navigationOptions = {
    title: 'Thông tin thuê',
    headerStyle: {
        backgroundColor: getDefine().MAIN_COLOR,
    },
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,

        elevation: 8,
    },
    card: {
        backgroundColor: getDefine().CARD_COLOR,
    },
    cardContainer: {
        marginHorizontal: 10,
    }
});