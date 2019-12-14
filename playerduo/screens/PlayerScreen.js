import React, { Component } from 'react';
import { StyleSheet, View, Image, AsyncStorage, ActivityIndicator, Text, ScrollView } from 'react-native';
import { Container, Header, Content, Title, Body, Card, CardItem, Button } from 'native-base';

import { getDefine } from '../components/ManageAction/ThTConfig'
import ThTCardItem from '../components/ThTCardItem';
import ThTButton from '../components/ThTButton';
import { formatNumberToMoney, englishToVietnamese } from '../components/ManageAction/ExternalHelper'

export default class PlayerScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: '',
            loading: true,
            onPress: '',
        }
    }

    componentDidMount() {
        this._retrieveData();
    }

    static defaultProps = {
        username: 'Name of data',
        linkImage: 'https://ih0.redbubble.net/image.801486090.8828/tapestry,1000x-pad,750x1000,f8f8f8.u3.jpg',
    }

    _retrieveData = async () => {
        let defaultValue = false;
        let data = this.props.navigation.getParam('data', defaultValue);
        let loading = false;
        let onPress = this.props.navigation.getParam('onPress', defaultValue)
        this.setState({ data, loading, onPress })
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

    render() {
        if (this.state.loading) {
            return (
                <View>
                    {this._renderFooter()}
                </View>
            )
        } else {
            let data = this.state.data;
            console.log(data);
            return (
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 0.88 }}>
                        <Card style={{ paddingHorizontal: 10 }}>
                            <CardItem>
                                <View style={styles.shadow}>
                                    <Image source={{ uri: data.Player.Image }}
                                        style={[{ width: 150, height: 150 }]}></Image>
                                </View>
                                <Body style={{ paddingLeft: 8 }}>
                                    <Text style={{ fontSize: 25 }}>{data.DisplayName != "" ? data.DisplayName : data.Email}</Text>
                                    <Text note>{data.PhoneNumber != "" ? data.PhoneNumber : null}</Text>
                                    <Text note>--Giới tính: {data.Gender != "" ? englishToVietnamese(data.Gender) : "Chưa xác định"}</Text>
                                    <Text note>--Game: {data.Player.Game != "" ? englishToVietnamese(data.Player.Game) : "Chưa xác định"}</Text>
                                    <Text note>--Rank: {data.Player.RankTitle != "" ? englishToVietnamese(data.Player.RankTitle) : "Chưa xác định"}</Text>
                                    <Text note>--Giờ thuê tối đa: {data.Player.MaxHourCanRent} giờ/ngày</Text>
                                </Body>
                            </CardItem>
                            <ThTCardItem title="Thông tin liên hệ" text={{ Email: data.Email, PhoneNumber: data.PhoneNumber }} cardStyle={styles.card} cardContainerStyle={styles.cardContainer}></ThTCardItem>
                            <ThTCardItem title="Giới thiệu" text={data.Player.FullDetail} cardStyle={styles.card} cardContainerStyle={styles.cardContainer}></ThTCardItem>
                            <ThTCardItem title="Thông tin hoạt động" text={{ TotalRevenue: data.Player.TotalRevenue, Achievements: data.Player.Achievements, AverageRating: data.Player.AverageRating, Reviews: data.Player.Reviews }} cardStyle={styles.card} cardContainerStyle={styles.cardContainer}></ThTCardItem>
                        </Card>
                    </ScrollView>
                    <View style={{ flex: 0.12 }}>
                        <CardItem footer bordered style={styles.card} >
                            <Button style={{ flex: 1, justifyContent: 'center', backgroundColor: getDefine().MAIN_COLOR }}
                                onPress={() => this.state.onPress ? this.state.onPress(data) : null}>
                                <Text style={{ color: 'black', fontSize: 15 }}>Thuê ngay ({formatNumberToMoney(data.Player.CostPerHour, "vnđ")}/giờ) </Text>
                            </Button>
                        </CardItem>
                    </View>
                </View>
            )
        }
    }
}

PlayerScreen.navigationOptions = {
    title: 'Thông tin Player',
    headerStyle: {
        backgroundColor: getDefine().MAIN_COLOR,
    },
};

const styles = StyleSheet.create({
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
    card: {
        backgroundColor: getDefine().CARD_COLOR,
    },
    cardContainer: {
        marginHorizontal: 10,
    }
});