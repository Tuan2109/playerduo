import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, Alert } from 'react-native';
import { Container, Header, Content, Form, Item, Label, Input, Title, Body, Icon, Picker, CardItem, Button } from 'native-base';
import { getDefine } from '../components/ManageAction/ThTConfig';
import WaitScreen from './WaitScreen';
import { storeData } from '../components/ManageAction/ExternalHelper';

export default class UpdateUserScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dev: false,
            displayName: '',
            loading: true,
            phoneNumber: '',
            gender: null,
            first: false,
            data: {},
            token: null,
        }
    }

    componentDidMount() {
        let first = this.props.navigation.getParam('first', false);
        let data = this.props.navigation.getParam('data', {});
        let token = this.props.navigation.getParam('token', null);
        let displayName = data['DisplayName'] != "Customer Name" ? data['DisplayName'] : "";
        let phoneNumber = data['PhoneNumber'];
        let gender = data['Gender'] ? data['Gender'] : "Other";
        this.setState({ first, data, token, displayName, phoneNumber, gender, loading: false });
    }

    updateState = (text, stateName) => {
        this.setState({ [stateName]: text });
    }

    _renderForm = () => {
        return (
            <Form>
                <Item floatingLabel last success>
                    <Label>Email</Label>
                    <Input value={this.state.data["Email"]} disabled />
                    <Icon name='checkmark' />
                </Item>
                <Item floatingLabel last>
                    <Label>Tên hiển thị</Label>
                    <Input onChangeText={(displayName) => this.setState({ displayName })} value={this.state.displayName} />
                </Item>
                <Item floatingLabel last>
                    <Label>Số điện thoại</Label>
                    <Input maxLength={10} keyboardType="numeric" onChangeText={(phoneNumber) => this.setState({ phoneNumber })} value={this.state.phoneNumber} />
                </Item>
                <Item style={{ paddingTop: 10, height: 70 }}>
                    <Label>Giới tính</Label>
                    <Body>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            selectedValue={this.state.gender}
                            onValueChange={(gender) => this.setState({ gender })}
                        >
                            <Picker.Item label="Nam" value="Male" />
                            <Picker.Item label="Nữ" value="Female" />
                            <Picker.Item label="Khác" value="Other" />
                        </Picker>
                    </Body>
                </Item>
            </Form>
        )
    }

    _getLinkAPI = () => {
        let protocol = getDefine().PROTOCOL;
        let hostIP = getDefine().HOST_IP;
        let port = getDefine().MAIN_PORT;
        let email = this.state.data["Email"];
        email = email.replace(' ', '');
        let method = getDefine().UPDATE_ACCOUNT_API + email;
        return protocol + hostIP + port + method;
    }

    _isValid = () => {
        let { data, displayName, phoneNumber, gender } = this.state;
        if (displayName && displayName != "" ||
            phoneNumber && phoneNumber != "" ||
            gender && gender != ""
        ) {
            if (displayName != data['DisplayName']) return "valid";
            if (phoneNumber != data['PhoneNumber']) return "valid";
            if (gender != data['Gender']) return "valid";
            return "Done";
        }
        return "HasEmpty";
    }

    _onPress = () => {
        if (!this.state.dev) {
            let { data, displayName, phoneNumber, gender, token, first } = this.state;
            let { navigation } = this.props;
            let isValid = this._isValid();
            if (isValid != "HasEmpty") {
                if (isValid == "valid") {
                    this.setState({loading: true})
                    if (first) {
                        data["DisplayName"] = displayName;
                        data["PhoneNumber"] = phoneNumber;
                        data["Gender"] = gender;
                        navigation.navigate("Image", {
                            data: data,
                            token: token,
                            first: first
                        })
                    } else {
                        let temp = {};
                        temp["Email"] = data["Email"];
                        temp["DisplayName"] = displayName;
                        temp["PhoneNumber"] = phoneNumber;
                        temp["Gender"] = gender;
                        let linkAPI = this._getLinkAPI();
                        let body = {
                            "data": temp
                        }
                        console.log("update user", linkAPI, body, token)
                        fetch(linkAPI, {
                            method: 'PUT',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify(body),
                        })
                            .then(res => {
                                if (res.status == 200) {
                                    Alert.alert("Thông báo thành công", "Bạn đã cập nhật thông tin thành công!")
                                    data["DisplayName"] = displayName;
                                    data["PhoneNumber"] = phoneNumber;
                                    data["Gender"] = gender;
                                    storeData(data);
                                    let goBackData = this.props.navigation.getParam('goBackData', null);
                                    if (goBackData)
                                        goBackData(data);
                                } else {
                                    Alert.alert("Thông báo lỗi", "Quá trình cập nhật xảy ra lỗi, xin bạn hãy thử lại sau!");
                                }
                                navigation.pop();
                            })
                    }
                } else
                    Alert.alert("Thông báo nhắc nhở", "Không có gì thay đổi!");

            }
            else
                Alert.alert("Thông báo lỗi", "Bạn chưa điền đủ thông tin!");
        } else {
            let goBackData = this.props.navigation.getParam('goBackData', null);
            let data = this.state.data;
            data["DisplayName"] = this.state.displayName;
            data["PhoneNumber"] = this.state.phoneNumber;
            data["Gender"] = this.state.gender;
            if (this.state.first) {
                this.props.navigation.navigate("Image", {
                    data: data,
                    token: this.state.token,
                    first: this.state.first
                })
            } else {
                if (goBackData)
                    goBackData(data);
                this.props.navigation.pop();
            }
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
UpdateUserScreen.navigationOptions = {
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