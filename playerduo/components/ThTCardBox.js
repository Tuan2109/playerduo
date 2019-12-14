import React, { Component } from 'react';
import { StyleSheet, View, FlatList, ScrollView, TouchableOpacity } from 'react-native';
// import moment from 'moment';
// import { Card, Button } from 'react-native-elements';
import { Container, Header, Content, Image, Card, CardItem, Text, Body, Thumbnail, Left, Button } from "native-base";

import { formatNumberToMoney, englishToVietnamese } from './ManageAction/ExternalHelper'
import { getDefine } from '../components/ManageAction/ThTConfig'

export default class ThTCardBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dev: true,
        }
    }

    mockData = () => {
        let data = [{
            "DisplayName": "Con Dương Tông",
            "Email": "hell1o@gmail.com",
            "Followers": [],
            "Gender": "Female",
            "HashPassword": null,
            "IsAdmin": false,
            "IsDelete": false,
            "PhoneNumber": "",
            "TimeRented": 0,
            "TotalAddedMoney": 0,
            "Player": {
                "Achievements": "Nothing",
                "AverageRating": 3.8,
                "CostPerHour": "300000000",
                "FullDetail": "NothingA message will be shown here in less than 1 second after it is received. All messages that are received are shown and nothing is blocked",
                "Game": "League Of Legends",
                "HasBeenHired": 35,
                "Image": "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
                "MaxHourCanRent": 5,
                "Microphone": true,
                "Nickname": "nguyenvana",
                "RankTitle": "Platium",
                "Reviews": 24,
                "Status": "Ready",
                "TotalRevenue": 3400000,
                "Webcam": true,
            },
            "Status": "Online",
        }, {
            "DisplayName": "Toon Lonfg",
            "Email": "hello@gmail.com",
            "Followers": [],
            "Gender": "Female",
            "HashPassword": null,
            "IsAdmin": false,
            "IsDelete": false,
            "PhoneNumber": "",
            "TimeRented": 0,
            "TotalAddedMoney": 0,
            "Player": {
                "Achievements": "Nothing",
                "AverageRating": 3.8,
                "CostPerHour": "300000000",
                "FullDetail": "NothingA message will be shown here in less than 1 second after it is received. All messages that are received are shown and nothing is blocked",
                "Game": "League Of Legends",
                "HasBeenHired": 35,
                "Image": "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
                "MaxHourCanRent": 5,
                "Microphone": true,
                "Nickname": "nguyenvana",
                "RankTitle": "Platium",
                "Reviews": 24,
                "Status": "Ready",
                "TotalRevenue": 3400000,
                "Webcam": true,
            },
            "Status": "Online",
        }, {
            "DisplayName": "Tong Lon",
            "Email": "hello2@gmail.com",
            "Followers": [],
            "Gender": "Female",
            "HashPassword": null,
            "IsAdmin": false,
            "IsDelete": false,
            "PhoneNumber": "",
            "TimeRented": 0,
            "TotalAddedMoney": 0,
            "Player": {
                "Achievements": "Nothing",
                "AverageRating": 3.8,
                "CostPerHour": "300000000",
                "FullDetail": "NothingA message will be shown here in less than 1 second after it is received. All messages that are received are shown and nothing is blocked",
                "Game": "League Of Legends",
                "HasBeenHired": 35,
                "Image": "https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg",
                "MaxHourCanRent": 5,
                "Microphone": true,
                "Nickname": "nguyenvana",
                "RankTitle": "Platium",
                "Reviews": 24,
                "Status": "Ready",
                "TotalRevenue": 3400000,
                "Webcam": true,
            },
            "Status": "Online",
        }];
        return data;
    }

    _onPress = (item) => {
        this.props.navigation.push('Rent', {
            data: item
        });
    };

    renderAllPlayers = () => {
        let mockData = this.mockData();
        return mockData.map(x => {
            return this.renderCardPlayer(x);
        })
    }

    headerCard = (item) => {
        return (
            <CardItem header bordered style={styles.card} >
                <Left>
                    <Thumbnail style={{ height: 90, width: 90 }} source={{ uri: item.Image }} />
                    <Body>
                        <Text style={{ fontSize: 30 }}>{item.DisplayName != "" ? item.DisplayName : item.Email}</Text>
                        <Text note>{item.Player.Game != "" ? item.Player.Game + (item.Player.RankTitle ? " - " + item.Player.RankTitle : "") : "Chưa xác định"}</Text>
                        <Text note>{item.Gender != "" ? englishToVietnamese(item.Gender) : "Chưa xác định"}</Text>
                        <Text note>{item.Player.Status != "" ? englishToVietnamese(item.Player.Status) : "Chưa xác định"}</Text>
                    </Body>
                </Left>
            </CardItem>
        );
    }
    bodyCard = (item) => {
        return (
            <CardItem bordered style={styles.card} >
                <Body>
                    <Text>{item.Player.FullDetail}</Text>
                    <Text></Text>
                    <Text>Số giờ có thể thuê: {item.Player.MaxHourCanRent} giờ/ngày</Text>
                </Body>
            </CardItem>
        );
    }
    footerCard = (item) => {
        return (
            <CardItem footer bordered style={styles.card} >
                <Button style={{ flex: 1, justifyContent: 'center', backgroundColor: getDefine().MAIN_COLOR }} onPress={() => this._onPress(item)}>
                    <Text style={{ color: 'black' }}>Thuê ngay ({formatNumberToMoney(item.Player.CostPerHour, "vnđ")}/giờ) </Text>
                </Button>
            </CardItem>
        );
    }

    fnRedirectToPlayer = (item) => {
        this.props.navigation.push("Details", {
            data: item,
            onPress: this._onPress
        });
    }

    renderCardPlayer = (data) => {
        let item = data.item ? data.item : data;
        return (
            <TouchableOpacity key={item.Email} style={{ marginBottom: 10 }} onPress={() => this.fnRedirectToPlayer(item)}>
                <Card>
                    {this.headerCard(item)}
                    {this.bodyCard(item)}
                    {this.footerCard(item)}
                </Card>
            </TouchableOpacity>
        );
    };

    render() {
        // if (this.state.dev) {
        //     return (
        //         <ScrollView style={this.props.containerStyle}>
        //             {this.renderAllPlayers()}
        //         </ScrollView>
        //     )
        // } else {
        return (
            <View style={this.props.containerStyle}>
                <FlatList
                    data={this.props.users}
                    renderItem={this.renderCardPlayer}
                    keyExtractor={item => item.Email}
                    ListFooterComponent={this.props.renderFooter}
                // onEndReached={props.getNews}
                // onEndReachedThreshold={0.5}
                />
            </View>
        )
        // }
    }
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: getDefine().CARD_COLOR
    }
});
