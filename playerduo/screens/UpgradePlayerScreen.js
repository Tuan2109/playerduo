import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, Alert } from 'react-native';
import { Container, Header, Content, Form, Item, Label, Input, Title, Body, CardItem, Button } from 'native-base';
import { getDefine } from '../components/ManageAction/ThTConfig';
import WaitScreen from './WaitScreen';
import { storeData } from '../components/ManageAction/ExternalHelper';

export default class UpgradePlayerScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dev: false,
            loading: true,
            data: {},
            token: null,
            rankTitle: null,
            costPerHour: null,
            fullDetail: null,
            achievements: null,
            game: null,
            maxHourCanRent: null,
        }
    }

    componentDidMount() {
        let data = this.props.navigation.getParam('data', {});
        let player = data['Player'];
        let token = this.props.navigation.getParam('token', null);
        if (player['Game'] && player['Game'] != "") {
            let rankTitle = player['RankTitle'];
            let costPerHour = player['CostPerHour'];
            let fullDetail = player['FullDetail'];
            let achievements = player['Achievements'];
            let game = player['Game'];
            let maxHourCanRent = player['MaxHourCanRent'];
            this.setState({ data, token, rankTitle, costPerHour, fullDetail, achievements, game, maxHourCanRent, loading: false });
        } else {
            this.setState({ data, token, loading: false });
        }
    }

    updateState = (text, stateName) => {
        this.setState({ [stateName]: text });
    }

    _renderForm = () => {
        return (
            <Form>
                <Item floatingLabel last>
                    <Label>Những trò chơi</Label>
                    <Input onChangeText={(game) => this.setState({ game })} value={this.state.game}
                        maxLength={29} />
                </Item>
                <Item floatingLabel last>
                    <Label>Trình độ trong trò chơi (game)</Label>
                    <Input onChangeText={(rankTitle) => this.setState({ rankTitle })} value={this.state.rankTitle}
                        maxLength={29} />
                </Item>
                <Item floatingLabel last>
                    <Label>Số tiền một giờ (0~10.000.000đ)</Label>
                    <Input onChangeText={(costPerHour) => this.setState({ costPerHour })} value={this.state.costPerHour}
                        keyboardType="numeric" maxLength={8} />
                </Item>
                <Item floatingLabel last>
                    <Label>Số giờ thuê tối đa trên ngày (0~24 giờ)</Label>
                    <Input onChangeText={(maxHourCanRent) => this.setState({ maxHourCanRent })} value={this.state.maxHourCanRent}
                        keyboardType="numeric" maxLength={2} />
                </Item>
                <Item floatingLabel last>
                    <Label>Tự giới thiệu</Label>
                    <Input onChangeText={(fullDetail) => this.setState({ fullDetail })} value={this.state.fullDetail}
                        maxLength={199} />
                </Item>
                <Item floatingLabel last>
                    <Label>Thành tích</Label>
                    <Input onChangeText={(achievements) => this.setState({ achievements })} value={this.state.achievements}
                        maxLength={99} />
                </Item>
            </Form>
        )
    }

    _isValid = () => {
        let { data, rankTitle, costPerHour, fullDetail, achievements, game, maxHourCanRent } = this.state;
        let player = data['Player'];
        if (rankTitle && rankTitle != "" ||
            costPerHour && costPerHour != "" ||
            fullDetail && fullDetail != "" ||
            achievements && achievements != "" ||
            game && game != "" ||
            maxHourCanRent && maxHourCanRent != ""
        ) {
            if (rankTitle != player['RankTitle']) return "valid";
            if (costPerHour != player['CostPerHour'] && costPerHour > 0 && costPerHour < 10000000) return "valid";
            if (fullDetail != player['FullDetail']) return "valid";
            if (achievements != player['Achievements']) return "valid";
            if (game != player['Game']) return "valid";
            if (maxHourCanRent != player['MaxHourCanRent'] && maxHourCanRent > 0 && maxHourCanRent < 13) return "valid";
            return "Done";
        }
        return "HasEmpty";
    }

    _getLinkAPI = () => {
        let protocol = getDefine().PROTOCOL;
        let hostIP = getDefine().HOST_IP;
        let port = getDefine().MAIN_PORT;
        let email = this.state.data['Email'];
        let method = getDefine().UPDATE_PLAYER_API + email;
        return protocol + hostIP + port + method;
    }

    _onPress = () => {
        if (!this.state.dev) {
            let { data, token, rankTitle, costPerHour, fullDetail, achievements, game, maxHourCanRent } = this.state;
            let { navigation } = this.props;
            if (this._isValid() != "HasEmpty") {
                if (this._isValid() == "valid") {
                    this.setState({ loading: true })
                    setTimeout(() => {
                        data['Player']['RankTitle'] = rankTitle;
                        data['Player']['CostPerHour'] = costPerHour;
                        data['Player']['FullDetail'] = fullDetail;
                        data['Player']['Achievements'] = achievements;
                        data['Player']['Game'] = game;
                        data['Player']['MaxHourCanRent'] = maxHourCanRent;
                        let temp = {
                            'RankTitle': data['Player']['RankTitle'],
                            'CostPerHour': parseFloat(data['Player']['CostPerHour']),
                            'FullDetail': data['Player']['FullDetail'],
                            'Achievements': data['Player']['Achievements'],
                            'Game': data['Player']['Game'],
                            'MaxHourCanRent': parseFloat(data['Player']['MaxHourCanRent'])
                        };
                        let linkAPI = this._getLinkAPI();
                        console.log(linkAPI)
                        let body = {
                            "data": temp
                        }
                        fetch(linkAPI, {
                            method: 'PUT',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify(body),
                        })
                            .then(x => {
                                console.log("status", x);
                                if (x.status == 200 || x.status == 201) {
                                    storeData(temp);
                                    Alert.alert("Thông báo thành công", "Bạn đã cập nhật thông tin thành công!");
                                    let goBackData = navigation.getParam('goBackData', null);
                                    if (goBackData)
                                        goBackData(data);
                                } else {
                                    Alert.alert("Thông báo lỗi", "Quá trình cập nhật xảy ra lỗi, xin bạn hãy thử lại sau ít phút");
                                }
                                navigation.pop();
                            })
                    }, 3000)
                }
                else
                    Alert.alert("Thông báo nhắc nhở", "Không có gì thay đổi!");
            }
            else
                Alert.alert("Thông báo lỗi", "Bạn chưa điền đủ thông tin!");
        } else {
            let goBackData = this.props.navigation.getParam('goBackData', null);
            let data = this.state.data;
            console.log(data);
            if (goBackData) {
                data['Player']['RankTitle'] = this.state.rankTitle;
                data['Player']['CostPerHour'] = this.state.costPerHour;
                data['Player']['FullDetail'] = this.state.fullDetail;
                data['Player']['Achievements'] = this.state.achievements;
                data['Player']['Game'] = this.state.game;
                data['Player']['MaxHourCanRent'] = this.state.maxHourCanRent;
                goBackData(data);
            }
            this.props.navigation.pop();
        }
    }

    _renderButton = () => {
        return (
            <CardItem footer bordered style={{}} >
                <Button style={{ flex: 1, justifyContent: 'center', backgroundColor: getDefine().MAIN_COLOR }} onPress={() => this._onPress()}>
                    <Text style={{ color: 'black', fontSize: 15 }}>Cập nhật</Text>
                </Button>
            </CardItem>
        );
    }

    render() {
        if (this.state.loading) {
            return (<WaitScreen></WaitScreen>)
        } else {
            return (
                <Container>
                    {
                        this.state.first == true ?
                            <Header style={{ backgroundColor: getDefine().MAIN_COLOR }}>
                                <Body>
                                    <Title>Cập nhật thông tin</Title>
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
                        {this._renderForm()}
                        {this._renderButton()}
                    </Content>
                </Container>
            )
        }
    }
}
UpgradePlayerScreen.navigationOptions = {
    title: 'Cập nhật thông tin',
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