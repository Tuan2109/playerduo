import React, { Component } from 'react';
import { AsyncStorage, ActivityIndicator, View, ScrollView, StyleSheet, Text } from 'react-native';
import { Icon, Container, Card, CardItem, Header, Item, Input, Button } from 'native-base';
import io from 'socket.io-client/dist/socket.io.js';

import ThTCardBox from '../components/ThTCardBox';
import { getDefine } from '../components/ManageAction/ThTConfig';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class NewFeedScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiveAllUsers: "",
      users: "",
      loading: true,
      dev: false,
      searchText: "",
    }
  }

  componentDidMount() {
    this.state.dev ? this.devMock() : this.getAllUser();
    console.log(this.props);
  }

  mockData = () => {
    let data = [{
      "DisplayName": "Con Tông",
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

  devMock = () => {
    let mock = this.mockData();
    this.setState({ users: mock, receiveAllUsers: mock, loading: !this.state.loading })
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: 'Danh sách các Player',
      headerTitleStyle: { color: '#000' },
      headerStyle: { backgroundColor: '#0AFAD5' },
    };
  };

  getConfig = async () => {
    let protocol = getDefine().PROTOCOL;
    let hostIP = getDefine().HOST_IP;
    let port = getDefine().MAIN_PORT;
    let method = getDefine().GET_ALL_PLAYER_API;

    let linkAPI = protocol + hostIP + port + method;
    let token = await AsyncStorage.getItem("Token");

    return { linkAPI, token }
  }

  getAllUser = async () => {
    let { linkAPI, token } = await this.getConfig();
    try {
      let getData = await fetch(linkAPI, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Bearer': token
        },
      });
      let parseData = await getData.json();
      let loading = !this.state.loading;
      this.setState({ "users": parseData.data, "receiveAllUsers": parseData.data, loading });
    } catch (e) {
      console.log("Error getAllUser: ", e);
    }
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

  _renderSearch = () => {
    return (
      <Header searchBar rounded>
        <Item>
          <Icon name="ios-search" />
          <Input
            ref="inputSearch"
            value={this.state.searchText}
            placeholder="Nhập tên/mail của player"
            onChangeText={(searchText) => this.setState({ searchText })} />
          {
            this.state.searchText != "" ?
              <Icon name="close" onPress={() => this._resetSearch()} />
              :
              <Icon name="ios-people" />
          }
        </Item>
        <Button transparent onPress={() => this._search()}>
          <Text>Tìm kiếm</Text>
        </Button>
      </Header>
    )
  }

  _search = () => {
    let allUsers = this.state.receiveAllUsers;
    let searchText = this.state.searchText.toUpperCase();
    let users = [];
    allUsers.forEach(x => {
      x.DisplayName.toUpperCase().indexOf(searchText) > -1 || x.Email.toUpperCase().indexOf(searchText) > -1 ? users.push(x) : null;
    })
    this.setState({ users });
  }

  _resetSearch = () => {
    this.setState({ searchText: "", users: this.state.receiveAllUsers })
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <View style={styles.container}>
            {
              this._renderFooter()
            }
          </View>
        </View>
      );
    } else {
      return (
        <Container>
          {this._renderSearch()}
          <ThTCardBox users={this.state.users}
            loading={this.state.loading}
            renderFooter={this._renderFooter}
            containerStyle={{ marginHorizontal: 10 }}
            navigation={this.props.navigation}
          >
          </ThTCardBox>
        </Container>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center'
  }
});
