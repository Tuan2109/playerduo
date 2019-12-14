import React, { Component } from 'react';
import { KeyboardAvoidingView, AsyncStorage, Alert, View } from 'react-native';

import ThTButton from '../ThTButton';
import ThTTextInput from '../ThTTextInput';
import WaitScreen from '../../screens/WaitScreen'
import { getDefine } from './ThTConfig';
import { englishToVietnamese, storeData } from './ExternalHelper'

export default class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            hostIP: '',
            dev: false,
            loading: true,
        }
    }

    async componentWillMount() {
        this._isLogined();
        // let a = {
        //     "DisplayName": "Tuấn Trần Hồ",
        //     "Email": "tranhotuan@gmail.com",
        //     "Gender": "Male",
        //     "Image": "https://image.freepik.com/free-photo/image-human-brain_99433-298.jpg",
        //     "PhoneNumber": "0969865321",
        //     "Player": {
        //         "Achievements": "Giải nhì Open Cup mở rộng 2017",
        //         "AverageRating": "4.2",
        //         "CostPerHour": "37000",
        //         "FullDetail": "Only Dota 2",
        //         "Game": "Dota 2",
        //         "HasBeenHired": "69",
        //         "MaxHourCanRent": "5",
        //         "RankTitle": "Immortal",
        //         "Reviews": "57",
        //         "TotalRevenue": "485000",
        //     },
        //     "TimeRented": "24",
        //     "TotalAddedMoney": "365000"
        // }
        // storeData(a);
    }

    _isLogined = async () => {
        AsyncStorage.getItem("Email", (err, store) => {
            if (store && store != "") return this.props.navigation.navigate('App');
            this.setState({ loading: false })
        })
    }

    _getLinkAPI = () => {
        let hostIP = getDefine().HOST_IP;
        let protocol = getDefine().PROTOCOL;
        let port = getDefine().MAIN_PORT;
        let method = this.props.btnText == "Đăng nhập" ? getDefine().LOGIN_API : getDefine().REGISTER_API;
        return protocol + hostIP + port + method;
    }

    _redirect = async (item) => {
        // this.props.screenProps = item['data']
        if (item.data['PhoneNumber'] == "") return this.props.navigation.navigate('Update', {
            data: item['data'],
            token: item['Token'],
            first: true
        });
        else {
            return this.props.navigation.navigate('App');
        }
    }

    _callAPI = async () => {
        let user = {
            "data": {
                "Email": this.state.username,
                "Password": this.state.password
            }
        }
        try {
            let linkAPI = this._getLinkAPI();
            let getData = await fetch(linkAPI, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            let parseData = await getData.json();
            if (getData['status'] == 200 || getData['status'] == 201) {
                let isRegister = this.props.btnText == "Đăng nhập" ? false : true;
                if (isRegister) {
                    Alert.alert("Chúc mừng bạn", "Bạn đã đăng ký thành công!")
                    return this.props.navigation.navigate('Login');
                } else {
                    let data = this._parseJsonToData(parseData);
                    await storeData(data);
                    return this._redirect(parseData);
                }
            } else {
                Alert.alert("Thông báo lỗi", englishToVietnamese(parseData['data']['message']))
                this.setState({ loading: false })
            }
        } catch (e) {
            alert("Không thể truy cập được IP, làm ơn kiểm tra lại?");
            this.setState({ loading: false })
            console.log(e);
        }
    }

    fnOnPress = async () => {
        if (this.state.dev) {
            let data = {
                "data": {
                    "Email": "abc",
                    "DisplayName": "Customer Name",
                    "Gender": "Male",
                },
                "Token": "dasfosdfasfksfsfksdpfksdopf",
            }
            this._redirect(data);
        } else {
            if (this.state.username != "" && this.state.password != "") {
                this.setState({ loading: true })
                setTimeout(() => this._callAPI(), 3000);
            } else {
                Alert.alert("Thông báo lỗi", "Bạn chưa nhập đủ mail và password");
            }
        }
    }

    _parseJsonToData = (json) => {
        let item = {
            'Token': json['Token'],
            'data': {
                'DisplayName': '',
                'Email': '',
                'Gender': '',
                'Image': '',
                'PhoneNumber': '',
                'Status': '',
                'TimeRented': 0,
                'TotalAddedMoney': 0,
                'Player': {
                    'Achievements': '',
                    'AverageRating': 0,
                    'CostPerHour': 0,
                    'FullDetail': '',
                    'Game': '',
                    'HasBeenHired': '',
                    'RankTitle': '',
                    'Reviews': 0,
                    'TotalRevenue': 0
                }
            }
        }
        let keys = Object.keys(item['data']);
        for (let i in keys) {
            if (keys[i] != 'Player') {
                item['data'][keys[i]] = json['data'][keys[i]] ? json['data'][keys[i]] : item['data'][keys[i]];
            } else {
                let player = item['data']['Player'];
                let playerKeys = Object.keys(player);
                for (let j in playerKeys) {
                    player[playerKeys[j]] = json['data']['Player'][playerKeys[j]] ? json['data']['Player'][playerKeys[j]] : player[playerKeys[i]];
                }
                item['data']['Player'] = player;
            }
        }
        return item;
    }

    updateState = (text, stateName) => {
        this.setState({ [stateName]: text });
    }

    backLoginScreen = () => {
        this.props.navigation.navigate('Login');
    }

    render() {
        if (this.state.loading) {
            return (<WaitScreen></WaitScreen>);
        } else {
            return (
                <KeyboardAvoidingView behavior='padding' style={{ justifyContent: 'center' }}>
                    <ThTTextInput placeholder='Email' keyboardType='email-address' stateName="username" updateState={this.updateState} value={this.state.username}></ThTTextInput>
                    <ThTTextInput placeholder='Password' secureTextEntry stateName="password" updateState={this.updateState} value={this.state.password}></ThTTextInput>
                    <ThTButton text={this.props.btnText} onPress={this.fnOnPress}></ThTButton>
                    {
                        this.props.btnText == "Đăng ký" ? <ThTButton text="Trở về trang đăng nhập" onPress={this.backLoginScreen} backgroundColor="red"></ThTButton> : null
                    }

                </KeyboardAvoidingView>
            )
        }
    }
}