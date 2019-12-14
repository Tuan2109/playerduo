import React, { Component } from 'react';
import { YellowBox, StyleSheet, View, FlatList, Alert } from 'react-native';
import { Container, Content, Title, Text, Card } from 'native-base';
import io from 'socket.io-client/dist/socket.io.js';

import { getDefine } from '../components/ManageAction/ThTConfig';
import { formatNumberToMoney } from '../components/ManageAction/ExternalHelper';
import WaitScreen from './WaitScreen';
import { TouchableOpacity } from 'react-native-gesture-handler';

YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
export default class HistoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: this.props.navigation.getParam('data', {}),
            token: this.props.navigation.getParam('token', null),
            isChange: false,
            listRent: null,
            listRented: null
        }
    }

    async componentDidMount() {
        // this._sendIdToSocket();
        this._loadData();
    }

    _getRentAPI = () => {
        let protocol = getDefine().PROTOCOL;
        let hostIP = getDefine().HOST_IP;
        let port = getDefine().RENT_PORT;
        let method = getDefine().RENT_API;

        return protocol + hostIP + port + method;
    }
    _loadData = async () => {
        let token = this.state.token;
        let rentAPI = this._getRentAPI() + "/customer/" + this.state.data['Email'];
        let rentedAPI = this._getRentAPI() + "/player/" + this.state.data['Email'];
        let listRent = null, listRented = null;
        let temp = await fetch(rentAPI, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        });
        listRent = await temp.json();
        let temp2 = await fetch(rentedAPI, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        });
        listRented = await temp2.json();
        console.log(listRent, listRented)
        this.setState({ 'listRent': listRent.data, 'listRented': listRented.data, loading: false });
    }

    _sendIdToSocket = () => {
        let data = this.state.data;
        this.socket.emit("connected", data['Email']);
    }

    _deactiveReady = () => {
        // this.socket.emit("disconnect", this.state.data['Email']);
        this.socket.emit("manual-disconnection", this.state.data['Email']);
        this.socket.close();
        this.props.navigation.navigate('App');
    }

    _progress = (isAccept) => {
        let { socketData } = this.state;
        let message = {
            'responseEmail': socketData['Email'],
            'isAccept': isAccept,
            'message': ''
        }
        if (isAccept) {
            message['message'] = 'Nào chúng ta cùng chơi';
            this.setState({ mode: 'playing' });
        } else {
            message['message'] = 'Xin lỗi bạn, hiện tại mình không thể chơi cùng bạn';
            this.socket.emit("respone-invite", message);
            this.setState({ loading: true })
        }
    }

    renderItem = (item) => {
        let color = 'black';
        switch (item['Status']) {
            case 'Renting': color = 'grey'; break;
            case 'Playing': color = 'green'; break;
            case 'Cancel': color = 'yellow'; break;
            case 'Waiting': color = 'pink'; break;
            case 'Report': color = 'red'; break;
        }
        return (
            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>Player:</Text>
                    <Text>{item['Player']}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>Thời gian thuê:</Text>
                    <Text>{item['TimeToRent']}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>Số tiền thuê:</Text>
                    <Text>{formatNumberToMoney(item['CostPerHour'], 'đ')}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>Ngày thuê</Text>
                    <Text>{item['CreateAt']}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text>Trạng thái:</Text>
                    <Text style={{ color: color }}>{item['Status']}</Text>
                </View>
            </View>
        )
    }

    _responseSocket = (isDone, item, rating) => {
        console.log(item);
        let rentIDAPI = this._getRentAPI() + "/" + item['RentID'];
        item['Status'] = isDone ? "Finish" : "Report";
        let body = {
            "data": item
        };
        console.log(body)
        let token = this.state.token;
        fetch(rentIDAPI, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(body)
        }).then(x => {
            console.log(x)
            if (x.status == 200 || x.status == 201) {
                alert('Bạn đã cập nhật thành công');
                let temp = {
                    'User': item['Customer'],
                    'Player': item['Player'],
                    'Status': isDone ? "Finish" : "Report"
                }
                this.socket = io(getDefine().SERVER_IP, { json: false });
                this.socket.emit('finish-rent', temp);
                this.socket.close();
            }
            else alert('Có lỗi trong quá trình cập nhật, bạn hãy thử lại sau ít phút');
            this.props.navigation.popToTop();
        })
        let dataRating = {
            'data': {
                'Customer': item['Customer'],
                'Player': item['Player'],
                'Comment': 'Hay lắm bạn à',
                'Stars': rating,
                'TimeRented': item['TimeToRent']
            }
        }
        let ratingAPI = getDefine().PROTOCOL + getDefine().HOST_IP + getDefine().RATING_PORT + "/rating"
        fetch(ratingAPI, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(dataRating)
        })
    }

    rating = (item, payment) => {
        Alert.alert('Xác nhận kết thúc',
            '---Thông tin thuê---\nTên player: ' + item['Player']
            + '\nThời gian thuê: ' + item['TimeToRent'] + " giờ"
            + '\nTổng số tiền: ' + formatNumberToMoney(payment, 'đ'),
            [
                { text: '1 sao', onPress: () => this._responseSocket(true, item, 1) },
                { text: '2 sao', onPress: () => this._responseSocket(true, item, 2) },
                { text: '3 sao', onPress: () => this._responseSocket(true, item, 3) },
                { text: '4 sao', onPress: () => this._responseSocket(true, item, 4) },
                { text: '5 sao', onPress: () => this._responseSocket(true, item, 5) }
            ],
            { cancelable: false }
        );
    }
    onPress = (item) => {
        let payment = item['TimeToRent'] * item['CostPerHour'];
        Alert.alert('Xác nhận kết thúc',
            '---Thông tin thuê---\nTên player: ' + item['Player']
            + '\nThời gian thuê: ' + item['TimeToRent'] + " giờ"
            + '\nTổng số tiền: ' + formatNumberToMoney(payment, 'đ'),
            [
                { text: 'Chưa xong', style: 'cancel' },
                { text: 'Report', onPress: () => this._responseSocket(false, item) },
                { text: 'Đồng ý', onPress: () => this.rating(item, payment, 1) }
            ],
            { cancelable: false }
        );
    }

    renderRentCard = (data, type) => {
        let item = data['item'];
        if (item) {
            if (item['Status'] == "Playing" && type == "rent")
                return (
                    <Card>
                        <TouchableOpacity style={[styles.shadow, { borderWidth: 2, borderColor: 'blue' }]}
                            onPress={() => this.onPress(item)}>
                            {this.renderItem(item)}
                        </TouchableOpacity>
                    </Card>
                )
            else
                return (
                    <Card style={{ flexDirection: 'column', borderWidth: 2, borderColor: 'green' }}>
                        {this.renderItem(item)}
                    </Card>
                )
        } else {
            return (
                <Card style={{ flexDirection: 'column', borderWidth: 2, borderColor: 'green' }}>
                    <Text>Chưa có lịch sử</Text>
                </Card>
            )
        }
    }

    render() {
        let ME = this;
        if (this.state.loading) {
            return (<WaitScreen></WaitScreen>);
        } else {
            return (
                <Container style={{}}>
                    <Title>Lịch sử thuê</Title>
                    <Content style={styles.rentCard}>
                        <FlatList
                            data={this.state.listRent}
                            renderItem={(item) => this.renderRentCard(item, 'rent')}
                            keyExtractor={item => item['RentID']}
                        />
                    </Content>
                    <Title>Lịch sử được thuê</Title>
                    <Content style={styles.rentCard}>
                        <FlatList
                            data={this.state.listRented}
                            renderItem={(item) => this.renderRentCard(item, 'rented')}
                            keyExtractor={item => item.RentID}
                        />
                    </Content>
                </Container>
            )
        }
    }
}

HistoryScreen.navigationOptions = {
    title: 'Lịch sử thuê',
    headerStyle: {
        backgroundColor: getDefine().MAIN_COLOR,
    },
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: getDefine().CARD_COLOR,
    },
    cardContainer: {
        marginHorizontal: 10,
    },
    rentCard: {
        flex: 0.5,
        paddingHorizontal: 10,
        borderColor: 'black',
        borderWidth: 2
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,

        elevation: 13,
    },
});